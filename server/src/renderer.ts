import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { TimelineData, EditSettings } from '../remotion/types.js';
import { createJob, updateJob, getJob, getOutputDir, getUploadDir } from './jobs.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let bundlePromise: Promise<string> | null = null;

// Converts a public "/api/uploads/<filename>" URL (which forces the render's
// headless browser to make a slow network round-trip back to this same
// server) into a local absolute file path, since the render process and the
// uploaded files live on the same disk.
function toLocalPath(url: string | null | undefined): string | null {
  if (!url) return null;
  const marker = '/api/uploads/';
  const idx = url.indexOf(marker);
  if (idx === -1) return url; // not one of our upload URLs, leave as-is
  const filename = url.slice(idx + marker.length);
  return join(getUploadDir(), filename);
}

function resolveTimelineToLocalPaths(timeline: TimelineData): TimelineData {
  return {
    ...timeline,
    voiceoverUrl: toLocalPath(timeline.voiceoverUrl),
    musicUrl: toLocalPath(timeline.musicUrl),
    scenes: timeline.scenes.map((scene) => ({
      ...scene,
      media: {
        ...scene.media,
        url: toLocalPath(scene.media.url) ?? scene.media.url,
      },
    })),
  };
}

async function getBundle(): Promise<string> {
  if (!bundlePromise) {
    const entryPoint = join(__dirname, '..', '..', 'remotion', 'Root.tsx');
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
  const localTimeline = resolveTimelineToLocalPaths(timeline);

  (async () => {
    try {
      updateJob(jobId, { status: 'rendering', progress: 0, message: 'Bundling composition...' });

      const serveUrl = await getBundle();

      updateJob(jobId, { message: 'Selecting composition...' });

      const composition = await selectComposition({
        serveUrl,
        id: 'autocut-video',
        inputProps: { timeline: localTimeline, settings },
      });

      const videoBitrate =
        settings.exportResolution === '4k'
          ? '20M'
          : settings.exportResolution === '1080p'
            ? '8M'
            : '4M';

      const outputPath = join(getOutputDir(), `${jobId}.mp4`);

      updateJob(jobId, { message: 'Rendering frames...' });

      await renderMedia({
        composition,
        serveUrl,
        codec: 'h264',
        outputLocation: outputPath,
        audioCodec: 'aac',
        audioBitrate: '128k',
        videoBitrate,
        timeoutInMilliseconds: 120000,
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
