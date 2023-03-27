<?php

declare(strict_types=1);

namespace App\Controller;

use App\Controller\AbsCon;
use App\Entity\Game;
use App\Entity\State;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class PageController extends AbsCon
{
    private int $mapWidth = 300;
    private int $mapHeight = 300;

    #[Route('/', name: 'home', methods: array('GET'))]
    public function hello(): Response
    {
        return $this->render('hello.html.twig', array());
    }

    #[Route('/game/{name}/new', name: 'createNewGame', methods: array('GET'))]
    public function createNewGame(string $name): RedirectResponse
    {
        try {
            $con = pg_connect($this->getConnectionString());
            $game = new Game($name, $this->mapHeight, $this->mapWidth, $con);
            $game->initState();
            $game->initMap();
        } catch (\Exception $e) {
            echo $e->getMessage();
        } finally {
            pg_close($con);
        }
        return $this->redirectToRoute('game', array('name' => $name));
    }

    #[Route('/game/{name}', name: 'game', methods: array('GET'))]
    public function game(string $name): Response|RedirectResponse
    {
        $con = pg_connect($this->getConnectionString()) or exit("Could not connect to server\n");

        $query = "SELECT * FROM games WHERE name = '{$name}';";
        $results = pg_query($con, $query) or exit('Query failed: ' . pg_last_error());
        $doesPlayerExist = count(pg_fetch_all($results)) > 0 ? true : false;

        if ($doesPlayerExist) {
            // grab the info from the last results we took and "log" the user in.
            $postgresStateArray = json_decode(pg_fetch_all($results)[0]['state'], true);
            $gameState = array(
                'name' => $postgresStateArray['name'],
                'health' => $postgresStateArray['health'],
                'location' => $postgresStateArray['location'],
                'screen' => $postgresStateArray['screen'],
            );
            $state = new State($gameState);
            $stateJSON = $state->jsonSerialize();
            $returnValue = $this->render('game.html.twig', array('state' => $stateJSON));
        } else {
            // create a new game instance in Postgres.
            $returnValue = $this->redirectToRoute('createNewGame', array('name' => $name));
        }

        pg_close($con);

        return $returnValue;
    }





    #[Route('/game/api/{name}', name: 'getNewScreen', methods: array('POST'))]
    public function getNewScreen(string $name, Request $request): Response
    {
        $con = pg_connect($this->getConnectionString()) or exit("Could not connect to server\n");

        $incoming_screen = intval(json_decode($request->getContent())->{'screen'});
        /*
        array of screens we will cache in the front end to reduce loading times
        TODO: Instead of sending all nine screens, we should only send the
        THREE unique screens which are new.

        i.e., the request should also be outfitted with a DIRECTION in order
        to ascetain which of the tiles will actually be NEW tiles. If the player
        goes to the right, they will only need the NE, E, and SE tiles, because they
        will already have the center tile, the N tile and the S tile, as well as all tiles
        to the west.
        If done correctly, this would cut down the amount of data being sent by 2/3.
        */
        $desiredScreens = array(
            $incoming_screen - 11 >= 0 ? $incoming_screen - 11 : null,  // nw
            $incoming_screen - 10 >= 0 ? $incoming_screen - 10 : null,  // n
            $incoming_screen - 9 >= 0 ? $incoming_screen - 9 : null,  // ne

            $incoming_screen - 1 >= 0 ? $incoming_screen - 1 : null, // w
            $incoming_screen, // center
            $incoming_screen + 1 < $this->mapWidth ? $incoming_screen + 1 : null, // e

            $incoming_screen + 9 < $this->mapWidth ? $incoming_screen + 9 : null, // sw
            $incoming_screen + 10 < $this->mapWidth ? $incoming_screen + 10 : null, // s
            $incoming_screen + 11 < $this->mapWidth ? $incoming_screen + 11 : null, // se
        );

        $resultsArray = array();
        pg_prepare($con, 'fetchScreens', "SELECT screen FROM $name WHERE id = $1;");
        for ($i = 0; $i < count($desiredScreens); ++$i) {
            pg_send_execute($con, 'fetchScreens', array($desiredScreens[$i])) or exit('Query failed: ' . pg_last_error());
            array_push($resultsArray, array('id' => $desiredScreens[$i], 'screen' => pg_get_result($con)));
        }
        $returnArray = array();
        for ($i = 0; $i < count($resultsArray); ++$i) {
            array_push($returnArray, array('id' => $resultsArray[$i]['id'], 'screen' => pg_fetch_all($resultsArray[$i]['screen'])));
        }

        pg_close($con);

        return new JsonResponse($returnArray);
    }

    #[Route('/game/save/{name}', name: 'saveGame', methods: array('POST'))]
    public function saveGame(string $name, Request $request): Response
    {
        $con = pg_connect($this->getConnectionString()) or exit("Could not connect to server\n");

        $incoming_state = json_decode($request->getContent())->{'state'};
        // there's likely a nicer way to do this without so many concats,
        // but this is the only syntax I could make work properly...
        // the reason is because JSON formatted postgres columns expect the JSON
        // to come wrapped in single quotes, which PHP takes issue with. hense the
        // weird single quote concats.
        $query = 'UPDATE games SET state = ' . "'" . json_encode($incoming_state) . "'WHERE name = '$name' RETURNING *;";
        pg_prepare($con, 'getScreen', $query);
        pg_send_execute($con, 'getScreen', array());
        $results = pg_get_result($con);

        pg_close($con);

        return new Response(false === !$results);
    }
}
