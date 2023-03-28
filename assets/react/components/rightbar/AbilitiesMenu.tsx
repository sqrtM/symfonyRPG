import * as React from "react";

interface AbilitiesMenuProps {

}

export default function (props: AbilitiesMenuProps): JSX.Element {
  function handleAbilitySelection(ability: string) {
    
  }
  return (
    <div>
      <span className="abilities-menu" onClick={() => handleAbilitySelection("dig")}>dig</span>
    </div>
  );
}

