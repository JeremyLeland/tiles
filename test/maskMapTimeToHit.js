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
  pos: [ 8, 12 ],
  vel: [ 0, 0 ],
  radius: 2,
  // isMovingLeft: false,
  // isMovingRight: false,
  // isJumping: false,
  // health: 100,
};

const Gravity = 0.0005;
const PlayerMoveSpeed = 0.05;
const PlayerJumpSpeed = 0.15;

const mousePos = [ 20, 20 ];

let entities = [ player ];

const maskImage = new OffscreenCanvas( cols, rows );
const maskCtx = maskImage.getContext( '2d' );
const maskImageData = maskCtx.getImageData( 0, 0, cols, rows );
const maskData = maskImageData.data;

for ( let index = 0; index < cols * rows; index ++ ) {
  const maskIndex = 4 * index;
  maskData[ maskIndex ] = 255;
  maskData[ maskIndex + 1 ] = 255;
  maskData[ maskIndex + 2 ] = 255;
  maskData[ maskIndex + 3 ] = map[ index ] === Terrain.Empty ? 0 : 255;
}

maskCtx.putImageData( maskImageData, 0, 0 );

function setTerrain( col, row, value ) {
  if ( 0 <= col && col < cols && 0 <= row && row < rows ) {
    const mapIndex = col + row * cols;
    map[ mapIndex ] = value;
    maskData[ 4 * mapIndex + 3 ] = value === Terrain.Empty ? 0 : 255;
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

maskCtx.putImageData( maskImageData, 0, 0 );


const foregroundImage = new OffscreenCanvas( cols, rows );
const foregroundCtx = foregroundImage.getContext( '2d' );

// const entitiesImage = new OffscreenCanvas( cols, rows );
// const entitiesCtx = entitiesImage.getContext( '2d' );

const gameCanvas = new GameCanvas();
gameCanvas.setBounds( 0, 0, cols, rows );


gameCanvas.draw = ( ctx ) => {
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

  // entitiesCtx.clearRect( 0, 0, cols, rows );

  ctx.fillStyle = 'green';
  Util.drawPoint( ctx, player.pos, player.radius );
  ctx.strokeStyle = '#00f8';
  ctx.lineWidth = player.radius * 2;
  Util.drawLine( ctx, player.pos, mousePos );


  ctx.fillStyle = 'white';
  Util.drawPoint( ctx, mousePos, player.radius );

  player.vel[ 0 ] = mousePos[ 0 ] - player.pos[ 0 ];
  player.vel[ 1 ] = mousePos[ 1 ] - player.pos[ 1 ];

  let bestHitTime = Infinity;
  let bestHitLine;

  // Show which grids we need to check
  const testLeft   = Math.floor( Math.min( player.pos[ 0 ], mousePos[ 0 ] ) - player.radius );
  const testTop    = Math.floor( Math.min( player.pos[ 1 ], mousePos[ 1 ] ) - player.radius );
  const testRight  = Math.floor( Math.max( player.pos[ 0 ], mousePos[ 0 ] ) + player.radius );
  const testBottom = Math.floor( Math.max( player.pos[ 1 ], mousePos[ 1 ] ) + player.radius );

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
        ctx.fillStyle = '#0f08';
        ctx.fillRect( testCol, testRow, 1, 1 );
      }
      else {
        ctx.fillStyle = '#f008';
        ctx.fillRect( testCol, testRow, 1, 1 );

        // Test walls
        const [ x, y ] = player.pos;
        const [ dx, dy ] = player.vel;
        const r = player.radius;

        const lines = [
          [ testCol, testRow + 1, testCol, testRow ],         // left
          [ testCol, testRow, testCol + 1, testRow ],         // top
          [ testCol + 1, testRow, testCol + 1, testRow + 1 ], // right
          [ testCol + 1, testRow + 1, testCol, testRow + 1 ], // bottom
        ];

        lines.forEach( line => {
          const hitTime = timeToCircleHitLine( x, y, dx, dy, r, ...line );

          if ( 0 <= hitTime && hitTime < bestHitTime ) {
            bestHitTime = hitTime;
            bestHitLine = line;
          }

          if ( 0 <= hitTime && hitTime < Infinity ) {
            const val = ( 1 - hitTime ) * 255;

            ctx.strokeStyle = `rgb( 128, ${ val }, 255 )`;
            ctx.lineWidth = 0.1;
            Util.drawLine2( ctx, line, true );
          }
        } );
      }
    }
  }

  const hitPos = vec2.scaleAndAdd( [], player.pos, player.vel, bestHitTime );

  if ( bestHitTime < Infinity ) {
    ctx.fillStyle = 'orange';
    Util.drawPoint( ctx, hitPos, player.radius );

    ctx.strokeStyle = 'yellow';
    ctx.lineWidth = 0.2;
    Util.drawLine2( ctx, bestHitLine, true );
  }
}

function pointerInput( m ) {
  mousePos[ 0 ] = m.x;  //Math.floor( m.x );
  mousePos[ 1 ] = m.y;  //Math.floor( m.y );

  if ( m.buttons === 1 ) {
    const lineAngle = Math.atan2( mousePos[ 1 ] - player.pos[ 1 ], mousePos[ 0 ] - player.pos[ 0 ] );
    const bulletSpeed = 0.5;

    const lineVec = [ Math.cos( lineAngle ), Math.sin( lineAngle ) ];

  }
  else if ( m.buttons === 2 ) {
    player.pos[ 0 ] = mousePos[ 0 ];
    player.pos[ 1 ] = mousePos[ 1 ];
  }

  gameCanvas.redraw();
}

gameCanvas.pointerDown = pointerInput;
gameCanvas.pointerMove = pointerInput;


// gameCanvas.start();


function timeToCircleHitLine( x, y, dx, dy, radius, x1, y1, x2, y2 ) {
  const px = x2 - x1;
  const py = y2 - y1;
  const D = ( px * px ) + ( py * py );

  const len = Math.sqrt( D );
  const normX = py / len;
  const normY = -px / len;

  // Don't consider it a hit if we are moving away
  const vDotN = dx * normX + dy * normY;
  if ( vDotN > 0 ) {
    return Infinity;
  }

  const distFromLine = ( x1 - x ) * normX + ( y1 - y ) * normY;

  const hitTime = ( distFromLine + radius ) / vDotN;

  const hitX = x + dx * hitTime;
  const hitY = y + dy * hitTime;

  const closestOnLine = ( ( hitX - x1 ) * px + ( hitY - y1 ) * py ) / D;

  if ( closestOnLine <= 0 ) {
    return timeToCircleHitPoint( x, y, dx, dy, radius, x1, y1 );
  }
  else if ( 1 <= closestOnLine ) {
    return timeToCircleHitPoint( x, y, dx, dy, radius, x2, y2 );
  }
  else {
    return hitTime;
  }
}

function timeToCircleHitPoint( x, y, dx, dy, radius, cx, cy ) {
  const dX = dx;
  const dY = dy;
  const fX = x - cx;
  const fY = y - cy;

  const a = dX * dX + dY * dY;
  const b = 2 * ( fX * dX + fY * dY );
  const c = ( fX * fX + fY * fY ) - Math.pow( radius, 2 );

  return solveQuadratic( a, b, c );
}


const EPSILON = 1e-6;

function solveQuadratic( A, B, C ) {
  if ( Math.abs( A ) < EPSILON ) {
    return -C / B;
  }
  else {
    let disc = B * B - 4 * A * C;

    let closest = Infinity;

    if ( -EPSILON < disc && disc < 0 ) {
      disc = 0;
      // debugger;
    }

    if ( disc >= 0 ) {
      const t0 = ( -B - Math.sqrt( disc ) ) / ( 2 * A );
      const t1 = ( -B + Math.sqrt( disc ) ) / ( 2 * A );

      if ( 0 <= t0 && t0 < closest )   closest = t0;
      if ( 0 <= t1 && t1 < closest )   closest = t1;
    }

    return closest;
  }
}