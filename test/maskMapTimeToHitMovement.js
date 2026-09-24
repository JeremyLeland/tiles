// Trying mask map movement version with free fall, rest of fall after collision, and movement

import * as MaskMap from '../src/MaskMap.js';

import { GameCanvas } from '../src/common/GameCanvas.js';
import { KeyInput } from '../src/common/KeyInput.js';
import * as Collisions from '../src/common/Collisions.js';
import * as Util from '../src/common/Util.js';
import { vec2 } from '../lib/gl-matrix.js';

const Terrain = {
  Empty: 0,
  Dirt: 1,
  Rock: 2,
};

const map = MaskMap.create( 32, 24, Terrain.Dirt );

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


MaskMap.setTerrainRect( map, 5, 8, 20, 5, Terrain.Empty );
MaskMap.setTerrainRect( map, 2, 10, 25, 6, Terrain.Empty );
MaskMap.setTerrainRect( map, 5, 7, 4, 6, Terrain.Empty );
MaskMap.setTerrainRect( map, 20, 4, 8, 15, Terrain.Empty );
MaskMap.setTerrainRect( map, 10, 16, 10, 1, Terrain.Empty );
MaskMap.setTerrainRect( map, 15, 17, 5, 1, Terrain.Empty );


const backgroundImage = new OffscreenCanvas( map.cols, map.rows );
const backgroundCtx = backgroundImage.getContext( '2d' );
backgroundCtx.fillStyle = '#321';
backgroundCtx.fillRect( 0, 0, map.cols, map.rows );

const foregroundImage = new OffscreenCanvas( map.cols, map.rows );
const foregroundCtx = foregroundImage.getContext( '2d' );
foregroundCtx.fillStyle = 'rgb(200, 100, 20)';
foregroundCtx.fillRect( 0, 0, map.cols, map.rows );


const gameCanvas = new GameCanvas();
gameCanvas.setBounds( 0, 0, map.cols, map.rows );

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

    if ( bestHit.time < Infinity ) {
      // console.log( '  partial: ', player.pos, player.vel, bestHit.time );
      vec2.scaleAndAdd( player.pos, player.pos, player.vel, bestHit.time );

      // console.log( 'before pos', player.pos );

      // console.log( bestHit.time );
      debugInfo.bestLines.push( bestHit.line );

      // Left/Right wall
      if ( bestHit.line[ 0 ] === bestHit.line[ 2 ] ) {
        player.vel[ 0 ] = 0;

        // Try crawling up wall
        player.vel[ 1 ] = -PlayerMoveSpeed;   // TOOD: slower as we get toward top so we don't "hop" so much?
      }

      // Ceiling/Floor
      else {
        player.vel[ 1 ] = 0;
      }

      timeLeft -= bestHit.time;
    }
    else {
      // console.log( '  rest of: ', player.pos, player.vel, timeLeft );
      vec2.scaleAndAdd( player.pos, player.pos, player.vel, timeLeft );

      break;
    }
  }

  // console.log( 'after pos/vel', player.pos, player.vel );
}

gameCanvas.draw = ( ctx ) => {
  MaskMap.makeMaskTransparent( foregroundCtx, map, Terrain.Empty );

  ctx.imageSmoothingEnabled = false;
  ctx.drawImage( backgroundImage, 0, 0 );
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

      if ( map.data[ testCol + testRow * map.cols ] === Terrain.Empty ) {
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
          const hitTime = Collisions.timeToCircleHitLine( x, y, dx, dy, r, ...line );

          // if ( hitTime < Infinity ) {
          //   console.log( '  hitTime for ', line, ' is ', hitTime );
          // }

          // Make sure hitTime is within our update window, helps avoid other weirdness
          if ( hitTime < bestHit.time && hitTime < dt ) {
            bestHit.time = hitTime;
            bestHit.line = line;
          }

          if ( debugCtx ) {
            if ( hitTime < Infinity ) {
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

const keyInput = new KeyInput();

keyInput.Keys = {
  PlayerLeft: 'a',
  PlayerRight: 'd',
  PlayerJump: ' ',
  ToggleUpdates: 'p',
};

keyInput.Actions = {
  PlayerLeft:   x => player.isMovingLeft = x,
  PlayerRight:  x => player.isMovingRight = x,
  PlayerJump:   x => player.isJumping = x,

  ToggleUpdates: x => { if ( x ) gameCanvas.toggle() },
};

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


