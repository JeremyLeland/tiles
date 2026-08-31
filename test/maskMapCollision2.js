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
  pos: [ 100, 100 ],
  vel: [ 0, 0 ],
  radius: 8,
  isMovingLeft: false,
  isMovingRight: false,
  isJumping: false,
};

const Gravity = 0.0005;
const PlayerMoveSpeed = 0.05;
const PlayerJumpSpeed = 0.15;

const mousePos = [ 0, 0 ];

let bullets = [];

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


  const moveVec = [
    player.vel[ 0 ] * dt,
    player.vel[ 1 ] * dt + ( Gravity / 2 ) * dt ** 2,
  ];

  player.vel[ 1 ] += Gravity * dt;

  const moveDist = vec2.length( moveVec );
  const moveAngle = Math.atan2( moveVec[ 1 ], moveVec[ 0 ] );

  const moveStep = vec2.normalize( [], moveVec );

   // TODO: Will this have weird not-quite-long-enough issues with non-integer line lengths?
  for ( let i = 0; i <= moveDist; i ++ ) {
    if ( testMapHit( map, player.pos[ 0 ], player.pos[ 1 ], player.radius, moveAngle ) ) {
      player.vel[ 0 ] = 0;
      player.vel[ 1 ] = 0;
      break;
    }
    else {
      vec2.add( player.pos, player.pos, moveStep );
    }
  }

  // player.pos[ 0 ] += player.vel[ 0 ] * dt;
  // player.pos[ 1 ] += player.vel[ 1 ] * dt + ( Gravity / 2 ) * dt ** 2;

  // player.vel[ 1 ] += Gravity * dt;

  // Handle separately below?
  // if ( player.isMovingLeft ) {
  //   player.pos[ 0 ] -= PlayerMoveSpeed * dt;
  // }

  // if ( player.isMovingRight ) {
  //   player.pos[ 0 ] += PlayerMoveSpeed * dt;
  // }


  // NOTE: This currently only checks directly under us (at center x)
  //       So if another part of us is resting on a pixel, it won't count
  // TODO: Come up with another way of doing this

  // Find closest floor
  const fallFloor = getFloorUnder( map, player.pos[ 0 ], player.pos[ 1 ], player.radius /* TODO: Should we include move distance in here? */ );

  if ( fallFloor !== undefined ) {
    player.pos[ 1 ] = fallFloor - player.radius;
    player.vel[ 1 ] = player.isJumping ? -PlayerJumpSpeed : 0;
  }

  if ( player.isMovingLeft ) {
    const testX = player.pos[ 0 ] - 1;
    const testY = player.pos[ 1 ];
    const floor = getFloorUnder( map, testX, testY, player.radius + 2 /* so we go down hills? */ );

    if ( floor === undefined ) {
      player.pos[ 0 ] = testX;
    }
    else if ( floor > testY + player.radius - 2 ) {
      player.pos[ 0 ] = testX;
      player.pos[ 1 ] = floor - player.radius;
    }
  }

  else if ( player.isMovingRight ) {
    const testX = player.pos[ 0 ] + 1;
    const testY = player.pos[ 1 ];
    const floor = getFloorUnder( map, testX, testY, player.radius + 2 /* so we go down hills? */ );

    if ( floor === undefined ) {
      player.pos[ 0 ] = testX;
    }
    else if ( floor > testY + player.radius - 2 ) {
      player.pos[ 0 ] = testX;
      player.pos[ 1 ] = floor - player.radius;
    }
  }


  bullets.forEach( bullet => {
    const hit = getMapHit( map, bullet, dt );
    if ( hit ) {
      bullet.health = 0;

      setTerrainCircle( bullet.pos[ 0 ], bullet.pos[ 1 ], bullet.radius * 4, Terrain.Empty );

      maskCtx.putImageData( maskImageData, 0, 0 );

    }
    else {
      vec2.scaleAndAdd( bullet.pos, bullet.pos, bullet.vel, dt );
    }
  } );

  bullets = bullets.filter( b => b.health > 0 );
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

function testMapHit( map, x, y, radius, moveAngle ) {
  const numChecks = radius * 2;      // radius * 2 is all of the points; fewer checks will space these out

  for ( let j = 0; j <= numChecks; j ++ ) {
    for ( const dir of [ -1, 1 ] ) {
      const testAngle = moveAngle + dir * ( j / numChecks ) * Math.PI / 2;
      const testX = x + Math.cos( testAngle ) * radius;
      const testY = y + Math.sin( testAngle ) * radius;

      const index = Math.floor( testX ) + Math.floor( testY ) * cols;

      if ( map[ index ] !== Terrain.Empty ) {
        return true;
      }
    }
  }

  return false;
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
  ctx.fillStyle = 'green';

  Util.drawPoint( ctx, player.pos, player.radius );

  ctx.strokeStyle = 'red';

  Util.drawLine( ctx, player.pos, mousePos );

  ctx.fillStyle = 'white';
  bullets.forEach( bullet => {
    Util.drawPoint( ctx, bullet.pos, bullet.radius );
  } );
}

function getMapHit( map, entity, dt ) {
  const lineLen = vec2.length( entity.vel ) * dt;
  const step = vec2.normalize( [], entity.vel );

  const lineAngle = Math.atan2( step[ 1 ], step[ 0 ] );

  const testCenter = vec2.clone( entity.pos );

  const numChecks = entity.radius * 2;      // radius * 2 is all of the points; fewer checks will space these out

  for ( let i = 0; i <= lineLen; i ++ ) {
    for ( let j = 0; j <= numChecks; j ++ ) {
      for ( const dir of [ -1, 1 ] ) {
        const testAngle = lineAngle + dir * ( j / numChecks ) * Math.PI / 2;
        const x = testCenter[ 0 ] + Math.cos( testAngle ) * entity.radius;
        const y = testCenter[ 1 ] + Math.sin( testAngle ) * entity.radius;

        const index = Math.floor( x ) + Math.floor( y ) * cols;

        if ( map[ index ] === Terrain.Dirt ) {
          return testCenter;
        }
      }
    }

    vec2.add( testCenter, testCenter, step );
  }
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
    const bulletSpeed = 0.1;

    const lineVec = [ Math.cos( lineAngle ), Math.sin( lineAngle ) ];

    bullets.push( {
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