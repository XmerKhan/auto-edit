import { useCurrentFrame, Img } from 'remotion';
import { Video } from '@remotion/media';
import type { TimelineScene, EditSettings, ColorGradePreset } from './types';
import { KenBurnsImage } from './KenBurnsImage';
import { Caption } from './Caption';
import { MotionGraphics } from './MotionGraphics';

const COLOR_GRADES: Record<ColorGradePreset, {
  contrast: number;
  saturation: number;
  brightness: number;
  sepia: number;
  hueRotate: number;
  vignette: number;
}> = {
  none: { contrast: 1, saturation: 1, brightness: 1, sepia: 0, hueRotate: 0, vignette: 0 },
  cinematic: { contrast: 1.15, saturation: 1.1, brightness: 0.95, sepia: 0, hueRotate: 0, vignette: 0.4 },
  warm: { contrast: 1.05, saturation: 1.2, brightness: 1.03, sepia: 0.15, hueRotate: 0, vignette: 0.2 },
  cool: { contrast: 1.1, saturation: 0.95, brightness: 0.98, sepia: 0, hueRotate: 200, vignette: 0.25 },
  vintage: { contrast: 1.1, saturation: 0.8, brightness: 1.05, sepia: 0.3, hueRotate: 0, vignette: 0.35 },
  vivid: { contrast: 1.2, saturation: 1.35, brightness: 1.02, sepia: 0, hueRotate: 0, vignette: 0.15 },
};

const Vignette: React.FC<{ intensity: number }> = ({ intensity }) => {
  if (intensity <= 0) return null;
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: `radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,${intensity}) 75%)`,
        pointerEvents: 'none',
      }}
    />
  );
};

const FilmGrain: React.FC<{ amount: number }> = ({ amount }) => {
  const frame = useCurrentFrame();
  if (amount <= 0) return null;

  const noise = ((frame * 37 + 13) % 100) / 100;
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        opacity: amount * 0.25,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='${0.5 + noise * 0.5}' /%3E%3C/svg%3E")`,
        pointerEvents: 'none',
        mixBlendMode: 'overlay',
      }}
    />
  );
};

export const SceneComponent: React.FC<{
  scene: TimelineScene;
  settings: EditSettings;
}> = ({ scene, settings }) => {
  const preset = COLOR_GRADES[settings.colorGrade];
  const manual = settings.manualColorGrade;

  const contrast = preset.contrast * manual.contrast;
  const saturation = preset.saturation * manual.saturation;
  const brightness = preset.brightness * manual.brightness;
  const vignette = Math.min(1, preset.vignette + manual.vignette);

  const filterStr = `contrast(${contrast}) saturate(${saturation}) brightness(${brightness}) sepia(${preset.sepia}) hue-rotate(${preset.hueRotate}deg)`;

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', backgroundColor: '#000' }}>
      <div style={{ position: 'absolute', inset: 0, filter: filterStr }}>
        {scene.media.kind === 'image' ? (
          scene.kenBurns.enabled ? (
            <KenBurnsImage scene={scene} />
          ) : (
            <Img
              src={scene.media.url}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )
        ) : (
          <Video
            src={scene.media.url}
            style={{ width: '100%', height: '100%' }}
            objectFit="cover"
            muted
          />
        )}
      </div>
      <Vignette intensity={vignette} />
      <FilmGrain amount={manual.filmGrain} />
      <Caption scene={scene} settings={settings} />
      <MotionGraphics scene={scene} settings={settings} />
    </div>
  );
};
