import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { motion } from 'framer-motion';
import { ChassisType, WeaponType, SpecialType, CHASSIS_STATS, WEAPON_STATS, SPECIAL_STATS } from '../types/game';
import Bot3D from './Bot3D';

interface BotConfig {
  chassis: ChassisType;
  weapon: WeaponType;
  special: SpecialType;
  name: string;
  primaryColor: string;
  secondaryColor: string;
}

interface BotBuilderProps {
  botConfig: BotConfig;
  setBotConfig: React.Dispatch<React.SetStateAction<BotConfig>>;
  onStartBattle: () => void;
}

const BotBuilder: React.FC<BotBuilderProps> = ({ botConfig, setBotConfig, onStartBattle }) => {
  const updateChassis = (chassis: ChassisType) => {
    setBotConfig(prev => ({ ...prev, chassis }));
  };

  const updateWeapon = (weapon: WeaponType) => {
    setBotConfig(prev => ({ ...prev, weapon }));
  };

  const updateSpecial = (special: SpecialType) => {
    setBotConfig(prev => ({ ...prev, special }));
  };

  const updateName = (name: string) => {
    setBotConfig(prev => ({ ...prev, name }));
  };

  const updateColors = (primaryColor: string, secondaryColor: string) => {
    setBotConfig(prev => ({ ...prev, primaryColor, secondaryColor }));
  };

  const chassisOptions = [
    {
      type: ChassisType.SPEED,
      name: 'Speed Bot',
      description: 'Fast movement, low health',
      stats: CHASSIS_STATS[ChassisType.SPEED],
      icon: '🏃',
      color: 'cyber-green'
    },
    {
      type: ChassisType.TANK,
      name: 'Tank Bot',
      description: 'Slow movement, high health',
      stats: CHASSIS_STATS[ChassisType.TANK],
      icon: '🛡️',
      color: 'cyber-blue'
    },
    {
      type: ChassisType.BALANCED,
      name: 'Balanced Bot',
      description: 'Medium speed, medium health',
      stats: CHASSIS_STATS[ChassisType.BALANCED],
      icon: '⚖️',
      color: 'cyber-purple'
    }
  ];

  const weaponOptions = [
    {
      type: WeaponType.BLASTER,
      name: 'Blaster',
      description: 'Fast shots, low damage',
      stats: WEAPON_STATS[WeaponType.BLASTER],
      icon: '🔫',
      color: 'cyber-green'
    },
    {
      type: WeaponType.CANNON,
      name: 'Cannon',
      description: 'Slow shots, high damage',
      stats: WEAPON_STATS[WeaponType.CANNON],
      icon: '💥',
      color: 'cyber-red'
    },
    {
      type: WeaponType.SHOTGUN,
      name: 'Shotgun',
      description: 'Medium speed, medium damage',
      stats: WEAPON_STATS[WeaponType.SHOTGUN],
      icon: '🔥',
      color: 'cyber-orange'
    }
  ];

  const specialOptions = [
    {
      type: SpecialType.SHIELD,
      name: 'Shield',
      description: 'Blocks one attack',
      stats: SPECIAL_STATS[SpecialType.SHIELD],
      icon: '🛡️',
      color: 'cyber-blue'
    },
    {
      type: SpecialType.SPEED_BOOST,
      name: 'Speed Boost',
      description: 'Double speed for 3 seconds',
      stats: SPECIAL_STATS[SpecialType.SPEED_BOOST],
      icon: '⚡',
      color: 'cyber-yellow'
    },
    {
      type: SpecialType.REPAIR,
      name: 'Repair',
      description: 'Restore 2 HP',
      stats: SPECIAL_STATS[SpecialType.REPAIR],
      icon: '🔧',
      color: 'cyber-green'
    }
  ];

  return (
    <div className="h-full w-full flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="panel-cyber m-4 p-4 flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-cyber-blue glow-text">Bot Builder</h1>
          <p className="text-gray-400 text-sm">Design your perfect battle bot</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(0, 245, 255, 0.5)" }}
          whileTap={{ scale: 0.95 }}
          onClick={onStartBattle}
          className="btn-cyber-primary text-lg px-8 py-3"
        >
          Battle! ⚔️
        </motion.button>
      </motion.div>

      <div className="flex-1 flex">
        {/* 3D Bot Preview */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1 panel-cyber m-4 p-6"
        >
          <h2 className="text-xl font-bold text-cyber-purple mb-4 glow-text">Bot Preview</h2>

          {/* 3D Canvas */}
          <div className="h-80 bg-dark-surface rounded-lg mb-6 border border-cyber-blue/30 overflow-hidden">
            <Canvas
              gl={{
                antialias: true,
                alpha: true,
                preserveDrawingBuffer: false,
                powerPreference: "high-performance"
              }}
              camera={{ position: [0, 2, 5], fov: 75 }}
              onCreated={({ gl }: { gl: any }) => {
                gl.setClearColor('#1a1a1a', 1);
              }}
            >
              <Suspense fallback={null}>
                <OrbitControls enablePan={false} enableZoom={false} />
                <Environment preset="night" />

                {/* Lighting */}
                <ambientLight intensity={0.3} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#00f5ff" />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />

                {/* 3D Bot */}
                <Bot3D
                  chassis={botConfig.chassis}
                  weapon={botConfig.weapon}
                  primaryColor={botConfig.primaryColor}
                  secondaryColor={botConfig.secondaryColor}
                />
              </Suspense>
            </Canvas>
          </div>

          {/* Bot Name */}
          <div className="mb-6">
            <label className="block text-sm text-gray-400 mb-2 font-medium">Bot Name</label>
            <input
              type="text"
              value={botConfig.name}
              onChange={(e) => updateName(e.target.value)}
              className="input-cyber w-full text-xl font-bold text-center"
              placeholder="Enter bot name"
            />
          </div>

          {/* Bot Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="panel-cyber p-4 text-center bg-gradient-to-br from-cyber-green/20 to-transparent"
            >
              <p className="text-xs text-gray-400 uppercase tracking-wide">Health</p>
              <p className="text-2xl font-bold text-cyber-green glow-text">
                {CHASSIS_STATS[botConfig.chassis].health} HP
              </p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="panel-cyber p-4 text-center bg-gradient-to-br from-cyber-blue/20 to-transparent"
            >
              <p className="text-xs text-gray-400 uppercase tracking-wide">Speed</p>
              <p className="text-2xl font-bold text-cyber-blue glow-text">
                {CHASSIS_STATS[botConfig.chassis].speed}
              </p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="panel-cyber p-4 text-center bg-gradient-to-br from-cyber-red/20 to-transparent"
            >
              <p className="text-xs text-gray-400 uppercase tracking-wide">Damage</p>
              <p className="text-2xl font-bold text-cyber-red glow-text">
                {WEAPON_STATS[botConfig.weapon].damage}
              </p>
            </motion.div>
          </div>

          {/* Color Customization */}
          <div className="flex gap-6 justify-center">
            <div className="text-center">
              <label className="block text-sm text-gray-400 mb-2 font-medium">Primary Color</label>
              <input
                type="color"
                value={botConfig.primaryColor}
                onChange={(e) => updateColors(e.target.value, botConfig.secondaryColor)}
                className="color-picker-cyber w-16 h-12"
              />
            </div>
            <div className="text-center">
              <label className="block text-sm text-gray-400 mb-2 font-medium">Secondary Color</label>
              <input
                type="color"
                value={botConfig.secondaryColor}
                onChange={(e) => updateColors(botConfig.primaryColor, e.target.value)}
                className="color-picker-cyber w-16 h-12"
              />
            </div>
          </div>
        </motion.div>

        {/* Component Selection */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-96 panel-cyber m-4 p-6 overflow-y-auto"
        >
          <h2 className="text-xl font-bold text-cyber-purple mb-6 glow-text">Components</h2>

          {/* Chassis Selection */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-cyber-blue mb-3 glow-text flex items-center">
              <span className="mr-2">🔧</span>
              Choose Chassis
            </h3>
            <div className="space-y-3">
              {chassisOptions.map((option) => (
                <motion.div
                  key={option.type}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.02, x: 8 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                    botConfig.chassis === option.type
                      ? 'border-cyber-blue bg-gradient-to-r from-cyber-blue/20 to-cyber-purple/10 shadow-lg shadow-cyber-blue/30'
                      : 'border-gray-600 bg-gradient-to-r from-dark-surface/60 to-dark-panel/40 hover:border-gray-400 hover:shadow-md'
                  }`}
                  onClick={() => updateChassis(option.type)}
                >
                  {/* Background Glow Effect */}
                  {botConfig.chassis === option.type && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 bg-gradient-to-r from-cyber-blue/10 to-cyber-purple/5 pointer-events-none"
                    />
                  )}

                  {/* Animated Border Effect */}
                  {botConfig.chassis === option.type && (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute inset-0 rounded-xl border border-cyber-blue/50 pointer-events-none"
                      style={{
                        boxShadow: '0 0 20px rgba(0, 245, 255, 0.3), inset 0 0 20px rgba(0, 245, 255, 0.1)'
                      }}
                    />
                  )}

                  <div className="relative p-4 flex items-center space-x-4">
                    {/* Icon with Glow */}
                    <div className={`text-4xl filter drop-shadow-lg ${
                      botConfig.chassis === option.type ? 'text-shadow-glow animate-pulse-glow' : ''
                    }`}>
                      {option.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className={`font-bold text-lg ${
                          botConfig.chassis === option.type ? 'text-white text-glow' : 'text-gray-200'
                        }`}>
                          {option.name}
                        </h4>
                        {botConfig.chassis === option.type && (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            className="text-cyber-green text-2xl filter drop-shadow-lg"
                          >
                            ✓
                          </motion.div>
                        )}
                      </div>

                      <p className={`text-sm mb-2 ${
                        botConfig.chassis === option.type ? 'text-gray-300' : 'text-gray-400'
                      }`}>
                        {option.description}
                      </p>

                      {/* Stats Bar */}
                      <div className="flex space-x-3 text-xs">
                        <div className={`flex items-center space-x-1 ${
                          botConfig.chassis === option.type ? 'text-cyber-green' : 'text-gray-400'
                        }`}>
                          <span>❤️</span>
                          <span className="font-mono">{option.stats.health}</span>
                        </div>
                        <div className={`flex items-center space-x-1 ${
                          botConfig.chassis === option.type ? 'text-cyber-blue' : 'text-gray-400'
                        }`}>
                          <span>⚡</span>
                          <span className="font-mono">{option.stats.speed}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Selection Indicator */}
                  {botConfig.chassis === option.type && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-cyber-blue to-cyber-purple"
                    />
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Weapon Selection */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-cyber-green mb-3 glow-text flex items-center">
              <span className="mr-2">⚔️</span>
              Choose Weapon
            </h3>
            <div className="space-y-3">
              {weaponOptions.map((option) => (
                <motion.div
                  key={option.type}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.02, x: 8 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                    botConfig.weapon === option.type
                      ? 'border-cyber-green bg-gradient-to-r from-cyber-green/20 to-cyber-blue/10 shadow-lg shadow-cyber-green/30'
                      : 'border-gray-600 bg-gradient-to-r from-dark-surface/60 to-dark-panel/40 hover:border-gray-400 hover:shadow-md'
                  }`}
                  onClick={() => updateWeapon(option.type)}
                >
                  {/* Background Glow Effect */}
                  {botConfig.weapon === option.type && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 bg-gradient-to-r from-cyber-green/10 to-cyber-blue/5 pointer-events-none"
                    />
                  )}

                  {/* Animated Border Effect */}
                  {botConfig.weapon === option.type && (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute inset-0 rounded-xl border border-cyber-green/50 pointer-events-none"
                      style={{
                        boxShadow: '0 0 20px rgba(16, 185, 129, 0.3), inset 0 0 20px rgba(16, 185, 129, 0.1)'
                      }}
                    />
                  )}

                  <div className="relative p-4 flex items-center space-x-4">
                    {/* Icon with Glow */}
                    <div className={`text-4xl filter drop-shadow-lg ${
                      botConfig.weapon === option.type ? 'text-shadow-glow animate-pulse-glow' : ''
                    }`}>
                      {option.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className={`font-bold text-lg ${
                          botConfig.weapon === option.type ? 'text-white text-glow' : 'text-gray-200'
                        }`}>
                          {option.name}
                        </h4>
                        {botConfig.weapon === option.type && (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            className="text-cyber-green text-2xl filter drop-shadow-lg"
                          >
                            ✓
                          </motion.div>
                        )}
                      </div>

                      <p className={`text-sm mb-2 ${
                        botConfig.weapon === option.type ? 'text-gray-300' : 'text-gray-400'
                      }`}>
                        {option.description}
                      </p>

                      {/* Stats Bar */}
                      <div className="flex space-x-3 text-xs">
                        <div className={`flex items-center space-x-1 ${
                          botConfig.weapon === option.type ? 'text-cyber-red' : 'text-gray-400'
                        }`}>
                          <span>💥</span>
                          <span className="font-mono">{option.stats.damage}</span>
                        </div>
                        <div className={`flex items-center space-x-1 ${
                          botConfig.weapon === option.type ? 'text-cyber-blue' : 'text-gray-400'
                        }`}>
                          <span>🔫</span>
                          <span className="font-mono">{option.stats.fireRate}/s</span>
                        </div>
                        <div className={`flex items-center space-x-1 ${
                          botConfig.weapon === option.type ? 'text-cyber-purple' : 'text-gray-400'
                        }`}>
                          <span>🎯</span>
                          <span className="font-mono">{option.stats.range}m</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Selection Indicator */}
                  {botConfig.weapon === option.type && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-cyber-green to-cyber-blue"
                    />
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Special Selection */}
          <div>
            <h3 className="text-lg font-bold text-cyber-orange mb-3 glow-text flex items-center">
              <span className="mr-2">✨</span>
              Choose Special
            </h3>
            <div className="space-y-3">
              {specialOptions.map((option) => (
                <motion.div
                  key={option.type}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.02, x: 8 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                    botConfig.special === option.type
                      ? 'border-cyber-orange bg-gradient-to-r from-cyber-orange/20 to-cyber-purple/10 shadow-lg shadow-cyber-orange/30'
                      : 'border-gray-600 bg-gradient-to-r from-dark-surface/60 to-dark-panel/40 hover:border-gray-400 hover:shadow-md'
                  }`}
                  onClick={() => updateSpecial(option.type)}
                >
                  {/* Background Glow Effect */}
                  {botConfig.special === option.type && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 bg-gradient-to-r from-cyber-orange/10 to-cyber-purple/5 pointer-events-none"
                    />
                  )}

                  {/* Animated Border Effect */}
                  {botConfig.special === option.type && (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute inset-0 rounded-xl border border-cyber-orange/50 pointer-events-none"
                      style={{
                        boxShadow: '0 0 20px rgba(245, 158, 11, 0.3), inset 0 0 20px rgba(245, 158, 11, 0.1)'
                      }}
                    />
                  )}

                  <div className="relative p-4 flex items-center space-x-4">
                    {/* Icon with Glow */}
                    <div className={`text-4xl filter drop-shadow-lg ${
                      botConfig.special === option.type ? 'text-shadow-glow animate-pulse-glow' : ''
                    }`}>
                      {option.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className={`font-bold text-lg ${
                          botConfig.special === option.type ? 'text-white text-glow' : 'text-gray-200'
                        }`}>
                          {option.name}
                        </h4>
                        {botConfig.special === option.type && (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            className="text-cyber-green text-2xl filter drop-shadow-lg"
                          >
                            ✓
                          </motion.div>
                        )}
                      </div>

                      <p className={`text-sm mb-2 ${
                        botConfig.special === option.type ? 'text-gray-300' : 'text-gray-400'
                      }`}>
                        {option.description}
                      </p>

                      {/* Stats Bar */}
                      <div className="flex space-x-3 text-xs">
                        <div className={`flex items-center space-x-1 ${
                          botConfig.special === option.type ? 'text-cyber-blue' : 'text-gray-400'
                        }`}>
                          <span>⏱️</span>
                          <span className="font-mono">{option.stats.cooldown}s</span>
                        </div>
                        {option.stats.duration && (
                          <div className={`flex items-center space-x-1 ${
                            botConfig.special === option.type ? 'text-cyber-yellow' : 'text-gray-400'
                          }`}>
                            <span>⏳</span>
                            <span className="font-mono">{option.stats.duration}s</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Selection Indicator */}
                  {botConfig.special === option.type && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-cyber-orange to-cyber-purple"
                    />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BotBuilder;
