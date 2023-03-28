/**
 * top left corner is (0,0)
 * bottom right corner is (height, width)
 */
export type LocationTuple = [y: number, x: number];

export type ParsedScreen = { id: number; screen: MapInfo[][] }
export type IncomingScreen = { id: number; screen: { screen?: string }[] }


export type MapInfo = {
  location: { y: number; x: number };
  tileName: string;
  seen: boolean;
};

export type GameState = {
  state: {
    name: string;
    status: any; // this will be typed soon.
    location: LocationTuple;
    screen: number;
  };
};

export class Tile<TileName> {
  name!: TileName;
  properties!: TileProperties<TileName>;
  visuals!: TileVisuals<TileName>;
  contents?: Entity[];

  constructor(i: Tile<TileName>, location: LocationTuple) {
    Object.assign(this, i);
    this.properties.location[0] = location[0];
    this.properties.location[1] = location[1];
  }
}

export type Entity = {
  char: string; // enum later
  properties: {
    name?: string;
    health?: number;
    alive: boolean;
  };
};

export type TileType<TileName> = {
  name: TileName;
  properties: TileProperties<TileName>;
  visuals: TileVisuals<TileName>;
};

/*
i hate how unsafe enums in ts are
export interface TileInterface<T> {
  Wall: T
  Mountain: T
  Slope: T
  Grass: T
  Shore: T
  Water: T
  DeepWater: T
}
*/

export enum TileName {
  Wall = "Wall",
  Mountain = "Mountain",
  Slope = "Slope",
  Grass = "Grass",
  Shore = "Shore",
  Water = "Water",
  DeepWater = "DeepWater",
}

export enum TileChar {
  Wall = "#",
  Mountain = "^",
  Slope = "/",
  Grass = ".",
  Shore = "%",
  Water = "~",
  DeepWater = "*",
}

export type TileProperties<Name> = {
  defaultChar: TileChar;
  defaultStyle: Name;
  speedMod: number;
  walkable: boolean;
  flavorText: string;
  location: LocationTuple;
};

export type TileVisuals<Name> = {
  style: Name;
  char: TileChar;
  lightLevel: number;
};

export type InventoryItem = {
  name: string; //eventually, InventoryName enum
  char: string; //eventually, InventoryChar enum
  description: string;
  //type: ItemType //armor, weapon, consumable...
  //style: ItemStyle // class name to style the weapon.
}

export const exampleItem: InventoryItem = {
  name: "example item",
  char: "!",
  description: "this is an example item."
}

export const emptyItem: InventoryItem = {
  name: "empty",
  char: "_",
  description: "empty space"
}