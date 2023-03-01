import * as React from "react";
import { LocationTuple, Tile, TileName } from "../classes/enumsAndTypes";

export type SideBarProps = {
  state: {
    name: string;
    health: number;
    location: LocationTuple;
    screen: number;
  };
  selectedTile: Tile<TileName> | null;
};

export default function (props: SideBarProps): JSX.Element {
  return (
    <div>
      {props.selectedTile && (
        <div id="tileDisplayUI" style={{ fontSize: "xx-large" }}>
          {(
            <div id="contentsDisplayUI">
              <span
                className={props.selectedTile.visuals.style}
                style={{ fontSize: "xx-large" }}
              >
                {"{" + props.selectedTile.visuals.char + "}"}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
