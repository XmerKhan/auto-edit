import { registerRoot, Composition } from 'remotion';
import { VideoComposition } from './VideoComposition';
import type { TimelineData, EditSettings } from './types';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="autocut-video"
      component={VideoComposition}
      durationInFrames={1}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{
        timeline: {
          scenes: [],
          totalFrames: 1,
          totalDurationSec: 0,
          fps: 30,
          voiceoverUrl: null,
          voiceoverDurationSec: 0,
          musicUrl: null,
          settings: {} as EditSettings,
        },
        settings: {} as EditSettings,
      }}
      calculateMetadata={({ props }) => {
        const { timeline, settings } = props as { timeline: TimelineData; settings: EditSettings };
        const introFrames = settings.showIntro ? Math.round(3 * timeline.fps) : 0;
        const outroFrames = settings.showOutro ? Math.round(3 * timeline.fps) : 0;
        const durationInFrames = Math.max(1, timeline.totalFrames + introFrames + outroFrames);

        const ar = settings.aspectRatio;
        const ratios: Record<string, { width: number; height: number }> = {
          '16:9': { width: 1920, height: 1080 },
          '9:16': { width: 1080, height: 1920 },
          '1:1': { width: 1080, height: 1080 },
          '4:5': { width: 1080, height: 1350 },
        };
        const { width, height } = ratios[ar] ?? ratios['16:9'];

        return {
          durationInFrames,
          fps: timeline.fps,
          width,
          height,
        };
      }}
    />
  );
};

registerRoot(RemotionRoot);
