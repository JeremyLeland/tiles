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

gameCanvas.setBounds( -0.5, -0.5, 0.5 + NumPoints * 1.1, 0.5 + NumPoints * 1.1 );

gameCanvas.draw = ( ctx ) => {
  for ( let row = 0; row < NumPoints; row ++ ) {
    for ( let col = 0; col < NumPoints; col ++ ) {

      if ( Math.abs( row - col ) < 2 || Math.abs( row - col ) > 6 ) {
        continue;
      }

      ctx.save(); {
        ctx.translate( col * 1.1, row * 1.1 );

        ctx.lineWidth = 0.01;
        ctx.strokeStyle = 'dimgray';
        ctx.strokeRect( 0, 0, 1, 1 );

        ctx.lineWidth = 0.01;
        ctx.strokeStyle = 'yellow';
        ctx.fillStyle = 'gray';
        drawTile( ctx, col, row );


        // sanity check
        ctx.lineWidth = 0.02;
        ctx.strokeStyle = 'white';
        drawLine( ctx, TilePoints[ col ], TilePoints[ row ] );

        ctx.fillStyle = 'lime';
        drawPoint( ctx, TilePoints[ col ], 0.03 );

        ctx.fillStyle = 'red';
        drawPoint( ctx, TilePoints[ row ], 0.03 );


        // value
        const value = ( col << 3 ) | row;

        drawText( ctx, `0x${ value.toString( 2 ).padStart( 6, 0 ) }`, 0.5, 0.5 );
        drawText( ctx, value, 0.5, 0.75 );

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

function drawText( ctx, text, x, y ) {
  ctx.save(); {
    // Firefox doesn't play nice with small font sizes, so scale it instead
    ctx.translate( x, y );
    ctx.scale( 0.02, 0.02 );
    ctx.font = '10px Arial';

    ctx.fillStyle = 'white';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    ctx.shadowColor = 'black';
    ctx.shadowBlur = 8;

    ctx.fillText( text, 0, 0 );
  }
  ctx.restore();
}