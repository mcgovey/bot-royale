import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  ProgressionState,
  ProgressionEvent,
  XPReward,
  Achievement,
  CombatModifiers,
  BattleStatistics
} from '../types/progression';
import { ChassisType, WeaponType, SpecialType } from '../types/game';
import {
  initializeProgressionState,
  calculateXPReward,
  updateMasteryProgress,
  checkAchievements,
  updateWeeklyChallenges,
  calculateCombatModifiers,
  calculateLevelFromXP
} from '../utils/progressionUtils';

interface ProgressionStore extends ProgressionState {
  // Actions
  recordProgressionEvent: (event: ProgressionEvent) => void;
  awardXP: (reward: XPReward) => void;
  unlockAchievement: (achievementId: string) => void;
  updateBattleStatistics: (stats: Partial<BattleStatistics>) => void;
  getCombatModifiers: (chassis: ChassisType, weapon: WeaponType, special: SpecialType) => CombatModifiers;
  resetProgress: () => void;

  // Battle Pass Actions
  awardBattlePassXP: (amount: number) => void;
  unlockBattlePassReward: (tier: number, type: 'free' | 'premium') => void;
  purchasePremiumBattlePass: () => void;

  // Challenge Actions
  updateChallengeProgress: (challengeId: string, progress: number) => void;
  completeChallenge: (challengeId: string) => void;

  // Utility Actions
  getAchievementProgress: (achievementId: string) => number;
  getMasteryLevel: (type: 'chassis' | 'weapon' | 'special', subtype: string) => number;
  isFeatureUnlocked: (feature: string) => boolean;
}

export const useProgressionStore = create<ProgressionStore>()(
  persist(
    (set, get) => ({
      // Initialize with default state
      ...initializeProgressionState(),

      // Record progression events and update all relevant systems
      recordProgressionEvent: (event: ProgressionEvent) => {
        const state = get();

        // Calculate XP reward based on event
        const xpReward = calculateXPReward(event, state);

        // Update statistics
        const updatedStats = updateStatisticsFromEvent(state.statistics, event);

        // Update mastery progress
        const updatedMasteryTrees = updateMasteryProgress(state.masteryTrees, event);

        // Check for achievement unlocks
        const { updatedAchievements, newUnlocks } = checkAchievements(state.achievements, updatedStats, updatedMasteryTrees);

        // Update weekly challenges
        const updatedChallenges = updateWeeklyChallenges(state.weeklyChallenges, event);

        // Calculate new level
        const newLevel = calculateLevelFromXP(state.profile.level.totalXP + xpReward.amount);

        set({
          profile: {
            ...state.profile,
            level: newLevel,
            lastPlayedAt: new Date(),
            totalBattles: event.type === 'battle_completed' ? state.profile.totalBattles + 1 : state.profile.totalBattles,
            totalWins: event.type === 'battle_won' ? state.profile.totalWins + 1 : state.profile.totalWins,
            totalDamageDealt: state.profile.totalDamageDealt + (event.data.damage || 0),
            winRate: calculateWinRate(state.profile.totalWins + (event.type === 'battle_won' ? 1 : 0), state.profile.totalBattles + (event.type === 'battle_completed' ? 1 : 0))
          },
          statistics: updatedStats,
          masteryTrees: updatedMasteryTrees,
          achievements: updatedAchievements,
          weeklyChallenges: updatedChallenges,
          recentXPGains: [xpReward, ...state.recentXPGains.slice(0, 9)] // Keep last 10
        });

        // Award additional XP for achievement unlocks
        newUnlocks.forEach((achievement: Achievement) => {
          get().awardXP({
            source: 'achievement',
            amount: getAchievementXPReward(achievement.rarity),
            description: `Achievement unlocked: ${achievement.name}`
          });
        });
      },

      // Award XP and handle level ups
      awardXP: (reward: XPReward) => {
        const state = get();
        const newTotalXP = state.profile.level.totalXP + reward.amount;
        const newLevel = calculateLevelFromXP(newTotalXP);

        set({
          profile: {
            ...state.profile,
            level: newLevel
          },
          recentXPGains: [reward, ...state.recentXPGains.slice(0, 9)]
        });
      },

      // Manually unlock achievements (for testing or special events)
      unlockAchievement: (achievementId: string) => {
        const state = get();
        const updatedAchievements = state.achievements.map(achievement =>
          achievement.id === achievementId
            ? { ...achievement, isUnlocked: true, unlockedAt: new Date() }
            : achievement
        );

        set({ achievements: updatedAchievements });
      },

      // Update battle statistics
      updateBattleStatistics: (stats: Partial<BattleStatistics>) => {
        const state = get();
        set({
          statistics: {
            ...state.statistics,
            ...stats
          }
        });
      },

      // Get combat modifiers based on current mastery levels
      getCombatModifiers: (chassis: ChassisType, weapon: WeaponType, special: SpecialType) => {
        const state = get();
        return calculateCombatModifiers(state.masteryTrees, chassis, weapon, special);
      },

      // Reset all progression (for testing)
      resetProgress: () => {
        set(initializeProgressionState());
      },

      // Battle Pass XP
      awardBattlePassXP: (amount: number) => {
        const state = get();
        const newXP = state.battlePass.currentSeason.currentXP + amount;
        const newTier = Math.floor(newXP / state.battlePass.currentSeason.xpPerTier);
        const cappedTier = Math.min(newTier, state.battlePass.currentSeason.maxTier);

        set({
          battlePass: {
            ...state.battlePass,
            currentSeason: {
              ...state.battlePass.currentSeason,
              currentXP: newXP,
              currentTier: cappedTier
            }
          }
        });
      },

      // Unlock battle pass rewards
      unlockBattlePassReward: (tier: number, type: 'free' | 'premium') => {
        const state = get();
        const updatedRewards = state.battlePass.rewards.map(reward =>
          reward.tier === tier && reward.type === type
            ? { ...reward, isUnlocked: true }
            : reward
        );

        set({
          battlePass: {
            ...state.battlePass,
            rewards: updatedRewards
          }
        });
      },

      // Purchase premium battle pass
      purchasePremiumBattlePass: () => {
        const state = get();
        set({
          battlePass: {
            ...state.battlePass,
            isPremium: true
          }
        });
      },

      // Update challenge progress
      updateChallengeProgress: (challengeId: string, progress: number) => {
        const state = get();
        const updatedChallenges = state.weeklyChallenges.map(challenge =>
          challenge.id === challengeId
            ? {
                ...challenge,
                progress: Math.min(progress, challenge.maxProgress),
                isCompleted: progress >= challenge.maxProgress
              }
            : challenge
        );

        set({ weeklyChallenges: updatedChallenges });
      },

      // Complete a challenge and award rewards
      completeChallenge: (challengeId: string) => {
        const state = get();
        const challenge = state.weeklyChallenges.find(c => c.id === challengeId);

        if (challenge && !challenge.isCompleted) {
          // Award challenge rewards
          challenge.rewards.forEach(reward => {
            if (reward.type === 'xp') {
              get().awardXP({
                source: 'challenge',
                amount: reward.amount || 0,
                description: `Challenge completed: ${challenge.name}`
              });
            } else if (reward.type === 'battle_pass_xp') {
              get().awardBattlePassXP(reward.amount || 0);
            }
          });

          // Mark as completed
          get().updateChallengeProgress(challengeId, challenge.maxProgress);
        }
      },

      // Get achievement progress
      getAchievementProgress: (achievementId: string) => {
        const state = get();
        const achievement = state.achievements.find(a => a.id === achievementId);
        return achievement ? achievement.progress / achievement.maxProgress : 0;
      },

      // Get mastery level for specific component
      getMasteryLevel: (type: 'chassis' | 'weapon' | 'special', subtype: string) => {
        const state = get();

        switch (type) {
          case 'chassis':
            const chassisType = subtype as ChassisType;
            if (chassisType === ChassisType.SPEED) {
              return Math.max(
                state.masteryTrees.chassis[chassisType].velocityDemon.currentLevel,
                state.masteryTrees.chassis[chassisType].phantomDash.currentLevel,
                state.masteryTrees.chassis[chassisType].lightSpeed.currentLevel
              );
            } else if (chassisType === ChassisType.TANK) {
              return Math.max(
                state.masteryTrees.chassis[chassisType].fortress.currentLevel,
                state.masteryTrees.chassis[chassisType].juggernaut.currentLevel,
                state.masteryTrees.chassis[chassisType].unstoppableForce.currentLevel
              );
            } else {
              return Math.max(
                state.masteryTrees.chassis[chassisType].adaptive.currentLevel,
                state.masteryTrees.chassis[chassisType].versatile.currentLevel,
                state.masteryTrees.chassis[chassisType].perfectHarmony.currentLevel
              );
            }
          case 'weapon':
            const weaponType = subtype as WeaponType;
            return Math.max(
              state.masteryTrees.weapons[weaponType].accuracy.currentLevel,
              state.masteryTrees.weapons[weaponType].damage.currentLevel
            );
          case 'special':
            const specialType = subtype as SpecialType;
            return Math.max(
              state.masteryTrees.specials[specialType].cooldownReduction.currentLevel,
              state.masteryTrees.specials[specialType].enhancedPower.currentLevel
            );
          default:
            return 0;
        }
      },

      // Check if a feature is unlocked
      isFeatureUnlocked: (feature: string) => {
        const state = get();

        // Check level requirements
        if (feature === 'battle_pass' && state.profile.level.level < 5) return false;
        if (feature === 'weekly_challenges' && state.profile.level.level < 3) return false;
        if (feature === 'mastery_trees' && state.profile.level.level < 10) return false;

        // Check mastery unlocks
        if (feature.startsWith('mastery_')) {
          const masteryType = feature.split('_')[1];
          return state.profile.level.level >= 10;
        }

        return true;
      }
    }),
    {
      name: 'battlebot-progression',
      version: 1,
    }
  )
);

// Helper functions
function updateStatisticsFromEvent(stats: BattleStatistics, event: ProgressionEvent): BattleStatistics {
  const updated = { ...stats };

  switch (event.type) {
    case 'battle_completed':
      updated.battlesPlayed += 1;
      if (event.data.battleDuration) {
        updated.timePlayedSeconds += event.data.battleDuration;
      }
      break;
    case 'battle_won':
      updated.battlesWon += 1;
      updated.currentWinStreak += 1;
      updated.longestWinStreak = Math.max(updated.longestWinStreak, updated.currentWinStreak);
      break;
    case 'damage_dealt':
      updated.totalDamageDealt += event.data.damage || 0;
      break;
    case 'shot_fired':
      updated.shotsFired += 1;
      break;
    case 'shot_hit':
      updated.shotsHit += 1;
      updated.accuracy = updated.shotsFired > 0 ? (updated.shotsHit / updated.shotsFired) * 100 : 0;
      break;
    case 'perfect_battle':
      updated.perfectBattles += 1;
      break;
  }

  // Update favorite loadout tracking
  if (event.data.chassisUsed) {
    updated.favoriteChassisType = event.data.chassisUsed;
  }
  if (event.data.weaponUsed) {
    updated.favoriteWeaponType = event.data.weaponUsed;
  }
  if (event.data.specialUsed) {
    updated.favoriteSpecialType = event.data.specialUsed;
  }

  return updated;
}

function calculateWinRate(wins: number, total: number): number {
  return total > 0 ? (wins / total) * 100 : 0;
}

function getAchievementXPReward(rarity: string): number {
  switch (rarity) {
    case 'common': return 50;
    case 'rare': return 100;
    case 'epic': return 200;
    case 'legendary': return 500;
    default: return 25;
  }
}
