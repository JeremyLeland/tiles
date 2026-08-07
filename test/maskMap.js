// Let's make an editable grid of solid and empty, then see how it would get interpretted as 2x2 or 3x3 tiles

import { GameCanvas } from '../src/common/GameCanvas.js';
import * as Util from '../src/common/Util.js';

const cols = 320, rows = 240;
const map = Array( cols * rows ).fill( 1 );

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

// maskCtx.clearRect( 100, 100, 100, 100 );

const maskImageData = maskCtx.getImageData( 0, 0, cols, rows );
const maskData = maskImageData.data;

function removeCircle( x, y, radius ) {
  for ( let row = y - radius; row < y + radius; row ++ ) {
    for ( let col = x - radius; col < x + radius; col ++ ) {
      if ( Math.hypot( col - x, row - y ) < radius ) {
        const index = 4 * ( col + row * cols );
        maskData[ index + 3 ] = 0;
      }
    }
  }
}

removeCircle( 100, 100, 50 );
removeCircle( 200, 200, 30 );
removeCircle( 250, 50, 20 );
removeCircle( 170, 70, 10 );

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

  ctx.shadowColor = '#0009';
  ctx.shadowOffsetX = -20;
  ctx.shadowOffsetY = 20;
  ctx.shadowBlur = 0;

  ctx.drawImage( foregroundImage, 0, 0 );

  //
  // Cursor
  //

  // ctx.lineWidth = 0.02;
  // ctx.strokeStyle = 'lime';

  // const mouseCol = Math.round( mouseX - cursorRadius );
  // const mouseRow = Math.round( mouseY - cursorRadius );
  // // ctx.strokeRect( mouseCol, mouseRow, cursorRadius * 2, cursorRadius * 2 );

  // ctx.beginPath();
  // ctx.arc( mouseCol + cursorRadius, mouseRow + cursorRadius, cursorRadius, 0, Math.PI * 2 );
  // ctx.stroke();
}

function pointerInput( m ) {
  mouseX = m.x;
  mouseY = m.y;

  if ( m.buttons > 0 ) {

    const value = m.buttons === 1 ? 1 : 0;

    const mouseCol = Math.round( mouseX - cursorRadius );
    const mouseRow = Math.round( mouseY - cursorRadius );

    for ( let rowOffset = 0; rowOffset < cursorRadius * 2; rowOffset ++ ) {
      for ( let colOffset = 0; colOffset < cursorRadius * 2; colOffset ++ ) {
        const col = mouseCol + colOffset;
        const row = mouseRow + rowOffset;

        if ( 0 <= col && col < cols && 0 <= row && row < rows ) {
          if ( Math.hypot( 0.5 + colOffset - cursorRadius, 0.5 + rowOffset - cursorRadius ) <= cursorRadius ) {
            const index = col + row * cols;
            map[ index ] = value;
          }
        }
      }
    }
  }

  gameCanvas.redraw();
}

gameCanvas.pointerDown = pointerInput;
gameCanvas.pointerMove = pointerInput;

gameCanvas.wheelInput = ( m ) => {
  cursorRadius = Math.max( 0.5, Math.min( 10.5, cursorRadius + 0.5 * Math.sign( m.wheel ) ) );
  gameCanvas.redraw();
}

// gameCanvas.start();