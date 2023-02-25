import * as React from 'react'
import { useEffect, useState } from 'react'
import { LocationTuple, Tile, TileName } from '../classes/enumsAndTypes'
import TileSpan from './TileSpan'

export type MapState = {
  map: Tile<TileName>[][]
  location: LocationTuple
}

export default function (props: MapState): JSX.Element {
  const [location, setLocation] = useState<LocationTuple>(props.location)

  const keyListener = (e: KeyboardEvent): void => {
    // for some reason, writing a unary "--" creates a very different
    // interaction than "-= 1". Weird.
    switch (e.key) {
      case 'ArrowUp':
        setLocation([(location[0] -= 1), location[1]])
        console.log(location)
        break
      case 'ArrowDown':
        setLocation([(location[0] += 1), location[1]])
        console.log(location)
        break
      case 'ArrowRight':
        setLocation([location[0], (location[1] += 1)])
        console.log(location)
        break
      case 'ArrowLeft':
        setLocation([location[0], (location[1] -= 1)])
        console.log(location)
        break
      default:
        break
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', keyListener)
    return () => {
      window.removeEventListener('keydown', keyListener)
    }
  }, [])

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
                    location[0] === yCoord && location[1] === xCoord
                  }
                  tile={tile}

                  key={`key-${xCoord}-tileggg`}
                />
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
