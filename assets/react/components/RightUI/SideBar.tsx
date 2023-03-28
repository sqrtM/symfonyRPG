import * as React from "react";
import { LocationTuple, Tile, TileName } from "../../classes/enumsAndTypes";
import SelectedTileDisplay from "./SelectedTileDisplay";
import StatusView from "./StatusView";

export type SideBarProps = {
  state: {
    name: string;
    status: any;
    location: LocationTuple;
    screen: number;
  };
  selectedTile: Tile<TileName> | null;
};

export default function (props: SideBarProps): JSX.Element {
  return (
    <div>
      {props.selectedTile ? (
        <SelectedTileDisplay selectedTile={props.selectedTile} />
      ) : (
        <StatusView state={props.state} />
      )}
    </div>
  );
}
