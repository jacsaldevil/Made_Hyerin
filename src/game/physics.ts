import { GRAVITY } from './constants';

export type PlatformType = 'BASIC' | 'SPRING' | 'CRACKED';
export type ItemType = 'HELICOPTER' | 'COIN' | 'MAGNET';

export interface Entity {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Player extends Entity {
  vx: number;
  vy: number;
  tier: 0 | 1 | 2 | 3;
  activePowerUps: {
    type: ItemType;
    endTime: number;
  }[];
}

export interface Platform extends Entity {
  type: PlatformType;
  isMoving: boolean;
  moveDirection: number;
  isUsed: boolean;
  item?: Item;
}

export interface Item extends Entity {
  type: ItemType;
  collected: boolean;
}

export const updatePlayerPhysics = (player: Player, dt: number = 1) => {
  player.vy += GRAVITY * dt;
  player.y += player.vy * dt;
  player.x += player.vx * dt;

  // Screen wrap
  if (player.x + player.width < 0) player.x = 400;
  if (player.x > 400) player.x = -player.width;
};

export const updatePlatformPhysics = (platform: Platform, dt: number = 1) => {
  if (platform.isMoving) {
    platform.x += platform.moveDirection * 2 * dt;
    if (platform.x <= 0 || platform.x + platform.width >= 400) {
      platform.moveDirection *= -1;
    }
  }
};

export const checkCollision = (a: Entity, b: Entity) => {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
};
