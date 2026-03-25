import { GLGameCanvas } from '../src/common/GLGameCanvas.js';
import * as MeshCommon from '../src/common/MeshCommon.js';
import * as ShaderCommon from '../src/common/ShaderCommon.js';
import { mat4 } from '../lib/gl-matrix.js';
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


const camera = new OrbitCamera();

glGameCanvas.draw = ( gl ) => {
  const modelMatrix = mat4.create();
  const viewMatrix = camera.getViewMatrix();
  const projMatrix = mat4.perspective( [], Math.PI / 4, gl.canvas.clientWidth / gl.canvas.clientHeight, 0.1, 100 );

  const viewProjMatrix = mat4.mul( [], projMatrix, viewMatrix );

  const mvp = mat4.mul( [], viewMatrix, modelMatrix );
  mat4.mul( mvp, projMatrix, mvp );

  const normalMatrix = mat4.invert( [], modelMatrix );
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
      const ec = col == ( cols ) ? ( cols - 1 ) : ( col );
      const nr = row == 0 ? 0 : row - 1;
      const sr = row == ( rows ) ? ( rows - 1 ) : ( row );

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

const X_TURN_SENSITIVITY = 100;
const Y_TURN_SENSITIVITY = -100;
const X_MOVE_SENSITIVITY = -50;
const Y_MOVE_SENSITIVITY = -50;

glGameCanvas.canvas.addEventListener( 'pointermove', e => {
  // Rotate around origin with left mouse button
  if ( e.buttons == 1 ) {
    const dPhi   = e.movementX / X_TURN_SENSITIVITY;
    const dTheta = e.movementY / Y_TURN_SENSITIVITY;

    camera.rotate( dPhi, dTheta );

    glGameCanvas.redraw();
  }

  // Pan with right mouse button
  else if ( e.buttons == 2 ) {
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