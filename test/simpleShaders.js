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

const grassFragment = /*glsl*/ `# version 300 es
  precision mediump float;

  in vec3 v_pos;
  in vec3 v_norm;

  out vec4 outColor;

  float hash(vec2 p) {
    return fract( sin( dot( p, vec2( 127.1, 311.7 ) ) ) * 43758.5453123 );
  }

  float ign(vec2 p) {
    return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715))));
  }

  float ign2(vec2 p) {
    p += vec2(0.75487765, 0.56984026); // arbitrary offset
    return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715))));
  }

  void main() {

    const vec3 NumSquares = vec3( 20.0, 1.0, 10.0 );

    vec3 integer;
    vec3 floating = modf( mod( v_pos * NumSquares, 2.0 ), integer );

    vec3 integer2;
    vec3 floating2 = modf( v_pos * NumSquares, integer2 );

    float integer3;

    vec2 cell = integer2.xz;

    float g1 = mix( 0.3, 0.6, hash( cell ) );
    float g2 = mix( 0.3, 0.6, hash( cell + 17.0 ) ); // offset for variation

    vec3 color1 = vec3( 0.0, g1, 0.0 );
    vec3 color2 = vec3( 0.0, g2, 0.0 );

    if ( floating.x < floating.z ) {
      outColor = vec4( color1, 1.0 );
    }
    else {
      outColor = vec4( color2, 1.0 );
    }
  }
`;

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
    precision mediump float;

    in vec3 v_pos;
    in vec3 v_norm;

    out vec4 outColor;

    float hash(vec2 p) {
      return fract( sin( dot( p, vec2( 127.1, 311.7 ) ) ) * 43758.5453123 );
    }

    vec2 hash2(vec2 p) {
      return fract(sin(vec2(
        dot(p, vec2(127.1, 311.7)),
        dot(p, vec2(269.5, 183.3))
      )) * 43758.5453123);
    }

    vec2 hash2B(vec2 p) {
      vec3 p3 = fract(vec3(p.xyx) * 0.1031);
      p3 += dot(p3, p3.yzx + 33.33);
      return fract((p3.xx + p3.yz) * p3.zy);
    }

    void main() {

      const float NumSquares = 14.0;

      vec3 cell3;
      vec3 local3 = modf( v_pos * NumSquares, cell3 );

      vec2 cell = cell3.xz;
      vec2 pos = local3.xz;

      float minDist = 1.0;
      float secondMinDist = 1.0;
      vec2 bestOffset;

      for ( int j = -1; j <= 1; j ++ ) {
        for ( int i = -1; i <= 1; i ++ ) {
          vec2 offset = vec2( float( i ), float( j ) );
          // vec2 center = hash2(cell + offset) + offset;
          vec2 center = offset + 0.5 + 0.5 * ( hash2( cell + offset ) - 0.5 );  // keep points closer to center, less clumpy

          // float d = distance( center, pos );
          float d = dot( center - pos, center - pos );  // distance w/o square root?
          // minDist = min( minDist, d );

          if ( d < minDist ) {
            secondMinDist = minDist;
            minDist = d;
            bestOffset = offset;
          }
        }
      }

      float dist = sqrt( minDist );

      // outColor = vec4( dist, dist, 1.0, 1.0 ); // water-like
      // outColor = vec4( 0.0, 1.0 - dist, 0.0, 1.0 );  // worley green

      if ( abs( secondMinDist - minDist ) < 0.2 ) {
        outColor = vec4( 0.25, 0.125, 0.0, 1.0 );
      }
      else {
        outColor = vec4( 0.0, 0.4 + 0.25 * hash( cell + bestOffset ), 0.0, 1.0 );
      }
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

  gl.useProgram( gridMesh.shader.program );
  gl.uniformMatrix4fv( gridMesh.shader.uniformLocations.mvp, false, mvp );
  gl.uniformMatrix4fv( gridMesh.shader.uniformLocations.normalMatrix, false, normalMatrix );

  gl.uniform3fv( gridMesh.shader.uniformLocations.color, [ 1, 1, 1 ] );

  gl.bindVertexArray( gridMesh.vao );
  gl.drawArrays( gl.LINES, 0, gridMesh.geometry.positions.length / 3 );

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
