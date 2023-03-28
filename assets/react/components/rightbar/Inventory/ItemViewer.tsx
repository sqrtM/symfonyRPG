import * as React from "react";
import { InventoryItem } from "../../../classes/enumsAndTypes";

interface InventoryViewerProps {
  item: InventoryItem;
}

export default function (props: InventoryViewerProps): JSX.Element {
  return (
    <div>
        <div>{props.item.char} {props.item.name}</div>
        <div>{props.item.description}</div>
    </div>
  );
}