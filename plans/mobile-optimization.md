# Plan: Mobile Optimization and Control Fix

Optimize the game for mobile screens by making the resolution responsive and fixing the on-screen control buttons.

## Objective
1. Make the game canvas and UI overlay fill the screen properly on mobile devices.
2. Ensure mobile control buttons are functional and responsive to touch.

## Key Files & Context
- `src/App.css`: Styling for layout, canvas, and UI components.
- `src/App.tsx`: Layout structure and touch event handlers for mobile controls.
- `src/components/GameCanvas.tsx`: Canvas rendering and style.
- `src/game/constants.ts`: Game dimensions (400x600).

## Implementation Steps

### 1. Responsive CSS Updates
- Modify `.game-container` to handle full-screen layout on mobile.
- Update `canvas` and `.ui-overlay` to scale proportionally while maintaining the 400:600 aspect ratio.
- Use `vh` and `vw` units to ensure the game fits within any screen size.
- Ensure `.mobile-controls` and `.control-btn` are accessible and have proper `z-index`.

### 2. Fix Mobile Controls in App.tsx
- Review and improve touch event handlers.
- Ensure `setMobileMove` is called correctly on both touch and mouse events for cross-device compatibility.
- Remove `e.preventDefault()` if it's causing issues, or ensure it's only applied to relevant events to prevent side effects like blocking button clicks.

### 3. Verification & Testing
- Test on different viewport sizes using browser dev tools.
- Verify touch events trigger movement in the game loop.
- Confirm UI elements scale correctly and remain interactive.

## Changes

### src/App.css
- Update `.game-container` to `padding: 0; overflow: hidden; height: 100vh;`.
- Update `.ui-overlay` to use `width: 100%; height: 100%; max-width: 400px; max-height: 600px;`.
- Add media queries for small screens to ensure the canvas scales down correctly.
- Ensure `.mobile-controls` is always at the bottom of the visible area.

### src/App.tsx
- Wrap the game in a responsive wrapper if necessary.
- Fix the touch handlers for `left` and `right` buttons.

### src/components/GameCanvas.tsx
- Adjust canvas style for responsiveness (e.g., `width: 100%; height: auto; max-width: 400px;`).
