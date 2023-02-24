import * as React from 'react'
import { useEffect, useState } from 'react'

export interface IGameState {
  state: {
    map: number[][]
    name: string
    health: number
    location: [number, number]
  }
}

export default function (props: IGameState): JSX.Element {
  const [location, setLocation] = useState<[number, number]>(
    props.state.location,
  )

  const keyListener = (e: KeyboardEvent) => {
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

  return (
    <div>
      {props.state.map.map((i: number[], index: number) => {
        return (
          <div key={Math.random() + i[index]}>
            {i.map((_j: number, jndex: number) => {
              let color = Math.abs(i[jndex] * 360)
              return (
                <span
                  style={
                    index === location[0] && jndex === location[1]
                      ? { color: 'white' } // @
                      : { color: `hsl(${color}, 100%, 50%)` } // #
                  }
                  key={color + Math.random()}
                >
                  {index === location[0] && jndex === location[1] ? '@' : '#'}
                </span>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
