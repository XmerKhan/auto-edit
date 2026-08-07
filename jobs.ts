import { randomUUID } from 'crypto';
import { mkdirSync, rmSync, existsSync } from 'fs';
import { join } from 'path';

export type JobStatus = 'queued' | 'rendering' | 'done' | 'failed';

export interface RenderJob {
  id: string;
  status: JobStatus;
  progress: number;
  message: string;
  outputPath: string | null;
  error: string | null;
  createdAt: number;
  completedAt: number | null;
}

const JOBS = new Map<string, RenderJob>();
const OUTPUT_DIR = join(process.cwd(), 'output');
const UPLOAD_DIR = join(process.cwd(), 'uploads');

mkdirSync(OUTPUT_DIR, { recursive: true });
mkdirSync(UPLOAD_DIR, { recursive: true });

export function createJob(): RenderJob {
  const id = randomUUID();
  const job: RenderJob = {
    id,
    status: 'queued',
    progress: 0,
    message: 'Queued',
    outputPath: null,
    error: null,
    createdAt: Date.now(),
    completedAt: null,
  };
  JOBS.set(id, job);
  return job;
}

export function getJob(id: string): RenderJob | undefined {
  return JOBS.get(id);
}

export function updateJob(id: string, updates: Partial<RenderJob>): void {
  const job = JOBS.get(id);
  if (!job) return;
  Object.assign(job, updates);
}

export function getOutputDir(): string {
  return OUTPUT_DIR;
}

export function getUploadDir(): string {
  return UPLOAD_DIR;
}

export function cleanupOldJobs(): void {
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  for (const [id, job] of JOBS) {
    if (job.completedAt && job.completedAt < oneHourAgo) {
      if (job.outputPath && existsSync(job.outputPath)) {
        try {
          rmSync(job.outputPath);
        } catch {
          // ignore
        }
      }
      JOBS.delete(id);
    }
  }
}

setInterval(cleanupOldJobs, 10 * 60 * 1000);
