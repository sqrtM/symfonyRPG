<?php

declare(strict_types=1);

namespace App\Entity;

class Tile implements \JsonSerializable
{
    private Location $location;
    private bool $seen = false;
    private TileName $tileName;

    public function __construct(Location $location, float $noiseValue)
    {
        $this->location = $location;
        $this->interpretNoise($noiseValue);
    }

    public function setSeen(): void
    {
        $this->seen = true;
    }


    private function interpretNoise(float $noiseValue)
    {
        $this->tileName = match (true) {
            $noiseValue >=  0.75 => TileName::Wall,
            $noiseValue >=  0.40 => TileName::Mountain,
            $noiseValue >=  0.30 => TileName::Slope,
            $noiseValue >=  0.00 => TileName::Grass,
            $noiseValue >= -0.25 => TileName::Shore,
            $noiseValue >= -0.60 => TileName::Water,
            default              => TileName::DeepWater,
        };
    }

    /**
     * Specify data which should be serialized to JSON
     * Serializes the object to a value that can be serialized natively by json_encode().
     *
     * @return array Returns data which can be serialized by json_encode(),
     * which is a value of any type other than a resource .
     */
    public function jsonSerialize()
    {
        return array('location' => $this->location->get(), 'tileName' => $this->tileName, 'seen' => $this->seen);
    }
}
