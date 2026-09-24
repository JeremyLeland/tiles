export class KeyInput {
  Keys;
  Actions;

  constructor() {
    document.addEventListener( 'keydown', e => this.handleKeyInput( e, true  ) );
    document.addEventListener( 'keyup',   e => this.handleKeyInput( e, false ) );
  }

  handleKeyInput( e, isDown ) {
    for ( const action in this.Keys ) {
      if ( e.key === this.Keys[ action ] ) {
        this.Actions[ action ]( isDown );
      }
    }
  }
}


