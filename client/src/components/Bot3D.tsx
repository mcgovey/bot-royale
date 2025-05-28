import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
import { ChassisType, WeaponType } from '../types/game';

interface Bot3DProps {
  chassis: ChassisType;
  weapon: WeaponType;
  primaryColor: string;
  secondaryColor: string;
}

const Bot3D: React.FC<Bot3DProps> = ({ chassis, weapon, primaryColor, secondaryColor }) => {
  const meshRef = useRef<Mesh>(null);

  // Rotate the bot slowly
  useFrame((state: any, delta: number) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  // Get chassis dimensions based on type
  const getChassisSize = () => {
    switch (chassis) {
      case ChassisType.SPEED:
        return [0.8, 0.6, 1.2]; // Sleek and narrow
      case ChassisType.TANK:
        return [1.4, 1.0, 1.4]; // Wide and bulky
      case ChassisType.BALANCED:
      default:
        return [1.0, 0.8, 1.0]; // Balanced proportions
    }
  };

  // Get weapon position and size
  const getWeaponProps = () => {
    const [, height, depth] = getChassisSize();
    switch (weapon) {
      case WeaponType.CANNON:
        return {
          position: [0, height * 0.3, depth * 0.6] as [number, number, number],
          scale: [0.2, 0.2, 0.8] as [number, number, number]
        };
      case WeaponType.SHOTGUN:
        return {
          position: [0, height * 0.2, depth * 0.5] as [number, number, number],
          scale: [0.15, 0.15, 0.6] as [number, number, number]
        };
      case WeaponType.BLASTER:
      default:
        return {
          position: [0, height * 0.1, depth * 0.4] as [number, number, number],
          scale: [0.1, 0.1, 0.5] as [number, number, number]
        };
    }
  };

  const [chassisWidth, chassisHeight, chassisDepth] = getChassisSize();
  const weaponProps = getWeaponProps();

  return (
    <group ref={meshRef}>
      {/* Main Chassis */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[chassisWidth, chassisHeight, chassisDepth]} />
        <meshStandardMaterial
          color={primaryColor}
          metalness={0.8}
          roughness={0.2}
          emissive={primaryColor}
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* Weapon */}
      <mesh position={weaponProps.position} scale={weaponProps.scale}>
        <cylinderGeometry args={[0.1, 0.1, 1, 8]} />
        <meshStandardMaterial
          color={secondaryColor}
          metalness={0.9}
          roughness={0.1}
          emissive={secondaryColor}
          emissiveIntensity={0.05}
        />
      </mesh>

      {/* Chassis Details */}
      <mesh position={[0, chassisHeight * 0.6, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial
          color={secondaryColor}
          metalness={0.7}
          roughness={0.3}
          emissive={secondaryColor}
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* Side Thrusters/Details */}
      <mesh position={[-chassisWidth * 0.6, 0, -chassisDepth * 0.3]}>
        <cylinderGeometry args={[0.1, 0.1, 0.4, 6]} />
        <meshStandardMaterial
          color={primaryColor}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      <mesh position={[chassisWidth * 0.6, 0, -chassisDepth * 0.3]}>
        <cylinderGeometry args={[0.1, 0.1, 0.4, 6]} />
        <meshStandardMaterial
          color={primaryColor}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Glowing Core */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial
          color={primaryColor}
          emissive={primaryColor}
          emissiveIntensity={0.5}
          transparent
          opacity={0.8}
        />
      </mesh>
    </group>
  );
};

export default Bot3D;
