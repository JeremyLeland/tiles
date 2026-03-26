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
  mat4.rotateY( modelMatrix, modelMatrix, -Math.PI );

  const viewMatrix = mat4.lookAt( [], [ 5, 5, 5 ], [ 0, 0, 0 ], [ 0, 1, 0 ] );
  const projMatrix = mat4.ortho( [], -4, 4, 4, -4, 0, 100 );  // TODO: Flip?

  const mvp = mat4.mul( [], viewMatrix, modelMatrix );
  mat4.mul( mvp, projMatrix, mvp );

  let tempPoint = [];
  function getPos( point ) {
    const pos = vec3.transformMat4( tempPoint, point, mvp );
    return [ pos[ 0 ], pos[ 1 ] ];
  }

  // Test shape
  function drawShape( steps, fill ) {
    ctx.beginPath();
    steps.forEach( step => {
      if ( Array.isArray( step[ 0 ] ) ) {
        const ctl = getPos( step[ 0 ] );
        const pos = getPos( step[ 1 ] );

        ctx.quadraticCurveTo( ctl[ 0 ], ctl[ 1 ], pos[ 0 ], pos[ 1 ] );
      }
      else {
        const pos = getPos( step );
        ctx.lineTo( pos[ 0 ], pos[ 1 ] );
      }
    } );
    ctx.closePath();

    ctx.fillStyle = fill;
    ctx.fill();
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

  // Or list of points, with the control points being arrays of more points?

  const top = [
    [ -0.5, 0.5, -0.5 ],
    [  0.5, 0.5, -0.5 ],
    [  0.5, 0.5, -0.3 ],
    [ [ -0.2, 0.5, -0.2 ], [ -0.3, 0.5,  0.5 ] ],
    [ -0.5, 0.5,  0.5 ],
  ];

  const dropLeft = [
    [ -0.5, 0.5, 0.5 ],
    [ -0.3, 0.5, 0.5 ],
    [ -0.3, 0.3, 0.5 ],
    [ -0.5, 0.3, 0.5 ],
  ];

  const dropRight = [
    [ 0.5, 0.5, -0.5 ],
    [ 0.5, 0.5, -0.3 ],
    [ 0.5, 0.3, -0.3 ],
    [ 0.5, 0.3, -0.5 ],
  ];

  const dropBackLeft = [
    [ -0.5, 0.5, -0.5 ],
    [ 0.5, 0.5, -0.5 ],
    [ 0.5, 0.3, -0.5 ],
    [ -0.5, 0.3, -0.5 ],
  ];

  const dropBackRight = [
    [ -0.5, 0.5, -0.5 ],
    [ -0.5, 0.3, -0.5 ],
    [ -0.5, 0.3,  0.5 ],
    [ -0.5, 0.5,  0.5 ],
  ];

  const dropCenter = [
    [  0.5, 0.5, -0.3 ],
    [ [ -0.2, 0.5, -0.2 ], [ -0.3, 0.5,  0.5 ] ],
    [ -0.3, 0.3, 0.5 ],
    [ [ -0.2, 0.3, -0.2 ], [ 0.5, 0.3,  -0.3 ] ],
  ];

  const water = [
    [ -0.5, 0.3, -0.5 ],
    [  0.5, 0.3, -0.5 ],
    [  0.5, 0.3,  0.5 ],
    [ -0.5, 0.3,  0.5 ],
  ];

  drawShape( water, 'cyan' );
  drawShape( dropCenter, '#060' );
  drawShape( dropLeft, '#060' );
  drawShape( dropRight, '#060' );
  drawShape( dropBackLeft, '#060' );
  drawShape( dropBackRight, '#060' );
  drawShape( top, 'green' );
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
