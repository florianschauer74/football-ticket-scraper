import { MeshProps } from '@react-three/fiber';
import { useMemo } from 'react';
import { ModuleBlockModel, useSceneStore } from '../../store/useSceneStore';

interface ModuleBlockProps extends MeshProps {
  module: ModuleBlockModel;
}

const moduleColors: Record<ModuleBlockModel['type'], string> = {
  Bett: '#f59e0b',
  Kueche: '#0ea5e9',
  Sitzbank: '#22c55e',
  Haengeschrank: '#a855f7',
  Staubox: '#f97316',
};

const ModuleBlock = ({ module }: ModuleBlockProps) => {
  const { selectModule, selectedModuleId } = useSceneStore();
  const { width, depth, height, x, y, z } = module;

  const color = useMemo(() => moduleColors[module.type], [module.type]);
  const isSelected = selectedModuleId === module.id;

  return (
    <group
      position={[x / 1000, height / 2000 + y / 1000, z / 1000]}
      rotation={[0, (module.rotation * Math.PI) / 180, 0]}
      onClick={(e) => {
        e.stopPropagation();
        selectModule(module.id);
      }}
    >
      <mesh>
        <boxGeometry args={[width / 1000, height / 1000, depth / 1000]} />
        <meshStandardMaterial color={color} opacity={0.9} transparent />
      </mesh>
      {isSelected && (
        <mesh>
          <boxGeometry args={[width / 1000 + 0.01, height / 1000 + 0.01, depth / 1000 + 0.01]} />
          <meshBasicMaterial color="#0ea5e9" wireframe />
        </mesh>
      )}
    </group>
  );
};

export default ModuleBlock;
