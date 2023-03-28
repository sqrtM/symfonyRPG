import * as React from "react";
import { LocationTuple } from "../../classes/enumsAndTypes";

interface BarProps {
  state: {
    name: string;
    status: any;
    location: LocationTuple;
    screen: number;
  };
}

export default function (props: BarProps): JSX.Element {
  let healthArray: string[] = [];
  let manaAlphaArray: string[] = [];
  let manaBetaArray: string[] = [];
  let manaGammaArray: string[] = [];
  let hungerArray: string[] = [];
  let sanityArray: string[] = [];
  let rageArray: string[] = [];

  const percentHealth = Math.round((props.state.status.health / 100) * 100);
  const percentManaAlpha = Math.round(
    (props.state.status.mana.alpha / 20) * 100
  );
  const percentManaBeta = Math.round(
    (props.state.status.mana.beta / 20) * 100
  );
  const percentManaGamma = Math.round(
    (props.state.status.mana.gamma / 20) * 100
  );
  const percentHunger = Math.round((props.state.status.hunger / 100) * 100);
  const percentSanity = Math.round((props.state.status.sanity / 100) * 100);
  const percentRage = Math.round((props.state.status.rage / 100) * 100);

  const renderBar = (p: string[], bar: number) => {
    p = Array(20 - (20 - Math.round(bar / 5))).fill("=");
    if (p.length < 20) {
      if (bar % 5 !== 0) {
        p.push("-");
      }
      for (let i = 20 - (20 - p.length); i < 20; i++) {
        p.push(".");
      }
    }
    return p;
  };

  return (
      <div className="bars">
        <div
          id="healthBar"
          style={
            percentHealth === 100
              ? { color: "green" }
              : percentHealth >= 75
              ? { color: "limeGreen" }
              : percentHealth >= 50
              ? { color: "yellow" }
              : percentHealth >= 25
              ? { color: "orange" }
              : percentHealth >= 0
              ? { color: "red" }
              : { color: "white" }
          }
        >
          h{renderBar(healthArray, percentHealth)}
          <div
            id="alphaManaBar"
            style={
              percentManaAlpha === 100
                ? { color: "#0000CC" }
                : percentManaAlpha >= 75
                ? { color: "#0033CC" }
                : percentManaAlpha >= 50
                ? { color: "#0066CC" }
                : percentManaAlpha >= 25
                ? { color: "#0099CC" }
                : percentManaAlpha >= 0
                ? { color: "#00CCCC" }
                : { color: "#00FFCC" }
            }
          >
            &{renderBar(manaAlphaArray, percentManaAlpha)}
          </div>

          <div
            id="betaManaBar"
            style={
              percentManaBeta === 100
                ? { color: "#0000CC" }
                : percentManaBeta >= 75
                ? { color: "#0033CC" }
                : percentManaBeta >= 50
                ? { color: "#0066CC" }
                : percentManaBeta >= 25
                ? { color: "#0099CC" }
                : percentManaBeta >= 0
                ? { color: "#00CCCC" }
                : { color: "#00FFCC" }
            }
          >
            ${renderBar(manaBetaArray, percentManaBeta)}
          </div>

          <div
            id="gammaManaBar"
            style={
              percentManaGamma === 100
                ? { color: "#0000CC" }
                : percentManaGamma >= 75
                ? { color: "#0033CC" }
                : percentManaGamma >= 50
                ? { color: "#0066CC" }
                : percentManaGamma >= 25
                ? { color: "#0099CC" }
                : percentManaGamma >= 0
                ? { color: "#00CCCC" }
                : { color: "#00FFCC" }
            }
          >
            +{renderBar(manaGammaArray, percentManaGamma)}
          </div>

          <div
            id="rageBar"
            style={
              percentRage === 100
                ? { color: "#8B0000" }
                : percentRage >= 75
                ? { color: "#FF0000" }
                : percentRage >= 50
                ? { color: "#DC143C" }
                : percentRage >= 25
                ? { color: "#F08080" }
                : percentRage >= 0
                ? { color: "#E9967A" }
                : { color: "#FFA07A" }
            }
          >
            r{renderBar(rageArray, percentRage)}
          </div>
          <div
            id="sanityBar"
            style={
              percentSanity === 100
                ? { color: "#fefe22" }
                : percentSanity >= 75
                ? { color: "#ffe135" }
                : percentSanity >= 50
                ? { color: "#ffff66" }
                : percentSanity >= 25
                ? { color: "#fdfd96" }
                : percentSanity >= 0
                ? { color: "#fffacd" }
                : { color: "#f0e68c" }
            }
          >
            s{renderBar(sanityArray, percentSanity)}
          </div>
          <div
            id="hungerBar"
            style={
              percentHunger === 100
                ? { color: "#cc00cc" }
                : percentHunger >= 75
                ? { color: "#bd33a4" }
                : percentHunger >= 50
                ? { color: "#cf71af" }
                : percentHunger >= 25
                ? { color: "#f1a7fe" }
                : percentHunger >= 0
                ? { color: "#f4bbff" }
                : { color: "#f4f0ec" }
            }
          >
            f{renderBar(hungerArray, percentHunger)}
          </div>{" "}
        </div>
      </div>
  );
}
