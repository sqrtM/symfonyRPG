import * as React from "react";
import { LocationTuple, exampleItem } from "../../classes/enumsAndTypes";
import Bars from "./Bars";
import Inventory from "./Inventory/Inventory";

interface StatusProps {
  state: {
    name: string;
    status: any;
    location: LocationTuple;
    screen: number;
    //inventory: InventoryItem[][]
  };
}

export default function (props: StatusProps): JSX.Element {
  const INVENTORY_EXAMPLE = [
    [exampleItem, exampleItem, exampleItem, exampleItem, exampleItem],
    [exampleItem, exampleItem],
    [exampleItem, exampleItem, exampleItem],
    [exampleItem],
  ];

  return (
    <div className="player-info">
      <div>{props.state.name} the unknown traveller</div>
      <Bars state={props.state} />
      <Inventory inventory={INVENTORY_EXAMPLE} />
    </div>
  );
}
