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
import SideBar from "../components/SideBar";

/**
 * @todo — IF THIS DOESN'T WORK, SIGN IN WITH USER "bbb".
 */
export default function (props: GameState): JSX.Element {
  const [currentMap, setCurrentScreen] = useState<Tile<TileName>[][]>([]);
  const [currentLocation, setCurrentLocation] = useState<LocationTuple>(
    props.state.location
  );
  const [tileSelect, setTileSelect] = useState<Tile<TileName> | null>(null)

  function noiseToTile(noiseArray: MapInfo[][]): Tile<TileName>[][] {
    let newTileMap: Tile<TileName>[][] = Array.from({ length: 30 }, () =>
      Array.from({ length: 30 }, () => tileGetter.get(TileName.Grass, [0, 0]))
    );
    noiseArray.forEach((i: MapInfo[], index: number) => {
      i.map((j: MapInfo, jndex: number) => {
        switch (true) {
          case j.noiseValue >= 0.75:
            newTileMap[index][jndex] = tileGetter.get(TileName.Wall, [
              j.location.y,
              j.location.x,
            ]);
            break;
          case j.noiseValue >= 0.4:
            newTileMap[index][jndex] = tileGetter.get(TileName.Mountain, [
              j.location.y,
              j.location.x,
            ]);
            break;
          case j.noiseValue >= 0.3:
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
    grabNewScreen(currentLocation);
  }, []);

  function grabNewScreen(location: LocationTuple) {
    const screenIndex = +(Math.floor(location[0] / 30).toString() + Math.floor(location[1] / 30).toString())
    setCurrentLocation(location)
    axios
      .post("http://127.0.0.1:8000/game/api/" + props.state.name, {
        screen: screenIndex,
      })
      .then((res) => {
        let tileMap = noiseToTile(res.data);
        setCurrentScreen(tileMap);
      });
  }

  function mapHover(tile: Tile<TileName>) {
    setTileSelect(tile)
  }

  return (
    <div id="game-container">
      <GameMap
        map={currentMap}
        location={currentLocation}
        grabNewScreen={grabNewScreen}
        mapHover={mapHover}
      />
      <SideBar 
        state={props.state}
        selectedTile={tileSelect}
      />
    </div>
  );
}
