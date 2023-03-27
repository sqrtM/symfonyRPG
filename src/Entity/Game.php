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
            'health' => 100,
            'location' => array($yCoord, $xCoord),
            'screen' => $startingScreen,
        );

        $state = new State($gameState);
        $stateJSON = $state->jsonSerialize();

        pg_prepare($this->con, 'createNewGameInstance', 'INSERT INTO games (name, state) VALUES ($1, $2);');
        pg_send_execute($this->con, 'createNewGameInstance', array($this->name, json_encode($stateJSON)))
            or exit('Query failed: ' . pg_last_error());
        pg_get_result($this->con);
    }

    public function initMap()
    {
        $map = new Map($this->mapHeight, $this->mapWidth, $this->seed);
        $noise = $map->build();
        $screens = $map->splitIntoScreens($noise);
        /*
        fill the table with all the screens; this prevents us from having a single, enormous map, and we now, instead,
        have several disconnected "screens". This makes more sense in terms of the game loop anyway. This also allows for
        silly things in the future, like being able to query into pre-made dungeons or whatever.
        */
        if (false !== pg_query($this->con, "CREATE TABLE IF NOT EXISTS $this->name (id int NOT NULL UNIQUE, screen json NOT NULL);")) {
            pg_prepare($this->con, 'fillTable', "INSERT INTO $this->name(id, screen) VALUES ($1, $2);");
            for ($i = 0; $i < count($screens); ++$i) {
                pg_send_execute($this->con, 'fillTable', array($i, json_encode($screens[$i]))) or exit('Query failed: ' . pg_last_error());
                pg_get_result($this->con);
            }
        }
    }
}
