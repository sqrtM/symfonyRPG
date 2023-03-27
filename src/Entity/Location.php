<?php

namespace App\Entity;

class Location
{
    private readonly int $x;
    private readonly int $y;

    public function __construct(int $x, int $y)
    {
        $this->x = $x;
        $this->y = $y;
    }

    public function get()
    {
        return array($this->x, $this->y);
    }
}
