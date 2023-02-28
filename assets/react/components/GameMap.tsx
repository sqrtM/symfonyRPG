import * as React from "react";
import { useEffect, useState } from "react";
import { LocationTuple, Tile, TileName } from "../classes/enumsAndTypes";
import TileSpan from "./TileSpan";

export type MapState = {
  map: Tile<TileName>[][];
  location: LocationTuple;
  grabNewScreen: Function;
};

export default function (props: MapState): JSX.Element {
  /**
   * perhaps this shouldn't be a "state" thing until we switch scenes.
   * it's causing re-renders. 
   */
  const [location, setLocation] = useState<LocationTuple>(props.location);


  const keyListener = (e: KeyboardEvent): void => {
    // for some reason, writing a unary "--" creates a very different
    // interaction than "-= 1". Weird.

    //RIGHT AND UP DO NOT WORK ACROSS SCREENS ???? 
    //FIX THE LAMBDAS IM CERTAIN THATS THE PROBLEM... 
    switch (e.key) {
      case "ArrowUp":
        setLocation([(location[0] -= 1), location[1]])
        location[0] > Math.floor(location[1] / 30) * 30// topleft
          ? console.log(Math.floor(location[1] / 30) * 30, location)
          : props.grabNewScreen(location);
        break;
      case "ArrowDown":
        setLocation([(location[0] += 1), location[1]])
        location[0] < (Math.ceil(location[0] / 30) * 30) - 1 // bottom right
          ? console.log((Math.ceil(location[0] / 30) * 30) - 1, location)
          : props.grabNewScreen(location);
        break;
      case "ArrowRight":
        setLocation([location[0], (location[1] += 1)])
        location[1] < (Math.ceil(location[0] / 30) * 30) - 1 // bottom right
          ? console.log((Math.ceil(location[0] / 30) * 30) - 1, location)
          : props.grabNewScreen(location);
        break;
      case "ArrowLeft":
        setLocation([location[0], (location[1] -= 1)])
        location[1] > Math.floor(location[1] / 30) * 30 // top left
          ? console.log(Math.floor(location[1] / 30) * 30, location)
          : props.grabNewScreen(location,);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", keyListener);
    return () => {
      window.removeEventListener("keydown", keyListener);
    };
  }, []);

  /**
   * for future reference, do NOT ever generate keys in a completely random manner
   * (i.e., with Math.random()). This makes it impossible for React to decide
   * which elements need to be rerendered, so it decides that everything should
   * rerender on every frame, when that's obviously not necessary
   */
  return (
    <div>
      {props.map.map((row: Tile<TileName>[], yCoord: number) => {
        return (
          <div key={`key-${yCoord}-row`}>
            {row.map((tile: Tile<TileName>, xCoord: number) => {
              return (
                <TileSpan
                  tileKey={`key-${xCoord}-tile`}
                  isPlayerHere={
                    location[0] === tile.properties.location[0] &&
                    location[1] === tile.properties.location[1]
                  }
                  tile={tile}
                  key={`key-${xCoord}-tileggg`}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
