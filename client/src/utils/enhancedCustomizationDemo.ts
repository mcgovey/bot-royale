import {
  createDefaultEnhancedBotConfig,
  createPersonalityPreset,
  calculateBotEffectiveness,
  validateEnhancedBotConfig
} from './enhancedBotUtils';
import {
  PersonalityTrait,
  MaterialType,
  WearType,
  AntennaType,
  ArmorPlatingStyle,
  WeaponModificationType,
  EmotiveElementType,
  VictoryAnimationType,
  VictoryEffectType,
  SoundPackType
} from '../types/customization';
import { ChassisType, WeaponType, SpecialType } from '../types/game';

/**
 * Enhanced Customization System Demo
 *
 * This script demonstrates the new enhanced customization features
 * implemented as part of Recommendation 2: Enhanced Customization & Identity
 */

export function demonstrateEnhancedCustomization() {
  console.log('🎮 Enhanced Bot Customization System Demo');
  console.log('==========================================\n');

  // 1. Create a default bot configuration
  console.log('1. Creating Default Bot Configuration:');
  const defaultBot = createDefaultEnhancedBotConfig('Demo Bot');
  console.log(`   ✓ Bot "${defaultBot.name}" created with ID: ${defaultBot.id}`);
  console.log(`   ✓ Primary Color: ${defaultBot.appearance.primaryColor}`);
  console.log(`   ✓ Material: ${defaultBot.appearance.material.type}`);
  console.log(`   ✓ Personality: ${defaultBot.personality.primaryTrait}\n`);

  // 2. Demonstrate personality presets
  console.log('2. Creating Personality-Based Presets:');

  const aggressiveBot = {
    ...defaultBot,
    ...createPersonalityPreset(PersonalityTrait.AGGRESSIVE, 'Berserker Bot')
  };
  console.log(`   ✓ Aggressive Bot: ${aggressiveBot.name}`);
  console.log(`     - Colors: ${aggressiveBot.appearance?.primaryColor} / ${aggressiveBot.appearance?.secondaryColor}`);
  console.log(`     - Material: ${aggressiveBot.appearance?.material?.type} (${aggressiveBot.appearance?.material?.wear})`);
  console.log(`     - Armor: ${aggressiveBot.appearance?.accessories?.armorPlating}`);

  const tacticalBot = {
    ...defaultBot,
    ...createPersonalityPreset(PersonalityTrait.TACTICAL, 'Strategist Bot')
  };
  console.log(`   ✓ Tactical Bot: ${tacticalBot.name}`);
  console.log(`     - Colors: ${tacticalBot.appearance?.primaryColor} / ${tacticalBot.appearance?.secondaryColor}`);
  console.log(`     - Antenna: ${tacticalBot.appearance?.accessories?.antennaType}`);
  console.log(`     - Effects: ${tacticalBot.appearance?.accessories?.emotiveElements?.join(', ')}\n`);

  // 3. Demonstrate advanced material customization
  console.log('3. Advanced Material Customization:');

  const holographicBot = createDefaultEnhancedBotConfig('Hologram Bot');
  holographicBot.appearance.material = {
    type: MaterialType.HOLOGRAPHIC,
    wear: WearType.PRISTINE,
    intensity: 0.9,
    animationSpeed: 2.0
  };
  holographicBot.appearance.primaryColor = '#00ffff';
  holographicBot.appearance.secondaryColor = '#ff00ff';
  holographicBot.appearance.accentColor = '#ffff00';

  console.log(`   ✓ Holographic Material with ${holographicBot.appearance.material.intensity * 100}% intensity`);
  console.log(`   ✓ Animation Speed: ${holographicBot.appearance.material.animationSpeed}x`);
  console.log(`   ✓ Wear Condition: ${holographicBot.appearance.material.wear}\n`);

  // 4. Demonstrate accessory system
  console.log('4. Advanced Accessory Configuration:');

  const eliteBot = createDefaultEnhancedBotConfig('Elite Warrior');
  eliteBot.chassis = ChassisType.TANK;
  eliteBot.weapon = WeaponType.CANNON;
  eliteBot.appearance.accessories = {
    antennaType: AntennaType.BROADCAST,
    armorPlating: ArmorPlatingStyle.REACTIVE,
    weaponModifications: [
      WeaponModificationType.SCOPE,
      WeaponModificationType.CHARGE_ENHANCER,
      WeaponModificationType.STABILIZER
    ],
    emotiveElements: [
      EmotiveElementType.ANIMATED_EYES,
      EmotiveElementType.LED_STRIP,
      EmotiveElementType.HOLOGRAPHIC_DISPLAY,
      EmotiveElementType.PARTICLE_EMITTER
    ]
  };

  console.log(`   ✓ Antenna: ${eliteBot.appearance.accessories.antennaType}`);
  console.log(`   ✓ Armor Plating: ${eliteBot.appearance.accessories.armorPlating}`);
  console.log(`   ✓ Weapon Mods: ${eliteBot.appearance.accessories.weaponModifications.join(', ')}`);
  console.log(`   ✓ Emotive Elements: ${eliteBot.appearance.accessories.emotiveElements.join(', ')}\n`);

  // 5. Demonstrate personality configuration
  console.log('5. Custom Personality Configuration:');

  const uniqueBot = createDefaultEnhancedBotConfig('Unique Bot');
  uniqueBot.personality = {
    primaryTrait: PersonalityTrait.ADAPTIVE,
    secondaryTraits: [PersonalityTrait.TACTICAL, PersonalityTrait.OPPORTUNISTIC],
    aggressionLevel: 0.7,
    cautionLevel: 0.8,
    adaptabilityLevel: 0.9
  };

  console.log(`   ✓ Primary Trait: ${uniqueBot.personality.primaryTrait}`);
  console.log(`   ✓ Secondary Traits: ${uniqueBot.personality.secondaryTraits.join(', ')}`);
  console.log(`   ✓ Aggression: ${uniqueBot.personality.aggressionLevel * 100}%`);
  console.log(`   ✓ Caution: ${uniqueBot.personality.cautionLevel * 100}%`);
  console.log(`   ✓ Adaptability: ${uniqueBot.personality.adaptabilityLevel * 100}%\n`);

  // 6. Demonstrate victory customization
  console.log('6. Victory Celebration Configuration:');

  const showoffBot = createDefaultEnhancedBotConfig('Showoff Bot');
  showoffBot.victoryConfig = {
    animationType: VictoryAnimationType.VICTORY_DANCE_ENERGETIC,
    effectType: VictoryEffectType.LIGHT_SHOW,
    soundPack: SoundPackType.CYBERPUNK,
    duration: 5.0
  };

  console.log(`   ✓ Animation: ${showoffBot.victoryConfig.animationType}`);
  console.log(`   ✓ Effects: ${showoffBot.victoryConfig.effectType}`);
  console.log(`   ✓ Sound Pack: ${showoffBot.victoryConfig.soundPack}`);
  console.log(`   ✓ Duration: ${showoffBot.victoryConfig.duration} seconds\n`);

  // 7. Demonstrate stat calculation
  console.log('7. Enhanced Stat Calculation:');

  const testBots = [aggressiveBot, tacticalBot, eliteBot];
  testBots.forEach((bot, index) => {
    const stats = calculateBotEffectiveness(bot);
    console.log(`   Bot ${index + 1} (${bot.name}):`);
    console.log(`     Health: ${stats.health}, Speed: ${stats.speed}, Damage: ${stats.damage}, Special: ${stats.special}`);
    console.log(`     Overall Rating: ${stats.overall}/100`);
  });
  console.log('');

  // 8. Demonstrate validation
  console.log('8. Configuration Validation:');

  const validationResults = testBots.map(bot => validateEnhancedBotConfig(bot));
  validationResults.forEach((result, index) => {
    console.log(`   Bot ${index + 1}: ${result.isValid ? '✓ Valid' : '✗ Invalid'}`);
    if (!result.isValid) {
      result.errors.forEach(error => console.log(`     - ${error}`));
    }
  });
  console.log('');

  // 9. Show feature summary
  console.log('9. Enhanced Customization Features Summary:');
  console.log('   ✓ 6 Material Types (Matte, Glossy, Metallic, Holographic, Animated Energy, Animated Pulse)');
  console.log('   ✓ 5 Wear Conditions (Pristine, Battle-worn, Decorated, Weathered, Veteran)');
  console.log('   ✓ 5 Antenna Types (Combat, Stealth, Broadcast, Scanner, Tactical)');
  console.log('   ✓ 6 Armor Plating Styles (Standard, Reinforced, Ablative, Reactive, Stealth, Ceremonial)');
  console.log('   ✓ 6 Weapon Modifications (Scope, Barrel Extension, Grip, Stabilizer, Suppressor, Charge Enhancer)');
  console.log('   ✓ 5 Emotive Elements (Static Eyes, Animated Eyes, LED Strip, Holographic Display, Particle Emitter)');
  console.log('   ✓ 5 Personality Traits with granular control sliders');
  console.log('   ✓ 6 Victory Animations with 6 Effect Types and 6 Sound Packs');
  console.log('   ✓ Dynamic stat calculation based on personality and equipment');
  console.log('   ✓ Comprehensive validation system');
  console.log('   ✓ Personality-based presets for quick setup\n');

  console.log('🎉 Enhanced Customization System Demo Complete!');
  console.log('Players can now create truly unique battle bots with deep personalization options.');
}

// Example of how to integrate with existing bot builder
export function createSampleEnhancedBots() {
  return [
    // Aggressive Berserker
    {
      ...createDefaultEnhancedBotConfig('Crimson Fury'),
      chassis: ChassisType.SPEED,
      weapon: WeaponType.SHOTGUN,
      special: SpecialType.SPEED_BOOST,
      ...createPersonalityPreset(PersonalityTrait.AGGRESSIVE)
    },

    // Tactical Defender
    {
      ...createDefaultEnhancedBotConfig('Steel Guardian'),
      chassis: ChassisType.TANK,
      weapon: WeaponType.CANNON,
      special: SpecialType.SHIELD,
      ...createPersonalityPreset(PersonalityTrait.PROTECTIVE)
    },

    // Stealth Opportunist
    {
      ...createDefaultEnhancedBotConfig('Shadow Strike'),
      chassis: ChassisType.BALANCED,
      weapon: WeaponType.BLASTER,
      special: SpecialType.REPAIR,
      ...createPersonalityPreset(PersonalityTrait.OPPORTUNISTIC)
    },

    // Adaptive Strategist
    {
      ...createDefaultEnhancedBotConfig('Mind Matrix'),
      chassis: ChassisType.BALANCED,
      weapon: WeaponType.BLASTER,
      special: SpecialType.SHIELD,
      ...createPersonalityPreset(PersonalityTrait.TACTICAL)
    },

    // Balanced Adaptive
    {
      ...createDefaultEnhancedBotConfig('Evolve Prime'),
      chassis: ChassisType.BALANCED,
      weapon: WeaponType.BLASTER,
      special: SpecialType.REPAIR,
      ...createPersonalityPreset(PersonalityTrait.ADAPTIVE)
    }
  ];
}

// Export for use in other parts of the application
