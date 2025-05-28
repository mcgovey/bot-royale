# Bot Royale 🤖⚔️

A real-time 3D combat game where players design custom robots and battle in dynamic arenas. Built with React, Three.js, Node.js, and Socket.io.

## 🎮 Game Features

### Core Gameplay
- **Real-time 3D Combat** - Physics-based battles with projectile trajectories
- **Bot Customization** - Modular system with chassis, weapons, and utilities
- **Multiplayer Battles** - 1v1 quick matches and tournament modes
- **Strategic Depth** - Energy management, heat mechanics, and tactical positioning

### Bot Building System
- **3 Chassis Types**: Light (speed), Medium (balanced), Heavy (armor)
- **Diverse Weapons**: Laser cannons, missile launchers, plasma rifles, rail guns
- **Defensive Modules**: Energy shields, armor plating, stealth cloaks
- **Utility Systems**: Boost thrusters, repair nanobots, scanner arrays

### Game Modes
- **Quick Match** - Fast 1v1 battles (2-3 minutes)
- **Ranked Ladder** - Skill-based progression
- **Tournament Mode** - Bracket competitions
- **Practice Arena** - AI opponents for training

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm 9+

### Installation & Development

```bash
# Clone the repository
git clone <repository-url>
cd bot-royale

# Install all dependencies
npm install
cd client && npm install
cd ../server && npm install
cd ..

# Start development servers (both client and server)
npm run dev
```

The game will be available at:
- **Client**: http://localhost:3000
- **Server**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## 🏗️ Project Structure

```
bot-royale/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── game/          # Game logic and 3D scenes
│   │   ├── store/         # Zustand state management
│   │   ├── types/         # TypeScript type definitions
│   │   └── __tests__/     # Client tests
├── server/                # Node.js backend
│   ├── src/
│   │   ├── game/          # Game logic (Battle, GameManager)
│   │   ├── services/      # Business logic (Player, Matchmaking)
│   │   ├── socket/        # Socket.io handlers
│   │   ├── types/         # TypeScript type definitions
│   │   ├── utils/         # Utilities (logger)
│   │   └── __tests__/     # Server tests
└── shared/                # Shared type definitions (legacy)
```

## 🛠️ Available Scripts

### Root Level
```bash
npm run dev              # Start both client and server in development
npm run build            # Build both client and server for production
npm run test             # Run all tests (client and server)
npm run test:compile     # Test compilation without errors
```

### Server
```bash
cd server
npm run dev              # Start server in development mode
npm run build            # Compile TypeScript to JavaScript
npm run test             # Run server tests
```

### Client
```bash
cd client
npm run dev              # Start React development server
npm run build            # Build for production
npm run test             # Run client tests
```

## 🧪 Testing

The project includes comprehensive tests to prevent compilation and import issues:

```bash
# Run all tests
npm run test

# Test only server imports and logic
npm run test:server

# Test only client imports and components
npm run test:client

# Verify everything compiles correctly
npm run test:compile
```

## 🔧 Technical Architecture

### Frontend
- **React 18** with TypeScript
- **Three.js/React Three Fiber** for 3D graphics (not implemented yet)
- **Zustand** for state management
- **Framer Motion** for animations
- **Custom CSS** (utility-first approach) - move to Tailwind CSS in future
- **Socket.io Client** for real-time communication

### Backend
- **Node.js/Express** server
- **Socket.io** for real-time multiplayer
- **Winston** for logging
- **TypeScript** for type safety
- **Jest** for testing

### Game Systems
- **Battle Management**: Real-time physics simulation
- **Matchmaking**: Skill-based queue system
- **Player Management**: Authentication and statistics
- **Bot Configuration**: Modular component system

## 🚨 Recent Fixes Applied

### ✅ Compilation Issues Resolved
1. **Import Path Problems**: Fixed client/server shared type imports
2. **Missing Dependencies**: Added required TypeScript definitions
3. **Tailwind CSS Conflicts**: Replaced with vanilla CSS utilities
4. **TypeScript Configuration**: Simplified tsconfig.json files
5. **Missing Scripts**: Added "dev" script to client package.json

### ✅ Test Infrastructure Added
- Import validation tests for both client and server
- Compilation verification tests
- Type export validation
- Continuous integration ready test structure

## 🔮 Future Development Recommendations

### High Priority
1. **Server Entry Point**: Create complete server implementation
   - Add database integration (PostgreSQL)
   - Implement user authentication
   - Add Redis for session management

2. **3D Rendering**: Implement Three.js components
   - Replace emoji placeholders with 3D models
   - Add proper arena environments
   - Implement real-time bot animations

3. **Game Logic Enhancement**
   - Complete physics engine integration
   - Add collision detection system
   - Implement weapon effects and projectiles

### Medium Priority
4. **UI/UX Improvements**
   - Add loading states and error handling
   - Implement responsive design
   - Add sound effects and music

5. **Feature Completion**
   - Tournament system implementation
   - Leaderboards and statistics
   - Bot save/load functionality
   - Spectator mode

6. **Performance Optimization**
   - Add caching strategies
   - Optimize WebSocket usage
   - Implement delta compression for game state

### Low Priority
7. **Advanced Features**
   - Battle replays system
   - AI opponents with different difficulty levels
   - Custom arena creation
   - Clan/team system

8. **DevOps & Production**
   - Docker containerization
   - CI/CD pipeline setup
   - Production environment configuration
   - Monitoring and analytics

## 📋 Current Status

### ✅ Working
- ✅ Project compiles successfully (client + server)
- ✅ Development environment setup
- ✅ Basic component structure
- ✅ Type safety throughout
- ✅ Test infrastructure
- ✅ Socket.io communication framework
- ✅ Bot builder UI components
- ✅ Game state management

### 🚧 In Progress / Needs Work
- 🚧 3D rendering implementation
- 🚧 Real-time battle mechanics
- 🚧 Database integration
- 🚧 User authentication
- 🚧 Complete server endpoints

### ❌ Not Implemented
- ❌ Actual 3D bot models
- ❌ Physics simulation
- ❌ User registration/login
- ❌ Persistent data storage
- ❌ Production deployment

---

**Ready to build your ultimate battle bot? Let the arena battles begin!** 🚀
