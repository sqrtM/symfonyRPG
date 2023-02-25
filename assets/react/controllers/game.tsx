import * as React from 'react'
import GameMap from '../components/GameMap'
import { useEffect } from 'react';
import { tileGetter } from '../classes/tiles';

import { GameState, Tile, TileName } from '../classes/enumsAndTypes';

/**
 * @todo —
 * 1.) presently, the array being sent from the @PageController.php is 
 * sending an array for the map, but in the process it loses its order.
 * What we probably want to do is make each element of the array have TWO
 * distinct members : the noise value as well as a "location" array. 
 * Every entity in the game can hold this "origin" duple. 
 */
export default function (props: GameState): JSX.Element {

  let tileMap: Tile<TileName>[][] = Array.from({ length: props.state.map.length }, () =>
    Array.from({ length: props.state.map[0].length }, () => tileGetter.get(TileName.Grass)));

  useEffect(() => {
    props.state.map.forEach((i: number[], index: number) => {
      i.map((j: number, jndex: number) => {
        switch(true) {
          case j >= 0.6:
            tileMap[index][jndex] = tileGetter.get(TileName.Wall)
            break;
          case j >= 0.25:
            tileMap[index][jndex] = tileGetter.get(TileName.Mountain)
            break;
          case j >= 0.2:
            tileMap[index][jndex] = tileGetter.get(TileName.Slope)
            break;
          case j >= 0:
            tileMap[index][jndex] = tileGetter.get(TileName.Grass)
            break;
          case j >= -0.1:
            tileMap[index][jndex] = tileGetter.get(TileName.Shore)
            break;
          case j >= -0.6:
            tileMap[index][jndex] = tileGetter.get(TileName.Water)
            break;  
          default:
            tileMap[index][jndex] = tileGetter.get(TileName.DeepWater)
            break;
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
