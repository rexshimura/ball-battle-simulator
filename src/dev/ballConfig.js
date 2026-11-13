// Ball Battle Configurations (/dev - Normal Ball Only)

export const BALL_TYPES = {
  // Common
  NORMAL: 'NORMAL',
};

export const RARITIES = {
  COMMON: 'Common',
};

export const RARITY_ORDER = [
  RARITIES.COMMON,
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
    radius: 38,
    mass: 1.0,
    bodyColor: '#71717a',      // mid gray
    highlightColor: '#d4d4d8', // light highlight
    shadowColor: '#27272a',    // dark shadow
    special: null,
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
