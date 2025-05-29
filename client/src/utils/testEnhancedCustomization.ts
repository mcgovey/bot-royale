import { demonstrateEnhancedCustomization, createSampleEnhancedBots } from './enhancedCustomizationDemo';

// Test the enhanced customization system
console.log('🚀 Testing Enhanced Customization System...');

try {
  // Run the comprehensive demonstration
  demonstrateEnhancedCustomization();

  // Create sample bots to verify functionality
  const sampleBots = createSampleEnhancedBots();
  console.log(`✅ Successfully created ${sampleBots.length} sample bots`);

  // Display summary of each sample bot
  sampleBots.forEach((bot, index) => {
    console.log(`Bot ${index + 1}: ${bot.name}`);
    console.log(`  - Personality: ${bot.personality.primaryTrait}`);
    console.log(`  - Material: ${bot.appearance.material.type}`);
    console.log(`  - Colors: ${bot.appearance.primaryColor} / ${bot.appearance.secondaryColor}`);
  });

  console.log('🎉 Enhanced Customization System test completed successfully!');
} catch (error) {
  console.error('❌ Error testing enhanced customization:', error);
}
