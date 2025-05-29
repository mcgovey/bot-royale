import React, { useState } from 'react';
import BotBuilder from './components/BotBuilder';
import BattleArena from './components/BattleArena';
import ProgressionDashboard from './components/ProgressionDashboard';
import { ChassisType, WeaponType, SpecialType } from './types/game';
import { useProgressionStore } from './store/progressionStore';

type GameMode = 'builder' | 'battle' | 'progression';

interface BotConfig {
  chassis: ChassisType;
  weapon: WeaponType;
  special: SpecialType;
  name: string;
  primaryColor: string;
  secondaryColor: string;
}

function App() {
  const [currentMode, setCurrentMode] = useState<GameMode>('builder');
  const [botConfig, setBotConfig] = useState<BotConfig>({
    chassis: ChassisType.BALANCED,
    weapon: WeaponType.BLASTER,
    special: SpecialType.SHIELD,
    name: 'My Bot',
    primaryColor: '#00f5ff',
    secondaryColor: '#8b5cf6'
  });

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
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  currentMode === 'builder'
                    ? 'bg-cyber-blue text-dark-bg'
                    : 'text-gray-400 hover:text-white hover:bg-dark-bg'
                }`}
              >
                🔧 Builder
              </button>

              <button
                onClick={handleOpenProgression}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  currentMode === 'progression'
                    ? 'bg-cyber-purple text-white'
                    : 'text-gray-400 hover:text-white hover:bg-dark-bg'
                }`}
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
          <BotBuilder
            botConfig={botConfig}
            setBotConfig={setBotConfig}
            onStartBattle={handleStartBattle}
          />
        )}

        {currentMode === 'battle' && (
          <BattleArena
            playerBot={botConfig}
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
