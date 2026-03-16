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

    ctx.fillStyle = 'gray';
    ctx.fillRect( -0.5, -0.5, 0.25, 0.25 );
    ctx.fillRect( -0.25, -0.25, 0.25, 0.25 );
  }
  ctx.restore();

  // Left
  ctx.save(); {
    // scaleX, skewY, skewX, scaleY, translateX, translateY
    ctx.transform( 1, 0.5, 0, 1, -0.5, 0.75 );

    ctx.fillStyle = 'brown';
    ctx.fillRect( -0.5, -0.5, 1, 1 );

    ctx.fillStyle = 'gray';
    ctx.fillRect( -0.5, -0.5, 0.25, 0.25 );
    ctx.fillRect( -0.25, -0.25, 0.25, 0.25 );
  }
  ctx.restore();

  // Right
  ctx.save(); {
    // scaleX, skewY, skewX, scaleY, translateX, translateY
    ctx.transform( 1, -0.5, 0, 1, 0.5, 0.75 );

    ctx.fillStyle = 'brown';
    ctx.fillRect( -0.5, -0.5, 1, 1 );

    ctx.fillStyle = 'gray';
    ctx.fillRect( -0.5, -0.5, 0.25, 0.25 );
    ctx.fillRect( -0.25, -0.25, 0.25, 0.25 );
  }
  ctx.restore();
}

gameCanvas.redraw();