import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useProgressionStore } from '../store/progressionStore';
import { Achievement, MasteryProgress } from '../types/progression';
import { ChassisType, WeaponType, SpecialType } from '../types/game';

interface ProgressionDashboardProps {
  onClose: () => void;
}

const ProgressionDashboard: React.FC<ProgressionDashboardProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'mastery' | 'battlepass' | 'challenges'>('overview');
  const progression = useProgressionStore();

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'achievements', name: 'Achievements', icon: '🏆' },
    { id: 'mastery', name: 'Mastery', icon: '⚡' },
    { id: 'battlepass', name: 'Battle Pass', icon: '🎖️' },
    { id: 'challenges', name: 'Challenges', icon: '🎯' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-dark-surface border border-cyber-blue rounded-lg w-full max-w-6xl h-5/6 p-6 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-cyber-blue to-cyber-purple rounded-full flex items-center justify-center text-2xl font-bold">
              {progression.profile.level.level}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-cyber-blue glow-text">
                {progression.profile.username}
              </h1>
              <p className="text-gray-400">Level {progression.profile.level.level} • {progression.profile.totalWins}W / {progression.profile.totalBattles}B</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-3xl font-bold"
          >
            ×
          </button>
        </div>

        {/* XP Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">Experience</span>
            <span className="text-sm text-cyber-blue">
              {progression.profile.level.currentXP} / {progression.profile.level.currentXP + progression.profile.level.xpToNextLevel} XP
            </span>
          </div>
          <div className="w-full bg-dark-bg rounded-full h-3 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-cyber-blue to-cyber-purple"
              style={{
                width: `${(progression.profile.level.currentXP / (progression.profile.level.currentXP + progression.profile.level.xpToNextLevel)) * 100}%`
              }}
              initial={{ width: 0 }}
              animate={{
                width: `${(progression.profile.level.currentXP / (progression.profile.level.currentXP + progression.profile.level.xpToNextLevel)) * 100}%`
              }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 bg-dark-bg rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-cyber-blue text-dark-bg'
                  : 'text-gray-400 hover:text-white hover:bg-dark-surface'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'achievements' && <AchievementsTab />}
          {activeTab === 'mastery' && <MasteryTab />}
          {activeTab === 'battlepass' && <BattlePassTab />}
          {activeTab === 'challenges' && <ChallengesTab />}
        </div>
      </motion.div>
    </motion.div>
  );
};

// Overview Tab Component
const OverviewTab: React.FC = () => {
  const progression = useProgressionStore();
  const recentAchievements = progression.achievements.filter(a => a.isUnlocked).slice(-3);
  const stats = progression.statistics;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Statistics Card */}
      <div className="panel-cyber p-4">
        <h3 className="text-lg font-bold text-cyber-green mb-4">📈 Statistics</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-400">Win Rate</span>
            <span className="text-cyber-green">{progression.profile.winRate.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Total Damage</span>
            <span className="text-cyber-red">{stats.totalDamageDealt.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Accuracy</span>
            <span className="text-cyber-blue">{stats.accuracy.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Win Streak</span>
            <span className="text-cyber-yellow">{stats.currentWinStreak}</span>
          </div>
        </div>
      </div>

      {/* Recent XP Gains */}
      <div className="panel-cyber p-4">
        <h3 className="text-lg font-bold text-cyber-blue mb-4">⚡ Recent XP</h3>
        <div className="space-y-2">
          {progression.recentXPGains.slice(0, 5).map((xp, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex justify-between items-center"
            >
              <span className="text-sm text-gray-400">{xp.description}</span>
              <span className="text-cyber-green">+{xp.amount} XP</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Achievements */}
      <div className="panel-cyber p-4">
        <h3 className="text-lg font-bold text-cyber-purple mb-4">🏆 Recent Achievements</h3>
        <div className="space-y-2">
          {recentAchievements.length > 0 ? recentAchievements.map((achievement) => (
            <div key={achievement.id} className="flex items-center space-x-3">
              <span className="text-2xl">{achievement.icon}</span>
              <div>
                <p className="text-sm font-medium text-white">{achievement.name}</p>
                <p className="text-xs text-gray-400">{achievement.description}</p>
              </div>
            </div>
          )) : (
            <p className="text-gray-400 text-sm">No achievements unlocked yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Achievements Tab Component
const AchievementsTab: React.FC = () => {
  const progression = useProgressionStore();
  const [filter, setFilter] = useState<'all' | 'combat' | 'builder' | 'social' | 'progression'>('all');

  const filteredAchievements = progression.achievements.filter(
    achievement => filter === 'all' || achievement.category === filter
  );

  const categories = [
    { id: 'all', name: 'All', icon: '🎯' },
    { id: 'combat', name: 'Combat', icon: '⚔️' },
    { id: 'builder', name: 'Builder', icon: '🔧' },
    { id: 'social', name: 'Social', icon: '👥' },
    { id: 'progression', name: 'Progression', icon: '📈' }
  ];

  return (
    <div>
      {/* Category Filter */}
      <div className="flex space-x-2 mb-6 overflow-x-auto">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setFilter(category.id as any)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-200 ${
              filter === category.id
                ? 'bg-cyber-blue text-dark-bg'
                : 'bg-dark-bg text-gray-400 hover:text-white hover:bg-dark-surface'
            }`}
          >
            <span className="mr-2">{category.icon}</span>
            {category.name}
          </button>
        ))}
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAchievements.map((achievement, index) => (
          <AchievementCard key={achievement.id} achievement={achievement} index={index} />
        ))}
      </div>
    </div>
  );
};

// Achievement Card Component
const AchievementCard: React.FC<{ achievement: Achievement; index: number }> = ({ achievement, index }) => {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-500';
      case 'rare': return 'border-cyber-blue';
      case 'epic': return 'border-cyber-purple';
      case 'legendary': return 'border-cyber-yellow';
      default: return 'border-gray-500';
    }
  };

  const progressPercentage = (achievement.progress / achievement.maxProgress) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`panel-cyber p-4 ${getRarityColor(achievement.rarity)} ${
        achievement.isUnlocked ? 'bg-opacity-20' : 'opacity-75'
      }`}
    >
      <div className="flex items-start space-x-3">
        <div className={`text-3xl ${achievement.isUnlocked ? '' : 'grayscale opacity-50'}`}>
          {achievement.icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className={`font-bold ${achievement.isUnlocked ? 'text-white' : 'text-gray-400'}`}>
              {achievement.name}
            </h4>
            {achievement.isUnlocked && (
              <span className="text-cyber-green text-sm">✓ Unlocked</span>
            )}
          </div>
          <p className="text-sm text-gray-400 mb-3">{achievement.description}</p>

          {/* Progress Bar */}
          {!achievement.isUnlocked && (
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-400">Progress</span>
                <span className="text-xs text-cyber-blue">
                  {achievement.progress} / {achievement.maxProgress}
                </span>
              </div>
              <div className="w-full bg-dark-bg rounded-full h-2">
                <div
                  className="h-full bg-gradient-to-r from-cyber-blue to-cyber-purple rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          )}

          {/* Rewards */}
          <div className="space-y-1">
            {achievement.rewards.map((reward, idx) => (
              <div key={idx} className="text-xs text-gray-400">
                Reward: {reward.description}
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Mastery Tab Component
const MasteryTab: React.FC = () => {
  const progression = useProgressionStore();
  const [selectedType, setSelectedType] = useState<'chassis' | 'weapons' | 'specials'>('chassis');

  const masteryTypes = [
    { id: 'chassis', name: 'Chassis', icon: '🏃' },
    { id: 'weapons', name: 'Weapons', icon: '🔫' },
    { id: 'specials', name: 'Specials', icon: '⚡' }
  ];

  return (
    <div>
      {/* Mastery Type Selector */}
      <div className="flex space-x-2 mb-6">
        {masteryTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setSelectedType(type.id as any)}
            className={`px-6 py-3 rounded-lg transition-all duration-200 ${
              selectedType === type.id
                ? 'bg-cyber-blue text-dark-bg'
                : 'bg-dark-bg text-gray-400 hover:text-white hover:bg-dark-surface'
            }`}
          >
            <span className="mr-2">{type.icon}</span>
            {type.name}
          </button>
        ))}
      </div>

      {/* Mastery Trees */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {selectedType === 'chassis' && Object.entries(progression.masteryTrees.chassis).map(([chassisType, mastery]) => (
          <ChassisMasteryCard key={chassisType} chassisType={chassisType as ChassisType} mastery={mastery} />
        ))}
        {selectedType === 'weapons' && Object.entries(progression.masteryTrees.weapons).map(([weaponType, mastery]) => (
          <WeaponMasteryCard key={weaponType} weaponType={weaponType as WeaponType} mastery={mastery} />
        ))}
        {selectedType === 'specials' && Object.entries(progression.masteryTrees.specials).map(([specialType, mastery]) => (
          <SpecialMasteryCard key={specialType} specialType={specialType as SpecialType} mastery={mastery} />
        ))}
      </div>
    </div>
  );
};

// Chassis Mastery Card
const ChassisMasteryCard: React.FC<{ chassisType: ChassisType; mastery: any }> = ({ chassisType, mastery }) => {
  const getChassisInfo = (type: ChassisType) => {
    switch (type) {
      case ChassisType.SPEED:
        return { name: 'Speed', icon: '🏃', color: 'cyber-green' };
      case ChassisType.TANK:
        return { name: 'Tank', icon: '🛡️', color: 'cyber-blue' };
      case ChassisType.BALANCED:
        return { name: 'Balanced', icon: '⚖️', color: 'cyber-purple' };
    }
  };

  const chassisInfo = getChassisInfo(chassisType);

  return (
    <div className="panel-cyber p-4">
      <div className="flex items-center space-x-3 mb-4">
        <span className="text-2xl">{chassisInfo.icon}</span>
        <h3 className={`text-lg font-bold text-${chassisInfo.color}`}>{chassisInfo.name}</h3>
      </div>

      <div className="space-y-3">
        {Object.entries(mastery).map(([skillName, skill]) => (
          <MasteryProgressBar
            key={skillName}
            name={skillName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            progress={skill as MasteryProgress}
          />
        ))}
      </div>
    </div>
  );
};

// Weapon Mastery Card
const WeaponMasteryCard: React.FC<{ weaponType: WeaponType; mastery: any }> = ({ weaponType, mastery }) => {
  const getWeaponInfo = (type: WeaponType) => {
    switch (type) {
      case WeaponType.BLASTER:
        return { name: 'Blaster', icon: '🔫', color: 'cyber-green' };
      case WeaponType.CANNON:
        return { name: 'Cannon', icon: '💥', color: 'cyber-red' };
      case WeaponType.SHOTGUN:
        return { name: 'Shotgun', icon: '🔥', color: 'cyber-orange' };
    }
  };

  const weaponInfo = getWeaponInfo(weaponType);

  return (
    <div className="panel-cyber p-4">
      <div className="flex items-center space-x-3 mb-4">
        <span className="text-2xl">{weaponInfo.icon}</span>
        <h3 className={`text-lg font-bold text-${weaponInfo.color}`}>{weaponInfo.name}</h3>
      </div>

      <div className="space-y-3">
        <MasteryProgressBar name="Accuracy" progress={mastery.accuracy} />
        <MasteryProgressBar name="Damage" progress={mastery.damage} />
        <div className="pt-2 border-t border-gray-600">
          <p className="text-sm text-gray-400 mb-2">Special Effects</p>
          <MasteryProgressBar name="Piercing" progress={mastery.specialEffects.piercing} />
          <MasteryProgressBar name="Explosive" progress={mastery.specialEffects.explosive} />
          <MasteryProgressBar name="Homing" progress={mastery.specialEffects.homing} />
        </div>
      </div>
    </div>
  );
};

// Special Mastery Card
const SpecialMasteryCard: React.FC<{ specialType: SpecialType; mastery: any }> = ({ specialType, mastery }) => {
  const getSpecialInfo = (type: SpecialType) => {
    switch (type) {
      case SpecialType.SHIELD:
        return { name: 'Shield', icon: '🛡️', color: 'cyber-blue' };
      case SpecialType.SPEED_BOOST:
        return { name: 'Speed Boost', icon: '⚡', color: 'cyber-yellow' };
      case SpecialType.REPAIR:
        return { name: 'Repair', icon: '🔧', color: 'cyber-green' };
    }
  };

  const specialInfo = getSpecialInfo(specialType);

  return (
    <div className="panel-cyber p-4">
      <div className="flex items-center space-x-3 mb-4">
        <span className="text-2xl">{specialInfo.icon}</span>
        <h3 className={`text-lg font-bold text-${specialInfo.color}`}>{specialInfo.name}</h3>
      </div>

      <div className="space-y-3">
        <MasteryProgressBar name="Cooldown Reduction" progress={mastery.cooldownReduction} />
        <MasteryProgressBar name="Enhanced Power" progress={mastery.enhancedPower} />
        <div className="pt-2 border-t border-gray-600">
          <p className="text-sm text-gray-400 mb-2">Unique Combinations</p>
          <MasteryProgressBar name="Shield Burst" progress={mastery.uniqueCombinations.shieldBurst} />
          <MasteryProgressBar name="Repair Overdrive" progress={mastery.uniqueCombinations.repairOverdrive} />
          <MasteryProgressBar name="Speed Strike" progress={mastery.uniqueCombinations.speedStrike} />
        </div>
      </div>
    </div>
  );
};

// Mastery Progress Bar Component
const MasteryProgressBar: React.FC<{ name: string; progress: MasteryProgress }> = ({ name, progress }) => {
  const progressPercentage = progress.maxLevel > 0 ? (progress.currentLevel / progress.maxLevel) * 100 : 0;

  return (
    <div className="mb-2">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-400">{name}</span>
        <span className="text-xs text-cyber-blue">
          Lv. {progress.currentLevel} / {progress.maxLevel}
        </span>
      </div>
      <div className="w-full bg-dark-bg rounded-full h-2">
        <div
          className="h-full bg-gradient-to-r from-cyber-blue to-cyber-purple rounded-full transition-all duration-500"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
};

// Battle Pass Tab Component
const BattlePassTab: React.FC = () => {
  const progression = useProgressionStore();
  const battlePass = progression.battlePass;

  const currentTierProgress = (battlePass.currentSeason.currentXP % battlePass.currentSeason.xpPerTier) / battlePass.currentSeason.xpPerTier;

  return (
    <div>
      {/* Season Header */}
      <div className="panel-cyber p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-cyber-blue">{battlePass.currentSeason.name}</h2>
            <p className="text-gray-400">{battlePass.currentSeason.theme}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Current Tier</p>
            <p className="text-3xl font-bold text-cyber-blue">{battlePass.currentSeason.currentTier}</p>
          </div>
        </div>

        {/* Tier Progress */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">Progress to next tier</span>
            <span className="text-sm text-cyber-blue">
              {battlePass.currentSeason.currentXP % battlePass.currentSeason.xpPerTier} / {battlePass.currentSeason.xpPerTier} XP
            </span>
          </div>
          <div className="w-full bg-dark-bg rounded-full h-3">
            <div
              className="h-full bg-gradient-to-r from-cyber-blue to-cyber-purple rounded-full transition-all duration-500"
              style={{ width: `${currentTierProgress * 100}%` }}
            />
          </div>
        </div>

        {/* Premium Status */}
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Battle Pass Status</span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            battlePass.isPremium ? 'bg-cyber-yellow text-dark-bg' : 'bg-gray-600 text-gray-300'
          }`}>
            {battlePass.isPremium ? '👑 Premium' : 'Free'}
          </span>
        </div>
      </div>

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {battlePass.rewards
          .filter(reward => reward.tier <= Math.max(1, battlePass.currentSeason.currentTier + 3))
          .slice(0, 12)
          .map((reward, index) => (
            <BattlePassRewardCard key={`${reward.tier}-${reward.type}`} reward={reward} index={index} />
          ))}
      </div>
    </div>
  );
};

// Battle Pass Reward Card
const BattlePassRewardCard: React.FC<{ reward: any; index: number }> = ({ reward, index }) => {
  const progression = useProgressionStore();
  const isUnlocked = reward.tier <= progression.battlePass.currentSeason.currentTier;
  const canClaim = isUnlocked && !reward.isUnlocked && (reward.type === 'free' || progression.battlePass.isPremium);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className={`panel-cyber p-4 ${
        reward.type === 'premium' ? 'border-cyber-yellow' : 'border-cyber-blue'
      } ${isUnlocked ? '' : 'opacity-50'}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-400">Tier {reward.tier}</span>
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          reward.type === 'premium' ? 'bg-cyber-yellow text-dark-bg' : 'bg-cyber-blue text-white'
        }`}>
          {reward.type === 'premium' ? 'Premium' : 'Free'}
        </span>
      </div>

      <div className="flex items-center space-x-3 mb-3">
        <span className={`text-2xl ${isUnlocked ? '' : 'grayscale'}`}>{reward.icon}</span>
        <div>
          <h4 className="font-medium text-white">{reward.name}</h4>
          <p className="text-xs text-gray-400">{reward.description}</p>
        </div>
      </div>

      {canClaim && (
        <button
          onClick={() => progression.unlockBattlePassReward(reward.tier, reward.type)}
          className="w-full btn-cyber-primary py-2 text-sm"
        >
          Claim Reward
        </button>
      )}

      {reward.isUnlocked && (
        <div className="w-full bg-cyber-green text-dark-bg py-2 rounded text-center text-sm font-medium">
          ✓ Claimed
        </div>
      )}
    </motion.div>
  );
};

// Challenges Tab Component
const ChallengesTab: React.FC = () => {
  const progression = useProgressionStore();

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-cyber-blue mb-2">Weekly Challenges</h2>
        <p className="text-gray-400">Complete challenges to earn XP and Battle Pass progress</p>
      </div>

      <div className="space-y-4">
        {progression.weeklyChallenges.map((challenge, index) => (
          <WeeklyChallengeCard key={challenge.id} challenge={challenge} index={index} />
        ))}
      </div>
    </div>
  );
};

// Weekly Challenge Card
const WeeklyChallengeCard: React.FC<{ challenge: any; index: number }> = ({ challenge, index }) => {
  const progression = useProgressionStore();
  const progressPercentage = (challenge.progress / challenge.maxProgress) * 100;
  const canClaim = challenge.isCompleted && !challenge.rewards.every((r: any) => r.claimed);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`panel-cyber p-4 ${challenge.isCompleted ? 'border-cyber-green' : 'border-cyber-blue'}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-lg font-bold text-white">{challenge.name}</h3>
          <p className="text-gray-400 text-sm">{challenge.description}</p>
        </div>
        {challenge.isCompleted && (
          <span className="text-cyber-green text-2xl">✓</span>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">Progress</span>
          <span className="text-sm text-cyber-blue">
            {challenge.progress} / {challenge.maxProgress}
          </span>
        </div>
        <div className="w-full bg-dark-bg rounded-full h-3">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              challenge.isCompleted
                ? 'bg-gradient-to-r from-cyber-green to-cyber-blue'
                : 'bg-gradient-to-r from-cyber-blue to-cyber-purple'
            }`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Rewards */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-4">
          {challenge.rewards.map((reward: any, idx: number) => (
            <span key={idx} className="text-sm text-gray-400">
              {reward.description}
            </span>
          ))}
        </div>

        {canClaim && (
          <button
            onClick={() => progression.completeChallenge(challenge.id)}
            className="btn-cyber-primary px-4 py-1 text-sm"
          >
            Claim
          </button>
        )}
      </div>

      {/* Expiry Timer */}
      <div className="text-xs text-gray-500 mt-2">
        Expires: {new Date(challenge.expiresAt).toLocaleDateString()}
      </div>
    </motion.div>
  );
};

export default ProgressionDashboard;
