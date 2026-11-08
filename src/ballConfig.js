// Ball Battle Configurations

export const BALL_TYPES = {
  // Common
  NORMAL: 'NORMAL',
  FAST: 'FAST',
  BIG: 'BIG',

  // Uncommon
  STONE: 'STONE',
  KNIFE: 'KNIFE',
  SWORD: 'SWORD',
  SPIKE: 'SPIKE',

  // Rare
  STEEL: 'STEEL',
  GLASS: 'GLASS',
  HAMMER: 'HAMMER',
  GROW: 'GROW',

  // Unique
  ACCELERATOR: 'ACCELERATOR',
  GUN: 'GUN',
  MULTI: 'MULTI',

  // Epic
  SHARD: 'SHARD',
  THORN: 'THORN',

  // Legendary
  FIRE: 'FIRE',
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
    description: 'Lighter and faster, lower damage.',
    baseHp: 100,
    damage: 7,
    speed: 3.6,
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

  // ==========================================
  // UNCOMMON TIER
  // ==========================================
  [BALL_TYPES.STONE]: {
    id: BALL_TYPES.STONE,
    name: 'Stone Ball',
    rarity: RARITIES.UNCOMMON,
    description: 'Heavy knockback-resistant chassis with +30% bonus HP (130 HP) and armored shell immune to bleed.',
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
    special: 'Heavy (+30% HP) & Armored',
  },
  [BALL_TYPES.KNIFE]: {
    id: BALL_TYPES.KNIFE,
    name: 'Knife Ball',
    rarity: RARITIES.UNCOMMON,
    description: 'Equipped with a compact combat knife that spins rapidly at double speed, slashing nearby enemies in close quarters.',
    baseHp: 100,
    damage: 7,         // Body hitbox deals lower bump damage
    knifeDamage: 15,   // Rapid spinning knife blade deals 15 damage
    speed: 2.3,
    radius: 37,
    mass: 1.05,
    bodyColor: '#4b5563',      // gray body
    highlightColor: '#9ca3af', // lighter gray highlight
    shadowColor: '#1f2937',    // deep dark gray shadow
    knifeColor: '#cbd5e1',     // steel blade
    special: 'Rapid Spinning Knife',
    knifeLength: 28,           // compact combat knife blade
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
    bladeLength: 54,           // longer blade to match bigger body
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
    description: 'Gains a kinetic energy barrier shield (+20 Shield) every 4 hits taken.',
    baseHp: 100,
    damage: 11,
    speed: 2.1,
    radius: 39, // increased size
    mass: 1.8,
    bodyColor: '#cbd5e1',      // metallic polished steel
    highlightColor: '#ffffff', // bright chrome sheen
    shadowColor: '#475569',    // deep gunmetal shadow
    special: 'Shield on 4 Hits',
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
    description: 'Equipped with heavy spinning warhammer. Rebounding blows push enemies back with massive Knockback.',
    baseHp: 100,
    damage: 7,
    hammerDamage: 24,
    speed: 1.9,
    radius: 40,
    mass: 1.6,
    bodyColor: '#991b1b',      // darker version of red
    highlightColor: '#f87171',
    shadowColor: '#450a0a',
    special: 'Heavy Knockback',
    hammerLength: 64,
  },
  [BALL_TYPES.GROW]: {
    id: BALL_TYPES.GROW,
    name: 'Grow Ball',
    rarity: RARITIES.RARE,
    description: 'Expands in size and mass (up to 6.0 mass) upon colliding with enemy balls, gaining the Heavy Effect at 2.8+ size.',
    baseHp: 100,
    damage: 9,
    speed: 2.2,
    radius: 34,
    growthPerHit: 7.5,
    maxRadius: 108,
    mass: 1.0,
    maxMass: 6.0,
    bodyColor: '#22c55e',      // vibrant green
    highlightColor: '#bbf7d0',
    shadowColor: '#15803d',
    special: 'Size Grow & Heavy (2.8+)',
  },

  // ==========================================
  // UNIQUE TIER
  // ==========================================
  [BALL_TYPES.ACCELERATOR]: {
    id: BALL_TYPES.ACCELERATOR,
    name: 'Accelerator Ball',
    rarity: RARITIES.UNIQUE,
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

  // ==========================================
  // EPIC TIER
  // ==========================================
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
  [BALL_TYPES.THORN]: {
    id: BALL_TYPES.THORN,
    name: 'Thorn Ball',
    rarity: RARITIES.EPIC,
    description: 'Direct body contact inflicts -2 -1 Bleed. Bouncing off walls sprouts permanent creeping floral Thorns (S, M, L) that deal 2 damage and inflict -1 -1 Bleed.',
    baseHp: 100,
    damage: 8,
    speed: 2.1,
    radius: 38,
    mass: 1.15,
    bodyColor: '#14532d',      // Dark green
    highlightColor: '#4ade80', // bright lime/green highlight
    shadowColor: '#052e16',    // deep dark forest green shadow
    thornColor: '#166534',
    special: 'Thorns & Bleed',
    trapDamage: 2,
  },

  // ==========================================
  // LEGENDARY TIER
  // ==========================================
  [BALL_TYPES.FIRE]: {
    id: BALL_TYPES.FIRE,
    name: 'Fire Ball',
    rarity: RARITIES.LEGENDARY,
    description: 'A raging blazing ball with a perpetual Flaming aura. Struck enemies are ignited with Burn (-2, -2, -1, -1), scorching them with true fire damage over time. Incinerates and completely destroys Thorn Traps on contact.',
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
    inflicts: 'Burn (-2 -2 -1 -1)',
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
