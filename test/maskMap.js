// Let's make an editable grid of solid and empty, then see how it would get interpretted as 2x2 or 3x3 tiles

import { GameCanvas } from '../src/common/GameCanvas.js';
import * as Util from '../src/common/Util.js';

const Terrain = {
  Empty: 0,
  Dirt: 1,
  Rock: 2,
};

const cols = 320, rows = 240;
const map = Array( cols * rows ).fill( Terrain.Dirt );

let mouseX, mouseY, cursorRadius = 10;

const backgroundImage = createLayer( cols, rows, '#321' );
const dirtImage = createLayer( cols, rows, 'rgb(208, 98, 20)' );

function createLayer( width, height, color ) {
  const canvas = new OffscreenCanvas( width, height );
  const ctx = canvas.getContext( '2d' );

  ctx.fillStyle = 'black';
  ctx.fillRect( 0, 0, width, height );

  ctx.fillStyle = '#888';

  for ( let i = 0; i < 3000; i ++ ) {
    const size = Math.random();

    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const r = size * canvas.height / 12;

    ctx.beginPath();
    ctx.arc( x, y, r, 0, Math.PI * 2 );
    ctx.globalAlpha = 0.123 - 0.1 * size;
    ctx.fill();
  }

  ctx.fillStyle = color;
  ctx.globalAlpha = 0.75;
  ctx.fillRect( 0, 0, width, height );

  return canvas;
}

const maskImage = new OffscreenCanvas( cols, rows );
const maskCtx = maskImage.getContext( '2d' );

maskCtx.fillStyle = 'white';
maskCtx.fillRect( 0, 0, cols, rows );

const maskImageData = maskCtx.getImageData( 0, 0, cols, rows );
const maskData = maskImageData.data;

function setTerrain( col, row, value ) {
  const mapIndex = col + row * cols;
  map[ mapIndex ] = value;
  maskData[ 4 * mapIndex + 3 ] = value;
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

setTerrainCircle( 100, 100, 50, Terrain.Empty );
setTerrainCircle( 200, 200, 30, Terrain.Empty );
setTerrainCircle( 250, 50, 20, Terrain.Empty );
setTerrainCircle( 170, 70, 10, Terrain.Empty );

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
  foregroundCtx.drawImage( dirtImage, 0, 0 );

  ctx.imageSmoothingEnabled = false;

  ctx.drawImage( backgroundImage, 0, 0 );

  ctx.shadowColor = '#0009'; {
    ctx.shadowOffsetX = -9;
    ctx.shadowOffsetY = 9;
    ctx.shadowBlur = 0;

    ctx.drawImage( foregroundImage, 0, 0 );
  }
  ctx.shadowColor = 'transparent';

  //
  // Cursor
  //

  // ctx.lineWidth = 0.02;
  ctx.strokeStyle = '#0f08';

  ctx.beginPath();
  ctx.arc( mouseX, mouseY, cursorRadius, 0, Math.PI * 2 );
  ctx.stroke();
}

document.addEventListener( 'keydown', e => {

} );

function pointerInput( m ) {
  mouseX = Math.floor( m.x );
  mouseY = Math.floor( m.y );

  if ( m.buttons > 0 ) {
    const value = m.buttons === 1 ? Terrain.Empty : Terrain.Dirt;

    setTerrainCircle( mouseX, mouseY, cursorRadius, Terrain );

    // TODO: does dirty rect make any perf difference?
    maskCtx.putImageData( maskImageData, 0, 0 );
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