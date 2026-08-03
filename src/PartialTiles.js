// Starting at zero radians and going counter-clockwise, so normals point away from fill
export const TilePoints = [
  [ 1, 0.5 ],
  [ 1, 0 ],
  [ 0.5, 0 ],
  [ 0, 0 ],
  [ 0, 0.5 ],
  [ 0, 1 ],
  [ 0.5, 1 ],
  [ 1, 1 ],
];

export const NumPoints = TilePoints.length;

export function getValue( startIndex, endIndex ) {

  // Wrap negative values here (for simpler calling)
  if ( startIndex < 0 ) {
    startIndex += 8;
  }
  if ( endIndex < 0 ) {
    endIndex += 8;
  }

  return ( startIndex << 3 ) | endIndex;
}

export function getStartIndex( value ) {
  return value >> 3;
}

export function getEndIndex( value ) {
  return value & 0b000111;
}

export function drawTile( ctx, startIndex, endIndex ) {

  // Special values:
  // 0b000000: empty
  // 0b111111: full

  // Empty
  if ( startIndex === 0 && endIndex === 0 ) {
    return;
  }

  // Full
  if ( startIndex === 7 && endIndex === 7 ) {
    ctx.fillRect( 0, 0, 1, 1 );
    return;
  }

  const length = endIndex - startIndex + ( endIndex < startIndex ? NumPoints : 0 );

  ctx.beginPath();

  for ( let i = 0; i <= length; i ++ ) {
    ctx.lineTo( ...TilePoints.at( ( startIndex + i ) % NumPoints ) );
  }

  ctx.fill();
}