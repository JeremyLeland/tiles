import { GameCanvas } from '../src/common/GameCanvas.js';
import { vec2 } from '../lib/gl-matrix.js';
import * as Util from '../src/common/Util.js';

const Terrain = {
  Empty: 0,
  Dirt: 1,
  Rock: 2,
};

const cols = 320, rows = 240;
const map = Array( cols * rows ).fill( Terrain.Dirt );

let player = {
  type: 'player',
  pos: [ 100, 100 ],
  vel: [ 0, 0 ],
  radius: 8,
  isMovingLeft: false,
  isMovingRight: false,
  isJumping: false,
  health: 100,
};

const Gravity = 0.0005;
const PlayerMoveSpeed = 0.05;
const PlayerJumpSpeed = 0.15;

const mousePos = [ 0, 0 ];

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

// setTerrainCircle( 100, 100, 80, Terrain.Empty );
// setTerrainCircle( 200, 200, 60, Terrain.Empty );
// setTerrainCircle( 250, 50, 60, Terrain.Empty );
// setTerrainCircle( 170, 70, 30, Terrain.Empty );


setTerrainCircle( 50, 100, 15, Terrain.Empty );
setTerrainRect( 50, 85, 200, 30, Terrain.Empty );
setTerrainCircle( 250, 100, 15, Terrain.Empty );

maskCtx.putImageData( maskImageData, 0, 0 );


const foregroundImage = new OffscreenCanvas( cols, rows );
const foregroundCtx = foregroundImage.getContext( '2d' );

const gameCanvas = new GameCanvas();
gameCanvas.setBounds( 0, 0, cols, rows );

gameCanvas.update = ( dt ) => {

  entities.forEach( entity => {

    if ( entity.isMovingLeft ) {
      entity.vel[ 0 ] = -PlayerMoveSpeed;
    }
    else if ( entity.isMovingRight ) {
      entity.vel[ 0 ] = PlayerMoveSpeed;
    }

    const moveVec = [
      entity.vel[ 0 ] * dt,
      entity.vel[ 1 ] * dt + ( Gravity / 2 ) * dt ** 2,
    ];

    entity.vel[ 1 ] += Gravity * dt;


    // Handle separately below?
    // if ( player.isMovingLeft ) {
    //   player.pos[ 0 ] -= PlayerMoveSpeed * dt;
    // }

    // if ( player.isMovingRight ) {
    //   player.pos[ 0 ] += PlayerMoveSpeed * dt;
    // }

    const moveDist = vec2.length( moveVec );
    const moveAngle = Math.atan2( moveVec[ 1 ], moveVec[ 0 ] );

    const moveStep = vec2.normalize( [], moveVec );

    // TODO: Will this have weird not-quite-long-enough issues with non-integer line lengths?
    for ( let testDist = 0; testDist <= moveDist; testDist ++ ) {
    // for ( let testDist = 0; testDist < moveDist; testDist += Math.min( 1, moveDist - testDist ) ) {
      // const nextX = entity.pos[ 0 ] + moveStep[ 0 ];
      // const nextY = entity.pos[ 1 ] + moveStep[ 1 ];
      // const hitAngle = testMapHit( map, nextX, nextY, entity.radius, moveAngle );

      const hitAngle = testMapHit( map, entity.pos[ 0 ], entity.pos[ 1 ], entity.radius, moveAngle );

      if ( undefined === hitAngle ) {
        // entity.pos[ 0 ] = nextX;
        // entity.pos[ 1 ] = nextY;

        vec2.add( entity.pos, entity.pos, moveStep );
      }
      else {
        if ( entity.type === 'player' ) {
          entity.vel[ 0 ] = 0;
          entity.vel[ 1 ] = 0;

          // If we're on the floor
          if ( 0 < hitAngle && hitAngle < Math.PI ) {

            // const floor = getFloorUnder( map, entity.pos[ 0 ], entity.pos[ 1 ], entity.radius + 1 );    // need +1 because we're so far off?

            // // The "check next" method above has us stop slightly above the floor
            // // "Check next" seems to work better for bouncing off walls, so fix the difference by snapping us to the floor
            // if ( undefined !== floor ) {
            //   entity.pos[ 1 ] = floor - entity.radius;
            // }

            if ( entity.isJumping ) {
              // entity.vel[ 0 ] = PlayerMoveSpeed * ( entity.isMovingLeft ? -1 : entity.isMovingRight ? 1 : 0 );
              entity.vel[ 1 ] = -PlayerJumpSpeed;
            }

            if ( entity.isMovingLeft || entity.isMovingRight ) {
              const testX = entity.pos[ 0 ] + ( entity.isMovingLeft ? -1 : 1 );
              const testY = entity.pos[ 1 ];
              const floor = getFloorUnder( map, testX, testY, entity.radius + 2 /* so we go down hills? */ );

              // TODO: Need to make sure we aren't walking through a wall here

              if ( undefined === floor ) {
                entity.pos[ 0 ] = testX;
              }
              else if ( floor > testY + entity.radius - 2 ) {
                entity.pos[ 0 ] = testX;
                entity.pos[ 1 ] = floor - entity.radius;
              }
            }
          }
        }

        if ( entity.type === 'bullet' ) {
          entity.health = 0;

          setTerrainCircle( entity.pos[ 0 ], entity.pos[ 1 ], entity.radius * 4, Terrain.Empty );
          maskCtx.putImageData( maskImageData, 0, 0 );
        }

        break;
      }
    }

  } );


  // NOTE: This currently only checks directly under us (at center x)
  //       So if another part of us is resting on a pixel, it won't count
  // TODO: Come up with another way of doing this

  // Find closest floor
  // const fallFloor = getFloorUnder( map, player.pos[ 0 ], player.pos[ 1 ], player.radius /* TODO: Should we include move distance in here? */ );

  // if ( fallFloor !== undefined ) {
  //   player.pos[ 1 ] = fallFloor - player.radius;
  //   player.vel[ 1 ] = player.isJumping ? -PlayerJumpSpeed : 0;
  // }

  // if ( player.isMovingLeft ) {
  //   const testX = player.pos[ 0 ] - 1;
  //   const testY = player.pos[ 1 ];
  //   const floor = getFloorUnder( map, testX, testY, player.radius + 2 /* so we go down hills? */ );

  //   if ( floor === undefined ) {
  //     player.pos[ 0 ] = testX;
  //   }
  //   else if ( floor > testY + player.radius - 2 ) {
  //     player.pos[ 0 ] = testX;
  //     player.pos[ 1 ] = floor - player.radius;
  //   }
  // }

  // else if ( player.isMovingRight ) {
  //   const testX = player.pos[ 0 ] + 1;
  //   const testY = player.pos[ 1 ];
  //   const floor = getFloorUnder( map, testX, testY, player.radius + 2 /* so we go down hills? */ );

  //   if ( floor === undefined ) {
  //     player.pos[ 0 ] = testX;
  //   }
  //   else if ( floor > testY + player.radius - 2 ) {
  //     player.pos[ 0 ] = testX;
  //     player.pos[ 1 ] = floor - player.radius;
  //   }
  // }

  entities = entities.filter( b => b.health > 0 );
}

function getFloorUnder( map, x, y, testDist ) {
  const testCol = Math.floor( x );

  for ( let yOffset = 0; yOffset <= testDist; yOffset ++ ) {
    const testRow = Math.floor( y + yOffset );
    const index = testCol + testRow * cols;
    const value = map[ index ];

    if ( value !== Terrain.Empty ) {
      return testRow;
    }
  }
}

//
// Test whether we hit the map going in a particular direction
//  Returns the first angle we find of collision (starting at middle)
//    maybe we can use this to see if we're on the floor?
//

function testMapHit( map, x, y, radius, moveAngle ) {
  const numChecks = radius * 2;      // radius * 2 is all of the points; fewer checks will space these out

  for ( let j = 0; j <= numChecks; j ++ ) {
    for ( const dir of [ -1, 1 ] ) {
      const testAngle = moveAngle + dir * ( j / numChecks ) * Math.PI / 2;
      const testX = x + Math.cos( testAngle ) * radius;
      const testY = y + Math.sin( testAngle ) * radius;

      const index = Math.floor( testX ) + Math.floor( testY ) * cols;

      if ( map[ index ] !== Terrain.Empty ) {
        return testAngle;
      }
    }
  }
}

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

  //
  // Cursor
  //

  // ctx.lineWidth = 0.02;
  entities.forEach( entity => {
    if ( entity.type === 'player' ) {
      ctx.fillStyle = 'green';
      Util.drawPoint( ctx, player.pos, player.radius );
      ctx.strokeStyle = 'red';
      Util.drawLine( ctx, player.pos, mousePos );
    }
    else if ( entity.type === 'bullet' ) {
      ctx.fillStyle = 'white';
      Util.drawPoint( ctx, entity.pos, entity.radius );
    }
  } );
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
  mousePos[ 0 ] = Math.floor( m.x );
  mousePos[ 1 ] = Math.floor( m.y );

  if ( m.buttons === 1 ) {
    const lineAngle = Math.atan2( mousePos[ 1 ] - player.pos[ 1 ], mousePos[ 0 ] - player.pos[ 0 ] );
    const bulletSpeed = 0.5;

    const lineVec = [ Math.cos( lineAngle ), Math.sin( lineAngle ) ];

    entities.push( {
      type: 'bullet',
      pos: vec2.scaleAndAdd( [], player.pos, lineVec, player.radius ),
      vel: vec2.scale( [], lineVec, bulletSpeed ),
      radius: 1,
      health: 1,
    } );
  }
  else if ( m.buttons === 2 ) {
    player.pos[ 0 ] = mousePos[ 0 ];
    player.pos[ 1 ] = mousePos[ 1 ];
  }

  // gameCanvas.redraw();
}

gameCanvas.pointerDown = pointerInput;
gameCanvas.pointerMove = pointerInput;

gameCanvas.wheelInput = ( m ) => {
  // gameCanvas.redraw();
}

gameCanvas.start();