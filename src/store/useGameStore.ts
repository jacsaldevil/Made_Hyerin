import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GameState {
  score: number;
  highScore: number;
  coins: number;
  gameState: 'START' | 'PLAYING' | 'PAUSED' | 'GAMEOVER';
  characterTier: 0 | 1 | 2 | 3;
  ownedTiers: number[];
  mobileMove: 'LEFT' | 'RIGHT' | null;
  
  setScore: (score: number) => void;
  addCoins: (amount: number) => void;
  setGameState: (state: 'START' | 'PLAYING' | 'PAUSED' | 'GAMEOVER') => void;
  setCharacterTier: (tier: 0 | 1 | 2 | 3) => void;
  setMobileMove: (move: 'LEFT' | 'RIGHT' | null) => void;
  buyCharacter: (tier: number, price: number) => boolean;
  resetGame: () => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      score: 0,
      highScore: 0,
      coins: 0,
      gameState: 'START',
      characterTier: 0,
      ownedTiers: [0],
      mobileMove: null,

      setScore: (score) => set((state) => ({ 
        score, 
        highScore: Math.max(state.highScore, score) 
      })),
      
      addCoins: (amount) => set((state) => ({ coins: state.coins + amount })),
      
      setGameState: (gameState) => set({ gameState }),
      
      setCharacterTier: (characterTier) => set({ characterTier }),

      setMobileMove: (mobileMove) => set({ mobileMove }),

      buyCharacter: (tier, price) => {
        const { coins, ownedTiers } = get();
        if (coins >= price && !ownedTiers.includes(tier)) {
          set({ 
            coins: coins - price, 
            ownedTiers: [...ownedTiers, tier],
            characterTier: tier as any
          });
          return true;
        }
        return false;
      },
      
      resetGame: () => set({ score: 0, gameState: 'PLAYING' }),
    }),
    {
      name: 'space-jumper-storage',
      partialize: (state) => ({ 
        highScore: state.highScore, 
        coins: state.coins, 
        ownedTiers: state.ownedTiers,
        characterTier: state.characterTier 
      }),
    }
  )
);
