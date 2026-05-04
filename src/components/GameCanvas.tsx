import React, { useRef, useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';
import { CANVAS_WIDTH, CANVAS_HEIGHT, TIER_STATS } from '../game/constants';
import { updatePlayerPhysics, updatePlatformPhysics, checkCollision } from '../game/physics';
import type { Player, Platform, PlatformType, Item, ItemType } from '../game/physics';

const CHAR_EMOJIS = {
  0: '🐰', // Default (Rabbit-like Space Suit)
  1: '🐸', // Frog
  2: '🦘', // Kangaroo
  3: '🐯'  // Tiger
};

const GameCanvas: React.FC = React.memo(() => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const gameState = useGameStore(state => state.gameState);
  const setScore = useGameStore(state => state.setScore);
  const addCoins = useGameStore(state => state.addCoins);
  const characterTier = useGameStore(state => state.characterTier);
  const setGameState = useGameStore(state => state.setGameState);
  
  const player = useRef<Player>({
    x: CANVAS_WIDTH / 2 - 15,
    y: CANVAS_HEIGHT - 100,
    width: 40,
    height: 40,
    vx: 0,
    vy: 0,
    tier: characterTier,
    activePowerUps: []
  });

  const platforms = useRef<Platform[]>([]);
  const cameraY = useRef(0);
  const maxScore = useRef(0);
  const keys = useRef<{ [key: string]: boolean }>({});

  const createPlatform = (y: number): Platform => {
    const typeRand = Math.random();
    let type: PlatformType = 'BASIC';
    if (typeRand > 0.85) type = 'SPRING';
    else if (typeRand > 0.75) type = 'CRACKED';

    const isMoving = type === 'BASIC' && Math.random() > 0.5;
    
    let item: Item | undefined;
    if (Math.random() < 0.25) {
      const itemRand = Math.random();
      let itemType: ItemType = 'COIN';
      if (itemRand > 0.8) itemType = 'HELICOPTER';
      else if (itemRand > 0.5) itemType = 'MAGNET';

      item = {
        x: 10 + Math.random() * 40,
        y: -25,
        width: 20,
        height: 20,
        type: itemType,
        collected: false
      };
    }

    return {
      x: Math.random() * (CANVAS_WIDTH - 60),
      y,
      width: 70,
      height: 15,
      type,
      isMoving,
      moveDirection: Math.random() > 0.5 ? 1 : -1,
      isUsed: false,
      item
    };
  };

  const initGame = () => {
    player.current = {
      x: CANVAS_WIDTH / 2 - 20,
      y: CANVAS_HEIGHT - 100,
      width: 40,
      height: 40,
      vx: 0,
      vy: 0,
      tier: characterTier,
      activePowerUps: []
    };
    cameraY.current = 0;
    maxScore.current = 0;
    setScore(0);
    keys.current = {};
    
    platforms.current = [];
    platforms.current.push({
      x: 0,
      y: CANVAS_HEIGHT - 20,
      width: CANVAS_WIDTH,
      height: 20,
      type: 'BASIC',
      isMoving: false,
      moveDirection: 0,
      isUsed: false
    });

    for (let i = 1; i < 15; i++) {
      platforms.current.push(createPlatform(CANVAS_HEIGHT - i * 85));
    }
  };

  useEffect(() => {
    if (gameState === 'PLAYING') {
      initGame();
    }
  }, [gameState, characterTier]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = performance.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current[e.key] = true;
      if (e.key === 'Escape') setGameState('PAUSED');
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const render = (time: number) => {
      const deltaTime = (time - lastTime) / 16.67; // Normalize to ~60fps
      lastTime = time;
      
      const dt = Math.min(Math.max(deltaTime, 0.1), 2); // Cap dt to avoid huge jumps or negative time

      if (gameState === 'PLAYING') {
        // Smooth horizontal movement using key state or mobile touch
        const currentMobileMove = useGameStore.getState().mobileMove;
        const stats = TIER_STATS[characterTier];
        const maxSpeed = stats.speed;
        
        let targetVx = 0;
        if (keys.current['ArrowLeft'] || currentMobileMove === 'LEFT') targetVx = -maxSpeed;
        else if (keys.current['ArrowRight'] || currentMobileMove === 'RIGHT') targetVx = maxSpeed;

        // Acceleration and friction
        const accel = 0.8 * dt;
        if (player.current.vx < targetVx) {
          player.current.vx = Math.min(player.current.vx + accel, targetVx);
        } else if (player.current.vx > targetVx) {
          player.current.vx = Math.max(player.current.vx - accel, targetVx);
        }

        player.current.activePowerUps = player.current.activePowerUps.filter(p => time < p.endTime);
        
        const hasHelicopter = player.current.activePowerUps.some(p => p.type === 'HELICOPTER');
        const hasMagnet = player.current.activePowerUps.some(p => p.type === 'MAGNET');

        if (hasHelicopter) {
          player.current.vy = -14;
        }

        updatePlayerPhysics(player.current, dt);

        platforms.current.forEach((platform, index) => {
          updatePlatformPhysics(platform, dt);

          if (player.current.vy > 0 && checkCollision(player.current, platform)) {
             if (!hasHelicopter) {
                if (platform.type === 'SPRING') {
                  player.current.vy = TIER_STATS[characterTier].jump * 1.8;
                } else {
                  player.current.vy = TIER_STATS[characterTier].jump;
                }
                if (platform.type === 'CRACKED') {
                  platforms.current.splice(index, 1);
                }
             }
          }

          if (platform.item && !platform.item.collected) {
            const worldItemX = platform.x + platform.item.x;
            const worldItemY = platform.y + platform.item.y;

            if (hasMagnet && platform.item.type === 'COIN') {
               const dist = Math.sqrt((player.current.x - worldItemX)**2 + (player.current.y - worldItemY)**2);
               if (dist < 200) {
                 platform.item.x += (player.current.x - worldItemX) * 0.15 * dt;
                 platform.item.y += (player.current.y - worldItemY) * 0.15 * dt;
               }
            }

            if (checkCollision(player.current, { ...platform.item, x: worldItemX, y: worldItemY })) {
              platform.item.collected = true;
              if (platform.item.type === 'COIN') {
                addCoins(1);
              } else {
                const existing = player.current.activePowerUps.find(p => p.type === platform.item?.type);
                const duration = platform.item.type === 'HELICOPTER' ? 8000 : 12000;
                if (existing) {
                  existing.endTime = time + duration;
                } else {
                  player.current.activePowerUps.push({ type: platform.item.type, endTime: time + duration });
                }
              }
            }
          }
        });

        if (player.current.y < CANVAS_HEIGHT / 2 + cameraY.current) {
          cameraY.current = player.current.y - CANVAS_HEIGHT / 2;
        }

        const lowestPlatformY = Math.min(...platforms.current.map(p => p.y));
        if (lowestPlatformY > cameraY.current - 100) {
          platforms.current.push(createPlatform(lowestPlatformY - 85));
        }

        platforms.current = platforms.current.filter(p => p.y < cameraY.current + CANVAS_HEIGHT + 200);

        const currentScore = Math.floor(-cameraY.current / 10);
        if (currentScore > maxScore.current) {
          maxScore.current = currentScore;
          setScore(maxScore.current);
        }

        if (player.current.y > cameraY.current + CANVAS_HEIGHT) {
          setGameState('GAMEOVER');
        }
      }

      // Draw Background
      const altitude = Math.max(0, -cameraY.current);
      let bgTop, bgBottom;
      if (altitude < 2000) {
        bgTop = '#3366ff';
        bgBottom = '#87ceeb';
      } else if (altitude < 5000) {
        bgTop = '#000033';
        bgBottom = '#3366ff';
      } else {
        bgTop = '#000000';
        bgBottom = '#000033';
      }

      const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      grad.addColorStop(0, bgTop);
      grad.addColorStop(1, bgBottom);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.save();
      ctx.translate(0, -cameraY.current);

      // Draw Platforms
      platforms.current.forEach(p => {
        ctx.fillStyle = p.type === 'SPRING' ? '#ffcc00' : p.type === 'CRACKED' ? '#996633' : '#44aa44';
        ctx.fillRect(p.x, p.y, p.width, p.height);

        if (p.item && !p.item.collected) {
          ctx.font = '28px Arial'; // Increased item size
          ctx.textAlign = 'center';
          let itemEmoji = '💰';
          if (p.item.type === 'HELICOPTER') itemEmoji = '🚁';
          else if (p.item.type === 'MAGNET') itemEmoji = '🧲';
          ctx.fillText(itemEmoji, p.x + p.item.x + 10, p.y + p.item.y + 10);
        }
      });
      
      // Draw Player
      ctx.font = '40px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const hasHelicopter = player.current.activePowerUps.some(p => p.type === 'HELICOPTER');
      const hasMagnet = player.current.activePowerUps.some(p => p.type === 'MAGNET');
      
      // Power-up indicators
      if (hasHelicopter) {
        ctx.font = '45px Arial';
        ctx.fillText('🔥', player.current.x + 20, player.current.y + 35);
      }
      if (hasMagnet) {
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(player.current.x + 20, player.current.y + 20, 35, 0, Math.PI * 2);
        ctx.stroke();
      }
      
      ctx.fillText(
        (CHAR_EMOJIS as any)[characterTier], 
        player.current.x + 20, 
        player.current.y + 20
      );

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationFrameId);
    };
  }, [gameState, characterTier, setGameState, setScore, addCoins]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
    />
  );
};

export default GameCanvas;
