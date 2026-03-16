import { GameCanvas } from '../src/common/GameCanvas.js';

const paths = {
  top: new Path2D( 'M -1,0 L 0,-0.5 L 1,0 L 0,0.5 Z' ),
  left: new Path2D( 'M -1,0 L -1,1 L 0,1.5 L 0,0.5 Z' ),
  right: new Path2D( 'M  1,0 L  1,1 L 0,1.5 L 0,0.5 Z' ),
};

const colors = [ null, 'green', 'blue', 'brown' ];

const rows = 3, cols = 4;
const map = [
  1, 2, 1, 1,
  1, 2, 2, 3,
  1, 2, 1, 1,

  1, 0, 0, 0,
  1, 0, 0, 0,
  0, 0, 0, 0,
];

function drawTile( ctx, color, col, row, height ) {

  const w = 1;
  const h = w / 2;

  const x = w * ( col - row );
  const y = h * ( row + col - height * 2 );

  ctx.save();
  ctx.translate( x, y );
  ctx.fillStyle = color;
  ctx.fill( paths.top );
  ctx.fillStyle = 'brown';
  ctx.fill( paths.left );
  ctx.fill( paths.right );
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

  for ( let height = 0; height < 2; height ++ ) {
    for ( let row = 0; row < rows; row ++ ) {
      for ( let col = 0; col < cols; col ++ ) {
        const colorIndex = map[ col + row * cols + height * cols * rows ];

        if ( colorIndex > 0 ) {
          drawTile( ctx, colors[ colorIndex ], col, row, height );
        }
      }
    }
  }
}

gameCanvas.redraw();