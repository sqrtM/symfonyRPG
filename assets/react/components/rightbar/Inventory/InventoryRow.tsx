import * as React from "react";
import InventoryMember from "./InventoryMember";
import { InventoryItem, emptyItem } from "../../../classes/enumsAndTypes";

interface InventoryRowProps {
  itemArray: InventoryItem[];
  itemHover: Function;
  rowNumber: number;
}

export default function (props: InventoryRowProps): JSX.Element {
  let arr = props.itemArray;
  while (arr.length < 7) {
    arr.push(emptyItem);
  }
  return (
    <div key={"inventoryRow-" + props.rowNumber}>
      {arr.map((i: InventoryItem, index: number) => {
        return (
          <InventoryMember
            item={i}
            itemHover={props.itemHover}
            columnNumber={index}
            rowNumber={props.rowNumber}
          />
        );
      })}
    </div>
  );
}
