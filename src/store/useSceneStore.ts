import { nanoid } from 'nanoid';
import { create } from 'zustand';

export type VehiclePresetKey =
  | 'ducatoL2H2'
  | 'ducatoL3H2'
  | 'ducatoL4H2'
  | 'ducatoL4H3'
  | 'sprinterL2H2'
  | 'sprinterL3H2'
  | 'custom';

export type ModuleType =
  | 'Bett'
  | 'Kueche'
  | 'Sitzbank'
  | 'Haengeschrank'
  | 'Staubox';

export interface ModuleBlockModel {
  id: string;
  type: ModuleType;
  width: number;
  depth: number;
  height: number;
  x: number;
  y: number;
  z: number;
  rotation: number;
}

export interface VehiclePreset {
  key: VehiclePresetKey;
  name: string;
  length: number;
  width: number;
  height: number;
  rearHeight?: number;
}

export type StylePreset = 'Hell' | 'Grau' | 'Holzdekor';

export interface SceneState {
  vehicle: VehiclePreset;
  useCustomRoom: boolean;
  modules: ModuleBlockModel[];
  selectedModuleId?: string;
  silhouetteVisible: boolean;
  style: StylePreset;
  cameraView: 'links' | 'rechts' | 'hinten' | 'oben';
  exports: Partial<Record<string, string>>;
  setVehicleByKey: (key: VehiclePresetKey) => void;
  setCustomDimensions: (length: number, width: number, height: number, rearHeight?: number) => void;
  toggleSilhouette: () => void;
  setStyle: (style: StylePreset) => void;
  setCameraView: (view: SceneState['cameraView']) => void;
  addModule: (type: ModuleType) => void;
  updateModule: (id: string, patch: Partial<ModuleBlockModel>) => void;
  selectModule: (id?: string) => void;
  deleteModule: (id: string) => void;
  loadProject: (project: Partial<SceneState> & { vehicle?: VehiclePreset }) => void;
  setExports: (view: string, dataUrl: string) => void;
}

export const vehiclePresets: Record<Exclude<VehiclePresetKey, 'custom'>, VehiclePreset> = {
  ducatoL2H2: {
    key: 'ducatoL2H2',
    name: 'Fiat Ducato L2H2',
    length: 3120,
    width: 1870,
    height: 1930,
  },
  ducatoL3H2: {
    key: 'ducatoL3H2',
    name: 'Fiat Ducato L3H2',
    length: 3705,
    width: 1870,
    height: 1930,
  },
  ducatoL4H2: {
    key: 'ducatoL4H2',
    name: 'Fiat Ducato L4H2',
    length: 4070,
    width: 1870,
    height: 1930,
  },
  ducatoL4H3: {
    key: 'ducatoL4H3',
    name: 'Fiat Ducato L4H3',
    length: 4070,
    width: 1870,
    height: 2170,
    rearHeight: 2050,
  },
  sprinterL2H2: {
    key: 'sprinterL2H2',
    name: 'Mercedes Sprinter L2H2',
    length: 3270,
    width: 1787,
    height: 1920,
  },
  sprinterL3H2: {
    key: 'sprinterL3H2',
    name: 'Mercedes Sprinter L3H2',
    length: 4307,
    width: 1787,
    height: 1920,
  },
};

const defaultModuleSizes: Record<ModuleType, { width: number; depth: number; height: number }> = {
  Bett: { width: 2000, depth: 1400, height: 450 },
  Kueche: { width: 1200, depth: 600, height: 900 },
  Sitzbank: { width: 1000, depth: 600, height: 900 },
  Haengeschrank: { width: 1200, depth: 300, height: 350 },
  Staubox: { width: 600, depth: 600, height: 400 },
};

const clampInside = (value: number, half: number, max: number) => {
  const limit = max / 2 - half;
  return Math.min(Math.max(value, -limit), limit);
};

export const useSceneStore = create<SceneState>((set, get) => ({
  vehicle: vehiclePresets.ducatoL2H2,
  useCustomRoom: false,
  modules: [],
  silhouetteVisible: true,
  style: 'Hell',
  cameraView: 'links',
  exports: {},
  setVehicleByKey: (key) =>
    set((state) => ({
      vehicle: key === 'custom' ? state.vehicle : vehiclePresets[key],
      useCustomRoom: key === 'custom',
    })),
  setCustomDimensions: (length, width, height, rearHeight) =>
    set({
      vehicle: {
        key: 'custom',
        name: 'Custom Raum',
        length,
        width,
        height,
        rearHeight,
      },
      useCustomRoom: true,
    }),
  toggleSilhouette: () => set((state) => ({ silhouetteVisible: !state.silhouetteVisible })),
  setStyle: (style) => set({ style }),
  setCameraView: (view) => set({ cameraView: view }),
  addModule: (type) => {
    const vehicle = get().vehicle;
    const defaults = defaultModuleSizes[type];
    const halfDepth = defaults.depth / 2;
    const clampedZ = clampInside(0, halfDepth, vehicle.width);
    set((state) => ({
      modules: [
        ...state.modules,
        {
          id: nanoid(),
          type,
          width: defaults.width,
          depth: defaults.depth,
          height: defaults.height,
          x: 0,
          y: 0,
          z: clampedZ,
          rotation: 0,
        },
      ],
    }));
  },
  updateModule: (id, patch) => {
    const vehicle = get().vehicle;
    set((state) => ({
      modules: state.modules.map((m) => {
        if (m.id !== id) return m;
        const width = patch.width ?? m.width;
        const depth = patch.depth ?? m.depth;
        const height = patch.height ?? m.height;
        const x = clampInside(patch.x ?? m.x, width / 2, vehicle.length);
        const z = clampInside(patch.z ?? m.z, depth / 2, vehicle.width);
        const y = Math.min(Math.max(patch.y ?? m.y, 0), vehicle.height - height);
        return { ...m, ...patch, x, z, y, width, depth, height };
      }),
    }));
  },
  selectModule: (id) => set({ selectedModuleId: id }),
  deleteModule: (id) =>
    set((state) => ({
      modules: state.modules.filter((m) => m.id !== id),
      selectedModuleId: state.selectedModuleId === id ? undefined : state.selectedModuleId,
    })),
  loadProject: (project) =>
    set((state) => ({
      vehicle: project.vehicle ?? state.vehicle,
      modules: project.modules ?? state.modules,
      silhouetteVisible: project.silhouetteVisible ?? state.silhouetteVisible,
      style: project.style ?? state.style,
      cameraView: project.cameraView ?? state.cameraView,
      useCustomRoom:
        (project.vehicle?.key === 'custom' || project.useCustomRoom) ?? state.useCustomRoom,
      exports: project.exports ?? {},
    })),
  setExports: (view, dataUrl) =>
    set((state) => ({
      exports: { ...state.exports, [view]: dataUrl },
    })),
}));
