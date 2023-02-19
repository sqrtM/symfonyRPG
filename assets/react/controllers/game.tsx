import * as React from 'react';

export interface IHelloProps {
    state: any
}

export default function (props: IHelloProps): JSX.Element {

  return (
    <div>
      {props.state["name"]} {props.state["health"]} {props.state["location"]} {props.state["status"]}
    </div>
  );
}
