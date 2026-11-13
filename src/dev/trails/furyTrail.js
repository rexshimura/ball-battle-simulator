// Furious blazing orange trail for FURY balls after 8+ seconds (furyBonusPct >= 0.16)

const FURY_COLORS = ['#f97316', '#fb923c', '#ea580c', '#facc15', '#fde047'];

export function emitFuryTrail(ball, furyTrails) {
  if (!ball || ball.isDead || ball.isDying || !furyTrails) return;
  if (!ball.effectTags?.includes('FURY')) return;
  // Activate furious trail after 8 seconds (+2%/s -> 0.16)
  if ((ball.furyBonusPct || 0) < 0.16) return;

  const spd = Math.hypot(ball.vx || 0, ball.vy || 0);
  const hasDir = spd > 0.2;
  const furyScale = Math.min(1, ((ball.furyBonusPct || 0) - 0.16) / 0.34);

  // Hot orange afterimage wake when moving
  if (hasDir && Math.random() < 0.75) {
    furyTrails.push({
      kind: 'wake',
      x: ball.x,
      y: ball.y,
      radius: (ball.radius || 38) * (0.78 + furyScale * 0.14),
      life: 1.0,
      decay: 0.075,
      maxAlpha: 0.22 + furyScale * 0.18,
      color: furyScale > 0.5 ? '#fb923c' : '#f97316',
    });
  }

  // Furious ember sparks bursting from the wake / perimeter
  const sparkCount = hasDir ? 2 : 1;
  const backX = hasDir ? -(ball.vx / spd) : 0;
  const backY = hasDir ? -(ball.vy / spd) : 0;

  for (let i = 0; i < sparkCount; i++) {
    if (Math.random() > (hasDir ? 0.78 : 0.5)) continue;
    const spreadAng = Math.random() * Math.PI * 2;
    const rimDist = (ball.radius || 38) * (hasDir ? (0.3 + Math.random() * 0.55) : (0.7 + Math.random() * 0.35));
    furyTrails.push({
      kind: 'ember',
      x: ball.x + backX * ((ball.radius || 38) * 0.35) + Math.cos(spreadAng) * rimDist * 0.7,
      y: ball.y + backY * ((ball.radius || 38) * 0.35) + Math.sin(spreadAng) * rimDist * 0.7,
      vx: hasDir
        ? backX * (0.9 + Math.random() * 1.4) + (Math.random() - 0.5) * 1.1
        : (Math.random() - 0.5) * 0.7,
      vy: hasDir
        ? backY * (0.9 + Math.random() * 1.4) + (Math.random() - 0.5) * 1.1 - 0.25
        : -0.6 - Math.random() * 0.9,
      radius: 2.0 + Math.random() * (2.2 + furyScale * 1.2),
      life: 1.0,
      decay: 0.045 + Math.random() * 0.03,
      color: FURY_COLORS[Math.floor(Math.random() * FURY_COLORS.length)],
    });
  }
}

export function updateFuryTrail(furyTrails) {
  if (!furyTrails || furyTrails.length === 0) return;
  for (let i = furyTrails.length - 1; i >= 0; i--) {
    const ft = furyTrails[i];
    if (ft.kind === 'ember') {
      ft.x += ft.vx;
      ft.y += ft.vy;
      ft.vx *= 0.94;
      ft.vy *= 0.94;
    }
    ft.life -= ft.decay;
    if (ft.life <= 0) {
      furyTrails.splice(i, 1);
    }
  }
}

export function renderFuryTrail(ctx, furyTrails) {
  if (!furyTrails || furyTrails.length === 0) return;
  for (let i = 0; i < furyTrails.length; i++) {
    const ft = furyTrails[i];
    const alpha = Math.max(0, Math.min(1, ft.life));

    ctx.save();
    if (ft.kind === 'wake') {
      ctx.globalAlpha = alpha * (ft.maxAlpha || 0.25);
      ctx.fillStyle = ft.color;
      ctx.beginPath();
      ctx.arc(ft.x, ft.y, ft.radius * (0.6 + 0.4 * alpha), 0, Math.PI * 2);
      ctx.fill();
    } else {
      const r = Math.max(0.7, ft.radius * (0.35 + 0.65 * alpha));
      ctx.globalAlpha = alpha * 0.92;
      ctx.fillStyle = ft.color;
      ctx.beginPath();
      ctx.arc(ft.x, ft.y, r, 0, Math.PI * 2);
      ctx.fill();

      if (alpha > 0.5 && r > 1.8) {
        ctx.globalAlpha = alpha * 0.65;
        ctx.fillStyle = '#fef9c3';
        ctx.beginPath();
        ctx.arc(ft.x, ft.y, r * 0.42, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }
}
