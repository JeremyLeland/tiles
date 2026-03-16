import { GameCanvas } from '../../src/common/GameCanvas.js';

const gameCanvas = new GameCanvas();
gameCanvas.bounds = [ -2, -2, 2, 2 ];
gameCanvas.backgroundColor = '#123';

gameCanvas.draw = ( ctx ) => {

  const bounds = gameCanvas.bounds;
  ctx.fillStyle = 'gray';
  for ( let row = bounds[ 1 ]; row <= bounds[ 3 ]; row++ ) {
    ctx.fillRect( bounds[ 0 ], row, bounds[ 2 ] - bounds[ 0 ], 0.01 );
  }
  for ( let col = bounds[ 0 ]; col <= bounds[ 2 ]; col++ ) {
    ctx.fillRect( col, bounds[ 1 ], 0.01, bounds[ 3 ] - bounds[ 1 ] );
  }

  // Top
  ctx.save(); {
    // scaleX, skewY, skewX, scaleY, translateX, translateY
    const IsometricTransforms = {
      north: [  1,  0.5, -1,  0.5, 0, 0 ],
      east:  [ -1,  0.5, -1, -0.5, 0, 0 ],
      south: [ -1, -0.5,  1, -0.5, 0, 0 ],
      west:  [  1, -0.5,  1,  0.5, 0, 0 ],
    };

    const DownTransforms = {
      north: [ 1, 0, 0, 1,  0.2,  0.2 ],
      east:  [ 1, 0, 0, 1,  0.2, -0.2 ],
      south: [ 1, 0, 0, 1, -0.2, -0.2 ],
      west:  [ 1, 0, 0, 1, -0.2,  0.2 ],
    };

    const Direction = 'north';

    ctx.transform( ...IsometricTransforms[ Direction ] );
    const transformDown = DownTransforms[ Direction ];

    // Water
    ctx.save(); {
      ctx.transform( ...transformDown );

      ctx.beginPath();
      ctx.moveTo( 0.5, -0.3 );
      ctx.quadraticCurveTo( -0.2, -0.2, -0.3, 0.5 );
      ctx.lineTo( 0.5, 0.5 );
      ctx.closePath();

      ctx.fillStyle = 'cyan';
      ctx.fill();
    }
    ctx.restore();

    // Downward
    ctx.save(); {
      ctx.beginPath();
      ctx.moveTo( 0.5, -0.3 );
      ctx.quadraticCurveTo( -0.2, -0.2, -0.3, 0.5 );

      ctx.transform( ...transformDown );

      ctx.lineTo( -0.3, 0.5 );
      ctx.quadraticCurveTo( -0.2, -0.2, 0.5, -0.3 );
      ctx.closePath();

      ctx.fillStyle = '#060';
      ctx.fill();
    }
    ctx.restore();

    // Top
    ctx.beginPath();
    ctx.moveTo( -0.5, -0.5 );
    ctx.lineTo( 0.5, -0.5 );
    ctx.lineTo( 0.5, -0.3 );
    ctx.quadraticCurveTo( -0.2, -0.2, -0.3, 0.5 );
    ctx.lineTo( -0.5, 0.5 );
    ctx.closePath();

    ctx.fillStyle = 'green';
    ctx.fill();


    // clear path so next ones don't screw it up
    ctx.beginPath();
  }
  ctx.restore();

  // // Left
  // ctx.save(); {
  //   // scaleX, skewY, skewX, scaleY, translateX, translateY
  //   ctx.transform( 1, 0.5, 0, 1, -0.5, 0.75 );

  //   ctx.fillStyle = 'tan';
  //   ctx.fillRect( -0.5, -0.3, 1, 1 - 0.2 );

  //   ctx.fillStyle = 'green';
  //   ctx.fillRect( -0.5, -0.5, 0.2, 0.2 );

  //   ctx.fill();
  // }
  // ctx.restore();

  // // Right
  // ctx.save(); {
  //   // scaleX, skewY, skewX, scaleY, translateX, translateY
  //   ctx.transform( 1, -0.5, 0, 1, 0.5, 0.75 );

  //   ctx.fillStyle = 'tan';
  //   ctx.fillRect( -0.5, -0.3, 1, 1 - 0.2 );

  //   ctx.fillStyle = 'green';
  //   ctx.fillRect( 0.3, -0.5, 0.2, 0.2 );

  //   // drawDirt( ctx );
  // }
  // ctx.restore();
}

gameCanvas.redraw();
