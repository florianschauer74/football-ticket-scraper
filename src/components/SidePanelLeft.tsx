import { useEffect, useState } from 'react';
import { useSceneStore, vehiclePresets } from '../store/useSceneStore';

const SidePanelLeft = () => {
  const {
    vehicle,
    setVehicleByKey,
    setCustomDimensions,
    toggleSilhouette,
    silhouetteVisible,
    style,
    setStyle,
  } = useSceneStore();
  const [customDims, setCustomDims] = useState({
    length: vehicle.length,
    width: vehicle.width,
    height: vehicle.height,
    rearHeight: vehicle.rearHeight ?? vehicle.height,
  });

  useEffect(() => {
    if (vehicle.key === 'custom') {
      setCustomDims({
        length: vehicle.length,
        width: vehicle.width,
        height: vehicle.height,
        rearHeight: vehicle.rearHeight ?? vehicle.height,
      });
    }
  }, [vehicle]);

  const handleCustomChange = (key: 'length' | 'width' | 'height' | 'rearHeight', value: number) => {
    const next = { ...customDims, [key]: value };
    setCustomDims(next);
    setCustomDimensions(next.length, next.width, next.height, next.rearHeight);
  };

  return (
    <aside className="flex flex-col gap-3 rounded-lg bg-white p-4 shadow">
      <div>
        <h2 className="text-sm font-semibold text-slate-700">Fahrzeug / Raum</h2>
        <select
          className="mt-2 w-full rounded border border-slate-200 px-3 py-2 text-sm"
          value={vehicle.key}
          onChange={(e) => setVehicleByKey(e.target.value as any)}
        >
          {Object.values(vehiclePresets).map((v) => (
            <option key={v.key} value={v.key}>
              {v.name}
            </option>
          ))}
          <option value="custom">Custom Raum</option>
        </select>
        {vehicle.key === 'custom' && (
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex items-center justify-between gap-2">
              <label className="text-slate-600">Länge (mm)</label>
              <input
                type="number"
                className="w-28 rounded border border-slate-200 px-2 py-1"
                value={customDims.length}
                onChange={(e) => handleCustomChange('length', Number(e.target.value))}
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <label className="text-slate-600">Breite (mm)</label>
              <input
                type="number"
                className="w-28 rounded border border-slate-200 px-2 py-1"
                value={customDims.width}
                onChange={(e) => handleCustomChange('width', Number(e.target.value))}
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <label className="text-slate-600">Höhe (mm)</label>
              <input
                type="number"
                className="w-28 rounded border border-slate-200 px-2 py-1"
                value={customDims.height}
                onChange={(e) => handleCustomChange('height', Number(e.target.value))}
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <label className="text-slate-600">Heckhöhe (optional)</label>
              <input
                type="number"
                className="w-28 rounded border border-slate-200 px-2 py-1"
                value={customDims.rearHeight}
                onChange={(e) => handleCustomChange('rearHeight', Number(e.target.value))}
              />
            </div>
          </div>
        )}
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-700">Anzeige</h3>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={silhouetteVisible} onChange={toggleSilhouette} />
          Mensch Silhouette (1,80 m)
        </label>
        <div>
          <p className="text-sm font-semibold text-slate-700">Farbwelt</p>
          <div className="mt-1 flex flex-wrap gap-2 text-sm">
            {(['Hell', 'Grau', 'Holzdekor'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStyle(s)}
                className={`rounded border px-3 py-1 ${style === s ? 'border-sky-600 bg-sky-100' : 'border-slate-200 bg-slate-50'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-slate-700">Hinweise</h3>
        <ul className="mt-1 list-disc space-y-1 pl-5 text-xs text-slate-600">
          <li>Fokus auf Proportionen, keine Kollisionserkennung.</li>
          <li>Module bleiben innerhalb der Innenmaße.</li>
          <li>Exportiere jede Ansicht als PNG für das Angebot.</li>
        </ul>
      </div>
    </aside>
  );
};

export default SidePanelLeft;
