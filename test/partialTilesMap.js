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

  const wholeX = Number.isInteger( gridPoint[ 0 ] );
  const wholeY = Number.isInteger( gridPoint[ 1 ] );

  if ( wholeX && wholeY ) {
    const SE_index = gridPoint[ 0 ] + gridPoint[ 1 ] * cols;
    const SW_index = SE_index - 1;
    const NE_index = SE_index - cols;
    const NW_index = NE_index - 1;


    //
    // Starting diamond (if nothing else there)
    //

    doDiamond( NW_index, 0, 6 );
    doDiamond( NE_index, 6, 4 );
    doDiamond( SW_index, 2, 0 );
    doDiamond( SE_index, 4, 2 );
  }
  else if ( !wholeX ) {
    const col = Math.floor( gridPoint[ 0 ] );

    const S_index = col + gridPoint[ 1 ] * cols;
    const N_index = S_index - cols;

    console.log( N_index, S_index );

    {
      const index = N_index;

      const oldValue = map[ index ];
      const startIndex = PartialTiles.getStartIndex( oldValue );
      const endIndex   = PartialTiles.getEndIndex( oldValue );

      console.log( `existing = ${ startIndex }, ${ endIndex }` );

      if ( startIndex === 6 ) {
        map[ index ] = PartialTiles.getValue( startIndex + 1, endIndex );
      }
      else if ( endIndex === 6 ) {
        map[ index ] = PartialTiles.getValue( startIndex, endIndex - 1 );
      }
    }

    {
      const index = S_index;

      const oldValue = map[ index ];
      const startIndex = PartialTiles.getStartIndex( oldValue );
      const endIndex   = PartialTiles.getEndIndex( oldValue );

      console.log( `existing = ${ startIndex }, ${ endIndex }` );

      if ( endIndex === 2 ) {
        map[ index ] = PartialTiles.getValue( startIndex, endIndex - 1 );
      }
      else if ( startIndex === 2 ) {
        map[ index ] = PartialTiles.getValue( startIndex + 1, endIndex );
      }
    }
  }

  gameCanvas.redraw();
}

gameCanvas.pointerMove = ( m ) => {
  hoverPoint[ 0 ] = m.x;
  hoverPoint[ 1 ] = m.y;

  gameCanvas.redraw();
}

function doDiamond( index, plannedStart, plannedEnd ) {
  const oldValue   = map[ index ];
  const startIndex = PartialTiles.getStartIndex( oldValue );
  const endIndex   = PartialTiles.getEndIndex( oldValue );

  console.log( `existing = ${ startIndex }, ${ endIndex }` );
  console.log( `planned = ${ plannedStart }, ${ plannedEnd }` );

  if ( oldValue == 63 ) {
    map[ index ] = PartialTiles.getValue( plannedStart, plannedEnd );
  }
  else {
    console.log( `points are ${ startIndex }, ${ endIndex } and ${ plannedStart }, ${ plannedEnd }` );

    if ( Math.abs( plannedEnd - startIndex ) < Math.abs( endIndex - plannedStart ) ) {
      console.log( `setting to ${ plannedStart }, ${ endIndex }` );
      map[ index ] = PartialTiles.getValue( plannedStart, endIndex );
    }
    else {
      console.log( `setting to ${ startIndex }, ${ plannedEnd }` );
      map[ index ] = PartialTiles.getValue( startIndex, plannedEnd );
    }
  }
}