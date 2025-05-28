# BattleBot Arena - Simplified Core Game

A streamlined 2D bot battle game focusing on two essential modes: **Bot Builder** and **Battle Arena**.

## 🎮 Game Overview

**BattleBot Arena** is a simplified combat game where players design custom robots and watch them fight autonomously against AI opponents. The game emphasizes strategic bot configuration over complex controls.

## 🚀 Key Features

### Two Core Modes
1. **Bot Builder Mode** - Design and customize your battle bot
2. **Battle Arena Mode** - Watch your bot fight against AI opponents

### Simple Bot Components
- **3 Chassis Types**: Speed (fast/fragile), Tank (slow/durable), Balanced (medium stats)
- **3 Weapon Types**: Blaster (fast/weak), Cannon (slow/strong), Shotgun (medium/short range)
- **3 Special Abilities**: Shield, Speed Boost, Repair

### Memory-Optimized Architecture
- **No complex 3D rendering** - Uses simple 2D canvas for battles
- **No heavy dependencies** - Removed Three.js, Framer Motion, Zustand
- **Simple state management** - Uses React's built-in useState
- **Autonomous AI combat** - No complex input handling or physics

## 🛠 Technical Stack

- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **HTML5 Canvas** for 2D battle visualization
- **Simple AI** for autonomous bot combat

## 🏃‍♂️ Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation
```bash
# Install dependencies
cd client && npm install

# Start development server
npm run dev
```

### Testing
```bash
# Run comprehensive memory leak tests
node test-simplified-game.js
```

## 🎯 Game Flow

1. **Start in Bot Builder** - Choose chassis, weapon, special ability, and colors
2. **Click "Battle!"** - Transition to Battle Arena
3. **Watch the Fight** - Bots fight autonomously using simple AI
4. **Return to Builder** - Modify your bot and try again

## 🧪 Memory Safety

This simplified version addresses previous memory issues by:

- **Removing complex 3D rendering** that caused GPU memory leaks
- **Eliminating heavy animation libraries** that accumulated memory
- **Using simple canvas rendering** instead of WebGL
- **Implementing proper cleanup** for intervals and animation frames
- **Avoiding complex state management** that could cause infinite loops

## 🔧 Architecture Decisions

### Simplified State Management
- Uses React's `useState` instead of complex stores
- Props-based communication between components
- No global state management to avoid memory leaks

### 2D Canvas Rendering
- Simple 2D canvas instead of Three.js WebGL
- Lightweight bot visualization with circles and health bars
- Proper animation frame cleanup to prevent memory leaks

### Autonomous Combat
- Bots fight automatically using simple AI
- No complex input handling or physics simulation
- Deterministic combat with clear visual feedback

## 📊 Performance Monitoring

The included Puppeteer test suite monitors:
- Memory usage over time
- Infinite loop detection
- Component transition reliability
- Battle simulation stability

Run tests with: `node test-simplified-game.js`

## 🎨 Customization

Players can customize:
- Bot name
- Primary and secondary colors
- Component selection (chassis, weapon, special)

## 🏆 Future Enhancements

Once the core is stable:
- Additional bot components
- More arena layouts
- Cosmetic unlocks
- Simple progression system

## 🐛 Troubleshooting

If you experience memory issues:
1. Check browser dev tools for memory usage
2. Run the Puppeteer test suite
3. Ensure all intervals and animation frames are properly cleaned up
4. Verify no infinite loops in React components
