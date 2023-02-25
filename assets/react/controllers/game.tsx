import * as React from 'react'
import GameMap from '../components/GameMap'

/**
 * top left corner is (0,0)
 * bottom right corner is (height, width)
 */
export type LocationTuple = [y: number, x: number]

export type GameState = {
  state: {
    map: number[][];
    name: string
    health: number
    location: LocationTuple
  }
}

export default function (props: GameState): JSX.Element {

  return (
    <>
      <GameMap map={props.state.map} location={props.state.location} />
    </>
  )
}
