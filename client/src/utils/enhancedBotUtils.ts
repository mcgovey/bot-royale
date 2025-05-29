import {
  EnhancedBotConfiguration,
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
  MaterialConfiguration,
  AccessoryConfiguration,
  PersonalityConfiguration,
  VictoryConfiguration
} from '../types/customization';
import { ChassisType, WeaponType, SpecialType } from '../types/game';

// Generate a unique ID for bot configurations
export function generateBotId(): string {
  return `bot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Create a default enhanced bot configuration
export function createDefaultEnhancedBotConfig(name: string = 'New Bot'): EnhancedBotConfiguration {
  return {
    id: generateBotId(),
    name,
    chassis: ChassisType.BALANCED,
    weapon: WeaponType.BLASTER,
    special: SpecialType.SHIELD,

    appearance: {
      primaryColor: '#00f5ff',
      secondaryColor: '#8b5cf6',
      accentColor: '#ff6b35',
      material: createDefaultMaterialConfig(),
      accessories: createDefaultAccessoryConfig()
    },

    personality: createDefaultPersonalityConfig(),
    victoryConfig: createDefaultVictoryConfig(),

    createdAt: new Date(),
    lastModified: new Date(),
    favoriteLoadout: false,
    battleCount: 0,
    winRate: 0
  };
}

// Create default material configuration
export function createDefaultMaterialConfig(): MaterialConfiguration {
  return {
    type: MaterialType.METALLIC,
    wear: WearType.PRISTINE,
    intensity: 0.8,
    animationSpeed: 1.0
  };
}

// Create default accessory configuration
export function createDefaultAccessoryConfig(): AccessoryConfiguration {
  return {
    antennaType: AntennaType.COMBAT,
    armorPlating: ArmorPlatingStyle.STANDARD,
    weaponModifications: [],
    emotiveElements: [EmotiveElementType.STATIC_EYES]
  };
}

// Create default personality configuration
export function createDefaultPersonalityConfig(): PersonalityConfiguration {
  return {
    primaryTrait: PersonalityTrait.ADAPTIVE,
    secondaryTraits: [],
    aggressionLevel: 0.5,
    cautionLevel: 0.5,
    adaptabilityLevel: 0.7
  };
}

// Create default victory configuration
export function createDefaultVictoryConfig(): VictoryConfiguration {
  return {
    animationType: VictoryAnimationType.VICTORY_POSE_HEROIC,
    effectType: VictoryEffectType.ENERGY_BURST,
    soundPack: SoundPackType.CLASSIC_ROBOT,
    duration: 3.0
  };
}

// Convert legacy bot configuration to enhanced configuration
export function convertLegacyBotConfig(legacyConfig: {
  chassis: ChassisType;
  weapon: WeaponType;
  special: SpecialType;
  name: string;
  primaryColor: string;
  secondaryColor: string;
}): EnhancedBotConfiguration {
  return {
    id: generateBotId(),
    name: legacyConfig.name,
    chassis: legacyConfig.chassis,
    weapon: legacyConfig.weapon,
    special: legacyConfig.special,

    appearance: {
      primaryColor: legacyConfig.primaryColor,
      secondaryColor: legacyConfig.secondaryColor,
      accentColor: '#ff6b35', // Default accent color
      material: createDefaultMaterialConfig(),
      accessories: createDefaultAccessoryConfig()
    },

    personality: createDefaultPersonalityConfig(),
    victoryConfig: createDefaultVictoryConfig(),

    createdAt: new Date(),
    lastModified: new Date(),
    favoriteLoadout: false,
    battleCount: 0,
    winRate: 0
  };
}

// Create personality-based presets
export function createPersonalityPreset(
  personality: PersonalityTrait,
  name?: string
): Partial<EnhancedBotConfiguration> {
  const baseName = name || `${personality.charAt(0).toUpperCase() + personality.slice(1)} Bot`;

  switch (personality) {
    case PersonalityTrait.AGGRESSIVE:
      return {
        name: baseName,
        appearance: {
          primaryColor: '#ff4444',
          secondaryColor: '#cc0000',
          accentColor: '#ff8800',
          material: {
            type: MaterialType.ANIMATED_ENERGY,
            wear: WearType.BATTLE_WORN,
            intensity: 1.0,
            animationSpeed: 2.0
          },
          accessories: {
            antennaType: AntennaType.COMBAT,
            armorPlating: ArmorPlatingStyle.REACTIVE,
            weaponModifications: [WeaponModificationType.CHARGE_ENHANCER, WeaponModificationType.STABILIZER],
            emotiveElements: [EmotiveElementType.ANIMATED_EYES, EmotiveElementType.LED_STRIP]
          }
        },
        personality: {
          primaryTrait: PersonalityTrait.AGGRESSIVE,
          secondaryTraits: [PersonalityTrait.OPPORTUNISTIC],
          aggressionLevel: 0.9,
          cautionLevel: 0.2,
          adaptabilityLevel: 0.6
        },
        victoryConfig: {
          animationType: VictoryAnimationType.VICTORY_POSE_INTIMIDATING,
          effectType: VictoryEffectType.SPARKS,
          soundPack: SoundPackType.MILITARY,
          duration: 4.0
        }
      };

    case PersonalityTrait.TACTICAL:
      return {
        name: baseName,
        appearance: {
          primaryColor: '#0066cc',
          secondaryColor: '#003d7a',
          accentColor: '#00aaff',
          material: {
            type: MaterialType.METALLIC,
            wear: WearType.PRISTINE,
            intensity: 0.6,
            animationSpeed: 0.5
          },
          accessories: {
            antennaType: AntennaType.SCANNER,
            armorPlating: ArmorPlatingStyle.REINFORCED,
            weaponModifications: [WeaponModificationType.SCOPE, WeaponModificationType.STABILIZER],
            emotiveElements: [EmotiveElementType.HOLOGRAPHIC_DISPLAY, EmotiveElementType.STATIC_EYES]
          }
        },
        personality: {
          primaryTrait: PersonalityTrait.TACTICAL,
          secondaryTraits: [PersonalityTrait.ADAPTIVE],
          aggressionLevel: 0.4,
          cautionLevel: 0.8,
          adaptabilityLevel: 0.9
        },
        victoryConfig: {
          animationType: VictoryAnimationType.VICTORY_SALUTE,
          effectType: VictoryEffectType.LIGHT_SHOW,
          soundPack: SoundPackType.CYBERPUNK,
          duration: 2.5
        }
      };

    case PersonalityTrait.PROTECTIVE:
      return {
        name: baseName,
        appearance: {
          primaryColor: '#00cc66',
          secondaryColor: '#009944',
          accentColor: '#66ff99',
          material: {
            type: MaterialType.GLOSSY,
            wear: WearType.DECORATED,
            intensity: 0.7,
            animationSpeed: 1.0
          },
          accessories: {
            antennaType: AntennaType.BROADCAST,
            armorPlating: ArmorPlatingStyle.REINFORCED,
            weaponModifications: [WeaponModificationType.STABILIZER],
            emotiveElements: [EmotiveElementType.ANIMATED_EYES, EmotiveElementType.HOLOGRAPHIC_DISPLAY]
          }
        },
        personality: {
          primaryTrait: PersonalityTrait.PROTECTIVE,
          secondaryTraits: [PersonalityTrait.TACTICAL],
          aggressionLevel: 0.3,
          cautionLevel: 0.9,
          adaptabilityLevel: 0.5
        },
        victoryConfig: {
          animationType: VictoryAnimationType.VICTORY_POSE_HEROIC,
          effectType: VictoryEffectType.HOLOGRAPHIC_CONFETTI,
          soundPack: SoundPackType.ORGANIC,
          duration: 3.5
        }
      };

    case PersonalityTrait.OPPORTUNISTIC:
      return {
        name: baseName,
        appearance: {
          primaryColor: '#cc6600',
          secondaryColor: '#994400',
          accentColor: '#ffaa33',
          material: {
            type: MaterialType.HOLOGRAPHIC,
            wear: WearType.WEATHERED,
            intensity: 0.9,
            animationSpeed: 1.5
          },
          accessories: {
            antennaType: AntennaType.STEALTH,
            armorPlating: ArmorPlatingStyle.STEALTH,
            weaponModifications: [WeaponModificationType.SUPPRESSOR, WeaponModificationType.GRIP],
            emotiveElements: [EmotiveElementType.LED_STRIP, EmotiveElementType.PARTICLE_EMITTER]
          }
        },
        personality: {
          primaryTrait: PersonalityTrait.OPPORTUNISTIC,
          secondaryTraits: [PersonalityTrait.AGGRESSIVE],
          aggressionLevel: 0.7,
          cautionLevel: 0.6,
          adaptabilityLevel: 0.8
        },
        victoryConfig: {
          animationType: VictoryAnimationType.VICTORY_TAUNT,
          effectType: VictoryEffectType.ELECTROMAGNETIC_PULSE,
          soundPack: SoundPackType.ALIEN_TECH,
          duration: 2.0
        }
      };

    case PersonalityTrait.ADAPTIVE:
    default:
      return {
        name: baseName,
        appearance: {
          primaryColor: '#8b5cf6',
          secondaryColor: '#6d28d9',
          accentColor: '#a78bfa',
          material: {
            type: MaterialType.ANIMATED_PULSE,
            wear: WearType.PRISTINE,
            intensity: 0.8,
            animationSpeed: 1.0
          },
          accessories: {
            antennaType: AntennaType.TACTICAL,
            armorPlating: ArmorPlatingStyle.ABLATIVE,
            weaponModifications: [WeaponModificationType.GRIP, WeaponModificationType.BARREL_EXTENSION],
            emotiveElements: [EmotiveElementType.ANIMATED_EYES, EmotiveElementType.PARTICLE_EMITTER]
          }
        },
        personality: {
          primaryTrait: PersonalityTrait.ADAPTIVE,
          secondaryTraits: [PersonalityTrait.TACTICAL, PersonalityTrait.OPPORTUNISTIC],
          aggressionLevel: 0.5,
          cautionLevel: 0.5,
          adaptabilityLevel: 1.0
        },
        victoryConfig: {
          animationType: VictoryAnimationType.VICTORY_DANCE_ENERGETIC,
          effectType: VictoryEffectType.PARTICLE_EXPLOSION,
          soundPack: SoundPackType.CYBERPUNK,
          duration: 3.0
        }
      };
  }
}

// Validate enhanced bot configuration
export function validateEnhancedBotConfig(config: EnhancedBotConfiguration): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate required fields
  if (!config.id) errors.push('Bot ID is required');
  if (!config.name || config.name.trim() === '') errors.push('Bot name is required');
  if (!Object.values(ChassisType).includes(config.chassis)) errors.push('Invalid chassis type');
  if (!Object.values(WeaponType).includes(config.weapon)) errors.push('Invalid weapon type');
  if (!Object.values(SpecialType).includes(config.special)) errors.push('Invalid special type');

  // Validate appearance
  if (!config.appearance) {
    errors.push('Appearance configuration is required');
  } else {
    if (!isValidHexColor(config.appearance.primaryColor)) errors.push('Invalid primary color');
    if (!isValidHexColor(config.appearance.secondaryColor)) errors.push('Invalid secondary color');
    if (!isValidHexColor(config.appearance.accentColor)) errors.push('Invalid accent color');

    // Validate material
    if (!Object.values(MaterialType).includes(config.appearance.material.type)) {
      errors.push('Invalid material type');
    }
    if (!Object.values(WearType).includes(config.appearance.material.wear)) {
      errors.push('Invalid wear type');
    }
    if (config.appearance.material.intensity < 0 || config.appearance.material.intensity > 1) {
      errors.push('Material intensity must be between 0 and 1');
    }
  }

  // Validate personality
  if (!config.personality) {
    errors.push('Personality configuration is required');
  } else {
    if (!Object.values(PersonalityTrait).includes(config.personality.primaryTrait)) {
      errors.push('Invalid primary personality trait');
    }
    if (config.personality.aggressionLevel < 0 || config.personality.aggressionLevel > 1) {
      errors.push('Aggression level must be between 0 and 1');
    }
    if (config.personality.cautionLevel < 0 || config.personality.cautionLevel > 1) {
      errors.push('Caution level must be between 0 and 1');
    }
    if (config.personality.adaptabilityLevel < 0 || config.personality.adaptabilityLevel > 1) {
      errors.push('Adaptability level must be between 0 and 1');
    }
  }

  // Validate victory configuration
  if (!config.victoryConfig) {
    errors.push('Victory configuration is required');
  } else {
    if (!Object.values(VictoryAnimationType).includes(config.victoryConfig.animationType)) {
      errors.push('Invalid victory animation type');
    }
    if (!Object.values(VictoryEffectType).includes(config.victoryConfig.effectType)) {
      errors.push('Invalid victory effect type');
    }
    if (!Object.values(SoundPackType).includes(config.victoryConfig.soundPack)) {
      errors.push('Invalid sound pack type');
    }
    if (config.victoryConfig.duration < 0.5 || config.victoryConfig.duration > 10) {
      errors.push('Victory duration must be between 0.5 and 10 seconds');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Helper function to validate hex colors
function isValidHexColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

// Calculate bot combat effectiveness based on configuration
export function calculateBotEffectiveness(config: EnhancedBotConfiguration): {
  health: number;
  speed: number;
  damage: number;
  special: number;
  overall: number;
} {
  // Base stats would come from the game's stats system
  const baseStats = {
    health: 100,
    speed: 50,
    damage: 75,
    special: 60
  };

  // Apply personality modifiers
  const personalityModifiers = getPersonalityModifiers(config.personality);

  // Apply material and accessory modifiers
  const equipmentModifiers = getEquipmentModifiers(config.appearance);

  const modifiedStats = {
    health: Math.round(baseStats.health * personalityModifiers.health * equipmentModifiers.health),
    speed: Math.round(baseStats.speed * personalityModifiers.speed * equipmentModifiers.speed),
    damage: Math.round(baseStats.damage * personalityModifiers.damage * equipmentModifiers.damage),
    special: Math.round(baseStats.special * personalityModifiers.special * equipmentModifiers.special)
  };

  const overall = Math.round(
    (modifiedStats.health + modifiedStats.speed + modifiedStats.damage + modifiedStats.special) / 4
  );

  return {
    ...modifiedStats,
    overall
  };
}

// Get personality-based stat modifiers
function getPersonalityModifiers(personality: PersonalityConfiguration): {
  health: number;
  speed: number;
  damage: number;
  special: number;
} {
  let modifiers = { health: 1, speed: 1, damage: 1, special: 1 };

  // Primary trait effects
  switch (personality.primaryTrait) {
    case PersonalityTrait.AGGRESSIVE:
      modifiers.damage *= 1.2;
      modifiers.health *= 0.9;
      break;
    case PersonalityTrait.TACTICAL:
      modifiers.special *= 1.2;
      modifiers.speed *= 0.9;
      break;
    case PersonalityTrait.PROTECTIVE:
      modifiers.health *= 1.3;
      modifiers.damage *= 0.8;
      break;
    case PersonalityTrait.OPPORTUNISTIC:
      modifiers.speed *= 1.2;
      modifiers.health *= 0.85;
      break;
    case PersonalityTrait.ADAPTIVE:
      // Balanced improvements
      modifiers.health *= 1.05;
      modifiers.speed *= 1.05;
      modifiers.damage *= 1.05;
      modifiers.special *= 1.05;
      break;
  }

  // Secondary trait effects (smaller impact)
  personality.secondaryTraits.forEach(trait => {
    switch (trait) {
      case PersonalityTrait.AGGRESSIVE:
        modifiers.damage *= 1.05;
        break;
      case PersonalityTrait.TACTICAL:
        modifiers.special *= 1.05;
        break;
      case PersonalityTrait.PROTECTIVE:
        modifiers.health *= 1.05;
        break;
      case PersonalityTrait.OPPORTUNISTIC:
        modifiers.speed *= 1.05;
        break;
      case PersonalityTrait.ADAPTIVE:
        // Small boost to all stats
        Object.keys(modifiers).forEach(key => {
          modifiers[key as keyof typeof modifiers] *= 1.02;
        });
        break;
    }
  });

  // Level-based modifiers
  modifiers.damage *= (0.8 + personality.aggressionLevel * 0.4);
  modifiers.special *= (0.8 + personality.adaptabilityLevel * 0.4);
  modifiers.health *= (0.9 + personality.cautionLevel * 0.2);

  return modifiers;
}

// Get equipment-based stat modifiers
function getEquipmentModifiers(appearance: EnhancedBotConfiguration['appearance']): {
  health: number;
  speed: number;
  damage: number;
  special: number;
} {
  let modifiers = { health: 1, speed: 1, damage: 1, special: 1 };

  // Material effects
  switch (appearance.material.type) {
    case MaterialType.METALLIC:
      modifiers.health *= 1.1;
      modifiers.speed *= 0.95;
      break;
    case MaterialType.ANIMATED_ENERGY:
      modifiers.special *= 1.15;
      modifiers.damage *= 1.05;
      break;
    case MaterialType.HOLOGRAPHIC:
      modifiers.speed *= 1.1;
      modifiers.health *= 0.9;
      break;
  }

  // Armor plating effects
  switch (appearance.accessories.armorPlating) {
    case ArmorPlatingStyle.REINFORCED:
      modifiers.health *= 1.2;
      modifiers.speed *= 0.9;
      break;
    case ArmorPlatingStyle.REACTIVE:
      modifiers.damage *= 1.1;
      modifiers.special *= 1.05;
      break;
    case ArmorPlatingStyle.STEALTH:
      modifiers.speed *= 1.15;
      modifiers.health *= 0.85;
      break;
  }

  // Weapon modification effects
  appearance.accessories.weaponModifications.forEach(mod => {
    switch (mod) {
      case WeaponModificationType.SCOPE:
        modifiers.damage *= 1.05;
        break;
      case WeaponModificationType.CHARGE_ENHANCER:
        modifiers.damage *= 1.1;
        modifiers.special *= 1.05;
        break;
      case WeaponModificationType.STABILIZER:
        modifiers.damage *= 1.03;
        break;
    }
  });

  return modifiers;
}

export type {
  EnhancedBotConfiguration,
  PersonalityTrait,
  MaterialType,
  VictoryAnimationType
};
