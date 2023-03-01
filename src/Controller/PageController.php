<?php

namespace App\Controller;

use App\Entity\DatabaseConnectionCredentials;
use App\Entity\State;
use App\NoiseGenerator\NoiseGenerator;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

/**
 * @todo saving mechanic where the state is sent to postgres.
 * 
 * OF GREAT IMPORTANCE —
 * Because the map is large, let's leverage the fact that we're already cutting it
 * up into squares. instead of querying the entire fucking map everytime the player walks
 * across a river, let's create a postgres table with 100 columns, each one labelled 
 * 
 * Currently, all the things used in the front are working here. The function which 
 * attempts to put 100 rows of screens into the "$name" table seems to not work 
 * AT ALL. figure this out. The map as a whole is just too large and we need to split
 * it up into smaller pieces because a 14-20 second loading time is horrific.
 */
class PageController extends AbstractController
{

    private function init_env(): DatabaseConnectionCredentials
    {
        return new DatabaseConnectionCredentials(
            $this->getParameter('app.dbhost'),
            $this->getParameter('app.dbuser'),
            $this->getParameter('app.dbpass'),
            $this->getParameter('app.dbname'),
        );
    }


    #[Route('/', name: 'home', methods: ['GET'])]
    public function hello(): Response
    {
        return $this->render('hello.html.twig', []);
    }

    #[Route('/game/{name}/new', name: 'createNewGame', methods: ['GET'])]
    public function createNewGame(string $name): RedirectResponse
    {

        $con_login = $this->init_env();

        $con = pg_connect("host={$con_login->host()} dbname={$con_login->name()} user={$con_login->user()} password={$con_login->pass()}")
            or die("Could not connect to server\n");

        $seedArray = [];

        foreach (preg_split('//', $name, -1, PREG_SPLIT_NO_EMPTY) as $key => $val) {
            array_push($seedArray, ord($val));
        }

        $seed = intval(implode($seedArray), 10);

        print_r("seed = " . $seed);

        $noiseGenerator = new NoiseGenerator($seed);

        $mapWidth = 300;
        $mapHeight = 300;

        $noiseArray = array_fill(0, $mapHeight, array_fill(0, $mapWidth, ["location" => ["y" => 0, "x" => 0], "noiseValue" => 0]));

        for ($i = 0; $i < $mapHeight; $i++) {
            for ($j = 0; $j < $mapWidth; $j++) {
                $noiseArray[$i][$j]["noiseValue"] += $noiseGenerator->random2D($i / $mapWidth * ($mapWidth >> 4), $j / $mapHeight * ($mapHeight >> 4));
                $noiseArray[$i][$j]["location"]["y"] = $i;
                $noiseArray[$i][$j]["location"]["x"] = $j;
            }
        }

        $gameState = [
            "name" => $name,
            "health" => 100,
            "location" => [15, 15],
            "screen" => 0
        ];

        $numberOfScreens = 10;
        /**
         * this splits a large array into $numberOfScreens sections.
         * we can then hold this info in postgres and, instead of calculating these in real time,
         * we can just have the player hold the 9 screens around them and request screens as they approach them,
         * kind of like how fog of war works in older games.
         */
        $screensArray = [];
        for ($yCoordMiddle = ($mapHeight / $numberOfScreens) / 2; $yCoordMiddle <= $mapHeight * 0.99; $yCoordMiddle += $mapHeight / $numberOfScreens) {
            for ($xCoordMiddle = ($mapWidth / $numberOfScreens) / 2; $xCoordMiddle <= $mapWidth * 0.99; $xCoordMiddle += $mapWidth / $numberOfScreens) {
                $screen = [];
                for ($i = $yCoordMiddle - (($mapHeight / $numberOfScreens) / 2); $i < ($yCoordMiddle + ($mapHeight / $numberOfScreens) / 2); $i++) {
                    $screenRow = [];
                    for ($j = $xCoordMiddle - (($mapWidth / $numberOfScreens) / 2); $j < ($xCoordMiddle + ($mapWidth / $numberOfScreens) / 2); $j++) {
                        array_push($screenRow, $noiseArray[$i][$j]);
                    }
                    array_push($screen, $screenRow);
                }
                array_push($screensArray, $screen);
            }
        }

        $gameMaps = [
            "screensArray" => $screensArray
        ];

        $state = new State($gameState);

        $stateJSON = $state->jsonSerialize();

        pg_prepare($con, "createNewGameInstance", "INSERT INTO games (name, state, map) VALUES ($1, $2, $3);");
        pg_send_execute($con, "createNewGameInstance", [$name, json_encode($stateJSON), json_encode($gameMaps["screensArray"])])
            or die('Query failed: ' . pg_last_error());
        pg_get_result($con);

        pg_prepare($con, "fillTable", "INSERT INTO $name (id, screen) VALUES $1, $2;");
        for ($i = 0; $i < count($screensArray) - 1; $i++) {
            pg_send_execute($con, "fillTable", [$i, json_encode($screensArray[$i])]) or die('Query failed: ' . pg_last_error());
        }

        pg_close($con);
        unset($con);
        unset($con_login);
        return $this->redirectToRoute('game', ["name" => $name]);
    }

    /**
     * this function is becoming obscenely unruly. 
     * Split this up into smaller functions and classes.
     */
    #[Route('/game/{name}', name: 'game', methods: ['GET'])]
    public function game(string $name): Response|RedirectResponse
    {
        $con_login = $this->init_env();

        $con = pg_connect("host={$con_login->host()} dbname={$con_login->name()} user={$con_login->user()} password={$con_login->pass()}")
            or die("Could not connect to server\n");

        $query = "SELECT * FROM games WHERE name = '{$name}';";
        $results = pg_query($con, $query) or die('Query failed: ' . pg_last_error());
        $playerExists = count(pg_fetch_all($results)) > 0 ? true : false;


        if ($playerExists) {
            $postgresStateArray = json_decode(pg_fetch_all($results)[0]["state"], true);
            $postgresMapArray = json_decode(pg_fetch_all($results)[0]["map"], true);
            $gameState = [
                "name" => $postgresStateArray["name"],
                "health" => $postgresStateArray["health"],
                "location" => $postgresStateArray["location"],
                "screen" => $postgresStateArray["screen"],
            ];

            $gameMaps = [
                "screensArray" => $postgresMapArray,
            ];

            $state = new State($gameState);

            $stateJSON = $state->jsonSerialize();

            pg_close($con);
            unset($con);
            unset($con_login);
            return $this->render('game.html.twig', ["state" => $stateJSON, "map" => $gameMaps["screensArray"]]);

        } else {
            pg_close($con);
            unset($con);
            unset($con_login);
            return $this->redirectToRoute('createNewGame', ["name" => $name]);
        }
    }

    #[Route('/game/api/{name}', name: 'getNewScreen', methods: ['POST'])]
    public function getNewScreen(string $name, Request $request): Response
    {
        $incoming_screen = json_decode($request->getContent())->{'screen'};

        $con_login = $this->init_env();

        $con = pg_connect("host={$con_login->host()} dbname={$con_login->name()} user={$con_login->user()} password={$con_login->pass()}")
            or die("Could not connect to server\n");

        $query = "SELECT * FROM games WHERE name = '{$name}';";
        $results = pg_query($con, $query) or die('Query failed: ' . pg_last_error());

        $postgresResults = pg_fetch_all($results)[0];
        $decodedPostgresMap = json_decode($postgresResults["map"])[$incoming_screen];
        pg_close($con);
        unset($con);
        unset($con_login);

        return new Response(json_encode($decodedPostgresMap));
    }
}