import { useMemo } from 'react';

interface SilhouetteProps {
  vehicleHeight: number;
}

const Silhouette = ({ vehicleHeight }: SilhouetteProps) => {
  const bodyHeight = 1.8;
  const headRadius = 0.12;
  const torsoHeight = bodyHeight - headRadius * 2;
  const color = useMemo(() => 'rgba(59,130,246,0.35)', []);

  return (
    <group position={[0.6, torsoHeight / 2, 0]}>
      <mesh position={[0, torsoHeight / 2 + headRadius, 0]}>
        <sphereGeometry args={[headRadius, 16, 16]} />
        <meshStandardMaterial transparent opacity={0.6} color={color} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[0.18, 0.2, torsoHeight, 16]} />
        <meshStandardMaterial transparent opacity={0.4} color={color} />
      </mesh>
      <mesh position={[0, -torsoHeight / 2, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.6, 12]} />
        <meshStandardMaterial transparent opacity={0.3} color={color} />
      </mesh>
    </group>
  );
};

export default Silhouette;
