import { GameEngine } from './GameEngine';
import { InputHandler } from './InputHandler';
import { CameraController } from './CameraController';
import { BattleState, BotState, Arena, PowerUp, ChassisType, WeaponType, DefensiveModuleType, UtilityModuleType, GameMode, BattlePhase } from '../types/game';

export class BattleManager {
  private gameEngine: GameEngine;
  private inputHandler: InputHandler;
  private cameraController: CameraController;
  private canvas: HTMLCanvasElement;
  private animationFrameId: number | null = null;
  private lastTime = 0;
  private isRunning = false;

  // Battle state
  private currentBattle: BattleState | null = null;
  private playerId: string | null = null;

  // Callbacks
  private onBattleUpdate?: (battleState: BattleState) => void;
  private onBattleEnd?: (result: any) => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.gameEngine = new GameEngine(canvas);
    this.inputHandler = new InputHandler(canvas);
    this.cameraController = new CameraController(this.gameEngine.getCamera());

    this.setupResizeHandler();
  }

  private setupResizeHandler(): void {
    window.addEventListener('resize', () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      this.gameEngine.resize(width, height);
    });
  }

  public startBattle(battleState: BattleState, playerId: string): void {
    this.currentBattle = battleState;
    this.playerId = playerId;

    // Initialize the game engine with the battle state
    this.gameEngine.initializeBattle(battleState);

    // Start the game loop
    this.isRunning = true;
    this.lastTime = performance.now();
    this.gameLoop();
  }

  public stopBattle(): void {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.currentBattle = null;
    this.playerId = null;
  }

  private gameLoop = (): void => {
    if (!this.isRunning || !this.currentBattle || !this.playerId) {
      return;
    }

    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
    this.lastTime = currentTime;

    // Get current input
    const input = this.inputHandler.getCurrentInput();

    // Add input to game engine
    this.gameEngine.addInput(this.playerId, input);

    // Update game state
    const updatedBattleState = this.gameEngine.update(deltaTime, this.currentBattle);
    this.currentBattle = updatedBattleState;

    // Update camera
    const playerBot = this.getPlayerBot();
    if (playerBot) {
      this.cameraController.update(playerBot, input, deltaTime);
    }

    // Check for battle end conditions
    this.checkBattleEndConditions();

    // Render the scene
    this.gameEngine.render();

    // Notify listeners of battle state update
    if (this.onBattleUpdate) {
      this.onBattleUpdate(this.currentBattle);
    }

    // Continue the loop
    this.animationFrameId = requestAnimationFrame(this.gameLoop);
  };

  private getPlayerBot(): BotState | null {
    if (!this.currentBattle || !this.playerId) return null;
    return this.currentBattle.bots.find(bot => bot.playerId === this.playerId) || null;
  }

  private checkBattleEndConditions(): void {
    if (!this.currentBattle) return;

    // Check if time is up
    if (this.currentBattle.timeRemaining <= 0) {
      this.endBattle('time_up');
      return;
    }

    // Check if only one bot is alive (in non-practice modes)
    const aliveBots = this.currentBattle.bots.filter(bot => bot.status.isAlive);
    if (aliveBots.length <= 1 && this.currentBattle.mode !== GameMode.PRACTICE) {
      this.endBattle('elimination');
      return;
    }

    // Update time remaining
    this.currentBattle.timeRemaining -= 1/60; // Assuming 60 FPS
  }

  private endBattle(reason: string): void {
    this.stopBattle();

    if (this.onBattleEnd) {
      const result = {
        reason,
        winner: this.determineWinner(),
        finalState: this.currentBattle
      };
      this.onBattleEnd(result);
    }
  }

  private determineWinner(): string | null {
    if (!this.currentBattle) return null;

    const aliveBots = this.currentBattle.bots.filter(bot => bot.status.isAlive);
    if (aliveBots.length === 1) {
      return aliveBots[0].playerId;
    }

    // If multiple bots alive, determine by health
    let maxHealth = 0;
    let winner = null;
    for (const bot of this.currentBattle.bots) {
      if (bot.health > maxHealth) {
        maxHealth = bot.health;
        winner = bot.playerId;
      }
    }

    return winner;
  }

  public createPracticeBattle(playerBotConfig: any): BattleState {
    const arena = this.createDefaultArena();

    // Create player bot
    const playerBot: BotState = {
      id: 'player_bot',
      playerId: this.playerId || 'player_1',
      configuration: playerBotConfig,
      position: { x: -10, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0, w: 1 },
      velocity: { x: 0, y: 0, z: 0 },
      health: (playerBotConfig.chassis.stats as any).health,
      energy: (playerBotConfig.chassis.stats as any).energyCapacity,
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

    // Create AI bot
    const aiBot: BotState = {
      id: 'ai_bot',
      playerId: 'ai_1',
      configuration: this.createDefaultAIBotConfig(),
      position: { x: 10, y: 0, z: 0 },
      rotation: { x: 0, y: Math.PI, z: 0, w: 0 },
      velocity: { x: 0, y: 0, z: 0 },
      health: 150,
      energy: 150,
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

    // Create power-ups
    const powerUps: PowerUp[] = [
      {
        id: 'health_powerup_1',
        type: 'health',
        position: { x: 0, y: 1, z: 10 },
        value: 50
      },
      {
        id: 'energy_powerup_1',
        type: 'energy',
        position: { x: 0, y: 1, z: -10 },
        value: 50
      }
    ];

    const battleState: BattleState = {
      id: 'practice_battle_' + Date.now(),
      mode: GameMode.PRACTICE,
      phase: BattlePhase.ACTIVE,
      arena,
      players: [], // Will be populated by the store
      bots: [playerBot, aiBot],
      projectiles: [],
      powerUps,
      timeRemaining: 180, // 3 minutes
      scores: {},
      events: []
    };

    return battleState;
  }

  private createDefaultArena(): Arena {
    return {
      id: 'default_arena',
      name: 'Training Ground',
      description: 'A basic arena for practice battles',
      size: { x: 60, y: 20, z: 60 },
      spawnPoints: [
        { x: -20, y: 0, z: 0 },
        { x: 20, y: 0, z: 0 },
        { x: 0, y: 0, z: -20 },
        { x: 0, y: 0, z: 20 }
      ],
      obstacles: [
        {
          id: 'obstacle_1',
          type: 'cover',
          position: { x: 0, y: 2, z: 0 },
          size: { x: 4, y: 4, z: 1 },
          rotation: { x: 0, y: 0, z: 0, w: 1 },
          material: 'metal'
        },
        {
          id: 'obstacle_2',
          type: 'cover',
          position: { x: -15, y: 2, z: 15 },
          size: { x: 2, y: 4, z: 6 },
          rotation: { x: 0, y: 0, z: 0, w: 1 },
          material: 'metal'
        },
        {
          id: 'obstacle_3',
          type: 'cover',
          position: { x: 15, y: 2, z: -15 },
          size: { x: 6, y: 4, z: 2 },
          rotation: { x: 0, y: 0, z: 0, w: 1 },
          material: 'metal'
        }
      ],
      powerUpSpawns: [
        { x: 0, y: 1, z: 10 },
        { x: 0, y: 1, z: -10 },
        { x: 10, y: 1, z: 0 },
        { x: -10, y: 1, z: 0 }
      ],
      environment: {
        lighting: 'dynamic',
        skybox: 'space',
        gravity: -9.81
      }
    };
  }

  private createDefaultAIBotConfig(): any {
    return {
      id: 'ai_bot_config',
      name: 'Training Bot',
      chassis: {
        id: 'chassis_ai',
        type: ChassisType.MEDIUM,
        stats: {
          health: 150,
          armor: 25,
          speed: 5.0,
          weaponSlots: 4,
          energyCapacity: 150,
          mass: 100
        }
      },
      weapons: [
        {
          id: 'weapon_ai',
          type: WeaponType.LASER_CANNON,
          position: { x: 0, y: 0, z: 2 },
          stats: {
            damage: 20,
            range: 80,
            fireRate: 2.0,
            energyCost: 12,
            accuracy: 0.85,
            projectileSpeed: 150,
            heatGeneration: 8,
            specialEffect: 'precise'
          }
        }
      ],
      defensiveModules: [
        {
          id: 'defense_ai',
          type: DefensiveModuleType.ARMOR_PLATING,
          stats: {
            protection: 30,
            energyCost: 0,
            massModifier: 10
          }
        }
      ],
      utilityModules: [
        {
          id: 'utility_ai',
          type: UtilityModuleType.REPAIR_NANOBOTS,
          stats: {
            effect: 'heal_over_time',
            energyCost: 20,
            cooldown: 15,
            duration: 5
          }
        }
      ],
      customization: {
        primaryColor: '#ff4444',
        secondaryColor: '#ffaa00',
        pattern: 'solid'
      }
    };
  }

  public setBattleUpdateCallback(callback: (battleState: BattleState) => void): void {
    this.onBattleUpdate = callback;
  }

  public setBattleEndCallback(callback: (result: any) => void): void {
    this.onBattleEnd = callback;
  }

  public getCurrentBattle(): BattleState | null {
    return this.currentBattle;
  }

  public isInputLocked(): boolean {
    return this.inputHandler.isPointerLockActive();
  }

  public exitPointerLock(): void {
    this.inputHandler.exitPointerLock();
  }

  public dispose(): void {
    this.stopBattle();
    this.gameEngine.dispose();
    this.inputHandler.dispose();
  }
}
