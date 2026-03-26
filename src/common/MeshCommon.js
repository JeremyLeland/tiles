export function createMesh( gl, geometry, shader ) {
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

export function createLineMesh( gl, geometry, shader ) {
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
