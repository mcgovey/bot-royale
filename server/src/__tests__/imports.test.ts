/**
 * Import validation tests
 * These tests ensure all modules can be imported without errors
 */

describe('Import Validation', () => {
  it('should import all game types without errors', async () => {
    expect(() => {
      require('../types/game');
    }).not.toThrow();
  });

  it('should import Battle class without errors', async () => {
    expect(() => {
      require('../game/Battle');
    }).not.toThrow();
  });

  it('should import GameManager class without errors', async () => {
    expect(() => {
      require('../game/GameManager');
    }).not.toThrow();
  });

  it('should import MatchmakingService class without errors', async () => {
    expect(() => {
      require('../services/MatchmakingService');
    }).not.toThrow();
  });

  it('should import PlayerService class without errors', async () => {
    expect(() => {
      require('../services/PlayerService');
    }).not.toThrow();
  });

  it('should import socket handlers without errors', async () => {
    expect(() => {
      require('../socket/socketHandlers');
    }).not.toThrow();
  });

  it('should import logger without errors', async () => {
    expect(() => {
      require('../utils/logger');
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
