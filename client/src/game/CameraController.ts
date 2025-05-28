import * as THREE from 'three';
import { BotState, PlayerInput } from '../types/game';

export class CameraController {
  private camera: THREE.PerspectiveCamera;
  private targetPosition = new THREE.Vector3();
  private currentPosition = new THREE.Vector3();
  private targetLookAt = new THREE.Vector3();
  private currentLookAt = new THREE.Vector3();

  // Camera settings
  private distance = 15;
  private height = 8;
  private pitch = 0;
  private yaw = 0;
  private maxPitch = Math.PI / 3; // 60 degrees
  private minPitch = -Math.PI / 6; // -30 degrees

  // Smoothing
  private positionLerpFactor = 0.1;
  private lookAtLerpFactor = 0.15;

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
    this.currentPosition.copy(camera.position);
    this.currentLookAt.set(0, 0, 0);
  }

  public update(botState: BotState, input: PlayerInput | null, deltaTime: number): void {
    if (input) {
      // Update camera rotation based on input
      this.yaw += input.camera.yaw;
      this.pitch += input.camera.pitch;

      // Clamp pitch
      this.pitch = Math.max(this.minPitch, Math.min(this.maxPitch, this.pitch));
    }

    // Calculate target camera position based on bot position and camera angles
    const botPosition = new THREE.Vector3(
      botState.position.x,
      botState.position.y,
      botState.position.z
    );

    // Calculate camera offset
    const offset = new THREE.Vector3();
    offset.x = Math.sin(this.yaw) * Math.cos(this.pitch) * this.distance;
    offset.y = Math.sin(this.pitch) * this.distance + this.height;
    offset.z = Math.cos(this.yaw) * Math.cos(this.pitch) * this.distance;

    this.targetPosition.copy(botPosition).add(offset);
    this.targetLookAt.copy(botPosition);
    this.targetLookAt.y += 2; // Look slightly above the bot

    // Smooth camera movement
    this.currentPosition.lerp(this.targetPosition, this.positionLerpFactor);
    this.currentLookAt.lerp(this.targetLookAt, this.lookAtLerpFactor);

    // Apply to camera
    this.camera.position.copy(this.currentPosition);
    this.camera.lookAt(this.currentLookAt);
  }

  public setDistance(distance: number): void {
    this.distance = Math.max(5, Math.min(30, distance));
  }

  public setHeight(height: number): void {
    this.height = Math.max(2, Math.min(20, height));
  }

  public setPitch(pitch: number): void {
    this.pitch = Math.max(this.minPitch, Math.min(this.maxPitch, pitch));
  }

  public setYaw(yaw: number): void {
    this.yaw = yaw;
  }

  public getPitch(): number {
    return this.pitch;
  }

  public getYaw(): number {
    return this.yaw;
  }

  public reset(): void {
    this.pitch = 0;
    this.yaw = 0;
    this.distance = 15;
    this.height = 8;
  }

  public setLerpFactors(position: number, lookAt: number): void {
    this.positionLerpFactor = Math.max(0.01, Math.min(1, position));
    this.lookAtLerpFactor = Math.max(0.01, Math.min(1, lookAt));
  }
}
