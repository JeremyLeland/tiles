// Trying mask map movement version with free fall, rest of fall after collision, and movement

import { GameCanvas } from '../src/common/GameCanvas.js';
import { vec2 } from '../lib/gl-matrix.js';
import * as Util from '../src/common/Util.js';

const Terrain = {
  Empty: 0,
  Dirt: 1,
  Rock: 2,
};

const cols = 32, rows = 24;
const map = Array( cols * rows ).fill( Terrain.Dirt );

let player = {
  type: 'player',
  pos: [ 18, 13 ],
  vel: [ 0, 0 ],
  radius: 2,
  isMovingLeft: false,
  isMovingRight: false,
  isJumping: false,
  health: 100,
};

const debugInfo = {};

const Gravity = 0.00005;  //0.0005;
const PlayerMoveSpeed = 0.005;
const PlayerJumpSpeed = 0.015;

const mousePos = [ 20.4, 20 ];

let entities = [ player ];


function setTerrain( col, row, value ) {
  if ( 0 <= col && col < cols && 0 <= row && row < rows ) {
    const mapIndex = col + row * cols;
    map[ mapIndex ] = value;
    // maskData[ 4 * mapIndex + 3 ] = value === Terrain.Empty ? 0 : 255;
  }
}

function setTerrainCircle( x, y, radius, value ) {
  x = Math.floor( x );
  y = Math.floor( y );

  for ( let row = y - radius; row < y + radius; row ++ ) {
    for ( let col = x - radius; col < x + radius; col ++ ) {
      if ( Math.hypot( col - x, row - y ) < radius ) {
        setTerrain( col, row, value );
      }
    }
  }
}

function setTerrainRect( x, y, width, height, value ) {
  x = Math.floor( x );
  y = Math.floor( y );

  for ( let row = y; row < y + height; row ++ ) {
    for ( let col = x; col < x + width; col ++ ) {
      setTerrain( col, row, value );
    }
  }
}

setTerrainRect( 5, 8, 20, 5, Terrain.Empty );
setTerrainRect( 2, 10, 25, 6, Terrain.Empty );
setTerrainRect( 5, 7, 4, 6, Terrain.Empty );
setTerrainRect( 20, 4, 8, 15, Terrain.Empty );

setTerrainRect( 10, 16, 10, 1, Terrain.Empty );
setTerrainRect( 15, 17, 5, 1, Terrain.Empty );

const maskImage = new OffscreenCanvas( cols, rows );
const maskCtx = maskImage.getContext( '2d' );

const foregroundImage = new OffscreenCanvas( cols, rows );
const foregroundCtx = foregroundImage.getContext( '2d' );

const gameCanvas = new GameCanvas();
gameCanvas.setBounds( 0, 0, cols, rows );


gameCanvas.update = ( dt ) => {

  debugInfo.bestLines = [];

  if ( player.isMovingLeft ) {
    player.vel[ 0 ] = -PlayerMoveSpeed;
  }
  else if ( player.isMovingRight ) {
    player.vel[ 0 ] = PlayerMoveSpeed;
  }
  else {
    player.vel[ 0 ] = 0;
  }

  if ( player.isJumping ) {
    player.vel[ 1 ] = -PlayerJumpSpeed;
  }

  player.vel[ 1 ] += Gravity * dt;

  let timeLeft = dt;

  // console.log( 'looking for hits' );

  for ( let step = 0; step < 2; step ++ ) {
    const bestHit = getHit( map, player, timeLeft );

    if ( -EPSILON <= bestHit.time && bestHit.time < Infinity ) {
      vec2.scaleAndAdd( player.pos, player.pos, player.vel, bestHit.time );

      // console.log( 'before pos', player.pos );

      // console.log( bestHit.time );
      debugInfo.bestLines.push( bestHit.line );

      // Left/Right wall
      if ( bestHit.line[ 0 ] === bestHit.line[ 2 ] ) {
        player.vel[ 0 ] = 0;
      }

      // Ceiling/Floor
      else {
        player.vel[ 1 ] = 0;
      }

      // console.log( ' after partial update pos', player.pos );

      timeLeft -= bestHit.time;
    }
    else {
      vec2.scaleAndAdd( player.pos, player.pos, player.vel, timeLeft );

      // console.log( ' after rest of update pos', player.pos );

      break;
    }
  }

  // console.log( player.pos, ' AFTER ENTIRE UPDATE' );
}

gameCanvas.draw = ( ctx ) => {

  const maskImageData = maskCtx.getImageData( 0, 0, cols, rows );
  const maskData = maskImageData.data;

  map.forEach( ( terrain, index ) => {
    const maskIndex = 4 * index;
    maskData[ maskIndex ] = 255;
    maskData[ maskIndex + 1 ] = 255;
    maskData[ maskIndex + 2 ] = 255;
    maskData[ maskIndex + 3 ] = terrain === Terrain.Empty ? 0 : 255;
  } );

  maskCtx.putImageData( maskImageData, 0, 0 );

  foregroundCtx.clearRect( 0, 0, cols, rows );
  foregroundCtx.globalCompositeOperation = 'source-over';
  foregroundCtx.drawImage( maskImage, 0, 0 );
  foregroundCtx.globalCompositeOperation = 'source-in';
  foregroundCtx.fillStyle = 'rgb(200, 100, 20)';
  foregroundCtx.fillRect( 0, 0, cols, rows );

  ctx.imageSmoothingEnabled = false;

  ctx.fillStyle = '#321';
  ctx.fillRect( 0, 0, cols, rows );

  ctx.drawImage( foregroundImage, 0, 0 );


  ctx.fillStyle = 'green';
  Util.drawPoint( ctx, player.pos, player.radius );
  ctx.strokeStyle = 'red';
  ctx.lineWidth = 0.1;
  Util.drawLine( ctx, player.pos, mousePos );

  if ( debugInfo.bestLines ) {
    debugInfo.bestLines.forEach( ( line, index ) => {
      ctx.strokeStyle = index == 0 ? 'red' : 'yellow';
      Util.drawLine2( ctx, line, true );
    } );
  }
}

function getHit( map, entity, dt, debugCtx ) {
  // console.log( ' getHit' );

  let bestHit = {
    time: Infinity,
    line: null,
  };

  const goalPos = vec2.scaleAndAdd( [], entity.pos, entity.vel, dt );

  // Show which grids we need to check
  const testLeft   = Math.floor( Math.min( entity.pos[ 0 ], goalPos[ 0 ] ) - entity.radius );
  const testTop    = Math.floor( Math.min( entity.pos[ 1 ], goalPos[ 1 ] ) - entity.radius );
  const testRight  = Math.floor( Math.max( entity.pos[ 0 ], goalPos[ 0 ] ) + entity.radius );
  const testBottom = Math.floor( Math.max( entity.pos[ 1 ], goalPos[ 1 ] ) + entity.radius );

  // TODO: Would it ever make sense to throw out values that are outside of blue move line?
  //       Most moves are probably small enough that it wouldn't matter much
  //       Could potentially make a difference if bullets are moving fast
  //       Either way, curious if there's a quick way to throw these out based on distance from line
  //        - and how that compares to cost of checking

  // TODO: Would it make sense to test these in movement order so we bail early if we hit something?
  //        - Is it more expensive than testing all of them?

  for ( let testRow = testTop; testRow <= testBottom; testRow ++ ) {
    for ( let testCol = testLeft; testCol <= testRight; testCol ++ ) {

      if ( map[ testCol + testRow * cols ] === Terrain.Empty ) {
        if ( debugCtx ) {
          debugCtx.fillStyle = '#0f04';
          debugCtx.fillRect( testCol, testRow, 1, 1 );
        }
      }
      else {
        if ( debugCtx ) {
          debugCtx.fillStyle = '#f004';
          debugCtx.fillRect( testCol, testRow, 1, 1 );
        }

        // Test walls
        const [ x, y ] = entity.pos;
        const [ dx, dy ] = entity.vel;
        const r = entity.radius;

        const lines = [
          [ testCol, testRow + 1, testCol, testRow ],         // left
          [ testCol, testRow, testCol + 1, testRow ],         // top
          [ testCol + 1, testRow, testCol + 1, testRow + 1 ], // right
          [ testCol + 1, testRow + 1, testCol, testRow + 1 ], // bottom
        ];

        lines.forEach( line => {
          const hitTime = timeToCircleHitLine( x, y, dx, dy, r, ...line );

          // if ( hitTime < Infinity ) {
          //   console.log( '  hitTime for ', line, ' is ', hitTime );
          // }

          // Make sure hitTime is within our update window, helps avoid other weirdness
          if ( -EPSILON <= hitTime && hitTime < bestHit.time && hitTime < dt ) {
            bestHit.time = hitTime;
            bestHit.line = line;
          }

          if ( debugCtx ) {
            if ( -EPSILON <= hitTime && hitTime < Infinity ) {
              const val = ( 1 - hitTime ) * 255;

              debugCtx.strokeStyle = `rgb( 128, ${ val }, 255 )`;
              debugCtx.lineWidth = 0.1;
              Util.drawLine2( debugCtx, line, true );
            }
          }
        } );
      }
    }
  }

  // console.log( ' bestHit = ', bestHit.line );

  return bestHit;
}

document.addEventListener( 'keydown', e => {
  if ( e.key === 'a' ) {
    player.isMovingLeft = true;
  }
  else if ( e.key === 'd' ) {
    player.isMovingRight = true;
  }
  else if ( e.key === ' ' ) {
    player.isJumping = true;

    // gameCanvas.update( 10 );
    // gameCanvas.redraw();
  }
  else if ( e.key === 'p' ) {
    gameCanvas.toggle();
  }
} );

document.addEventListener( 'keyup', e => {
  if ( e.key === 'a' ) {
    player.isMovingLeft = false;
  }
  else if ( e.key === 'd' ) {
    player.isMovingRight = false;
  }
  else if ( e.key === ' ' ) {
    player.isJumping = false;
  }
} );

function pointerInput( m ) {
  vec2.set( mousePos, m.x, m.y );

  if ( m.buttons === 1 ) {
  }
  else if ( m.buttons === 2 ) {
    vec2.copy( player.pos, mousePos );

    console.log( 'moved to ', player.pos );
  }

  // gameCanvas.redraw();
}

gameCanvas.pointerDown = pointerInput;
gameCanvas.pointerMove = pointerInput;


gameCanvas.start();

// NOTE: The epsilons are important, really! 
// You're always tempted to just use zero, but the use of EPISILON is the result of a lot of blood, sweat, and debugging
const EPSILON = 1e-6;

function timeToCircleHitLine( x, y, dx, dy, radius, x1, y1, x2, y2 ) {
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
    return hitTime;
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
