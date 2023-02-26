<?php

namespace App\Controller;

use App\Entity\DatabaseConnectionCredentials;
use App\Entity\State;
use App\NoiseGenerator\NoiseGenerator;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

/**
 * POSTGRES is set up in such a way that it accepts 
 * a username so you can search the user and receive 
 * a whole JSON file. I thought this would be
 * easier for storing state and scaling, if the 
 * game becomes large (this is inspired by RPGmaker
 * and its save file system).
 * 
 * Maybe the map should be held in a different column? ... 
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

    #[Route('/game/{name}', name: 'game', methods: ['GET'])]
    public function game(string $name): Response
    {
        $con_login = $this->init_env();

        $con = pg_connect("host={$con_login->host()} dbname={$con_login->name()} user={$con_login->user()} password={$con_login->pass()}")
            or die("Could not connect to server\n");

        $query = "SELECT * FROM games WHERE name = '{$name}';";
        $results = pg_query($con, $query) or die('Query failed: ' . pg_last_error());
        $playerExists = count(pg_fetch_all($results)) > 0 ? true : false;

        $gameWindowWidth = 30;

        if ($playerExists) {
            print_r("welcome back");
            $postgresArray = json_decode(pg_fetch_all($results)[0]["state"], true);
            $gameState = [
                "name" => $postgresArray["name"],
                "health" => $postgresArray["health"],
                "location" => $postgresArray["location"],
                "map" => $postgresArray["map"]
            ];
        } else {
            print_r("welcome new player");
            $seedArray = [];

            foreach (preg_split('//', $name, -1, PREG_SPLIT_NO_EMPTY) as $key => $val) {
                array_push($seedArray, ord($val));
            }

            $seed = intval(implode($seedArray), 10);

            print_r("seed = " . $seed);

            $noiseGenerator = new NoiseGenerator($seed);

            $mapWidth = 200;
            $mapHeight = 200;

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
                "location" => [(int) floor($mapWidth / 2), (int) floor($mapHeight / 2)],
                "map" => $noiseArray
            ];

            $state = new State($gameState);

            $stateJSON = $state->jsonSerialize();

            pg_prepare($con, "createNewGameInstance", "INSERT INTO games (name, state) VALUES ($1, $2);");
            pg_send_execute($con, "createNewGameInstance", [$name, json_encode($stateJSON)])
                or die('Query failed: ' . pg_last_error());
        }

        $clientMap = [];
        for ($row = $gameState["location"][0] - (int) floor($gameWindowWidth / 2); $row < $gameState["location"][0] + (int) floor($gameWindowWidth / 2); $row++) {
            if ($row < 0) {
                /**
                 * @psalm-suppress LoopInvalidation
                 */
                $row = 0;
            } else if ($row > sizeof($gameState["map"]) - 1) {
                $row = sizeof($gameState["map"]) - 1;
            }
            array_push($clientMap, array_slice($gameState["map"][$row], $gameState["location"][0] - (int) floor($gameWindowWidth / 2), $gameWindowWidth));
        }

        $gameState["map"] = $clientMap;

        $state = new State($gameState);

        $stateJSON = $state->jsonSerialize();

        pg_close($con);
        unset($con);
        unset($con_login);

        return $this->render('game.html.twig', ["state" => $stateJSON]);
    }
}