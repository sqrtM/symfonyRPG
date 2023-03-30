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
  // this will later come from an ability enum
  const [selectedAbility, setSelectedAbility] = useState<string | null>(null);

  useEffect(() => {
    console.log(cachedScreens);
    let matchingScreen = cachedScreens.find(
      (i: { id: number; screen: MapInfo[][] }) => i.id === screenIndexState
    );
    if (matchingScreen != undefined) {
      setCurrentScreen(interpretIncomingTiles(matchingScreen.screen));
      updateCachedScreens(screenIndexState);
      if (screenIndexState !== oldScreenIndexState)
        setOldScreenIndexState(screenIndexState);
    } else {
      initializeMap(screenIndexState);
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

  function saveMapScreen(index: number) {
    axios
      .post("http://127.0.0.1:8000/game/saveMap/" + props.state.name, {
        screenIndex: index,
        screen: cachedScreens[4].screen,
      })
      .then((res) => {
        console.log(res.data === "success" ? "map saved" : res.data);
      });
  }

  function updateCachedScreens(screenIndex: number) {
    saveMapScreen(oldScreenIndexState);
    axios
      .post<IncomingScreen[]>(
        "http://127.0.0.1:8000/game/api/" + props.state.name,
        {
          screen: screenIndex,
        }
      )
      .then((res) => {
        setCachedScreens(parseData(res.data));
      });
  }

  /**
   * if this is called MORE THAN ONCE per session, something has happened.
   * usually the player was moving faster than we could find the screen.
   * @param screenIndex
   */
  function initializeMap(screenIndex: number) {
    console.log("screen not found. searching....");
    axios
      .post<IncomingScreen[]>(
        "http://127.0.0.1:8000/game/api/" + props.state.name,
        {
          screen: screenIndex,
        }
      )
      .then((res) => {
        let parsedData: ParsedScreen[] = parseData(res.data);
        let matchingScreen: ParsedScreen | undefined = parsedData.find(
          (i: ParsedScreen) => i.id === props.state.screen
        );
        if (matchingScreen === undefined) {
          throw "screen wasn't found, but SHOULD have been found...";
        }
        setCurrentScreen(interpretIncomingTiles(matchingScreen.screen));
        setCachedScreens(parsedData);
      });
  }

  function parseData(arr: IncomingScreen[]): ParsedScreen[] {
    let parsedData: { id: number; screen: MapInfo[][] }[] = [];
    arr.forEach((i: IncomingScreen) => {
      i.screen[0].screen != undefined
        ? parsedData.push({ id: i.id, screen: JSON.parse(i.screen[0].screen) })
        : parsedData.push({
            id: -1,
            screen: undefined as unknown as MapInfo[][],
          }); // oob
    });
    return parsedData;
  }

  function mapHover(tile: Tile<TileName>) {
    setSelectedTile(tile);
  }

  function tileClicked(tile: Tile<TileName>) {
    let currentCachedScreen = cachedScreens[4];
    if (selectedAbility === "dig") {
      let loc = findTileInCachedScreens(
        currentCachedScreen.id,
        tile.properties.location
      );
      let newCache = cachedScreens;
      let newCurrentCachedScreen = newCache[4];
      newCurrentCachedScreen.screen[loc[0]][loc[1]].tileName = TileName.Example;
      setCachedScreens(newCache);
      currentScreen[loc[0]][loc[1]] = tileGetter.get(
        TileName.Example,
        tile.properties.location
      );
    } else {
      console.log(tile + " was clicked.");
    }
  }

  /**
   * @param id id of the screen within the cached screens
   * @param location what is the exact y, x location of the tile WITHIN the screen
   * @returns where the tile is
   */
  function findTileInCachedScreens(
    id: number,
    location: LocationTuple
  ): LocationTuple {
    return [
      location[0] - +id.toString()[0] * 30,
      location[1] - +id.toString()[1] * 30,
    ];
  }

  function saveGame() {
    saveMapScreen(screenIndexState);
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
        console.log(res.data === "success" ? "game saved" : res.data);
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
