import { Player, PlayerStats, BotConfiguration } from '../types/game';
import { logger } from '../utils/logger';

interface PlayerSession {
  player: Player;
  socketId: string;
  lastActivity: number;
  isOnline: boolean;
}

export class PlayerService {
  private players: Map<string, Player> = new Map();
  private sessions: Map<string, PlayerSession> = new Map();
  private socketToPlayer: Map<string, string> = new Map();

  constructor() {
    logger.info('PlayerService initialized');
  }

  /**
   * Create or update a player
   */
  createPlayer(playerData: Partial<Player>): Player {
    const player: Player = {
      id: playerData.id || `player_${Date.now()}`,
      username: playerData.username || 'Anonymous',
      level: playerData.level || 1,
      rank: playerData.rank || 'Unranked',
      stats: playerData.stats || this.getDefaultStats(),
      currentBot: playerData.currentBot,
      isReady: false,
      isConnected: false
    };

    this.players.set(player.id, player);
    logger.info(`Player created: ${player.username} (${player.id})`);

    return player;
  }

  /**
   * Get player by ID
   */
  getPlayer(playerId: string): Player | undefined {
    return this.players.get(playerId);
  }

  /**
   * Get player by socket ID
   */
  getPlayerBySocket(socketId: string): Player | undefined {
    const playerId = this.socketToPlayer.get(socketId);
    return playerId ? this.players.get(playerId) : undefined;
  }

  /**
   * Set player online with socket connection
   */
  setPlayerOnline(player: Player, socketId: string): void {
    player.isConnected = true;

    const session: PlayerSession = {
      player,
      socketId,
      lastActivity: Date.now(),
      isOnline: true
    };

    this.sessions.set(player.id, session);
    this.socketToPlayer.set(socketId, player.id);
    this.players.set(player.id, player);

    logger.info(`Player ${player.username} connected with socket ${socketId}`);
  }

  /**
   * Set player offline
   */
  setPlayerOffline(socketId: string): void {
    const playerId = this.socketToPlayer.get(socketId);
    if (!playerId) return;

    const player = this.players.get(playerId);
    if (player) {
      player.isConnected = false;
      player.isReady = false;
    }

    const session = this.sessions.get(playerId);
    if (session) {
      session.isOnline = false;
    }

    this.socketToPlayer.delete(socketId);
    logger.info(`Player ${playerId} disconnected`);
  }

  /**
   * Update player's bot configuration
   */
  updatePlayerBot(playerId: string, botConfig: BotConfiguration): boolean {
    const player = this.players.get(playerId);
    if (!player) {
      logger.error(`Player ${playerId} not found for bot update`);
      return false;
    }

    player.currentBot = botConfig;
    logger.info(`Updated bot configuration for player ${player.username}`);
    return true;
  }

  /**
   * Set player ready status
   */
  setPlayerReady(playerId: string, isReady: boolean): boolean {
    const player = this.players.get(playerId);
    if (!player) {
      logger.error(`Player ${playerId} not found for ready status update`);
      return false;
    }

    player.isReady = isReady;
    logger.info(`Player ${player.username} ready status: ${isReady}`);
    return true;
  }

  /**
   * Update player statistics after a battle
   */
  updatePlayerStats(playerId: string, battleStats: {
    won: boolean;
    kills: number;
    deaths: number;
    damageDealt: number;
    damageTaken: number;
  }): void {
    const player = this.players.get(playerId);
    if (!player) {
      logger.error(`Player ${playerId} not found for stats update`);
      return;
    }

    const stats = player.stats;
    stats.gamesPlayed++;

    if (battleStats.won) {
      stats.wins++;
    } else {
      stats.losses++;
    }

    stats.kills += battleStats.kills;
    stats.deaths += battleStats.deaths;
    stats.damageDealt += battleStats.damageDealt;
    stats.damageTaken += battleStats.damageTaken;

    // Recalculate derived stats
    stats.winRate = stats.wins / stats.gamesPlayed;
    stats.averageKDA = stats.kills / (stats.deaths || 1);

    // Level up logic (simple XP system)
    const xpGained = battleStats.won ? 100 : 50;
    const xpForNextLevel = player.level * 1000;

    if (xpGained >= xpForNextLevel) {
      player.level++;
      logger.info(`Player ${player.username} leveled up to ${player.level}!`);
    }

    logger.info(`Updated stats for player ${player.username}`);
  }

  /**
   * Get all online players
   */
  getOnlinePlayers(): Player[] {
    return Array.from(this.sessions.values())
      .filter(session => session.isOnline)
      .map(session => session.player);
  }

  /**
   * Get player count
   */
  getPlayerCount(): { total: number; online: number } {
    const online = Array.from(this.sessions.values()).filter(s => s.isOnline).length;
    return {
      total: this.players.size,
      online
    };
  }

  /**
   * Update player activity
   */
  updateActivity(socketId: string): void {
    const playerId = this.socketToPlayer.get(socketId);
    if (!playerId) return;

    const session = this.sessions.get(playerId);
    if (session) {
      session.lastActivity = Date.now();
    }
  }

  /**
   * Clean up inactive sessions
   */
  cleanupInactiveSessions(): void {
    const now = Date.now();
    const timeout = 30 * 60 * 1000; // 30 minutes

    for (const [playerId, session] of this.sessions) {
      if (now - session.lastActivity > timeout && !session.isOnline) {
        this.sessions.delete(playerId);
        logger.info(`Cleaned up inactive session for player ${playerId}`);
      }
    }
  }

  /**
   * Get default player statistics
   */
  private getDefaultStats(): PlayerStats {
    return {
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      kills: 0,
      deaths: 0,
      damageDealt: 0,
      damageTaken: 0,
      winRate: 0,
      averageKDA: 0
    };
  }

  /**
   * Validate player data
   */
  validatePlayer(player: Partial<Player>): boolean {
    return !!(player.username && player.username.length >= 3 && player.username.length <= 20);
  }

  /**
   * Get leaderboard
   */
  getLeaderboard(limit: number = 10): Player[] {
    return Array.from(this.players.values())
      .sort((a, b) => {
        // Sort by wins, then by win rate, then by level
        if (a.stats.wins !== b.stats.wins) {
          return b.stats.wins - a.stats.wins;
        }
        if (a.stats.winRate !== b.stats.winRate) {
          return b.stats.winRate - a.stats.winRate;
        }
        return b.level - a.level;
      })
      .slice(0, limit);
  }

  /**
   * Shutdown the player service
   */
  shutdown(): void {
    this.players.clear();
    this.sessions.clear();
    this.socketToPlayer.clear();
    logger.info('PlayerService shutdown');
  }
}
