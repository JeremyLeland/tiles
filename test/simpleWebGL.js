import { GLGameCanvas } from '../src/common/GLGameCanvas.js';
import * as Angle from '../src/common/Angle.js';
import * as ShaderCommon from '../src/common/ShaderCommon.js';
import { mat4, vec3 } from '../lib/gl-matrix.js';

const glGameCanvas = new GLGameCanvas();

const GrassHeight = 0.3;
const GrassEdge = 0.2;

function getGrassCurveGeometry() {
  const geometry = {
    positions: [
      // Left side
      0, 1, 0,
      0, 1, 1,
      0, 1 - GrassHeight, 1,
      0, 1 - GrassHeight, 0,

      // Back side
      0, 1, 0,
      1, 1, 0,
      1, 1 - GrassHeight, 0,
      0, 1 - GrassHeight, 0,

      // Right side
      1, 1, GrassEdge,
      1, 1, 0,
      1, 1 - GrassHeight, 0,
      1, 1 - GrassHeight, GrassEdge,

      // Front side
      0, 1, 1,
      GrassEdge, 1, 1,
      GrassEdge, 1 - GrassHeight, 1,
      0, 1 - GrassHeight, 1,
    ],
    normals: [
      // Left side
      -1, 0, 0,
      -1, 0, 0,
      -1, 0, 0,
      -1, 0, 0,

      // Back side
      0, 0, -1,
      0, 0, -1,
      0, 0, -1,
      0, 0, -1,

      // Right side
      1, 0, 0,
      1, 0, 0,
      1, 0, 0,
      1, 0, 0,

      // Front side
      0, 0, 1,
      0, 0, 1,
      0, 0, 1,
      0, 0, 1,
    ],
    indices: [
      // Left side
      0, 2, 1,
      0, 3, 2,

      // Back side
      4, 6, 5,
      4, 7, 6,

      // Right side
      8, 10, 9,
      8, 11, 10,

      // Front side
      12, 14, 13,
      12, 15, 14,
    ],
  };

  const topCurvePositions = [];
  const bottomCurvePositions = [];
  const curveNormals = [];

  const startAngle = -Math.PI / 2;
  const endAngle = -Math.PI;
  const radius = 1 - GrassEdge;

  const CurveSections = 10;
  for ( let i = 0; i <= CurveSections; i ++ ) {
    const angle = startAngle + ( i / CurveSections ) * Angle.deltaAngle( startAngle, endAngle );
    const cos = Math.cos( angle );
    const sin = Math.sin( angle );

    topCurvePositions.push(
      1 + cos * radius,
      1,
      1 + sin * radius,
    );

    bottomCurvePositions.push(
      1 + cos * radius,
      1 - GrassHeight,
      1 + sin * radius,
    );

    curveNormals.push(
      -cos,
      0,
      -sin,
    );
  }


  // Top
  const topStartIndex = geometry.positions.length / 3;
  geometry.positions.push(
    0, 1, 0,
    1, 1, 0,
    ...topCurvePositions,
    0, 1, 1,
  );

  for ( let i = 0; i < 3 + CurveSections + 1; i ++ ) {
    geometry.normals.push( 0, 1, 0 );
  }

  for ( let i = topStartIndex; i < topStartIndex + 2 + CurveSections; i ++ ) {
    geometry.indices.push( topStartIndex, i + 2, i + 1 );
  }

  // Middle curve side
  const curveStartIndex = geometry.positions.length / 3;
  geometry.positions.push(
    ...topCurvePositions,
    ...bottomCurvePositions,
  );

  geometry.normals.push(
    ...curveNormals,
    ...curveNormals,
  );

  for ( let ndx = curveStartIndex; ndx < curveStartIndex + CurveSections; ndx ++ ) {
    geometry.indices.push(
      ndx + 1, ndx, ndx + CurveSections + 1,
      ndx + 1, ndx + CurveSections + 1, ndx + CurveSections + 2,
    );
  }

  // Center at 0,0,0
  for ( let i = 0; i < geometry.positions.length; i ++ ) {
    geometry.positions[ i ] -= 0.5;
  }

  console.log( geometry );
  return geometry;
}

const grassGeo = getGrassCurveGeometry();

const waterGeo = {
  positions: [
    -0.5, 0.5 - GrassHeight, -0.5,
     0.5, 0.5 - GrassHeight, -0.5,
     0.5, 0.5 - GrassHeight,  0.5,
    -0.5, 0.5 - GrassHeight,  0.5,
  ],
  normals: [
    0, 1, 0,
    0, 1, 0,
    0, 1, 0,
    0, 1, 0,
  ],
  indices: [
    0, 2, 1,
    0, 3, 2,
  ],
};

const shader = ShaderCommon.getShader( glGameCanvas.gl, ShaderCommon.BasicLighting );
const grassVAO = createVAO( glGameCanvas.gl, grassGeo, shader );
const waterVAO = createVAO( glGameCanvas.gl, waterGeo, shader );


glGameCanvas.draw = ( gl ) => {
  const modelMatrix = mat4.create();
  const viewMatrix = mat4.lookAt( [], [ 5, 10, 5 ], [ 0, 0, 0 ], [ 0, 1, 0 ] );
  const projMatrix = mat4.ortho( [], -4, 4, -4, 4, 0, 100 );

  let angle = 0;
  for ( let row = 0; row < 4; row ++ ) {
    for ( let col = 0; col < 2; col ++ ) {
      mat4.fromRotationTranslation(
        modelMatrix,
        [ 0, Math.sin( angle / 2 ), 0, Math.cos( angle / 2 ) ],
        [ col, 0, row ],
      );
      angle -= Math.PI / 2;

      const mvp = mat4.mul( [], viewMatrix, modelMatrix );
      mat4.mul( mvp, projMatrix, mvp );

      const normalMatrix = mat4.invert( [], modelMatrix );
      mat4.transpose( normalMatrix, normalMatrix );

      gl.useProgram( shader.program );
      gl.uniformMatrix4fv( shader.uniformLocations.mvp, false, mvp );
      gl.uniformMatrix4fv( shader.uniformLocations.normalMatrix, false, normalMatrix );

      gl.bindVertexArray( grassVAO );
      gl.uniform3fv( shader.uniformLocations.color, [ 0, 1, 0 ] );
      gl.drawElements( gl.TRIANGLES, grassGeo.indices.length, gl.UNSIGNED_SHORT, 0 );

      gl.bindVertexArray( waterVAO );
      gl.uniform3fv( shader.uniformLocations.color, [ 0, 0, 1 ] );
      gl.drawElements( gl.TRIANGLES, waterGeo.indices.length, gl.UNSIGNED_SHORT, 0 );
    }
  }
}


function createVAO( gl, geometry, shader ) {
  const vao = gl.createVertexArray();
  gl.bindVertexArray( vao );

  gl.bindBuffer( gl.ARRAY_BUFFER, createArrayBuffer( gl, geometry.positions ) );
  gl.vertexAttribPointer( shader.attribLocations.position, 3, gl.FLOAT, false, 0, 0 );
  gl.enableVertexAttribArray( shader.attribLocations.position );

  gl.bindBuffer( gl.ARRAY_BUFFER, createArrayBuffer( gl, geometry.normals ) );
  gl.vertexAttribPointer( shader.attribLocations.normal, 3, gl.FLOAT, false, 0, 0 );
  gl.enableVertexAttribArray( shader.attribLocations.normal );

  gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, createIndexBuffer( gl, geometry.indices ) );

  gl.bindVertexArray( null );

  return vao;
}

function createArrayBuffer( gl, array ) {
  const arrayBuffer = gl.createBuffer();
  gl.bindBuffer( gl.ARRAY_BUFFER, arrayBuffer );
  gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( array ), gl.STATIC_DRAW );
  return arrayBuffer;
}

function createIndexBuffer( gl, indices ) {
  const indexBuffer = gl.createBuffer();
  gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, indexBuffer );
  gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( indices ), gl.STATIC_DRAW );
  return indexBuffer;
}
