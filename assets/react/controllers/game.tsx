import * as React from 'react'
import GameMap from '../components/GameMap'
import { useEffect } from 'react'
import { tileGetter } from '../classes/tiles'

import { GameState, MapInfo, Tile, TileName } from '../classes/enumsAndTypes'

/**
 * @todo —
 * 1.) presently, the array being sent from the @PageController.php is
 * sending an array for the map, but in the process it loses its order.
 * What we probably want to do is make each element of the array have TWO
 * distinct members : the noise value as well as a "location" array.
 * Every entity in the game can hold this "origin" duple.
 */
export default function (props: GameState): JSX.Element {
  let tileMap: Tile<TileName>[][] = Array.from(
    { length: props.state.map.length },
    () =>
      Array.from({ length: props.state.map[0].length }, () =>
        tileGetter.get(TileName.Grass, [0, 0]),
      ),
  )

  useEffect(() => {
    props.state.map.forEach((i: MapInfo[], index: number) => {
      i.map((j: MapInfo, jndex: number) => {
        let locY = props.state.map[index][jndex].location.y
        let locX = props.state.map[index][jndex].location.x
        switch (true) {
          case j.noiseValue >= 0.6:
            tileMap[index][jndex] = tileGetter.get(TileName.Wall, [locY, locX])
            break
          case j.noiseValue >= 0.25:
            tileMap[index][jndex] = tileGetter.get(TileName.Mountain, [
              locY,
              locX,
            ])
            break
          case j.noiseValue >= 0.2:
            tileMap[index][jndex] = tileGetter.get(TileName.Slope, [locY, locX])
            break
          case j.noiseValue >= 0:
            tileMap[index][jndex] = tileGetter.get(TileName.Grass, [locY, locX])
            break
          case j.noiseValue >= -0.4:
            tileMap[index][jndex] = tileGetter.get(TileName.Shore, [locY, locX])
            break
          case j.noiseValue >= -0.6:
            tileMap[index][jndex] = tileGetter.get(TileName.Water, [locY, locX])
            break
          default:
            tileMap[index][jndex] = tileGetter.get(TileName.DeepWater, [
              locY,
              locX,
            ])
            break
        }
      })
    })
  }, [props.state.map])

  return (
    <>
      <GameMap map={tileMap} location={props.state.location} />
    </>
  )
}
