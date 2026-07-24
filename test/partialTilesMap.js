// Draw a map of partial tiles

import * as PartialTiles from '../src/PartialTiles.js';

const cols = 8, rows = 5;
const map = [
  63,  6, 52, 63, 63, 63, 63, 63,
   6, 20,  2, 52, 63, 13, 59, 63,
  16, 38, 48, 34, 63, 31, 41, 63,
  63, 16, 34,  6, 52,  6, 60, 63,
  63, 63, 63, 16, 34, 16, 33, 63,
];


import { GameCanvas } from '../src/common/GameCanvas.js';
const gameCanvas = new GameCanvas();
gameCanvas.setBounds( 0, 0, cols, rows );

gameCanvas.draw = ( ctx ) => {

  // Grid
  ctx.strokeStyle = 'yellow';
  ctx.lineWidth = 0.01;
  for ( let row = 0; row < rows; row ++ ) {
    for ( let col = 0; col < cols; col ++ ) {
      ctx.strokeRect( col, row, 1, 1 );
    }
  }

  // Tiles
  for ( let row = 0; row < rows; row ++ ) {
    for ( let col = 0; col < cols; col ++ ) {
      const value = map[ col + row * cols ];

      ctx.save(); {
        ctx.translate( col, row );

        ctx.fillStyle = 'green';

        PartialTiles.drawTile( ctx, PartialTiles.getStartIndex( value ), PartialTiles.getEndIndex( value ) );
      }
      ctx.restore();
    }
  }
}

gameCanvas.pointerDown = ( m ) => {

  // Simple expand upward as proof-of-concept

  const col = Math.round( m.x );
  const row = Math.floor( m.y );

  console.log( col, row );

  const leftIndex  = col - 1 + row * cols;
  const rightIndex = col     + row * cols;

  {
    const oldValue = map[ leftIndex ];
    const startIndex = PartialTiles.getStartIndex( oldValue );
    const endIndex = PartialTiles.getEndIndex( oldValue );

    const newValue = PartialTiles.getValue( startIndex + 1, endIndex );

    map[ leftIndex ] = newValue;
  }

  {
    const oldValue = map[ rightIndex ];
    const startIndex = PartialTiles.getStartIndex( oldValue );
    const endIndex = PartialTiles.getEndIndex( oldValue );

    const newValue = PartialTiles.getValue( startIndex, endIndex - 1 );

    map[ rightIndex ] = newValue;
  }

  gameCanvas.redraw();
}