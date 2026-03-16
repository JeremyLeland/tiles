import { GameCanvas } from '../src/common/GameCanvas.js';

const image = new Image()
image.src = './images/kenney_sketch-desert_combined.png'
await image.decode()

const json = await ( await fetch( './images/kenney_sketch-desert_combined.json' ) ).json()

const gameCanvas = new GameCanvas();
gameCanvas.bounds = [ -4, -4, 4, 4 ];
gameCanvas.backgroundColor = '#123';

gameCanvas.draw = ( ctx ) => {

  const bounds = gameCanvas.bounds;
  ctx.fillStyle = '#7777';
  for ( let row = bounds[ 1 ]; row <= bounds[ 3 ]; row ++ ) {
    ctx.fillRect( bounds[ 0 ], row, bounds[ 2 ] - bounds[ 0 ], ( row == 0 ? 3 : 1 ) * 0.01 );
  }
  for ( let col = bounds[ 0 ]; col <= bounds[ 2 ]; col ++ ) {
    ctx.fillRect( col, bounds[ 1 ], ( col == 0 ? 3 : 1 ) * 0.01, bounds[ 3 ] - bounds[ 1 ] );
  }

  // ctx.globalAlpha = 0.5;

  drawTile( ctx, 'dirt_center_E', -1, 0, 0 );
  drawTile( ctx, 'grass_riverBend_N', 0, 0, 0 );
  drawTile( ctx, 'grass_riverSplit_E', 1, 0, 0 );
  drawTile( ctx, 'grass_riverBend_E', 2, 0, 0 );
  drawTile( ctx, 'grass_river_W', 0, 1, 0 );
  drawTile( ctx, 'grass_river_E', 1, 1, 0 );
  drawTile( ctx, 'grass_river_E', 2, 1, 0 );
  drawTile( ctx, 'grass_riverBend_S', 0, 2, 0 );
  drawTile( ctx, 'grass_riverEnd_W', 1, 2, 0 );
  drawTile( ctx, 'grass_riverBend_W', 2, 2, 0 );

  drawTile( ctx, 'dirt_center_E', -1, 0, 1 );
}

gameCanvas.redraw();

function drawTile( ctx, name, col, row, level ) {
  const [ sx, sy, sw, sh ] = json[ name ];

  const w = 1;
  const h = w / 2;

  const x = w * ( col - row - 1 ) / 2;
  const y = h * ( row + col - level * 2 ) / 2;

  const scale = 1.2;
  const dw = w * scale;
  const dh = ( sh / sw ) * scale;
  const dx = x - ( dw - w ) / 2;
  const dy = y - dh * 0.65;   // the kenney tiles are extra tall, for some reason

  // ctx.fillStyle = 'green';
  // ctx.fillRect( x, y, w, h );

  // ctx.fillStyle = 'gray';
  // ctx.fillRect( dx, dy, dw, dh );

  ctx.drawImage( image, sx, sy, sw, sh, dx, dy, dw, dh );
}
