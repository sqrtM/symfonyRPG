<?php

namespace App\Entity;

class Location
{
    private readonly int $y;
    private readonly int $x;

    public function __construct(int $y, int $x)
    {
        $this->y = $y;
        $this->x = $x;
    }

    public function get(): array
    {
        return array("y" => $this->y, "x" => $this->x);
    }
}
