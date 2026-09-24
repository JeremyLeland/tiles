export function create( cols, rows, defaultValue = 0 ) {
  return {
    cols: cols,
    rows: rows,
    data: Array( cols * rows ).fill( defaultValue ),
  }
}


export function setTerrain( map, col, row, value ) {
  col = Math.floor( col );
  row = Math.floor( row );

  if ( 0 <= col && col < map.cols && 0 <= row && row < map.rows ) {
    const mapIndex = col + row * map.cols;
    map.data[ mapIndex ] = value;
  }
}

export function setTerrainCircle( map, x, y, radius, value ) {
  for ( let row = y - radius; row < y + radius; row ++ ) {
    for ( let col = x - radius; col < x + radius; col ++ ) {
      if ( Math.hypot( col - x, row - y ) < radius ) {
        setTerrain( map, col, row, value );
      }
    }
  }
}

export function setTerrainRect( map, x, y, width, height, value ) {
  for ( let row = y; row < y + height; row ++ ) {
    for ( let col = x; col < x + width; col ++ ) {
      setTerrain( map, col, row, value );
    }
  }
}

export function makeMaskTransparent( ctx, map, maskValue ) {
  const imageData = ctx.getImageData( 0, 0, map.cols, map.rows );
  const data = imageData.data;
  
  // Leave image alone, just toggle transparency
  map.data.forEach( ( value, index ) => {
    data[ 4 * index + 3 ] = value === maskValue ? 0 : 255;
  } );

  ctx.putImageData( imageData, 0, 0 );
}