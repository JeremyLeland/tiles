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

const ops = [
  { func: 'beginPath' },
  { func: 'moveTo', point: [ 0, 0, 0 ] },
  { func: 'lineTo', point: [ 1, 0, 0 ] },
  { func: 'lineTo', point: [ 0, 1, 0 ] },
  { func: 'closePath' },
];

const gameCanvas = new GameCanvas();
gameCanvas.bounds = [ -1, -1, 1, 1 ];
gameCanvas.backgroundColor = '#123';

gameCanvas.draw = ( ctx ) => {
  // drawGrid( ctx, gameCanvas.bounds );

  const modelMatrix = mat4.create();
  const viewMatrix = mat4.lookAt( [], [ 5, 5, 5 ], [ 0, 0, 0 ], [ 0, 1, 0 ] );
  const projMatrix = mat4.ortho( [], -4, 4, 4, -4, 0, 100 );  // TODO: Flip?

  const mvp = mat4.mul( [], viewMatrix, modelMatrix );
  mat4.mul( mvp, projMatrix, mvp );

  let tempPoint = [];
  function getPos( point ) {
    const pos = vec3.transformMat4( tempPoint, point, mvp );
    return [ pos[ 0 ], pos[ 1 ] ];
  }

  // Grid
  // ctx.beginPath();
  ctx.lineWidth = 0.001;

  ctx.beginPath();
  ctx.moveTo( ...getPos( [ -5,  0,  0 ] ) );
  ctx.lineTo( ...getPos( [  5,  0,  0 ] ) );
  ctx.strokeStyle = 'red';
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo( ...getPos( [  0, -5,  0 ] ) );
  ctx.lineTo( ...getPos( [  0,  5,  0 ] ) );
  ctx.strokeStyle = 'green';
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo( ...getPos( [  0,  0, -5 ] ) );
  ctx.lineTo( ...getPos( [  0,  0,  5 ] ) );
  ctx.strokeStyle = 'blue';
  ctx.stroke();


  /// TODO: Make these functions that take in array of points?
  // Then the points can be transformed with map() and passed in?

  // Test shape
  ctx.beginPath();
  ctx.moveTo( ...getPos( [ 0, 0, 0 ] ) );
  ctx.lineTo( ...getPos( [ 1, 0, 0 ] ) );
  ctx.lineTo( ...getPos( [ 1, 0.2, 0 ] ) );
  ctx.quadraticCurveTo( ...getPos( [ 0.2, 0.2, 0 ] ), ...getPos( [ 0.2, 1, 0 ] ) );
  // ctx.lineTo( ...getPos( [ 0.2, 1, 0 ] ) );
  ctx.lineTo( ...getPos( [ 0, 1, 0 ] ) );
  ctx.closePath();

  ctx.fillStyle = 'white';
  ctx.fill();
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
