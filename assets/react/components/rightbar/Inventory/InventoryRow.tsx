import * as React from "react";
import InventoryMember from "./InventoryMember";
import { InventoryItem, emptyItem } from "../../../classes/enumsAndTypes";

interface InventoryRowProps {
  itemArray: InventoryItem[];
  itemHover: Function
}

export default function (props: InventoryRowProps): JSX.Element {
  let arr = props.itemArray;
  while (arr.length < 7) {
    arr.push(emptyItem)
  }
  return (
    <div>
      {arr.map((i: InventoryItem) => {
        return <InventoryMember item={i} itemHover={props.itemHover}/>;
      })}
    </div>
  );
}
