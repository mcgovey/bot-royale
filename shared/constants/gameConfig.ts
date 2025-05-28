import {
  ChassisType,
  WeaponType,
  DefensiveModuleType,
  UtilityModuleType,
  ChassisStats,
  WeaponStats,
  DefensiveModuleStats,
  UtilityModuleStats
} from '../types/game';

// Chassis Configurations
export const CHASSIS_CONFIGS: Record<ChassisType, ChassisStats> = {
  [ChassisType.LIGHT]: {
    health: 100,
    armor: 10,
    speed: 8.0,
    weaponSlots: 3,
    energyCapacity: 100,
    mass: 50
  },
  [ChassisType.MEDIUM]: {
    health: 150,
    armor: 25,
    speed: 6.0,
    weaponSlots: 4,
    energyCapacity: 150,
    mass: 100
  },
  [ChassisType.HEAVY]: {
    health: 200,
    armor: 40,
    speed: 4.0,
    weaponSlots: 5,
    energyCapacity: 200,
    mass: 200
  }
};

// Weapon Configurations
export const WEAPON_CONFIGS: Record<WeaponType, WeaponStats> = {
  [WeaponType.LASER_CANNON]: {
    damage: 25,
    range: 100,
    fireRate: 3.0,
    energyCost: 15,
    accuracy: 0.95,
    projectileSpeed: 200,
    heatGeneration: 10,
    specialEffect: 'precise'
  },
  [WeaponType.MISSILE_LAUNCHER]: {
    damage: 50,
    range: 80,
    fireRate: 1.0,
    energyCost: 30,
    accuracy: 0.8,
    projectileSpeed: 50,
    heatGeneration: 20,
    specialEffect: 'splash'
  },
  [WeaponType.PLASMA_RIFLE]: {
    damage: 35,
    range: 60,
    fireRate: 2.0,
    energyCost: 20,
    accuracy: 0.85,
    projectileSpeed: 100,
    heatGeneration: 25,
    specialEffect: 'burn'
  },
  [WeaponType.RAIL_GUN]: {
    damage: 80,
    range: 150,
    fireRate: 0.5,
    energyCost: 50,
    accuracy: 1.0,
    projectileSpeed: 500,
    heatGeneration: 40,
    specialEffect: 'piercing'
  }
};

// Defensive Module Configurations
export const DEFENSIVE_CONFIGS: Record<DefensiveModuleType, DefensiveModuleStats> = {
  [DefensiveModuleType.ENERGY_SHIELD]: {
    protection: 50,
    energyCost: 2, // per second
    duration: 10,
    cooldown: 15,
    massModifier: 0
  },
  [DefensiveModuleType.ARMOR_PLATING]: {
    protection: 30,
    energyCost: 0,
    massModifier: 1.2
  },
  [DefensiveModuleType.STEALTH_CLOAK]: {
    protection: 0,
    energyCost: 40,
    duration: 5,
    cooldown: 30,
    massModifier: 0
  }
};

// Utility Module Configurations
export const UTILITY_CONFIGS: Record<UtilityModuleType, UtilityModuleStats> = {
  [UtilityModuleType.BOOST_THRUSTERS]: {
    effect: 'speed_boost',
    energyCost: 25,
    cooldown: 10,
    duration: 3
  },
  [UtilityModuleType.REPAIR_NANOBOTS]: {
    effect: 'heal_over_time',
    energyCost: 30,
    cooldown: 20,
    duration: 8
  },
  [UtilityModuleType.SCANNER_ARRAY]: {
    effect: 'reveal_enemies',
    energyCost: 20,
    cooldown: 15,
    duration: 6,
    range: 50
  }
};

// Game Balance Constants
export const GAME_CONSTANTS = {
  // Combat
  MAX_HEAT: 100,
  HEAT_DISSIPATION_RATE: 5, // per second
  OVERHEAT_THRESHOLD: 80,
  OVERHEAT_PENALTY: 0.5, // damage multiplier when overheated

  // Energy
  ENERGY_REGEN_RATE: 10, // per second
  LOW_ENERGY_THRESHOLD: 20,

  // Movement
  GRAVITY: -9.81,
  JUMP_FORCE: 5,
  BOOST_MULTIPLIER: 2.0,

  // Battle
  MATCH_DURATION: 180, // 3 minutes
  COUNTDOWN_DURATION: 5,
  RESPAWN_TIME: 3,

  // Power-ups
  POWERUP_SPAWN_INTERVAL: 30, // seconds
  POWERUP_DURATION: 15,
  HEALTH_POWERUP_VALUE: 50,
  ENERGY_POWERUP_VALUE: 50,

  // Experience and Progression
  BASE_XP_PER_MATCH: 50,
  XP_PER_KILL: 100,
  XP_PER_DAMAGE: 1, // per point of damage
  XP_WIN_BONUS: 100,

  // Monetization
  FREE_MATCHES_PER_DAY: 3,
  BATTLE_PASS_PRICE: 4.99,
  PREMIUM_SUBSCRIPTION_PRICE: 9.99
};

// Arena Configurations
export const ARENA_CONFIGS = {
  BASIC_ARENA: {
    id: 'basic_arena',
    name: 'Training Grounds',
    description: 'A simple arena perfect for learning the basics',
    size: { x: 100, y: 20, z: 100 },
    spawnPoints: [
      { x: -40, y: 2, z: 0 },
      { x: 40, y: 2, z: 0 }
    ],
    obstacles: [
      {
        id: 'center_wall',
        type: 'wall' as const,
        position: { x: 0, y: 5, z: 0 },
        size: { x: 2, y: 10, z: 20 },
        rotation: { x: 0, y: 0, z: 0, w: 1 },
        material: 'metal'
      }
    ],
    powerUpSpawns: [
      { x: 0, y: 2, z: 30 },
      { x: 0, y: 2, z: -30 }
    ],
    environment: {
      lighting: 'bright',
      skybox: 'space',
      gravity: -9.81
    }
  },

  INDUSTRIAL_COMPLEX: {
    id: 'industrial_complex',
    name: 'Industrial Complex',
    description: 'A maze of machinery and cover points',
    size: { x: 120, y: 25, z: 120 },
    spawnPoints: [
      { x: -50, y: 2, z: -50 },
      { x: 50, y: 2, z: 50 }
    ],
    obstacles: [
      // Multiple cover points and obstacles
      {
        id: 'factory_1',
        type: 'cover' as const,
        position: { x: -20, y: 3, z: 0 },
        size: { x: 8, y: 6, z: 8 },
        rotation: { x: 0, y: 0, z: 0, w: 1 },
        material: 'concrete'
      },
      {
        id: 'factory_2',
        type: 'cover' as const,
        position: { x: 20, y: 3, z: 0 },
        size: { x: 8, y: 6, z: 8 },
        rotation: { x: 0, y: 0, z: 0, w: 1 },
        material: 'concrete'
      }
    ],
    powerUpSpawns: [
      { x: 0, y: 2, z: 0 },
      { x: -30, y: 2, z: 30 },
      { x: 30, y: 2, z: -30 }
    ],
    environment: {
      lighting: 'industrial',
      skybox: 'city',
      gravity: -9.81
    }
  }
};

// UI Constants
export const UI_CONSTANTS = {
  NOTIFICATION_DURATION: 5000, // milliseconds
  LOADING_TIMEOUT: 30000,
  ANIMATION_DURATION: 300,

  // Colors (matching Tailwind config)
  COLORS: {
    CYBER_BLUE: '#00f5ff',
    CYBER_PURPLE: '#8b5cf6',
    CYBER_GREEN: '#10b981',
    CYBER_RED: '#ef4444',
    CYBER_ORANGE: '#f59e0b',
    DARK_BG: '#0a0a0a',
    DARK_SURFACE: '#1a1a1a',
    DARK_BORDER: '#333333'
  }
};

// Network Constants
export const NETWORK_CONSTANTS = {
  SERVER_TICK_RATE: 60, // Hz
  CLIENT_SEND_RATE: 30, // Hz
  INTERPOLATION_DELAY: 100, // milliseconds
  PREDICTION_TIME: 50, // milliseconds

  // Socket events
  EVENTS: {
    // Connection
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',

    // Authentication
    LOGIN: 'login',
    LOGOUT: 'logout',

    // Matchmaking
    FIND_MATCH: 'find_match',
    CANCEL_MATCHMAKING: 'cancel_matchmaking',
    MATCH_FOUND: 'match_found',

    // Battle
    JOIN_BATTLE: 'join_battle',
    LEAVE_BATTLE: 'leave_battle',
    PLAYER_INPUT: 'player_input',
    GAME_STATE_UPDATE: 'game_state_update',
    BATTLE_EVENT: 'battle_event',

    // Bot Builder
    SAVE_BOT_CONFIG: 'save_bot_config',
    LOAD_BOT_CONFIG: 'load_bot_config',

    // Social
    CHAT_MESSAGE: 'chat_message',
    FRIEND_REQUEST: 'friend_request'
  }
};

// Free vs Premium Features
export const FEATURE_GATES = {
  FREE_TIER: {
    chassisTypes: [ChassisType.LIGHT, ChassisType.MEDIUM, ChassisType.HEAVY],
    weapons: [
      WeaponType.LASER_CANNON,
      WeaponType.MISSILE_LAUNCHER,
      WeaponType.PLASMA_RIFLE
    ],
    defensiveModules: [
      DefensiveModuleType.ENERGY_SHIELD,
      DefensiveModuleType.ARMOR_PLATING
    ],
    utilityModules: [
      UtilityModuleType.BOOST_THRUSTERS,
      UtilityModuleType.REPAIR_NANOBOTS
    ],
    arenas: ['basic_arena'],
    dailyMatches: 3,
    customColors: 3
  },

  BATTLE_PASS: {
    additionalWeapons: [WeaponType.RAIL_GUN],
    additionalModules: [
      DefensiveModuleType.STEALTH_CLOAK,
      UtilityModuleType.SCANNER_ARRAY
    ],
    unlimitedMatches: true,
    priorityMatchmaking: true,
    customColors: 10,
    exclusiveSkins: true
  },

  PREMIUM: {
    allFeatures: true,
    customArenaCreation: true,
    advancedAnalytics: true,
    botSharing: true,
    tournamentAccess: true
  }
};
