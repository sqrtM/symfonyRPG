import * as React from "react";
import GameMap from "../components/map/GameMap";
import { useEffect, useState } from "react";
import { interpretIncomingTiles } from "../classes/tiles";

import {
  GameState,
  IncomingScreen,
  LocationTuple,
  MapInfo,
  ParsedScreen,
  Tile,
  TileName,
} from "../classes/enumsAndTypes";
import axios from "axios";
import SideBar from "../components/rightbar/SideBar";

export default function (props: GameState): JSX.Element {
  const [currentScreen, setCurrentScreen] = useState<Tile<TileName>[][]>([]);
  const [cachedScreens, setCachedScreens] = useState<
    { id: number; screen: MapInfo[][] }[]
  >([]);
  const [currentLocation, setCurrentLocation] = useState<LocationTuple>(
    props.state.location
  );
  const [selectedTile, setSelectedTile] = useState<Tile<TileName> | null>(null);
  const [screenIndexState, setScreenIndexState] = useState<number>(
    props.state.screen
  );
  const [oldScreenIndexState, setOldScreenIndexState] = useState<number>(-1);

  useEffect(() => {
    console.log(cachedScreens);
    let matchingScreen = cachedScreens.find(
      (i: { id: number; screen: MapInfo[][] }) => i.id === screenIndexState
    );
    if (matchingScreen != undefined) {
      console.log("this should now redraw");
      setCurrentScreen(interpretIncomingTiles(matchingScreen.screen));
      updateCachedScreensWithoutChangingScreen(screenIndexState);
    } else {
      updateCachedScreensAndChangeScreen(screenIndexState);
    }
  }, [screenIndexState]);

  function updateLocation(location: LocationTuple) {
    if (screenIndexState !== oldScreenIndexState)
      setOldScreenIndexState(screenIndexState);
    const screenIndex = +(
      Math.floor(location[0] / 30).toString() +
      Math.floor(location[1] / 30).toString()
    );
    setScreenIndexState(screenIndex);
    setCurrentLocation(location);
  }

  function updateCachedScreensWithoutChangingScreen(screenIndex: number) {
    axios
      .post("http://127.0.0.1:8000/game/api/" + props.state.name, {
        screen: screenIndex,
      })
      .then((res) => {
        console.log(res.data)
        let parsedData: ParsedScreen[] = res.data.map((i: IncomingScreen) => {
          if (i === undefined) return undefined;
          return i.screen[0].screen != undefined
            ? { id: i.id, screen: JSON.parse(i.screen[0].screen) }
            : undefined;
        });
        console.log(parsedData);
        setCachedScreens(parsedData);
        // save the screen we just left
        console.log(oldScreenIndexState, screenIndex, cachedScreens[4])
        axios
          .post("http://127.0.0.1:8000/game/saveMap/" + props.state.name, {
            screenIndex: oldScreenIndexState,
            screen: cachedScreens[4].screen,
          })
          .then((res) => {
            console.log(res.data);
          });
      });
  }

  function updateCachedScreensAndChangeScreen(screenIndex: number) {
    console.log("screen not found. searching....");
    axios
      .post("http://127.0.0.1:8000/game/api/" + props.state.name, {
        screen: screenIndex,
      })
      .then((res) => {
        console.log(res.data);
        let parsedData: ParsedScreen[] = res.data.map((i: IncomingScreen) => {
          return i.screen[0].screen != undefined
            ? { id: i.id, screen: JSON.parse(i.screen[0].screen) }
            : { id: i.id, screen: 0 };
        });
        let matchingScreen: ParsedScreen | undefined = parsedData.find(
          (i: ParsedScreen) => i.id === props.state.screen
        );
        if (matchingScreen === undefined) {
          //if we STILL cant find it...
          throw "error";
        }
        // set the current screen
        setCurrentScreen(interpretIncomingTiles(matchingScreen.screen));
        setCachedScreens(parsedData);
        console.log(parsedData);
      });
  }

  function mapHover(tile: Tile<TileName>) {
    setSelectedTile(tile);
  }

  function saveGame() {
    console.log(
      props.state.name,
      props.state.status,
      currentLocation,
      screenIndexState
    );
    axios
      .post("http://127.0.0.1:8000/game/save/" + props.state.name, {
        state: {
          name: props.state.name,
          status: props.state.status,
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
        grabNewScreen={updateLocation}
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
