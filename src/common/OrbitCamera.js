import { mat4, vec3 } from '../../lib/gl-matrix.js';

const MIN_DIST = 1;
const MAX_DIST = 100;

export class OrbitCamera {
  center = [ 0, 0, 0 ];
  distance = 10;
  phi = Math.PI / 2;
  theta = Math.PI / 3;

  #eyePos = vec3.create();
  #viewMatrix = mat4.create();

  constructor( vals ) {
    Object.assign( this, vals );
    this.#updateViewMatrix();
  }

  getEyePos() {
    return this.#eyePos;
  }

  getViewMatrix() {
    return this.#viewMatrix;
  }

  // TODO: Don't duplicate this from above, just do it once
  reset() {
    this.center = [ 0, 0, 0 ];
    this.distance = 10;
    this.phi = Math.PI / 2;
    this.theta = Math.PI / 3;

    this.#updateViewMatrix();
  }

  rotate( dPhi, dTheta ) {
    this.phi += dPhi;

    // Avoid theta of exactly 0 or Math.PI, things get weird
    this.theta = Math.max( 1e-6, Math.min( Math.PI - 1e-6, this.theta + dTheta ) );

    this.#updateViewMatrix();
  }

  pan( dx, dy ) {
    const cos = Math.cos( this.phi );
    const sin = Math.sin( this.phi );

    this.center[ 0 ] +=  sin * dx + cos * dy;
    this.center[ 2 ] += -cos * dx + sin * dy;

    this.#updateViewMatrix();
  }

  zoom( dDistance ) {
    this.distance = Math.max( MIN_DIST, Math.min( MAX_DIST, this.distance + dDistance ) );

    this.#updateViewMatrix();
  }

  #updateViewMatrix() {
    vec3.set(
      this.#eyePos,
      this.center[ 0 ] + this.distance * Math.cos( this.phi ) * Math.sin( this.theta ),
      this.center[ 1 ] + this.distance * Math.cos( this.theta ),
      this.center[ 2 ] + this.distance * Math.sin( this.phi ) * Math.sin( this.theta )
    );

    mat4.lookAt(
      this.#viewMatrix,
      this.#eyePos,
      this.center,
      [ 0, 1, 0 ],
    );
  }
}