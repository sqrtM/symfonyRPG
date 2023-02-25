import * as React from 'react'
import { useEffect, useState } from 'react'
import { LocationTuple } from '../controllers/game'

export type MapState = {
  map: number[][]
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

  /**
   * this, for some reason, moves the screen by two units when it needs to scroll.
   * No clue why. 
   */
  let viewport = (screenHeight: number, screenWidth: number): number[][] => {
    let yRange = Math.floor(screenWidth / 2)
    let xRange = Math.floor(screenHeight / 2)
    let leftSideOverflow = 0
    if (location[1] < xRange) {
      xRange = location[1]
      leftSideOverflow = screenHeight - (location[1] + xRange)
    }

    let visibleMap: number[][] = []
    for (let row = location[0] - yRange; row < location[0] + yRange; row++) {
      if (row <= 0) {
        row = 0
      } else if (row > props.map.length - 1) {
        row = props.map.length - 1
      }
      visibleMap.push(
        props.map[row].slice(
          location[1] - xRange,
          location[1] + xRange + leftSideOverflow,
        ),
      )
    }
    return visibleMap
  }

  return (
    <div>
      {viewport(50, 25).map((row: number[], yCoord: number) => {
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
