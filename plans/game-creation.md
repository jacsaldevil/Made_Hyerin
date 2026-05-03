# Jumping Game Design Document & Implementation Plan

This document outlines the design and implementation strategy for the web-based jumping game.

## 1. Objective
Create a "Doodle Jump" style game where the player jumps on platforms to reach the highest score possible, featuring different platform types, items, characters, and a global ranking system.

## 2. Tech Stack & Architecture
- **Framework**: React 18+ with TypeScript.
- **Rendering**: HTML5 Canvas API (integrated with React hooks for high performance).
- **Styling**: Vanilla CSS (CSS Modules for component scoping).
- **State Management**: React Context / Hooks (Zustand for lightweight global state if needed).
- **Database (Ranking)**: **Supabase** (Recommended). 
    - *Why?* Easy to set up, free tier, excellent TypeScript support, and works perfectly with static sites like GitHub Pages.
- **Deployment**: GitHub Pages via GitHub Actions.

## 3. Game Mechanics Design
### Platforms
- **Basic**: Stationary. 50% chance to move horizontally.
- **Spring**: Boosts jump height significantly.
- **Cracked**: Disappears after one jump.
- **Generation Logic**: Procedural generation as the player moves upwards.

### Items (25% spawn rate on platforms)
- **Bamboo Helicopter**: 10s invincibility + rapid ascent.
- **Gold Coin**: Currency to unlock characters.
- **Magnet**: Pulls coins within range for 15s.

### Characters & Tiers
- **Tier 0 (Default)**: Blue Space Suit (Standard stats).
- **Tier 1 (Frog)**: High Jump, Low Speed.
- **Tier 2 (Kangaroo)**: Balanced High Stats.
- **Tier 3 (Tiger)**: Highest Jump and Speed.

### Scoring & Environment
- **Score**: Based on maximum height reached.
- **Background**: Transitions from "Ground" (Earth) to "Atmosphere" and finally "Space" as height increases.

## 4. Implementation Steps

### Phase 1: Setup & Infrastructure
- [ ] Initialize React + TypeScript project (Vite recommended).
- [ ] Set up GitHub Actions for automated deployment to GitHub Pages.
- [ ] Configure Supabase project and create `rankings` table.

### Phase 2: Core Engine
- [ ] Implement `useGameLoop` hook using `requestAnimationFrame`.
- [ ] Physics engine: Gravity, velocity, and basic collision detection.
- [ ] Character controller: Horizontal movement (Arrow keys) and automatic jumping on platform collision.

### Phase 3: Content & Logic
- [ ] Platform generation algorithm (infinite scroll).
- [ ] Platform types (Spring, Cracked, Moving).
- [ ] Item system and power-up effects (Helicopter, Magnet).

### Phase 4: UI & Progression
- [ ] Main Menu, Pause Menu (ESC), and HUD (Score/Coins).
- [ ] Character selection shop.
- [ ] Dynamic background parallax effect.

### Phase 5: Database Integration
- [ ] Fetch and display Top 10 rankings.
- [ ] Submit score to Supabase upon Game Over.

## 5. Verification & Testing
- Performance check on mobile and desktop browsers.
- Collision accuracy testing.
- Ranking submission integrity.

---

## DB Recommendation Details: Supabase
For a GitHub Pages deployment, Supabase is the best "simple" option:
1. **Setup**: Create a project at [supabase.com](https://supabase.com).
2. **Table**: Create a `rankings` table with `id`, `username`, `score`, and `created_at`.
3. **Security**: Use Row Level Security (RLS) to allow public reading but restricted writing (or simple API key usage for a dev project).
4. **Integration**: `npm install @supabase/supabase-js`.
