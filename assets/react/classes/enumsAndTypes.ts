/**
 * top left corner is (0,0)
 * bottom right corner is (height, width)
 */
export type LocationTuple = [y: number, x: number]

export type MapInfo = {location: {y: number, x: number}, noiseValue: number}

export type GameState = {
  state: {
    name: string
    health: number
    location: LocationTuple
  }
  map: MapInfo[][]
}

export class Tile<TileName> {

  name!: TileName
  properties!: TileProperties<TileName>
  visuals!: TileVisuals<TileName>
  contents?: Entity[]

  constructor(i: Tile<TileName>, location: LocationTuple) {
    Object.assign(this, i);
    this.properties.location[0] = location[0]
    this.properties.location[1] = location[1]
  }
}

export type Entity = {
  char: string // enum later
  properties: {
    name?: string,
    health?: number,
    alive: boolean
  }
}

export type TileType<TileName> = {
  name: TileName
  properties: TileProperties<TileName>
  visuals: TileVisuals<TileName>

}

export enum TileName {
  Wall = "Wall",
  Mountain = "Mountain",
  Slope = "Slope",
  Grass = "Grass",
  Shore = "Shore",
  Water = "Water",
  DeepWater = "DeepWater"
}

export enum TileChar {
  Wall = "#",
  Mountain = "^",
  Slope = "/",
  Grass = ".",
  Shore = "%",
  Water = "~",
  DeepWater = "*"
}

export type TileProperties<Name> = {
  defaultChar: TileChar,
  defaultStyle: Name,
  speedMod: number,
  walkable: boolean,
  flavorText: string
  location: LocationTuple
}

export type TileVisuals<Name> = {
  style: Name,
  char: TileChar,
  lightLevel: number,
}
