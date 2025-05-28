import { PlayerInput } from '../types/game';

export class InputHandler {
  private keys: Set<string> = new Set();
  private mousePosition = { x: 0, y: 0 };
  private mouseDelta = { x: 0, y: 0 };
  private mouseButtons: Set<number> = new Set();
  private canvas: HTMLCanvasElement;
  private isPointerLocked = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Keyboard events
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    document.addEventListener('keyup', this.handleKeyUp.bind(this));

    // Mouse events
    this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.addEventListener('click', this.handleCanvasClick.bind(this));

    // Pointer lock events
    document.addEventListener('pointerlockchange', this.handlePointerLockChange.bind(this));
    document.addEventListener('pointerlockerror', this.handlePointerLockError.bind(this));

    // Prevent context menu
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  private handleKeyDown(event: KeyboardEvent): void {
    this.keys.add(event.code);

    // Prevent default for game keys
    if (this.isGameKey(event.code)) {
      event.preventDefault();
    }
  }

  private handleKeyUp(event: KeyboardEvent): void {
    this.keys.delete(event.code);
  }

  private handleMouseDown(event: MouseEvent): void {
    this.mouseButtons.add(event.button);
    event.preventDefault();
  }

  private handleMouseUp(event: MouseEvent): void {
    this.mouseButtons.delete(event.button);
    event.preventDefault();
  }

  private handleMouseMove(event: MouseEvent): void {
    if (this.isPointerLocked) {
      this.mouseDelta.x += event.movementX;
      this.mouseDelta.y += event.movementY;
    } else {
      this.mousePosition.x = event.clientX;
      this.mousePosition.y = event.clientY;
    }
  }

  private handleCanvasClick(): void {
    if (!this.isPointerLocked) {
      this.requestPointerLock();
    }
  }

  private handlePointerLockChange(): void {
    this.isPointerLocked = document.pointerLockElement === this.canvas;
  }

  private handlePointerLockError(): void {
    console.warn('Pointer lock failed');
  }

  private requestPointerLock(): void {
    this.canvas.requestPointerLock();
  }

  public exitPointerLock(): void {
    if (this.isPointerLocked) {
      document.exitPointerLock();
    }
  }

  private isGameKey(code: string): boolean {
    const gameKeys = [
      'KeyW', 'KeyA', 'KeyS', 'KeyD', // Movement
      'Space', 'ShiftLeft', 'ShiftRight', // Jump, boost
      'KeyQ', 'KeyE', 'KeyR', 'KeyF', // Abilities
      'Escape' // Menu
    ];
    return gameKeys.includes(code);
  }

  public getCurrentInput(): PlayerInput {
    const sensitivity = 0.002;

    const input: PlayerInput = {
      movement: {
        forward: this.keys.has('KeyW'),
        backward: this.keys.has('KeyS'),
        left: this.keys.has('KeyA'),
        right: this.keys.has('KeyD'),
        jump: this.keys.has('Space'),
        boost: this.keys.has('ShiftLeft') || this.keys.has('ShiftRight')
      },
      combat: {
        primaryFire: this.mouseButtons.has(0), // Left mouse button
        secondaryFire: this.mouseButtons.has(2), // Right mouse button
        specialAbility: this.keys.has('KeyQ')
      },
      camera: {
        pitch: -this.mouseDelta.y * sensitivity,
        yaw: -this.mouseDelta.x * sensitivity
      },
      timestamp: Date.now()
    };

    // Reset mouse delta after reading
    this.mouseDelta.x = 0;
    this.mouseDelta.y = 0;

    return input;
  }

  public isKeyPressed(key: string): boolean {
    return this.keys.has(key);
  }

  public isMouseButtonPressed(button: number): boolean {
    return this.mouseButtons.has(button);
  }

  public getMousePosition(): { x: number; y: number } {
    return { ...this.mousePosition };
  }

  public isPointerLockActive(): boolean {
    return this.isPointerLocked;
  }

  public dispose(): void {
    // Remove event listeners
    document.removeEventListener('keydown', this.handleKeyDown.bind(this));
    document.removeEventListener('keyup', this.handleKeyUp.bind(this));
    this.canvas.removeEventListener('mousedown', this.handleMouseDown.bind(this));
    this.canvas.removeEventListener('mouseup', this.handleMouseUp.bind(this));
    this.canvas.removeEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.removeEventListener('click', this.handleCanvasClick.bind(this));
    document.removeEventListener('pointerlockchange', this.handlePointerLockChange.bind(this));
    document.removeEventListener('pointerlockerror', this.handlePointerLockError.bind(this));

    this.exitPointerLock();
  }
}
