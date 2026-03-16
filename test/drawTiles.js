import { GameCanvas } from '../src/common/GameCanvas.js';

const tilePath = new Path2D( 'M -1,0 L 0,-0.5 L 1,0 L 0,0.5 Z' );

const colors = [ 'green', 'blue', 'brown' ];

const rows = 3, cols = 4;
const map = [
  0, 1, 0, 0,
  0, 1, 1, 2,
  0, 1, 0, 0,
];

function drawTile( ctx, color, col, row ) {
  ctx.fillStyle = color;

  const w = 1;
  const h = w / 2;

  const x = w * ( col + row );
  const y = h * ( row - col );

  ctx.save();
  ctx.translate( x, y );
  ctx.fill( tilePath );
  ctx.restore();
}


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

  for ( let row = 0; row < rows; row ++ ) {
    for ( let col = 0; col < cols; col ++ ) {
      drawTile( ctx, colors[ map[ col + row * cols ] ], col, row );
    }
  }
}

gameCanvas.redraw();