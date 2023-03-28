import * as React from "react";
import InventoryRow from "./InventoryRow";
import { InventoryItem } from "../../../classes/enumsAndTypes";
import ItemViewer from "./ItemViewer";

interface InventoryProps {
  inventory: InventoryItem[][];
}

export default function (props: InventoryProps): JSX.Element {
  const [selectedItem, setSelectedItem] = React.useState<InventoryItem | null>(
    null
  );

  function itemHover(item: InventoryItem) {
    setSelectedItem(item);
  }

  return (
    <div>
      <div>
        {props.inventory.map((i: InventoryItem[]) => {
          return <InventoryRow itemArray={i} itemHover={itemHover} />;
        })}
      </div>
      <div>{selectedItem && <ItemViewer item={selectedItem} />}</div>
    </div>
  );
}
