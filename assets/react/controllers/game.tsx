import * as React from "react";
import GameMap from "../components/GameMap";
import { useEffect, useState } from "react";
import { tileGetter } from "../classes/tiles";

import {
  GameState,
  LocationTuple,
  MapInfo,
  Tile,
  TileName,
} from "../classes/enumsAndTypes";
import axios from "axios";

/**
 * @todo — IF THIS DOESN'T WORK, SIGN IN WITH USER "bbb".
 */
export default function (props: GameState): JSX.Element {
  const [currentMap, setCurrentScreen] = useState<Tile<TileName>[][]>([]);
  const [currentLocation, setCurrentLocation] = useState<LocationTuple>(
    props.state.location
  );

  function noiseToTile(noiseArray: MapInfo[][]): Tile<TileName>[][] {
    let newTileMap: Tile<TileName>[][] = Array.from({ length: 30 }, () =>
      Array.from({ length: 30 }, () => tileGetter.get(TileName.Grass, [0, 0]))
    );
    noiseArray.forEach((i: MapInfo[], index: number) => {
      i.map((j: MapInfo, jndex: number) => {
        switch (true) {
          case j.noiseValue >= 0.6:
            newTileMap[index][jndex] = tileGetter.get(TileName.Wall, [
              j.location.y,
              j.location.x,
            ]);
            break;
          case j.noiseValue >= 0.25:
            newTileMap[index][jndex] = tileGetter.get(TileName.Mountain, [
              j.location.y,
              j.location.x,
            ]);
            break;
          case j.noiseValue >= 0.2:
            newTileMap[index][jndex] = tileGetter.get(TileName.Slope, [
              j.location.y,
              j.location.x,
            ]);
            break;
          case j.noiseValue >= 0:
            newTileMap[index][jndex] = tileGetter.get(TileName.Grass, [
              j.location.y,
              j.location.x,
            ]);
            break;
          case j.noiseValue >= -0.25:
            newTileMap[index][jndex] = tileGetter.get(TileName.Shore, [
              j.location.y,
              j.location.x,
            ]);
            break;
          case j.noiseValue >= -0.6:
            newTileMap[index][jndex] = tileGetter.get(TileName.Water, [
              j.location.y,
              j.location.x,
            ]);
            break;
          default:
            newTileMap[index][jndex] = tileGetter.get(TileName.DeepWater, [
              j.location.y,
              j.location.x,
            ]);
            break;
        }
      });
    });
    return newTileMap;
  }

  useEffect(() => {
    grabFirstScreen(props.state.screen);
  }, []);

  function grabNewScreen(location: LocationTuple, direction: string) {
    axios
      .post("http://127.0.0.1:8000/game/api/" + props.state.name, {
        location: location,
        leftFrom: direction,
      })
      .then((res) => {
        let tileMap = noiseToTile(res.data);
        setCurrentScreen(tileMap);
        setCurrentLocation(location);
      });
  }

  function grabFirstScreen(screen: number) {
    axios
      .post("http://127.0.0.1:8000/game/api/" + props.state.name, {
        screen: screen,
      })
      .then((res) => {
        console.log(res.data);
        console.log(currentLocation);
        let tileMap = noiseToTile(res.data);
        setCurrentScreen(tileMap);
      });
  }

  return (
    <>
      <GameMap
        map={currentMap}
        location={currentLocation}
        grabNewScreen={grabNewScreen}
        topLeft={0/*currentMap[0][0].properties.location[1]*/}
        bottomRight={1000/*
          currentMap[currentMap.length - 1][currentMap[0].length - 1].properties
            .location[0]
  */}
      />
    </>
  );
}
