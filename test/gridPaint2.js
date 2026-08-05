// Let's make an editable grid of solid and empty, then see how it would get interpretted as 2x2 or 3x3 tiles

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

const cols = 3, rows = 3;
// const map = Array( cols * rows ).fill( 1 );

const map = [
  0, 0, 1,
  0, 0, 1,
  0, 0, 0,
];

const tileCols = ( cols - 1 ) / 2;
const tileRows = ( rows - 1 ) / 2;
const tileSize = 2;

const gameCanvas = new GameCanvas();

gameCanvas.setBounds( -0.5, -0.5, 0.5 + cols, 0.5 + rows );

gameCanvas.draw = ( ctx ) => {

  ctx.lineWidth = 0.01;

  for ( let row = 0; row < rows; row ++ ) {
    for ( let col = 0; col < cols; col ++ ) {
      const index = col + row * cols;

      ctx.fillStyle = map[ index ] === 1 ? '#5555' : '#1235';
      ctx.fillRect( col, row, 1, 1 );
    }
  }

  for ( let row = 0; row < tileRows; row ++ ) {
    for ( let col = 0; col < tileCols; col ++ ) {
      const NW_index = 2 * col + 2 * row * cols;
      const N_index  = NW_index + 1;
      const NE_index = N_index + 1;

      const W_index  = NW_index + cols;
      // ignore middle cell
      const E_index  = W_index + 2;

      const SW_index = W_index + cols;
      const S_index  = SW_index + 1;
      const SE_index = S_index + 1;

      const NW = map[ NW_index ] === 1;
      const N  = map[ N_index  ] === 1;
      const NE = map[ NE_index ] === 1;
      const W  = map[ W_index  ] === 1;
      const E  = map[ E_index  ] === 1;
      const SW = map[ SW_index ] === 1;
      const S  = map[ S_index  ] === 1;
      const SE = map[ SE_index ] === 1;

      // match TilePoints order
      const values = [
        E, NE, N, NW, W, SW, S, SE
      ];

      ctx.beginPath();

      let foundEmpty = false, foundSolid = false;
      let firstIndex = null;

      for ( let i = 0; i < TilePoints.length * 2; i ++ ) {
        const pIndex = i % TilePoints.length;
        if ( pIndex === firstIndex ) {
          break;
        }

        const value = values[ pIndex ];

        if ( value === false ) {
          if ( foundSolid ) {
            const p = TilePoints.at( pIndex );
            const x = 0.5 + ( col + p[ 0 ] ) * tileSize;
            const y = 0.5 + ( row + p[ 1 ] ) * tileSize;

            // Wait until we've found our good starting point to draw
            if ( firstIndex !== null ) {
              ctx.lineTo( x, y );
              ctx.closePath();
            }
          }
          foundEmpty = true;
          foundSolid = false;
        }
        else {
          if ( foundEmpty ) {
            const p = TilePoints.at( pIndex - 1 );
            const x = 0.5 + ( col + p[ 0 ] ) * tileSize;
            const y = 0.5 + ( row + p[ 1 ] ) * tileSize;

            ctx.moveTo( x, y );
            firstIndex ??= pIndex;
          }
          foundEmpty = false;
          foundSolid = true;

          const p = TilePoints.at( pIndex );
          const x = 0.5 + ( col + p[ 0 ] ) * tileSize;
          const y = 0.5 + ( row + p[ 1 ] ) * tileSize;

          ctx.lineTo( x, y );
        }
      }

      ctx.closePath();

      ctx.fillStyle = '#8885';
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.stroke();
    }
  }

  //
  // Grid
  //

  ctx.strokeStyle = '#fa04';
  for ( let row = 0; row < rows; row ++ ) {
    for ( let col = 0; col < cols; col ++ ) {
      ctx.strokeRect( col, row, 1, 1 );
    }
  }

  // ctx.lineWidth = 0.02;
  // ctx.strokeStyle = '#ff04';
  // for ( let row = 0; row < tileRows; row ++ ) {
  //   for ( let col = 0; col < tileCols; col ++ ) {
  //     ctx.strokeRect( 0.5 + col * tileSize, 0.5 + row * tileSize, tileSize, tileSize );
  //   }
  // }
}

function pointerInput( m ) {
  if ( m.buttons > 0 ) {
    const col = Math.floor( m.x );
    const row = Math.floor( m.y );
    const index = col + row * cols;

    map[ index ] = m.buttons === 1 ? 1 : 0;

    gameCanvas.redraw();
  }
}

gameCanvas.pointerDown = pointerInput;
gameCanvas.pointerMove = pointerInput;