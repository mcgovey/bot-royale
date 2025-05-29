import React, { useEffect, useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Text } from '@react-three/drei';
import { motion } from 'framer-motion';
import { ChassisType, WeaponType, SpecialType, CHASSIS_STATS, WEAPON_STATS, SPECIAL_STATS } from '../types/game';
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

// Projectile Component
const ProjectileComponent: React.FC<{ projectile: Projectile }> = ({ projectile }) => {
  return (
    <mesh position={[projectile.x, projectile.y, projectile.z]}>
      <sphereGeometry args={[0.1, 8, 8]} />
      <meshStandardMaterial
        color="#ffff00"
        emissive="#ffff00"
        emissiveIntensity={0.5}
      />
    </mesh>
  );
};

const BattleArena: React.FC<BattleArenaProps> = ({ playerBot, onBackToBuilder }) => {
  const [battleTime, setBattleTime] = useState(180);
  const [bots, setBots] = useState<BotState[]>([]);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [battleEnded, setBattleEnded] = useState(false);
  const [winner, setWinner] = useState<string>('');
  const [keys, setKeys] = useState<Set<string>>(new Set());
  const [showTutorial, setShowTutorial] = useState(true);
  const [battleStats, setBattleStats] = useState({
    damageDealt: 0,
    shotsFired: 0,
    specialsUsed: 0,
    timeAlive: 0
  });

  // Initialize battle
  useEffect(() => {
    const playerBotState: BotState = {
      id: 'player',
      name: playerBot.name,
      x: -6,
      y: 0,
      z: 0,
      health: CHASSIS_STATS[playerBot.chassis].health,
      maxHealth: CHASSIS_STATS[playerBot.chassis].health,
      color: playerBot.primaryColor,
      isPlayer: true,
      lastFired: 0,
      specialCooldown: 0,
      config: playerBot,
      rotation: 0,
      velocity: { x: 0, z: 0 },
      isShielded: false,
      speedBoostTime: 0,
      strategy: ''
    };

    // Create more challenging AI opponents with varied strategies
    const aiConfigs = [
      {
        chassis: ChassisType.SPEED,
        weapon: WeaponType.BLASTER,
        special: SpecialType.SPEED_BOOST,
        strategy: 'aggressive',
        name: 'Speedster'
      },
      {
        chassis: ChassisType.TANK,
        weapon: WeaponType.CANNON,
        special: SpecialType.SHIELD,
        strategy: 'defensive',
        name: 'Guardian'
      },
      {
        chassis: ChassisType.BALANCED,
        weapon: WeaponType.SHOTGUN,
        special: SpecialType.REPAIR,
        strategy: 'tactical',
        name: 'Tactician'
      }
    ];

    const aiBots = aiConfigs.map((config, index) => ({
      id: `ai-${index}`,
      name: config.name,
      x: 6 + (index * 2),
      y: 0,
      z: index * 3 - 3,
      health: CHASSIS_STATS[config.chassis].health,
      maxHealth: CHASSIS_STATS[config.chassis].health,
      color: ['#ff4444', '#ff8800', '#44ff44'][index],
      isPlayer: false,
      lastFired: 0,
      specialCooldown: 0,
      config: {
        chassis: config.chassis,
        weapon: config.weapon,
        special: config.special,
        name: config.name,
        primaryColor: ['#ff4444', '#ff8800', '#44ff44'][index],
        secondaryColor: '#aa2222'
      },
      rotation: Math.PI,
      velocity: { x: 0, z: 0 },
      isShielded: false,
      speedBoostTime: 0,
      strategy: config.strategy
    }));

    setBots([playerBotState, ...aiBots]);

    // Auto-hide tutorial after 8 seconds
    setTimeout(() => setShowTutorial(false), 8000);
  }, [playerBot]);

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

  // Battle timer
  useEffect(() => {
    if (battleEnded) return;

    const timer = setInterval(() => {
      setBattleTime(prev => {
        if (prev <= 1) {
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
  }, [battleEnded]);

  // Game loop
  useEffect(() => {
    if (battleEnded) return;

    const gameLoop = setInterval(() => {
      const currentTime = Date.now();

      setBots(prevBots => {
        const newBots = [...prevBots];

        newBots.forEach((bot, index) => {
          if (bot.health <= 0) return;

          // Update special effects
          if (bot.speedBoostTime > 0) {
            bot.speedBoostTime = Math.max(0, bot.speedBoostTime - 0.1);
          }

          // Player movement
          if (bot.isPlayer) {
            const speed = CHASSIS_STATS[bot.config.chassis].speed * 0.1 * (bot.speedBoostTime > 0 ? 2 : 1);
            let moveX = 0, moveZ = 0;

            if (keys.has('KeyW') || keys.has('ArrowUp')) moveZ -= speed;
            if (keys.has('KeyS') || keys.has('ArrowDown')) moveZ += speed;
            if (keys.has('KeyA') || keys.has('ArrowLeft')) moveX -= speed;
            if (keys.has('KeyD') || keys.has('ArrowRight')) moveX += speed;

            // Update position with bounds checking
            bot.x = Math.max(-9, Math.min(9, bot.x + moveX));
            bot.z = Math.max(-9, Math.min(9, bot.z + moveZ));

            // Update rotation based on movement
            if (moveX !== 0 || moveZ !== 0) {
              bot.rotation = Math.atan2(moveX, moveZ);
            }

            // Player shooting
            if (keys.has('Space')) {
              const weaponStats = WEAPON_STATS[bot.config.weapon];
              const timeSinceLastFire = currentTime - bot.lastFired;
              const fireInterval = 1000 / weaponStats.fireRate;

              if (timeSinceLastFire >= fireInterval) {
                bot.lastFired = currentTime;

                // Find nearest enemy
                const enemies = newBots.filter(b => !b.isPlayer && b.health > 0);
                if (enemies.length > 0) {
                  const nearestEnemy = enemies.reduce((nearest, enemy) => {
                    const distToNearest = Math.sqrt((bot.x - nearest.x) ** 2 + (bot.z - nearest.z) ** 2);
                    const distToEnemy = Math.sqrt((bot.x - enemy.x) ** 2 + (bot.z - enemy.z) ** 2);
                    return distToEnemy < distToNearest ? enemy : nearest;
                  });

                  setProjectiles(prev => [...prev, {
                    id: `${bot.id}-${currentTime}`,
                    x: bot.x,
                    y: 0.5,
                    z: bot.z,
                    targetX: nearestEnemy.x,
                    targetZ: nearestEnemy.z,
                    speed: 0.3,
                    damage: weaponStats.damage,
                    ownerId: bot.id
                  }]);

                  // Track player stats
                  setBattleStats(prev => ({ ...prev, shotsFired: prev.shotsFired + 1 }));
                }
              }
            }

            // Player special ability
            if (keys.has('KeyE') && bot.specialCooldown <= 0) {
              bot.specialCooldown = SPECIAL_STATS[bot.config.special].cooldown;
              setBattleStats(prev => ({ ...prev, specialsUsed: prev.specialsUsed + 1 }));

              switch (bot.config.special) {
                case SpecialType.SHIELD:
                  bot.isShielded = true;
                  setTimeout(() => {
                    setBots(prevBots => {
                      const updatedBots = [...prevBots];
                      const playerBot = updatedBots.find(b => b.id === bot.id);
                      if (playerBot) playerBot.isShielded = false;
                      return updatedBots;
                    });
                  }, 5000);
                  break;
                case SpecialType.SPEED_BOOST:
                  bot.speedBoostTime = 4; // Updated duration
                  break;
                case SpecialType.REPAIR:
                  bot.health = Math.min(bot.maxHealth, bot.health + 5); // Updated heal amount
                  break;
              }
            }
          } else {
            // Enhanced AI behavior with different strategies
            const player = newBots.find(b => b.isPlayer && b.health > 0);
            const otherAI = newBots.filter(b => !b.isPlayer && b.health > 0 && b.id !== bot.id);

            if (player) {
              const dx = player.x - bot.x;
              const dz = player.z - bot.z;
              const distance = Math.sqrt(dx * dx + dz * dz);
              const speed = CHASSIS_STATS[bot.config.chassis].speed * 0.08; // Slightly faster AI

              // Strategy-based AI behavior
              switch (bot.strategy) {
                case 'aggressive':
                  // Always chase player, use special when close
                  if (distance > 3) {
                    bot.x += (dx / distance) * speed * 1.2;
                    bot.z += (dz / distance) * speed * 1.2;
                  }
                  if (bot.specialCooldown <= 0 && distance < 5) {
                    bot.specialCooldown = SPECIAL_STATS[bot.config.special].cooldown;
                    bot.speedBoostTime = 4;
                  }
                  break;

                case 'defensive':
                  // Maintain distance, use shield when health is low
                  const idealDistance = 6;
                  if (distance < idealDistance) {
                    bot.x -= (dx / distance) * speed;
                    bot.z -= (dz / distance) * speed;
                  } else if (distance > idealDistance + 2) {
                    bot.x += (dx / distance) * speed * 0.7;
                    bot.z += (dz / distance) * speed * 0.7;
                  }
                  if (bot.specialCooldown <= 0 && bot.health < bot.maxHealth * 0.4) {
                    bot.specialCooldown = SPECIAL_STATS[bot.config.special].cooldown;
                    bot.isShielded = true;
                    setTimeout(() => {
                      setBots(prevBots => {
                        const updatedBots = [...prevBots];
                        const aiBot = updatedBots.find(b => b.id === bot.id);
                        if (aiBot) aiBot.isShielded = false;
                        return updatedBots;
                      });
                    }, 5000);
                  }
                  break;

                case 'tactical':
                  // Circle around player, use repair strategically
                  const angle = Math.atan2(dz, dx) + 0.5; // Circular movement
                  const targetDistance = 5;
                  bot.x += Math.cos(angle) * speed;
                  bot.z += Math.sin(angle) * speed;

                  // Move towards ideal distance
                  if (distance < targetDistance - 1) {
                    bot.x -= (dx / distance) * speed * 0.5;
                    bot.z -= (dz / distance) * speed * 0.5;
                  } else if (distance > targetDistance + 1) {
                    bot.x += (dx / distance) * speed * 0.5;
                    bot.z += (dz / distance) * speed * 0.5;
                  }

                  if (bot.specialCooldown <= 0 && bot.health < bot.maxHealth * 0.6) {
                    bot.specialCooldown = SPECIAL_STATS[bot.config.special].cooldown;
                    bot.health = Math.min(bot.maxHealth, bot.health + 5);
                  }
                  break;
              }

              // Keep in bounds
              bot.x = Math.max(-9, Math.min(9, bot.x));
              bot.z = Math.max(-9, Math.min(9, bot.z));

              // AI rotation
              bot.rotation = Math.atan2(dx, dz);

              // Enhanced AI shooting with better accuracy
              const weaponStats = WEAPON_STATS[bot.config.weapon];
              const timeSinceLastFire = currentTime - bot.lastFired;
              const fireInterval = 1000 / weaponStats.fireRate;

              if (distance <= weaponStats.range && timeSinceLastFire >= fireInterval) {
                // Add some prediction to AI shooting
                const predictedX = player.x + (player.velocity?.x || 0) * 2;
                const predictedZ = player.z + (player.velocity?.z || 0) * 2;

                bot.lastFired = currentTime;

                setProjectiles(prev => [...prev, {
                  id: `${bot.id}-${currentTime}`,
                  x: bot.x,
                  y: 0.5,
                  z: bot.z,
                  targetX: predictedX,
                  targetZ: predictedZ,
                  speed: 0.3,
                  damage: weaponStats.damage,
                  ownerId: bot.id
                }]);
              }
            }
          }

          // Update cooldowns
          if (bot.specialCooldown > 0) {
            bot.specialCooldown = Math.max(0, bot.specialCooldown - 0.1);
          }
        });

        // Check for battle end
        const aliveBots = newBots.filter(bot => bot.health > 0);
        const alivePlayer = aliveBots.find(bot => bot.isPlayer);
        const aliveAI = aliveBots.filter(bot => !bot.isPlayer);

        if (!alivePlayer || aliveAI.length === 0) {
          setBattleEnded(true);
          setWinner(alivePlayer ? alivePlayer.name : 'AI Bots');
        }

        return newBots;
      });

      // Update projectiles
      setProjectiles(prevProjectiles => {
        return prevProjectiles.filter(projectile => {
          const dx = projectile.targetX - projectile.x;
          const dz = projectile.targetZ - projectile.z;
          const distance = Math.sqrt(dx * dx + dz * dz);

          if (distance < 0.5) {
            // Hit target
            setBots(prevBots => {
              const newBots = [...prevBots];
              const target = newBots.find(bot =>
                Math.sqrt((bot.x - projectile.targetX) ** 2 + (bot.z - projectile.targetZ) ** 2) < 1
              );

              if (target && target.id !== projectile.ownerId) {
                if (target.isShielded) {
                  target.isShielded = false;
                } else {
                  target.health = Math.max(0, target.health - projectile.damage);

                  // Track damage dealt by player
                  if (projectile.ownerId === 'player') {
                    setBattleStats(prev => ({
                      ...prev,
                      damageDealt: prev.damageDealt + projectile.damage
                    }));
                  }
                }
              }

              return newBots;
            });
            return false;
          }

          // Move projectile
          projectile.x += (dx / distance) * projectile.speed;
          projectile.z += (dz / distance) * projectile.speed;
          return true;
        });
      });
    }, 100);

    return () => clearInterval(gameLoop);
  }, [battleEnded, keys]);

  const isPlayerMoving = keys.has('KeyW') || keys.has('KeyS') || keys.has('KeyA') || keys.has('KeyD') ||
                       keys.has('ArrowUp') || keys.has('ArrowDown') || keys.has('ArrowLeft') || keys.has('ArrowRight');

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

      {/* Tutorial Overlay */}
      {showTutorial && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center z-40"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="panel-cyber p-8 text-center max-w-lg mx-4"
          >
            <h2 className="text-3xl font-bold text-cyber-blue mb-4 glow-text">
              Battle Tutorial
            </h2>
            <div className="text-left space-y-3 mb-6">
              <p className="text-gray-300">
                <span className="text-cyber-green font-bold">WASD/Arrows:</span> Move your bot around the arena
              </p>
              <p className="text-gray-300">
                <span className="text-cyber-yellow font-bold">Space:</span> Fire your weapon at enemies
              </p>
              <p className="text-gray-300">
                <span className="text-cyber-purple font-bold">E:</span> Use your special ability
              </p>
              <p className="text-gray-300">
                <span className="text-cyber-orange font-bold">Mouse:</span> Control the camera view
              </p>
              <p className="text-cyber-red font-bold mt-4">
                Survive 3 minutes against 3 AI opponents!
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowTutorial(false)}
              className="btn-cyber-primary text-lg px-8 py-3"
            >
              Start Battle!
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
