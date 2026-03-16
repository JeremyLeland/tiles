import { GameCanvas } from '../src/common/GameCanvas.js';

const gameCanvas = new GameCanvas();
gameCanvas.bounds = [ -4, -4, 4, 4 ];
gameCanvas.backgroundColor = '#123';

gameCanvas.draw = ( ctx ) => {
  ctx.fillStyle = 'gray';
  drawGrid( ctx, gameCanvas.bounds );

  // scaleX, skewY, skewX, scaleY, translateX, translateY
  ctx.transform( 1, 0.5, -1, 0.5, 0, 0 );

  drawTile( ctx, 0, 0, 'red' );
  drawTile( ctx, 1, 0, 'orange' );
  drawTile( ctx, 2, 0, 'yellow' );
  drawTile( ctx, 0, 1, 'green' );
  drawTile( ctx, 1, 1, 'blue' );
  drawTile( ctx, 2, 1, 'purple' );
}

gameCanvas.redraw();

function drawGrid( ctx, bounds, thickness = 0.01 ) {
  for ( let row = bounds[ 1 ]; row <= bounds[ 3 ]; row ++ ) {
    ctx.fillRect( bounds[ 0 ], row, bounds[ 2 ] - bounds[ 0 ], thickness );
  }
  for ( let col = bounds[ 0 ]; col <= bounds[ 2 ]; col ++ ) {
    ctx.fillRect( col, bounds[ 1 ], thickness, bounds[ 3 ] - bounds[ 1 ] );
  }
}

function drawTile( ctx, x, y, color ) {
  ctx.fillStyle = color;
  ctx.fillRect( x - 0.5, y - 0.5, 1, 1 );
}