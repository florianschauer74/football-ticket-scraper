const express = require('express');
const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '../data/projects.json');

const app = express();
app.use(express.json());

const readProjects = () => {
  try {
    const raw = fs.readFileSync(DATA_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
};

const writeProjects = (projects) => {
  fs.writeFileSync(DATA_PATH, JSON.stringify(projects, null, 2), 'utf-8');
};

app.get('/api/projects', (_req, res) => {
  res.json(readProjects());
});

app.get('/api/projects/:name', (req, res) => {
  const projects = readProjects();
  const found = projects.find((p) => p.name === req.params.name);
  if (!found) return res.status(404).json({ error: 'Not found' });
  res.json(found);
});

app.post('/api/projects', (req, res) => {
  const projects = readProjects();
  const filtered = projects.filter((p) => p.name !== req.body.name);
  filtered.push(req.body);
  writeProjects(filtered);
  res.json({ ok: true });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API läuft auf http://localhost:${PORT}`);
});
