<?php

namespace App\Entity;

use App\Service\NoiseGenerator;

class Map
{
    private int $height;
    private int $width;
    private int $seed;
    private array $tileArray;
    private array $screensArray;

    public function __construct(int $height, int $width, int $seed)
    {
        $this->height = $height;
        $this->width = $width;
        $this->seed = $seed;
    }

    public function build()
    {
        $noiseGenerator = new NoiseGenerator($this->seed);
        $tile = new Tile();
        $noiseArray = array_fill(0, $this->height, array_fill(0, $this->width, clone $tile));
        for ($i = 0; $i < $this->height; ++$i) {
            for ($j = 0; $j < $this->width; ++$j) {
                $noiseValue = $noiseGenerator->random2D($i / $this->width * ($this->width >> 4), $j / $this->height * ($this->height >> 4));
                $noiseArray[$i][$j]->setNoiseValue($noiseValue);
                $noiseArray[$i][$j]->setLocation(new Location($i, $j));
            }
        }
        return $noiseArray;
    }

        /*
        this splits a large array into $numberOfScreens sections.
        we can then hold this info in postgres and, instead of calculating these in real time,
        */
    public function splitMapIntoScreens(array $tileArray)
    {
        $screensArray = array();
        $numberOfScreens = 10; // really, number of ROWS of screens...
        for ($yCoordMiddle = ($this->height / $numberOfScreens) / 2; $yCoordMiddle <= $this->height * 0.99; $yCoordMiddle += $this->height / $numberOfScreens) {
            for ($xCoordMiddle = ($this->width / $numberOfScreens) / 2; $xCoordMiddle <= $this->width * 0.99; $xCoordMiddle += $this->width / $numberOfScreens) {
                $screen = array();
                for ($i = $yCoordMiddle - (($this->height / $numberOfScreens) / 2); $i < ($yCoordMiddle + ($this->height / $numberOfScreens) / 2); ++$i) {
                    $screenRow = array();
                    for ($j = $xCoordMiddle - (($this->width / $numberOfScreens) / 2); $j < ($xCoordMiddle + ($this->width / $numberOfScreens) / 2); ++$j) {
                        array_push($screenRow, $tileArray[(int) $i][(int) $j]);
                    }
                    array_push($screen, $screenRow);
                }
                array_push($screensArray, $screen);
            }
        }
        return $screensArray;
    }

    public function getAllScreens()
    {
        return $this->screensArray;
    }
}
