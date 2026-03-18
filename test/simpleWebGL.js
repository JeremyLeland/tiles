import { GLGameCanvas } from '../src/common/GLGameCanvas.js';
import * as ShaderCommon from '../src/common/ShaderCommon.js';
import { mat4, vec3 } from '../lib/gl-matrix.js';

const glGameCanvas = new GLGameCanvas();

const geometry = {
  positions: [
    0, 1, 0,
    1, 1, 0,
    1, 1, 0.3,
    0.3, 1, 1,
    0, 1, 1,
  ],
  normals: [
    0, 1, 0,
    0, 1, 0,
    0, 1, 0,
    0, 1, 0,
    0, 1, 0,
  ],
  indices: [
    0, 2, 1,
    0, 3, 2,
    0, 4, 3,
  ],
};

const shader = ShaderCommon.getShader( glGameCanvas.gl, ShaderCommon.BasicLighting );
const vao = createVAO( glGameCanvas.gl, geometry, shader );


glGameCanvas.draw = ( gl ) => {
  const modelMatrix = mat4.create();
  // mat4.rotateY( modelMatrix, modelMatrix, -Math.PI );

  const viewMatrix = mat4.lookAt( [], [ 5, 5, 5 ], [ 0, 0, 0 ], [ 0, 1, 0 ] );
  const projMatrix = mat4.ortho( [], -4, 4, -4, 4, 0, 100 );

  const mvp = mat4.mul( [], viewMatrix, modelMatrix );
  mat4.mul( mvp, projMatrix, mvp );

  const normalMatrix = mat4.invert( [], modelMatrix );
  mat4.transpose( normalMatrix, normalMatrix );

  gl.useProgram( shader.program );
  gl.uniformMatrix4fv( shader.uniformLocations.mvp, false, mvp );
  gl.uniformMatrix4fv( shader.uniformLocations.normalMatrix, false, normalMatrix );
  gl.uniform3fv( shader.uniformLocations.color, [ 0, 1, 0 ] );

  gl.bindVertexArray( vao );
  gl.drawElements( gl.TRIANGLES, geometry.indices.length, gl.UNSIGNED_SHORT, 0 );

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
