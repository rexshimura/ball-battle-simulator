// Kinetic violet trail & wall-bounce shockwave for balls with the MOMENTUM effect tag

const MOMENTUM_COLORS = ['#a855f7', '#c084fc', '#9333ea', '#e9d5ff'];

export function emitMomentumWallBurst(ball, momentumTrails) {
  if (!ball || !momentumTrails) return;
  const stacks = Math.max(1, ball.momentumStacks || 1);
  const r = ball.radius || 38;

  // Primary expanding kinetic ring at wall impact point
  momentumTrails.push({
    kind: 'ring',
    x: ball.x,
    y: ball.y,
    radius: r * 0.85,
    maxRadius: r * (1.65 + Math.min(0.7, stacks * 0.14)),
    life: 1.0,
    decay: 0.055,
    color: '#c084fc',
  });

  // Secondary inner shockwave ring
  momentumTrails.push({
    kind: 'ring',
    x: ball.x,
    y: ball.y,
    radius: r * 0.65,
    maxRadius: r * (1.25 + Math.min(0.45, stacks * 0.1)),
    life: 1.0,
    decay: 0.075,
    color: '#e9d5ff',
  });

  // Burst of kinetic purple sparks radiating from wall bounce
  const sparkCount = Math.min(18, 8 + stacks * 2);
  for (let i = 0; i < sparkCount; i++) {
    const ang = Math.random() * Math.PI * 2;
    const spd = 1.8 + Math.random() * (2.6 + Math.min(1.6, stacks * 0.25));
    const startDist = r * (0.45 + Math.random() * 0.45);
    momentumTrails.push({
      kind: 'spark',
      x: ball.x + Math.cos(ang) * startDist,
      y: ball.y + Math.sin(ang) * startDist,
      vx: Math.cos(ang) * spd,
      vy: Math.sin(ang) * spd,
      radius: 2.0 + Math.random() * 2.2,
      life: 1.0,
      decay: 0.042 + Math.random() * 0.028,
      color: MOMENTUM_COLORS[Math.floor(Math.random() * MOMENTUM_COLORS.length)],
    });
  }
}

export function emitMomentumTrail(ball, momentumTrails) {
  if (!ball || ball.isDead || ball.isDying || !momentumTrails) return;
  if (!ball.effectTags?.includes('MOMENTUM') || (ball.momentumStacks || 0) <= 0) return;

  const spd = Math.hypot(ball.vx || 0, ball.vy || 0);
  if (spd <= 0.25) return;

  const stacks = ball.momentumStacks || 1;
  const intensity = Math.min(1, 0.35 + stacks * 0.18);

  // Smooth trailing kinetic afterimage orb
  momentumTrails.push({
    kind: 'orb',
    x: ball.x,
    y: ball.y,
    radius: (ball.radius || 38) * (0.72 + Math.min(0.22, stacks * 0.04)),
    life: 1.0,
    decay: 0.065,
    maxAlpha: 0.22 + intensity * 0.24,
    color: stacks >= 3 ? '#c084fc' : '#a855f7',
  });

  // Occasional charged kinetic spark streaks
  if (Math.random() < 0.45 + Math.min(0.35, stacks * 0.08)) {
    const ux = -(ball.vx / spd);
    const uy = -(ball.vy / spd);
    const spread = (Math.random() - 0.5) * (ball.radius || 38) * 0.8;
    const px = -uy * spread;
    const py = ux * spread;
    momentumTrails.push({
      kind: 'spark',
      x: ball.x + ux * (ball.radius * 0.4) + px,
      y: ball.y + uy * (ball.radius * 0.4) + py,
      vx: ux * (0.8 + Math.random() * 1.1) + (Math.random() - 0.5) * 0.5,
      vy: uy * (0.8 + Math.random() * 1.1) + (Math.random() - 0.5) * 0.5,
      radius: 1.8 + Math.random() * 1.8,
      life: 1.0,
      decay: 0.055 + Math.random() * 0.03,
      color: MOMENTUM_COLORS[Math.floor(Math.random() * MOMENTUM_COLORS.length)],
    });
  }
}

export function updateMomentumTrail(momentumTrails) {
  if (!momentumTrails || momentumTrails.length === 0) return;
  for (let i = momentumTrails.length - 1; i >= 0; i--) {
    const mt = momentumTrails[i];
    if (mt.kind === 'spark') {
      mt.x += mt.vx;
      mt.y += mt.vy;
      mt.vx *= 0.93;
      mt.vy *= 0.93;
    }
    mt.life -= mt.decay;
    if (mt.life <= 0) {
      momentumTrails.splice(i, 1);
    }
  }
}

export function renderMomentumTrail(ctx, momentumTrails) {
  if (!momentumTrails || momentumTrails.length === 0) return;
  for (let i = 0; i < momentumTrails.length; i++) {
    const mt = momentumTrails[i];
    const alpha = Math.max(0, Math.min(1, mt.life));

    ctx.save();
    if (mt.kind === 'ring') {
      const progress = 1 - alpha;
      const r = mt.radius + (mt.maxRadius - mt.radius) * progress;
      ctx.globalAlpha = alpha * 0.75;
      ctx.strokeStyle = mt.color;
      ctx.lineWidth = Math.max(1.2, 3.0 * alpha);
      ctx.beginPath();
      ctx.arc(mt.x, mt.y, r, 0, Math.PI * 2);
      ctx.stroke();
    } else if (mt.kind === 'orb') {
      ctx.globalAlpha = alpha * (mt.maxAlpha || 0.3);
      ctx.fillStyle = mt.color;
      ctx.beginPath();
      ctx.arc(mt.x, mt.y, mt.radius * (0.65 + 0.35 * alpha), 0, Math.PI * 2);
      ctx.fill();
    } else {
      const r = Math.max(0.7, mt.radius * alpha);
      ctx.globalAlpha = alpha * 0.92;
      ctx.fillStyle = mt.color;
      ctx.beginPath();
      ctx.arc(mt.x, mt.y, r, 0, Math.PI * 2);
      ctx.fill();

      if (alpha > 0.45 && r > 1.6) {
        ctx.globalAlpha = alpha * 0.65;
        ctx.fillStyle = '#f3e8ff';
        ctx.beginPath();
        ctx.arc(mt.x, mt.y, r * 0.42, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }
}
