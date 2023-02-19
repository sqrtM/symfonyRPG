import * as React from 'react';

export interface IHelloProps {
}

export default function (): JSX.Element {
  
  function handleClick() {
    confirm('beginning adventure');

  }

  return (
    <div>
      <a href={window.location.href + 'game'}><input type='button' value='create world' onClick={handleClick}/></a>
    </div>
  );
}
