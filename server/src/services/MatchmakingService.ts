import { GameMode, Player, Arena, MatchmakingRequest, MatchFound } from '../types/game';
import { logger } from '../utils/logger';
import { GameManager } from '../game/GameManager';

interface QueuedPlayer {
  player: Player;
  request: MatchmakingRequest;
  queueTime: number;
  skillLevel: number;
}

export class MatchmakingService {
  private queues: Map<GameMode, QueuedPlayer[]> = new Map();
  private gameManager: GameManager;
  private matchmakingInterval: NodeJS.Timeout;

  constructor(gameManager: GameManager) {
    this.gameManager = gameManager;

    // Initialize queues for each game mode
    Object.values(GameMode).forEach(mode => {
      this.queues.set(mode, []);
    });

    // Start matchmaking loop
    this.matchmakingInterval = setInterval(() => {
      this.processMatchmaking();
    }, 2000); // Check every 2 seconds

    logger.info('MatchmakingService initialized');
  }

  /**
   * Add player to matchmaking queue
   */
  addPlayerToQueue(player: Player, request: MatchmakingRequest): void {
    const queue = this.queues.get(request.gameMode);
    if (!queue) {
      logger.error(`Invalid game mode: ${request.gameMode}`);
      return;
    }

    // Remove player from any existing queues first
    this.removePlayerFromQueue(player.id);

    const queuedPlayer: QueuedPlayer = {
      player,
      request,
      queueTime: Date.now(),
      skillLevel: this.calculateSkillLevel(player)
    };

    queue.push(queuedPlayer);
    logger.info(`Player ${player.username} added to ${request.gameMode} queue`);
  }

  /**
   * Remove player from all queues
   */
  removePlayerFromQueue(playerId: string): void {
    for (const [mode, queue] of this.queues) {
      const index = queue.findIndex(qp => qp.player.id === playerId);
      if (index !== -1) {
        queue.splice(index, 1);
        logger.info(`Player ${playerId} removed from ${mode} queue`);
      }
    }
  }

  /**
   * Get queue status for a player
   */
  getQueueStatus(playerId: string): { mode: GameMode; position: number; estimatedWait: number } | null {
    for (const [mode, queue] of this.queues) {
      const index = queue.findIndex(qp => qp.player.id === playerId);
      if (index !== -1) {
        return {
          mode,
          position: index + 1,
          estimatedWait: this.estimateWaitTime(mode, index)
        };
      }
    }
    return null;
  }

  /**
   * Process matchmaking for all queues
   */
  private processMatchmaking(): void {
    for (const [mode, queue] of this.queues) {
      if (queue.length >= this.getRequiredPlayers(mode)) {
        this.attemptMatch(mode, queue);
      }
    }
  }

  /**
   * Attempt to create a match for a specific game mode
   */
  private attemptMatch(mode: GameMode, queue: QueuedPlayer[]): void {
    const requiredPlayers = this.getRequiredPlayers(mode);

    if (queue.length < requiredPlayers) {
      return;
    }

    // Sort by queue time and skill level
    queue.sort((a, b) => {
      const timeDiff = a.queueTime - b.queueTime;
      const skillDiff = Math.abs(a.skillLevel - b.skillLevel);
      return timeDiff + (skillDiff * 1000); // Prioritize time, but consider skill
    });

    // Take the first players for the match
    const matchedPlayers = queue.splice(0, requiredPlayers);

    // Validate skill balance
    if (!this.isSkillBalanced(matchedPlayers)) {
      // Put players back in queue if skill gap is too large
      queue.unshift(...matchedPlayers);
      return;
    }

    // Create the match
    this.createMatch(mode, matchedPlayers);
  }

  /**
   * Create a match with the given players
   */
  private createMatch(mode: GameMode, queuedPlayers: QueuedPlayer[]): void {
    const players = queuedPlayers.map(qp => qp.player);
    const arena = this.selectArena(mode);

    const battleId = this.gameManager.createBattle(players, mode, arena);

    const matchFound: MatchFound = {
      battleId,
      players,
      arena,
      estimatedStartTime: Date.now() + 5000 // 5 seconds from now
    };

    logger.info(`Match created: ${battleId} for ${players.length} players in ${mode} mode`);

    // Notify players (this would be handled by the socket system)
    // For now, we'll emit this through the game manager
  }

  /**
   * Calculate skill level for a player
   */
  private calculateSkillLevel(player: Player): number {
    const { wins, losses, kills, deaths } = player.stats;
    const winRate = wins / (wins + losses || 1);
    const kda = kills / (deaths || 1);

    // Simple skill calculation (can be made more sophisticated)
    return Math.floor((winRate * 50) + (kda * 25) + (player.level * 2));
  }

  /**
   * Check if players are skill-balanced
   */
  private isSkillBalanced(players: QueuedPlayer[]): boolean {
    if (players.length < 2) return true;

    const skillLevels = players.map(p => p.skillLevel);
    const maxSkill = Math.max(...skillLevels);
    const minSkill = Math.min(...skillLevels);

    // Allow up to 20 skill level difference
    return (maxSkill - minSkill) <= 20;
  }

  /**
   * Get required number of players for a game mode
   */
  private getRequiredPlayers(mode: GameMode): number {
    switch (mode) {
      case GameMode.QUICK_MATCH:
      case GameMode.RANKED:
      case GameMode.PRACTICE:
        return 2;
      case GameMode.FREE_FOR_ALL:
        return 4;
      case GameMode.TOURNAMENT:
        return 8;
      default:
        return 2;
    }
  }

  /**
   * Select appropriate arena for game mode
   */
  private selectArena(mode: GameMode): Arena {
    // This would normally select from a pool of arenas
    // For now, return a default arena
    return {
      id: 'arena_1',
      name: 'Cyber Colosseum',
      description: 'A futuristic arena with multiple levels and cover points',
      size: { x: 100, y: 20, z: 100 },
      spawnPoints: [
        { x: -40, y: 0, z: -40 },
        { x: 40, y: 0, z: 40 },
        { x: -40, y: 0, z: 40 },
        { x: 40, y: 0, z: -40 }
      ],
      obstacles: [
        {
          id: 'wall_1',
          type: 'wall',
          position: { x: 0, y: 5, z: 0 },
          size: { x: 20, y: 10, z: 2 },
          rotation: { x: 0, y: 0, z: 0, w: 1 },
          material: 'metal'
        }
      ],
      powerUpSpawns: [
        { x: 0, y: 0, z: 0 },
        { x: 20, y: 0, z: 20 },
        { x: -20, y: 0, z: -20 }
      ],
      environment: {
        lighting: 'neon',
        skybox: 'cyber_city',
        gravity: 9.81
      }
    };
  }

  /**
   * Estimate wait time for a player in queue
   */
  private estimateWaitTime(mode: GameMode, position: number): number {
    const requiredPlayers = this.getRequiredPlayers(mode);
    const averageMatchTime = 180; // 3 minutes average

    return Math.ceil(position / requiredPlayers) * averageMatchTime;
  }

  /**
   * Get queue statistics
   */
  getQueueStats(): { [mode: string]: number } {
    const stats: { [mode: string]: number } = {};

    for (const [mode, queue] of this.queues) {
      stats[mode] = queue.length;
    }

    return stats;
  }

  /**
   * Shutdown the matchmaking service
   */
  shutdown(): void {
    if (this.matchmakingInterval) {
      clearInterval(this.matchmakingInterval);
    }

    // Clear all queues
    for (const queue of this.queues.values()) {
      queue.length = 0;
    }

    logger.info('MatchmakingService shutdown');
  }
}
