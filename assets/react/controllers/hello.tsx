import * as React from 'react'
import { useState } from 'react';

export default function (): JSX.Element {
  function handleClick() {
    confirm('beginning adventure')
  }

  const [name, setName] = useState("");

  function handleChange(event: { target: { value: React.SetStateAction<string>; }; }) {
    setName(event.target.value);
  }

  return (
    <div>
      enter a name. if the name exists, you will continue where you left off. if not, a new game will be created <br />
      <input type="input" value={name} onChange={handleChange}/>
      <div>
        <a href={window.location.href + 'game/' + name}>
          <input type="button" value="enter world" onClick={handleClick} />
        </a>
      </div>
    </div>
  )
}
