import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import {
  handleSmartImport,
  handleParseInbox,
  handleSendWeeklyReport,
  handleUpdates,
  handleHealth,
} from './src/server/apiHandlers.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '50mb' }));

// Express API Routes
app.post('/api/smart-import', (req, res) => handleSmartImport(req, res));
app.post('/api/parse-inbox', (req, res) => handleParseInbox(req, res));
app.post('/api/send-weekly-report', (req, res) => handleSendWeeklyReport(req, res));
app.get('/api/updates', (req, res) => handleUpdates(req, res));
app.get('/api/health', (req, res) => handleHealth(req, res));

async function startServer() {
  // Vite middleware for development or static serving in production
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
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
    console.log(`Academicos server running on http://localhost:${PORT}`);
  });
}

startServer();
