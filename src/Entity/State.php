<?php

namespace App\Entity;

use JsonSerializable;
use stdClass;

/**
 * Takes the JSON data from the postgres DB.
 * This will deconstruct that data and build the State for the game.
 * 
 * Uses the VarVar thing that PHP has. Seems interesting.
 * The biggest reason I'm serializing in this format is to 
 * allow me flexability as I continue to grow the game, 
 * i.e., I don't need to remake the table each time
 * I add a new feature. for now, everything can just be 
 * handled dynamically as I add it.
 * 
 * We may switch to a traditional table set up in the future.
 */
class State extends stdClass implements JsonSerializable
{

    private stdClass $stateObj;

    public function __construct(array $array)
    {
        $generic = new stdClass();

        foreach ($array as $key => &$val) {
            $generic->$key = $val;
        }

        $this->stateObj = $generic;
    }

    /**
     * Specify data which should be serialized to JSON
     * Serializes the object to a value that can be serialized natively by json_encode().
     * @return stdClass Returns data which can be serialized by json_encode(), which is a value of any type other than a resource .
     */
    public function jsonSerialize(): stdClass
    {
        return $this->stateObj;
    }
}