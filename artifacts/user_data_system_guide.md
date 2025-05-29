# 💾 BattleBot Arena - User Data & Preferences System Guide

## Overview

BattleBot Arena now has a comprehensive system for saving user information, achievements, and preferences using **Zustand with localStorage persistence**. This guide explains how everything works and how to use it.

## 🗂️ Data Architecture

### Storage Layers

1. **Progression Store** (`battlebot-progression`)
   - Player progression (level, XP, achievements)
   - Mastery trees and combat modifiers
   - Battle pass progress and weekly challenges
   - Battle statistics and recent activity

2. **User Store** (`battlebot-user-data`)
   - Extended user profile and settings
   - Comprehensive preferences (graphics, audio, controls, etc.)
   - Saved bot configurations
   - Session tracking and analytics

3. **Auto-save** (`battlebot-autosave`)
   - Automatic backup of all data every 5 minutes
   - Recovery mechanism for unexpected data loss

## 🎯 What Gets Saved

### User Profile Information
```typescript
// Basic identity and account info
{
  id: "user_abc123",
  username: "PlayerName",
  displayName: "Display Name",
  accountType: "free" | "premium" | "vip",
  memberSince: Date,
  lastActive: Date,
  timezone: "America/New_York",

  // Social features
  isPublic: boolean,
  allowFriendRequests: boolean,
  allowSpectators: boolean,
  friendCode: "ABC12345",

  // Customization
  favoriteColors: ["#00f5ff", "#8b5cf6"],
  title: "Rookie Pilot",
  badge: "first_victory"
}
```

### Comprehensive Preferences
```typescript
// Graphics settings
graphics: {
  quality: "high",
  particles: true,
  shadows: true,
  targetFPS: 60,
  vsync: true
}

// Audio controls
audio: {
  masterVolume: 80,
  musicVolume: 70,
  sfxVolume: 85,
  muteWhenTabInactive: true
}

// Gameplay preferences
gameplay: {
  autoSave: true,
  tutorials: true,
  autoLoadLastBot: true,
  showDamageNumbers: true,
  cameraShake: true
}

// Interface customization
interface: {
  theme: "cyber-blue",
  fontSize: "medium",
  hudScale: 1.0,
  healthBars: "always",
  language: "en"
}

// Accessibility options
accessibility: {
  colorBlindSupport: false,
  colorBlindType: "none",
  highContrast: false,
  reducedMotion: false,
  keyboardNavigation: false
}

// Control bindings
controls: {
  keyboard: {
    moveUp: "KeyW",
    moveDown: "KeyS",
    shoot: "Space",
    special: "KeyE"
  },
  mouse: {
    sensitivity: 1.0,
    invertY: false
  }
}
```

### Achievement & Progression Data
```typescript
// All achievements with progress tracking
achievements: [
  {
    id: "first_blood",
    name: "First Blood",
    description: "Win your first battle",
    isUnlocked: true,
    unlockedAt: Date,
    progress: 1,
    maxProgress: 1,
    rarity: "common"
  }
]

// Mastery progression for all bot components
masteryTrees: {
  chassis: {
    speed: { velocityDemon: { currentLevel: 3, totalXP: 600 } },
    tank: { fortress: { currentLevel: 2, totalXP: 400 } }
  },
  weapons: {
    blaster: { accuracy: { currentLevel: 4, totalXP: 800 } }
  }
}

// Battle pass and seasonal content
battlePass: {
  currentSeason: {
    name: "Cyber Uprising",
    currentTier: 15,
    currentXP: 15000
  },
  rewards: [...],
  isPremium: false
}
```

### Saved Bot Configurations
```typescript
savedBots: [
  {
    id: "bot_123456",
    name: "Speed Demon",
    chassis: "speed",
    weapon: "blaster",
    special: "speed_boost",
    primaryColor: "#00ff88",
    secondaryColor: "#8b5cf6",
    createdAt: Date,
    lastUsed: Date,
    battleCount: 25,
    winRate: 76.0,
    isFavorite: true,
    tags: ["fast", "aggressive"]
  }
]
```

### Statistics & Analytics
```typescript
stats: {
  totalPlayTime: 7200, // seconds
  sessionsPlayed: 15,
  totalBattlesPlayed: 45,
  totalBattlesWon: 32,
  winRate: 71.1,
  totalDamageDealt: 12450,
  accuracy: 68.5,
  longestWinStreak: 8,
  perfectVictories: 3
}
```

## 🔧 How to Use the System

### 1. Access User Store
```typescript
import { useUserStore } from '../store/userStore';

// In a component
const userStore = useUserStore();

// Update profile
userStore.updateProfile({
  displayName: "New Display Name",
  bio: "I love robot battles!"
});

// Update preferences
userStore.updatePreferences('graphics', {
  quality: 'ultra',
  particles: true
});

// Save a bot configuration
const botId = userStore.saveBotConfiguration({
  name: "My Speed Bot",
  chassis: "speed",
  weapon: "blaster",
  special: "speed_boost",
  primaryColor: "#ff0000",
  secondaryColor: "#0000ff",
  tags: ["custom", "fast"]
});
```

### 2. Access Progression Store
```typescript
import { useProgressionStore } from '../store/progressionStore';

// In a component
const progression = useProgressionStore();

// Record gameplay events
progression.recordProgressionEvent({
  type: 'battle_won',
  timestamp: new Date(),
  data: {
    chassisUsed: ChassisType.SPEED,
    weaponUsed: WeaponType.BLASTER,
    isPerfect: true
  }
});

// Get combat modifiers based on mastery
const modifiers = progression.getCombatModifiers(
  ChassisType.SPEED,
  WeaponType.BLASTER,
  SpecialType.SPEED_BOOST
);
```

### 3. Data Management
```typescript
import { exportToFile, importFromFile, autoSaveManager } from '../utils/dataManager';

// Export all data to file
exportToFile('my-battlebot-data.json');

// Import data from file
const success = await importFromFile();

// Start auto-save (every 5 minutes)
autoSaveManager.start(5);

// Check if auto-save exists
if (autoSaveManager.hasAutoSave()) {
  const restored = autoSaveManager.restoreFromAutoSave();
}
```

### 4. Settings Panel Integration
```typescript
import SettingsPanel from '../components/SettingsPanel';

// In your app component
const [showSettings, setShowSettings] = useState(false);

return (
  <>
    <button onClick={() => setShowSettings(true)}>
      Settings
    </button>

    {showSettings && (
      <SettingsPanel onClose={() => setShowSettings(false)} />
    )}
  </>
);
```

## 🔄 Automatic Features

### Session Tracking
```typescript
// Automatically tracks when users start/end sessions
const session = {
  sessionId: "session_123",
  startTime: new Date(),
  battlesPlayed: 5,
  xpEarned: 250,
  achievementsUnlocked: ["first_blood"],
  deviceInfo: {
    platform: "MacIntel",
    browser: "Chrome",
    screenResolution: "1920x1080"
  }
};
```

### Auto-Save System
- Saves every 5 minutes (configurable)
- Respects user preference settings
- Creates recovery backups
- Logs save activity to console

### Data Persistence
- **Zustand Persist**: Automatically saves to localStorage
- **Version Migration**: Handles data structure updates
- **Error Recovery**: Graceful fallbacks for corrupted data
- **Size Monitoring**: Tracks localStorage usage

## 📱 Usage Examples

### Complete User Setup Flow
```typescript
// 1. Initialize user session
const userStore = useUserStore();
userStore.startSession();

// 2. Set up user profile
userStore.updateProfile({
  username: "RobotMaster",
  displayName: "The Robot Master",
  bio: "Competitive bot battler",
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
});

// 3. Configure preferences
userStore.updatePreferences('graphics', {
  quality: 'high',
  particles: true,
  shadows: true
});

userStore.updatePreferences('audio', {
  masterVolume: 80,
  musicVolume: 60,
  sfxVolume: 90
});

// 4. Save favorite bot
const botId = userStore.saveBotConfiguration({
  name: "Lightning Strike",
  chassis: "speed",
  weapon: "blaster",
  special: "speed_boost",
  primaryColor: "#ffff00",
  secondaryColor: "#ff8800",
  tags: ["favorite", "tournament"]
});

userStore.setFavoriteBot(botId, true);
```

### Game Session Integration
```typescript
// During battle
const progression = useProgressionStore();

// Record damage dealt
progression.recordProgressionEvent({
  type: 'damage_dealt',
  timestamp: new Date(),
  data: {
    damage: 75,
    weaponUsed: WeaponType.CANNON,
    chassisUsed: ChassisType.TANK
  }
});

// Battle completed
progression.recordProgressionEvent({
  type: 'battle_completed',
  timestamp: new Date(),
  data: {
    isVictory: true,
    isPerfect: false,
    battleDuration: 120,
    chassisUsed: ChassisType.TANK,
    weaponUsed: WeaponType.CANNON,
    specialUsed: SpecialType.SHIELD
  }
});

// Get updated combat modifiers
const modifiers = progression.getCombatModifiers(
  ChassisType.TANK,
  WeaponType.CANNON,
  SpecialType.SHIELD
);

// Apply to bot stats
const enhancedHealth = baseHealth * modifiers.healthMultiplier;
const enhancedDamage = baseDamage * modifiers.damageMultiplier;
```

## 🛡️ Privacy & Security

### Data Privacy
- **Local Storage Only**: All data stays on user's device
- **No Server Transmission**: Zero data sent to external servers
- **User Control**: Full export/import/delete capabilities
- **Opt-out Options**: Granular privacy controls

### Security Features
- **Data Validation**: Input sanitization and type checking
- **Version Control**: Migration system prevents data corruption
- **Backup System**: Multiple recovery options
- **Size Limits**: Prevents localStorage overflow

## 🚀 Advanced Features

### Cloud Sync (Future)
```typescript
// Framework ready for cloud integration
interface CloudSyncService {
  upload: (data: BackupData) => Promise<{success: boolean, cloudId?: string}>;
  download: (cloudId: string) => Promise<{success: boolean, data?: BackupData}>;
  list: () => Promise<{success: boolean, backups?: BackupInfo[]}>;
}
```

### Data Analytics
```typescript
// Session analytics
const stats = userStore.stats;
const formattedStats = userUtils.formatUserStats(stats);

console.log(`Win Rate: ${formattedStats.winRate}`);
console.log(`Play Time: ${formattedStats.playTimeFormatted}`);
console.log(`Accuracy: ${formattedStats.accuracy}`);
```

### Notification System
```typescript
// Customizable notification preferences
userStore.updateNotificationPreference('achievement', {
  enabled: true,
  method: 'popup',
  frequency: 'immediate'
});

userStore.updateNotificationPreference('levelUp', {
  enabled: true,
  method: 'banner',
  frequency: 'immediate'
});
```

## 📊 Data Structure Summary

```
battlebot-progression (localStorage)
├── profile (level, XP, battles, wins)
├── statistics (detailed battle stats)
├── masteryTrees (chassis/weapon/special progression)
├── achievements (unlocked status & progress)
├── battlePass (seasonal progression)
├── weeklyChallenges (rotating objectives)
└── recentXPGains (activity feed)

battlebot-user-data (localStorage)
├── profile (identity, social, customization)
├── preferences (graphics, audio, gameplay, UI, accessibility, controls, privacy)
├── stats (session analytics, play time)
├── savedBots (bot configurations with metadata)
├── sessions (play session history)
├── notifications (preference settings)
└── dataManagement (version, sync, size tracking)

battlebot-autosave (localStorage)
└── Complete backup of both stores every 5 minutes
```

This system provides a robust, privacy-focused solution for saving all user data, preferences, and achievements locally while being prepared for future cloud sync capabilities. Everything is automatically persisted and can be easily exported, imported, or reset as needed.
