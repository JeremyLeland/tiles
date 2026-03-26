export class GLGameCanvas {
  #lastTime;
  #isAnimated = false;

  constructor( canvas ) {
    if ( canvas ) {
      this.canvas = canvas;
    }
    else {
      this.canvas = document.createElement( 'canvas' );
      document.body.appendChild( this.canvas );

      Object.assign( this.canvas.style, {
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100vw',
        height: '100vh',
        touchAction: 'none',
        userSelect: 'none',
      } );
    }

    this.canvas.oncontextmenu = () => { return false };

    this.gl = this.canvas.getContext( 'webgl2' );

    if ( this.gl === null ) {
      console.error( 'Unable to initialize WebGL2.' );
    }

    this.gl.clearColor( 0.3, 0.2, 0.1, 1.0 ); // TODO: Setable color, maybe from vec4?
    this.gl.clearDepth( 1.0 );
    this.gl.enable( this.gl.DEPTH_TEST );
    this.gl.depthFunc( this.gl.LEQUAL );

    //
    // Resize canvas
    //

    new ResizeObserver( _ => {
      const cssWidth = this.canvas.clientWidth;
      const cssHeight = this.canvas.clientHeight;

      this.canvas.width = cssWidth * devicePixelRatio;
      this.canvas.height = cssHeight * devicePixelRatio;

      this.gl.viewport( 0, 0, this.canvas.width, this.canvas.height );

      this.redraw();
    } ).observe( this.canvas );
  }

  //
  // Animation (update loop)
  //
  #animate = ( now ) => {
    this.#lastTime ??= now;
    this.update( Math.min( now - this.#lastTime, 100 ) );   // prevent large updates from delays
    this.#lastTime = now;

    this.redraw();

    if ( this.#isAnimated ) {
      requestAnimationFrame( this.#animate );
    }
  }

  start() {
    if ( !this.#isAnimated ) {
      this.#isAnimated = true;
      requestAnimationFrame( this.#animate );
    }
  }

  stop() {
    this.#isAnimated = false;
  }

  //
  // Drawing
  //
  redraw() {
    this.gl.clear( this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT );
    this.draw( this.gl );
  }

  //
  // Users override these functions
  //
  update( dt ) {}
  draw( gl ) {}
}
