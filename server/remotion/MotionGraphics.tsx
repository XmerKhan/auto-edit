import { useCurrentFrame, useVideoConfig, interpolate, spring, Sequence } from 'remotion';
import type { TimelineScene, EditSettings, AspectRatio } from './types';
import { MapPin, Calendar } from 'lucide-react';

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const FONT_STACKS: Record<string, string> = {
  inter: "'Inter', system-ui, sans-serif",
  'roboto-mono': "'Roboto Mono', monospace",
  georgia: 'Georgia, serif',
  system: 'system-ui, sans-serif',
};

// Lower-Third: name + role sliding in from left
const LowerThird: React.FC<{ scene: TimelineScene; aspectRatio: AspectRatio }> = ({ scene, aspectRatio }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (!scene.lowerThird) return null;

  const enterProgress = Math.min(1, frame / (fps * 0.5));
  const eased = easeOutCubic(enterProgress);
  const slideX = (1 - eased) * -100;
  const opacity = eased;

  const isPortrait = aspectRatio === '9:16' || aspectRatio === '4:5';
  const bottom = isPortrait ? '28%' : '18%';
  const fontSize = isPortrait ? '3.5vh' : '3vh';
  const roleSize = isPortrait ? '2.2vh' : '1.8vh';

  return (
    <div
      style={{
        position: 'absolute',
        left: '6%',
        bottom,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        opacity,
        transform: `translateX(${slideX}%)`,
      }}
    >
      <div
        style={{
          backgroundColor: 'rgba(251, 191, 36, 0.95)',
          padding: '0.8vh 2vh',
          borderRadius: '0.4vh',
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
        }}
      >
        <p style={{ margin: 0, fontFamily: FONT_STACKS.inter, fontWeight: 700, fontSize, color: '#18181b', lineHeight: 1.2 }}>
          {scene.lowerThird.name}
        </p>
      </div>
      {scene.lowerThird.role && (
        <p style={{ margin: 0, fontFamily: FONT_STACKS.inter, fontWeight: 500, fontSize: roleSize, color: '#e4e4e7', paddingLeft: '0.5vh', textShadow: '0 2px 4px rgba(0,0,0,0.6)' }}>
          {scene.lowerThird.role}
        </p>
      )}
    </div>
  );
};

// Text Callout: bold emphasized text animating onto screen
const TextCallout: React.FC<{ scene: TimelineScene; aspectRatio: AspectRatio }> = ({ scene, aspectRatio }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  if (!scene.callout) return null;

  const enterProgress = Math.min(1, frame / (fps * 0.3));
  const exitStart = durationInFrames - fps * 0.5;
  const exitProgress = frame > exitStart ? Math.min(1, (frame - exitStart) / (fps * 0.3)) : 0;

  const scale = interpolate(enterProgress, [0, 1], [0.6, 1], { extrapolateRight: 'clamp' });
  const opacity = Math.min(enterProgress, 1 - exitProgress);
  const eased = easeOutCubic(enterProgress);

  const isPortrait = aspectRatio === '9:16' || aspectRatio === '4:5';
  const top = isPortrait ? '35%' : '25%';
  const fontSize = isPortrait ? '7vh' : '6vh';

  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: '50%',
        transform: `translateX(-50%) scale(${scale})`,
        opacity,
        textAlign: 'center',
      }}
    >
      <div
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          padding: '1.5vh 3vh',
          borderRadius: '0.6vh',
          border: '2px solid rgba(251, 191, 36, 0.6)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily: FONT_STACKS.inter,
            fontWeight: 800,
            fontSize,
            color: '#fbbf24',
            lineHeight: 1.1,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >
          {scene.callout}
        </p>
      </div>
    </div>
  );
};

// Date Stamp: animated date card
const DateStamp: React.FC<{ scene: TimelineScene; aspectRatio: AspectRatio }> = ({ scene, aspectRatio }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (!scene.date) return null;

  const enterProgress = Math.min(1, frame / (fps * 0.4));
  const eased = easeOutCubic(enterProgress);
  const translateY = (1 - eased) * -20;
  const opacity = eased;

  const isPortrait = aspectRatio === '9:16' || aspectRatio === '4:5';
  const top = isPortrait ? '8%' : '6%';
  const fontSize = isPortrait ? '2.5vh' : '2vh';

  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: '50%',
        transform: `translateX(-50%) translateY(${translateY}px)`,
        opacity,
        display: 'flex',
        alignItems: 'center',
        gap: '0.8vh',
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        padding: '0.6vh 1.5vh',
        borderRadius: '0.4vh',
        backdropFilter: 'blur(8px)',
      }}
    >
      <Calendar size={isPortrait ? 18 : 14} color="#fbbf24" />
      <p style={{ margin: 0, fontFamily: FONT_STACKS.inter, fontWeight: 600, fontSize, color: '#f4f4f5', letterSpacing: '0.08em' }}>
        {scene.date}
      </p>
    </div>
  );
};

// Location Pin: animated map marker
const LocationPin: React.FC<{ scene: TimelineScene; aspectRatio: AspectRatio }> = ({ scene, aspectRatio }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (!scene.location) return null;

  const enterProgress = Math.min(1, frame / (fps * 0.4));
  const bounce = spring({ frame: frame - fps * 0.4, fps, config: { damping: 8, stiffness: 100 } });
  const opacity = enterProgress;

  const isPortrait = aspectRatio === '9:16' || aspectRatio === '4:5';
  const top = isPortrait ? '14%' : '10%';
  const fontSize = isPortrait ? '2.2vh' : '1.8vh';

  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: '50%',
        transform: `translateX(-50%) translateY(${bounce * 0}px)`,
        opacity,
        display: 'flex',
        alignItems: 'center',
        gap: '0.6vh',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        padding: '0.5vh 1.2vh',
        borderRadius: '0.4vh',
      }}
    >
      <MapPin size={isPortrait ? 16 : 14} color="#4ade80" />
      <p style={{ margin: 0, fontFamily: FONT_STACKS.inter, fontWeight: 500, fontSize, color: '#d4d4d8' }}>
        {scene.location}
      </p>
    </div>
  );
};

// Quote Card: full-screen styled quote
const QuoteCard: React.FC<{ scene: TimelineScene; aspectRatio: AspectRatio }> = ({ scene, aspectRatio }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  if (!scene.quote) return null;

  const enterProgress = Math.min(1, frame / (fps * 0.6));
  const exitStart = durationInFrames - fps * 0.6;
  const exitProgress = frame > exitStart ? Math.min(1, (frame - exitStart) / (fps * 0.4)) : 0;

  const opacity = Math.min(easeInOutCubic(enterProgress), 1 - easeInOutCubic(exitProgress));
  const translateY = (1 - easeOutCubic(enterProgress)) * 30;

  const isPortrait = aspectRatio === '9:16' || aspectRatio === '4:5';
  const fontSize = isPortrait ? '5vh' : '4vh';
  const maxWidth = isPortrait ? '80%' : '60%';

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
        }}
      />
      <div style={{ position: 'relative', maxWidth, textAlign: 'center', padding: '0 4vh' }}>
        <p
          style={{
            margin: 0,
            fontFamily: FONT_STACKS.georgia,
            fontWeight: 400,
            fontSize,
            color: '#f4f4f5',
            lineHeight: 1.4,
            fontStyle: 'italic',
          }}
        >
          &ldquo;{scene.quote}&rdquo;
        </p>
        <div
          style={{
            marginTop: '2vh',
            height: 2,
            width: '40%',
            margin: '2vh auto 0',
            background: 'linear-gradient(90deg, transparent, #fbbf24, transparent)',
          }}
        />
      </div>
    </div>
  );
};

export const MotionGraphics: React.FC<{
  scene: TimelineScene;
  settings: EditSettings;
}> = ({ scene, settings }) => {
  return (
    <>
      <Sequence from={0} durationInFrames={scene.durationFrames}>
        <LowerThird scene={scene} aspectRatio={settings.aspectRatio} />
        <TextCallout scene={scene} aspectRatio={settings.aspectRatio} />
        <DateStamp scene={scene} aspectRatio={settings.aspectRatio} />
        <LocationPin scene={scene} aspectRatio={settings.aspectRatio} />
        <QuoteCard scene={scene} aspectRatio={settings.aspectRatio} />
      </Sequence>
    </>
  );
};
