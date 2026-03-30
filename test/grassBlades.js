import { GLGameCanvas } from '../src/common/GLGameCanvas.js';
import * as MeshCommon from '../src/common/MeshCommon.js';
import * as ShaderCommon from '../src/common/ShaderCommon.js';
import { mat4, vec2, vec3, vec4 } from '../lib/gl-matrix.js';
import { OrbitCamera } from '../src/common/OrbitCamera.js';

import * as Angle from '../src/common/Angle.js';

const glGameCanvas = new GLGameCanvas();

const cols = 5, rows = 5;
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
  center: [ 0, 0, 0 ],
  distance: 4,
  phi: Math.PI / 3,
  theta: Math.PI / 3,
} );

function getAngles( startAngle, endAngle, numSections ) {
  const angles = [];

  const deltaAngle = Angle.deltaAngle( startAngle, endAngle );

  for ( let i = 0; i <= numSections; i ++ ) {
    angles.push( startAngle + ( i / numSections ) * deltaAngle );
  }

  return angles;
}

function makeBladeGeo() {
  const geo = {
    positions: [],
    normals: [],
    indices: [],
  }

  const numSections = 5;

  const angles = getAngles( 0, 1, numSections );

  for ( let i = 0; i < numSections; i ++ ) {
    const A = [
      Math.cos( angles[ i ] ),
      Math.sin( angles[ i ] ),
    ];

    const B = [
      Math.cos( angles[ i + 1 ] ),
      Math.sin( angles[ i + 1 ] ),
    ];

    const width = 0.1;
    const widthA = width * ( 1 - i / numSections );
    const widthB = width * ( 1 - ( i + 1 ) / numSections );

    geo.positions.push(
      ...B,
      -widthB,
    );

    geo.positions.push(
      ...A,
      -widthA,
    );

    geo.positions.push(
      ...A,
      widthA,
    );

    geo.positions.push(
      ...B,
      widthB,
    );

    const C = vec2.sub( [], B, A );
    vec2.normalize( C, C );

    for ( let i = 0; i < 4; i ++ ) {
      geo.normals.push( C[ 1 ], -C[ 0 ], 0 );
    }

    const startIndex = i * 4;
    geo.indices.push( startIndex, startIndex + 2, startIndex + 1 );
    geo.indices.push( startIndex, startIndex + 3, startIndex + 2 );
  }

  return geo;
}

const bladeGeo = makeBladeGeo();
let bladeShader, bladeMesh;

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

  //
  // TODO: Blades of grass here
  //
  bladeShader ??= ShaderCommon.getShader( gl, ShaderCommon.BasicLighting );

  gl.useProgram( bladeShader.program );
  gl.uniformMatrix4fv( bladeShader.uniformLocations.mvp, false, mvp );
  gl.uniformMatrix4fv( bladeShader.uniformLocations.normalMatrix, false, normalMatrix );

  gl.uniform3fv( bladeShader.uniformLocations.color, [ 0, 1, 0 ] );

  bladeMesh ??= MeshCommon.createMesh( gl, bladeGeo, bladeShader );
  gl.bindVertexArray( bladeMesh.vao );
  gl.drawElements( gl.TRIANGLES, bladeMesh.geometry.indices.length, gl.UNSIGNED_SHORT, 0 );
}


//
// Pointer input
//

glGameCanvas.canvas.addEventListener( 'pointerdown', e => {
  if ( e.buttons == 1 ) {
  }
} );

const X_TURN_SENSITIVITY = 100;
const Y_TURN_SENSITIVITY = -100;
const X_MOVE_SENSITIVITY = -50;
const Y_MOVE_SENSITIVITY = -50;

glGameCanvas.canvas.addEventListener( 'pointermove', e => {
  if ( e.buttons == 1 ) {
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
