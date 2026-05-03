import './App.css'
import GameCanvas from './components/GameCanvas'
import { useGameStore } from './store/useGameStore'
import { TIER_STATS } from './game/constants'

const CHARACTERS = [
  { tier: 0, name: 'Rabbit', price: 0, emoji: '🐰', desc: 'Default stats' },
  { tier: 1, name: 'Frog', price: 10, emoji: '🐸', desc: 'High Jump / Low Speed' },
  { tier: 2, name: 'Kangaroo', price: 30, emoji: '🦘', desc: 'Balanced / High Stats' },
  { tier: 3, name: 'Tiger', price: 50, emoji: '🐯', desc: 'God Tier / Max Stats' },
];

function App() {
  const { 
    gameState, setGameState, score, highScore, coins, 
    characterTier, setCharacterTier, ownedTiers, buyCharacter 
  } = useGameStore();

  const handleCharacterAction = (char: typeof CHARACTERS[0]) => {
    if (ownedTiers.includes(char.tier)) {
      setCharacterTier(char.tier as any);
    } else {
      if (buyCharacter(char.tier, char.price)) {
        // Success
      } else {
        alert('Not enough coins!');
      }
    }
  };

  return (
    <div className="game-container">
      <div className="ui-overlay">
        <div className="stats-bar">
          <div className="stat-item">Score: {score}</div>
          <div className="stat-item">High: {highScore}</div>
          <div className="stat-item coin-text">Coins: {coins}</div>
        </div>
        
        {gameState === 'START' && (
          <div className="menu main-menu">
            <h1>Space Jumper</h1>
            
            <div className="character-shop">
              <h3>Select Character</h3>
              <div className="char-list">
                {CHARACTERS.map(char => (
                  <div 
                    key={char.tier} 
                    className={`char-card ${characterTier === char.tier ? 'selected' : ''} ${!ownedTiers.includes(char.tier) ? 'locked' : ''}`}
                    onClick={() => handleCharacterAction(char)}
                  >
                    <div className="char-emoji-preview">{char.emoji}</div>
                    <div className="char-info">
                      <span className="char-name">{char.name}</span>
                      <span className="char-desc">{char.desc}</span>
                      {!ownedTiers.includes(char.tier) && <span className="char-price">💰 {char.price}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button className="start-btn" onClick={() => setGameState('PLAYING')}>Start Mission</button>
          </div>
        )}

        {gameState === 'PAUSED' && (
          <div className="menu">
            <h1>Paused</h1>
            <button onClick={() => setGameState('PLAYING')}>Resume</button>
            <button onClick={() => window.location.reload()}>Main Menu</button>
          </div>
        )}

        {gameState === 'GAMEOVER' && (
          <div className="menu">
            <h1>Mission Failed</h1>
            <p>Score: {score}</p>
            <button onClick={() => setGameState('PLAYING')}>Retry</button>
            <button onClick={() => setGameState('START')}>Main Menu</button>
          </div>
        )}
      </div>
      
      <GameCanvas />
      
      <div className="controls-hint">
        <p>Arrows: Move | Esc: Pause | (Auto Jump on Platforms)</p>
      </div>
    </div>
  )
}

export default App
