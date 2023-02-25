import { TileName, TileChar, TileType, Tile } from './enumsAndTypes';

export const tileGetter = {
    get: function (name: TileName): Tile<TileName> {
        return new Tile(tileDefinitions[name])
}
}

const tileDefinitions: {[key in TileName]: TileType<TileName>} = {
    "Wall": {
        name: TileName.Wall,
        properties: {
            defaultChar: TileChar.Wall,
            defaultStyle: TileName.Wall,
            speedMod: 3,
            walkable: false,
            flavorText: "Some creator seems to have made certain that such an thing should appear nigh intraversable, lest one should get any bright ideas...."
        },
        visuals: {
            style: TileName.Wall,
            char: TileChar.Wall,
            lightLevel: 1,
        }
    },
    "Mountain": {
        name: TileName.Mountain,
        properties: {
            defaultChar: TileChar.Mountain,
            defaultStyle: TileName.Mountain,
            speedMod: 1.8,
            walkable: true,
            flavorText: "Melville once said that 'There's something ever egotistical in mountain tops and towers, in all things grand and lofty.' But what other refuge could man possess than his own ego?"
        },
        visuals: {
            style: TileName.Mountain,
            char: TileChar.Mountain,
            lightLevel: 1,
        }
    },
    "Slope": {
        name: TileName.Slope,
        properties: {
            defaultChar: TileChar.Slope,
            defaultStyle: TileName.Slope,
            speedMod: 1.2,
            walkable: true,
            flavorText: "Such undulate terrain does not make for pleasant travels."
        },
        visuals: {
            style: TileName.Slope,
            char: TileChar.Slope,
            lightLevel: 1,
        }
    },
    "Grass": {
        name: TileName.Grass,
        properties: {
            defaultChar: TileChar.Grass,
            defaultStyle: TileName.Grass,
            speedMod: 1,
            walkable: true,
            flavorText: "The grass crunches like leaves under your foot. It seems weary even to the task of nourishing the wildlife. It is as though it is asking you to take up its cause."
        },
        visuals: {
            style: TileName.Grass,
            char: TileChar.Grass,
            lightLevel: 1,
        }
    },
    "Shore": {
            name: TileName.Shore,
            properties: {
                defaultChar: TileChar.Shore,
                defaultStyle: TileName.Shore,
                speedMod: 1.1,
                walkable: true,
                flavorText: "These sands feel more like dust or ash than beaches. Life may never take root here."
            },
            visuals: {
                style: TileName.Shore,
                char: TileChar.Shore,
                lightLevel: 1,
            }
        },
        "Water": {
            name: TileName.Water,
            properties: {
                defaultChar: TileChar.Water,
                defaultStyle: TileName.Water,
                speedMod: 2,
                walkable: true,
                flavorText: "Cold with an odd ozone smell. It doesn't feel particularly wise to partake of it."
            },
            visuals: {
                style: TileName.Water,
                char: TileChar.Water,
                lightLevel: 1,
            }
        },
        "DeepWater": {
            name: TileName.DeepWater,
            properties: {
                defaultChar: TileChar.DeepWater,
                defaultStyle: TileName.DeepWater,
                speedMod: 4,
                walkable: false,
                flavorText: "Water black as night. God knows what lies beneath...."
            },
            visuals: {
                style: TileName.DeepWater,
                char: TileChar.DeepWater,
                lightLevel: 1,
            }
        }
}
export default tileGetter;