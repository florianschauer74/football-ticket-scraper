import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { ModuleBlockModel, SceneState, useSceneStore } from '../store/useSceneStore';
import ModuleBlock from './blocks/ModuleBlock';
import Silhouette from './blocks/Silhouette';

interface VehicleRoomProps {
  onReady?: (canvas: HTMLCanvasElement, camera: THREE.Camera) => void;
}

const CameraRig = ({ view }: { view: SceneState['cameraView'] }) => {
  const { vehicle } = useSceneStore();
  const { camera } = useThree();
  const length = vehicle.length / 1000;
  const height = vehicle.height / 1000;
  const width = vehicle.width / 1000;

  useEffect(() => {
    const positions: Record<SceneState['cameraView'], [number, number, number]> = {
      links: [0, height * 0.6, -(width * 1.6)],
      rechts: [0, height * 0.6, width * 1.6],
      hinten: [length * 1.2, height * 0.6, 0],
      oben: [0, height * 2.2, 0],
    };
    const pos = positions[view];
    camera.position.set(...pos);
    camera.lookAt(0, height * 0.4, 0);
    camera.updateProjectionMatrix();
  }, [camera, height, length, view, width]);

  return null;
};

const RoomGeometry = ({ modules }: { modules: ModuleBlockModel[] }) => {
  const { vehicle, style, silhouetteVisible } = useSceneStore();
  const length = vehicle.length / 1000;
  const width = vehicle.width / 1000;
  const height = vehicle.height / 1000;

  const wallColor = useMemo(() => {
    switch (style) {
      case 'Grau':
        return '#e2e8f0';
      case 'Holzdekor':
        return '#f3e8d2';
      default:
        return '#f8fafc';
    }
  }, [style]);

  return (
    <group>
      <mesh position={[0, height / 2, 0]} scale={[length, height, width]}>
        <boxGeometry />
        <meshStandardMaterial color={wallColor} transparent opacity={0.2} wireframe />
      </mesh>
      <gridHelper args={[Math.max(length, width) * 1.2, 20, '#94a3b8', '#cbd5e1']} position={[0, 0.001, 0]} />
      {modules.map((m) => (
        <ModuleBlock key={m.id} module={m} />
      ))}
      {silhouetteVisible && <Silhouette vehicleHeight={height} />}
    </group>
  );
};

const SceneContent = ({ onReady, view }: VehicleRoomProps & { view: SceneState['cameraView'] }) => {
  const { gl, camera } = useThree();
  const { modules } = useSceneStore();

  useEffect(() => {
    if (onReady) onReady(gl.domElement, camera);
  }, [camera, gl, onReady]);

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[2, 3, 2]} intensity={0.7} />
      <CameraRig view={view} />
      <RoomGeometry modules={modules} />
    </>
  );
};

const VehicleRoom = ({ onReady }: VehicleRoomProps) => {
  const { vehicle, cameraView } = useSceneStore();
  const width = vehicle.width / 1000;

  return (
    <Canvas shadows camera={{ position: [0, vehicle.height / 1000, width * 1.4], fov: 55 }}>
      <color attach="background" args={[0xf8fafc]} />
      <SceneContent onReady={onReady} view={cameraView} />
      <OrbitControls enablePan enableRotate={false} enableZoom minDistance={1} maxDistance={12} />
    </Canvas>
  );
};

export default VehicleRoom;
