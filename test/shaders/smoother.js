import { GLGameCanvas } from '../../src/common/GLGameCanvas.js';
import * as MeshCommon from '../../src/common/MeshCommon.js';
import * as ShaderCommon from '../../src/common/ShaderCommon.js';
import { mat4, vec2, vec3, vec4 } from '../../lib/gl-matrix.js';
import { OrbitCamera } from '../../src/common/OrbitCamera.js';

const glGameCanvas = new GLGameCanvas();

const camera = new OrbitCamera( {
  center: [ 2.5, 0, 2.5 ],
  distance: 5,
  phi: Math.PI / 4,
  theta: Math.PI / 4,
} );


const geo = {
  positions: [
    4, 0, 4,
    4, 0, 0,
    0, 0, 4,
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

      const float NumSquares = 4.0;

      vec3 cell3;
      vec3 local3 = modf( v_pos * NumSquares, cell3 );

      vec2 cell = cell3.xz;
      vec2 pos = local3.xz;

      vec2 diff = vec2( 0.5, 0.5 ) - pos;
      float angle = atan( diff.y, diff.x );
      float dist = sqrt( dot( diff, diff ) );
      float val = 1.0 - dist;

      // https://shadergif.com/guides/anti-aliasing-basics/
      float centerDist = dist - 0.1;
      float petalDist = dist - 0.4 * abs( sin( angle * 4.0 ) );

      float wCenter = fwidth( centerDist );
      float centerMask = smoothstep( wCenter, -wCenter, centerDist );

      float wPetal = fwidth( petalDist );
      float petalMask = smoothstep( wPetal, -wPetal, petalDist );

      float petalsOnly = petalMask * ( 1.0 - centerMask );

      vec3 yellow = vec3( 1.0, 1.0, 0.0 );
      vec3 white  = vec3( 1.0 );

      vec3 color = yellow * centerMask + white * petalsOnly;

      outColor = vec4( color * val, 1.0 );

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
