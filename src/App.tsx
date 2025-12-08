import { useEffect, useState } from 'react';
import VehicleRoom from './components/VehicleRoom';
import SidePanelLeft from './components/SidePanelLeft';
import SidePanelRight from './components/SidePanelRight';
import { SceneState, useSceneStore } from './store/useSceneStore';

export interface ExportHandle {
  capture: () => void;
}

function App() {
  const [rendererRef, setRendererRef] = useState<HTMLCanvasElement | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [projects, setProjects] = useState<{ name: string; updatedAt: string }[]>([]);
  const { setExports, cameraView, setCameraView, vehicle, modules } = useSceneStore();

  useEffect(() => {
    fetch('/api/projects')
      .then((res) => res.json())
      .then((data) => setProjects(data))
      .catch(() => setProjects([]));
  }, []);

  const exportView = () => {
    if (!rendererRef) return;
    const url = rendererRef.toDataURL('image/png');
    setExports(cameraView, url);
  };

  const saveProject = async () => {
    const payload = {
      name: customerName || 'Unbenannt',
      updatedAt: new Date().toISOString(),
      vehicle,
      modules,
      cameraView,
      exports: useSceneStore.getState().exports,
      style: useSceneStore.getState().style,
      silhouetteVisible: useSceneStore.getState().silhouetteVisible,
      useCustomRoom: useSceneStore.getState().useCustomRoom,
    } satisfies Partial<SceneState> & { name: string; updatedAt: string };

    await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setProjects((prev) => [{ name: payload.name, updatedAt: payload.updatedAt }, ...prev.filter((p) => p.name !== payload.name)]);
  };

  const loadProject = async (name: string) => {
    const res = await fetch(`/api/projects/${encodeURIComponent(name)}`);
    if (!res.ok) return;
    const data = await res.json();
    useSceneStore.getState().loadProject(data);
    setCameraView(data.cameraView ?? 'links');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="border-b bg-white px-6 py-3 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">BF Ausbau – 3D Camper Layout</h1>
            <p className="text-sm text-slate-500">Schnelle, proportionale Visualisierung für Kundenangebote</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              className="rounded border border-slate-300 px-3 py-1 text-sm shadow-inner"
              placeholder="Kundenname"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
            <button
              onClick={saveProject}
              className="rounded bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700"
            >
              Projekt speichern
            </button>
          </div>
        </div>
      </header>
      <main className="grid grid-cols-[280px,1fr,320px] gap-3 p-4">
        <SidePanelLeft />
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between rounded-lg bg-white p-3 shadow">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-slate-600">Kamera</span>
              {[
                { key: 'links', label: 'Seitenschnitt links' },
                { key: 'rechts', label: 'Seitenschnitt rechts' },
                { key: 'hinten', label: 'Ansicht hinten' },
                { key: 'oben', label: 'Draufsicht' },
              ].map((entry) => (
                <button
                  key={entry.key}
                  onClick={() => setCameraView(entry.key as SceneState['cameraView'])}
                  className={`rounded border px-3 py-1 text-sm ${
                    cameraView === entry.key ? 'border-sky-600 bg-sky-100 text-sky-700' : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  {entry.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={exportView}
                className="rounded bg-sky-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-sky-700"
              >
                Ansicht exportieren
              </button>
            </div>
          </div>
          <div className="h-[640px] rounded-lg bg-white p-2 shadow">
            <VehicleRoom onReady={(canvas) => setRendererRef(canvas)} />
          </div>
          <div className="rounded-lg bg-white p-3 shadow">
            <h3 className="mb-2 text-sm font-semibold">Gespeicherte Projekte</h3>
            <div className="flex flex-wrap gap-2">
              {projects.map((project) => (
                <button
                  key={project.name}
                  onClick={() => loadProject(project.name)}
                  className="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm hover:border-sky-400"
                >
                  <div className="font-semibold">{project.name}</div>
                  <div className="text-xs text-slate-500">{new Date(project.updatedAt).toLocaleDateString()}</div>
                </button>
              ))}
              {!projects.length && <p className="text-sm text-slate-500">Noch keine Projekte gespeichert.</p>}
            </div>
          </div>
        </div>
        <SidePanelRight />
      </main>
    </div>
  );
}

export default App;
