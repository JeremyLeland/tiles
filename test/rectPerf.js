import { GameCanvas } from '../src/common/GameCanvas.js';


const gameCanvas = new GameCanvas();
gameCanvas.bounds = [ -4, -4, 4, 4 ];
gameCanvas.backgroundColor = '#123';

const [ minX, minY, maxX, maxY ] = gameCanvas.bounds;
const rects = [];

for ( let i = 0; i < 1000; i ++ ) {
  rects.push( {
    x: minX + Math.random() * ( maxX - minX ),
    y: minY + Math.random() * ( maxY - minY ),
    size: 0.1 + Math.random() * 0.5,
    turnSpeed: 1 / ( 500 + Math.random() * 500 ),
    turnOffset: Math.random() * Math.PI,
  } );
}


let time = 0;

gameCanvas.update = ( dt ) => {
  time += dt;
}


let mode = 'path';

gameCanvas.draw = ( ctx ) => {
  ctx.fillStyle = 'gray';

  rects.forEach( rect => {
    ctx.save(); {
      ctx.translate( rect.x, rect.y );
      ctx.rotate( rect.turnOffset + time * rect.turnSpeed );
      ctx.scale( rect.size, rect.size );

      const grad = ctx.createLinearGradient( -0.5, -0.5, 0.5, 0.5 );
      grad.addColorStop( 0, 'green' );
      grad.addColorStop( 0.5, 'yellow' );
      grad.addColorStop( 1, 'red' );
      ctx.fillStyle = grad;


      if ( mode == 'path' ) {
        ctx.beginPath();
        ctx.moveTo( -0.5, -0.5 );
        ctx.lineTo(  0.5, -0.5 );
        ctx.lineTo(  0.5,  0.5 );
        ctx.lineTo( -0.5,  0.5 );
        ctx.closePath();
        ctx.fill();
      }
      else if ( mode == 'rect' ) {
        ctx.fillRect( -0.5, -0.5, 1, 1 );
      }
    }
    ctx.restore();
  } );

  ctx.fillStyle = 'white';
  ctx.font = '0.2px Arial';
  ctx.textBaseline = 'top';
  ctx.fillText( mode, 3, -4 );
}

gameCanvas.start();

document.addEventListener( 'keydown', e => {
  if ( e.key == ' ' ) {
    if ( mode == 'path' ) {
      mode = 'rect';
    }
    else {
      mode = 'path';
    }
  }
} );