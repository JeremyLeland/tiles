// Draw a map of partial tiles

import * as PartialTiles from '../src/PartialTiles.js';

const cols = 3, rows = 3;
const map = [
  48, 32, 38,
  50, 63, 22,
   2,  4, 20,
];


import { GameCanvas } from '../src/common/GameCanvas.js';
const gameCanvas = new GameCanvas();
gameCanvas.setBounds( 0, 0, 3, 3 );

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

        const startIndex = value >> 3;
        const endIndex = value & 0b111;

        PartialTiles.drawTile( ctx, startIndex, endIndex );
      }
      ctx.restore();
    }
  }
}