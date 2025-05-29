import { ChassisType, WeaponType, SpecialType } from './game';

// Experience and Leveling System
export interface PlayerLevel {
  level: number;
  currentXP: number;
  xpToNextLevel: number;
  totalXP: number;
}

export interface XPReward {
  source: 'battle_win' | 'battle_complete' | 'damage_dealt' | 'perfect_battle' | 'achievement' | 'challenge';
  amount: number;
  description: string;
}

// Bot Mastery System
export interface MasteryProgress {
  currentLevel: number;
  totalXP: number;
  xpToNextLevel: number;
  maxLevel: number;
}

export interface ChassisSpecialization {
  speed: {
    velocityDemon: MasteryProgress;      // Level 1-5: Movement speed +10% per level
    phantomDash: MasteryProgress;        // Level 6-10: Dodge chance +5% per level
    lightSpeed: MasteryProgress;         // Level 11-15: Teleport ability unlock
  };
  tank: {
    fortress: MasteryProgress;           // Level 1-5: Health +15% per level
    juggernaut: MasteryProgress;         // Level 6-10: Damage resistance +8% per level
    unstoppableForce: MasteryProgress;   // Level 11-15: Charge attack unlock
  };
  balanced: {
    adaptive: MasteryProgress;           // Level 1-5: All stats +5% per level
    versatile: MasteryProgress;          // Level 6-10: Cooldown reduction +10% per level
    perfectHarmony: MasteryProgress;     // Level 11-15: Dual special ability unlock
  };
}

export interface WeaponMastery {
  accuracy: MasteryProgress;             // +5% accuracy per level (max 25%)
  damage: MasteryProgress;               // +10% damage per level (max 50%)
  specialEffects: {
    piercing: MasteryProgress;           // Shots go through enemies
    explosive: MasteryProgress;          // Area of effect damage
    homing: MasteryProgress;             // Projectiles track targets
  };
}

export interface SpecialMastery {
  cooldownReduction: MasteryProgress;    // -10% cooldown per level (max 50%)
  enhancedPower: MasteryProgress;        // +20% effect strength per level
  uniqueCombinations: {
    shieldBurst: MasteryProgress;        // Shield + Speed Boost combo
    repairOverdrive: MasteryProgress;    // Repair + enhanced stats combo
    speedStrike: MasteryProgress;        // Speed + damage boost combo
  };
}

export interface BotMasteryTrees {
  chassis: {
    [ChassisType.SPEED]: ChassisSpecialization['speed'];
    [ChassisType.TANK]: ChassisSpecialization['tank'];
    [ChassisType.BALANCED]: ChassisSpecialization['balanced'];
  };
  weapons: {
    [WeaponType.BLASTER]: WeaponMastery;
    [WeaponType.CANNON]: WeaponMastery;
    [WeaponType.SHOTGUN]: WeaponMastery;
  };
  specials: {
    [SpecialType.SHIELD]: SpecialMastery;
    [SpecialType.SPEED_BOOST]: SpecialMastery;
    [SpecialType.REPAIR]: SpecialMastery;
  };
}

// Achievement System
export interface Achievement {
  id: string;
  category: 'combat' | 'builder' | 'social' | 'progression';
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  requirements: AchievementRequirement[];
  rewards: AchievementReward[];
  isUnlocked: boolean;
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
}

export interface AchievementRequirement {
  type: 'battles_won' | 'damage_dealt' | 'battles_completed' | 'bot_configurations' | 'perfect_battles' | 'specific_victory' | 'level_reached' | 'mastery_unlocked';
  target: number | string;
  current: number;
  description: string;
}

export interface AchievementReward {
  type: 'xp' | 'title' | 'cosmetic' | 'unlock' | 'currency';
  amount?: number;
  item?: string;
  description: string;
}

// Battle Pass System
export interface BattlePassSeason {
  id: string;
  name: string;
  theme: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  maxTier: number;
  currentTier: number;
  currentXP: number;
  xpPerTier: number;
}

export interface BattlePassReward {
  tier: number;
  type: 'free' | 'premium';
  rewardType: 'cosmetic' | 'xp_boost' | 'title' | 'emote' | 'arena_theme' | 'special_effect';
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  isUnlocked: boolean;
}

export interface WeeklyChallenge {
  id: string;
  week: number;
  name: string;
  description: string;
  requirements: ChallengeRequirement[];
  rewards: ChallengeReward[];
  isCompleted: boolean;
  progress: number;
  maxProgress: number;
  expiresAt: Date;
}

export interface ChallengeRequirement {
  type: 'win_battles' | 'deal_damage' | 'use_chassis' | 'use_weapon' | 'use_special' | 'survive_time';
  target: number;
  current: number;
  constraint?: ChassisType | WeaponType | SpecialType; // For specific requirements
  description: string;
}

export interface ChallengeReward {
  type: 'xp' | 'battle_pass_xp' | 'cosmetic' | 'currency';
  amount?: number;
  item?: string;
  description: string;
}

// Player Profile and Statistics
export interface PlayerProfile {
  id: string;
  username: string;
  level: PlayerLevel;
  totalBattles: number;
  totalWins: number;
  totalDamageDealt: number;
  totalDamageTaken: number;
  winRate: number;
  favoriteLoadout?: {
    chassis: ChassisType;
    weapon: WeaponType;
    special: SpecialType;
  };
  createdAt: Date;
  lastPlayedAt: Date;
}

export interface BattleStatistics {
  battlesPlayed: number;
  battlesWon: number;
  totalDamageDealt: number;
  totalDamageTaken: number;
  shotsFired: number;
  shotsHit: number;
  accuracy: number;
  perfectBattles: number; // Won without taking damage
  longestWinStreak: number;
  currentWinStreak: number;
  timePlayedSeconds: number;
  favoriteChassisType: ChassisType;
  favoriteWeaponType: WeaponType;
  favoriteSpecialType: SpecialType;
}

// Complete Progression State
export interface ProgressionState {
  profile: PlayerProfile;
  statistics: BattleStatistics;
  masteryTrees: BotMasteryTrees;
  achievements: Achievement[];
  battlePass: {
    currentSeason: BattlePassSeason;
    rewards: BattlePassReward[];
    isPremium: boolean;
  };
  weeklyChallenges: WeeklyChallenge[];
  recentXPGains: XPReward[];
  unlockedCosmetics: string[];
  unlockedTitles: string[];
}

// Combat Modifiers (applied based on mastery levels)
export interface CombatModifiers {
  healthMultiplier: number;
  speedMultiplier: number;
  damageMultiplier: number;
  accuracyBonus: number;
  cooldownReduction: number;
  dodgeChance: number;
  damageResistance: number;
  specialEffects: {
    piercing: boolean;
    explosive: boolean;
    homing: boolean;
    teleport: boolean;
    charge: boolean;
    dualSpecial: boolean;
  };
}

// Events for progression tracking
export interface ProgressionEvent {
  type: 'battle_completed' | 'battle_won' | 'damage_dealt' | 'shot_fired' | 'shot_hit' | 'special_used' | 'perfect_battle';
  timestamp: Date;
  data: {
    damage?: number;
    chassisUsed?: ChassisType;
    weaponUsed?: WeaponType;
    specialUsed?: SpecialType;
    battleDuration?: number;
    isVictory?: boolean;
    isPerfect?: boolean;
  };
}

export interface UnlockableComponent {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  isUnlocked: boolean;
  unlockRequirement: UnlockRequirement;
  previewImage?: string;
  category: 'chassis' | 'weapon' | 'special' | 'cosmetic';
}

export interface UnlockRequirement {
  type: 'achievement' | 'level' | 'battle_pass' | 'mastery' | 'purchase' | 'challenge';
  description: string;
  progress?: {
    current: number;
    required: number;
  };
  // For achievement-based unlocks
  achievementId?: string;
  // For level-based unlocks
  requiredLevel?: number;
  // For mastery-based unlocks
  masteryPath?: string;
  masteryLevel?: number;
  // For battle pass unlocks
  battlePassTier?: number;
  battlePassType?: 'free' | 'premium';
  // For purchase-based unlocks
  price?: {
    currency: 'credits' | 'premium';
    amount: number;
  };
  // For challenge-based unlocks
  challengeId?: string;
}

export interface ComponentCollection {
  chassis: UnlockableComponent[];
  weapons: UnlockableComponent[];
  specials: UnlockableComponent[];
  cosmetics: {
    patterns: UnlockableComponent[];
    colors: UnlockableComponent[];
    decals: UnlockableComponent[];
    titles: UnlockableComponent[];
    badges: UnlockableComponent[];
  };
}

export interface ComponentUnlockState {
  unlockedComponents: string[]; // Array of component IDs
  recentUnlocks: Array<{
    componentId: string;
    unlockedAt: Date;
    unlockSource: string;
  }>;
  previewMode: boolean; // Whether user is previewing locked content
}
