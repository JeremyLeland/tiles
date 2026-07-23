// There's probabaly a better name for these, I can look it up at some point
// Not all of these make sense, but this shows all the possibilities

// Starting at zero radians and going counter-clockwise, so normals point away from fill
const TilePoints = [
  [ 1, 0.5 ],
  [ 1, 0 ],
  [ 0.5, 0 ],
  [ 0, 0 ],
  [ 0, 0.5 ],
  [ 0, 1 ],
  [ 0.5, 1 ],
  [ 1, 1 ],
];

const NumPoints = TilePoints.length;


import { GameCanvas } from "../src/common/GameCanvas.js";

const gameCanvas = new GameCanvas();

gameCanvas.setBounds( -0.5, -0.5, NumPoints + 1.5, NumPoints + 1.5 );

gameCanvas.draw = ( ctx ) => {
  for ( let i = 0; i < NumPoints; i ++ ) {
    for ( let j = 0; j < NumPoints; j ++ ) {

      if ( Math.abs( i - j ) < 2 || Math.abs( i - j ) > 6 ) {
        continue;
      }

      ctx.save(); {
        ctx.translate( i * 1.1, j * 1.1 );

        ctx.lineWidth = 0.01;
        ctx.strokeStyle = 'dimgray';
        ctx.strokeRect( 0, 0, 1, 1 );

        ctx.lineWidth = 0.01;
        ctx.strokeStyle = 'yellow';
        ctx.fillStyle = 'gray';
        drawTile( ctx, i, j );


        // sanity check
        ctx.lineWidth = 0.02;
        ctx.strokeStyle = 'white';
        drawLine( ctx, TilePoints[ i ], TilePoints[ j ] );

        ctx.fillStyle = 'lime';
        drawPoint( ctx, TilePoints[ i ], 0.03 );

        ctx.fillStyle = 'red';
        drawPoint( ctx, TilePoints[ j ], 0.03 );

      }
      ctx.restore();
    }
  }
}

function drawTile( ctx, startIndex, endIndex ) {
  const length = endIndex - startIndex + ( endIndex < startIndex ? NumPoints : 0 );

  ctx.beginPath();

  for ( let i = 0; i <= length; i ++ ) {
    ctx.lineTo( ...TilePoints.at( ( startIndex + i ) % NumPoints ) );
  }

  ctx.fill();
  // ctx.stroke();
}

function drawLine( ctx, start, end ) {
  ctx.beginPath();
  ctx.moveTo( ...start );
  ctx.lineTo( ...end );
  ctx.stroke();
}

function drawPoint( ctx, p, radius = 0.02 ) {
  ctx.beginPath();
  ctx.arc( p[ 0 ], p[ 1 ], radius, 0, Math.PI * 2 );
  ctx.fill();
}