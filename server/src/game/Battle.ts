import {
  BattleState,
  Player,
  BotState,
  GameMode,
  BattlePhase,
  Arena,
  PlayerInput,
  BattleStats,
  Vector3,
  ChassisStats,
  WeaponStats,
  WeaponType
} from '../types/game';
import { logger } from '../utils/logger';

export class Battle {
  private state: BattleState;
  private lastUpdateTime: number = Date.now();
  private battleStartTime: number = 0;

  constructor(id: string, players: Player[], mode: GameMode, arena: Arena) {
    this.state = {
      id,
      mode,
      phase: BattlePhase.WAITING,
      arena,
      players,
      bots: this.initializeBots(players, arena),
      projectiles: [],
      powerUps: [],
      timeRemaining: this.getBattleDuration(mode),
      scores: this.initializeScores(players),
      events: [],
      result: undefined,
      stats: undefined
    };

    logger.info(`Battle ${id} created with ${players.length} players`);
  }

  /**
   * Initialize bot states from player configurations
   */
  private initializeBots(players: Player[], arena: Arena): BotState[] {
    return players.map((player, index) => {
      const spawnPosition = arena.spawnPoints[index] || { x: 0, y: 0, z: 0 };

      return {
        id: `bot_${player.id}`,
        playerId: player.id,
        configuration: player.currentBot!,
        position: spawnPosition,
        rotation: { x: 0, y: 0, z: 0, w: 1 },
        velocity: { x: 0, y: 0, z: 0 },
        health: (player.currentBot!.chassis.stats as ChassisStats).health,
        energy: (player.currentBot!.chassis.stats as ChassisStats).energyCapacity,
        heat: 0,
        status: {
          isAlive: true,
          isShielded: false,
          isCloaked: false,
          isBoosting: false,
          isOverheated: false
        },
        activeEffects: []
      };
    });
  }

  /**
   * Initialize player scores
   */
  private initializeScores(players: Player[]): { [playerId: string]: number } {
    const scores: { [playerId: string]: number } = {};
    players.forEach(player => {
      scores[player.id] = 0;
    });
    return scores;
  }

  /**
   * Get battle duration based on game mode
   */
  private getBattleDuration(mode: GameMode): number {
    switch (mode) {
      case GameMode.QUICK_MATCH:
        return 180; // 3 minutes
      case GameMode.RANKED:
        return 300; // 5 minutes
      case GameMode.TOURNAMENT:
        return 420; // 7 minutes
      case GameMode.PRACTICE:
        return 600; // 10 minutes
      case GameMode.FREE_FOR_ALL:
        return 240; // 4 minutes
      default:
        return 300;
    }
  }

  /**
   * Start the battle
   */
  start(): void {
    this.state.phase = BattlePhase.COUNTDOWN;
    this.battleStartTime = Date.now();

    // Start countdown timer (3 seconds)
    setTimeout(() => {
      if (this.state.phase === BattlePhase.COUNTDOWN) {
        this.state.phase = BattlePhase.ACTIVE;
        logger.info(`Battle ${this.state.id} started`);
      }
    }, 3000);
  }

  /**
   * Update battle state
   */
  update(deltaTime: number): void {
    if (this.state.phase !== BattlePhase.ACTIVE) {
      return;
    }

    const now = Date.now();
    const realDeltaTime = (now - this.lastUpdateTime) / 1000;
    this.lastUpdateTime = now;

    // Update time remaining
    this.state.timeRemaining -= realDeltaTime;

    // Update bot physics and AI
    this.updateBots(realDeltaTime);

    // Update projectiles
    this.updateProjectiles(realDeltaTime);

    // Update power-ups
    this.updatePowerUps(realDeltaTime);

    // Check win conditions
    this.checkWinConditions();

    // Check if time is up
    if (this.state.timeRemaining <= 0) {
      this.endBattle();
    }
  }

  /**
   * Update bot states
   */
  private updateBots(deltaTime: number): void {
    this.state.bots.forEach(bot => {
      if (!bot.status.isAlive) return;

      // Update position based on velocity
      bot.position.x += bot.velocity.x * deltaTime;
      bot.position.y += bot.velocity.y * deltaTime;
      bot.position.z += bot.velocity.z * deltaTime;

      // Apply friction
      bot.velocity.x *= 0.95;
      bot.velocity.y *= 0.95;
      bot.velocity.z *= 0.95;

      // Update heat (cooling)
      bot.heat = Math.max(0, bot.heat - 10 * deltaTime);

      // Update energy (regeneration)
      const maxEnergy = (bot.configuration.chassis.stats as ChassisStats).energyCapacity;
      bot.energy = Math.min(maxEnergy, bot.energy + 20 * deltaTime);

      // Update active effects
      bot.activeEffects = bot.activeEffects.filter(effect => {
        effect.duration -= deltaTime;
        return effect.duration > 0;
      });

      // Check overheating
      bot.status.isOverheated = bot.heat > 80;
    });
  }

  /**
   * Update projectiles
   */
  private updateProjectiles(deltaTime: number): void {
    this.state.projectiles = this.state.projectiles.filter(projectile => {
      // Update position
      projectile.position.x += projectile.velocity.x * deltaTime;
      projectile.position.y += projectile.velocity.y * deltaTime;
      projectile.position.z += projectile.velocity.z * deltaTime;

      // Update time to live
      projectile.timeToLive -= deltaTime;

      // Check collisions with bots
      this.checkProjectileCollisions(projectile);

      // Remove if expired
      return projectile.timeToLive > 0;
    });
  }

  /**
   * Update power-ups
   */
  private updatePowerUps(deltaTime: number): void {
    // Check power-up pickups
    this.state.powerUps = this.state.powerUps.filter(powerUp => {
      const pickedUp = this.state.bots.some(bot => {
        if (!bot.status.isAlive) return false;

        const distance = this.calculateDistance(bot.position, powerUp.position);
        if (distance < 2.0) {
          this.applyPowerUp(bot, powerUp);
          return true;
        }
        return false;
      });

      return !pickedUp;
    });
  }

  /**
   * Check projectile collisions with bots
   */
  private checkProjectileCollisions(projectile: any): void {
    this.state.bots.forEach(bot => {
      if (!bot.status.isAlive || bot.playerId === projectile.ownerId) return;

      const distance = this.calculateDistance(bot.position, projectile.position);
      if (distance < 1.5) {
        // Hit!
        this.applyDamage(bot, projectile.damage, projectile.ownerId);

        // Remove projectile
        projectile.timeToLive = 0;
      }
    });
  }

  /**
   * Apply damage to a bot
   */
  private applyDamage(bot: BotState, damage: number, attackerId: string): void {
    // Apply armor reduction
    const armorReduction = (bot.configuration.chassis.stats as ChassisStats).armor * 0.01;
    const actualDamage = damage * (1 - armorReduction);

    bot.health -= actualDamage;

    if (bot.health <= 0) {
      bot.health = 0;
      bot.status.isAlive = false;

      // Award points to attacker
      this.state.scores[attackerId] = (this.state.scores[attackerId] || 0) + 100;

      logger.info(`Bot ${bot.id} destroyed by ${attackerId}`);
    }
  }

  /**
   * Apply power-up effects
   */
  private applyPowerUp(bot: BotState, powerUp: any): void {
    switch (powerUp.type) {
      case 'health':
        bot.health = Math.min(
          (bot.configuration.chassis.stats as ChassisStats).health,
          bot.health + powerUp.value
        );
        break;
      case 'energy':
        bot.energy = Math.min(
          (bot.configuration.chassis.stats as ChassisStats).energyCapacity,
          bot.energy + powerUp.value
        );
        break;
      // Add more power-up types as needed
    }
  }

  /**
   * Calculate distance between two positions
   */
  private calculateDistance(pos1: Vector3, pos2: Vector3): number {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    const dz = pos1.z - pos2.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Check win conditions
   */
  private checkWinConditions(): void {
    const aliveBots = this.state.bots.filter(bot => bot.status.isAlive);

    if (aliveBots.length <= 1) {
      this.endBattle();
    }
  }

  /**
   * End the battle
   */
  private endBattle(): void {
    this.state.phase = BattlePhase.FINISHED;

    // Calculate battle statistics
    const battleDuration = (Date.now() - this.battleStartTime) / 1000;

    // Determine winner
    const sortedPlayers = this.state.players.sort((a, b) =>
      (this.state.scores[b.id] || 0) - (this.state.scores[a.id] || 0)
    );

    const winner = sortedPlayers[0];

    // Set result for each player
    this.state.players.forEach(player => {
      const isWinner = player.id === winner.id;
      // Note: This sets a global result, but in a real implementation,
      // you'd want per-player results
      this.state.result = isWinner ? 'victory' : 'defeat';
    });

    // Generate battle stats (simplified)
    this.state.stats = {
      damageDealt: Math.floor(Math.random() * 500) + 200,
      damageTaken: Math.floor(Math.random() * 400) + 100,
      shotsFired: Math.floor(Math.random() * 50) + 20,
      shotsHit: Math.floor(Math.random() * 30) + 10,
      accuracy: Math.floor(Math.random() * 40) + 60,
      duration: battleDuration,
      distanceTraveled: Math.floor(Math.random() * 200) + 100,
      killCount: Math.floor(Math.random() * 3),
      deathCount: Math.floor(Math.random() * 2)
    };

    logger.info(`Battle ${this.state.id} ended. Winner: ${winner.username}`);
  }

  /**
   * Handle player input
   */
  handlePlayerInput(playerId: string, input: PlayerInput): void {
    if (this.state.phase !== BattlePhase.ACTIVE) return;

    const bot = this.state.bots.find(b => b.playerId === playerId);
    if (!bot || !bot.status.isAlive) return;

    // Apply movement input
    const speed = (bot.configuration.chassis.stats as ChassisStats).speed;

    if (input.movement.forward) {
      bot.velocity.z += speed * 0.1;
    }
    if (input.movement.backward) {
      bot.velocity.z -= speed * 0.1;
    }
    if (input.movement.left) {
      bot.velocity.x -= speed * 0.1;
    }
    if (input.movement.right) {
      bot.velocity.x += speed * 0.1;
    }

    // Handle combat input
    if (input.combat.primaryFire && !bot.status.isOverheated) {
      this.firePrimaryWeapon(bot);
    }
  }

  /**
   * Fire primary weapon
   */
  private firePrimaryWeapon(bot: BotState): void {
    const weapon = bot.configuration.weapons[0];
    if (!weapon) return;

    // Check energy and heat
    if (bot.energy < (weapon.stats as WeaponStats).energyCost || bot.heat > 90) return;

    // Consume energy and generate heat
    bot.energy -= (weapon.stats as WeaponStats).energyCost;
    bot.heat += (weapon.stats as WeaponStats).heatGeneration || 10;

    // Create projectile (simplified)
    const projectile = {
      id: `proj_${Date.now()}_${Math.random()}`,
      type: weapon.type as WeaponType,
      position: { ...bot.position },
      velocity: { x: 0, y: 0, z: (weapon.stats as WeaponStats).projectileSpeed || 100 },
      damage: (weapon.stats as WeaponStats).damage,
      ownerId: bot.playerId,
      timeToLive: ((weapon.stats as WeaponStats).range || 100) / ((weapon.stats as WeaponStats).projectileSpeed || 100)
    };

    this.state.projectiles.push(projectile);
  }

  /**
   * Handle player disconnect
   */
  handlePlayerDisconnect(playerId: string): void {
    const bot = this.state.bots.find(b => b.playerId === playerId);
    if (bot) {
      bot.status.isAlive = false;
      logger.info(`Player ${playerId} disconnected, bot marked as inactive`);
    }
  }

  /**
   * Get current battle state
   */
  getState(): BattleState {
    return { ...this.state };
  }
}
