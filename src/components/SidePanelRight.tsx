import { useMemo, useState } from 'react';
import { ModuleBlockModel, ModuleType, useSceneStore } from '../store/useSceneStore';

const moduleLabels: Record<ModuleType, string> = {
  Bett: 'Bett',
  Kueche: 'Küchenblock',
  Sitzbank: 'Sitzbank',
  Haengeschrank: 'Hängeschrank',
  Staubox: 'Stauraum/Technikbox',
};

const numberInput = (
  label: string,
  value: number,
  onChange: (val: number) => void,
  step = 10,
  min = 0
) => (
  <label className="flex items-center justify-between gap-2 text-sm text-slate-700">
    <span>{label}</span>
    <input
      type="number"
      value={value}
      min={min}
      step={step}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-24 rounded border border-slate-200 px-2 py-1"
    />
  </label>
);

const SidePanelRight = () => {
  const { addModule, modules, selectedModuleId, selectModule, updateModule, deleteModule, exports } = useSceneStore();
  const selectedModule = useMemo(() => modules.find((m) => m.id === selectedModuleId), [modules, selectedModuleId]);
  const [snap, setSnap] = useState(50);

  const handlePositionChange = (key: keyof Pick<ModuleBlockModel, 'x' | 'y' | 'z'>, value: number) => {
    if (!selectedModule) return;
    const snapped = Math.round(value / snap) * snap;
    updateModule(selectedModule.id, { [key]: snapped } as Partial<ModuleBlockModel>);
  };

  const handleSizeChange = (key: keyof Pick<ModuleBlockModel, 'width' | 'depth' | 'height'>, value: number) => {
    if (!selectedModule) return;
    updateModule(selectedModule.id, { [key]: value } as Partial<ModuleBlockModel>);
  };

  return (
    <aside className="flex flex-col gap-3 rounded-lg bg-white p-4 shadow">
      <div>
        <h3 className="text-sm font-semibold text-slate-700">Module hinzufügen</h3>
        <div className="mt-2 grid grid-cols-1 gap-2">
          {(Object.keys(moduleLabels) as ModuleType[]).map((type) => (
            <button
              key={type}
              onClick={() => addModule(type)}
              className="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-left text-sm hover:border-sky-500"
            >
              {moduleLabels[type]}
            </button>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-slate-700">Module im Raum</h3>
        <div className="mt-2 space-y-1">
          {modules.map((m) => (
            <button
              key={m.id}
              onClick={() => selectModule(m.id)}
              className={`flex w-full items-center justify-between rounded border px-3 py-2 text-sm ${
                selectedModuleId === m.id ? 'border-sky-500 bg-sky-50' : 'border-slate-200 bg-slate-50'
              }`}
            >
              <span>{moduleLabels[m.type]}</span>
              <span className="text-xs text-slate-500">{Math.round(m.width / 10) / 100} m</span>
            </button>
          ))}
          {!modules.length && <p className="text-sm text-slate-500">Noch keine Module.</p>}
        </div>
      </div>
      {selectedModule && (
        <div className="space-y-2 rounded border border-slate-200 bg-slate-50 p-3 text-sm">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-slate-700">Ausgewählt: {moduleLabels[selectedModule.type]}</h4>
            <button
              onClick={() => deleteModule(selectedModule.id)}
              className="text-sm font-semibold text-red-600 hover:underline"
            >
              Löschen
            </button>
          </div>
          <p className="text-xs text-slate-500">Maße in Millimetern, Position relativ zur Mitte.</p>
          <div className="grid grid-cols-2 gap-2">
            {numberInput('Breite', selectedModule.width, (val) => handleSizeChange('width', val))}
            {numberInput('Tiefe', selectedModule.depth, (val) => handleSizeChange('depth', val))}
            {numberInput('Höhe', selectedModule.height, (val) => handleSizeChange('height', val))}
            {numberInput('X', selectedModule.x, (val) => handlePositionChange('x', val), snap, -9999)}
            {numberInput('Y', selectedModule.y, (val) => handlePositionChange('y', val), snap, 0)}
            {numberInput('Z', selectedModule.z, (val) => handlePositionChange('z', val), snap, -9999)}
            {numberInput('Rotation (°)', selectedModule.rotation, (val) => handleSizeChange('rotation' as any, val), 15)}
          </div>
          <label className="flex items-center justify-between text-sm text-slate-700">
            <span>Raster (mm)</span>
            <input
              type="number"
              className="w-24 rounded border border-slate-200 px-2 py-1"
              value={snap}
              onChange={(e) => setSnap(Number(e.target.value) || 10)}
            />
          </label>
        </div>
      )}
      <div>
        <h3 className="text-sm font-semibold text-slate-700">Export-Vorschauen</h3>
        <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-600">
          {['links', 'rechts', 'hinten', 'oben'].map((view) => (
            <div key={view} className="space-y-1 rounded border border-slate-200 p-2">
              <div className="font-semibold capitalize">{view}</div>
              {exports?.[view] ? (
                <img src={exports[view]} alt={`Export ${view}`} className="h-20 w-full rounded object-cover" />
              ) : (
                <p className="text-[11px] text-slate-500">Noch kein Export</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default SidePanelRight;
