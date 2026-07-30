export function drawLine( ctx, start, end ) {
  ctx.beginPath();
  ctx.moveTo( ...start );
  ctx.lineTo( ...end );
  ctx.stroke();
}

export function drawPoint( ctx, p, radius = 0.02 ) {
  ctx.beginPath();
  ctx.arc( p[ 0 ], p[ 1 ], radius, 0, Math.PI * 2 );
  ctx.fill();
}

export function drawText( ctx, text, x, y, fillStyle = 'white' ) {
  ctx.save(); {
    // Firefox doesn't play nice with small font sizes, so scale it instead
    ctx.translate( x, y );
    ctx.scale( 0.02, 0.02 );
    ctx.font = '10px Arial';

    ctx.fillStyle = fillStyle;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    ctx.shadowColor = 'black';
    ctx.shadowBlur = 8;

    ctx.fillText( text, 0, 0 );
  }
  ctx.restore();
}