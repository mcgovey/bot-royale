/**
 * Import validation tests for client
 * These tests ensure all modules can be imported without errors
 */

import '@testing-library/jest-dom';

describe('Client Import Validation', () => {
  it('should import all game types without errors', () => {
    expect(() => {
      require('../types/game');
    }).not.toThrow();
  });

  it('should import gameStore without errors', () => {
    expect(() => {
      require('../store/gameStore');
    }).not.toThrow();
  });

  it('should import components without errors', () => {
    expect(() => {
      require('../components/BotBuilder');
    }).not.toThrow();

    expect(() => {
      require('../components/BattleArena');
    }).not.toThrow();

    expect(() => {
      require('../components/MainMenu');
    }).not.toThrow();
  });
});

describe('Type Exports', () => {
  it('should export all required game types', () => {
    const gameTypes = require('../types/game');

    // Check enums exist
    expect(gameTypes.ChassisType).toBeDefined();
    expect(gameTypes.WeaponType).toBeDefined();
    expect(gameTypes.DefensiveModuleType).toBeDefined();
    expect(gameTypes.UtilityModuleType).toBeDefined();
    expect(gameTypes.GameMode).toBeDefined();
    expect(gameTypes.BattlePhase).toBeDefined();
    expect(gameTypes.PremiumTier).toBeDefined();
  });
});
