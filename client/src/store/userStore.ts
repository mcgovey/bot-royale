import React from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  UserData,
  UserPreferences,
  ExtendedUserProfile,
  UserStats,
  SavedBotConfiguration,
  UserSession,
  NotificationPreference,
  BackupData
} from '../types/user';

// Default user preferences
const defaultPreferences: UserPreferences = {
  graphics: {
    quality: 'high',
    particles: true,
    shadows: true,
    postProcessing: true,
    targetFPS: 60,
    vsync: true
  },
  audio: {
    masterVolume: 80,
    musicVolume: 70,
    sfxVolume: 85,
    voiceVolume: 75,
    muteWhenTabInactive: true
  },
  gameplay: {
    autoSave: true,
    tutorials: true,
    confirmations: true,
    quickBattle: false,
    autoLoadLastBot: true,
    showDamageNumbers: true,
    cameraShake: true,
    inputMethod: 'keyboard'
  },
  interface: {
    theme: 'cyber-blue',
    fontSize: 'medium',
    hudScale: 1.0,
    minimap: true,
    healthBars: 'always',
    tooltips: true,
    animations: true,
    language: 'en'
  },
  accessibility: {
    colorBlindSupport: false,
    colorBlindType: 'none',
    highContrast: false,
    reducedMotion: false,
    screenReader: false,
    keyboardNavigation: false,
    focusIndicators: false,
    textToSpeech: false
  },
  privacy: {
    dataCollection: true,
    analytics: true,
    crashReports: true,
    personalizedAds: false,
    shareProgressWithFriends: true
  },
  controls: {
    keyboard: {
      moveUp: 'KeyW',
      moveDown: 'KeyS',
      moveLeft: 'KeyA',
      moveRight: 'KeyD',
      shoot: 'Space',
      special: 'KeyE',
      pause: 'Escape',
      cameraPan: 'ShiftLeft'
    },
    gamepad: {
      enabled: false,
      vibration: true,
      deadzone: 0.15,
      sensitivity: 1.0
    },
    mouse: {
      sensitivity: 1.0,
      invertY: false,
      smoothing: true
    }
  }
};

// Generate unique user ID
function generateUserId(): string {
  return 'user_' + Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// Get browser/device info
function getDeviceInfo() {
  return {
    platform: navigator.platform,
    browser: navigator.userAgent.split(' ').pop() || 'Unknown',
    screenResolution: `${screen.width}x${screen.height}`
  };
}

// Initialize default user data
function initializeUserData(): UserData {
  const now = new Date();
  const userId = generateUserId();

  return {
    profile: {
      id: userId,
      username: `Player${userId.slice(-6)}`,
      accountType: 'free',
      memberSince: now,
      lastActive: now,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      isPublic: false,
      allowFriendRequests: true,
      allowSpectators: true,
      favoriteColors: ['#00f5ff', '#8b5cf6'],
      preferredGameModes: ['practice']
    },
    preferences: defaultPreferences,
    stats: {
      totalPlayTime: 0,
      sessionsPlayed: 0,
      averageSessionLength: 0,
      firstSessionDate: now,
      totalBattlesPlayed: 0,
      totalBattlesWon: 0,
      totalDamageDealt: 0,
      totalShotsHit: 0,
      totalShotsFired: 0,
      longestWinStreak: 0,
      perfectVictories: 0,
      totalXPEarned: 0,
      achievementsUnlocked: 0,
      masteryPointsEarned: 0,
      battlePassLevelsCompleted: 0,
      friendsAdded: 0,
      gamesWithFriends: 0,
      spectatorViews: 0
    },
    savedBots: [],
    sessions: [],
    notifications: [
      { type: 'achievement', enabled: true, method: 'popup', frequency: 'immediate' },
      { type: 'levelUp', enabled: true, method: 'banner', frequency: 'immediate' },
      { type: 'battlePass', enabled: true, method: 'popup', frequency: 'immediate' },
      { type: 'friend', enabled: true, method: 'banner', frequency: 'immediate' },
      { type: 'challenge', enabled: false, method: 'banner', frequency: 'daily' },
      { type: 'update', enabled: true, method: 'banner', frequency: 'immediate' }
    ],
    dataVersion: 1,
    cloudSyncEnabled: false,
    localDataSize: 0
  };
}

interface UserStore extends UserData {
  // Session Management
  currentSession: UserSession | null;
  startSession: () => void;
  endSession: () => void;

  // Profile Management
  updateProfile: (updates: Partial<ExtendedUserProfile>) => void;
  updatePreferences: (category: keyof UserPreferences, updates: any) => void;
  updateStats: (updates: Partial<UserStats>) => void;

  // Bot Configuration Management
  saveBotConfiguration: (config: Omit<SavedBotConfiguration, 'id' | 'createdAt' | 'lastUsed' | 'battleCount' | 'winRate'>) => string;
  updateBotConfiguration: (id: string, updates: Partial<SavedBotConfiguration>) => void;
  deleteBotConfiguration: (id: string) => void;
  getBotConfiguration: (id: string) => SavedBotConfiguration | undefined;
  setFavoriteBot: (id: string, isFavorite: boolean) => void;

  // Notification Management
  updateNotificationPreference: (type: NotificationPreference['type'], updates: Partial<NotificationPreference>) => void;

  // Data Management
  exportUserData: () => BackupData;
  importUserData: (backup: BackupData) => boolean;
  clearUserData: () => void;
  calculateDataSize: () => number;

  // Utility
  isFirstTimeUser: () => boolean;
  getDaysPlayed: () => number;
  getPlayTimeFormatted: () => string;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      // Initialize with default data
      ...initializeUserData(),
      currentSession: null,

      // Session Management
      startSession: () => {
        const session: UserSession = {
          sessionId: `session_${Date.now()}`,
          startTime: new Date(),
          battlesPlayed: 0,
          xpEarned: 0,
          achievementsUnlocked: [],
          deviceInfo: getDeviceInfo()
        };

        set({
          currentSession: session,
          profile: {
            ...get().profile,
            lastActive: new Date()
          },
          stats: {
            ...get().stats,
            sessionsPlayed: get().stats.sessionsPlayed + 1
          }
        });
      },

      endSession: () => {
        const current = get().currentSession;
        if (!current) return;

        const endTime = new Date();
        const sessionLength = (endTime.getTime() - current.startTime.getTime()) / 1000;

        const completedSession: UserSession = {
          ...current,
          endTime
        };

        const currentStats = get().stats;
        const newTotalPlayTime = currentStats.totalPlayTime + sessionLength;
        const newAverageSessionLength = newTotalPlayTime / currentStats.sessionsPlayed;

        set({
          currentSession: null,
          sessions: [completedSession, ...get().sessions.slice(0, 49)], // Keep last 50 sessions
          stats: {
            ...currentStats,
            totalPlayTime: newTotalPlayTime,
            averageSessionLength: newAverageSessionLength
          }
        });
      },

      // Profile Management
      updateProfile: (updates: Partial<ExtendedUserProfile>) => {
        set({
          profile: {
            ...get().profile,
            ...updates,
            lastActive: new Date()
          }
        });
      },

      updatePreferences: (category: keyof UserPreferences, updates: any) => {
        set({
          preferences: {
            ...get().preferences,
            [category]: {
              ...get().preferences[category],
              ...updates
            }
          }
        });
      },

      updateStats: (updates: Partial<UserStats>) => {
        set({
          stats: {
            ...get().stats,
            ...updates
          }
        });
      },

      // Bot Configuration Management
      saveBotConfiguration: (config: Omit<SavedBotConfiguration, 'id' | 'createdAt' | 'lastUsed' | 'battleCount' | 'winRate'>) => {
        const id = `bot_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        const newBot: SavedBotConfiguration = {
          ...config,
          id,
          createdAt: new Date(),
          lastUsed: new Date(),
          battleCount: 0,
          winRate: 0,
          isFavorite: false,
          tags: config.tags || []
        };

        set({
          savedBots: [newBot, ...get().savedBots]
        });

        return id;
      },

      updateBotConfiguration: (id: string, updates: Partial<SavedBotConfiguration>) => {
        set({
          savedBots: get().savedBots.map(bot =>
            bot.id === id
              ? { ...bot, ...updates, lastUsed: new Date() }
              : bot
          )
        });
      },

      deleteBotConfiguration: (id: string) => {
        set({
          savedBots: get().savedBots.filter(bot => bot.id !== id)
        });
      },

      getBotConfiguration: (id: string) => {
        return get().savedBots.find(bot => bot.id === id);
      },

      setFavoriteBot: (id: string, isFavorite: boolean) => {
        set({
          savedBots: get().savedBots.map(bot =>
            bot.id === id ? { ...bot, isFavorite } : bot
          )
        });
      },

      // Notification Management
      updateNotificationPreference: (type: NotificationPreference['type'], updates: Partial<NotificationPreference>) => {
        set({
          notifications: get().notifications.map(notification =>
            notification.type === type
              ? { ...notification, ...updates }
              : notification
          )
        });
      },

      // Data Management
      exportUserData: () => {
        const userData = get();
        const { currentSession, ...exportData } = userData;

        return {
          userData: exportData,
          progressionData: null, // This would be filled by the progression store
          timestamp: new Date(),
          version: '1.0.0',
          compressed: false
        };
      },

      importUserData: (backup: BackupData) => {
        try {
          const { userData } = backup;
          set({
            ...userData,
            profile: {
              ...userData.profile,
              lastActive: new Date()
            },
            dataVersion: Math.max(get().dataVersion, userData.dataVersion || 1)
          });
          return true;
        } catch (error) {
          console.error('Failed to import user data:', error);
          return false;
        }
      },

      clearUserData: () => {
        set(initializeUserData());
      },

      calculateDataSize: () => {
        const data = JSON.stringify(get());
        const size = new Blob([data]).size;
        set({ localDataSize: size });
        return size;
      },

      // Utility functions
      isFirstTimeUser: () => {
        const stats = get().stats;
        return stats.sessionsPlayed <= 1 && stats.totalPlayTime < 300; // Less than 5 minutes played
      },

      getDaysPlayed: () => {
        const firstSession = get().stats.firstSessionDate;
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - firstSession.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      },

      getPlayTimeFormatted: () => {
        const totalSeconds = get().stats.totalPlayTime;
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);

        if (hours > 0) {
          return `${hours}h ${minutes}m`;
        } else {
          return `${minutes}m`;
        }
      }
    }),
    {
      name: 'battlebot-user-data',
      version: 1,
      // Migrate function for handling version changes
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          // Handle migration from version 0 to 1
          return {
            ...persistedState,
            dataVersion: 1
          };
        }
        return persistedState;
      }
    }
  )
);

// Hook for managing user session lifecycle
export const useUserSession = () => {
  const { startSession, endSession, currentSession } = useUserStore();

  // Auto-start session when component mounts
  React.useEffect(() => {
    if (!currentSession) {
      startSession();
    }

    // Auto-end session when page unloads
    const handleBeforeUnload = () => {
      endSession();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      endSession();
    };
  }, [currentSession, startSession, endSession]);

  return { currentSession };
};

// Export helper functions
export const userUtils = {
  // Format user statistics for display
  formatUserStats: (stats: UserStats) => ({
    winRate: stats.totalBattlesPlayed > 0 ? (stats.totalBattlesWon / stats.totalBattlesPlayed * 100).toFixed(1) + '%' : '0%',
    accuracy: stats.totalShotsFired > 0 ? (stats.totalShotsHit / stats.totalShotsFired * 100).toFixed(1) + '%' : '0%',
    averageDamage: stats.totalBattlesPlayed > 0 ? Math.round(stats.totalDamageDealt / stats.totalBattlesPlayed) : 0,
    playTimeFormatted: (() => {
      const hours = Math.floor(stats.totalPlayTime / 3600);
      const minutes = Math.floor((stats.totalPlayTime % 3600) / 60);
      return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    })()
  }),

  // Validate username
  validateUsername: (username: string): { valid: boolean; error?: string } => {
    if (username.length < 3) return { valid: false, error: 'Username must be at least 3 characters' };
    if (username.length > 20) return { valid: false, error: 'Username must be less than 20 characters' };
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) return { valid: false, error: 'Username can only contain letters, numbers, underscores, and hyphens' };
    return { valid: true };
  },

  // Generate friend code
  generateFriendCode: (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
};
