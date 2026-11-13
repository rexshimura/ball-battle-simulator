// Impact shockwave, radial slash spikes, and spark particles for COMBO tag hits

const COMBO_COLORS = ['#f97316', '#fb923c', '#fbbf24', '#fde047', '#ef4444'];

export function emitComboImpact(atk, def, comboImpacts) {
  if (!atk || !def || !comboImpacts) return;
  const stacks = Math.max(1, atk.comboStacks || 1);
  const scale = Math.min(1.6, 1 + stacks * 0.08);

  // Collision midpoint on the surface between atk and def
  const dx = def.x - atk.x;
  const dy = def.y - atk.y;
  const dist = Math.max(1, Math.hypot(dx, dy));
  const ux = dx / dist;
  const uy = dy / dist;
  const ix = atk.x + ux * (atk.radius || 38);
  const iy = atk.y + uy * (atk.radius || 38);

  // Expanding impact ring + radial burst lines
  comboImpacts.push({
    kind: 'burst',
    x: ix,
    y: iy,
    maxRadius: (18 + Math.min(18, stacks * 2.5)) * scale,
    spikes: 6 + Math.min(4, Math.floor(stacks / 2)),
    rot: Math.random() * Math.PI,
    life: 1.0,
    decay: 0.075,
    color: stacks >= 4 ? '#fde047' : '#fb923c',
  });

  // Crisp high-energy impact sparks
  const sparkCount = Math.min(14, 7 + stacks);
  for (let i = 0; i < sparkCount; i++) {
    const ang = Math.random() * Math.PI * 2;
    const spd = (2.2 + Math.random() * 3.2) * Math.min(1.35, 1 + stacks * 0.04);
    comboImpacts.push({
      kind: 'spark',
      x: ix,
      y: iy,
      vx: Math.cos(ang) * spd,
      vy: Math.sin(ang) * spd,
      radius: 2.0 + Math.random() * 2.2,
      life: 1.0,
      decay: 0.055 + Math.random() * 0.03,
      color: COMBO_COLORS[Math.floor(Math.random() * COMBO_COLORS.length)],
    });
  }
}

export function updateComboImpacts(comboImpacts) {
  if (!comboImpacts || comboImpacts.length === 0) return;
  for (let i = comboImpacts.length - 1; i >= 0; i--) {
    const ci = comboImpacts[i];
    if (ci.kind === 'spark') {
      ci.x += ci.vx;
      ci.y += ci.vy;
      ci.vx *= 0.91;
      ci.vy *= 0.91;
    }
    ci.life -= ci.decay;
    if (ci.life <= 0) {
      comboImpacts.splice(i, 1);
    }
  }
}

export function renderComboImpacts(ctx, comboImpacts) {
  if (!comboImpacts || comboImpacts.length === 0) return;
  for (let i = 0; i < comboImpacts.length; i++) {
    const ci = comboImpacts[i];
    const alpha = Math.max(0, Math.min(1, ci.life));
    const progress = 1 - alpha;

    ctx.save();
    if (ci.kind === 'burst') {
      const r = 6 + (ci.maxRadius - 6) * progress;
      ctx.globalAlpha = alpha * 0.9;
      ctx.strokeStyle = ci.color;
      ctx.lineWidth = Math.max(1.5, 3.2 * alpha);
      ctx.beginPath();
      ctx.arc(ci.x, ci.y, r, 0, Math.PI * 2);
      ctx.stroke();

      // Radial impact spikes
      ctx.lineCap = 'round';
      ctx.lineWidth = Math.max(1.2, 2.5 * alpha);
      for (let s = 0; s < ci.spikes; s++) {
        const ang = ci.rot + (s * Math.PI * 2) / ci.spikes;
        const inner = r * 0.55;
        const outer = r * 1.35;
        ctx.beginPath();
        ctx.moveTo(ci.x + Math.cos(ang) * inner, ci.y + Math.sin(ang) * inner);
        ctx.lineTo(ci.x + Math.cos(ang) * outer, ci.y + Math.sin(ang) * outer);
        ctx.stroke();
      }
    } else {
      ctx.globalAlpha = alpha * 0.95;
      ctx.fillStyle = ci.color;
      ctx.beginPath();
      ctx.arc(ci.x, ci.y, Math.max(0.7, ci.radius * alpha), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}
