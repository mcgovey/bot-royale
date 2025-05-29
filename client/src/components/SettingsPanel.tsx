import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useUserStore, userUtils } from '../store/userStore';
import { UserPreferences } from '../types/user';

interface SettingsPanelProps {
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ onClose }) => {
  const userStore = useUserStore();
  const [activeTab, setActiveTab] = useState<keyof UserPreferences>('graphics');
  const [pendingChanges, setPendingChanges] = useState<Partial<UserPreferences>>({});

  const tabs = [
    { id: 'graphics', name: 'Graphics', icon: '🎮' },
    { id: 'audio', name: 'Audio', icon: '🔊' },
    { id: 'gameplay', name: 'Gameplay', icon: '⚙️' },
    { id: 'interface', name: 'Interface', icon: '🖥️' },
    { id: 'accessibility', name: 'Accessibility', icon: '♿' },
    { id: 'controls', name: 'Controls', icon: '🎯' },
    { id: 'privacy', name: 'Privacy', icon: '🔒' }
  ];

  const updateSetting = (category: keyof UserPreferences, key: string, value: any) => {
    setPendingChanges(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const applyChanges = () => {
    Object.entries(pendingChanges).forEach(([category, changes]) => {
      userStore.updatePreferences(category as keyof UserPreferences, changes);
    });
    setPendingChanges({});
  };

  const resetToDefaults = () => {
    if (confirm('Reset all settings to default values? This cannot be undone.')) {
      userStore.clearUserData();
      setPendingChanges({});
    }
  };

  const getCurrentValue = (category: keyof UserPreferences, key: string) => {
    return pendingChanges[category]?.[key as keyof typeof pendingChanges[typeof category]] ??
           (userStore.preferences[category] as any)[key];
  };

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
          <h1 className="text-3xl font-bold text-cyber-blue glow-text">Settings</h1>
          <div className="flex items-center space-x-4">
            {Object.keys(pendingChanges).length > 0 && (
              <motion.button
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={applyChanges}
                className="btn-cyber-primary"
              >
                Apply Changes
              </motion.button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-3xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        <div className="flex h-full">
          {/* Tab Navigation */}
          <div className="w-64 mr-6">
            <div className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as keyof UserPreferences)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-cyber-blue text-dark-bg'
                      : 'text-gray-400 hover:text-white hover:bg-dark-bg'
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span className="font-medium">{tab.name}</span>
                </button>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="mt-8 space-y-2">
              <button
                onClick={resetToDefaults}
                className="w-full btn-cyber-secondary text-sm"
              >
                Reset to Defaults
              </button>
              <button
                onClick={() => {
                  const data = userStore.exportUserData();
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `battlebot-backup-${new Date().toISOString().split('T')[0]}.json`;
                  a.click();
                }}
                className="w-full btn-cyber-secondary text-sm"
              >
                Export Data
              </button>
            </div>
          </div>

          {/* Settings Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'graphics' && (
              <GraphicsSettings getCurrentValue={getCurrentValue} updateSetting={updateSetting} />
            )}
            {activeTab === 'audio' && (
              <AudioSettings getCurrentValue={getCurrentValue} updateSetting={updateSetting} />
            )}
            {activeTab === 'gameplay' && (
              <GameplaySettings getCurrentValue={getCurrentValue} updateSetting={updateSetting} />
            )}
            {activeTab === 'interface' && (
              <InterfaceSettings getCurrentValue={getCurrentValue} updateSetting={updateSetting} />
            )}
            {activeTab === 'accessibility' && (
              <AccessibilitySettings getCurrentValue={getCurrentValue} updateSetting={updateSetting} />
            )}
            {activeTab === 'controls' && (
              <ControlsSettings getCurrentValue={getCurrentValue} updateSetting={updateSetting} />
            )}
            {activeTab === 'privacy' && (
              <PrivacySettings getCurrentValue={getCurrentValue} updateSetting={updateSetting} />
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Graphics Settings Component
const GraphicsSettings: React.FC<{
  getCurrentValue: (category: keyof UserPreferences, key: string) => any;
  updateSetting: (category: keyof UserPreferences, key: string, value: any) => void;
}> = ({ getCurrentValue, updateSetting }) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-cyber-blue mb-4">Graphics Settings</h2>

    <SettingGroup title="Rendering Quality">
      <SelectSetting
        label="Graphics Quality"
        value={getCurrentValue('graphics', 'quality')}
        options={[
          { value: 'low', label: 'Low - Better performance' },
          { value: 'medium', label: 'Medium - Balanced' },
          { value: 'high', label: 'High - Better visuals' },
          { value: 'ultra', label: 'Ultra - Best quality' }
        ]}
        onChange={(value) => updateSetting('graphics', 'quality', value)}
      />

      <SelectSetting
        label="Target FPS"
        value={getCurrentValue('graphics', 'targetFPS')}
        options={[
          { value: 30, label: '30 FPS' },
          { value: 60, label: '60 FPS' },
          { value: 120, label: '120 FPS' },
          { value: 'unlimited', label: 'Unlimited' }
        ]}
        onChange={(value) => updateSetting('graphics', 'targetFPS', value)}
      />
    </SettingGroup>

    <SettingGroup title="Visual Effects">
      <ToggleSetting
        label="Particle Effects"
        description="Enable weapon and explosion particle effects"
        value={getCurrentValue('graphics', 'particles')}
        onChange={(value) => updateSetting('graphics', 'particles', value)}
      />

      <ToggleSetting
        label="Dynamic Shadows"
        description="Enable real-time shadow rendering"
        value={getCurrentValue('graphics', 'shadows')}
        onChange={(value) => updateSetting('graphics', 'shadows', value)}
      />

      <ToggleSetting
        label="Post Processing"
        description="Enable bloom, color grading, and other effects"
        value={getCurrentValue('graphics', 'postProcessing')}
        onChange={(value) => updateSetting('graphics', 'postProcessing', value)}
      />

      <ToggleSetting
        label="V-Sync"
        description="Synchronize frame rate with monitor refresh rate"
        value={getCurrentValue('graphics', 'vsync')}
        onChange={(value) => updateSetting('graphics', 'vsync', value)}
      />
    </SettingGroup>
  </div>
);

// Audio Settings Component
const AudioSettings: React.FC<{
  getCurrentValue: (category: keyof UserPreferences, key: string) => any;
  updateSetting: (category: keyof UserPreferences, key: string, value: any) => void;
}> = ({ getCurrentValue, updateSetting }) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-cyber-blue mb-4">Audio Settings</h2>

    <SettingGroup title="Volume Controls">
      <SliderSetting
        label="Master Volume"
        value={getCurrentValue('audio', 'masterVolume')}
        min={0}
        max={100}
        onChange={(value) => updateSetting('audio', 'masterVolume', value)}
      />

      <SliderSetting
        label="Music Volume"
        value={getCurrentValue('audio', 'musicVolume')}
        min={0}
        max={100}
        onChange={(value) => updateSetting('audio', 'musicVolume', value)}
      />

      <SliderSetting
        label="Sound Effects"
        value={getCurrentValue('audio', 'sfxVolume')}
        min={0}
        max={100}
        onChange={(value) => updateSetting('audio', 'sfxVolume', value)}
      />

      <SliderSetting
        label="Voice Volume"
        value={getCurrentValue('audio', 'voiceVolume')}
        min={0}
        max={100}
        onChange={(value) => updateSetting('audio', 'voiceVolume', value)}
      />
    </SettingGroup>

    <SettingGroup title="Audio Behavior">
      <ToggleSetting
        label="Mute When Tab Inactive"
        description="Automatically mute audio when the game tab is not active"
        value={getCurrentValue('audio', 'muteWhenTabInactive')}
        onChange={(value) => updateSetting('audio', 'muteWhenTabInactive', value)}
      />
    </SettingGroup>
  </div>
);

// Gameplay Settings Component
const GameplaySettings: React.FC<{
  getCurrentValue: (category: keyof UserPreferences, key: string) => any;
  updateSetting: (category: keyof UserPreferences, key: string, value: any) => void;
}> = ({ getCurrentValue, updateSetting }) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-cyber-blue mb-4">Gameplay Settings</h2>

    <SettingGroup title="Game Behavior">
      <ToggleSetting
        label="Auto Save"
        description="Automatically save progress and settings"
        value={getCurrentValue('gameplay', 'autoSave')}
        onChange={(value) => updateSetting('gameplay', 'autoSave', value)}
      />

      <ToggleSetting
        label="Show Tutorials"
        description="Display helpful tutorials for new features"
        value={getCurrentValue('gameplay', 'tutorials')}
        onChange={(value) => updateSetting('gameplay', 'tutorials', value)}
      />

      <ToggleSetting
        label="Confirmation Dialogs"
        description="Show confirmation prompts for important actions"
        value={getCurrentValue('gameplay', 'confirmations')}
        onChange={(value) => updateSetting('gameplay', 'confirmations', value)}
      />

      <ToggleSetting
        label="Auto-Load Last Bot"
        description="Automatically load your last used bot configuration"
        value={getCurrentValue('gameplay', 'autoLoadLastBot')}
        onChange={(value) => updateSetting('gameplay', 'autoLoadLastBot', value)}
      />
    </SettingGroup>

    <SettingGroup title="Visual Feedback">
      <ToggleSetting
        label="Show Damage Numbers"
        description="Display floating damage numbers during battles"
        value={getCurrentValue('gameplay', 'showDamageNumbers')}
        onChange={(value) => updateSetting('gameplay', 'showDamageNumbers', value)}
      />

      <ToggleSetting
        label="Camera Shake"
        description="Enable camera shake effects for impacts"
        value={getCurrentValue('gameplay', 'cameraShake')}
        onChange={(value) => updateSetting('gameplay', 'cameraShake', value)}
      />
    </SettingGroup>
  </div>
);

// Interface Settings Component
const InterfaceSettings: React.FC<{
  getCurrentValue: (category: keyof UserPreferences, key: string) => any;
  updateSetting: (category: keyof UserPreferences, key: string, value: any) => void;
}> = ({ getCurrentValue, updateSetting }) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-cyber-blue mb-4">Interface Settings</h2>

    <SettingGroup title="Appearance">
      <SelectSetting
        label="Theme"
        value={getCurrentValue('interface', 'theme')}
        options={[
          { value: 'cyber-blue', label: 'Cyber Blue' },
          { value: 'cyber-purple', label: 'Cyber Purple' },
          { value: 'cyber-green', label: 'Cyber Green' },
          { value: 'dark', label: 'Dark' },
          { value: 'retro', label: 'Retro' }
        ]}
        onChange={(value) => updateSetting('interface', 'theme', value)}
      />

      <SelectSetting
        label="Font Size"
        value={getCurrentValue('interface', 'fontSize')}
        options={[
          { value: 'small', label: 'Small' },
          { value: 'medium', label: 'Medium' },
          { value: 'large', label: 'Large' }
        ]}
        onChange={(value) => updateSetting('interface', 'fontSize', value)}
      />

      <SliderSetting
        label="HUD Scale"
        value={getCurrentValue('interface', 'hudScale')}
        min={0.8}
        max={1.2}
        step={0.1}
        onChange={(value) => updateSetting('interface', 'hudScale', value)}
      />
    </SettingGroup>

    <SettingGroup title="UI Elements">
      <ToggleSetting
        label="Show Minimap"
        description="Display minimap during battles"
        value={getCurrentValue('interface', 'minimap')}
        onChange={(value) => updateSetting('interface', 'minimap', value)}
      />

      <SelectSetting
        label="Health Bars"
        value={getCurrentValue('interface', 'healthBars')}
        options={[
          { value: 'always', label: 'Always Show' },
          { value: 'damaged', label: 'When Damaged' },
          { value: 'never', label: 'Never Show' }
        ]}
        onChange={(value) => updateSetting('interface', 'healthBars', value)}
      />

      <ToggleSetting
        label="Tooltips"
        description="Show helpful tooltips on hover"
        value={getCurrentValue('interface', 'tooltips')}
        onChange={(value) => updateSetting('interface', 'tooltips', value)}
      />

      <ToggleSetting
        label="Animations"
        description="Enable UI animations and transitions"
        value={getCurrentValue('interface', 'animations')}
        onChange={(value) => updateSetting('interface', 'animations', value)}
      />
    </SettingGroup>
  </div>
);

// Accessibility Settings Component
const AccessibilitySettings: React.FC<{
  getCurrentValue: (category: keyof UserPreferences, key: string) => any;
  updateSetting: (category: keyof UserPreferences, key: string, value: any) => void;
}> = ({ getCurrentValue, updateSetting }) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-cyber-blue mb-4">Accessibility Settings</h2>

    <SettingGroup title="Visual Accessibility">
      <ToggleSetting
        label="Color Blind Support"
        description="Enable color blind friendly mode"
        value={getCurrentValue('accessibility', 'colorBlindSupport')}
        onChange={(value) => updateSetting('accessibility', 'colorBlindSupport', value)}
      />

      {getCurrentValue('accessibility', 'colorBlindSupport') && (
        <SelectSetting
          label="Color Blind Type"
          value={getCurrentValue('accessibility', 'colorBlindType')}
          options={[
            { value: 'none', label: 'None' },
            { value: 'protanopia', label: 'Protanopia (Red-Green)' },
            { value: 'deuteranopia', label: 'Deuteranopia (Red-Green)' },
            { value: 'tritanopia', label: 'Tritanopia (Blue-Yellow)' }
          ]}
          onChange={(value) => updateSetting('accessibility', 'colorBlindType', value)}
        />
      )}

      <ToggleSetting
        label="High Contrast Mode"
        description="Increase contrast for better visibility"
        value={getCurrentValue('accessibility', 'highContrast')}
        onChange={(value) => updateSetting('accessibility', 'highContrast', value)}
      />

      <ToggleSetting
        label="Reduced Motion"
        description="Minimize animations and motion effects"
        value={getCurrentValue('accessibility', 'reducedMotion')}
        onChange={(value) => updateSetting('accessibility', 'reducedMotion', value)}
      />
    </SettingGroup>

    <SettingGroup title="Input Accessibility">
      <ToggleSetting
        label="Keyboard Navigation"
        description="Enable full keyboard navigation"
        value={getCurrentValue('accessibility', 'keyboardNavigation')}
        onChange={(value) => updateSetting('accessibility', 'keyboardNavigation', value)}
      />

      <ToggleSetting
        label="Focus Indicators"
        description="Show clear focus indicators for keyboard navigation"
        value={getCurrentValue('accessibility', 'focusIndicators')}
        onChange={(value) => updateSetting('accessibility', 'focusIndicators', value)}
      />
    </SettingGroup>
  </div>
);

// Controls Settings Component
const ControlsSettings: React.FC<{
  getCurrentValue: (category: keyof UserPreferences, key: string) => any;
  updateSetting: (category: keyof UserPreferences, key: string, value: any) => void;
}> = ({ getCurrentValue, updateSetting }) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-cyber-blue mb-4">Controls Settings</h2>

    <SettingGroup title="Keyboard Controls">
      <div className="grid grid-cols-2 gap-4">
        <KeybindSetting
          label="Move Up"
          value={getCurrentValue('controls', 'keyboard').moveUp}
          onChange={(value) => updateSetting('controls', 'keyboard', { ...getCurrentValue('controls', 'keyboard'), moveUp: value })}
        />
        <KeybindSetting
          label="Move Down"
          value={getCurrentValue('controls', 'keyboard').moveDown}
          onChange={(value) => updateSetting('controls', 'keyboard', { ...getCurrentValue('controls', 'keyboard'), moveDown: value })}
        />
        <KeybindSetting
          label="Move Left"
          value={getCurrentValue('controls', 'keyboard').moveLeft}
          onChange={(value) => updateSetting('controls', 'keyboard', { ...getCurrentValue('controls', 'keyboard'), moveLeft: value })}
        />
        <KeybindSetting
          label="Move Right"
          value={getCurrentValue('controls', 'keyboard').moveRight}
          onChange={(value) => updateSetting('controls', 'keyboard', { ...getCurrentValue('controls', 'keyboard'), moveRight: value })}
        />
        <KeybindSetting
          label="Shoot"
          value={getCurrentValue('controls', 'keyboard').shoot}
          onChange={(value) => updateSetting('controls', 'keyboard', { ...getCurrentValue('controls', 'keyboard'), shoot: value })}
        />
        <KeybindSetting
          label="Special Ability"
          value={getCurrentValue('controls', 'keyboard').special}
          onChange={(value) => updateSetting('controls', 'keyboard', { ...getCurrentValue('controls', 'keyboard'), special: value })}
        />
      </div>
    </SettingGroup>

    <SettingGroup title="Mouse Settings">
      <SliderSetting
        label="Mouse Sensitivity"
        value={getCurrentValue('controls', 'mouse').sensitivity}
        min={0.1}
        max={3.0}
        step={0.1}
        onChange={(value) => updateSetting('controls', 'mouse', { ...getCurrentValue('controls', 'mouse'), sensitivity: value })}
      />

      <ToggleSetting
        label="Invert Y Axis"
        description="Invert vertical mouse movement"
        value={getCurrentValue('controls', 'mouse').invertY}
        onChange={(value) => updateSetting('controls', 'mouse', { ...getCurrentValue('controls', 'mouse'), invertY: value })}
      />
    </SettingGroup>
  </div>
);

// Privacy Settings Component
const PrivacySettings: React.FC<{
  getCurrentValue: (category: keyof UserPreferences, key: string) => any;
  updateSetting: (category: keyof UserPreferences, key: string, value: any) => void;
}> = ({ getCurrentValue, updateSetting }) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-cyber-blue mb-4">Privacy Settings</h2>

    <SettingGroup title="Data Collection">
      <ToggleSetting
        label="Anonymous Usage Data"
        description="Help improve the game by sharing anonymous usage statistics"
        value={getCurrentValue('privacy', 'analytics')}
        onChange={(value) => updateSetting('privacy', 'analytics', value)}
      />

      <ToggleSetting
        label="Crash Reports"
        description="Automatically send crash reports to help fix bugs"
        value={getCurrentValue('privacy', 'crashReports')}
        onChange={(value) => updateSetting('privacy', 'crashReports', value)}
      />
    </SettingGroup>

    <SettingGroup title="Social Features">
      <ToggleSetting
        label="Share Progress with Friends"
        description="Allow friends to see your achievements and progress"
        value={getCurrentValue('privacy', 'shareProgressWithFriends')}
        onChange={(value) => updateSetting('privacy', 'shareProgressWithFriends', value)}
      />
    </SettingGroup>
  </div>
);

// Helper Components
const SettingGroup: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="panel-cyber p-4">
    <h3 className="text-lg font-bold text-cyber-green mb-4">{title}</h3>
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

const ToggleSetting: React.FC<{
  label: string;
  description?: string;
  value: boolean;
  onChange: (value: boolean) => void;
}> = ({ label, description, value, onChange }) => (
  <div className="flex items-start justify-between">
    <div className="flex-1">
      <div className="font-medium text-white">{label}</div>
      {description && <div className="text-sm text-gray-400 mt-1">{description}</div>}
    </div>
    <button
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        value ? 'bg-cyber-blue' : 'bg-gray-600'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          value ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  </div>
);

const SelectSetting: React.FC<{
  label: string;
  value: any;
  options: { value: any; label: string }[];
  onChange: (value: any) => void;
}> = ({ label, value, options, onChange }) => (
  <div className="flex items-center justify-between">
    <label className="font-medium text-white">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-dark-bg border border-gray-600 rounded px-3 py-1 text-white"
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

const SliderSetting: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}> = ({ label, value, min, max, step = 1, onChange }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <label className="font-medium text-white">{label}</label>
      <span className="text-cyber-blue font-mono">{value}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
    />
  </div>
);

const KeybindSetting: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
}> = ({ label, value, onChange }) => {
  const [isListening, setIsListening] = useState(false);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (isListening) {
      e.preventDefault();
      onChange(e.code);
      setIsListening(false);
    }
  };

  return (
    <div className="flex items-center justify-between">
      <label className="font-medium text-white">{label}</label>
      <button
        onClick={() => setIsListening(true)}
        onKeyDown={handleKeyPress}
        className={`px-3 py-1 rounded border font-mono text-sm ${
          isListening
            ? 'bg-cyber-blue text-dark-bg border-cyber-blue'
            : 'bg-dark-bg text-white border-gray-600 hover:border-gray-400'
        }`}
      >
        {isListening ? 'Press key...' : value.replace('Key', '').replace('Arrow', '')}
      </button>
    </div>
  );
};

export default SettingsPanel;
