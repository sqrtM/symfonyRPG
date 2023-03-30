import * as React from "react";
import GameMap from "../components/map/GameMap";
import { useEffect, useState } from "react";
import tileGetter, { interpretIncomingTiles } from "../classes/tiles";

import {
  GameState,
  IncomingScreen,
  LocationTuple,
  MapInfo,
  ParsedScreen,
  Tile,
  TileName,
} from "../classes/enumsAndTypes";
//import { dig } from "../classes/abilities";
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
  const [selectedAbility, setSelectedAbility] = useState<string | null>(null); // this will later come from an ability enum

  useEffect(() => {
    console.log(cachedScreens);
    let matchingScreen = cachedScreens.find(
      (i: { id: number; screen: MapInfo[][] }) => i.id === screenIndexState
    );
    if (matchingScreen != undefined) {
      console.log("this should now redraw");
      setCurrentScreen(interpretIncomingTiles(matchingScreen.screen));
      updateCachedScreensWithoutChangingScreen(screenIndexState);
      console.log(
        "should this update?" + screenIndexState,
        oldScreenIndexState
      );
      if (screenIndexState !== oldScreenIndexState)
        setOldScreenIndexState(screenIndexState);
    } else {
      updateCachedScreensAndChangeScreen(screenIndexState);
    }
  }, [screenIndexState]);

  function updateLocation(location: LocationTuple) {
    const screenIndex = +(
      Math.floor(location[0] / 30).toString() +
      Math.floor(location[1] / 30).toString()
    );
    setScreenIndexState(screenIndex);
    setCurrentLocation(location);
  }

  function saveMapScreen() {
    // save the screen we just left
    console.log(oldScreenIndexState);
    axios
      .post("http://127.0.0.1:8000/game/saveMap/" + props.state.name, {
        screenIndex: oldScreenIndexState,
        screen: cachedScreens[4].screen,
      })
      .then((res) => {
        console.log(res.data);
      });
  }

  /**
   * @todo THE SAVING OF THE MAP DOESNT WORK FOR TILES WHICH WERE
   * MODIFIED BY THE PLAYER. I AM NOT SURE WHY.
   * Tiles are modified, then the cache is modified, then the
   * cache is sent to the DB.
   *
   * POSSIBLE SOLUTION:
   * Extract the "save map" thing to it's own function and have
   * it take the screen you want to save as an argument.
   * The reason this may work is because I believe the reason
   * it's not working is because of React's weird async
   * state issues.
   */
  function updateCachedScreensWithoutChangingScreen(screenIndex: number) {
    console.log("about to save screen");
    saveMapScreen();
    axios
      .post("http://127.0.0.1:8000/game/api/" + props.state.name, {
        screen: screenIndex,
      })
      .then((res) => {
        console.log(res.data);
        let parsedData: ParsedScreen[] = res.data.map((i: IncomingScreen) => {
          if (i === undefined) return undefined;
          return i.screen[0].screen != undefined
            ? { id: i.id, screen: JSON.parse(i.screen[0].screen) }
            : undefined;
        });
        console.log(parsedData);
        setCachedScreens(parsedData);
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

  function tileClicked(tile: Tile<TileName>) {
    if (selectedAbility === "dig") {
      let loc = findTileInCachedScreens(
        cachedScreens[4].id,
        tile.properties.location
      );
      let newCache = cachedScreens;
      newCache[4].screen[loc[0]][loc[1]].tileName = TileName.Example;
      setCachedScreens(newCache);
      currentScreen[loc[0]][loc[1]] = tileGetter.get(
        TileName.Example,
        tile.properties.location
      );
      console.log(loc);
    } else {
      console.log(tile + " was clicked. not dug.");
    }
  }

  function findTileInCachedScreens(
    id: number,
    location: LocationTuple
  ): LocationTuple {
    /*
    let firstRow = +id.toString()[0] * 30;
    let tileRow = location[0] - firstRow;
    let firstCol = +id.toString()[1] * 30;
    let tileCol = location[1] - firstCol;
    return [tileRow, tileCol];
    */
    return [
      location[0] - +id.toString()[0] * 30,
      location[1] - +id.toString()[1] * 30,
    ];
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
        tileClicked={tileClicked}
      />
      <SideBar
        state={props.state}
        selectedTile={selectedTile}
        setAbility={setSelectedAbility}
      />
      <input
        type="button"
        value="save game"
        onClick={saveGame}
        style={{ alignSelf: "flex-start" }}
      />
    </div>
  );
}
