import * as React from 'react'
import { useEffect, useState } from 'react'
import { LocationTuple } from '../controllers/game'

export type MapState = {
  map: number[][];
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
        break
      case 'ArrowDown':
        setLocation([(location[0] += 1), location[1]])
        break
      case 'ArrowRight':
        setLocation([location[0], (location[1] += 1)])
        break
      case 'ArrowLeft':
        setLocation([location[0], (location[1] -= 1)])
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

  let viewport = (screenHeight: number, screenWidth: number): number[][] => {
    let playerYCoord = location[0]
    let playerXCoord = location[1]
    let yRange = Math.floor(screenWidth / 2)
    let xRange = Math.floor(screenHeight / 2)
    let leftSideOverflow = 0
    if (playerXCoord < xRange) {
      xRange = playerXCoord
      leftSideOverflow = screenHeight - (playerXCoord + Math.floor(screenHeight / 2))
    }

    let arr: number[][] = []
    for (let i = playerYCoord - yRange; i < playerYCoord + yRange + 1; i++) {
      if (i <= 0) {
        i = 0
      } else if (i > props.map.length - 1) {
        i = props.map.length - 1
      }
      arr.push(
        props.map[i].slice(
          playerXCoord - xRange,
          playerXCoord + xRange + 1 + leftSideOverflow,
        ),
      )
    }
    console.log(playerXCoord, playerYCoord)
    return arr;
  }

  return (
    <div>
      {viewport(40, 20).map((row: number[], yCoord: number) => {
        return (
          <div key={Math.random() + row[yCoord]}>
            {row.map((_column: number, xCoord: number) => {
              let color = Math.abs(row[xCoord] * 360)
              return (
                <span
                  style={
                    yCoord === location[0] && xCoord === location[1]
                      ? { color: 'white' } // @
                      : { color: `hsl(${color}, 100%, 50%)` } // #
                  }
                  key={color + Math.random()}
                >
                  {yCoord === location[0] && xCoord === location[1] ? '@' : '#'}
                </span>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
