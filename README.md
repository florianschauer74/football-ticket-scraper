# BF Ausbau – 3D Camper Layout Tool

Ein schlankes React/Three.js-Tool zum Erstellen proportionaler Ausbau-Skizzen für Kastenwagen. Fokus: schnelle Visualisierung, vier feste Kamerawinkel, einfache Module und Export als PNG.

## Schnellstart

```bash
npm install
npm start
```

`npm start` startet die Express-API (Port 4000) und die Vite-Entwicklungsoberfläche (Port 5173) parallel. Öffne anschließend http://localhost:5173.

## Kernfunktionen
- Fahrzeug-Presets (Ducato/Sprinter) oder Custom-Raummaße
- Einfache Module: Bett, Küchenblock, Sitzbank, Hängeschrank, Staubox
- Maße, Position, Rotation editierbar; Raster-Snapping (50 mm default)
- Mensch-Silhouette (1,80 m) ein-/ausblendbar
- Vier feste Ansichten: links/rechts/hinten/oben und Export als PNG
- Projekte als JSON via Express-API speichern/laden (`data/projects.json`)

## Struktur
- `src/components/VehicleRoom.tsx` – 3D Szene, Kameraführung, Export
- `src/components/SidePanelLeft.tsx` – Fahrzeug, Farbe, Silhouette
- `src/components/SidePanelRight.tsx` – Module hinzufügen/bearbeiten, Exporte
- `src/store/useSceneStore.ts` – Zustand mit Fahrzeug, Modulen, Ansichten
- `server/index.js` – einfache API für Projekte (JSON-Datei)

## Hinweise
- Alle Maße in Millimetern; intern wird in Meter skaliert.
- Keine Kollisionserkennung, Module werden beim Ändern auf den Innenraum geklemmt.
- PNG-Exporte erscheinen als Vorschau rechts und können aus dem Browser gespeichert werden.
