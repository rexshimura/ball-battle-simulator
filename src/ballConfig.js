// Ball Battle Configurations

export const BALL_TYPES = {
  // Common
  NORMAL: 'NORMAL',
  FAST: 'FAST',
  BIG: 'BIG',
  SMALL: 'SMALL',
  SLOW: 'SLOW',

  // Uncommon
  STONE: 'STONE',
  HEAL: 'HEAL',
  KNIFE: 'KNIFE',
  SWORD: 'SWORD',
  SPIKE: 'SPIKE',

  // Rare
  STEEL: 'STEEL',
  GLASS: 'GLASS',
  HAMMER: 'HAMMER',
  GROW: 'GROW',
  DUAL_SWORD: 'DUAL_SWORD',
  PRIEST: 'PRIEST',

  // Unique
  GUN: 'GUN',
  MULTI: 'MULTI',
  DAGGER: 'DAGGER',
  PUSH: 'PUSH',
  RAPIER: 'RAPIER',

  // Epic
  ACCELERATOR: 'ACCELERATOR',
  SHARD: 'SHARD',
  SNIPER: 'SNIPER',

  // Legendary
  THORN: 'THORN',
  FIRE: 'FIRE',
  DICE: 'DICE',

  // Mythical
  SPIT_FIRE: 'SPIT_FIRE',
  MOTHER: 'MOTHER',

  // Baby Brood Summons
  BABY_NORMAL: 'BABY_NORMAL',
  BABY_SWORD: 'BABY_SWORD',
  BABY_GUN: 'BABY_GUN',
};

export const RARITIES = {
  COMMON: 'Common',
  UNCOMMON: 'Uncommon',
  RARE: 'Rare',
  UNIQUE: 'Unique',
  EPIC: 'Epic',
  LEGENDARY: 'Legendary',
  MYTHICAL: 'Mythical',
};

export const RARITY_ORDER = [
  RARITIES.COMMON,
  RARITIES.UNCOMMON,
  RARITIES.RARE,
  RARITIES.UNIQUE,
  RARITIES.EPIC,
  RARITIES.LEGENDARY,
  RARITIES.MYTHICAL,
];

// All balls have a base HP of 100
// Radii made bigger for better visibility & presence in the arena
export const BALL_CONFIGS = {
  // ==========================================
  // COMMON TIER
  // ==========================================
  [BALL_TYPES.NORMAL]: {
    id: BALL_TYPES.NORMAL,
    name: 'Normal Ball',
    rarity: RARITIES.COMMON,
    description: 'Standard baseline unit.',
    baseHp: 100,
    damage: 10,
    speed: 2.2,
    radius: 38, // increased size
    mass: 1.0,
    bodyColor: '#71717a',      // mid gray
    highlightColor: '#d4d4d8', // light highlight
    shadowColor: '#27272a',    // dark shadow
    special: null,
  },
  [BALL_TYPES.FAST]: {
    id: BALL_TYPES.FAST,
    name: 'Fast Ball',
    rarity: RARITIES.COMMON,
    description: 'Lighter and faster with swift kinetic strikes.',
    baseHp: 100,
    damage: 11,
    speed: 3.8,
    radius: 34, // increased size
    mass: 0.75,
    bodyColor: '#38bdf8',      // light blue / sky
    highlightColor: '#e0f2fe',
    shadowColor: '#0284c7',
    special: null,
  },
  [BALL_TYPES.BIG]: {
    id: BALL_TYPES.BIG,
    name: 'Big Ball',
    rarity: RARITIES.COMMON,
    description: 'A light gray version of Normal Ball, but larger in size with higher collision impact.',
    baseHp: 100,
    damage: 12,
    speed: 1.9,
    radius: 48, // a bit bigger than Normal Ball (38)
    mass: 1.5,
    bodyColor: '#a1a1aa',      // light gray
    highlightColor: '#f4f4f5',
    shadowColor: '#52525b',
    special: null,
  },

    [BALL_TYPES.SMALL]: {
    id: BALL_TYPES.SMALL,
    name: 'Small Ball',
    rarity: RARITIES.COMMON,
    description: 'Smaller and nimbler than a Normal Ball with a darker blue chassis.',
    baseHp: 90,
    damage: 9,
    speed: 3.1,
    radius: 25,
    mass: 0.7,
    bodyColor: '#1e40af',      // darker royal blue than normal ball
    highlightColor: '#60a5fa',
    shadowColor: '#172554',
    special: null,
  },
  [BALL_TYPES.SLOW]: {
    id: BALL_TYPES.SLOW,
    name: 'Slow Ball',
    rarity: RARITIES.COMMON,
    description: 'Anchored fortress chassis with 1.1 speed, innate Heavy Effect, and Tower Effect (complete immunity to pushes and knockbacks).',
    baseHp: 110,
    damage: 12,
    speed: 1.1,
    radius: 37,
    mass: 2.6,
    hasHeavy: true,
    bodyColor: '#475569',      // heavy slate gunmetal
    highlightColor: '#94a3b8',
    shadowColor: '#0f172a',
    hasTower: true,
    special: 'Heavy & Tower (Push Immune)',
  },

  // ==========================================
  // UNCOMMON TIER
  // ==========================================
  [BALL_TYPES.STONE]: {
    id: BALL_TYPES.STONE,
    name: 'Stone Ball',
    rarity: RARITIES.UNCOMMON,
    description: 'Heavy knockback-resistant chassis with +30% bonus HP (130 HP), armored shell immune to bleed, and Hard composition (takes 2x damage from Hammer Ball).',
    baseHp: 130,
    damage: 8,
    speed: 1.3,
    radius: 46, // significantly bigger rocky tank
    mass: 2.6,
    bodyColor: '#52525b',      // rough stone gray
    highlightColor: '#a1a1aa',
    shadowColor: '#18181b',
    hasTexture: true,
    hasArmor: true, // Immune to bleed effects
    hasHard: true,
    special: 'Hard, Heavy (+30% HP) & Armored',
  },
  [BALL_TYPES.HEAL]: {
    id: BALL_TYPES.HEAL,
    name: 'Heal Ball',
    rarity: RARITIES.UNCOMMON,
    description: 'Acts like a normal ball in combat, but regenerates +5 HP to itself every 6 seconds.',
    baseHp: 100,
    damage: 10,
    speed: 2.2,
    radius: 38,
    mass: 1.0,
    bodyColor: '#10b981',      // Emerald / Jade healing green
    highlightColor: '#a7f3d0', // Mint glow highlight
    shadowColor: '#064e3b',    // Deep forest jade shadow
    special: 'Self-Heal (6s Cooldown)',
    healAmount: 5,
    healInterval: 6000,
  },
  [BALL_TYPES.KNIFE]: {
    id: BALL_TYPES.KNIFE,
    name: 'Knife Ball',
    rarity: RARITIES.UNCOMMON,
    description: 'A nimble, compact combat unit equipped with a rapid spinning knife that slashes enemies and inflicts Bleed (-2, -1).',
    baseHp: 100,
    damage: 7,         // Body hitbox deals lower bump damage
    knifeDamage: 15,   // Rapid spinning knife blade deals 15 damage + Bleed
    speed: 2.3,
    radius: 32,        // made smaller (from 37 down to 32)
    mass: 0.95,        // slightly lighter for compact body
    bodyColor: '#4b5563',      // gray body
    highlightColor: '#9ca3af', // lighter gray highlight
    shadowColor: '#1f2937',    // deep dark gray shadow
    knifeColor: '#cbd5e1',     // steel blade
    special: 'Rapid Knife & Bleed',
    inflicts: 'Bleed (-2 -1)',
    knifeLength: 26,           // compact combat knife blade scaled to smaller body
  },
  [BALL_TYPES.SWORD]: {
    id: BALL_TYPES.SWORD,
    name: 'Sword Ball',
    rarity: RARITIES.UNCOMMON,
    description: 'Equipped with rotating blade. Heavy blade slash, lower body bump damage.',
    baseHp: 100,
    damage: 6,         // Body hitbox deals lower damage (6 DMG)
    bladeDamage: 22,   // Sword blade hitbox deals much higher damage (22 DMG)
    speed: 2.1,
    radius: 38,        // increased size
    mass: 1.1,
    bodyColor: '#dc2626',      // red body
    highlightColor: '#fca5a5', // light red shine
    shadowColor: '#7f1d1d',    // deep dark red
    special: 'Spinning Blade',
    bladeLength: 82,           // bigger, thicker combat sword blade
  },
  [BALL_TYPES.SPIKE]: {
    id: BALL_TYPES.SPIKE,
    name: 'Spike Ball',
    rarity: RARITIES.UNCOMMON,
    description: 'Perimeter spikes deliver heavy collision puncture with armored frame immune to bleed.',
    baseHp: 100,
    damage: 15,
    speed: 2.0,
    radius: 39, // increased size
    mass: 1.25,
    bodyColor: '#9ca3af',      // gray sphere body
    highlightColor: '#f3f4f6',
    shadowColor: '#374151',
    spikeColor: '#1f2937',     // dark gray spikes
    hasArmor: true,            // Immune to bleed effects
    special: 'Puncture Spikes & Armored',
  },

  // ==========================================
  // RARE TIER
  // ==========================================
  [BALL_TYPES.STEEL]: {
    id: BALL_TYPES.STEEL,
    name: 'Steel Ball',
    rarity: RARITIES.RARE,
    description: 'Gains a kinetic energy barrier shield (+20 Shield) every 4 hits taken. Hard metallic composition (takes 2x damage from Hammer Ball).',
    baseHp: 100,
    damage: 11,
    speed: 2.1,
    radius: 39, // increased size
    mass: 1.8,
    bodyColor: '#cbd5e1',      // metallic polished steel
    highlightColor: '#ffffff', // bright chrome sheen
    shadowColor: '#475569',    // deep gunmetal shadow
    hasHard: true,
    special: 'Hard & Shield on 4 Hits',
    shieldAmount: 20,
  },
  [BALL_TYPES.GLASS]: {
    id: BALL_TYPES.GLASS,
    name: 'Glass Ball',
    rarity: RARITIES.RARE,
    description: 'Fragile crystalline orb. Breaks and scatters sharp glass shards when struck that inflict Bleed.',
    baseHp: 100,
    damage: 9,
    speed: 2.3,
    radius: 38,
    mass: 0.9,
    bodyColor: '#67e8f9',      // translucent light cyan/teal glass
    highlightColor: '#ffffff',
    shadowColor: '#0891b2',
    isGlass: true,
    special: 'Brittle Shards',
  },
  [BALL_TYPES.HAMMER]: {
    id: BALL_TYPES.HAMMER,
    name: 'Hammer Ball',
    rarity: RARITIES.RARE,
    description: 'Equipped with heavy spinning warhammer. Rebounding blows push enemies back with massive Knockback, and deal 2x damage against Hard/Dense balls (Steel Ball, Stone Ball, Spike Ball).',
    baseHp: 100,
    damage: 7,
    hammerDamage: 24,
    speed: 1.9,
    radius: 40,
    mass: 1.6,
    bodyColor: '#991b1b',      // darker version of red
    highlightColor: '#f87171',
    shadowColor: '#450a0a',
    special: 'Heavy Knockback & 2x DMG vs Hard',
    hammerLength: 64,
  },
  [BALL_TYPES.GROW]: {
    id: BALL_TYPES.GROW,
    name: 'Grow Ball',
    rarity: RARITIES.RARE,
    description: 'Expands in size and mass (up to 10.0 mass) upon colliding with enemy balls or absorbing spit fire hits, gaining the Heavy Effect at 2.8+ size.',
    baseHp: 100,
    damage: 9,
    speed: 2.2,
    radius: 34,
    growthPerHit: 7.5,
    growthPerFlameHit: 3.2,
    maxRadius: 136,
    mass: 1.0,
    maxMass: 10.0,
    bodyColor: '#22c55e',      // vibrant green
    highlightColor: '#bbf7d0',
    shadowColor: '#15803d',
    special: 'Size Grow & Heavy (2.8+)',
  },
  [BALL_TYPES.DUAL_SWORD]: {
    id: BALL_TYPES.DUAL_SWORD,
    name: 'Dual Sword Ball',
    rarity: RARITIES.RARE,
    description: 'Equipped with dual rotating swords mounted in front and back. Slashes opposing units from both directions with 18 blade damage.',
    baseHp: 100,
    damage: 8,         // Body hitbox deals 8 damage
    bladeDamage: 18,   // Each sword blade deals 18 damage
    speed: 2.5,
    radius: 36,
    mass: 1.1,
    bodyColor: '#f87171',      // light red body of the sword ball
    highlightColor: '#fef2f2', // bright light shine
    shadowColor: '#b91c1c',    // deep dark red
    special: 'Dual Spinning Blades',
    bladeLength: 50,
  },

    [BALL_TYPES.PRIEST]: {
    id: BALL_TYPES.PRIEST,
    name: 'Priest Ball',
    rarity: RARITIES.RARE,
    description: 'Channels Divine Blessing after 9s to cast a map-wide heal across the entire canvas on self and all living allies (heal is divided evenly among beneficiaries). Buffs allies with Heal, no enemy inflicts.',
    baseHp: 100,
    damage: 6,
    speed: 2.3,
    radius: 34,
    mass: 1.0,
    blessCooldown: 9000,
    blessRadius: 2000,
    blessPool: 24,
    bodyColor: '#fef3c7',      // holy ivory clerical robe
    highlightColor: '#fde047', // radiant celestial gold
    shadowColor: '#d97706',    // warm holy amber shadow
    special: 'Blessing (Canvas-wide Heal after 9s)',
    selfInflicts: 'Blessing',
    buffs: 'Heal',
  },

  // ==========================================
  // UNIQUE TIER
  // ==========================================
  [BALL_TYPES.GUN]: {
    id: BALL_TYPES.GUN,
    name: 'Gun Ball',
    rarity: RARITIES.UNIQUE,
    description: 'Equipped with a rotating firearm that shoots a heavy high-caliber bullet every 3 seconds towards where its barrel points.',
    baseHp: 100,
    damage: 7,         // standard body bump damage
    bulletDamage: 32,   // heavy bullet damage
    shootCooldown: 3000,// 3 second cooldown
    speed: 2.0,
    radius: 38,
    mass: 1.15,
    bodyColor: '#334155',      // tactical slate gunmetal
    highlightColor: '#cbd5e1', // steel reflection
    shadowColor: '#0f172a',    // dark shadow
    gunColor: '#1e293b',
    special: 'Gun Cannon (3s Cooldown)',
    barrelLength: 48,
  },
  [BALL_TYPES.MULTI]: {
    id: BALL_TYPES.MULTI,
    name: 'Multi Ball',
    rarity: RARITIES.UNIQUE,
    description: 'Moves with high velocity like Fast Ball with half HP (50 HP). Upon death, splits into 2 mini copies (25 HP each), which subsequently split into 2 micro copies (10 HP each) when defeated.',
    baseHp: 50,
    damage: 7,
    speed: 3.5,
    radius: 34,
    mass: 0.75,
    bodyColor: '#c026d3',      // energetic vibrant fuchsia
    highlightColor: '#f0abfc', // bright electric pink glint
    shadowColor: '#701a75',    // deep dark fuchsia shadow
    special: 'Split on Death',
    splitStage: 1,
  },
  [BALL_TYPES.DAGGER]: {
    id: BALL_TYPES.DAGGER,
    name: 'Dagger Ball',
    rarity: RARITIES.UNIQUE,
    description: 'Armed with a large combat dagger that spins and bounces. Contact with body or weapon marks the enemy with Dagger Mark; after 2s delay, Dagger Ball stops moving to aim for 2s and throws its dagger. Hits embed into the target inflicting Bleed and Slow (-25% SPD, -25% DMG), retrievable only by body ramming that enemy. Misses stick to walls and return via telekinesis after 4s.',
    baseHp: 100,
    damage: 4,
    daggerDamage: 10,
    speed: 2.3,
    radius: 34,
    mass: 1.0,
    bodyColor: '#0f766e',      // dark jade assassin teal
    highlightColor: '#5eead4', // glowing cyan-emerald glint
    shadowColor: '#134e4a',    // deep dark teal shadow
    special: 'Dagger Throw & Telekinesis Recall',
    inflicts: 'Dagger Mark, Bleed & Slow',
    selfInflicts: 'Telekinesis Recall',
    daggerLength: 44,
    daggerAimDuration: 2000,
    daggerDelayDuration: 2000,
    daggerWallDuration: 4000,
  },

    [BALL_TYPES.PUSH]: {
    id: BALL_TYPES.PUSH,
    name: 'Push Ball',
    rarity: RARITIES.UNIQUE,
    description: 'Requires 1 body hit on an enemy to charge a kinetic repulsor pulse. Once charged, pushes nearby enemy balls violently away in a 130px radius, inflicting Knockback, and must land another hit to charge again.',
    baseHp: 100,
    damage: 6,
    speed: 2.5,
    radius: 34,
    mass: 1.25,
    bodyColor: '#4338ca',      // deep kinetic indigo
    highlightColor: '#818cf8', // radiant electric violet glint
    shadowColor: '#1e1b4b',    // dark midnight indigo shadow
    special: 'Hit-Charged Repulsor Pulse',
    inflicts: 'Knockback',
    selfInflicts: 'Push',
    pushRadius: 130,
    pushCooldown: 2500,
    pushForce: 10.5,
    pushDamage: 6,
  },
  [BALL_TYPES.RAPIER]: {
    id: BALL_TYPES.RAPIER,
    name: 'Rapier Ball',
    rarity: RARITIES.UNIQUE,
    description: 'Equipped with an elegant fencing rapier dealing 12 weapon damage that spins in normal combat. Landing a hit (5 body DMG or 12 weapon DMG) marks that enemy with Rapier Mark; Rapier Ball halts and aims for 0.8s before executing a lightning forward Dash thrust piercing for 28 DMG.',
    baseHp: 100,
    damage: 5,
    rapierDamage: 12,
    dashDamage: 28,
    speed: 2.3,
    dashSpeed: 17.5,
    radius: 34,
    mass: 1.0,
    bodyColor: '#1e293b',      // elegant midnight duelist slate
    highlightColor: '#f43f5e', // crimson duelist flourish
    shadowColor: '#0f172a',    // deep dark shadow
    guardColor: '#fbbf24',     // ornate golden swept cup hilt
    special: 'Rapier Mark & Dash Thrust',
    inflicts: 'Rapier Mark',
    selfInflicts: 'Dash',
    rapierLength: 56,
    aimDuration: 800,
    dashDuration: 350,
    rapierCooldown: 2800,
  },

  // ==========================================
  // EPIC TIER
  // ==========================================
  [BALL_TYPES.ACCELERATOR]: {
    id: BALL_TYPES.ACCELERATOR,
    name: 'Accelerator Ball',
    rarity: RARITIES.EPIC,
    description: 'The longer the fight, the faster this ball accelerates (up to 12.0 max speed), scaling its kinetic collision damage higher as speed increases.',
    baseHp: 100,
    damage: 8,
    speed: 2.6,
    initialSpeed: 2.6,
    maxSpeed: 12.0,
    accelRate: 0.32, // gains speed every second
    radius: 35,
    mass: 0.9,
    bodyColor: '#1d4ed8',      // darker, richer cobalt blue
    highlightColor: '#93c5fa', // bright electric blue glint
    shadowColor: '#172554',    // midnight deep blue shadow
    special: 'Rapid & Accelerate (Damage with Speed)',
  },
  [BALL_TYPES.SHARD]: {
    id: BALL_TYPES.SHARD,
    name: 'Shard Ball',
    rarity: RARITIES.EPIC,
    description: 'Striking an enemy locks onto them and shoots 6 consecutive homing shards that deal 1 damage each.',
    baseHp: 100,
    damage: 8,
    speed: 2.2,
    radius: 34,
    mass: 1.0,
    bodyColor: '#581c87',      // Dark purple
    highlightColor: '#c084fc', // purple glint
    shadowColor: '#2e1065',    // deep dark purple
    special: 'Shard',
    inflicts: 'Shard Target',
  },
  [BALL_TYPES.SNIPER]: {
    id: BALL_TYPES.SNIPER,
    name: 'Sniper Ball',
    rarity: RARITIES.EPIC,
    description: 'Mounted with a long-range tactical sniper rifle. Has very low body collision damage (3 DMG), but periodically freezes in midair to lock its precision laser sight onto an enemy and discharge an armor-piercing 15 DMG sniper round.',
    baseHp: 100,
    damage: 3,
    speed: 2.1,
    radius: 38,
    mass: 1.05,
    bulletDamage: 15,
    sniperCooldown: 4000,
    aimDuration: 1000, // Deducted by 0.8s (1.0s precision aim freeze)
    bodyColor: '#1e293b',      // Matte tactical slate
    highlightColor: '#38bdf8', // Precision cyan laser optic sheen
    shadowColor: '#090d16',    // Deep stealth black shadow
    barrelColor: '#0f172a',
    special: 'Lock-On Sniper (4s Cooldown)',
  },

  // ==========================================
  // LEGENDARY TIER
  // ==========================================
  [BALL_TYPES.THORN]: {
    id: BALL_TYPES.THORN,
    name: 'Thorn Ball',
    rarity: RARITIES.LEGENDARY,
    description: 'Direct body contact inflicts -2 -1 Bleed. Bouncing off walls sprouts permanent creeping floral Thorns (S, M, L) that deal 2 damage and inflict -1 -1 Bleed.',
    baseHp: 100,
    damage: 8,
    speed: 2.1,
    radius: 38,
    mass: 1.15,
    bodyColor: '#166534',      // Rich dark briar green
    highlightColor: '#4ade80', // Vibrant briar green highlight
    shadowColor: '#022c22',    // Deep obsidian forest shadow
    thornColor: '#15803d',
    special: 'Thorns & Bleed',
    trapDamage: 2,
  },
  [BALL_TYPES.FIRE]: {
    id: BALL_TYPES.FIRE,
    name: 'Fire Ball',
    rarity: RARITIES.LEGENDARY,
    description: 'A raging blazing ball with a perpetual Flaming aura. Struck enemies are ignited with Burn (-4, -3, -2, -1, -1, -1), scorching them with true fire damage over an extended duration. Incinerates and completely destroys Thorn Traps on contact.',
    baseHp: 100,
    damage: 9,
    speed: 2.3,
    radius: 38,
    mass: 1.1,
    bodyColor: '#ea580c',      // fiery bright blaze orange
    highlightColor: '#fef08a', // radiant white-hot solar yellow
    shadowColor: '#7c2d12',    // deep dark ember charcoal shadow
    flameColor: '#f97316',
    special: 'Flaming & Burn (Burns Thorns)',
    inflicts: 'Burn (-4 -3 -2 -1 -1 -1)',
  },
  [BALL_TYPES.DICE]: {
    id: BALL_TYPES.DICE,
    name: 'Dice Ball',
    rarity: RARITIES.LEGENDARY,
    description: 'A high-stakes casino die starting with a mark of 1 (1 DMG). After striking an enemy twice, it unlocks and rolls a random damage value based on probability: Low (5-12, 75%), Mid (15-25, 20%), High (30-50, 5%), or a legendary 1% God roll dealing 99 DMG! Features a 7-hit Pity System: taking damage 7 times absorbs the pity to upgrade Mid/Low rolls into a High Roll.',
    baseHp: 100,
    damage: 1,
    speed: 2.2,
    radius: 38,
    mass: 1.1,
    bodyColor: '#f8fafc',      // Porcelain ivory dice white
    highlightColor: '#ffffff', // High-gloss reflection
    shadowColor: '#94a3b8',    // Slate beveled shadow
    pipColor: '#0f172a',       // Obsidian dice pips
    special: 'Lucky Roll (Low 75%, Mid 20%, High 5%, God 1% | 7 Hits Taken = High Roll Pity)',
  },

  // ==========================================
  // MYTHICAL TIER
  // ==========================================
  [BALL_TYPES.SPIT_FIRE]: {
    id: BALL_TYPES.SPIT_FIRE,
    name: 'Spit Fire Ball',
    rarity: RARITIES.MYTHICAL,
    description: 'An ancient mythical unit enshrouded in celestial blue flames. On striking an enemy, it locks onto them with Flame Lock for 5 seconds and unleashes a homing barrage of mini blue flames curving towards the target that deal 1 DMG each and inflict Scorch. Incinerates enemy Thorn Traps on contact.',
    baseHp: 100,
    damage: 8,
    speed: 2.3,
    radius: 38,
    mass: 1.1,
    bodyColor: '#0284c7',      // celestial deep sky blue
    highlightColor: '#e0f2fe', // radiant white-hot celestial highlight
    shadowColor: '#0c4a6e',    // deep astral navy shadow
    flameColor: '#38bdf8',     // vibrant cyan-blue flame
    special: 'Incineration',
    inflicts: 'Scorch & Flame Lock (5s)',
  },
  [BALL_TYPES.MOTHER]: {
    id: BALL_TYPES.MOTHER,
    name: 'Mother Ball',
    rarity: RARITIES.MYTHICAL,
    description: 'A mythical matriarch unit that is very slow (1.2 SPD). Every 5.5s, stops moving to birth a baby ball from her brood (costs 5 HP). Cycles between Tough Baby (high HP), Sword Baby (spinning blade), and Gun Baby (projectile nozzle), maintaining up to 3 active baby balls.',
    baseHp: 120,
    damage: 7,
    speed: 1.2,
    radius: 42,
    mass: 2.2,
    bodyColor: '#831843',      // royal cosmic magenta / fuchsia
    highlightColor: '#fbcfe8', // radiant rose gold glint
    shadowColor: '#500724',    // deep dark wine shadow
    special: 'Brood (Summons 3 Baby Varieties, Costs 5 HP)',
    selfInflicts: 'Brood',
    broodCooldown: 5500,
    broodHpCost: 5,
    broodMaxCap: 3,
  },

  // ==========================================
  // SUMMONED BABY BROOD (SUMMON ONLY)
  // ==========================================
  [BALL_TYPES.BABY_NORMAL]: {
    id: BALL_TYPES.BABY_NORMAL,
    name: 'Baby Ball',
    rarity: RARITIES.COMMON,
    description: 'Tough frontline baby ball spawned by Mother Ball with higher HP than other baby balls.',
    baseHp: 65,
    damage: 6,
    speed: 2.8,
    radius: 17,
    mass: 0.5,
    bodyColor: '#1e3a8a',
    highlightColor: '#93c5fd',
    shadowColor: '#0f172a',
    isSummonOnly: true,
    special: 'Tough Baby (+65% HP)',
  },
  [BALL_TYPES.BABY_SWORD]: {
    id: BALL_TYPES.BABY_SWORD,
    name: 'Baby Sword Ball',
    rarity: RARITIES.COMMON,
    description: 'Mini skirmisher baby ball armed with a spinning miniature combat sword.',
    baseHp: 40,
    damage: 4,
    bladeDamage: 12,
    bladeLength: 26,
    speed: 2.9,
    radius: 16,
    mass: 0.45,
    bodyColor: '#b91c1c',
    highlightColor: '#fca5a5',
    shadowColor: '#450a0a',
    isSummonOnly: true,
    special: 'Mini Spinning Blade',
  },
  [BALL_TYPES.BABY_GUN]: {
    id: BALL_TYPES.BABY_GUN,
    name: 'Baby Gun Ball',
    rarity: RARITIES.COMMON,
    description: 'Mini ranged artillery baby ball armed with a rotating projectile nozzle.',
    baseHp: 40,
    damage: 4,
    speed: 2.9,
    radius: 16,
    mass: 0.45,
    gunCooldown: 3500,
    bulletDamage: 14,
    barrelLength: 24,
    bodyColor: '#d97706',
    highlightColor: '#fde047',
    shadowColor: '#451a03',
    gunColor: '#78350f',
    isSummonOnly: true,
    special: 'Mini Gun Cannon (3.5s Cooldown)',
  },
};

export const TEAMS = {
  BLUE: {
    id: 0,
    name: 'Blue',
    color: '#3b82f6',
    side: 'left',
    bgTint: 'rgba(59, 130, 246, 0.05)',
  },
  RED: {
    id: 1,
    name: 'Red',
    color: '#ef4444',
    side: 'right',
    bgTint: 'rgba(239, 68, 68, 0.05)',
  },
};
