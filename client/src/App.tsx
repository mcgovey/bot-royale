import React, { useState } from 'react';
import BotBuilder from './components/BotBuilder';
import BattleArena from './components/BattleArena';
import { ChassisType, WeaponType, SpecialType } from './types/game';

type GameMode = 'builder' | 'battle';

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

  const handleStartBattle = () => {
    setCurrentMode('battle');
  };

  const handleBackToBuilder = () => {
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

      {/* Main Content */}
      <main className="relative z-10 h-full w-full">
        {currentMode === 'builder' ? (
          <BotBuilder
            botConfig={botConfig}
            setBotConfig={setBotConfig}
            onStartBattle={handleStartBattle}
          />
        ) : (
          <BattleArena
            playerBot={botConfig}
            onBackToBuilder={handleBackToBuilder}
          />
        )}
      </main>
    </div>
  );
}

export default App;
