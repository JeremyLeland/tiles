// Draw a map of partial tiles

import * as PartialTiles from '../src/PartialTiles.js';
import * as Util from '../src/common/Util.js';

const cols = 8, rows = 5;
const map = [
  63, 63, 63, 63, 63, 63, 63, 63,
  63, 63, 63, 63, 63, 63, 63, 63,
  63, 63, 63, 63, 63, 63, 63, 63,
  63, 63, 63, 63, 63, 63, 63, 63,
  63, 63, 63, 63, 63, 63, 63, 63,
  // 63,  6, 52, 63, 63, 63, 63, 63,
  //  6, 20,  2, 52, 63, 13, 59, 63,
  // 16, 38, 48, 34, 63, 31, 41, 63,
  // 63, 16, 34,  6, 52,  6, 60, 63,
  // 63, 63, 63, 16, 34, 16, 33, 63,
];


import { GameCanvas } from '../src/common/GameCanvas.js';
const gameCanvas = new GameCanvas();
gameCanvas.setBounds( 0, 0, cols, rows );


const hoverPoint = [ 0, 0 ];

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

  // Hover
  ctx.fillStyle = 'lime';
  Util.drawPoint( ctx, hoverPoint );

  const gridPoint = [
    Math.round( hoverPoint[ 0 ] * 2 ) / 2,
    Math.round( hoverPoint[ 1 ] * 2 ) / 2,
  ];

  ctx.fillStyle = 'yellow';
  Util.drawPoint( ctx, gridPoint );

  //
  // Which points affected?
  //

}

gameCanvas.pointerDown = ( m ) => {

  const gridPoint = [
    Math.round( hoverPoint[ 0 ] * 2 ) / 2,
    Math.round( hoverPoint[ 1 ] * 2 ) / 2,
  ];

  console.log( gridPoint );

  const SE_index = gridPoint[ 0 ] + gridPoint[ 1 ] * cols;
  const SW_index = SE_index - 1;
  const NE_index = SE_index - cols;
  const NW_index = NE_index - 1;


  //
  // Starting diamond (if nothing else there)
  //

  map[ NW_index ] = PartialTiles.getValue( 0, 6 );

  {
    const oldValue   = map[ NE_index ];
    const startIndex = PartialTiles.getStartIndex( oldValue );
    const endIndex   = PartialTiles.getEndIndex( oldValue );

    // TODO: min() isn't quite right here. Need to account for wrap around values, like with angles
    map[ NE_index ] = oldValue == 63 ? PartialTiles.getValue( 6, 4 ) :
      PartialTiles.getValue( Math.min( startIndex, 6 ), Math.min( endIndex, 4 ) );
  }

  map[ SW_index ] = PartialTiles.getValue( 2, 0 );

  {
    const oldValue   = map[ SE_index ];
    const startIndex = PartialTiles.getStartIndex( oldValue );
    const endIndex   = PartialTiles.getEndIndex( oldValue );

    console.log( `existing SE = ${ startIndex }, ${ endIndex }` );

    map[ SE_index ] = oldValue == 63 ? PartialTiles.getValue( 4, 2 ) :
      PartialTiles.getValue( Math.max( startIndex, 4 ), Math.min( endIndex, 2 ) );
  }

  //
  // Simple expand upward as proof-of-concept
  //

  // const col = Math.round( m.x );
  // const row = Math.floor( m.y );

  // console.log( col, row );

  // const leftIndex  = col - 1 + row * cols;
  // const rightIndex = col     + row * cols;

  // {
  //   const oldValue = map[ leftIndex ];
  //   const startIndex = PartialTiles.getStartIndex( oldValue );
  //   const endIndex = PartialTiles.getEndIndex( oldValue );

  //   const newValue = PartialTiles.getValue( startIndex + 1, endIndex );

  //   map[ leftIndex ] = newValue;
  // }

  // {
  //   const oldValue = map[ rightIndex ];
  //   const startIndex = PartialTiles.getStartIndex( oldValue );
  //   const endIndex = PartialTiles.getEndIndex( oldValue );

  //   const newValue = PartialTiles.getValue( startIndex, endIndex - 1 );

  //   map[ rightIndex ] = newValue;
  // }

  gameCanvas.redraw();
}

gameCanvas.pointerMove = ( m ) => {
  hoverPoint[ 0 ] = m.x;
  hoverPoint[ 1 ] = m.y;

  gameCanvas.redraw();
}