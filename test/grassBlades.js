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
  gridGeo.positions.push( col, 0, 0 );
  gridGeo.positions.push( col, 0, rows );
}

for ( let row = 0; row <= rows; row ++ ) {
  gridGeo.positions.push( 0, 0, row );
  gridGeo.positions.push( cols, 0, row );
}

const colorShader = ShaderCommon.getShader( glGameCanvas.gl, ShaderCommon.SolidColor );
const gridMesh = MeshCommon.createLineMesh( glGameCanvas.gl, gridGeo, colorShader );

const camera = new OrbitCamera( {
  center: [ 0, 0, 0 ],
  distance: 4,
  phi: Math.PI / 4,
  theta: Math.PI / 3,
} );

function getAngles( startAngle, endAngle, numSections ) {
  const angles = [];

  const deltaAngle = Angle.sweepAngle( startAngle, endAngle, endAngle < startAngle );

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

  const numBlades = 20;
  const facingAngles = getAngles( 0, Math.PI * 2, numBlades );

  const clumpDepth = 0.5;
  const clumpHeight = 0.5;
  const clumpRadius = 0.1;
  const bladeWidth = 2 * clumpRadius * Math.PI / numBlades;


  let startIndex = 0;

  for ( let j = 0; j < numBlades; j ++ ) {
    const facing = [
      Math.cos( facingAngles[ j ] ),
      Math.sin( facingAngles[ j ] ),
    ];

    const bladeSections = 12;
    const tiltAngles = getAngles( 0, 0.75 + 0.25 * Math.random(), bladeSections );

    const height = clumpHeight + 0.5 * Math.random();
    const depth = clumpDepth + 0.5 * Math.random();

    const offset = -depth - clumpRadius * ( 0.25 + 0.75 * Math.random() );

    tiltAngles.forEach( ( tiltAngle, index ) => {
      const A = [
        Math.cos( tiltAngle ) * depth,
        Math.sin( tiltAngle ) * height,
      ];

      const width = bladeWidth * ( 1 - index / bladeSections );

      geo.positions.push(
        A[ 0 ] * facing[ 0 ] + width * facing[ 1 ] + offset * facing[ 0 ],
        A[ 1 ],
        A[ 0 ] * facing[ 1 ] - width * facing[ 0 ] + offset * facing[ 1 ],
      );

      geo.positions.push(
        A[ 0 ] * facing[ 0 ] - width * facing[ 1 ] + offset * facing[ 0 ],
        A[ 1 ],
        A[ 0 ] * facing[ 1 ] + width * facing[ 0 ] + offset * facing[ 1 ],
      );

      const normal = [
        A[ 0 ] * facing[ 0 ],
        A[ 1 ],
        A[ 0 ] * facing[ 1 ],
      ];
      vec3.normalize( normal, normal );

      geo.normals.push( ...normal );
      geo.normals.push( ...normal );
    } );

    for ( let i = 0; i < bladeSections; i ++ ) {
      geo.indices.push( startIndex, startIndex + 2, startIndex + 1 );
      geo.indices.push( startIndex + 1, startIndex + 2, startIndex + 3 );
      startIndex += 2;
    }

    // Clean break for next blade
    startIndex += 2;
  }

  console.log( geo );

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
  // bladeShader ??= ShaderCommon.getShader( gl, ShaderCommon.NormalColor );
  bladeShader ??= ShaderCommon.getShader( gl, ShaderCommon.Lighting );

  gl.useProgram( bladeShader.program );
  // gl.uniformMatrix4fv( bladeShader.uniformLocations.mvp, false, mvp );
  gl.uniformMatrix4fv( bladeShader.uniformLocations.modelMatrix, false, modelMatrix );
  gl.uniformMatrix4fv( bladeShader.uniformLocations.viewProjMatrix, false, viewProjMatrix );
  gl.uniformMatrix4fv( bladeShader.uniformLocations.normalMatrix, false, normalMatrix );

  gl.uniform3fv( bladeShader.uniformLocations.color, [ 0, 1, 0 ] );

  gl.uniform3fv( bladeShader.uniformLocations.lightPos, [ 10, 10, 10 ] );
  gl.uniform3fv( bladeShader.uniformLocations.lightColor, [ 1, 1, 1 ] );

  gl.uniform3fv( bladeShader.uniformLocations.eyePos, camera.getEyePos() );

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
