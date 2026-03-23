import { GLGameCanvas } from '../src/common/GLGameCanvas.js';
import * as Angle from '../src/common/Angle.js';
import * as ShaderCommon from '../src/common/ShaderCommon.js';
import { mat4, vec3 } from '../lib/gl-matrix.js';

const glGameCanvas = new GLGameCanvas();

const GrassHeight = 0.3;
const GrassEdge = 0.2;

function getBigCurveGeometry() {
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

    // Negative because we're seeing the inside of the curve
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

  return geometry;
}

function getSmallCurveGeometry() {
  const geometry = {
    positions: [
      // Left side
      0, 1, 0,
      0, 1, GrassEdge,
      0, 1 - GrassHeight, GrassEdge,
      0, 1 - GrassHeight, 0,

      // Back side
      0, 1, 0,
      GrassEdge, 1, 0,
      GrassEdge, 1 - GrassHeight, 0,
      0, 1 - GrassHeight, 0,
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
    ],
    indices: [
      // Left side
      0, 2, 1,
      0, 3, 2,

      // Back side
      4, 6, 5,
      4, 7, 6,
    ],
  };

  const topCurvePositions = [];
  const bottomCurvePositions = [];
  const curveNormals = [];

  const startAngle = 0;
  const endAngle = Math.PI / 2;
  const radius = GrassEdge;

  // TODO: Extract this to helper function that makes array of angles?

  const CurveSections = 5;
  for ( let i = 0; i <= CurveSections; i ++ ) {
    const angle = startAngle + ( i / CurveSections ) * Angle.deltaAngle( startAngle, endAngle );
    const cos = Math.cos( angle );
    const sin = Math.sin( angle );

    topCurvePositions.push(
      cos * radius,
      1,
      sin * radius,
    );

    bottomCurvePositions.push(
      cos * radius,
      1 - GrassHeight,
      sin * radius,
    );

    curveNormals.push(
      cos,
      0,
      sin,
    );
  }


  // Top
  const topStartIndex = geometry.positions.length / 3;
  geometry.positions.push(
    0, 1, 0,
    GrassEdge, 1, 0,
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

  return geometry;
}

function getTwoSmallCurveGeometry() {
  const geometry = {
    positions: [
      // Left side
      0, 1, 0,
      0, 1, GrassEdge,
      0, 1 - GrassHeight, GrassEdge,
      0, 1 - GrassHeight, 0,

      // Back side
      0, 1, 0,
      GrassEdge, 1, 0,
      GrassEdge, 1 - GrassHeight, 0,
      0, 1 - GrassHeight, 0,

      // Right side
      1, 1, 1,
      1, 1, 1 - GrassEdge,
      1, 1 - GrassHeight, 1 - GrassEdge,
      1, 1 - GrassHeight, 1,

      // Front side
      1 - GrassEdge, 1, 1,
      1, 1, 1,
      1, 1 - GrassHeight, 1,
      1 - GrassEdge, 1 - GrassHeight, 1,

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

  const topFirstCurvePositions = [];
  const bottomFirstCurvePositions = [];
  const firstCurveNormals = [];

  const topSecondCurvePositions = [];
  const bottomSecondCurvePositions = [];
  const secondCurveNormals = [];

  const startAngle = 0;
  const endAngle = Math.PI / 2;
  const radius = GrassEdge;

  // TODO: Extract this to helper function that makes array of angles?

  const CurveSections = 5;
  for ( let i = 0; i <= CurveSections; i ++ ) {
    const angle = startAngle + ( i / CurveSections ) * Angle.deltaAngle( startAngle, endAngle );
    const cos = Math.cos( angle );
    const sin = Math.sin( angle );

    // Top left curve
    topFirstCurvePositions.push(
      cos * radius,
      1,
      sin * radius,
    );

    bottomFirstCurvePositions.push(
      cos * radius,
      1 - GrassHeight,
      sin * radius,
    );

    firstCurveNormals.push(
      cos,
      0,
      sin,
    );

    // Bottom right curve
    topSecondCurvePositions.push(
      1 - cos * radius,
      1,
      1 - sin * radius,
    );

    bottomSecondCurvePositions.push(
      1 - cos * radius,
      1 - GrassHeight,
      1 - sin * radius,
    );

    secondCurveNormals.push(
      -cos,
      0,
      -sin,
    );
  }


  // Top
  const firstTopStartIndex = geometry.positions.length / 3;
  geometry.positions.push(
    0, 1, 0,
    ...topFirstCurvePositions,
  );

  for ( let i = 0; i < 1 + CurveSections + 1; i ++ ) {
    geometry.normals.push( 0, 1, 0 );
  }

  for ( let i = firstTopStartIndex; i < firstTopStartIndex + CurveSections; i ++ ) {
    geometry.indices.push( firstTopStartIndex, i + 2, i + 1 );
  }

  const secondTopStartIndex = geometry.positions.length / 3;
  geometry.positions.push(
    1, 1, 1,
    ...topSecondCurvePositions,
  );

  for ( let i = 0; i < 1 + CurveSections + 1; i ++ ) {
    geometry.normals.push( 0, 1, 0 );
  }

  for ( let i = secondTopStartIndex; i < secondTopStartIndex + CurveSections; i ++ ) {
    geometry.indices.push( secondTopStartIndex, i + 2, i + 1 );
  }

  // Middle curve side
  const firstCurveStartIndex = geometry.positions.length / 3;
  geometry.positions.push(
    ...topFirstCurvePositions,
    ...bottomFirstCurvePositions,
  );

  geometry.normals.push(
    ...firstCurveNormals,
    ...firstCurveNormals,
  );

  for ( let ndx = firstCurveStartIndex; ndx < firstCurveStartIndex + CurveSections; ndx ++ ) {
    geometry.indices.push(
      ndx + 1, ndx, ndx + CurveSections + 1,
      ndx + 1, ndx + CurveSections + 1, ndx + CurveSections + 2,
    );
  }

  const secondCurveStartIndex = geometry.positions.length / 3;
  geometry.positions.push(
    ...topSecondCurvePositions,
    ...bottomSecondCurvePositions,
  );

  geometry.normals.push(
    ...secondCurveNormals,
    ...secondCurveNormals,
  );

  for ( let ndx = secondCurveStartIndex; ndx < secondCurveStartIndex + CurveSections; ndx ++ ) {
    geometry.indices.push(
      ndx + 1, ndx, ndx + CurveSections + 1,
      ndx + 1, ndx + CurveSections + 1, ndx + CurveSections + 2,
    );
  }

  // Center at 0,0,0
  for ( let i = 0; i < geometry.positions.length; i ++ ) {
    geometry.positions[ i ] -= 0.5;
  }

  return geometry;
}

const edgeGeometry = {
  positions: [
    // Left side
    0, 1, 0,
    0, 1, 1,
    0, 1 - GrassHeight, 1,
    0, 1 - GrassHeight, 0,

    // Back side
    0, 1, 0,
    GrassEdge, 1, 0,
    GrassEdge, 1 - GrassHeight, 0,
    0, 1 - GrassHeight, 0,

    // Right side
    GrassEdge, 1, 1,
    GrassEdge, 1, 0,
    GrassEdge, 1 - GrassHeight, 0,
    GrassEdge, 1 - GrassHeight, 1,

    // Front side
    0, 1, 1,
    GrassEdge, 1, 1,
    GrassEdge, 1 - GrassHeight, 1,
    0, 1 - GrassHeight, 1,

    // Top
    0, 1, 0,
    0, 1, 1,
    GrassEdge, 1, 1,
    GrassEdge, 1, 0,

  ].map( e => e - 0.5 ),
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

    // Top
    0, 1, 0,
    0, 1, 0,
    0, 1, 0,
    0, 1, 0,
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

    // Top
    16, 18, 17,
    16, 19, 18,
  ],
};

const bigCurveGeometry = getBigCurveGeometry();
const smallCurveGeometry = getSmallCurveGeometry();
const twoSmallCurveGeometry = getTwoSmallCurveGeometry();

const grassGeo = twoSmallCurveGeometry;

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

const yRot = ( angle ) => [ 0, Math.sin( angle / 2 ), 0, Math.cos( angle / 2 ) ];
const ROT_0 = yRot( 0 );
const ROT_90 = yRot( -Math.PI / 2 );
const ROT_180 = yRot( Math.PI );
const ROT_270 = yRot( Math.PI / 2 );

const Tiles = [


  // NW 0, NE 0, SW 1, SE 1
  { geo: edgeGeometry, quat: ROT_270 },

  // NW 0, NE 1, SW 0, SE 1
  { geo: edgeGeometry, quat: ROT_180 },

  // NW 0, NE 1, SW 1, SE 1
  { geo: bigCurveGeometry, quat: ROT_180 },

  // NW 1, NE 0, SW 1, SE 0
  { geo: edgeGeometry, quat: ROT_0 },

  // NW 1, NE 0, SW 1, SE 1
  { geo: bigCurveGeometry, quat: ROT_270 },

  // NW 1, NE 1, SW 0, SE 0
  { geo: edgeGeometry, quat: ROT_90 },

  // NW 1, NE 1, SW 0, SE 1
  { geo: bigCurveGeometry, quat: ROT_90 },

  // NW 1, NE 1, SW 1, SE 0
  { geo: bigCurveGeometry, quat: ROT_0 },
];

const cols = 2, rows = 2;
const tiles = [
  ROT_0, ROT_90,
  ROT_270, ROT_180,
];

glGameCanvas.draw = ( gl ) => {
  const modelMatrix = mat4.create();
  const viewMatrix = mat4.lookAt( [], [ 5, 10, 5 ], [ 0, 0, 0 ], [ 0, 1, 0 ] );
  const projMatrix = mat4.ortho( [], -4, 4, -4, 4, 0, 100 );

  for ( let row = 0; row < 2; row ++ ) {
    for ( let col = 0; col < 2; col ++ ) {
      mat4.fromRotationTranslation(
        modelMatrix,
        tiles[ col + row * cols ],
        [ col, 0, row ],
      );

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
