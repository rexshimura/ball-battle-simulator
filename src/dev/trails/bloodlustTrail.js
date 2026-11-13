// Unique crimson particle trail for balls with the BLOODLUST effect tag

const BLOODLUST_COLORS = ['#dc2626', '#ef4444', '#b91c1c', '#f87171', '#991b1b'];

export function emitBloodlustTrail(ball, bloodlustTrails) {
  if (!ball || ball.isDead || ball.isDying) return;
  if (!ball.effectTags?.includes('BLOODLUST')) return;

  const spd = Math.hypot(ball.vx || 0, ball.vy || 0);
  const hasDir = spd > 0.15;
  const spawnCount = spd > 1.2 ? 2 : 1;

  // Emit behind the ball's motion vector, or gently drift around/upward when stationary
  const backX = hasDir ? -(ball.vx / spd) : 0;
  const backY = hasDir ? -(ball.vy / spd) : 0;

  for (let i = 0; i < spawnCount; i++) {
    if (Math.random() > (hasDir ? 0.72 : 0.45)) continue;
    const spreadAngle = Math.random() * Math.PI * 2;
    const rimDist = hasDir
      ? ball.radius * (0.25 + Math.random() * 0.55)
      : ball.radius * (0.7 + Math.random() * 0.35);
    const px = hasDir
      ? ball.x + backX * (ball.radius * 0.45) + Math.cos(spreadAngle) * rimDist * 0.65
      : ball.x + Math.cos(spreadAngle) * rimDist;
    const py = hasDir
      ? ball.y + backY * (ball.radius * 0.45) + Math.sin(spreadAngle) * rimDist * 0.65
      : ball.y + Math.sin(spreadAngle) * rimDist;

    bloodlustTrails.push({
      x: px,
      y: py,
      vx: hasDir
        ? backX * (0.4 + Math.random() * 0.8) + (Math.random() - 0.5) * 0.9
        : Math.cos(spreadAngle) * 0.25 + (Math.random() - 0.5) * 0.4,
      vy: hasDir
        ? backY * (0.4 + Math.random() * 0.8) + (Math.random() - 0.5) * 0.9 - 0.15
        : -0.35 - Math.random() * 0.55,
      radius: Math.max(1.8, Math.min(4.8, ball.radius * (0.07 + Math.random() * 0.08))),
      color: BLOODLUST_COLORS[Math.floor(Math.random() * BLOODLUST_COLORS.length)],
      life: 1.0,
      decay: hasDir ? (0.032 + Math.random() * 0.025) : (0.024 + Math.random() * 0.02),
      isDroplet: Math.random() > 0.55,
    });
  }
}

export function updateBloodlustTrail(bloodlustTrails) {
  if (!bloodlustTrails) return;
  for (let i = bloodlustTrails.length - 1; i >= 0; i--) {
    const bt = bloodlustTrails[i];
    bt.x += bt.vx;
    bt.y += bt.vy;
    bt.vx *= 0.94;
    bt.vy *= 0.94;
    bt.life -= bt.decay;
    if (bt.life <= 0) {
      bloodlustTrails.splice(i, 1);
    }
  }
}

export function emitBloodSiphonBurst(sourceBall, targetBall, bloodlustSiphons, count = 7, healCount = 0) {
  if (!sourceBall || !targetBall || !bloodlustSiphons) return;
  for (let i = 0; i < count; i++) {
    const ang = Math.random() * Math.PI * 2;
    const burstSpd = 2.0 + Math.random() * 3.4;
    const startDist = (sourceBall.radius || 22) * (0.4 + Math.random() * 0.5);
    bloodlustSiphons.push({
      sourceId: sourceBall.id,
      targetId: targetBall.id,
      x: sourceBall.x + Math.cos(ang) * startDist,
      y: sourceBall.y + Math.sin(ang) * startDist,
      vx: Math.cos(ang) * burstSpd,
      vy: Math.sin(ang) * burstSpd,
      tx: targetBall.x,
      ty: targetBall.y,
      tr: targetBall.radius || 22,
      phase: 'splatter',
      splatterTimer: 10 + Math.floor(Math.random() * 6), // frames to burst outward
      lingerTimer: 22 + i * 3 + Math.floor(Math.random() * 10), // staggered stay before suction
      pullAccel: 0.45 + Math.random() * 0.35,
      radius: 2.3 + Math.random() * 2.5,
      stretch: 1.0,
      angle: ang,
      color: BLOODLUST_COLORS[Math.floor(Math.random() * BLOODLUST_COLORS.length)],
      life: 1.0,
      healAmount: i < healCount ? 1 : 0,
    });
  }
}

export function updateBloodSiphons(bloodlustSiphons, balls, onAbsorb = null) {
  if (!bloodlustSiphons || bloodlustSiphons.length === 0) return;
  for (let i = bloodlustSiphons.length - 1; i >= 0; i--) {
    const s = bloodlustSiphons[i];
    const tgt = balls?.find(b => b.id === s.targetId);
    if (tgt) {
      s.tx = tgt.x;
      s.ty = tgt.y;
      s.tr = tgt.radius || s.tr;
    }

    if (s.phase === 'splatter') {
      s.x += s.vx;
      s.y += s.vy;
      // Liquid splatter friction
      s.vx *= 0.84;
      s.vy *= 0.84;
      s.splatterTimer -= 1;
      if (s.splatterTimer <= 0) {
        s.phase = 'linger';
      }
    } else if (s.phase === 'linger') {
      s.x += s.vx;
      s.y += s.vy;
      s.vx *= 0.72;
      s.vy *= 0.72;
      s.lingerTimer -= 1;
      if (s.lingerTimer <= 0) {
        s.phase = 'pull';
      }
    } else {
      const dx = s.tx - s.x;
      const dy = s.ty - s.y;
      const dist = Math.hypot(dx, dy);
      if (dist <= Math.max(8, s.tr * 0.65)) {
        if (onAbsorb && tgt && !tgt.isDead && !tgt.isDying) {
          onAbsorb(tgt, s);
        }
        bloodlustSiphons.splice(i, 1);
        continue;
      }
      const ux = dx / dist;
      const uy = dy / dist;
      // Accelerate like pulled liquid toward the Bloodlust ball
      s.vx = s.vx * 0.84 + ux * (s.pullAccel + Math.min(8.5, 160 / Math.max(20, dist)));
      s.vy = s.vy * 0.84 + uy * (s.pullAccel + Math.min(8.5, 160 / Math.max(20, dist)));
      s.x += s.vx;
      s.y += s.vy;

      const spd = Math.hypot(s.vx, s.vy);
      s.angle = Math.atan2(s.vy, s.vx);
      s.stretch = Math.min(2.8, 1.0 + spd * 0.16);
      s.life = Math.max(0.25, s.life - 0.008);
    }
  }
}

export function renderBloodSiphons(ctx, balls, bloodlustSiphons) {
  // Liquid blood splatters on hit/drain that stretch and get sucked into the Bloodlust ball
  if (bloodlustSiphons && bloodlustSiphons.length > 0) {
    for (let i = 0; i < bloodlustSiphons.length; i++) {
      const s = bloodlustSiphons[i];
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.angle || 0);
      ctx.globalAlpha = 0.9 * s.life;
      ctx.fillStyle = s.color;

      if (s.phase === 'splatter' || s.phase === 'linger') {
        // Organic liquid splatter puddle/blob
        ctx.beginPath();
        ctx.ellipse(0, 0, s.radius * 1.15, s.radius * 0.85, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Liquid teardrop stretched toward the Bloodlust ball
        const rx = s.radius * s.stretch;
        const ry = Math.max(1.2, s.radius * (1 / Math.sqrt(s.stretch)));
        ctx.beginPath();
        ctx.moveTo(rx, 0);
        ctx.quadraticCurveTo(0, -ry * 1.25, -rx * 1.35, 0);
        ctx.quadraticCurveTo(0, ry * 1.25, rx, 0);
        ctx.closePath();
        ctx.fill();

        // Glossy liquid highlight
        ctx.globalAlpha = 0.55 * s.life;
        ctx.fillStyle = '#fecaca';
        ctx.beginPath();
        ctx.arc(rx * 0.25, -ry * 0.2, Math.max(0.7, ry * 0.38), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }
}

export function renderBloodlustTrail(ctx, bloodlustTrails) {
  if (!bloodlustTrails || bloodlustTrails.length === 0) return;
  for (let i = 0; i < bloodlustTrails.length; i++) {
    const bt = bloodlustTrails[i];
    const alpha = Math.max(0, Math.min(1, bt.life));
    const r = Math.max(0.6, bt.radius * (0.35 + 0.65 * alpha));

    ctx.save();
    ctx.globalAlpha = alpha * 0.85;
    ctx.fillStyle = bt.color;
    ctx.beginPath();
    ctx.arc(bt.x, bt.y, r, 0, Math.PI * 2);
    ctx.fill();

    // Crisp bright crimson core on larger droplets
    if (bt.isDroplet && alpha > 0.45 && r > 1.8) {
      ctx.globalAlpha = alpha * 0.55;
      ctx.fillStyle = '#fca5a5';
      ctx.beginPath();
      ctx.arc(bt.x - r * 0.2, bt.y - r * 0.2, r * 0.38, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}
