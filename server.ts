import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import {
  handleClarify,
  handleGenerateDraft,
  handleCheckAssumptions,
  handleRewriteSelection,
  handleHealth,
} from './api/_shared';

dotenv.config();

const PORT = 3000;
const app = express();
app.use(express.json());

// -------------------------------------------------------------
// API Endpoints
// -------------------------------------------------------------
app.post('/api/clarify', async (req, res) => {
  const result = await handleClarify(req.body);
  res.json(result);
});

app.post('/api/generate-draft', async (req, res) => {
  const result = await handleGenerateDraft(req.body);
  res.json(result);
});

app.post('/api/check-assumptions', async (req, res) => {
  const result = await handleCheckAssumptions(req.body);
  res.json(result);
});

app.post('/api/rewrite-selection', async (req, res) => {
  const result = await handleRewriteSelection(req.body);
  res.json(result);
});

app.get('/api/health', (req, res) => {
  res.json(handleHealth());
});

// -------------------------------------------------------------
// Vite Middleware / Static Asset Serving
// -------------------------------------------------------------
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Between Us] Server running on http://0.0.0.0:${PORT}`);
  });
}

start();
