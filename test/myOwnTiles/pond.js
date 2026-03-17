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

function Grass() {
  function top( ctx, direction ) {
    ctx.fillStyle = 'green';
    ctx.fillRect( -0.5, -0.5, 1, 1 );
  }

  function side( ctx ) {
    ctx.fillStyle = 'tan';
    ctx.fillRect( -0.5, -0.3, 1, 1 - 0.2 );

    ctx.fillStyle = 'green';
    ctx.fillRect( -0.5, -0.5, 1, 0.2 );
  }

  return {
    Top: top,
    Sides: [ side, side, side, side ],
  }
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

function PondCurve() {
  function top( ctx, direction ) {
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
  }

  return {
    Top: top,
    Sides: [ frontLeft, frontRight, back, back ],
  }
}

function PondEdge() {
  function top( ctx, direction ) {
    // Water
    ctx.save(); {
      moveZ( ctx, direction, 0.2 );

      ctx.fillStyle = 'cyan';
      ctx.fillRect( -0.5, -0.3, 1, 1 - 0.2 );
    }
    ctx.restore();

    // Downward
    ctx.save(); {
      ctx.beginPath();
      ctx.moveTo( -0.5, -0.3 );
      ctx.lineTo(  0.5, -0.3 );

      moveZ( ctx, direction, 0.2 );

      ctx.lineTo( 0.5, -0.3 );
      ctx.lineTo( -0.5, -0.3 );
      ctx.closePath();

      ctx.fillStyle = '#060';
      ctx.fill();
    }
    ctx.restore();

    // Top
    ctx.fillStyle = 'green';
    ctx.fillRect( -0.5, -0.5, 1, 0.2 );
  }

  return {
    Top: top,
    Sides: [ back, frontRight, back, frontLeft ],
  }
}

const TileInfo = {
  Grass: Grass(),
  PondCurve: PondCurve(),
  PondEdge: PondEdge(),
}

function drawTile( ctx, tileInfo, direction ) {
  // Top
  ctx.save(); {

    ctx.transform( ...IsometricTransforms[ direction ] );

    tileInfo.Top( ctx, direction );
  }
  ctx.restore();

  // Left
  ctx.save(); {
    ctx.transform( ...IsometricTransforms.left );

    tileInfo.Sides[ Dirs[ direction ] ]( ctx );
  }
  ctx.restore();

  // Right
  ctx.save(); {
    ctx.transform( ...IsometricTransforms.right );

    tileInfo.Sides[ ( Dirs[ direction ] + 1 ) % 4 ]( ctx );
  }
  ctx.restore();
}

const Tiles = {
  Grass: { name: 'Grass', dir: 'north' },
  PondCurve_north: { name: 'PondCurve', dir: 'north'  },
  PondCurve_east:  { name: 'PondCurve', dir: 'east'   },
  PondCurve_south: { name: 'PondCurve', dir: 'south'  },
  PondCurve_west:  { name: 'PondCurve', dir: 'west'   },
  PondEdge_north: { name: 'PondEdge', dir: 'north'  },
  PondEdge_east:  { name: 'PondEdge', dir: 'east'   },
  PondEdge_south: { name: 'PondEdge', dir: 'south'  },
  PondEdge_west:  { name: 'PondEdge', dir: 'west'   },
};

const gameCanvas = new GameCanvas();
gameCanvas.bounds = [ -4, -2, 4, 6 ];
gameCanvas.backgroundColor = '#123';

gameCanvas.draw = ( ctx ) => {
  drawGrid( ctx, gameCanvas.bounds );

  const cols = 4, rows = 3, levels = 2;
  const tiles = [
    Tiles.Grass, Tiles.PondCurve_north, Tiles.PondEdge_north, Tiles.PondCurve_east,
    Tiles.Grass, Tiles.PondEdge_west, Tiles.Grass, Tiles.PondEdge_east,
    Tiles.Grass, Tiles.PondCurve_west, Tiles.PondEdge_south, Tiles.PondCurve_south,

    Tiles.Grass, null, null, null,
    null, null, null, null,
    null, null, null, null,
  ];

  for ( let level = 0; level < levels; level ++ ) {
    for ( let row = 0; row < rows; row ++ ) {
      for ( let col = 0; col < cols; col ++ ) {
        ctx.save(); {
          ctx.translate( col - row, ( row + col - level * 2 ) / 2 );

          const tile = tiles[ col + row * cols + level * rows * cols ];

          if ( tile ) {
            drawTile( ctx, TileInfo[ tile.name ], tile.dir );
          }
        }
        ctx.restore();
      }
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
