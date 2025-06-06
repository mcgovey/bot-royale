import React, { useState } from 'react';
import EnhancedBotBuilder from './components/EnhancedBotBuilder';
import BattleArena from './components/BattleArena';
import ProgressionDashboard from './components/ProgressionDashboard';
import { ChassisType, WeaponType, SpecialType } from './types/game';
import { EnhancedBotConfiguration } from './types/customization';
import { createDefaultEnhancedBotConfig, convertLegacyBotConfig } from './utils/enhancedBotUtils';
import { useProgressionStore } from './store/progressionStore';

type GameMode = 'builder' | 'battle' | 'progression';

// Legacy interface for backward compatibility with BattleArena
interface LegacyBotConfig {
  chassis: ChassisType;
  weapon: WeaponType;
  special: SpecialType;
  name: string;
  primaryColor: string;
  secondaryColor: string;
}

function App() {
  const [currentMode, setCurrentMode] = useState<GameMode>('builder');

  // Use the enhanced bot configuration
  const [botConfig, setBotConfig] = useState<EnhancedBotConfiguration>(() =>
    createDefaultEnhancedBotConfig('My Bot')
  );

  const progression = useProgressionStore();

  const handleStartBattle = () => {
    setCurrentMode('battle');
  };

  const handleBackToBuilder = () => {
    setCurrentMode('builder');
  };

  const handleOpenProgression = () => {
    setCurrentMode('progression');
  };

  const handleCloseProgression = () => {
    setCurrentMode('builder');
  };

  // Convert enhanced bot config to legacy format for BattleArena compatibility
  const getLegacyBotConfig = (): LegacyBotConfig => ({
    chassis: botConfig.chassis,
    weapon: botConfig.weapon,
    special: botConfig.special,
    name: botConfig.name,
    primaryColor: botConfig.appearance.primaryColor,
    secondaryColor: botConfig.appearance.secondaryColor
  });

  return (
    <div className="App h-screen w-full bg-dark-bg text-white overflow-hidden">
      {/* Cyber Grid Background */}
      <div className="fixed inset-0 cyber-grid opacity-20 pointer-events-none" />

      {/* Animated Background Particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyber-blue rounded-full animate-pulse opacity-60" />
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-cyber-green rounded-full animate-ping opacity-40" />
        <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-cyber-purple rounded-full animate-pulse opacity-50" />
      </div>

      {/* Top Navigation Bar */}
      <nav className="relative z-20 bg-dark-surface border-b border-cyber-blue/30 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <h1 className="text-xl font-bold text-cyber-blue glow-text">🤖 BattleBot Arena</h1>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentMode('builder')}
                className={`btn-nav ${currentMode === 'builder' ? 'active' : ''}`}
              >
                🔧 Builder
              </button>

              <button
                onClick={handleOpenProgression}
                className={`btn-nav ${currentMode === 'progression' ? 'active' : ''}`}
              >
                📊 Progress
              </button>
            </div>
          </div>

          {/* Player Info */}
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-400">Level {progression.profile.level.level}</p>
              <p className="text-xs text-cyber-blue">
                {progression.profile.level.currentXP} / {progression.profile.level.currentXP + progression.profile.level.xpToNextLevel} XP
              </p>
            </div>

            <div className="w-10 h-10 bg-gradient-to-r from-cyber-blue to-cyber-purple rounded-full flex items-center justify-center text-sm font-bold">
              {progression.profile.level.level}
            </div>
          </div>
        </div>

        {/* Mini XP Bar */}
        <div className="mt-2">
          <div className="w-full bg-dark-bg rounded-full h-1 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyber-blue to-cyber-purple transition-all duration-500"
              style={{
                width: `${(progression.profile.level.currentXP / (progression.profile.level.currentXP + progression.profile.level.xpToNextLevel)) * 100}%`
              }}
            />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 h-full w-full">
        {currentMode === 'builder' && (
          <EnhancedBotBuilder
            botConfig={botConfig}
            setBotConfig={setBotConfig}
            onStartBattle={handleStartBattle}
          />
        )}

        {currentMode === 'battle' && (
          <BattleArena
            playerBot={getLegacyBotConfig()}
            onBackToBuilder={handleBackToBuilder}
          />
        )}

        {currentMode === 'progression' && (
          <ProgressionDashboard onClose={handleCloseProgression} />
        )}
      </main>
    </div>
  );
}

export default App;
