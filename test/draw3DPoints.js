import { GameCanvas } from '../src/common/GameCanvas.js';
import { mat4, vec3 } from '../lib/gl-matrix.js';

// scaleX, skewY, skewX, scaleY, translateX, translateY
// const IsometricTransforms = {
//   north:  [  1,  0.5, -1,  0.5, 0, 0 ],
//   east:   [ -1,  0.5, -1, -0.5, 0, 0 ],
//   south:  [ -1, -0.5,  1, -0.5, 0, 0 ],
//   west:   [  1, -0.5,  1,  0.5, 0, 0 ],
//   left:   [  1,  0.5,  0,  1, -0.5, 0.75 ],
//   right:  [  1, -0.5,  0,  1,  0.5, 0.75 ],
// };

const points = [
  [ 0, 0, 0 ],
  [ 1, 0, 0 ],
  [ 0, 1, 0 ],
];

const gameCanvas = new GameCanvas();
gameCanvas.bounds = [ -1, -1, 1, 1 ];
gameCanvas.backgroundColor = '#123';

gameCanvas.draw = ( ctx ) => {
  drawGrid( ctx, gameCanvas.bounds );

  const modelMatrix = mat4.create();
  const viewMatrix = mat4.lookAt( [], [ 0, 0, 5 ], [ 0, 0, 0 ], [ 0, 1, 0 ] );
  const projMatrix = mat4.ortho( [], -4, 4, 4, -4, 0, 100 );  // TODO: Flip?

  const mvp = mat4.mul( [], viewMatrix, modelMatrix );
  mat4.mul( mvp, projMatrix, mvp );

  ctx.fillStyle = 'white';
  points.forEach( point => {
    const pos = vec3.transformMat4( [], point, mvp );
    console.log( `${ point } -> ${ pos }` );

    // NOTE: The positions are as a percentage of the projection area (-1,-1 to 1,1)
    // NOTE: The sizes are relative to bounds
    ctx.fillRect( pos[ 0 ] - 0.005, pos[ 1 ] - 0.005, 0.01, 0.01 );
  } );
}

gameCanvas.redraw();

function drawGrid( ctx, bounds, thickness = 0.001 ) {
  const ORIGIN = '#777', OTHER = '#5555';
  for ( let row = bounds[ 1 ]; row <= bounds[ 3 ]; row ++ ) {
    ctx.fillStyle = row == 0 ? ORIGIN : OTHER;
    ctx.fillRect( bounds[ 0 ], row, bounds[ 2 ] - bounds[ 0 ], thickness );
  }
  for ( let col = bounds[ 0 ]; col <= bounds[ 2 ]; col ++ ) {
    ctx.fillStyle = col == 0 ? ORIGIN : OTHER;
    ctx.fillRect( col, bounds[ 1 ], thickness, bounds[ 3 ] - bounds[ 1 ] );
  }
}
