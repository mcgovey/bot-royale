import React, { Suspense, useState, useMemo, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { ChassisType, WeaponType, SpecialType, CHASSIS_STATS, WEAPON_STATS } from '../types/game';
import { useProgressionStore } from '../store/progressionStore';
import { initializeComponentCollection, getComponentsWithUnlockStatus } from '../utils/progressionUtils';
import { UnlockableComponent } from '../types/progression';
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
  const progressionStore = useProgressionStore();
  const [selectedCategory, setSelectedCategory] = useState<'chassis' | 'weapons' | 'specials'>('chassis');
  const [showLockedItems, setShowLockedItems] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Color palettes
  const colorPalettes = {
    cyber: ['#00f5ff', '#8b5cf6', '#06b6d4', '#3b82f6', '#6366f1', '#d946ef'],
    vibrant: ['#10b981', '#f59e0b', '#ef4444', '#ec4899', '#f43f5e', '#84cc16'],
    classic: ['#22c55e', '#eab308', '#f97316', '#dc2626', '#059669', '#7c3aed'],
    metallic: ['#64748b', '#475569', '#334155', '#1e293b', '#0f172a', '#020617']
  };

  // Memoize component collection
  const componentCollection = useMemo(() => {
    const baseCollection = initializeComponentCollection();
    return getComponentsWithUnlockStatus(baseCollection, progressionStore);
  }, [progressionStore]);

  const updateBotConfig = useCallback((field: keyof BotConfig, value: any) => {
    setBotConfig(prev => ({ ...prev, [field]: value }));
  }, [setBotConfig]);

  const handleComponentSelect = useCallback((component: UnlockableComponent) => {
    if (!component.isUnlocked) return;

    setIsLoading(true);
    setTimeout(() => {
      if (selectedCategory === 'chassis') {
        if (component.id.includes('speed')) updateBotConfig('chassis', ChassisType.SPEED);
        else if (component.id.includes('tank')) updateBotConfig('chassis', ChassisType.TANK);
        else updateBotConfig('chassis', ChassisType.BALANCED);
      } else if (selectedCategory === 'weapons') {
        if (component.id.includes('blaster')) updateBotConfig('weapon', WeaponType.BLASTER);
        else if (component.id.includes('cannon')) updateBotConfig('weapon', WeaponType.CANNON);
        else updateBotConfig('weapon', WeaponType.SHOTGUN);
      } else {
        if (component.id.includes('shield')) updateBotConfig('special', SpecialType.SHIELD);
        else if (component.id.includes('speed')) updateBotConfig('special', SpecialType.SPEED_BOOST);
        else updateBotConfig('special', SpecialType.REPAIR);
      }
      setIsLoading(false);
    }, 300);
  }, [selectedCategory, updateBotConfig]);

  const getStatComparison = () => {
    const current = CHASSIS_STATS[botConfig.chassis];
    const weapon = WEAPON_STATS[botConfig.weapon];
    return {
      health: current.health,
      speed: current.speed,
      damage: weapon.damage,
      totalPower: Math.round((current.health + current.speed + weapon.damage) / 3)
    };
  };

  const stats = getStatComparison();
  const xpProgress = (progressionStore.profile.level.currentXP / progressionStore.profile.level.xpToNextLevel) * 100;

  return (
    <div className="h-full w-full bg-slate-950 text-white relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 cyber-grid opacity-10" />

      {/* Header */}
      <div className="relative z-10 p-4 border-b border-cyan-500/30">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold text-cyber-blue glow-text">
              Bot Builder
            </h1>
            <p className="text-slate-400 text-sm md:text-base">
              Design your perfect battle machine
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* XP Progress */}
            <div className="hidden md:block text-right">
              <div className="text-xs text-slate-400 uppercase tracking-wider">Experience</div>
              <div className="text-sm font-bold text-emerald-400">
                {progressionStore.profile.level.currentXP} / {progressionStore.profile.level.xpToNextLevel} XP
              </div>
              <div className="w-32 bg-slate-800 rounded-full h-2 mt-1">
                <div
                  className="bg-gradient-to-r from-emerald-400 to-cyan-400 h-full rounded-full"
                  style={{ width: `${xpProgress}%` }}
                />
              </div>
            </div>

            {/* Battle Button */}
            <button
              onClick={onStartBattle}
              className="btn-cyber text-lg px-6 py-3 font-bold"
              disabled={isLoading}
            >
              BATTLE! ⚔️
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row h-full">
        {/* Bot Preview - Left Side */}
        <div className="flex-1 p-4">
          <div className="panel-cyber h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-cyber-blue glow-text flex items-center gap-2">
                <span>👁️</span> Bot Preview
              </h2>
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className={`btn-tab ${showColorPicker ? 'active' : ''}`}
              >
                🎨 Colors
              </button>
            </div>

            {/* 3D Canvas */}
            <div className="flex-1 bg-slate-800/50 rounded-lg border border-cyan-500/30 relative min-h-[300px]">
              <Canvas
                camera={{ position: [0, 2, 5], fov: 75 }}
                className="w-full h-full"
              >
                <Suspense fallback={null}>
                  <OrbitControls enablePan={false} enableZoom={true} maxDistance={8} minDistance={3} />
                  <Environment preset="night" />
                  <ambientLight intensity={0.6} />
                  <directionalLight position={[10, 10, 5]} intensity={1.2} color="#06b6d4" />
                  <directionalLight position={[-10, -10, -5]} intensity={0.8} color="#8b5cf6" />
                  <Bot3D
                    chassis={botConfig.chassis}
                    weapon={botConfig.weapon}
                    primaryColor={botConfig.primaryColor}
                    secondaryColor={botConfig.secondaryColor}
                  />
                </Suspense>
              </Canvas>

              {/* Bot Info Overlay */}
              <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-cyan-500/30">
                <div className="text-cyan-400 font-bold">{botConfig.name || 'My Bot'}</div>
                <div className="text-slate-300 text-sm">
                  {botConfig.chassis.replace('_', ' ')} • {botConfig.weapon.replace('_', ' ')}
                </div>
              </div>

              {/* Controls Hint */}
              <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-cyan-500/30">
                <div className="text-xs text-slate-300">
                  🖱️ Drag to rotate • 🔄 Scroll to zoom
                </div>
              </div>
            </div>

            {/* Color Picker */}
            <AnimatePresence>
              {showColorPicker && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 p-4 bg-slate-800/30 rounded-lg border border-cyan-500/20"
                >
                  <h3 className="text-lg font-bold text-cyan-400 mb-4">Color Customization</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Primary Color */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Primary Color</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={botConfig.primaryColor}
                          onChange={(e) => updateBotConfig('primaryColor', e.target.value)}
                          className="w-12 h-12 rounded-lg border-2 border-cyan-500/30 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={botConfig.primaryColor}
                          onChange={(e) => updateBotConfig('primaryColor', e.target.value)}
                          className="flex-1 bg-slate-800 border border-cyan-500/30 rounded px-3 py-2 text-white font-mono text-sm"
                        />
                      </div>
                    </div>

                    {/* Secondary Color */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Secondary Color</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={botConfig.secondaryColor}
                          onChange={(e) => updateBotConfig('secondaryColor', e.target.value)}
                          className="w-12 h-12 rounded-lg border-2 border-purple-500/30 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={botConfig.secondaryColor}
                          onChange={(e) => updateBotConfig('secondaryColor', e.target.value)}
                          className="flex-1 bg-slate-800 border border-purple-500/30 rounded px-3 py-2 text-white font-mono text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Quick Color Palette */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-slate-300 mb-2">Quick Colors</label>
                    <div className="grid grid-cols-6 gap-2">
                      {colorPalettes.cyber.map((color, index) => (
                        <button
                          key={index}
                          onClick={() => updateBotConfig('primaryColor', color)}
                          className="w-8 h-8 rounded border-2 border-slate-600 hover:border-cyan-400 transition-colors"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Components Panel - Right Side */}
        <div className="w-full md:w-96 p-4">
          <div className="panel-cyber h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-cyber-orange glow-text flex items-center gap-2">
                <span>⚙️</span> Components
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Locked</span>
                <button
                  onClick={() => setShowLockedItems(!showLockedItems)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${
                    showLockedItems ? 'bg-cyber-orange' : 'bg-slate-600'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                      showLockedItems ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Category Tabs */}
            <div className="grid grid-cols-3 gap-1 mb-4">
              {[
                { key: 'chassis', label: 'Chassis', icon: '🤖' },
                { key: 'weapons', label: 'Weapons', icon: '⚔️' },
                { key: 'specials', label: 'Specials', icon: '✨' }
              ].map((category) => (
                <button
                  key={category.key}
                  onClick={() => setSelectedCategory(category.key as any)}
                  className={`btn-tab py-3 ${selectedCategory === category.key ? 'active' : ''}`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-lg">{category.icon}</span>
                    <span className="text-xs">{category.label}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Component List */}
            <div className="flex-1 overflow-y-auto space-y-3">
              {componentCollection[selectedCategory]
                ?.filter((component: UnlockableComponent) => showLockedItems || component.isUnlocked)
                ?.map((component: UnlockableComponent, index: number) => (
                  <ComponentCard
                    key={component.id}
                    component={component}
                    isSelected={isComponentSelected(component)}
                    onSelect={() => handleComponentSelect(component)}
                    index={index}
                  />
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Helper function to determine if component is selected
  function isComponentSelected(component: UnlockableComponent): boolean {
    if (selectedCategory === 'chassis') {
      if (component.id.includes('speed')) return botConfig.chassis === ChassisType.SPEED;
      if (component.id.includes('tank')) return botConfig.chassis === ChassisType.TANK;
      if (component.id.includes('balanced')) return botConfig.chassis === ChassisType.BALANCED;
    } else if (selectedCategory === 'weapons') {
      if (component.id.includes('blaster')) return botConfig.weapon === WeaponType.BLASTER;
      if (component.id.includes('cannon')) return botConfig.weapon === WeaponType.CANNON;
      if (component.id.includes('shotgun')) return botConfig.weapon === WeaponType.SHOTGUN;
    } else if (selectedCategory === 'specials') {
      if (component.id.includes('shield')) return botConfig.special === SpecialType.SHIELD;
      if (component.id.includes('speed')) return botConfig.special === SpecialType.SPEED_BOOST;
      if (component.id.includes('repair')) return botConfig.special === SpecialType.REPAIR;
    }
    return false;
  }
};

// Component Card
interface ComponentCardProps {
  component: UnlockableComponent;
  isSelected: boolean;
  onSelect: () => void;
  index: number;
}

const ComponentCard: React.FC<ComponentCardProps> = ({ component, isSelected, onSelect, index }) => {
  const getRarityColor = () => {
    switch (component.rarity) {
      case 'common': return 'border-slate-500';
      case 'rare': return 'border-blue-500';
      case 'epic': return 'border-purple-500';
      case 'legendary': return 'border-orange-500';
      default: return 'border-slate-500';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onSelect}
      className={`p-4 bg-slate-800/30 rounded-lg border-2 cursor-pointer transition-all hover:bg-slate-800/50 ${
        isSelected
          ? `${getRarityColor()} bg-slate-700/50`
          : component.isUnlocked
          ? 'border-slate-600'
          : 'border-slate-700 opacity-60'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`text-2xl ${component.isUnlocked ? '' : 'grayscale opacity-50'}`}>
          {component.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className={`font-bold text-sm ${component.isUnlocked ? 'text-white' : 'text-slate-400'}`}>
              {component.name}
            </h3>
            <span className="text-xs text-slate-500 uppercase">{component.rarity}</span>
          </div>

          <p className="text-slate-400 text-xs mb-2 line-height-tight">
            {component.description}
          </p>

          {component.isUnlocked ? (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="text-xs text-green-400 font-medium">Unlocked</span>
            </div>
          ) : (
            <div className="text-xs text-slate-500">
              🔒 {component.unlockRequirement?.description || 'Locked'}
            </div>
          )}
        </div>

        {/* Selection Indicator */}
        {isSelected && component.isUnlocked && (
          <div className="w-5 h-5 bg-cyan-500 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default BotBuilder;
