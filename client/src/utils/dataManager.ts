import { useUserStore } from '../store/userStore';
import { useProgressionStore } from '../store/progressionStore';
import { BackupData } from '../types/user';

// Data compression utility
export const compressData = (data: any): string => {
  try {
    const jsonString = JSON.stringify(data);
    // Simple compression - in a real app you might use LZ-string or similar
    return btoa(jsonString);
  } catch (error) {
    console.error('Failed to compress data:', error);
    return JSON.stringify(data);
  }
};

export const decompressData = (compressedData: string): any => {
  try {
    const jsonString = atob(compressedData);
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Failed to decompress data:', error);
    return JSON.parse(compressedData);
  }
};

// Complete backup creation
export const createFullBackup = (): BackupData => {
  const userStore = useUserStore.getState();
  const progressionStore = useProgressionStore.getState();

  const userData = userStore.exportUserData();

  return {
    userData: userData.userData,
    progressionData: {
      profile: progressionStore.profile,
      statistics: progressionStore.statistics,
      masteryTrees: progressionStore.masteryTrees,
      achievements: progressionStore.achievements,
      battlePass: progressionStore.battlePass,
      weeklyChallenges: progressionStore.weeklyChallenges,
      recentXPGains: progressionStore.recentXPGains,
      unlockedCosmetics: progressionStore.unlockedCosmetics,
      unlockedTitles: progressionStore.unlockedTitles
    },
    timestamp: new Date(),
    version: '1.0.0',
    compressed: false
  };
};

// Export data as downloadable file
export const exportToFile = (filename?: string) => {
  const backup = createFullBackup();
  const dataStr = JSON.stringify(backup, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `battlebot-backup-${new Date().toISOString().split('T')[0]}.json`;

  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up
  URL.revokeObjectURL(url);
};

// Import data from file
export const importFromFile = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        resolve(false);
        return;
      }

      try {
        const text = await file.text();
        const backup: BackupData = JSON.parse(text);

        // Validate backup structure
        if (!backup.userData || !backup.progressionData) {
          throw new Error('Invalid backup file structure');
        }

        // Import user data
        const userStore = useUserStore.getState();
        const userImportSuccess = userStore.importUserData(backup);

        // Import progression data
        const progressionStore = useProgressionStore.getState();
        progressionStore.resetProgress();

        // Set progression data (you'd need to add an import method to progression store)
        // For now, we'll manually set the data
        Object.assign(progressionStore, backup.progressionData);

        resolve(userImportSuccess);
      } catch (error) {
        console.error('Failed to import data:', error);
        resolve(false);
      }
    };

    input.click();
  });
};

// Cloud sync preparation (for future implementation)
export interface CloudSyncService {
  upload: (data: BackupData) => Promise<{ success: boolean; cloudId?: string; error?: string }>;
  download: (cloudId: string) => Promise<{ success: boolean; data?: BackupData; error?: string }>;
  list: () => Promise<{ success: boolean; backups?: Array<{ id: string; timestamp: Date; size: number }>; error?: string }>;
  delete: (cloudId: string) => Promise<{ success: boolean; error?: string }>;
}

// Mock cloud service (replace with real implementation)
export const mockCloudService: CloudSyncService = {
  upload: async (data: BackupData) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true, cloudId: `cloud_${Date.now()}` };
  },

  download: async (cloudId: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: false, error: 'Cloud service not implemented' };
  },

  list: async () => {
    return { success: false, error: 'Cloud service not implemented' };
  },

  delete: async (cloudId: string) => {
    return { success: false, error: 'Cloud service not implemented' };
  }
};

// Auto-save functionality
export class AutoSaveManager {
  private interval: NodeJS.Timeout | null = null;
  private lastSave: Date | null = null;

  start(intervalMinutes: number = 5) {
    this.stop(); // Clear any existing interval

    this.interval = setInterval(() => {
      this.performAutoSave();
    }, intervalMinutes * 60 * 1000);

    console.log(`Auto-save started with ${intervalMinutes} minute interval`);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      console.log('Auto-save stopped');
    }
  }

  private performAutoSave() {
    try {
      // Check if user preferences allow auto-save
      const userPrefs = useUserStore.getState().preferences;
      if (!userPrefs.gameplay.autoSave) {
        return;
      }

      // Create backup
      const backup = createFullBackup();

      // Store in localStorage with special key for auto-saves
      localStorage.setItem('battlebot-autosave', JSON.stringify(backup));

      this.lastSave = new Date();
      console.log('Auto-save completed at:', this.lastSave.toLocaleTimeString());
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }

  getLastSaveTime(): Date | null {
    return this.lastSave;
  }

  hasAutoSave(): boolean {
    return localStorage.getItem('battlebot-autosave') !== null;
  }

  restoreFromAutoSave(): boolean {
    try {
      const autoSaveData = localStorage.getItem('battlebot-autosave');
      if (!autoSaveData) return false;

      const backup: BackupData = JSON.parse(autoSaveData);

      // Import the auto-saved data
      const userStore = useUserStore.getState();
      return userStore.importUserData(backup);
    } catch (error) {
      console.error('Failed to restore from auto-save:', error);
      return false;
    }
  }
}

// Global auto-save manager instance
export const autoSaveManager = new AutoSaveManager();

// Data validation utilities
export const validateUserData = (data: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.profile || typeof data.profile !== 'object') {
    errors.push('Missing or invalid profile data');
  }

  if (!data.preferences || typeof data.preferences !== 'object') {
    errors.push('Missing or invalid preferences data');
  }

  if (!data.stats || typeof data.stats !== 'object') {
    errors.push('Missing or invalid statistics data');
  }

  if (!Array.isArray(data.savedBots)) {
    errors.push('Missing or invalid saved bots data');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

// Data migration utilities (for version upgrades)
export const migrateUserData = (data: any, fromVersion: number, toVersion: number): any => {
  let migratedData = { ...data };

  // Example migration from version 1 to 2
  if (fromVersion < 2 && toVersion >= 2) {
    // Add new fields, modify structure, etc.
    migratedData.dataVersion = 2;
  }

  return migratedData;
};

// Storage size utilities
export const getStorageUsage = (): { used: number; total: number; percentage: number } => {
  let used = 0;

  // Calculate localStorage usage
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      used += localStorage[key].length + key.length;
    }
  }

  // Most browsers limit localStorage to ~5-10MB
  const total = 5 * 1024 * 1024; // 5MB estimate
  const percentage = (used / total) * 100;

  return { used, total, percentage };
};

export const clearStorageData = (keepUserPreferences: boolean = true): void => {
  const keys = Object.keys(localStorage);

  keys.forEach(key => {
    if (key.startsWith('battlebot-')) {
      if (keepUserPreferences && key === 'battlebot-user-data') {
        // Keep only the preferences
        const userData = JSON.parse(localStorage.getItem(key) || '{}');
        const preferencesOnly = {
          state: {
            preferences: userData.state?.preferences,
            profile: {
              ...userData.state?.profile,
              // Reset stats but keep identity
              totalBattles: 0,
              totalWins: 0,
              totalDamageDealt: 0
            }
          },
          version: userData.version
        };
        localStorage.setItem(key, JSON.stringify(preferencesOnly));
      } else {
        localStorage.removeItem(key);
      }
    }
  });
};
