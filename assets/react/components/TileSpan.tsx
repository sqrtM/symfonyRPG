import * as React from "react";
import { Tile, TileName } from "../classes/enumsAndTypes";

export type TileProps = {
  isPlayerHere: boolean; // this will later become a search for contents in the tile
  tile: Tile<TileName>;
  mapHover: Function
};

export default function (props: TileProps): JSX.Element {

  const handleHover = (tile: Tile<TileName> | null) => {
    props.mapHover(tile)
  } 

  if (props.isPlayerHere) console.log(props)

  return (
    <span
      className={
        props.isPlayerHere ? "Player" : props.tile.properties.defaultStyle
      }
      onMouseOver={() => handleHover(props.tile)}
      onMouseLeave={() => handleHover(null)}
    >
      {props.isPlayerHere ? "@" : props.tile.properties.defaultChar}
    </span>
  );
}
