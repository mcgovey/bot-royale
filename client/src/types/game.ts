// Simplified game types for BattleBot Arena - Two Mode Version

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

// Simplified Bot Component Types
export enum ChassisType {
  SPEED = 'speed',    // Fast movement, low health (3 HP)
  TANK = 'tank',      // Slow movement, high health (8 HP)
  BALANCED = 'balanced' // Medium speed, medium health (5 HP)
}

export enum WeaponType {
  BLASTER = 'blaster',   // Fast shots, low damage (1 damage)
  CANNON = 'cannon',     // Slow shots, high damage (3 damage)
  SHOTGUN = 'shotgun'    // Medium speed, medium damage (2 damage, short range)
}

export enum SpecialType {
  SHIELD = 'shield',       // Blocks one attack, 10-second cooldown
  SPEED_BOOST = 'speed_boost', // Double speed for 3 seconds, 15-second cooldown
  REPAIR = 'repair'        // Restore 2 HP, 20-second cooldown
}

// Simplified Component Stats
export interface ChassisStats {
  health: number;
  speed: number;
}

export interface WeaponStats {
  damage: number;
  fireRate: number; // shots per second
  range: number;
}

export interface SpecialStats {
  cooldown: number; // seconds
  duration?: number; // seconds (for temporary effects)
  effect: string;
}

// Simplified Bot Configuration
export interface BotConfiguration {
  id: string;
  name: string;
  chassis: ChassisType;
  weapon: WeaponType;
  special: SpecialType;
  customization: {
    primaryColor: string;
    secondaryColor: string;
  };
}

// Simplified Game State Types
export interface BotState {
  id: string;
  playerId: string;
  configuration: BotConfiguration;
  position: Vector3;
  health: number;
  maxHealth: number;
  isAlive: boolean;
  specialCooldown: number;
  lastFired: number;
}

// Simplified Battle Types
export enum GameMode {
  PRACTICE = 'practice'  // Only practice mode for now
}

export interface Arena {
  id: string;
  name: string;
  size: { width: number; height: number };
  obstacles: Obstacle[];
}

export interface Obstacle {
  id: string;
  position: Vector3;
  size: { width: number; height: number };
}

export interface BattleState {
  id: string;
  mode: GameMode;
  arena: Arena;
  bots: BotState[];
  timeRemaining: number;
  isActive: boolean;
  winner?: string;
}

export interface Player {
  id: string;
  username: string;
  level: number;
  wins: number;
  totalBattles: number;
  unlockedSpecials: SpecialType[];
}

// UI State
export interface UIState {
  currentScreen: 'menu' | 'bot_builder' | 'battle';
  isLoading: boolean;
  error?: string;
  notifications: Notification[];
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  duration?: number;
  timestamp: number;
}

// Simplified Input (for AI and simple controls)
export interface BotInput {
  moveDirection: Vector3;
  shouldFire: boolean;
  shouldUseSpecial: boolean;
}

// Game Constants
export const CHASSIS_STATS: Record<ChassisType, ChassisStats> = {
  [ChassisType.SPEED]: { health: 12, speed: 8 },
  [ChassisType.TANK]: { health: 25, speed: 3 },
  [ChassisType.BALANCED]: { health: 18, speed: 5 }
};

export const WEAPON_STATS: Record<WeaponType, WeaponStats> = {
  [WeaponType.BLASTER]: { damage: 2, fireRate: 2.5, range: 100 },
  [WeaponType.CANNON]: { damage: 5, fireRate: 0.8, range: 120 },
  [WeaponType.SHOTGUN]: { damage: 3, fireRate: 1.8, range: 60 }
};

export const SPECIAL_STATS: Record<SpecialType, SpecialStats> = {
  [SpecialType.SHIELD]: { cooldown: 12, effect: 'block_next_attack' },
  [SpecialType.SPEED_BOOST]: { cooldown: 18, duration: 4, effect: 'double_speed' },
  [SpecialType.REPAIR]: { cooldown: 25, effect: 'restore_5_hp' }
};
