import * as React from "react";
import { Tile, TileName } from "../../classes/enumsAndTypes";

interface SelectedTileProps {
  selectedTile: Tile<TileName>;
}

export default function (props: SelectedTileProps): JSX.Element {
  return (
    <div>
      <div id="tileDisplayUI" style={{ fontSize: "xx-large" }}>
        <div id="contentsDisplayUI">
          <span
            className={props.selectedTile.visuals.style}
            style={{ fontSize: "xx-large" }}
          >
            {"{" + props.selectedTile.visuals.char + "}"}
            {props.selectedTile.name} Tile
          </span>
          <div>Speed Reduction : {props.selectedTile.properties.speedMod}</div>
          <div>
            Traversable :{" "}
            {props.selectedTile.properties.walkable ? "yes" : "no"}
          </div>
          <div>{props.selectedTile.properties.flavorText}</div>
        </div>
      </div>
    </div>
  );
}
