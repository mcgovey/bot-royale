import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { ChassisType, WeaponType, DefensiveModuleType, UtilityModuleType } from '../types/game';

const BotBuilder: React.FC = () => {
  const { currentBotConfig, setBotConfig, setCurrentScreen } = useGameStore();

  const handleChassisChange = (type: ChassisType) => {
    setBotConfig({
      ...currentBotConfig!,
      chassis: {
        ...currentBotConfig!.chassis,
        type
      }
    });
  };

  const handleWeaponChange = (type: WeaponType) => {
    setBotConfig({
      ...currentBotConfig!,
      weapons: [{
        ...currentBotConfig!.weapons[0],
        type
      }]
    });
  };

  const handleDefenseChange = (type: DefensiveModuleType) => {
    setBotConfig({
      ...currentBotConfig!,
      defensiveModules: [{
        ...currentBotConfig!.defensiveModules[0],
        type
      }]
    });
  };

  const handleUtilityChange = (type: UtilityModuleType) => {
    setBotConfig({
      ...currentBotConfig!,
      utilityModules: [{
        ...currentBotConfig!.utilityModules[0],
        type
      }]
    });
  };

  return (
    <div className="h-full w-full flex flex-col">
      {/* Header */}
      <div className="panel-cyber m-4 p-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-cyber-blue">Bot Builder</h1>
        <button
          onClick={() => setCurrentScreen('menu')}
          className="btn-cyber-secondary"
        >
          Back to Menu
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* 3D Viewport */}
        <div className="flex-1 panel-cyber m-4 p-4">
          <div className="h-full bg-dark-surface rounded-lg flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="text-6xl"
            >
              🤖
            </motion.div>
          </div>
        </div>

        {/* Component Panel */}
        <div className="w-80 panel-cyber m-4 p-4">
          <h2 className="text-lg font-bold text-cyber-purple mb-4">Components</h2>
          <div className="space-y-2">
            <div className="p-3 bg-dark-surface rounded border border-cyber-blue/30">
              <h3 className="font-semibold text-cyber-blue">Chassis</h3>
              <select
                value={currentBotConfig?.chassis.type}
                onChange={(e) => handleChassisChange(e.target.value as ChassisType)}
                className="bg-dark-surface text-white"
              >
                {Object.values(ChassisType).map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="p-3 bg-dark-surface rounded border border-cyber-green/30">
              <h3 className="font-semibold text-cyber-green">Weapons</h3>
              <select
                value={currentBotConfig?.weapons[0].type}
                onChange={(e) => handleWeaponChange(e.target.value as WeaponType)}
                className="bg-dark-surface text-white"
              >
                {Object.values(WeaponType).map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="p-3 bg-dark-surface rounded border border-cyber-orange/30">
              <h3 className="font-semibold text-cyber-orange">Defense</h3>
              <select
                value={currentBotConfig?.defensiveModules[0].type}
                onChange={(e) => handleDefenseChange(e.target.value as DefensiveModuleType)}
                className="bg-dark-surface text-white"
              >
                {Object.values(DefensiveModuleType).map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="p-3 bg-dark-surface rounded border border-cyber-yellow/30">
              <h3 className="font-semibold text-cyber-yellow">Utility</h3>
              <select
                value={currentBotConfig?.utilityModules[0].type}
                onChange={(e) => handleUtilityChange(e.target.value as UtilityModuleType)}
                className="bg-dark-surface text-white"
              >
                {Object.values(UtilityModuleType).map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BotBuilder;
