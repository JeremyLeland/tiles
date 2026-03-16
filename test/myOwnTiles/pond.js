import { GameCanvas } from '../../src/common/GameCanvas.js';

const Dirs = {
  north: 0,
  east: 1,
  south: 2,
  west: 3,
};

// scaleX, skewY, skewX, scaleY, translateX, translateY
const IsometricTransforms = {
  north:  [  1,  0.5, -1,  0.5, 0, 0 ],
  east:   [ -1,  0.5, -1, -0.5, 0, 0 ],
  south:  [ -1, -0.5,  1, -0.5, 0, 0 ],
  west:   [  1, -0.5,  1,  0.5, 0, 0 ],
  left:   [  1,  0.5,  0,  1, -0.5, 0.75 ],
  right:  [  1, -0.5,  0,  1,  0.5, 0.75 ],
};

const YAxes = {
  north:  [  1,  1 ],
  east:   [  1, -1 ],
  south:  [ -1, -1 ],
  west:   [ -1,  1 ],
};

function moveZ( ctx, dir, dist ) {
  const yAxis = YAxes[ dir ];
  ctx.translate( dist * yAxis[ 0 ], dist * yAxis[ 1 ] );
}

function frontLeft( ctx ) {
  ctx.fillStyle = 'tan';
  ctx.fillRect( -0.5, -0.3, 1, 1 - 0.2 );

  ctx.fillStyle = 'green';
  ctx.fillRect( -0.5, -0.5, 0.2, 0.2 );
}

function frontRight( ctx ) {
  ctx.fillStyle = 'tan';
  ctx.fillRect( -0.5, -0.3, 1, 1 - 0.2 );

  ctx.fillStyle = 'green';
  ctx.fillRect( 0.3, -0.5, 0.2, 0.2 );
}

function back( ctx ) {
  ctx.fillStyle = 'tan';
  ctx.fillRect( -0.5, -0.3, 1, 1 - 0.2 );

  ctx.fillStyle = 'green';
  ctx.fillRect( -0.5, -0.5, 1, 0.2 );
}

const Sides = [ frontLeft, frontRight, back, back ];

function drawTile( ctx, direction ) {
  // Top
  ctx.save(); {

    ctx.transform( ...IsometricTransforms[ direction ] );

    // Water
    ctx.save(); {
      moveZ( ctx, direction, 0.2 );

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

      moveZ( ctx, direction, 0.2 );

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

  // Left
  ctx.save(); {
    ctx.transform( ...IsometricTransforms.left );

    Sides[ Dirs[ direction ] ]( ctx );
  }
  ctx.restore();

  // Right
  ctx.save(); {
    ctx.transform( ...IsometricTransforms.right );

    Sides[ ( Dirs[ direction ] + 1 ) % 4 ]( ctx );
  }
  ctx.restore();
}

const gameCanvas = new GameCanvas();
gameCanvas.bounds = [ -2, -2, 2, 2 ];
gameCanvas.backgroundColor = '#123';

gameCanvas.draw = ( ctx ) => {
  drawGrid( ctx, gameCanvas.bounds );

  const cols = 2, rows = 2;
  const tiles = [
    'north', 'east',
    'west', 'south',
  ];

  for ( let row = 0; row < rows; row ++ ) {
    for ( let col = 0; col < cols; col ++ ) {
      ctx.save(); {
        ctx.translate( col - row, ( row + col ) / 2 );
        drawTile( ctx, tiles[ col + row * cols ] );
      }
      ctx.restore();
    }
  }
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
