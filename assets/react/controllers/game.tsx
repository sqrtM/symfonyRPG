import * as React from 'react'

export interface IHelloProps {
  state: any
}

export default function (props: IHelloProps): JSX.Element {


  return (
    <div>
      {props.state['map'].map((i: any, index: any) => {
        return (
          <div key={Math.random() + i[index]}>
            {i.map((_j: any, index: any) => {
              let color  = Math.abs(i[index] * 360)
              return <span style={{color: `hsl(${color}, 100%, 50%)`}} key={color + Math.random()}>#</span>
            })}
          </div>
        )
      })}
    </div>
  )
}
