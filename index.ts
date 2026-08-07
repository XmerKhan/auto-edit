import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { randomUUID } from 'crypto';
import { join, extname } from 'path';
import { existsSync } from 'fs';
import type { Request } from 'express';
import { startRender, getJob } from './renderer.js';
import { getUploadDir, getOutputDir } from './jobs.js';
import type { TimelineData, EditSettings } from '../remotion/types.js';

const app = express();

const allowedOrigin = process.env.ALLOWED_ORIGIN ?? '*';
app.use(
  cors({
    origin: allowedOrigin === '*' ? true : allowedOrigin.split(','),
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);
app.use(express.json({ limit: '100mb' }));

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, getUploadDir()),
    filename: (_req, file, cb) => {
      const id = randomUUID();
      const ext = extname(file.originalname);
      cb(null, `${id}${ext}`);
    },
  }),
  limits: { fileSize: 500 * 1024 * 1024 },
});

interface RenderRequestBody {
  timeline: TimelineData;
  settings: EditSettings;
}

app.post('/api/upload', upload.array('files', 20), (req: Request, res) => {
  const files = req.files as Express.Multer.File[] | undefined;
  if (!files || files.length === 0) {
    res.status(400).json({ error: 'No files uploaded' });
    return;
  }

  const uploaded = files.map((f) => ({
    id: f.filename.replace(extname(f.filename), ''),
    filename: f.filename,
    originalName: f.originalname,
    path: `/api/uploads/${f.filename}`,
  }));

  res.json({ files: uploaded });
});

app.use('/api/uploads', express.static(getUploadDir()));

app.post('/api/render', async (req: Request, res) => {
  try {
    const { timeline, settings } = req.body as RenderRequestBody;

    if (!timeline || !timeline.scenes || timeline.scenes.length === 0) {
      res.status(400).json({ error: 'Timeline with scenes is required' });
      return;
    }
    if (!settings) {
      res.status(400).json({ error: 'Settings are required' });
      return;
    }

    const jobId = await startRender(timeline, settings);
    res.json({ jobId });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to start render';
    console.error('[api/render]', message);
    res.status(500).json({ error: message });
  }
});

app.get('/api/render/:jobId/status', (req: Request, res) => {
  const job = getJob(req.params.jobId);
  if (!job) {
    res.status(404).json({ error: 'Job not found' });
    return;
  }
  res.json({
    jobId: job.id,
    status: job.status,
    progress: job.progress,
    message: job.message,
    error: job.error,
  });
});

app.get('/api/render/:jobId/download', (req: Request, res) => {
  const job = getJob(req.params.jobId);
  if (!job) {
    res.status(404).json({ error: 'Job not found' });
    return;
  }
  if (job.status !== 'done' || !job.outputPath || !existsSync(job.outputPath)) {
    res.status(404).json({ error: 'Render not complete or file missing' });
    return;
  }
  res.download(job.outputPath, `autocut-${job.id}.mp4`);
});

app.get('/api/health', (_req: Request, res) => {
  res.json({ status: 'ok' });
});

const PORT = parseInt(process.env.PORT ?? '3001', 10);
app.listen(PORT, () => {
  console.log(`AutoCut render server listening on port ${PORT}`);
});
