<?php

namespace App\Entity;

use JsonSerializable;
use stdClass;

class State implements JsonSerializable
{

    private stdClass $stateObj;

    /**
     * Takes the JSON data from the postgres DB.
     * This will deconstruct that data and build the State for the game.
     * 
     * Uses the VarVar thing that PHP has. Seems interesting.
     * 
     */
    public function __construct(array $array)
    {
        $generic = new stdClass();

        foreach ($array as $key => &$val) {
            $generic->$key = &$val;
        }

        $this->stateObj = $generic;
    }

    /**
     * Specify data which should be serialized to JSON
     * Serializes the object to a value that can be serialized natively by json_encode().
     * @return mixed Returns data which can be serialized by json_encode(), which is a value of any type other than a resource .
     */
    public function jsonSerialize()
    {
        return $this->stateObj;
    }
}