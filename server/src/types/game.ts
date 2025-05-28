// Core game types for BattleBot Arena

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface Quaternion {
  x: number;
  y: number;
  z: number;
  w: number;
}

// Bot Component Types
export enum ChassisType {
  LIGHT = 'light',
  MEDIUM = 'medium',
  HEAVY = 'heavy'
}

export enum WeaponType {
  LASER_CANNON = 'laser_cannon',
  MISSILE_LAUNCHER = 'missile_launcher',
  PLASMA_RIFLE = 'plasma_rifle',
  RAIL_GUN = 'rail_gun'
}

export enum DefensiveModuleType {
  ENERGY_SHIELD = 'energy_shield',
  ARMOR_PLATING = 'armor_plating',
  STEALTH_CLOAK = 'stealth_cloak'
}

export enum UtilityModuleType {
  BOOST_THRUSTERS = 'boost_thrusters',
  REPAIR_NANOBOTS = 'repair_nanobots',
  SCANNER_ARRAY = 'scanner_array'
}

// Component Definitions
export interface ChassisStats {
  health: number;
  armor: number;
  speed: number;
  weaponSlots: number;
  energyCapacity: number;
  mass: number;
}

export interface WeaponStats {
  damage: number;
  range: number;
  fireRate: number; // shots per second
  energyCost: number;
  accuracy: number; // 0-1
  projectileSpeed: number;
  heatGeneration: number;
  specialEffect?: string;
}

export interface DefensiveModuleStats {
  protection: number;
  energyCost: number;
  duration?: number; // for temporary effects
  cooldown?: number;
  massModifier: number;
}

export interface UtilityModuleStats {
  effect: string;
  energyCost: number;
  cooldown: number;
  duration?: number;
  range?: number;
}

// Bot Configuration
export interface BotComponent {
  id: string;
  type: ChassisType | WeaponType | DefensiveModuleType | UtilityModuleType;
  position?: Vector3;
  rotation?: Quaternion;
  stats: ChassisStats | WeaponStats | DefensiveModuleStats | UtilityModuleStats;
}

export interface BotConfiguration {
  id: string;
  name: string;
  chassis: BotComponent;
  weapons: BotComponent[];
  defensiveModules: BotComponent[];
  utilityModules: BotComponent[];
  customization: {
    primaryColor: string;
    secondaryColor: string;
    pattern?: string;
    decals?: string[];
  };
}

// Game State Types
export interface BotState {
  id: string;
  playerId: string;
  configuration: BotConfiguration;
  position: Vector3;
  rotation: Quaternion;
  velocity: Vector3;
  health: number;
  energy: number;
  heat: number;
  status: {
    isAlive: boolean;
    isShielded: boolean;
    isCloaked: boolean;
    isBoosting: boolean;
    isOverheated: boolean;
  };
  activeEffects: ActiveEffect[];
}

export interface ActiveEffect {
  type: string;
  duration: number;
  intensity: number;
  source: string;
}

export interface Projectile {
  id: string;
  type: WeaponType;
  position: Vector3;
  velocity: Vector3;
  damage: number;
  ownerId: string;
  timeToLive: number;
}

export interface PowerUp {
  id: string;
  type: 'health' | 'energy' | 'weapon_boost' | 'shield_boost';
  position: Vector3;
  value: number;
  duration?: number;
}

// Battle Types
export enum GameMode {
  QUICK_MATCH = 'quick_match',
  RANKED = 'ranked',
  TOURNAMENT = 'tournament',
  PRACTICE = 'practice',
  FREE_FOR_ALL = 'free_for_all'
}

export enum BattlePhase {
  WAITING = 'waiting',
  COUNTDOWN = 'countdown',
  ACTIVE = 'active',
  FINISHED = 'finished'
}

export interface Arena {
  id: string;
  name: string;
  description: string;
  size: Vector3;
  spawnPoints: Vector3[];
  obstacles: Obstacle[];
  powerUpSpawns: Vector3[];
  environment: {
    lighting: string;
    skybox: string;
    gravity: number;
  };
}

export interface Obstacle {
  id: string;
  type: 'wall' | 'cover' | 'destructible' | 'platform';
  position: Vector3;
  size: Vector3;
  rotation: Quaternion;
  health?: number; // for destructible obstacles
  material: string;
}

export interface BattleState {
  id: string;
  mode: GameMode;
  phase: BattlePhase;
  arena: Arena;
  players: Player[];
  bots: BotState[];
  projectiles: Projectile[];
  powerUps: PowerUp[];
  timeRemaining: number;
  scores: { [playerId: string]: number };
  result?: 'victory' | 'defeat' | 'draw';
  stats?: BattleStats;
  events: BattleEvent[];
}

export interface BattleStats {
  damageDealt: number;
  damageTaken: number;
  shotsFired: number;
  shotsHit: number;
  accuracy: number;
  duration: number;
  distanceTraveled: number;
  killCount: number;
  deathCount: number;
}

export interface BattleEvent {
  id: string;
  type: 'damage' | 'kill' | 'powerup' | 'ability_used';
  timestamp: number;
  playerId: string;
  targetId?: string;
  data: any;
}

// Player Types
export interface Player {
  id: string;
  username: string;
  level: number;
  rank: string;
  stats: PlayerStats;
  currentBot?: BotConfiguration;
  isReady: boolean;
  isConnected: boolean;
}

export interface PlayerStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
  kills: number;
  deaths: number;
  damageDealt: number;
  damageTaken: number;
  winRate: number;
  averageKDA: number;
}

// Input Types
export interface PlayerInput {
  movement: {
    forward: boolean;
    backward: boolean;
    left: boolean;
    right: boolean;
    jump: boolean;
    boost: boolean;
  };
  combat: {
    primaryFire: boolean;
    secondaryFire: boolean;
    specialAbility: boolean;
  };
  camera: {
    pitch: number;
    yaw: number;
  };
  timestamp: number;
}

// Network Types
export interface GameMessage {
  type: string;
  data: any;
  timestamp: number;
  playerId?: string;
}

export interface MatchmakingRequest {
  playerId: string;
  gameMode: GameMode;
  skillLevel: number;
  botConfiguration: BotConfiguration;
}

export interface MatchFound {
  battleId: string;
  players: Player[];
  arena: Arena;
  estimatedStartTime: number;
}

// UI Types
export interface UIState {
  currentScreen: 'menu' | 'bot_builder' | 'matchmaking' | 'battle' | 'results';
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

// Monetization Types
export enum PremiumTier {
  FREE = 'free',
  BATTLE_PASS = 'battle_pass',
  PREMIUM = 'premium'
}

export interface PremiumFeature {
  id: string;
  name: string;
  description: string;
  requiredTier: PremiumTier;
  price?: number;
  category: 'chassis' | 'weapon' | 'cosmetic' | 'arena' | 'feature';
}

export interface PlayerProgress {
  level: number;
  experience: number;
  experienceToNext: number;
  battlePassLevel: number;
  battlePassExperience: number;
  unlockedFeatures: string[];
  ownedItems: string[];
}
