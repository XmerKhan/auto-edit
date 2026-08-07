import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { TimelineData, EditSettings } from '../remotion/types.js';
import { createJob, updateJob, getJob, getOutputDir } from './jobs.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let bundlePromise: Promise<string> | null = null;

async function getBundle(): Promise<string> {
  if (!bundlePromise) {
    const entryPoint = join(__dirname, '..', 'remotion', 'Root.ts');
    bundlePromise = bundle({
      entryPoint,
      onProgress: (progress) => {
        if (progress === 1) {
          console.log('[bundler] Bundle complete');
        }
      },
    });
  }
  return bundlePromise;
}

export async function startRender(
  timeline: TimelineData,
  settings: EditSettings,
): Promise<string> {
  const job = createJob();
  const jobId = job.id;

  (async () => {
    try {
      updateJob(jobId, { status: 'rendering', progress: 0, message: 'Bundling composition...' });

      const serveUrl = await getBundle();

      updateJob(jobId, { message: 'Selecting composition...' });

      const composition = await selectComposition({
        serveUrl,
        id: 'autocut-video',
        inputProps: { timeline, settings },
      });

      const videoBitrate =
        settings.exportResolution === '4k'
          ? 20_000_000
          : settings.exportResolution === '1080p'
            ? 8_000_000
            : 4_000_000;

      const outputPath = join(getOutputDir(), `${jobId}.mp4`);

      updateJob(jobId, { message: 'Rendering frames...' });

      await renderMedia({
        composition,
        serveUrl,
        codec: 'h264',
        outputLocation: outputPath,
        audioCodec: 'aac',
        audioBitrate: 128_000,
        videoBitrate,
        onProgress: ({ progress }) => {
          const pct = Math.round(progress * 100);
          updateJob(jobId, {
            progress: pct,
            message: `Rendering frame... ${pct}%`,
          });
        },
      });

      updateJob(jobId, {
        status: 'done',
        progress: 100,
        message: 'Render complete',
        outputPath,
        completedAt: Date.now(),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown render error';
      console.error(`[render] Job ${jobId} failed:`, message);
      updateJob(jobId, {
        status: 'failed',
        error: message,
        message: `Render failed: ${message}`,
        completedAt: Date.now(),
      });
    }
  })();

  return jobId;
}

export { getJob };
