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
        $noiseGenerator = new NoiseGenerator();

        $width = 500;
        $height = 500;

        $noiseArray = array_fill(0, $height, array_fill(0, $width, 0));

        for ($i = 0; $i < $height; $i++) {
            for ($j = 0; $j < $width; $j++) {
                $noiseArray[$i][$j] += $noiseGenerator->random2D($i / $width * ($width >> 4), $j / $height * ($height >> 4));
            }
        }

        $testArray = array(
            "name" => "name",
            "health" => 100,
            "location" => array(floor($width / 2), floor($height / 2)),
            "map" => $noiseArray
        );

        $state = new State($testArray);

        $stateJSON = $state->jsonSerialize();

        return $this->render('game.html.twig', ["state" => $stateJSON]);
    }
}