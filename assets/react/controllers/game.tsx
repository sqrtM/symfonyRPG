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

export default function (props: GameState): JSX.Element {
  const [currentScreen, setCurrentScreen] = useState<Tile<TileName>[][]>([]);
  const [cachedScreens, setCachedScreens] = useState<{ id: number; screen: MapInfo[][]; }[]>([]);
  const [currentLocation, setCurrentLocation] = useState<LocationTuple>(
    props.state.location
  );
  const [selectedTile, setSelectedTile] = useState<Tile<TileName> | null>(null);
  const [screenIndexState, setScreenIndexState] = useState<number>(0);

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
    let matchingScreen = cachedScreens.find((i: {id: number, screen: MapInfo[][]}) => i.id === screenIndexState);
    if (matchingScreen != undefined) {
      console.log("this should now redraw")
      setCurrentScreen(noiseToTile(matchingScreen.screen))
    }
  }, [screenIndexState]);

  useEffect(() => {
    console.log("this one")
    grabNewScreen(currentLocation);
  }, []);

/*
  function grabNewScreen(location: LocationTuple) {
    const screenIndex = +(
      Math.floor(location[0] / 30).toString() +
      Math.floor(location[1] / 30).toString()
    );
    setCurrentLocation(location);
    axios
      .post("http://127.0.0.1:8000/game/api/" + props.state.name, {
        screen: screenIndex,
      })
      .then((res) => {
        let jsonData = JSON.parse(res.data);
        let tileMap = noiseToTile(jsonData);
        setCurrentScreen(tileMap);
        setScreenIndexState(screenIndex);
      });
  }
*/

function grabNewScreen(location: LocationTuple) {
  console.log(cachedScreens)
  const screenIndex = +(
    Math.floor(location[0] / 30).toString() +
    Math.floor(location[1] / 30).toString()
  );
  setScreenIndexState(screenIndex)
  setCurrentLocation(location)
  axios
    .post("http://127.0.0.1:8000/game/api/" + props.state.name, {
      screen: screenIndex,
    })
    .then((res) => {
      let parsedData: {id: number, screen: MapInfo[][]}[] = res.data.map((i: {id: number, screen: {screen: string}[]}) => {
        return { id: i.id, screen: JSON.parse(i.screen[0].screen) };
      })
      let matchingScreen = parsedData.find((i: {id: number, screen: MapInfo[][]}) => i.id === props.state.screen)
      if (matchingScreen === undefined) { //if we STILL cant find it...
        throw("error")
      }
      setCurrentScreen(noiseToTile(matchingScreen.screen))
      setCachedScreens(parsedData);
    });
}

  function mapHover(tile: Tile<TileName>) {
    setSelectedTile(tile);
  }

  function saveGame() {
    console.log(
      props.state.name,
      100,
      currentLocation,
      screenIndexState,
    )
    axios
      .post("http://127.0.0.1:8000/game/save/" + props.state.name, {
        state: {
          name: props.state.name,
          health: 100,
          location: currentLocation,
          screen: screenIndexState,
        },
      })
      .then((res) => {
        console.log(res.data);
      });
  }

  return (
    <div id="game-container">
      <GameMap
        map={currentScreen}
        location={currentLocation}
        grabNewScreen={grabNewScreen}
        mapHover={mapHover}
      />
      <SideBar state={props.state} selectedTile={selectedTile} />
      <input
        type="button"
        value="save game"
        onClick={saveGame}
        style={{ alignSelf: "flex-start" }}
      />
    </div>
  );
}
