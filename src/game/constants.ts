export const CANVAS_WIDTH = 400;
export const CANVAS_HEIGHT = 600;

export const GRAVITY = 0.4;
export const JUMP_FORCE = -10;

export const TIER_STATS = {
  0: { jump: -10, speed: 5 }, // Default
  1: { jump: -13, speed: 4 }, // Frog (High Jump, Low Speed)
  2: { jump: -11, speed: 7 }, // Kangaroo (Balanced)
  3: { jump: -14, speed: 8 }, // Tiger (Highest)
};

export const PLATFORM_TYPES = {
  BASIC: 'BASIC',
  SPRING: 'SPRING',
  CRACKED: 'CRACKED',
};

export const ITEM_TYPES = {
  HELICOPTER: 'HELICOPTER',
  COIN: 'COIN',
  MAGNET: 'MAGNET',
};
