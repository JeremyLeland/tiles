// NOTE: The epsilons are important, really! 
// You're always tempted to just use zero, but the use of EPISILON is the result of a lot of blood, sweat, and debugging
const EPSILON = 1e-6;

export function timeToCircleHitLine( x, y, dx, dy, radius, x1, y1, x2, y2 ) {
  const px = x2 - x1;
  const py = y2 - y1;
  const D = ( px * px ) + ( py * py );

  if ( D === 0 ) {
    console.warn( 'D === 0 !!!' );
    debugger;   // what does this case actualy mean? Can it happen?
    // Does this mean the line is a point?
    //return Infinity;
  }

  const len = Math.sqrt( D );
  const normX = py / len;
  const normY = -px / len;

  // Don't consider it a hit if we are moving away or parallel
  const vDotN = dx * normX + dy * normY;
  if ( vDotN >= 0 ) {
    return Infinity;
  }

  const distFromLine = ( x1 - x ) * normX + ( y1 - y ) * normY;

  const hitTime = ( distFromLine + radius ) / vDotN;

  const hitX = x + dx * hitTime;
  const hitY = y + dy * hitTime;

  const closestOnLine = ( ( hitX - x1 ) * px + ( hitY - y1 ) * py ) / D;

  // console.log( `  closestOnLine ${ x1 },${ y1 }->${ x2 },${ y2 }`, closestOnLine );

  // Hacky way to skip barely touching case?
  if ( closestOnLine <= 0 - radius / len || 1 + radius / len <= closestOnLine ) {

    // console.log( '   barely touching case, returning Infinity' );
    return Infinity;
  }

  if ( closestOnLine <= 0 ) {
    // console.log( '   hitting left of line' );
    return timeToCircleHitPoint( x, y, dx, dy, radius, x1, y1 );
  }
  else if ( 1 <= closestOnLine ) {
    // console.log( '   hitting right of line' );
    return timeToCircleHitPoint( x, y, dx, dy, radius, x2, y2 );
  }
  else {
    // console.log( '   hitting within line' );

    // For our purposes, we don't care about collisions in the past
    if ( hitTime < -EPSILON ) {
      return Infinity;
    }
    else {
      return hitTime;
    }
  }
}

function timeToCircleHitPoint( x, y, dx, dy, radius, cx, cy ) {

  // console.log( `  timeToCircleHitPoint( ${ x }, ${ y }, ${ dx }, ${ dy }, ${ radius }, ${ cx }, ${ cy } )` );

  const dX = dx;
  const dY = dy;
  const fX = x - cx;
  const fY = y - cy;

  const a = dX * dX + dY * dY;
  const b = 2 * ( fX * dX + fY * dY );
  const c = ( fX * fX + fY * fY ) - Math.pow( radius, 2 );

  return solveQuadratic( a, b, c );
}

function solveQuadratic( A, B, C ) {
  // console.log( `   solveQuadratic( ${ A }, ${ B }, ${ C } )` );

  if ( Math.abs( A ) < EPSILON ) {
    // console.log( '    A ~= 0' );

    return -C / B;
  }
  else {
    let disc = B * B - 4 * A * C;

    // console.log( '    disc', disc );

    // if ( disc <= -EPSILON ) {
      // debugger;
    // }

    let closest = Infinity;

    // Should I make this Math.abs( disc ) < EPSILON like above? 
    if ( -EPSILON < disc && disc < 0 ) {
      disc = 0;
      // debugger;
    }

    if ( disc >= 0 ) {
      const t0 = ( -B - Math.sqrt( disc ) ) / ( 2 * A );
      const t1 = ( -B + Math.sqrt( disc ) ) / ( 2 * A );

      // console.log( '    t0', t0 );
      // console.log( '    t1', t1 );

      if ( -EPSILON <= t0 && t0 < closest )   closest = t0;
      if ( -EPSILON <= t1 && t1 < closest )   closest = t1;
    }

    return closest;
  }
}