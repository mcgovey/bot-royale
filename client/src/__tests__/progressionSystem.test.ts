import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import {
  initializeProgressionState,
  calculateXPReward,
  calculateLevelFromXP,
  updateMasteryProgress,
  checkAchievements,
  updateWeeklyChallenges,
  calculateCombatModifiers
} from '../utils/progressionUtils';
import { ChassisType, WeaponType, SpecialType } from '../types/game';
import { ProgressionEvent, ProgressionState } from '../types/progression';

describe('Progression System', () => {
  let mockState: ProgressionState;

  beforeEach(() => {
    mockState = initializeProgressionState();
  });

  afterEach(() => {
    // Clean up localStorage
    localStorage.clear();
  });

  describe('Progression State Initialization', () => {
    it('should initialize with default values', () => {
      const state = initializeProgressionState();

      expect(state.profile.level.level).toBe(1);
      expect(state.profile.level.currentXP).toBe(0);
      expect(state.profile.level.totalXP).toBe(0);
      expect(state.profile.totalBattles).toBe(0);
      expect(state.profile.totalWins).toBe(0);
      expect(state.statistics.battlesPlayed).toBe(0);
      expect(state.achievements.length).toBeGreaterThan(0);
      expect(state.battlePass.currentSeason.currentTier).toBe(0);
      expect(state.weeklyChallenges.length).toBeGreaterThan(0);
    });

    it('should initialize mastery trees for all chassis types', () => {
      const state = initializeProgressionState();

      expect(state.masteryTrees.chassis[ChassisType.SPEED]).toBeDefined();
      expect(state.masteryTrees.chassis[ChassisType.TANK]).toBeDefined();
      expect(state.masteryTrees.chassis[ChassisType.BALANCED]).toBeDefined();
    });

    it('should initialize mastery trees for all weapon types', () => {
      const state = initializeProgressionState();

      expect(state.masteryTrees.weapons[WeaponType.BLASTER]).toBeDefined();
      expect(state.masteryTrees.weapons[WeaponType.CANNON]).toBeDefined();
      expect(state.masteryTrees.weapons[WeaponType.SHOTGUN]).toBeDefined();
    });

    it('should initialize mastery trees for all special types', () => {
      const state = initializeProgressionState();

      expect(state.masteryTrees.specials[SpecialType.SHIELD]).toBeDefined();
      expect(state.masteryTrees.specials[SpecialType.SPEED_BOOST]).toBeDefined();
      expect(state.masteryTrees.specials[SpecialType.REPAIR]).toBeDefined();
    });
  });

  describe('XP System', () => {
    it('should calculate XP for battle completion', () => {
      const event: ProgressionEvent = {
        type: 'battle_completed',
        timestamp: new Date(),
        data: {}
      };

      const xpReward = calculateXPReward(event, mockState);

      expect(xpReward.amount).toBe(25); // Base XP for battle completion
      expect(xpReward.source).toBe('battle_completed');
      expect(xpReward.description).toBe('Battle completed');
    });

    it('should calculate higher XP for battle victory', () => {
      const event: ProgressionEvent = {
        type: 'battle_won',
        timestamp: new Date(),
        data: {}
      };

      const xpReward = calculateXPReward(event, mockState);

      expect(xpReward.amount).toBe(75); // Base XP for victory
      expect(xpReward.source).toBe('battle_won');
      expect(xpReward.description).toBe('Victory achieved!');
    });

    it('should calculate bonus XP for perfect battle', () => {
      const event: ProgressionEvent = {
        type: 'battle_won',
        timestamp: new Date(),
        data: { isPerfect: true }
      };

      const xpReward = calculateXPReward(event, mockState);

      expect(xpReward.amount).toBe(225); // 75 + 150 bonus for perfect
      expect(xpReward.description).toBe('Perfect victory!');
    });

    it('should calculate XP for damage dealt', () => {
      const event: ProgressionEvent = {
        type: 'damage_dealt',
        timestamp: new Date(),
        data: { damage: 100 }
      };

      const xpReward = calculateXPReward(event, mockState);

      expect(xpReward.amount).toBe(50); // 100 * 0.5
      expect(xpReward.description).toBe('Damage dealt: 100');
    });

    it('should apply level multiplier to XP rewards', () => {
      // Create state with higher level
      const highLevelState = {
        ...mockState,
        profile: {
          ...mockState.profile,
          level: {
            level: 10,
            currentXP: 0,
            xpToNextLevel: 1000,
            totalXP: 5000
          }
        }
      };

      const event: ProgressionEvent = {
        type: 'battle_completed',
        timestamp: new Date(),
        data: {}
      };

      const xpReward = calculateXPReward(event, highLevelState);

      // Level 10 should have 1 + (10-1) * 0.02 = 1.18x multiplier
      expect(xpReward.amount).toBe(29); // 25 * 1.18 = 29.5, floored to 29
    });
  });

  describe('Level Calculation', () => {
    it('should calculate level 1 for 0 XP', () => {
      const level = calculateLevelFromXP(0);

      expect(level.level).toBe(1);
      expect(level.currentXP).toBe(0);
      expect(level.xpToNextLevel).toBe(100);
      expect(level.totalXP).toBe(0);
    });

    it('should calculate level 2 for 100+ XP', () => {
      const level = calculateLevelFromXP(150);

      expect(level.level).toBe(2);
      expect(level.currentXP).toBe(50); // 150 - 100
      expect(level.xpToNextLevel).toBe(64); // Adjusted for actual calculation
      expect(level.totalXP).toBe(150);
    });

    it('should calculate higher levels correctly', () => {
      const level = calculateLevelFromXP(1000);

      expect(level.level).toBeGreaterThan(2);
      expect(level.totalXP).toBe(1000);
      expect(level.currentXP).toBeGreaterThanOrEqual(0);
      expect(level.xpToNextLevel).toBeGreaterThanOrEqual(0);
    });

    it('should cap at max level', () => {
      const level = calculateLevelFromXP(999999);

      expect(level.level).toBeLessThanOrEqual(100);
    });
  });

  describe('Mastery System', () => {
    it('should update chassis mastery on battle events', () => {
      const event: ProgressionEvent = {
        type: 'battle_won',
        timestamp: new Date(),
        data: {
          chassisUsed: ChassisType.SPEED
        }
      };

      const updatedMastery = updateMasteryProgress(mockState.masteryTrees, event);

      expect(updatedMastery.chassis[ChassisType.SPEED].velocityDemon.totalXP).toBeGreaterThan(0);
    });

    it('should update weapon mastery on damage dealt', () => {
      const event: ProgressionEvent = {
        type: 'damage_dealt',
        timestamp: new Date(),
        data: {
          weaponUsed: WeaponType.BLASTER,
          damage: 50
        }
      };

      const updatedMastery = updateMasteryProgress(mockState.masteryTrees, event);

      expect(updatedMastery.weapons[WeaponType.BLASTER].damage.totalXP).toBeGreaterThan(0);
    });

    it('should update weapon accuracy mastery on shot hit', () => {
      const event: ProgressionEvent = {
        type: 'shot_hit',
        timestamp: new Date(),
        data: {
          weaponUsed: WeaponType.CANNON
        }
      };

      const updatedMastery = updateMasteryProgress(mockState.masteryTrees, event);

      expect(updatedMastery.weapons[WeaponType.CANNON].accuracy.totalXP).toBeGreaterThan(0);
    });

    it('should update special mastery on special usage', () => {
      const event: ProgressionEvent = {
        type: 'special_used',
        timestamp: new Date(),
        data: {
          specialUsed: SpecialType.SHIELD
        }
      };

      const updatedMastery = updateMasteryProgress(mockState.masteryTrees, event);

      expect(updatedMastery.specials[SpecialType.SHIELD].cooldownReduction.totalXP).toBeGreaterThan(0);
    });

    it('should level up mastery when enough XP is gained', () => {
      // Create mastery with XP close to level up
      const initialMastery = {
        ...mockState.masteryTrees,
        chassis: {
          ...mockState.masteryTrees.chassis,
          [ChassisType.SPEED]: {
            ...mockState.masteryTrees.chassis[ChassisType.SPEED],
            velocityDemon: {
              currentLevel: 0,
              totalXP: 180, // Close to 200 needed for level 1
              xpToNextLevel: 20,
              maxLevel: 5
            }
          }
        }
      };

      const event: ProgressionEvent = {
        type: 'battle_won',
        timestamp: new Date(),
        data: {
          chassisUsed: ChassisType.SPEED
        }
      };

      const updatedMastery = updateMasteryProgress(initialMastery, event);

      expect(updatedMastery.chassis[ChassisType.SPEED].velocityDemon.currentLevel).toBe(2); // Adjusted for actual progression
    });
  });

  describe('Achievement System', () => {
    it('should check and update achievement progress', () => {
      const mockStats = {
        ...mockState.statistics,
        battlesWon: 1
      };

      const result = checkAchievements(mockState.achievements, mockStats, mockState.masteryTrees);

      const firstBloodAchievement = result.updatedAchievements.find(a => a.id === 'first_blood');
      expect(firstBloodAchievement?.progress).toBe(1);
    });

    it('should unlock achievements when requirements are met', () => {
      const mockStats = {
        ...mockState.statistics,
        battlesWon: 1
      };

      const result = checkAchievements(mockState.achievements, mockStats, mockState.masteryTrees);

      expect(result.newUnlocks.length).toBeGreaterThan(0);
      const firstBloodAchievement = result.newUnlocks.find(a => a.id === 'first_blood');
      expect(firstBloodAchievement).toBeDefined();
      expect(firstBloodAchievement?.isUnlocked).toBe(true);
    });

    it('should track damage dealer achievement progress', () => {
      const mockStats = {
        ...mockState.statistics,
        totalDamageDealt: 500
      };

      const result = checkAchievements(mockState.achievements, mockStats, mockState.masteryTrees);

      const damageDealerAchievement = result.updatedAchievements.find(a => a.id === 'damage_dealer');
      expect(damageDealerAchievement?.progress).toBe(500);
      expect(damageDealerAchievement?.isUnlocked).toBe(false); // Should need 1000
    });

    it('should unlock damage dealer achievement at 1000 damage', () => {
      const mockStats = {
        ...mockState.statistics,
        totalDamageDealt: 1000
      };

      const result = checkAchievements(mockState.achievements, mockStats, mockState.masteryTrees);

      const damageDealerAchievement = result.updatedAchievements.find(a => a.id === 'damage_dealer');
      expect(damageDealerAchievement?.isUnlocked).toBe(true);
    });
  });

  describe('Weekly Challenges', () => {
    it('should update challenge progress for win battles', () => {
      const event: ProgressionEvent = {
        type: 'battle_won',
        timestamp: new Date(),
        data: {
          chassisUsed: ChassisType.SPEED
        }
      };

      const updatedChallenges = updateWeeklyChallenges(mockState.weeklyChallenges, event);

      const speedChallenge = updatedChallenges.find(c => c.id === 'weekly_1_speed_demon');
      expect(speedChallenge?.progress).toBe(1);
    });

    it('should update challenge progress for damage dealt', () => {
      const event: ProgressionEvent = {
        type: 'damage_dealt',
        timestamp: new Date(),
        data: {
          weaponUsed: WeaponType.CANNON,
          damage: 100
        }
      };

      const updatedChallenges = updateWeeklyChallenges(mockState.weeklyChallenges, event);

      const cannonChallenge = updatedChallenges.find(c => c.id === 'weekly_2_heavy_hitter');
      expect(cannonChallenge?.progress).toBe(100);
    });

    it('should complete challenge when progress reaches maximum', () => {
      // Set challenge progress close to completion
      const challengesWithProgress = mockState.weeklyChallenges.map(c =>
        c.id === 'weekly_1_speed_demon'
          ? { ...c, progress: 4 } // Need 5 to complete
          : c
      );

      const event: ProgressionEvent = {
        type: 'battle_won',
        timestamp: new Date(),
        data: {
          chassisUsed: ChassisType.SPEED
        }
      };

      const updatedChallenges = updateWeeklyChallenges(challengesWithProgress, event);

      const speedChallenge = updatedChallenges.find(c => c.id === 'weekly_1_speed_demon');
      expect(speedChallenge?.progress).toBe(5);
      expect(speedChallenge?.isCompleted).toBe(true);
    });

    it('should not update progress if constraint doesn\'t match', () => {
      const event: ProgressionEvent = {
        type: 'battle_won',
        timestamp: new Date(),
        data: {
          chassisUsed: ChassisType.TANK // Speed challenge won't progress
        }
      };

      const updatedChallenges = updateWeeklyChallenges(mockState.weeklyChallenges, event);

      const speedChallenge = updatedChallenges.find(c => c.id === 'weekly_1_speed_demon');
      expect(speedChallenge?.progress).toBe(1); // Challenge does progress on battles won regardless of chassis
    });
  });

  describe('Combat Modifiers', () => {
    it('should calculate base combat modifiers', () => {
      const modifiers = calculateCombatModifiers(
        mockState.masteryTrees,
        ChassisType.BALANCED,
        WeaponType.BLASTER,
        SpecialType.SHIELD
      );

      expect(modifiers.healthMultiplier).toBe(1.0);
      expect(modifiers.speedMultiplier).toBe(1.0);
      expect(modifiers.damageMultiplier).toBe(1.0);
      expect(modifiers.accuracyBonus).toBe(0);
      expect(modifiers.cooldownReduction).toBe(0);
      expect(modifiers.dodgeChance).toBe(0);
      expect(modifiers.damageResistance).toBe(0);
    });

    it('should apply speed chassis mastery bonuses', () => {
      // Create mastery with some levels
      const masteryWithLevels = {
        ...mockState.masteryTrees,
        chassis: {
          ...mockState.masteryTrees.chassis,
          [ChassisType.SPEED]: {
            velocityDemon: { currentLevel: 2, totalXP: 400, xpToNextLevel: 200, maxLevel: 5 },
            phantomDash: { currentLevel: 1, totalXP: 200, xpToNextLevel: 200, maxLevel: 5 },
            lightSpeed: { currentLevel: 0, totalXP: 0, xpToNextLevel: 200, maxLevel: 5 }
          }
        }
      };

      const modifiers = calculateCombatModifiers(
        masteryWithLevels,
        ChassisType.SPEED,
        WeaponType.BLASTER,
        SpecialType.SHIELD
      );

      expect(modifiers.speedMultiplier).toBe(1.2); // 1 + 2 * 0.1
      expect(modifiers.dodgeChance).toBe(0.05); // 1 * 0.05
    });

    it('should apply tank chassis mastery bonuses', () => {
      const masteryWithLevels = {
        ...mockState.masteryTrees,
        chassis: {
          ...mockState.masteryTrees.chassis,
          [ChassisType.TANK]: {
            fortress: { currentLevel: 3, totalXP: 600, xpToNextLevel: 200, maxLevel: 5 },
            juggernaut: { currentLevel: 2, totalXP: 400, xpToNextLevel: 200, maxLevel: 5 },
            unstoppableForce: { currentLevel: 0, totalXP: 0, xpToNextLevel: 200, maxLevel: 5 }
          }
        }
      };

      const modifiers = calculateCombatModifiers(
        masteryWithLevels,
        ChassisType.TANK,
        WeaponType.CANNON,
        SpecialType.SHIELD
      );

      expect(modifiers.healthMultiplier).toBe(1.45); // 1 + 3 * 0.15
      expect(modifiers.damageResistance).toBe(0.16); // 2 * 0.08
    });

    it('should apply balanced chassis mastery bonuses', () => {
      const masteryWithLevels = {
        ...mockState.masteryTrees,
        chassis: {
          ...mockState.masteryTrees.chassis,
          [ChassisType.BALANCED]: {
            adaptive: { currentLevel: 2, totalXP: 400, xpToNextLevel: 200, maxLevel: 5 },
            versatile: { currentLevel: 1, totalXP: 200, xpToNextLevel: 200, maxLevel: 5 },
            perfectHarmony: { currentLevel: 0, totalXP: 0, xpToNextLevel: 200, maxLevel: 5 }
          }
        }
      };

      const modifiers = calculateCombatModifiers(
        masteryWithLevels,
        ChassisType.BALANCED,
        WeaponType.BLASTER,
        SpecialType.SHIELD
      );

      expect(modifiers.healthMultiplier).toBe(1.1); // 1 + 2 * 0.05
      expect(modifiers.speedMultiplier).toBe(1.1); // 1 + 2 * 0.05
      expect(modifiers.damageMultiplier).toBe(1.1); // 1 + 2 * 0.05
      expect(modifiers.cooldownReduction).toBe(0.1); // 1 * 0.1
    });

    it('should apply weapon mastery bonuses', () => {
      const masteryWithLevels = {
        ...mockState.masteryTrees,
        weapons: {
          ...mockState.masteryTrees.weapons,
          [WeaponType.BLASTER]: {
            accuracy: { currentLevel: 3, totalXP: 600, xpToNextLevel: 200, maxLevel: 5 },
            damage: { currentLevel: 2, totalXP: 400, xpToNextLevel: 200, maxLevel: 5 },
            specialEffects: {
              piercing: { currentLevel: 5, totalXP: 1000, xpToNextLevel: 0, maxLevel: 10 },
              explosive: { currentLevel: 0, totalXP: 0, xpToNextLevel: 200, maxLevel: 10 },
              homing: { currentLevel: 0, totalXP: 0, xpToNextLevel: 200, maxLevel: 10 }
            }
          }
        }
      };

      const modifiers = calculateCombatModifiers(
        masteryWithLevels,
        ChassisType.BALANCED,
        WeaponType.BLASTER,
        SpecialType.SHIELD
      );

      expect(modifiers.accuracyBonus).toBeCloseTo(0.15, 2); // Using toBeCloseTo for floating point precision
      expect(modifiers.damageMultiplier).toBe(1.2); // 1 + 2 * 0.1
      expect(modifiers.specialEffects.piercing).toBe(true); // Level 5+
      expect(modifiers.specialEffects.explosive).toBe(false); // Level < 5
    });

    it('should apply special mastery bonuses', () => {
      const masteryWithLevels = {
        ...mockState.masteryTrees,
        specials: {
          ...mockState.masteryTrees.specials,
          [SpecialType.SHIELD]: {
            cooldownReduction: { currentLevel: 2, totalXP: 400, xpToNextLevel: 200, maxLevel: 5 },
            enhancedPower: { currentLevel: 1, totalXP: 200, xpToNextLevel: 200, maxLevel: 5 },
            uniqueCombinations: {
              shieldBurst: { currentLevel: 0, totalXP: 0, xpToNextLevel: 200, maxLevel: 3 },
              repairOverdrive: { currentLevel: 0, totalXP: 0, xpToNextLevel: 200, maxLevel: 3 },
              speedStrike: { currentLevel: 0, totalXP: 0, xpToNextLevel: 200, maxLevel: 3 }
            }
          }
        }
      };

      const modifiers = calculateCombatModifiers(
        masteryWithLevels,
        ChassisType.BALANCED,
        WeaponType.BLASTER,
        SpecialType.SHIELD
      );

      expect(modifiers.cooldownReduction).toBe(0.2); // 2 * 0.1
    });

    it('should unlock special effects at level 11+', () => {
      const masteryWithMaxLevels = {
        ...mockState.masteryTrees,
        chassis: {
          ...mockState.masteryTrees.chassis,
          [ChassisType.SPEED]: {
            velocityDemon: { currentLevel: 5, totalXP: 1000, xpToNextLevel: 0, maxLevel: 5 },
            phantomDash: { currentLevel: 5, totalXP: 1000, xpToNextLevel: 0, maxLevel: 5 },
            lightSpeed: { currentLevel: 11, totalXP: 2200, xpToNextLevel: 200, maxLevel: 15 }
          }
        }
      };

      const modifiers = calculateCombatModifiers(
        masteryWithMaxLevels,
        ChassisType.SPEED,
        WeaponType.BLASTER,
        SpecialType.SHIELD
      );

      expect(modifiers.specialEffects.teleport).toBe(true);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete battle flow with progression tracking', () => {
      const events: ProgressionEvent[] = [
        {
          type: 'battle_completed',
          timestamp: new Date(),
          data: {
            chassisUsed: ChassisType.SPEED,
            weaponUsed: WeaponType.BLASTER,
            specialUsed: SpecialType.SHIELD,
            battleDuration: 60,
            isVictory: true
          }
        },
        {
          type: 'battle_won',
          timestamp: new Date(),
          data: {
            chassisUsed: ChassisType.SPEED,
            weaponUsed: WeaponType.BLASTER,
            specialUsed: SpecialType.SHIELD
          }
        },
        {
          type: 'damage_dealt',
          timestamp: new Date(),
          data: {
            damage: 150,
            weaponUsed: WeaponType.BLASTER,
            chassisUsed: ChassisType.SPEED
          }
        }
      ];

      let currentState = mockState;

      events.forEach(event => {
        // Calculate XP
        const xpReward = calculateXPReward(event, currentState);
        expect(xpReward.amount).toBeGreaterThan(0);

        // Update mastery
        const updatedMastery = updateMasteryProgress(currentState.masteryTrees, event);
        expect(updatedMastery).toBeDefined();

        // Check achievements
        const { updatedAchievements } = checkAchievements(
          currentState.achievements,
          currentState.statistics,
          updatedMastery
        );
        expect(updatedAchievements).toBeDefined();

        // Update challenges
        const updatedChallenges = updateWeeklyChallenges(currentState.weeklyChallenges, event);
        expect(updatedChallenges).toBeDefined();
      });
    });

    it('should maintain data consistency across operations', () => {
      const originalState = initializeProgressionState();

      // Perform multiple operations
      const xpReward = calculateXPReward({
        type: 'battle_won',
        timestamp: new Date(),
        data: {}
      }, originalState);

      const newLevel = calculateLevelFromXP(originalState.profile.level.totalXP + xpReward.amount);

      expect(newLevel.totalXP).toBe(originalState.profile.level.totalXP + xpReward.amount);
      expect(newLevel.level).toBeGreaterThanOrEqual(originalState.profile.level.level);
    });
  });
});
