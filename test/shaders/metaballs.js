import { GLGameCanvas } from '../../src/common/GLGameCanvas.js';
import * as MeshCommon from '../../src/common/MeshCommon.js';
import * as ShaderCommon from '../../src/common/ShaderCommon.js';
import { mat4, vec2, vec3, vec4 } from '../../lib/gl-matrix.js';
import { OrbitCamera } from '../../src/common/OrbitCamera.js';

const glGameCanvas = new GLGameCanvas();

const camera = new OrbitCamera( {
  center: [ 0.5, 0, 0.5 ],
  distance: 3,
  phi: Math.PI / 4,
  theta: Math.PI / 4,
} );

camera.addEventListeners( glGameCanvas );


const geo = {
  positions: [
    1, 0, 1,
    1, 0, 0,
    0, 0, 1,
    0, 0, 0,
  ],
  normals: [
    0, 1, 0,
    0, 1, 0,
    0, 1, 0,
    0, 1, 0,
  ],
  indices: [
    0, 2, 1,
    1, 2, 3,
  ],
};


const shaderInfo = {
  vertex: /*glsl*/`# version 300 es
    in vec3 position;
    in vec3 normal;

    uniform mat4 modelMatrix;
    uniform mat4 viewProjMatrix;
    uniform mat4 normalMatrix;

    out vec3 v_pos;
    out vec3 v_norm;

    void main() {
      v_pos = ( modelMatrix * vec4( position, 1.0 ) ).xyz;
      v_norm = ( normalMatrix * vec4( normal, 1.0 ) ).xyz;

      gl_Position = viewProjMatrix * modelMatrix * vec4( position, 1.0 );
    }
  `,
  fragment: /*glsl*/ `# version 300 es
    precision highp float;

    in vec3 v_pos;
    in vec3 v_norm;

    out vec4 outColor;

    void main() {
      vec2 pos = v_pos.xz;

      const vec2 points[ 3 ] = vec2[ 3 ](
        // vec2( 0.25, 0.65 ),
        vec2( 0.35, 0.15 ),
        vec2( 0.25, 0.5 ),
        vec2( 0.75, 0.75 )
      );

      float sum = 0.0;

      for ( int i = 0; i < points.length(); i ++ ) {
        // sum += 0.25 / distance( pos, points[ i ] );
        vec2 diff = points[ i ] - pos;
        sum += 0.1 / dot( diff, diff );  // distance w/o square root?
      }

      sum /= float( points.length() );

      outColor = vec4( vec3( sum ), 1.0 );
    }
  `,
}

let mesh, shader;


const viewProjMatrix = mat4.create();
const mvp = mat4.create();
const normalMatrix = mat4.create();

glGameCanvas.draw = ( gl ) => {
  const modelMatrix = mat4.create();

  mat4.mul( viewProjMatrix, glGameCanvas.getProjectionMatrix(), camera.getViewMatrix() );
  mat4.mul( mvp, viewProjMatrix, modelMatrix );

  mat4.invert( normalMatrix, modelMatrix );
  mat4.transpose( normalMatrix, normalMatrix );

  //
  // Shader demo here
  //
  shader ??= ShaderCommon.getShader( gl, shaderInfo );

  gl.useProgram( shader.program );
  gl.uniformMatrix4fv( shader.uniformLocations.modelMatrix, false, modelMatrix );
  gl.uniformMatrix4fv( shader.uniformLocations.viewProjMatrix, false, viewProjMatrix );
  gl.uniformMatrix4fv( shader.uniformLocations.normalMatrix, false, normalMatrix );

  mesh ??= MeshCommon.createMesh( gl, geo, shader );
  gl.bindVertexArray( mesh.vao );
  gl.drawElements( gl.TRIANGLES, mesh.geometry.indices.length, gl.UNSIGNED_SHORT, 0 );
}
