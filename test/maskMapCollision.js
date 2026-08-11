import { GameCanvas } from '../src/common/GameCanvas.js';
import * as Util from '../src/common/Util.js';

const Terrain = {
  Empty: 0,
  Dirt: 1,
  Rock: 2,
};

const cols = 320, rows = 240;
const map = Array( cols * rows ).fill( Terrain.Dirt );

let playerX = 100, playerY = 100;
let mouseX, mouseY, cursorRadius = 10;

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
    maskData[ 4 * mapIndex + 3 ] = value;
  }
}

function setTerrainCircle( x, y, radius, value ) {
  for ( let row = y - radius; row < y + radius; row ++ ) {
    for ( let col = x - radius; col < x + radius; col ++ ) {
      if ( Math.hypot( col - x, row - y ) < radius ) {
        setTerrain( col, row, value );
      }
    }
  }
}

setTerrainCircle( 100, 100, 80, Terrain.Empty );
setTerrainCircle( 200, 200, 60, Terrain.Empty );
setTerrainCircle( 250, 50, 60, Terrain.Empty );
setTerrainCircle( 170, 70, 30, Terrain.Empty );

maskCtx.putImageData( maskImageData, 0, 0 );


const foregroundImage = new OffscreenCanvas( cols, rows );
const foregroundCtx = foregroundImage.getContext( '2d' );

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

  //
  // Cursor
  //

  // ctx.lineWidth = 0.02;
  ctx.fillStyle = 'green';

  ctx.beginPath();
  ctx.arc( playerX, playerY, 10, 0, Math.PI * 2 );
  ctx.fill();

  ctx.strokeStyle = 'red';

  Util.drawLine( ctx, [ playerX, playerY ], [ mouseX, mouseY ] );

  //
  // Find collision point
  //

  const lineLen = Math.hypot( mouseX - playerX, mouseY - playerY );
  const lineAngle = Math.atan2( mouseY - playerY, mouseX - playerX );
  const stepX = Math.cos( lineAngle );
  const stepY = Math.sin( lineAngle );

  let testX = playerX, testY = playerY, foundHit = false;

  for ( let i = 0; i < lineLen; i ++ ) {
    const index = Math.floor( testX ) + Math.floor( testY ) * cols;

    if ( map[ index ] === Terrain.Dirt ) {
      foundHit = true;
      break;
    }

    testX += stepX;
    testY += stepY;
  }

  if ( foundHit ) {
    ctx.strokeStyle = 'yellow';
    Util.drawLine( ctx, [ playerX, playerY ], [ testX, testY ] );
  }
}

function pointerInput( m ) {
  mouseX = Math.floor( m.x );
  mouseY = Math.floor( m.y );

  if ( m.buttons === 1 ) {
    playerX = mouseX;
    playerY = mouseY;
  }

  gameCanvas.redraw();
}

gameCanvas.pointerDown = pointerInput;
gameCanvas.pointerMove = pointerInput;

gameCanvas.wheelInput = ( m ) => {
  cursorRadius = Math.max( 1, Math.min( 50, cursorRadius + Math.sign( m.wheel ) ) );
  gameCanvas.redraw();
}

// gameCanvas.start();