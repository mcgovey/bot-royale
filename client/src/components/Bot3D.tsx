import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Group } from 'three';
import { ChassisType, WeaponType } from '../types/game';

interface Bot3DProps {
  chassis: ChassisType;
  weapon: WeaponType;
  primaryColor: string;
  secondaryColor: string;
}

const Bot3D: React.FC<Bot3DProps> = ({ chassis, weapon, primaryColor, secondaryColor }) => {
  const groupRef = useRef<Group>(null);
  const coreRef = useRef<Mesh>(null);
  const weaponRef = useRef<Mesh>(null);

  // Subtle floating animation
  useFrame((state: any, delta: number) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }

    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 2;
      coreRef.current.rotation.x += delta * 0.5;
    }

    if (weaponRef.current) {
      weaponRef.current.rotation.z += delta * 0.3;
    }
  });

  // Get chassis configuration based on type
  const chassisConfig = useMemo(() => {
    switch (chassis) {
      case ChassisType.SPEED:
        return {
          mainSize: [1.2, 0.6, 1.8],
          secondarySize: [0.8, 0.4, 1.2],
          thrusterCount: 4,
          thrusterSize: [0.15, 0.15, 0.5],
          style: 'sleek'
        };
      case ChassisType.TANK:
        return {
          mainSize: [1.8, 1.2, 1.6],
          secondarySize: [1.4, 0.8, 1.2],
          thrusterCount: 2,
          thrusterSize: [0.2, 0.2, 0.4],
          style: 'heavy'
        };
      case ChassisType.BALANCED:
      default:
        return {
          mainSize: [1.4, 0.8, 1.4],
          secondarySize: [1.0, 0.6, 1.0],
          thrusterCount: 3,
          thrusterSize: [0.18, 0.18, 0.45],
          style: 'balanced'
        };
    }
  }, [chassis]);

  // Get weapon configuration
  const weaponConfig = useMemo(() => {
    const [, height] = chassisConfig.mainSize;
    switch (weapon) {
      case WeaponType.CANNON:
        return {
          position: [0, height * 0.3, chassisConfig.mainSize[2] * 0.4],
          scale: [0.3, 0.3, 1.2],
          barrels: 1,
          size: 'large'
        };
      case WeaponType.SHOTGUN:
        return {
          position: [0, height * 0.2, chassisConfig.mainSize[2] * 0.3],
          scale: [0.4, 0.25, 0.8],
          barrels: 3,
          size: 'medium'
        };
      case WeaponType.BLASTER:
      default:
        return {
          position: [0, height * 0.1, chassisConfig.mainSize[2] * 0.35],
          scale: [0.15, 0.15, 0.7],
          barrels: 2,
          size: 'small'
        };
    }
  }, [weapon, chassisConfig]);

  const [mainWidth, mainHeight, mainDepth] = chassisConfig.mainSize;
  const [secWidth, secHeight, secDepth] = chassisConfig.secondarySize;

  return (
    <group ref={groupRef}>
      {/* Main Chassis Body */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={chassisConfig.mainSize as [number, number, number]} />
        <meshStandardMaterial
          color={primaryColor}
          metalness={0.9}
          roughness={0.1}
          emissive={primaryColor}
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Secondary Body Layer */}
      <mesh position={[0, secHeight * 0.1, 0]} castShadow>
        <boxGeometry args={chassisConfig.secondarySize as [number, number, number]} />
        <meshStandardMaterial
          color={secondaryColor}
          metalness={0.8}
          roughness={0.15}
          emissive={secondaryColor}
          emissiveIntensity={0.15}
        />
      </mesh>

      {/* Glowing Core */}
      <mesh ref={coreRef} position={[0, mainHeight * 0.2, 0]}>
        <icosahedronGeometry args={[0.25, 2]} />
        <meshStandardMaterial
          color={primaryColor}
          emissive={primaryColor}
          emissiveIntensity={1.0}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Core Ring */}
      <mesh position={[0, mainHeight * 0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.4, 0.08, 8, 16]} />
        <meshStandardMaterial
          color={secondaryColor}
          emissive={secondaryColor}
          emissiveIntensity={0.8}
          metalness={1.0}
          roughness={0.0}
        />
      </mesh>

      {/* Head/Cockpit */}
      <mesh position={[0, mainHeight * 0.7, mainDepth * 0.1]} castShadow>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial
          color={primaryColor}
          metalness={0.95}
          roughness={0.05}
          emissive={primaryColor}
          emissiveIntensity={0.3}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Sensor Arrays */}
      {[-0.3, 0.3].map((x, i) => (
        <mesh key={`sensor-${i}`} position={[x, mainHeight * 0.8, mainDepth * 0.3]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.2, 8]} />
          <meshStandardMaterial
            color="#00ffff"
            emissive="#00ffff"
            emissiveIntensity={1.5}
            metalness={1.0}
            roughness={0.0}
          />
        </mesh>
      ))}

      {/* Weapon System */}
      <group position={weaponConfig.position as [number, number, number]}>
        {Array.from({ length: weaponConfig.barrels }, (_, i) => {
          const angle = (i / weaponConfig.barrels) * Math.PI * 2;
          const radius = weaponConfig.barrels > 1 ? 0.15 : 0;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          return (
            <mesh
              key={`barrel-${i}`}
              ref={i === 0 ? weaponRef : undefined}
              position={[x, y, 0]}
              castShadow
            >
              <cylinderGeometry args={[0.08, 0.12, weaponConfig.scale[2] as number, 12]} />
              <meshStandardMaterial
                color={secondaryColor}
                metalness={0.95}
                roughness={0.05}
                emissive={secondaryColor}
                emissiveIntensity={0.2}
              />
            </mesh>
          );
        })}

        {/* Weapon Base */}
        <mesh position={[0, 0, -weaponConfig.scale[2] * 0.3]} castShadow>
          <cylinderGeometry args={[0.2, 0.15, 0.3, 8]} />
          <meshStandardMaterial
            color={primaryColor}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>

        {/* Muzzle Effects */}
        {Array.from({ length: weaponConfig.barrels }, (_, i) => {
          const angle = (i / weaponConfig.barrels) * Math.PI * 2;
          const radius = weaponConfig.barrels > 1 ? 0.15 : 0;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          return (
            <mesh key={`muzzle-${i}`} position={[x, y, weaponConfig.scale[2] * 0.5]}>
              <ringGeometry args={[0.08, 0.12, 8]} />
              <meshStandardMaterial
                color="#ffaa00"
                emissive="#ffaa00"
                emissiveIntensity={0.8}
                transparent
                opacity={0.7}
              />
            </mesh>
          );
        })}
      </group>

      {/* Thruster Systems */}
      {Array.from({ length: chassisConfig.thrusterCount }, (_, i) => {
        const angle = (i / chassisConfig.thrusterCount) * Math.PI * 2;
        const radius = Math.max(mainWidth, mainDepth) * 0.4;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        return (
          <group key={`thruster-${i}`} position={[x, -mainHeight * 0.2, z]}>
            {/* Thruster Housing */}
            <mesh castShadow>
              <cylinderGeometry args={chassisConfig.thrusterSize as [number, number, number]} />
              <meshStandardMaterial
                color={secondaryColor}
                metalness={0.8}
                roughness={0.2}
              />
            </mesh>

            {/* Thruster Glow */}
            <mesh position={[0, -chassisConfig.thrusterSize[1] * 0.6, 0]}>
              <cylinderGeometry args={[chassisConfig.thrusterSize[0] * 0.8, chassisConfig.thrusterSize[0] * 0.6, 0.2, 8]} />
              <meshStandardMaterial
                color="#00aaff"
                emissive="#00aaff"
                emissiveIntensity={1.2}
                transparent
                opacity={0.8}
              />
            </mesh>
          </group>
        );
      })}

      {/* Armor Plating Details */}
      {chassisConfig.style === 'heavy' && (
        <>
          {/* Front Armor */}
          <mesh position={[0, 0, mainDepth * 0.52]} castShadow>
            <boxGeometry args={[mainWidth * 0.8, mainHeight * 0.6, 0.1]} />
            <meshStandardMaterial
              color={secondaryColor}
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>

          {/* Side Armor */}
          {[-1, 1].map((side, i) => (
            <mesh key={`armor-${i}`} position={[side * mainWidth * 0.52, 0, 0]} castShadow>
              <boxGeometry args={[0.1, mainHeight * 0.8, mainDepth * 0.8]} />
              <meshStandardMaterial
                color={secondaryColor}
                metalness={0.9}
                roughness={0.1}
              />
            </mesh>
          ))}
        </>
      )}

      {/* Speed Fins */}
      {chassisConfig.style === 'sleek' && (
        <>
          {[-1, 1].map((side, i) => (
            <mesh
              key={`fin-${i}`}
              position={[side * mainWidth * 0.6, mainHeight * 0.2, -mainDepth * 0.3]}
              rotation={[0, side * 0.3, side * 0.2]}
              castShadow
            >
              <coneGeometry args={[0.1, 0.8, 4]} />
              <meshStandardMaterial
                color={primaryColor}
                metalness={0.95}
                roughness={0.05}
                emissive={primaryColor}
                emissiveIntensity={0.3}
              />
            </mesh>
          ))}
        </>
      )}

      {/* Energy Field Effect */}
      <mesh position={[0, 0, 0]} scale={[1.1, 1.1, 1.1]}>
        <boxGeometry args={chassisConfig.mainSize as [number, number, number]} />
        <meshStandardMaterial
          color={primaryColor}
          transparent
          opacity={0.1}
          emissive={primaryColor}
          emissiveIntensity={0.5}
          wireframe
        />
      </mesh>
    </group>
  );
};

export default Bot3D;
