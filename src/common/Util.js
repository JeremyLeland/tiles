export function drawLine( ctx, start, end, showNormal = false ) {
  ctx.beginPath();
  ctx.moveTo( ...start );
  ctx.lineTo( ...end );
  ctx.stroke();

  // Normal
  if ( showNormal ) {
    const dx = end[ 0 ] - start[ 0 ];
    const dy = end[ 1 ] - start[ 1 ];
    const len = Math.hypot( dx, dy );
    const nx = dy / len;
    const ny = -dx / len;

    const normX = ( start[ 0 ] + end[ 0 ] ) / 2;
    const normY = ( start[ 1 ] + end[ 1 ] ) / 2;

    // ctx.save();

    ctx.lineWidth *= 0.5;

    ctx.beginPath();
    ctx.moveTo( normX, normY );
    ctx.lineTo( normX + nx * 0.5 * len, normY + ny * 0.5 * len );
    ctx.stroke();

    ctx.lineWidth *= 2;

    // ctx.restore();
  }
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