// User Settings and Preferences Types

export interface UserPreferences {
  // Graphics & Display
  graphics: {
    quality: 'low' | 'medium' | 'high' | 'ultra';
    particles: boolean;
    shadows: boolean;
    postProcessing: boolean;
    targetFPS: 30 | 60 | 120 | 'unlimited';
    vsync: boolean;
  };

  // Audio Settings
  audio: {
    masterVolume: number; // 0-100
    musicVolume: number;
    sfxVolume: number;
    voiceVolume: number;
    muteWhenTabInactive: boolean;
  };

  // Gameplay Preferences
  gameplay: {
    autoSave: boolean;
    tutorials: boolean;
    confirmations: boolean;
    quickBattle: boolean;
    autoLoadLastBot: boolean;
    showDamageNumbers: boolean;
    cameraShake: boolean;
    inputMethod: 'keyboard' | 'gamepad' | 'hybrid';
  };

  // UI/UX Preferences
  interface: {
    theme: 'cyber-blue' | 'cyber-purple' | 'cyber-green' | 'dark' | 'retro';
    fontSize: 'small' | 'medium' | 'large';
    hudScale: number; // 0.8-1.2
    minimap: boolean;
    healthBars: 'always' | 'damaged' | 'never';
    tooltips: boolean;
    animations: boolean;
    language: 'en' | 'es' | 'fr' | 'de' | 'zh' | 'ja';
  };

  // Accessibility
  accessibility: {
    colorBlindSupport: boolean;
    colorBlindType: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
    highContrast: boolean;
    reducedMotion: boolean;
    screenReader: boolean;
    keyboardNavigation: boolean;
    focusIndicators: boolean;
    textToSpeech: boolean;
  };

  // Privacy & Data
  privacy: {
    dataCollection: boolean;
    analytics: boolean;
    crashReports: boolean;
    personalizedAds: boolean;
    shareProgressWithFriends: boolean;
  };

  // Controls
  controls: {
    keyboard: {
      moveUp: string;
      moveDown: string;
      moveLeft: string;
      moveRight: string;
      shoot: string;
      special: string;
      pause: string;
      cameraPan: string;
    };
    gamepad: {
      enabled: boolean;
      vibration: boolean;
      deadzone: number;
      sensitivity: number;
    };
    mouse: {
      sensitivity: number;
      invertY: boolean;
      smoothing: boolean;
    };
  };
}

export interface ExtendedUserProfile {
  // Basic Info
  id: string;
  username: string;
  displayName?: string;
  email?: string;
  avatar?: string;
  bio?: string;
  pronouns?: string;

  // Account Info
  accountType: 'free' | 'premium' | 'vip';
  memberSince: Date;
  lastActive: Date;
  timezone: string;
  country?: string;

  // Social Features
  friendCode?: string;
  isPublic: boolean;
  allowFriendRequests: boolean;
  allowSpectators: boolean;

  // Customization
  favoriteColors: string[];
  bannerImage?: string;
  title?: string;
  badge?: string;

  // Game-specific
  preferredGameModes: string[];
  defaultBotConfig?: {
    chassis: string;
    weapon: string;
    special: string;
    colors: { primary: string; secondary: string };
  };
}

export interface UserStats {
  // All-time stats
  totalPlayTime: number; // seconds
  sessionsPlayed: number;
  averageSessionLength: number;
  firstSessionDate: Date;

  // Battle-specific
  totalBattlesPlayed: number;
  totalBattlesWon: number;
  totalDamageDealt: number;
  totalShotsHit: number;
  totalShotsFired: number;
  longestWinStreak: number;
  perfectVictories: number;

  // Progression
  totalXPEarned: number;
  achievementsUnlocked: number;
  masteryPointsEarned: number;
  battlePassLevelsCompleted: number;

  // Social
  friendsAdded: number;
  gamesWithFriends: number;
  spectatorViews: number;
}

export interface SavedBotConfiguration {
  id: string;
  name: string;
  chassis: string;
  weapon: string;
  special: string;
  primaryColor: string;
  secondaryColor: string;
  createdAt: Date;
  lastUsed: Date;
  battleCount: number;
  winRate: number;
  isFavorite: boolean;
  tags: string[];
}

export interface UserSession {
  sessionId: string;
  startTime: Date;
  endTime?: Date;
  battlesPlayed: number;
  xpEarned: number;
  achievementsUnlocked: string[];
  deviceInfo: {
    platform: string;
    browser: string;
    screenResolution: string;
  };
}

export interface NotificationPreference {
  type: 'achievement' | 'levelUp' | 'battlePass' | 'friend' | 'challenge' | 'update';
  enabled: boolean;
  method: 'popup' | 'banner' | 'sound' | 'none';
  frequency: 'immediate' | 'batched' | 'daily' | 'weekly';
}

export interface UserData {
  profile: ExtendedUserProfile;
  preferences: UserPreferences;
  stats: UserStats;
  savedBots: SavedBotConfiguration[];
  sessions: UserSession[];
  notifications: NotificationPreference[];

  // Data management
  dataVersion: number;
  lastBackup?: Date;
  cloudSyncEnabled: boolean;
  localDataSize: number; // bytes
}

export interface BackupData {
  userData: UserData;
  progressionData: any; // From progression store
  timestamp: Date;
  version: string;
  compressed: boolean;
}
