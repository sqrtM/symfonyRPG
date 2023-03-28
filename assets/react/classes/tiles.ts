import {
  TileName,
  TileChar,
  TileType,
  Tile,
  LocationTuple,
  MapInfo,
} from "./enumsAndTypes";

/**
 * Do not forget : the original problem we had with this function is that
 * JS is always pass by reference. Originally, we were passing references
 * DIRECTLY TO the tile definitions, fucking the whole thing up. Ensure
 * you ALWAYS CLONE in these kinds of languages.
 */
export const tileGetter = {
  get: function (name: TileName, location: LocationTuple): Tile<TileName> {
    let copyTile = structuredClone(tileDefinitions[name]);
    return new Tile(copyTile, location);
  },
};

export function interpretIncomingTiles(incomingArray: MapInfo[][]): Tile<TileName>[][] {
  let newTileMap: Tile<TileName>[][] = Array.from({ length: 30 }, () =>
    Array.from({ length: 30 }, () => tileGetter.get(TileName.Grass, [0, 0]))
  );
  incomingArray.forEach((i: MapInfo[], index: number) => {
    i.map((j: MapInfo, jndex: number) => {
      newTileMap[index][jndex] = tileGetter.get(
        TileName[j.tileName as keyof typeof TileName],
        [j.location.y, j.location.x]
      );
    });
  });
  return newTileMap;
}

const tileDefinitions: { [key in TileName]: TileType<TileName> } = {
  Wall: {
    name: TileName.Wall,
    properties: {
      defaultChar: TileChar.Wall,
      defaultStyle: TileName.Wall,
      speedMod: 3,
      walkable: false,
      flavorText:
        "Some creator seems to have made certain that such an thing should appear nigh intraversable, lest one should get any bright ideas....",
      location: [-1, -1],
    },
    visuals: {
      style: TileName.Wall,
      char: TileChar.Wall,
      lightLevel: 1,
    },
  },
  Mountain: {
    name: TileName.Mountain,
    properties: {
      defaultChar: TileChar.Mountain,
      defaultStyle: TileName.Mountain,
      speedMod: 1.8,
      walkable: true,
      flavorText:
        "Melville once said that 'There's something ever egotistical in mountain tops and towers, in all things grand and lofty.' But what other refuge could man possess than his own ego?",
      location: [-1, -1],
    },
    visuals: {
      style: TileName.Mountain,
      char: TileChar.Mountain,
      lightLevel: 1,
    },
  },
  Slope: {
    name: TileName.Slope,
    properties: {
      defaultChar: TileChar.Slope,
      defaultStyle: TileName.Slope,
      speedMod: 1.2,
      walkable: true,
      flavorText: "Such undulate terrain does not make for pleasant travels.",
      location: [-1, -1],
    },
    visuals: {
      style: TileName.Slope,
      char: TileChar.Slope,
      lightLevel: 1,
    },
  },
  Grass: {
    name: TileName.Grass,
    properties: {
      defaultChar: TileChar.Grass,
      defaultStyle: TileName.Grass,
      speedMod: 1,
      walkable: true,
      flavorText:
        "The grass crunches like leaves under your foot. It seems weary even to the task of nourishing the wildlife. It is as though it is asking you to take up its cause.",
      location: [-1, -1],
    },
    visuals: {
      style: TileName.Grass,
      char: TileChar.Grass,
      lightLevel: 1,
    },
  },
  Shore: {
    name: TileName.Shore,
    properties: {
      defaultChar: TileChar.Shore,
      defaultStyle: TileName.Shore,
      speedMod: 1.1,
      walkable: true,
      flavorText:
        "These sands feel more like dust or ash than beaches. Life may never take root here.",
      location: [-1, -1],
    },
    visuals: {
      style: TileName.Shore,
      char: TileChar.Shore,
      lightLevel: 1,
    },
  },
  Water: {
    name: TileName.Water,
    properties: {
      defaultChar: TileChar.Water,
      defaultStyle: TileName.Water,
      speedMod: 2,
      walkable: true,
      flavorText:
        "Cold with an odd ozone smell. It doesn't feel particularly wise to partake of it.",
      location: [-1, -1],
    },
    visuals: {
      style: TileName.Water,
      char: TileChar.Water,
      lightLevel: 1,
    },
  },
  DeepWater: {
    name: TileName.DeepWater,
    properties: {
      defaultChar: TileChar.DeepWater,
      defaultStyle: TileName.DeepWater,
      speedMod: 4,
      walkable: false,
      flavorText: "Water black as night. God knows what lies beneath....",
      location: [-1, -1],
    },
    visuals: {
      style: TileName.DeepWater,
      char: TileChar.DeepWater,
      lightLevel: 1,
    },
  },
};
export default tileGetter;
