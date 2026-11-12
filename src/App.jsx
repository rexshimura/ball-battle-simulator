import { useRef, useEffect, useState } from 'react';
import { BALL_CONFIGS, BALL_TYPES, TEAMS, RARITIES, RARITY_ORDER } from './ballConfig';
import { ShieldIcon, BladeIcon, SpikesIcon, ArmorIcon, HeavyIcon, RapidIcon, BleedIcon, SkullIcon, BrittleIcon, HammerIcon, KnockbackIcon, PushIcon, BlessIcon, TowerIcon, HardIcon, BroodIcon, RapierIcon, DashIcon, GrowIcon, VolumeIcon, VolumeMuteIcon, AlertTriangleIcon, ShardIcon, ShardTargetIcon, AccelerateIcon, GunIcon, ThornIcon, KnifeIcon, SplitIcon, FlameIcon, BurnIcon, HealIcon, SniperIcon, DiceIcon, SpitFireIcon, SpitFireTargetIcon, SlowIcon, DaggerIcon, PoisonIcon } from './Icons';
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

// Extract weapon damage if the ball is equipped with an external weapon
function getWeaponDamage(ball) {
  const cfg = ball?.config || (ball?.type ? BALL_CONFIGS[ball.type] : ball);
  if (!cfg) return null;
  if (cfg.bladeDamage !== undefined) return cfg.bladeDamage;
  if (cfg.rapierDamage !== undefined) return cfg.rapierDamage;
  if (cfg.knifeDamage !== undefined) return cfg.knifeDamage;
  if (cfg.daggerDamage !== undefined) return cfg.daggerDamage;
  if (cfg.hammerDamage !== undefined) return cfg.hammerDamage;
  if (cfg.bulletDamage !== undefined) return cfg.bulletDamage;
  if (cfg.trapDamage !== undefined) return cfg.trapDamage;
  return null;
}

const EFFECT_TOOLTIPS = {
  POISON: {
    title: 'POISON',
    category: 'STATUS TAG',
    icon: <PoisonIcon size={14} color="#10b981" />,
    description: "Virulent stacking toxin. Deals -1 damage every 0.8s for 12 seconds per stack (-1, -2, -3...). Each subsequent hit from Poison Ball refreshes the 12s duration and adds another stack without limit.",
  },
  BROOD: {
    title: 'BROOD',
    category: 'ABILITY (SELF)',
    icon: <BroodIcon size={14} color="#f472b6" />,
    description: "Mother Ball is very slow (1.2 SPD). Every 5.5s, stops moving to birth a baby ball from her brood (costs 5 HP). Cycles between Tough Baby, Sword Baby, Gun Baby, and Dual Sword Baby up to 4 active baby balls.",
  },
  HARD: {
    title: 'HARD',
    category: 'EFFECT TAG',
    icon: <HardIcon size={14} color="#94a3b8" />,
    description: "Dense, hardened composition. Vulnerable to concussive hammer bludgeons: Hammer Ball deals twice (2x) the damage against Hard targets.",
  },
  TOWER: {
    title: 'TOWER',
    category: 'EFFECT TAG',
    icon: <TowerIcon size={14} color="#94a3b8" />,
    description: "Anchored fortress chassis. Possesses reduced movement speed (1.1 SPD) but complete immunity to pushes, shockwaves, and knockback forces.",
  },
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
    description: 'Every time it collides with an enemy or absorbs spit fire hits, it physically expands in size and increases mass up to 10.0, gaining the Heavy Effect at 2.8+ size.',
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
    description: 'Specialized for long range with very low body collision damage (3 DMG). Periodically freezes in midair to lock a laser scope onto an enemy and fire a 15 DMG sniper shot.',
  },
  DICE: {
    title: 'LUCKY ROLL',
    category: 'WEAPON TAG',
    icon: <DiceIcon size={14} color="#f59e0b" />,
    description: 'A casino die starting with a mark of 1 (1 DMG). After striking an enemy twice, it rolls random damage: Low 5-12 (75%), Mid 15-25 (20%), High 30-50 (5%), or God 99 (1%). Features a 7-hit Pity System: taking damage 7 times absorbs the pity to transform any Mid or Low roll into a High Roll (30-50 DMG)!',
  },
  INCINERATION: {
    title: 'INCINERATION',
    category: 'MYTHICAL ABILITY',
    icon: <SpitFireIcon size={14} color="#0ea5e9" />,
    description: 'Imbued with mythical celestial blue fire. Leaves an azure ground trail, incinerates enemy Thorn Traps on contact, and inflicts Scorch and Flame Lock for 5 seconds while unleashing curving mini blue flame barrages.',
  },
  SCORCH: {
    title: 'SCORCH',
    category: 'STATUS TAG',
    icon: <BurnIcon size={14} color="#38bdf8" />,
    description: 'Scorching celestial blue fire damage ticks dealing true fire damage over an extended duration. Bypasses armor bleed immunity.',
  },
  FLAME_LOCK: {
    title: 'FLAME LOCK',
    category: 'STATUS TAG',
    icon: <SpitFireTargetIcon size={14} color="#0ea5e9" />,
    description: 'Locked by Spit Fire Ball for 5 seconds, targeted by a curving barrage of mini celestial blue flames that deal 1 DMG and inflict Scorch.',
  },
  SPIT_FIRE: {
    title: 'INCINERATION',
    category: 'MYTHICAL ABILITY',
    icon: <SpitFireIcon size={14} color="#0ea5e9" />,
    description: 'Imbued with mythical celestial blue fire. Leaves an azure ground trail, incinerates enemy Thorn Traps on contact, and inflicts Scorch and Flame Lock for 5 seconds while unleashing curving mini blue flame barrages.',
  },
  SPIT_FIRE_TARGET: {
    title: 'FLAME LOCK',
    category: 'STATUS TAG',
    icon: <SpitFireTargetIcon size={14} color="#0ea5e9" />,
    description: 'Locked by Spit Fire Ball for 5 seconds, targeted by a curving barrage of mini celestial blue flames that deal 1 DMG and inflict Scorch.',
  },
  DAGGER_MARK: {
    title: 'DAGGER MARK',
    category: 'INFLICT',
    icon: <DaggerIcon size={14} color="#14b8a6" />,
    description: 'Inflicted upon enemy contact with Dagger Ball\'s body or dagger. After 2s delay, Dagger Ball stops moving to aim for 2s and throws its dagger at this target.',
  },
  DAGGER_HIT: {
    title: 'DAGGER HIT',
    category: 'INFLICT',
    icon: <DaggerIcon size={14} color="#2dd4bf" />,
    description: 'Hampered by an embedded combat dagger. Inflicts Slow (-25% Movement Speed and -25% Damage Dealt) and Bleed. Stuck dagger can only be retrieved by Dagger Ball body contact.',
  },
  DAGGER_PULL: {
    title: 'TELEKINESIS RECALL',
    category: 'INFLICT (SELF)',
    icon: <DaggerIcon size={14} color="#38bdf8" />,
    description: 'Telekinetically recalls the missed combat dagger back to Dagger Ball 4 seconds after sticking into an arena wall.',
  },
  BLESSING: {
    title: 'BLESSING',
    category: 'ABILITY (SELF)',
    icon: <BlessIcon size={14} color="#f59e0b" />,
    description: "Priest Ball channels a map-wide divine blessing after 9s that heals self and all living allies across the entire canvas (heal is divided evenly among beneficiaries).",
  },
  PUSH: {
    title: 'PUSH',
    category: 'ABILITY (SELF)',
    icon: <PushIcon size={14} color="#818cf8" />,
    description: 'Charged by landing 1 hit on an enemy. Releases a powerful kinetic repulsor shockwave in a 130px radius that violently pushes nearby enemies away, then requires another hit to recharge.',
  },
  KNOCKBACK: {
    title: 'KNOCKBACK',
    category: 'INFLICT',
    icon: <KnockbackIcon size={14} color="#a5b4fc" />,
    description: "Violently propelled away by Push Ball's kinetic repulsor shockwave pulse.",
  },
  DAGGER: {
    title: 'DAGGER',
    category: 'WEAPON TAG',
    icon: <DaggerIcon size={14} color="#2dd4bf" />,
    description: 'Spins and bounces with a large combat dagger. Contact inflicts Dagger Mark, followed 2s later by stopping to aim for 2s and throwing its dagger.',
  },
  DASH: {
    title: 'DASH',
    category: 'EFFECT (SELF)',
    icon: <DashIcon size={14} color="#fbbf24" />,
    description: 'High-velocity forward thrust trait. Launches Rapier Ball forward at 17.5 speed toward its marked target, piercing for 28 thrust damage.',
  },
  RAPIER_MARK: {
    title: 'RAPIER MARK',
    category: 'INFLICT',
    icon: <RapierIcon size={14} color="#f43f5e" />,
    description: 'Marked by Rapier Ball upon contact. Rapier Ball stops moving to aim its rapier directly at this target for 0.8s before executing a deadly dash thrust.',
  },
  RAPIER: {
    title: 'RAPIER',
    category: 'WEAPON TAG',
    icon: <RapierIcon size={14} color="#fbbf24" />,
    description: 'Slender fencing rapier with ornate golden cup-hilt. Rotates dealing 12 weapon damage; on contact, marks enemy, aims for 0.8s, and dashes forward with a 28 DMG thrust.',
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

  const isBlueTeam = trap.team === TEAMS.BLUE.id || trap.team === 'blue' || trap.team === 0;
  const flowerPetalPrimary = isBlueTeam ? '#3b82f6' : '#f43f5e';
  const flowerPetalSecondary = isBlueTeam ? '#60a5fa' : '#fb7185';
  const flowerCenter = isBlueTeam ? '#93c5fd' : '#fde047';

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

    // Rosebud blossom at tip (team colored)
    drawBloomFlower(ctx, 36, -2, 4.4, flowerPetalPrimary, flowerCenter, 0.2);

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

    // Wild Rose Flower (team colored)
    drawBloomFlower(ctx, 52, -18, 7.5, flowerPetalPrimary, flowerCenter, 0.25);
    drawBloomFlower(ctx, 80, 12, 5.0, flowerPetalSecondary, flowerCenter, -0.3);
    drawBloomFlower(ctx, 94, 2, 4.0, flowerPetalPrimary, flowerCenter, 0.2);

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

    drawBloomFlower(ctx, 42, -10, 5.5, flowerPetalSecondary, flowerCenter, -0.3);
    drawBloomFlower(ctx, 62, 5, 4.5, flowerPetalPrimary, flowerCenter, 0.4);
  }
}

// Fire Ball: number of past positions the flame body follows (bends & curves along the real path)
const FIRE_HISTORY_LEN = 16;

// Cel-shaded fireball: flat colour bands (dark ember → orange → yellow → white-hot) built from
// unioned circles along the ball's path history. One fill per band = smooth & cheap (no gradients).
function drawCelFireball(ctx, x, y, radius, motionVector, isHit, isLight, isBlue = false) {
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
    : (isBlue
        ? ['#0369a1', '#0ea5e9', '#67e8f9', '#f0fdfa']
        : ['#c2410c', '#f97316', '#fde047', '#fffbeb']);

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
    glow.addColorStop(0, isBlue ? 'rgba(14, 165, 233, 0.32)' : 'rgba(249, 115, 22, 0.28)');
    glow.addColorStop(1, isBlue ? 'rgba(14, 165, 233, 0)' : 'rgba(249, 115, 22, 0)');
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

// Burning status and hit animation for enemies burned by Fire Ball or Spit Fire Ball
function drawBurningBallAnimation(ctx, ball, renderX, renderY) {
  if (!ball.burnTicksLeft || ball.burnTicksLeft <= 0 || ball.isDead || ball.isDying) return;
  const now = performance.now() * 0.001;
  const isBlue = !!ball.isBlueBurn;
  const r = ball.radius;

  ctx.save();

  // 1. Heat Corona / Fire Aura around the ball
  const auraGlow = ctx.createRadialGradient(renderX, renderY, r * 0.6, renderX, renderY, r * 1.55);
  if (isBlue) {
    auraGlow.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
    auraGlow.addColorStop(0.6, 'rgba(14, 165, 233, 0.22)');
    auraGlow.addColorStop(1, 'rgba(2, 132, 199, 0)');
  } else {
    auraGlow.addColorStop(0, 'rgba(249, 115, 22, 0.45)');
    auraGlow.addColorStop(0.6, 'rgba(234, 88, 12, 0.22)');
    auraGlow.addColorStop(1, 'rgba(194, 65, 12, 0)');
  }
  ctx.fillStyle = auraGlow;
  ctx.beginPath();
  ctx.arc(renderX, renderY, r * 1.55, 0, Math.PI * 2);
  ctx.fill();

  // 2. Animated Licking Flame Tongues dancing around the ball perimeter
  const tongues = 9;
  for (let i = 0; i < tongues; i++) {
    // Distribute tongues mainly over top and sides
    const baseAng = -Math.PI / 2 + ((i - (tongues - 1) / 2) * (Math.PI * 0.85)) / ((tongues - 1) / 2);
    const flutter = Math.sin(now * 15 + i * 1.4) * 0.18;
    const ang = baseAng + flutter;
    const wave = 0.85 + 0.35 * Math.sin(now * 18 + i * 2.1);
    const tongueLen = (r * 0.45 + 8) * wave;

    const rootX = renderX + Math.cos(ang) * (r * 0.88);
    const rootY = renderY + Math.sin(ang) * (r * 0.88);
    // Flames always lick upwards against gravity
    const tipX = renderX + Math.cos(ang) * (r * 0.88 + tongueLen) + Math.sin(now * 12 + i) * 3;
    const tipY = renderY + Math.sin(ang) * (r * 0.88 + tongueLen) - (tongueLen * 0.4);

    const perpX = -Math.sin(ang);
    const perpY = Math.cos(ang);
    const halfBase = 4.5 * wave;

    // Outer flame band
    ctx.beginPath();
    ctx.moveTo(rootX - perpX * halfBase, rootY - perpY * halfBase);
    ctx.quadraticCurveTo((rootX + tipX) * 0.5 - perpX * halfBase * 0.6, (rootY + tipY) * 0.5 - perpY * halfBase * 0.6, tipX, tipY);
    ctx.quadraticCurveTo((rootX + tipX) * 0.5 + perpX * halfBase * 0.6, (rootY + tipY) * 0.5 + perpY * halfBase * 0.6, rootX + perpX * halfBase, rootY + perpY * halfBase);
    ctx.closePath();
    ctx.fillStyle = isBlue ? '#0284c7' : '#ea580c';
    ctx.fill();

    // Inner bright tongue
    ctx.beginPath();
    ctx.moveTo(rootX - perpX * (halfBase * 0.5), rootY - perpY * (halfBase * 0.5));
    ctx.quadraticCurveTo((rootX + tipX) * 0.5, (rootY + tipY) * 0.5, tipX - Math.sin(now * 8) * 1, tipY + tongueLen * 0.3);
    ctx.quadraticCurveTo((rootX + tipX) * 0.5, (rootY + tipY) * 0.5, rootX + perpX * (halfBase * 0.5), rootY + perpY * (halfBase * 0.5));
    ctx.closePath();
    ctx.fillStyle = isBlue ? '#67e8f9' : '#fde047';
    ctx.fill();
  }

  // 3. Searing Burn Hit Flash / Flame Burst Animation when burn ticks damage
  if ((ball.burnFlashTimer || 0) > 0) {
    const flashProg = Math.max(0, ball.burnFlashTimer / 240); // 1.0 -> 0.0
    const flashR = r * (1.1 + (1 - flashProg) * 0.65);
    ctx.globalAlpha = flashProg;

    // Fiery shockwave ring
    ctx.strokeStyle = isBlue ? '#38bdf8' : '#f97316';
    ctx.lineWidth = Math.max(1.5, 4 * flashProg);
    ctx.beginPath();
    ctx.arc(renderX, renderY, flashR, 0, Math.PI * 2);
    ctx.stroke();

    // Inner searing flash flare
    const flashGrad = ctx.createRadialGradient(renderX, renderY, 0, renderX, renderY, r * 0.9);
    flashGrad.addColorStop(0, '#ffffff');
    flashGrad.addColorStop(0.5, isBlue ? 'rgba(103, 232, 249, 0.85)' : 'rgba(254, 240, 138, 0.85)');
    flashGrad.addColorStop(1, isBlue ? 'rgba(14, 165, 233, 0)' : 'rgba(249, 115, 22, 0)');
    ctx.fillStyle = flashGrad;
    ctx.beginPath();
    ctx.arc(renderX, renderY, r * 0.9, 0, Math.PI * 2);
    ctx.fill();

    // Fiery impact cross-flare
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.6 * flashProg;
    const flareLen = r * 1.3;
    ctx.beginPath();
    ctx.moveTo(renderX - flareLen, renderY);
    ctx.lineTo(renderX + flareLen, renderY);
    ctx.moveTo(renderX, renderY - flareLen);
    ctx.lineTo(renderX + flareLen, renderY);
    ctx.stroke();
  }

  ctx.restore();
}

// Virulent Poison aura and bubbling venom miasma for targets afflicted with Poison
function drawPoisonedBallAnimation(ctx, ball, renderX, renderY) {
  if (!ball.poisonStacks || ball.poisonStacks <= 0 || ball.isDead || ball.isDying) return;
  const now = performance.now() * 0.001;
  const r = ball.radius;
  const stacks = ball.poisonStacks;

  ctx.save();

  // 1. Toxic Emerald Miasma Corona around victim
  const auraGlow = ctx.createRadialGradient(renderX, renderY, r * 0.6, renderX, renderY, r * 1.5);
  auraGlow.addColorStop(0, 'rgba(16, 185, 129, 0.45)');
  auraGlow.addColorStop(0.6, 'rgba(5, 150, 105, 0.22)');
  auraGlow.addColorStop(1, 'rgba(2, 44, 34, 0)');
  ctx.fillStyle = auraGlow;
  ctx.beginPath();
  ctx.arc(renderX, renderY, r * 1.5, 0, Math.PI * 2);
  ctx.fill();

  // 2. Rising toxic bubbles
  const bubbleCount = Math.min(8, 3 + stacks);
  for (let i = 0; i < bubbleCount; i++) {
    const seed = i * 1.37;
    const bubbleProgress = (now * 1.4 + seed) % 1.0;
    const bAngle = -Math.PI / 2 + Math.sin(seed * 4 + now * 2) * 0.9;
    const bDist = r * (0.4 + bubbleProgress * 0.9);
    const bx = renderX + Math.cos(bAngle) * bDist + Math.sin(now * 5 + seed) * 3;
    const by = renderY + Math.sin(bAngle) * bDist - (bubbleProgress * 12);
    const bSize = Math.max(1.2, (1 - bubbleProgress) * 3.5);

    ctx.fillStyle = 'rgba(52, 211, 153, ' + (1 - bubbleProgress * 0.8) + ')';
    ctx.beginPath();
    ctx.arc(bx, by, bSize, 0, Math.PI * 2);
    ctx.fill();
  }

  // 3. Poison tick flash burst
  if ((ball.poisonFlashTimer || 0) > 0) {
    const flashProg = Math.max(0, ball.poisonFlashTimer / 200);
    ctx.globalAlpha = flashProg;
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = Math.max(1.2, 3 * flashProg);
    ctx.beginPath();
    ctx.arc(renderX, renderY, r * (1.05 + (1 - flashProg) * 0.5), 0, Math.PI * 2);
    ctx.stroke();
  }

  // 4. Subtle stack count badge above victim
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = 'rgba(2, 44, 34, 0.8)';
  ctx.strokeStyle = 'rgba(16, 185, 129, 0.85)';
  ctx.lineWidth = 1;
  const badgeW = 28 + (stacks >= 10 ? 8 : 0);
  const badgeH = 14;
  const badgeX = renderX - badgeW / 2;
  const badgeY = renderY - r - 18;
  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 4);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#34d399';
  ctx.font = 'bold 9px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`☣ x${stacks}`, renderX, badgeY + badgeH / 2);

  ctx.restore();
}

// Tactical lock-on targeting reticle for enemy marked by Spit Fire Ball (active for 5 seconds)
function drawSpitFireTargetReticle(ctx, ball, renderX, renderY, isLight) {
  if (!ball.spitFireTargetTimer || ball.spitFireTargetTimer <= 0 || ball.isDead || ball.isDying) return;
  const now = performance.now() * 0.001;
  const r = ball.radius;

  ctx.save();
  ctx.translate(renderX, renderY);

  // Rotating tactical cyan lock-on brackets
  const rot = now * 1.6;
  ctx.rotate(rot);

  const bracketR = r + 11 + Math.sin(now * 8) * 1.5;
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2.0;
  ctx.shadowColor = '#38bdf8';
  ctx.shadowBlur = 8;

  // 4 tactical corner brackets
  for (let b = 0; b < 4; b++) {
    const bAng = (b * Math.PI) / 2;
    ctx.save();
    ctx.rotate(bAng);
    ctx.beginPath();
    ctx.arc(0, 0, bracketR, -0.28, 0.28);
    ctx.stroke();

    // Corner tick arrow pointing inward
    ctx.beginPath();
    ctx.moveTo(bracketR + 3, 0);
    ctx.lineTo(bracketR - 2, 0);
    ctx.stroke();
    ctx.restore();
  }

  // Counter-rotating inner diamond
  ctx.rotate(-rot * 2);
  const diaR = r * 0.55 + Math.sin(now * 10) * 1.5;
  ctx.strokeStyle = '#67e8f9';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(diaR, 0);
  ctx.lineTo(0, diaR);
  ctx.lineTo(-diaR, 0);
  ctx.lineTo(0, -diaR);
  ctx.closePath();
  ctx.stroke();

  // Reset rotation for countdown timer tag
  ctx.rotate(rot);
  ctx.shadowBlur = 0;

  // Digital countdown tag: e.g. "2.4s"
  const secLeft = (ball.spitFireTargetTimer / 1000).toFixed(1);
  ctx.font = '700 9px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillStyle = isLight ? '#0284c7' : '#38bdf8';
  ctx.fillText(`${secLeft}s`, 0, bracketR + 13);

  ctx.restore();
}

// Accurate 4-sided tactical targeting reticle for enemy marked by Dagger Ball
function drawDaggerMarkReticle(ctx, ball, renderX, renderY, isLight) {
  if (!ball.daggerMarkTimer || ball.daggerMarkTimer <= 0 || ball.isDead || ball.isDying) return;
  const now = performance.now() * 0.001;
  const r = ball.radius;

  ctx.save();
  ctx.translate(renderX, renderY);

  // Gentle subtle breathing pulse (no wild spinning)
  const pulse = Math.sin(now * 4) * 1.2;
  const bracketR = r + 7 + pulse;

  ctx.strokeStyle = '#2dd4bf';
  ctx.lineWidth = 2.0;
  ctx.shadowColor = '#14b8a6';
  ctx.shadowBlur = 8;

  // 4 accurately positioned corner brackets framing the 4 sides of the ball
  for (let b = 0; b < 4; b++) {
    const bAng = (b * Math.PI) / 2;
    ctx.save();
    ctx.rotate(bAng);

    // Side curved bracket
    ctx.beginPath();
    ctx.arc(0, 0, bracketR, -0.32, 0.32);
    ctx.stroke();

    // Sharp inward targeting tick aligned directly with the center
    ctx.beginPath();
    ctx.moveTo(bracketR + 5, 0);
    ctx.lineTo(bracketR - 1, 0);
    ctx.stroke();

    ctx.restore();
  }

  // Clear digital pill indicator above the ball
  ctx.shadowBlur = 0;
  const secLeft = (ball.daggerMarkTimer / 1000).toFixed(1);
  const pillY = -r - 18;

  ctx.fillStyle = isLight ? 'rgba(240, 253, 250, 0.95)' : 'rgba(15, 23, 42, 0.9)';
  ctx.strokeStyle = '#2dd4bf';
  ctx.lineWidth = 1;
  const tagW = 76;
  const tagH = 15;
  ctx.beginPath();
  ctx.roundRect(-tagW / 2, pillY - tagH / 2, tagW, tagH, 3);
  ctx.fill();
  ctx.stroke();

  ctx.font = '700 8.5px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = isLight ? '#0f766e' : '#2dd4bf';
  ctx.fillText(`MARK ${secLeft}s`, 0, pillY);

  ctx.restore();
}

// 4-sided fencing crosshair for enemy marked by Rapier Ball
function drawRapierMarkReticle(ctx, ball, renderX, renderY, isLight) {
  if (!ball.rapierMarkTimer || ball.rapierMarkTimer <= 0 || ball.isDead || ball.isDying) return;
  const now = performance.now() * 0.001;
  const r = ball.radius;

  ctx.save();
  ctx.translate(renderX, renderY);

  const pulse = Math.sin(now * 6) * 1.5;
  const bracketR = r + 8 + pulse;

  // Crimson duelist crosshair rings
  ctx.strokeStyle = '#f43f5e';
  ctx.lineWidth = 1.8;
  ctx.shadowColor = '#f43f5e';
  ctx.shadowBlur = 8;

  // 4 corner fencing bracket marks
  for (let b = 0; b < 4; b++) {
    const bAng = (b * Math.PI) / 2 + Math.PI / 4;
    ctx.save();
    ctx.rotate(bAng);
    ctx.beginPath();
    ctx.arc(0, 0, bracketR, -0.28, 0.28);
    ctx.stroke();

    // Inward pointing needle tick
    ctx.beginPath();
    ctx.moveTo(bracketR + 4, 0);
    ctx.lineTo(bracketR - 3, 0);
    ctx.stroke();
    ctx.restore();
  }

  // Inner spinning rapier diamond
  const rot = now * 2.5;
  ctx.rotate(rot);
  const diaR = r * 0.45;
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(diaR, 0);
  ctx.lineTo(0, diaR);
  ctx.lineTo(-diaR, 0);
  ctx.lineTo(0, -diaR);
  ctx.closePath();
  ctx.stroke();

  ctx.rotate(-rot);
  ctx.shadowBlur = 0;

  // Countdown timer tag
  const secLeft = (ball.rapierMarkTimer / 1000).toFixed(1);
  const pillY = bracketR + 13;
  ctx.fillStyle = isLight ? 'rgba(255, 255, 255, 0.92)' : 'rgba(15, 23, 42, 0.9)';
  ctx.strokeStyle = '#f43f5e';
  ctx.lineWidth = 1;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(-30, pillY - 7, 60, 14, 4);
  else ctx.rect(-30, pillY - 7, 60, 14);
  ctx.fill();
  ctx.stroke();

  ctx.font = '700 8.5px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#f43f5e';
  ctx.fillText(`MARK ${secLeft}s`, 0, pillY);

  ctx.restore();
}

// Simplified, sleek kinetic repulsor radius indicator around Push Ball when Ready
function drawPushRadiusField(ctx, ball, x, y, isLight) {
  if (!ball.hasPushCharge || ball.isDead || ball.isDying) return;
  const pushRadius = ball.config?.pushRadius || 135;
  const fieldR = ball.radius + pushRadius;

  ctx.save();

  // Subtle translucent radius fill
  ctx.fillStyle = isLight ? 'rgba(99, 102, 241, 0.025)' : 'rgba(99, 102, 241, 0.035)';
  ctx.beginPath();
  ctx.arc(x, y, fieldR, 0, Math.PI * 2);
  ctx.fill();

  // Clean, thin dashed radius perimeter
  ctx.strokeStyle = isLight ? 'rgba(99, 102, 241, 0.45)' : 'rgba(165, 180, 252, 0.55)';
  ctx.lineWidth = 1.2;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.arc(x, y, fieldR, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

// Render embedded combat daggers stuck in victim body
function drawStuckDaggers(ctx, ball, renderX, renderY) {
  if (!ball.stuckDaggers || ball.stuckDaggers.length === 0 || ball.isDead || ball.isDying) return;
  ball.stuckDaggers.forEach(d => {
    ctx.save();
    ctx.translate(renderX, renderY);
    ctx.rotate(d.relAngle);

    const r = ball.radius;
    ctx.translate(r - 3, 0);
    ctx.rotate(Math.PI * 0.12);

    // Embedded blade tip inside flesh
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(-8, -3, 8, 6);

    // Bolster / guard
    ctx.fillStyle = '#134e4a';
    ctx.fillRect(0, -7, 5, 14);
    ctx.strokeStyle = '#2dd4bf';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(0, -7, 5, 14);

    // Protruding hilt
    ctx.fillStyle = '#0f766e';
    ctx.fillRect(5, -3.5, 14, 7);
    ctx.fillStyle = '#2dd4bf';
    ctx.fillRect(19, -4.5, 4, 9);

    // Protruding blade back length
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(0, -4);
    ctx.lineTo(6, -3.5);
    ctx.lineTo(6, 3.5);
    ctx.lineTo(0, 4);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  });
}

// Render frost / sluggish slow aura around slowed ball
function drawSlowEffect(ctx, ball, renderX, renderY) {
  if (!ball.isSlowed || ball.isDead || ball.isDying) return;
  const now = performance.now() * 0.003;
  const r = ball.radius + 6;
  ctx.save();
  ctx.beginPath();
  ctx.arc(renderX, renderY, r + Math.sin(now * 3) * 1.5, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(6, 182, 212, 0.65)';
  ctx.lineWidth = 2.0;
  ctx.setLineDash([4, 4]);
  ctx.stroke();

  // Ice crystal droplets around periphery
  for (let i = 0; i < 4; i++) {
    const ang = now + (i * Math.PI) / 2;
    const fx = renderX + Math.cos(ang) * (r + 3);
    const fy = renderY + Math.sin(ang) * (r + 3);
    ctx.beginPath();
    ctx.arc(fx, fy, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#67e8f9';
    ctx.fill();
  }
  ctx.restore();
}

// 3D Sphere Renderer with accessories
function draw3DBall(ctx, x, y, radius, config, teamColor, rotationAngle = 0, isHit = false, shield = 0, theme = 'dark', missingNotches = [], motionVector = null, extraData = null) {
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

  // Rotating sword for Sword Ball, Dual Sword Ball, Baby Sword Ball & Baby Dual Sword Ball
  if (config.id === BALL_TYPES.SWORD || config.id === BALL_TYPES.DUAL_SWORD || config.id === BALL_TYPES.BABY_SWORD || config.id === BALL_TYPES.BABY_DUAL_SWORD) {
    const isDual = config.id === BALL_TYPES.DUAL_SWORD || config.id === BALL_TYPES.BABY_DUAL_SWORD;
    const isBaby = config.id === BALL_TYPES.BABY_SWORD || config.id === BALL_TYPES.BABY_DUAL_SWORD;
    const angles = isDual ? [0, Math.PI] : [0];

    angles.forEach(offsetAng => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotationAngle + offsetAng);

      const scale = radius / (config.radius || 38);
      const bladeLength = (config.bladeLength || (isBaby ? (isDual ? 22 : 26) : (isDual ? 56 : 82))) * (radius < 25 ? scale : 1);
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
        bladeGrad.addColorStop(0.45, '#f8fafc');
        bladeGrad.addColorStop(1, '#cbd5e1');
      }

      // Bigger & thicker sword blade: wider base & fuller cross section
      const halfW = (isBaby ? 4.0 : (isDual ? 6.5 : 9.5)) * (radius < 25 ? scale : 1);
      const tipTaperDist = (isBaby ? 8 : 18) * (radius < 25 ? scale : 1);
      const guardW = (isBaby ? 8.0 : (isDual ? 12.0 : 16.0)) * (radius < 25 ? scale : 1);

      ctx.fillStyle = bladeGrad;
      ctx.beginPath();
      ctx.moveTo(radius - 2, -halfW);
      ctx.lineTo(radius + bladeLength - tipTaperDist, -halfW * 0.9);
      ctx.lineTo(radius + bladeLength, 0); // sharp tip
      ctx.lineTo(radius + bladeLength - tipTaperDist, halfW * 0.9);
      ctx.lineTo(radius - 2, halfW);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = isHit ? (isLight ? '#991b1b' : '#ffffff') : (isLight ? '#334155' : '#cbd5e1');
      ctx.lineWidth = isHit ? 2.0 : (isLight ? 1.2 : 1.5);
      ctx.stroke();

      // Sleek fuller groove down the center of the blade
      if (!isBaby) {
        ctx.strokeStyle = isLight ? '#64748b' : '#94a3b8';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(radius + 2, 0);
        ctx.lineTo(radius + bladeLength - tipTaperDist - 2, 0);
        ctx.stroke();
      }

      // Reinforced golden crossguard
      ctx.fillStyle = isHit ? (isLight ? '#991b1b' : '#ffffff') : '#d97706';
      ctx.fillRect(radius - 2, -guardW, isBaby ? 3.5 : 6.5, guardW * 2);

      // Crossguard decorative end caps
      if (!isBaby) {
        ctx.fillStyle = isLight ? '#b45309' : '#fbbf24';
        ctx.beginPath();
        ctx.arc(radius, -guardW, 2.5, 0, Math.PI * 2);
        ctx.arc(radius, guardW, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });
  }

  // Rotating fencing rapier for Rapier Ball
  if (config.id === BALL_TYPES.RAPIER) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotationAngle);

    const scale = radius / (config.radius || 34);
    const rapierLen = (config.rapierLength || 58) * (radius < 25 ? scale : 1);
    const isAiming = extraData?.isAiming;
    const isDashing = extraData?.isDashing;

    // Laser aiming guide line extending forward toward marked target
    if (isAiming && radius > 25) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(radius + rapierLen, 0);
      ctx.lineTo(radius + rapierLen + 180, 0);
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.85)';
      ctx.lineWidth = 1.6;
      ctx.setLineDash([5, 4]);
      ctx.stroke();

      // Targeting pulse dot at needle tip
      ctx.beginPath();
      ctx.arc(radius + rapierLen, 0, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#f43f5e';
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.restore();
    }

    // High velocity dash thrust speed aura
    if (isDashing && radius > 25) {
      ctx.save();
      ctx.fillStyle = 'rgba(244, 63, 94, 0.35)';
      ctx.beginPath();
      ctx.moveTo(radius + rapierLen + 14, 0);
      ctx.lineTo(radius + 10, -12);
      ctx.lineTo(radius - 5, -5);
      ctx.lineTo(radius - 5, 5);
      ctx.lineTo(radius + 10, 12);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // 1. Slender Needle-like Rapier Blade (long, ultra-thin needle profile)
    const bladeBaseW = Math.max(1.8, 3.2 * scale);
    const bladeGrad = ctx.createLinearGradient(radius - 2, 0, radius + rapierLen, 0);
    if (isHit || isDashing) {
      bladeGrad.addColorStop(0, '#ffffff');
      bladeGrad.addColorStop(0.5, '#f43f5e');
      bladeGrad.addColorStop(1, '#e11d48');
    } else {
      bladeGrad.addColorStop(0, '#cbd5e1');
      bladeGrad.addColorStop(0.4, '#ffffff');
      bladeGrad.addColorStop(1, '#94a3b8');
    }

    ctx.fillStyle = bladeGrad;
    ctx.beginPath();
    ctx.moveTo(radius - 2, -bladeBaseW);
    ctx.lineTo(radius + rapierLen - 6, -1.0 * scale);
    ctx.lineTo(radius + rapierLen, 0); // razor sharp needle point
    ctx.lineTo(radius + rapierLen - 6, 1.0 * scale);
    ctx.lineTo(radius - 2, bladeBaseW);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = isHit ? '#f43f5e' : (isLight ? '#334155' : '#e2e8f0');
    ctx.lineWidth = isHit ? 1.4 : 0.9;
    ctx.stroke();

    // Central gleam along needle blade
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(radius + 4, 0);
    ctx.lineTo(radius + rapierLen - 8, 0);
    ctx.stroke();

    // 2. Ornate Golden Swept Cup Hilt (curved bell guard protecting the duelist's hand)
    const cupR = Math.max(5, 10 * scale);
    const cupGrad = ctx.createLinearGradient(radius - 4, -cupR, radius + 8, cupR);
    cupGrad.addColorStop(0, '#fde047');
    cupGrad.addColorStop(0.5, '#d97706');
    cupGrad.addColorStop(1, '#92400e');

    ctx.fillStyle = cupGrad;
    ctx.beginPath();
    ctx.arc(radius + 2, 0, cupR, -Math.PI * 0.42, Math.PI * 0.42);
    ctx.lineTo(radius - 3, 0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = isLight ? '#78350f' : '#fef08a';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Swept guard quillons (upper & lower fencing bows)
    ctx.strokeStyle = isLight ? '#b45309' : '#fbbf24';
    ctx.lineWidth = 1.6 * scale;
    ctx.beginPath();
    ctx.moveTo(radius - 2, -cupR);
    ctx.quadraticCurveTo(radius + 8, -cupR - 3, radius + 11, -cupR + 4);
    ctx.moveTo(radius - 2, cupR);
    ctx.quadraticCurveTo(radius + 8, cupR + 3, radius + 11, cupR - 4);
    ctx.stroke();

    // 3. Duelist grip & golden round pommel
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(radius - 7 * scale, -2 * scale, 6 * scale, 4 * scale);
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(radius - 7 * scale, 0, 2.8 * scale, 0, Math.PI * 2);
    ctx.fill();

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

  // Combat Dagger for Dagger Ball (aims and shoots dagger; empty sheath when thrown)
  if (config.id === BALL_TYPES.DAGGER) {
    const hasDagger = extraData?.hasDagger !== false;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotationAngle);

    const daggerLen = config.daggerLength || 44;

    // Compact sheath / mounting bracket on the ball body
    ctx.fillStyle = isLight ? '#042f2e' : '#134e4a';
    ctx.fillRect(radius - 3, -6.5, 6, 13);
    ctx.strokeStyle = '#2dd4bf';
    ctx.lineWidth = 1.1;
    ctx.strokeRect(radius - 3, -6.5, 6, 13);

    if (hasDagger) {
      // Hilt guard & bolster (wider and more prominent)
      ctx.fillStyle = isHit ? '#f87171' : (isLight ? '#0f766e' : '#14b8a6');
      ctx.fillRect(radius + 3, -7.5, 4.5, 15);

      // Teal textured grip handle
      ctx.fillStyle = isHit ? '#dc2626' : '#0f766e';
      ctx.fillRect(radius + 7.5, -3.5, 9, 7);

      // Pommel ring
      ctx.fillStyle = '#2dd4bf';
      ctx.fillRect(radius + 16.5, -4.5, 3.5, 9);

      // Razor-sharp double-edged dagger blade (enlarged)
      const bladeGrad = ctx.createLinearGradient(radius + 4, 0, radius + daggerLen, 0);
      if (isHit) {
        bladeGrad.addColorStop(0, '#ffffff');
        bladeGrad.addColorStop(1, '#ef4444');
      } else {
        bladeGrad.addColorStop(0, '#94a3b8');
        bladeGrad.addColorStop(0.5, '#f8fafc');
        bladeGrad.addColorStop(1, '#cbd5e1');
      }

      ctx.fillStyle = bladeGrad;
      ctx.beginPath();
      ctx.moveTo(radius + 4, -4.5);
      ctx.lineTo(radius + daggerLen - 8, -4.0);
      ctx.lineTo(radius + daggerLen, 0); // razor sharp dagger tip
      ctx.lineTo(radius + daggerLen - 8, 4.0);
      ctx.lineTo(radius + 4, 4.5);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = isHit ? '#ef4444' : (isLight ? '#334155' : '#e2e8f0');
      ctx.lineWidth = isHit ? 1.6 : 1.2;
      ctx.stroke();

      // Cyan fuller groove in the center of the dagger
      ctx.strokeStyle = '#2dd4bf';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(radius + 7, 0);
      ctx.lineTo(radius + daggerLen - 10, 0);
      ctx.stroke();
    } else {
      // Empty holster with subtle indicator glow
      ctx.fillStyle = 'rgba(45, 212, 191, 0.35)';
      ctx.fillRect(radius + 2, -3, 5, 6);
    }

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
  if (config.id === BALL_TYPES.GUN || config.id === BALL_TYPES.BABY_GUN) {
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

  // Fire Ball & Spit Fire Ball: Cel-shaded living flame that bends & curves along its real travel path
  if (config.id === BALL_TYPES.FIRE || config.id === BALL_TYPES.SPIT_FIRE) {
    drawCelFireball(
      ctx,
      x,
      y,
      radius,
      motionVector,
      isHit,
      isLight,
      config.id === BALL_TYPES.SPIT_FIRE
    );
  }

  // 3D Sphere Body
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);

  if (config.id === BALL_TYPES.FIRE || config.id === BALL_TYPES.SPIT_FIRE) {
    // Fire Ball and Spit Fire Ball body is the cel-shaded flame itself (drawn above)
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

    // Dice Ball: 3D Porcelain Casino Die with Corner Pips and Animated Damage Roll Plaque
    if (config.id === BALL_TYPES.DICE) {
      ctx.save();
      ctx.clip(); // stay strictly inside spherical bounds

      const diceValue = extraData?.value ?? 1;
      const isRolling = extraData?.isRolling ?? false;
      const tier = extraData?.tier ?? (diceValue === 99 ? 'god' : (diceValue >= 30 ? 'high' : (diceValue >= 15 ? 'mid' : 'low')));
      const popScale = extraData?.popScale ?? 1.0;

      // Color palette based on current tier:
      let tierColor = '#0284c7';       // Mid (cyan/blue)
      let tierAccent = '#38bdf8';
      let tierGlow = 'rgba(56, 189, 248, 0.4)';
      let tierBg = 'rgba(2, 132, 199, 0.12)';
      if (tier === 'god') {
        tierColor = '#dc2626';        // God (radiant ruby/crimson)
        tierAccent = '#fbbf24';
        tierGlow = 'rgba(239, 68, 68, 0.8)';
        tierBg = 'rgba(239, 68, 68, 0.25)';
      } else if (tier === 'high') {
        tierColor = '#d97706';        // High (gold/amber)
        tierAccent = '#fbbf24';
        tierGlow = 'rgba(245, 158, 11, 0.55)';
        tierBg = 'rgba(245, 158, 11, 0.15)';
      } else if (tier === 'low') {
        tierColor = '#475569';        // Low (slate/silver)
        tierAccent = '#94a3b8';
        tierGlow = 'rgba(148, 163, 184, 0.3)';
        tierBg = 'rgba(100, 116, 139, 0.12)';
      }

      ctx.translate(x, y);

      // Subtle energetic vibration when rolling
      if (isRolling) {
        const rollWobble = Math.sin(Date.now() * 0.04) * 0.12;
        ctx.rotate(rollWobble);
      }

      // 1. Inset Rounded Die Face (gives the tactile appearance of a chamfered cube face on the sphere)
      const faceSize = radius * 1.34;
      const faceCorner = radius * 0.28;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(-faceSize / 2, -faceSize / 2, faceSize, faceSize, faceCorner);
      } else {
        ctx.rect(-faceSize / 2, -faceSize / 2, faceSize, faceSize);
      }
      const dieFaceGrad = ctx.createLinearGradient(-faceSize / 2, -faceSize / 2, faceSize / 2, faceSize / 2);
      dieFaceGrad.addColorStop(0, '#ffffff');
      dieFaceGrad.addColorStop(0.6, '#f1f5f9');
      dieFaceGrad.addColorStop(1, '#e2e8f0');
      ctx.fillStyle = dieFaceGrad;
      ctx.fill();

      ctx.strokeStyle = isRolling ? tierAccent : (isLight ? '#94a3b8' : '#64748b');
      ctx.lineWidth = isRolling ? 2.2 : 1.4;
      if (isRolling) {
        ctx.shadowColor = tierAccent;
        ctx.shadowBlur = 8;
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // 2. Four Recessed Casino Corner Pips
      const pipOffset = radius * 0.42;
      const pipRadius = radius * 0.095;
      const pipCoords = [
        [-pipOffset, -pipOffset],
        [pipOffset, -pipOffset],
        [-pipOffset, pipOffset],
        [pipOffset, pipOffset],
      ];

      pipCoords.forEach(([px, py]) => {
        // Recessed socket shadow
        ctx.beginPath();
        ctx.arc(px, py, pipRadius + 0.8, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.fill();

        // Pip obsidian core
        ctx.beginPath();
        ctx.arc(px, py, pipRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#0f172a';
        ctx.fill();

        // Specular glint
        ctx.beginPath();
        ctx.arc(px - pipRadius * 0.35, py - pipRadius * 0.35, pipRadius * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      });

      // 3. Central Damage Display Plaque / Badge
      ctx.save();
      ctx.scale(popScale, popScale);

      // Glowing circular plaque behind the number
      const plaqueR = radius * 0.38;
      ctx.beginPath();
      ctx.arc(0, 0, plaqueR, 0, Math.PI * 2);
      ctx.fillStyle = tierBg;
      ctx.fill();

      ctx.strokeStyle = tierGlow;
      ctx.lineWidth = isRolling ? 2.0 : 1.2;
      ctx.stroke();

      if (isRolling) {
        // Spinning slot-machine roll arcs
        const spinAng = (Date.now() * 0.015) % (Math.PI * 2);
        ctx.beginPath();
        ctx.arc(0, 0, plaqueR + 2, spinAng, spinAng + Math.PI * 1.2);
        ctx.strokeStyle = tierAccent;
        ctx.lineWidth = 2.0;
        ctx.stroke();
      }

      // Displayed damage number
      const numStr = String(diceValue);
      const fontSize = Math.round(radius * (numStr.length > 2 ? 0.44 : 0.52));
      ctx.font = `900 ${fontSize}px "JetBrains Mono", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Drop shadow for number
      ctx.fillStyle = isLight ? 'rgba(0, 0, 0, 0.15)' : 'rgba(0, 0, 0, 0.3)';
      ctx.fillText(numStr, 1, 1);

      // Main number fill
      ctx.fillStyle = tierColor;
      if (tier === 'high' || isRolling) {
        ctx.shadowColor = tierAccent;
        ctx.shadowBlur = isRolling ? 10 : 6;
      }
      ctx.fillText(numStr, 0, 0);
      ctx.shadowBlur = 0;

      // Small subtle "DMG" label above the number
      ctx.font = `800 ${Math.max(6, Math.round(radius * 0.16))}px "JetBrains Mono", monospace`;
      ctx.fillStyle = isRolling ? tierAccent : (isLight ? '#64748b' : '#94a3b8');
      ctx.fillText(tier === 'god' ? 'GOD' : 'DMG', 0, -plaqueR * 0.62);

      ctx.restore(); // scale restore

      ctx.restore(); // dice transform restore
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

    // Slow Ball: Heavy reinforced chassis rivets & steel band
    if (config.id === BALL_TYPES.SLOW) {
      ctx.save();
      ctx.clip();
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.arc(x, y, radius * 0.75, 0, Math.PI * 2);
      ctx.stroke();

      for (let r = 0; r < 4; r++) {
        const ang = (r * Math.PI) / 2 + rotationAngle;
        const rx = x + Math.cos(ang) * (radius * 0.75);
        const ry = y + Math.sin(ang) * (radius * 0.75);
        ctx.fillStyle = '#cbd5e1';
        ctx.beginPath();
        ctx.arc(rx, ry, 2.8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // Mother Ball: Cosmic maternal womb ring & orbiting embryonic satellites
    if (config.id === BALL_TYPES.MOTHER) {
      ctx.save();
      ctx.clip();
      const now = performance.now() * 0.003;

      // Pulsating maternal womb circle in center
      const wombR = radius * (0.42 + Math.sin(now * 3) * 0.04);
      ctx.strokeStyle = '#f472b6';
      ctx.lineWidth = 2.4;
      ctx.shadowColor = '#ec4899';
      ctx.shadowBlur = extraData?.isSpawningBrood ? 16 : 8;
      ctx.beginPath();
      ctx.arc(x, y, wombR, 0, Math.PI * 2);
      ctx.stroke();

      // Inner womb core glow
      ctx.fillStyle = extraData?.isSpawningBrood ? 'rgba(239, 68, 68, 0.45)' : 'rgba(244, 114, 182, 0.25)';
      ctx.beginPath();
      ctx.arc(x, y, wombR * 0.75, 0, Math.PI * 2);
      ctx.fill();

      // 3 orbiting embryonic baby dots around the womb representing the 3 varieties
      for (let i = 0; i < 3; i++) {
        const dotAng = (now * 1.4) + (i * Math.PI * 2) / 3;
        const dotDist = radius * 0.68;
        const dx = x + Math.cos(dotAng) * dotDist;
        const dy = y + Math.sin(dotAng) * dotDist;
        const dotColors = ['#93c5fd', '#fca5a5', '#fde047'];
        ctx.fillStyle = dotColors[i];
        ctx.shadowColor = dotColors[i];
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(dx, dy, 3.2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.shadowBlur = 0;
      ctx.restore();
    }

    // Priest Ball: Divine radiant cross and holy halo
    if (config.id === BALL_TYPES.PRIEST) {
      ctx.save();
      ctx.clip();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2.2;
      ctx.shadowColor = '#fde047';
      ctx.shadowBlur = 8;

      // Radiant holy cross on priest vestment
      const cSize = radius * 0.45;
      ctx.beginPath();
      ctx.moveTo(x, y - cSize);
      ctx.lineTo(x, y + cSize);
      ctx.moveTo(x - cSize * 0.65, y - cSize * 0.15);
      ctx.lineTo(x + cSize * 0.65, y - cSize * 0.15);
      ctx.stroke();

      // Golden halo ring
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(x, y, radius * 0.72, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    // Push Ball: Kinetic repulsor rings & spinning outward directional force emitter chevrons
    if (config.id === BALL_TYPES.PUSH) {
      ctx.save();
      ctx.clip();
      const now = performance.now() * 0.003;
      // Pattern spin: smoothly rotates continuously with physics angle or time
      const spin = rotationAngle !== undefined && rotationAngle !== 0 ? rotationAngle : (now * 1.5);

      // Concentric kinetic shockwave ripples inside body
      for (let r = 1; r <= 3; r++) {
        const ringProg = (now * 0.8 + r / 3) % 1;
        const ringR = radius * ringProg * 0.85;
        const alpha = (1 - ringProg) * 0.55;
        ctx.strokeStyle = `rgba(165, 180, 252, ${alpha})`;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(x, y, ringR, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Spinning curved kinetic vortex arcs
      ctx.strokeStyle = extraData?.hasPushCharge ? '#c7d2fe' : 'rgba(199, 210, 254, 0.7)';
      ctx.lineWidth = 1.8;
      for (let dir = 0; dir < 4; dir++) {
        const baseAng = (dir * Math.PI) / 2 + spin;
        ctx.beginPath();
        ctx.arc(x, y, radius * 0.58, baseAng, baseAng + 0.65);
        ctx.stroke();
      }

      // Outward 4-direction spinning repulsor force chevrons
      ctx.strokeStyle = extraData?.hasPushCharge ? '#ffffff' : '#c7d2fe';
      ctx.lineWidth = 2.2;
      for (let dir = 0; dir < 4; dir++) {
        const ang = (dir * Math.PI) / 2 + spin;
        const tipDist = radius * 0.74;
        const tx = x + Math.cos(ang) * tipDist;
        const ty = y + Math.sin(ang) * tipDist;
        const wingAng1 = ang + 2.5;
        const wingAng2 = ang - 2.5;
        ctx.beginPath();
        ctx.moveTo(tx + Math.cos(wingAng1) * 6, ty + Math.sin(wingAng1) * 6);
        ctx.lineTo(tx, ty);
        ctx.lineTo(tx + Math.cos(wingAng2) * 6, ty + Math.sin(wingAng2) * 6);
        ctx.stroke();
      }

      // Central kinetic core with glowing pulsing energy
      ctx.fillStyle = extraData?.hasPushCharge ? '#c7d2fe' : '#818cf8';
      ctx.shadowColor = extraData?.hasPushCharge ? '#a5b4fc' : '#6366f1';
      ctx.shadowBlur = extraData?.hasPushCharge ? 16 : 8;
      ctx.beginPath();
      ctx.arc(x, y, radius * (extraData?.hasPushCharge ? 0.30 : 0.22), 0, Math.PI * 2);
      ctx.fill();

      // Spinning micro-cross in core
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x - Math.cos(spin) * 5, y - Math.sin(spin) * 5);
      ctx.lineTo(x + Math.cos(spin) * 5, y + Math.sin(spin) * 5);
      ctx.moveTo(x - Math.cos(spin + Math.PI / 2) * 5, y - Math.sin(spin + Math.PI / 2) * 5);
      ctx.lineTo(x + Math.cos(spin + Math.PI / 2) * 5, y + Math.sin(spin + Math.PI / 2) * 5);
      ctx.stroke();

      if (extraData?.hasPushCharge) {
        ctx.strokeStyle = '#e0e7ff';
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.arc(x, y, radius * 0.88 + Math.sin(now * 8) * 1.5, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.shadowBlur = 0;

      ctx.restore();
    }

    // Rapier Ball: Simple sleek body like Dagger Ball in duelist blue
    if (config.id === BALL_TYPES.RAPIER) {
      ctx.save();
      ctx.clip();
      const isAiming = extraData?.isAiming;
      const isDashing = extraData?.isDashing;

      // Clean, simple duelist blue sheen (simple like Dagger Ball)
      if (isDashing || isAiming) {
        ctx.fillStyle = isDashing ? 'rgba(96, 165, 250, 0.45)' : 'rgba(59, 130, 246, 0.25)';
        ctx.beginPath();
        ctx.arc(x, y, radius * 0.75, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#93c5fd';
        ctx.lineWidth = 1.4;
        ctx.shadowColor = '#60a5fa';
        ctx.shadowBlur = isDashing ? 10 : 4;
        ctx.beginPath();
        ctx.arc(x, y, radius * 0.4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

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
    if (config.id === BALL_TYPES.GUN || config.id === BALL_TYPES.BABY_GUN) {
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

    // Poison Ball: Toxic bubbling venom core & virulent biohazard droplets
    if (config.id === BALL_TYPES.POISON) {
      ctx.save();
      ctx.clip();
      const now = performance.now() * 0.003;
      const spin = rotationAngle !== undefined && rotationAngle !== 0 ? rotationAngle : (now * 1.2);

      // Bubbling toxic micro-droplets on sphere
      const bubbleOffsets = [
        { angle: spin, rDist: radius * 0.45, size: radius * 0.18 },
        { angle: spin + 2.1, rDist: radius * 0.52, size: radius * 0.14 },
        { angle: spin + 4.2, rDist: radius * 0.40, size: radius * 0.16 },
        { angle: spin + 1.1, rDist: radius * 0.25, size: radius * 0.12 },
      ];

      bubbleOffsets.forEach(b => {
        const bx = x + Math.cos(b.angle) * b.rDist;
        const by = y + Math.sin(b.angle) * b.rDist;
        ctx.fillStyle = 'rgba(52, 211, 153, 0.65)';
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(bx, by, b.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(bx - b.size * 0.35, by - b.size * 0.35, b.size * 0.35, 0, Math.PI * 2);
        ctx.fill();
      });

      // Central virulent venom droplet core
      ctx.fillStyle = '#10b981';
      ctx.shadowColor = '#34d399';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(x, y + radius * 0.05, radius * 0.22, 0, Math.PI * 2);
      ctx.fill();

      // Sharp venom droplet tip pointing up
      ctx.beginPath();
      ctx.moveTo(x - radius * 0.16, y);
      ctx.lineTo(x, y - radius * 0.38);
      ctx.lineTo(x + radius * 0.16, y);
      ctx.closePath();
      ctx.fill();

      ctx.shadowBlur = 0;
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

  // Radiant shimmer ring for Dice Ball when in High or God tier
  if (config.id === BALL_TYPES.DICE && (extraData?.tier === 'high' || extraData?.tier === 'god') && !isHit) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, radius + 2.5, 0, Math.PI * 2);
    const isGod = extraData?.tier === 'god';
    ctx.strokeStyle = isGod ? 'rgba(239, 68, 68, 0.85)' : 'rgba(245, 158, 11, 0.55)';
    ctx.lineWidth = isGod ? 2.8 : 2.0;
    ctx.shadowColor = isGod ? '#ef4444' : '#f59e0b';
    ctx.shadowBlur = isGod ? 14 : 8;
    ctx.stroke();
    ctx.restore();
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

    const isFire = config.id === BALL_TYPES.FIRE || config.id === BALL_TYPES.SPIT_FIRE;
    const previewRadius = isFire ? 12 : Math.min(20, config.radius * 0.54);
    const previewY = isFire ? 44 : 32;
    const isSword = config.id === BALL_TYPES.SWORD || config.id === BALL_TYPES.DUAL_SWORD || config.id === BALL_TYPES.RAPIER || config.id === BALL_TYPES.BABY_SWORD || config.id === BALL_TYPES.BABY_DUAL_SWORD;
    const rotation = isSword ? -0.4 : ((config.id === BALL_TYPES.KNIFE || config.id === BALL_TYPES.DAGGER) ? -0.42 : (config.id === BALL_TYPES.GUN ? -0.48 : (config.id === BALL_TYPES.SNIPER ? -0.48 : (config.id === BALL_TYPES.THORN ? 0.25 : (isFire ? 0.35 : 0)))));
    const diceState = config.id === BALL_TYPES.DICE ? { value: 1, isRolling: false, tier: 'low', popScale: 1.0 } : null;
    draw3DBall(ctx, 32, previewY, previewRadius, config, null, rotation, false, 0, theme, [], { vx: 0, vy: 0 }, diceState);
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

  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingFading, setLoadingFading] = useState(false);

  const dismissLoadingScreen = () => {
    if (loadingFading) return;
    setLoadingFading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 400);
  };

  useEffect(() => {
    let mounted = true;
    const startTime = performance.now();

    // Preload both SFX audio assets and the 3 action showcase GIFs
    const gifUrls = [
      '/gif/bbs-gif1.gif',
      '/gif/bbs-gif2.gif',
      '/gif/bbs-gif3.gif',
    ];

    const preloadGifs = gifUrls.map(url => new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => resolve();
      img.src = url;
    }));

    const soundPreload = sound.preloadAll(({ percent }) => {
      if (!mounted) return;
      setLoadingProgress(percent);
    });

    Promise.all([soundPreload, ...preloadGifs]).then(() => {
      if (!mounted) return;
      setLoadingProgress(100);

      const elapsed = performance.now() - startTime;
      const minDisplay = Math.max(0, 2400 - elapsed);

      setTimeout(() => {
        if (!mounted) return;
        setLoadingFading(true);
        setTimeout(() => {
          if (!mounted) return;
          setIsLoading(false);
        }, 450);
      }, minDisplay);
    });

    return () => {
      mounted = false;
    };
  }, []);

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
    flyingDaggers: [],
    thornTraps: [],
    shardBursts: [],
    spitFireBursts: [],
    flyingFlames: [],
    damageTexts: [],
    particles: [],
    confetti: [],
    trailPoints: [],
    fireTrails: [],
    fireImpacts: [],
    pushShockwaves: [],
    blessRings: [],
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
    physicsRef.current.flyingDaggers = [];
    physicsRef.current.thornTraps = [];
    physicsRef.current.shardBursts = [];
    physicsRef.current.spitFireBursts = [];
    physicsRef.current.flyingFlames = [];
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
        hasTower: b.hasTower || b.config?.hasTower || b.type === BALL_TYPES.SLOW,
        hasHard: b.hasHard || b.config?.hasHard || b.type === BALL_TYPES.STEEL || b.type === BALL_TYPES.STONE,
        hitCount: 0,
        bleedTicksLeft: 0,
        bleedTimer: 0,
        bleedSource: null,
        bleedQueue: [],
        burnTicksLeft: 0,
        burnTimer: 0,
        burnSource: null,
        burnQueue: [],
        poisonStacks: 0,
        poisonDuration: 0,
        poisonTickTimer: 0,
        poisonFlashTimer: 0,
        poisonSource: null,
        healTicksLeft: 0,
        healTimer: 0,
        healQueue: [],
        isBlueBurn: false,
        burnFlashTimer: 0,
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
        daggerAngle: b.angle || 0,
        daggerSpeed: 0.08,
        daggerState: 'spinning',
        daggerDelayTimer: 0,
        daggerAimTimer: 0,
        markedEnemyId: null,
        daggerCooldown: 0,
        hasDagger: b.type === BALL_TYPES.DAGGER,
        isWeaponless: false,
        weaponlessTimer: 0,
        weaponlessMaxTimer: 4000,
        stuckDaggers: [],
        rapierAngle: b.angle || 0,
        rapierSpeed: 0.055,
        rapierState: 'spinning',
        rapierAimTimer: 0,
        rapierDashTimer: 0,
        rapierCooldown: 0,
        markedRapierTargetId: null,
        dashTimer: 0,
        rapierMarkTimer: 0,
        hasPushCharge: false,
        isPushActive: false,
        pushTierIndex: 0,
        pushCooldownTimer: 0,
        pushArmTimer: 0,
        pushAngle: b.angle || 0,
        blessTimer: b.type === BALL_TYPES.PRIEST ? (b.config?.blessCooldown || 9000) : 0,
        blessActiveTimer: 0,
        broodTimer: b.type === BALL_TYPES.MOTHER ? (b.config?.broodCooldown || 5500) : 0,
        broodNextType: 'BABY_NORMAL',
        isSpawningBrood: false,
        pushActiveTimer: 0,
        knockbackTimer: 0,
        daggerMarkTimer: 0,
        isSlowed: false,
        slowTimer: 0,
        spikeAngle: b.angle || 0,
        hammerAngle: b.angle,
        hammerSpeed: 0.055,
        hammerHitFreezeTimer: 0,
        shardAngle: b.angle || 0,
        shardTargetTimer: 0,
        spitFireTargetTimer: 0,
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
        flameGrowCooldown: 0,
        growDelayTimer: 0,
        hasTriggeredGrowFx: false,
        healTimer: 6000,
        healFlashTimer: 0,
        diceHits: 0,
        dicePity: 0,
        diceDamage: 1,
        displayedDamage: 1,
        diceRollTimer: 0,
        diceRollTarget: 1,
        diceTier: 'low',
        dicePopScale: 1.0,
        missingNotches: [],
        fireHistory: (b.type === BALL_TYPES.FIRE || b.type === BALL_TYPES.SPIT_FIRE) ? Array.from({ length: 16 }, (_, idx) => ({
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
      flyingDaggers: [],
      thornTraps: [],
      shardBursts: [],
      spitFireBursts: [],
      flyingFlames: [],
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
    physicsRef.current.flyingDaggers = [];
    physicsRef.current.thornTraps = [];
    physicsRef.current.shardBursts = [];
    physicsRef.current.spitFireBursts = [];
    physicsRef.current.flyingFlames = [];
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
    physicsRef.current.flyingDaggers = [];
    physicsRef.current.thornTraps = [];
    physicsRef.current.shardBursts = [];
    physicsRef.current.spitFireBursts = [];
    physicsRef.current.flyingFlames = [];
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

    const spawnPoisonText = (x, y, amount) => {
      const offsetX = (Math.random() - 0.5) * 12;
      physicsRef.current.damageTexts.push({
        x: x + offsetX,
        y: y - 14,
        text: `-${Math.round(amount)}`,
        fontSize: 18,
        opacity: 1.0,
        isPoison: true,
        life: 1.0,
        decay: 0.022,
        vy: -0.65,
      });
    };

    const triggerGrowBallExpansion = (growBall, fromFlame = false) => {
      if (growBall.isDead || growBall.isDying) return;
      if (!fromFlame && (growBall.growCooldown || 0) > 0) return; // Only trigger ONCE per distinct collision impact
      if (fromFlame && (growBall.flameGrowCooldown || 0) > 0) return;

      const growth = fromFlame
        ? (growBall.config?.growthPerFlameHit || 3.2)
        : (growBall.config?.growthPerHit || 7.5);
      const maxR = growBall.config?.maxRadius || 136;
      const maxM = growBall.config?.maxMass || 10.0;
      const baseR = growBall.config?.radius || 34;
      const baseM = growBall.config?.mass || 1.0;

      const currentTargetR = growBall.targetRadius || growBall.radius;
      if (currentTargetR < maxR) {
        if (fromFlame) {
          growBall.flameGrowCooldown = 0.12; // Rapid expansion as spit flames strike
          growBall.growDelayTimer = 0; // Immediate growth on flame hit
        } else {
          growBall.growCooldown = 0.55;
          growBall.growDelayTimer = 0.28;
        }
        growBall.hasTriggeredGrowFx = false;

        const nextTargetR = Math.min(maxR, currentTargetR + growth);
        growBall.targetRadius = nextTargetR;

        // Proportional mass scaling up to 10.0 max mass
        const progress = Math.min(1, Math.max(0, (nextTargetR - baseR) / (maxR - baseR)));
        growBall.targetMass = Math.min(maxM, Math.round((baseM + progress * (maxM - baseM)) * 10) / 10);

        sound.play('growing', fromFlame ? 0.65 : 0.85);
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

    const triggerSpitFireBurst = (attacker, target) => {
      if (target.isDead || target.isDying) return;
      // Inflict 5-second Flame Lock on the struck enemy
      target.spitFireTargetTimer = 5000;

      // Ensure active continuous burst exists for this attacker & target
      const existing = physicsRef.current.spitFireBursts.find(
        sb => sb.attackerId === attacker.id && sb.targetId === target.id
      );
      if (!existing) {
        physicsRef.current.spitFireBursts.push({
          attackerId: attacker.id,
          targetId: target.id,
          target: target,
          attackerTeam: attacker.team,
          originX: attacker.x,
          originY: attacker.y,
          timer: 0, // 1st flame launches immediately
          interval: 140, // Continuous mini flame barrage every 140ms while Flame Lock is active
          shotCount: 0,
        });
      }
    };

    const applyDamage = (victim, amount, attacker, isCritical = false, isBurn = false) => {
      if (victim.isDead || victim.isDying) return;

      if (isBurn) {
        victim.burnFlashTimer = 220;
      }

      if (victim.type === BALL_TYPES.STEEL) {
        victim.hitCount = (victim.hitCount || 0) + 1;
        if (victim.hitCount % 4 === 0) {
          const shieldVal = victim.config?.shieldAmount || 20;
          victim.shield = (victim.shield || 0) + shieldVal;
          spawnParticles(victim.x, victim.y, '#38bdf8', 16, 2.0);
          sound.play('armorUp', 0.9);
        }
      }

      // Dice Ball: Count damage received for Pity system (7 hits = absorbs pity to change Mid/Low to High Roll)
      if (victim.type === BALL_TYPES.DICE && amount > 0) {
        victim.dicePity = Math.min(7, (victim.dicePity || 0) + 1);

        // If pity is available (7 hits), absorb pity and change to High Roll if current roll is Mid or Low (not High or God)
        const isMidOrLow = victim.diceTier === 'low' || victim.diceTier === 'mid' || !victim.diceTier || (victim.damage < 30 && victim.damage !== 99);
        if (victim.dicePity >= 7 && isMidOrLow) {
          victim.dicePity = 0; // absorb the pity
          const highDmg = Math.floor(Math.random() * (50 - 30 + 1)) + 30;
          victim.damage = highDmg;
          victim.displayedDamage = highDmg;
          victim.diceTier = 'high';
          victim.dicePopScale = 1.5;
          sound.play('diceRollHigh', 0.95);
          spawnParticles(victim.x, victim.y, '#fbbf24', 16, 2.5);
          spawnParticles(victim.x, victim.y, '#f59e0b', 10, 2.0);
        } else if (victim.dicePity === 7) {
          spawnParticles(victim.x, victim.y, '#fbbf24', 10, 2.0);
        }
      }

      let remainingDmg = amount;
      // Slow debuff: Reduces Damage Dealt by 25%
      if (attacker && attacker.isSlowed && !isBurn) {
        remainingDmg = Math.max(1, Math.round(remainingDmg * 0.75));
      }
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

        // Auto-retrieve stuck daggers back to owners if victim dies
        if (victim.stuckDaggers && victim.stuckDaggers.length > 0) {
          sound.play('daggerPull', 0.9);
          victim.stuckDaggers.forEach(d => {
            const owner = physicsRef.current.balls.find(b => b.id === d.ownerId);
            if (owner && !owner.isDead) {
              owner.hasDagger = true;
              owner.isWeaponless = false;
              owner.daggerState = 'spinning';
              owner.markedEnemyId = null;
              owner.daggerDelayTimer = 0;
              owner.daggerAimTimer = 0;
            }
          });
          victim.stuckDaggers = [];
          victim.isSlowed = false;
        }
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

      // Update divine blessing aura rings
      const blessRings = physicsRef.current.blessRings;
      if (blessRings) {
        for (let i = blessRings.length - 1; i >= 0; i--) {
          const br = blessRings[i];
          br.radius += (br.maxRadius - br.radius) * 0.18;
          br.life -= br.decay;
          if (br.life <= 0) blessRings.splice(i, 1);
        }
      }

      // Update kinetic push shockwaves
      const pushShockwaves = physicsRef.current.pushShockwaves;
      if (pushShockwaves) {
        for (let i = pushShockwaves.length - 1; i >= 0; i--) {
          const ps = pushShockwaves[i];
          ps.radius += (ps.maxRadius - ps.radius) * 0.22;
          ps.life -= ps.decay;
          if (ps.life <= 0) pushShockwaves.splice(i, 1);
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
      const hasLivingFireBall = activeBalls.some(b => b.type === BALL_TYPES.FIRE || b.type === BALL_TYPES.SPIT_FIRE);
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
      const spawnedBabyBalls = [];

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
                  hasDagger: false,
                  daggerAngle: 0,
                  daggerCooldown: 0,
                  isWeaponless: false,
                  weaponlessTimer: 0,
                  weaponlessMaxTimer: 7000,
                  stuckDaggers: [],
                  isSlowed: false,
                  slowTimer: 0,
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

        // Dice Ball: Fast slot-machine roll shuffle animation & number settling
        if (ball.type === BALL_TYPES.DICE && !ball.isDead && !ball.isDying) {
          if (ball.diceRollTimer > 0) {
            ball.diceRollTimer = Math.max(0, ball.diceRollTimer - safeDt * 1000);
            // Snappy rapid number shuffle during roll
            if (Math.random() < 0.65 || ball.displayedDamage === undefined) {
              if (ball.diceTier === 'god') {
                ball.displayedDamage = 99;
              } else if (ball.diceTier === 'high') {
                ball.displayedDamage = Math.floor(Math.random() * (50 - 30 + 1)) + 30;
              } else if (ball.diceTier === 'mid') {
                ball.displayedDamage = Math.floor(Math.random() * (25 - 15 + 1)) + 15;
              } else {
                ball.displayedDamage = Math.floor(Math.random() * (12 - 5 + 1)) + 5;
              }
            }

            if (ball.diceRollTimer <= 0) {
              ball.diceRollTimer = 0;
              ball.damage = ball.diceRollTarget;
              ball.displayedDamage = ball.diceRollTarget;
              ball.dicePopScale = 1.45; // punchy bounce on landing
              const isGod = ball.diceTier === 'god';
              const sparkCol = isGod ? '#ef4444' : (ball.diceTier === 'high' ? '#fbbf24' : (ball.diceTier === 'mid' ? '#38bdf8' : '#cbd5e1'));
              spawnParticles(ball.x, ball.y, sparkCol, isGod ? 24 : 14, isGod ? 3.0 : 2.2);
              if (isGod) spawnParticles(ball.x, ball.y, '#fbbf24', 12, 2.5);
            }
          }

          if (ball.dicePopScale > 1.0) {
            ball.dicePopScale = Math.max(1.0, ball.dicePopScale - safeDt * 2.5);
          }
        }

        // Fire Ball & Spit Fire Ball: Literal roaring fire streaming behind motion, dropping persistent burning ground trail
        if ((ball.type === BALL_TYPES.FIRE || ball.type === BALL_TYPES.SPIT_FIRE) && !ball.isDead && !ball.isDying) {
          ball.fireAngle = (ball.fireAngle || 0) + safeDt * 3.6;
          const isSpitFire = ball.type === BALL_TYPES.SPIT_FIRE;

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
              isBlue: isSpitFire,
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
              color: isSpitFire
                ? (Math.random() > 0.4 ? '#38bdf8' : (Math.random() > 0.3 ? '#67e8f9' : '#ffffff'))
                : (Math.random() > 0.4 ? '#f97316' : (Math.random() > 0.3 ? '#fef08a' : '#ea580c')),
              size: Math.random() * 2.8 + 1.8,
            });
          }
        }

        // Burning victim: Wisps of flame rising upward
        if (ball.burnTicksLeft > 0 && !ball.isDead && !ball.isDying && Math.random() < 0.45) {
          particles.push({
            x: ball.x + (Math.random() - 0.5) * ball.radius * 0.85,
            y: ball.y + (Math.random() - 0.5) * ball.radius * 0.85,
            vx: (Math.random() - 0.5) * 0.9,
            vy: -1.2 - Math.random() * 1.8,
            life: 1.0,
            decay: 0.05 + Math.random() * 0.03,
            color: ball.isBlueBurn
              ? (Math.random() > 0.4 ? '#38bdf8' : '#67e8f9')
              : (Math.random() > 0.4 ? '#f97316' : '#fde047'),
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
        if (ball.burnFlashTimer > 0) ball.burnFlashTimer = Math.max(0, ball.burnFlashTimer - safeDt * 1000);
        if (ball.spitFireTargetTimer > 0) ball.spitFireTargetTimer = Math.max(0, ball.spitFireTargetTimer - safeDt * 1000);

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

        // Process Burn Side Effect (queue-based true fire damage ticks)
        if (ball.burnTicksLeft > 0 && !ball.isDead) {
          ball.burnTimer -= safeDt * 1000;
          if (ball.burnTimer <= 0) {
            ball.burnTicksLeft -= 1;
            ball.burnTimer = 480; // next tick delay
            const tickDmg = (ball.burnQueue && ball.burnQueue.length > 0) ? ball.burnQueue.shift() : 1;
            ball.burnFlashTimer = 240;
            applyDamage(ball, tickDmg, ball.burnSource || ball, false, true);

            // Searing flame particle burst
            if (ball.isBlueBurn) {
              spawnParticles(ball.x, ball.y, '#38bdf8', 8, 1.4);
              spawnParticles(ball.x, ball.y, '#67e8f9', 5, 1.6);
              spawnParticles(ball.x, ball.y, '#ffffff', 4, 1.0);
            } else {
              spawnParticles(ball.x, ball.y, '#f97316', 7, 1.2);
              spawnParticles(ball.x, ball.y, '#fde047', 4, 1.4);
              spawnParticles(ball.x, ball.y, '#7c2d12', 3, 0.8);
            }
            sound.play('fireballBurn', 0.85);
          }
        }

        // Process Virulent Stacking Poison (12s duration, -1/tick per stack every 0.8s, stacks limitless)
        if (ball.poisonStacks > 0 && !ball.isDead) {
          ball.poisonDuration = Math.max(0, (ball.poisonDuration || 0) - safeDt * 1000);
          if (ball.poisonDuration <= 0) {
            // 12s expired without a follow-up hit: poison clears completely
            ball.poisonStacks = 0;
            ball.poisonTickTimer = 0;
          } else {
            ball.poisonTickTimer = (ball.poisonTickTimer !== undefined ? ball.poisonTickTimer : 800) - safeDt * 1000;
            if (ball.poisonTickTimer <= 0) {
              ball.poisonTickTimer = 800; // deals damage every 0.8 seconds
              const tickDmg = ball.poisonStacks; // 1 stack = 1 DMG, 2 stacks = 2 DMG, n stacks = n DMG
              ball.poisonFlashTimer = 200;
              applyDamage(ball, tickDmg, ball.poisonSource || ball, false);
              spawnPoisonText(ball.x, ball.y, tickDmg);

              // Venom bubbling particle burst
              spawnParticles(ball.x, ball.y, '#10b981', 6, 1.2);
              spawnParticles(ball.x, ball.y, '#34d399', 4, 1.4);
              sound.play('thornHit', 0.65);
            }
          }
        }
        if (ball.poisonFlashTimer > 0) ball.poisonFlashTimer = Math.max(0, ball.poisonFlashTimer - safeDt * 1000);

        // Process Heal Status Effect (queue-based healing ticks: +5, +3, +1, +1)
        if (ball.healTicksLeft > 0 && !ball.isDead) {
          ball.healTimer = (ball.healTimer !== undefined ? ball.healTimer : 450) - safeDt * 1000;
          if (ball.healTimer <= 0) {
            ball.healTicksLeft -= 1;
            ball.healTimer = 450;
            const tickHeal = (ball.healQueue && ball.healQueue.length > 0) ? ball.healQueue.shift() : 1;
            if (ball.hp < ball.maxHp) {
              const prevHp = ball.hp;
              ball.hp = Math.min(ball.maxHp, ball.hp + tickHeal);
              const actual = ball.hp - prevHp;
              if (actual > 0) spawnHealText(ball.x, ball.y, actual);
            }
            ball.healFlashTimer = 350;
            spawnParticles(ball.x, ball.y, '#34d399', 6, 1.2);
            spawnParticles(ball.x, ball.y, '#fde047', 4, 1.4);
            sound.play('heal', 0.7);
          }
        }

        if (ball.type === BALL_TYPES.SWORD || ball.type === BALL_TYPES.DUAL_SWORD) {
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

        // Push Ball: Smooth continuous spin of kinetic repulsor pattern
        if (ball.type === BALL_TYPES.PUSH) {
          ball.pushAngle = ((ball.pushAngle || 0) + 0.04) % (Math.PI * 2);
        }

        // Baby Sword Ball & Baby Dual Sword Ball: Spinning mini blade
        if ((ball.type === BALL_TYPES.BABY_SWORD || ball.type === BALL_TYPES.BABY_DUAL_SWORD) && !ball.isDead && !ball.isDying) {
          if (ball.swordHitFreezeTimer > 0) {
            ball.swordHitFreezeTimer = Math.max(0, ball.swordHitFreezeTimer - safeDt * 1000);
          } else {
            ball.swordAngle = ((ball.swordAngle || 0) + (ball.swordSpeed || 0.08)) % (Math.PI * 2);
          }
        }

        // Baby Gun Ball: Rotating nozzle & shooting mini cannon pellets
        if (ball.type === BALL_TYPES.BABY_GUN && !ball.isDead && !ball.isDying && !isSoloWinner) {
          ball.gunAngle = ((ball.gunAngle || 0) + (ball.gunSpeed || 0.05)) % (Math.PI * 2);
          ball.gunCooldown = (ball.gunCooldown !== undefined ? ball.gunCooldown : 3500) - safeDt * 1000;
          if (ball.gunCooldown <= 0) {
            ball.gunCooldown = 3500;
            const muzzleDist = ball.radius + 12;
            const mx = ball.x + Math.cos(ball.gunAngle) * muzzleDist;
            const my = ball.y + Math.sin(ball.gunAngle) * muzzleDist;
            sound.play('bulletShot', 0.35);
            spawnParticles(mx, my, '#fbbf24', 6, 1.8);
            const bulletSpeed = 8.5;
            physicsRef.current.flyingBullets.push({
              x: mx,
              y: my,
              vx: Math.cos(ball.gunAngle) * bulletSpeed,
              vy: Math.sin(ball.gunAngle) * bulletSpeed,
              angle: ball.gunAngle,
              ownerId: ball.id,
              ownerTeam: ball.team,
              ownerBall: ball,
              damage: ball.config?.bulletDamage || 14,
              life: 2.2,
              radius: 3.5,
            });
          }
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
                damage: ball.config?.bulletDamage || 15,
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
              ball.sniperAimTimer = ball.config?.aimDuration || 1000;
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
        if (ball.flameGrowCooldown > 0) {
          ball.flameGrowCooldown = Math.max(0, ball.flameGrowCooldown - safeDt);
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

        // Dagger Ball: spins & bounces, marks on contact, 2s delay, 2s moving aim, throw
        if (ball.type === BALL_TYPES.DAGGER && !ball.isDead && !ball.isDying && !isSoloWinner) {
          if (ball.daggerState === undefined) ball.daggerState = ball.hasDagger ? 'spinning' : 'weaponless';
          if (ball.daggerSpeed === undefined) ball.daggerSpeed = 0.08;

          const livingEnemies = balls.filter(b => b.team !== ball.team && !b.isDead && !b.isDying);

          // Check marked enemy status
          let markedEnemy = ball.markedEnemyId ? livingEnemies.find(e => e.id === ball.markedEnemyId) : null;
          if (ball.markedEnemyId && !markedEnemy) {
            // Target died: if aiming, try retargeting nearest living enemy; otherwise return to spinning
            if (ball.daggerState === 'aiming' && livingEnemies.length > 0) {
              let nearest = null;
              let minD = Infinity;
              livingEnemies.forEach(e => {
                const d = Math.hypot(e.x - ball.x, e.y - ball.y);
                if (d < minD) { minD = d; nearest = e; }
              });
              if (nearest) {
                ball.markedEnemyId = nearest.id;
                markedEnemy = nearest;
                nearest.daggerMarkTimer = ball.daggerAimTimer;
              } else {
                ball.daggerState = 'spinning';
                ball.markedEnemyId = null;
                const a = Math.random() * Math.PI * 2;
                ball.vx = Math.cos(a) * (ball.speed || 3);
                ball.vy = Math.sin(a) * (ball.speed || 3);
              }
            } else {
              ball.daggerState = 'spinning';
              ball.markedEnemyId = null;
              if (Math.hypot(ball.vx, ball.vy) < 0.1) {
                const a = Math.random() * Math.PI * 2;
                ball.vx = Math.cos(a) * (ball.speed || 3);
                ball.vy = Math.sin(a) * (ball.speed || 3);
              }
            }
          }

          if (ball.daggerState === 'spinning') {
            // Spins around and bounces like the others do
            ball.daggerAngle = ((ball.daggerAngle || 0) + ball.daggerSpeed) % (Math.PI * 2);
          } else if (ball.daggerState === 'delay') {
            // 2 seconds after hitting enemy: still moving and spinning
            ball.daggerAngle = ((ball.daggerAngle || 0) + ball.daggerSpeed) % (Math.PI * 2);
            ball.daggerDelayTimer = (ball.daggerDelayTimer !== undefined ? ball.daggerDelayTimer : 2000) - safeDt * 1000;
            if (ball.daggerDelayTimer <= 0) {
              // 2s elapsed: start aim mode and stop moving!
              ball.daggerState = 'aiming';
              ball.daggerAimTimer = 2000; // Aim for 2 seconds
              ball.vx = 0;
              ball.vy = 0;
            }
          } else if (ball.daggerState === 'aiming') {
            // Stop moving while aiming!
            ball.vx = 0;
            ball.vy = 0;
            if (markedEnemy) {
              const targetAngle = Math.atan2(markedEnemy.y - ball.y, markedEnemy.x - ball.x);
              let diff = (targetAngle - (ball.daggerAngle || 0)) % (Math.PI * 2);
              if (diff > Math.PI) diff -= Math.PI * 2;
              if (diff < -Math.PI) diff += Math.PI * 2;
              ball.daggerAngle = (ball.daggerAngle || 0) + diff * Math.min(1, safeDt * 8.5);
              ball.aimTargetX = markedEnemy.x;
              ball.aimTargetY = markedEnemy.y;

              if (Math.random() < 0.25) {
                spawnParticles(ball.x + Math.cos(ball.daggerAngle) * (ball.radius + 22), ball.y + Math.sin(ball.daggerAngle) * (ball.radius + 22), '#2dd4bf', 1, 0.8);
              }
            }

            ball.daggerAimTimer = (ball.daggerAimTimer !== undefined ? ball.daggerAimTimer : 2000) - safeDt * 1000;
            if (ball.daggerAimTimer <= 0) {
              // Throw the dagger in that direction!
              ball.hasDagger = false;
              ball.isWeaponless = true;
              ball.daggerState = 'weaponless';
              if (markedEnemy) {
                markedEnemy.daggerMarkTimer = 0;
              }

              const daggerLen = ball.config?.daggerLength || 44;
              const throwDist = ball.radius + 8;
              const dx = ball.x + Math.cos(ball.daggerAngle) * throwDist;
              const dy = ball.y + Math.sin(ball.daggerAngle) * throwDist;
              const daggerSpeed = 16.0;

              if (!physicsRef.current.flyingDaggers) physicsRef.current.flyingDaggers = [];
              physicsRef.current.flyingDaggers.push({
                id: Math.random(),
                x: dx,
                y: dy,
                vx: Math.cos(ball.daggerAngle) * daggerSpeed,
                vy: Math.sin(ball.daggerAngle) * daggerSpeed,
                angle: ball.daggerAngle,
                ownerId: ball.id,
                ownerTeam: ball.team,
                ownerBall: ball,
                targetId: markedEnemy ? markedEnemy.id : null,
                damage: ball.config?.daggerDamage || 10,
                life: 3.0,
                state: 'flying',
              });

              sound.play('daggerThrow', 0.95);
              spawnParticles(dx, dy, '#2dd4bf', 12, 2.2);
              spawnParticles(dx, dy, '#e2e8f0', 8, 1.5);

              // Recoil kick to resume movement after throwing
              const resumeSpd = ball.speed || 3.0;
              ball.vx = -Math.cos(ball.daggerAngle) * (resumeSpd * 0.85);
              ball.vy = -Math.sin(ball.daggerAngle) * (resumeSpd * 0.85);
            }
          } else {
            // Weaponless: idle slow turn of empty sheath
            ball.daggerAngle = ((ball.daggerAngle || 0) + 0.02) % (Math.PI * 2);
          }
        }

        // Priest Ball: Blessing Canvas-wide AOE Heal after 9s (inflicts Heal +5, +3, +1, +1 to self & allies, not divided!)
        if (ball.type === BALL_TYPES.PRIEST && !ball.isDead && !ball.isDying && !isSoloWinner) {
          const blessCooldown = ball.config?.blessCooldown || 9000;

          if (ball.blessTimer === undefined) ball.blessTimer = blessCooldown;
          ball.blessTimer = Math.max(0, ball.blessTimer - safeDt * 1000);

          if (ball.blessTimer <= 0) {
            ball.blessTimer = blessCooldown;
            ball.blessActiveTimer = 1500;

            sound.playBless(0.95);

            // Find all living allies across the ENTIRE canvas
            const livingAllies = balls.filter(other => other.team === ball.team && other.id !== ball.id && !other.isDead && !other.isDying);

            // Inflicts Heal (+5, +3, +1, +1 over time) to self and all living allies (not divided!)
            const applyPriestHeal = (target) => {
              target.healTicksLeft = 4;
              target.healTimer = 100; // first tick triggers right away
              target.healQueue = [5, 3, 1, 1];
              target.healFlashTimer = 500;
              spawnParticles(target.x, target.y, '#fde047', 12, 2.0);
              spawnParticles(target.x, target.y, '#34d399', 8, 1.4);
            };

            applyPriestHeal(ball);
            livingAllies.forEach(ally => applyPriestHeal(ally));

            // Divine blessing expanding ring across entire canvas
            if (!physicsRef.current.blessRings) physicsRef.current.blessRings = [];
            physicsRef.current.blessRings.push({
              x: ball.x,
              y: ball.y,
              radius: ball.radius,
              maxRadius: 1100,
              life: 1.0,
              decay: 0.015,
            });
          }
        }

        if (ball.blessActiveTimer > 0) {
          ball.blessActiveTimer = Math.max(0, ball.blessActiveTimer - safeDt * 1000);
        }

        // Push Ball: Proximity Repulsor Radius (needs 1 hit to activate passive; once triggered, enters cooldown: 12s -> 10s -> 8s -> 6s -> 4s -> 2s)
        if (ball.type === BALL_TYPES.PUSH && !ball.isDead && !ball.isDying && !isSoloWinner) {
          const pushRadius = ball.config?.pushRadius || 135;
          const pushForce = ball.config?.pushForce || 10.5;
          const pushDamage = ball.config?.pushDamage || 6;
          const tiers = ball.config?.pushCooldownTiers || [12000, 10000, 8000, 6000, 4000, 2000];

          if (ball.pushArmTimer > 0) {
            ball.pushArmTimer = Math.max(0, ball.pushArmTimer - safeDt * 1000);
          }

          // If passive is activated but repulsor is cooling down, tick cooldown
          if (ball.isPushActive && !ball.hasPushCharge) {
            ball.pushCooldownTimer = Math.max(0, (ball.pushCooldownTimer || 0) - safeDt * 1000);
            if (ball.pushCooldownTimer <= 0) {
              ball.hasPushCharge = true;
              ball.pushArmTimer = 100;
              sound.playPushCharge(0.95);
              spawnParticles(ball.x, ball.y, '#818cf8', 10, 1.8);
            }
          }

          const livingEnemies = balls.filter(other => other.team !== ball.team && !other.isDead && !other.isDying);
          const nearbyEnemies = livingEnemies.filter(e => {
            const d = Math.hypot(e.x - ball.x, e.y - ball.y);
            return d < (ball.radius + pushRadius + (e.radius || 34) * 0.5);
          });

          // Trigger shockwave when Push Ball is active, armed (ready) and any enemy ball comes near its radius!
          if (ball.isPushActive && ball.hasPushCharge && (!ball.pushArmTimer || ball.pushArmTimer <= 0) && nearbyEnemies.length > 0) {
            // Once used, its push effect turns off and enters cooldown according to current tier
            ball.hasPushCharge = false;
            const curTier = Math.min(ball.pushTierIndex || 0, tiers.length - 1);
            ball.pushCooldownTimer = tiers[curTier];
            ball.pushActiveTimer = 1000;

            // Play push SFX (specifically uses sfx-ball-push-hit.mp3)
            sound.playPushHit(1.0);

            // Spawn expanding kinetic shockwave visual
            if (!physicsRef.current.pushShockwaves) physicsRef.current.pushShockwaves = [];
            physicsRef.current.pushShockwaves.push({
              x: ball.x,
              y: ball.y,
              radius: ball.radius,
              maxRadius: ball.radius + pushRadius,
              life: 1.0,
              decay: 0.045,
              color: '#818cf8'
            });

            // Push each nearby enemy away violently and inflict Knockback + Damage (Tower effect is immune)
            nearbyEnemies.forEach(enemy => {
              const isTower = enemy.type === BALL_TYPES.SLOW || enemy.hasTower || enemy.config?.hasTower;
              const dx = enemy.x - ball.x;
              const dy = enemy.y - ball.y;
              const dist = Math.hypot(dx, dy) || 1;
              const nx = dx / dist;
              const ny = dy / dist;

              // If enemy has Tower effect, it is immune to push displacement and knockback!
              if (!isTower) {
                enemy.vx = nx * pushForce;
                enemy.vy = ny * pushForce;
                enemy.knockbackTimer = 1500;
              }

              // Apply damage
              applyDamage(enemy, pushDamage, ball, false);

              // Kinetic shockwave impact particles
              spawnParticles(enemy.x, enemy.y, isTower ? '#94a3b8' : '#818cf8', 12, 2.2);
              spawnParticles(enemy.x, enemy.y, isTower ? '#cbd5e1' : '#c7d2fe', 8, 1.5);
            });
          }
        }

        // Countdown Push active timer on Push Ball
        if (ball.pushActiveTimer > 0) {
          ball.pushActiveTimer = Math.max(0, ball.pushActiveTimer - safeDt * 1000);
        }

        // Countdown Knockback timer on victim
        if (ball.knockbackTimer > 0) {
          ball.knockbackTimer = Math.max(0, ball.knockbackTimer - safeDt * 1000);
        }

        // Dagger Mark countdown on victim
        if (ball.daggerMarkTimer > 0) {
          ball.daggerMarkTimer = Math.max(0, ball.daggerMarkTimer - safeDt * 1000);
        }

        // Rapier Mark countdown on victim
        if (ball.rapierMarkTimer > 0) {
          ball.rapierMarkTimer = Math.max(0, ball.rapierMarkTimer - safeDt * 1000);
        }

        // Rapier Ball: Normal spin, marks on hit, aims for 0.8s, dashes with 28 DMG thrust
        if (ball.type === BALL_TYPES.RAPIER && !ball.isDead && !ball.isDying && !isSoloWinner) {
          if (ball.rapierCooldown > 0) {
            ball.rapierCooldown = Math.max(0, ball.rapierCooldown - safeDt * 1000);
          }
          if (ball.dashTimer > 0) {
            ball.dashTimer = Math.max(0, ball.dashTimer - safeDt * 1000);
          }

          const livingEnemies = balls.filter(b => b.team !== ball.team && !b.isDead && !b.isDying);
          let markedEnemy = ball.markedRapierTargetId ? livingEnemies.find(e => e.id === ball.markedRapierTargetId) : null;

          if (ball.rapierState === 'spinning') {
            ball.rapierAngle = ((ball.rapierAngle || 0) + (ball.rapierSpeed || 0.055)) % (Math.PI * 2);
          } else if (ball.rapierState === 'aiming') {
            ball.vx = 0;
            ball.vy = 0;
            if (!markedEnemy) {
              if (livingEnemies.length > 0) {
                let nearest = livingEnemies[0];
                let minD = Math.hypot(nearest.x - ball.x, nearest.y - ball.y);
                for (let i = 1; i < livingEnemies.length; i++) {
                  const d = Math.hypot(livingEnemies[i].x - ball.x, livingEnemies[i].y - ball.y);
                  if (d < minD) { minD = d; nearest = livingEnemies[i]; }
                }
                ball.markedRapierTargetId = nearest.id;
                markedEnemy = nearest;
                nearest.rapierMarkTimer = ball.rapierAimTimer;
              } else {
                ball.rapierState = 'spinning';
                ball.markedRapierTargetId = null;
                ball.rapierCooldown = 1200;
              }
            }

            if (markedEnemy) {
              const targetAngle = Math.atan2(markedEnemy.y - ball.y, markedEnemy.x - ball.x);
              let diff = (targetAngle - (ball.rapierAngle || 0)) % (Math.PI * 2);
              if (diff > Math.PI) diff -= Math.PI * 2;
              if (diff < -Math.PI) diff += Math.PI * 2;
              ball.rapierAngle = (ball.rapierAngle || 0) + diff * Math.min(1, safeDt * 14);

              if (Math.random() < 0.3) {
                const tipDist = ball.radius + (ball.config?.rapierLength || 58);
                spawnParticles(ball.x + Math.cos(ball.rapierAngle) * tipDist, ball.y + Math.sin(ball.rapierAngle) * tipDist, '#f43f5e', 1, 0.8);
              }
            }

            ball.rapierAimTimer = (ball.rapierAimTimer !== undefined ? ball.rapierAimTimer : 800) - safeDt * 1000;
            if (ball.rapierAimTimer <= 0) {
              // Launch forward lightning dash thrust!
              ball.rapierState = 'dashing';
              const dashSpeed = ball.config?.dashSpeed || 17.5;
              const launchAngle = ball.rapierAngle || 0;
              ball.vx = Math.cos(launchAngle) * dashSpeed;
              ball.vy = Math.sin(launchAngle) * dashSpeed;
              ball.rapierDashTimer = ball.config?.dashDuration || 350;
              ball.dashTimer = 450;
              sound.play('bulletShot', 0.4);
              spawnParticles(ball.x, ball.y, '#f43f5e', 12, 2.2);
            }
          } else if (ball.rapierState === 'dashing') {
            const curSpeed = Math.hypot(ball.vx, ball.vy);
            if (curSpeed > 0.1) {
              ball.rapierAngle = Math.atan2(ball.vy, ball.vx);
            }
            ball.rapierDashTimer = (ball.rapierDashTimer !== undefined ? ball.rapierDashTimer : 350) - safeDt * 1000;
            if (Math.random() < 0.6) {
              spawnParticles(ball.x - ball.vx * 0.4, ball.y - ball.vy * 0.4, '#f43f5e', 2, 0.6);
            }
            if (ball.rapierDashTimer <= 0) {
              ball.rapierState = 'spinning';
              ball.rapierCooldown = ball.config?.rapierCooldown || 2800;
              ball.markedRapierTargetId = null;
              ball.dashTimer = 0;
              if (curSpeed > 0.1) {
                ball.vx = (ball.vx / curSpeed) * (ball.speed || 2.3);
                ball.vy = (ball.vy / curSpeed) * (ball.speed || 2.3);
              }
            }
          }
        }

        // Mother Ball: Brood Birthing (Very slow, stops moving while birthing, costs 5 HP, cycles 4 baby types, max 4 active)
        if (ball.type === BALL_TYPES.MOTHER && !ball.isDead && !ball.isDying && !isSoloWinner) {
          const broodCooldown = ball.config?.broodCooldown || 5500;
          const broodMaxCap = ball.config?.broodMaxCap || 4;
          const hpCost = ball.config?.broodHpCost || 5;

          if (ball.broodTimer === undefined) ball.broodTimer = broodCooldown;
          if (!ball.broodNextType) ball.broodNextType = 'BABY_NORMAL';

          const activeBabies = balls.filter(b => b.motherId === ball.id && !b.isDead && !b.isDying);

          if (activeBabies.length < broodMaxCap) {
            ball.broodTimer = Math.max(0, ball.broodTimer - safeDt * 1000);

            // While in the last 1.2s of birthing, Mother Ball slows down and stops moving
            if (ball.broodTimer <= 1200) {
              ball.isSpawningBrood = true;
              ball.vx *= 0.85;
              ball.vy *= 0.85;
              if (Math.random() < 0.3) {
                spawnParticles(ball.x, ball.y, '#f472b6', 2, 1.2);
              }
            } else {
              ball.isSpawningBrood = false;
            }

            // Birth triggered!
            if (ball.broodTimer <= 0) {
              ball.broodTimer = broodCooldown;
              ball.isSpawningBrood = false;

              // Spawning a baby ball takes 5 HP
              const actualCost = Math.min(ball.hp - 1, hpCost);
              if (actualCost > 0) {
                ball.hp -= actualCost;
                spawnDamageText(ball.x, ball.y - ball.radius - 8, actualCost, false, false, false);
                ball.hitFlashTimer = 220;
              }

              const babyType = BALL_TYPES[ball.broodNextType] || BALL_TYPES.BABY_NORMAL;
              const babyCfg = BALL_CONFIGS[babyType] || BALL_CONFIGS[BALL_TYPES.BABY_NORMAL];

              // Cycle sequence: BABY_NORMAL -> BABY_SWORD -> BABY_GUN -> BABY_DUAL_SWORD -> BABY_NORMAL
              if (ball.broodNextType === 'BABY_NORMAL') ball.broodNextType = 'BABY_SWORD';
              else if (ball.broodNextType === 'BABY_SWORD') ball.broodNextType = 'BABY_GUN';
              else if (ball.broodNextType === 'BABY_GUN') ball.broodNextType = 'BABY_DUAL_SWORD';
              else ball.broodNextType = 'BABY_NORMAL';

              const birthAngle = Math.random() * Math.PI * 2;
              const spawnDist = ball.radius + babyCfg.radius + 6;
              const bx = Math.max(babyCfg.radius + 6, Math.min(CANVAS_SIZE - babyCfg.radius - 6, ball.x + Math.cos(birthAngle) * spawnDist));
              const by = Math.max(babyCfg.radius + 6, Math.min(CANVAS_SIZE - babyCfg.radius - 6, ball.y + Math.sin(birthAngle) * spawnDist));
              const launchSpd = babyCfg.speed * 1.3;

              const newBaby = {
                id: Date.now() + Math.random(),
                team: ball.team,
                teamColor: ball.teamColor,
                type: babyType,
                name: babyCfg.name,
                x: bx,
                y: by,
                vx: Math.cos(birthAngle) * launchSpd,
                vy: Math.sin(birthAngle) * launchSpd,
                hp: babyCfg.baseHp,
                maxHp: babyCfg.baseHp,
                displayHp: babyCfg.baseHp,
                radius: babyCfg.radius,
                mass: babyCfg.mass,
                speed: babyCfg.speed,
                damage: babyCfg.damage,
                config: babyCfg,
                motherId: ball.id,
                isBaby: true,
                hitCount: 0,
                bleedTicksLeft: 0,
                bleedTimer: 0,
                bleedSource: null,
                bleedQueue: [],
                burnTicksLeft: 0,
                burnTimer: 0,
                burnSource: null,
                burnQueue: [],
                poisonStacks: 0,
                poisonDuration: 0,
                poisonTickTimer: 0,
                poisonFlashTimer: 0,
                poisonSource: null,
                healTicksLeft: 0,
                healTimer: 0,
                healQueue: [],
                isBlueBurn: false,
                burnFlashTimer: 0,
                isDead: false,
                isDying: false,
                deathTimer: 0,
                deathMaxTimer: 0,
                hitFlashTimer: 0,
                hitShakeTimer: 0,
                invulnerableTimer: 200,
                swordAngle: birthAngle,
                swordSpeed: 0.08,
                swordHitFreezeTimer: 0,
                hasSword: babyType === BALL_TYPES.BABY_SWORD || babyType === BALL_TYPES.BABY_DUAL_SWORD,
                bladeLength: babyCfg.bladeLength || (babyType === BALL_TYPES.BABY_DUAL_SWORD ? 22 : 26),
                bladeDamage: babyCfg.bladeDamage || (babyType === BALL_TYPES.BABY_DUAL_SWORD ? 9 : 12),
                gunAngle: birthAngle,
                gunSpeed: 0.05,
                gunCooldown: babyCfg.gunCooldown || 3500,
                hasGun: babyType === BALL_TYPES.BABY_GUN,
              };

              spawnedBabyBalls.push(newBaby);

              sound.play('fastballHit', 0.85);
              spawnParticles(bx, by, '#f472b6', 14, 2.2);
              spawnParticles(bx, by, '#ffffff', 8, 1.5);
              spawnParticles(ball.x, ball.y, '#fbcfe8', 10, 1.8);

              // Mother ball slight recoil kick
              ball.vx = -Math.cos(birthAngle) * 1.2;
              ball.vy = -Math.sin(birthAngle) * 1.2;
            }
          } else {
            ball.isSpawningBrood = false;
          }
        }

        if (ball.isSpawningBrood) {
          ball.vx = 0;
          ball.vy = 0;
        } else if (!isSoloWinner) {
          const curSpd = Math.hypot(ball.vx, ball.vy);
          const baseSpd = ball.speed;
          // Slow debuff: Reduces Movement Speed by 25%
          const targetSpd = ball.isSlowed ? baseSpd * 0.75 : baseSpd;
          if (curSpd > 0.001) {
            const lerpedSpd = curSpd + (targetSpd - curSpd) * 0.06;
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
                const isBlue = ball.team === TEAMS.BLUE.id || ball.team === 'blue' || ball.team === 0;
                spawnParticles(trapX, trapY, isBlue ? '#38bdf8' : '#f43f5e', Math.round(pCount * 0.6), 1.2);
              }
            }
          };

          const playWallBounce = () => {
            if (ball.type === BALL_TYPES.FIRE) {
              sound.play('fireballHitWall', 0.9);
              spawnParticles(ball.x, ball.y, '#f97316', 5, 1.4);
              spawnParticles(ball.x, ball.y, '#fef08a', 3, 1.6);
            } else if (ball.type === BALL_TYPES.SPIT_FIRE) {
              sound.play('fireballHitWall', 0.9);
              spawnParticles(ball.x, ball.y, '#38bdf8', 5, 1.4);
              spawnParticles(ball.x, ball.y, '#67e8f9', 3, 1.6);
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
        activeBalls.push(...spawnedSplitBalls);
      }
      if (spawnedBabyBalls.length > 0) {
        balls.push(...spawnedBabyBalls);
        activeBalls.push(...spawnedBabyBalls);
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

              if (b1.type === BALL_TYPES.FIRE || b2.type === BALL_TYPES.FIRE || b1.type === BALL_TYPES.SPIT_FIRE || b2.type === BALL_TYPES.SPIT_FIRE) {
                sound.play('fireballHit', 0.95);
                const isBlueBlast = b1.type === BALL_TYPES.SPIT_FIRE || b2.type === BALL_TYPES.SPIT_FIRE;

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
                  isBlue: isBlueBlast,
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
                    color: isBlueBlast
                      ? (p % 3 === 0 ? '#ffffff' : (p % 3 === 1 ? '#67e8f9' : '#0284c7'))
                      : (p % 3 === 0 ? '#ffffff' : (p % 3 === 1 ? '#fef08a' : '#f97316')),
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
              // (Fire Ball & Spit Fire Ball are completely immune to Burn & Scorch)
              if (b1.type === BALL_TYPES.FIRE && b1.team !== b2.team && b2.type !== BALL_TYPES.FIRE && b2.type !== BALL_TYPES.SPIT_FIRE && !b2.isDead && !b2.isDying) {
                b2.burnTicksLeft = 6;
                b2.burnTimer = 480;
                b2.burnSource = b1;
                b2.isBlueBurn = false;
                b2.burnFlashTimer = 220;
                b2.burnQueue = [4, 3, 2, 1, 1, 1];
                spawnParticles(b2.x, b2.y, '#f97316', 10, 1.8);
                spawnParticles(b2.x, b2.y, '#fef08a', 6, 2.0);
              }

              if (b2.type === BALL_TYPES.FIRE && b2.team !== b1.team && b1.type !== BALL_TYPES.FIRE && b1.type !== BALL_TYPES.SPIT_FIRE && !b1.isDead && !b1.isDying) {
                b1.burnTicksLeft = 6;
                b1.burnTimer = 480;
                b1.burnSource = b2;
                b1.isBlueBurn = false;
                b1.burnFlashTimer = 220;
                b1.burnQueue = [4, 3, 2, 1, 1, 1];
                spawnParticles(b1.x, b1.y, '#f97316', 10, 1.8);
                spawnParticles(b1.x, b1.y, '#fef08a', 6, 2.0);
              }

              // Spit Fire Ball: Direct body collision locks enemy with Flame Lock for 5 seconds, ignites non-fire units with Scorch, and triggers mini flame barrage
              if (b1.type === BALL_TYPES.SPIT_FIRE && b1.team !== b2.team && b2.type !== BALL_TYPES.SPIT_FIRE && !b2.isDead && !b2.isDying) {
                b2.spitFireTargetTimer = 5000;
                if (b2.type !== BALL_TYPES.FIRE) {
                  b2.burnTicksLeft = 4;
                  b2.burnTimer = 420;
                  b2.burnSource = b1;
                  b2.isBlueBurn = true;
                  b2.burnFlashTimer = 220;
                  b2.burnQueue = [2, 1, 1, 1];
                }
                spawnParticles(b2.x, b2.y, '#38bdf8', 10, 1.8);
                spawnParticles(b2.x, b2.y, '#67e8f9', 6, 2.0);
                triggerSpitFireBurst(b1, b2);
              }

              if (b2.type === BALL_TYPES.SPIT_FIRE && b2.team !== b1.team && b1.type !== BALL_TYPES.SPIT_FIRE && !b1.isDead && !b1.isDying) {
                b1.spitFireTargetTimer = 5000;
                if (b1.type !== BALL_TYPES.FIRE) {
                  b1.burnTicksLeft = 4;
                  b1.burnTimer = 420;
                  b1.burnSource = b2;
                  b1.isBlueBurn = true;
                  b1.burnFlashTimer = 220;
                  b1.burnQueue = [2, 1, 1, 1];
                }
                spawnParticles(b1.x, b1.y, '#38bdf8', 10, 1.8);
                spawnParticles(b1.x, b1.y, '#67e8f9', 6, 2.0);
                triggerSpitFireBurst(b2, b1);
              }

              // Dice Ball: Roll random damage on enemy collision based on roll sound pitch
              const rollDiceBall = (diceBall) => {
                const roll = Math.random();
                let tier, targetDmg, sfx;

                if (roll < 0.01) {
                  // 1% God Tier (99 DMG)
                  tier = 'god';
                  targetDmg = 99;
                  sfx = 'diceRollHigh';
                } else if (roll < 0.06) {
                  // 5% High Tier (30 - 50 DMG)
                  tier = 'high';
                  targetDmg = Math.floor(Math.random() * (50 - 30 + 1)) + 30;
                  sfx = 'diceRollHigh';
                } else if (roll < 0.26) {
                  // 20% Mid Tier (15 - 25 DMG)
                  tier = 'mid';
                  targetDmg = Math.floor(Math.random() * (25 - 15 + 1)) + 15;
                  sfx = 'diceRollMid';
                } else {
                  // 74% Low Tier (5 - 12 DMG)
                  tier = 'low';
                  targetDmg = Math.floor(Math.random() * (12 - 5 + 1)) + 5;
                  sfx = 'diceRollLow';
                }

                // If pity is available (7 hits), absorb pity and change to High Roll if current roll is Mid or Low (not High or God)
                if ((diceBall.dicePity || 0) >= 7 && (tier === 'mid' || tier === 'low')) {
                  diceBall.dicePity = 0; // absorb the pity
                  tier = 'high';
                  targetDmg = Math.floor(Math.random() * (50 - 30 + 1)) + 30;
                  sfx = 'diceRollHigh';
                }

                sound.play(sfx, 0.95);
                diceBall.diceTier = tier;
                diceBall.diceRollTarget = targetDmg;
                diceBall.damage = targetDmg;
                diceBall.diceRollTimer = 260; // snappy roll duration so number is locked in before next hit
                diceBall.dicePopScale = tier === 'god' ? 1.6 : 1.35;
                const rollParticleColor = tier === 'god' ? '#ef4444' : (tier === 'high' ? '#f59e0b' : (tier === 'mid' ? '#06b6d4' : '#94a3b8'));
                spawnParticles(diceBall.x, diceBall.y, rollParticleColor, tier === 'god' ? 20 : 10, tier === 'god' ? 3.0 : 2.0);
                if (tier === 'god') spawnParticles(diceBall.x, diceBall.y, '#fbbf24', 10, 2.5);
              };

              if (b1.type === BALL_TYPES.DICE && b1.team !== b2.team && !b2.isDead && !b2.isDying) {
                b1.diceHits = (b1.diceHits || 0) + 1;
                sound.play('diceHit', 0.85);

                if (b1.diceHits === 1) {
                  // Hit 1: deals default 1 damage, does not roll yet
                  dmgB1ToB2 = 1;
                  b1.dicePopScale = 1.25;
                  spawnParticles(b1.x, b1.y, '#94a3b8', 6, 1.5);
                } else if (b1.diceHits === 2) {
                  // Hit 2: deals default 1 damage, hits twice reached! Rolls lucky number for next attack!
                  dmgB1ToB2 = 1;
                  rollDiceBall(b1);
                } else {
                  // Hit 3+: finalize roll if still active so displayed damage is exact
                  if (b1.diceRollTimer > 0) {
                    b1.diceRollTimer = 0;
                    b1.damage = b1.diceRollTarget;
                    b1.displayedDamage = b1.diceRollTarget;
                  }
                  dmgB1ToB2 = b1.damage;
                  rollDiceBall(b1);
                }
              }

              if (b2.type === BALL_TYPES.DICE && b2.team !== b1.team && !b1.isDead && !b1.isDying) {
                b2.diceHits = (b2.diceHits || 0) + 1;
                sound.play('diceHit', 0.85);

                if (b2.diceHits === 1) {
                  dmgB2ToB1 = 1;
                  b2.dicePopScale = 1.25;
                  spawnParticles(b2.x, b2.y, '#94a3b8', 6, 1.5);
                } else if (b2.diceHits === 2) {
                  dmgB2ToB1 = 1;
                  rollDiceBall(b2);
                } else {
                  if (b2.diceRollTimer > 0) {
                    b2.diceRollTimer = 0;
                    b2.damage = b2.diceRollTarget;
                    b2.displayedDamage = b2.diceRollTarget;
                  }
                  dmgB2ToB1 = b2.damage;
                  rollDiceBall(b2);
                }
              }

              // Hammer Ball deals twice the damage when hitting Steel Ball, Stone Ball, or Spike Ball
              if (b1.type === BALL_TYPES.HAMMER && (b2.type === BALL_TYPES.STEEL || b2.type === BALL_TYPES.STONE || b2.type === BALL_TYPES.SPIKE || b2.hasHard)) {
                dmgB1ToB2 *= 2;
              }
              if (b2.type === BALL_TYPES.HAMMER && (b1.type === BALL_TYPES.STEEL || b1.type === BALL_TYPES.STONE || b1.type === BALL_TYPES.SPIKE || b1.hasHard)) {
                dmgB2ToB1 *= 2;
              }

              applyDamage(b2, dmgB1ToB2, b1);
              applyDamage(b1, dmgB2ToB1, b2);

              // Push Ball: hitting an enemy activates passive or progressively lowers cooldown tier (12s -> 10s -> 8s -> 6s -> 4s -> 2s)
              const handlePushHit = (pushBall, victim) => {
                const tiers = pushBall.config?.pushCooldownTiers || [12000, 10000, 8000, 6000, 4000, 2000];
                if (!pushBall.isPushActive) {
                  pushBall.isPushActive = true;
                  pushBall.pushTierIndex = 0;
                  pushBall.hasPushCharge = true;
                  pushBall.pushCooldownTimer = 0;
                  pushBall.pushArmTimer = 350; // arming delay so current hit rebound clears before proximity repulsor fires
                  sound.playPushCharge(0.95);
                  spawnParticles(pushBall.x, pushBall.y, '#818cf8', 14, 2.0);
                } else {
                  // Subsequent hits upgrade cooldown tier
                  if (pushBall.pushTierIndex < tiers.length - 1) {
                    pushBall.pushTierIndex += 1;
                    const newMaxCd = tiers[pushBall.pushTierIndex];
                    if (pushBall.pushCooldownTimer > newMaxCd) {
                      pushBall.pushCooldownTimer = newMaxCd;
                    }
                    sound.playPushCharge(0.85);
                    spawnParticles(pushBall.x, pushBall.y, '#a5b4fc', 10, 1.6);
                  }
                }
              };

              if (b1.type === BALL_TYPES.PUSH && b1.team !== b2.team && !b2.isDead && !b2.isDying) {
                handlePushHit(b1, b2);
              }
              if (b2.type === BALL_TYPES.PUSH && b2.team !== b1.team && !b1.isDead && !b1.isDying) {
                handlePushHit(b2, b1);
              }

              // Dagger Ball Body hit marks enemy with Dagger Mark using bodyHit sound
              if (b1.type === BALL_TYPES.DAGGER && b1.team !== b2.team && !b2.isDead && !b2.isDying) {
                applyDaggerMark(b1, b2, true);
              }
              if (b2.type === BALL_TYPES.DAGGER && b2.team !== b1.team && !b1.isDead && !b1.isDying) {
                applyDaggerMark(b2, b1, true);
              }

              // Poison Ball Body hit inflicts Virulent Poison that stacks infinitely (-1 dmg every 0.8s for 12s)
              const applyPoison = (attacker, victim) => {
                victim.poisonStacks = (victim.poisonStacks || 0) + 1;
                victim.poisonDuration = 12000; // 12 seconds
                if (!victim.poisonTickTimer || victim.poisonTickTimer <= 0) {
                  victim.poisonTickTimer = 800; // 0.8s
                }
                victim.poisonSource = attacker;
                victim.poisonFlashTimer = 220;
                sound.play('thornHit', 0.8);
                spawnParticles(victim.x, victim.y, '#10b981', 8, 1.4);
                spawnParticles(victim.x, victim.y, '#34d399', 4, 1.8);
              };

              if (b1.type === BALL_TYPES.POISON && b1.team !== b2.team && !b2.isDead && !b2.isDying) {
                applyPoison(b1, b2);
              }
              if (b2.type === BALL_TYPES.POISON && b2.team !== b1.team && !b1.isDead && !b1.isDying) {
                applyPoison(b2, b1);
              }

              // Rapier Ball Body hit: dashes deliver thrust impact, while spinning marks target
              if (b1.type === BALL_TYPES.RAPIER && b1.team !== b2.team && !b2.isDead && !b2.isDying) {
                if (b1.rapierState === 'dashing') {
                  const thrustDmg = b1.config?.dashDamage || 11;
                  applyDamage(b2, thrustDmg, b1, true);
                  b2.rapierMarkTimer = 0;
                  b2.vx += Math.cos(b1.rapierAngle) * 7.5;
                  b2.vy += Math.sin(b1.rapierAngle) * 7.5;
                  sound.play('swordHit', 1.0);
                  spawnParticles(b2.x, b2.y, '#f43f5e', 12, 2.2);
                  b1.rapierState = 'spinning';
                  b1.rapierCooldown = b1.config?.rapierCooldown || 2800;
                  b1.markedRapierTargetId = null;
                  b1.dashTimer = 0;
                } else if (b1.rapierState === 'spinning' && (b1.rapierCooldown || 0) <= 0) {
                  applyRapierMark(b1, b2);
                }
              }
              if (b2.type === BALL_TYPES.RAPIER && b2.team !== b1.team && !b1.isDead && !b1.isDying) {
                if (b2.rapierState === 'dashing') {
                  const thrustDmg = b2.config?.dashDamage || 11;
                  applyDamage(b1, thrustDmg, b2, true);
                  b1.rapierMarkTimer = 0;
                  b1.vx += Math.cos(b2.rapierAngle) * 7.5;
                  b1.vy += Math.sin(b2.rapierAngle) * 7.5;
                  sound.play('swordHit', 1.0);
                  spawnParticles(b1.x, b1.y, '#f43f5e', 12, 2.2);
                  b2.rapierState = 'spinning';
                  b2.rapierCooldown = b2.config?.rapierCooldown || 2800;
                  b2.markedRapierTargetId = null;
                  b2.dashTimer = 0;
                } else if (b2.rapierState === 'spinning' && (b2.rapierCooldown || 0) <= 0) {
                  applyRapierMark(b2, b1);
                }
              }
            }
          }

          if ((b1.type === BALL_TYPES.SWORD || b1.type === BALL_TYPES.DUAL_SWORD || b1.type === BALL_TYPES.BABY_SWORD || b1.type === BALL_TYPES.BABY_DUAL_SWORD) && b1.team !== b2.team && !b2.isDead) {
            checkSwordHit(b1, b2);
          }
          if ((b2.type === BALL_TYPES.SWORD || b2.type === BALL_TYPES.DUAL_SWORD || b2.type === BALL_TYPES.BABY_SWORD || b2.type === BALL_TYPES.BABY_DUAL_SWORD) && b2.team !== b1.team && !b1.isDead) {
            checkSwordHit(b2, b1);
          }

          if (b1.type === BALL_TYPES.RAPIER && b1.team !== b2.team && !b2.isDead) {
            checkRapierHit(b1, b2);
          }
          if (b2.type === BALL_TYPES.RAPIER && b2.team !== b1.team && !b1.isDead) {
            checkRapierHit(b2, b1);
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

          // Dagger Ball: Weapon blade collision & stuck dagger retrieval
          const checkDaggerRetrieval = (daggerOwner, victim) => {
            if (daggerOwner.type === BALL_TYPES.DAGGER && victim.stuckDaggers && victim.stuckDaggers.length > 0) {
              const myStuckIdx = victim.stuckDaggers.findIndex(d => d.ownerId === daggerOwner.id);
              if (myStuckIdx !== -1) {
                victim.stuckDaggers.splice(myStuckIdx, 1);
                if (victim.stuckDaggers.length === 0) {
                  victim.isSlowed = false;
                }
                daggerOwner.hasDagger = true;
                daggerOwner.isWeaponless = false;
                daggerOwner.daggerState = 'spinning';
                daggerOwner.markedEnemyId = null;
                daggerOwner.daggerDelayTimer = 0;
                daggerOwner.daggerAimTimer = 0;

                // Deal +6 bonus retrieval damage on rip out
                applyDamage(victim, 6, daggerOwner, true);

                sound.play('daggerPull', 0.95);
                spawnDamageText(victim.x, victim.y, 6, true, false, false);
                spawnParticles(victim.x, victim.y, '#2dd4bf', 14, 2.4);
                spawnParticles(victim.x, victim.y, '#ef4444', 10, 1.8);
                spawnParticles(daggerOwner.x, daggerOwner.y, '#2dd4bf', 8, 1.5);
              }
            }
          };

          if (b1.type === BALL_TYPES.DAGGER && b1.team !== b2.team && !b2.isDead) {
            checkDaggerBladeHit(b1, b2);
            checkDaggerRetrieval(b1, b2);
          }
          if (b2.type === BALL_TYPES.DAGGER && b2.team !== b1.team && !b1.isDead) {
            checkDaggerBladeHit(b2, b1);
            checkDaggerRetrieval(b2, b1);
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

      // Update Spit Fire barrage bursts (continues shooting while Flame Lock is active)
      const { spitFireBursts, flyingFlames } = physicsRef.current;
      if (spitFireBursts && spitFireBursts.length > 0) {
        for (let i = spitFireBursts.length - 1; i >= 0; i--) {
          const sb = spitFireBursts[i];
          const target = sb.target;
          const attacker = balls.find(b => b.id === sb.attackerId) || null;

          // Halt continuous shooting if target is dead, Flame Lock expired, or attacker is dead
          if (!target || target.isDead || target.isDying || !target.spitFireTargetTimer || target.spitFireTargetTimer <= 0 || !attacker || attacker.isDead || attacker.isDying) {
            spitFireBursts.splice(i, 1);
            continue;
          }

          sb.timer -= safeDt * 1000;
          if (sb.timer <= 0) {
            sb.timer = sb.interval;
            sb.shotCount = (sb.shotCount || 0) + 1;

            const startX = attacker.x;
            const startY = attacker.y;

            // Firing trajectory curving towards target with alternating left/right lanes
            const dx = target.x - startX;
            const dy = target.y - startY;
            const dist = Math.hypot(dx, dy) || 1;
            // Strictly alternate left (-1) and right (+1)
            const side = (sb.shotCount % 2 === 0 ? 1 : -1);
            // Dynamic arc bulge width: 65px to 105px lateral offset
            const arcWidth = 65 + Math.random() * 40;
            // Flight duration scaled with distance (~0.42s to 0.82s)
            const duration = Math.max(0.42, Math.min(0.82, dist / 420));

            flyingFlames.push({
              x: startX,
              y: startY,
              startX: startX,
              startY: startY,
              targetId: sb.targetId,
              target: target,
              attackerTeam: sb.attackerTeam,
              attacker: attacker,
              damage: 1,
              life: 3.5,
              side: side,
              arcWidth: arcWidth,
              progress: 0,
              duration: duration,
              vx: 0,
              vy: 0,
              trail: [],
            });

            // SFX: flame shot sound!
            sound.play('flameShot', 0.85);

            // Azure launch flame particles
            spawnParticles(startX, startY, '#38bdf8', 6, 1.2);
            spawnParticles(startX, startY, '#67e8f9', 3, 1.4);
          }
        }
      }

      // Update Flying Mini Flames (curving outward and bending inward to locked target)
      if (flyingFlames && flyingFlames.length > 0) {
        for (let i = flyingFlames.length - 1; i >= 0; i--) {
          const ff = flyingFlames[i];
          ff.life -= safeDt;

          const target = ff.target;
          const targetAlive = target && !target.isDead && !target.isDying;

          if (targetAlive) {
            ff.progress = Math.min(1.0, ff.progress + safeDt / ff.duration);
            const t = ff.progress;

            const p0x = ff.startX;
            const p0y = ff.startY;
            const p2x = target.x;
            const p2y = target.y;

            const cdx = p2x - p0x;
            const cdy = p2y - p0y;
            const cDist = Math.hypot(cdx, cdy) || 1;

            // Unit perpendicular vector towards chosen side
            const nx = (-cdy / cDist) * ff.side;
            const ny = (cdx / cDist) * ff.side;

            // Lateral bulge scaled with distance so near-range doesn't clip
            const actualBulge = Math.min(cDist * 0.65, ff.arcWidth);

            // Control point P1 placed laterally outward at midpoint to form outward bulge
            const mx = (p0x + p2x) * 0.5;
            const my = (p0y + p2y) * 0.5;
            const p1x = mx + nx * (actualBulge * 2.0);
            const p1y = my + ny * (actualBulge * 2.0);

            // Quadratic Bézier curve position: B(t) = (1-t)^2*P0 + 2*(1-t)*t*P1 + t^2*P2
            const u = 1 - t;
            const nextX = u * u * p0x + 2 * u * t * p1x + t * t * p2x;
            const nextY = u * u * p0y + 2 * u * t * p1y + t * t * p2y;

            // Tangent direction for flame rotation and trailing
            const tanX = 2 * u * (p1x - p0x) + 2 * t * (p2x - p1x);
            const tanY = 2 * u * (p1y - p0y) + 2 * t * (p2y - p1y);
            const tanLen = Math.hypot(tanX, tanY) || 1;
            const spd = 8.5;
            ff.vx = (tanX / tanLen) * spd;
            ff.vy = (tanY / tanLen) * spd;

            ff.x = nextX;
            ff.y = nextY;

            // Record trail point for curved comet flame rendering
            if (!ff.trail) ff.trail = [];
            ff.trail.unshift({ x: ff.x, y: ff.y });
            if (ff.trail.length > 16) ff.trail.length = 16;

            const targetDist = Math.hypot(target.x - ff.x, target.y - ff.y);
            if (t >= 0.98 || targetDist < target.radius + 6) {
              // Mini Flame hits the locked enemy!
              applyDamage(target, 1, ff.attacker || target, false);

              // Grow Ball: Triggers growth expansion from Spit Fire hit!
              if (target.type === BALL_TYPES.GROW && !target.isDead && !target.isDying) {
                triggerGrowBallExpansion(target, true);
              }
              
              // Inflict Scorch (Fire Ball & Spit Fire Ball are immune to Burn & Scorch)
              if (target.type !== BALL_TYPES.FIRE && target.type !== BALL_TYPES.SPIT_FIRE) {
                target.burnTicksLeft = Math.max(target.burnTicksLeft || 0, 3);
                target.burnTimer = 420;
                target.isBlueBurn = true;
                target.burnSource = ff.attacker || target;
                target.burnQueue = [1, 1, 1];
                target.burnFlashTimer = 220;
              }

              sound.play('fireballBurn', 0.85);
              spawnParticles(ff.x, ff.y, '#38bdf8', 7, 1.5);
              spawnParticles(ff.x, ff.y, '#67e8f9', 4, 1.8);
              spawnParticles(ff.x, ff.y, '#ffffff', 3, 1.0);
              flyingFlames.splice(i, 1);
              continue;
            }
          } else {
            // Target is dead or missing: fly straight along current tangent until expired
            ff.x += ff.vx;
            ff.y += ff.vy;
            if (!ff.trail) ff.trail = [];
            ff.trail.unshift({ x: ff.x, y: ff.y });
            if (ff.trail.length > 16) ff.trail.length = 16;
          }

          if (ff.life <= 0 || ff.x < 0 || ff.x > CANVAS_SIZE || ff.y < 0 || ff.y > CANVAS_SIZE) {
            spawnParticles(ff.x, ff.y, '#38bdf8', 4, 0.8);
            flyingFlames.splice(i, 1);
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

      // Update Flying Daggers thrown by Dagger Ball
      const { flyingDaggers } = physicsRef.current;
      if (flyingDaggers && flyingDaggers.length > 0) {
        for (let i = flyingDaggers.length - 1; i >= 0; i--) {
          const fd = flyingDaggers[i];
          const owner = balls.find(b => b.id === fd.ownerId) || fd.ownerBall;

          if (fd.state === 'returning') {
            // Homing return flight pulling back to Dagger Ball via telekinesis
            if (owner && !owner.isDead) {
              const dx = owner.x - fd.x;
              const dy = owner.y - fd.y;
              const dist = Math.hypot(dx, dy);

              if (dist <= owner.radius + 16) {
                // Caught and pulled back into holster! Re-arms Dagger Ball
                sound.play('daggerPull', 0.85);
                owner.hasDagger = true;
                owner.isWeaponless = false;
                owner.daggerState = 'spinning';
                owner.markedEnemyId = null;
                owner.daggerDelayTimer = 0;
                owner.daggerAimTimer = 0;
                spawnParticles(owner.x, owner.y, '#2dd4bf', 12, 2.0);
                flyingDaggers.splice(i, 1);
                continue;
              }

              const retSpd = 17.5;
              fd.vx = (dx / dist) * retSpd;
              fd.vy = (dy / dist) * retSpd;
              fd.x += fd.vx;
              fd.y += fd.vy;
              fd.angle = Math.atan2(dy, dx);
            } else {
              flyingDaggers.splice(i, 1);
              continue;
            }
          } else if (fd.state === 'stuck_wall') {
            // Embedded in arena wall: stays there for 4 seconds, or early pickup on physical contact
            fd.wallTimer = (fd.wallTimer !== undefined ? fd.wallTimer : 4000) - safeDt * 1000;

            // Early retrieval if Dagger Ball physically touches the stuck wall dagger
            if (owner && !owner.isDead) {
              const dist = Math.hypot(owner.x - fd.x, owner.y - fd.y);
              if (dist <= owner.radius + 16) {
                sound.play('daggerPull', 0.9);
                owner.hasDagger = true;
                owner.isWeaponless = false;
                owner.daggerState = 'spinning';
                owner.markedEnemyId = null;
                owner.daggerDelayTimer = 0;
                owner.daggerAimTimer = 0;
                spawnParticles(fd.x, fd.y, '#2dd4bf', 12, 2.0);
                flyingDaggers.splice(i, 1);
                continue;
              }
            }

            // After 4 seconds on the wall, telekinesis pulls the dagger back
            if (fd.wallTimer <= 0) {
              sound.play('daggerPull', 0.95);
              spawnParticles(fd.x, fd.y, '#2dd4bf', 8, 1.6);
              fd.state = 'returning';
            }
            continue;
          } else {
            // Forward flight
            fd.life -= safeDt;
            fd.x += fd.vx;
            fd.y += fd.vy;
            fd.angle = Math.atan2(fd.vy, fd.vx);

            // Thrown dagger sticks firmly into arena wall when missed
            const minW = 12;
            const maxW = CANVAS_SIZE - 12;
            if (fd.x <= minW || fd.x >= maxW || fd.y <= minW || fd.y >= maxW) {
              fd.x = Math.max(minW, Math.min(maxW, fd.x));
              fd.y = Math.max(minW, Math.min(maxW, fd.y));
              fd.vx = 0;
              fd.vy = 0;
              fd.state = 'stuck_wall';
              fd.wallTimer = 4000; // 4 seconds upon hit to the wall
              sound.play('daggerHitWall', 0.95);
              spawnParticles(fd.x, fd.y, '#2dd4bf', 10, 1.8);
              spawnParticles(fd.x, fd.y, '#e2e8f0', 6, 1.3);
              continue;
            }

            // Check enemy collision
            let hitEnemy = false;
            for (let bIdx = 0; bIdx < activeBalls.length; bIdx++) {
              const enemy = activeBalls[bIdx];
              if (enemy.team !== fd.ownerTeam && !enemy.isDead && !enemy.isDying) {
                const dist = Math.hypot(enemy.x - fd.x, enemy.y - fd.y);
                if (dist < enemy.radius + 14) {
                  // Combat dagger embeds into the victim!
                  sound.play('daggerHit', 0.95);

                  // Inflict 8 projectile damage
                  applyDamage(enemy, fd.damage, owner || enemy, true);

                  // Inflict Bleed: 4 ticks of 1 damage
                  enemy.bleedTicksLeft = 4;
                  enemy.bleedTimer = 500;
                  enemy.bleedSource = owner || enemy;
                  if (!enemy.bleedQueue) enemy.bleedQueue = [];
                  enemy.bleedQueue.push(1, 1, 1, 1);
                  sound.play('bleed', 0.8);

                  // Inflict Slow (-25% SPD, -25% DMG dealt) as long as dagger is stuck
                  enemy.isSlowed = true;
                  // Instantaneous speed clamp to 75%
                  enemy.vx *= 0.75;
                  enemy.vy *= 0.75;

                  if (!enemy.stuckDaggers) enemy.stuckDaggers = [];
                  const relAngle = Math.atan2(fd.y - enemy.y, fd.x - enemy.x);
                  // Dagger is stuck to this target until Dagger Ball body hits them
                  enemy.stuckDaggers.push({
                    ownerId: fd.ownerId,
                    relAngle: relAngle,
                    damage: fd.damage,
                  });

                  // Dagger Ball is weaponless until it rams this enemy
                  if (owner) {
                    owner.isWeaponless = true;
                    owner.hasDagger = false;
                    owner.daggerState = 'weaponless';
                    owner.markedEnemyId = null;
                  }

                  spawnParticles(fd.x, fd.y, '#ef4444', 12, 2.0);
                  spawnParticles(fd.x, fd.y, '#2dd4bf', 10, 1.8);
                  spawnParticles(fd.x, fd.y, '#ffffff', 6, 1.2);

                  flyingDaggers.splice(i, 1);
                  hitEnemy = true;
                  break;
                }
              }
            }

            if (hitEnemy) continue;

            // If flight life expires without hitting, pull back to owner
            if (fd.life <= 0) {
              sound.play('daggerPull', 0.95);
              spawnParticles(fd.x, fd.y, '#2dd4bf', 6, 1.4);
              fd.state = 'returning';
            }
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
                // Fire Ball & Spit Fire Ball incinerate and completely destroy the Thorn Trap on contact!
                if (ball.type === BALL_TYPES.FIRE || ball.type === BALL_TYPES.SPIT_FIRE) {
                  sound.play('fireballBurn', 0.95);
                  const isBlueTrap = ball.type === BALL_TYPES.SPIT_FIRE;
                  const hitMidX = (trap.x + tipX) / 2;
                  const hitMidY = (trap.y + tipY) / 2;
                  // Explosive incineration sparks & burnt charcoal ash
                  spawnParticles(hitMidX, hitMidY, isBlueTrap ? '#38bdf8' : '#f97316', 16, 2.0);
                  spawnParticles(hitMidX, hitMidY, isBlueTrap ? '#67e8f9' : '#fef08a', 8, 2.2);
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
                    isBlue: isBlueTrap,
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
      const isDual = attacker.type === BALL_TYPES.DUAL_SWORD || attacker.type === BALL_TYPES.BABY_DUAL_SWORD;
      const isBaby = attacker.type === BALL_TYPES.BABY_SWORD || attacker.type === BALL_TYPES.BABY_DUAL_SWORD;
      const bladeLen = attacker.config?.bladeLength || (isBaby ? (isDual ? 22 : 26) : (isDual ? 56 : 82));
      const angles = isDual ? [attacker.swordAngle, attacker.swordAngle + Math.PI] : [attacker.swordAngle];

      for (let i = 0; i < angles.length; i++) {
        const curAng = angles[i];
        const reachDist = (attacker.radius || 38) + bladeLen * 0.55;
        const bladeX = attacker.x + Math.cos(curAng) * reachDist;
        const bladeY = attacker.y + Math.sin(curAng) * reachDist;

        const d = Math.hypot(victim.x - bladeX, victim.y - bladeY);
        if (d < victim.radius + bladeLen * 0.48 && victim.invulnerableTimer <= 0) {
          const bladeDmg = attacker.config?.bladeDamage || (isBaby ? (isDual ? 9 : 12) : (isDual ? 12 : 16));
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

          const pushAng = curAng;
          victim.vx += Math.cos(pushAng) * 4.2;
          victim.vy += Math.sin(pushAng) * 4.2;
          spawnParticles(bladeX, bladeY, '#38bdf8', 8, 1.6);
          break; // Hit processed for this frame
        }
      }
    };

    const applyRapierMark = (attacker, victim) => {
      if (attacker.type !== BALL_TYPES.RAPIER || attacker.isDead || attacker.isDying) return;
      if (victim.isDead || victim.isDying) return;
      if (attacker.rapierState === 'aiming' || attacker.rapierState === 'dashing') return;
      if ((attacker.rapierCooldown || 0) > 0) return;

      attacker.rapierState = 'aiming';
      attacker.rapierAimTimer = attacker.config?.aimDuration || 800;
      attacker.markedRapierTargetId = victim.id;
      attacker.vx = 0;
      attacker.vy = 0;
      victim.rapierMarkTimer = 4000;
      sound.play('knifeHit', 0.8);
      spawnParticles(attacker.x, attacker.y, '#f43f5e', 8, 1.4);
    };

    const checkRapierHit = (attacker, victim) => {
      if (attacker.type !== BALL_TYPES.RAPIER || attacker.isDead || attacker.isDying) return;
      if (victim.isDead || victim.isDying) return;

      const rapierLen = attacker.config?.rapierLength || 58;
      const curAng = attacker.rapierAngle || 0;
      const reachDist = (attacker.radius || 34) + rapierLen * 0.62;
      const tipX = attacker.x + Math.cos(curAng) * reachDist;
      const tipY = attacker.y + Math.sin(curAng) * reachDist;

      const d = Math.hypot(victim.x - tipX, victim.y - tipY);
      if (d < victim.radius + rapierLen * 0.44 && victim.invulnerableTimer <= 0) {
        if (attacker.rapierState === 'dashing') {
          // Lethal dash thrust impact (11 DMG)
          const thrustDmg = attacker.config?.dashDamage || 11;
          applyDamage(victim, thrustDmg, attacker, true);
          victim.invulnerableTimer = 220;
          victim.rapierMarkTimer = 0;

          // Push victim backward along thrust angle
          victim.vx += Math.cos(curAng) * 7.5;
          victim.vy += Math.sin(curAng) * 7.5;

          sound.play('swordHit', 1.0);
          spawnParticles(tipX, tipY, '#f43f5e', 14, 2.4);
          spawnParticles(tipX, tipY, '#fbbf24', 8, 1.8);

          // Return Rapier Ball to spinning cooldown
          attacker.rapierState = 'spinning';
          attacker.rapierCooldown = attacker.config?.rapierCooldown || 2800;
          attacker.markedRapierTargetId = null;
          attacker.dashTimer = 0;
          attacker.vx *= 0.25;
          attacker.vy *= 0.25;
        } else if (attacker.rapierState === 'spinning' && (attacker.rapierCooldown || 0) <= 0) {
          // Normal rapier blade contact: 7 weapon DMG + marks enemy to initiate aim & dash thrust!
          const weaponDmg = attacker.config?.rapierDamage || 7;
          applyDamage(victim, weaponDmg, attacker, true);
          victim.invulnerableTimer = 200;
          sound.play('swordHit', 0.85);
          spawnParticles(tipX, tipY, '#f43f5e', 8, 1.2);
          applyRapierMark(attacker, victim);
        }
      }
    };

    const applyDaggerMark = (attacker, victim, isBody = false) => {
      if (!attacker.hasDagger || attacker.isWeaponless || attacker.isDead || attacker.isDying) return;
      if (victim.isDead || victim.isDying) return;
      if (attacker.daggerState === 'spinning' || !attacker.markedEnemyId) {
        attacker.daggerState = 'delay';
        attacker.daggerDelayTimer = 2000;
        attacker.markedEnemyId = victim.id;
        victim.daggerMarkTimer = 4000; // 2s delay + 2s aim
        victim.daggerMarkSourceId = attacker.id;

        if (isBody) {
          sound.play('bodyHit', 0.85);
        } else {
          sound.play('daggerHit', 0.85);
        }
        spawnParticles(victim.x, victim.y, '#2dd4bf', 12, 1.8);
        spawnParticles(victim.x, victim.y, '#5eead4', 8, 1.4);
      }
    };

    const checkDaggerBladeHit = (attacker, victim) => {
      if (!attacker.hasDagger || attacker.isWeaponless || attacker.isDead || attacker.isDying) return;
      const daggerLen = attacker.config?.daggerLength || 44;
      const daggerReach = (attacker.radius || 34) + daggerLen * 0.75;
      const daggerX = attacker.x + Math.cos(attacker.daggerAngle) * daggerReach;
      const daggerY = attacker.y + Math.sin(attacker.daggerAngle) * daggerReach;

      const d = Math.hypot(victim.x - daggerX, victim.y - daggerY);
      if (d < victim.radius + 10 && victim.invulnerableTimer <= 0) {
        const daggerDmg = attacker.config?.daggerDamage || 10;
        applyDamage(victim, daggerDmg, attacker, true);
        victim.invulnerableTimer = 180;

        sound.play('daggerHit', 0.85);
        spawnParticles(daggerX, daggerY, '#2dd4bf', 8, 1.6);
        spawnParticles(daggerX, daggerY, '#ffffff', 5, 1.2);

        applyDaggerMark(attacker, victim, false);

        const pushAng = attacker.daggerAngle;
        victim.vx += Math.cos(pushAng) * 2.8;
        victim.vy += Math.sin(pushAng) * 2.8;
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
        // Hammer head deals heavy strike damage (24 DMG, deals twice the damage against Hard targets: Steel, Stone, Spike)
        const isDoubleTarget = victim.type === BALL_TYPES.STEEL ||
                               victim.type === BALL_TYPES.STONE ||
                               victim.type === BALL_TYPES.SPIKE ||
                               victim.hasHard;
        const baseHammerDmg = attacker.config?.hammerDamage || 24;
        const hammerDmg = isDoubleTarget ? baseHammerDmg * 2 : baseHammerDmg;
        applyDamage(victim, hammerDmg, attacker, true);
        victim.invulnerableTimer = 240;
        sound.play('hammerHit', 0.95);

        // Freeze hammer spin on impact for 110ms
        attacker.hammerHitFreezeTimer = 110;

        // Reverse hammer spin in opposite direction
        attacker.hammerSpeed = -attacker.hammerSpeed;

        // Massive Knockback: blasts the enemy back with heavy force (Tower effect is immune, Heavy is dampened)
        const isVictimTower = victim.type === BALL_TYPES.SLOW || victim.hasTower || victim.config?.hasTower;
        const isVictimHeavy = isVictimTower || victim.type === BALL_TYPES.STONE || (victim.type === BALL_TYPES.GROW && (victim.mass || 1.0) >= 2.8);
        if (!isVictimTower) {
          const pushAng = attacker.hammerAngle;
          const pushForce = isVictimHeavy ? 3.8 : 8.5;
          victim.vx += Math.cos(pushAng) * pushForce;
          victim.vy += Math.sin(pushAng) * pushForce;
        }

        spawnParticles(hammerX, hammerY, isDoubleTarget ? '#fbbf24' : '#f59e0b', isDoubleTarget ? 20 : 14, 2.4);
        spawnParticles(hammerX, hammerY, '#ffffff', isDoubleTarget ? 12 : 8, 1.8);
        if (isDoubleTarget) {
          spawnParticles(hammerX, hammerY, '#94a3b8', 10, 1.6);
        }
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

      // Render active homing mini celestial blue flames from Spit Fire Ball
      if (simState !== 'planning' && physicsRef.current.flyingFlames) {
        const now = performance.now() * 0.001;
        physicsRef.current.flyingFlames.forEach(ff => {
          ctx.save();

          // Render curving fire tail trail
          if (ff.trail && ff.trail.length > 1) {
            ctx.beginPath();
            ctx.moveTo(ff.x, ff.y);
            for (let t = 0; t < ff.trail.length; t++) {
              ctx.lineTo(ff.trail[t].x, ff.trail[t].y);
            }
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
            ctx.lineWidth = 3.2;
            ctx.lineCap = 'round';
            ctx.stroke();

            for (let t = 0; t < ff.trail.length - 1; t++) {
              const pt = ff.trail[t];
              const tAlpha = (1 - t / ff.trail.length) * 0.75;
              const tRadius = Math.max(1, 4.4 * (1 - t / ff.trail.length));
              ctx.beginPath();
              ctx.arc(pt.x, pt.y, tRadius, 0, Math.PI * 2);
              ctx.fillStyle = t % 2 === 0 ? `rgba(56, 189, 248, ${tAlpha})` : `rgba(103, 232, 249, ${tAlpha})`;
              ctx.fill();
            }
          }

          ctx.translate(ff.x, ff.y);
          ctx.rotate(Math.atan2(ff.vy, ff.vx));

          // Outer celestial blue glow
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 12;

          // Mini cel flame teardrop
          const flameLen = 10 + 2 * Math.sin(now * 16);
          const flameW = 5 + Math.sin(now * 12);

          // Outer blue band
          ctx.beginPath();
          ctx.moveTo(flameLen * 0.6, 0);
          ctx.quadraticCurveTo(0, -flameW, -flameLen * 0.5, 0);
          ctx.quadraticCurveTo(0, flameW, flameLen * 0.6, 0);
          ctx.fillStyle = '#0284c7';
          ctx.fill();

          // Mid cyan band
          ctx.beginPath();
          ctx.moveTo(flameLen * 0.45, 0);
          ctx.quadraticCurveTo(0, -flameW * 0.65, -flameLen * 0.35, 0);
          ctx.quadraticCurveTo(0, flameW * 0.65, flameLen * 0.45, 0);
          ctx.fillStyle = '#38bdf8';
          ctx.fill();

          // Inner white-hot ice core
          ctx.beginPath();
          ctx.ellipse(flameLen * 0.15, 0, flameLen * 0.25, flameW * 0.35, 0, 0, Math.PI * 2);
          ctx.fillStyle = '#f0fdfa';
          ctx.fill();

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

      // Render flying combat daggers thrown by Dagger Ball
      if (simState !== 'planning' && physicsRef.current.flyingDaggers) {
        physicsRef.current.flyingDaggers.forEach(fd => {
          ctx.save();
          ctx.translate(fd.x, fd.y);
          ctx.rotate(fd.angle || Math.atan2(fd.vy, fd.vx));

          // Motion streak behind dagger (only while flying or returning)
          if (fd.state !== 'stuck_wall') {
            const streakGrad = ctx.createLinearGradient(-26, 0, 0, 0);
            streakGrad.addColorStop(0, 'rgba(45, 212, 191, 0)');
            streakGrad.addColorStop(0.5, 'rgba(45, 212, 191, 0.4)');
            streakGrad.addColorStop(1, 'rgba(255, 255, 255, 0.9)');
            ctx.strokeStyle = streakGrad;
            ctx.lineWidth = 2.4;
            ctx.beginPath();
            ctx.moveTo(-26, 0);
            ctx.lineTo(0, 0);
            ctx.stroke();
          }

          // Exact held dagger design replica: pommel, grip, guard, blade, fuller groove
          // If stuck in wall, embed the blade tip slightly into the wall surface
          if (fd.state === 'stuck_wall') {
            ctx.translate(-8, 0);
          }

          // Pommel ring
          ctx.fillStyle = '#2dd4bf';
          ctx.fillRect(-29, -4.5, 3.5, 9);

          // Dark teal textured grip handle
          ctx.fillStyle = '#0f766e';
          ctx.fillRect(-25.5, -3.5, 9, 7);

          // Grip texture rings
          ctx.strokeStyle = '#134e4a';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(-22.5, -3.5); ctx.lineTo(-22.5, 3.5);
          ctx.moveTo(-19.5, -3.5); ctx.lineTo(-19.5, 3.5);
          ctx.stroke();

          // Hilt guard & bolster (matching held dagger #14b8a6)
          ctx.fillStyle = '#14b8a6';
          ctx.fillRect(-16.5, -7.5, 4.5, 15);
          ctx.strokeStyle = '#2dd4bf';
          ctx.lineWidth = 1.1;
          ctx.strokeRect(-16.5, -7.5, 4.5, 15);

          // Razor-sharp double-edged dagger blade with steel gradient
          const bladeGrad = ctx.createLinearGradient(-12, 0, 22, 0);
          bladeGrad.addColorStop(0, '#94a3b8');
          bladeGrad.addColorStop(0.5, '#f8fafc');
          bladeGrad.addColorStop(1, '#cbd5e1');

          ctx.fillStyle = bladeGrad;
          ctx.beginPath();
          ctx.moveTo(-12, -4.5);
          ctx.lineTo(14, -4.0);
          ctx.lineTo(22, 0); // razor sharp dagger tip
          ctx.lineTo(14, 4.0);
          ctx.lineTo(-12, 4.5);
          ctx.closePath();
          ctx.fill();

          ctx.strokeStyle = '#e2e8f0';
          ctx.lineWidth = 1.2;
          ctx.stroke();

          // Cyan fuller groove along blade center
          ctx.strokeStyle = '#2dd4bf';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(-8, 0);
          ctx.lineTo(12, 0);
          ctx.stroke();

          ctx.restore();

          // Telekinesis beam when returning
          if (fd.state === 'returning') {
            const owner = physicsRef.current.balls?.find(b => b.id === fd.ownerId);
            if (owner && !owner.isDead) {
              ctx.save();
              ctx.strokeStyle = 'rgba(45, 212, 191, 0.45)';
              ctx.lineWidth = 1.6;
              ctx.setLineDash([4, 4]);
              ctx.beginPath();
              ctx.moveTo(owner.x, owner.y);
              ctx.lineTo(fd.x, fd.y);
              ctx.stroke();
              ctx.restore();
            }
          }

          // Countdown tag on wall stuck dagger
          if (fd.state === 'stuck_wall') {
            const secLeft = Math.max(0, (fd.wallTimer || 0) / 1000).toFixed(1);
            ctx.save();
            ctx.font = '700 8.5px "JetBrains Mono", monospace';
            ctx.fillStyle = '#2dd4bf';
            ctx.textAlign = 'center';
            ctx.fillText(`${secLeft}s`, fd.x, fd.y - 12);
            ctx.restore();
          }
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

        // Push Ball: Draw visible kinetic repulsor radius forcefield when Push Effect is Ready
        if (ball.type === BALL_TYPES.PUSH && ball.hasPushCharge && !ball.isDead && !ball.isDying && simState !== 'planning') {
          drawPushRadiusField(ctx, ball, renderX, renderY, isLight);
        }

        let currentRot = ball.angle || 0;
        if (simState !== 'planning') {
          if (ball.type === BALL_TYPES.FIRE || ball.type === BALL_TYPES.SPIT_FIRE) currentRot = ball.fireAngle || 0;
          else if (ball.type === BALL_TYPES.SPIKE) currentRot = ball.spikeAngle || 0;
          else if (ball.type === BALL_TYPES.HAMMER) currentRot = ball.hammerAngle || 0;
          else if (ball.type === BALL_TYPES.KNIFE) currentRot = ball.knifeAngle || 0;
          else if (ball.type === BALL_TYPES.DAGGER) currentRot = ball.daggerAngle || 0;
          else if (ball.type === BALL_TYPES.RAPIER) currentRot = ball.rapierAngle || 0;
          else if (ball.type === BALL_TYPES.SHARD) currentRot = ball.shardAngle || 0;
          else if (ball.type === BALL_TYPES.GUN || ball.type === BALL_TYPES.BABY_GUN) currentRot = ball.gunAngle || 0;
          else if (ball.type === BALL_TYPES.SNIPER) currentRot = ball.sniperAngle || 0;
          else if (ball.type === BALL_TYPES.THORN) currentRot = ball.thornAngle || 0;
          else if (ball.type === BALL_TYPES.MULTI) currentRot = ball.multiAngle || 0;
          else if (ball.type === BALL_TYPES.PUSH) currentRot = ball.pushAngle || 0;
          else if (ball.type === BALL_TYPES.ACCELERATOR) currentRot = Math.atan2(ball.vy || 0, ball.vx || 1);
          else if (ball.type === BALL_TYPES.DICE) currentRot = 0;
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

        const diceState = ball.type === BALL_TYPES.DICE ? {
          value: ball.displayedDamage ?? ball.damage ?? 1,
          isRolling: (ball.diceRollTimer || 0) > 0,
          tier: ball.diceTier || 'mid',
          popScale: ball.dicePopScale || 1.0,
        } : null;

        const ballExtraData = ball.type === BALL_TYPES.DICE
          ? diceState
          : (ball.type === BALL_TYPES.DAGGER ? { hasDagger: ball.hasDagger && !ball.isWeaponless }
          : (ball.type === BALL_TYPES.PUSH ? { hasPushCharge: ball.hasPushCharge }
          : (ball.type === BALL_TYPES.MOTHER ? { isSpawningBrood: ball.isSpawningBrood }
          : (ball.type === BALL_TYPES.RAPIER ? { isAiming: ball.rapierState === 'aiming', isDashing: ball.rapierState === 'dashing' } : null))));

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
          motionVec,
          ballExtraData
        );

        // Burning status, hit animation, and Spit Fire 3s Target Reticle
        if (simState !== 'planning') {
          drawBurningBallAnimation(ctx, ball, renderX, renderY);
          drawPoisonedBallAnimation(ctx, ball, renderX, renderY);
          drawSpitFireTargetReticle(ctx, ball, renderX, renderY, isLight);
          drawDaggerMarkReticle(ctx, ball, renderX, renderY, isLight);
          drawRapierMarkReticle(ctx, ball, renderX, renderY, isLight);
          drawSlowEffect(ctx, ball, renderX, renderY);
          drawStuckDaggers(ctx, ball, renderX, renderY);
        }

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

          // Dice Ball 7-Count Pity & Roll Indicator below HP bar
          if (ball.type === BALL_TYPES.DICE) {
            const pityCount = Math.min(7, ball.dicePity || 0);
            const isPityReady = pityCount >= 7;
            const pipsTotal = 7;
            const pipH = 2.5;
            const pipGap = 1.5;
            const pipW = (barWidth - (pipsTotal - 1) * pipGap) / pipsTotal;
            const pityY = barY + barHeight + 2;

            // Render 7 Pity Segment Pips
            for (let p = 0; p < pipsTotal; p++) {
              const px = barX + p * (pipW + pipGap);
              const isFilled = pityCount > p;
              if (isFilled) {
                ctx.fillStyle = isPityReady ? '#fbbf24' : '#f59e0b';
                if (isPityReady) {
                  ctx.shadowColor = '#fbbf24';
                  ctx.shadowBlur = 4;
                }
              } else {
                ctx.fillStyle = isLight ? '#cbd5e1' : '#1e293b';
              }
              ctx.fillRect(px, pityY, pipW, pipH);
              ctx.shadowBlur = 0;

              ctx.strokeStyle = isPityReady && isFilled ? '#f59e0b' : (isLight ? '#94a3b8' : '#334155');
              ctx.lineWidth = 0.5;
              ctx.strokeRect(px, pityY, pipW, pipH);
            }

            // Snappy Roll Progress bar overlay right below pity pips when rolling
            if ((ball.diceRollTimer || 0) > 0) {
              const rollBarH = 2.0;
              const rollBarY = pityY + pipH + 1.5;
              const prog = Math.min(1, Math.max(0, 1 - ball.diceRollTimer / 260));

              ctx.fillStyle = isLight ? '#cbd5e1' : '#1e293b';
              ctx.fillRect(barX, rollBarY, barWidth, rollBarH);

              const tierCol = ball.diceTier === 'god' ? '#ef4444' : (ball.diceTier === 'high' ? '#f59e0b' : (ball.diceTier === 'mid' ? '#06b6d4' : '#94a3b8'));
              ctx.fillStyle = tierCol;
              ctx.fillRect(barX, rollBarY, barWidth * prog, rollBarH);
            }
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

          // Dagger Ball: 7-second weaponless reload timer / recall indicator below HP bar
          if (ball.type === BALL_TYPES.DAGGER) {
            const daggerBarH = 2.5;
            const daggerBarY = barY + barHeight + 2;
            const isWeaponless = !!ball.isWeaponless;
            const totalTimer = ball.weaponlessMaxTimer || 7000;
            const timer = ball.weaponlessTimer !== undefined ? ball.weaponlessTimer : 0;
            const isStuckOnVictim = isWeaponless && timer > 0;
            const progress = isStuckOnVictim
              ? Math.min(1, Math.max(0, 1 - timer / totalTimer))
              : (isWeaponless ? 0.35 : 1.0);

            ctx.fillStyle = isLight ? '#cbd5e1' : '#1e293b';
            ctx.fillRect(barX, daggerBarY, barWidth, daggerBarH);

            ctx.fillStyle = isWeaponless ? '#2dd4bf' : '#14b8a6';
            ctx.fillRect(barX, daggerBarY, barWidth * progress, daggerBarH);

            ctx.strokeStyle = isLight ? '#94a3b8' : '#334155';
            ctx.lineWidth = 0.5;
            ctx.strokeRect(barX, daggerBarY, barWidth, daggerBarH);

            // Digital timer countdown label right below reload bar when weaponless
            if (isStuckOnVictim) {
              const secLeft = (timer / 1000).toFixed(1);
              ctx.font = '700 8px "JetBrains Mono", monospace';
              ctx.textAlign = 'center';
              ctx.fillStyle = isLight ? '#0f766e' : '#2dd4bf';
              ctx.fillText(`${secLeft}s`, barX + barWidth / 2, daggerBarY + daggerBarH + 7);
            }
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

      // Render divine blessing aura rings
      if (simState !== 'planning' && physicsRef.current.blessRings) {
        physicsRef.current.blessRings.forEach(br => {
          ctx.save();
          const alpha = Math.max(0, br.life);
          ctx.globalAlpha = Math.min(1.0, alpha);

          // Golden celestial outer ring
          ctx.strokeStyle = '#fde047';
          ctx.lineWidth = 3.5 * alpha;
          ctx.shadowColor = '#f59e0b';
          ctx.shadowBlur = 14 * alpha;
          ctx.beginPath();
          ctx.arc(br.x, br.y, br.radius, 0, Math.PI * 2);
          ctx.stroke();

          // Inner halo shimmer
          if (br.radius > 20) {
            ctx.strokeStyle = '#fef08a';
            ctx.lineWidth = 1.6 * alpha;
            ctx.beginPath();
            ctx.arc(br.x, br.y, br.radius * 0.75, 0, Math.PI * 2);
            ctx.stroke();
          }

          ctx.restore();
        });
      }

      // Render kinetic push shockwaves
      if (simState !== 'planning' && physicsRef.current.pushShockwaves) {
        physicsRef.current.pushShockwaves.forEach(ps => {
          ctx.save();
          const alpha = Math.max(0, ps.life);
          ctx.globalAlpha = Math.min(1.0, alpha);

          // Outer expanding shockwave ring
          ctx.strokeStyle = '#818cf8';
          ctx.lineWidth = 3.5 * alpha;
          ctx.shadowColor = '#6366f1';
          ctx.shadowBlur = 12 * alpha;
          ctx.beginPath();
          ctx.arc(ps.x, ps.y, ps.radius, 0, Math.PI * 2);
          ctx.stroke();

          // Inner echo ripple ring
          if (ps.radius > 20) {
            ctx.strokeStyle = '#c7d2fe';
            ctx.lineWidth = 1.8 * alpha;
            ctx.beginPath();
            ctx.arc(ps.x, ps.y, ps.radius * 0.72, 0, Math.PI * 2);
            ctx.stroke();
          }

          ctx.restore();
        });
      }

      // Render fiery impact blast animations
      if (simState !== 'planning' && physicsRef.current.fireImpacts) {
        physicsRef.current.fireImpacts.forEach(fi => {
          ctx.save();
          const alpha = Math.max(0, fi.life);
          ctx.globalAlpha = Math.min(1.0, alpha);

          const isBlueBlast = !!fi.isBlue;

          // 1. Searing blast flash at epicenter
          const flashGrad = ctx.createRadialGradient(fi.x, fi.y, 0, fi.x, fi.y, fi.radius * 0.65);
          flashGrad.addColorStop(0, '#ffffff');
          flashGrad.addColorStop(0.35, isBlueBlast ? 'rgba(103, 232, 249, 0.9)' : 'rgba(254, 240, 138, 0.9)');
          flashGrad.addColorStop(0.7, isBlueBlast ? 'rgba(14, 165, 233, 0.55)' : 'rgba(249, 115, 22, 0.55)');
          flashGrad.addColorStop(1, isBlueBlast ? 'rgba(2, 132, 199, 0)' : 'rgba(220, 38, 38, 0)');
          ctx.fillStyle = flashGrad;
          ctx.beginPath();
          ctx.arc(fi.x, fi.y, fi.radius * 0.65, 0, Math.PI * 2);
          ctx.fill();

          // 2. Expanding fiery shockwave ring
          ctx.strokeStyle = isBlueBlast ? `rgba(14, 165, 233, ${alpha * 0.85})` : `rgba(249, 115, 22, ${alpha * 0.85})`;
          ctx.lineWidth = Math.max(2, 6 * alpha);
          ctx.beginPath();
          ctx.arc(fi.x, fi.y, fi.radius, 0, Math.PI * 2);
          ctx.stroke();

          // 3. Inner golden / cyan heat ring
          ctx.strokeStyle = isBlueBlast ? `rgba(103, 232, 249, ${alpha})` : `rgba(254, 240, 138, ${alpha})`;
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
            ctx.strokeStyle = isBlueBlast
              ? (r % 2 === 0 ? `rgba(103, 232, 249, ${alpha})` : `rgba(14, 165, 233, ${alpha})`)
              : (r % 2 === 0 ? `rgba(254, 240, 138, ${alpha})` : `rgba(249, 115, 22, ${alpha})`);
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
            ctx.shadowColor = dt.isHeal ? 'rgba(16, 185, 129, 0.45)' : (dt.isPoison ? 'rgba(16, 185, 129, 0.55)' : (dt.isBurn ? 'rgba(234, 88, 12, 0.45)' : 'rgba(0,0,0,0.18)'));
            ctx.shadowBlur = (dt.isHeal || dt.isPoison || dt.isBurn) ? 6 : 4;
            ctx.fillStyle = dt.isHeal ? '#059669' : (dt.isPoison ? '#15803d' : (dt.isShieldAbsorb ? '#0284c7' : (dt.isBurn ? '#c2410c' : (dt.isCritical ? '#b91c1c' : '#dc2626'))));
          } else {
            ctx.shadowColor = dt.isHeal ? '#10b981' : (dt.isPoison ? '#10b981' : (dt.isBurn ? '#ea580c' : '#000000'));
            ctx.shadowBlur = (dt.isHeal || dt.isPoison || dt.isBurn) ? 8 : 6;
            ctx.fillStyle = dt.isHeal ? '#34d399' : (dt.isPoison ? '#4ade80' : (dt.isShieldAbsorb ? '#38bdf8' : (dt.isBurn ? '#f97316' : (dt.isCritical ? '#f87171' : '#ef4444'))));
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
      {/* Pure Crisp Monochrome Skeleton Loading Screen */}
      {isLoading && (
        <div
          className={`tactical-loading-screen ${loadingFading ? 'fade-out' : ''}`}
          onClick={dismissLoadingScreen}
          role="button"
          tabIndex={0}
          title="Loading tactical sandbox..."
        >
          {/* Subtle Neutral Gray Grid Backdrop */}
          <div className="loading-grid-backdrop" />

          {/* Top Minimal Gray Progress Line */}
          <div className="loading-top-line">
            <div
              className="loading-top-fill"
              style={{ width: `${Math.max(6, loadingProgress)}%` }}
            />
          </div>

          {/* SKELETON WIREFRAME: Exact 1:1 Layout Match, Zero Border-Radius, Pure Gray */}
          <div className="skeleton-app-layout" aria-hidden="true">
            {/* 1. Top Nav Skeleton */}
            <header className="skeleton-nav">
              <div className="skeleton-nav-left">
                <div className="skeleton-box skeleton-nav-title skeleton-shimmer" />
                <div className="skeleton-box skeleton-nav-badge skeleton-shimmer" />
              </div>
              <div className="skeleton-nav-right">
                <div className="skeleton-box skeleton-nav-help skeleton-shimmer" />
                <div className="skeleton-box skeleton-nav-btn skeleton-shimmer" />
                <div className="skeleton-box skeleton-nav-btn-lg skeleton-shimmer" />
                <div className="skeleton-box skeleton-nav-btn skeleton-shimmer" />
                <div className="skeleton-box skeleton-nav-tally skeleton-shimmer" />
              </div>
            </header>

            {/* 2. Main Body Skeleton */}
            <div className="skeleton-body">
              {/* Left Sidebar Skeleton (310px wide with buttons at bottom footer) */}
              <aside className="skeleton-sidebar">
                <div className="skeleton-sidebar-header">
                  <div className="skeleton-box skeleton-arsenal-title skeleton-shimmer" />
                  <div className="skeleton-box skeleton-filter-btn skeleton-shimmer" />
                </div>

                <div className="skeleton-sidebar-hint">
                  <div className="skeleton-box skeleton-hint-line skeleton-shimmer" />
                </div>

                {/* List of 6 Crisp Rectangular Ball Cards */}
                <div className="skeleton-ball-list">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="skeleton-ball-card">
                      <div className="skeleton-box skeleton-ball-avatar skeleton-shimmer" />
                      <div className="skeleton-ball-meta">
                        <div className="skeleton-box skeleton-card-name skeleton-shimmer" />
                        <div className="skeleton-box skeleton-card-stats skeleton-shimmer" />
                      </div>
                      <div className="skeleton-box skeleton-card-rarity skeleton-shimmer" />
                    </div>
                  ))}
                </div>

                {/* Accurate Sidebar Footer: Start Battle, Clear, Speed Buttons */}
                <div className="skeleton-sidebar-footer">
                  <div className="skeleton-action-row">
                    <div className="skeleton-box skeleton-btn-play skeleton-shimmer" />
                    <div className="skeleton-box skeleton-btn-clear skeleton-shimmer" />
                  </div>
                  <div className="skeleton-speed-row">
                    <div className="skeleton-box skeleton-speed-label skeleton-shimmer" />
                    <div className="skeleton-speed-btns">
                      {[1, 2, 3, 4].map(s => (
                        <div key={s} className="skeleton-box skeleton-speed-pill skeleton-shimmer" />
                      ))}
                    </div>
                  </div>
                </div>
              </aside>

              {/* Right Arena Stage Skeleton */}
              <main className="skeleton-arena-area">
                {/* Floating Hint Banner Placeholder */}
                <div className="skeleton-box skeleton-floating-banner skeleton-shimmer" />

                {/* Stage Wrapper: Left HUD, Center 600x600 Arena, Right HUD */}
                <div className="skeleton-stage-wrapper">
                  {/* Left Side A HUD Card */}
                  <div className="skeleton-hud-col">
                    <div className="skeleton-hud-card">
                      <div className="skeleton-box skeleton-hud-title skeleton-shimmer" />
                      <div className="skeleton-box skeleton-hud-unit-card skeleton-shimmer" />
                    </div>
                  </div>

                  {/* 600x600 Crisp Square Arena Box */}
                  <div className="skeleton-arena-box">
                    <div className="skeleton-arena-grid-canvas" />
                    <div className="skeleton-corner top-left" />
                    <div className="skeleton-corner top-right" />
                    <div className="skeleton-corner bottom-left" />
                    <div className="skeleton-corner bottom-right" />

                    {/* Subtle Crisp Gray Center Reticle */}
                    <div className="skeleton-radar-reticle">
                      <div className="radar-ring ring-outer" />
                      <div className="radar-ring ring-middle" />
                      <div className="radar-ring ring-inner" />
                      <div className="radar-crosshair-h" />
                      <div className="radar-crosshair-v" />
                      <div className="radar-center-core" />
                    </div>
                  </div>

                  {/* Right Side B HUD Card */}
                  <div className="skeleton-hud-col">
                    <div className="skeleton-hud-card">
                      <div className="skeleton-box skeleton-hud-title skeleton-shimmer" />
                      <div className="skeleton-box skeleton-hud-unit-card skeleton-shimmer" />
                    </div>
                  </div>
                </div>
              </main>
            </div>
          </div>
        </div>
      )}

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

                      <tr className="row-inflict">
                        <td className="col-status-tag">
                          <span
                            className="chip-badge badge-flame-lock"
                            onMouseEnter={(e) => showTooltip(e, 'FLAME_LOCK')}
                            onMouseLeave={hideTooltip}
                          >
                            <SpitFireTargetIcon size={13} color="#38bdf8" /> FLAME LOCK
                          </span>
                        </td>
                        <td className="col-source">Spit Fire Ball Strike</td>
                        <td className="col-description">
                          Locked by an enemy Spit Fire Ball for <strong>5 seconds</strong>, targeted by a continuous curving barrage of homing mini blue flames dealing <strong>1 damage</strong> each and inflicting Scorch as long as Flame Lock remains active.
                        </td>
                      </tr>

                      <tr className="row-inflict">
                        <td className="col-status-tag">
                          <span
                            className="chip-badge badge-scorch"
                            onMouseEnter={(e) => showTooltip(e, 'SCORCH')}
                            onMouseLeave={hideTooltip}
                          >
                            <BurnIcon size={13} color="#38bdf8" /> SCORCH
                          </span>
                        </td>
                        <td className="col-source">Spit Fire Ball / Mini Flames</td>
                        <td className="col-description">
                          Searing celestial blue fire damage ticks dealing true fire damage over an extended duration. Unlike puncture bleed, Scorch bypasses armor bleed immunity.
                        </td>
                      </tr>

                      <tr className="row-inflict">
                        <td className="col-status-tag">
                          <span
                            className="chip-badge badge-dagger-mark"
                            onMouseEnter={(e) => showTooltip(e, 'DAGGER_MARK')}
                            onMouseLeave={hideTooltip}
                          >
                            <DaggerIcon size={13} color="#14b8a6" /> DAGGER MARK
                          </span>
                        </td>
                        <td className="col-source">Dagger Ball Contact</td>
                        <td className="col-description">
                          Inflicted upon contact with Dagger Ball's body or dagger blade. After 2 seconds, Dagger Ball enters Aim Mode while moving to aim for 2 seconds and throw its dagger at this target.
                        </td>
                      </tr>

                      <tr className="row-inflict">
                        <td className="col-status-tag">
                          <span
                            className="chip-badge badge-dagger-hit"
                            onMouseEnter={(e) => showTooltip(e, 'DAGGER_HIT')}
                            onMouseLeave={hideTooltip}
                          >
                            <DaggerIcon size={13} color="#2dd4bf" /> DAGGER HIT
                          </span>
                        </td>
                        <td className="col-source">Dagger Ball Embedded Blade</td>
                        <td className="col-description">
                          Inflicted when struck by a thrown combat dagger. Target is hampered by the embedded blade, suffering <strong>Bleed</strong> and <strong>Slow (-25% SPD, -25% DMG)</strong> until Dagger Ball's body collides with this enemy.
                        </td>
                      </tr>

                      <tr className="row-inflict">
                        <td className="col-status-tag">
                          <span
                            className="chip-badge badge-dagger-pull"
                            onMouseEnter={(e) => showTooltip(e, 'DAGGER_PULL')}
                            onMouseLeave={hideTooltip}
                          >
                            <DaggerIcon size={13} color="#38bdf8" /> TELEKINESIS RECALL
                          </span>
                        </td>
                        <td className="col-source">Dagger Ball Wall Recall</td>
                        <td className="col-description">
                          Self-inflict ability that telekinetically recalls a missed combat dagger back to Dagger Ball 4 seconds after embedding into an arena wall.
                        </td>
                      </tr>

                      <tr className="row-inflict">
                        <td className="col-status-tag">
                          <span
                            className="chip-badge badge-rapier-mark"
                            onMouseEnter={(e) => showTooltip(e, 'RAPIER_MARK')}
                            onMouseLeave={hideTooltip}
                          >
                            <RapierIcon size={13} color="#f43f5e" /> RAPIER MARK
                          </span>
                        </td>
                        <td className="col-source">Rapier Ball Contact</td>
                        <td className="col-description">
                          Inflicted upon contact with Rapier Ball's weapon or body. Rapier Ball stops moving to aim its rapier directly at this target for 0.8s, then dashes forward with a deadly 28 DMG thrust.
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
                            className="chip-badge badge-hard"
                            onMouseEnter={(e) => showTooltip(e, 'HARD')}
                            onMouseLeave={hideTooltip}
                          >
                            <HardIcon size={13} color="#94a3b8" /> HARD
                          </span>
                        </td>
                        <td className="col-source">Steel Ball / Stone Ball</td>
                        <td className="col-description">
                          Dense, hardened structural composition. Highly vulnerable to concussive warhammer strikes (<strong>Hammer Ball deals 2x damage</strong> against Hard targets).
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
                          Every time it collides with an enemy ball or absorbs spit fire hits, it absorbs impact energy and physically expands in size and mass (<strong>up to 10.0 max mass</strong>), gaining the <strong>Heavy Effect</strong> once reaching 2.8+ mass.
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

                      <tr>
                        <td className="col-status-tag">
                          <span
                            className="chip-badge badge-incineration"
                            onMouseEnter={(e) => showTooltip(e, 'INCINERATION')}
                            onMouseLeave={hideTooltip}
                          >
                            <SpitFireIcon size={13} color="#38bdf8" /> INCINERATION
                          </span>
                        </td>
                        <td className="col-source">Spit Fire Ball Innate Trait</td>
                        <td className="col-description">
                          Self-imbued mythical celestial blue flame aura. Leaves an azure ground trail, incinerates enemy Thorn Traps on contact, and inflicts Scorch and Flame Lock (<strong>5 seconds</strong>) while unleashing curving mini blue flame barrages.
                        </td>
                      </tr>

                      <tr>
                        <td className="col-status-tag">
                          <span
                            className="chip-badge badge-brood"
                            onMouseEnter={(e) => showTooltip(e, 'BROOD')}
                            onMouseLeave={hideTooltip}
                          >
                            <BroodIcon size={13} color="#f472b6" /> BROOD
                          </span>
                        </td>
                        <td className="col-source">Mother Ball Mythical Trait</td>
                        <td className="col-description">
                          Channels maternal brood birthing. Mother Ball has <strong>1.2 SPD</strong>, halts while spawning baby balls (costs 5 HP), and cycles between Tough Baby, Sword Baby, and Gun Baby up to 3 max active brood.
                        </td>
                      </tr>

                      <tr>
                        <td className="col-status-tag">
                          <span
                            className="chip-badge badge-dash"
                            onMouseEnter={(e) => showTooltip(e, 'DASH')}
                            onMouseLeave={hideTooltip}
                          >
                            <DashIcon size={13} color="#fbbf24" /> DASH
                          </span>
                        </td>
                        <td className="col-source">Rapier Ball Trait</td>
                        <td className="col-description">
                          Self-effect trait triggered after completing aim lock. Rapier Ball surges forward at <strong>17.5 speed</strong> with crimson speed trails, piercing its target for <strong>28 thrust damage</strong>.
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
                        <td className="col-source">Sword Ball / Dual Sword Ball Accessory</td>
                        <td className="col-description">
                          Spinning sword blade deals <strong>22 blade damage</strong> (Sword Ball) or <strong>18 blade damage</strong> across twin front & back blades (Dual Sword Ball), triggers a 100ms hit-stop animation, and reverses spin direction on strike.
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

                      <tr>
                        <td className="col-status-tag">
                          <span
                            className="chip-badge badge-dagger"
                            onMouseEnter={(e) => showTooltip(e, 'DAGGER')}
                            onMouseLeave={hideTooltip}
                          >
                            <DaggerIcon size={13} color="#2dd4bf" /> DAGGER
                          </span>
                        </td>
                        <td className="col-source">Dagger Ball Weapon</td>
                        <td className="col-description">
                          Spins and bounces with a combat dagger. Contact with body or weapon inflicts <strong>Dagger Mark</strong>. 2 seconds later, Dagger Ball aims for 2 seconds while moving and hurls the dagger dealing <strong>8 projectile damage</strong>, <strong>Bleed</strong>, and <strong>Slow (-25% SPD, -25% DMG)</strong>. The dagger can only be retrieved by ramming the victim with Dagger Ball's body, or after 4s via telekinesis if it hit a wall.
                        </td>
                      </tr>

                      <tr>
                        <td className="col-status-tag">
                          <span
                            className="chip-badge badge-rapier"
                            onMouseEnter={(e) => showTooltip(e, 'RAPIER')}
                            onMouseLeave={hideTooltip}
                          >
                            <RapierIcon size={13} color="#fbbf24" /> RAPIER
                          </span>
                        </td>
                        <td className="col-source">Rapier Ball Weapon</td>
                        <td className="col-description">
                          Slender fencing rapier with ornate golden cup-hilt. Rotates in combat dealing <strong>12 weapon damage</strong> (5 body bump DMG); upon contacting an enemy, marks the victim, aims for 0.8s, and launches a lightning forward dash thrust for <strong>28 piercing damage</strong>.
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
                      <span className="count-tag">{Object.values(BALL_CONFIGS).filter(b => !b.isSummonOnly).length}</span>
                    </button>
                    {Object.values(RARITIES).map(r => {
                      const count = Object.values(BALL_CONFIGS).filter(b => !b.isSummonOnly && b.rarity === r).length;
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
              .filter(ball => !ball.isSummonOnly && (rarityFilter === 'ALL' || ball.rarity === rarityFilter))
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
                      <span>{ball.baseHp} HP</span>
                      <span className="ball-stat-dot">·</span>
                      <span>{ball.damage} DMG</span>
                      {getWeaponDamage(ball) !== null && (
                        <>
                          <span className="ball-stat-dot">·</span>
                          <span className="ball-stat-wpn">{getWeaponDamage(ball)} WPN</span>
                        </>
                      )}
                      <span className="ball-stat-dot">·</span>
                      <span>{ball.speed} SPD</span>
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
                                  <span className="hud-charge-txt">CANNON RELOAD</span>
                                  <span className="hud-charge-numeric">
                                    {((3000 - Math.max(0, b.gunCooldown !== undefined ? b.gunCooldown : 3000)) / 1000).toFixed(1)}s / 3.0s
                                  </span>
                                </div>
                                <div className="hud-charge-bar-track" style={{ display: 'block', width: '100%', height: 4, background: 'rgba(148, 163, 184, 0.16)', borderRadius: 2, overflow: 'hidden' }}>
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
                                  <span className="hud-charge-txt">HEAL RECHARGE</span>
                                  <span className="hud-charge-numeric">
                                    {((6000 - Math.max(0, b.healTimer !== undefined ? b.healTimer : 6000)) / 1000).toFixed(1)}s / 6.0s
                                  </span>
                                </div>
                                <div className="hud-charge-bar-track" style={{ display: 'block', width: '100%', height: 4, background: 'rgba(148, 163, 184, 0.16)', borderRadius: 2, overflow: 'hidden' }}>
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

                            {/* Dice Ball Roll & Pity Status in HUD */}
                            {b.type === BALL_TYPES.DICE && (
                              <div className="hud-shield-charge-wrapper" title="Dice Pity: Taking damage 7 times absorbs pity to transform Mid/Low rolls into a High Roll (30-50 DMG)">
                                <div className="hud-charge-label-row">
                                  <span className="hud-charge-txt">
                                    {(b.dicePity || 0) >= 7 ? 'HIGH ROLL PITY READY!' : 'HIGH ROLL PITY'}
                                  </span>
                                  <span className="hud-charge-numeric">
                                    {b.dicePity || 0} / 7 HITS
                                  </span>
                                </div>
                                <div className="hud-charge-bar-track" style={{ display: 'block', width: '100%', height: 4, background: 'rgba(148, 163, 184, 0.16)', borderRadius: 2, overflow: 'hidden' }}>
                                  <div
                                    style={{
                                      width: `${Math.min(100, Math.max(0, ((b.dicePity || 0) / 7) * 100))}%`,
                                      height: '100%',
                                      backgroundColor: (b.dicePity || 0) >= 7 ? '#fbbf24' : '#f59e0b',
                                      boxShadow: (b.dicePity || 0) >= 7 ? '0 0 8px rgba(251, 191, 36, 0.8)' : '0 0 6px rgba(245, 158, 11, 0.6)',
                                      transition: 'width 0.1s ease',
                                    }}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Sniper Ball 4-Second Sniper Lock-On Bar */}
                            {b.type === BALL_TYPES.SNIPER && (
                              <div className="hud-shield-charge-wrapper" title="Sniper Lock-On: Freezes midair to aim and shoot 15 DMG bullet">
                                <div className="hud-charge-label-row">
                                  <span className="hud-charge-txt">
                                    {b.sniperState === 'aiming' ? 'TARGET LOCKED' : 'SNIPER RELOAD'}
                                  </span>
                                  <span className="hud-charge-numeric">
                                    {b.sniperState === 'aiming'
                                      ? `AIMING ${(((b.config?.aimDuration || 1000) - Math.max(0, b.sniperAimTimer || 0)) / 1000).toFixed(1)}s / ${((b.config?.aimDuration || 1000) / 1000).toFixed(1)}s`
                                      : `${((4000 - Math.max(0, b.sniperCooldown !== undefined ? b.sniperCooldown : 4000)) / 1000).toFixed(1)}s / 4.0s`}
                                  </span>
                                </div>
                                <div className="hud-charge-bar-track" style={{ display: 'block', width: '100%', height: 4, background: 'rgba(148, 163, 184, 0.16)', borderRadius: 2, overflow: 'hidden' }}>
                                  <div
                                    style={{
                                      width: b.sniperState === 'aiming'
                                        ? `${Math.min(100, Math.max(0, (((b.config?.aimDuration || 1000) - Math.max(0, b.sniperAimTimer || 0)) / (b.config?.aimDuration || 1000)) * 100))}%`
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

                                                                                    {/* Priest Ball Divine Blessing Bar */}
                            {b.type === BALL_TYPES.PRIEST && (
                              <div className="hud-shield-charge-wrapper" title="Divine Blessing: Map-wide heal across the entire canvas after 9s (inflicts Heal +5, +3, +1, +1 to self & allies)">
                                <div className="hud-charge-label-row">
                                  <span className="hud-charge-txt">DIVINE BLESSING</span>
                                  <span className="hud-charge-numeric">
                                    {(b.blessTimer || 0) <= 0
                                      ? 'READY (+5 +3 +1 +1)'
                                      : `${(((9000 - Math.max(0, b.blessTimer || 0))) / 1000).toFixed(1)}s / 9.0s`}
                                  </span>
                                </div>
                                <div className="hud-charge-bar-track" style={{ display: 'block', width: '100%', height: 4, background: 'rgba(148, 163, 184, 0.16)', borderRadius: 2, overflow: 'hidden' }}>
                                  <div
                                    style={{
                                      width: `${Math.min(100, Math.max(0, ((9000 - Math.max(0, b.blessTimer || 0)) / 9000) * 100))}%`,
                                      height: '100%',
                                      backgroundColor: (b.blessTimer || 0) <= 0 ? '#fde047' : '#f59e0b',
                                      boxShadow: '0 0 6px rgba(245, 158, 11, 0.7)',
                                      transition: 'width 0.05s linear',
                                    }}
                                  />
                                </div>
                              </div>
                            )}
                            {/* Push Ball Kinetic Repulsor Bar (Hit-to-Activate & 12s -> 2s Cooldown) */}
                            {b.type === BALL_TYPES.PUSH && (
                              <div className="hud-shield-charge-wrapper" title="Kinetic Repulsor: Needs 1 hit to activate passive. Once triggered, repels nearby enemies and enters cooldown (12s -> 10s -> 8s -> 6s -> 4s -> 2s on subsequent hits).">
                                <div className="hud-charge-label-row">
                                  <span className="hud-charge-txt">
                                    {!b.isPushActive ? 'PASSIVE: 0 / 1 HIT' : (b.hasPushCharge ? 'REPULSOR READY' : 'RECHARGING REPULSOR')}
                                  </span>
                                  <span className="hud-charge-numeric">
                                    {!b.isPushActive
                                      ? 'INACTIVE'
                                      : b.hasPushCharge
                                      ? `READY (${[12, 10, 8, 6, 4, 2][b.pushTierIndex || 0] || 12}s CD)`
                                      : `${((b.pushCooldownTimer || 0) / 1000).toFixed(1)}s / ${[12, 10, 8, 6, 4, 2][b.pushTierIndex || 0] || 12}s`}
                                  </span>
                                </div>
                                <div className="hud-charge-bar-track" style={{ display: 'block', width: '100%', height: 4, background: 'rgba(148, 163, 184, 0.16)', borderRadius: 2, overflow: 'hidden' }}>
                                  <div
                                    style={{
                                      width: !b.isPushActive
                                        ? '0%'
                                        : b.hasPushCharge
                                        ? '100%'
                                        : `${Math.max(0, Math.min(100, (1 - (b.pushCooldownTimer || 0) / (([12, 10, 8, 6, 4, 2][b.pushTierIndex || 0] || 12) * 1000)) * 100))}%`,
                                      height: '100%',
                                      backgroundColor: b.hasPushCharge ? '#818cf8' : '#6366f1',
                                      boxShadow: b.hasPushCharge ? '0 0 8px rgba(129, 140, 248, 0.8)' : 'none',
                                      transition: 'width 0.1s linear',
                                    }}
                                  />
                                </div>
                              </div>
                            )}
                            {/* Dagger Ball Dynamic Combat Bar (Inflicts Dagger Mark on enemy, self shows aim prep & recall) */}
                            {b.type === BALL_TYPES.DAGGER && (
                              <div className="hud-shield-charge-wrapper" title="Combat Dagger: Inflicts Dagger Mark on enemy; self stops moving to aim and throws dagger">
                                <div className="hud-charge-label-row">
                                  <span className="hud-charge-txt">
                                    {b.daggerState === 'aiming'
                                      ? 'AIM LOCK'
                                      : b.daggerState === 'delay'
                                      ? 'AIM PREP'
                                      : b.isWeaponless
                                      ? (physicsRef.current.flyingDaggers?.some(fd => fd.ownerId === b.id && fd.state === 'stuck_wall')
                                          ? 'WALL RECALL'
                                          : 'DAGGER RECALL')
                                      : 'COMBAT DAGGER'}
                                  </span>
                                  <span className="hud-charge-numeric">
                                    {b.daggerState === 'aiming'
                                      ? `${(((2000 - Math.max(0, b.daggerAimTimer || 0))) / 1000).toFixed(1)}s / 2.0s`
                                      : b.daggerState === 'delay'
                                      ? `${(((2000 - Math.max(0, b.daggerDelayTimer || 0))) / 1000).toFixed(1)}s / 2.0s`
                                      : b.isWeaponless
                                      ? (physicsRef.current.flyingDaggers?.some(fd => fd.ownerId === b.id && fd.state === 'stuck_wall')
                                          ? `${(((4000 - Math.max(0, (physicsRef.current.flyingDaggers.find(fd => fd.ownerId === b.id && fd.state === 'stuck_wall')?.wallTimer || 0)))) / 1000).toFixed(1)}s / 4.0s`
                                          : (physicsRef.current.balls.some(other => other.stuckDaggers?.some(d => d.ownerId === b.id))
                                              ? 'EMBEDDED'
                                              : 'CALLING'))
                                      : 'READY'}
                                  </span>
                                </div>
                                <div className="hud-charge-bar-track" style={{ display: 'block', width: '100%', height: 4, background: 'rgba(148, 163, 184, 0.16)', borderRadius: 2, overflow: 'hidden' }}>
                                  <div
                                    style={{
                                      width: b.daggerState === 'aiming'
                                        ? `${Math.max(0, Math.min(100, (1 - (b.daggerAimTimer || 0) / 2000) * 100))}%`
                                        : b.daggerState === 'delay'
                                        ? `${Math.max(0, Math.min(100, (1 - (b.daggerDelayTimer || 0) / 2000) * 100))}%`
                                        : b.isWeaponless
                                        ? (physicsRef.current.flyingDaggers?.some(fd => fd.ownerId === b.id && fd.state === 'stuck_wall')
                                            ? `${Math.max(0, Math.min(100, (1 - (physicsRef.current.flyingDaggers.find(fd => fd.ownerId === b.id && fd.state === 'stuck_wall')?.wallTimer || 0) / 4000) * 100))}%`
                                            : '35%')
                                        : '100%',
                                      height: '100%',
                                      backgroundColor: b.daggerState === 'aiming' ? '#38bdf8' : '#2dd4bf',
                                      boxShadow: '0 0 6px rgba(45, 212, 191, 0.7)',
                                      transition: 'width 0.05s linear',
                                    }}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Mother Ball Brood Birthing Bar */}
                            {b.type === BALL_TYPES.MOTHER && (
                              <div className="hud-shield-charge-wrapper" title="Brood: Every 5.5s, stops moving to birth a baby ball (costs 5 HP). Cycles Tough Baby, Sword Baby, Gun Baby, and Dual Sword Baby (max 4 active).">
                                <div className="hud-charge-label-row">
                                  <span className="hud-charge-txt">
                                    {b.isSpawningBrood ? 'BIRTHING BABY (-5 HP)...' : `NEXT: ${b.broodNextType ? b.broodNextType.replace('BABY_', '').replace('_', ' ') : 'NORMAL'}`}
                                  </span>
                                  <span className="hud-charge-numeric">
                                    {(physicsRef.current.balls.filter(o => o.motherId === b.id && !o.isDead && !o.isDying).length >= 4)
                                      ? 'MAX BROOD (4/4)'
                                      : (b.isSpawningBrood
                                        ? '-5 HP'
                                        : `${(((5500 - Math.max(0, b.broodTimer || 0))) / 1000).toFixed(1)}s / 5.5s`)}
                                  </span>
                                </div>
                                <div className="hud-charge-bar-track" style={{ display: 'block', width: '100%', height: 4, background: 'rgba(148, 163, 184, 0.16)', borderRadius: 2, overflow: 'hidden' }}>
                                  <div
                                    style={{
                                      width: `${(physicsRef.current.balls.filter(o => o.motherId === b.id && !o.isDead && !o.isDying).length >= 4)
                                        ? 100
                                        : Math.min(100, Math.max(0, ((5500 - Math.max(0, b.broodTimer || 0)) / 5500) * 100))}%`,
                                      height: '100%',
                                      backgroundColor: b.isSpawningBrood ? '#ef4444' : '#f472b6',
                                      boxShadow: '0 0 6px rgba(244, 114, 182, 0.7)',
                                      transition: 'width 0.05s linear',
                                    }}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Rapier Ball Dynamic Combat Bar */}
                            {b.type === BALL_TYPES.RAPIER && (
                              <div className="hud-shield-charge-wrapper" title="Rapier: Spins normally; marks enemy on hit, aims 0.8s, and dashes forward with 28 DMG piercing thrust">
                                <div className="hud-charge-label-row">
                                  <span className="hud-charge-txt">
                                    {b.rapierState === 'dashing'
                                      ? 'DASH THRUST'
                                      : b.rapierState === 'aiming'
                                      ? 'AIMING THRUST'
                                      : (b.rapierCooldown || 0) > 0
                                      ? 'COOLDOWN'
                                      : 'THRUST READY'}
                                  </span>
                                  <span className="hud-charge-numeric">
                                    {b.rapierState === 'dashing'
                                      ? 'STRIKING'
                                      : b.rapierState === 'aiming'
                                      ? `${(((800 - Math.max(0, b.rapierAimTimer || 0))) / 1000).toFixed(1)}s / 0.8s`
                                      : (b.rapierCooldown || 0) > 0
                                      ? `${(((b.rapierCooldown || 0)) / 1000).toFixed(1)}s`
                                      : 'READY'}
                                  </span>
                                </div>
                                <div className="hud-charge-bar-track" style={{ display: 'block', width: '100%', height: 4, background: 'rgba(148, 163, 184, 0.16)', borderRadius: 2, overflow: 'hidden' }}>
                                  <div
                                    style={{
                                      width: b.rapierState === 'dashing'
                                        ? '100%'
                                        : b.rapierState === 'aiming'
                                        ? `${Math.max(0, Math.min(100, (1 - (b.rapierAimTimer || 0) / 800) * 100))}%`
                                        : (b.rapierCooldown || 0) > 0
                                        ? `${Math.max(0, Math.min(100, (1 - (b.rapierCooldown || 0) / 2800) * 100))}%`
                                        : '100%',
                                      height: '100%',
                                      backgroundColor: b.rapierState === 'dashing' ? '#fbbf24' : (b.rapierState === 'aiming' ? '#f43f5e' : ((b.rapierCooldown || 0) > 0 ? '#64748b' : '#f43f5e')),
                                      boxShadow: b.rapierState === 'dashing' ? '0 0 8px rgba(251, 191, 36, 0.9)' : (b.rapierState === 'aiming' ? '0 0 8px rgba(244, 63, 94, 0.8)' : 'none'),
                                      transition: 'width 0.05s linear',
                                    }}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Row 4: SVG Icons of Effects (No emojis) */}
                            <div className="hud-row-effects">
                              {b.type === BALL_TYPES.MOTHER && (
                                <span
                                  className="hud-effect-badge brood-active"
                                  onMouseEnter={(e) => showTooltip(e, 'BROOD')}
                                  onMouseLeave={hideTooltip}
                                >
                                  <BroodIcon size={13} color="#f472b6" /> BROOD
                                </span>
                              )}
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
                                  className={`hud-effect-badge ${b.isBlueBurn ? 'blue-burn-active' : 'burn-active'}`}
                                  onMouseEnter={(e) => showTooltip(e, b.isBlueBurn ? 'SCORCH' : 'BURN')}
                                  onMouseLeave={hideTooltip}
                                >
                                  <BurnIcon size={13} color={b.isBlueBurn ? '#38bdf8' : '#f97316'} /> {b.isBlueBurn ? 'SCORCH' : 'BURN'}
                                </span>
                              )}
                              {b.poisonStacks > 0 && !b.isDead && (
                                <span
                                  className="hud-effect-badge poison-active"
                                  onMouseEnter={(e) => showTooltip(e, 'POISON')}
                                  onMouseLeave={hideTooltip}
                                  style={{ borderColor: 'rgba(16, 185, 129, 0.4)', color: '#34d399', background: 'rgba(16, 185, 129, 0.12)' }}
                                >
                                  <PoisonIcon size={13} color="#10b981" /> POISON ({b.poisonStacks}) - {(b.poisonDuration / 1000).toFixed(1)}s
                                </span>
                              )}
                              {b.type === BALL_TYPES.POISON && (
                                <span
                                  className="hud-effect-badge poison-active"
                                  onMouseEnter={(e) => showTooltip(e, 'POISON')}
                                  onMouseLeave={hideTooltip}
                                  style={{ borderColor: 'rgba(16, 185, 129, 0.4)', color: '#34d399', background: 'rgba(16, 185, 129, 0.12)' }}
                                >
                                  <PoisonIcon size={13} color="#10b981" /> VIRULENT POISON
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
                              {b.spitFireTargetTimer > 0 && !b.isDead && (
                                <span
                                  className="hud-effect-badge spitfire-target-active"
                                  onMouseEnter={(e) => showTooltip(e, 'FLAME_LOCK')}
                                  onMouseLeave={hideTooltip}
                                >
                                  <SpitFireTargetIcon size={13} color="#38bdf8" /> FLAME LOCK ({(b.spitFireTargetTimer / 1000).toFixed(1)}s)
                                </span>
                              )}
                                                            {b.knockbackTimer > 0 && !b.isDead && (
                                <span
                                  className="hud-effect-badge knockback-active"
                                  onMouseEnter={(e) => showTooltip(e, 'KNOCKBACK')}
                                  onMouseLeave={hideTooltip}
                                >
                                  <KnockbackIcon size={13} color="#a5b4fc" /> KNOCKBACK ({(b.knockbackTimer / 1000).toFixed(1)}s)
                                </span>
                              )}
                              {b.daggerMarkTimer > 0 && !b.isDead && (
                                <span
                                  className="hud-effect-badge dagger-mark-active"
                                  onMouseEnter={(e) => showTooltip(e, 'DAGGER_MARK')}
                                  onMouseLeave={hideTooltip}
                                >
                                  <DaggerIcon size={13} color="#14b8a6" /> DAGGER MARK ({(b.daggerMarkTimer / 1000).toFixed(1)}s)
                                </span>
                              )}
                              {b.rapierMarkTimer > 0 && !b.isDead && (
                                <span
                                  className="hud-effect-badge rapier-mark-active"
                                  onMouseEnter={(e) => showTooltip(e, 'RAPIER_MARK')}
                                  onMouseLeave={hideTooltip}
                                >
                                  <RapierIcon size={13} color="#f43f5e" /> RAPIER MARK ({(b.rapierMarkTimer / 1000).toFixed(1)}s)
                                </span>
                              )}
                              {b.isSlowed && !b.isDead && (
                                <span
                                  className="hud-effect-badge slow-active"
                                  onMouseEnter={(e) => showTooltip(e, 'SLOW')}
                                  onMouseLeave={hideTooltip}
                                >
                                  <SlowIcon size={13} color="#06b6d4" /> SLOW
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
                              {(b.type === BALL_TYPES.SWORD || b.type === BALL_TYPES.DUAL_SWORD) && (
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
                                                                                          {b.type === BALL_TYPES.SLOW && (
                                <>
                                  <span
                                    className="hud-effect-badge heavy-active"
                                    onMouseEnter={(e) => showTooltip(e, 'HEAVY')}
                                    onMouseLeave={hideTooltip}
                                  >
                                    <HeavyIcon size={13} color="#f59e0b" /> HEAVY
                                  </span>
                                  <span
                                    className="hud-effect-badge tower-active"
                                    onMouseEnter={(e) => showTooltip(e, 'TOWER')}
                                    onMouseLeave={hideTooltip}
                                  >
                                    <TowerIcon size={13} color="#94a3b8" /> TOWER
                                  </span>
                                </>
                              )}
                              {b.type === BALL_TYPES.PRIEST && (
                                <span
                                  className={`hud-effect-badge ${b.blessActiveTimer > 0 ? 'blessing-active' : ''}`}
                                  onMouseEnter={(e) => showTooltip(e, 'BLESSING')}
                                  onMouseLeave={hideTooltip}
                                >
                                  <BlessIcon size={13} color="#f59e0b" /> BLESSING
                                </span>
                              )}
                              {b.type === BALL_TYPES.PUSH && (
                                <span
                                  className={`hud-effect-badge ${b.pushActiveTimer > 0 ? 'push-active' : ''}`}
                                  onMouseEnter={(e) => showTooltip(e, 'PUSH')}
                                  onMouseLeave={hideTooltip}
                                >
                                  <PushIcon size={13} color="#818cf8" /> PUSH
                                </span>
                              )}
                              {b.type === BALL_TYPES.DAGGER && !b.isWeaponless && (
                                <span
                                  className="hud-effect-badge dagger-active"
                                  onMouseEnter={(e) => showTooltip(e, 'DAGGER')}
                                  onMouseLeave={hideTooltip}
                                >
                                  <DaggerIcon size={13} color="#2dd4bf" /> DAGGER
                                </span>
                              )}
                              {b.type === BALL_TYPES.DAGGER && b.isWeaponless && (
                                <span
                                  className="hud-effect-badge dagger-pull-active"
                                  onMouseEnter={(e) => showTooltip(e, 'DAGGER_PULL')}
                                  onMouseLeave={hideTooltip}
                                >
                                  <DaggerIcon size={13} color="#38bdf8" /> DAGGER PULL
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
                              {b.type === BALL_TYPES.RAPIER && (
                                <>
                                  <span
                                    className={`hud-effect-badge ${b.dashTimer > 0 || b.rapierState === 'dashing' ? 'dash-active' : ''}`}
                                    onMouseEnter={(e) => showTooltip(e, 'DASH')}
                                    onMouseLeave={hideTooltip}
                                  >
                                    <DashIcon size={13} color="#fbbf24" /> DASH
                                  </span>
                                  <span
                                    className="hud-effect-badge rapier-active"
                                    onMouseEnter={(e) => showTooltip(e, 'RAPIER')}
                                    onMouseLeave={hideTooltip}
                                  >
                                    <RapierIcon size={13} color="#f43f5e" /> RAPIER
                                  </span>
                                </>
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
                                    className="hud-effect-badge hard-active"
                                    onMouseEnter={(e) => showTooltip(e, 'HARD')}
                                    onMouseLeave={hideTooltip}
                                  >
                                    <HardIcon size={13} color="#94a3b8" /> HARD
                                  </span>
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
                              {b.type === BALL_TYPES.STEEL && (
                                <span
                                  className="hud-effect-badge hard-active"
                                  onMouseEnter={(e) => showTooltip(e, 'HARD')}
                                  onMouseLeave={hideTooltip}
                                >
                                  <HardIcon size={13} color="#94a3b8" /> HARD
                                </span>
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
                              {b.type === BALL_TYPES.SPIT_FIRE && (
                                <span
                                  className="hud-effect-badge spitfire-active"
                                  onMouseEnter={(e) => showTooltip(e, 'INCINERATION')}
                                  onMouseLeave={hideTooltip}
                                >
                                  <SpitFireIcon size={13} color="#38bdf8" /> INCINERATION
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
                              {b.type === BALL_TYPES.DICE && (
                                <span
                                  className="hud-effect-badge dice-active"
                                  onMouseEnter={(e) => showTooltip(e, 'DICE')}
                                  onMouseLeave={hideTooltip}
                                >
                                  <DiceIcon size={13} color="#f59e0b" /> LUCKY ROLL
                                </span>
                              )}
                              {b.stuckDaggers && b.stuckDaggers.length > 0 && (
                                <span
                                  className="hud-effect-badge dagger-hit-active"
                                  onMouseEnter={(e) => showTooltip(e, 'DAGGER_HIT')}
                                  onMouseLeave={hideTooltip}
                                >
                                  <DaggerIcon size={13} color="#2dd4bf" /> DAGGER HIT
                                </span>
                              )}
                            </div>

                            {/* In 1v1 mode, render stats below the statuses */}
                            {showStats && !isTeamMatch && (
                              <div className="hud-bottom-stats-row">
                                <span className="hud-stat-pill">DMG: <strong>{b.damage}</strong></span>
                                {getWeaponDamage(b) !== null && (
                                  <span className="hud-stat-pill">WPN: <strong>{getWeaponDamage(b)}</strong></span>
                                )}
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
                              {getWeaponDamage(b) !== null && (
                                <div className="hud-side-stat-item">
                                  <span className="hud-side-stat-lbl">WPN</span>
                                  <span className="hud-side-stat-val">{getWeaponDamage(b)}</span>
                                </div>
                              )}
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
                                  <span className="hud-charge-txt">CANNON RELOAD</span>
                                  <span className="hud-charge-numeric">
                                    {((3000 - Math.max(0, b.gunCooldown !== undefined ? b.gunCooldown : 3000)) / 1000).toFixed(1)}s / 3.0s
                                  </span>
                                </div>
                                <div className="hud-charge-bar-track" style={{ display: 'block', width: '100%', height: 4, background: 'rgba(148, 163, 184, 0.16)', borderRadius: 2, overflow: 'hidden' }}>
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
                                  <span className="hud-charge-txt">HEAL RECHARGE</span>
                                  <span className="hud-charge-numeric">
                                    {((6000 - Math.max(0, b.healTimer !== undefined ? b.healTimer : 6000)) / 1000).toFixed(1)}s / 6.0s
                                  </span>
                                </div>
                                <div className="hud-charge-bar-track" style={{ display: 'block', width: '100%', height: 4, background: 'rgba(148, 163, 184, 0.16)', borderRadius: 2, overflow: 'hidden' }}>
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

                            {/* Dice Ball Roll & Pity Status in HUD */}
                            {b.type === BALL_TYPES.DICE && (
                              <div className="hud-shield-charge-wrapper" title="Dice Pity: Taking damage 7 times absorbs pity to transform Mid/Low rolls into a High Roll (30-50 DMG)">
                                <div className="hud-charge-label-row">
                                  <span className="hud-charge-txt">
                                    {(b.dicePity || 0) >= 7 ? 'HIGH ROLL PITY READY!' : 'HIGH ROLL PITY'}
                                  </span>
                                  <span className="hud-charge-numeric">
                                    {b.dicePity || 0} / 7 HITS
                                  </span>
                                </div>
                                <div className="hud-charge-bar-track" style={{ display: 'block', width: '100%', height: 4, background: 'rgba(148, 163, 184, 0.16)', borderRadius: 2, overflow: 'hidden' }}>
                                  <div
                                    style={{
                                      width: `${Math.min(100, Math.max(0, ((b.dicePity || 0) / 7) * 100))}%`,
                                      height: '100%',
                                      backgroundColor: (b.dicePity || 0) >= 7 ? '#fbbf24' : '#f59e0b',
                                      boxShadow: (b.dicePity || 0) >= 7 ? '0 0 8px rgba(251, 191, 36, 0.8)' : '0 0 6px rgba(245, 158, 11, 0.6)',
                                      transition: 'width 0.1s ease',
                                    }}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Sniper Ball 4-Second Sniper Lock-On Bar */}
                            {b.type === BALL_TYPES.SNIPER && (
                              <div className="hud-shield-charge-wrapper" title="Sniper Lock-On: Freezes midair to aim and shoot 15 DMG bullet">
                                <div className="hud-charge-label-row">
                                  <span className="hud-charge-txt">
                                    {b.sniperState === 'aiming' ? 'TARGET LOCKED' : 'SNIPER RELOAD'}
                                  </span>
                                  <span className="hud-charge-numeric">
                                    {b.sniperState === 'aiming'
                                      ? `AIMING ${(((b.config?.aimDuration || 1000) - Math.max(0, b.sniperAimTimer || 0)) / 1000).toFixed(1)}s / ${((b.config?.aimDuration || 1000) / 1000).toFixed(1)}s`
                                      : `${((4000 - Math.max(0, b.sniperCooldown !== undefined ? b.sniperCooldown : 4000)) / 1000).toFixed(1)}s / 4.0s`}
                                  </span>
                                </div>
                                <div className="hud-charge-bar-track" style={{ display: 'block', width: '100%', height: 4, background: 'rgba(148, 163, 184, 0.16)', borderRadius: 2, overflow: 'hidden' }}>
                                  <div
                                    style={{
                                      width: b.sniperState === 'aiming'
                                        ? `${Math.min(100, Math.max(0, (((b.config?.aimDuration || 1000) - Math.max(0, b.sniperAimTimer || 0)) / (b.config?.aimDuration || 1000)) * 100))}%`
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

                                                                                    {/* Priest Ball Divine Blessing Bar */}
                            {b.type === BALL_TYPES.PRIEST && (
                              <div className="hud-shield-charge-wrapper" title="Divine Blessing: Map-wide heal across the entire canvas after 9s (inflicts Heal +5, +3, +1, +1 to self & allies)">
                                <div className="hud-charge-label-row">
                                  <span className="hud-charge-txt">DIVINE BLESSING</span>
                                  <span className="hud-charge-numeric">
                                    {(b.blessTimer || 0) <= 0
                                      ? 'READY (+5 +3 +1 +1)'
                                      : `${(((9000 - Math.max(0, b.blessTimer || 0))) / 1000).toFixed(1)}s / 9.0s`}
                                  </span>
                                </div>
                                <div className="hud-charge-bar-track" style={{ display: 'block', width: '100%', height: 4, background: 'rgba(148, 163, 184, 0.16)', borderRadius: 2, overflow: 'hidden' }}>
                                  <div
                                    style={{
                                      width: `${Math.min(100, Math.max(0, ((9000 - Math.max(0, b.blessTimer || 0)) / 9000) * 100))}%`,
                                      height: '100%',
                                      backgroundColor: (b.blessTimer || 0) <= 0 ? '#fde047' : '#f59e0b',
                                      boxShadow: '0 0 6px rgba(245, 158, 11, 0.7)',
                                      transition: 'width 0.05s linear',
                                    }}
                                  />
                                </div>
                              </div>
                            )}
                            {/* Push Ball Kinetic Repulsor Bar (Hit-to-Activate & 12s -> 2s Cooldown) */}
                            {b.type === BALL_TYPES.PUSH && (
                              <div className="hud-shield-charge-wrapper" title="Kinetic Repulsor: Needs 1 hit to activate passive. Once triggered, repels nearby enemies and enters cooldown (12s -> 10s -> 8s -> 6s -> 4s -> 2s on subsequent hits).">
                                <div className="hud-charge-label-row">
                                  <span className="hud-charge-txt">
                                    {!b.isPushActive ? 'PASSIVE: 0 / 1 HIT' : (b.hasPushCharge ? 'REPULSOR READY' : 'RECHARGING REPULSOR')}
                                  </span>
                                  <span className="hud-charge-numeric">
                                    {!b.isPushActive
                                      ? 'INACTIVE'
                                      : b.hasPushCharge
                                      ? `READY (${[12, 10, 8, 6, 4, 2][b.pushTierIndex || 0] || 12}s CD)`
                                      : `${((b.pushCooldownTimer || 0) / 1000).toFixed(1)}s / ${[12, 10, 8, 6, 4, 2][b.pushTierIndex || 0] || 12}s`}
                                  </span>
                                </div>
                                <div className="hud-charge-bar-track" style={{ display: 'block', width: '100%', height: 4, background: 'rgba(148, 163, 184, 0.16)', borderRadius: 2, overflow: 'hidden' }}>
                                  <div
                                    style={{
                                      width: !b.isPushActive
                                        ? '0%'
                                        : b.hasPushCharge
                                        ? '100%'
                                        : `${Math.max(0, Math.min(100, (1 - (b.pushCooldownTimer || 0) / (([12, 10, 8, 6, 4, 2][b.pushTierIndex || 0] || 12) * 1000)) * 100))}%`,
                                      height: '100%',
                                      backgroundColor: b.hasPushCharge ? '#818cf8' : '#6366f1',
                                      boxShadow: b.hasPushCharge ? '0 0 8px rgba(129, 140, 248, 0.8)' : 'none',
                                      transition: 'width 0.1s linear',
                                    }}
                                  />
                                </div>
                              </div>
                            )}
                            {/* Dagger Ball Dynamic Combat Bar (Inflicts Dagger Mark on enemy, self shows aim prep & recall) */}
                            {b.type === BALL_TYPES.DAGGER && (
                              <div className="hud-shield-charge-wrapper" title="Combat Dagger: Inflicts Dagger Mark on enemy; self stops moving to aim and throws dagger">
                                <div className="hud-charge-label-row">
                                  <span className="hud-charge-txt">
                                    {b.daggerState === 'aiming'
                                      ? 'AIM LOCK'
                                      : b.daggerState === 'delay'
                                      ? 'AIM PREP'
                                      : b.isWeaponless
                                      ? (physicsRef.current.flyingDaggers?.some(fd => fd.ownerId === b.id && fd.state === 'stuck_wall')
                                          ? 'WALL RECALL'
                                          : 'DAGGER RECALL')
                                      : 'COMBAT DAGGER'}
                                  </span>
                                  <span className="hud-charge-numeric">
                                    {b.daggerState === 'aiming'
                                      ? `${(((2000 - Math.max(0, b.daggerAimTimer || 0))) / 1000).toFixed(1)}s / 2.0s`
                                      : b.daggerState === 'delay'
                                      ? `${(((2000 - Math.max(0, b.daggerDelayTimer || 0))) / 1000).toFixed(1)}s / 2.0s`
                                      : b.isWeaponless
                                      ? (physicsRef.current.flyingDaggers?.some(fd => fd.ownerId === b.id && fd.state === 'stuck_wall')
                                          ? `${(((4000 - Math.max(0, (physicsRef.current.flyingDaggers.find(fd => fd.ownerId === b.id && fd.state === 'stuck_wall')?.wallTimer || 0)))) / 1000).toFixed(1)}s / 4.0s`
                                          : (physicsRef.current.balls.some(other => other.stuckDaggers?.some(d => d.ownerId === b.id))
                                              ? 'EMBEDDED'
                                              : 'CALLING'))
                                      : 'READY'}
                                  </span>
                                </div>
                                <div className="hud-charge-bar-track" style={{ display: 'block', width: '100%', height: 4, background: 'rgba(148, 163, 184, 0.16)', borderRadius: 2, overflow: 'hidden' }}>
                                  <div
                                    style={{
                                      width: b.daggerState === 'aiming'
                                        ? `${Math.max(0, Math.min(100, (1 - (b.daggerAimTimer || 0) / 2000) * 100))}%`
                                        : b.daggerState === 'delay'
                                        ? `${Math.max(0, Math.min(100, (1 - (b.daggerDelayTimer || 0) / 2000) * 100))}%`
                                        : b.isWeaponless
                                        ? (physicsRef.current.flyingDaggers?.some(fd => fd.ownerId === b.id && fd.state === 'stuck_wall')
                                            ? `${Math.max(0, Math.min(100, (1 - (physicsRef.current.flyingDaggers.find(fd => fd.ownerId === b.id && fd.state === 'stuck_wall')?.wallTimer || 0) / 4000) * 100))}%`
                                            : '35%')
                                        : '100%',
                                      height: '100%',
                                      backgroundColor: b.daggerState === 'aiming' ? '#38bdf8' : '#2dd4bf',
                                      boxShadow: '0 0 6px rgba(45, 212, 191, 0.7)',
                                      transition: 'width 0.05s linear',
                                    }}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Mother Ball Brood Birthing Bar */}
                            {b.type === BALL_TYPES.MOTHER && (
                              <div className="hud-shield-charge-wrapper" title="Brood: Every 5.5s, stops moving to birth a baby ball (costs 5 HP). Cycles Tough Baby, Sword Baby, Gun Baby, and Dual Sword Baby (max 4 active).">
                                <div className="hud-charge-label-row">
                                  <span className="hud-charge-txt">
                                    {b.isSpawningBrood ? 'BIRTHING BABY (-5 HP)...' : `NEXT: ${b.broodNextType ? b.broodNextType.replace('BABY_', '').replace('_', ' ') : 'NORMAL'}`}
                                  </span>
                                  <span className="hud-charge-numeric">
                                    {(physicsRef.current.balls.filter(o => o.motherId === b.id && !o.isDead && !o.isDying).length >= 4)
                                      ? 'MAX BROOD (4/4)'
                                      : (b.isSpawningBrood
                                        ? '-5 HP'
                                        : `${(((5500 - Math.max(0, b.broodTimer || 0))) / 1000).toFixed(1)}s / 5.5s`)}
                                  </span>
                                </div>
                                <div className="hud-charge-bar-track" style={{ display: 'block', width: '100%', height: 4, background: 'rgba(148, 163, 184, 0.16)', borderRadius: 2, overflow: 'hidden' }}>
                                  <div
                                    style={{
                                      width: `${(physicsRef.current.balls.filter(o => o.motherId === b.id && !o.isDead && !o.isDying).length >= 4)
                                        ? 100
                                        : Math.min(100, Math.max(0, ((5500 - Math.max(0, b.broodTimer || 0)) / 5500) * 100))}%`,
                                      height: '100%',
                                      backgroundColor: b.isSpawningBrood ? '#ef4444' : '#f472b6',
                                      boxShadow: '0 0 6px rgba(244, 114, 182, 0.7)',
                                      transition: 'width 0.05s linear',
                                    }}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Rapier Ball Dynamic Combat Bar */}
                            {b.type === BALL_TYPES.RAPIER && (
                              <div className="hud-shield-charge-wrapper" title="Rapier: Spins normally; marks enemy on hit, aims 0.8s, and dashes forward with 28 DMG piercing thrust">
                                <div className="hud-charge-label-row">
                                  <span className="hud-charge-txt">
                                    {b.rapierState === 'dashing'
                                      ? 'DASH THRUST'
                                      : b.rapierState === 'aiming'
                                      ? 'AIMING THRUST'
                                      : (b.rapierCooldown || 0) > 0
                                      ? 'COOLDOWN'
                                      : 'THRUST READY'}
                                  </span>
                                  <span className="hud-charge-numeric">
                                    {b.rapierState === 'dashing'
                                      ? 'STRIKING'
                                      : b.rapierState === 'aiming'
                                      ? `${(((800 - Math.max(0, b.rapierAimTimer || 0))) / 1000).toFixed(1)}s / 0.8s`
                                      : (b.rapierCooldown || 0) > 0
                                      ? `${(((b.rapierCooldown || 0)) / 1000).toFixed(1)}s`
                                      : 'READY'}
                                  </span>
                                </div>
                                <div className="hud-charge-bar-track" style={{ display: 'block', width: '100%', height: 4, background: 'rgba(148, 163, 184, 0.16)', borderRadius: 2, overflow: 'hidden' }}>
                                  <div
                                    style={{
                                      width: b.rapierState === 'dashing'
                                        ? '100%'
                                        : b.rapierState === 'aiming'
                                        ? `${Math.max(0, Math.min(100, (1 - (b.rapierAimTimer || 0) / 800) * 100))}%`
                                        : (b.rapierCooldown || 0) > 0
                                        ? `${Math.max(0, Math.min(100, (1 - (b.rapierCooldown || 0) / 2800) * 100))}%`
                                        : '100%',
                                      height: '100%',
                                      backgroundColor: b.rapierState === 'dashing' ? '#fbbf24' : (b.rapierState === 'aiming' ? '#f43f5e' : ((b.rapierCooldown || 0) > 0 ? '#64748b' : '#f43f5e')),
                                      boxShadow: b.rapierState === 'dashing' ? '0 0 8px rgba(251, 191, 36, 0.9)' : (b.rapierState === 'aiming' ? '0 0 8px rgba(244, 63, 94, 0.8)' : 'none'),
                                      transition: 'width 0.05s linear',
                                    }}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Row 4: SVG Icons of Effects (No emojis) */}
                            <div className="hud-row-effects">
                              {b.type === BALL_TYPES.MOTHER && (
                                <span
                                  className="hud-effect-badge brood-active"
                                  onMouseEnter={(e) => showTooltip(e, 'BROOD')}
                                  onMouseLeave={hideTooltip}
                                >
                                  <BroodIcon size={13} color="#f472b6" /> BROOD
                                </span>
                              )}
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
                                  className={`hud-effect-badge ${b.isBlueBurn ? 'blue-burn-active' : 'burn-active'}`}
                                  onMouseEnter={(e) => showTooltip(e, b.isBlueBurn ? 'SCORCH' : 'BURN')}
                                  onMouseLeave={hideTooltip}
                                >
                                  <BurnIcon size={13} color={b.isBlueBurn ? '#38bdf8' : '#f97316'} /> {b.isBlueBurn ? 'SCORCH' : 'BURN'}
                                </span>
                              )}
                              {b.poisonStacks > 0 && !b.isDead && (
                                <span
                                  className="hud-effect-badge poison-active"
                                  onMouseEnter={(e) => showTooltip(e, 'POISON')}
                                  onMouseLeave={hideTooltip}
                                  style={{ borderColor: 'rgba(16, 185, 129, 0.4)', color: '#34d399', background: 'rgba(16, 185, 129, 0.12)' }}
                                >
                                  <PoisonIcon size={13} color="#10b981" /> POISON ({b.poisonStacks}) - {(b.poisonDuration / 1000).toFixed(1)}s
                                </span>
                              )}
                              {b.type === BALL_TYPES.POISON && (
                                <span
                                  className="hud-effect-badge poison-active"
                                  onMouseEnter={(e) => showTooltip(e, 'POISON')}
                                  onMouseLeave={hideTooltip}
                                  style={{ borderColor: 'rgba(16, 185, 129, 0.4)', color: '#34d399', background: 'rgba(16, 185, 129, 0.12)' }}
                                >
                                  <PoisonIcon size={13} color="#10b981" /> VIRULENT POISON
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
                              {b.spitFireTargetTimer > 0 && !b.isDead && (
                                <span
                                  className="hud-effect-badge spitfire-target-active"
                                  onMouseEnter={(e) => showTooltip(e, 'FLAME_LOCK')}
                                  onMouseLeave={hideTooltip}
                                >
                                  <SpitFireTargetIcon size={13} color="#38bdf8" /> FLAME LOCK ({(b.spitFireTargetTimer / 1000).toFixed(1)}s)
                                </span>
                              )}
                                                            {b.knockbackTimer > 0 && !b.isDead && (
                                <span
                                  className="hud-effect-badge knockback-active"
                                  onMouseEnter={(e) => showTooltip(e, 'KNOCKBACK')}
                                  onMouseLeave={hideTooltip}
                                >
                                  <KnockbackIcon size={13} color="#a5b4fc" /> KNOCKBACK ({(b.knockbackTimer / 1000).toFixed(1)}s)
                                </span>
                              )}
                              {b.daggerMarkTimer > 0 && !b.isDead && (
                                <span
                                  className="hud-effect-badge dagger-mark-active"
                                  onMouseEnter={(e) => showTooltip(e, 'DAGGER_MARK')}
                                  onMouseLeave={hideTooltip}
                                >
                                  <DaggerIcon size={13} color="#14b8a6" /> DAGGER MARK ({(b.daggerMarkTimer / 1000).toFixed(1)}s)
                                </span>
                              )}
                              {b.rapierMarkTimer > 0 && !b.isDead && (
                                <span
                                  className="hud-effect-badge rapier-mark-active"
                                  onMouseEnter={(e) => showTooltip(e, 'RAPIER_MARK')}
                                  onMouseLeave={hideTooltip}
                                >
                                  <RapierIcon size={13} color="#f43f5e" /> RAPIER MARK ({(b.rapierMarkTimer / 1000).toFixed(1)}s)
                                </span>
                              )}
                              {b.isSlowed && !b.isDead && (
                                <span
                                  className="hud-effect-badge slow-active"
                                  onMouseEnter={(e) => showTooltip(e, 'SLOW')}
                                  onMouseLeave={hideTooltip}
                                >
                                  <SlowIcon size={13} color="#06b6d4" /> SLOW
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
                              {(b.type === BALL_TYPES.SWORD || b.type === BALL_TYPES.DUAL_SWORD) && (
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
                                                                                          {b.type === BALL_TYPES.SLOW && (
                                <>
                                  <span
                                    className="hud-effect-badge heavy-active"
                                    onMouseEnter={(e) => showTooltip(e, 'HEAVY')}
                                    onMouseLeave={hideTooltip}
                                  >
                                    <HeavyIcon size={13} color="#f59e0b" /> HEAVY
                                  </span>
                                  <span
                                    className="hud-effect-badge tower-active"
                                    onMouseEnter={(e) => showTooltip(e, 'TOWER')}
                                    onMouseLeave={hideTooltip}
                                  >
                                    <TowerIcon size={13} color="#94a3b8" /> TOWER
                                  </span>
                                </>
                              )}
                              {b.type === BALL_TYPES.PRIEST && (
                                <span
                                  className={`hud-effect-badge ${b.blessActiveTimer > 0 ? 'blessing-active' : ''}`}
                                  onMouseEnter={(e) => showTooltip(e, 'BLESSING')}
                                  onMouseLeave={hideTooltip}
                                >
                                  <BlessIcon size={13} color="#f59e0b" /> BLESSING
                                </span>
                              )}
                              {b.type === BALL_TYPES.PUSH && (
                                <span
                                  className={`hud-effect-badge ${b.pushActiveTimer > 0 ? 'push-active' : ''}`}
                                  onMouseEnter={(e) => showTooltip(e, 'PUSH')}
                                  onMouseLeave={hideTooltip}
                                >
                                  <PushIcon size={13} color="#818cf8" /> PUSH
                                </span>
                              )}
                              {b.type === BALL_TYPES.DAGGER && !b.isWeaponless && (
                                <span
                                  className="hud-effect-badge dagger-active"
                                  onMouseEnter={(e) => showTooltip(e, 'DAGGER')}
                                  onMouseLeave={hideTooltip}
                                >
                                  <DaggerIcon size={13} color="#2dd4bf" /> DAGGER
                                </span>
                              )}
                              {b.type === BALL_TYPES.DAGGER && b.isWeaponless && (
                                <span
                                  className="hud-effect-badge dagger-pull-active"
                                  onMouseEnter={(e) => showTooltip(e, 'DAGGER_PULL')}
                                  onMouseLeave={hideTooltip}
                                >
                                  <DaggerIcon size={13} color="#38bdf8" /> DAGGER PULL
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
                              {b.type === BALL_TYPES.RAPIER && (
                                <>
                                  <span
                                    className={`hud-effect-badge ${b.dashTimer > 0 || b.rapierState === 'dashing' ? 'dash-active' : ''}`}
                                    onMouseEnter={(e) => showTooltip(e, 'DASH')}
                                    onMouseLeave={hideTooltip}
                                  >
                                    <DashIcon size={13} color="#fbbf24" /> DASH
                                  </span>
                                  <span
                                    className="hud-effect-badge rapier-active"
                                    onMouseEnter={(e) => showTooltip(e, 'RAPIER')}
                                    onMouseLeave={hideTooltip}
                                  >
                                    <RapierIcon size={13} color="#f43f5e" /> RAPIER
                                  </span>
                                </>
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
                                    className="hud-effect-badge hard-active"
                                    onMouseEnter={(e) => showTooltip(e, 'HARD')}
                                    onMouseLeave={hideTooltip}
                                  >
                                    <HardIcon size={13} color="#94a3b8" /> HARD
                                  </span>
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
                              {b.type === BALL_TYPES.STEEL && (
                                <span
                                  className="hud-effect-badge hard-active"
                                  onMouseEnter={(e) => showTooltip(e, 'HARD')}
                                  onMouseLeave={hideTooltip}
                                >
                                  <HardIcon size={13} color="#94a3b8" /> HARD
                                </span>
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
                              {b.type === BALL_TYPES.SPIT_FIRE && (
                                <span
                                  className="hud-effect-badge spitfire-active"
                                  onMouseEnter={(e) => showTooltip(e, 'INCINERATION')}
                                  onMouseLeave={hideTooltip}
                                >
                                  <SpitFireIcon size={13} color="#38bdf8" /> INCINERATION
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
                              {b.type === BALL_TYPES.DICE && (
                                <span
                                  className="hud-effect-badge dice-active"
                                  onMouseEnter={(e) => showTooltip(e, 'DICE')}
                                  onMouseLeave={hideTooltip}
                                >
                                  <DiceIcon size={13} color="#f59e0b" /> LUCKY ROLL
                                </span>
                              )}
                              {b.stuckDaggers && b.stuckDaggers.length > 0 && (
                                <span
                                  className="hud-effect-badge dagger-hit-active"
                                  onMouseEnter={(e) => showTooltip(e, 'DAGGER_HIT')}
                                  onMouseLeave={hideTooltip}
                                >
                                  <DaggerIcon size={13} color="#2dd4bf" /> DAGGER HIT
                                </span>
                              )}
                            </div>

                            {/* In 1v1 mode, render stats below the statuses */}
                            {showStats && !isTeamMatch && (
                              <div className="hud-bottom-stats-row">
                                <span className="hud-stat-pill">DMG: <strong>{b.damage}</strong></span>
                                {getWeaponDamage(b) !== null && (
                                  <span className="hud-stat-pill">WPN: <strong>{getWeaponDamage(b)}</strong></span>
                                )}
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
                              {getWeaponDamage(b) !== null && (
                                <div className="hud-side-stat-item">
                                  <span className="hud-side-stat-lbl">WPN</span>
                                  <span className="hud-side-stat-val">{getWeaponDamage(b)}</span>
                                </div>
                              )}
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
