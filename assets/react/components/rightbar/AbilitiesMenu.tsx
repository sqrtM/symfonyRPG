import * as React from "react";

interface AbilitiesMenuProps {
  setAbility: Function
}

export default function (props: AbilitiesMenuProps): JSX.Element {

  function handleAbilitySelection(ability: string) {
    props.setAbility(ability)
    console.log("ability selected")
  }

  return (
    <div>
      <span className="abilities-menu" onClick={() => handleAbilitySelection("dig")}>dig</span>
    </div>
  );
}

