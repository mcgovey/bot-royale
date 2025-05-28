import * as THREE from 'three';
import { BotState, Projectile, PowerUp, Arena, Vector3, PlayerInput, BattleState } from '../types/game';

export class GameEngine {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private clock: THREE.Clock;
  private world: THREE.Object3D;

  // Physics
  private gravity: number = -9.81;
  private timeStep: number = 1/60;

  // Game objects
  private bots: Map<string, BotGameObject> = new Map();
  private projectiles: Map<string, ProjectileGameObject> = new Map();
  private powerUps: Map<string, PowerUpGameObject> = new Map();
  private arena: ArenaGameObject | null = null;

  // Input handling
  private inputBuffer: Map<string, PlayerInput[]> = new Map();

  constructor(canvas: HTMLCanvasElement) {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.clock = new THREE.Clock();
    this.world = new THREE.Object3D();

    this.setupRenderer();
    this.setupScene();
    this.setupCamera();

    this.scene.add(this.world);
  }

  private setupRenderer(): void {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setClearColor(0x0a0a0a);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
  }

  private setupScene(): void {
    // Ambient lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    this.scene.add(ambientLight);

    // Directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(50, 100, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -100;
    directionalLight.shadow.camera.right = 100;
    directionalLight.shadow.camera.top = 100;
    directionalLight.shadow.camera.bottom = -100;
    this.scene.add(directionalLight);

    // Point lights for atmosphere
    const pointLight1 = new THREE.PointLight(0x00ffff, 0.5, 100);
    pointLight1.position.set(-30, 20, -30);
    this.scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff00ff, 0.5, 100);
    pointLight2.position.set(30, 20, 30);
    this.scene.add(pointLight2);
  }

  private setupCamera(): void {
    this.camera.position.set(0, 30, 50);
    this.camera.lookAt(0, 0, 0);
  }

  public initializeBattle(battleState: BattleState): void {
    this.clearWorld();

    // Create arena
    this.arena = new ArenaGameObject(battleState.arena);
    this.world.add(this.arena.mesh);

    // Create bots
    battleState.bots.forEach(botState => {
      const bot = new BotGameObject(botState);
      this.bots.set(botState.id, bot);
      this.world.add(bot.mesh);
    });

    // Create power-ups
    battleState.powerUps.forEach(powerUp => {
      const powerUpObj = new PowerUpGameObject(powerUp);
      this.powerUps.set(powerUp.id, powerUpObj);
      this.world.add(powerUpObj.mesh);
    });
  }

  public update(deltaTime: number, battleState: BattleState): BattleState {
    const updatedBattleState = { ...battleState };

    // Update bots
    this.bots.forEach((bot, botId) => {
      const botState = battleState.bots.find(b => b.id === botId);
      if (botState) {
        const input = this.getLatestInput(botState.playerId);
        const updatedBot = this.updateBot(bot, botState, input, deltaTime);
        const index = updatedBattleState.bots.findIndex(b => b.id === botId);
        if (index >= 0) {
          updatedBattleState.bots[index] = updatedBot;
        }
      }
    });

    // Update projectiles
    const updatedProjectiles: Projectile[] = [];
    this.projectiles.forEach((projectile, projectileId) => {
      const projectileState = battleState.projectiles.find(p => p.id === projectileId);
      if (projectileState) {
        const updatedProjectile = this.updateProjectile(projectile, projectileState, deltaTime);
        if (updatedProjectile.timeToLive > 0) {
          updatedProjectiles.push(updatedProjectile);
        } else {
          // Remove expired projectile
          this.world.remove(projectile.mesh);
          this.projectiles.delete(projectileId);
        }
      }
    });
    updatedBattleState.projectiles = updatedProjectiles;

    // Check collisions
    this.checkCollisions(updatedBattleState);

    // Update power-ups
    this.powerUps.forEach((powerUp, powerUpId) => {
      powerUp.update(deltaTime);
    });

    return updatedBattleState;
  }

  private updateBot(bot: BotGameObject, botState: BotState, input: PlayerInput | null, deltaTime: number): BotState {
    const updatedState = { ...botState };

    if (input && botState.status.isAlive) {
      // Apply movement
      const movement = this.calculateMovement(input, botState, deltaTime);
      updatedState.position = this.addVector3(updatedState.position, movement);

      // Apply rotation
      if (input.camera.yaw !== 0) {
        const rotation = new THREE.Euler(0, input.camera.yaw * deltaTime, 0);
        const quaternion = new THREE.Quaternion().setFromEuler(rotation);
        const currentQuat = new THREE.Quaternion(
          updatedState.rotation.x,
          updatedState.rotation.y,
          updatedState.rotation.z,
          updatedState.rotation.w
        );
        currentQuat.multiply(quaternion);
        updatedState.rotation = {
          x: currentQuat.x,
          y: currentQuat.y,
          z: currentQuat.z,
          w: currentQuat.w
        };
      }

      // Handle combat
      if (input.combat.primaryFire) {
        this.handleWeaponFire(botState, 0, updatedState);
      }

      // Handle abilities
      if (input.combat.specialAbility) {
        this.handleSpecialAbility(botState, updatedState);
      }
    }

    // Apply physics
    this.applyPhysics(updatedState, deltaTime);

    // Update visual representation
    bot.updateFromState(updatedState);

    return updatedState;
  }

  private calculateMovement(input: PlayerInput, botState: BotState, deltaTime: number): Vector3 {
    const speed = (botState.configuration.chassis.stats as any).speed;
    const moveVector = { x: 0, y: 0, z: 0 };

    if (input.movement.forward) moveVector.z -= speed * deltaTime;
    if (input.movement.backward) moveVector.z += speed * deltaTime;
    if (input.movement.left) moveVector.x -= speed * deltaTime;
    if (input.movement.right) moveVector.x += speed * deltaTime;

    // Apply boost if active
    if (input.movement.boost && botState.energy > 10) {
      const boostMultiplier = 2.0;
      moveVector.x *= boostMultiplier;
      moveVector.z *= boostMultiplier;
    }

    return moveVector;
  }

  private applyPhysics(botState: BotState, deltaTime: number): void {
    // Apply gravity
    botState.velocity.y += this.gravity * deltaTime;

    // Apply velocity to position
    botState.position.x += botState.velocity.x * deltaTime;
    botState.position.y += botState.velocity.y * deltaTime;
    botState.position.z += botState.velocity.z * deltaTime;

    // Ground collision (simple)
    if (botState.position.y < 0) {
      botState.position.y = 0;
      botState.velocity.y = 0;
    }

    // Apply friction
    botState.velocity.x *= 0.9;
    botState.velocity.z *= 0.9;
  }

  private handleWeaponFire(botState: BotState, weaponIndex: number, updatedState: BotState): void {
    const weapon = botState.configuration.weapons[weaponIndex];
    if (!weapon) return;

    const weaponStats = weapon.stats as any;

    // Check energy and heat
    if (updatedState.energy < weaponStats.energyCost) return;
    if (updatedState.heat > 80) return;

    // Create projectile
    const projectile = this.createProjectile(botState, weapon);
    const projectileObj = new ProjectileGameObject(projectile);
    this.projectiles.set(projectile.id, projectileObj);
    this.world.add(projectileObj.mesh);

    // Update bot state
    updatedState.energy -= weaponStats.energyCost;
    updatedState.heat += weaponStats.heatGeneration;
  }

  private createProjectile(botState: BotState, weapon: any): Projectile {
    const weaponStats = weapon.stats;
    const forward = this.getForwardVector(botState.rotation);

    return {
      id: `projectile_${Date.now()}_${Math.random()}`,
      type: weapon.type,
      position: { ...botState.position },
      velocity: {
        x: forward.x * weaponStats.projectileSpeed,
        y: forward.y * weaponStats.projectileSpeed,
        z: forward.z * weaponStats.projectileSpeed
      },
      damage: weaponStats.damage,
      ownerId: botState.id,
      timeToLive: weaponStats.range / weaponStats.projectileSpeed
    };
  }

  private getForwardVector(rotation: any): Vector3 {
    const quaternion = new THREE.Quaternion(rotation.x, rotation.y, rotation.z, rotation.w);
    const forward = new THREE.Vector3(0, 0, -1);
    forward.applyQuaternion(quaternion);
    return { x: forward.x, y: forward.y, z: forward.z };
  }

  private handleSpecialAbility(botState: BotState, updatedState: BotState): void {
    const utilityModule = botState.configuration.utilityModules[0];
    if (!utilityModule) return;

    const stats = utilityModule.stats as any;

    if (updatedState.energy < stats.energyCost) return;

    switch (utilityModule.type) {
      case 'boost_thrusters':
        updatedState.status.isBoosting = true;
        updatedState.energy -= stats.energyCost;
        break;
      case 'energy_shield':
        updatedState.status.isShielded = true;
        updatedState.energy -= stats.energyCost;
        break;
    }
  }

  private updateProjectile(projectile: ProjectileGameObject, projectileState: Projectile, deltaTime: number): Projectile {
    const updated = { ...projectileState };

    // Update position
    updated.position.x += updated.velocity.x * deltaTime;
    updated.position.y += updated.velocity.y * deltaTime;
    updated.position.z += updated.velocity.z * deltaTime;

    // Update time to live
    updated.timeToLive -= deltaTime;

    // Update visual
    projectile.updateFromState(updated);

    return updated;
  }

  private checkCollisions(battleState: BattleState): void {
    // Projectile vs Bot collisions
    battleState.projectiles.forEach(projectile => {
      battleState.bots.forEach(bot => {
        if (bot.id !== projectile.ownerId && bot.status.isAlive) {
          const distance = this.calculateDistance(projectile.position, bot.position);
          if (distance < 2.0) { // Hit radius
            // Apply damage
            bot.health -= projectile.damage;
            if (bot.health <= 0) {
              bot.status.isAlive = false;
              bot.health = 0;
            }

            // Remove projectile
            const projectileObj = this.projectiles.get(projectile.id);
            if (projectileObj) {
              this.world.remove(projectileObj.mesh);
              this.projectiles.delete(projectile.id);
            }

            // Mark projectile for removal
            projectile.timeToLive = 0;
          }
        }
      });
    });
  }

  private calculateDistance(pos1: Vector3, pos2: Vector3): number {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    const dz = pos1.z - pos2.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  private addVector3(a: Vector3, b: Vector3): Vector3 {
    return {
      x: a.x + b.x,
      y: a.y + b.y,
      z: a.z + b.z
    };
  }

  public addInput(playerId: string, input: PlayerInput): void {
    if (!this.inputBuffer.has(playerId)) {
      this.inputBuffer.set(playerId, []);
    }
    this.inputBuffer.get(playerId)!.push(input);

    // Keep only recent inputs
    const inputs = this.inputBuffer.get(playerId)!;
    if (inputs.length > 10) {
      inputs.splice(0, inputs.length - 10);
    }
  }

  private getLatestInput(playerId: string): PlayerInput | null {
    const inputs = this.inputBuffer.get(playerId);
    return inputs && inputs.length > 0 ? inputs[inputs.length - 1] : null;
  }

  public render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  public resize(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  public getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  public getScene(): THREE.Scene {
    return this.scene;
  }

  private clearWorld(): void {
    // Remove all game objects
    this.bots.forEach(bot => this.world.remove(bot.mesh));
    this.projectiles.forEach(projectile => this.world.remove(projectile.mesh));
    this.powerUps.forEach(powerUp => this.world.remove(powerUp.mesh));
    if (this.arena) this.world.remove(this.arena.mesh);

    // Clear maps
    this.bots.clear();
    this.projectiles.clear();
    this.powerUps.clear();
    this.arena = null;
  }

  public dispose(): void {
    this.clearWorld();
    this.renderer.dispose();
  }
}

// Game object classes
class BotGameObject {
  public mesh: THREE.Group;
  private chassisMesh!: THREE.Mesh;
  private weaponMeshes: THREE.Mesh[] = [];

  constructor(botState: BotState) {
    this.mesh = new THREE.Group();
    this.createBotMesh(botState);
    this.updateFromState(botState);
  }

  private createBotMesh(botState: BotState): void {
    // Create chassis
    const chassisGeometry = new THREE.BoxGeometry(3, 1.5, 4);
    const chassisMaterial = new THREE.MeshPhongMaterial({
      color: botState.configuration.customization.primaryColor
    });
    this.chassisMesh = new THREE.Mesh(chassisGeometry, chassisMaterial);
    this.chassisMesh.castShadow = true;
    this.chassisMesh.receiveShadow = true;
    this.mesh.add(this.chassisMesh);

    // Create weapons
    botState.configuration.weapons.forEach((weapon, index) => {
      const weaponGeometry = new THREE.CylinderGeometry(0.2, 0.2, 2);
      const weaponMaterial = new THREE.MeshPhongMaterial({ color: 0x666666 });
      const weaponMesh = new THREE.Mesh(weaponGeometry, weaponMaterial);
      weaponMesh.position.set(index * 0.5 - 0.25, 0.5, 1.5);
      weaponMesh.rotation.z = Math.PI / 2;
      weaponMesh.castShadow = true;
      this.weaponMeshes.push(weaponMesh);
      this.mesh.add(weaponMesh);
    });

    // Add glow effect for energy
    const glowGeometry = new THREE.SphereGeometry(2.5, 16, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: botState.configuration.customization.secondaryColor,
      transparent: true,
      opacity: 0.1
    });
    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    this.mesh.add(glowMesh);
  }

  public updateFromState(botState: BotState): void {
    this.mesh.position.set(botState.position.x, botState.position.y, botState.position.z);
    this.mesh.quaternion.set(
      botState.rotation.x,
      botState.rotation.y,
      botState.rotation.z,
      botState.rotation.w
    );

    // Update visual effects based on state
    if (botState.status.isShielded) {
      // Add shield effect
    }

    if (botState.heat > 50) {
      // Add heat distortion effect
    }
  }
}

class ProjectileGameObject {
  public mesh!: THREE.Mesh;
  private trail?: THREE.Line;

  constructor(projectile: Projectile) {
    this.createProjectileMesh(projectile);
    this.updateFromState(projectile);
  }

  private createProjectileMesh(projectile: Projectile): void {
    let geometry: THREE.BufferGeometry;
    let material: THREE.Material;

    switch (projectile.type) {
      case 'laser_cannon':
        geometry = new THREE.SphereGeometry(0.1, 8, 8);
        material = new THREE.MeshBasicMaterial({ color: 0x00ffff });
        break;
      case 'missile_launcher':
        geometry = new THREE.CylinderGeometry(0.1, 0.15, 0.5);
        material = new THREE.MeshPhongMaterial({ color: 0xff4444 });
        break;
      default:
        geometry = new THREE.SphereGeometry(0.1, 8, 8);
        material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    }

    this.mesh = new THREE.Mesh(geometry, material);
  }

  public updateFromState(projectile: Projectile): void {
    this.mesh.position.set(projectile.position.x, projectile.position.y, projectile.position.z);
  }
}

class PowerUpGameObject {
  public mesh: THREE.Group;
  private rotationSpeed: number = 2;

  constructor(powerUp: PowerUp) {
    this.mesh = new THREE.Group();
    this.createPowerUpMesh(powerUp);
    this.updateFromState(powerUp);
  }

  private createPowerUpMesh(powerUp: PowerUp): void {
    const geometry = new THREE.OctahedronGeometry(1);
    let material: THREE.Material;

    switch (powerUp.type) {
      case 'health':
        material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        break;
      case 'energy':
        material = new THREE.MeshBasicMaterial({ color: 0x0088ff });
        break;
      case 'weapon_boost':
        material = new THREE.MeshBasicMaterial({ color: 0xff8800 });
        break;
      default:
        material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    }

    const mesh = new THREE.Mesh(geometry, material);
    this.mesh.add(mesh);
  }

  public updateFromState(powerUp: PowerUp): void {
    this.mesh.position.set(powerUp.position.x, powerUp.position.y, powerUp.position.z);
  }

  public update(deltaTime: number): void {
    this.mesh.rotation.y += this.rotationSpeed * deltaTime;
    this.mesh.position.y += Math.sin(Date.now() * 0.003) * 0.01;
  }
}

class ArenaGameObject {
  public mesh: THREE.Group;

  constructor(arena: Arena) {
    this.mesh = new THREE.Group();
    this.createArenaMesh(arena);
  }

  private createArenaMesh(arena: Arena): void {
    // Create floor
    const floorGeometry = new THREE.PlaneGeometry(arena.size.x, arena.size.z);
    const floorMaterial = new THREE.MeshPhongMaterial({
      color: 0x333333,
      transparent: true,
      opacity: 0.8
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.mesh.add(floor);

    // Create walls
    this.createWalls(arena);

    // Create obstacles
    arena.obstacles.forEach(obstacle => {
      this.createObstacle(obstacle);
    });
  }

  private createWalls(arena: Arena): void {
    const wallHeight = 10;
    const wallThickness = 1;
    const wallMaterial = new THREE.MeshPhongMaterial({ color: 0x666666 });

    // North wall
    const northWall = new THREE.Mesh(
      new THREE.BoxGeometry(arena.size.x, wallHeight, wallThickness),
      wallMaterial
    );
    northWall.position.set(0, wallHeight / 2, -arena.size.z / 2);
    northWall.castShadow = true;
    this.mesh.add(northWall);

    // South wall
    const southWall = new THREE.Mesh(
      new THREE.BoxGeometry(arena.size.x, wallHeight, wallThickness),
      wallMaterial
    );
    southWall.position.set(0, wallHeight / 2, arena.size.z / 2);
    southWall.castShadow = true;
    this.mesh.add(southWall);

    // East wall
    const eastWall = new THREE.Mesh(
      new THREE.BoxGeometry(wallThickness, wallHeight, arena.size.z),
      wallMaterial
    );
    eastWall.position.set(arena.size.x / 2, wallHeight / 2, 0);
    eastWall.castShadow = true;
    this.mesh.add(eastWall);

    // West wall
    const westWall = new THREE.Mesh(
      new THREE.BoxGeometry(wallThickness, wallHeight, arena.size.z),
      wallMaterial
    );
    westWall.position.set(-arena.size.x / 2, wallHeight / 2, 0);
    westWall.castShadow = true;
    this.mesh.add(westWall);
  }

  private createObstacle(obstacle: any): void {
    const geometry = new THREE.BoxGeometry(obstacle.size.x, obstacle.size.y, obstacle.size.z);
    const material = new THREE.MeshPhongMaterial({ color: 0x888888 });
    const mesh = new THREE.Mesh(geometry, material);

    mesh.position.set(obstacle.position.x, obstacle.position.y, obstacle.position.z);
    mesh.quaternion.set(
      obstacle.rotation.x,
      obstacle.rotation.y,
      obstacle.rotation.z,
      obstacle.rotation.w
    );
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    this.mesh.add(mesh);
  }
}
