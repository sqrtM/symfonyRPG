<?php

declare(strict_types=1);

namespace App\Entity;

use App\Service\NoiseGenerator;

class Map
{
    private int $height;
    private int $width;
    private array $screensArray;

    public function __construct()
    {
        $argv = func_get_args();
        switch (func_num_args()) {
            case 0:
                self::__construct1();
                break;
            case 2:
                self::__construct2($argv[0], $argv[1]);
                break;
        }
    }

    private function __construct1()
    {
    }

    private function __construct2(int $height, int $width)
    {
        $this->height = $height;
        $this->width = $width;
    }

    public function build(int $seed)
    {
        $noiseGenerator = new NoiseGenerator($seed);
        $noiseArray = array_fill(0, $this->height, array_fill(0, $this->width, 0));
        for ($i = 0; $i < $this->height; ++$i) {
            for ($j = 0; $j < $this->width; ++$j) {
                $noiseValue = $noiseGenerator->random2D(
                    $i / $this->width * ($this->width >> 4),
                    $j / $this->height * ($this->height >> 4)
                );
                $noiseArray[$i][$j] = new Tile(new Location($i, $j), $noiseValue);
            }
        }
        return $noiseArray;
    }

    /*
    this splits a large array into $numberOfScreens sections.
    we can then hold this info in postgres and, instead of calculating these in real time,
    */
    public function splitIntoScreens(array $tileArray)
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

    /**
     * retrieves a 3x3 square of screens from the db.
     *
     * @param int               $center the player's current location. screen number.
     * @param \PgSql\Connection $con    postgres connection resource
     * @param string            $name   user name
     *
     * @return array
     */
    public function getSurroundingScreens(int $center, \PgSql\Connection $con, string $name): array
    {
        $desiredScreens = array(
        $center - 11 >= 0 ? $center - 11 : null,  // nw
        $center - 10 >= 0 ? $center - 10 : null,  // n
        $center - 9 >= 0 ? $center - 9 : null,  // ne

        $center - 1 >= 0 ? $center - 1 : null, // w
        $center, // center
        $center + 1 < $this->width ? $center + 1 : null, // e

        $center + 9 < $this->width ? $center + 9 : null, // sw
        $center + 10 < $this->width ? $center + 10 : null, // s
        $center + 11 < $this->width ? $center + 11 : null, // se
        );

        $resultsArray = array();
        pg_prepare($con, 'fetchScreens', "SELECT screen FROM $name WHERE id = $1;");
        for ($i = 0; $i < count($desiredScreens); ++$i) {
            pg_send_execute($con, 'fetchScreens', array($desiredScreens[$i]));
            array_push($resultsArray, array('id' => $desiredScreens[$i], 'screen' => pg_get_result($con)));
        }
        $returnArray = array();
        for ($i = 0; $i < count($resultsArray); ++$i) {
            array_push(
                $returnArray,
                array('id' => $resultsArray[$i]['id'], 'screen' => pg_fetch_all($resultsArray[$i]['screen']))
            );
        }
        return $returnArray;
    }
}
