import { GameCanvas } from '../src/common/GameCanvas.js';

const image = new Image();
image.src = './images/roadTiles.svg';
await image.decode();

async function getBitmap( image, scale = 1 ) {
  const canvas = new OffscreenCanvas( image.width * scale, image.height * scale );
  const ctx = canvas.getContext( '2d' );
  ctx.drawImage( image, 0, 0, canvas.width, canvas.height );
  return createImageBitmap( canvas );
}

const bmp = await getBitmap( image );

const gameCanvas = new GameCanvas();
gameCanvas.bounds = [ -4, -4, 4, 4 ];
gameCanvas.backgroundColor = '#123';

gameCanvas.draw = ( ctx ) => {

  ctx.fillStyle = '#7777';
  drawGrid( ctx, gameCanvas.bounds );

  ctx.globalAlpha = 0.5;

  ctx.fillStyle = 'gray';
  ctx.fillRect( -1, -0.5, 2, 1 );


  ctx.drawImage( bmp, 50, 492, 100, 60, -1, -0.6, 2, 1.2 );

  // drawTile( ctx, 0, 0, 0, 0, 0 );
}

gameCanvas.redraw();

function drawGrid( ctx, bounds, thickness = 0.01 ) {
  const ORIGIN = '#777', OTHER = '#5555';
  for ( let row = bounds[ 1 ]; row <= bounds[ 3 ]; row ++ ) {
    ctx.fillStyle = row == 0 ? ORIGIN : OTHER;
    ctx.fillRect( bounds[ 0 ], row, bounds[ 2 ] - bounds[ 0 ], thickness );
  }
  for ( let col = bounds[ 0 ]; col <= bounds[ 2 ]; col ++ ) {
    ctx.fillStyle = col == 0 ? ORIGIN : OTHER;
    ctx.fillRect( col, bounds[ 1 ], thickness, bounds[ 3 ] - bounds[ 1 ] );
  }
}

// function drawTile( ctx, srcCol, srcRow, col, row, level ) {

//   const SRC_OFFSET_X = 50;
//   const SRC_OFFSET_Y = 0;
//   const SRC_WIDTH = 100;
//   const SRC_HEIGHT = 100;

//   const sx = SRC_OFFSET_X + srcCol * SRC_WIDTH;
//   const sy = SRC_OFFSET_Y + srcRow * SRC_HEIGHT;
//   const sw = SRC_WIDTH;
//   const sh = SRC_HEIGHT;

//   const w = 1;
//   const h = w / 2;

//   const x = w * ( col - row );
//   const y = h * ( row + col - level * 2 );

//   const dw = w;
//   const dh = h * 2;
//   const dx = x //- dw / 2;
//   const dy = y - dh / 4;

//   ctx.fillStyle = 'green';
//   ctx.fillRect( x, y, w, h );

//   ctx.fillStyle = 'gray';
//   ctx.fillRect( dx, dy, dw, dh );

//   ctx.drawImage( image, sx, sy, sw, sh, dx, dy, dw, dh );
// }
