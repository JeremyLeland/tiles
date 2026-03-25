import { GLGameCanvas } from '../src/common/GLGameCanvas.js';
import * as Angle from '../src/common/Angle.js';
import * as ShaderCommon from '../src/common/ShaderCommon.js';
import { mat4, vec3 } from '../lib/gl-matrix.js';
import { OrbitCamera } from '../src/common/OrbitCamera.js';

const glGameCanvas = new GLGameCanvas();

const Viewport = [ -4, -4, 4, 4 ];

const GrassHeight = 0.2;
const GrassEdge = 0.5;

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

  const CurveSections = 10;
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

  const CurveSections = 10;
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

const fullGeometry = {
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
    1, 1, 1,
    1, 1, 0,
    1, 1 - GrassHeight, 0,
    1, 1 - GrassHeight, 1,

    // Front side
    0, 1, 1,
    1, 1, 1,
    1, 1 - GrassHeight, 1,
    0, 1 - GrassHeight, 1,

    // Top
    0, 1, 0,
    0, 1, 1,
    1, 1, 1,
    1, 1, 0,

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
const grassMeshes = {
  smallCurve:     createMesh( glGameCanvas.gl, smallCurveGeometry, shader ),
  edge:           createMesh( glGameCanvas.gl, edgeGeometry, shader ),
  twoSmallCurve:  createMesh( glGameCanvas.gl, twoSmallCurveGeometry, shader ),
  bigCurve:       createMesh( glGameCanvas.gl, bigCurveGeometry, shader ),
  full:           createMesh( glGameCanvas.gl, fullGeometry, shader ),
};
const waterMesh = createMesh( glGameCanvas.gl, waterGeo, shader );

const yRot = ( angle ) => [ 0, Math.sin( angle / 2 ), 0, Math.cos( angle / 2 ) ];
const ROT_0 = yRot( 0 );
const ROT_90 = yRot( -Math.PI / 2 );
const ROT_180 = yRot( Math.PI );
const ROT_270 = yRot( Math.PI / 2 );

const Tiles = [

  // NW 0, NE 0, SW 0, SE 0
  null,

  // NW 0, NE 0, SW 0, SE 1
  { mesh: grassMeshes.smallCurve, quat: ROT_180 },

  // NW 0, NE 0, SW 1, SE 0
  { mesh: grassMeshes.smallCurve, quat: ROT_270 },

  // NW 0, NE 0, SW 1, SE 1
  { mesh: grassMeshes.edge, quat: ROT_270 },

  // NW 0, NE 1, SW 0, SE 0
  { mesh: grassMeshes.smallCurve, quat: ROT_90 },

  // NW 0, NE 1, SW 0, SE 1
  { mesh: grassMeshes.edge, quat: ROT_180 },

  // NW 0, NE 1, SW 1, SE 0
  { mesh: grassMeshes.twoSmallCurve, quat: ROT_90 },

  // NW 0, NE 1, SW 1, SE 1
  { mesh: grassMeshes.bigCurve, quat: ROT_180 },

  // NW 1, NE 0, SW 0, SE 0
  { mesh: grassMeshes.smallCurve, quat: ROT_0 },

  // NW 1, NE 0, SW 0, SE 1
  { mesh: grassMeshes.twoSmallCurve, quat: ROT_0 },

  // NW 1, NE 0, SW 1, SE 0
  { mesh: grassMeshes.edge, quat: ROT_0 },

  // NW 1, NE 0, SW 1, SE 1
  { mesh: grassMeshes.bigCurve, quat: ROT_270 },

  // NW 1, NE 1, SW 0, SE 0
  { mesh: grassMeshes.edge, quat: ROT_90 },

  // NW 1, NE 1, SW 0, SE 1
  { mesh: grassMeshes.bigCurve, quat: ROT_90 },

  // NW 1, NE 1, SW 1, SE 0
  { mesh: grassMeshes.bigCurve, quat: ROT_0 },

  // NW 1, NE 1, SW 1, SE 1
  { mesh: grassMeshes.full, quat: ROT_0 },
];

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
const gridMesh = createLineMesh( glGameCanvas.gl, gridGeo, colorShader );

// const cameraViewMatrix = mat4.lookAt( [], [ 10, 20, 10 ], [ 0, 0, 0 ], [ 0, 1, 0 ] );
// const cameraPos = [ -2, 0, -2 ];

const camera = new OrbitCamera();

glGameCanvas.draw = ( gl ) => {
  const modelMatrix = mat4.create();
  const viewMatrix = camera.getViewMatrix();  //mat4.translate( [], cameraViewMatrix, cameraPos );


  // const minWidth = Viewport[ 2 ] - Viewport[ 0 ];
  // const minHeight = Viewport[ 3 ] - Viewport[ 1 ];

  // const xScale = gl.canvas.clientWidth / minWidth;
  // const yScale = gl.canvas.clientHeight / minHeight;

  // const scale = Math.min( xScale, yScale );
  // const offsetX = ( minWidth - gl.canvas.clientWidth / scale ) / 2;
  // const offsetY = ( minHeight - gl.canvas.clientHeight / scale ) / 2;

  // const projMatrix = mat4.ortho(
  //   [],
  //   Viewport[ 0 ] + offsetX,
  //   Viewport[ 2 ] - offsetX,
  //   Viewport[ 1 ] + offsetY,
  //   Viewport[ 3 ] - offsetY,
  //   0,
  //   100
  // );

  const projMatrix = mat4.perspective( [], Math.PI / 4, gl.canvas.clientWidth / gl.canvas.clientHeight, 0.1, 100 );

  const mvp = mat4.mul( [], viewMatrix, modelMatrix );
  mat4.mul( mvp, projMatrix, mvp );

  const normalMatrix = mat4.invert( [], modelMatrix );
  mat4.transpose( normalMatrix, normalMatrix );

  gl.useProgram( gridMesh.shader.program );
  gl.uniformMatrix4fv( gridMesh.shader.uniformLocations.mvp, false, mvp );
  gl.uniformMatrix4fv( gridMesh.shader.uniformLocations.normalMatrix, false, normalMatrix );

  gl.uniform3fv( gridMesh.shader.uniformLocations.color, [ 1, 1, 1 ] );

  gl.bindVertexArray( gridMesh.vao );
  gl.drawArrays( gl.LINES, ROT_0, gridMesh.geometry.positions.length / 3 );

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

      const grassInfo = Tiles[ ( nw << 3 ) + ( ne << 2 ) + ( sw << 1 ) + se ];

      mat4.fromRotationTranslation(
        modelMatrix,
        grassInfo?.quat ?? [ 0, 0, 0, 1 ],
        [ col, 0, row ],
      );

      const mvp = mat4.mul( [], viewMatrix, modelMatrix );
      mat4.mul( mvp, projMatrix, mvp );

      const normalMatrix = mat4.invert( [], modelMatrix );
      mat4.transpose( normalMatrix, normalMatrix );

      if ( grassInfo ) {
        gl.useProgram( grassInfo.mesh.shader.program );
        gl.uniformMatrix4fv( grassInfo.mesh.shader.uniformLocations.mvp, false, mvp );
        gl.uniformMatrix4fv( grassInfo.mesh.shader.uniformLocations.normalMatrix, false, normalMatrix );

        gl.uniform3fv( grassInfo.mesh.shader.uniformLocations.color, [ 0, 1, 0 ] );

        gl.bindVertexArray( grassInfo.mesh.vao );
        gl.drawElements( gl.TRIANGLES, grassInfo.mesh.geometry.indices.length, gl.UNSIGNED_SHORT, 0 );
      }

      gl.useProgram( waterMesh.shader.program );
      gl.uniformMatrix4fv( waterMesh.shader.uniformLocations.mvp, false, mvp );
      gl.uniformMatrix4fv( waterMesh.shader.uniformLocations.normalMatrix, false, normalMatrix );

      gl.uniform3fv( waterMesh.shader.uniformLocations.color, [ 0, 0, 1 ] );

      gl.bindVertexArray( waterMesh.vao );
      gl.drawElements( gl.TRIANGLES, waterMesh.geometry.indices.length, gl.UNSIGNED_SHORT, 0 );
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


function createMesh( gl, geometry, shader ) {
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

  return {
    vao: vao,
    geometry: geometry,
    shader: shader,
  };
}

function createLineMesh( gl, geometry, shader ) {
  const vao = gl.createVertexArray();
  gl.bindVertexArray( vao );

  gl.bindBuffer( gl.ARRAY_BUFFER, createArrayBuffer( gl, geometry.positions ) );
  gl.vertexAttribPointer( shader.attribLocations.position, 3, gl.FLOAT, false, 0, 0 );
  gl.enableVertexAttribArray( shader.attribLocations.position );

  gl.bindVertexArray( null );

  return {
    vao: vao,
    geometry: geometry,
    shader: shader,
  };
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
