  /**
   * this, for some reason, moves the screen by two units when it needs to scroll.
   * No clue why.
   */
  /*
  let viewport = (
    screenHeight: number,
    screenWidth: number,
  ): Tile<TileName>[][] => {
    let yRange = Math.floor(screenWidth / 2)
    let xRange = Math.floor(screenHeight / 2)
    let leftSideOverflow = 0
    if (location[1] < xRange) {
      xRange = location[1]
      leftSideOverflow = screenHeight - (location[1] + xRange)
    }

    let visibleMap: Tile<TileName>[][] = []
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

  const view = viewport(25, 25)
  */