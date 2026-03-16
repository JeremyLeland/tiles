import { GameCanvas } from '../src/common/GameCanvas.js';

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

  // Top
  ctx.save(); {
    // scaleX, skewY, skewX, scaleY, translateX, translateY
    ctx.transform( 1, 0.5, -1, 0.5, 0, 0 );

    ctx.fillStyle = 'green';
    ctx.fillRect( -0.5, -0.5, 1, 1 );

    ctx.fillStyle = 'darkgreen';
    drawDetail( ctx, 8, 8, 0.02, 0.04 );

    ctx.fillStyle = '#090';
    drawDetail( ctx, 8, 8, 0.02, 0.04 );
  }
  ctx.restore();

  // Left
  ctx.save(); {
    // scaleX, skewY, skewX, scaleY, translateX, translateY
    ctx.transform( 1, 0.5, 0, 1, -0.5, 0.75 );

    drawDirt( ctx );
  }
  ctx.restore();

  // Right
  ctx.save(); {
    // scaleX, skewY, skewX, scaleY, translateX, translateY
    ctx.transform( 1, -0.5, 0, 1, 0.5, 0.75 );

    drawDirt( ctx );
  }
  ctx.restore();
}

gameCanvas.redraw();

function drawDirt( ctx ) {
  ctx.fillStyle = '#640';
  ctx.fillRect( -0.5, -0.5, 1, 1 );

  ctx.fillStyle = '#530';
  drawDetail( ctx, 4, 4, 0.03, 0.06 );

  ctx.fillStyle = 'gray';
  drawDetail( ctx, 3, 3, 0.03, 0.06 );
}

function drawDetail( ctx, cols, rows, minSize, maxSize ) {
  for ( let row = 0; row < rows; row ++ ) {
    for ( let col = 0; col < cols; col ++ ) {
      const size = minSize + Math.random() * ( maxSize - minSize );
      const x = Math.random() * ( 1 / cols - size );
      const y = Math.random() * ( 1 / rows - size );
      ctx.fillRect( -0.5 + col / cols + x, -0.5 + row / rows + y, size, size );
    }
  }
}