<?php

declare(strict_types=1);

namespace App\Controller;

use App\Controller\AbsCon;
use App\Entity\Game;
use App\Entity\Map;
use App\Entity\State;
use App\Entity\User;
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
        try {
            $con = pg_connect($this->getConnectionString()) or throw new \Exception("Could not connect to sever");
            $user = new User($name, $con);

            if ($user->exists()) {
                // grab the info from the last results we took and "log" the user in.
                $postgresStateArray = json_decode(pg_fetch_all($user->results)[0]['state'], true);
                $gameState = array(
                'name' => $postgresStateArray['name'],
                'status' => $postgresStateArray['status'],
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
        } catch (\Exception $e) {
            echo $e->getMessage();
        } finally {
            pg_close($con);
        }
        return $returnValue;
    }

    #[Route('/game/api/{name}', name: 'getNewScreen', methods: array('POST'))]
    public function getNewScreen(string $name, Request $request): Response
    {
        $returnArray = array();
        try {
            $con = pg_connect($this->getConnectionString()) or throw new \Exception("could not connect to server");
            $incomingScreen = intval(json_decode($request->getContent())->{'screen'});
            $map = new Map($this->mapHeight, $this->mapWidth);
            $returnArray = $map->getSurroundingScreens($incomingScreen, $con, $name);
        } catch (\Exception $e) {
            echo $e->getMessage();
        } finally {
            pg_close($con);
        }
        return new JsonResponse($returnArray);
    }

    #[Route('/game/save/{name}', name: 'saveGame', methods: array('POST'))]
    public function saveGame(string $name, Request $request): Response
    {
        $response = "success";
        try {
            $con = pg_connect($this->getConnectionString()) or throw new \Exception("could not connect to server");
            // this is such a fucked up one-liner but it works properly. TODO: fix this.
            $incoming_state = json_decode(json_encode(json_decode($request->getContent())->{'state'}), true);
            $state = new State($incoming_state);
            $state->saveGame($con);
        } catch (\Exception $e) {
            echo $e->getMessage();
            $response = $e->getMessage();
        } finally {
            pg_close($con);
        }
        return new Response($response);
    }

    #[Route('/game/saveMap/{name}', name: 'saveMap', methods: array('POST'))]
    public function saveMap(string $name, Request $request): Response
    {
        $response = "success";
        try {
            $con = pg_connect($this->getConnectionString()) or throw new \Exception("could not connect to server");
            // this is such a fucked up one-liner but it works properly. TODO: fix this.
            $incomingScreenIndex = json_decode($request->getContent())->{'screenIndex'};
            $incomingScreen = json_decode($request->getContent())->{'screen'};
            pg_prepare(
                $con,
                'saveScreen',
                'UPDATE ' . $name . ' SET screen = ' . "'" . json_encode($incomingScreen) . "'" . 'WHERE id = $1 RETURNING *;'
            );
            pg_send_execute($con, 'saveScreen', array($incomingScreenIndex));
            if (pg_get_result($con) === false) {
                throw new \Exception("failed to save.");
            }
        } catch (\Exception $e) {
            echo $e->getMessage();
            $response = $e->getMessage();
        } finally {
            pg_close($con);
        }
        return new Response($response);
    }
}
