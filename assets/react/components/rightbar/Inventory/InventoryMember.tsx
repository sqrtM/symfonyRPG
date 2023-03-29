import * as React from "react";
import { InventoryItem } from "../../../classes/enumsAndTypes";

interface InventoryItemMemberProps {
  item: InventoryItem;
  itemHover: Function
  rowNumber: number
  columnNumber: number
}

export default function (props: InventoryItemMemberProps): JSX.Element {
  const handleHover = (item: InventoryItem | null) => {
    props.itemHover(item);
  };
  return (
    <span
      className="inventory-item"
      onMouseOver={() => handleHover(props.item)}
      onMouseLeave={() => handleHover(null)}
      key={"inventoryItem" + props.rowNumber + "-" + props.columnNumber}
    >
      {props.item.char}
    </span>
  );
}
