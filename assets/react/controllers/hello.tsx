import * as React from 'react'
import { useState } from 'react';


/**
 * GAME DESIGN DOCS.
 * 
 * I see this as something like an RPG board game.
 * Every "day", you get — say — 100 action points. These
 * points are spent by moving around the map (difficult
 * terrain costs more than easy terrain) or interacting with
 * people/creatures. 
 * 
 * The player has the option to continue moving around at night or
 * to sleep. However, they will have very little visibility, lose SANITY,
 * and encounter stronger monsters.
 * 
 * Combat will be turned based in the bottom right hand corner.
 * You interact with another entity and then a little "window" pops
 * up in the bottom right showing yourself and your enemy along with
 * health and an estimated level (a la DCSS). Every turn in combat
 * will last one action point.
 * 
 * Your goal is to find an exit? Or maybe a treasure. However, monsters
 * will scale very quickly each day, so if you aren't either constantly 
 * training or going very fast, you will be out-paced by them. You need
 * to choose your moves wisely. 
 * 
 * Stealth will be an option, but it will come at a cost. Sneaking past 
 * enemies is obviously much faster, but provides you with no benefit or
 * experience. Along the bottom of the screen will be a description of the
 * environment as well as a list of actions you can take at that particular
 * moment.
 * 
 * I would like the following UI:
 * HEALTH
 * MANA (split into ALPHA(&), BETA($), and GAMMA(+) )
 * HUNGER
 * SANITY (which will flip to INSANITY after it reaches 0)
 * RAGE
 * Different traits will cause different effects. In my mind, I see each
 * one as being a balancing act of sorts, with the exception of HEALTH.
 * — If any one MANA type is too high, it becomes unstable. If it is too
 * low, it is unusable. 
 * — If HUNGER is at 100, you will take damage to your HEALTH and SANITY.
 * If it is too low, however, you will move slower.
 * — If RAGE is at 100, you will do much, much more damage, but be unable to
 * speak to NPCs. 
 * — SANITY is my favorite hypothetical factor. I envision it as being a scale of
 * -100 to 100, with 0 being the worst. SANITY trickles down the longer you play,
 * the more you kill, the more you get hurt, etc. Most actions will require SANITY,
 * especially magic. However, higher INSANITY should also bring benefits. Maybe special
 * magic which can only be cast when insane? Different NPC interactions? Whatever it is, 
 * it should be very powerful, but come at incredible cost.
 * 
 * NPCs may be around the map to give hints in exchange for other things. 
 * Their dialogue will also happen in the bottom right corner.
 * 
 * 
 * INFO ON MANA TYPES:
 * ALPHA is for the more traditional "arcane", world of warcraft style magics.
 * at low levels, it is D&D magic missile-style stuff, but at higher levels and 
 * lower sanities, allows for more horrifying elemental attacks.
 * 
 * BETA should be, I think, related to etrian oddysey style binds. It affects the bodies
 * of enemies directly and prevents movement or can force certain kinds of movement. Maybe
 * it can also be for healing (bc related to body)
 * 
 * GAMMA  ??????
 * traveral magic? stealth? battle magic? 
 */
export default function (): JSX.Element {
  function handleClick() {
    confirm('beginning adventure. if youre making a new character this will take a few seconds...')
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
