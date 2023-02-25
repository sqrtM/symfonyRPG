<?php

namespace App\Controller;

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


    #[Route('/', name: 'home', methods: ['GET'])]
    public function hello(): Response
    {
        return $this->render('hello.html.twig', []);
    }

    #[Route('/game/{name}', name: 'game', methods: ['GET'])]
    public function game(string $name): Response
    {
        $seedArray = [];

        foreach (preg_split('//', $name, -1, PREG_SPLIT_NO_EMPTY) as $key => $val) {
            array_push($seedArray, ord($val));
        }

        $seed = intval(implode($seedArray), 10);

        print_r("seed = " . $seed);

        $noiseGenerator = new NoiseGenerator($seed);

        $width = 200;
        $height = 200;

        $noiseArray = array_fill(0, $height, array_fill(0, $width, 0));

        for ($i = 0; $i < $height; $i++) {
            for ($j = 0; $j < $width; $j++) {
                $noiseArray[$i][$j] += $noiseGenerator->random2D($i / $width * ($width >> 4), $j / $height * ($height >> 4));
            }
        }

        $gameState = [
            "name" => "name",
            "health" => 100,
            //"location" => [(int) floor($width / 2), (int) floor($height / 2)],
            "location" => array(15, 15),
            "map" => $noiseArray
        ];

        $clientMap = [];
        for ($row = $gameState["location"][0] - 15; $row < $gameState["location"][0] + 15; $row++) {
            if ($row <= 0) {
                /**
                 * @psalm-suppress LoopInvalidation
                 */
                $row = 0;
            } else if ($row > sizeof($noiseArray) - 1) {
                $row = sizeof($noiseArray) - 1;
            }
            array_push($clientMap, array_slice($noiseArray[$row], $gameState["location"][0] - 15, 30));
        }
        /**
         * @psalm-suppress ForbiddenCode
         */
        //print_r(var_dump($clientMap));

        $gameState["map"] = $clientMap;

        $state = new State($gameState);

        $stateJSON = $state->jsonSerialize();

        return $this->render('game.html.twig', ["state" => $stateJSON]);
    }
}