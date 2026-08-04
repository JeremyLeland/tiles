// Trying another idea -- tiles are determined by 3x3 array of solid or not
// This is more like my previous 2x2 solid-or-not tiles, but allows for 30/60 slopes
// Maybe these will be easier to work with, the other tiles were fragile to edit

import { GameCanvas } from '../src/common/GameCanvas.js';
import * as Util from '../src/common/Util.js';

// Starting at zero radians and going counter-clockwise, so normals point away from fill
const TilePoints = [
  [ 1,   0.5 ],
  [ 1,   0   ],
  [ 0.5, 0   ],
  [ 0,   0   ],
  [ 0,   0.5 ],
  [ 0,   1   ],
  [ 0.5, 1   ],
  [ 1,   1   ],
];


const gameCanvas = new GameCanvas();

gameCanvas.setBounds( -0.5, -0.5, 0.5 + 16 * 1.1, 0.5 + 16 * 1.1 );

gameCanvas.draw = ( ctx ) => {

  ctx.lineWidth = 0.01;

  for ( let row = 0; row < 16; row ++ ) {
    for ( let col = 0; col < 16; col ++ ) {
      const number = col + row * 16;

      ctx.save(); {
        ctx.translate( col * 1.1, row * 1.1 );

        ctx.strokeStyle = 'yellow';
        ctx.strokeRect( 0, 0, 1, 1 );

        for ( let index = 0; index < TilePoints.length; index ++ ) {
          const value = number & ( 1 << index );

          ctx.fillStyle = value == 0 ? 'darkred' : 'green';
          Util.drawPoint( ctx, TilePoints[ index ], 0.05 );
        }

        ctx.fillStyle = 'gray';
        drawTile( ctx, number );
      }
      ctx.restore();
    }
  }

}

function drawTile( ctx, number ) {
  // 1. Find first solid point after an empty point -- start before
  // 2. Find last solid point before an empty point -- end after
  // 3. Repeat?

  ctx.beginPath();

  let foundEmpty = false, foundSolid = false;
  let firstIndex = null;

  // Continue around the circle part of a second time if needed
  // firstIndex should let us stop once we've gotten back to where we started

  for ( let i = 0; i < TilePoints.length * 2; i ++ ) {
    const index = i % TilePoints.length;

    if ( index === firstIndex ) {
      break;
    }

    const tilePoint = TilePoints[ index ];

    const value = number & ( 1 << index );

    if ( value === 0 ) {
      if ( foundSolid ) {
        ctx.lineTo( ...TilePoints.at( index ) );
      }
      foundEmpty = true;
      foundSolid = false;
    }
    else {
      if ( foundEmpty ) {
        ctx.moveTo( ...TilePoints.at( index - 1 ) );
        firstIndex ??= index;
      }
      foundEmpty = false;
      foundSolid = true;
    }
  }

  ctx.strokeStyle = 'gray';
  ctx.stroke();
}
