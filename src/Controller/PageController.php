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
 * 
 * 
 * Idea is that you send the state to the player when they load the game
 * So you search the DB for the username, if it doesn't come up just init a 
 * blank JSON template. If it DOES come up, just send the state to the player.
 * Then, the game will periodically save itself and or the player will manually save.
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
    public function getFirstScreen(string $name, Request $request): Response
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