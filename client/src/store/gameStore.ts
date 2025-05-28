import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import {
  Player,
  BotConfiguration,
  BattleState,
  UIState,
  GameMode,
  ChassisType,
  WeaponType,
  DefensiveModuleType,
  UtilityModuleType,
  Notification,
  PlayerProgress,
  PremiumTier
} from '../types/game';

interface GameStore {
  // Player State
  player: Player | null;
  playerProgress: PlayerProgress | null;
  premiumTier: PremiumTier;

  // Bot Builder State
  currentBotConfig: BotConfiguration | null;
  savedBotConfigs: BotConfiguration[];

  // Battle State
  currentBattle: BattleState | null;
  isInBattle: boolean;

  // UI State
  uiState: UIState;

  // Matchmaking State
  isMatchmaking: boolean;
  matchmakingMode: GameMode | null;
  estimatedWaitTime: number;

  // Connection State
  isConnected: boolean;
  connectionError: string | null;

  // Actions
  setPlayer: (player: Player) => void;
  setPlayerProgress: (progress: PlayerProgress) => void;
  setPremiumTier: (tier: PremiumTier) => void;

  // Bot Builder Actions
  setBotConfig: (config: BotConfiguration) => void;
  saveBotConfig: (config: BotConfiguration) => void;
  loadBotConfig: (configId: string) => void;
  deleteBotConfig: (configId: string) => void;

  // Battle Actions
  setBattleState: (battle: BattleState) => void;
  joinBattle: (battleId: string) => void;
  leaveBattle: () => void;

  // UI Actions
  setCurrentScreen: (screen: UIState['currentScreen']) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | undefined) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;

  // Matchmaking Actions
  startMatchmaking: (mode: GameMode) => void;
  cancelMatchmaking: () => void;
  setEstimatedWaitTime: (time: number) => void;

  // Connection Actions
  setConnected: (connected: boolean) => void;
  setConnectionError: (error: string | null) => void;

  // Utility Actions
  reset: () => void;
}

const initialUIState: UIState = {
  currentScreen: 'menu',
  isLoading: false,
  error: undefined,
  notifications: []
};

const createDefaultBotConfig = (): BotConfiguration => ({
  id: 'default',
  name: 'Default Bot',
  chassis: {
    id: 'chassis_1',
    type: ChassisType.MEDIUM,
    stats: {
      health: 150,
      armor: 25,
      speed: 6.0,
      weaponSlots: 4,
      energyCapacity: 150,
      mass: 100
    }
  },
  weapons: [
    {
      id: 'weapon_1',
      type: WeaponType.LASER_CANNON,
      position: { x: 0, y: 0, z: 2 },
      stats: {
        damage: 25,
        range: 100,
        fireRate: 3.0,
        energyCost: 15,
        accuracy: 0.95,
        projectileSpeed: 200,
        heatGeneration: 10,
        specialEffect: 'precise'
      }
    }
  ],
  defensiveModules: [
    {
      id: 'defense_1',
      type: DefensiveModuleType.ENERGY_SHIELD,
      stats: {
        protection: 50,
        energyCost: 2,
        duration: 10,
        cooldown: 15,
        massModifier: 0
      }
    }
  ],
  utilityModules: [
    {
      id: 'utility_1',
      type: UtilityModuleType.BOOST_THRUSTERS,
      stats: {
        effect: 'speed_boost',
        energyCost: 25,
        cooldown: 10,
        duration: 3
      }
    }
  ],
  customization: {
    primaryColor: '#00f5ff',
    secondaryColor: '#8b5cf6',
    pattern: 'solid'
  }
});

export const useGameStore = create<GameStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial State
    player: null,
    playerProgress: null,
    premiumTier: PremiumTier.FREE,

    currentBotConfig: createDefaultBotConfig(),
    savedBotConfigs: [],

    currentBattle: null,
    isInBattle: false,

    uiState: initialUIState,

    isMatchmaking: false,
    matchmakingMode: null,
    estimatedWaitTime: 0,

    isConnected: false,
    connectionError: null,

    // Player Actions
    setPlayer: (player) => set({ player }),
    setPlayerProgress: (progress) => set({ playerProgress: progress }),
    setPremiumTier: (tier) => set({ premiumTier: tier }),

    // Bot Builder Actions
    setBotConfig: (config) => set({ currentBotConfig: config }),

    saveBotConfig: (config) => {
      const { savedBotConfigs } = get();
      const existingIndex = savedBotConfigs.findIndex(c => c.id === config.id);

      if (existingIndex >= 0) {
        // Update existing config
        const newConfigs = [...savedBotConfigs];
        newConfigs[existingIndex] = config;
        set({ savedBotConfigs: newConfigs });
      } else {
        // Add new config
        set({ savedBotConfigs: [...savedBotConfigs, config] });
      }

      // Show success notification - deferred to prevent infinite loops
      setTimeout(() => {
        get().addNotification({
          type: 'success',
          title: 'Bot Saved',
          message: `${config.name} has been saved successfully`,
          duration: 3000
        });
      }, 0);
    },

    loadBotConfig: (configId) => {
      const { savedBotConfigs } = get();
      const config = savedBotConfigs.find(c => c.id === configId);
      if (config) {
        set({ currentBotConfig: config });
        // Defer notification to prevent infinite loops
        setTimeout(() => {
          get().addNotification({
            type: 'success',
            title: 'Bot Loaded',
            message: `${config.name} has been loaded`,
            duration: 3000
          });
        }, 0);
      }
    },

    deleteBotConfig: (configId) => {
      const { savedBotConfigs } = get();
      const newConfigs = savedBotConfigs.filter(c => c.id !== configId);
      set({ savedBotConfigs: newConfigs });

      // Defer notification to prevent infinite loops
      setTimeout(() => {
        get().addNotification({
          type: 'info',
          title: 'Bot Deleted',
          message: 'Bot configuration has been deleted',
          duration: 3000
        });
      }, 0);
    },

    // Battle Actions
    setBattleState: (battle) => set({
      currentBattle: battle,
      isInBattle: battle !== null
    }),

    joinBattle: (battleId) => {
      set({
        isInBattle: true,
        uiState: { ...get().uiState, currentScreen: 'battle' }
      });
    },

    leaveBattle: () => {
      set({
        currentBattle: null,
        isInBattle: false,
        uiState: { ...get().uiState, currentScreen: 'menu' }
      });
    },

    // UI Actions
    setCurrentScreen: (screen) => {
      const { uiState } = get();
      set({ uiState: { ...uiState, currentScreen: screen } });
    },

    setLoading: (loading) => {
      const { uiState } = get();
      set({ uiState: { ...uiState, isLoading: loading } });
    },

    setError: (error) => {
      const { uiState } = get();
      set({ uiState: { ...uiState, error } });
    },

    addNotification: (notification) => {
      const { uiState } = get();
      const newNotification: Notification = {
        ...notification,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        timestamp: Date.now()
      };

      set({
        uiState: {
          ...uiState,
          notifications: [...uiState.notifications, newNotification]
        }
      });

      // Auto-remove notification after duration
      if (notification.duration) {
        setTimeout(() => {
          get().removeNotification(newNotification.id);
        }, notification.duration);
      }
    },

    removeNotification: (id) => {
      const { uiState } = get();
      set({
        uiState: {
          ...uiState,
          notifications: uiState.notifications.filter(n => n.id !== id)
        }
      });
    },

    clearNotifications: () => {
      const { uiState } = get();
      set({ uiState: { ...uiState, notifications: [] } });
    },

    // Matchmaking Actions
    startMatchmaking: (mode) => {
      // For practice mode, skip matchmaking and go directly to battle
      if (mode === GameMode.PRACTICE) {
        set({
          uiState: { ...get().uiState, currentScreen: 'battle' }
        });

        // Defer notification to prevent infinite loops
        setTimeout(() => {
          get().addNotification({
            type: 'success',
            title: 'Practice Arena',
            message: 'Starting practice battle...',
            duration: 2000
          });
        }, 0);
        return;
      }

      set({
        isMatchmaking: true,
        matchmakingMode: mode,
        estimatedWaitTime: 30,
        uiState: { ...get().uiState, currentScreen: 'matchmaking' }
      });

      // Defer notification to prevent infinite loops
      setTimeout(() => {
        get().addNotification({
          type: 'info',
          title: 'Searching for Match',
          message: `Looking for ${mode.replace('_', ' ')} opponents...`,
          duration: 3000
        });
      }, 0);
    },

    cancelMatchmaking: () => {
      set({
        isMatchmaking: false,
        matchmakingMode: null,
        estimatedWaitTime: 0,
        uiState: { ...get().uiState, currentScreen: 'menu' }
      });

      // Defer notification to prevent infinite loops
      setTimeout(() => {
        get().addNotification({
          type: 'info',
          title: 'Matchmaking Cancelled',
          message: 'Returned to main menu',
          duration: 2000
        });
      }, 0);
    },

    setEstimatedWaitTime: (time) => set({ estimatedWaitTime: time }),

    // Connection Actions
    setConnected: (connected) => {
      const currentState = get();

      set({
        isConnected: connected,
        connectionError: connected ? null : currentState.connectionError
      });

      // Handle notifications separately to avoid nested state updates
      if (connected) {
        // Use setTimeout to defer the notification to the next tick
        setTimeout(() => {
          get().addNotification({
            type: 'success',
            title: 'Connected',
            message: 'Successfully connected to game server',
            duration: 3000
          });
        }, 0);
      } else {
        setTimeout(() => {
          get().addNotification({
            type: 'error',
            title: 'Disconnected',
            message: 'Lost connection to game server',
            duration: 5000
          });
        }, 0);
      }
    },

    setConnectionError: (error) => set({ connectionError: error }),

    // Utility Actions
    reset: () => {
      set({
        player: null,
        playerProgress: null,
        premiumTier: PremiumTier.FREE,
        currentBotConfig: createDefaultBotConfig(),
        savedBotConfigs: [],
        currentBattle: null,
        isInBattle: false,
        uiState: initialUIState,
        isMatchmaking: false,
        matchmakingMode: null,
        estimatedWaitTime: 0,
        isConnected: false,
        connectionError: null
      });
    }
  }))
);

// Stable selectors to prevent infinite loops - separate data from actions
export const usePlayerData = () => {
  const player = useGameStore(state => state.player);
  const progress = useGameStore(state => state.playerProgress);
  const premiumTier = useGameStore(state => state.premiumTier);
  return { player, progress, premiumTier };
};

export const useBotBuilder = () => {
  const currentConfig = useGameStore(state => state.currentBotConfig);
  const savedConfigs = useGameStore(state => state.savedBotConfigs);
  const setBotConfig = useGameStore(state => state.setBotConfig);
  const saveBotConfig = useGameStore(state => state.saveBotConfig);
  const loadBotConfig = useGameStore(state => state.loadBotConfig);
  const deleteBotConfig = useGameStore(state => state.deleteBotConfig);
  return { currentConfig, savedConfigs, setBotConfig, saveBotConfig, loadBotConfig, deleteBotConfig };
};

export const useBattleState = () => {
  const currentBattle = useGameStore(state => state.currentBattle);
  const isInBattle = useGameStore(state => state.isInBattle);
  const setBattleState = useGameStore(state => state.setBattleState);
  const joinBattle = useGameStore(state => state.joinBattle);
  const leaveBattle = useGameStore(state => state.leaveBattle);
  return { currentBattle, isInBattle, setBattleState, joinBattle, leaveBattle };
};

export const useMatchmaking = () => {
  const isMatchmaking = useGameStore(state => state.isMatchmaking);
  const mode = useGameStore(state => state.matchmakingMode);
  const waitTime = useGameStore(state => state.estimatedWaitTime);
  const startMatchmaking = useGameStore(state => state.startMatchmaking);
  const cancelMatchmaking = useGameStore(state => state.cancelMatchmaking);
  const setEstimatedWaitTime = useGameStore(state => state.setEstimatedWaitTime);
  return { isMatchmaking, mode, waitTime, startMatchmaking, cancelMatchmaking, setEstimatedWaitTime };
};

// Stable selectors to prevent infinite loops
const notificationsSelector = (state: GameStore) => state.uiState.notifications;
const addNotificationSelector = (state: GameStore) => state.addNotification;
const removeNotificationSelector = (state: GameStore) => state.removeNotification;
const clearNotificationsSelector = (state: GameStore) => state.clearNotifications;

export const useNotifications = () => {
  const notifications = useGameStore(notificationsSelector);
  const addNotification = useGameStore(addNotificationSelector);
  const removeNotification = useGameStore(removeNotificationSelector);
  const clearNotifications = useGameStore(clearNotificationsSelector);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications
  };
};
