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

const cols = 16, rows = 16;
const map = Array( cols * rows ).fill( 1 );

const tileCols = cols - 1;
const tileRows = rows - 1;
const tileSize = 1;

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
      const NW_index = col + row * cols;
      const NE_index = NW_index + 1;
      const SW_index = NW_index + cols;
      const SE_index = SW_index + 1;

      const NW = map[ NW_index ] === 1;
      const NE = map[ NE_index ] === 1;
      const SW = map[ SW_index ] === 1;
      const SE = map[ SE_index ] === 1;

      const N = NW || NE;
      const W = NW || SW;
      const S = SW || SE;
      const E = SE || NE;

      // match TilePoints order
      const values = [
        E, NE, N, NW, W, SW, S, SE
      ];

      ctx.beginPath();
      TilePoints.forEach( ( p, pIndex ) => {
        if ( values[ pIndex ] ) {
          ctx.lineTo( 0.5 + col + p[ 0 ], 0.5 + row + p[ 1 ] );
        }
      } );
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

  ctx.lineWidth = 0.02;
  ctx.strokeStyle = '#ff04';
  for ( let row = 0; row < tileRows; row ++ ) {
    for ( let col = 0; col < tileCols; col ++ ) {
      ctx.strokeRect( 0.5 + col * tileSize, 0.5 + row * tileSize, tileSize, tileSize );
    }
  }
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