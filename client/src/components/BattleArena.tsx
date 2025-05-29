import React, { useEffect, useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Text } from '@react-three/drei';
import { motion } from 'framer-motion';
import { ChassisType, WeaponType, SpecialType, CHASSIS_STATS, WEAPON_STATS, SPECIAL_STATS } from '../types/game';
import { useProgressionStore } from '../store/progressionStore';
import Bot3D from './Bot3D';

interface BotConfig {
  chassis: ChassisType;
  weapon: WeaponType;
  special: SpecialType;
  name: string;
  primaryColor: string;
  secondaryColor: string;
}

interface BattleArenaProps {
  playerBot: BotConfig;
  onBackToBuilder: () => void;
}

interface BotState {
  id: string;
  name: string;
  x: number;
  y: number;
  z: number;
  health: number;
  maxHealth: number;
  color: string;
  isPlayer: boolean;
  lastFired: number;
  specialCooldown: number;
  config: BotConfig;
  rotation: number;
  velocity: { x: number; z: number };
  isShielded: boolean;
  speedBoostTime: number;
  strategy?: string;
}

interface Projectile {
  id: string;
  x: number;
  y: number;
  z: number;
  targetX: number;
  targetZ: number;
  speed: number;
  damage: number;
  ownerId: string;
}

// 3D Arena Component
const Arena3D: React.FC = () => {
  return (
    <group>
      {/* Arena Floor */}
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <boxGeometry args={[20, 1, 20]} />
        <meshStandardMaterial
          color="#1a1a1a"
          metalness={0.8}
          roughness={0.2}
          emissive="#00f5ff"
          emissiveIntensity={0.05}
        />
      </mesh>

      {/* Arena Walls */}
      {[-10, 10].map((x, i) => (
        <mesh key={`wall-x-${i}`} position={[x, 2, 0]} castShadow>
          <boxGeometry args={[0.5, 4, 20]} />
          <meshStandardMaterial
            color="#2a2a2a"
            metalness={0.7}
            roughness={0.3}
            emissive="#8b5cf6"
            emissiveIntensity={0.1}
          />
        </mesh>
      ))}

      {[-10, 10].map((z, i) => (
        <mesh key={`wall-z-${i}`} position={[0, 2, z]} castShadow>
          <boxGeometry args={[20, 4, 0.5]} />
          <meshStandardMaterial
            color="#2a2a2a"
            metalness={0.7}
            roughness={0.3}
            emissive="#8b5cf6"
            emissiveIntensity={0.1}
          />
        </mesh>
      ))}

      {/* Center Obstacles */}
      <mesh position={[-3, 0.5, -3]} castShadow>
        <boxGeometry args={[2, 1, 2]} />
        <meshStandardMaterial
          color="#444"
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>

      <mesh position={[3, 0.5, 3]} castShadow>
        <boxGeometry args={[2, 1, 2]} />
        <meshStandardMaterial
          color="#444"
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>
    </group>
  );
};

// 3D Bot in Arena
const ArenaBotComponent: React.FC<{ bot: BotState; isMoving: boolean }> = ({ bot, isMoving }) => {
  const meshRef = useRef<any>(null);

  useFrame((state: any, delta: number) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = bot.rotation;

      // Hover animation for movement
      if (isMoving) {
        meshRef.current.position.y = 0.1 + Math.sin(state.clock.elapsedTime * 10) * 0.05;
      } else {
        meshRef.current.position.y = 0;
      }
    }
  });

  return (
    <group ref={meshRef} position={[bot.x, 0, bot.z]}>
      <Bot3D
        chassis={bot.config.chassis}
        weapon={bot.config.weapon}
        primaryColor={bot.color}
        secondaryColor={bot.config.secondaryColor}
      />

      {/* Health Bar */}
      <group position={[0, 2, 0]}>
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[2, 0.2]} />
          <meshBasicMaterial color="#333" />
        </mesh>
        <mesh position={[-(1 - (bot.health / bot.maxHealth)), 0, 0.01]}>
          <planeGeometry args={[2 * (bot.health / bot.maxHealth), 0.15]} />
          <meshBasicMaterial
            color={bot.health > bot.maxHealth * 0.5 ? "#00ff88" : bot.health > bot.maxHealth * 0.25 ? "#ffff00" : "#ff4444"}
          />
        </mesh>
      </group>

      {/* Name Tag */}
      <Text
        position={[0, 2.5, 0]}
        fontSize={0.3}
        color={bot.isPlayer ? "#00f5ff" : "#ff4444"}
        anchorX="center"
        anchorY="middle"
      >
        {bot.name}
      </Text>

      {/* Shield Effect */}
      {bot.isShielded && (
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[1.5, 16, 16]} />
          <meshBasicMaterial
            color="#00f5ff"
            transparent
            opacity={0.3}
            wireframe
          />
        </mesh>
      )}
    </group>
  );
};

// Enhanced Projectile Component with trail effects
const ProjectileComponent: React.FC<{ projectile: Projectile }> = ({ projectile }) => {
  const meshRef = useRef<any>(null);

  useFrame((state: any, delta: number) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 10;
      meshRef.current.rotation.y += delta * 15;
      // Pulsing effect
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 20) * 0.3;
      meshRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <group position={[projectile.x, projectile.y, projectile.z]}>
      {/* Main Projectile */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial
          color="#ffff00"
          emissive="#ffff00"
          emissiveIntensity={1.5}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Energy Trail */}
      <mesh position={[0, 0, -0.3]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.1, 0.6, 6]} />
        <meshStandardMaterial
          color="#ffaa00"
          emissive="#ffaa00"
          emissiveIntensity={0.8}
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Glow Effect */}
      <mesh>
        <sphereGeometry args={[0.3, 8, 8]} />
        <meshBasicMaterial
          color="#ffff00"
          transparent
          opacity={0.2}
        />
      </mesh>
    </group>
  );
};

// Explosion Effect Component
const ExplosionEffect: React.FC<{ position: [number, number, number]; onComplete: () => void }> = ({
  position,
  onComplete
}) => {
  const groupRef = useRef<any>(null);
  const [scale, setScale] = useState(0);

  useFrame((state: any, delta: number) => {
    if (groupRef.current) {
      setScale(prev => {
        const newScale = prev + delta * 8;
        if (newScale > 2) {
          onComplete();
          return 2;
        }
        return newScale;
      });

      groupRef.current.scale.setScalar(scale);
      groupRef.current.rotation.y += delta * 5;
      groupRef.current.rotation.x += delta * 3;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Main Explosion */}
      <mesh>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial
          color="#ff4400"
          emissive="#ff4400"
          emissiveIntensity={2.0}
          transparent
          opacity={Math.max(0, 1 - scale / 2)}
        />
      </mesh>

      {/* Secondary Explosion Ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.3, 0.1, 8, 16]} />
        <meshStandardMaterial
          color="#ffaa00"
          emissive="#ffaa00"
          emissiveIntensity={1.5}
          transparent
          opacity={Math.max(0, 0.8 - scale / 2)}
        />
      </mesh>

      {/* Shockwave */}
      <mesh>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={Math.max(0, 0.3 - scale / 3)}
          wireframe
        />
      </mesh>
    </group>
  );
};

// Muzzle Flash Effect Component
const MuzzleFlashEffect: React.FC<{ position: [number, number, number]; rotation: number; onComplete: () => void }> = ({
  position,
  rotation,
  onComplete
}) => {
  const meshRef = useRef<any>(null);
  const [intensity, setIntensity] = useState(1);

  useFrame((state: any, delta: number) => {
    setIntensity(prev => {
      const newIntensity = prev - delta * 8;
      if (newIntensity <= 0) {
        onComplete();
        return 0;
      }
      return newIntensity;
    });

    if (meshRef.current) {
      meshRef.current.rotation.z += delta * 20;
    }
  });

  if (intensity <= 0) return null;

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh ref={meshRef}>
        <coneGeometry args={[0.2, 0.6, 6]} />
        <meshStandardMaterial
          color="#ffaa00"
          emissive="#ffaa00"
          emissiveIntensity={intensity * 3}
          transparent
          opacity={intensity}
        />
      </mesh>

      {/* Flash Ring */}
      <mesh position={[0, 0, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.1, 0.3, 8]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={intensity * 2}
          transparent
          opacity={intensity * 0.8}
        />
      </mesh>
    </group>
  );
};

const BattleArena: React.FC<BattleArenaProps> = ({ playerBot, onBackToBuilder }) => {
  const [bots, setBots] = useState<BotState[]>([]);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [explosions, setExplosions] = useState<Array<{ id: string; position: [number, number, number] }>>([]);
  const [muzzleFlashes, setMuzzleFlashes] = useState<Array<{ id: string; position: [number, number, number]; rotation: number }>>([]);
  const [keys, setKeys] = useState<Set<string>>(new Set());
  const [battleTime, setBattleTime] = useState(180); // 3 minutes
  const [battleEnded, setBattleEnded] = useState(false);
  const [battleStarted, setBattleStarted] = useState(false);
  const [battleState, setBattleState] = useState<'countdown' | 'ready' | 'active' | 'ended'>('countdown');
  const [countdown, setCountdown] = useState(3);
  const [winner, setWinner] = useState<string>('');
  const [showTutorial, setShowTutorial] = useState(true);
  const [battleStats, setBattleStats] = useState({
    damageDealt: 0,
    shotsFired: 0,
    shotsHit: 0,
    specialsUsed: 0
  });

  const progression = useProgressionStore();

  // Combat system modifiers from mastery
  const combatModifiers = {
    healthMultiplier: 1.2,
    speedMultiplier: 1.1,
    damageMultiplier: 1.15,
    accuracyBonus: 0.1,
    cooldownReduction: 0.05,
    specialEffects: {
      dualSpecial: false,
      enhancedPiercing: false,
      explosiveRounds: false
    }
  };

  const isPlayerMoving = keys.has('KeyW') || keys.has('KeyS') || keys.has('KeyA') || keys.has('KeyD') ||
                       keys.has('ArrowUp') || keys.has('ArrowDown') || keys.has('ArrowLeft') || keys.has('ArrowRight');

  // Initialize battle on component mount
  useEffect(() => {
    initializeBattle();
  }, [playerBot]);

  // Battle countdown and state management
  useEffect(() => {
    if (battleState === 'countdown') {
      const countdownTimer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setBattleState('ready');
            setTimeout(() => {
              setBattleState('active');
              setBattleStarted(true);
            }, 1000);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdownTimer);
    }
  }, [battleState]);

  const initializeBattle = () => {
    // Reset all battle state
    setBattleEnded(false);
    setBattleStarted(false);
    setBattleState('countdown');
    setCountdown(3);
    setBattleTime(180);
    setWinner('');
    setBattleStats({
      damageDealt: 0,
      shotsFired: 0,
      shotsHit: 0,
      specialsUsed: 0
    });
    setProjectiles([]);

    // Create player bot
    const playerBotState: BotState = {
      id: 'player',
      name: playerBot.name,
      x: 0,
      y: 0,
      z: 7,
      health: CHASSIS_STATS[playerBot.chassis].health * combatModifiers.healthMultiplier,
      maxHealth: CHASSIS_STATS[playerBot.chassis].health * combatModifiers.healthMultiplier,
      color: playerBot.primaryColor,
      isPlayer: true,
      lastFired: 0,
      specialCooldown: 0,
      config: playerBot,
      rotation: 0,
      velocity: { x: 0, z: 0 },
      isShielded: false,
      speedBoostTime: 0
    };

    // Create AI enemies with different strategies
    const enemyConfigs = [
      { chassis: ChassisType.TANK, weapon: WeaponType.CANNON, special: SpecialType.SHIELD, strategy: 'aggressive' },
      { chassis: ChassisType.SPEED, weapon: WeaponType.BLASTER, special: SpecialType.SPEED_BOOST, strategy: 'hit_and_run' },
      { chassis: ChassisType.BALANCED, weapon: WeaponType.SHOTGUN, special: SpecialType.REPAIR, strategy: 'balanced' }
    ];

    const aiBots = enemyConfigs.map((config, index) => ({
      id: `ai-${index}`,
      name: `Enemy ${index + 1}`,
      x: (index - 1) * 4,
      y: 0,
      z: -7,
      health: CHASSIS_STATS[config.chassis].health,
      maxHealth: CHASSIS_STATS[config.chassis].health,
      color: '#ff4444',
      isPlayer: false,
      lastFired: 0,
      specialCooldown: 0,
      config: {
        chassis: config.chassis,
        weapon: config.weapon,
        special: config.special,
        name: `Enemy ${index + 1}`,
        primaryColor: '#ff4444',
        secondaryColor: '#aa2222'
      },
      rotation: Math.PI,
      velocity: { x: 0, z: 0 },
      isShielded: false,
      speedBoostTime: 0,
      strategy: config.strategy
    }));

    setBots([playerBotState, ...aiBots]);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeys(prev => new Set(prev).add(e.code));
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setKeys(prev => {
        const newKeys = new Set(prev);
        newKeys.delete(e.code);
        return newKeys;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Battle timer - only runs when battle is active
  useEffect(() => {
    if (battleState !== 'active' || battleEnded) return;

    const timer = setInterval(() => {
      setBattleTime(prev => {
        if (prev <= 1) {
          setBattleState('ended');
          setBattleEnded(true);
          // Determine winner by health
          setBots(currentBots => {
            const aliveBots = currentBots.filter(bot => bot.health > 0);
            if (aliveBots.length === 1) {
              setWinner(aliveBots[0].name);
            } else {
              const winner = currentBots.reduce((prev, current) =>
                prev.health > current.health ? prev : current
              );
              setWinner(winner.name);
            }
            return currentBots;
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [battleState, battleEnded]);

  // Main game loop - only runs when battle is active
  useEffect(() => {
    if (battleState !== 'active' || battleEnded) return;

    const gameLoop = setInterval(() => {
      const currentTime = Date.now();

      setBots(prevBots => {
        const newBots = [...prevBots];

        newBots.forEach((bot, index) => {
          if (bot.health <= 0) return;

          // Apply speed boost time reduction
          if (bot.speedBoostTime > 0) {
            bot.speedBoostTime = Math.max(0, bot.speedBoostTime - 0.1);
          }

          // Reduce special cooldown
          if (bot.specialCooldown > 0) {
            bot.specialCooldown = Math.max(0, bot.specialCooldown - 0.1);
          }

          if (bot.isPlayer) {
            // Player movement with mastery bonuses
            const baseSpeed = CHASSIS_STATS[bot.config.chassis].speed * 0.08;
            const modifiedSpeed = baseSpeed * combatModifiers.speedMultiplier * (bot.speedBoostTime > 0 ? 2 : 1);

            let moved = false;
            if (keys.has('KeyW') || keys.has('ArrowUp')) {
              bot.z -= modifiedSpeed;
              bot.rotation = 0;
              moved = true;
            }
            if (keys.has('KeyS') || keys.has('ArrowDown')) {
              bot.z += modifiedSpeed;
              bot.rotation = Math.PI;
              moved = true;
            }
            if (keys.has('KeyA') || keys.has('ArrowLeft')) {
              bot.x -= modifiedSpeed;
              bot.rotation = Math.PI / 2;
              moved = true;
            }
            if (keys.has('KeyD') || keys.has('ArrowRight')) {
              bot.x += modifiedSpeed;
              bot.rotation = -Math.PI / 2;
              moved = true;
            }

            // Keep in bounds
            bot.x = Math.max(-9, Math.min(9, bot.x));
            bot.z = Math.max(-9, Math.min(9, bot.z));

            // Player special abilities
            if (keys.has('KeyE') && bot.specialCooldown <= 0) {
              const cooldownReduction = 1 - combatModifiers.cooldownReduction;
              bot.specialCooldown = SPECIAL_STATS[bot.config.special].cooldown * cooldownReduction;

              setBattleStats(prev => ({ ...prev, specialsUsed: prev.specialsUsed + 1 }));

              switch (bot.config.special) {
                case SpecialType.SHIELD:
                  bot.isShielded = true;
                  setTimeout(() => {
                    setBots(prevBots => {
                      const updatedBots = [...prevBots];
                      const playerBot = updatedBots.find(b => b.isPlayer);
                      if (playerBot) playerBot.isShielded = false;
                      return updatedBots;
                    });
                  }, 5000);
                  break;
                case SpecialType.SPEED_BOOST:
                  bot.speedBoostTime = SPECIAL_STATS[SpecialType.SPEED_BOOST].duration || 4;
                  break;
                case SpecialType.REPAIR:
                  const repairAmount = 5 * (1 + (combatModifiers.specialEffects.dualSpecial ? 0.5 : 0));
                  bot.health = Math.min(bot.maxHealth, bot.health + repairAmount);
                  break;
              }
            }

            // Player shooting with improved firing
            if (keys.has('Space')) {
              const weaponStats = WEAPON_STATS[bot.config.weapon];
              const timeSinceLastFire = currentTime - bot.lastFired;
              const fireInterval = 1000 / weaponStats.fireRate;

              if (timeSinceLastFire >= fireInterval) {
                bot.lastFired = currentTime;

                // Add muzzle flash effect
                const muzzleFlashId = `muzzle-${Date.now()}-${Math.random()}`;
                const muzzlePosition: [number, number, number] = [bot.x, bot.y + 0.5, bot.z];
                setMuzzleFlashes(prev => [...prev, {
                  id: muzzleFlashId,
                  position: muzzlePosition,
                  rotation: bot.rotation
                }]);

                // Find nearest enemy
                const enemies = newBots.filter(b => !b.isPlayer && b.health > 0);
                if (enemies.length > 0) {
                  const nearestEnemy = enemies.reduce((nearest, enemy) => {
                    const distToNearest = Math.sqrt((bot.x - nearest.x) ** 2 + (bot.z - nearest.z) ** 2);
                    const distToEnemy = Math.sqrt((bot.x - enemy.x) ** 2 + (bot.z - enemy.z) ** 2);
                    return distToEnemy < distToNearest ? enemy : nearest;
                  });

                  // Create projectile
                  const projectileId = `projectile-${Date.now()}-${Math.random()}`;
                  const newProjectile: Projectile = {
                    id: projectileId,
                    x: bot.x,
                    y: 0.5,
                    z: bot.z,
                    targetX: nearestEnemy.x,
                    targetZ: nearestEnemy.z,
                    speed: 0.3,
                    damage: weaponStats.damage * combatModifiers.damageMultiplier,
                    ownerId: bot.id
                  };

                  setProjectiles(prev => [...prev, newProjectile]);
                  setBattleStats(prev => ({ ...prev, shotsFired: prev.shotsFired + 1 }));

                  // Remove projectile after 3 seconds
                  setTimeout(() => {
                    setProjectiles(prev => prev.filter(p => p.id !== projectileId));
                  }, 3000);
                }
              }
            }
          } else {
            // AI Bot behavior (simplified for now)
            const player = newBots.find(b => b.isPlayer);
            if (player && player.health > 0) {
              // Move towards player
              const dx = player.x - bot.x;
              const dz = player.z - bot.z;
              const distance = Math.sqrt(dx * dx + dz * dz);

              if (distance > 3) {
                const speed = CHASSIS_STATS[bot.config.chassis].speed * 0.05;
                bot.x += (dx / distance) * speed;
                bot.z += (dz / distance) * speed;
              }

              // Keep in bounds
              bot.x = Math.max(-9, Math.min(9, bot.x));
              bot.z = Math.max(-9, Math.min(9, bot.z));

              // AI shooting
              const weaponStats = WEAPON_STATS[bot.config.weapon];
              const timeSinceLastFire = currentTime - bot.lastFired;
              const fireInterval = 1500 / weaponStats.fireRate; // AI fires slower

              if (timeSinceLastFire >= fireInterval && distance < 8) {
                bot.lastFired = currentTime;

                // Add muzzle flash effect for AI
                const muzzleFlashId = `ai-muzzle-${Date.now()}-${Math.random()}`;
                const muzzlePosition: [number, number, number] = [bot.x, bot.y + 0.5, bot.z];
                setMuzzleFlashes(prev => [...prev, {
                  id: muzzleFlashId,
                  position: muzzlePosition,
                  rotation: bot.rotation
                }]);

                const projectileId = `ai-projectile-${Date.now()}-${Math.random()}`;
                const newProjectile: Projectile = {
                  id: projectileId,
                  x: bot.x,
                  y: 0.5,
                  z: bot.z,
                  targetX: player.x,
                  targetZ: player.z,
                  speed: 0.25,
                  damage: weaponStats.damage * 0.8, // AI does less damage
                  ownerId: bot.id
                };

                setProjectiles(prev => [...prev, newProjectile]);

                setTimeout(() => {
                  setProjectiles(prev => prev.filter(p => p.id !== projectileId));
                }, 3000);
              }
            }
          }
        });

        return newBots;
      });

      // Update projectiles
      setProjectiles(prevProjectiles => {
        return prevProjectiles.map(projectile => {
          const dx = projectile.targetX - projectile.x;
          const dz = projectile.targetZ - projectile.z;
          const distance = Math.sqrt(dx * dx + dz * dz);

          if (distance < 0.5) {
            // Hit target - apply damage
            setBots(prevBots => {
              const newBots = [...prevBots];
              const target = newBots.find(bot =>
                Math.abs(bot.x - projectile.targetX) < 1 &&
                Math.abs(bot.z - projectile.targetZ) < 1 &&
                bot.id !== projectile.ownerId
              );

              if (target) {
                // Add explosion effect
                const explosionId = `explosion-${Date.now()}-${Math.random()}`;
                const explosionPosition: [number, number, number] = [target.x, target.y + 0.5, target.z];
                setExplosions(prev => [...prev, {
                  id: explosionId,
                  position: explosionPosition
                }]);

                if (target.isShielded) {
                  target.isShielded = false; // Shield absorbs hit
                } else {
                  target.health = Math.max(0, target.health - projectile.damage);
                  if (target.isPlayer) {
                    // Player took damage
                  } else {
                    // Enemy took damage
                    setBattleStats(prev => ({
                      ...prev,
                      damageDealt: prev.damageDealt + projectile.damage,
                      shotsHit: prev.shotsHit + 1
                    }));
                  }
                }
              }
              return newBots;
            });

            return null; // Remove projectile
          }

          // Move projectile towards target
          return {
            ...projectile,
            x: projectile.x + (dx / distance) * projectile.speed,
            z: projectile.z + (dz / distance) * projectile.speed
          };
        }).filter(Boolean) as Projectile[];
      });

      // Check for battle end conditions
      setBots(prevBots => {
        const aliveBots = prevBots.filter(bot => bot.health > 0);
        const aliveEnemies = aliveBots.filter(bot => !bot.isPlayer);
        const playerAlive = aliveBots.some(bot => bot.isPlayer);

        if (!playerAlive || aliveEnemies.length === 0) {
          setBattleEnded(true);
          setBattleState('ended');
          if (playerAlive) {
            setWinner(aliveBots.find(bot => bot.isPlayer)?.name || 'Player');
          } else {
            setWinner('AI Enemies');
          }
        }

        return prevBots;
      });

    }, 100); // 10 FPS game loop

    return () => clearInterval(gameLoop);
  }, [battleState, battleEnded, keys, combatModifiers]);

  return (
    <div className="h-full w-full flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="panel-cyber m-4 p-4 flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-cyber-red glow-text">Battle Arena</h1>
          <p className="text-gray-400 text-sm">Control your bot and defeat the AI!</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-xl font-bold text-cyber-yellow glow-text">
            Time: {battleTime}s
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBackToBuilder}
            className="btn-cyber-secondary"
          >
            Back to Builder
          </motion.button>
        </div>
      </motion.div>

      {/* Battle Arena */}
      <div className="flex-1 flex">
        {/* 3D Arena */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 panel-cyber m-4 p-4"
        >
          <div className="h-full bg-dark-surface rounded-lg overflow-hidden border border-cyber-blue/30">
            <Canvas
              shadows
              gl={{
                antialias: true,
                alpha: true,
                preserveDrawingBuffer: false,
                powerPreference: "high-performance"
              }}
              camera={{ position: [0, 15, 15], fov: 75 }}
              onCreated={({ gl }: { gl: any }) => {
                gl.setClearColor('#1a1a1a', 1);
                gl.shadowMap.enabled = true;
                gl.shadowMap.type = 2; // PCFSoftShadowMap constant
              }}
            >
              <Suspense fallback={null}>
                <OrbitControls
                  enablePan={false}
                  maxPolarAngle={Math.PI / 2.2}
                  minDistance={10}
                  maxDistance={25}
                />
                <Environment preset="night" />

                {/* Lighting */}
                <ambientLight intensity={0.4} />
                <directionalLight
                  position={[10, 10, 5]}
                  intensity={1}
                  color="#00f5ff"
                  castShadow
                  shadow-mapSize-width={2048}
                  shadow-mapSize-height={2048}
                />
                <pointLight position={[-10, 5, -10]} intensity={0.5} color="#8b5cf6" />

                {/* Arena */}
                <Arena3D />

                {/* Bots */}
                {bots.map(bot => (
                  <ArenaBotComponent
                    key={bot.id}
                    bot={bot}
                    isMoving={bot.isPlayer ? isPlayerMoving : false}
                  />
                ))}

                {/* Projectiles */}
                {projectiles.map(projectile => (
                  <ProjectileComponent key={projectile.id} projectile={projectile} />
                ))}

                {/* Explosions */}
                {explosions.map(explosion => (
                  <ExplosionEffect
                    key={explosion.id}
                    position={explosion.position}
                    onComplete={() => {
                      setExplosions(prev => prev.filter(e => e.id !== explosion.id));
                    }}
                  />
                ))}

                {/* Muzzle Flashes */}
                {muzzleFlashes.map(flash => (
                  <MuzzleFlashEffect
                    key={flash.id}
                    position={flash.position}
                    rotation={flash.rotation}
                    onComplete={() => {
                      setMuzzleFlashes(prev => prev.filter(f => f.id !== flash.id));
                    }}
                  />
                ))}
              </Suspense>
            </Canvas>
          </div>
        </motion.div>

        {/* UI Panel */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-80 panel-cyber m-4 p-6"
        >
          <h2 className="text-xl font-bold text-cyber-purple mb-4 glow-text">Battle Status</h2>

          {/* Battle Statistics */}
          <div className="panel-cyber p-4 mb-4 bg-gradient-to-br from-cyber-blue/10 to-transparent">
            <h3 className="font-bold text-cyber-blue mb-3 glow-text">Your Stats</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="text-center">
                <div className="text-cyber-green font-bold text-lg">{battleStats.damageDealt}</div>
                <div className="text-gray-400">Damage</div>
              </div>
              <div className="text-center">
                <div className="text-cyber-yellow font-bold text-lg">{battleStats.shotsFired}</div>
                <div className="text-gray-400">Shots</div>
              </div>
              <div className="text-center">
                <div className="text-cyber-purple font-bold text-lg">{battleStats.specialsUsed}</div>
                <div className="text-gray-400">Specials</div>
              </div>
              <div className="text-center">
                <div className="text-cyber-orange font-bold text-lg">{Math.floor((180 - battleTime) / 60)}:{String((180 - battleTime) % 60).padStart(2, '0')}</div>
                <div className="text-gray-400">Alive</div>
              </div>
            </div>
          </div>

          {/* Bot Stats */}
          <div className="space-y-4 mb-6">
            {bots.map(bot => (
              <div key={bot.id} className={`panel-cyber p-3 ${bot.isPlayer ? 'border-cyber-blue' : 'border-cyber-red'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-bold ${bot.isPlayer ? 'text-cyber-blue' : 'text-cyber-red'}`}>
                    {bot.name}
                    {bot.isPlayer && bot.isShielded && <span className="text-cyber-green ml-2">🛡️</span>}
                    {bot.isPlayer && bot.speedBoostTime > 0 && <span className="text-cyber-yellow ml-2">⚡</span>}
                  </span>
                  <span className="text-sm text-gray-400">
                    {bot.health}/{bot.maxHealth} HP
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 health-bar">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      bot.health > bot.maxHealth * 0.5 ? 'bg-cyber-green' :
                      bot.health > bot.maxHealth * 0.25 ? 'bg-cyber-yellow' : 'bg-cyber-red'
                    }`}
                    style={{ width: `${(bot.health / bot.maxHealth) * 100}%` }}
                  />
                </div>
                {bot.isPlayer && bot.specialCooldown > 0 && (
                  <div className="text-xs text-gray-400 mt-1">
                    Special: {bot.specialCooldown.toFixed(1)}s
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="panel-cyber p-4 bg-gradient-to-br from-cyber-blue/10 to-transparent">
            <h3 className="font-bold text-cyber-blue mb-3 glow-text">Controls</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <div><span className="text-cyber-green">WASD/Arrows:</span> Move</div>
              <div><span className="text-cyber-yellow">Space:</span> Shoot</div>
              <div><span className="text-cyber-purple">E:</span> Special Ability</div>
              <div><span className="text-cyber-orange">Mouse:</span> Camera</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Battle Countdown Overlay */}
      {battleState === 'countdown' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            className="text-center"
          >
            <motion.div
              key={countdown}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              className="text-9xl font-bold text-cyber-blue glow-text mb-4"
            >
              {countdown}
            </motion.div>
            <div className="text-2xl text-gray-300">Battle starts in...</div>
          </motion.div>
        </motion.div>
      )}

      {/* Ready State Overlay */}
      {battleState === 'ready' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.2 }}
          className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center"
          >
            <div className="text-6xl font-bold text-cyber-green glow-text mb-4">
              READY!
            </div>
            <div className="text-xl text-gray-300">Get ready to fight!</div>
          </motion.div>
        </motion.div>
      )}

      {/* Tutorial Overlay */}
      {showTutorial && battleState === 'countdown' && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="absolute top-20 left-1/2 transform -translate-x-1/2 z-40"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="panel-cyber p-6 text-center max-w-lg mx-4"
          >
            <h3 className="text-xl font-bold text-cyber-blue mb-3 glow-text">
              Battle Controls
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm text-gray-300">
              <div><span className="text-cyber-green font-bold">WASD:</span> Move</div>
              <div><span className="text-cyber-yellow font-bold">Space:</span> Shoot</div>
              <div><span className="text-cyber-purple font-bold">E:</span> Special</div>
              <div><span className="text-cyber-orange font-bold">Mouse:</span> Camera</div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowTutorial(false)}
              className="btn-small mt-4"
            >
              Got it!
            </motion.button>
          </motion.div>
        </motion.div>
      )}

      {/* Battle Result Modal */}
      {battleEnded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="panel-cyber p-8 text-center max-w-md"
          >
            <h2 className="text-4xl font-bold text-cyber-yellow mb-4 glow-text">
              Battle Complete!
            </h2>
            <p className="text-2xl text-white mb-4">
              Winner: <span className="text-cyber-green glow-text">{winner}</span>
            </p>

            {/* Final Stats */}
            <div className="panel-cyber p-4 mb-6 bg-gradient-to-br from-cyber-blue/10 to-transparent">
              <h3 className="font-bold text-cyber-blue mb-3">Final Stats</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="text-center">
                  <div className="text-cyber-green font-bold">{battleStats.damageDealt}</div>
                  <div className="text-gray-400">Damage Dealt</div>
                </div>
                <div className="text-center">
                  <div className="text-cyber-yellow font-bold">{battleStats.shotsFired}</div>
                  <div className="text-gray-400">Shots Fired</div>
                </div>
                <div className="text-center">
                  <div className="text-cyber-purple font-bold">{battleStats.specialsUsed}</div>
                  <div className="text-gray-400">Specials Used</div>
                </div>
                <div className="text-center">
                  <div className="text-cyber-orange font-bold">
                    {battleStats.shotsFired > 0 ? Math.round((battleStats.damageDealt / battleStats.shotsFired) * 100) : 0}%
                  </div>
                  <div className="text-gray-400">Accuracy</div>
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBackToBuilder}
              className="btn-cyber-primary text-lg px-8 py-3"
            >
              Build New Bot
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default BattleArena;
