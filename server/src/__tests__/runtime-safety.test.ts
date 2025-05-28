/**
 * Runtime Safety Tests for Server
 * These tests ensure the server starts properly and handles edge cases
 */

import { GameManager } from '../game/GameManager';
import { MatchmakingService } from '../services/MatchmakingService';
import { PlayerService } from '../services/PlayerService';
import { logger } from '../utils/logger';
import { GameMode } from '../types/game';

describe('Server Runtime Safety', () => {
  beforeEach(() => {
    // Clear any existing instances
    jest.clearAllMocks();
  });

  describe('GameManager', () => {
    it('should initialize without errors', () => {
      expect(() => {
        const gameManager = new GameManager();
        expect(gameManager).toBeDefined();
      }).not.toThrow();
    });

    it('should handle empty battle updates gracefully', () => {
      const gameManager = new GameManager();

      expect(() => {
        gameManager.update(16.67); // 60fps delta time
      }).not.toThrow();
    });

    it('should create battles without errors', () => {
      const gameManager = new GameManager();

      const mockPlayer1 = {
        id: 'player1',
        username: 'TestPlayer1',
        level: 1,
        rank: 'Bronze',
        stats: {
          gamesPlayed: 0,
          wins: 0,
          losses: 0,
          kills: 0,
          deaths: 0,
          damageDealt: 0,
          damageTaken: 0,
          winRate: 0,
          averageKDA: 0
        },
        currentBot: {
          id: 'test-bot-1',
          name: 'Test Bot 1',
          chassis: {
            id: 'chassis-1',
            type: 'MEDIUM' as any,
            stats: {
              health: 100,
              armor: 50,
              speed: 10,
              weaponSlots: 2,
              energyCapacity: 100,
              mass: 1000
            }
          },
          weapons: [{
            id: 'weapon-1',
            type: 'LASER_CANNON' as any,
            stats: {
              damage: 25,
              range: 100,
              fireRate: 2,
              energyCost: 10,
              accuracy: 0.9,
              projectileSpeed: 100,
              heatGeneration: 5
            }
          }],
          defensiveModules: [],
          utilityModules: [],
          customization: {
            primaryColor: '#0000FF',
            secondaryColor: '#FF0000'
          }
        },
        isReady: true,
        isConnected: true
      };

      const mockPlayer2 = { ...mockPlayer1, id: 'player2', username: 'TestPlayer2' };

      const mockArena = {
        id: 'test-arena',
        name: 'Test Arena',
        description: 'Test arena for unit tests',
        size: { x: 100, y: 20, z: 100 },
        spawnPoints: [
          { x: -40, y: 0, z: -40 },
          { x: 40, y: 0, z: 40 }
        ],
        obstacles: [],
        powerUpSpawns: [
          { x: 0, y: 0, z: 0 }
        ],
        environment: {
          lighting: 'dynamic',
          skybox: 'cyber',
          gravity: 9.81
        }
      };

      expect(() => {
        const battleId = gameManager.createBattle([mockPlayer1, mockPlayer2], GameMode.QUICK_MATCH, mockArena);
        expect(battleId).toBeDefined();
        expect(typeof battleId).toBe('string');
      }).not.toThrow();
    });
  });

  describe('MatchmakingService', () => {
    it('should initialize without errors', () => {
      const gameManager = new GameManager();

      expect(() => {
        const matchmaking = new MatchmakingService(gameManager);
        expect(matchmaking).toBeDefined();
        matchmaking.shutdown(); // Clean up interval
      }).not.toThrow();
    });

    it('should add players to queue without errors', () => {
      const gameManager = new GameManager();
      const matchmaking = new MatchmakingService(gameManager);

      const mockPlayer = {
        id: 'player1',
        username: 'TestPlayer',
        level: 1,
        rank: 'Bronze',
        stats: {
          gamesPlayed: 0,
          wins: 0,
          losses: 0,
          kills: 0,
          deaths: 0,
          damageDealt: 0,
          damageTaken: 0,
          winRate: 0,
          averageKDA: 0
        },
        isReady: true,
        isConnected: true
      };

      const mockRequest = {
        playerId: 'player1',
        gameMode: GameMode.QUICK_MATCH,
        skillLevel: 10,
        botConfiguration: {
          id: 'test-bot',
          name: 'Test Bot',
          chassis: {
            id: 'chassis-1',
            type: 'MEDIUM' as any,
            stats: {
              health: 100,
              armor: 50,
              speed: 10,
              weaponSlots: 2,
              energyCapacity: 100,
              mass: 1000
            }
          },
          weapons: [],
          defensiveModules: [],
          utilityModules: [],
          customization: {
            primaryColor: '#0000FF',
            secondaryColor: '#FF0000'
          }
        }
      };

      expect(() => {
        matchmaking.addPlayerToQueue(mockPlayer, mockRequest);
      }).not.toThrow();

      matchmaking.shutdown(); // Clean up interval
    });
  });

  describe('PlayerService', () => {
    it('should initialize without errors', () => {
      expect(() => {
        const playerService = new PlayerService();
        expect(playerService).toBeDefined();
      }).not.toThrow();
    });

    it('should handle player operations safely', () => {
      const playerService = new PlayerService();

      const mockPlayerData = {
        id: 'player1',
        username: 'TestPlayer',
        level: 1,
        rank: 'Bronze'
      };

      expect(() => {
        const player = playerService.createPlayer(mockPlayerData);
        expect(player).toBeDefined();
        expect(player.id).toBe('player1');
        expect(player.username).toBe('TestPlayer');

        const retrieved = playerService.getPlayer('player1');
        expect(retrieved).toEqual(player);
      }).not.toThrow();
    });

    it('should handle missing players gracefully', () => {
      const playerService = new PlayerService();

      expect(() => {
        const player = playerService.getPlayer('nonexistent');
        expect(player).toBeUndefined();
      }).not.toThrow();
    });

    it('should update player stats without errors', () => {
      const playerService = new PlayerService();

      const mockPlayerData = {
        id: 'player1',
        username: 'TestPlayer',
        level: 1,
        rank: 'Bronze'
      };

      const player = playerService.createPlayer(mockPlayerData);

      expect(() => {
        playerService.updatePlayerStats('player1', {
          won: true,
          kills: 2,
          deaths: 1,
          damageDealt: 500,
          damageTaken: 200
        });
      }).not.toThrow();
    });
  });

  describe('Logger Safety', () => {
    it('should handle logging without errors', () => {
      expect(() => {
        logger.info('Test info message');
        logger.warn('Test warning message');
        logger.error('Test error message');
      }).not.toThrow();
    });

    it('should handle logging with objects', () => {
      expect(() => {
        logger.info('Test with object', { key: 'value', number: 123 });
      }).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should not crash on invalid input', () => {
      const gameManager = new GameManager();

      expect(() => {
        // Test with invalid delta time
        gameManager.update(-1);
        gameManager.update(NaN);
        gameManager.update(Infinity);
      }).not.toThrow();
    });

    it('should handle null/undefined gracefully', () => {
      const playerService = new PlayerService();

      expect(() => {
        // These should not crash the service
        playerService.getPlayer('');
        playerService.setPlayerOffline('nonexistent-socket');
      }).not.toThrow();
    });
  });
});
