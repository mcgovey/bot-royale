import React, { Suspense, useState, useMemo, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { ChassisType, WeaponType, SpecialType } from '../types/game';
import {
  MaterialType,
  WearType,
  AntennaType,
  ArmorPlatingStyle,
  WeaponModificationType,
  EmotiveElementType,
  PersonalityTrait,
  VictoryAnimationType,
  VictoryEffectType,
  SoundPackType,
  EnhancedBotConfiguration,
  MaterialConfiguration,
  AccessoryConfiguration,
  PersonalityConfiguration,
  VictoryConfiguration
} from '../types/customization';
import EnhancedBot3D from './EnhancedBot3D';

interface EnhancedBotBuilderProps {
  botConfig: EnhancedBotConfiguration;
  setBotConfig: React.Dispatch<React.SetStateAction<EnhancedBotConfiguration>>;
  onStartBattle: () => void;
}

type CustomizationTab = 'basic' | 'appearance' | 'personality' | 'victory' | 'presets';

const EnhancedBotBuilder: React.FC<EnhancedBotBuilderProps> = ({
  botConfig,
  setBotConfig,
  onStartBattle
}) => {
  const [activeTab, setActiveTab] = useState<CustomizationTab>('basic');
  const [previewMode, setPreviewMode] = useState<'idle' | 'combat' | 'victory'>('idle');
  const [showEffects, setShowEffects] = useState(true);

  const updateBotConfig = useCallback((updates: Partial<EnhancedBotConfiguration>) => {
    setBotConfig(prev => ({
      ...prev,
      ...updates,
      lastModified: new Date()
    }));
  }, [setBotConfig]);

  const updateAppearance = useCallback((updates: Partial<EnhancedBotConfiguration['appearance']>) => {
    setBotConfig(prev => ({
      ...prev,
      appearance: {
        ...prev.appearance,
        ...updates
      },
      lastModified: new Date()
    }));
  }, [setBotConfig]);

  const updatePersonality = useCallback((updates: Partial<PersonalityConfiguration>) => {
    setBotConfig(prev => ({
      ...prev,
      personality: {
        ...prev.personality,
        ...updates
      },
      lastModified: new Date()
    }));
  }, [setBotConfig]);

  const updateVictoryConfig = useCallback((updates: Partial<VictoryConfiguration>) => {
    setBotConfig(prev => ({
      ...prev,
      victoryConfig: {
        ...prev.victoryConfig,
        ...updates
      },
      lastModified: new Date()
    }));
  }, [setBotConfig]);

  const renderBasicTab = () => (
    <div className="space-y-6">
      {/* Bot Name */}
      <div>
        <label className="block text-sm text-gray-400 mb-2 font-medium">Bot Name</label>
        <input
          type="text"
          value={botConfig.name}
          onChange={(e) => updateBotConfig({ name: e.target.value })}
          className="input-cyber w-full text-xl font-bold text-center"
          placeholder="Enter bot name"
        />
      </div>

      {/* Core Components */}
      <div className="grid grid-cols-1 gap-4">
        <ComponentSelector
          title="Chassis Type"
          value={botConfig.chassis}
          options={Object.values(ChassisType)}
          onChange={(value) => updateBotConfig({ chassis: value as ChassisType })}
          getDisplayName={(value) => value.replace('_', ' ').toUpperCase()}
        />

        <ComponentSelector
          title="Weapon Type"
          value={botConfig.weapon}
          options={Object.values(WeaponType)}
          onChange={(value) => updateBotConfig({ weapon: value as WeaponType })}
          getDisplayName={(value) => value.replace('_', ' ').toUpperCase()}
        />

        <ComponentSelector
          title="Special Ability"
          value={botConfig.special}
          options={Object.values(SpecialType)}
          onChange={(value) => updateBotConfig({ special: value as SpecialType })}
          getDisplayName={(value) => value.replace('_', ' ').toUpperCase()}
        />
      </div>
    </div>
  );

  const renderAppearanceTab = () => (
    <div className="space-y-6">
      {/* Color Customization */}
      <div>
        <h3 className="text-lg font-bold text-cyber-blue mb-4">Colors</h3>
        <div className="grid grid-cols-3 gap-4">
          <ColorPicker
            label="Primary"
            value={botConfig.appearance.primaryColor}
            onChange={(color) => updateAppearance({ primaryColor: color })}
          />
          <ColorPicker
            label="Secondary"
            value={botConfig.appearance.secondaryColor}
            onChange={(color) => updateAppearance({ secondaryColor: color })}
          />
          <ColorPicker
            label="Accent"
            value={botConfig.appearance.accentColor}
            onChange={(color) => updateAppearance({ accentColor: color })}
          />
        </div>
      </div>

      {/* Material System */}
      <div>
        <h3 className="text-lg font-bold text-cyber-blue mb-4">Material & Finish</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Material Type</label>
            <select
              value={botConfig.appearance.material.type}
              onChange={(e) => updateAppearance({
                material: {
                  ...botConfig.appearance.material,
                  type: e.target.value as MaterialType
                }
              })}
              className="input-cyber w-full"
            >
              {Object.values(MaterialType).map(type => (
                <option key={type} value={type}>
                  {type.replace('_', ' ').toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Wear Condition</label>
            <select
              value={botConfig.appearance.material.wear}
              onChange={(e) => updateAppearance({
                material: {
                  ...botConfig.appearance.material,
                  wear: e.target.value as WearType
                }
              })}
              className="input-cyber w-full"
            >
              {Object.values(WearType).map(wear => (
                <option key={wear} value={wear}>
                  {wear.replace('_', ' ').toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Material Intensity */}
        <div className="mt-4">
          <label className="block text-sm text-gray-400 mb-2">
            Effect Intensity: {Math.round(botConfig.appearance.material.intensity * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={botConfig.appearance.material.intensity}
            onChange={(e) => updateAppearance({
              material: {
                ...botConfig.appearance.material,
                intensity: parseFloat(e.target.value)
              }
            })}
            className="w-full cyber-slider"
          />
        </div>
      </div>

      {/* Accessories */}
      <div>
        <h3 className="text-lg font-bold text-cyber-blue mb-4">Accessories</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Antenna Type</label>
            <select
              value={botConfig.appearance.accessories.antennaType}
              onChange={(e) => updateAppearance({
                accessories: {
                  ...botConfig.appearance.accessories,
                  antennaType: e.target.value as AntennaType
                }
              })}
              className="input-cyber w-full"
            >
              {Object.values(AntennaType).map(type => (
                <option key={type} value={type}>
                  {type.replace('_', ' ').toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Armor Plating</label>
            <select
              value={botConfig.appearance.accessories.armorPlating}
              onChange={(e) => updateAppearance({
                accessories: {
                  ...botConfig.appearance.accessories,
                  armorPlating: e.target.value as ArmorPlatingStyle
                }
              })}
              className="input-cyber w-full"
            >
              {Object.values(ArmorPlatingStyle).map(style => (
                <option key={style} value={style}>
                  {style.replace('_', ' ').toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Weapon Modifications */}
        <div className="mt-4">
          <label className="block text-sm text-gray-400 mb-2">Weapon Modifications</label>
          <div className="grid grid-cols-2 gap-2">
            {Object.values(WeaponModificationType).map(mod => (
              <label key={mod} className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={botConfig.appearance.accessories.weaponModifications.includes(mod)}
                  onChange={(e) => {
                    const current = botConfig.appearance.accessories.weaponModifications;
                    const updated = e.target.checked
                      ? [...current, mod]
                      : current.filter(m => m !== mod);
                    updateAppearance({
                      accessories: {
                        ...botConfig.appearance.accessories,
                        weaponModifications: updated
                      }
                    });
                  }}
                  className="cyber-checkbox"
                />
                <span>{mod.replace('_', ' ').toUpperCase()}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Emotive Elements */}
        <div className="mt-4">
          <label className="block text-sm text-gray-400 mb-2">Emotive Elements</label>
          <div className="grid grid-cols-2 gap-2">
            {Object.values(EmotiveElementType).map(element => (
              <label key={element} className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={botConfig.appearance.accessories.emotiveElements.includes(element)}
                  onChange={(e) => {
                    const current = botConfig.appearance.accessories.emotiveElements;
                    const updated = e.target.checked
                      ? [...current, element]
                      : current.filter(el => el !== element);
                    updateAppearance({
                      accessories: {
                        ...botConfig.appearance.accessories,
                        emotiveElements: updated
                      }
                    });
                  }}
                  className="cyber-checkbox"
                />
                <span>{element.replace('_', ' ').toUpperCase()}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderPersonalityTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-cyber-blue mb-4">Personality Traits</h3>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Primary Trait</label>
          <select
            value={botConfig.personality.primaryTrait}
            onChange={(e) => updatePersonality({ primaryTrait: e.target.value as PersonalityTrait })}
            className="input-cyber w-full"
          >
            {Object.values(PersonalityTrait).map(trait => (
              <option key={trait} value={trait}>
                {getPersonalityDescription(trait)}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4">
          <label className="block text-sm text-gray-400 mb-2">Secondary Traits</label>
          <div className="grid grid-cols-2 gap-2">
            {Object.values(PersonalityTrait)
              .filter(trait => trait !== botConfig.personality.primaryTrait)
              .map(trait => (
                <label key={trait} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={botConfig.personality.secondaryTraits.includes(trait)}
                    onChange={(e) => {
                      const current = botConfig.personality.secondaryTraits;
                      const updated = e.target.checked
                        ? [...current, trait]
                        : current.filter(t => t !== trait);
                      updatePersonality({ secondaryTraits: updated });
                    }}
                    className="cyber-checkbox"
                  />
                  <span>{getPersonalityDescription(trait)}</span>
                </label>
              ))}
          </div>
        </div>
      </div>

      {/* Personality Sliders */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">
            Aggression Level: {Math.round(botConfig.personality.aggressionLevel * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={botConfig.personality.aggressionLevel}
            onChange={(e) => updatePersonality({ aggressionLevel: parseFloat(e.target.value) })}
            className="w-full cyber-slider"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">
            Caution Level: {Math.round(botConfig.personality.cautionLevel * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={botConfig.personality.cautionLevel}
            onChange={(e) => updatePersonality({ cautionLevel: parseFloat(e.target.value) })}
            className="w-full cyber-slider"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">
            Adaptability Level: {Math.round(botConfig.personality.adaptabilityLevel * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={botConfig.personality.adaptabilityLevel}
            onChange={(e) => updatePersonality({ adaptabilityLevel: parseFloat(e.target.value) })}
            className="w-full cyber-slider"
          />
        </div>
      </div>
    </div>
  );

  const renderVictoryTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-cyber-blue mb-4">Victory Celebrations</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Animation Type</label>
            <select
              value={botConfig.victoryConfig.animationType}
              onChange={(e) => updateVictoryConfig({ animationType: e.target.value as VictoryAnimationType })}
              className="input-cyber w-full"
            >
              {Object.values(VictoryAnimationType).map(type => (
                <option key={type} value={type}>
                  {type.replace(/victory_|_/g, ' ').toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Effect Type</label>
            <select
              value={botConfig.victoryConfig.effectType}
              onChange={(e) => updateVictoryConfig({ effectType: e.target.value as VictoryEffectType })}
              className="input-cyber w-full"
            >
              {Object.values(VictoryEffectType).map(type => (
                <option key={type} value={type}>
                  {type.replace('_', ' ').toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Sound Pack</label>
            <select
              value={botConfig.victoryConfig.soundPack}
              onChange={(e) => updateVictoryConfig({ soundPack: e.target.value as SoundPackType })}
              className="input-cyber w-full"
            >
              {Object.values(SoundPackType).map(pack => (
                <option key={pack} value={pack}>
                  {pack.replace('_', ' ').toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Duration: {botConfig.victoryConfig.duration}s
            </label>
            <input
              type="range"
              min="1"
              max="10"
              step="0.5"
              value={botConfig.victoryConfig.duration}
              onChange={(e) => updateVictoryConfig({ duration: parseFloat(e.target.value) })}
              className="w-full cyber-slider"
            />
          </div>
        </div>
      </div>

      {/* Preview Victory Animation */}
      <div className="text-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setPreviewMode('victory')}
          className="btn-cyber-secondary"
        >
          Preview Victory Animation
        </motion.button>
      </div>
    </div>
  );

  const tabs: { id: CustomizationTab; label: string; icon: string }[] = [
    { id: 'basic', label: 'Basic', icon: '⚙️' },
    { id: 'appearance', label: 'Appearance', icon: '🎨' },
    { id: 'personality', label: 'Personality', icon: '🧠' },
    { id: 'victory', label: 'Victory', icon: '🏆' },
    { id: 'presets', label: 'Presets', icon: '📋' }
  ];

  return (
    <div className="h-full w-full flex flex-col bg-gradient-to-br from-dark-bg via-dark-surface to-dark-panel">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="panel-cyber m-4 p-4 flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-cyber-blue glow-text">Enhanced Bot Builder</h1>
          <p className="text-gray-400 text-sm">Design your ultimate battle bot with advanced customization</p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Preview Mode Controls */}
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-400">Preview:</label>
            {(['idle', 'combat', 'victory'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setPreviewMode(mode)}
                className={`px-3 py-1 rounded text-xs transition-colors ${
                  previewMode === mode
                    ? 'bg-cyber-blue text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {mode.toUpperCase()}
              </button>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(0, 245, 255, 0.5)" }}
            whileTap={{ scale: 0.95 }}
            onClick={onStartBattle}
            className="btn-cyber-primary text-lg px-8 py-3"
          >
            Battle! ⚔️
          </motion.button>
        </div>
      </motion.div>

      <div className="flex-1 flex gap-4 px-4 pb-4">
        {/* 3D Bot Preview */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1 panel-cyber p-6 overflow-hidden"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-cyber-purple glow-text">Bot Preview</h2>
            <button
              onClick={() => setShowEffects(!showEffects)}
              className={`px-3 py-1 rounded text-xs transition-colors ${
                showEffects
                  ? 'bg-cyber-green text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Effects: {showEffects ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* 3D Canvas */}
          <div className="h-96 bg-dark-surface rounded-lg mb-6 border border-cyber-blue/30 overflow-hidden">
            <Canvas
              gl={{ antialias: true, alpha: true }}
              camera={{ position: [0, 2, 5], fov: 75 }}
              onCreated={({ gl }) => gl.setClearColor('#1a1a1a', 1)}
            >
              <Suspense fallback={null}>
                <OrbitControls enablePan={false} enableZoom={true} />
                <Environment preset="night" />
                <ambientLight intensity={0.3} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#00f5ff" />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />
                <EnhancedBot3D
                  configuration={botConfig}
                  animationState={previewMode}
                  showEffects={showEffects}
                />
              </Suspense>
            </Canvas>
          </div>

          {/* Bot Stats Preview */}
          <BotStatsPreview botConfig={botConfig} />
        </motion.div>

        {/* Customization Panel */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-96 panel-cyber overflow-hidden flex flex-col"
        >
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-600 p-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-3 py-2 text-xs font-medium rounded transition-colors ${
                  activeTab === tab.id
                    ? 'bg-cyber-blue text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <span className="block">{tab.icon}</span>
                <span className="block mt-1">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'basic' && renderBasicTab()}
                {activeTab === 'appearance' && renderAppearanceTab()}
                {activeTab === 'personality' && renderPersonalityTab()}
                {activeTab === 'victory' && renderVictoryTab()}
                {activeTab === 'presets' && <div className="text-center text-gray-400">Presets coming soon!</div>}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Helper Components
const ComponentSelector: React.FC<{
  title: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  getDisplayName: (value: string) => string;
}> = ({ title, value, options, onChange, getDisplayName }) => (
  <div>
    <label className="block text-sm text-gray-400 mb-2 font-medium">{title}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="input-cyber w-full"
    >
      {options.map(option => (
        <option key={option} value={option}>
          {getDisplayName(option)}
        </option>
      ))}
    </select>
  </div>
);

const ColorPicker: React.FC<{
  label: string;
  value: string;
  onChange: (color: string) => void;
}> = ({ label, value, onChange }) => (
  <div className="text-center">
    <label className="block text-sm text-gray-400 mb-2 font-medium">{label}</label>
    <input
      type="color"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="color-picker-cyber w-full h-12"
    />
  </div>
);

const BotStatsPreview: React.FC<{ botConfig: EnhancedBotConfiguration }> = ({ botConfig }) => {
  // Calculate enhanced stats based on personality and configuration
  const baseStats = useMemo(() => {
    // This would integrate with the actual game stats calculation
    return {
      health: 100,
      speed: 50,
      damage: 75,
      special: 60
    };
  }, [botConfig]);

  return (
    <div className="grid grid-cols-2 gap-4">
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="panel-cyber p-3 text-center bg-gradient-to-br from-cyber-green/20 to-transparent"
      >
        <p className="text-xs text-gray-400 uppercase tracking-wide">Health</p>
        <p className="text-xl font-bold text-cyber-green glow-text">{baseStats.health}</p>
      </motion.div>
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="panel-cyber p-3 text-center bg-gradient-to-br from-cyber-blue/20 to-transparent"
      >
        <p className="text-xs text-gray-400 uppercase tracking-wide">Speed</p>
        <p className="text-xl font-bold text-cyber-blue glow-text">{baseStats.speed}</p>
      </motion.div>
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="panel-cyber p-3 text-center bg-gradient-to-br from-cyber-red/20 to-transparent"
      >
        <p className="text-xs text-gray-400 uppercase tracking-wide">Damage</p>
        <p className="text-xl font-bold text-cyber-red glow-text">{baseStats.damage}</p>
      </motion.div>
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="panel-cyber p-3 text-center bg-gradient-to-br from-cyber-purple/20 to-transparent"
      >
        <p className="text-xs text-gray-400 uppercase tracking-wide">Special</p>
        <p className="text-xl font-bold text-cyber-purple glow-text">{baseStats.special}</p>
      </motion.div>
    </div>
  );
};

// Helper Functions
function getPersonalityDescription(trait: PersonalityTrait): string {
  switch (trait) {
    case PersonalityTrait.AGGRESSIVE: return 'Aggressive - First to engage, last to retreat';
    case PersonalityTrait.TACTICAL: return 'Tactical - Analyzes before acting';
    case PersonalityTrait.PROTECTIVE: return 'Protective - Prioritizes ally survival';
    case PersonalityTrait.OPPORTUNISTIC: return 'Opportunistic - Exploits weaknesses';
    case PersonalityTrait.ADAPTIVE: return 'Adaptive - Changes strategy mid-battle';
    default: return trait;
  }
}

export default EnhancedBotBuilder;
