<?php

namespace App\Entity;

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
class State extends \stdClass implements \JsonSerializable
{
    private \stdClass $stateObj;

    public function __construct(array $array)
    {
        $generic = new \stdClass();

        foreach ($array as $key => &$val) {
            $generic->$key = $val;
        }

        $this->stateObj = $generic;
    }

    public function saveGame(\PgSql\Connection $con)
    {
        $query = 'UPDATE games SET state = ' . "'" . json_encode($this->stateObj) . "'WHERE name = $1 RETURNING *;";
        pg_prepare($con, 'getScreen', $query);
        pg_send_execute($con, 'getScreen', array($this->stateObj->name));
        if (pg_get_result($con) === false) {
            throw new \Exception("failed to save.");
        }
    }


    /**
     * Specify data which should be serialized to JSON
     * Serializes the object to a value that can be serialized natively by json_encode().
     *
     * @return \stdClass Returns data which can be serialized by json_encode(),
     * which is a value of any type other than a resource .
     */
    public function jsonSerialize(): \stdClass
    {
        return $this->stateObj;
    }
}
