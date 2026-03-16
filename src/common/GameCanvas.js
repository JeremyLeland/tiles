export class GameCanvas {
  bounds = [ -5, -5, 5, 5 ];
  backgroundColor = '#000';

  centerHorizontally = true;
  centerVertically = true;

  #lastTime;
  #isAnimated = false;

  #scale = 1;
  #offsetX = 0;
  #offsetY = 0;

  #mouse = {};

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

    this.ctx = this.canvas.getContext( '2d' );

    this.canvas.oncontextmenu = () => { return false };

    //
    // Resize canvas
    //

    new ResizeObserver( _ => {
      const cssWidth = this.canvas.clientWidth;
      const cssHeight = this.canvas.clientHeight;

      this.canvas.width = cssWidth * devicePixelRatio;
      this.canvas.height = cssHeight * devicePixelRatio;

      const minWidth = this.bounds[ 2 ] - this.bounds[ 0 ];
      const minHeight = this.bounds[ 3 ] - this.bounds[ 1 ];

      const xScale = cssWidth / minWidth;
      const yScale = cssHeight / minHeight;

      this.#scale = Math.min( xScale, yScale );

      this.#offsetX = this.bounds[ 0 ] + ( this.centerHorizontally ? ( minWidth - cssWidth / this.#scale ) / 2 : 0 );
      this.#offsetY = this.bounds[ 1 ] + ( this.centerVertically ? ( minHeight - cssHeight / this.#scale ) / 2 : 0 );

      this.redraw();
    } ).observe( this.canvas );

    //
    // Pointer input
    //

    this.canvas.addEventListener( 'pointerdown', e => {
      this.#updatePointerInfo( e );
      this.pointerDown( this.#mouse );
    } );

    this.canvas.addEventListener( 'pointermove', e => {
      this.#updatePointerInfo( e );
      this.pointerMove( this.#mouse );

      // TODO: Do we need this? Why did we do this?
      this.#mouse.dx = 0;
      this.#mouse.dy = 0;
    } );

    this.canvas.addEventListener( 'pointerup', e => {
      this.#updatePointerInfo( e );
      this.pointerUp( this.#mouse );
    } );

    this.canvas.addEventListener( 'pointerout', e => {
      this.#updatePointerInfo( e );
      this.pointerUp( this.#mouse );
    } );

    this.canvas.addEventListener( 'wheel', e => {
      this.#updatePointerInfo( e );
      this.wheelInput( this.#mouse );

      // TODO: Do we still need this?
      this.#mouse.wheel = 0;

      e.preventDefault();
    } );
  }

  #updatePointerInfo( e ) {
    const lastX = this.#mouse.x ?? undefined;
    const lastY = this.#mouse.y ?? undefined;
    this.#mouse.x = e.pageX / this.#scale + this.#offsetX;
    this.#mouse.y = e.pageY / this.#scale + this.#offsetY;
    this.#mouse.dx = lastX ? this.#mouse.x - lastX : 0;
    this.#mouse.dy = lastY ? this.#mouse.y - lastY : 0;
    this.#mouse.buttons = e.buttons;
    this.#mouse.wheel = e.wheelDelta;
    this.#mouse.shiftKey = e.shiftKey;
    this.#mouse.ctrlKey = e.ctrlKey;
    this.#mouse.altKey = e.altKey;
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
    // scaleX, skewY, skewX, scaleY, translateX, translateY
    this.ctx.setTransform( devicePixelRatio, 0, 0, devicePixelRatio, 0, 0 );

    this.ctx.scale( this.#scale, this.#scale );
    this.ctx.translate( -this.#offsetX, -this.#offsetY );

    this.ctx.fillStyle = this.backgroundColor;
    this.ctx.fillRect(
      this.#offsetX,
      this.#offsetY,
      this.canvas.clientWidth / this.#scale,
      this.canvas.clientHeight / this.#scale,
    );

    this.draw( this.ctx );
  }

  //
  // Users override these functions
  //
  update( dt ) {}
  draw( ctx ) {}

  pointerDown( pointerInfo ) {}
  pointerMove( pointerInfo ) {}
  pointerUp( pointerInfo ) {}
  wheelInput( pointerInfo ) {}
}
