<?php

namespace App\Entity;

class Tile implements \JsonSerializable
{
    private Location $location;
    private float $noiseValue;
    private bool $seen = false;

    public function setSeen(): void
    {
        $this->seen = true;
    }

    public function get(): array
    {
        return array('location' => $this->location->get(), 'noiseValue' => $this->noiseValue, 'seen' => $this->seen);
    }

    public function setLocation(Location $location)
    {
        $this->location = $location;
    }

    public function setNoiseValue(float $noiseValue)
    {
        $this->noiseValue = $noiseValue;
    }

    /**
     * Specify data which should be serialized to JSON
     * Serializes the object to a value that can be serialized natively by json_encode().
     *
     * @return mixed Returns data which can be serialized by json_encode(), which is a value of any type other than a resource .
     */
    public function jsonSerialize()
    {
        return array('location' => $this->location->get(), 'noiseValue' => $this->noiseValue, 'seen' => $this->seen);
    }
}
