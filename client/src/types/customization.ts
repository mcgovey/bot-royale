// Enhanced Customization & Identity Types
// Based on Recommendation 2: Enhanced Customization & Identity

export enum MaterialType {
  MATTE = 'matte',
  GLOSSY = 'glossy',
  METALLIC = 'metallic',
  HOLOGRAPHIC = 'holographic',
  ANIMATED_ENERGY = 'animated_energy',
  ANIMATED_PULSE = 'animated_pulse'
}

export enum WearType {
  PRISTINE = 'pristine',
  BATTLE_WORN = 'battle_worn',
  DECORATED = 'decorated',
  WEATHERED = 'weathered',
  VETERAN = 'veteran'
}

export enum AntennaType {
  COMBAT = 'combat',        // Short, reinforced antenna
  STEALTH = 'stealth',      // Minimal, low-profile antenna
  BROADCAST = 'broadcast',  // Large, powerful antenna
  SCANNER = 'scanner',      // Multi-sensor array
  TACTICAL = 'tactical'     // Military-style antenna
}

export enum ArmorPlatingStyle {
  STANDARD = 'standard',
  REINFORCED = 'reinforced',
  ABLATIVE = 'ablative',
  REACTIVE = 'reactive',
  STEALTH = 'stealth',
  CEREMONIAL = 'ceremonial'
}

export enum WeaponModificationType {
  SCOPE = 'scope',
  BARREL_EXTENSION = 'barrel_extension',
  GRIP = 'grip',
  STABILIZER = 'stabilizer',
  SUPPRESSOR = 'suppressor',
  CHARGE_ENHANCER = 'charge_enhancer'
}

export enum EmotiveElementType {
  STATIC_EYES = 'static_eyes',
  ANIMATED_EYES = 'animated_eyes',
  LED_STRIP = 'led_strip',
  HOLOGRAPHIC_DISPLAY = 'holographic_display',
  PARTICLE_EMITTER = 'particle_emitter'
}

export enum VictoryAnimationType {
  VICTORY_POSE_HEROIC = 'victory_pose_heroic',
  VICTORY_POSE_INTIMIDATING = 'victory_pose_intimidating',
  VICTORY_DANCE_CLASSIC = 'victory_dance_classic',
  VICTORY_DANCE_ENERGETIC = 'victory_dance_energetic',
  VICTORY_TAUNT = 'victory_taunt',
  VICTORY_SALUTE = 'victory_salute'
}

export enum VictoryEffectType {
  SPARKS = 'sparks',
  ENERGY_BURST = 'energy_burst',
  HOLOGRAPHIC_CONFETTI = 'holographic_confetti',
  LIGHT_SHOW = 'light_show',
  PARTICLE_EXPLOSION = 'particle_explosion',
  ELECTROMAGNETIC_PULSE = 'electromagnetic_pulse'
}

export enum SoundPackType {
  CLASSIC_ROBOT = 'classic_robot',
  MILITARY = 'military',
  ALIEN_TECH = 'alien_tech',
  STEAMPUNK = 'steampunk',
  CYBERPUNK = 'cyberpunk',
  ORGANIC = 'organic'
}

export enum PersonalityTrait {
  AGGRESSIVE = 'aggressive',      // "First to engage, last to retreat"
  TACTICAL = 'tactical',          // "Analyzes before acting"
  PROTECTIVE = 'protective',      // "Prioritizes ally survival"
  OPPORTUNISTIC = 'opportunistic', // "Exploits weaknesses"
  ADAPTIVE = 'adaptive'           // "Changes strategy mid-battle"
}

export enum ArenaTheme {
  CYBER_CITY = 'cyber_city',
  SPACE_STATION = 'space_station',
  INDUSTRIAL_COMPLEX = 'industrial_complex',
  ARENA_CLASSIC = 'arena_classic',
  NEON_GRID = 'neon_grid',
  QUANTUM_VOID = 'quantum_void'
}

export enum MusicTheme {
  ELECTRONIC_COMBAT = 'electronic_combat',
  ORCHESTRAL_EPIC = 'orchestral_epic',
  SYNTHWAVE = 'synthwave',
  INDUSTRIAL_METAL = 'industrial_metal',
  AMBIENT_TECH = 'ambient_tech',
  RETRO_ARCADE = 'retro_arcade'
}

// Enhanced Bot Customization Configuration
export interface MaterialConfiguration {
  type: MaterialType;
  wear: WearType;
  intensity: number; // 0-1 for effects like holographic shimmer
  animationSpeed?: number; // for animated materials
}

export interface AccessoryConfiguration {
  antennaType: AntennaType;
  armorPlating: ArmorPlatingStyle;
  weaponModifications: WeaponModificationType[];
  emotiveElements: EmotiveElementType[];
}

export interface VictoryConfiguration {
  animationType: VictoryAnimationType;
  effectType: VictoryEffectType;
  soundPack: SoundPackType;
  duration: number; // seconds
}

export interface PersonalityConfiguration {
  primaryTrait: PersonalityTrait;
  secondaryTraits: PersonalityTrait[];
  aggressionLevel: number; // 0-1
  cautionLevel: number; // 0-1
  adaptabilityLevel: number; // 0-1
}

export interface ArenaCustomization {
  theme: ArenaTheme;
  musicTheme: MusicTheme;
  environmentalEffects: string[];
  personalizedElements: string[];
}

// Enhanced Bot Configuration with Deep Customization
export interface EnhancedBotConfiguration {
  // Basic configuration (existing)
  id: string;
  name: string;
  chassis: import('./game').ChassisType;
  weapon: import('./game').WeaponType;
  special: import('./game').SpecialType;

  // Enhanced visual customization
  appearance: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    material: MaterialConfiguration;
    accessories: AccessoryConfiguration;
  };

  // Personality and behavior
  personality: PersonalityConfiguration;

  // Victory celebrations
  victoryConfig: VictoryConfiguration;

  // Custom arena (for personal matches)
  arenaCustomization?: ArenaCustomization;

  // Metadata
  createdAt: Date;
  lastModified: Date;
  favoriteLoadout: boolean;
  battleCount: number;
  winRate: number;
}

// Customization unlock system
export interface CustomizationUnlock {
  id: string;
  name: string;
  description: string;
  category: 'material' | 'accessory' | 'victory' | 'personality' | 'arena';
  subcategory: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  unlockRequirement: CustomizationUnlockRequirement;
  isUnlocked: boolean;
  previewAvailable: boolean;
}

export interface CustomizationUnlockRequirement {
  type: 'level' | 'achievement' | 'battle_pass' | 'wins' | 'damage' | 'time_played' | 'special_event';
  description: string;
  progress?: {
    current: number;
    required: number;
  };
  achievementId?: string;
  requiredLevel?: number;
  winsRequired?: number;
  damageRequired?: number;
  timeRequired?: number; // minutes
  eventId?: string;
}

// Preset collections for quick customization
export interface CustomizationPreset {
  id: string;
  name: string;
  description: string;
  theme: string;
  configuration: Partial<EnhancedBotConfiguration>;
  popularity: number; // 0-1
  createdBy?: string; // for community presets
  isOfficial: boolean;
}

// Store state for customization
export interface CustomizationState {
  unlockedItems: CustomizationUnlock[];
  favoritePresets: string[];
  recentlyUsed: string[];
  customPresets: CustomizationPreset[];
  currentlyPreviewing?: EnhancedBotConfiguration;
}
