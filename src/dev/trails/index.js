import {
  emitBloodlustTrail,
  updateBloodlustTrail,
  renderBloodlustTrail,
  emitBloodSiphonBurst,
  updateBloodSiphons,
  renderBloodSiphons,
} from './bloodlustTrail';
import {
  emitMomentumWallBurst,
  emitMomentumTrail,
  updateMomentumTrail,
  renderMomentumTrail,
} from './momentumTrail';
import {
  emitFuryTrail,
  updateFuryTrail,
  renderFuryTrail,
} from './furyTrail';
import {
  emitComboImpact,
  updateComboImpacts,
  renderComboImpacts,
} from './comboImpact';

export { emitBloodSiphonBurst, emitMomentumWallBurst, emitComboImpact };

export function createTrailState() {
  return {
    trailPoints: [],
    fireTrails: [],
    bloodlustTrails: [],
    bloodlustSiphons: [],
    momentumTrails: [],
    furyTrails: [],
    comboImpacts: [],
  };
}

export function resetTrails(physics) {
  physics.trailPoints = [];
  physics.fireTrails = [];
  physics.bloodlustTrails = [];
  physics.bloodlustSiphons = [];
  physics.momentumTrails = [];
  physics.furyTrails = [];
  physics.comboImpacts = [];
}

export function updateTrails(physics, onBloodAbsorb = null) {
  const { trailPoints, fireTrails, bloodlustTrails, bloodlustSiphons, momentumTrails, furyTrails, comboImpacts, balls } = physics;

  if (trailPoints) {
    for (let i = trailPoints.length - 1; i >= 0; i--) {
      trailPoints[i].life -= 0.045;
      if (trailPoints[i].life <= 0) trailPoints.splice(i, 1);
    }
  }

  if (fireTrails) {
    for (let i = fireTrails.length - 1; i >= 0; i--) {
      fireTrails[i].life -= fireTrails[i].decay;
      if (fireTrails[i].life <= 0) fireTrails.splice(i, 1);
    }
  }

  updateBloodlustTrail(bloodlustTrails);
  updateBloodSiphons(bloodlustSiphons, balls, onBloodAbsorb);
  updateMomentumTrail(momentumTrails);
  updateFuryTrail(furyTrails);
  updateComboImpacts(comboImpacts);
}

export function emitFireGroundTrail(ball, physics, isSpitFire) {
  const spd = Math.hypot(ball.vx, ball.vy);
  if (spd > 0.35 && Math.random() < 0.18) {
    if (!physics.fireTrails) physics.fireTrails = [];
    const backAng = Math.atan2(-ball.vy, -ball.vx);
    const dropDist = ball.radius * (0.35 + Math.random() * 0.45);
    physics.fireTrails.push({
      x: ball.x + Math.cos(backAng) * dropDist + (Math.random() - 0.5) * 6,
      y: ball.y + Math.sin(backAng) * dropDist + (Math.random() - 0.5) * 6,
      radius: ball.radius * (0.55 + Math.random() * 0.35),
      life: 1.0,
      decay: 0.024 + Math.random() * 0.012,
      flicker: Math.random() * 20,
      isBlue: isSpitFire,
    });
  }
}

export function emitTagTrails(ball, physics) {
  if (!ball || ball.isDead || ball.isDying) return;
  if (!physics.bloodlustTrails) physics.bloodlustTrails = [];
  if (!physics.momentumTrails) physics.momentumTrails = [];
  if (!physics.furyTrails) physics.furyTrails = [];
  emitBloodlustTrail(ball, physics.bloodlustTrails);
  emitMomentumTrail(ball, physics.momentumTrails);
  emitFuryTrail(ball, physics.furyTrails);
}

export function renderTrails(ctx, physics) {
  if (physics.trailPoints) {
    physics.trailPoints.forEach(tp => {
      ctx.save();
      const alpha = tp.maxAlpha !== undefined
        ? Math.max(0, (tp.life / tp.baseLife) * tp.maxAlpha)
        : Math.max(0, tp.life * 0.18);
      ctx.globalAlpha = Math.min(1.0, alpha);
      ctx.fillStyle = tp.color;
      ctx.beginPath();
      ctx.arc(tp.x, tp.y, tp.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  if (physics.fireTrails) {
    const fNow = performance.now() * 0.008;
    physics.fireTrails.forEach(ft => {
      const alpha = Math.max(0, Math.min(1, ft.life));
      const flick = 1 + 0.12 * Math.sin(fNow + ft.flicker);
      const r = ft.radius * (0.45 + 0.55 * alpha) * flick;
      ctx.save();
      ctx.globalAlpha = alpha * 0.85;
      ctx.fillStyle = ft.isBlue ? '#0369a1' : '#c2410c';
      ctx.beginPath();
      ctx.arc(ft.x, ft.y, r, 0, Math.PI * 2);
      ctx.fill();
      if (alpha > 0.35) {
        ctx.fillStyle = ft.isBlue ? '#0ea5e9' : '#f97316';
        ctx.beginPath();
        ctx.arc(ft.x, ft.y - r * 0.15, r * 0.62, 0, Math.PI * 2);
        ctx.fill();
      }
      if (alpha > 0.65) {
        ctx.fillStyle = ft.isBlue ? '#67e8f9' : '#fde047';
        ctx.beginPath();
        ctx.arc(ft.x, ft.y - r * 0.25, r * 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });
  }

  renderFuryTrail(ctx, physics.furyTrails);
  renderMomentumTrail(ctx, physics.momentumTrails);
  renderBloodlustTrail(ctx, physics.bloodlustTrails);
  renderBloodSiphons(ctx, physics.balls, physics.bloodlustSiphons);
  renderComboImpacts(ctx, physics.comboImpacts);
}
