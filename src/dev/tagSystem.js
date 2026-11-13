// Reusable Tag System for Ball Battles (/dev)
// Drives Effect Tags, Weapon Tags, and Inflict Tags dynamically on any ball.

export const STAT_GLOSSARY = [
  { code: 'SPD', name: 'Speed', desc: 'Movement velocity of the ball.' },
  { code: 'HP', name: 'Health Points', desc: 'Maximum and current health pool.' },
  { code: 'HL', name: 'Heal (Self)', desc: 'Restores Health Points to this ball.' },
  { code: 'HA', name: 'Heal (Ally)', desc: 'Restores Health Points to allied balls.' },
  { code: 'DMG', name: 'Damage', desc: 'Base damage dealt on collision or weapon hit.' },
  { code: 'DEF', name: 'Defense', desc: 'Percentage deduction applied to upcoming incoming damage.' },
  { code: 'ARM', name: 'Armor', desc: 'Protective barrier above HP that absorbs incoming damage first.' },
  { code: 'TEMP', name: 'Temporary', desc: 'Temporary buff that disappears after hitting an enemy.' },
  { code: 'WB', name: 'Wall-Bounce', desc: 'Condition triggered whenever the ball bounces off an arena wall.' },
  { code: 'CRD', name: 'Critical Damage %', desc: 'Bonus damage percentage on critical hits (Default: 20% of current DMG).' },
  { code: 'CRC', name: 'Critical Chance %', desc: 'Probability of landing a critical hit (Default: 0%).' },
  { code: 'WPN', name: 'Weapon Damage', desc: 'Damage dealt by the ball\'s equipped weapon or projectiles.' },
  { code: 'SZ', name: 'Size', desc: 'Radius of the ball in pixels (Default: 38).' },
  { code: 'MASS', name: 'Mass', desc: 'Physical weight affecting collision knockback and momentum.' },
];

export const EFFECT_TAGS = {
  STATIC: {
    id: 'STATIC',
    name: 'Static',
    category: 'Mobility / Speed',
    summary: '0 SPD (Stationary)',
    color: '#52525b',
    spdPct: -1.0,
    zeroSpeed: true,
  },
  SLUGGISH: {
    id: 'SLUGGISH',
    name: 'Sluggish',
    category: 'Mobility / Speed',
    summary: '-65% SPD',
    color: '#64748b',
    spdPct: -0.65,
  },
  SLOW: {
    id: 'SLOW',
    name: 'Slow',
    category: 'Mobility / Speed',
    summary: '-35% SPD',
    color: '#71717a',
    spdPct: -0.35,
  },
  LIGHTWEIGHT: {
    id: 'LIGHTWEIGHT',
    name: 'Lightweight',
    category: 'Defense / Survival',
    summary: '-35% Weapon DMG received, +10% SPD',
    color: '#0284c7',
    spdPct: 0.10,
    weaponDmgResist: 0.35,
  },
  FAST: {
    id: 'FAST',
    name: 'Fast',
    category: 'Mobility / Speed',
    summary: '+35% SPD',
    color: '#6d6896',
    spdPct: 0.35,
  },
  SWIFT: {
    id: 'SWIFT',
    name: 'Swift',
    category: 'Mobility / Speed',
    summary: '+95% SPD',
    color: '#7c5cdb',
    spdPct: 0.95,
  },
  TURBO: {
    id: 'TURBO',
    name: 'Turbo',
    category: 'Mobility / Speed',
    summary: '+250% SPD',
    color: '#7c3aed',
    spdPct: 2.50,
  },
  HYPER: {
    id: 'HYPER',
    name: 'Hyper',
    category: 'Mobility / Speed',
    summary: '+600% SPD',
    color: '#9333ea',
    spdPct: 6.00,
  },
  WARP: {
    id: 'WARP',
    name: 'Warp',
    category: 'Mobility / Speed',
    summary: '+1500% SPD',
    color: '#a855f7',
    spdPct: 15.00,
  },
  HEAVY: {
    id: 'HEAVY',
    name: 'Heavy',
    category: 'Defense / Survival',
    summary: '+30% HP, -50% SPD',
    color: '#d97706',
    hpPct: 0.30,
    spdPct: -0.50,
  },
  MOMENTUM: {
    id: 'MOMENTUM',
    name: 'Momentum',
    category: 'Combat / Offense',
    summary: 'TEMP +10% DMG & +5% SPD per WB',
    color: '#9333ea',
  },
  FURY: {
    id: 'FURY',
    name: 'Fury',
    category: 'Combat / Offense',
    summary: 'Longer fight = more DMG (+2% DMG/s)',
    color: '#dc2626',
  },
  DEFIANCE: {
    id: 'DEFIANCE',
    name: 'Defiance',
    category: 'Defense / Survival',
    summary: '+25% HL if HP < 8% (Once)',
    color: '#059669',
  },
  COMBO: {
    id: 'COMBO',
    name: 'Combo',
    category: 'Combat / Offense',
    summary: '+2 DMG per hit',
    color: '#ea580c',
  },
  FORTRESS: {
    id: 'FORTRESS',
    name: 'Fortress',
    category: 'Defense / Survival',
    summary: '-70% SPD, +10% HP, Knockback Immune',
    color: '#475569',
    spdPct: -0.70,
    hpPct: 0.10,
    knockbackImmune: true,
  },
  TOUGH: {
    id: 'TOUGH',
    name: 'Tough',
    category: 'Defense / Survival',
    summary: '+30% DEF, +5 HP',
    color: '#0284c7',
    defPct: 0.30,
    hpFlat: 5,
  },
  ARMORED: {
    id: 'ARMORED',
    name: 'Armored',
    category: 'Defense / Survival',
    summary: '+20% Initial ARM',
    color: '#64748b',
    armPct: 0.20,
  },
  STURDY: {
    id: 'STURDY',
    name: 'Sturdy',
    category: 'Defense / Survival',
    summary: '-30% SPD, Knockbacks reduced by 60%',
    color: '#78716c',
    spdPct: -0.30,
    knockbackResist: 0.60,
  },
  HARD: {
    id: 'HARD',
    name: 'Hard',
    category: 'Defense / Survival',
    summary: '+45% DEF',
    color: '#475569',
    defPct: 0.45,
  },
  SOFT: {
    id: 'SOFT',
    name: 'Soft',
    category: 'Defense / Survival',
    summary: '-20% DEF, +5 SPD, +2% DMG',
    color: '#db2777',
    defPct: -0.20,
    spdFlat: 5,
    dmgPct: 0.02,
  },
  TINY: {
    id: 'TINY',
    name: 'Tiny',
    category: 'Size',
    summary: '-75% Size',
    color: '#71717a',
    sizePct: -0.75,
  },
  BABY: {
    id: 'BABY',
    name: 'Baby',
    category: 'Size',
    summary: '-55% Size',
    color: '#71717a',
    sizePct: -0.55,
  },
  SMALL: {
    id: 'SMALL',
    name: 'Small',
    category: 'Size',
    summary: '-30% Size',
    color: '#71717a',
    sizePct: -0.30,
  },
  NORMAL: {
    id: 'NORMAL',
    name: 'Normal',
    category: 'Size',
    summary: 'Default Size',
    color: '#71717a',
    sizePct: 0,
  },
  BIG: {
    id: 'BIG',
    name: 'Big',
    category: 'Size',
    summary: '+35% Size',
    color: '#71717a',
    sizePct: 0.35,
  },
  HUGE: {
    id: 'HUGE',
    name: 'Huge',
    category: 'Size',
    summary: '+75% Size',
    color: '#71717a',
    sizePct: 0.75,
  },
  TITAN: {
    id: 'TITAN',
    name: 'Titan',
    category: 'Size',
    summary: '+120% Size',
    color: '#71717a',
    sizePct: 1.20,
  },
  RELENTLESS: {
    id: 'RELENTLESS',
    name: 'Relentless',
    category: 'Defense / Survival',
    summary: 'HP < 45%: HL +1 per 0.8s',
    color: '#0d9488',
  },
  PERSISTENT: {
    id: 'PERSISTENT',
    name: 'Persistent',
    summary: 'Taking DMG: +2% DMG (max +30%)',
    category: 'Combat / Offense',
    color: '#ca8a04',
  },
  BLOODLUST: {
    id: 'BLOODLUST',
    name: 'Bloodlust',
    category: 'Combat / Offense',
    summary: 'Drains enemy HP & heals (Upon Hit, 3s)',
    color: '#dc2626',
  },
  IMMORTALITY: {
    id: 'IMMORTALITY',
    name: 'Immortality',
    category: 'Defense / Survival',
    summary: '10s Immortality on death, 1 HP (Once)',
    color: '#ca8a04',
  },
  OVERDRIVE: {
    id: 'OVERDRIVE',
    name: 'Overdrive',
    category: 'Combat / Offense',
    summary: '3 hits = TEMP +100% SPD, +5% DMG',
    color: '#0891b2',
  },
  SLIPSTREAM: {
    id: 'SLIPSTREAM',
    name: 'Slipstream',
    category: 'Combat / Offense',
    summary: 'Ally bounce: +20% SPD per hit',
    color: '#06b6d4',
  },
  BRITTLE: {
    id: 'BRITTLE',
    name: 'Brittle',
    category: 'Defense / Survival',
    summary: 'Drops a shard part on the ground when hit',
    color: '#06b6d4',
  },
};

export const WEAPON_TAGS = {
  SWORD: {
    id: 'SWORD',
    name: 'Sword',
    category: 'Melee',
    summary: 'Equips rotating Sword (16 DMG, 82px reach)',
    color: '#dc2626',
    bladeDamage: 16,
    bladeLength: 82,
  },
};

// No inflicts yet — kept structured for future Inflict Tags
export const INFLICT_TAGS = {};

export const EFFECT_TAG_LIST = Object.values(EFFECT_TAGS).sort((a, b) => {
  const catCmp = a.category.localeCompare(b.category);
  if (catCmp !== 0) return catCmp;
  if (a.category === 'Size') return (a.sizePct ?? 0) - (b.sizePct ?? 0);
  if (a.category === 'Mobility / Speed') return (a.spdPct ?? 0) - (b.spdPct ?? 0);
  return a.name.localeCompare(b.name);
});
export const WEAPON_TAG_LIST = Object.values(WEAPON_TAGS).sort((a, b) =>
  a.category.localeCompare(b.category) || a.name.localeCompare(b.name)
);
export const INFLICT_TAG_LIST = Object.values(INFLICT_TAGS);

/**
 * Recomputes a ball's derived stats from its base config + effectTags + weaponTags.
 * @param {object} ball
 * @param {object} options
 * @param {boolean} [options.resetResources] - Reset HP/shield to full (used on battle start)
 * @param {boolean} [options.grantNewArmor] - Grant ARMORED initial shield if newly added live
 */
export function recomputeBallTagStats(ball, { resetResources = false, grantNewArmor = false } = {}) {
  const cfg = ball.config || {};
  const baseHp = cfg.baseHp ?? 100;
  const baseDamage = cfg.damage ?? 10;
  const baseSpeed = cfg.speed ?? 2.2;
  const baseRadius = cfg.radius ?? 38;
  const baseMass = cfg.mass ?? 1.0;

  const tags = Array.isArray(ball.effectTags) ? ball.effectTags : [];
  const weapons = Array.isArray(ball.weaponTags) ? ball.weaponTags : [];

  let hpPct = 0;
  let hpFlat = 0;
  let spdPct = 0;
  let spdFlat = 0;
  let dmgPct = 0;
  let defPct = 0;
  let armPct = 0;
  let sizePct = 0;
  let weaponDmgResist = 0;
  let knockbackResist = 0;
  let knockbackImmune = false;
  let zeroSpeed = false;

  for (const tagId of tags) {
    const def = EFFECT_TAGS[tagId];
    if (!def) continue;
    if (def.hpPct) hpPct += def.hpPct;
    if (def.hpFlat) hpFlat += def.hpFlat;
    if (def.spdPct) spdPct += def.spdPct;
    if (def.spdFlat) spdFlat += def.spdFlat;
    if (def.dmgPct) dmgPct += def.dmgPct;
    if (def.defPct) defPct += def.defPct;
    if (def.armPct) armPct += def.armPct;
    if (def.sizePct) sizePct += def.sizePct;
    if (def.weaponDmgResist) weaponDmgResist = Math.max(weaponDmgResist, def.weaponDmgResist);
    if (def.knockbackImmune) knockbackImmune = true;
    if (def.knockbackResist) knockbackResist = Math.max(knockbackResist, def.knockbackResist);
    if (def.zeroSpeed) zeroSpeed = true;
  }

  // Dynamic combat stacks
  const momentumStacks = ball.momentumStacks || 0; // +10% DMG & +5% SPD per WB (TEMP)
  const furyBonusPct = ball.furyBonusPct || 0; // +2% DMG per sec
  const comboStacks = ball.comboStacks || 0; // +2 DMG per hit
  const persistentPct = ball.persistentPct || 0; // +2% DMG per hit taken (max 30%)
  const overdriveActive = !!ball.overdriveActive; // TEMP +100% SPD, +5% DMG
  const slipstreamStacks = ball.slipstreamStacks || 0; // +20% SPD per ally bounce

  const totalSpdPct = spdPct + (overdriveActive ? 1.0 : 0) + slipstreamStacks * 0.20 + momentumStacks * 0.05;
  const totalDmgPct = dmgPct + momentumStacks * 0.10 + furyBonusPct + persistentPct + (overdriveActive ? 0.05 : 0);

  const prevMaxHp = ball.maxHp || baseHp;
  const newMaxHp = Math.max(1, Math.round(baseHp * Math.max(0.1, 1 + hpPct) + hpFlat));
  const newRadius = Math.max(6, Math.round(baseRadius * Math.max(0.1, 1 + sizePct)));
  const newMass = Math.max(0.15, +(baseMass * (newRadius / baseRadius)).toFixed(2));
  const newSpeed = zeroSpeed
    ? 0
    : Math.max(0.3, +(baseSpeed * Math.max(0.15, 1 + totalSpdPct) + spdFlat).toFixed(2));
  const newDamage = Math.max(1, Math.round(baseDamage * Math.max(0.1, 1 + totalDmgPct) + comboStacks * 2));

  ball.maxHp = newMaxHp;
  if (resetResources) {
    ball.hp = newMaxHp;
    ball.displayHp = newMaxHp;
  } else if (ball.hp !== undefined) {
    // Adjust current HP by maxHp delta while keeping alive balls >= 1 HP
    const delta = newMaxHp - prevMaxHp;
    if (delta !== 0) {
      ball.hp = Math.max(1, Math.min(newMaxHp, Math.round(ball.hp + delta)));
      ball.displayHp = ball.hp;
    } else {
      ball.hp = Math.min(newMaxHp, ball.hp);
    }
  }

  const initialArmor = armPct > 0 ? Math.round(newMaxHp * armPct) : 0;
  if (resetResources) {
    ball.shield = initialArmor;
  } else if (grantNewArmor && initialArmor > 0) {
    ball.shield = (ball.shield || 0) + initialArmor;
  }

  ball.radius = newRadius;
  ball.mass = newMass;
  ball.speed = newSpeed;
  ball.damage = newDamage;
  ball.defPct = defPct;
  ball.weaponDmgResist = weaponDmgResist;
  ball.crc = ball.crc ?? 0; // Default 0%
  ball.crd = ball.crd ?? 0.20; // Default 20% of current DMG
  ball.knockbackResist = knockbackImmune ? 1.0 : knockbackResist;
  ball.hasSword = weapons.includes('SWORD');

  // Apply explicit per-stat overrides from Configure Stats panel
  const ov = ball.statOverrides;
  if (ov) {
    if (typeof ov.maxHp === 'number') {
      const ovMaxHp = Math.max(1, Math.round(ov.maxHp));
      const hpDiff = ovMaxHp - ball.maxHp;
      ball.maxHp = ovMaxHp;
      if (resetResources) {
        ball.hp = ovMaxHp;
        ball.displayHp = ovMaxHp;
      } else if (ball.hp !== undefined) {
        ball.hp = Math.max(1, Math.min(ovMaxHp, Math.round(ball.hp + hpDiff)));
        ball.displayHp = ball.hp;
      }
    }
    if (typeof ov.shield === 'number' && resetResources) {
      ball.shield = Math.max(0, Math.round(ov.shield));
    }
    if (typeof ov.damage === 'number') ball.damage = Math.max(1, Math.round(ov.damage));
    if (typeof ov.speed === 'number') ball.speed = Math.max(0, +Number(ov.speed).toFixed(2));
    if (typeof ov.defPct === 'number') ball.defPct = Math.max(0, Math.min(0.95, ov.defPct));
    if (typeof ov.radius === 'number') {
      ball.radius = Math.max(6, Math.min(120, Math.round(ov.radius)));
      ball.mass = Math.max(0.15, +(baseMass * (ball.radius / baseRadius)).toFixed(2));
    }
    if (typeof ov.crc === 'number') ball.crc = Math.max(0, Math.min(1, ov.crc));
    if (typeof ov.crd === 'number') ball.crd = Math.max(0, ov.crd);
  }

  const effectiveSpeed = ball.speed;

  // Re-normalize velocity magnitude if moving (or zero out when Static / 0 SPD)
  if (typeof ball.vx === 'number' && typeof ball.vy === 'number') {
    if (effectiveSpeed === 0) {
      ball.vx = 0;
      ball.vy = 0;
    } else {
      const curMag = Math.hypot(ball.vx, ball.vy);
      if (curMag > 0.001) {
        ball.vx = (ball.vx / curMag) * effectiveSpeed;
        ball.vy = (ball.vy / curMag) * effectiveSpeed;
      } else if (typeof ball.angle === 'number') {
        ball.vx = Math.cos(ball.angle) * effectiveSpeed;
        ball.vy = Math.sin(ball.angle) * effectiveSpeed;
      }
    }
  }

  return ball;
}
