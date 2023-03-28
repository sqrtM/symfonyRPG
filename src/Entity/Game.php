<?php

namespace App\Entity;

class Game
{
    private string $name;
    private int $mapHeight;
    private int $mapWidth;
    private string $seed;
    private \PgSql\Connection $con;


    public function __construct(string $name, int $mapHeight, int $mapWidth, \PgSql\Connection $con)
    {
        $this->name = $name;
        $this->mapHeight = $mapHeight;
        $this->mapWidth = $mapWidth;
        $this->con = $con;
        $this->createSeed();
    }

    private function createSeed()
    {
        // goofy, completely arbitrary way to obtain a seed from a username.
        // TODO: Redo this, and instead of making it dependent upon username,
        // make it dependent upon system clock.
        $seedArray = array();
        foreach (preg_split('//', $this->name, -1, PREG_SPLIT_NO_EMPTY) as $_key => $val) {
            array_push($seedArray, ord($val));
        }
        $this->seed = intval(implode($seedArray), 10);
    }

    public function initState()
    {
        $yCoord = random_int(1, $this->mapHeight - 1);
        $xCoord = random_int(1, $this->mapHeight - 1);
        // psycho lambda to get the inital screen by taking the two digits and concatinating them.
        // a useful (and purposeful) side effect of keeping everything divisible by 10.
        $startingScreen = intval(strval(floor($yCoord / 30)) . strval(floor($xCoord / 30)));


        $gameState = array(
            'name' => $this->name,
            'status' => array(
                'health' => 100,
                'mana' => array(
                    'alpha' => 20,
                    'beta' => 20,
                    'gamma' => 20
                ),
                'hunger' => 0,
                'sanity' => 0,
                'rage' => 0
            ),
            'location' => array($yCoord, $xCoord),
            'screen' => $startingScreen,
        );

        $state = new State($gameState);
        $stateJSON = $state->jsonSerialize();

        pg_prepare($this->con, 'createNewGameInstance', 'INSERT INTO games (name, state) VALUES ($1, $2);');
        try {
            pg_send_execute($this->con, 'createNewGameInstance', array($this->name, json_encode($stateJSON)));
        } catch (\Exception $e) {
            echo $e->getMessage();
        }
        pg_get_result($this->con);
    }

    /**
     * INITALIZING THE MAP
     * BIG @todo: Here's the step by step of how we want to do this and why:
     * 1.) currently, this creates NOISE, which then is sent to the user.
     * 2.) the user interprets the noise and creates a map from it each time.
     * 3.) this is a horrible idea because it prevents saving and modifying the world in any way.
     * 4.) what we SHOULD do, is interpret the noise IN PHP, then send the interpreted noise to the user.
     * 5.) then, when a user calls for a new screen, it sends a copy of the screen the user was just at to postgres to save it.
     * 6.) the format will be: array("location" => Location, tileName => tileName). We are getting rid of "seen" for now.
     * 7.) this will require a new function: $map->noiseToTile.
     *
     * @return void
     */
    public function initMap()
    {
        $map = new Map($this->mapHeight, $this->mapWidth);
        $noise = $map->build($this->seed);
        $screens = $map->splitIntoScreens($noise);
        if (
            false !== pg_query(
                $this->con,
                "CREATE TABLE IF NOT EXISTS $this->name (id int NOT NULL UNIQUE, screen json NOT NULL);"
            )
        ) {
            pg_prepare($this->con, 'fillTable', "INSERT INTO $this->name(id, screen) VALUES ($1, $2);");
            for ($i = 0; $i < count($screens); ++$i) {
                pg_send_execute(
                    $this->con,
                    'fillTable',
                    array($i, json_encode($screens[$i]))
                ) or exit('Query failed: ' . pg_last_error());
                pg_get_result($this->con);
            }
        }
    }
}
