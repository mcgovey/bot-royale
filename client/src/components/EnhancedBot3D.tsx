import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Group, Material, MeshStandardMaterial, Color } from 'three';
import { ChassisType, WeaponType } from '../types/game';
import {
  MaterialType,
  WearType,
  AntennaType,
  ArmorPlatingStyle,
  WeaponModificationType,
  EmotiveElementType,
  PersonalityTrait,
  EnhancedBotConfiguration
} from '../types/customization';

interface EnhancedBot3DProps {
  configuration: EnhancedBotConfiguration;
  animationState?: 'idle' | 'combat' | 'victory' | 'damaged';
  showEffects?: boolean;
  scale?: number;
}

const EnhancedBot3D: React.FC<EnhancedBot3DProps> = ({
  configuration,
  animationState = 'idle',
  showEffects = true,
  scale = 1
}) => {
  const groupRef = useRef<Group>(null);
  const coreRef = useRef<Mesh>(null);
  const weaponRef = useRef<Mesh>(null);
  const antennaRef = useRef<Mesh>(null);
  const emotiveRef = useRef<Mesh>(null);

  // Animation state management
  useFrame((state: any, delta: number) => {
    if (!groupRef.current) return;

    // Base floating animation
    const baseFloat = Math.sin(state.clock.elapsedTime * 2) * 0.1;

    // Personality-based animation modifiers
    const personalityMultiplier = getPersonalityAnimationMultiplier(configuration.personality.primaryTrait);

    switch (animationState) {
      case 'idle':
        groupRef.current.position.y = baseFloat * personalityMultiplier;
        groupRef.current.rotation.y += delta * 0.2 * personalityMultiplier;
        break;
      case 'combat':
        groupRef.current.position.y = baseFloat * 0.3;
        groupRef.current.rotation.y += delta * 0.8;
        break;
      case 'victory':
        groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 4) * 0.3;
        groupRef.current.rotation.y += delta * 2;
        break;
      case 'damaged':
        groupRef.current.position.y = baseFloat * 0.5 + Math.sin(state.clock.elapsedTime * 8) * 0.05;
        break;
    }

    // Core rotation based on personality
    if (coreRef.current) {
      const coreSpeed = configuration.personality.aggressionLevel * 3 + 1;
      coreRef.current.rotation.y += delta * coreSpeed;
      coreRef.current.rotation.x += delta * 0.5;
    }

    // Weapon animation
    if (weaponRef.current) {
      weaponRef.current.rotation.z += delta * 0.3;
    }

    // Antenna animation based on type
    if (antennaRef.current) {
      const antennaSpeed = configuration.appearance.accessories.antennaType === AntennaType.BROADCAST ? 2 : 0.5;
      antennaRef.current.rotation.y += delta * antennaSpeed;
    }

    // Emotive elements animation
    if (emotiveRef.current && emotiveRef.current.material instanceof MeshStandardMaterial) {
      const emotiveSpeed = configuration.personality.adaptabilityLevel * 2 + 0.5;
      emotiveRef.current.material.emissiveIntensity =
        0.8 + Math.sin(state.clock.elapsedTime * emotiveSpeed) * 0.5;
    }
  });

  // Get chassis configuration with personality influence
  const chassisConfig = useMemo(() => {
    const baseConfig = getBaseChassisConfig(configuration.chassis);
    const personalityMod = getPersonalityChassisModifier(configuration.personality.primaryTrait);

    return {
      ...baseConfig,
      mainSize: baseConfig.mainSize.map((s, i) => s * personalityMod.sizeMultiplier[i]),
      thrusterCount: Math.max(1, baseConfig.thrusterCount + personalityMod.thrusterDelta),
      style: personalityMod.styleOverride || baseConfig.style
    };
  }, [configuration.chassis, configuration.personality.primaryTrait]);

  // Enhanced material system
  const createEnhancedMaterial = (baseColor: string, isSecondary: boolean = false) => {
    const color = new Color(baseColor);
    const material = new MeshStandardMaterial();

    // Apply material type effects
    switch (configuration.appearance.material.type) {
      case MaterialType.MATTE:
        material.metalness = 0.1;
        material.roughness = 0.9;
        break;
      case MaterialType.GLOSSY:
        material.metalness = 0.3;
        material.roughness = 0.1;
        break;
      case MaterialType.METALLIC:
        material.metalness = 0.95;
        material.roughness = 0.05;
        break;
      case MaterialType.HOLOGRAPHIC:
        material.metalness = 0.8;
        material.roughness = 0.2;
        material.transparent = true;
        material.opacity = 0.8;
        // Add iridescent effect (simplified)
        material.emissive = color.clone().multiplyScalar(0.3);
        break;
      case MaterialType.ANIMATED_ENERGY:
        material.metalness = 0.7;
        material.roughness = 0.3;
        material.emissive = color.clone().multiplyScalar(0.5);
        material.emissiveIntensity = configuration.appearance.material.intensity;
        break;
      case MaterialType.ANIMATED_PULSE:
        material.metalness = 0.6;
        material.roughness = 0.4;
        material.emissive = color.clone().multiplyScalar(0.4);
        break;
    }

    // Apply wear effects
    switch (configuration.appearance.material.wear) {
      case WearType.BATTLE_WORN:
        material.roughness = Math.min(1, material.roughness + 0.3);
        material.metalness = Math.max(0, material.metalness - 0.2);
        break;
      case WearType.WEATHERED:
        material.roughness = Math.min(1, material.roughness + 0.5);
        color.multiplyScalar(0.8);
        break;
      case WearType.VETERAN:
        material.roughness = Math.min(1, material.roughness + 0.2);
        material.emissiveIntensity = Math.max(0, (material.emissiveIntensity || 0) - 0.2);
        break;
      case WearType.DECORATED:
        material.emissiveIntensity = (material.emissiveIntensity || 0) + 0.3;
        break;
    }

    material.color = color;
    return material;
  };

  // Render antenna based on type
  const renderAntenna = () => {
    const mainHeight = chassisConfig.mainSize[1];

    switch (configuration.appearance.accessories.antennaType) {
      case AntennaType.COMBAT:
        return (
          <mesh ref={antennaRef} position={[0, mainHeight * 0.8, 0]} castShadow>
            <cylinderGeometry args={[0.03, 0.05, 0.15, 6]} />
            <meshStandardMaterial
              color={configuration.appearance.secondaryColor}
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>
        );
      case AntennaType.BROADCAST:
        return (
          <group ref={antennaRef} position={[0, mainHeight * 0.9, 0]}>
            <mesh position={[0, 0.1, 0]} castShadow>
              <cylinderGeometry args={[0.02, 0.04, 0.3, 8]} />
              <meshStandardMaterial
                color={configuration.appearance.accentColor}
                metalness={0.8}
                roughness={0.2}
                emissive={configuration.appearance.accentColor}
                emissiveIntensity={0.5}
              />
            </mesh>
            {/* Broadcast rings */}
            {[0.1, 0.2, 0.3].map((y, i) => (
              <mesh key={i} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.08 + i * 0.02, 0.01, 4, 16]} />
                <meshStandardMaterial
                  color="#00ffff"
                  emissive="#00ffff"
                  emissiveIntensity={1.0}
                  transparent
                  opacity={0.7}
                />
              </mesh>
            ))}
          </group>
        );
      case AntennaType.STEALTH:
        return (
          <mesh ref={antennaRef} position={[0, mainHeight * 0.7, 0]} castShadow>
            <boxGeometry args={[0.02, 0.08, 0.02]} />
            <meshStandardMaterial
              color={configuration.appearance.primaryColor}
              metalness={0.95}
              roughness={0.05}
            />
          </mesh>
        );
      case AntennaType.SCANNER:
        return (
          <group ref={antennaRef} position={[0, mainHeight * 0.8, 0]}>
            {[-0.05, 0, 0.05].map((x, i) => (
              <mesh key={i} position={[x, 0, 0]} castShadow>
                <cylinderGeometry args={[0.02, 0.02, 0.12, 6]} />
                <meshStandardMaterial
                  color="#ff6600"
                  emissive="#ff6600"
                  emissiveIntensity={0.8}
                  metalness={0.7}
                  roughness={0.3}
                />
              </mesh>
            ))}
          </group>
        );
      default:
        return null;
    }
  };

  // Render emotive elements
  const renderEmotiveElements = () => {
    const elements = configuration.appearance.accessories.emotiveElements;
    const mainHeight = chassisConfig.mainSize[1];
    const mainDepth = chassisConfig.mainSize[2];

    return (
      <group>
        {elements.includes(EmotiveElementType.ANIMATED_EYES) && (
          <group position={[0, mainHeight * 0.7, mainDepth * 0.3]}>
            {[-0.1, 0.1].map((x, i) => (
              <mesh key={`eye-${i}`} ref={i === 0 ? emotiveRef : undefined} position={[x, 0, 0]}>
                <sphereGeometry args={[0.04, 8, 8]} />
                <meshStandardMaterial
                  color="#00ffff"
                  emissive="#00ffff"
                  emissiveIntensity={1.2}
                  transparent
                  opacity={0.9}
                />
              </mesh>
            ))}
          </group>
        )}

        {elements.includes(EmotiveElementType.LED_STRIP) && (
          <group>
            {Array.from({ length: 8 }, (_, i) => {
              const angle = (i / 8) * Math.PI * 2;
              const radius = Math.max(...chassisConfig.mainSize) * 0.6;
              const x = Math.cos(angle) * radius;
              const z = Math.sin(angle) * radius;

              return (
                <mesh key={`led-${i}`} position={[x, 0, z]}>
                  <sphereGeometry args={[0.02, 4, 4]} />
                  <meshStandardMaterial
                    color={configuration.appearance.accentColor}
                    emissive={configuration.appearance.accentColor}
                    emissiveIntensity={0.8 + Math.sin(Date.now() * 0.01 + i) * 0.4}
                  />
                </mesh>
              );
            })}
          </group>
        )}

        {elements.includes(EmotiveElementType.HOLOGRAPHIC_DISPLAY) && (
          <mesh position={[0, mainHeight * 0.6, mainDepth * 0.4]}>
            <planeGeometry args={[0.3, 0.2]} />
            <meshStandardMaterial
              color="#00ff88"
              emissive="#00ff88"
              emissiveIntensity={0.8}
              transparent
              opacity={0.7}
              side={2} // DoubleSide
            />
          </mesh>
        )}

        {elements.includes(EmotiveElementType.PARTICLE_EMITTER) && showEffects && (
          <mesh position={[0, mainHeight * 0.9, 0]}>
            <sphereGeometry args={[0.01, 4, 4]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#ffffff"
              emissiveIntensity={2.0}
              transparent
              opacity={0.8}
            />
          </mesh>
        )}
      </group>
    );
  };

  // Render weapon modifications
  const renderWeaponModifications = () => {
    const mods = configuration.appearance.accessories.weaponModifications;
    const weaponPos = getWeaponConfig(configuration.weapon, chassisConfig).position;

    return (
      <group position={weaponPos as [number, number, number]}>
        {mods.includes(WeaponModificationType.SCOPE) && (
          <mesh position={[0, 0.1, -0.2]} castShadow>
            <cylinderGeometry args={[0.03, 0.04, 0.15, 8]} />
            <meshStandardMaterial
              color={configuration.appearance.secondaryColor}
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>
        )}

        {mods.includes(WeaponModificationType.BARREL_EXTENSION) && (
          <mesh position={[0, 0, 0.3]} castShadow>
            <cylinderGeometry args={[0.06, 0.08, 0.2, 8]} />
            <meshStandardMaterial
              color={configuration.appearance.accentColor}
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
        )}

        {mods.includes(WeaponModificationType.CHARGE_ENHANCER) && (
          <mesh position={[0, 0, -0.1]}>
            <torusGeometry args={[0.08, 0.02, 4, 16]} />
            <meshStandardMaterial
              color="#ffaa00"
              emissive="#ffaa00"
              emissiveIntensity={1.0}
              transparent
              opacity={0.8}
            />
          </mesh>
        )}
      </group>
    );
  };

  const [mainWidth, mainHeight, mainDepth] = chassisConfig.mainSize;

  return (
    <group ref={groupRef} scale={[scale, scale, scale]}>
      {/* Main Chassis Body with enhanced materials */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={chassisConfig.mainSize as [number, number, number]} />
        <primitive object={createEnhancedMaterial(configuration.appearance.primaryColor)} />
      </mesh>

      {/* Secondary Body Layer */}
      <mesh position={[0, mainHeight * 0.1, 0]} castShadow>
        <boxGeometry args={[mainWidth * 0.8, mainHeight * 0.6, mainDepth * 0.8]} />
        <primitive object={createEnhancedMaterial(configuration.appearance.secondaryColor, true)} />
      </mesh>

      {/* Enhanced Core with personality influence */}
      <mesh ref={coreRef} position={[0, mainHeight * 0.2, 0]}>
        <icosahedronGeometry args={[0.25 * (1 + configuration.personality.aggressionLevel * 0.3), 2]} />
        <meshStandardMaterial
          color={configuration.appearance.accentColor}
          emissive={configuration.appearance.accentColor}
          emissiveIntensity={1.0 + configuration.personality.aggressionLevel * 0.5}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Antenna System */}
      {renderAntenna()}

      {/* Emotive Elements */}
      {renderEmotiveElements()}

      {/* Weapon System with Modifications */}
      {renderWeaponModifications()}

      {/* Armor Plating based on style */}
      {configuration.appearance.accessories.armorPlating !== ArmorPlatingStyle.STANDARD && (
        <ArmorPlatingComponent
          style={configuration.appearance.accessories.armorPlating}
          chassisConfig={chassisConfig}
          primaryColor={configuration.appearance.primaryColor}
          secondaryColor={configuration.appearance.secondaryColor}
        />
      )}

      {/* Personality-based visual effects */}
      {configuration.personality.primaryTrait === PersonalityTrait.AGGRESSIVE && showEffects && (
        <mesh position={[0, 0, 0]} scale={[1.2, 1.2, 1.2]}>
          <boxGeometry args={chassisConfig.mainSize as [number, number, number]} />
          <meshStandardMaterial
            color="#ff4444"
            transparent
            opacity={0.1}
            emissive="#ff4444"
            emissiveIntensity={0.3}
            wireframe
          />
        </mesh>
      )}

      {configuration.personality.primaryTrait === PersonalityTrait.TACTICAL && showEffects && (
        <group>
          {Array.from({ length: 4 }, (_, i) => {
            const angle = (i / 4) * Math.PI * 2;
            const radius = Math.max(...chassisConfig.mainSize) * 0.8;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;

            return (
              <mesh key={`tactical-${i}`} position={[x, mainHeight * 0.5, z]}>
                <cylinderGeometry args={[0.01, 0.01, 0.6, 4]} />
                <meshStandardMaterial
                  color="#00aaff"
                  emissive="#00aaff"
                  emissiveIntensity={0.8}
                  transparent
                  opacity={0.6}
                />
              </mesh>
            );
          })}
        </group>
      )}
    </group>
  );
};

// Helper component for armor plating
const ArmorPlatingComponent: React.FC<{
  style: ArmorPlatingStyle;
  chassisConfig: any;
  primaryColor: string;
  secondaryColor: string;
}> = ({ style, chassisConfig, primaryColor, secondaryColor }) => {
  const [mainWidth, mainHeight, mainDepth] = chassisConfig.mainSize;

  switch (style) {
    case ArmorPlatingStyle.REINFORCED:
      return (
        <group>
          {/* Front reinforcement */}
          <mesh position={[0, 0, mainDepth * 0.52]} castShadow>
            <boxGeometry args={[mainWidth * 0.9, mainHeight * 0.7, 0.08]} />
            <meshStandardMaterial
              color={secondaryColor}
              metalness={0.95}
              roughness={0.05}
            />
          </mesh>
          {/* Side reinforcements */}
          {[-1, 1].map((side, i) => (
            <mesh key={`reinforce-${i}`} position={[side * mainWidth * 0.52, 0, 0]} castShadow>
              <boxGeometry args={[0.08, mainHeight * 0.9, mainDepth * 0.9]} />
              <meshStandardMaterial
                color={secondaryColor}
                metalness={0.95}
                roughness={0.05}
              />
            </mesh>
          ))}
        </group>
      );

    case ArmorPlatingStyle.REACTIVE:
      return (
        <group>
          {Array.from({ length: 12 }, (_, i) => {
            const angle = (i / 12) * Math.PI * 2;
            const radius = Math.max(mainWidth, mainDepth) * 0.45;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;

            return (
              <mesh key={`reactive-${i}`} position={[x, 0, z]} castShadow>
                <boxGeometry args={[0.1, mainHeight * 0.3, 0.05]} />
                <meshStandardMaterial
                  color={primaryColor}
                  emissive={primaryColor}
                  emissiveIntensity={0.3}
                  metalness={0.8}
                  roughness={0.2}
                />
              </mesh>
            );
          })}
        </group>
      );

    default:
      return null;
  }
};

// Helper functions
function getPersonalityAnimationMultiplier(trait: PersonalityTrait): number {
  switch (trait) {
    case PersonalityTrait.AGGRESSIVE: return 1.5;
    case PersonalityTrait.TACTICAL: return 0.7;
    case PersonalityTrait.PROTECTIVE: return 0.8;
    case PersonalityTrait.OPPORTUNISTIC: return 1.2;
    case PersonalityTrait.ADAPTIVE: return 1.0;
    default: return 1.0;
  }
}

function getBaseChassisConfig(chassis: ChassisType) {
  switch (chassis) {
    case ChassisType.SPEED:
      return {
        mainSize: [1.2, 0.6, 1.8],
        thrusterCount: 4,
        style: 'sleek'
      };
    case ChassisType.TANK:
      return {
        mainSize: [1.8, 1.2, 1.6],
        thrusterCount: 2,
        style: 'heavy'
      };
    case ChassisType.BALANCED:
    default:
      return {
        mainSize: [1.4, 0.8, 1.4],
        thrusterCount: 3,
        style: 'balanced'
      };
  }
}

function getPersonalityChassisModifier(trait: PersonalityTrait) {
  switch (trait) {
    case PersonalityTrait.AGGRESSIVE:
      return {
        sizeMultiplier: [1.1, 1.0, 1.1],
        thrusterDelta: 1,
        styleOverride: null
      };
    case PersonalityTrait.TACTICAL:
      return {
        sizeMultiplier: [0.95, 1.1, 0.95],
        thrusterDelta: 0,
        styleOverride: null
      };
    case PersonalityTrait.PROTECTIVE:
      return {
        sizeMultiplier: [1.0, 1.2, 1.0],
        thrusterDelta: -1,
        styleOverride: 'heavy'
      };
    default:
      return {
        sizeMultiplier: [1.0, 1.0, 1.0],
        thrusterDelta: 0,
        styleOverride: null
      };
  }
}

function getWeaponConfig(weapon: WeaponType, chassisConfig: any) {
  const [, height] = chassisConfig.mainSize;
  switch (weapon) {
    case WeaponType.CANNON:
      return {
        position: [0, height * 0.3, chassisConfig.mainSize[2] * 0.4],
        scale: [0.3, 0.3, 1.2],
        barrels: 1
      };
    case WeaponType.SHOTGUN:
      return {
        position: [0, height * 0.2, chassisConfig.mainSize[2] * 0.3],
        scale: [0.4, 0.25, 0.8],
        barrels: 3
      };
    case WeaponType.BLASTER:
    default:
      return {
        position: [0, height * 0.1, chassisConfig.mainSize[2] * 0.35],
        scale: [0.15, 0.15, 0.7],
        barrels: 2
      };
  }
}

export default EnhancedBot3D;
