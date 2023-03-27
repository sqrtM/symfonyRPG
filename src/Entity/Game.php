<?php

namespace App\Entity;

class Game
{
    public function createSeed(string $name): int
    {
        // goofy, completely arbitrary way to obtain a seed from a username.
        // TODO: Redo this, and instead of making it dependent upon username,
        // make it dependent upon system clock.
        $seedArray = array();
        foreach (preg_split('//', $name, -1, PREG_SPLIT_NO_EMPTY) as $_key => $val) {
            array_push($seedArray, ord($val));
        }
        return intval(implode($seedArray), 10);
    }
}
