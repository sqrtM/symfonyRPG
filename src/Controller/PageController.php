<?php

namespace App\Controller;

use App\Entity\DatabaseConnectionCredentials;
use App\Entity\State;
use App\NoiseGenerator\NoiseGenerator;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class PageController extends AbstractController
{

    /**
     * @psalm-suppress InvalidArgument
     */
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

        // goofy, completely arbitrary way to obtain a seed from a username.
        // TODO: Redo this, and instead of making it dependent upon username,
        // make it dependent upon system clock.
        $seedArray = [];
        foreach (preg_split('//', $name, -1, PREG_SPLIT_NO_EMPTY) as $key => $val) {
            array_push($seedArray, ord($val));
        }
        $seed = intval(implode($seedArray), 10);
        $noiseGenerator = new NoiseGenerator($seed);

        $mapWidth = 300;
        $mapHeight = 300;

        //fill the noise array with perlin noise.
        $noiseArray = array_fill(0, $mapHeight, array_fill(0, $mapWidth, ["location" => ["y" => 0, "x" => 0], "noiseValue" => 0]));
        for ($i = 0; $i < $mapHeight; $i++) {
            for ($j = 0; $j < $mapWidth; $j++) {
                $noiseArray[$i][$j]["noiseValue"] += $noiseGenerator->random2D($i / $mapWidth * ($mapWidth >> 4), $j / $mapHeight * ($mapHeight >> 4));
                $noiseArray[$i][$j]["location"]["y"] = $i;
                $noiseArray[$i][$j]["location"]["x"] = $j;
            }
        }

        $yCoord = random_int(1, $mapHeight - 1);
        $xCoord = random_int(1, $mapHeight - 1);
        // psycho lambda to get the inital screen by taking the two digits and concatinating them.
        // a useful (and purposeful) side effect of keeping everything divisible by 10.
        $startingScreen = intval(strval(floor($yCoord / 30)) . strval(floor($xCoord / 30)));

        $gameState = [
            "name" => $name,
            "health" => 100,
            "location" => [$yCoord, $xCoord],
            "screen" => $startingScreen
        ];

        /*
        this splits a large array into $numberOfScreens sections.
        we can then hold this info in postgres and, instead of calculating these in real time,
        TODO: we can just have the player hold the 9 screens around them and request screens as they approach them,
        kind of like how fog of war works in older games.
        */
        $screensArray = [];
        $numberOfScreens = 10; // really, number of ROWS of screens...
        for ($yCoordMiddle = ($mapHeight / $numberOfScreens) / 2; $yCoordMiddle <= $mapHeight * 0.99; $yCoordMiddle += $mapHeight / $numberOfScreens) {
            for ($xCoordMiddle = ($mapWidth / $numberOfScreens) / 2; $xCoordMiddle <= $mapWidth * 0.99; $xCoordMiddle += $mapWidth / $numberOfScreens) {
                $screen = [];
                for ($i = $yCoordMiddle - (($mapHeight / $numberOfScreens) / 2); $i < ($yCoordMiddle + ($mapHeight / $numberOfScreens) / 2); $i++) {
                    $screenRow = [];
                    for ($j = $xCoordMiddle - (($mapWidth / $numberOfScreens) / 2); $j < ($xCoordMiddle + ($mapWidth / $numberOfScreens) / 2); $j++) {
                        array_push($screenRow, $noiseArray[(int) $i][(int) $j]);
                    }
                    array_push($screen, $screenRow);
                }
                array_push($screensArray, $screen);
            }
        }

        $state = new State($gameState);
        $stateJSON = $state->jsonSerialize();

        pg_prepare($con, "createNewGameInstance", "INSERT INTO games (name, state) VALUES ($1, $2);");
        pg_send_execute($con, "createNewGameInstance", [$name, json_encode($stateJSON)])
            or die('Query failed: ' . pg_last_error());
        pg_get_result($con);

        /*
        fill the table with all the screens; this prevents us from having a single, enormous map, and we now, instead,
        have several disconnected "screens". This makes more sense in terms of the game loop anyway. This also allows for
        silly things in the future, like being able to query into pre-made dungeons or whatever.
        */
        if (pg_query($con, "CREATE TABLE IF NOT EXISTS $name (id int NOT NULL UNIQUE, screen json NOT NULL);") != false) {
            pg_prepare($con, "fillTable", "INSERT INTO $name(id, screen) VALUES ($1, $2);");
            for ($i = 0; $i < count($screensArray) - 1; $i++) {
                pg_send_execute($con, "fillTable", [$i, json_encode($screensArray[$i])]) or die('Query failed: ' . pg_last_error());
                pg_get_result($con);
            }
        }


        pg_close($con);
        unset($con);
        unset($con_login);
        return $this->redirectToRoute('game', ["name" => $name]);
    }






    #[Route('/game/{name}', name: 'game', methods: ['GET'])]
    public function game(string $name): Response|RedirectResponse
    {
        $con_login = $this->init_env();
        $con = pg_connect("host={$con_login->host()} dbname={$con_login->name()} user={$con_login->user()} password={$con_login->pass()}")
            or die("Could not connect to server\n");

        $query = "SELECT * FROM games WHERE name = '{$name}';";
        $results = pg_query($con, $query) or die('Query failed: ' . pg_last_error());
        $doesPlayerExist = count(pg_fetch_all($results)) > 0 ? true : false;

        if ($doesPlayerExist) {
            // grab the info from the last results we took and "log" the user in.
            $postgresStateArray = json_decode(pg_fetch_all($results)[0]["state"], true);
            $gameState = [
                "name" => $postgresStateArray["name"],
                "health" => $postgresStateArray["health"],
                "location" => $postgresStateArray["location"],
                "screen" => $postgresStateArray["screen"],
            ];
            $state = new State($gameState);
            $stateJSON = $state->jsonSerialize();
            $returnValue = $this->render('game.html.twig', ["state" => $stateJSON]);
        } else {
            // create a new game instance in Postgres.
            $returnValue = $this->redirectToRoute('createNewGame', ["name" => $name]);
        }

        pg_close($con);
        unset($con);
        unset($con_login);
        return $returnValue;
    }





    #[Route('/game/api/{name}', name: 'getNewScreen', methods: ['POST'])]
    public function getNewScreen(string $name, Request $request): Response
    {
        $con_login = $this->init_env();
        $con = pg_connect("host={$con_login->host()} dbname={$con_login->name()} user={$con_login->user()} password={$con_login->pass()}")
            or die("Could not connect to server\n");

        $incoming_screen = json_decode($request->getContent())->{'screen'};
        pg_prepare($con, "getScreen", "SELECT screen FROM $name WHERE id = $1;");
        pg_send_execute($con, "getScreen", [$incoming_screen]);
        $results = pg_get_result($con);
        $postgresResults = pg_fetch_all($results);

        pg_close($con);
        unset($con);
        unset($con_login);
        return new JsonResponse($postgresResults[0]["screen"]);
    }





    #[Route('/game/save/{name}', name: 'saveGame', methods: ['POST'])]
    public function saveGame(string $name, Request $request): Response
    {
        $con_login = $this->init_env();
        $con = pg_connect("host={$con_login->host()} dbname={$con_login->name()} user={$con_login->user()} password={$con_login->pass()}")
            or die("Could not connect to server\n");

        $incoming_state = json_decode($request->getContent())->{'state'};
        // there's likely a nicer way to do this without so many concats, 
        // but this is the only syntax I could make work properly... 
        // the reason is because JSON formatted postgres columns expect the JSON
        // to come wrapped in single quotes, which PHP takes issue with. hense the
        // weird single quote concats.
        $query = "UPDATE games SET state = " . "'" . json_encode($incoming_state) . "'" . "WHERE name = '$name' RETURNING *;";
        pg_prepare($con, "getScreen", $query);
        pg_send_execute($con, "getScreen", []);
        $results = pg_get_result($con);

        pg_close($con);
        unset($con);
        unset($con_login);
        return new Response(!$results === false);
    }
}