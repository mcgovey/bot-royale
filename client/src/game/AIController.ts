import { BotState, PlayerInput, Vector3 } from '../types/game';

export class AIController {
  private botId: string;
  private lastInputTime = 0;
  private currentTarget: Vector3 | null = null;
  private lastFireTime = 0;
  private fireRate = 2000; // Fire every 2 seconds
  private aggroRange = 30;
  private attackRange = 20;

  constructor(botId: string) {
    this.botId = botId;
  }

  public generateInput(aiBot: BotState, playerBot: BotState | null, deltaTime: number): PlayerInput {
    const currentTime = Date.now();

    // Calculate distance to player
    const distanceToPlayer = playerBot ? this.calculateDistance(aiBot.position, playerBot.position) : Infinity;

    // Determine AI behavior
    let shouldMoveTowardsPlayer = false;
    let shouldFire = false;
    let shouldRotateTowardsPlayer = false;

    if (playerBot && distanceToPlayer < this.aggroRange) {
      shouldRotateTowardsPlayer = true;

      if (distanceToPlayer > this.attackRange) {
        shouldMoveTowardsPlayer = true;
      } else {
        // In attack range, fire if cooldown is ready
        if (currentTime - this.lastFireTime > this.fireRate && aiBot.energy > 15) {
          shouldFire = true;
          this.lastFireTime = currentTime;
        }
      }
    }

    // Calculate movement direction
    let moveForward = false;
    let moveLeft = false;
    let moveRight = false;
    let moveBackward = false;

    if (shouldMoveTowardsPlayer && playerBot) {
      const direction = this.normalizeVector({
        x: playerBot.position.x - aiBot.position.x,
        y: 0,
        z: playerBot.position.z - aiBot.position.z
      });

      // Simple movement logic - move towards player
      if (Math.abs(direction.x) > Math.abs(direction.z)) {
        if (direction.x > 0) moveRight = true;
        else moveLeft = true;
      } else {
        if (direction.z < 0) moveForward = true;
        else moveBackward = true;
      }
    }

    // Calculate rotation towards player
    let yawDelta = 0;
    if (shouldRotateTowardsPlayer && playerBot) {
      const targetYaw = Math.atan2(
        playerBot.position.x - aiBot.position.x,
        playerBot.position.z - aiBot.position.z
      );

      const currentYaw = this.getYawFromQuaternion(aiBot.rotation);
      yawDelta = this.normalizeAngle(targetYaw - currentYaw) * 0.5; // Smooth rotation
    }

    // Add some randomness to make AI less predictable
    const randomFactor = 0.1;
    if (Math.random() < randomFactor) {
      moveLeft = !moveLeft;
      moveRight = !moveRight;
    }

    return {
      movement: {
        forward: moveForward,
        backward: moveBackward,
        left: moveLeft,
        right: moveRight,
        jump: false,
        boost: distanceToPlayer > 25 && aiBot.energy > 30 // Boost when far from player
      },
      combat: {
        primaryFire: shouldFire,
        secondaryFire: false,
        specialAbility: aiBot.energy > 50 && Math.random() < 0.1 // Randomly use special ability
      },
      camera: {
        pitch: 0,
        yaw: yawDelta
      },
      timestamp: currentTime
    };
  }

  private calculateDistance(pos1: Vector3, pos2: Vector3): number {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    const dz = pos1.z - pos2.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  private normalizeVector(vector: Vector3): Vector3 {
    const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);
    if (length === 0) return { x: 0, y: 0, z: 0 };

    return {
      x: vector.x / length,
      y: vector.y / length,
      z: vector.z / length
    };
  }

  private getYawFromQuaternion(quaternion: any): number {
    // Convert quaternion to yaw angle
    const { x, y, z, w } = quaternion;
    return Math.atan2(2 * (w * y + x * z), 1 - 2 * (y * y + z * z));
  }

  private normalizeAngle(angle: number): number {
    while (angle > Math.PI) angle -= 2 * Math.PI;
    while (angle < -Math.PI) angle += 2 * Math.PI;
    return angle;
  }
}
