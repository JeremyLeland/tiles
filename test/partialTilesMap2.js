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

const cols = 7, rows = 5;
const map = [
  1, 0, 1, 1, 0, 0, 0,
  0, 1, 0, 1, 1, 0, 1,
  1, 0, 1, 1, 1, 0, 1,
  1, 0, 0, 1, 1, 0, 0,
  1, 0, 0, 0, 1, 0, 0,
];

const tileCols = ( cols - 1 ) / 2;
const tileRows = ( rows - 1 ) / 2;

const gameCanvas = new GameCanvas();

gameCanvas.setBounds( -0.5, -0.5, 0.5 + tileCols, 0.5 + tileRows );

gameCanvas.draw = ( ctx ) => {

  const SIZE = 1 / 2;

  ctx.lineWidth = 0.01;

  for ( let row = 0; row < rows; row ++ ) {
    for ( let col = 0; col < cols; col ++ ) {
      if ( row !== 1 || col !== 1 ) {
        ctx.fillStyle = map[ col + row * cols ] === 1 ? '#aaa8' : '#1238';
        ctx.fillRect( ( col - 0.5 ) * 0.5, ( row - 0.5 ) * 0.5, 0.5, 0.5 );
      }
    }
  }

  ctx.fillStyle = 'gray';

  for ( let tileRow = 0; tileRow < tileRows; tileRow ++ ) {
    for ( let tileCol = 0; tileCol < tileCols; tileCol ++ ) {
      const left = tileCol * 2;
      const top  = tileRow * 2;

      ctx.save(); {
        ctx.translate( tileCol + 0.05, tileRow + 0.05 );
        ctx.scale( 0.9, 0.9 );

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

          const col = left + tilePoint[ 0 ] * 2;
          const row = top + tilePoint[ 1 ] * 2;

          const value = map[ col + row * cols ];

          if ( value === 0 ) {
            if ( foundSolid ) {
              ctx.lineTo( ...TilePoints.at( index ) );
            }
            foundEmpty = true;
            foundSolid = false;
          }
          else if ( value === 1 ) {
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

      ctx.restore();
    }
  }

  //
  // Grid
  //
  ctx.strokeStyle = '#fa08';
  for ( let row = 0; row < rows; row ++ ) {
    for ( let col = 0; col < cols; col ++ ) {
      ctx.strokeRect( ( col - 0.5 ) * 0.5, ( row - 0.5 ) * 0.5, 0.5, 0.5 );
    }
  }


  ctx.strokeStyle = '#ff08';
  for ( let row = 0; row < tileRows; row ++ ) {
    for ( let col = 0; col < tileCols; col ++ ) {
      ctx.strokeRect( col, row, 1, 1 );
    }
  }
}
