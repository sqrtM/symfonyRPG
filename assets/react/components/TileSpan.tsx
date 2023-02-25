import * as React from 'react'
import { Tile, TileName } from '../classes/enumsAndTypes'

export type TileProps = {
  isPlayerHere: boolean // this will later become a search for contents in the tile
  tile: Tile<TileName>
  tileKey: string
}

export default function (props: TileProps): JSX.Element {
  return (
    <span
      className={
        props.isPlayerHere
          ? 'Player'
          : props.tile.properties.defaultStyle
      }
      key={props.tileKey + "fff"}
    >
      {props.isPlayerHere
        ? '@'
        : props.tile.properties.defaultChar}
    </span>
  )
}
