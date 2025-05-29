import {
  ProgressionState,
  ProgressionEvent,
  XPReward,
  Achievement,
  BotMasteryTrees,
  CombatModifiers,
  MasteryProgress,
  PlayerLevel,
  BattleStatistics,
  WeeklyChallenge,
  BattlePassSeason,
  BattlePassReward,
  UnlockableComponent,
  ComponentCollection
} from '../types/progression';
import { ChassisType, WeaponType, SpecialType } from '../types/game';

// XP Constants
const XP_BASE_LEVEL = 100;
const XP_GROWTH_RATE = 1.15;
const MAX_LEVEL = 100;

// XP Rewards by Activity
const XP_REWARDS = {
  battle_complete: 25,
  battle_win: 75,
  damage_dealt: 0.5, // per damage point
  perfect_battle: 150,
  achievement: 0, // calculated based on rarity
  challenge: 0 // calculated based on challenge
};

// Mastery XP Constants
const MASTERY_XP_PER_LEVEL = 200;
const MASTERY_MAX_LEVEL = 15;

// Initialize default progression state
export function initializeProgressionState(): ProgressionState {
  const now = new Date();
  const playerId = generatePlayerId();

  return {
    profile: {
      id: playerId,
      username: `Player${playerId.slice(-4)}`,
      level: {
        level: 1,
        currentXP: 0,
        xpToNextLevel: XP_BASE_LEVEL,
        totalXP: 0
      },
      totalBattles: 0,
      totalWins: 0,
      totalDamageDealt: 0,
      totalDamageTaken: 0,
      winRate: 0,
      createdAt: now,
      lastPlayedAt: now
    },
    statistics: {
      battlesPlayed: 0,
      battlesWon: 0,
      totalDamageDealt: 0,
      totalDamageTaken: 0,
      shotsFired: 0,
      shotsHit: 0,
      accuracy: 0,
      perfectBattles: 0,
      longestWinStreak: 0,
      currentWinStreak: 0,
      timePlayedSeconds: 0,
      favoriteChassisType: ChassisType.BALANCED,
      favoriteWeaponType: WeaponType.BLASTER,
      favoriteSpecialType: SpecialType.SHIELD
    },
    masteryTrees: initializeMasteryTrees(),
    achievements: initializeAchievements(),
    battlePass: {
      currentSeason: initializeBattlePassSeason(),
      rewards: initializeBattlePassRewards(),
      isPremium: false
    },
    weeklyChallenges: initializeWeeklyChallenges(),
    recentXPGains: [],
    unlockedCosmetics: [],
    unlockedTitles: []
  };
}

// Calculate XP reward for progression events
export function calculateXPReward(event: ProgressionEvent, state: ProgressionState): XPReward {
  let amount = 0;
  let description = '';

  switch (event.type) {
    case 'battle_completed':
      amount = XP_REWARDS.battle_complete;
      description = 'Battle completed';
      break;
    case 'battle_won':
      amount = XP_REWARDS.battle_win;
      description = 'Victory achieved!';
      if (event.data.isPerfect) {
        amount += XP_REWARDS.perfect_battle;
        description = 'Perfect victory!';
      }
      break;
    case 'damage_dealt':
      amount = Math.floor((event.data.damage || 0) * XP_REWARDS.damage_dealt);
      description = `Damage dealt: ${event.data.damage}`;
      break;
    case 'perfect_battle':
      amount = XP_REWARDS.perfect_battle;
      description = 'Flawless victory!';
      break;
    default:
      amount = 10;
      description = 'Combat action';
  }

  // Apply level-based XP multiplier
  const levelMultiplier = 1 + (state.profile.level.level - 1) * 0.02;
  amount = Math.floor(amount * levelMultiplier);

  return {
    source: event.type as XPReward['source'],
    amount,
    description
  };
}

// Calculate level from total XP
export function calculateLevelFromXP(totalXP: number): PlayerLevel {
  let level = 1;
  let xpRequired = 0;
  let xpForCurrentLevel = XP_BASE_LEVEL;

  while (level < MAX_LEVEL && totalXP >= xpRequired + xpForCurrentLevel) {
    xpRequired += xpForCurrentLevel;
    level++;
    xpForCurrentLevel = Math.floor(XP_BASE_LEVEL * Math.pow(XP_GROWTH_RATE, level - 1));
  }

  const currentXP = totalXP - xpRequired;
  const xpToNextLevel = level < MAX_LEVEL ? xpForCurrentLevel - currentXP : 0;

  return {
    level,
    currentXP,
    xpToNextLevel,
    totalXP
  };
}

// Update mastery progress based on events
export function updateMasteryProgress(masteryTrees: BotMasteryTrees, event: ProgressionEvent): BotMasteryTrees {
  const updated = JSON.parse(JSON.stringify(masteryTrees)); // Deep clone

  // Calculate mastery XP gain
  let masteryXP = 0;
  switch (event.type) {
    case 'battle_completed':
      masteryXP = 10;
      break;
    case 'battle_won':
      masteryXP = 25;
      break;
    case 'damage_dealt':
      masteryXP = Math.floor((event.data.damage || 0) * 0.2);
      break;
    default:
      masteryXP = 5;
  }

  // Update chassis mastery
  if (event.data.chassisUsed) {
    const chassisType = event.data.chassisUsed;

    if (chassisType === ChassisType.SPEED) {
      updated.chassis[chassisType].velocityDemon = updateMasteryLevel(updated.chassis[chassisType].velocityDemon, masteryXP);
    } else if (chassisType === ChassisType.TANK) {
      updated.chassis[chassisType].fortress = updateMasteryLevel(updated.chassis[chassisType].fortress, masteryXP);
    } else if (chassisType === ChassisType.BALANCED) {
      updated.chassis[chassisType].adaptive = updateMasteryLevel(updated.chassis[chassisType].adaptive, masteryXP);
    }
  }

  // Update weapon mastery
  if (event.data.weaponUsed) {
    const weaponType = event.data.weaponUsed;

    if (event.type === 'shot_hit') {
      updated.weapons[weaponType].accuracy = updateMasteryLevel(updated.weapons[weaponType].accuracy, masteryXP);
    } else if (event.type === 'damage_dealt') {
      updated.weapons[weaponType].damage = updateMasteryLevel(updated.weapons[weaponType].damage, masteryXP);
    }
  }

  // Update special mastery
  if (event.data.specialUsed) {
    const specialType = event.data.specialUsed;
    updated.specials[specialType].cooldownReduction = updateMasteryLevel(updated.specials[specialType].cooldownReduction, masteryXP);
  }

  return updated;
}

// Check achievements and return updated achievements with new unlocks
export function checkAchievements(
  achievements: Achievement[],
  stats: BattleStatistics,
  masteryTrees: BotMasteryTrees
): { updatedAchievements: Achievement[]; newUnlocks: Achievement[] } {
  const updatedAchievements = [...achievements];
  const newUnlocks: Achievement[] = [];

  updatedAchievements.forEach((achievement, index) => {
    if (achievement.isUnlocked) return;

    let progress = 0;
    let maxProgress = achievement.maxProgress;

    // Check requirements based on achievement type
    achievement.requirements.forEach(req => {
      switch (req.type) {
        case 'battles_won':
          progress = Math.max(progress, stats.battlesWon);
          break;
        case 'damage_dealt':
          progress = Math.max(progress, stats.totalDamageDealt);
          break;
        case 'battles_completed':
          progress = Math.max(progress, stats.battlesPlayed);
          break;
        case 'perfect_battles':
          progress = Math.max(progress, stats.perfectBattles);
          break;
        // Add more cases as needed
      }
    });

    // Update progress
    updatedAchievements[index] = {
      ...achievement,
      progress: Math.min(progress, maxProgress)
    };

    // Check if newly unlocked
    if (progress >= maxProgress && !achievement.isUnlocked) {
      updatedAchievements[index].isUnlocked = true;
      updatedAchievements[index].unlockedAt = new Date();
      newUnlocks.push(updatedAchievements[index]);
    }
  });

  return { updatedAchievements, newUnlocks };
}

// Update weekly challenges based on events
export function updateWeeklyChallenges(challenges: WeeklyChallenge[], event: ProgressionEvent): WeeklyChallenge[] {
  return challenges.map(challenge => {
    if (challenge.isCompleted) return challenge;

    let progress = challenge.progress;

    challenge.requirements.forEach(req => {
      switch (req.type) {
        case 'win_battles':
          if (event.type === 'battle_won') progress += 1;
          break;
        case 'deal_damage':
          if (event.type === 'damage_dealt') progress += event.data.damage || 0;
          break;
        case 'use_chassis':
          if (event.data.chassisUsed === req.constraint) progress += 1;
          break;
        case 'use_weapon':
          if (event.data.weaponUsed === req.constraint) progress += 1;
          break;
        case 'use_special':
          if (event.data.specialUsed === req.constraint) progress += 1;
          break;
      }
    });

    return {
      ...challenge,
      progress: Math.min(progress, challenge.maxProgress),
      isCompleted: progress >= challenge.maxProgress
    };
  });
}

// Calculate combat modifiers based on mastery levels
export function calculateCombatModifiers(
  masteryTrees: BotMasteryTrees,
  chassis: ChassisType,
  weapon: WeaponType,
  special: SpecialType
): CombatModifiers {
  const modifiers: CombatModifiers = {
    healthMultiplier: 1.0,
    speedMultiplier: 1.0,
    damageMultiplier: 1.0,
    accuracyBonus: 0,
    cooldownReduction: 0,
    dodgeChance: 0,
    damageResistance: 0,
    specialEffects: {
      piercing: false,
      explosive: false,
      homing: false,
      teleport: false,
      charge: false,
      dualSpecial: false
    }
  };

  // Apply chassis bonuses
  if (chassis === ChassisType.SPEED) {
    const speedMastery = masteryTrees.chassis[chassis];
    modifiers.speedMultiplier += speedMastery.velocityDemon.currentLevel * 0.1;
    modifiers.dodgeChance += speedMastery.phantomDash.currentLevel * 0.05;
    modifiers.specialEffects.teleport = speedMastery.lightSpeed.currentLevel >= 11;
  } else if (chassis === ChassisType.TANK) {
    const tankMastery = masteryTrees.chassis[chassis];
    modifiers.healthMultiplier += tankMastery.fortress.currentLevel * 0.15;
    modifiers.damageResistance += tankMastery.juggernaut.currentLevel * 0.08;
    modifiers.specialEffects.charge = tankMastery.unstoppableForce.currentLevel >= 11;
  } else if (chassis === ChassisType.BALANCED) {
    const balancedMastery = masteryTrees.chassis[chassis];
    const adaptiveLevel = balancedMastery.adaptive.currentLevel;
    modifiers.healthMultiplier += adaptiveLevel * 0.05;
    modifiers.speedMultiplier += adaptiveLevel * 0.05;
    modifiers.damageMultiplier += adaptiveLevel * 0.05;
    modifiers.cooldownReduction += balancedMastery.versatile.currentLevel * 0.1;
    modifiers.specialEffects.dualSpecial = balancedMastery.perfectHarmony.currentLevel >= 11;
  }

  // Apply weapon bonuses
  const weaponMastery = masteryTrees.weapons[weapon];
  modifiers.accuracyBonus += weaponMastery.accuracy.currentLevel * 0.05;
  modifiers.damageMultiplier += weaponMastery.damage.currentLevel * 0.1;

  // Apply special effects
  modifiers.specialEffects.piercing = weaponMastery.specialEffects.piercing.currentLevel >= 5;
  modifiers.specialEffects.explosive = weaponMastery.specialEffects.explosive.currentLevel >= 5;
  modifiers.specialEffects.homing = weaponMastery.specialEffects.homing.currentLevel >= 5;

  // Apply special bonuses
  const specialMastery = masteryTrees.specials[special];
  modifiers.cooldownReduction += specialMastery.cooldownReduction.currentLevel * 0.1;

  return modifiers;
}

// Helper function to update mastery level
function updateMasteryLevel(mastery: MasteryProgress, xpGain: number): MasteryProgress {
  if (mastery.currentLevel >= mastery.maxLevel) return mastery;

  const newTotalXP = mastery.totalXP + xpGain;
  const newLevel = Math.min(
    Math.floor(newTotalXP / MASTERY_XP_PER_LEVEL) + 1,
    mastery.maxLevel
  );
  const xpToNextLevel = newLevel < mastery.maxLevel
    ? MASTERY_XP_PER_LEVEL - (newTotalXP % MASTERY_XP_PER_LEVEL)
    : 0;

  return {
    currentLevel: newLevel,
    totalXP: newTotalXP,
    xpToNextLevel,
    maxLevel: mastery.maxLevel
  };
}

// Initialize mastery trees with default values
function initializeMasteryTrees(): BotMasteryTrees {
  const createMasteryProgress = (maxLevel: number = MASTERY_MAX_LEVEL): MasteryProgress => ({
    currentLevel: 0,
    totalXP: 0,
    xpToNextLevel: MASTERY_XP_PER_LEVEL,
    maxLevel
  });

  return {
    chassis: {
      [ChassisType.SPEED]: {
        velocityDemon: createMasteryProgress(5),
        phantomDash: createMasteryProgress(5),
        lightSpeed: createMasteryProgress(5)
      },
      [ChassisType.TANK]: {
        fortress: createMasteryProgress(5),
        juggernaut: createMasteryProgress(5),
        unstoppableForce: createMasteryProgress(5)
      },
      [ChassisType.BALANCED]: {
        adaptive: createMasteryProgress(5),
        versatile: createMasteryProgress(5),
        perfectHarmony: createMasteryProgress(5)
      }
    },
    weapons: {
      [WeaponType.BLASTER]: {
        accuracy: createMasteryProgress(5),
        damage: createMasteryProgress(5),
        specialEffects: {
          piercing: createMasteryProgress(10),
          explosive: createMasteryProgress(10),
          homing: createMasteryProgress(10)
        }
      },
      [WeaponType.CANNON]: {
        accuracy: createMasteryProgress(5),
        damage: createMasteryProgress(5),
        specialEffects: {
          piercing: createMasteryProgress(10),
          explosive: createMasteryProgress(10),
          homing: createMasteryProgress(10)
        }
      },
      [WeaponType.SHOTGUN]: {
        accuracy: createMasteryProgress(5),
        damage: createMasteryProgress(5),
        specialEffects: {
          piercing: createMasteryProgress(10),
          explosive: createMasteryProgress(10),
          homing: createMasteryProgress(10)
        }
      }
    },
    specials: {
      [SpecialType.SHIELD]: {
        cooldownReduction: createMasteryProgress(5),
        enhancedPower: createMasteryProgress(5),
        uniqueCombinations: {
          shieldBurst: createMasteryProgress(3),
          repairOverdrive: createMasteryProgress(3),
          speedStrike: createMasteryProgress(3)
        }
      },
      [SpecialType.SPEED_BOOST]: {
        cooldownReduction: createMasteryProgress(5),
        enhancedPower: createMasteryProgress(5),
        uniqueCombinations: {
          shieldBurst: createMasteryProgress(3),
          repairOverdrive: createMasteryProgress(3),
          speedStrike: createMasteryProgress(3)
        }
      },
      [SpecialType.REPAIR]: {
        cooldownReduction: createMasteryProgress(5),
        enhancedPower: createMasteryProgress(5),
        uniqueCombinations: {
          shieldBurst: createMasteryProgress(3),
          repairOverdrive: createMasteryProgress(3),
          speedStrike: createMasteryProgress(3)
        }
      }
    }
  };
}

// Initialize achievements
function initializeAchievements(): Achievement[] {
  return [
    // Combat Mastery Achievements
    {
      id: 'first_blood',
      category: 'combat',
      name: 'First Blood',
      description: 'Win your first battle',
      icon: '🏆',
      rarity: 'common',
      requirements: [
        {
          type: 'battles_won',
          target: 1,
          current: 0,
          description: 'Win 1 battle'
        }
      ],
      rewards: [
        {
          type: 'xp',
          amount: 100,
          description: '+100 XP'
        }
      ],
      isUnlocked: false,
      progress: 0,
      maxProgress: 1
    },
    {
      id: 'perfectionist',
      category: 'combat',
      name: 'Perfectionist',
      description: 'Win a battle without taking damage',
      icon: '✨',
      rarity: 'rare',
      requirements: [
        {
          type: 'perfect_battles',
          target: 1,
          current: 0,
          description: 'Win 1 perfect battle'
        }
      ],
      rewards: [
        {
          type: 'xp',
          amount: 200,
          description: '+200 XP'
        },
        {
          type: 'title',
          item: 'Flawless',
          description: 'Unlock "Flawless" title'
        }
      ],
      isUnlocked: false,
      progress: 0,
      maxProgress: 1
    },
    {
      id: 'damage_dealer',
      category: 'combat',
      name: 'Damage Dealer',
      description: 'Deal 1000 total damage',
      icon: '💥',
      rarity: 'common',
      requirements: [
        {
          type: 'damage_dealt',
          target: 1000,
          current: 0,
          description: 'Deal 1000 damage'
        }
      ],
      rewards: [
        {
          type: 'xp',
          amount: 150,
          description: '+150 XP'
        }
      ],
      isUnlocked: false,
      progress: 0,
      maxProgress: 1000
    },
    // Builder Achievements
    {
      id: 'designer',
      category: 'builder',
      name: 'Designer',
      description: 'Create 10 different bot configurations',
      icon: '🎨',
      rarity: 'rare',
      requirements: [
        {
          type: 'bot_configurations',
          target: 10,
          current: 0,
          description: 'Create 10 different configurations'
        }
      ],
      rewards: [
        {
          type: 'xp',
          amount: 250,
          description: '+250 XP'
        },
        {
          type: 'cosmetic',
          item: 'designer_badge',
          description: 'Unlock Designer badge'
        }
      ],
      isUnlocked: false,
      progress: 0,
      maxProgress: 10
    }
  ];
}

// Initialize battle pass season
function initializeBattlePassSeason(): BattlePassSeason {
  const now = new Date();
  const endDate = new Date(now);
  endDate.setDate(endDate.getDate() + 30); // 30-day season

  return {
    id: 'season_1_cyber_uprising',
    name: 'Cyber Uprising',
    theme: 'Digital warfare meets neon aesthetics',
    startDate: now,
    endDate,
    isActive: true,
    maxTier: 50,
    currentTier: 0,
    currentXP: 0,
    xpPerTier: 1000
  };
}

// Initialize battle pass rewards
function initializeBattlePassRewards(): BattlePassReward[] {
  const rewards: BattlePassReward[] = [];

  for (let tier = 1; tier <= 50; tier++) {
    // Free reward
    rewards.push({
      tier,
      type: 'free',
      rewardType: tier % 10 === 0 ? 'cosmetic' : 'xp_boost',
      name: tier % 10 === 0 ? `Tier ${tier} Emblem` : 'XP Boost',
      description: tier % 10 === 0 ? `Exclusive emblem for reaching tier ${tier}` : '+50% XP for next battle',
      icon: tier % 10 === 0 ? '🏅' : '⚡',
      rarity: tier % 10 === 0 ? 'rare' : 'common',
      isUnlocked: false
    });

    // Premium reward
    rewards.push({
      tier,
      type: 'premium',
      rewardType: tier % 5 === 0 ? 'cosmetic' : (tier % 3 === 0 ? 'special_effect' : 'title'),
      name: tier % 5 === 0 ? `Cyber Skin ${Math.ceil(tier/5)}` : (tier % 3 === 0 ? 'Neon Trail' : `Cyber Title ${tier}`),
      description: tier % 5 === 0 ? `Exclusive cyberpunk bot skin` : (tier % 3 === 0 ? 'Glowing energy trail effect' : 'Prestigious title'),
      icon: tier % 5 === 0 ? '🎨' : (tier % 3 === 0 ? '🌟' : '👑'),
      rarity: tier % 5 === 0 ? 'epic' : (tier % 3 === 0 ? 'rare' : 'common'),
      isUnlocked: false
    });
  }

  return rewards;
}

// Initialize weekly challenges
function initializeWeeklyChallenges(): WeeklyChallenge[] {
  const now = new Date();
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);

  return [
    {
      id: 'weekly_1_speed_demon',
      week: 1,
      name: 'Speed Demon',
      description: 'Win 5 battles using Speed chassis',
      requirements: [
        {
          type: 'win_battles',
          target: 5,
          current: 0,
          constraint: ChassisType.SPEED,
          description: 'Win 5 battles with Speed chassis'
        }
      ],
      rewards: [
        {
          type: 'xp',
          amount: 500,
          description: '+500 XP'
        },
        {
          type: 'battle_pass_xp',
          amount: 1000,
          description: '+1000 Battle Pass XP'
        }
      ],
      isCompleted: false,
      progress: 0,
      maxProgress: 5,
      expiresAt: nextWeek
    },
    {
      id: 'weekly_2_heavy_hitter',
      week: 1,
      name: 'Heavy Hitter',
      description: 'Deal 2000 damage with Cannon weapon',
      requirements: [
        {
          type: 'deal_damage',
          target: 2000,
          current: 0,
          constraint: WeaponType.CANNON,
          description: 'Deal 2000 damage with Cannon'
        }
      ],
      rewards: [
        {
          type: 'xp',
          amount: 300,
          description: '+300 XP'
        },
        {
          type: 'battle_pass_xp',
          amount: 750,
          description: '+750 Battle Pass XP'
        }
      ],
      isCompleted: false,
      progress: 0,
      maxProgress: 2000,
      expiresAt: nextWeek
    }
  ];
}

// Generate random player ID
function generatePlayerId(): string {
  return 'player_' + Math.random().toString(36).substr(2, 9);
}

// Initialize unlockable component collection
export function initializeComponentCollection(): ComponentCollection {
  return {
    chassis: [
      // Basic chassis (always unlocked)
      {
        id: 'speed_basic',
        name: 'Speed Bot',
        description: 'Fast movement, low health',
        icon: '🏃',
        rarity: 'common',
        isUnlocked: true,
        unlockRequirement: {
          type: 'level',
          description: 'Available from start',
          requiredLevel: 1
        },
        category: 'chassis'
      },
      {
        id: 'tank_basic',
        name: 'Tank Bot',
        description: 'Slow movement, high health',
        icon: '🛡️',
        rarity: 'common',
        isUnlocked: true,
        unlockRequirement: {
          type: 'level',
          description: 'Available from start',
          requiredLevel: 1
        },
        category: 'chassis'
      },
      {
        id: 'balanced_basic',
        name: 'Balanced Bot',
        description: 'Medium speed, medium health',
        icon: '⚖️',
        rarity: 'common',
        isUnlocked: true,
        unlockRequirement: {
          type: 'level',
          description: 'Available from start',
          requiredLevel: 1
        },
        category: 'chassis'
      },
      // Advanced chassis (unlockable)
      {
        id: 'speed_advanced',
        name: 'Velocity Demon',
        description: 'Enhanced speed chassis with improved acceleration',
        icon: '⚡',
        rarity: 'rare',
        isUnlocked: false,
        unlockRequirement: {
          type: 'mastery',
          description: 'Reach Speed Mastery Level 10',
          masteryPath: 'chassis.speed.velocityDemon',
          masteryLevel: 10
        },
        category: 'chassis'
      },
      {
        id: 'tank_fortress',
        name: 'Fortress Titan',
        description: 'Ultimate defense chassis with adaptive armor',
        icon: '🏰',
        rarity: 'epic',
        isUnlocked: false,
        unlockRequirement: {
          type: 'achievement',
          description: 'Unlock "Immovable Object" achievement',
          achievementId: 'immovable_object'
        },
        category: 'chassis'
      },
      {
        id: 'stealth_chassis',
        name: 'Phantom Strike',
        description: 'Experimental stealth chassis with cloaking ability',
        icon: '👻',
        rarity: 'legendary',
        isUnlocked: false,
        unlockRequirement: {
          type: 'battle_pass',
          description: 'Battle Pass Tier 25 (Premium)',
          battlePassTier: 25,
          battlePassType: 'premium'
        },
        category: 'chassis'
      }
    ],
    weapons: [
      // Basic weapons (always unlocked)
      {
        id: 'blaster_basic',
        name: 'Blaster',
        description: 'Fast shots, low damage',
        icon: '🔫',
        rarity: 'common',
        isUnlocked: true,
        unlockRequirement: {
          type: 'level',
          description: 'Available from start',
          requiredLevel: 1
        },
        category: 'weapon'
      },
      {
        id: 'cannon_basic',
        name: 'Cannon',
        description: 'Slow shots, high damage',
        icon: '💥',
        rarity: 'common',
        isUnlocked: true,
        unlockRequirement: {
          type: 'level',
          description: 'Available from start',
          requiredLevel: 1
        },
        category: 'weapon'
      },
      {
        id: 'shotgun_basic',
        name: 'Shotgun',
        description: 'Medium speed, medium damage',
        icon: '🔥',
        rarity: 'common',
        isUnlocked: true,
        unlockRequirement: {
          type: 'level',
          description: 'Available from start',
          requiredLevel: 1
        },
        category: 'weapon'
      },
      // Advanced weapons (unlockable)
      {
        id: 'plasma_rifle',
        name: 'Plasma Rifle',
        description: 'Advanced energy weapon with piercing shots',
        icon: '⚡',
        rarity: 'rare',
        isUnlocked: false,
        unlockRequirement: {
          type: 'level',
          description: 'Reach Player Level 10',
          requiredLevel: 10
        },
        category: 'weapon'
      },
      {
        id: 'railgun',
        name: 'Quantum Railgun',
        description: 'Devastating long-range weapon',
        icon: '⚔️',
        rarity: 'epic',
        isUnlocked: false,
        unlockRequirement: {
          type: 'achievement',
          description: 'Unlock "Sharpshooter" achievement',
          achievementId: 'sharpshooter'
        },
        category: 'weapon'
      },
      {
        id: 'void_launcher',
        name: 'Void Launcher',
        description: 'Reality-bending weapon that ignores shields',
        icon: '🌀',
        rarity: 'legendary',
        isUnlocked: false,
        unlockRequirement: {
          type: 'purchase',
          description: 'Available in Premium Store',
          price: {
            currency: 'premium',
            amount: 500
          }
        },
        category: 'weapon'
      }
    ],
    specials: [
      // Basic specials (always unlocked)
      {
        id: 'shield_basic',
        name: 'Shield',
        description: 'Blocks one attack',
        icon: '🛡️',
        rarity: 'common',
        isUnlocked: true,
        unlockRequirement: {
          type: 'level',
          description: 'Available from start',
          requiredLevel: 1
        },
        category: 'special'
      },
      {
        id: 'speed_boost_basic',
        name: 'Speed Boost',
        description: 'Double speed for 3 seconds',
        icon: '⚡',
        rarity: 'common',
        isUnlocked: true,
        unlockRequirement: {
          type: 'level',
          description: 'Available from start',
          requiredLevel: 1
        },
        category: 'special'
      },
      {
        id: 'repair_basic',
        name: 'Repair',
        description: 'Restore 2 HP',
        icon: '🔧',
        rarity: 'common',
        isUnlocked: true,
        unlockRequirement: {
          type: 'level',
          description: 'Available from start',
          requiredLevel: 1
        },
        category: 'special'
      },
      // Advanced specials (unlockable)
      {
        id: 'teleport',
        name: 'Quantum Teleport',
        description: 'Instantly teleport behind enemy',
        icon: '🌀',
        rarity: 'rare',
        isUnlocked: false,
        unlockRequirement: {
          type: 'level',
          description: 'Reach Player Level 15',
          requiredLevel: 15
        },
        category: 'special'
      },
      {
        id: 'time_slow',
        name: 'Temporal Shift',
        description: 'Slow time for 5 seconds',
        icon: '⏳',
        rarity: 'epic',
        isUnlocked: false,
        unlockRequirement: {
          type: 'achievement',
          description: 'Unlock "Time Master" achievement',
          achievementId: 'time_master'
        },
        category: 'special'
      },
      {
        id: 'multi_special',
        name: 'Fusion Core',
        description: 'Use two special abilities simultaneously',
        icon: '💫',
        rarity: 'legendary',
        isUnlocked: false,
        unlockRequirement: {
          type: 'mastery',
          description: 'Master all basic specials',
          masteryPath: 'specials.all.uniqueCombinations',
          masteryLevel: 15
        },
        category: 'special'
      }
    ],
    cosmetics: {
      patterns: [
        {
          id: 'pattern_flames',
          name: 'Flame Pattern',
          description: 'Fiery design for aggressive bots',
          icon: '🔥',
          rarity: 'rare',
          isUnlocked: false,
          unlockRequirement: {
            type: 'achievement',
            description: 'Deal 500 damage with fire weapons',
            achievementId: 'flame_warrior'
          },
          category: 'cosmetic'
        },
        {
          id: 'pattern_lightning',
          name: 'Lightning Pattern',
          description: 'Electric design for speed bots',
          icon: '⚡',
          rarity: 'epic',
          isUnlocked: false,
          unlockRequirement: {
            type: 'battle_pass',
            description: 'Battle Pass Tier 15',
            battlePassTier: 15,
            battlePassType: 'free'
          },
          category: 'cosmetic'
        }
      ],
      colors: [
        {
          id: 'color_gold',
          name: 'Golden Finish',
          description: 'Prestigious gold coloring',
          icon: '🏆',
          rarity: 'legendary',
          isUnlocked: false,
          unlockRequirement: {
            type: 'achievement',
            description: 'Win 100 battles',
            achievementId: 'centurion'
          },
          category: 'cosmetic'
        }
      ],
      decals: [
        {
          id: 'decal_skull',
          name: 'Skull Decal',
          description: 'Intimidating skull marking',
          icon: '💀',
          rarity: 'rare',
          isUnlocked: false,
          unlockRequirement: {
            type: 'achievement',
            description: 'Defeat 50 enemies',
            achievementId: 'grim_reaper'
          },
          category: 'cosmetic'
        }
      ],
      titles: [
        {
          id: 'title_champion',
          name: 'Champion',
          description: 'Title for tournament winners',
          icon: '👑',
          rarity: 'legendary',
          isUnlocked: false,
          unlockRequirement: {
            type: 'achievement',
            description: 'Win a tournament',
            achievementId: 'tournament_champion'
          },
          category: 'cosmetic'
        }
      ],
      badges: [
        {
          id: 'badge_veteran',
          name: 'Veteran Badge',
          description: 'For experienced pilots',
          icon: '🎖️',
          rarity: 'epic',
          isUnlocked: false,
          unlockRequirement: {
            type: 'level',
            description: 'Reach Player Level 25',
            requiredLevel: 25
          },
          category: 'cosmetic'
        }
      ]
    }
  };
}

// Check if a component is unlocked
export function checkComponentUnlock(
  component: UnlockableComponent,
  progressionState: ProgressionState
): { isUnlocked: boolean; progress?: { current: number; required: number } } {
  const { unlockRequirement } = component;

  switch (unlockRequirement.type) {
    case 'level':
      const isLevelUnlocked = progressionState.profile.level.level >= (unlockRequirement.requiredLevel || 1);
      return {
        isUnlocked: isLevelUnlocked,
        progress: {
          current: progressionState.profile.level.level,
          required: unlockRequirement.requiredLevel || 1
        }
      };

    case 'achievement':
      const achievement = progressionState.achievements.find(a => a.id === unlockRequirement.achievementId);
      return {
        isUnlocked: achievement?.isUnlocked || false,
        progress: achievement ? {
          current: achievement.progress,
          required: achievement.maxProgress
        } : undefined
      };

    case 'mastery':
      // Simplified mastery check - would need more complex logic for real implementation
      return {
        isUnlocked: false,
        progress: { current: 0, required: unlockRequirement.masteryLevel || 10 }
      };

    case 'battle_pass':
      const battlePass = progressionState.battlePass;
      const tierUnlocked = battlePass.currentSeason.currentTier >= (unlockRequirement.battlePassTier || 1);
      const typeMatches = unlockRequirement.battlePassType === 'free' || battlePass.isPremium;
      return {
        isUnlocked: tierUnlocked && typeMatches,
        progress: {
          current: battlePass.currentSeason.currentTier,
          required: unlockRequirement.battlePassTier || 1
        }
      };

    case 'purchase':
      // For now, assume not purchased - would need a purchase system
      return {
        isUnlocked: false,
        progress: { current: 0, required: 1 }
      };

    case 'challenge':
      const challenge = progressionState.weeklyChallenges.find(c => c.id === unlockRequirement.challengeId);
      return {
        isUnlocked: challenge?.isCompleted || false,
        progress: challenge ? {
          current: challenge.progress,
          required: challenge.maxProgress
        } : undefined
      };

    default:
      return { isUnlocked: false };
  }
}

// Get all components with their current unlock status
export function getComponentsWithUnlockStatus(
  componentCollection: ComponentCollection,
  progressionState: ProgressionState
): ComponentCollection {
  const updateComponentsArray = (components: UnlockableComponent[]) =>
    components.map(component => {
      const unlockStatus = checkComponentUnlock(component, progressionState);
      return {
        ...component,
        isUnlocked: unlockStatus.isUnlocked,
        unlockRequirement: {
          ...component.unlockRequirement,
          progress: unlockStatus.progress
        }
      };
    });

  return {
    chassis: updateComponentsArray(componentCollection.chassis),
    weapons: updateComponentsArray(componentCollection.weapons),
    specials: updateComponentsArray(componentCollection.specials),
    cosmetics: {
      patterns: updateComponentsArray(componentCollection.cosmetics.patterns),
      colors: updateComponentsArray(componentCollection.cosmetics.colors),
      decals: updateComponentsArray(componentCollection.cosmetics.decals),
      titles: updateComponentsArray(componentCollection.cosmetics.titles),
      badges: updateComponentsArray(componentCollection.cosmetics.badges)
    }
  };
}
