// There's probabaly a better name for these, I can look it up at some point
// Not all of these make sense, but this shows all the possibilities

import * as PartialTiles from '../src/PartialTiles.js';
import { GameCanvas } from '../src/common/GameCanvas.js';

const gameCanvas = new GameCanvas();

gameCanvas.setBounds( -0.5, -0.5, 0.5 + PartialTiles.NumPoints * 1.1, 0.5 + PartialTiles.NumPoints * 1.1 );

gameCanvas.draw = ( ctx ) => {
  for ( let row = 0; row < PartialTiles.NumPoints; row ++ ) {
    for ( let col = 0; col < PartialTiles.NumPoints; col ++ ) {

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
        PartialTiles.drawTile( ctx, col, row );


        // sanity check
        ctx.lineWidth = 0.02;
        ctx.strokeStyle = 'white';
        drawLine( ctx, PartialTiles.TilePoints[ col ], PartialTiles.TilePoints[ row ] );

        ctx.fillStyle = 'lime';
        drawPoint( ctx, PartialTiles.TilePoints[ col ], 0.03 );

        ctx.fillStyle = 'red';
        drawPoint( ctx, PartialTiles.TilePoints[ row ], 0.03 );


        // value
        const value = ( col << 3 ) | row;

        drawText( ctx, `${ col } 🡪 ${ row }`, 0.5, 0.25 );
        drawText( ctx, `0b${ value.toString( 2 ).padStart( 6, 0 ) }`, 0.5, 0.5 );
        drawText( ctx, value, 0.5, 0.75 );

      }
      ctx.restore();
    }
  }
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