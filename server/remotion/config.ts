import type { TimelineData, EditSettings, AspectRatio } from './types';

export const RESOLUTIONS: Record<string, { width: number; height: number }> = {
  '720p': { width: 1280, height: 720 },
  '1080p': { width: 1920, height: 1080 },
  '4k': { width: 3840, height: 2160 },
};

export const ASPECT_RATIOS: Record<
  AspectRatio,
  { width: number; height: number; label: string; desc: string }
> = {
  '16:9': { width: 1920, height: 1080, label: '16:9', desc: 'YouTube long-form' },
  '9:16': { width: 1080, height: 1920, label: '9:16', desc: 'Shorts / Reels / TikTok' },
  '1:1': { width: 1080, height: 1080, label: '1:1', desc: 'Square / Feed' },
  '4:5': { width: 1080, height: 1350, label: '4:5', desc: 'Instagram Portrait' },
};

export interface CompositionProps {
  timeline: TimelineData;
  settings: EditSettings;
}

export function getCompositionConfig(
  timeline: TimelineData,
  settings: EditSettings,
) {
  const ar = ASPECT_RATIOS[settings.aspectRatio];
  const fps = timeline.fps;
  const introFrames = settings.showIntro ? Math.round(3 * fps) : 0;
  const outroFrames = settings.showOutro ? Math.round(3 * fps) : 0;
  const durationInFrames =
    timeline.totalFrames + introFrames + outroFrames;

  return {
    width: ar.width,
    height: ar.height,
    fps,
    durationInFrames: Math.max(1, durationInFrames),
  };
}
