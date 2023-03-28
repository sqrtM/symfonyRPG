<?php

declare(strict_types=1);

namespace App\Entity;

enum TileName: string
{
    case Wall = "Wall";
    case Mountain = "Mountain";
    case Slope = "Slope";
    case Grass = "Grass";
    case Shore = "Shore";
    case Water = "Water";
    case DeepWater = "DeepWater";
}
