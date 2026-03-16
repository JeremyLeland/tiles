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
  ctx.fillStyle = 'gray';
  for ( let row = bounds[ 1 ]; row <= bounds[ 3 ]; row ++ ) {
    ctx.fillRect( bounds[ 0 ], row, bounds[ 2 ] - bounds[ 0 ], 0.01 );
  }
  for ( let col = bounds[ 0 ]; col <= bounds[ 2 ]; col ++ ) {
    ctx.fillRect( col, bounds[ 1 ], 0.01, bounds[ 3 ] - bounds[ 1 ] );
  }

  drawTile( ctx, 'building_center_E', 0, 0 );
  drawTile( ctx, 'building_center_E', 1, 0 );
  drawTile( ctx, 'trees_S', 1, 1 );
  drawTile( ctx, 'building_center_N', 2, 2 );
  drawTile( ctx, 'building_center_S', 3, 3 );
}

gameCanvas.redraw();

function drawTile( ctx, name, x, y ) {
  const [ sx, sy, sw, sh ] = json[ name ];

  const dw = 1;
  const dh = ( sh / sw );

  // ctx.fillRect( x - dw / 2, y - dh / 2, dw, dh );

  ctx.drawImage(
    image,

    sx, sy, sw, sh,

    x - dw / 2,
    y - dh + dw / 4,
    dw,
    dh,
  );
}