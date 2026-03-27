import { GLGameCanvas } from '../src/common/GLGameCanvas.js';
import * as MeshCommon from '../src/common/MeshCommon.js';
import * as ShaderCommon from '../src/common/ShaderCommon.js';
import { mat4, vec3, vec4 } from '../lib/gl-matrix.js';
import { OrbitCamera } from '../src/common/OrbitCamera.js';

import * as GrassTiles from '../src/GrassTiles.js';

const glGameCanvas = new GLGameCanvas();

const cols = 5, rows = 6;
const grassLayer = [
  1, 1, 1, 1, 0,
  1, 1, 0, 0, 0,
  1, 0, 1, 1, 0,
  1, 0, 1, 1, 0,
  0, 0, 0, 1, 1,
  1, 0, 1, 0, 1,
];

const gridGeo = {
  positions: [],
}

for ( let col = 0; col <= cols; col ++ ) {
  gridGeo.positions.push( col, 0.5001, 0 );
  gridGeo.positions.push( col, 0.5001, rows );
}

for ( let row = 0; row <= rows; row ++ ) {
  gridGeo.positions.push( 0, 0.5001, row );
  gridGeo.positions.push( cols, 0.5001, row );
}

const colorShader = ShaderCommon.getShader( glGameCanvas.gl, ShaderCommon.SolidColor );
const gridMesh = MeshCommon.createLineMesh( glGameCanvas.gl, gridGeo, colorShader );


const camera = new OrbitCamera( {
  center: [ 3, 0, 3 ],
  distance: 10,
  phi: Math.PI / 4,
  theta: Math.PI / 4,
} );


const viewProjMatrix = mat4.create();
const mvp = mat4.create();
const normalMatrix = mat4.create();

glGameCanvas.draw = ( gl ) => {
  const modelMatrix = mat4.create();

  mat4.mul( viewProjMatrix, glGameCanvas.getProjectionMatrix(), camera.getViewMatrix() );
  mat4.mul( mvp, viewProjMatrix, modelMatrix );

  mat4.invert( normalMatrix, modelMatrix );
  mat4.transpose( normalMatrix, normalMatrix );

  gl.useProgram( gridMesh.shader.program );
  gl.uniformMatrix4fv( gridMesh.shader.uniformLocations.mvp, false, mvp );
  gl.uniformMatrix4fv( gridMesh.shader.uniformLocations.normalMatrix, false, normalMatrix );

  gl.uniform3fv( gridMesh.shader.uniformLocations.color, [ 1, 1, 1 ] );

  gl.bindVertexArray( gridMesh.vao );
  gl.drawArrays( gl.LINES, 0, gridMesh.geometry.positions.length / 3 );

  for ( let row = 0; row <= rows; row ++ ) {
    for ( let col = 0; col <= cols; col ++ ) {
      const wc = col == 0 ? 0 : col - 1;
      const nr = row == 0 ? 0 : row - 1;
      const ec = col == cols ? cols - 1 : col;
      const sr = row == rows ? rows - 1 : row;

      const nw = grassLayer[ wc + nr * cols ];
      const ne = grassLayer[ ec + nr * cols ];
      const sw = grassLayer[ wc + sr * cols ];
      const se = grassLayer[ ec + sr * cols ];

      const grassType = ( nw << 3 ) + ( ne << 2 ) + ( sw << 1 ) + se;

      mat4.fromTranslation( modelMatrix, [ col, 0, row ] );

      GrassTiles.drawGrass( gl, grassType, modelMatrix, viewProjMatrix );
    }
  }
}

//
// Keyboard input
//

const TranslateSpeed = 0.05;
const Translate = {
  Up:     () => camera.pan( 0, -TranslateSpeed ),
  Down:   () => camera.pan( 0,  TranslateSpeed ),
  Left:   () => camera.pan( -TranslateSpeed, 0 ),
  Right:  () => camera.pan(  TranslateSpeed, 0 ),
};

const TranslateKeys = {
  'w': Translate.Up,
  'a': Translate.Left,
  's': Translate.Down,
  'd': Translate.Right,
};

document.addEventListener( 'keydown', e => {
  TranslateKeys[ e.key ]?.();

  glGameCanvas.redraw();
} );


//
// Pointer input
//

let activeTileIndex = 1;

// Cast ray for clicking
function clickOnGrid( e ) {
  const x = ( e.clientX / glGameCanvas.canvas.clientWidth ) * 2 - 1;
  const y = 1 - ( e.clientY / glGameCanvas.canvas.clientHeight ) * 2; // flip Y

  const nearPoint = [ x, y, -1, 1 ];
  const farPoint  = [ x, y,  1, 1 ];

  const invPV = mat4.create();
  mat4.multiply( invPV, glGameCanvas.getProjectionMatrix(), camera.getViewMatrix() );
  mat4.invert( invPV, invPV );

  const nearWorld = unproject( nearPoint, invPV );
  const farWorld  = unproject( farPoint, invPV );

  const origin = camera.getEyePos();

  const dir = vec3.normalize( vec3.create(), [
    farWorld[ 0 ] - nearWorld[ 0 ],
    farWorld[ 1 ] - nearWorld[ 1 ],
    farWorld[ 2 ] - nearWorld[ 2 ],
  ] );

  const intersection = rayPlaneIntersection( vec3.create(), origin, dir, [ 0, 0.5, 0 ], [ 0, 1, 0 ] );
  const col = Math.floor( intersection[ 0 ] );
  const row = Math.floor( intersection[ 2 ] );

  if ( 0 <= col && col < cols && 0 <= row && row < rows ) {
    grassLayer[ col + row * cols ] = activeTileIndex;
    glGameCanvas.redraw();
  }
}

function unproject( p, invPV ) {
  const out = vec4.transformMat4( [], p, invPV );
  return [
    out[ 0 ] / out[ 3 ],
    out[ 1 ] / out[ 3 ],
    out[ 2 ] / out[ 3 ],
  ];
}

const diff = vec3.create();

function rayPlaneIntersection( out, rayOrigin, rayDir, planePoint, planeNormal ) {
  const denom = vec3.dot( planeNormal, rayDir );

  // Parallel?
  if ( Math.abs( denom ) < 1e-6 ) return null;

  vec3.subtract( diff, planePoint, rayOrigin );
  const t = vec3.dot(diff, planeNormal) / denom;

  // Behind the ray?
  if ( t < 0 ) return null;

  // out = O + tD
  return vec3.scaleAndAdd( out, rayOrigin, rayDir, t );
}

glGameCanvas.canvas.addEventListener( 'pointerdown', e => {
  if ( e.buttons == 1 ) {
    clickOnGrid( e );
  }
} );

const X_TURN_SENSITIVITY = 100;
const Y_TURN_SENSITIVITY = -100;
const X_MOVE_SENSITIVITY = -50;
const Y_MOVE_SENSITIVITY = -50;

glGameCanvas.canvas.addEventListener( 'pointermove', e => {

  if ( e.buttons == 1 ) {
    clickOnGrid( e );
  }

  // Rotate around origin with right mouse button
  if ( e.buttons == 2 ) {
    const dPhi   = e.movementX / X_TURN_SENSITIVITY;
    const dTheta = e.movementY / Y_TURN_SENSITIVITY;

    camera.rotate( dPhi, dTheta );

    glGameCanvas.redraw();
  }

  // Pan with middle mouse button
  else if ( e.buttons == 4 ) {
    const dx = e.movementX / X_MOVE_SENSITIVITY;
    const dy = e.movementY / Y_MOVE_SENSITIVITY;

    camera.pan( dx, dy );

    glGameCanvas.redraw();
  }
} );

const ZOOM_SENSIVITY = -200;

glGameCanvas.canvas.addEventListener( 'wheel', e => {
  camera.zoom( e.wheelDelta / ZOOM_SENSIVITY );

  glGameCanvas.redraw();
} );

//
// UI
//

const tileNames = [ 'Water', 'Grass' ];

const buttonDiv = document.createElement( 'div' );
Object.assign( buttonDiv.style, {
  position: 'absolute',
  left: 0,
  top: 0,
} );

tileNames.forEach( ( name, index ) => {
  const button = document.createElement( 'button' );
  button.textContent = name;
  button.addEventListener( 'click', _ => activeTileIndex = index );
  buttonDiv.appendChild( button );
} );

document.body.appendChild( buttonDiv );