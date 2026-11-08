import { useRef, useEffect, useState } from 'react';
import { BALL_CONFIGS, BALL_TYPES, TEAMS, RARITIES, RARITY_ORDER } from './ballConfig';
import { ShieldIcon, BladeIcon, SpikesIcon, ArmorIcon, HeavyIcon, RapidIcon, BleedIcon, SkullIcon, BrittleIcon, HammerIcon, KnockbackIcon, GrowIcon, VolumeIcon, VolumeMuteIcon, AlertTriangleIcon, ShardIcon, ShardTargetIcon, AccelerateIcon, GunIcon, ThornIcon, KnifeIcon, SplitIcon, FlameIcon, BurnIcon, HealIcon, SniperIcon } from './Icons';
import LaserFlow from './LaserFlow';
import sound from './soundManager';
import './App.css';

const CANVAS_SIZE = 640;

// Dynamic Green -> Yellow -> Red color
function getHealthColor(percent) {
  const p = Math.max(0, Math.min(1, percent));
  if (p > 0.5) {
    const factor = (1 - p) * 2;
    const r = Math.round(16 + (234 - 16) * factor);
    const g = Math.round(185 + (179 - 185) * factor);
    const b = Math.round(129 + (8 - 129) * factor);
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    const factor = (0.5 - p) * 2;
    const r = Math.round(234 + (239 - 234) * factor);
    const g = Math.round(179 + (68 - 179) * factor);
    const b = Math.round(8 + (68 - 8) * factor);
    return `rgb(${r}, ${g}, ${b})`;
  }
}

const EFFECT_TOOLTIPS = {
  HEAVY: {
    title: 'HEAVY',
    category: 'EFFECT TAG',
    icon: <HeavyIcon size={14} color="#f59e0b" />,
    description: 'Heavy reinforced frame granting high knockback resistance. Innate on Stone Ball (+30% HP) and unlocked by Grow Ball upon reaching 2.8+ size.',
  },
  ARMOR: {
    title: 'ARMOR',
    category: 'EFFECT TAG',
    icon: <ArmorIcon size={14} color="#0284c7" />,
    description: 'Hardened armor plating provides Bleed Immunity, completely preventing puncture bleed status when struck by Spike Balls or Glass Shards.',
  },
  BLEED: {
    title: 'BLEED',
    category: 'STATUS TAG',
    icon: <BleedIcon size={14} color="#ef4444" />,
    description: 'Lingering puncture bleed dealing 1 damage per tick across consecutive delay intervals.',
  },
  SHIELD: {
    title: 'SHIELD',
    category: 'EFFECT TAG',
    icon: <ShieldIcon size={14} color="#0284c7" />,
    description: 'Generates a separate +20 kinetic barrier above health every 4 hits taken. Absorbs damage before HP.',
  },
  BLADE: {
    title: 'BLADE',
    category: 'WEAPON TAG',
    icon: <BladeIcon size={14} color="#dc2626" />,
    description: 'Spinning sword blade deals lethal 22 slash damage on contact, with hit-stop freeze and spin reversal.',
  },
  HAMMER: {
    title: 'HAMMER',
    category: 'WEAPON TAG',
    icon: <HammerIcon size={14} color="#b91c1c" />,
    description: 'Heavy warhammer dealing 24 strike damage, freezing on impact, reversing spin, and blasting targets with Knockback.',
  },
  KNOCKBACK: {
    title: 'KNOCKBACK',
    category: 'STATUS TAG',
    icon: <KnockbackIcon size={14} color="#f97316" />,
    description: 'Blasts struck units away with massive kinetic impulse force, launching targets across the arena floor.',
  },
  BRITTLE: {
    title: 'BRITTLE',
    category: 'EFFECT TAG',
    icon: <BrittleIcon size={14} color="#06b6d4" />,
    description: 'Fragile crystalline body chips when taking damage, dropping persistent shards that deal 8 DMG + Bleed to enemies on contact.',
  },
  SPIKES: {
    title: 'SPIKES',
    category: 'WEAPON TAG',
    icon: <SpikesIcon size={14} color="#8b5cf6" />,
    description: 'Spinning perimeter studs deal heavy 15 collision damage and immediately inflict lingering Puncture Bleed.',
  },
  RAPID: {
    title: 'RAPID',
    category: 'EFFECT TAG',
    icon: <RapidIcon size={14} color="#10b981" />,
    description: 'High skirmish velocity (3.6 speed). Rebounds rapidly around the arena leaving faint ghost trails.',
  },
  GROW: {
    title: 'SIZE GROW',
    category: 'EFFECT TAG',
    icon: <GrowIcon size={14} color="#22c55e" />,
    description: 'Every time it collides with an enemy, it physically expands in size and increases mass up to 6.0, gaining the Heavy Effect at 2.8+ size.',
  },
  ACCELERATE: {
    title: 'ACCELERATE',
    category: 'EFFECT TAG',
    icon: <AccelerateIcon size={14} color="#3b82f6" />,
    description: 'Continuously builds kinetic velocity over time (up to 12.0 speed). As speed increases, collision damage scales up from 8 to 22 DMG.',
  },
  SHARD: {
    title: 'SHARD',
    category: 'EFFECT TAG',
    icon: <ShardIcon size={14} color="#a855f7" />,
    description: 'Striking an enemy locks onto the target and shoots 6 consecutive homing shards dealing 1 damage each.',
  },
  SHARD_TARGET: {
    title: 'SHARD TARGET',
    category: 'STATUS TAG',
    icon: <ShardTargetIcon size={14} color="#a855f7" />,
    description: 'Locked by Shard Ball, targeted by a barrage of 6 consecutive homing crystal shards.',
  },
  GUN: {
    title: 'GUN',
    category: 'WEAPON TAG',
    icon: <GunIcon size={14} color="#f59e0b" />,
    description: 'Rotating firearm firing a heavy high-caliber bullet every 3 seconds in the direction it faces, dealing massive 32 damage on impact.',
  },
  THORN: {
    title: 'THORNS',
    category: 'WEAPON TAG',
    icon: <ThornIcon size={14} color="#22c55e" />,
    description: 'Direct body collisions inflict -2 -1 Bleed. Bouncing off walls sprouts permanent creeping floral Thorns (S, M, L) that deal 2 damage and inflict -1 -1 Bleed.',
  },
  KNIFE: {
    title: 'KNIFE BLADE',
    category: 'WEAPON TAG',
    icon: <KnifeIcon size={14} color="#94a3b8" />,
    description: 'Equipped with a compact combat knife that turns at rapid double speed, delivering swift 15 damage slashes that lacerate enemies with Bleed (-2, -1).',
  },
  SPLIT: {
    title: 'SPLIT',
    category: 'SPECIAL TRAIT',
    icon: <SplitIcon size={14} color="#d946ef" />,
    description: 'Starts with half HP (50 HP). Upon death, splits into 2 mini copies with 25 HP Full each, which subsequently split into 2 micro copies with 10 HP Full each when defeated.',
  },
  FLAMING: {
    title: 'FLAMING',
    category: 'EFFECT TAG',
    icon: <FlameIcon size={14} color="#f97316" />,
    description: 'Imbued with perpetual celestial fire. Radiates an intense heat corona, leaves fiery ground trails, ignites struck enemies with Burn, and incinerates enemy Thorn Traps on contact.',
  },
  BURN: {
    title: 'BURN',
    category: 'STATUS TAG',
    icon: <BurnIcon size={14} color="#f97316" />,
    description: 'Scorching fire damage dealing 6 consecutive ticks (-4, -3, -2, -1, -1, -1) over an extended duration. Unlike puncture bleed, Burn is true fire damage that bypasses armor bleed resistances.',
  },
  HEAL: {
    title: 'SELF-HEAL',
    category: 'ABILITY TAG',
    icon: <HealIcon size={14} color="#10b981" />,
    description: 'Periodically pulses restorative green energy every 6 seconds, regenerating +5 HP to itself in combat.',
  },
  SNIPER: {
    title: 'SNIPER LOCK-ON',
    category: 'ABILITY TAG',
    icon: <SniperIcon size={14} color="#38bdf8" />,
    description: 'Periodically freezes in midair to lock a precision laser sight onto the nearest enemy, discharging a devastating 45 DMG armor-piercing sniper round.',
  },
};

// Blooming 5-petal wild rose flower renderer
function drawBloomFlower(ctx, fx, fy, flowerRadius, petalColor = '#f43f5e', centerColor = '#fde047', rot = 0) {
  ctx.save();
  ctx.translate(fx, fy);
  ctx.rotate(rot);
  const petals = 5;
  ctx.fillStyle = petalColor;
  for (let p = 0; p < petals; p++) {
    const pAng = (p * Math.PI * 2) / petals;
    ctx.beginPath();
    ctx.arc(Math.cos(pAng) * (flowerRadius * 0.55), Math.sin(pAng) * (flowerRadius * 0.55), flowerRadius * 0.44, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  for (let p = 0; p < petals; p++) {
    const pAng = (p * Math.PI * 2) / petals;
    ctx.beginPath();
    ctx.arc(Math.cos(pAng) * (flowerRadius * 0.38), Math.sin(pAng) * (flowerRadius * 0.38), flowerRadius * 0.18, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = centerColor;
  ctx.beginPath();
  ctx.arc(0, 0, flowerRadius * 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#b45309';
  ctx.lineWidth = 0.8;
  ctx.stroke();
  ctx.restore();
}

// Heart-shaped ivy leaf renderer matching climbing vine references
function drawIvyLeaf(ctx, lx, ly, leafLen, leafAng, leafColor = '#16a34a', isLight = false) {
  ctx.save();
  ctx.translate(lx, ly);
  ctx.rotate(leafAng);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(leafLen * 0.35, -leafLen * 0.65, leafLen * 0.85, -leafLen * 0.5, leafLen, 0);
  ctx.bezierCurveTo(leafLen * 0.85, leafLen * 0.5, leafLen * 0.35, leafLen * 0.65, 0, 0);
  ctx.fillStyle = leafColor;
  ctx.fill();
  ctx.strokeStyle = isLight ? '#052e16' : '#14532d';
  ctx.lineWidth = 0.8;
  ctx.stroke();

  // Subtle central vein
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(leafLen * 0.82, 0);
  ctx.strokeStyle = isLight ? '#4ade80' : '#86efac';
  ctx.lineWidth = 0.6;
  ctx.stroke();
  ctx.restore();
}

// Realistic Briar Rosebud / Floral knot for Thorn Ball
function drawBriarRoseBud(ctx, bx, by, size, angle, isHit = false) {
  ctx.save();
  ctx.translate(bx, by);
  ctx.rotate(angle);

  // Outer dark sepals
  ctx.fillStyle = isHit ? '#ffffff' : '#052e16';
  for (let s = -1; s <= 1; s += 2) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(s * size * 0.7, -size * 0.4, s * size * 0.9, size * 0.2);
    ctx.quadraticCurveTo(s * size * 0.3, size * 0.3, 0, 0);
    ctx.fill();
  }

  // Layered crimson rose petals
  ctx.fillStyle = isHit ? '#ffffff' : '#9f1239'; // deep velvet crimson
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.75, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = isHit ? '#ffffff' : '#e11d48'; // vibrant ruby
  ctx.beginPath();
  ctx.arc(-size * 0.1, -size * 0.1, size * 0.52, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = isHit ? '#ffffff' : '#f43f5e'; // petal highlight
  ctx.beginPath();
  ctx.arc(-size * 0.15, -size * 0.15, size * 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Core golden stamen dot
  ctx.fillStyle = isHit ? '#ffffff' : '#fef08a';
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.14, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// 3D Forward-facing thorn spike on the sphere surface
function drawSurfaceThorn(ctx, sx, sy, size, angle, isHit = false) {
  ctx.save();
  ctx.translate(sx, sy);
  ctx.rotate(angle);

  // Cast shadow on sphere
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.beginPath();
  ctx.ellipse(size * 0.3, size * 0.25, size * 0.7, size * 0.35, 0.4, 0, Math.PI * 2);
  ctx.fill();

  // Thorn spine cone
  ctx.beginPath();
  ctx.moveTo(-size * 0.5, size * 0.4);
  ctx.lineTo(size * 0.8, -size * 0.5); // sharp tip
  ctx.lineTo(size * 0.4, size * 0.5);
  ctx.closePath();

  const grad = ctx.createLinearGradient(-size * 0.5, size * 0.5, size * 0.8, -size * 0.5);
  if (isHit) {
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(1, '#ffffff');
  } else {
    grad.addColorStop(0, '#052e16');
    grad.addColorStop(0.5, '#15803d');
    grad.addColorStop(0.85, '#86efac');
    grad.addColorStop(1, '#f43f5e'); // crimson puncture tip
  }
  ctx.fillStyle = grad;
  ctx.fill();

  // Sharp highlight line
  ctx.beginPath();
  ctx.moveTo(0, size * 0.4);
  ctx.lineTo(size * 0.8, -size * 0.5);
  ctx.strokeStyle = isHit ? '#ffffff' : 'rgba(255, 255, 255, 0.8)';
  ctx.lineWidth = 0.8;
  ctx.stroke();

  ctx.restore();
}

function distToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const l2 = dx * dx + dy * dy;
  if (l2 === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * dx + (py - y1) * dy) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

function drawThornSpike(ctx, x, y, len, angle, color = '#15803d') {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(0, -2.2);
  ctx.quadraticCurveTo(len * 0.4, 0, len, 0);
  ctx.quadraticCurveTo(len * 0.4, 2.2, 0, 2.2);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = '#4ade80';
  ctx.lineWidth = 0.8;
  ctx.stroke();
  ctx.restore();
}

// Creeping Thorns renderer: sprouts OUTWARD into the arena (perpendicular to perimeter wall)
// 3 size variations matching sketch: S (~42px reach), M (~68px reach), L (~96px reach)
function drawThornTrap(ctx, trap, isLight = false) {
  const p = Math.min(1.0, trap.spawnProgress !== undefined ? trap.spawnProgress : 1.0);
  const easeScale = p < 1.0 ? Math.sin(p * Math.PI / 2) * (1 + 0.14 * Math.sin(p * Math.PI)) : 1.0;
  ctx.scale(easeScale, easeScale);

  const variation = trap.sizeVariation || 'M';
  const leafColor1 = isLight ? '#15803d' : '#22c55e';
  const leafColor2 = isLight ? '#166534' : '#16a34a';

  if (variation === 'S') {
    // VARIATION S (Small - climbing sprig, ~42px reach into arena)
    // Wall root claws
    ctx.strokeStyle = '#052e16';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.quadraticCurveTo(-3, -7, -4, -9);
    ctx.moveTo(0, 0);
    ctx.lineTo(-4, 0);
    ctx.moveTo(0, 6);
    ctx.quadraticCurveTo(-3, 7, -4, 9);
    ctx.stroke();

    // Main winding climbing stem reaching into arena (+x)
    ctx.strokeStyle = '#14532d';
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(12, -7, 24, 8, 42, 0);
    ctx.stroke();

    // Thorns along stem
    drawThornSpike(ctx, 12, -2, 5.5, -1.2, '#15803d');
    drawThornSpike(ctx, 22, 5, 6.0, 1.1, '#16a34a');
    drawThornSpike(ctx, 32, 2, 5.0, -1.0, '#15803d');

    // Ivy leaves along stem
    drawIvyLeaf(ctx, 8, -4, 7.5, -0.85, leafColor1, isLight);
    drawIvyLeaf(ctx, 16, 2, 7.5, 0.75, leafColor2, isLight);
    drawIvyLeaf(ctx, 26, 6, 7.0, 0.65, leafColor1, isLight);
    drawIvyLeaf(ctx, 34, 1, 6.5, -0.7, leafColor2, isLight);
    drawIvyLeaf(ctx, 42, 0, 6.0, 0.1, leafColor1, isLight);

    // Rosebud blossom at tip
    drawBloomFlower(ctx, 36, -2, 4.4, '#f43f5e', '#fde047', 0.2);

  } else if (variation === 'L') {
    // VARIATION L (Large - Lush twisting climbing tree-like vine, ~96px reach into arena)
    // Anchoring root claws on the wall boundary
    ctx.strokeStyle = '#052e16';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.quadraticCurveTo(-3, -14, -5, -16);
    ctx.moveTo(0, -4);
    ctx.lineTo(-5, -5);
    ctx.moveTo(0, 4);
    ctx.lineTo(-5, 5);
    ctx.moveTo(0, 12);
    ctx.quadraticCurveTo(-3, 14, -5, 16);
    ctx.stroke();

    // Thick main climbing trunk
    ctx.strokeStyle = '#052e16';
    ctx.lineWidth = 3.8;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(20, -14, 38, -12, 48, -2);
    ctx.bezierCurveTo(56, 8, 65, 14, 78, 8);
    ctx.bezierCurveTo(86, 3, 91, 5, 96, 0);
    ctx.stroke();

    // Intertwined secondary climbing stalk
    ctx.strokeStyle = '#14532d';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(0, 3);
    ctx.bezierCurveTo(16, 10, 32, 6, 42, -5);
    ctx.bezierCurveTo(52, -16, 68, -8, 82, 0);
    ctx.stroke();

    // 3 Lateral branches (matching sketch)
    ctx.strokeStyle = '#166534';
    ctx.lineWidth = 1.9;
    // Branch 1 (lower right)
    ctx.beginPath();
    ctx.moveTo(22, 6);
    ctx.quadraticCurveTo(28, 14, 36, 18);
    ctx.stroke();
    // Branch 2 (mid left - holds the wild rose)
    ctx.beginPath();
    ctx.moveTo(42, -7);
    ctx.quadraticCurveTo(48, -18, 58, -22);
    ctx.stroke();
    // Branch 3 (upper right)
    ctx.beginPath();
    ctx.moveTo(68, 9);
    ctx.quadraticCurveTo(74, 16, 84, 20);
    ctx.stroke();

    // Sharp bramble thorns
    drawThornSpike(ctx, 16, -11, 7.5, -1.3, '#15803d');
    drawThornSpike(ctx, 18, 9, 7.5, 1.3, '#16a34a');
    drawThornSpike(ctx, 34, -13, 8.0, -1.2, '#15803d');
    drawThornSpike(ctx, 46, 7, 7.5, 1.15, '#16a34a');
    drawThornSpike(ctx, 52, -15, 7.5, -1.25, '#15803d');
    drawThornSpike(ctx, 64, -10, 7.0, -1.1, '#16a34a');
    drawThornSpike(ctx, 76, 12, 7.5, 1.2, '#15803d');
    drawThornSpike(ctx, 88, -4, 6.5, -0.95, '#16a34a');

    // Rich ivy leaves
    [
      [8, -9, 9.0, -0.95],
      [14, 8, 9.0, 0.95],
      [26, -14, 9.5, -0.85],
      [36, 18, 8.5, 0.85],
      [30, 12, 8.0, 0.7],
      [40, 2, 9.0, 0.4],
      [48, -18, 8.5, -0.9],
      [58, -22, 8.0, -0.85],
      [54, 4, 9.0, 0.5],
      [64, 12, 8.5, 0.75],
      [84, 20, 8.0, 0.8],
      [74, 9, 8.5, 0.6],
      [70, -8, 8.0, -0.7],
      [85, 3, 7.5, 0.3],
      [96, 0, 7.0, 0.1],
    ].forEach(([lx, ly, len, ang], idx) => {
      drawIvyLeaf(ctx, lx, ly, len, ang, idx % 2 === 0 ? leafColor1 : leafColor2, isLight);
    });

    // Crimson Wild Rose Flower (matching the red dot in user's sketch!)
    drawBloomFlower(ctx, 52, -18, 7.5, '#f43f5e', '#fde047', 0.25);
    drawBloomFlower(ctx, 80, 12, 5.0, '#fb7185', '#fde047', -0.3);
    drawBloomFlower(ctx, 94, 2, 4.0, '#f43f5e', '#fde047', 0.2);

  } else {
    // VARIATION M (Medium - Intertwined climbing vines, ~68px reach into arena)
    // Wall root claws
    ctx.strokeStyle = '#052e16';
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(0, -8);
    ctx.quadraticCurveTo(-3, -9, -4, -11);
    ctx.moveTo(0, 0);
    ctx.lineTo(-4, 0);
    ctx.moveTo(0, 8);
    ctx.quadraticCurveTo(-3, 9, -4, 11);
    ctx.stroke();

    // Dual climbing intertwined stems
    ctx.strokeStyle = '#052e16';
    ctx.lineWidth = 2.9;
    ctx.beginPath();
    ctx.moveTo(0, -3);
    ctx.bezierCurveTo(18, -12, 34, 10, 52, -4);
    ctx.bezierCurveTo(58, -8, 64, -2, 68, 2);
    ctx.stroke();

    ctx.strokeStyle = '#14532d';
    ctx.lineWidth = 2.1;
    ctx.beginPath();
    ctx.moveTo(0, 3);
    ctx.bezierCurveTo(15, 12, 35, -8, 48, 6);
    ctx.bezierCurveTo(56, 12, 62, 8, 68, 2);
    ctx.stroke();

    // 2 side branches
    ctx.strokeStyle = '#166534';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(24, 7);
    ctx.quadraticCurveTo(30, 12, 38, 16);
    ctx.moveTo(38, -6);
    ctx.quadraticCurveTo(44, -12, 49, -15);
    ctx.stroke();

    // Thorns
    drawThornSpike(ctx, 16, -9, 6.5, -1.3, '#15803d');
    drawThornSpike(ctx, 20, 9, 6.5, 1.25, '#16a34a');
    drawThornSpike(ctx, 32, 10, 7.0, 1.1, '#15803d');
    drawThornSpike(ctx, 42, -9, 6.5, -1.2, '#16a34a');
    drawThornSpike(ctx, 54, 8, 6.0, 1.0, '#15803d');
    drawThornSpike(ctx, 62, -4, 5.5, -0.9, '#16a34a');

    // Ivy leaves
    [
      [10, -7, 8.0, -0.9],
      [12, 8, 8.0, 0.9],
      [26, -5, 8.5, -0.7],
      [38, 16, 8.0, 0.8],
      [49, -15, 7.5, -0.85],
      [35, 4, 8.0, 0.6],
      [48, 6, 7.5, 0.7],
      [58, -5, 7.0, -0.5],
      [68, 2, 6.5, 0.2],
    ].forEach(([lx, ly, len, ang], idx) => {
      drawIvyLeaf(ctx, lx, ly, len, ang, idx % 2 === 0 ? leafColor1 : leafColor2, isLight);
    });

    drawBloomFlower(ctx, 42, -10, 5.5, '#fb7185', '#fde047', -0.3);
    drawBloomFlower(ctx, 62, 5, 4.5, '#f43f5e', '#fde047', 0.4);
  }
}

// Fire Ball: number of past positions the flame body follows (bends & curves along the real path)
const FIRE_HISTORY_LEN = 16;

// Cel-shaded fireball: flat colour bands (dark ember → orange → yellow → white-hot) built from
// unioned circles along the ball's path history. One fill per band = smooth & cheap (no gradients).
function drawCelFireball(ctx, x, y, radius, motionVector, isHit, isLight) {
  const now = performance.now() * 0.001;
  const N = FIRE_HISTORY_LEN;
  const vx = motionVector?.vx || 0;
  const vy = motionVector?.vy || 0;
  const spd = Math.hypot(vx, vy);
  const isMoving = spd > 0.15;
  const history = motionVector?.history || null;
  const puffs = motionVector?.puffs || null;

  const hasHist = history && history.length > 0;
  const shiftX = hasHist ? x - history[0].x : 0;
  const shiftY = hasHist ? y - history[0].y : 0;
  const maxStep = radius * 0.32;

  // Build spine points: head at the ball, tail follows path history behind motion
  const pts = [];

  if (isMoving) {
    // In motion: tail follows historical path strictly behind motion, bending & curving on bounces
    // NO upward buoyancy when match is playing
    const backDirX = -vx / spd;
    const backDirY = -vy / spd;
    const perpX = -backDirY;
    const perpY = backDirX;

    for (let i = 0; i < N; i++) {
      const t = i / (N - 1);
      let px, py;
      if (hasHist && i < history.length) {
        const h = history[i];
        px = h.x + shiftX;
        py = h.y + shiftY;
      } else {
        // Fallback / initial launch step: stream backward along velocity
        const prev = pts[i - 1] || { x, y };
        px = prev.x + backDirX * Math.min(maxStep, radius * 0.22);
        py = prev.y + backDirY * Math.min(maxStep, radius * 0.22);
      }

      // Compactness constraint
      if (i > 0) {
        const prev = pts[i - 1];
        const dx = px - prev.x;
        const dy = py - prev.y;
        const d = Math.hypot(dx, dy);
        if (d > maxStep) {
          px = prev.x + (dx / d) * maxStep;
          py = prev.y + (dy / d) * maxStep;
        }
      }

      // Dynamic sideways flutter perpendicular to path
      const flutter = Math.sin(now * 14 + i * 0.85) * (radius * 0.1 * t);
      px += perpX * flutter;
      py += perpY * flutter;

      pts.push({ x: px, y: py, t, i });
    }
  } else {
    // Stationary (planning screen / roster preview / idle before launch):
    // Flame naturally rises straight UPWARDS (-y)
    for (let i = 0; i < N; i++) {
      const t = i / (N - 1);
      const px = x + Math.sin(now * 8 + i * 0.8) * (radius * 0.12 * t);
      const py = y - (i * radius * 0.16) + Math.cos(now * 6 + i * 1.1) * (radius * 0.05 * t);
      pts.push({ x: px, y: py, t, i });
    }
  }

  const colors = isHit
    ? ['#fecaca', '#ffffff', '#ffffff', '#ffffff']
    : ['#c2410c', '#f97316', '#fde047', '#fffbeb'];

  const radiusAt = (p, scale) =>
    Math.max(0, radius * scale * (1.08 - 0.8 * p.t) * (1 + 0.09 * Math.sin(now * 12 + p.i * 1.7)));

  const fillBand = (color, scale, maxT) => {
    ctx.beginPath();
    for (let k = 0; k < pts.length; k++) {
      const p = pts[k];
      if (p.t > maxT) break;
      const r = radiusAt(p, scale);
      if (r < 0.6) continue;
      ctx.moveTo(p.x + r, p.y);
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    }
    ctx.fillStyle = color;
    ctx.fill();
  };

  ctx.save();

  // Single soft heat glow under the head (dark theme only)
  if (!isLight && !isHit) {
    const glow = ctx.createRadialGradient(x, y, radius * 0.4, x, y, radius * 2.2);
    glow.addColorStop(0, 'rgba(249, 115, 22, 0.28)');
    glow.addColorStop(1, 'rgba(249, 115, 22, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, radius * 2.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Detached puffs breaking off the tail
  if (puffs && puffs.length) {
    ctx.beginPath();
    puffs.forEach(pf => {
      const r = pf.r * Math.max(0, pf.life);
      if (r < 0.6) return;
      ctx.moveTo(pf.x + r, pf.y);
      ctx.arc(pf.x, pf.y, r, 0, Math.PI * 2);
    });
    ctx.fillStyle = colors[0];
    ctx.fill();

    ctx.beginPath();
    puffs.forEach(pf => {
      if (pf.life < 0.55) return;
      const r = pf.r * pf.life * 0.55;
      ctx.moveTo(pf.x + r, pf.y);
      ctx.arc(pf.x, pf.y, r, 0, Math.PI * 2);
    });
    ctx.fillStyle = colors[1];
    ctx.fill();
  }

  // Flat colour bands, outer → inner
  fillBand(colors[0], 1.0, 1.0);
  fillBand(colors[1], 0.8, 0.72);
  fillBand(colors[2], 0.6, 0.42);

  // White-hot core, nudged toward the leading edge
  const lead = pts[3];
  let ldx = pts[0].x - lead.x;
  let ldy = pts[0].y - lead.y;
  const ld = Math.hypot(ldx, ldy) || 1;
  ldx /= ld;
  ldy /= ld;
  const coreR = radius * (0.34 + 0.04 * Math.sin(now * 14));
  ctx.beginPath();
  ctx.ellipse(
    x + ldx * radius * 0.28,
    y + ldy * radius * 0.28,
    coreR,
    coreR * 1.25,
    Math.atan2(ldy, ldx) + Math.PI / 2,
    0,
    Math.PI * 2
  );
  ctx.fillStyle = colors[3];
  ctx.fill();

  ctx.restore();
}

// 3D Sphere Renderer with accessories
function draw3DBall(ctx, x, y, radius, config, teamColor, rotationAngle = 0, isHit = false, shield = 0, theme = 'dark', missingNotches = [], motionVector = null) {
  ctx.save();
  const isLight = theme === 'light';

  // Spikes for Spike Ball
  if (config.id === BALL_TYPES.SPIKE) {
    const spikes = 8;
    const defaultSpikeColor = isLight ? (config.spikeColor || '#334155') : '#94a3b8';
    const hitSpikeColor = isLight ? '#dc2626' : '#ffffff';
    const hitSpikeStroke = isLight ? '#991b1b' : '#f87171';
    const defaultStroke = isLight ? '#111827' : '#e2e8f0';

    for (let s = 0; s < spikes; s++) {
      const sAng = (s * Math.PI * 2) / spikes + rotationAngle;
      const tipX = x + Math.cos(sAng) * (radius + 10);
      const tipY = y + Math.sin(sAng) * (radius + 10);
      const baseAng1 = sAng + 0.22;
      const baseAng2 = sAng - 0.22;

      ctx.beginPath();
      ctx.moveTo(x + Math.cos(baseAng1) * radius, y + Math.sin(baseAng1) * radius);
      ctx.lineTo(tipX, tipY);
      ctx.lineTo(x + Math.cos(baseAng2) * radius, y + Math.sin(baseAng2) * radius);
      ctx.closePath();

      ctx.fillStyle = isHit ? hitSpikeColor : defaultSpikeColor;
      ctx.fill();
      ctx.strokeStyle = isHit ? hitSpikeStroke : defaultStroke;
      ctx.lineWidth = isHit ? 1.6 : (isLight ? 1 : 1.2);
      ctx.stroke();
    }
  }

  // Rotating sword for Sword Ball
  if (config.id === BALL_TYPES.SWORD) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotationAngle);

    const bladeLength = config.bladeLength || 54;
    const bladeGrad = ctx.createLinearGradient(radius - 2, 0, radius + bladeLength, 0);

    if (isHit) {
      if (isLight) {
        bladeGrad.addColorStop(0, '#f87171');
        bladeGrad.addColorStop(0.5, '#dc2626');
        bladeGrad.addColorStop(1, '#b91c1c');
      } else {
        bladeGrad.addColorStop(0, '#ffffff');
        bladeGrad.addColorStop(0.5, '#ffffff');
        bladeGrad.addColorStop(1, '#ffffff');
      }
    } else {
      bladeGrad.addColorStop(0, '#94a3b8');
      bladeGrad.addColorStop(0.5, '#f8fafc');
      bladeGrad.addColorStop(1, '#e2e8f0');
    }

    ctx.fillStyle = bladeGrad;
    ctx.beginPath();
    ctx.moveTo(radius - 2, -4);
    ctx.lineTo(radius + bladeLength - 10, -3.5);
    ctx.lineTo(radius + bladeLength, 0); // sharp tip
    ctx.lineTo(radius + bladeLength - 10, 3.5);
    ctx.lineTo(radius - 2, 4);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = isHit ? (isLight ? '#991b1b' : '#ffffff') : (isLight ? '#475569' : '#e2e8f0');
    ctx.lineWidth = isHit ? 1.6 : (isLight ? 0.9 : 1.2);
    ctx.stroke();

    ctx.fillStyle = isHit ? (isLight ? '#991b1b' : '#ffffff') : '#d97706';
    ctx.fillRect(radius - 2, -7, 4, 14);
    ctx.restore();
  }

  // Rotating combat knife for Knife Ball (Short, fast, razor-sharp combat dagger)
  if (config.id === BALL_TYPES.KNIFE) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotationAngle);

    const knifeLength = config.knifeLength || 28;
    const bladeGrad = ctx.createLinearGradient(radius - 2, 0, radius + knifeLength, 0);

    if (isHit) {
      if (isLight) {
        bladeGrad.addColorStop(0, '#f87171');
        bladeGrad.addColorStop(0.5, '#dc2626');
        bladeGrad.addColorStop(1, '#b91c1c');
      } else {
        bladeGrad.addColorStop(0, '#ffffff');
        bladeGrad.addColorStop(0.5, '#ffffff');
        bladeGrad.addColorStop(1, '#ffffff');
      }
    } else {
      bladeGrad.addColorStop(0, '#64748b');
      bladeGrad.addColorStop(0.5, '#f1f5f9');
      bladeGrad.addColorStop(1, '#cbd5e1');
    }

    // Compact combat knife guard & bolster
    ctx.fillStyle = isHit ? (isLight ? '#991b1b' : '#ffffff') : '#1e293b';
    ctx.fillRect(radius - 2, -6, 4, 12);
    ctx.strokeStyle = isLight ? '#0f172a' : '#94a3b8';
    ctx.lineWidth = 0.9;
    ctx.strokeRect(radius - 2, -6, 4, 12);

    // Short combat knife blade (sleek dagger profile)
    ctx.fillStyle = bladeGrad;
    ctx.beginPath();
    ctx.moveTo(radius + 2, -3.2);
    ctx.lineTo(radius + knifeLength - 6, -3.0);
    ctx.lineTo(radius + knifeLength, 0); // sharp clip-point tip
    ctx.lineTo(radius + knifeLength - 5, 3.0);
    ctx.lineTo(radius + 2, 3.2);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = isHit ? (isLight ? '#991b1b' : '#ffffff') : (isLight ? '#334155' : '#e2e8f0');
    ctx.lineWidth = isHit ? 1.5 : (isLight ? 0.9 : 1.2);
    ctx.stroke();

    // Fuller / blood groove along the blade
    ctx.strokeStyle = isLight ? '#94a3b8' : '#475569';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(radius + 5, 0);
    ctx.lineTo(radius + knifeLength - 8, 0);
    ctx.stroke();

    ctx.restore();
  }

  // Rotating hammer for Hammer Ball (High-contrast visibility in Dark & Light Mode)
  if (config.id === BALL_TYPES.HAMMER) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotationAngle);

    const hammerLen = config.hammerLength || 64;
    const shaftWidth = 7;
    const headWidth = 28;
    const headHeight = 24;

    // Bronze / Reinforced Golden Haft
    const shaftGrad = ctx.createLinearGradient(0, -shaftWidth / 2, 0, shaftWidth / 2);
    if (isHit) {
      shaftGrad.addColorStop(0, '#ffffff');
      shaftGrad.addColorStop(1, '#ef4444');
    } else {
      shaftGrad.addColorStop(0, isLight ? '#b45309' : '#f59e0b');
      shaftGrad.addColorStop(0.5, isLight ? '#d97706' : '#fbbf24');
      shaftGrad.addColorStop(1, isLight ? '#78350f' : '#b45309');
    }
    ctx.fillStyle = shaftGrad;
    ctx.fillRect(radius - 2, -shaftWidth / 2, hammerLen - radius + 4, shaftWidth);
    ctx.strokeStyle = isLight ? '#451a03' : '#fef08a';
    ctx.lineWidth = isLight ? 1 : 1.2;
    ctx.strokeRect(radius - 2, -shaftWidth / 2, hammerLen - radius + 4, shaftWidth);

    // Decorative steel grip ring
    ctx.fillStyle = isLight ? '#334155' : '#e2e8f0';
    ctx.fillRect(radius + 6, -shaftWidth / 2 - 1, 3, shaftWidth + 2);

    // Heavy Metal Hammer Head
    const headX = hammerLen - 2;
    const headY = -headHeight / 2;
    const headGrad = ctx.createLinearGradient(headX, headY, headX + headWidth, headY + headHeight);

    if (isHit) {
      headGrad.addColorStop(0, '#ffffff');
      headGrad.addColorStop(0.5, '#f87171');
      headGrad.addColorStop(1, isLight ? '#dc2626' : '#991b1b');
    } else if (isLight) {
      headGrad.addColorStop(0, '#e2e8f0');
      headGrad.addColorStop(0.3, '#94a3b8');
      headGrad.addColorStop(0.7, '#475569');
      headGrad.addColorStop(1, '#1e293b');
    } else {
      // High-contrast gleaming forge steel in Dark Mode
      headGrad.addColorStop(0, '#ffffff');
      headGrad.addColorStop(0.35, '#e2e8f0');
      headGrad.addColorStop(0.7, '#94a3b8');
      headGrad.addColorStop(1, '#475569');
    }

    ctx.fillStyle = headGrad;
    ctx.fillRect(headX, headY, headWidth, headHeight);
    ctx.strokeStyle = isLight ? '#0f172a' : '#ffffff';
    ctx.lineWidth = isLight ? 1.6 : 1.8;
    ctx.strokeRect(headX, headY, headWidth, headHeight);

    // Rear counter-spike / pick on the hammer back
    const pickX = headX - 6;
    ctx.beginPath();
    ctx.moveTo(headX, -headHeight * 0.32);
    ctx.lineTo(pickX, 0);
    ctx.lineTo(headX, headHeight * 0.32);
    ctx.closePath();
    ctx.fillStyle = isHit ? '#ffffff' : (isLight ? '#475569' : '#cbd5e1');
    ctx.fill();
    ctx.strokeStyle = isLight ? '#0f172a' : '#ffffff';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Front Strike Face Bevel (High-contrast chrome impact face)
    ctx.fillStyle = isHit ? '#ffffff' : (isLight ? '#cbd5e1' : '#f8fafc');
    ctx.fillRect(headX + headWidth - 4, headY - 1, 4, headHeight + 2);
    ctx.strokeStyle = isLight ? '#334155' : '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(headX + headWidth - 4, headY - 1, 4, headHeight + 2);

    // Core Ruby / Power Gem Inset
    ctx.fillStyle = isHit ? '#ffffff' : '#ef4444';
    ctx.beginPath();
    ctx.arc(headX + headWidth / 2 - 1, 0, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = isLight ? '#991b1b' : '#fca5a5';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  }

  // Rotating gun barrel for Gun Ball
  if (config.id === BALL_TYPES.GUN) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotationAngle);

    const scale = radius / (config.radius || 38);
    const barrelLen = 20 * scale;
    const barrelWidth = Math.max(3.5, 7.5 * scale);
    const mountX = radius - 3 * scale;

    // Laser aiming guide / sight line extending forward (in arena only)
    if (radius > 25) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(mountX + barrelLen, 0);
      ctx.lineTo(mountX + barrelLen + 46, 0);
      ctx.strokeStyle = isLight ? 'rgba(239, 68, 68, 0.45)' : 'rgba(248, 113, 113, 0.65)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 4]);
      ctx.stroke();
      ctx.restore();
    }

    // Heavy tactical gun barrel
    ctx.fillStyle = isHit ? '#ffffff' : (isLight ? '#1e293b' : '#334155');
    ctx.fillRect(mountX, -barrelWidth / 2, barrelLen, barrelWidth);
    ctx.strokeStyle = isLight ? '#0f172a' : '#cbd5e1';
    ctx.lineWidth = Math.max(1, 1.3 * scale);
    ctx.strokeRect(mountX, -barrelWidth / 2, barrelLen, barrelWidth);

    // Muzzle Brake / Nozzle
    const nozzleW = Math.max(2, 3.5 * scale);
    const nozzleH = barrelWidth + 3 * scale;
    ctx.fillStyle = isHit ? '#ffffff' : (isLight ? '#0f172a' : '#64748b');
    ctx.fillRect(mountX + barrelLen - nozzleW / 2, -nozzleH / 2, nozzleW, nozzleH);
    ctx.strokeStyle = isLight ? '#020617' : '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.strokeRect(mountX + barrelLen - nozzleW / 2, -nozzleH / 2, nozzleW, nozzleH);

    // Chamber / Pivot Mount
    ctx.beginPath();
    ctx.arc(mountX, 0, Math.max(3, 5.5 * scale), 0, Math.PI * 2);
    ctx.fillStyle = isHit ? '#ffffff' : '#f59e0b'; // amber tactical pivot
    ctx.fill();
    ctx.strokeStyle = isLight ? '#92400e' : '#fef3c7';
    ctx.lineWidth = Math.max(0.8, 1.2 * scale);
    ctx.stroke();

    ctx.restore();
  }

  // Long tactical sniper rifle barrel & precision scope for Sniper Ball
  if (config.id === BALL_TYPES.SNIPER) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotationAngle);

    const scale = radius / (config.radius || 38);
    const barrelLen = 30 * scale;
    const barrelWidth = Math.max(3, 5.5 * scale);
    const mountX = radius - 3 * scale;

    // Laser aiming guide / sight line extending forward
    if (radius > 25) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(mountX + barrelLen, 0);
      ctx.lineTo(mountX + barrelLen + 65, 0);
      ctx.strokeStyle = isLight ? 'rgba(2, 132, 199, 0.65)' : 'rgba(56, 189, 248, 0.85)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 3]);
      ctx.stroke();
      ctx.restore();
    }

    // Long fluted rifle barrel
    ctx.fillStyle = isHit ? '#ffffff' : (isLight ? '#1e293b' : '#0f172a');
    ctx.fillRect(mountX, -barrelWidth / 2, barrelLen, barrelWidth);
    ctx.strokeStyle = isLight ? '#0f172a' : '#38bdf8';
    ctx.lineWidth = Math.max(1, 1.2 * scale);
    ctx.strokeRect(mountX, -barrelWidth / 2, barrelLen, barrelWidth);

    // Muzzle Brake / Suppressor at tip
    const brakeW = Math.max(3, 5 * scale);
    const brakeH = barrelWidth + 3.5 * scale;
    ctx.fillStyle = isHit ? '#ffffff' : (isLight ? '#0f172a' : '#1e293b');
    ctx.fillRect(mountX + barrelLen - brakeW, -brakeH / 2, brakeW, brakeH);
    ctx.strokeStyle = isLight ? '#020617' : '#7dd3fc';
    ctx.lineWidth = 1;
    ctx.strokeRect(mountX + barrelLen - brakeW, -brakeH / 2, brakeW, brakeH);

    // Tactical High-Magnification Sniper Scope mounted on top
    const scopeW = 16 * scale;
    const scopeH = Math.max(3, 4.5 * scale);
    const scopeX = mountX + 4 * scale;
    const scopeY = -barrelWidth / 2 - scopeH - 1.5 * scale;

    // Scope Mount Rings
    ctx.fillStyle = isLight ? '#334155' : '#64748b';
    ctx.fillRect(scopeX + 2, scopeY + scopeH, 2.5 * scale, 1.5 * scale);
    ctx.fillRect(scopeX + scopeW - 4.5 * scale, scopeY + scopeH, 2.5 * scale, 1.5 * scale);

    // Scope Body Tube
    ctx.fillStyle = isHit ? '#ffffff' : (isLight ? '#0f172a' : '#1e293b');
    ctx.fillRect(scopeX, scopeY, scopeW, scopeH);
    ctx.strokeStyle = isLight ? '#020617' : '#38bdf8';
    ctx.lineWidth = 0.9;
    ctx.strokeRect(scopeX, scopeY, scopeW, scopeH);

    // Scope Lens Eyepiece & Objective Bells
    ctx.fillStyle = isHit ? '#ffffff' : '#0284c7';
    ctx.fillRect(scopeX + scopeW - 1, scopeY - 0.8, 2.5 * scale, scopeH + 1.6);
    ctx.fillRect(scopeX - 1.5 * scale, scopeY - 0.5, 2 * scale, scopeH + 1);

    // Scope Lens Glint
    ctx.fillStyle = '#7dd3fc';
    ctx.beginPath();
    ctx.arc(scopeX + scopeW, scopeY + scopeH / 2, 1.2 * scale, 0, Math.PI * 2);
    ctx.fill();

    // Chamber / Pivot Mount
    ctx.beginPath();
    ctx.arc(mountX, 0, Math.max(3, 5 * scale), 0, Math.PI * 2);
    ctx.fillStyle = isHit ? '#ffffff' : '#0284c7'; // cyan tactical pivot
    ctx.fill();
    ctx.strokeStyle = isLight ? '#0369a1' : '#bae6fd';
    ctx.lineWidth = Math.max(0.8, 1.2 * scale);
    ctx.stroke();

    ctx.restore();
  }
  if (config.id === BALL_TYPES.SHARD) {
    const orbitCount = 6;
    for (let s = 0; s < orbitCount; s++) {
      const sAng = rotationAngle + (s * Math.PI * 2) / orbitCount;
      const sDist = radius + 8;
      const sx = x + Math.cos(sAng) * sDist;
      const sy = y + Math.sin(sAng) * sDist;

      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(sAng + Math.PI / 2);
      ctx.beginPath();
      ctx.moveTo(0, -6.5);
      ctx.lineTo(4, 0);
      ctx.lineTo(0, 6.5);
      ctx.lineTo(-4, 0);
      ctx.closePath();
      ctx.fillStyle = isHit ? '#ffffff' : (isLight ? '#7e22ce' : '#c084fc');
      ctx.fill();
      ctx.strokeStyle = isLight ? '#581c87' : '#f3e8ff';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.restore();
    }
  }

  // 12 Curved Razor Briar Thorns & Braided Collar around Thorn Ball
  if (config.id === BALL_TYPES.THORN) {
    const thornCount = 12;

    // Braided root vine ring wrapping the sphere perimeter
    ctx.save();
    ctx.strokeStyle = isLight ? '#052e16' : '#022c22';
    ctx.lineWidth = Math.max(3.2, radius * 0.09);
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = isLight ? '#15803d' : '#16a34a';
    ctx.lineWidth = Math.max(1.6, radius * 0.045);
    ctx.stroke();

    ctx.strokeStyle = isLight ? '#4ade80' : '#86efac';
    ctx.lineWidth = Math.max(0.8, radius * 0.02);
    ctx.setLineDash([4, 6]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    for (let t = 0; t < thornCount; t++) {
      const isPrimary = t % 2 === 0;
      const tAng = rotationAngle + (t * Math.PI * 2) / thornCount;
      const thornLen = isPrimary ? radius * 0.46 : radius * 0.28;
      const baseSpan = isPrimary ? 0.20 : 0.14; // angular width at base

      // Base points on ball edge
      const a1 = tAng - baseSpan;
      const a2 = tAng + baseSpan;
      const bx1 = x + Math.cos(a1) * (radius - 1);
      const by1 = y + Math.sin(a1) * (radius - 1);
      const bx2 = x + Math.cos(a2) * (radius - 1);
      const by2 = y + Math.sin(a2) * (radius - 1);

      // Curved tip (swept in direction of rotation)
      const tipDist = radius + thornLen;
      const tipAng = tAng + (isPrimary ? 0.14 : 0.09);
      const tx = x + Math.cos(tipAng) * tipDist;
      const ty = y + Math.sin(tipAng) * tipDist;

      // Base center
      const rootX = x + Math.cos(tAng) * radius;
      const rootY = y + Math.sin(tAng) * radius;

      // Outer convex curve control point
      const cpOuterX = x + Math.cos(a1 + 0.08) * (radius + thornLen * 0.52);
      const cpOuterY = y + Math.sin(a1 + 0.08) * (radius + thornLen * 0.52);

      // Inner concave curve control point
      const cpInnerX = x + Math.cos(a2 + 0.04) * (radius + thornLen * 0.44);
      const cpInnerY = y + Math.sin(a2 + 0.04) * (radius + thornLen * 0.44);

      ctx.save();

      // Main thorn shape
      ctx.beginPath();
      ctx.moveTo(bx1, by1);
      ctx.quadraticCurveTo(cpOuterX, cpOuterY, tx, ty);
      ctx.quadraticCurveTo(cpInnerX, cpInnerY, bx2, by2);
      ctx.closePath();

      const thornGrad = ctx.createLinearGradient(rootX, rootY, tx, ty);
      if (isHit) {
        thornGrad.addColorStop(0, '#ffffff');
        thornGrad.addColorStop(1, '#ffffff');
      } else {
        thornGrad.addColorStop(0, '#052e16');
        thornGrad.addColorStop(0.45, '#166534');
        thornGrad.addColorStop(0.8, '#4ade80');
        thornGrad.addColorStop(0.94, '#a7f3d0');
        thornGrad.addColorStop(1, '#f43f5e'); // crimson puncture tip
      }
      ctx.fillStyle = thornGrad;
      ctx.fill();

      // Shadow facet on the trailing side
      if (!isHit) {
        ctx.beginPath();
        ctx.moveTo(rootX, rootY);
        ctx.lineTo(tx, ty);
        ctx.quadraticCurveTo(cpInnerX, cpInnerY, bx2, by2);
        ctx.closePath();
        ctx.fillStyle = 'rgba(2, 44, 34, 0.55)';
        ctx.fill();

        // High-contrast spine highlight down the center
        ctx.beginPath();
        ctx.moveTo(rootX, rootY);
        ctx.quadraticCurveTo((rootX + tx) * 0.5 - Math.sin(tAng) * 2, (rootY + ty) * 0.5 + Math.cos(tAng) * 2, tx, ty);
        ctx.strokeStyle = 'rgba(220, 252, 231, 0.75)';
        ctx.lineWidth = Math.max(0.7, radius * 0.022);
        ctx.stroke();
      }

      ctx.strokeStyle = isLight ? '#022c22' : '#052e16';
      ctx.lineWidth = Math.max(1, radius * 0.026);
      ctx.stroke();

      ctx.restore();
    }
  }

  // Fire Ball: Cel-shaded living flame that bends & curves along its real travel path
  if (config.id === BALL_TYPES.FIRE) {
    drawCelFireball(
      ctx,
      x,
      y,
      radius,
      motionVector,
      isHit,
      isLight
    );
  }

  // 3D Sphere Body
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);

  if (config.id === BALL_TYPES.FIRE) {
    // Fire Ball body is the cel-shaded flame itself (drawn above)
  } else if (isHit) {
    if (isLight) {
      // In Light Mode, flash a prominent crimson-red impact so it stays crisp against the light background
      ctx.fillStyle = '#dc2626';
      ctx.fill();
      ctx.strokeStyle = '#991b1b';
      ctx.lineWidth = 3;
      ctx.stroke();
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }
  } else {
    const lightX = x - radius * 0.35;
    const lightY = y - radius * 0.35;
    const radGrad = ctx.createRadialGradient(
      lightX,
      lightY,
      radius * 0.08,
      x,
      y,
      radius
    );

    radGrad.addColorStop(0, config.highlightColor || '#ffffff');
    radGrad.addColorStop(0.3, config.bodyColor);
    radGrad.addColorStop(0.85, config.shadowColor);
    radGrad.addColorStop(1, '#09090b');

    ctx.fillStyle = radGrad;
    ctx.fill();

    // Stone Ball: Realistic crack & rocky pitted texture
    if (config.hasTexture) {
      ctx.save();
      ctx.clip();
      ctx.strokeStyle = '#18181b';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(x - radius * 0.6, y - radius * 0.3);
      ctx.lineTo(x - radius * 0.1, y - radius * 0.1);
      ctx.lineTo(x + radius * 0.4, y + radius * 0.3);
      ctx.moveTo(x - radius * 0.1, y - radius * 0.1);
      ctx.lineTo(x - radius * 0.3, y + radius * 0.5);
      ctx.stroke();

      ctx.fillStyle = '#27272a';
      [[-0.4, 0.3], [0.3, -0.4], [0.1, 0.4], [-0.2, -0.5]].forEach(([ox, oy]) => {
        ctx.beginPath();
        ctx.arc(x + ox * radius, y + oy * radius, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    }

    // Heal Ball: Centered medical healing cross & soft pulsating restorative aura
    if (config.id === BALL_TYPES.HEAL) {
      ctx.save();
      ctx.clip();
      ctx.translate(x, y);

      // Pulsing healing aura ring
      const pulse = Math.sin(rotationAngle * 3) * 0.12;
      ctx.strokeStyle = 'rgba(167, 243, 208, 0.55)';
      ctx.lineWidth = Math.max(1.2, radius * 0.06);
      ctx.beginPath();
      ctx.arc(0, 0, radius * (0.64 + pulse), 0, Math.PI * 2);
      ctx.stroke();

      // Bold centered medical cross
      const crossW = radius * 0.52;
      const barThick = radius * 0.18;

      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#6ee7b7';
      ctx.shadowBlur = 6;
      ctx.fillRect(-barThick / 2, -crossW / 2, barThick, crossW);
      ctx.fillRect(-crossW / 2, -barThick / 2, crossW, barThick);

      ctx.restore();
    }

    // Glass Ball: Crystalline refraction, internal facets & missing broken notches
    if (config.id === BALL_TYPES.GLASS) {
      ctx.save();
      ctx.clip();

      // Translucent inner refraction arc
      ctx.beginPath();
      ctx.arc(x - radius * 0.15, y - radius * 0.15, radius * 0.65, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.fill();

      // Crisp glass specular sheen curves
      ctx.beginPath();
      ctx.arc(x, y, radius * 0.82, Math.PI * 0.7, Math.PI * 1.3);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.lineWidth = 2.2;
      ctx.stroke();

      // Sharp inner fracture lines
      ctx.beginPath();
      ctx.moveTo(x - radius * 0.3, y - radius * 0.1);
      ctx.lineTo(x + radius * 0.2, y + radius * 0.3);
      ctx.lineTo(x + radius * 0.4, y - radius * 0.2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Carved missing notches where shards chipped off from taking hits
      if (missingNotches && missingNotches.length > 0) {
        missingNotches.forEach(n => {
          const notchX = x + Math.cos(n.angle) * radius;
          const notchY = y + Math.sin(n.angle) * radius;
          ctx.beginPath();
          ctx.arc(notchX, notchY, n.size || 9, 0, Math.PI * 2);
          ctx.fillStyle = isLight ? '#f8fafc' : '#0a0b10';
          ctx.fill();
          ctx.strokeStyle = 'rgba(103, 232, 249, 0.8)';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        });
      }

      ctx.restore();
    }

    // Steel Ball: Chrome reflective sheen
    if (config.id === BALL_TYPES.STEEL) {
      ctx.save();
      ctx.clip();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(x - radius, y + radius * 0.5);
      ctx.lineTo(x + radius * 0.5, y - radius);
      ctx.stroke();
      ctx.restore();
    }

    // Grow Ball: Living concentric bio-growth rings & core spore
    if (config.id === BALL_TYPES.GROW) {
      ctx.save();
      ctx.clip();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 1.4;
      [0.35, 0.65, 0.88].forEach(factor => {
        ctx.beginPath();
        ctx.arc(x, y, radius * factor, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Subtle pulsating core highlight
      ctx.beginPath();
      ctx.arc(x - radius * 0.15, y - radius * 0.15, radius * 0.22, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.fill();
      ctx.restore();
    }

    // Shard Ball: Crystalline amethyst internal facets & geometric core
    if (config.id === BALL_TYPES.SHARD) {
      ctx.save();
      ctx.clip();
      ctx.strokeStyle = 'rgba(216, 180, 254, 0.45)';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      for (let c = 0; c < 6; c++) {
        const cAng = (c * Math.PI) / 3;
        const px = x + Math.cos(cAng) * (radius * 0.45);
        const py = y + Math.sin(cAng) * (radius * 0.45);
        if (c === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();

      for (let c = 0; c < 6; c++) {
        const cAng = (c * Math.PI) / 3;
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(cAng) * (radius * 0.45), y + Math.sin(cAng) * (radius * 0.45));
        ctx.lineTo(x + Math.cos(cAng) * (radius * 0.88), y + Math.sin(cAng) * (radius * 0.88));
        ctx.stroke();
      }

      // Bright specular glint
      ctx.beginPath();
      ctx.arc(x - radius * 0.22, y - radius * 0.22, radius * 0.2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.fill();
      ctx.restore();
    }

    // Accelerator Ball: Aerodynamic velocity streaks & electric kinetic core
    if (config.id === BALL_TYPES.ACCELERATOR) {
      ctx.save();
      ctx.clip();
      ctx.strokeStyle = 'rgba(147, 197, 253, 0.6)';
      ctx.lineWidth = 1.7;

      // Triple aerodynamic velocity streaks aligned with motion direction
      [-0.42, 0, 0.42].forEach(offset => {
        ctx.beginPath();
        const ax = x + Math.cos(rotationAngle + Math.PI / 2) * (radius * offset);
        const ay = y + Math.sin(rotationAngle + Math.PI / 2) * (radius * offset);
        const len = radius * 0.72;
        ctx.moveTo(ax - Math.cos(rotationAngle) * len, ay - Math.sin(rotationAngle) * len);
        ctx.lineTo(ax + Math.cos(rotationAngle) * (len * 0.45), ay + Math.sin(rotationAngle) * (len * 0.45));
        ctx.stroke();
      });

      // Bright specular glint
      ctx.beginPath();
      ctx.arc(x - radius * 0.26, y - radius * 0.26, radius * 0.22, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.fill();
      ctx.restore();
    }

    // Gun Ball: Tactical crosshair scope reticle & amber center
    if (config.id === BALL_TYPES.GUN) {
      ctx.save();
      ctx.clip();
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.45)'; // tactical amber
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.arc(x, y, radius * 0.52, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x - radius * 0.68, y);
      ctx.lineTo(x + radius * 0.68, y);
      ctx.moveTo(x, y - radius * 0.68);
      ctx.lineTo(x, y + radius * 0.68);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(x, y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#f59e0b';
      ctx.fill();
      ctx.restore();
    }

    // Sniper Ball: Tactical rangefinder mil-dot reticle etched across the dark sphere
    if (config.id === BALL_TYPES.SNIPER) {
      ctx.save();
      ctx.clip();

      // Outer precision reticle ring
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(x, y, radius * 0.58, 0, Math.PI * 2);
      ctx.stroke();

      // Inner target ring
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.65)';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.arc(x, y, radius * 0.3, 0, Math.PI * 2);
      ctx.stroke();

      // Mil-dot crosshair lines
      ctx.beginPath();
      ctx.moveTo(x - radius * 0.72, y);
      ctx.lineTo(x + radius * 0.72, y);
      ctx.moveTo(x, y - radius * 0.72);
      ctx.lineTo(x, y + radius * 0.72);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
      ctx.lineWidth = 1.1;
      ctx.stroke();

      // Mil-dot elevation and windage ticks
      [-0.45, -0.18, 0.18, 0.45].forEach(pos => {
        ctx.beginPath();
        ctx.moveTo(x + pos * radius, y - 2);
        ctx.lineTo(x + pos * radius, y + 2);
        ctx.moveTo(x - 2, y + pos * radius);
        ctx.lineTo(x + 2, y + pos * radius);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Glowing center optic dot
      ctx.beginPath();
      ctx.arc(x, y, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#0284c7';
      ctx.shadowBlur = 6;
      ctx.fill();

      ctx.restore();
    }

    // Thorn Ball: Woven bramble lattice with 3D forward-facing thorns & velvet briar rosebuds
    if (config.id === BALL_TYPES.THORN) {
      ctx.save();
      ctx.clip();

      // Intertwining thick curved bramble vine bands wrapped across the spherical face
      const vineBands = [
        { cx: x - radius * 0.22, cy: y - radius * 0.18, rx: radius * 0.88, ry: radius * 0.54, rot: rotationAngle + 0.35 },
        { cx: x + radius * 0.18, cy: y + radius * 0.22, rx: radius * 0.78, ry: radius * 0.46, rot: rotationAngle - 1.15 },
        { cx: x, cy: y, rx: radius * 0.62, ry: radius * 0.62, rot: rotationAngle + 1.85 },
      ];

      vineBands.forEach(v => {
        // Drop shadow for vine band
        ctx.save();
        ctx.translate(v.cx, v.cy);
        ctx.rotate(v.rot);

        ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.lineWidth = Math.max(3.6, radius * 0.11);
        ctx.beginPath();
        ctx.ellipse(1.5, 2, v.rx, v.ry, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Main woody vine cord
        ctx.strokeStyle = isHit ? '#ffffff' : '#052e16';
        ctx.lineWidth = Math.max(3.2, radius * 0.095);
        ctx.beginPath();
        ctx.ellipse(0, 0, v.rx, v.ry, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Midtone organic bark & spine highlight
        if (!isHit) {
          ctx.strokeStyle = '#15803d';
          ctx.lineWidth = Math.max(1.8, radius * 0.055);
          ctx.stroke();

          ctx.strokeStyle = '#86efac';
          ctx.lineWidth = Math.max(0.7, radius * 0.02);
          ctx.setLineDash([8, 8]);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        ctx.restore();
      });

      // 4 Surface forward-facing 3D Thorn Spikes situated along vine junctions
      const surfaceThorns = [
        { dist: radius * 0.45, ang: rotationAngle + 0.6, size: radius * 0.24, dir: rotationAngle + 0.8 },
        { dist: radius * 0.55, ang: rotationAngle + 2.4, size: radius * 0.22, dir: rotationAngle + 2.7 },
        { dist: radius * 0.35, ang: rotationAngle + 3.8, size: radius * 0.26, dir: rotationAngle + 4.1 },
        { dist: radius * 0.58, ang: rotationAngle + 5.1, size: radius * 0.23, dir: rotationAngle + 5.3 },
      ];

      surfaceThorns.forEach(st => {
        const sx = x + Math.cos(st.ang) * st.dist;
        const sy = y + Math.sin(st.ang) * st.dist;
        drawSurfaceThorn(ctx, sx, sy, st.size, st.dir, isHit);
      });

      // 2 Elegant Crimson Briar Rosebuds nestled in vine crossings
      const buds = [
        { dist: radius * 0.42, ang: rotationAngle + 1.5, size: radius * 0.18, rot: rotationAngle + 0.4 },
        { dist: radius * 0.48, ang: rotationAngle + 4.5, size: radius * 0.16, rot: rotationAngle + 2.2 },
      ];

      buds.forEach(b => {
        const bx = x + Math.cos(b.ang) * b.dist;
        const by = y + Math.sin(b.ang) * b.dist;
        drawBriarRoseBud(ctx, bx, by, b.size, b.rot, isHit);
      });

      ctx.restore();
    }

    // Multi Ball: Glowing internal dividing cores & mitotic fission ring
    if (config.id === BALL_TYPES.MULTI) {
      ctx.save();
      ctx.clip();
      ctx.translate(x, y);
      ctx.rotate(rotationAngle);

      const stage = config.splitStage || 1;

      // Faint division meridian across the sphere
      ctx.strokeStyle = 'rgba(240, 171, 252, 0.45)';
      ctx.lineWidth = Math.max(1, radius * 0.05);
      ctx.beginPath();
      ctx.moveTo(0, -radius * 0.9);
      ctx.lineTo(0, radius * 0.9);
      ctx.stroke();

      if (stage === 1) {
        // Generation 1 (Original, 50 HP): 2 glowing dividing nuclei connected by energy bridge
        const dOffset = radius * 0.32;
        const coreR = radius * 0.22;

        // Connecting energy bridge
        ctx.strokeStyle = '#f0abfc';
        ctx.lineWidth = Math.max(1.2, radius * 0.08);
        ctx.beginPath();
        ctx.moveTo(-dOffset, 0);
        ctx.lineTo(dOffset, 0);
        ctx.stroke();

        // 2 Cores
        [-dOffset, dOffset].forEach(cx => {
          ctx.beginPath();
          ctx.arc(cx, 0, coreR, 0, Math.PI * 2);
          ctx.fillStyle = '#fdf4ff';
          ctx.fill();
          ctx.strokeStyle = '#e879f9';
          ctx.lineWidth = 1.4;
          ctx.stroke();

          // Inner spark
          ctx.beginPath();
          ctx.arc(cx - coreR * 0.25, -coreR * 0.25, coreR * 0.35, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        });

      } else if (stage === 2) {
        // Generation 2 (Mini, 25 HP): 2 smaller dividing cores
        const dOffset = radius * 0.3;
        const coreR = radius * 0.24;

        [-dOffset, dOffset].forEach(cx => {
          ctx.beginPath();
          ctx.arc(cx, 0, coreR, 0, Math.PI * 2);
          ctx.fillStyle = '#fdf4ff';
          ctx.fill();
          ctx.strokeStyle = '#e879f9';
          ctx.lineWidth = 1.2;
          ctx.stroke();
        });

      } else {
        // Generation 3 (Micro, 10 HP): 1 single intense glowing core
        const coreR = radius * 0.35;
        ctx.beginPath();
        ctx.arc(0, 0, coreR, 0, Math.PI * 2);
        ctx.fillStyle = '#fdf4ff';
        ctx.fill();
        ctx.strokeStyle = '#e879f9';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      // Specular sheen
      ctx.beginPath();
      ctx.arc(-radius * 0.25, -radius * 0.25, radius * 0.22, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.fill();

      ctx.restore();
    }

    // Shield active: Body crystalline metallic shine overlay
    if (shield > 0) {
      ctx.save();
      ctx.clip(); // Keeps shine strictly within ball surface without covering outer team boundary

      // Inner cyan protective glow
      const shieldGlow = ctx.createRadialGradient(x, y, radius * 0.2, x, y, radius);
      shieldGlow.addColorStop(0, 'rgba(56, 189, 248, 0.28)');
      shieldGlow.addColorStop(0.7, 'rgba(14, 165, 233, 0.16)');
      shieldGlow.addColorStop(1, 'rgba(2, 132, 199, 0.35)');
      ctx.fillStyle = shieldGlow;
      ctx.fill();

      // Translucent crystalline diagonal luster / shine streaks
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = 'rgba(224, 242, 254, 0.75)';
      ctx.beginPath();
      ctx.moveTo(x - radius * 0.7, y + radius * 0.2);
      ctx.lineTo(x + radius * 0.2, y - radius * 0.7);
      ctx.stroke();

      ctx.lineWidth = 1.8;
      ctx.strokeStyle = 'rgba(186, 230, 253, 0.5)';
      ctx.beginPath();
      ctx.moveTo(x - radius * 0.4, y + radius * 0.55);
      ctx.lineTo(x + radius * 0.55, y - radius * 0.4);
      ctx.stroke();

      ctx.restore();
    }
  }

  if (teamColor) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.strokeStyle = teamColor;
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }

  // Carved missing notches for Glass Ball: re-applied over outline so chips cleanly bite through the team perimeter
  if (config.id === BALL_TYPES.GLASS && missingNotches && missingNotches.length > 0) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, radius + 2, 0, Math.PI * 2);
    ctx.clip();
    missingNotches.forEach(n => {
      const notchX = x + Math.cos(n.angle) * radius;
      const notchY = y + Math.sin(n.angle) * radius;
      ctx.beginPath();
      ctx.arc(notchX, notchY, n.size || 9, 0, Math.PI * 2);
      ctx.fillStyle = isLight ? '#f8fafc' : '#0a0b10';
      ctx.fill();
      ctx.strokeStyle = 'rgba(103, 232, 249, 0.8)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
    ctx.restore();
  }

  ctx.restore();
}

// 3D Thumbnail Preview in Sidebar
function BallThumbnailPreview({ config, theme }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 64, 64);

    ctx.fillStyle = theme === 'light' ? '#f1f5f9' : '#0d0e13';
    ctx.fillRect(0, 0, 64, 64);
    ctx.strokeStyle = theme === 'light' ? '#cbd5e1' : '#1a1d26';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, 64, 64);

    const isFire = config.id === BALL_TYPES.FIRE;
    const previewRadius = isFire ? 12 : Math.min(20, config.radius * 0.54);
    const previewY = isFire ? 44 : 32;
    const rotation = config.id === BALL_TYPES.SWORD ? -0.4 : (config.id === BALL_TYPES.KNIFE ? -0.42 : (config.id === BALL_TYPES.GUN ? -0.48 : (config.id === BALL_TYPES.SNIPER ? -0.48 : (config.id === BALL_TYPES.THORN ? 0.25 : (config.id === BALL_TYPES.FIRE ? 0.35 : 0)))));
    draw3DBall(ctx, 32, previewY, previewRadius, config, null, rotation, false, 0, theme, [], { vx: 0, vy: 0 });
  }, [config, theme]);

  return (
    <div className="ball-square-preview">
      <canvas ref={canvasRef} width={64} height={64} className="preview-canvas-render" />
    </div>
  );
}

function BallBattleGame() {
  const canvasRef = useRef(null);

  const [theme, setTheme] = useState(() => {
    try {
      const savedTheme = localStorage.getItem('ball_battles_theme');
      return savedTheme === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });
  const [selectedBallType, setSelectedBallType] = useState(BALL_TYPES.NORMAL);
  const [rarityFilter, setRarityFilter] = useState('ALL');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [placedBalls, setPlacedBalls] = useState([]);
  const [dragState, setDragState] = useState(null);

  const [simState, setSimState] = useState('planning'); // 'planning' | 'playing' | 'paused' | 'concluded'
  const [winnerTeam, setWinnerTeam] = useState(null);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [matchSummaryStats, setMatchSummaryStats] = useState(null);
  const [showEffectsModal, setShowEffectsModal] = useState(false);
  const [alertModal, setAlertModal] = useState(null);
  const [showStats, setShowStats] = useState(() => {
    try {
      const saved = localStorage.getItem('ball_battles_show_stats');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const [isMuted, setIsMuted] = useState(() => sound.isMuted);

  const toggleSound = () => {
    const nextMute = sound.toggleMute();
    setIsMuted(nextMute);
    if (!nextMute) {
      sound.play('buttonClick');
    }
  };

  const toggleStats = () => {
    sound.play('buttonClick');
    setShowStats(prev => {
      const next = !prev;
      try {
        localStorage.setItem('ball_battles_show_stats', String(next));
      } catch {
        // ignore localStorage exceptions
      }
      return next;
    });
  };

  const physicsRef = useRef({
    balls: [],
    brokenShards: [],
    flyingShards: [],
    flyingBullets: [],
    thornTraps: [],
    shardBursts: [],
    damageTexts: [],
    particles: [],
    confetti: [],
    trailPoints: [],
    fireTrails: [],
    fireImpacts: [],
    conclusionTimer: 0,
    lastTime: 0,
    running: false,
    speedMultiplier: 1,
  });

  const [liveBallsTelemetry, setLiveBallsTelemetry] = useState([]);
  const [activeTooltip, setActiveTooltip] = useState(null);

  const showTooltip = (e, effectKey) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const data = EFFECT_TOOLTIPS[effectKey];
    if (!data) return;

    const isNearTop = rect.top < 115;
    const centerX = rect.left + rect.width / 2;
    const clampedX = Math.max(140, Math.min(window.innerWidth - 140, centerX));

    setActiveTooltip({
      ...data,
      x: clampedX,
      y: isNearTop ? rect.bottom + 8 : rect.top - 8,
      arrowPosition: isNearTop ? 'top' : 'bottom',
      arrowOffset: centerX - clampedX,
    });
  };

  const hideTooltip = () => {
    setActiveTooltip(null);
  };

  useEffect(() => {
    physicsRef.current.speedMultiplier = speedMultiplier;
  }, [speedMultiplier]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('ball_battles_theme', theme);
    } catch {
      // ignore localStorage quota/disabled exceptions
    }
  }, [theme]);

  const toggleTheme = () => {
    sound.play('buttonClick');
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Keyboard shortcuts: Alt + P (Theme), Alt + M (Audio Mute), Escape (Close Modals)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        toggleTheme();
      } else if (e.altKey && (e.key === 'm' || e.key === 'M')) {
        e.preventDefault();
        toggleSound();
      } else if (e.key === 'Escape') {
        setShowEffectsModal(false);
        setAlertModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const rawBlueBalls = (simState === 'planning' ? placedBalls : liveBallsTelemetry).filter(b => b.team === TEAMS.BLUE.id);
  const rawRedBalls = (simState === 'planning' ? placedBalls : liveBallsTelemetry).filter(b => b.team === TEAMS.RED.id);

  const isTeamMatch = rawBlueBalls.length > 1 || rawRedBalls.length > 1;

  // In battles, sort alive balls on top and dead/dying balls below
  const blueBalls = simState !== 'planning'
    ? [...rawBlueBalls].sort((a, b) => ((a.isDead || a.isDying) ? 1 : 0) - ((b.isDead || b.isDying) ? 1 : 0))
    : rawBlueBalls;

  const redBalls = simState !== 'planning'
    ? [...rawRedBalls].sort((a, b) => ((a.isDead || a.isDying) ? 1 : 0) - ((b.isDead || b.isDying) ? 1 : 0))
    : rawRedBalls;

  const blueSideTitle = rawBlueBalls.length > 1 ? 'BLUE TEAM' : 'BLUE SIDE';
  const redSideTitle = rawRedBalls.length > 1 ? 'RED TEAM' : 'RED SIDE';

  const getWinnerText = () => {
    if (winnerTeam === null || winnerTeam < 0) return 'ROUND DRAW';
    if (!isTeamMatch) {
      const winningBall = (winnerTeam === TEAMS.BLUE.id ? rawBlueBalls[0] : rawRedBalls[0]);
      return `${(winningBall ? winningBall.name : (winnerTeam === TEAMS.BLUE.id ? 'BLUE' : 'RED')).toUpperCase()} VICTORIOUS`;
    }
    const winningSideTitle = winnerTeam === TEAMS.BLUE.id ? 'BLUE TEAM' : 'RED TEAM';
    return `${winningSideTitle} VICTORIOUS`;
  };

  const clearAllBalls = () => {
    sound.play('buttonClick');
    setPlacedBalls([]);
    physicsRef.current.running = false;
    physicsRef.current.balls = [];
    physicsRef.current.brokenShards = [];
    physicsRef.current.flyingShards = [];
    physicsRef.current.flyingBullets = [];
    physicsRef.current.thornTraps = [];
    physicsRef.current.shardBursts = [];
    physicsRef.current.damageTexts = [];
    physicsRef.current.particles = [];
    physicsRef.current.confetti = [];
    physicsRef.current.trailPoints = [];
    physicsRef.current.fireTrails = [];
    physicsRef.current.fireImpacts = [];
    physicsRef.current.conclusionTimer = 0;
    setSimState('planning');
    setWinnerTeam(null);
    setMatchSummaryStats(null);
    setLiveBallsTelemetry([]);
  };

  const launchBattle = () => {
    const blueCount = placedBalls.filter(b => b.team === TEAMS.BLUE.id).length;
    const redCount = placedBalls.filter(b => b.team === TEAMS.RED.id).length;

    if (placedBalls.length < 2 || blueCount === 0 || redCount === 0) {
      sound.play('buttonClick');
      setAlertModal({
        title: placedBalls.length === 0 ? 'NO UNITS DEPLOYED' : 'INSUFFICIENT COMBATANTS',
        message: 'Please place at least 2 balls on the arena (e.g. 1 on Left and 1 on Right) to start battle.',
        tipBlue: 'Left Zone: Deploy at least 1 unit for Blue Side',
        tipRed: 'Right Zone: Deploy at least 1 unit for Red Side',
      });
      return;
    }
    sound.play('gameStart', 0.95);

    const initialBalls = placedBalls.map(b => {
      const spd = b.speed;
      return {
        ...b,
        radius: b.config?.radius || b.radius,
        mass: b.config?.mass || b.mass,
        speed: b.config?.speed || b.speed,
        initialSpeed: b.config?.initialSpeed || b.speed,
        vx: Math.cos(b.angle) * spd,
        vy: Math.sin(b.angle) * spd,
        hp: b.maxHp,
        displayHp: b.maxHp,
        shield: 0,
        hasArmor: b.hasArmor || b.config?.hasArmor || b.type === BALL_TYPES.STONE || b.type === BALL_TYPES.SPIKE,
        hitCount: 0,
        bleedTicksLeft: 0,
        bleedTimer: 0,
        bleedSource: null,
        bleedQueue: [],
        burnTicksLeft: 0,
        burnTimer: 0,
        burnSource: null,
        burnQueue: [],
        isDead: false,
        isDying: false,
        deathTimer: 0,
        deathMaxTimer: 0,
        hitFlashTimer: 0,
        hitShakeTimer: 0,
        invulnerableTimer: 0,
        swordAngle: b.angle,
        swordSpeed: 0.06,
        swordHitFreezeTimer: 0,
        knifeAngle: b.angle || 0,
        knifeSpeed: 0.12,
        knifeHitFreezeTimer: 0,
        spikeAngle: b.angle || 0,
        hammerAngle: b.angle,
        hammerSpeed: 0.055,
        hammerHitFreezeTimer: 0,
        shardAngle: b.angle || 0,
        shardTargetTimer: 0,
        gunAngle: b.angle || 0,
        gunSpeed: 0.045,
        gunCooldown: 3000,
        sniperAngle: b.angle || 0,
        sniperCooldown: 4000,
        sniperState: 'roam',
        sniperAimTimer: 0,
        targetBallId: null,
        targetX: 0,
        targetY: 0,
        thornAngle: b.angle || 0,
        multiAngle: b.angle || 0,
        fireAngle: b.angle || 0,
        splitStage: b.config?.splitStage || 1,
        targetRadius: b.config?.radius || b.radius,
        targetMass: b.config?.mass || b.mass,
        growCooldown: 0,
        growDelayTimer: 0,
        hasTriggeredGrowFx: false,
        healTimer: 6000,
        healFlashTimer: 0,
        missingNotches: [],
        fireHistory: b.type === BALL_TYPES.FIRE ? Array.from({ length: 16 }, (_, idx) => ({
          x: b.x - Math.cos(b.angle) * (idx * (b.radius * 0.22)),
          y: b.y - Math.sin(b.angle) * (idx * (b.radius * 0.22)),
        })) : [],
        firePuffs: [],
        totalDamageDealt: 0,
        kills: 0,
      };
    });

    physicsRef.current = {
      balls: initialBalls,
      brokenShards: [],
      flyingShards: [],
      flyingBullets: [],
      thornTraps: [],
      shardBursts: [],
      damageTexts: [],
      particles: [],
      confetti: [],
      trailPoints: [],
      fireTrails: [],
      fireImpacts: [],
      conclusionTimer: 0,
      lastTime: performance.now(),
      running: true,
      speedMultiplier: speedMultiplier,
    };

    setLiveBallsTelemetry(initialBalls);
    setMatchSummaryStats(null);
    setSimState('playing');
    setWinnerTeam(null);
  };

  const togglePause = () => {
    if (simState === 'playing') {
      physicsRef.current.running = false;
      setSimState('paused');
      sound.stopAllLoops();
      sound.play('pause');
    } else if (simState === 'paused') {
      physicsRef.current.running = true;
      physicsRef.current.lastTime = performance.now();
      setSimState('playing');
      sound.play('unpause');
    }
  };

  const resetToPlanning = () => {
    sound.stopAllLoops();
    sound.play('buttonClick');
    physicsRef.current.running = false;
    physicsRef.current.balls = [];
    physicsRef.current.brokenShards = [];
    physicsRef.current.flyingShards = [];
    physicsRef.current.flyingBullets = [];
    physicsRef.current.thornTraps = [];
    physicsRef.current.shardBursts = [];
    physicsRef.current.damageTexts = [];
    physicsRef.current.particles = [];
    physicsRef.current.confetti = [];
    physicsRef.current.trailPoints = [];
    physicsRef.current.fireTrails = [];
    physicsRef.current.fireImpacts = [];
    physicsRef.current.conclusionTimer = 0;
    setSimState('planning');
    setWinnerTeam(null);
    setMatchSummaryStats(null);
    setLiveBallsTelemetry([]);
  };

  const startNewBattle = () => {
    // Empty the canvas and return cleanly to planning phase
    sound.play('buttonClick');
    setPlacedBalls([]);
    physicsRef.current.running = false;
    physicsRef.current.balls = [];
    physicsRef.current.brokenShards = [];
    physicsRef.current.flyingShards = [];
    physicsRef.current.flyingBullets = [];
    physicsRef.current.thornTraps = [];
    physicsRef.current.shardBursts = [];
    physicsRef.current.damageTexts = [];
    physicsRef.current.particles = [];
    physicsRef.current.confetti = [];
    physicsRef.current.trailPoints = [];
    physicsRef.current.fireTrails = [];
    physicsRef.current.fireImpacts = [];
    physicsRef.current.conclusionTimer = 0;
    setSimState('planning');
    setWinnerTeam(null);
    setMatchSummaryStats(null);
    setLiveBallsTelemetry([]);
  };

  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_SIZE / rect.width;
    const scaleY = CANVAS_SIZE / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handleMouseDown = (e) => {
    if (simState !== 'planning') return;
    const { x, y } = getCanvasCoords(e);

    const clickedIdx = placedBalls.findIndex(b => Math.hypot(b.x - x, b.y - y) <= b.radius + 6);

    if (e.button === 2) {
      if (clickedIdx !== -1) {
        sound.play('remove');
        setPlacedBalls(prev => prev.filter((_, idx) => idx !== clickedIdx));
      }
      return;
    }

    if (clickedIdx !== -1) {
      setDragState({
        type: 'aiming',
        ballIndex: clickedIdx,
        originX: placedBalls[clickedIdx].x,
        originY: placedBalls[clickedIdx].y,
        currentX: x,
        currentY: y,
      });
      return;
    }

    const isBlueSide = x < CANVAS_SIZE / 2;
    const assignedTeam = isBlueSide ? TEAMS.BLUE : TEAMS.RED;

    const config = BALL_CONFIGS[selectedBallType];
    const radius = config.radius;

    const clampedX = Math.max(radius + 8, Math.min(CANVAS_SIZE - radius - 8, x));
    const clampedY = Math.max(radius + 8, Math.min(CANVAS_SIZE - radius - 8, y));

    const defaultAngle = isBlueSide ? 0 : Math.PI;

    const newBall = {
      id: Date.now() + Math.random(),
      team: assignedTeam.id,
      type: config.id,
      name: config.name,
      config: config,
      x: clampedX,
      y: clampedY,
      angle: defaultAngle,
      speed: config.speed,
      radius: config.radius,
      mass: config.mass,
      baseHp: config.baseHp,
      maxHp: config.baseHp,
      hp: config.baseHp,
      displayHp: config.baseHp,
      shield: 0,
      hitCount: 0,
      damage: config.damage,
      teamColor: assignedTeam.color,
      teamName: assignedTeam.name,
    };

    setPlacedBalls(prev => [...prev, newBall]);
    sound.play('place');

    setDragState({
      type: 'aiming',
      ballIndex: placedBalls.length,
      originX: clampedX,
      originY: clampedY,
      currentX: x,
      currentY: y,
    });
  };

  const handleMouseMove = (e) => {
    if (!dragState || simState !== 'planning') return;
    const { x, y } = getCanvasCoords(e);

    setDragState(prev => ({
      ...prev,
      currentX: x,
      currentY: y,
    }));

    if (dragState.type === 'aiming') {
      const angle = Math.atan2(y - dragState.originY, x - dragState.originX);
      setPlacedBalls(prev => {
        const copy = [...prev];
        if (copy[dragState.ballIndex]) {
          copy[dragState.ballIndex] = { ...copy[dragState.ballIndex], angle };
        }
        return copy;
      });
    }
  };

  const handleMouseUp = () => {
    setDragState(null);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let telemetrySyncTimer = 0;

    const confettiColors = ['#f43f5e', '#3b82f6', '#10b981', '#eab308', '#a855f7', '#06b6d4', '#ffffff'];
    let confettiTimer = 0;

    // Confetti Spawner shooting inwards towards the middle from left & right sides
    const spawnVictoryConfetti = (centerX, centerY, count = 28) => {
      const targetX = centerX ?? CANVAS_SIZE / 2;
      const targetY = centerY ?? CANVAS_SIZE / 2;

      // Stream from Left border inwards towards the middle
      for (let i = 0; i < count; i++) {
        const startX = -10 + Math.random() * 20;
        const startY = Math.random() * (CANVAS_SIZE * 0.7) + (CANVAS_SIZE * 0.15);
        const ang = Math.atan2(targetY - startY, targetX - startX) + (Math.random() - 0.5) * 0.45;
        const vel = Math.random() * 8.0 + 5.5;

        physicsRef.current.confetti.push({
          x: startX,
          y: startY,
          vx: Math.cos(ang) * vel,
          vy: Math.sin(ang) * vel - 1.8,
          gravity: 0.12,
          size: Math.random() * 6.5 + 3.5,
          color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.28,
          life: 1.0,
          decay: Math.random() * 0.007 + 0.004,
        });
      }

      // Stream from Right border inwards towards the middle
      for (let i = 0; i < count; i++) {
        const startX = CANVAS_SIZE + 10 - Math.random() * 20;
        const startY = Math.random() * (CANVAS_SIZE * 0.7) + (CANVAS_SIZE * 0.15);
        const ang = Math.atan2(targetY - startY, targetX - startX) + (Math.random() - 0.5) * 0.45;
        const vel = Math.random() * 8.0 + 5.5;

        physicsRef.current.confetti.push({
          x: startX,
          y: startY,
          vx: Math.cos(ang) * vel,
          vy: Math.sin(ang) * vel - 1.8,
          gravity: 0.12,
          size: Math.random() * 6.5 + 3.5,
          color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.28,
          life: 1.0,
          decay: Math.random() * 0.007 + 0.004,
        });
      }
    };

    const spawnParticles = (x, y, color, count = 5, speedScale = 1) => {
      for (let i = 0; i < count; i++) {
        const ang = Math.random() * Math.PI * 2;
        const vel = (Math.random() * 2.0 + 0.8) * speedScale;
        physicsRef.current.particles.push({
          x,
          y,
          vx: Math.cos(ang) * vel,
          vy: Math.sin(ang) * vel,
          life: 1.0,
          decay: Math.random() * 0.04 + 0.03,
          color: color || '#ffffff',
          size: Math.random() * 2.5 + 1.5,
        });
      }
    };

    const spawnDamageText = (x, y, amount, isCritical = false, isShieldAbsorb = false, isBurn = false) => {
      const offsetX = (Math.random() - 0.5) * 16;
      const clampedAmount = Math.max(1, Math.min(30, amount));
      const fontSize = Math.round(16 + (clampedAmount - 4) * 0.9 + (isCritical ? 7 : 0));

      physicsRef.current.damageTexts.push({
        x: x + offsetX,
        y: y - 12,
        text: isShieldAbsorb ? `🛡 -${Math.round(amount)}` : `-${Math.round(amount)}`,
        fontSize,
        opacity: 1.0,
        isCritical,
        isShieldAbsorb,
        isBurn,
        life: 1.0,
        decay: 0.02,
        vy: -1.3,
      });
    };

    const spawnHealText = (x, y, amount) => {
      const offsetX = (Math.random() - 0.5) * 12;
      physicsRef.current.damageTexts.push({
        x: x + offsetX,
        y: y - 16,
        text: `+${Math.round(amount)}`,
        fontSize: 18,
        opacity: 1.0,
        isHeal: true,
        life: 1.0,
        decay: 0.018,
        vy: -1.3,
      });
    };

    const triggerGrowBallExpansion = (growBall) => {
      if (growBall.isDead || growBall.isDying) return;
      if ((growBall.growCooldown || 0) > 0) return; // Only trigger ONCE per distinct collision impact

      const growth = growBall.config?.growthPerHit || 7.5;
      const maxR = growBall.config?.maxRadius || 108;
      const maxM = growBall.config?.maxMass || 6.0;
      const baseR = growBall.config?.radius || 34;
      const baseM = growBall.config?.mass || 1.0;

      const currentTargetR = growBall.targetRadius || growBall.radius;
      if (currentTargetR < maxR) {
        // Enforce once-per-hit cooldown
        growBall.growCooldown = 0.55;
        // Delay growth by ~280ms so size expands AFTER collision rebound separation,
        // avoiding instant overlap/double-hit issues while enemy is still nearby
        growBall.growDelayTimer = 0.28;
        growBall.hasTriggeredGrowFx = false;

        const nextTargetR = Math.min(maxR, currentTargetR + growth);
        growBall.targetRadius = nextTargetR;

        // Proportional mass scaling up to 6.0 max mass
        const progress = Math.min(1, Math.max(0, (nextTargetR - baseR) / (maxR - baseR)));
        growBall.targetMass = Math.min(maxM, Math.round((baseM + progress * (maxM - baseM)) * 10) / 10);

        sound.play('growing', 0.85);
      }
    };

    const triggerShardBurst = (attacker, target) => {
      if (target.isDead || target.isDying) return;
      // Inflict "Shard Target" status on the struck enemy
      target.shardTargetTimer = 2600;

      // Queue up 6 consecutive homing shards firing at the locked enemy
      physicsRef.current.shardBursts.push({
        attackerId: attacker.id,
        targetId: target.id,
        target: target,
        attackerTeam: attacker.team,
        originX: attacker.x,
        originY: attacker.y,
        shardsLeft: 6,
        timer: 0, // 1st shard shoots immediately
        interval: 110, // 110ms between consecutive shard launches
      });
    };

    const applyDamage = (victim, amount, attacker, isCritical = false, isBurn = false) => {
      if (victim.isDead || victim.isDying) return;

      if (victim.type === BALL_TYPES.STEEL) {
        victim.hitCount = (victim.hitCount || 0) + 1;
        if (victim.hitCount % 4 === 0) {
          const shieldVal = victim.config?.shieldAmount || 20;
          victim.shield = (victim.shield || 0) + shieldVal;
          spawnParticles(victim.x, victim.y, '#38bdf8', 16, 2.0);
          sound.play('armorUp', 0.9);
        }
      }

      let remainingDmg = amount;
      if (victim.shield > 0) {
        if (victim.shield >= remainingDmg) {
          victim.shield -= remainingDmg;
          spawnDamageText(victim.x, victim.y, remainingDmg, false, true, isBurn);
          attacker.totalDamageDealt += remainingDmg;
          victim.hitFlashTimer = 80;
          victim.hitShakeTimer = 60;
          spawnParticles(victim.x, victim.y, '#38bdf8', 6, 1.2);
          return;
        } else {
          remainingDmg -= victim.shield;
          spawnDamageText(victim.x, victim.y, victim.shield, false, true, isBurn);
          victim.shield = 0;
        }
      }

      victim.hp -= remainingDmg;
      attacker.totalDamageDealt += remainingDmg;
      victim.hitFlashTimer = 110;
      victim.hitShakeTimer = 80;

      // Glass Ball: Chipping off and dropping broken shards when struck
      if (victim.type === BALL_TYPES.GLASS && remainingDmg > 0) {
        // Record missing notch on Glass Ball perimeter
        const notchAng = Math.random() * Math.PI * 2;
        if (!victim.missingNotches) victim.missingNotches = [];
        if (victim.missingNotches.length < 14) {
          victim.missingNotches.push({ angle: notchAng, size: Math.random() * 3 + 7 });
        }

        // Spawn a physical broken glass shard left behind on the ground
        const shardAng = notchAng + Math.PI + (Math.random() - 0.5) * 0.8;
        const shardDist = victim.radius + Math.random() * 12 + 6;
        physicsRef.current.brokenShards.push({
          x: Math.max(12, Math.min(CANVAS_SIZE - 12, victim.x + Math.cos(shardAng) * shardDist)),
          y: Math.max(12, Math.min(CANVAS_SIZE - 12, victim.y + Math.sin(shardAng) * shardDist)),
          radius: 8,
          team: victim.team,
          damage: 8,
          owner: victim,
          rot: Math.random() * Math.PI * 2,
        });

        spawnParticles(victim.x, victim.y, '#67e8f9', 8, 1.4);
        sound.play('glassHit', 0.85);
      }

      spawnDamageText(victim.x, victim.y, remainingDmg, isCritical, false, isBurn);

      // Ball death check - enter animated dying delay before detonating
      if (victim.hp <= 0 && !victim.isDead && !victim.isDying) {
        victim.hp = 0;
        victim.isDying = true;
        victim.deathTimer = 620; // 620ms death animation delay
        victim.deathMaxTimer = 620;
        victim.invulnerableTimer = 99999;
        victim.vx *= 0.15;
        victim.vy *= 0.15;
        if (attacker) attacker.kills += 1;
      }
    };

    const updatePhysics = (dt) => {
      const { balls, damageTexts, particles, confetti, trailPoints } = physicsRef.current;
      const safeDt = Math.min(dt, 0.045);

      // Update Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;
        if (p.life <= 0) particles.splice(i, 1);
      }

      // Update Confetti
      for (let i = confetti.length - 1; i >= 0; i--) {
        const c = confetti[i];
        c.x += c.vx;
        c.y += c.vy;
        c.vy += c.gravity;
        c.rotation += c.rotSpeed;
        c.life -= c.decay;
        if (c.life <= 0) confetti.splice(i, 1);
      }

      // Update Fast Ball subtle motion trails
      for (let i = trailPoints.length - 1; i >= 0; i--) {
        const tp = trailPoints[i];
        tp.life -= 0.045;
        if (tp.life <= 0) trailPoints.splice(i, 1);
      }

      // Update Damage Text Floaters
      for (let i = damageTexts.length - 1; i >= 0; i--) {
        const dtObj = damageTexts[i];
        dtObj.y += dtObj.vy;
        dtObj.life -= dtObj.decay;
        if (dtObj.life <= 0) damageTexts.splice(i, 1);
      }

      // Update persistent ground fire trails
      const fireTrails = physicsRef.current.fireTrails;
      if (fireTrails) {
        for (let i = fireTrails.length - 1; i >= 0; i--) {
          const ft = fireTrails[i];
          ft.life -= ft.decay;
          if (ft.life <= 0) fireTrails.splice(i, 1);
        }
      }

      // Update fiery impact blast animations
      const fireImpacts = physicsRef.current.fireImpacts;
      if (fireImpacts) {
        for (let i = fireImpacts.length - 1; i >= 0; i--) {
          const fi = fireImpacts[i];
          fi.radius += (fi.maxRadius - fi.radius) * 0.24;
          fi.life -= fi.decay;
          if (fi.life <= 0) fireImpacts.splice(i, 1);
        }
      }

      const activeBalls = balls.filter(b => !b.isDead && !b.isDying);
      const livingTeams = new Set(activeBalls.map(b => b.team));
      const hasDyingBalls = balls.some(b => b.isDying);

      // Manage Fire Ball passive ambient burning sound loop
      const hasLivingFireBall = activeBalls.some(b => b.type === BALL_TYPES.FIRE);
      if (hasLivingFireBall && simState === 'playing') {
        sound.startLoop('fireballLoop', 0.65);
      } else {
        sound.stopLoop('fireballLoop');
      }

      // Victory Condition: Glide remaining survivor ball to arena center & conclude (only after all dying balls finish exploding!)
      if (!hasDyingBalls && livingTeams.size <= 1 && balls.length > 0 && simState === 'playing') {
        if (!physicsRef.current.conclusionTimer) {
          physicsRef.current.conclusionTimer = performance.now();
        } else if (performance.now() - physicsRef.current.conclusionTimer > 1500) {
          const winningTeamId = livingTeams.size === 1 ? Array.from(livingTeams)[0] : -1;
          setWinnerTeam(winningTeamId);
          setSimState('concluded');
          sound.stopAllLoops();
          sound.play('win', 0.95);

          const winningBall = activeBalls[0] || null;
          // Only spawn celebration confetti if there is an actual winner (not a draw)
          if (winningTeamId !== -1) {
            if (winningBall) {
              spawnVictoryConfetti(winningBall.x, winningBall.y);
            } else {
              spawnVictoryConfetti(CANVAS_SIZE / 2, CANVAS_SIZE / 2);
            }
          }

          let winnerDisplayName = 'Round Draw';
          if (winningTeamId !== -1) {
            if (activeBalls.length > 1) {
              const teamTitle = winningTeamId === TEAMS.BLUE.id ? 'Blue Team' : 'Red Team';
              winnerDisplayName = `${teamTitle} (${activeBalls.length} Survivors)`;
            } else if (winningBall) {
              winnerDisplayName = winningBall.name;
            }
          }

          setMatchSummaryStats({
            winnerTeam: winningTeamId,
            winnerName: winnerDisplayName,
            winnerHpLeft: winningBall ? Math.max(0, Math.round(winningBall.hp)) : 0,
            winnerMaxHp: winningBall ? winningBall.maxHp : 100,
            winnerDmgDealt: winningBall ? Math.round(winningBall.totalDamageDealt) : 0,
            totalKills: winningBall ? winningBall.kills : 0,
          });
        }
      }

      const spawnedSplitBalls = [];

      balls.forEach(ball => {
        if (ball.isDead) return;

        // Dying state physics & animation timer
        if (ball.isDying) {
          ball.deathTimer -= safeDt * 1000;
          ball.vx *= 0.88;
          ball.vy *= 0.88;
          ball.x += ball.vx;
          ball.y += ball.vy;

          const deathProgress = 1 - Math.max(0, ball.deathTimer / (ball.deathMaxTimer || 620));

          // Crackling sputter sparks before explosion
          if (Math.random() < 0.35 + deathProgress * 0.45) {
            spawnParticles(
              ball.x + (Math.random() - 0.5) * ball.radius * 1.3,
              ball.y + (Math.random() - 0.5) * ball.radius * 1.3,
              ball.type === BALL_TYPES.MULTI ? '#f0abfc' : (Math.random() < 0.5 ? '#f59e0b' : '#ef4444'),
              2,
              0.8 + deathProgress * 0.8
            );
          }
          if (Math.random() < 0.22) {
            spawnParticles(ball.x, ball.y, '#ffffff', 2, 0.6);
          }

          // Detonation timer finished -> trigger explosion or Multi Ball fission split
          if (ball.deathTimer <= 0) {
            ball.isDying = false;
            ball.isDead = true;

            const isMultiBallSplit = ball.type === BALL_TYPES.MULTI && (ball.splitStage || 1) < 3;

            if (isMultiBallSplit) {
              const nextStage = (ball.splitStage || 1) + 1;
              const nextHp = nextStage === 2 ? 25 : 10;
              const nextRadius = nextStage === 2 ? 24 : 16;
              const nextMass = nextStage === 2 ? 0.55 : 0.35;
              const nextSpeed = nextStage === 2 ? 3.6 : 3.9;
              const nextDamage = nextStage === 2 ? 6 : 5;
              const nextName = nextStage === 2 ? 'Mini Multi Ball' : 'Micro Multi Ball';

              sound.play('split', 0.95);

              // Vibrant mitotic fission splitting particles
              spawnParticles(ball.x, ball.y, '#f0abfc', 28, 3.2);
              spawnParticles(ball.x, ball.y, '#c026d3', 22, 2.5);
              spawnParticles(ball.x, ball.y, '#ffffff', 18, 1.8);
              spawnParticles(ball.x, ball.y, ball.teamColor || '#3b82f6', 14, 1.5);

              // 2 split balls fly out in divergent complementary directions
              const baseAng = (ball.vx !== 0 || ball.vy !== 0) ? Math.atan2(ball.vy, ball.vx) : (ball.angle || Math.random() * Math.PI * 2);
              const angles = [baseAng + 0.68, baseAng - 0.68];

              angles.forEach((ang, sIdx) => {
                const offsetDist = nextRadius + 5;
                const spawnX = Math.max(nextRadius + 4, Math.min(CANVAS_SIZE - nextRadius - 4, ball.x + Math.cos(ang) * offsetDist));
                const spawnY = Math.max(nextRadius + 4, Math.min(CANVAS_SIZE - nextRadius - 4, ball.y + Math.sin(ang) * offsetDist));

                spawnedSplitBalls.push({
                  id: Date.now() + Math.random() + sIdx * 0.01,
                  team: ball.team,
                  type: BALL_TYPES.MULTI,
                  name: nextName,
                  splitStage: nextStage,
                  config: {
                    ...(ball.config || BALL_CONFIGS[BALL_TYPES.MULTI]),
                    name: nextName,
                    baseHp: nextHp,
                    radius: nextRadius,
                    mass: nextMass,
                    speed: nextSpeed,
                    damage: nextDamage,
                    splitStage: nextStage,
                  },
                  x: spawnX,
                  y: spawnY,
                  angle: ang,
                  radius: nextRadius,
                  mass: nextMass,
                  speed: nextSpeed,
                  initialSpeed: nextSpeed,
                  vx: Math.cos(ang) * nextSpeed,
                  vy: Math.sin(ang) * nextSpeed,
                  baseHp: nextHp,
                  maxHp: nextHp,
                  hp: nextHp,
                  displayHp: nextHp,
                  damage: nextDamage,
                  shield: 0,
                  hasArmor: false,
                  hitCount: 0,
                  bleedTicksLeft: 0,
                  bleedTimer: 0,
                  bleedSource: null,
                  bleedQueue: [],
                  burnTicksLeft: 0,
                  burnTimer: 0,
                  burnSource: null,
                  burnQueue: [],
                  isDead: false,
                  isDying: false,
                  deathTimer: 0,
                  deathMaxTimer: 0,
                  hitFlashTimer: 0,
                  hitShakeTimer: 0,
                  invulnerableTimer: 280,
                  multiAngle: ang,
                  targetRadius: nextRadius,
                  targetMass: nextMass,
                  teamColor: ball.teamColor,
                  teamName: ball.teamName,
                  totalDamageDealt: 0,
                  kills: 0,
                });
              });
            } else {
              sound.play('death', 0.95);

              const deadBodyColor = ball.config?.bodyColor || ball.color || '#ef4444';
              spawnParticles(ball.x, ball.y, deadBodyColor, 40, 3.6);
              spawnParticles(ball.x, ball.y, '#f97316', 28, 2.8);
              spawnParticles(ball.x, ball.y, '#ffffff', 20, 2.2);
              spawnParticles(ball.x, ball.y, '#ef4444', 22, 2.5);
            }
          }
          return;
        }

        // Check if this ball is the crowned solo champion
        const isSoloWinner = activeBalls.length === 1 && (
          simState === 'concluded' || 
          (!hasDyingBalls && livingTeams.size === 1 && Boolean(physicsRef.current.conclusionTimer))
        );

        // If match concluded or solo winner crowned:
        // 1v1 solo winner: smoothly glide to exact center (CANVAS_SIZE / 2, CANVAS_SIZE / 2) under the aura
        // Team win (multiple survivors): no aura, survivors keep happily bouncing / running around celebrating
        if (isSoloWinner) {
          const targetX = CANVAS_SIZE / 2;
          const targetY = CANVAS_SIZE / 2;
          const dx = targetX - ball.x;
          const dy = targetY - ball.y;
          const dist = Math.hypot(dx, dy);

          ball.vx = 0;
          ball.vy = 0;
          ball.speed = 0;

          if (dist < 0.25) {
            ball.x = targetX;
            ball.y = targetY;
          } else {
            // Smoothly ease directly to exact arena center under the aura
            const easeStep = Math.min(dist, Math.max(0.6, dist * 0.14));
            ball.x += (dx / dist) * easeStep;
            ball.y += (dy / dist) * easeStep;
          }
        } else if (simState === 'concluded' && activeBalls.length > 1) {
          // Team win: Maintain victory celebration run speed
          const curSpd = Math.hypot(ball.vx, ball.vy);
          const targetSpd = Math.max(ball.speed, 2.5);
          if (curSpd > 0.001) {
            ball.vx = (ball.vx / curSpd) * targetSpd;
            ball.vy = (ball.vy / curSpd) * targetSpd;
          } else {
            const ang = Math.random() * Math.PI * 2;
            ball.vx = Math.cos(ang) * targetSpd;
            ball.vy = Math.sin(ang) * targetSpd;
          }
        }

        if (ball.displayHp !== undefined) {
          ball.displayHp += (ball.hp - ball.displayHp) * 0.12;
        }

        // Fast Ball & Multi Ball subtle faint trail effect
        if (ball.type === BALL_TYPES.FAST || ball.type === BALL_TYPES.MULTI) {
          trailPoints.push({
            x: ball.x,
            y: ball.y,
            radius: ball.radius * 0.85,
            color: ball.type === BALL_TYPES.MULTI ? '#c026d3' : (ball.config?.bodyColor || '#38bdf8'),
            life: 0.35, // less visible faint trail
          });
        }

        if (ball.type === BALL_TYPES.MULTI && !ball.isDead && !ball.isDying) {
          ball.multiAngle = (ball.multiAngle || 0) + safeDt * 3.4;
        }

        // Heal Ball: Self-heals +5 HP every 6 seconds
        if (ball.type === BALL_TYPES.HEAL && !ball.isDead && !ball.isDying) {
          const interval = ball.config?.healInterval || 6000;
          if (ball.healTimer === undefined) ball.healTimer = interval;
          ball.healTimer -= safeDt * 1000;
          if (ball.healTimer <= 0) {
            ball.healTimer = interval;
            if (ball.hp < ball.maxHp) {
              const healAmount = ball.config?.healAmount || 5;
              const prevHp = ball.hp;
              ball.hp = Math.min(ball.maxHp, ball.hp + healAmount);
              const actualHealed = ball.hp - prevHp;
              if (actualHealed > 0) {
                ball.healFlashTimer = 350;
                spawnHealText(ball.x, ball.y, actualHealed);
                sound.play('heal', 0.95);
                spawnParticles(ball.x, ball.y, '#10b981', 8, 1.6);
                spawnParticles(ball.x, ball.y, '#6ee7b7', 5, 1.3);
                spawnParticles(ball.x, ball.y, '#ffffff', 3, 1.0);
              }
            }
          }
        }

        // Fire Ball: Literal roaring fire streaming behind motion, dropping persistent burning ground trail
        if (ball.type === BALL_TYPES.FIRE && !ball.isDead && !ball.isDying) {
          ball.fireAngle = (ball.fireAngle || 0) + safeDt * 3.6;

          // Positional history: the flame body follows the real path so it bends & curves on bounces
          if (!ball.fireHistory) ball.fireHistory = [];
          ball.fireHistory.unshift({ x: ball.x, y: ball.y });
          if (ball.fireHistory.length > FIRE_HISTORY_LEN) ball.fireHistory.length = FIRE_HISTORY_LEN;

          // Detached flame puffs that break off the tail, drift upward and shrink away
          if (!ball.firePuffs) ball.firePuffs = [];
          const tailPt = ball.fireHistory[Math.min(ball.fireHistory.length - 1, 7)];
          if (Math.random() < 0.35) {
            ball.firePuffs.push({
              x: tailPt.x + (Math.random() - 0.5) * ball.radius * 0.7,
              y: tailPt.y + (Math.random() - 0.5) * ball.radius * 0.7,
              vx: -ball.vx * 0.12 + (Math.random() - 0.5) * 0.5,
              vy: -ball.vy * 0.12 + (Math.random() - 0.5) * 0.5,
              r: ball.radius * (0.16 + Math.random() * 0.2),
              life: 1.0,
              decay: 0.035 + Math.random() * 0.025,
            });
          }
          for (let pi = ball.firePuffs.length - 1; pi >= 0; pi--) {
            const pf = ball.firePuffs[pi];
            pf.x += pf.vx * safeDt * 60;
            pf.y += pf.vy * safeDt * 60;
            pf.life -= pf.decay * safeDt * 60;
            if (pf.life <= 0) ball.firePuffs.splice(pi, 1);
          }

          // Drop persistent ground fire patches along its wake (sparse to stay smooth)
          const spd = Math.hypot(ball.vx, ball.vy);
          if (spd > 0.35 && Math.random() < 0.18) {
            if (!physicsRef.current.fireTrails) physicsRef.current.fireTrails = [];
            const backAng = Math.atan2(-ball.vy, -ball.vx);
            const dropDist = ball.radius * (0.35 + Math.random() * 0.45);
            physicsRef.current.fireTrails.push({
              x: ball.x + Math.cos(backAng) * dropDist + (Math.random() - 0.5) * 6,
              y: ball.y + Math.sin(backAng) * dropDist + (Math.random() - 0.5) * 6,
              radius: ball.radius * (0.55 + Math.random() * 0.35),
              life: 1.0,
              decay: 0.024 + Math.random() * 0.012, // persists ~0.7-0.9s
              flicker: Math.random() * 20,
            });
          }

          // Hot floating sparks flying upward behind the ball
          if (Math.random() < 0.25) {
            particles.push({
              x: ball.x - (ball.vx || 0) * 1.5 + (Math.random() - 0.5) * ball.radius * 0.7,
              y: ball.y - (ball.vy || 0) * 1.5 + (Math.random() - 0.5) * ball.radius * 0.7,
              vx: (Math.random() - 0.5) * 1.5 - ball.vx * 0.15,
              vy: -1.2 - Math.random() * 1.8 - ball.vy * 0.15,
              life: 1.0,
              decay: 0.045 + Math.random() * 0.035,
              color: Math.random() > 0.4 ? '#f97316' : (Math.random() > 0.3 ? '#fef08a' : '#ea580c'),
              size: Math.random() * 2.8 + 1.8,
            });
          }
        }

        // Burning victim: Wisps of flame and charcoal smoke rising upward
        if (ball.burnTicksLeft > 0 && !ball.isDead && !ball.isDying && Math.random() < 0.45) {
          particles.push({
            x: ball.x + (Math.random() - 0.5) * ball.radius * 0.85,
            y: ball.y + (Math.random() - 0.5) * ball.radius * 0.85,
            vx: (Math.random() - 0.5) * 0.9,
            vy: -1.2 - Math.random() * 1.8,
            life: 1.0,
            decay: 0.05 + Math.random() * 0.03,
            color: Math.random() > 0.4 ? '#f97316' : '#fde047',
            size: Math.random() * 2.2 + 1.6,
          });
        }

        // Accelerator Ball: Accelerates continuously the longer the fight endures
        if (ball.type === BALL_TYPES.ACCELERATOR && !ball.isDead && !ball.isDying && !isSoloWinner) {
          const maxSpd = ball.config?.maxSpeed || 12.0;
          const accelRate = ball.config?.accelRate || 0.32;
          if (ball.speed < maxSpd) {
            ball.speed = Math.min(maxSpd, ball.speed + safeDt * accelRate);
          }

          // Accelerate status effect: As speed increases, kinetic collision damage increases proportionally
          const initialSpd = ball.config?.initialSpeed || 2.6;
          const speedProgress = Math.max(0, Math.min(1, (ball.speed - initialSpd) / (maxSpd - initialSpd)));
          const baseDmg = ball.config?.damage || 8;
          ball.damage = Math.round(baseDmg + speedProgress * 14); // 8 DMG -> up to 22 DMG

          // Trail intensity and opacity scale dynamically with speed
          const trailLife = 0.38 + speedProgress * 0.42;
          const trailOpacity = 0.28 + speedProgress * 0.57;

          trailPoints.push({
            x: ball.x,
            y: ball.y,
            radius: ball.radius * (0.82 + speedProgress * 0.14),
            color: speedProgress > 0.45 ? '#60a5fa' : '#2563eb',
            life: trailLife,
            baseLife: trailLife,
            maxAlpha: trailOpacity,
          });
        }

        if (ball.hitFlashTimer > 0) ball.hitFlashTimer = Math.max(0, ball.hitFlashTimer - safeDt * 1000);
        if (ball.healFlashTimer > 0) ball.healFlashTimer = Math.max(0, ball.healFlashTimer - safeDt * 1000);
        if (ball.hitShakeTimer > 0) ball.hitShakeTimer = Math.max(0, ball.hitShakeTimer - safeDt * 1000);
        if (ball.invulnerableTimer > 0) ball.invulnerableTimer = Math.max(0, ball.invulnerableTimer - safeDt * 1000);

        // Process Bleed Side Effect (queue-based damage ticks)
        if (ball.bleedTicksLeft > 0 && !ball.isDead) {
          ball.bleedTimer -= safeDt * 1000;
          if (ball.bleedTimer <= 0) {
            ball.bleedTicksLeft -= 1;
            ball.bleedTimer = 550; // next tick delay
            const tickDmg = (ball.bleedQueue && ball.bleedQueue.length > 0) ? ball.bleedQueue.shift() : 1;
            applyDamage(ball, tickDmg, ball.bleedSource || ball, false);
            spawnParticles(ball.x, ball.y, '#ef4444', 5, 0.9);
            spawnParticles(ball.x, ball.y, '#fb7185', 3, 0.7);
            sound.play('bleed', 0.8);
          }
        }

        // Process Burn Side Effect (queue-based true fire damage ticks: -2, -2, -1, -1)
        if (ball.burnTicksLeft > 0 && !ball.isDead) {
          ball.burnTimer -= safeDt * 1000;
          if (ball.burnTimer <= 0) {
            ball.burnTicksLeft -= 1;
            ball.burnTimer = 480; // next tick delay
            const tickDmg = (ball.burnQueue && ball.burnQueue.length > 0) ? ball.burnQueue.shift() : 1;
            applyDamage(ball, tickDmg, ball.burnSource || ball, false, true);

            // Searing flame particle burst
            spawnParticles(ball.x, ball.y, '#f97316', 7, 1.2);
            spawnParticles(ball.x, ball.y, '#fde047', 4, 1.4);
            spawnParticles(ball.x, ball.y, '#7c2d12', 3, 0.8);
            sound.play('fireballBurn', 0.85);
          }
        }

        if (ball.type === BALL_TYPES.SWORD) {
          if (ball.swordHitFreezeTimer > 0) {
            ball.swordHitFreezeTimer = Math.max(0, ball.swordHitFreezeTimer - safeDt * 1000);
          } else {
            ball.swordAngle = (ball.swordAngle + ball.swordSpeed) % (Math.PI * 2);
          }
        }

        // Knife Ball: Fast-turning combat knife
        if (ball.type === BALL_TYPES.KNIFE) {
          if (ball.knifeHitFreezeTimer > 0) {
            ball.knifeHitFreezeTimer = Math.max(0, ball.knifeHitFreezeTimer - safeDt * 1000);
          } else {
            ball.knifeAngle = (ball.knifeAngle + ball.knifeSpeed) % (Math.PI * 2);
          }
        }

        // Hammer Ball: Reversible rotating warhammer
        if (ball.type === BALL_TYPES.HAMMER) {
          if (ball.hammerHitFreezeTimer > 0) {
            ball.hammerHitFreezeTimer = Math.max(0, ball.hammerHitFreezeTimer - safeDt * 1000);
          } else {
            ball.hammerAngle = (ball.hammerAngle + ball.hammerSpeed) % (Math.PI * 2);
          }
        }

        // Spike Ball: Continuous smooth non-reversing spin (very slow)
        if (ball.type === BALL_TYPES.SPIKE) {
          ball.spikeAngle = ((ball.spikeAngle || 0) + 0.007) % (Math.PI * 2);
        }

        if (ball.shardTargetTimer > 0) {
          ball.shardTargetTimer = Math.max(0, ball.shardTargetTimer - safeDt * 1000);
        }

        // Shard Ball: Smooth spin of ready hovering crystal shards
        if (ball.type === BALL_TYPES.SHARD) {
          ball.shardAngle = ((ball.shardAngle || 0) + 0.035) % (Math.PI * 2);
        }

        // Gun Ball: Smooth spin of firearm barrel and 3-second cannon fire
        if (ball.type === BALL_TYPES.GUN && !ball.isDead && !ball.isDying && !isSoloWinner) {
          ball.gunAngle = ((ball.gunAngle || 0) + (ball.gunSpeed || 0.045)) % (Math.PI * 2);
          ball.gunCooldown = (ball.gunCooldown !== undefined ? ball.gunCooldown : 3000) - safeDt * 1000;
          if (ball.gunCooldown <= 0) {
            ball.gunCooldown = 3000;
            const muzzleDist = ball.radius + 20;
            const mx = ball.x + Math.cos(ball.gunAngle) * muzzleDist;
            const my = ball.y + Math.sin(ball.gunAngle) * muzzleDist;
            sound.play('bulletShot', 0.45);
            spawnParticles(mx, my, '#fbbf24', 8, 2.2);
            spawnParticles(mx, my, '#f97316', 5, 1.4);
            const bulletSpeed = 9.8;
            physicsRef.current.flyingBullets.push({
              x: mx,
              y: my,
              vx: Math.cos(ball.gunAngle) * bulletSpeed,
              vy: Math.sin(ball.gunAngle) * bulletSpeed,
              angle: ball.gunAngle,
              ownerId: ball.id,
              ownerTeam: ball.team,
              ownerBall: ball,
              damage: ball.config?.bulletDamage || 32,
              life: 2.5,
              radius: 5,
            });
          }
        }

        // Sniper Ball: Stops midair, locks precision laser onto target, and shoots
        if (ball.type === BALL_TYPES.SNIPER && !ball.isDead && !ball.isDying && !isSoloWinner) {
          if (ball.sniperCooldown === undefined) ball.sniperCooldown = 4000;
          if (ball.sniperState === undefined) ball.sniperState = 'roam';

          // Find nearest living enemy ball
          let nearestEnemy = null;
          let minEnemyDist = Infinity;
          physicsRef.current.balls.forEach(other => {
            if (other.team !== ball.team && !other.isDead && !other.isDying) {
              const d = Math.hypot(other.x - ball.x, other.y - ball.y);
              if (d < minEnemyDist) {
                minEnemyDist = d;
                nearestEnemy = other;
              }
            }
          });

          if (ball.sniperState === 'aiming') {
            // STOP MIDAIR: freezes in place while aiming and locking on
            ball.vx = 0;
            ball.vy = 0;

            if (nearestEnemy) {
              ball.targetBallId = nearestEnemy.id;
              ball.targetX = nearestEnemy.x;
              ball.targetY = nearestEnemy.y;

              const targetAngle = Math.atan2(nearestEnemy.y - ball.y, nearestEnemy.x - ball.x);
              let diff = (targetAngle - (ball.sniperAngle || 0)) % (Math.PI * 2);
              if (diff > Math.PI) diff -= Math.PI * 2;
              if (diff < -Math.PI) diff += Math.PI * 2;
              ball.sniperAngle = (ball.sniperAngle || 0) + diff * Math.min(1, safeDt * 14);
            }

            ball.sniperAimTimer -= safeDt * 1000;

            const scale = ball.radius / 38;
            const muzzleDist = ball.radius + 30 * scale;
            const mx = ball.x + Math.cos(ball.sniperAngle) * muzzleDist;
            const my = ball.y + Math.sin(ball.sniperAngle) * muzzleDist;

            if (Math.random() < 0.45) {
              spawnParticles(mx, my, '#38bdf8', 2, 1.0);
            }

            // SHOOT WHEN AIM IS COMPLETE!
            if (ball.sniperAimTimer <= 0) {
              ball.sniperState = 'roam';
              ball.sniperCooldown = ball.config?.sniperCooldown || 4000;

              const bulletSpeed = 19;
              physicsRef.current.flyingBullets.push({
                x: mx,
                y: my,
                vx: Math.cos(ball.sniperAngle) * bulletSpeed,
                vy: Math.sin(ball.sniperAngle) * bulletSpeed,
                angle: ball.sniperAngle,
                ownerId: ball.id,
                ownerTeam: ball.team,
                ownerBall: ball,
                damage: ball.config?.bulletDamage || 45,
                life: 2.2,
                radius: 6,
                isSniper: true,
              });

              spawnParticles(mx, my, '#38bdf8', 16, 3.0);
              spawnParticles(mx, my, '#ffffff', 8, 2.2);
              spawnParticles(mx, my, '#0284c7', 6, 1.8);

              // Recoil kickback!
              ball.vx = -Math.cos(ball.sniperAngle) * 3.6;
              ball.vy = -Math.sin(ball.sniperAngle) * 3.6;
            }
          } else {
            // Roaming state
            if (nearestEnemy) {
              const targetAngle = Math.atan2(nearestEnemy.y - ball.y, nearestEnemy.x - ball.x);
              let diff = (targetAngle - (ball.sniperAngle || 0)) % (Math.PI * 2);
              if (diff > Math.PI) diff -= Math.PI * 2;
              if (diff < -Math.PI) diff += Math.PI * 2;
              ball.sniperAngle = (ball.sniperAngle || 0) + diff * Math.min(1, safeDt * 4.0);
            } else {
              ball.sniperAngle = ((ball.sniperAngle || 0) + 0.02) % (Math.PI * 2);
            }

            ball.sniperCooldown -= safeDt * 1000;
            if (ball.sniperCooldown <= 0 && nearestEnemy) {
              // Trigger aim state & audio
              ball.sniperState = 'aiming';
              ball.sniperAimTimer = ball.config?.aimDuration || 1200;
              ball.vx = 0;
              ball.vy = 0;
              sound.play('sniperAimAndShoot', 0.95);
            }
          }
        }

        // Thorn Ball: Smooth spin of organic brambles
        if (ball.type === BALL_TYPES.THORN && !ball.isDead && !ball.isDying) {
          ball.thornAngle = ((ball.thornAngle || 0) + 0.02) % (Math.PI * 2);
        }

        // Grow Ball: Cooldown management and smooth post-separation expansion
        if (ball.growCooldown > 0) {
          ball.growCooldown = Math.max(0, ball.growCooldown - safeDt);
        }
        if (ball.growDelayTimer > 0) {
          ball.growDelayTimer = Math.max(0, ball.growDelayTimer - safeDt);
        } else if (ball.type === BALL_TYPES.GROW && ball.targetRadius && ball.radius < ball.targetRadius) {
          // Smoothly expand size AFTER hit separation so no collision overlap occurs
          const prevR = ball.radius;
          ball.radius = Math.min(ball.targetRadius, ball.radius + safeDt * 18);
          if (ball.targetMass && ball.mass < ball.targetMass) {
            ball.mass = Math.min(ball.targetMass, Math.round((ball.mass + safeDt * 2.4) * 10) / 10);
          }

          if (!ball.hasTriggeredGrowFx && ball.radius > prevR + 0.3) {
            ball.hasTriggeredGrowFx = true;
            spawnParticles(ball.x, ball.y, '#22c55e', 8, 1.8);
            sound.play('growing', 0.85);
          }

          if (ball.radius >= ball.targetRadius) {
            ball.mass = ball.targetMass;
          }
        }

        if (!isSoloWinner) {
          const curSpd = Math.hypot(ball.vx, ball.vy);
          const targetSpd = ball.speed;
          if (curSpd > 0.001) {
            const lerpedSpd = curSpd + (targetSpd - curSpd) * 0.04;
            ball.vx = (ball.vx / curSpd) * lerpedSpd;
            ball.vy = (ball.vy / curSpd) * lerpedSpd;
          }

          ball.x += ball.vx;
          ball.y += ball.vy;

          const minX = ball.radius;
          const maxX = CANVAS_SIZE - ball.radius;
          const minY = ball.radius;
          const maxY = CANVAS_SIZE - ball.radius;

          const checkPlantThornTrap = (wallSide, trapX, trapY) => {
            if (ball.type === BALL_TYPES.THORN && !ball.isDead && !ball.isDying) {
              if (!physicsRef.current.thornTraps) physicsRef.current.thornTraps = [];
              const traps = physicsRef.current.thornTraps;
              const isNear = traps.some(t => t.wallSide === wallSide && Math.hypot(t.x - trapX, t.y - trapY) < 36);
              if (!isNear) {
                const rand = Math.random();
                const sizeVariation = rand < 0.33 ? 'S' : (rand < 0.70 ? 'M' : 'L');
                const reach = sizeVariation === 'S' ? 42 : (sizeVariation === 'M' ? 68 : 96);
                const widthRadius = sizeVariation === 'S' ? 14 : (sizeVariation === 'M' ? 16 : 20);

                traps.push({
                  id: Math.random(),
                  x: trapX,
                  y: trapY,
                  wallSide,
                  team: ball.team,
                  owner: ball,
                  damage: 2,
                  reach,
                  widthRadius,
                  radius: widthRadius,
                  sizeVariation,
                  spawnProgress: 0,
                  cooldowns: {},
                });
                sound.play('thornSet', 0.8);
                sound.play('growing', 0.65);
                const pCount = sizeVariation === 'L' ? 16 : (sizeVariation === 'M' ? 11 : 8);
                spawnParticles(trapX, trapY, '#15803d', pCount, 1.8);
                spawnParticles(trapX, trapY, '#4ade80', pCount - 2, 1.4);
                spawnParticles(trapX, trapY, '#f43f5e', Math.round(pCount * 0.6), 1.2);
              }
            }
          };

          const playWallBounce = () => {
            if (ball.type === BALL_TYPES.FIRE) {
              sound.play('fireballHitWall', 0.9);
              spawnParticles(ball.x, ball.y, '#f97316', 5, 1.4);
              spawnParticles(ball.x, ball.y, '#fef08a', 3, 1.6);
            } else {
              sound.play('wallBounce', 0.55);
              spawnParticles(ball.x, ball.y, '#ffffff', 2, 0.4);
            }
          };

          if (ball.x < minX) {
            ball.x = minX;
            ball.vx = Math.abs(ball.vx);
            playWallBounce();
            checkPlantThornTrap('left', 2, ball.y);
          } else if (ball.x > maxX) {
            ball.x = maxX;
            ball.vx = -Math.abs(ball.vx);
            playWallBounce();
            checkPlantThornTrap('right', CANVAS_SIZE - 2, ball.y);
          }

          if (ball.y < minY) {
            ball.y = minY;
            ball.vy = Math.abs(ball.vy);
            playWallBounce();
            checkPlantThornTrap('top', ball.x, 2);
          } else if (ball.y > maxY) {
            ball.y = maxY;
            ball.vy = -Math.abs(ball.vy);
            playWallBounce();
            checkPlantThornTrap('bottom', ball.x, CANVAS_SIZE - 2);
          }
        }
      });

      if (spawnedSplitBalls.length > 0) {
        balls.push(...spawnedSplitBalls);
      }

      // Collisions
      for (let i = 0; i < activeBalls.length; i++) {
        for (let j = i + 1; j < activeBalls.length; j++) {
          const b1 = activeBalls[i];
          const b2 = activeBalls[j];

          const dx = b2.x - b1.x;
          const dy = b2.y - b1.y;
          const dist = Math.hypot(dx, dy);
          const minDist = b1.radius + b2.radius;

          if (dist < minDist && dist > 0.0001) {
            const nx = dx / dist;
            const ny = dy / dist;
            const overlap = minDist - dist;
            const m1 = b1.mass;
            const m2 = b2.mass;
            const totalMass = m1 + m2;

            b1.x -= nx * overlap * (m2 / totalMass);
            b1.y -= ny * overlap * (m2 / totalMass);
            b2.x += nx * overlap * (m1 / totalMass);
            b2.y += ny * overlap * (m1 / totalMass);

            const kx = b1.vx - b2.vx;
            const ky = b1.vy - b2.vy;
            const p = 2 * (nx * kx + ny * ky) / totalMass;

            b1.vx -= p * m2 * nx;
            b1.vy -= p * m2 * ny;
            b2.vx += p * m1 * nx;
            b2.vy += p * m1 * ny;

            if (b1.team !== b2.team) {
              const midX = (b1.x + b2.x) / 2;
              const midY = (b1.y + b2.y) / 2;
              spawnParticles(midX, midY, '#f97316', 5, 0.9);

              if (b1.type === BALL_TYPES.FIRE || b2.type === BALL_TYPES.FIRE) {
                sound.play('fireballHit', 0.95);

                // Fiery explosive impact shockwave animation
                if (!physicsRef.current.fireImpacts) physicsRef.current.fireImpacts = [];
                physicsRef.current.fireImpacts.push({
                  x: midX,
                  y: midY,
                  radius: 8,
                  maxRadius: Math.max(b1.radius, b2.radius) * 2.6,
                  life: 1.0,
                  decay: 0.04, // lasts ~350ms
                  rot: Math.random() * Math.PI * 2,
                });

                // Shower of 28 high-velocity explosive molten sparks
                for (let p = 0; p < 28; p++) {
                  const pAng = Math.random() * Math.PI * 2;
                  const pSpd = 2.0 + Math.random() * 4.5;
                  particles.push({
                    x: midX,
                    y: midY,
                    vx: Math.cos(pAng) * pSpd,
                    vy: Math.sin(pAng) * pSpd - 0.8,
                    life: 1.0,
                    decay: 0.035 + Math.random() * 0.03,
                    color: p % 3 === 0 ? '#ffffff' : (p % 3 === 1 ? '#fef08a' : '#f97316'),
                    size: Math.random() * 3.5 + 2.0,
                  });
                }
              } else if (b1.type === BALL_TYPES.ACCELERATOR || b2.type === BALL_TYPES.ACCELERATOR) {
                sound.play('acceleratorHit', 0.9);
              } else if (b1.type === BALL_TYPES.GROW || b2.type === BALL_TYPES.GROW) {
                sound.play('growHit', 0.85);
              } else if (b1.type === BALL_TYPES.FAST || b2.type === BALL_TYPES.FAST || b1.type === BALL_TYPES.MULTI || b2.type === BALL_TYPES.MULTI) {
                sound.play('fastballHit', 0.85);
              } else if (b1.type === BALL_TYPES.SPIKE || b2.type === BALL_TYPES.SPIKE) {
                sound.play('spikeHit', 0.9);
              } else {
                sound.play('bodyHit', 0.75);
              }

              // Grow Ball: grows on enemy collision (both hitting and getting hit by enemy)
              if (b1.type === BALL_TYPES.GROW && !b2.isDead && !b2.isDying) {
                triggerGrowBallExpansion(b1);
              }
              if (b2.type === BALL_TYPES.GROW && !b1.isDead && !b1.isDying) {
                triggerGrowBallExpansion(b2);
              }

              // Shard Ball: Shoots 6 consecutive homing shards at the locked enemy
              if (b1.type === BALL_TYPES.SHARD && !b2.isDead && !b2.isDying) {
                triggerShardBurst(b1, b2);
              }
              if (b2.type === BALL_TYPES.SHARD && !b1.isDead && !b1.isDying) {
                triggerShardBurst(b2, b1);
              }

              // Body hitbox deals lower damage (e.g. Sword ball body is 6 DMG)
              let dmgB1ToB2 = b1.damage;
              let dmgB2ToB1 = b2.damage;

              if (b1.type === BALL_TYPES.SPIKE) {
                dmgB1ToB2 += 4; // Initial puncture bonus
                // Inflict puncture bleed (unless victim has Armor immunity)
                const hasArmorImmunity = b2.hasArmor || b2.config?.hasArmor || b2.type === BALL_TYPES.STONE || b2.type === BALL_TYPES.SPIKE;
                if (!hasArmorImmunity) {
                  b2.bleedTicksLeft = 2;
                  b2.bleedTimer = 650; // ms between ticks
                  b2.bleedSource = b1;
                  b2.bleedQueue = [1, 1];
                } else {
                  spawnParticles(b2.x, b2.y, '#94a3b8', 6, 1.2);
                }
              }

              if (b2.type === BALL_TYPES.SPIKE) {
                dmgB2ToB1 += 4;
                const hasArmorImmunity = b1.hasArmor || b1.config?.hasArmor || b1.type === BALL_TYPES.STONE || b1.type === BALL_TYPES.SPIKE;
                if (!hasArmorImmunity) {
                  b1.bleedTicksLeft = 2;
                  b1.bleedTimer = 650;
                  b1.bleedSource = b2;
                  b1.bleedQueue = [1, 1];
                } else {
                  spawnParticles(b1.x, b1.y, '#94a3b8', 6, 1.2);
                }
              }

              // Thorn Ball: Direct body collision inflicts -2 -1 Bleed
              if (b1.type === BALL_TYPES.THORN && b1.team !== b2.team && !b2.isDead && !b2.isDying) {
                const hasArmorImmunity = b2.hasArmor || b2.config?.hasArmor || b2.type === BALL_TYPES.STONE || b2.type === BALL_TYPES.SPIKE;
                if (!hasArmorImmunity) {
                  b2.bleedTicksLeft = 2;
                  b2.bleedTimer = 550;
                  b2.bleedSource = b1;
                  b2.bleedQueue = [2, 1];
                  sound.play('thornHit', 0.8);
                } else {
                  spawnParticles(b2.x, b2.y, '#94a3b8', 6, 1.2);
                }
              }

              if (b2.type === BALL_TYPES.THORN && b2.team !== b1.team && !b1.isDead && !b1.isDying) {
                const hasArmorImmunity = b1.hasArmor || b1.config?.hasArmor || b1.type === BALL_TYPES.STONE || b1.type === BALL_TYPES.SPIKE;
                if (!hasArmorImmunity) {
                  b1.bleedTicksLeft = 2;
                  b1.bleedTimer = 550;
                  b1.bleedSource = b2;
                  b1.bleedQueue = [2, 1];
                  sound.play('thornHit', 0.8);
                } else {
                  spawnParticles(b1.x, b1.y, '#94a3b8', 6, 1.2);
                }
              }

              // Fire Ball: Direct body collision ignites enemy with extended Burn (-4, -3, -2, -1, -1, -1)
              if (b1.type === BALL_TYPES.FIRE && b1.team !== b2.team && b2.type !== BALL_TYPES.FIRE && !b2.isDead && !b2.isDying) {
                b2.burnTicksLeft = 6;
                b2.burnTimer = 480;
                b2.burnSource = b1;
                b2.burnQueue = [4, 3, 2, 1, 1, 1];
                spawnParticles(b2.x, b2.y, '#f97316', 10, 1.8);
                spawnParticles(b2.x, b2.y, '#fef08a', 6, 2.0);
              }

              if (b2.type === BALL_TYPES.FIRE && b2.team !== b1.team && b1.type !== BALL_TYPES.FIRE && !b1.isDead && !b1.isDying) {
                b1.burnTicksLeft = 6;
                b1.burnTimer = 480;
                b1.burnSource = b2;
                b1.burnQueue = [4, 3, 2, 1, 1, 1];
                spawnParticles(b1.x, b1.y, '#f97316', 10, 1.8);
                spawnParticles(b1.x, b1.y, '#fef08a', 6, 2.0);
              }

              applyDamage(b2, dmgB1ToB2, b1);
              applyDamage(b1, dmgB2ToB1, b2);
            }
          }

          if (b1.type === BALL_TYPES.SWORD && b1.team !== b2.team && !b2.isDead) {
            checkSwordHit(b1, b2);
          }
          if (b2.type === BALL_TYPES.SWORD && b2.team !== b1.team && !b1.isDead) {
            checkSwordHit(b2, b1);
          }

          if (b1.type === BALL_TYPES.KNIFE && b1.team !== b2.team && !b2.isDead) {
            checkKnifeHit(b1, b2);
          }
          if (b2.type === BALL_TYPES.KNIFE && b2.team !== b1.team && !b1.isDead) {
            checkKnifeHit(b2, b1);
          }

          if (b1.type === BALL_TYPES.HAMMER && b1.team !== b2.team && !b2.isDead) {
            checkHammerHit(b1, b2);
          }
          if (b2.type === BALL_TYPES.HAMMER && b2.team !== b1.team && !b1.isDead) {
            checkHammerHit(b2, b1);
          }
        }
      }

      // Update Shard Ball Bursts (fires 6 consecutive shards with 110ms intervals)
      const { shardBursts, flyingShards } = physicsRef.current;
      if (shardBursts && shardBursts.length > 0) {
        for (let i = shardBursts.length - 1; i >= 0; i--) {
          const sb = shardBursts[i];
          sb.timer -= safeDt * 1000;
          if (sb.timer <= 0) {
            sb.timer = sb.interval;
            sb.shardsLeft--;

            const target = sb.target;
            const attacker = balls.find(b => b.id === sb.attackerId) || null;
            const startX = attacker ? attacker.x : sb.originX;
            const startY = attacker ? attacker.y : sb.originY;

            // Firing trajectory towards target with subtle needle spread
            const dx = target.x - startX;
            const dy = target.y - startY;
            const baseAng = Math.atan2(dy, dx);
            const spread = (Math.random() - 0.5) * 0.4;
            const ang = baseAng + spread;
            const spd = 7.8;

            flyingShards.push({
              x: startX,
              y: startY,
              vx: Math.cos(ang) * spd,
              vy: Math.sin(ang) * spd,
              targetId: sb.targetId,
              target: target,
              attackerTeam: sb.attackerTeam,
              attacker: attacker,
              damage: 1,
              life: 2.2,
            });

            spawnParticles(startX, startY, '#c084fc', 4, 1.2);

            if (sb.shardsLeft <= 0) {
              shardBursts.splice(i, 1);
            }
          }
        }
      }

      // Update Flying Shard Projectiles (homing towards locked target)
      if (flyingShards && flyingShards.length > 0) {
        for (let i = flyingShards.length - 1; i >= 0; i--) {
          const fs = flyingShards[i];
          fs.life -= safeDt;

          const target = fs.target;
          if (target && !target.isDead && !target.isDying) {
            const tdx = target.x - fs.x;
            const tdy = target.y - fs.y;
            const targetDist = Math.hypot(tdx, tdy);

            if (targetDist < target.radius + 6) {
              // Shard hits the locked enemy!
              applyDamage(target, 1, fs.attacker || target, false);
              sound.play('shardHit', 0.9);
              spawnParticles(fs.x, fs.y, '#c084fc', 8, 1.5);
              spawnParticles(fs.x, fs.y, '#ffffff', 4, 1.0);
              flyingShards.splice(i, 1);
              continue;
            }

            // Smooth high-speed homing steering towards target
            const targetAng = Math.atan2(tdy, tdx);
            const curAng = Math.atan2(fs.vy, fs.vx);
            let diff = targetAng - curAng;
            while (diff < -Math.PI) diff += Math.PI * 2;
            while (diff > Math.PI) diff -= Math.PI * 2;
            const newAng = curAng + diff * 0.22;
            const spd = 8.6;
            fs.vx = Math.cos(newAng) * spd;
            fs.vy = Math.sin(newAng) * spd;
          }

          fs.x += fs.vx;
          fs.y += fs.vy;

          if (fs.life <= 0 || fs.x < 0 || fs.x > CANVAS_SIZE || fs.y < 0 || fs.y > CANVAS_SIZE) {
            spawnParticles(fs.x, fs.y, '#c084fc', 3, 0.6);
            flyingShards.splice(i, 1);
          }
        }
      }

      // Update Flying Bullets from Gun Ball
      const { flyingBullets } = physicsRef.current;
      if (flyingBullets && flyingBullets.length > 0) {
        for (let i = flyingBullets.length - 1; i >= 0; i--) {
          const fb = flyingBullets[i];
          fb.life -= safeDt;

          fb.x += fb.vx;
          fb.y += fb.vy;

          // Wall collision: bullet misses and ricochets / sparks on arena boundary
          const minW = fb.radius;
          const maxW = CANVAS_SIZE - fb.radius;
          if (fb.x <= minW || fb.x >= maxW || fb.y <= minW || fb.y >= maxW) {
            sound.play('bulletHitWall', 0.45);
            const hitX = Math.max(minW, Math.min(maxW, fb.x));
            const hitY = Math.max(minW, Math.min(maxW, fb.y));
            spawnParticles(hitX, hitY, '#fbbf24', 9, 2.0);
            spawnParticles(hitX, hitY, '#f97316', 6, 1.4);
            spawnParticles(hitX, hitY, '#ffffff', 4, 1.0);
            flyingBullets.splice(i, 1);
            continue;
          }

          // Enemy ball collision: bullet strikes enemy ball directly
          let hitEnemy = false;
          for (let bIdx = 0; bIdx < activeBalls.length; bIdx++) {
            const enemy = activeBalls[bIdx];
            if (enemy.team !== fb.ownerTeam && !enemy.isDead && !enemy.isDying) {
              const dist = Math.hypot(enemy.x - fb.x, enemy.y - fb.y);
              if (dist < enemy.radius + fb.radius) {
                // High-damage bullet impact!
                sound.play('bulletHit', 0.55);
                applyDamage(enemy, fb.damage, fb.ownerBall || enemy, true);

                // Heavy kinetic impulse
                const bAng = Math.atan2(fb.vy, fb.vx);
                const pushMag = 2.4;
                enemy.vx += Math.cos(bAng) * pushMag;
                enemy.vy += Math.sin(bAng) * pushMag;

                spawnParticles(fb.x, fb.y, '#f59e0b', 14, 2.2);
                spawnParticles(fb.x, fb.y, '#ef4444', 9, 1.6);
                spawnParticles(fb.x, fb.y, '#ffffff', 6, 1.2);

                flyingBullets.splice(i, 1);
                hitEnemy = true;
                break;
              }
            }
          }

          if (hitEnemy) continue;

          if (fb.life <= 0) {
            flyingBullets.splice(i, 1);
          }
        }
      }

      // Check broken glass shards on the arena floor vs enemy balls
      const shards = physicsRef.current.brokenShards;
      for (let sIdx = shards.length - 1; sIdx >= 0; sIdx--) {
        const shard = shards[sIdx];
        for (let bIdx = 0; bIdx < activeBalls.length; bIdx++) {
          const ball = activeBalls[bIdx];
          if (ball.team !== shard.team && !ball.isDead) {
            const dist = Math.hypot(ball.x - shard.x, ball.y - shard.y);
            if (dist < ball.radius + shard.radius) {
              // Enemy stepped on a broken glass shard
              applyDamage(ball, shard.damage || 8, shard.owner || ball, false);
              sound.play('glassDropHit', 0.9);

              // Inflict lingering Bleed on contact (unless enemy has Armor immunity)
              const hasArmorImmunity = ball.hasArmor || ball.config?.hasArmor || ball.type === BALL_TYPES.STONE || ball.type === BALL_TYPES.SPIKE;
              if (!hasArmorImmunity) {
                ball.bleedTicksLeft = 2;
                ball.bleedTimer = 650;
                ball.bleedSource = shard.owner || ball;
              }

              spawnParticles(shard.x, shard.y, '#67e8f9', 12, 1.8);
              spawnParticles(shard.x, shard.y, '#ef4444', 6, 1.2);

              // Shard is shattered & destroyed upon enemy contact
              shards.splice(sIdx, 1);
              break;
            }
          }
        }
      }

      // Check Thorns on the arena perimeter vs enemy balls
      const { thornTraps } = physicsRef.current;
      if (thornTraps && thornTraps.length > 0) {
        for (let tIdx = 0; tIdx < thornTraps.length; tIdx++) {
          const trap = thornTraps[tIdx];

          // Advance sprouting / growing animation
          if (trap.spawnProgress !== undefined && trap.spawnProgress < 1.0) {
            trap.spawnProgress = Math.min(1.0, trap.spawnProgress + safeDt * 3.2);
          }

          // Decrement tick cooldowns for each enemy ball that touched this trap
          if (trap.cooldowns) {
            Object.keys(trap.cooldowns).forEach(ballId => {
              if (trap.cooldowns[ballId] > 0) {
                trap.cooldowns[ballId] -= safeDt * 1000;
              }
            });
          } else {
            trap.cooldowns = {};
          }

          for (let bIdx = 0; bIdx < activeBalls.length; bIdx++) {
            const ball = activeBalls[bIdx];
            if (ball.team !== trap.team && !ball.isDead && !ball.isDying) {
              const activeReach = (trap.reach || 42) * Math.min(1.0, trap.spawnProgress !== undefined ? trap.spawnProgress : 1.0);
              let tipX = trap.x;
              let tipY = trap.y;
              if (trap.wallSide === 'left') tipX += activeReach;
              else if (trap.wallSide === 'right') tipX -= activeReach;
              else if (trap.wallSide === 'top') tipY += activeReach;
              else if (trap.wallSide === 'bottom') tipY -= activeReach;

              const dist = distToSegment(ball.x, ball.y, trap.x, trap.y, tipX, tipY);
              if (dist < ball.radius + (trap.widthRadius || 16)) {
                // Fire Ball incinerates and completely destroys the Thorn Trap on contact!
                if (ball.type === BALL_TYPES.FIRE) {
                  sound.play('fireballBurn', 0.95);
                  const hitMidX = (trap.x + tipX) / 2;
                  const hitMidY = (trap.y + tipY) / 2;
                  // Explosive incineration sparks & burnt charcoal ash
                  spawnParticles(hitMidX, hitMidY, '#f97316', 16, 2.0);
                  spawnParticles(hitMidX, hitMidY, '#fef08a', 8, 2.2);
                  spawnParticles(hitMidX, hitMidY, '#7c2d12', 8, 1.4); // burnt charcoal ash
                  spawnParticles(hitMidX, hitMidY, '#15803d', 6, 1.2); // scorched leaves

                  // Searing thermal blast wave
                  if (!physicsRef.current.fireImpacts) physicsRef.current.fireImpacts = [];
                  physicsRef.current.fireImpacts.push({
                    x: hitMidX,
                    y: hitMidY,
                    radius: 8,
                    maxRadius: 36,
                    life: 0.9,
                    decay: 0.045,
                    rot: Math.random() * Math.PI * 2,
                  });

                  // Destroy and remove the thorn trap from the arena
                  thornTraps.splice(tIdx, 1);
                  tIdx--;
                  break;
                }

                if (!trap.cooldowns[ball.id] || trap.cooldowns[ball.id] <= 0) {
                  trap.cooldowns[ball.id] = 420; // 420ms tick cooldown per enemy
                  applyDamage(ball, trap.damage || 2, trap.owner || ball, false);
                  sound.play('thornHit', 0.85);
                  const hitMidX = (trap.x + tipX) / 2;
                  const hitMidY = (trap.y + tipY) / 2;
                  spawnParticles(hitMidX, hitMidY, '#15803d', 8, 1.4);
                  spawnParticles(hitMidX, hitMidY, '#4ade80', 6, 1.0);
                  spawnParticles(hitMidX, hitMidY, '#f43f5e', 4, 0.9);
                  spawnParticles(ball.x, ball.y, '#ef4444', 4, 0.8);

                  // Wall thorns deal -1 -1 Bleed to enemy
                  const hasArmorImmunity = ball.hasArmor || ball.config?.hasArmor || ball.type === BALL_TYPES.STONE || ball.type === BALL_TYPES.SPIKE;
                  if (!hasArmorImmunity) {
                    ball.bleedTicksLeft = 2;
                    ball.bleedTimer = 550;
                    ball.bleedSource = trap.owner || ball;
                    ball.bleedQueue = [1, 1];
                  } else {
                    spawnParticles(ball.x, ball.y, '#94a3b8', 6, 1.2);
                  }
                }
              }
            }
          }
        }
      }
    };

    const checkSwordHit = (attacker, victim) => {
      const bladeLen = attacker.config?.bladeLength || BALL_CONFIGS[BALL_TYPES.SWORD].bladeLength;
      const bladeX = attacker.x + Math.cos(attacker.swordAngle) * bladeLen;
      const bladeY = attacker.y + Math.sin(attacker.swordAngle) * bladeLen;

      const d = Math.hypot(victim.x - bladeX, victim.y - bladeY);
      if (d < victim.radius + 10 && victim.invulnerableTimer <= 0) {
        // Blade hitbox deals high damage (22 DMG)
        const bladeDmg = attacker.config?.bladeDamage || 22;
        applyDamage(victim, bladeDmg, attacker, true);
        victim.invulnerableTimer = 220;

        const isArmored = victim.hasArmor || victim.config?.hasArmor || victim.type === BALL_TYPES.STONE || victim.type === BALL_TYPES.SPIKE;
        if (isArmored) {
          sound.play('swordHitToArmor', 0.9);
        } else {
          sound.play('swordHit', 0.9);
        }

        // Stopping animation: freeze sword spin for 100ms
        attacker.swordHitFreezeTimer = 100;
        
        // Reverse sword spin direction
        attacker.swordSpeed = -attacker.swordSpeed;

        const pushAng = attacker.swordAngle;
        victim.vx += Math.cos(pushAng) * 4.2;
        victim.vy += Math.sin(pushAng) * 4.2;
        spawnParticles(bladeX, bladeY, '#38bdf8', 8, 1.6);
      }
    };

    const checkKnifeHit = (attacker, victim) => {
      const knifeReach = (attacker.radius || 32) + (attacker.config?.knifeLength || 26) * 0.75;
      const knifeX = attacker.x + Math.cos(attacker.knifeAngle) * knifeReach;
      const knifeY = attacker.y + Math.sin(attacker.knifeAngle) * knifeReach;

      const d = Math.hypot(victim.x - knifeX, victim.y - knifeY);
      if (d < victim.radius + 8 && victim.invulnerableTimer <= 0) {
        // Knife blade deals 15 damage with rapid cadence
        const knifeDmg = attacker.config?.knifeDamage || 15;
        applyDamage(victim, knifeDmg, attacker, true);
        victim.invulnerableTimer = 180;

        const isArmored = victim.hasArmor || victim.config?.hasArmor || victim.type === BALL_TYPES.STONE || victim.type === BALL_TYPES.SPIKE;
        if (isArmored) {
          sound.play('swordHitToArmor', 0.85);
          spawnParticles(knifeX, knifeY, '#94a3b8', 6, 1.2);
        } else {
          sound.play('swordHit', 0.85);
          // Knife blade inflicts Bleed (-2, -1)
          victim.bleedTicksLeft = 2;
          victim.bleedTimer = 550;
          victim.bleedSource = attacker;
          victim.bleedQueue = [2, 1];
          sound.play('bleed', 0.8);
          spawnParticles(knifeX, knifeY, '#ef4444', 8, 1.5);
          spawnParticles(knifeX, knifeY, '#fb7185', 4, 1.1);
        }

        // Fast knife: brief 60ms freeze on hit, then reverse spin
        attacker.knifeHitFreezeTimer = 60;
        attacker.knifeSpeed = -attacker.knifeSpeed;

        const pushAng = attacker.knifeAngle;
        victim.vx += Math.cos(pushAng) * 3.2;
        victim.vy += Math.sin(pushAng) * 3.2;
      }
    };

    const checkHammerHit = (attacker, victim) => {
      const hammerLen = attacker.config?.hammerLength || BALL_CONFIGS[BALL_TYPES.HAMMER].hammerLength;
      const hammerX = attacker.x + Math.cos(attacker.hammerAngle) * hammerLen;
      const hammerY = attacker.y + Math.sin(attacker.hammerAngle) * hammerLen;

      const d = Math.hypot(victim.x - hammerX, victim.y - hammerY);
      if (d < victim.radius + 14 && victim.invulnerableTimer <= 0) {
        // Hammer head deals heavy strike damage (24 DMG)
        const hammerDmg = attacker.config?.hammerDamage || 24;
        applyDamage(victim, hammerDmg, attacker, true);
        victim.invulnerableTimer = 240;
        sound.play('hammerHit', 0.95);

        // Freeze hammer spin on impact for 110ms
        attacker.hammerHitFreezeTimer = 110;

        // Reverse hammer spin in opposite direction
        attacker.hammerSpeed = -attacker.hammerSpeed;

        // Massive Knockback: blasts the enemy back with heavy force (dampened if victim is Heavy)
        const isVictimHeavy = victim.type === BALL_TYPES.STONE || (victim.type === BALL_TYPES.GROW && (victim.mass || 1.0) >= 2.8);
        const pushAng = attacker.hammerAngle;
        const pushForce = isVictimHeavy ? 3.8 : 8.5;
        victim.vx += Math.cos(pushAng) * pushForce;
        victim.vy += Math.sin(pushAng) * pushForce;

        spawnParticles(hammerX, hammerY, '#f59e0b', 14, 2.2);
        spawnParticles(hammerX, hammerY, '#ffffff', 8, 1.6);
      }
    };

    const render = () => {
      const isLight = theme === 'light';
      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      // Only the solo champion's aura is rendered behind the canvas, so the canvas background is cleared for it
      const livingCount = physicsRef.current.balls.filter(b => !b.isDead && !b.isDying).length;
      const showAuraBehind = simState === 'concluded' && winnerTeam !== null && winnerTeam !== -1 && livingCount === 1;

      if (!showAuraBehind) {
        ctx.fillStyle = isLight ? '#f8fafc' : '#0a0b10';
        ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      }

      if (simState === 'planning') {
        const hasTeamMode = placedBalls.filter(b => b.team === TEAMS.BLUE.id).length > 1 || 
                            placedBalls.filter(b => b.team === TEAMS.RED.id).length > 1;

        if (hasTeamMode) {
          ctx.fillStyle = isLight ? 'rgba(37, 99, 235, 0.06)' : TEAMS.BLUE.bgTint;
          ctx.fillRect(0, 0, CANVAS_SIZE / 2, CANVAS_SIZE);

          ctx.fillStyle = isLight ? 'rgba(220, 38, 38, 0.06)' : TEAMS.RED.bgTint;
          ctx.fillRect(CANVAS_SIZE / 2, 0, CANVAS_SIZE / 2, CANVAS_SIZE);
        }

        ctx.strokeStyle = isLight ? '#cbd5e1' : '#2d3345';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(CANVAS_SIZE / 2, 0);
        ctx.lineTo(CANVAS_SIZE / 2, CANVAS_SIZE);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.font = '700 11px "JetBrains Mono", monospace';
        ctx.fillStyle = hasTeamMode ? (isLight ? '#2563eb' : 'rgba(59, 130, 246, 0.5)') : (isLight ? '#64748b' : 'rgba(255, 255, 255, 0.25)');
        ctx.fillText(hasTeamMode ? 'BLUE ZONE' : 'SIDE A', 18, 24);

        ctx.fillStyle = hasTeamMode ? (isLight ? '#dc2626' : 'rgba(239, 68, 68, 0.5)') : (isLight ? '#64748b' : 'rgba(255, 255, 255, 0.25)');
        ctx.textAlign = 'right';
        ctx.fillText(hasTeamMode ? 'RED ZONE' : 'SIDE B', CANVAS_SIZE - 18, 24);
        ctx.textAlign = 'left';
      }

      // Grid lines
      ctx.strokeStyle = isLight ? '#cbd5e1' : '#222634';
      ctx.lineWidth = 1;
      const gridSize = 32;
      for (let x = 0; x <= CANVAS_SIZE; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_SIZE);
        ctx.stroke();
      }
      for (let y = 0; y <= CANVAS_SIZE; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_SIZE, y);
        ctx.stroke();
      }

      // Major grid lines
      ctx.strokeStyle = isLight ? '#94a3b8' : '#2b3244';
      ctx.lineWidth = 1.3;
      for (let x = 0; x <= CANVAS_SIZE; x += gridSize * 4) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_SIZE);
        ctx.stroke();
      }
      for (let y = 0; y <= CANVAS_SIZE; y += gridSize * 4) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_SIZE, y);
        ctx.stroke();
      }

      // Draw motion trails for Fast Ball & Accelerator Ball (active matches only)
      if (simState !== 'planning' && physicsRef.current.trailPoints) {
        physicsRef.current.trailPoints.forEach(tp => {
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

      // Render ground fire patches left by Fire Ball (flat cel-shaded, cheap)
      if (simState !== 'planning' && physicsRef.current.fireTrails) {
        const fNow = performance.now() * 0.008;
        physicsRef.current.fireTrails.forEach(ft => {
          const alpha = Math.max(0, Math.min(1, ft.life));
          const flick = 1 + 0.12 * Math.sin(fNow + ft.flicker);
          const r = ft.radius * (0.45 + 0.55 * alpha) * flick;
          ctx.save();
          ctx.globalAlpha = alpha * 0.85;
          ctx.fillStyle = '#c2410c';
          ctx.beginPath();
          ctx.arc(ft.x, ft.y, r, 0, Math.PI * 2);
          ctx.fill();
          if (alpha > 0.35) {
            ctx.fillStyle = '#f97316';
            ctx.beginPath();
            ctx.arc(ft.x, ft.y - r * 0.15, r * 0.62, 0, Math.PI * 2);
            ctx.fill();
          }
          if (alpha > 0.65) {
            ctx.fillStyle = '#fde047';
            ctx.beginPath();
            ctx.arc(ft.x, ft.y - r * 0.25, r * 0.3, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        });
      }

      // Render broken glass shards left on the arena ground
      if (simState !== 'planning' && physicsRef.current.brokenShards) {
        physicsRef.current.brokenShards.forEach(s => {
          ctx.save();
          ctx.translate(s.x, s.y);
          ctx.rotate(s.rot);

          // Sharp angular glass crystal polygon
          ctx.beginPath();
          ctx.moveTo(-5, -6);
          ctx.lineTo(6, -4);
          ctx.lineTo(8, 5);
          ctx.lineTo(-2, 7);
          ctx.lineTo(-7, 2);
          ctx.closePath();

          ctx.fillStyle = isLight ? 'rgba(6, 182, 212, 0.45)' : 'rgba(103, 232, 249, 0.55)';
          ctx.fill();

          ctx.strokeStyle = isLight ? '#0891b2' : '#a5f3fc';
          ctx.lineWidth = 1.3;
          ctx.stroke();

          // Internal specular glint
          ctx.beginPath();
          ctx.moveTo(-3, -2);
          ctx.lineTo(3, 3);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.restore();
        });
      }

      // Render permanent Thorns on the arena perimeter (S, M, L variations) with growing animation
      if (simState !== 'planning' && physicsRef.current.thornTraps) {
        physicsRef.current.thornTraps.forEach(trap => {
          ctx.save();
          ctx.translate(trap.x, trap.y);

          // Rotate to face inward into the arena from the perimeter wall
          const angle = trap.wallSide === 'left' ? 0
            : (trap.wallSide === 'right' ? Math.PI
            : (trap.wallSide === 'top' ? Math.PI / 2 : -Math.PI / 2));
          ctx.rotate(angle);

          drawThornTrap(ctx, trap, isLight);

          ctx.restore();
        });
      }

      // Render active homing crystal shards from Shard Ball
      if (simState !== 'planning' && physicsRef.current.flyingShards) {
        physicsRef.current.flyingShards.forEach(fs => {
          ctx.save();
          ctx.translate(fs.x, fs.y);
          ctx.rotate(Math.atan2(fs.vy, fs.vx));

          // Outer purple crystal glow
          ctx.shadowColor = '#c084fc';
          ctx.shadowBlur = 10;

          // Needle-sharp crystal dart
          ctx.beginPath();
          ctx.moveTo(9, 0);
          ctx.lineTo(-4, -4);
          ctx.lineTo(-2, 0);
          ctx.lineTo(-4, 4);
          ctx.closePath();
          ctx.fillStyle = isLight ? '#7e22ce' : '#c084fc';
          ctx.fill();

          // Central white energy spine
          ctx.beginPath();
          ctx.moveTo(8, 0);
          ctx.lineTo(-2, 0);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.4;
          ctx.stroke();

          ctx.restore();
        });
      }

      // Render heavy flying bullets from Gun Ball & Sniper Ball
      if (simState !== 'planning' && physicsRef.current.flyingBullets) {
        physicsRef.current.flyingBullets.forEach(fb => {
          ctx.save();
          ctx.translate(fb.x, fb.y);
          ctx.rotate(Math.atan2(fb.vy, fb.vx));

          if (fb.isSniper) {
            // Electric supersonic cyan sniper tracer
            const tracerGrad = ctx.createLinearGradient(-36, 0, 0, 0);
            tracerGrad.addColorStop(0, 'rgba(56, 189, 248, 0)');
            tracerGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.7)');
            tracerGrad.addColorStop(1, '#ffffff');
            ctx.strokeStyle = tracerGrad;
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(-36, 0);
            ctx.lineTo(0, 0);
            ctx.stroke();

            // Armor-piercing projectile body
            ctx.shadowColor = '#38bdf8';
            ctx.shadowBlur = 10;
            ctx.fillStyle = '#f0f9ff';
            ctx.beginPath();
            ctx.moveTo(10, 0);
            ctx.lineTo(0, -3.5);
            ctx.lineTo(-9, -3.5);
            ctx.lineTo(-9, 3.5);
            ctx.lineTo(0, 3.5);
            ctx.closePath();
            ctx.fill();

            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 1.2;
            ctx.stroke();

            // Supersonic core glint
            ctx.fillStyle = '#38bdf8';
            ctx.beginPath();
            ctx.arc(4, 0, 2, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(5, 0, 1.2, 0, Math.PI * 2);
            ctx.fill();
          } else {
            // Bullet trail / fiery tracer streak
            const tracerGrad = ctx.createLinearGradient(-18, 0, 0, 0);
            tracerGrad.addColorStop(0, 'rgba(249, 115, 22, 0)');
            tracerGrad.addColorStop(0.5, 'rgba(251, 191, 36, 0.45)');
            tracerGrad.addColorStop(1, 'rgba(255, 255, 255, 0.95)');
            ctx.strokeStyle = tracerGrad;
            ctx.lineWidth = 3.5;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(-18, 0);
            ctx.lineTo(0, 0);
            ctx.stroke();

            // High-caliber brass bullet body
            ctx.shadowColor = '#f59e0b';
            ctx.shadowBlur = 8;
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.moveTo(6, 0);
            ctx.lineTo(0, -3.5);
            ctx.lineTo(-6, -3.5);
            ctx.lineTo(-6, 3.5);
            ctx.lineTo(0, 3.5);
            ctx.closePath();
            ctx.fill();

            // Copper jacket nose
            ctx.fillStyle = '#f97316';
            ctx.beginPath();
            ctx.arc(1, 0, 3, -Math.PI / 2, Math.PI / 2);
            ctx.fill();

            // Bright incandescent core
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(2, 0, 1.5, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.restore();
        });
      }

      // Render active Sniper Ball laser sights and lock-on reticles
      if (simState !== 'planning') {
        physicsRef.current.balls.forEach(b => {
          if (b.type === BALL_TYPES.SNIPER && b.sniperState === 'aiming' && !b.isDead && !b.isDying) {
            const scale = b.radius / 38;
            const muzzleDist = b.radius + 30 * scale;
            const mx = b.x + Math.cos(b.sniperAngle) * muzzleDist;
            const my = b.y + Math.sin(b.sniperAngle) * muzzleDist;
            const tx = b.targetX;
            const ty = b.targetY;

            ctx.save();
            // Intense laser sight line
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
            ctx.lineWidth = 1.8;
            ctx.shadowColor = '#0284c7';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.moveTo(mx, my);
            ctx.lineTo(tx, ty);
            ctx.stroke();

            // Inner laser bright beam
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(mx, my);
            ctx.lineTo(tx, ty);
            ctx.stroke();

            // Holographic targeting reticle centered on target
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.arc(tx, ty, 18, 0, Math.PI * 2);
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(tx, ty, 6, 0, Math.PI * 2);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(tx - 24, ty);
            ctx.lineTo(tx - 10, ty);
            ctx.moveTo(tx + 10, ty);
            ctx.lineTo(tx + 24, ty);
            ctx.moveTo(tx, ty - 24);
            ctx.lineTo(tx, ty - 10);
            ctx.moveTo(tx, ty + 10);
            ctx.lineTo(tx, ty + 24);
            ctx.stroke();

            ctx.restore();
          }
        });
      }

      const displayBalls = simState === 'planning' ? placedBalls : physicsRef.current.balls;

      if (simState !== 'planning') {
        physicsRef.current.particles.forEach(p => {
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.life);
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
      }

      displayBalls.forEach((ball) => {
        if (ball.isDead) return;

        let renderX = ball.x;
        let renderY = ball.y;
        let renderRadius = ball.radius;
        let isFlash = ball.hitFlashTimer > 0;

        // Dying state animation: violent critical jitter, pulsating overload glow, rapid warning flashes
        if (ball.isDying) {
          const deathProgress = 1 - Math.max(0, ball.deathTimer / (ball.deathMaxTimer || 620));
          const shakeIntensity = 2.5 + deathProgress * 6.5;
          renderX += (Math.random() - 0.5) * shakeIntensity * 2;
          renderY += (Math.random() - 0.5) * shakeIntensity * 2;

          // Pulsing / swelling core as energy overloads
          const pulse = Math.sin(deathProgress * Math.PI * 14) * (2 + deathProgress * 5);
          renderRadius = Math.max(8, ball.radius + pulse + deathProgress * 4);

          // Rapid flash: alternates white / red hot
          const flashPhase = Math.floor(deathProgress * 24) % 2 === 0;
          isFlash = flashPhase || deathProgress > 0.85;

          // Critical Overload Warning Aura around dying ball
          ctx.save();
          ctx.beginPath();
          ctx.arc(renderX, renderY, renderRadius + 4 + Math.random() * 5, 0, Math.PI * 2);
          ctx.fillStyle = flashPhase ? 'rgba(255, 255, 255, 0.45)' : 'rgba(239, 68, 68, 0.5)';
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 16 + deathProgress * 12;
          ctx.fill();
          ctx.restore();
        } else if (ball.hitShakeTimer > 0) {
          renderX += (Math.random() - 0.5) * 4;
          renderY += (Math.random() - 0.5) * 4;
        }

        // Heal pulse ring expanding outwards
        if (ball.healFlashTimer > 0) {
          const healProg = 1 - (ball.healFlashTimer / 350);
          ctx.save();
          ctx.beginPath();
          ctx.arc(renderX, renderY, renderRadius + healProg * 24, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(52, 211, 153, ${Math.max(0, 1 - healProg) * 0.85})`;
          ctx.lineWidth = Math.max(1.5, 3.5 * (1 - healProg));
          ctx.stroke();
          ctx.restore();
        }

        let currentRot = ball.angle || 0;
        if (simState !== 'planning') {
          if (ball.type === BALL_TYPES.FIRE) currentRot = ball.fireAngle || 0;
          else if (ball.type === BALL_TYPES.SPIKE) currentRot = ball.spikeAngle || 0;
          else if (ball.type === BALL_TYPES.HAMMER) currentRot = ball.hammerAngle || 0;
          else if (ball.type === BALL_TYPES.KNIFE) currentRot = ball.knifeAngle || 0;
          else if (ball.type === BALL_TYPES.SHARD) currentRot = ball.shardAngle || 0;
          else if (ball.type === BALL_TYPES.GUN) currentRot = ball.gunAngle || 0;
          else if (ball.type === BALL_TYPES.SNIPER) currentRot = ball.sniperAngle || 0;
          else if (ball.type === BALL_TYPES.THORN) currentRot = ball.thornAngle || 0;
          else if (ball.type === BALL_TYPES.MULTI) currentRot = ball.multiAngle || 0;
          else if (ball.type === BALL_TYPES.ACCELERATOR) currentRot = Math.atan2(ball.vy || 0, ball.vx || 1);
          else currentRot = ball.swordAngle || 0;
        }
        const config = ball.config || BALL_CONFIGS[ball.type];

        const hasTeamMode = (simState === 'planning' ? placedBalls : physicsRef.current.balls)
          .some((b, _, arr) => arr.filter(o => o.team === b.team).length > 1);

        const motionVec = simState === 'planning'
          ? { vx: 0, vy: 0 }
          : {
            vx: ball.vx || 0,
            vy: ball.vy || 0,
            history: ball.fireHistory || null,
            puffs: ball.firePuffs || null,
          };

        draw3DBall(
          ctx,
          renderX,
          renderY,
          renderRadius,
          config,
          hasTeamMode ? ball.teamColor : null,
          currentRot,
          isFlash,
          ball.shield || 0,
          theme,
          ball.missingNotches || [],
          motionVec
        );

        if (simState === 'planning') {
          const arrowLen = ball.radius + 24;
          const endX = renderX + Math.cos(ball.angle) * arrowLen;
          const endY = renderY + Math.sin(ball.angle) * arrowLen;

          ctx.save();
          ctx.strokeStyle = isLight ? '#0f172a' : '#ffffff';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(renderX, renderY);
          ctx.lineTo(endX, endY);
          ctx.stroke();

          const headLen = 8;
          const headAng = 0.5;
          ctx.fillStyle = isLight ? '#0f172a' : '#ffffff';
          ctx.beginPath();
          ctx.moveTo(endX, endY);
          ctx.lineTo(
            endX - headLen * Math.cos(ball.angle - headAng),
            endY - headLen * Math.sin(ball.angle - headAng)
          );
          ctx.lineTo(
            endX - headLen * Math.cos(ball.angle + headAng),
            endY - headLen * Math.sin(ball.angle + headAng)
          );
          ctx.closePath();
          ctx.fill();

          ctx.font = '600 10px "JetBrains Mono", monospace';
          ctx.fillStyle = isLight ? '#475569' : '#9ca3af';
          ctx.textAlign = 'center';
          ctx.fillText(ball.name, renderX, renderY - ball.radius - 8);
          ctx.restore();
        }

        // Only show live health bar while fighting; hide during dying delay or after match conclusion
        if ((simState === 'playing' || simState === 'paused') && !ball.isDying) {
          const barWidth = 46;
          const barHeight = 5;
          const barX = renderX - barWidth / 2;
          const barY = renderY - ball.radius - 10;
          const actualPercent = Math.max(0, ball.hp / ball.maxHp);
          const displayPercent = Math.max(0, (ball.displayHp ?? ball.hp) / ball.maxHp);

          ctx.save();
          ctx.fillStyle = isLight ? '#e2e8f0' : '#11131a';
          ctx.fillRect(barX, barY, barWidth, barHeight);

          if (displayPercent > actualPercent) {
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(barX, barY, barWidth * displayPercent, barHeight);
          }

          const dynamicColor = getHealthColor(actualPercent);
          ctx.fillStyle = dynamicColor;
          ctx.fillRect(barX, barY, barWidth * actualPercent, barHeight);

          if (ball.shield > 0) {
            ctx.fillStyle = '#38bdf8';
            const maxShield = ball.config?.shieldAmount || 20;
            const shieldWidth = Math.min(barWidth, (ball.shield / maxShield) * barWidth);
            ctx.fillRect(barX, barY - 3, shieldWidth, 2.5);

            // Vector Shield icon beside HP bar
            const iconX = barX - 9;
            const iconY = barY - 1;
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(iconX, iconY);
            ctx.lineTo(iconX + 6, iconY);
            ctx.lineTo(iconX + 6, iconY + 3.5);
            ctx.quadraticCurveTo(iconX + 6, iconY + 7, iconX + 3, iconY + 8.5);
            ctx.quadraticCurveTo(iconX, iconY + 7, iconX, iconY + 3.5);
            ctx.closePath();
            ctx.fillStyle = '#38bdf8';
            ctx.fill();
            ctx.strokeStyle = isLight ? '#0284c7' : '#e0f2fe';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Inner crest highlight
            ctx.beginPath();
            ctx.moveTo(iconX + 2, iconY + 2);
            ctx.lineTo(iconX + 3, iconY + 2);
            ctx.lineTo(iconX + 3, iconY + 6);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 0.8;
            ctx.stroke();
            ctx.restore();
          }

          ctx.strokeStyle = isLight ? '#94a3b8' : '#272a38';
          ctx.lineWidth = 0.8;
          ctx.strokeRect(barX, barY, barWidth, barHeight);

          // Steel Ball 4-hit barrier charge indicator on arena floor/canvas
          if (ball.type === BALL_TYPES.STEEL) {
            const pipsCount = 4;
            const currentHits = (ball.hitCount || 0) % 4;
            const pipW = (barWidth - (pipsCount - 1) * 2) / pipsCount;
            const pipH = 2.5;
            const pipY = barY + barHeight + 2;

            for (let p = 0; p < pipsCount; p++) {
              const px = barX + p * (pipW + 2);
              const isFilled = currentHits > p || (currentHits === 0 && (ball.hitCount || 0) > 0 && ball.shield > 0);
              ctx.fillStyle = isFilled ? '#38bdf8' : (isLight ? '#cbd5e1' : '#1e293b');
              ctx.fillRect(px, pipY, pipW, pipH);
              ctx.strokeStyle = isLight ? '#94a3b8' : '#334155';
              ctx.lineWidth = 0.5;
              ctx.strokeRect(px, pipY, pipW, pipH);
            }
          }

          // Gun Ball 3-second cannon reload bar on arena floor/canvas
          if (ball.type === BALL_TYPES.GUN) {
            const reloadBarH = 2.5;
            const reloadBarY = barY + barHeight + 2;
            const cooldown = ball.gunCooldown !== undefined ? ball.gunCooldown : 3000;
            const progress = Math.min(1, Math.max(0, (3000 - cooldown) / 3000));

            ctx.fillStyle = isLight ? '#cbd5e1' : '#1e293b';
            ctx.fillRect(barX, reloadBarY, barWidth, reloadBarH);

            ctx.fillStyle = '#f59e0b'; // tactical amber
            ctx.fillRect(barX, reloadBarY, barWidth * progress, reloadBarH);

            ctx.strokeStyle = isLight ? '#94a3b8' : '#334155';
            ctx.lineWidth = 0.5;
            ctx.strokeRect(barX, reloadBarY, barWidth, reloadBarH);
          }

          // Heal Ball 6-second self-heal cooldown bar on arena floor/canvas
          if (ball.type === BALL_TYPES.HEAL) {
            const healBarH = 2.5;
            const healBarY = barY + barHeight + 2;
            const interval = ball.config?.healInterval || 6000;
            const timer = ball.healTimer !== undefined ? ball.healTimer : interval;
            const progress = Math.min(1, Math.max(0, (interval - timer) / interval));

            ctx.fillStyle = isLight ? '#cbd5e1' : '#1e293b';
            ctx.fillRect(barX, healBarY, barWidth, healBarH);

            ctx.fillStyle = progress >= 1 ? '#34d399' : '#10b981';
            ctx.fillRect(barX, healBarY, barWidth * progress, healBarH);

            ctx.strokeStyle = isLight ? '#94a3b8' : '#334155';
            ctx.lineWidth = 0.5;
            ctx.strokeRect(barX, healBarY, barWidth, healBarH);
          }

          // Sniper Ball 4-second lock-on sniper cooldown / aim indicator on arena floor/canvas
          if (ball.type === BALL_TYPES.SNIPER) {
            const sniperBarH = 2.5;
            const sniperBarY = barY + barHeight + 2;
            const totalCd = 4000;
            const isAiming = ball.sniperState === 'aiming';
            const progress = isAiming
              ? 1.0
              : Math.min(1, Math.max(0, (totalCd - (ball.sniperCooldown !== undefined ? ball.sniperCooldown : totalCd)) / totalCd));

            ctx.fillStyle = isLight ? '#cbd5e1' : '#1e293b';
            ctx.fillRect(barX, sniperBarY, barWidth, sniperBarH);

            ctx.fillStyle = isAiming ? '#38bdf8' : (progress >= 1 ? '#7dd3fc' : '#0284c7');
            ctx.fillRect(barX, sniperBarY, barWidth * progress, sniperBarH);

            ctx.strokeStyle = isLight ? '#94a3b8' : '#334155';
            ctx.lineWidth = 0.5;
            ctx.strokeRect(barX, sniperBarY, barWidth, sniperBarH);
          }

          ctx.restore();
        }
      });

      // Confetti Render
      physicsRef.current.confetti.forEach(c => {
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(c.rotation);
        ctx.globalAlpha = Math.max(0, c.life);
        ctx.fillStyle = c.color;
        ctx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size * 0.6);
        ctx.restore();
      });

      // Render fiery impact blast animations
      if (simState !== 'planning' && physicsRef.current.fireImpacts) {
        physicsRef.current.fireImpacts.forEach(fi => {
          ctx.save();
          const alpha = Math.max(0, fi.life);
          ctx.globalAlpha = Math.min(1.0, alpha);

          // 1. Searing blast flash at epicenter
          const flashGrad = ctx.createRadialGradient(fi.x, fi.y, 0, fi.x, fi.y, fi.radius * 0.65);
          flashGrad.addColorStop(0, '#ffffff');
          flashGrad.addColorStop(0.35, 'rgba(254, 240, 138, 0.9)');
          flashGrad.addColorStop(0.7, 'rgba(249, 115, 22, 0.55)');
          flashGrad.addColorStop(1, 'rgba(220, 38, 38, 0)');
          ctx.fillStyle = flashGrad;
          ctx.beginPath();
          ctx.arc(fi.x, fi.y, fi.radius * 0.65, 0, Math.PI * 2);
          ctx.fill();

          // 2. Expanding fiery shockwave ring
          ctx.strokeStyle = `rgba(249, 115, 22, ${alpha * 0.85})`;
          ctx.lineWidth = Math.max(2, 6 * alpha);
          ctx.beginPath();
          ctx.arc(fi.x, fi.y, fi.radius, 0, Math.PI * 2);
          ctx.stroke();

          // 3. Inner golden heat ring
          ctx.strokeStyle = `rgba(254, 240, 138, ${alpha})`;
          ctx.lineWidth = Math.max(1, 2.5 * alpha);
          ctx.beginPath();
          ctx.arc(fi.x, fi.y, fi.radius * 0.85, 0, Math.PI * 2);
          ctx.stroke();

          // 4. Outward radiating flame blast spikes
          const rays = 10;
          for (let r = 0; r < rays; r++) {
            const rAng = fi.rot + (r * Math.PI * 2) / rays;
            const rLen = fi.radius * (1.1 + 0.3 * Math.sin(r * 2 + fi.rot));
            ctx.beginPath();
            ctx.moveTo(fi.x + Math.cos(rAng) * (fi.radius * 0.6), fi.y + Math.sin(rAng) * (fi.radius * 0.6));
            ctx.lineTo(fi.x + Math.cos(rAng) * rLen, fi.y + Math.sin(rAng) * rLen);
            ctx.strokeStyle = r % 2 === 0 ? `rgba(254, 240, 138, ${alpha})` : `rgba(249, 115, 22, ${alpha})`;
            ctx.lineWidth = Math.max(1.5, 3.5 * alpha);
            ctx.stroke();
          }

          ctx.restore();
        });
      }

      if (simState !== 'planning') {
        physicsRef.current.damageTexts.forEach(dt => {
          ctx.save();
          ctx.globalAlpha = Math.max(0, dt.life);
          ctx.font = `800 ${dt.fontSize}px "JetBrains Mono", monospace`;
          ctx.textAlign = 'center';
          if (isLight) {
            ctx.shadowColor = dt.isHeal ? 'rgba(16, 185, 129, 0.45)' : (dt.isBurn ? 'rgba(234, 88, 12, 0.45)' : 'rgba(0,0,0,0.18)');
            ctx.shadowBlur = (dt.isHeal || dt.isBurn) ? 6 : 4;
            ctx.fillStyle = dt.isHeal ? '#059669' : (dt.isShieldAbsorb ? '#0284c7' : (dt.isBurn ? '#c2410c' : (dt.isCritical ? '#b91c1c' : '#dc2626')));
          } else {
            ctx.shadowColor = dt.isHeal ? '#10b981' : (dt.isBurn ? '#ea580c' : '#000000');
            ctx.shadowBlur = (dt.isHeal || dt.isBurn) ? 8 : 6;
            ctx.fillStyle = dt.isHeal ? '#34d399' : (dt.isShieldAbsorb ? '#38bdf8' : (dt.isBurn ? '#f97316' : (dt.isCritical ? '#f87171' : '#ef4444')));
          }
          ctx.fillText(dt.text, dt.x, dt.y);
          ctx.restore();
        });
      }
    };

    const loop = (currentTime) => {
      const dt = (currentTime - physicsRef.current.lastTime) / 1000;
      physicsRef.current.lastTime = currentTime;

      if (physicsRef.current.running) {
        const steps = Math.min(3, Math.ceil(physicsRef.current.speedMultiplier));
        for (let s = 0; s < steps; s++) {
          updatePhysics((dt * physicsRef.current.speedMultiplier) / steps);
        }

        telemetrySyncTimer += dt;
        if (telemetrySyncTimer > 0.05) {
          telemetrySyncTimer = 0;
          setLiveBallsTelemetry([...physicsRef.current.balls]);
        }
      }

      // Continuous non-stop confetti on victory streaming inwards from left and right
      if (simState === 'concluded' && winnerTeam !== null && winnerTeam !== -1) {
        confettiTimer += dt;
        if (confettiTimer >= 0.18) {
          confettiTimer = 0;
          const active = physicsRef.current.balls.filter(b => !b.isDead);
          const champ = active[0];
          spawnVictoryConfetti(champ ? champ.x : CANVAS_SIZE / 2, champ ? champ.y : CANVAS_SIZE / 2, 7);
        }
      }

      render();
      animationId = requestAnimationFrame(loop);
    };

    physicsRef.current.lastTime = performance.now();
    animationId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(animationId);
  }, [simState, placedBalls, dragState, theme, winnerTeam]);

  return (
    <div className="sim-container" onContextMenu={(e) => e.preventDefault()}>
      {/* Top Navbar */}
      <nav className="sim-top-nav">
        <div className="sim-title-area">
          <span className="sim-app-title">BALL BATTLE SIMULATOR</span>
          <span className="badge-tag">TACTICAL SANDBOX</span>
        </div>

        <div className="sim-top-actions">
          {/* Question Mark Circle Button for Effects Codex */}
          <button
            className={`btn-help-circle ${showEffectsModal ? 'active' : ''}`}
            onClick={() => { setShowEffectsModal(true); sound.play('buttonClick'); }}
            onMouseEnter={() => sound.play('buttonHover', 0.25)}
            title="View Effects & Inflicts Info Codex"
            aria-label="View Effects and Inflicts Info"
          >
            ?
          </button>

          <button
            className={`btn-stats-toggle ${showStats ? 'active' : ''}`}
            onClick={toggleStats}
            onMouseEnter={() => sound.play('buttonHover', 0.25)}
            title={showStats ? 'Hide Unit Stats' : 'Show Unit Stats'}
          >
            <span>{showStats ? 'STATS: ON' : 'STATS: OFF'}</span>
          </button>

          <button className="btn-theme-toggle" onClick={toggleTheme} onMouseEnter={() => sound.play('buttonHover', 0.25)} title="Toggle Dark/Light Mode (Alt+P)">
            <span>{theme === 'dark' ? '☀ LIGHT MODE' : '☾ DARK MODE'}</span>
            <kbd className="kbd-shortcut">Alt+P</kbd>
          </button>

          <button
            className="btn-sound-toggle"
            onClick={toggleSound}
            onMouseEnter={() => sound.play('buttonHover', 0.25)}
            title={isMuted ? 'Unmute Audio (Alt+M)' : 'Mute Audio (Alt+M)'}
          >
            {isMuted ? <VolumeMuteIcon size={13} color="#ef4444" /> : <VolumeIcon size={13} color="currentColor" />}
            <span>{isMuted ? 'MUTED' : 'SFX: ON'}</span>
            <kbd className="kbd-shortcut">Alt+M</kbd>
          </button>

          <div className="sim-team-tallies">
            <div className="team-tally-item">
              <span className="tally-dot blue" style={{ display: isTeamMatch ? 'inline-block' : 'none' }}></span>
              <span style={{ color: isTeamMatch ? TEAMS.BLUE.color : 'inherit' }}>
                {rawBlueBalls.length <= 1 ? `Blue: ${blueBalls.filter(b => !b.isDead && !b.isDying).length}` : `Blue Team: ${blueBalls.filter(b => !b.isDead && !b.isDying).length}`}
              </span>
            </div>
            <div className="team-tally-item">
              <span className="tally-dot red" style={{ display: isTeamMatch ? 'inline-block' : 'none' }}></span>
              <span style={{ color: isTeamMatch ? TEAMS.RED.color : 'inherit' }}>
                {rawRedBalls.length <= 1 ? `Red: ${redBalls.filter(b => !b.isDead && !b.isDying).length}` : `Red Team: ${redBalls.filter(b => !b.isDead && !b.isDying).length}`}
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Effects & Inflicts Modal Popup */}
      {showEffectsModal && (
        <div
          className="modal-backdrop"
          onClick={() => setShowEffectsModal(false)}
          role="dialog"
          aria-modal="true"
        >
          <div className="effects-modal-card" onClick={e => e.stopPropagation()}>
            <div className="effects-modal-header">
              <div className="effects-modal-title-group">
                <span className="effects-modal-title">EFFECTS, STATUSES & WEAPONS CODEX</span>
                <span className="effects-modal-subtitle">Comprehensive guide to abilities, combat modifiers & weapons</span>
              </div>
              <button
                className="effects-modal-close"
                onClick={() => { setShowEffectsModal(false); sound.play('buttonClick'); }}
                onMouseEnter={() => sound.play('buttonHover', 0.25)}
                title="Close Modal"
              >
                ✕
              </button>
            </div>

            <div className="effects-modal-body">
              {/* Category 1: Status Tags (Debuffs & Inflictions) */}
              <div className="effects-modal-section">
                <div className="effects-section-title">
                  <span className="title-tag status-tag">STATUS TAGS</span>
                  <span>Debuffs & Lingering Combat Statuses</span>
                </div>

                <div className="effects-table-wrapper">
                  <table className="effects-codex-table">
                    <thead>
                      <tr>
                        <th className="col-status-tag">Status Tag</th>
                        <th className="col-source">Source</th>
                        <th className="col-description">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="row-inflict">
                        <td className="col-status-tag">
                          <span
                            className="chip-badge badge-inflict"
                            onMouseEnter={(e) => showTooltip(e, 'BLEED')}
                            onMouseLeave={hideTooltip}
                          >
                            <BleedIcon size={13} color="#ef4444" /> BLEED
                          </span>
                        </td>
                        <td className="col-source">Spike Ball / Glass Shard</td>
                        <td className="col-description">
                          Lingering puncture bleed dealing <strong>1 and 1 damage</strong> across consecutive delay ticks. Inflicted on contact by Spike Ball collision or stepping on Glass Shards.
                        </td>
                      </tr>
                      <tr className="row-inflict">
                        <td className="col-status-tag">
                          <span
                            className="chip-badge badge-inflict"
                            onMouseEnter={(e) => showTooltip(e, 'KNOCKBACK')}
                            onMouseLeave={hideTooltip}
                          >
                            <KnockbackIcon size={13} color="#f97316" /> KNOCKBACK
                          </span>
                        </td>
                        <td className="col-source">Hammer Ball Strike</td>
                        <td className="col-description">
                          Blasts struck units away with massive kinetic impulse force, disrupting enemy formation and launching targets across the arena floor.
                        </td>
                      </tr>

                      <tr className="row-inflict">
                        <td className="col-status-tag">
                          <span
                            className="chip-badge badge-inflict"
                            onMouseEnter={(e) => showTooltip(e, 'SHARD_TARGET')}
                            onMouseLeave={hideTooltip}
                          >
                            <ShardTargetIcon size={13} color="#a855f7" /> SHARD TARGET
                          </span>
                        </td>
                        <td className="col-source">Shard Ball Strike</td>
                        <td className="col-description">
                          Locked by an enemy Shard Ball, targeted by a barrage of <strong>6 consecutive homing shards</strong> dealing <strong>1 damage</strong> each.
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Category 2: Effect Tags (Passives & Modifiers) */}
              <div className="effects-modal-section">
                <div className="effects-section-title">
                  <span className="title-tag effect-tag">EFFECT TAGS</span>
                  <span>Ball Characteristics, Passives & Defensive Traits</span>
                </div>

                <div className="effects-table-wrapper">
                  <table className="effects-codex-table">
                    <thead>
                      <tr>
                        <th className="col-status-tag">Effect Tag</th>
                        <th className="col-source">Source</th>
                        <th className="col-description">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="col-status-tag">
                          <span
                            className="chip-badge badge-shield"
                            onMouseEnter={(e) => showTooltip(e, 'SHIELD')}
                            onMouseLeave={hideTooltip}
                          >
                            <ShieldIcon size={13} color="#0284c7" /> SHIELD
                          </span>
                        </td>
                        <td className="col-source">Steel Ball Passive</td>
                        <td className="col-description">
                          Generates a separate <strong>+20 Shield line</strong> above the health bar every 4 hits taken. Absorbs all incoming damage before HP is reduced.
                        </td>
                      </tr>

                      <tr>
                        <td className="col-status-tag">
                          <span
                            className="chip-badge badge-brittle"
                            onMouseEnter={(e) => showTooltip(e, 'BRITTLE')}
                            onMouseLeave={hideTooltip}
                          >
                            <BrittleIcon size={13} color="#06b6d4" /> BRITTLE
                          </span>
                        </td>
                        <td className="col-source">Glass Ball Trait</td>
                        <td className="col-description">
                          Taking damage physically chips and breaks the ball body, dropping sharp glass shards on the arena floor that persist upon death and shatter when enemy balls step on them to deal 8 damage + Bleed.
                        </td>
                      </tr>

                      <tr>
                        <td className="col-status-tag">
                          <span
                            className="chip-badge badge-heavy"
                            onMouseEnter={(e) => showTooltip(e, 'HEAVY')}
                            onMouseLeave={hideTooltip}
                          >
                            <HeavyIcon size={13} color="#f59e0b" /> HEAVY
                          </span>
                        </td>
                        <td className="col-source">Stone Ball & Grow Ball (2.8+ Size)</td>
                        <td className="col-description">
                          Reinforced heavy frame providing high knockback resistance, dampening collision rebound forces to maintain battlefield positioning. Innate on Stone Ball (<strong>2.6 mass, +30% Max HP</strong>), and unlocked by Grow Ball once reaching <strong>2.8 mass and above</strong>.
                        </td>
                      </tr>

                      <tr>
                        <td className="col-status-tag">
                          <span
                            className="chip-badge badge-armor"
                            onMouseEnter={(e) => showTooltip(e, 'ARMOR')}
                            onMouseLeave={hideTooltip}
                          >
                            <ArmorIcon size={13} color="#0284c7" /> ARMOR
                          </span>
                        </td>
                        <td className="col-source">Stone Ball / Spike Ball</td>
                        <td className="col-description">
                          Hardened defensive plating provides <strong>Bleed Immunity</strong>, completely preventing puncture bleed status when struck by Spike Balls or Glass Shards.
                        </td>
                      </tr>

                      <tr>
                        <td className="col-status-tag">
                          <span
                            className="chip-badge badge-rapid"
                            onMouseEnter={(e) => showTooltip(e, 'RAPID')}
                            onMouseLeave={hideTooltip}
                          >
                            <RapidIcon size={13} color="#10b981" /> RAPID
                          </span>
                        </td>
                        <td className="col-source">Fast Ball / Accelerator Ball</td>
                        <td className="col-description">
                          High skirmish velocity (<strong>3.6 speed</strong>). Rebounds rapidly around the arena leaving faint, semi-transparent ghost trails in its wake.
                        </td>
                      </tr>

                      <tr>
                        <td className="col-status-tag">
                          <span
                            className="chip-badge badge-accelerate"
                            onMouseEnter={(e) => showTooltip(e, 'ACCELERATE')}
                            onMouseLeave={hideTooltip}
                          >
                            <AccelerateIcon size={13} color="#3b82f6" /> ACCELERATE
                          </span>
                        </td>
                        <td className="col-source">Accelerator Ball Trait</td>
                        <td className="col-description">
                          Continuously accelerates over time the longer the battle endures (<strong>up to 12.0 max speed</strong>). As speed increases, kinetic collision damage escalates dynamically from <strong>8 up to 22 DMG</strong> while projecting luminous kinetic motion trails.
                        </td>
                      </tr>

                      <tr>
                        <td className="col-status-tag">
                          <span
                            className="chip-badge badge-grow"
                            onMouseEnter={(e) => showTooltip(e, 'GROW')}
                            onMouseLeave={hideTooltip}
                          >
                            <GrowIcon size={13} color="#22c55e" /> SIZE GROW
                          </span>
                        </td>
                        <td className="col-source">Grow Ball Trait</td>
                        <td className="col-description">
                          Every time it collides with an enemy ball, it absorbs impact energy and physically expands in size and mass (<strong>up to 6.0 max mass</strong>), gaining the <strong>Heavy Effect</strong> once reaching 2.8+ mass.
                        </td>
                      </tr>

                      <tr>
                        <td className="col-status-tag">
                          <span
                            className="chip-badge badge-shard"
                            onMouseEnter={(e) => showTooltip(e, 'SHARD')}
                            onMouseLeave={hideTooltip}
                          >
                            <ShardIcon size={13} color="#a855f7" /> SHARD
                          </span>
                        </td>
                        <td className="col-source">Shard Ball Trait</td>
                        <td className="col-description">
                          Upon hitting an enemy, locks onto the target and shoots <strong>6 consecutive homing crystal shards</strong> dealing <strong>1 damage</strong> per shard.
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Category 3: Weapon Tags (Rotating Blades, Hammers & Spikes) */}
              <div className="effects-modal-section">
                <div className="effects-section-title">
                  <span className="title-tag weapon-tag">WEAPON TAGS</span>
                  <span>Active Weapons, Rotating Blades & Accessories</span>
                </div>

                <div className="effects-table-wrapper">
                  <table className="effects-codex-table">
                    <thead>
                      <tr>
                        <th className="col-status-tag">Weapon Tag</th>
                        <th className="col-source">Source</th>
                        <th className="col-description">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="col-status-tag">
                          <span
                            className="chip-badge badge-blade"
                            onMouseEnter={(e) => showTooltip(e, 'BLADE')}
                            onMouseLeave={hideTooltip}
                          >
                            <BladeIcon size={13} color="#dc2626" /> BLADE
                          </span>
                        </td>
                        <td className="col-source">Sword Ball Accessory</td>
                        <td className="col-description">
                          Spinning sword blade deals a lethal <strong>22 damage</strong> on contact (versus 6 body bump damage), triggers a 100ms hit-stop animation, and reverses spin direction.
                        </td>
                      </tr>

                      <tr>
                        <td className="col-status-tag">
                          <span
                            className="chip-badge badge-hammer"
                            onMouseEnter={(e) => showTooltip(e, 'HAMMER')}
                            onMouseLeave={hideTooltip}
                          >
                            <HammerIcon size={13} color="#b91c1c" /> HAMMER
                          </span>
                        </td>
                        <td className="col-source">Hammer Ball Accessory</td>
                        <td className="col-description">
                          Heavy rotating warhammer delivering devastating <strong>24 strike damage</strong>, freezing on impact, and reversing spin direction while blasting targets with massive Knockback.
                        </td>
                      </tr>

                      <tr>
                        <td className="col-status-tag">
                          <span
                            className="chip-badge badge-spikes"
                            onMouseEnter={(e) => showTooltip(e, 'SPIKES')}
                            onMouseLeave={hideTooltip}
                          >
                            <SpikesIcon size={13} color="#8b5cf6" /> SPIKES
                          </span>
                        </td>
                        <td className="col-source">Spike Ball Accessory</td>
                        <td className="col-description">
                          Perimeter studs deal heavy <strong>15 collision damage</strong> and immediately inflict the lingering Puncture Bleed debuff onto target.
                        </td>
                      </tr>

                      <tr>
                        <td className="col-status-tag">
                          <span
                            className="chip-badge badge-gun"
                            onMouseEnter={(e) => showTooltip(e, 'GUN')}
                            onMouseLeave={hideTooltip}
                          >
                            <GunIcon size={13} color="#f59e0b" /> GUN
                          </span>
                        </td>
                        <td className="col-source">Gun Ball Weapon</td>
                        <td className="col-description">
                          Equipped with a rotating firearm barrel and targeting laser that shoots a heavy high-caliber bullet every <strong>3 seconds</strong> directly towards where its barrel points. Bullets deal a massive <strong>32 damage</strong> on contact, or ricochet with sparks off arena walls.
                        </td>
                      </tr>

                      <tr>
                        <td className="col-status-tag">
                          <span
                            className="chip-badge badge-thorn"
                            onMouseEnter={(e) => showTooltip(e, 'THORN')}
                            onMouseLeave={hideTooltip}
                          >
                            <ThornIcon size={13} color="#22c55e" /> THORNS
                          </span>
                        </td>
                        <td className="col-source">Thorn Ball Ability</td>
                        <td className="col-description">
                          Direct body contact inflicts <strong>-2 -1 Bleed</strong>. Whenever the ball impacts arena walls, it sprouts permanent creeping floral Thorns in 3 size variations (S, M, L) that deal <strong>2 damage</strong> and inflict <strong>-1 -1 Bleed</strong> to enemies.
                        </td>
                      </tr>

                      <tr>
                        <td className="col-status-tag">
                          <span
                            className="chip-badge badge-split"
                            onMouseEnter={(e) => showTooltip(e, 'SPLIT')}
                            onMouseLeave={hideTooltip}
                          >
                            <SplitIcon size={13} color="#d946ef" /> SPLIT
                          </span>
                        </td>
                        <td className="col-source">Multi Ball Ability</td>
                        <td className="col-description">
                          Acts like a Fast Ball with half HP (<strong>50 HP</strong>). Upon death, splits into 2 mini copies with <strong>25 HP Full</strong> each, which subsequently split into 2 micro copies with <strong>10 HP Full</strong> each when defeated.
                        </td>
                      </tr>

                      <tr>
                        <td className="col-status-tag">
                          <span
                            className="chip-badge badge-flaming"
                            onMouseEnter={(e) => showTooltip(e, 'FLAMING')}
                            onMouseLeave={hideTooltip}
                          >
                            <FlameIcon size={13} color="#f97316" /> FLAMING
                          </span>
                        </td>
                        <td className="col-source">Fire Ball Innate Trait</td>
                        <td className="col-description">
                          Self-imbued fiery aura radiating heat. Radiates dynamic directional flames, leaves a burning ground trail, ignites struck enemies with Burn, and incinerates enemy Thorn Traps on contact.
                        </td>
                      </tr>

                      <tr>
                        <td className="col-status-tag">
                          <span
                            className="chip-badge badge-burn"
                            onMouseEnter={(e) => showTooltip(e, 'BURN')}
                            onMouseLeave={hideTooltip}
                          >
                            <BurnIcon size={13} color="#f97316" /> BURN
                          </span>
                        </td>
                        <td className="col-source">Fire Ball Ability</td>
                        <td className="col-description">
                          Striking an enemy ignites them with <strong>Burn (-2, -2, -1, -1)</strong>, dealing 4 consecutive ticks of true fire damage. Unlike puncture bleed, Burn bypasses armor bleed immunity.
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="effects-modal-footer">
              <span className="footer-note">Press ESC or click outside to dismiss</span>
              <button
                className="btn-modal-done"
                onClick={() => { setShowEffectsModal(false); sound.play('buttonClick'); }}
                onMouseEnter={() => sound.play('buttonHover', 0.25)}
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tactical Alert Modal Popup */}
      {alertModal && (
        <div
          className="modal-backdrop"
          onClick={() => { setAlertModal(null); sound.play('buttonClick'); }}
          role="dialog"
          aria-modal="true"
        >
          <div className="tactical-alert-card" onClick={e => e.stopPropagation()}>
            <div className="tactical-alert-header">
              <div className="tactical-alert-title-row">
                <span className="tactical-alert-icon-wrap">
                  <AlertTriangleIcon size={16} color="#f59e0b" />
                </span>
                <span className="tactical-alert-title">{alertModal.title}</span>
              </div>
              <button
                className="tactical-alert-close"
                onClick={() => { setAlertModal(null); sound.play('buttonClick'); }}
                onMouseEnter={() => sound.play('buttonHover', 0.25)}
                title="Dismiss"
              >
                ✕
              </button>
            </div>

            <div className="tactical-alert-body">
              <p className="tactical-alert-message">{alertModal.message}</p>
              
              <div className="tactical-alert-hint-box">
                <div className="tactical-alert-hint-item">
                  <span className="tactical-alert-hint-dot blue" />
                  <span>{alertModal.tipBlue}</span>
                </div>
                <div className="tactical-alert-hint-item">
                  <span className="tactical-alert-hint-dot red" />
                  <span>{alertModal.tipRed}</span>
                </div>
              </div>
            </div>

            <div className="tactical-alert-footer">
              <button
                className="btn-alert-confirm"
                onClick={() => { setAlertModal(null); sound.play('buttonClick'); }}
                onMouseEnter={() => sound.play('buttonHover', 0.25)}
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="sim-body">
        
        {/* LEFT COLUMN: Ball Selector */}
        <aside className="sim-sidebar">
          <div className="sidebar-header">
            <span className="sidebar-title">BALL ARSENAL</span>
            
            <div className="sidebar-header-actions">
              <div className="filter-dropdown-container">
                <button
                  className={`btn-filter-trigger ${rarityFilter !== 'ALL' ? 'active-filter' : ''}`}
                  onClick={() => { setShowFilterDropdown(prev => !prev); sound.play('buttonClick'); }}
                  onMouseEnter={() => sound.play('buttonHover', 0.25)}
                  title="Filter arsenal by rarity"
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: '-1px' }}>
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                  </svg>
                  <span>{rarityFilter === 'ALL' ? 'FILTER' : rarityFilter.toUpperCase()}</span>
                </button>

                {showFilterDropdown && (
                  <div className="filter-popup-menu">
                    <div className="filter-popup-header">FILTER BY RARITY</div>
                    <button
                      className={`filter-popup-option ${rarityFilter === 'ALL' ? 'selected' : ''}`}
                      onClick={() => { setRarityFilter('ALL'); setShowFilterDropdown(false); sound.play('buttonClick'); }}
                      onMouseEnter={() => sound.play('buttonHover', 0.25)}
                    >
                      <span>All Rarities</span>
                      <span className="count-tag">{Object.keys(BALL_CONFIGS).length}</span>
                    </button>
                    {Object.values(RARITIES).map(r => {
                      const count = Object.values(BALL_CONFIGS).filter(b => b.rarity === r).length;
                      if (count === 0) return null;
                      return (
                        <button
                          key={r}
                          className={`filter-popup-option ${rarityFilter === r ? 'selected' : ''}`}
                          onClick={() => { setRarityFilter(r); setShowFilterDropdown(false); sound.play('buttonClick'); }}
                          onMouseEnter={() => sound.play('buttonHover', 0.25)}
                        >
                          <span className={`rarity-dot ${r.toLowerCase()}`}></span>
                          <span>{r}</span>
                          <span className="count-tag">{count}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <span className="badge-tag">{placedBalls.length} TOTAL</span>
            </div>
          </div>

          <div className="sidebar-sub-hint">
            Drop anywhere on Left for Side A, Right for Side B. Drag to point trajectory.
          </div>

          <div className="sidebar-ball-list">
            {Object.values(BALL_CONFIGS)
              .filter(ball => rarityFilter === 'ALL' || ball.rarity === rarityFilter)
              .sort((a, b) => {
                const orderA = RARITY_ORDER.indexOf(a.rarity);
                const orderB = RARITY_ORDER.indexOf(b.rarity);
                if (orderA !== orderB) return orderA - orderB;
                return 0;
              })
              .map(ball => {
              const isSelected = selectedBallType === ball.id;
              return (
                <div
                  key={ball.id}
                  className={`ball-card-row ${isSelected ? 'selected' : ''}`}
                  onClick={() => { setSelectedBallType(ball.id); sound.play('buttonClick'); }}
                  onMouseEnter={() => sound.play('buttonHover', 0.25)}
                >
                  <BallThumbnailPreview config={ball} theme={theme} />

                  <div className="ball-card-details">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="ball-name-title">{ball.name}</span>
                      <span className={`ball-rarity-pill ${ball.rarity.toLowerCase()}`}>
                        {ball.rarity}
                      </span>
                    </div>
                    <div className="ball-stat-sub">
                      <span>{ball.baseHp} HP</span> · <span>{ball.damage} DMG</span> · <span>{ball.speed} SPD</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="sidebar-footer">
            <div className="battle-action-row">
              {simState === 'planning' ? (
                <button
                  className="btn-icon-action btn-play"
                  onClick={launchBattle}
                  onMouseEnter={() => sound.play('buttonHover', 0.25)}
                >
                  Start Battle
                </button>
              ) : (
                <button
                  className="btn-icon-action btn-pause"
                  onClick={togglePause}
                  onMouseEnter={() => sound.play('buttonHover', 0.25)}
                >
                  {simState === 'playing' ? 'Pause' : 'Resume'}
                </button>
              )}
              <button
                className="btn-icon-action btn-clear"
                onClick={simState === 'planning' ? clearAllBalls : resetToPlanning}
                onMouseEnter={() => sound.play('buttonHover', 0.25)}
              >
                {simState === 'planning' ? 'Clear' : 'Edit'}
              </button>
            </div>

            <div className="speed-control-group">
              <span className="speed-txt">SIM SPEED</span>
              <div className="speed-btns">
                {[0.5, 1.0, 1.5, 2.0].map(spd => (
                  <button
                    key={spd}
                    className={`spd-btn ${speedMultiplier === spd ? 'active' : ''}`}
                    onClick={() => { setSpeedMultiplier(spd); sound.play('buttonClick'); }}
                    onMouseEnter={() => sound.play('buttonHover', 0.25)}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* RIGHT COLUMN: Arena Area */}
        <main
          className="sim-arena-area"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <div className="arena-floating-banner">
            {simState === 'planning' ? (
              <>
                <span className="banner-instruction">Left-Click:</span> Place & Aim
                <span>·</span>
                <span className="banner-instruction">Right-Click:</span> Remove
              </>
            ) : simState === 'playing' ? (
              <span>Simulation active</span>
            ) : (
              <span>Battle Concluded!</span>
            )}
          </div>

          <div className="arena-stage-wrapper">
            
            {/* Outside Upper Left HUD Wrapper */}
            <div className="side-hud-column left-hud-col">
              <div className="side-hud left-hud" style={{ borderLeftColor: isTeamMatch ? TEAMS.BLUE.color : undefined }}>
                <div className="side-hud-header" style={{ color: isTeamMatch ? TEAMS.BLUE.color : 'inherit' }}>
                  <span>{blueSideTitle}</span>
                  <span>{blueBalls.filter(b => !b.isDead && !b.isDying).length} ALIVE</span>
                </div>
                <div className="side-hud-units">
                  {blueBalls.length === 0 ? (
                    <div className="side-hud-empty">No units placed</div>
                  ) : (
                    blueBalls.map((b, idx) => {
                      const hpPercent = Math.max(0, Math.min(1, (b.hp ?? b.maxHp) / b.maxHp));
                      const trailPercent = Math.max(0, Math.min(1, (b.displayHp ?? b.hp ?? b.maxHp) / b.maxHp));
                      const hpColor = getHealthColor(hpPercent);
                      const shieldPercent = Math.max(0, Math.min(1, (b.shield || 0) / (b.config?.shieldAmount || 20)));

                      return (
                        <div key={b.id || idx} className={`hud-unit-card ${b.isDead ? 'dead' : (b.isDying ? 'dying' : '')}`}>
                          {/* Main Ball Info & Bars */}
                          <div className="hud-unit-main">
                            {/* Row 1: Name of the Ball */}
                            <div className="hud-row-name">
                              <span className="hud-ball-title">
                                {(b.isDead || b.isDying) && (
                                  <span className="hud-dead-skull-icon" title="Eliminated">
                                    <SkullIcon size={14} color="#ef4444" />
                                  </span>
                                )}
                                {b.name}
                              </span>
                              <span className="hud-ball-sub-id">#{idx + 1}</span>
                            </div>

                            {/* Row 2: HP Bar & Shield Bar */}
                            <div className="hud-row-bars">
                              {b.shield > 0 && (
                                <div className="hud-shield-line-container">
                                  <div className="hud-shield-bar-bg">
                                    <div
                                      className="hud-shield-bar-fill"
                                      style={{ width: `${shieldPercent * 100}%` }}
                                    ></div>
                                  </div>
                                </div>
                              )}

                              <div className="hud-hp-bar-bg">
                                <div
                                  className="hud-hp-bar-damage-trail"
                                  style={{ width: `${trailPercent * 100}%` }}
                                ></div>
                                <div
                                  className="hud-hp-bar-fill"
                                  style={{
                                    width: `${hpPercent * 100}%`,
                                    backgroundColor: hpColor,
                                  }}
                                ></div>
                              </div>
                            </div>

                            {/* Row 3: HP in Value */}
                            <div className="hud-row-hp-value">
                              <span className="hud-hp-val-number" style={{ color: hpColor }}>
                                {Math.round(b.hp ?? b.maxHp)} / {b.maxHp} HP
                              </span>
                              {b.shield > 0 && (
                                <span className="hud-shield-val-number">
                                  +{b.shield} SHIELD
                                </span>
                              )}
                            </div>

                            {/* Steel Ball 4-Hit Barrier Charge Indicator */}
                            {b.type === BALL_TYPES.STEEL && (
                              <div className="hud-shield-charge-wrapper" title="Steel Barrier Charge: 4 hits to activate Shield">
                                <div className="hud-charge-label-row">
                                  <span className="hud-charge-txt">BARRIER CHARGE</span>
                                  <span className="hud-charge-numeric">
                                    {(b.hitCount || 0) % 4 === 0 && (b.hitCount || 0) > 0 && b.shield > 0 ? 'READY' : `${(b.hitCount || 0) % 4} / 4 HITS`}
                                  </span>
                                </div>
                                <div className="hud-charge-bar-track">
                                  {[1, 2, 3, 4].map(step => {
                                    const hits = (b.hitCount || 0) % 4;
                                    const isProc = hits === 0 && (b.hitCount || 0) > 0 && b.shield > 0;
                                    const filled = hits >= step || isProc;
                                    return (
                                      <div
                                        key={step}
                                        className={`hud-charge-pip ${filled ? 'active' : ''}`}
                                      />
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Gun Ball 3-Second Cannon Reload Bar */}
                            {b.type === BALL_TYPES.GUN && (
                              <div className="hud-shield-charge-wrapper" title="Cannon Fire: Shoots heavy bullet every 3 seconds">
                                <div className="hud-charge-label-row">
                                  <span className="hud-charge-txt" style={{ color: '#f59e0b' }}>CANNON RELOAD</span>
                                  <span className="hud-charge-numeric" style={{ color: '#f59e0b' }}>
                                    {((3000 - Math.max(0, b.gunCooldown !== undefined ? b.gunCooldown : 3000)) / 1000).toFixed(1)}s / 3.0s
                                  </span>
                                </div>
                                <div className="hud-charge-bar-track" style={{ height: 4, background: 'rgba(245, 158, 11, 0.15)', borderRadius: 2, overflow: 'hidden' }}>
                                  <div
                                    style={{
                                      width: `${Math.min(100, Math.max(0, ((3000 - Math.max(0, b.gunCooldown !== undefined ? b.gunCooldown : 3000)) / 3000) * 100))}%`,
                                      height: '100%',
                                      backgroundColor: '#f59e0b',
                                      boxShadow: '0 0 6px rgba(245, 158, 11, 0.6)',
                                      transition: 'width 0.05s linear',
                                    }}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Heal Ball 6-Second Regeneration Bar */}
                            {b.type === BALL_TYPES.HEAL && (
                              <div className="hud-shield-charge-wrapper" title="Self-Heal: Regenerates +5 HP every 6 seconds">
                                <div className="hud-charge-label-row">
                                  <span className="hud-charge-txt" style={{ color: '#10b981' }}>HEAL RECHARGE</span>
                                  <span className="hud-charge-numeric" style={{ color: '#10b981' }}>
                                    {((6000 - Math.max(0, b.healTimer !== undefined ? b.healTimer : 6000)) / 1000).toFixed(1)}s / 6.0s
                                  </span>
                                </div>
                                <div className="hud-charge-bar-track" style={{ height: 4, background: 'rgba(16, 185, 129, 0.15)', borderRadius: 2, overflow: 'hidden' }}>
                                  <div
                                    style={{
                                      width: `${Math.min(100, Math.max(0, ((6000 - Math.max(0, b.healTimer !== undefined ? b.healTimer : 6000)) / 6000) * 100))}%`,
                                      height: '100%',
                                      backgroundColor: '#10b981',
                                      boxShadow: '0 0 6px rgba(16, 185, 129, 0.6)',
                                      transition: 'width 0.05s linear',
                                    }}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Sniper Ball 4-Second Sniper Lock-On Bar */}
                            {b.type === BALL_TYPES.SNIPER && (
                              <div className="hud-shield-charge-wrapper" title="Sniper Lock-On: Freezes midair to aim and shoot 45 DMG bullet">
                                <div className="hud-charge-label-row">
                                  <span className="hud-charge-txt" style={{ color: '#38bdf8' }}>
                                    {b.sniperState === 'aiming' ? 'TARGET LOCKED' : 'SNIPER RELOAD'}
                                  </span>
                                  <span className="hud-charge-numeric" style={{ color: '#38bdf8' }}>
                                    {b.sniperState === 'aiming'
                                      ? 'AIMING...'
                                      : `${((4000 - Math.max(0, b.sniperCooldown !== undefined ? b.sniperCooldown : 4000)) / 1000).toFixed(1)}s / 4.0s`}
                                  </span>
                                </div>
                                <div className="hud-charge-bar-track" style={{ height: 4, background: 'rgba(56, 189, 248, 0.15)', borderRadius: 2, overflow: 'hidden' }}>
                                  <div
                                    style={{
                                      width: b.sniperState === 'aiming'
                                        ? '100%'
                                        : `${Math.min(100, Math.max(0, ((4000 - Math.max(0, b.sniperCooldown !== undefined ? b.sniperCooldown : 4000)) / 4000) * 100))}%`,
                                      height: '100%',
                                      backgroundColor: b.sniperState === 'aiming' ? '#38bdf8' : '#0284c7',
                                      boxShadow: '0 0 6px rgba(56, 189, 248, 0.7)',
                                      transition: 'width 0.05s linear',
                                    }}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Row 4: SVG Icons of Effects (No emojis) */}
                            <div className="hud-row-effects">
                              {b.bleedTicksLeft > 0 && (
                                <span
                                  className="hud-effect-badge bleed-active"
                                  onMouseEnter={(e) => showTooltip(e, 'BLEED')}
                                  onMouseLeave={hideTooltip}
                                >
                                  <BleedIcon size={13} color="#ef4444" /> BLEED
                                </span>
                              )}
                              {b.burnTicksLeft > 0 && (
                                <span
                                  className="hud-effect-badge burn-active"
                                  onMouseEnter={(e) => showTooltip(e, 'BURN')}
                                  onMouseLeave={hideTooltip}
                                >
                                  <BurnIcon size={13} color="#f97316" /> BURN
                                </span>
                              )}
                              {b.shardTargetTimer > 0 && !b.isDead && (
                                <span
                                  className="hud-effect-badge shard-target-active"
                                  onMouseEnter={(e) => showTooltip(e, 'SHARD_TARGET')}
                                  onMouseLeave={hideTooltip}
                                >
                                  <ShardTargetIcon size={13} color="#c084fc" /> SHARD TARGET
                                </span>
                              )}
                              {b.shield > 0 && (
                                <span
                                  className="hud-effect-badge shield-active"
                                  onMouseEnter={(e) => showTooltip(e, 'SHIELD')}
                                  onMouseLeave={hideTooltip}
                                >
                                  <ShieldIcon size={13} color="#0284c7" /> SHIELD
                                </span>
                              )}
                              {b.type === BALL_TYPES.SWORD && (
                                <span
                                  className="hud-effect-badge blade-active"
                                  onMouseEnter={(e) => showTooltip(e, 'BLADE')}
                                  onMouseLeave={hideTooltip}
                                >
                                  <BladeIcon size={13} color="#dc2626" /> BLADE
                                </span>
                              )}
                              {b.type === BALL_TYPES.KNIFE && (
                                <span
                                  className="hud-effect-badge knife-active"
                                  onMouseEnter={(e) => showTooltip(e, 'KNIFE')}
                                  onMouseLeave={hideTooltip}
                                >
                                  <KnifeIcon size={13} color="#94a3b8" /> KNIFE
                                </span>
                              )}
                              {b.type === BALL_TYPES.HAMMER && (
                                <span
                                  className="hud-effect-badge hammer-active"
                                  onMouseEnter={(e) => showTooltip(e, 'HAMMER')}
                                  onMouseLeave={hideTooltip}
                                >
                                  <HammerIcon size={13} color="#b91c1c" /> HAMMER
                                </span>
                              )}
                              {b.type === BALL_TYPES.GLASS && (
                                <span
                                  className="hud-effect-badge brittle-active"
                                  onMouseEnter={(e) => showTooltip(e, 'BRITTLE')}
                                  onMouseLeave={hideTooltip}
                                >
                                  <BrittleIcon size={13} color="#06b6d4" /> BRITTLE
                                </span>
                              )}
                              {b.type === BALL_TYPES.SPIKE && (
                                <>
                                  <span
                                    className="hud-effect-badge spikes-active"
                                    onMouseEnter={(e) => showTooltip(e, 'SPIKES')}
                                    onMouseLeave={hideTooltip}
                                  >
                                    <SpikesIcon size={13} color="#8b5cf6" /> SPIKES
                                  </span>
                                  <span
                                    className="hud-effect-badge armor-active"
                                    onMouseEnter={(e) => showTooltip(e, 'ARMOR')}
                                    onMouseLeave={hideTooltip}
                                  >
                                    <ArmorIcon size={13} color="#0284c7" /> ARMOR
                                  </span>
                                </>
                              )}
                              {b.type === BALL_TYPES.STONE && (
                                <>
                                  <span
                                    className="hud-effect-badge heavy-active"
                                    onMouseEnter={(e) => showTooltip(e, 'HEAVY')}
                                    onMouseLeave={hideTooltip}
                                  >
                                    <HeavyIcon size={13} color="#f59e0b" /> HEAVY
                                  </span>
                                  <span
                                    className="hud-effect-badge armor-active"
                                    onMouseEnter={(e) => showTooltip(e, 'ARMOR')}
                                    onMouseLeave={hideTooltip}
                                  >
                                    <ArmorIcon size={13} color="#0284c7" /> ARMOR
                                  </span>
                                </>
                              )}
                              {b.type === BALL_TYPES.FAST && (
                                <span
                                  className="hud-effect-badge rapid-active"
                                  onMouseEnter={(e) => showTooltip(e, 'RAPID')}
                                  onMouseLeave={hideTooltip}
                                >
                                  <RapidIcon size={13} color="#10b981" /> RAPID
                                </span>
                              )}
                              {b.type === BALL_TYPES.GROW && (
                                <>
                                  <span
                                    className="hud-effect-badge grow-active"
                                    onMouseEnter={(e) => showTooltip(e, 'GROW')}
                                    onMouseLeave={hideTooltip}
                                  >
                                    <GrowIcon size={13} color="#22c55e" /> SIZE GROW
                                  </span>
                                  {(b.mass || 1.0) >= 2.8 && (
                                    <span
                                      className="hud-effect-badge heavy-active"
                                      onMouseEnter={(e) => showTooltip(e, 'HEAVY')}
                                      onMouseLeave={hideTooltip}
                                    >
                                      <HeavyIcon size={13} color="#f59e0b" /> HEAVY
                                    </span>
                                  )}
                                </>
                              )}
                              {b.type === BALL_TYPES.ACCELERATOR && (
                                <>
                                  <span
                                    className="hud-effect-badge rapid-active"
                                    onMouseEnter={(e) => showTooltip(e, 'RAPID')}
                                    onMouseLeave={hideTooltip}
                                  >
                                    <RapidIcon size={13} color="#10b981" /> RAPID
                                  </span>
                                  <span
                                    className="hud-effect-badge accelerate-active"
                                    onMouseEnter={(e) => showTooltip(e, 'ACCELERATE')}
                                    onMouseLeave={hideTooltip}
                                  >
                                    <AccelerateIcon size={13} color="#3b82f6" /> ACCELERATE
                                  </span>
                                </>
                              )}
                              {b.type === BALL_TYPES.SHARD && (
                                <span
                                  className="hud-effect-badge shard-active"
                                  onMouseEnter={(e) => showTooltip(e, 'SHARD')}
                                  onMouseLeave={hideTooltip}
                                >
                                  <ShardIcon size={13} color="#c084fc" /> SHARD
                                </span>
                              )}
                              {b.type === BALL_TYPES.GUN && (
                                <span
                                  className="hud-effect-badge gun-active"
                                  onMouseEnter={(e) => showTooltip(e, 'GUN')}
                                  onMouseLeave={hideTooltip}
                                >
                                  <GunIcon size={13} color="#f59e0b" /> GUN
                                </span>
                              )}
                              {b.type === BALL_TYPES.SNIPER && (
                                <span
                                  className="hud-effect-badge sniper-active"
                                  onMouseEnter={(e) => showTooltip(e, 'SNIPER')}
                                  onMouseLeave={hideTooltip}
                                >
                                  <SniperIcon size={13} color="#38bdf8" /> SNIPER
                                </span>
                              )}
                              {b.type === BALL_TYPES.THORN && (
                                <span
                                  className="hud-effect-badge thorn-active"
                                  onMouseEnter={(e) => showTooltip(e, 'THORN')}
                                  onMouseLeave={hideTooltip}
                                >
                                  <ThornIcon size={13} color="#22c55e" /> THORNS
                                </span>
                              )}
                              {b.type === BALL_TYPES.MULTI && (
                                <span
                                  className="hud-effect-badge multi-active"
                                  onMouseEnter={(e) => showTooltip(e, 'SPLIT')}
                                  onMouseLeave={hideTooltip}
                                >
                                  <SplitIcon size={13} color="#d946ef" /> SPLIT
                                </span>
                              )}
                              {b.type === BALL_TYPES.FIRE && (
                                <span
                                  className="hud-effect-badge flaming-active"
                                  onMouseEnter={(e) => showTooltip(e, 'FLAMING')}
                                  onMouseLeave={hideTooltip}
                                >
                                  <FlameIcon size={13} color="#f97316" /> FLAMING
                                </span>
                              )}
                              {b.type === BALL_TYPES.HEAL && (
                                <span
                                  className="hud-effect-badge heal-active"
                                  onMouseEnter={(e) => showTooltip(e, 'HEAL')}
                                  onMouseLeave={hideTooltip}
                                >
                                  <HealIcon size={13} color="#10b981" /> HEAL
                                </span>
                              )}
                            </div>

                            {/* In 1v1 mode, render stats below the statuses */}
                            {showStats && !isTeamMatch && (
                              <div className="hud-bottom-stats-row">
                                <span className="hud-stat-pill">DMG: <strong>{b.damage}</strong></span>
                                <span className="hud-stat-pill">SPD: <strong>{typeof b.speed === 'number' ? Number(b.speed.toFixed(1)) : b.speed}</strong></span>
                                <span className="hud-stat-pill">MASS: <strong>{typeof b.mass === 'number' ? Number(b.mass.toFixed(1)) : b.mass}</strong></span>
                              </div>
                            )}
                          </div>

                          {/* In Team matches (multi-ball), render side stats wing */}
                          {showStats && isTeamMatch && (
                            <div className="hud-unit-side-stats">
                              <div className="hud-side-stat-item">
                                <span className="hud-side-stat-lbl">DMG</span>
                                <span className="hud-side-stat-val">{b.damage}</span>
                              </div>
                              <div className="hud-side-stat-item">
                                <span className="hud-side-stat-lbl">SPD</span>
                                <span className="hud-side-stat-val">{typeof b.speed === 'number' ? Number(b.speed.toFixed(1)) : b.speed}</span>
                              </div>
                              <div className="hud-side-stat-item">
                                <span className="hud-side-stat-lbl">MASS</span>
                                <span className="hud-side-stat-val">{typeof b.mass === 'number' ? Number(b.mass.toFixed(1)) : b.mass}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Victory Stats for Left Side (Shown OUTSIDE the scrollable box) */}
              {simState === 'concluded' && matchSummaryStats && matchSummaryStats.winnerTeam === TEAMS.BLUE.id && (
                <div className="outside-victory-stats-card">
                  <div className="victory-stats-title">VICTORY PERFORMANCE</div>
                  <div className="victory-stat-item">
                    <span className="v-label">TOTAL DAMAGE DEALT:</span>
                    <span className="v-val damage">{matchSummaryStats.winnerDmgDealt} DMG</span>
                  </div>
                  <div className="victory-stat-item">
                    <span className="v-label">SURVIVOR HP:</span>
                    <span className="v-val hp">{matchSummaryStats.winnerHpLeft} / {matchSummaryStats.winnerMaxHp}</span>
                  </div>
                  <div className="victory-stat-item">
                    <span className="v-label">K.O. ELIMINATIONS:</span>
                    <span className="v-val">{matchSummaryStats.totalKills}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Center Canvas Container */}
            <div className="canvas-container-box">
              <div className="canvas-reticle-corner c-tl"></div>
              <div className="canvas-reticle-corner c-tr"></div>
              <div className="canvas-reticle-corner c-bl"></div>
              <div className="canvas-reticle-corner c-br"></div>

              {/* WebGL LaserFlow Aura rendered BEHIND the canvas (solo champion only) */}
              {simState === 'concluded' && winnerTeam !== null && winnerTeam !== -1 && liveBallsTelemetry.filter(b => !b.isDead && !b.isDying).length === 1 && (() => {
                const soloChamp = liveBallsTelemetry.find(b => !b.isDead && !b.isDying);
                return (
                  <LaserFlow
                    className="canvas-victory-aura"
                    beamPosition={soloChamp ? soloChamp.x / CANVAS_SIZE : 0.5}
                    targetX={soloChamp ? soloChamp.x : CANVAS_SIZE / 2}
                    targetY={soloChamp ? soloChamp.y : CANVAS_SIZE / 2}
                    targetRadius={soloChamp ? soloChamp.radius : 38}
                    surfaceLevel={0.5}
                    color="#eab308"
                    intensity={2.8}
                    beamWidth={1.8}
                    flare={2.2}
                    spread={1.8}
                    spill={1.5}
                    dust={2.0}
                    streaks={1.8}
                    pulse={1.8}
                    speed={1.6}
                    theme={theme === 'dark' ? 'dark' : 'light'}
                  />
                );
              })()}

              <canvas
                ref={canvasRef}
                width={CANVAS_SIZE}
                height={CANVAS_SIZE}
                onMouseDown={handleMouseDown}
                className="main-battle-canvas"
              />
            </div>

            {/* Outside Upper Right HUD Wrapper */}
            <div className="side-hud-column right-hud-col">
              <div className="side-hud right-hud" style={{ borderRightColor: isTeamMatch ? TEAMS.RED.color : undefined }}>
                <div className="side-hud-header" style={{ color: isTeamMatch ? TEAMS.RED.color : 'inherit' }}>
                  <span>{redSideTitle}</span>
                  <span>{redBalls.filter(b => !b.isDead && !b.isDying).length} ALIVE</span>
                </div>
                <div className="side-hud-units">
                  {redBalls.length === 0 ? (
                    <div className="side-hud-empty">No units placed</div>
                  ) : (
                    redBalls.map((b, idx) => {
                      const hpPercent = Math.max(0, Math.min(1, (b.hp ?? b.maxHp) / b.maxHp));
                      const trailPercent = Math.max(0, Math.min(1, (b.displayHp ?? b.hp ?? b.maxHp) / b.maxHp));
                      const hpColor = getHealthColor(hpPercent);
                      const shieldPercent = Math.max(0, Math.min(1, (b.shield || 0) / (b.config?.shieldAmount || 20)));

                      return (
                        <div key={b.id || idx} className={`hud-unit-card ${b.isDead ? 'dead' : (b.isDying ? 'dying' : '')}`}>
                          {/* Main Ball Info & Bars */}
                          <div className="hud-unit-main">
                            {/* Row 1: Name of the Ball */}
                            <div className="hud-row-name">
                              <span className="hud-ball-title">
                                {(b.isDead || b.isDying) && (
                                  <span className="hud-dead-skull-icon" title="Eliminated">
                                    <SkullIcon size={14} color="#ef4444" />
                                  </span>
                                )}
                                {b.name}
                              </span>
                              <span className="hud-ball-sub-id">#{idx + 1}</span>
                            </div>

                            {/* Row 2: HP Bar & Shield Bar */}
                            <div className="hud-row-bars">
                              {b.shield > 0 && (
                                <div className="hud-shield-line-container">
                                  <div className="hud-shield-bar-bg">
                                    <div
                                      className="hud-shield-bar-fill"
                                      style={{ width: `${shieldPercent * 100}%` }}
                                    ></div>
                                  </div>
                                </div>
                              )}

                              <div className="hud-hp-bar-bg">
                                <div
                                  className="hud-hp-bar-damage-trail"
                                  style={{ width: `${trailPercent * 100}%` }}
                                ></div>
                                <div
                                  className="hud-hp-bar-fill"
                                  style={{
                                    width: `${hpPercent * 100}%`,
                                    backgroundColor: hpColor,
                                  }}
                                ></div>
                              </div>
                            </div>

                            {/* Row 3: HP in Value */}
                            <div className="hud-row-hp-value">
                              <span className="hud-hp-val-number" style={{ color: hpColor }}>
                                {Math.round(b.hp ?? b.maxHp)} / {b.maxHp} HP
                              </span>
                              {b.shield > 0 && (
                                <span className="hud-shield-val-number">
                                  +{b.shield} SHIELD
                                </span>
                              )}
                            </div>

                            {/* Steel Ball 4-Hit Barrier Charge Indicator */}
                            {b.type === BALL_TYPES.STEEL && (
                              <div className="hud-shield-charge-wrapper" title="Steel Barrier Charge: 4 hits to activate Shield">
                                <div className="hud-charge-label-row">
                                  <span className="hud-charge-txt">BARRIER CHARGE</span>
                                  <span className="hud-charge-numeric">
                                    {(b.hitCount || 0) % 4 === 0 && (b.hitCount || 0) > 0 && b.shield > 0 ? 'READY' : `${(b.hitCount || 0) % 4} / 4 HITS`}
                                  </span>
                                </div>
                                <div className="hud-charge-bar-track">
                                  {[1, 2, 3, 4].map(step => {
                                    const hits = (b.hitCount || 0) % 4;
                                    const isProc = hits === 0 && (b.hitCount || 0) > 0 && b.shield > 0;
                                    const filled = hits >= step || isProc;
                                    return (
                                      <div
                                        key={step}
                                        className={`hud-charge-pip ${filled ? 'active' : ''}`}
                                      />
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Gun Ball 3-Second Cannon Reload Bar */}
                            {b.type === BALL_TYPES.GUN && (
                              <div className="hud-shield-charge-wrapper" title="Cannon Fire: Shoots heavy bullet every 3 seconds">
                                <div className="hud-charge-label-row">
                                  <span className="hud-charge-txt" style={{ color: '#f59e0b' }}>CANNON RELOAD</span>
                                  <span className="hud-charge-numeric" style={{ color: '#f59e0b' }}>
                                    {((3000 - Math.max(0, b.gunCooldown !== undefined ? b.gunCooldown : 3000)) / 1000).toFixed(1)}s / 3.0s
                                  </span>
                                </div>
                                <div className="hud-charge-bar-track" style={{ height: 4, background: 'rgba(245, 158, 11, 0.15)', borderRadius: 2, overflow: 'hidden' }}>
                                  <div
                                    style={{
                                      width: `${Math.min(100, Math.max(0, ((3000 - Math.max(0, b.gunCooldown !== undefined ? b.gunCooldown : 3000)) / 3000) * 100))}%`,
                                      height: '100%',
                                      backgroundColor: '#f59e0b',
                                      boxShadow: '0 0 6px rgba(245, 158, 11, 0.6)',
                                      transition: 'width 0.05s linear',
                                    }}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Heal Ball 6-Second Regeneration Bar */}
                            {b.type === BALL_TYPES.HEAL && (
                              <div className="hud-shield-charge-wrapper" title="Self-Heal: Regenerates +5 HP every 6 seconds">
                                <div className="hud-charge-label-row">
                                  <span className="hud-charge-txt" style={{ color: '#10b981' }}>HEAL RECHARGE</span>
                                  <span className="hud-charge-numeric" style={{ color: '#10b981' }}>
                                    {((6000 - Math.max(0, b.healTimer !== undefined ? b.healTimer : 6000)) / 1000).toFixed(1)}s / 6.0s
                                  </span>
                                </div>
                                <div className="hud-charge-bar-track" style={{ height: 4, background: 'rgba(16, 185, 129, 0.15)', borderRadius: 2, overflow: 'hidden' }}>
                                  <div
                                    style={{
                                      width: `${Math.min(100, Math.max(0, ((6000 - Math.max(0, b.healTimer !== undefined ? b.healTimer : 6000)) / 6000) * 100))}%`,
                                      height: '100%',
                                      backgroundColor: '#10b981',
                                      boxShadow: '0 0 6px rgba(16, 185, 129, 0.6)',
                                      transition: 'width 0.05s linear',
                                    }}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Sniper Ball 4-Second Sniper Lock-On Bar */}
                            {b.type === BALL_TYPES.SNIPER && (
                              <div className="hud-shield-charge-wrapper" title="Sniper Lock-On: Freezes midair to aim and shoot 45 DMG bullet">
                                <div className="hud-charge-label-row">
                                  <span className="hud-charge-txt" style={{ color: '#38bdf8' }}>
                                    {b.sniperState === 'aiming' ? 'TARGET LOCKED' : 'SNIPER RELOAD'}
                                  </span>
                                  <span className="hud-charge-numeric" style={{ color: '#38bdf8' }}>
                                    {b.sniperState === 'aiming'
                                      ? 'AIMING...'
                                      : `${((4000 - Math.max(0, b.sniperCooldown !== undefined ? b.sniperCooldown : 4000)) / 1000).toFixed(1)}s / 4.0s`}
                                  </span>
                                </div>
                                <div className="hud-charge-bar-track" style={{ height: 4, background: 'rgba(56, 189, 248, 0.15)', borderRadius: 2, overflow: 'hidden' }}>
                                  <div
                                    style={{
                                      width: b.sniperState === 'aiming'
                                        ? '100%'
                                        : `${Math.min(100, Math.max(0, ((4000 - Math.max(0, b.sniperCooldown !== undefined ? b.sniperCooldown : 4000)) / 4000) * 100))}%`,
                                      height: '100%',
                                      backgroundColor: b.sniperState === 'aiming' ? '#38bdf8' : '#0284c7',
                                      boxShadow: '0 0 6px rgba(56, 189, 248, 0.7)',
                                      transition: 'width 0.05s linear',
                                    }}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Row 4: SVG Icons of Effects (No emojis) */}
                            <div className="hud-row-effects">
                              {b.bleedTicksLeft > 0 && (
                                <span
                                  className="hud-effect-badge bleed-active"
                                  onMouseEnter={(e) => showTooltip(e, 'BLEED')}
                                  onMouseLeave={hideTooltip}
                                >
                                  <BleedIcon size={13} color="#ef4444" /> BLEED
                                </span>
                              )}
                              {b.burnTicksLeft > 0 && (
                                <span
                                  className="hud-effect-badge burn-active"
                                  onMouseEnter={(e) => showTooltip(e, 'BURN')}
                                  onMouseLeave={hideTooltip}
                                >
                                  <BurnIcon size={13} color="#f97316" /> BURN
                                </span>
                              )}
                              {b.shardTargetTimer > 0 && !b.isDead && (
                                <span
                                  className="hud-effect-badge shard-target-active"
                                  onMouseEnter={(e) => showTooltip(e, 'SHARD_TARGET')}
                                  onMouseLeave={hideTooltip}
                                >
                                  <ShardTargetIcon size={13} color="#c084fc" /> SHARD TARGET
                                </span>
                              )}
                              {b.shield > 0 && (
                                <span
                                  className="hud-effect-badge shield-active"
                                  onMouseEnter={(e) => showTooltip(e, 'SHIELD')}
                                  onMouseLeave={hideTooltip}
                                >
                                  <ShieldIcon size={13} color="#0284c7" /> SHIELD
                                </span>
                              )}
                              {b.type === BALL_TYPES.SWORD && (
                                <span
                                  className="hud-effect-badge blade-active"
                                  onMouseEnter={(e) => showTooltip(e, 'BLADE')}
                                  onMouseLeave={hideTooltip}
                                >
                                  <BladeIcon size={13} color="#dc2626" /> BLADE
                                </span>
                              )}
                              {b.type === BALL_TYPES.KNIFE && (
                                <span
                                  className="hud-effect-badge knife-active"
                                  onMouseEnter={(e) => showTooltip(e, 'KNIFE')}
                                  onMouseLeave={hideTooltip}
                                >
                                  <KnifeIcon size={13} color="#94a3b8" /> KNIFE
                                </span>
                              )}
                              {b.type === BALL_TYPES.HAMMER && (
                                <span
                                  className="hud-effect-badge hammer-active"
                                  onMouseEnter={(e) => showTooltip(e, 'HAMMER')}
                                  onMouseLeave={hideTooltip}
                                >
                                  <HammerIcon size={13} color="#b91c1c" /> HAMMER
                                </span>
                              )}
                              {b.type === BALL_TYPES.GLASS && (
                                <span
                                  className="hud-effect-badge brittle-active"
                                  onMouseEnter={(e) => showTooltip(e, 'BRITTLE')}
                                  onMouseLeave={hideTooltip}
                                >
                                  <BrittleIcon size={13} color="#06b6d4" /> BRITTLE
                                </span>
                              )}
                              {b.type === BALL_TYPES.SPIKE && (
                                <>
                                  <span
                                    className="hud-effect-badge spikes-active"
                                    onMouseEnter={(e) => showTooltip(e, 'SPIKES')}
                                    onMouseLeave={hideTooltip}
                                  >
                                    <SpikesIcon size={13} color="#8b5cf6" /> SPIKES
                                  </span>
                                  <span
                                    className="hud-effect-badge armor-active"
                                    onMouseEnter={(e) => showTooltip(e, 'ARMOR')}
                                    onMouseLeave={hideTooltip}
                                  >
                                    <ArmorIcon size={13} color="#0284c7" /> ARMOR
                                  </span>
                                </>
                              )}
                              {b.type === BALL_TYPES.STONE && (
                                <>
                                  <span
                                    className="hud-effect-badge heavy-active"
                                    onMouseEnter={(e) => showTooltip(e, 'HEAVY')}
                                    onMouseLeave={hideTooltip}
                                  >
                                    <HeavyIcon size={13} color="#f59e0b" /> HEAVY
                                  </span>
                                  <span
                                    className="hud-effect-badge armor-active"
                                    onMouseEnter={(e) => showTooltip(e, 'ARMOR')}
                                    onMouseLeave={hideTooltip}
                                  >
                                    <ArmorIcon size={13} color="#0284c7" /> ARMOR
                                  </span>
                                </>
                              )}
                              {b.type === BALL_TYPES.FAST && (
                                <span
                                  className="hud-effect-badge rapid-active"
                                  onMouseEnter={(e) => showTooltip(e, 'RAPID')}
                                  onMouseLeave={hideTooltip}
                                >
                                  <RapidIcon size={13} color="#10b981" /> RAPID
                                </span>
                              )}
                              {b.type === BALL_TYPES.GROW && (
                                <>
                                  <span
                                    className="hud-effect-badge grow-active"
                                    onMouseEnter={(e) => showTooltip(e, 'GROW')}
                                    onMouseLeave={hideTooltip}
                                  >
                                    <GrowIcon size={13} color="#22c55e" /> SIZE GROW
                                  </span>
                                  {(b.mass || 1.0) >= 2.8 && (
                                    <span
                                      className="hud-effect-badge heavy-active"
                                      onMouseEnter={(e) => showTooltip(e, 'HEAVY')}
                                      onMouseLeave={hideTooltip}
                                    >
                                      <HeavyIcon size={13} color="#f59e0b" /> HEAVY
                                    </span>
                                  )}
                                </>
                              )}
                              {b.type === BALL_TYPES.ACCELERATOR && (
                                <>
                                  <span
                                    className="hud-effect-badge rapid-active"
                                    onMouseEnter={(e) => showTooltip(e, 'RAPID')}
                                    onMouseLeave={hideTooltip}
                                  >
                                    <RapidIcon size={13} color="#10b981" /> RAPID
                                  </span>
                                  <span
                                    className="hud-effect-badge accelerate-active"
                                    onMouseEnter={(e) => showTooltip(e, 'ACCELERATE')}
                                    onMouseLeave={hideTooltip}
                                  >
                                    <AccelerateIcon size={13} color="#3b82f6" /> ACCELERATE
                                  </span>
                                </>
                              )}
                              {b.type === BALL_TYPES.SHARD && (
                                <span
                                  className="hud-effect-badge shard-active"
                                  onMouseEnter={(e) => showTooltip(e, 'SHARD')}
                                  onMouseLeave={hideTooltip}
                                >
                                  <ShardIcon size={13} color="#c084fc" /> SHARD
                                </span>
                              )}
                              {b.type === BALL_TYPES.GUN && (
                                <span
                                  className="hud-effect-badge gun-active"
                                  onMouseEnter={(e) => showTooltip(e, 'GUN')}
                                  onMouseLeave={hideTooltip}
                                >
                                  <GunIcon size={13} color="#f59e0b" /> GUN
                                </span>
                              )}
                              {b.type === BALL_TYPES.SNIPER && (
                                <span
                                  className="hud-effect-badge sniper-active"
                                  onMouseEnter={(e) => showTooltip(e, 'SNIPER')}
                                  onMouseLeave={hideTooltip}
                                >
                                  <SniperIcon size={13} color="#38bdf8" /> SNIPER
                                </span>
                              )}
                              {b.type === BALL_TYPES.THORN && (
                                <span
                                  className="hud-effect-badge thorn-active"
                                  onMouseEnter={(e) => showTooltip(e, 'THORN')}
                                  onMouseLeave={hideTooltip}
                                >
                                  <ThornIcon size={13} color="#22c55e" /> THORNS
                                </span>
                              )}
                              {b.type === BALL_TYPES.MULTI && (
                                <span
                                  className="hud-effect-badge multi-active"
                                  onMouseEnter={(e) => showTooltip(e, 'SPLIT')}
                                  onMouseLeave={hideTooltip}
                                >
                                  <SplitIcon size={13} color="#d946ef" /> SPLIT
                                </span>
                              )}
                              {b.type === BALL_TYPES.FIRE && (
                                <span
                                  className="hud-effect-badge flaming-active"
                                  onMouseEnter={(e) => showTooltip(e, 'FLAMING')}
                                  onMouseLeave={hideTooltip}
                                >
                                  <FlameIcon size={13} color="#f97316" /> FLAMING
                                </span>
                              )}
                              {b.type === BALL_TYPES.HEAL && (
                                <span
                                  className="hud-effect-badge heal-active"
                                  onMouseEnter={(e) => showTooltip(e, 'HEAL')}
                                  onMouseLeave={hideTooltip}
                                >
                                  <HealIcon size={13} color="#10b981" /> HEAL
                                </span>
                              )}
                            </div>

                            {/* In 1v1 mode, render stats below the statuses */}
                            {showStats && !isTeamMatch && (
                              <div className="hud-bottom-stats-row">
                                <span className="hud-stat-pill">DMG: <strong>{b.damage}</strong></span>
                                <span className="hud-stat-pill">SPD: <strong>{typeof b.speed === 'number' ? Number(b.speed.toFixed(1)) : b.speed}</strong></span>
                                <span className="hud-stat-pill">MASS: <strong>{typeof b.mass === 'number' ? Number(b.mass.toFixed(1)) : b.mass}</strong></span>
                              </div>
                            )}
                          </div>

                          {/* In Team matches (multi-ball), render side stats wing */}
                          {showStats && isTeamMatch && (
                            <div className="hud-unit-side-stats">
                              <div className="hud-side-stat-item">
                                <span className="hud-side-stat-lbl">DMG</span>
                                <span className="hud-side-stat-val">{b.damage}</span>
                              </div>
                              <div className="hud-side-stat-item">
                                <span className="hud-side-stat-lbl">SPD</span>
                                <span className="hud-side-stat-val">{typeof b.speed === 'number' ? Number(b.speed.toFixed(1)) : b.speed}</span>
                              </div>
                              <div className="hud-side-stat-item">
                                <span className="hud-side-stat-lbl">MASS</span>
                                <span className="hud-side-stat-val">{typeof b.mass === 'number' ? Number(b.mass.toFixed(1)) : b.mass}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Victory Stats for Right Side (Shown OUTSIDE the scrollable box) */}
              {simState === 'concluded' && matchSummaryStats && matchSummaryStats.winnerTeam === TEAMS.RED.id && (
                <div className="outside-victory-stats-card">
                  <div className="victory-stats-title">VICTORY PERFORMANCE</div>
                  <div className="victory-stat-item">
                    <span className="v-label">TOTAL DAMAGE DEALT:</span>
                    <span className="v-val damage">{matchSummaryStats.winnerDmgDealt} DMG</span>
                  </div>
                  <div className="victory-stat-item">
                    <span className="v-label">SURVIVOR HP:</span>
                    <span className="v-val hp">{matchSummaryStats.winnerHpLeft} / {matchSummaryStats.winnerMaxHp}</span>
                  </div>
                  <div className="victory-stat-item">
                    <span className="v-label">K.O. ELIMINATIONS:</span>
                    <span className="v-val">{matchSummaryStats.totalKills}</span>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Victory Bar Positioned Cleanly at the Bottom (Strictly 3 Rows Layout) */}
          {simState === 'concluded' && (
            <div className="winner-modal-banner">
              <div className="winner-banner-rows">
                {/* Row 1: Winner / Status */}
                <div className="winner-label-row">
                  <span>{winnerTeam === null || winnerTeam < 0 ? 'MATCH RESULT' : 'WINNER'}</span>
                </div>

                {/* Row 2: Ball Name / Draw */}
                <h2 className="winner-ball-name-row">
                  {winnerTeam === null || winnerTeam < 0 ? 'Round Draw' : (matchSummaryStats ? matchSummaryStats.winnerName : getWinnerText())}
                </h2>

                {/* Row 3: Action Buttons */}
                <div className="winner-actions-row">
                  <button
                    className="btn-victory-action btn-retry"
                    onClick={resetToPlanning}
                    onMouseEnter={() => sound.play('buttonHover', 0.25)}
                  >
                    Retry Battle
                  </button>
                  <button
                    className="btn-victory-action btn-new-battle"
                    onClick={startNewBattle}
                    onMouseEnter={() => sound.play('buttonHover', 0.25)}
                  >
                    New Battle
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Custom Tactical HUD Tooltip */}
      {activeTooltip && (
        <div
          className="tactical-hud-tooltip"
          style={{
            left: `${activeTooltip.x}px`,
            top: `${activeTooltip.y}px`,
            transform: activeTooltip.arrowPosition === 'top' ? 'translate(-50%, 0)' : 'translate(-50%, -100%)',
          }}
        >
          <div className="tooltip-header">
            <span className="tooltip-icon">{activeTooltip.icon}</span>
            <span className="tooltip-title">{activeTooltip.title}</span>
            <span className="tooltip-badge">{activeTooltip.category}</span>
          </div>
          <div className="tooltip-body">{activeTooltip.description}</div>
          <div
            className={`tooltip-arrow arrow-${activeTooltip.arrowPosition}`}
            style={{ marginLeft: `${-4 + (activeTooltip.arrowOffset || 0)}px` }}
          />
        </div>
      )}
    </div>
  );
}

export default BallBattleGame;
