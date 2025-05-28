import { v4 as uuidv4 } from 'uuid';
import { BattleState, Player, BotState, GameMode, BattlePhase, Arena } from '../types/game';
import { logger } from '../utils/logger';
import { Battle } from './Battle';

export class GameManager {
  private battles: Map<string, Battle> = new Map();
  private playerToBattle: Map<string, string> = new Map();
  private totalGamesPlayed: number = 0;

  constructor() {
    logger.info('GameManager initialized');
  }

  /**
   * Create a new battle with the given players
   */
  createBattle(players: Player[], mode: GameMode, arena: Arena): string {
    const battleId = uuidv4();
    const battle = new Battle(battleId, players, mode, arena);

    this.battles.set(battleId, battle);

    // Map players to this battle
    players.forEach(player => {
      this.playerToBattle.set(player.id, battleId);
    });

    logger.info(`Created battle ${battleId} with ${players.length} players in ${mode} mode`);

    return battleId;
  }

  /**
   * Get battle by ID
   */
  getBattle(battleId: string): Battle | undefined {
    return this.battles.get(battleId);
  }

  /**
   * Get battle state by ID
   */
  getBattleState(battleId: string): BattleState | undefined {
    const battle = this.battles.get(battleId);
    return battle?.getState();
  }

  /**
   * Get battle ID for a player
   */
  getPlayerBattle(playerId: string): string | undefined {
    return this.playerToBattle.get(playerId);
  }

  /**
   * Start a battle
   */
  startBattle(battleId: string): boolean {
    const battle = this.battles.get(battleId);
    if (!battle) {
      logger.error(`Attempted to start non-existent battle: ${battleId}`);
      return false;
    }

    battle.start();
    logger.info(`Started battle: ${battleId}`);
    return true;
  }

  /**
   * End a battle
   */
  endBattle(battleId: string): void {
    const battle = this.battles.get(battleId);
    if (!battle) {
      logger.error(`Attempted to end non-existent battle: ${battleId}`);
      return;
    }

    // Remove player mappings
    const state = battle.getState();
    state.players.forEach(player => {
      this.playerToBattle.delete(player.id);
    });

    // Clean up battle
    this.battles.delete(battleId);
    this.totalGamesPlayed++;

    logger.info(`Ended battle: ${battleId}`);
  }

  /**
   * Handle player input for a battle
   */
  handlePlayerInput(playerId: string, input: any): void {
    const battleId = this.playerToBattle.get(playerId);
    if (!battleId) {
      logger.warn(`Player ${playerId} not in any battle`);
      return;
    }

    const battle = this.battles.get(battleId);
    if (!battle) {
      logger.error(`Battle ${battleId} not found for player ${playerId}`);
      return;
    }

    battle.handlePlayerInput(playerId, input);
  }

  /**
   * Handle player disconnect
   */
  handlePlayerDisconnect(playerId: string): void {
    const battleId = this.playerToBattle.get(playerId);
    if (!battleId) {
      return; // Player not in any battle
    }

    const battle = this.battles.get(battleId);
    if (!battle) {
      logger.error(`Battle ${battleId} not found for disconnecting player ${playerId}`);
      return;
    }

    battle.handlePlayerDisconnect(playerId);
    this.playerToBattle.delete(playerId);

    logger.info(`Player ${playerId} disconnected from battle ${battleId}`);
  }

  /**
   * Update all active battles
   */
  update(deltaTime: number): void {
    for (const [battleId, battle] of this.battles) {
      battle.update(deltaTime);

      // Check if battle is finished
      if (battle.getState().phase === BattlePhase.FINISHED) {
        this.endBattle(battleId);
      }
    }
  }

  /**
   * Get number of active battles
   */
  getActiveBattleCount(): number {
    return this.battles.size;
  }

  /**
   * Get total games played
   */
  getTotalGamesPlayed(): number {
    return this.totalGamesPlayed;
  }

  /**
   * Get all active battle states
   */
  getAllBattleStates(): BattleState[] {
    return Array.from(this.battles.values()).map(battle => battle.getState());
  }

  /**
   * Force end all battles (for shutdown)
   */
  shutdown(): void {
    logger.info('Shutting down GameManager, ending all battles');

    for (const [battleId] of this.battles) {
      this.endBattle(battleId);
    }

    this.battles.clear();
    this.playerToBattle.clear();
  }
}
