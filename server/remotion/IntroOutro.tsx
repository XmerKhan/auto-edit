import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import type { IntroOutroStyle } from './types';

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export const IntroOutro: React.FC<{
  text: string;
  subtitle?: string;
  isIntro: boolean;
  style?: IntroOutroStyle;
}> = ({ text, subtitle, isIntro, style = 'fade' }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const progress = durationInFrames > 0 ? frame / durationInFrames : 0;

  const fadeIn = Math.min(1, progress * 3);
  const fadeOut = Math.min(1, (1 - progress) * 3);
  const baseAlpha = Math.min(easeInOutCubic(fadeIn), easeInOutCubic(fadeOut));

  let opacity = baseAlpha;
  let transform = '';
  let clipPath = 'none';

  switch (style) {
    case 'slide-up': {
      const slideY = (1 - easeInOutCubic(fadeIn)) * 60;
      transform = `translateY(${slideY}px)`;
      break;
    }
    case 'typewriter': {
      const typeProgress = Math.min(1, progress * 1.5);
      const visibleChars = Math.floor(text.length * typeProgress);
      const displayText = text.slice(0, visibleChars);
      return (
        <Card
          text={displayText}
          subtitle={subtitle}
          isIntro={isIntro}
          opacity={opacity}
          transform={transform}
        />
      );
    }
    case 'zoom': {
      const scale = interpolate(fadeIn, [0, 1], [0.7, 1], { extrapolateRight: 'clamp' });
      transform = `scale(${scale})`;
      break;
    }
    case 'reveal': {
      const revealProgress = Math.min(1, progress * 2);
      const clipSize = interpolate(revealProgress, [0, 1], [0, 100]);
      clipPath = `inset(0 ${100 - clipSize}% 0 0)`;
      break;
    }
    case 'fade':
    default:
      break;
  }

  return (
    <Card
      text={text}
      subtitle={subtitle}
      isIntro={isIntro}
      opacity={opacity}
      transform={transform}
      clipPath={clipPath}
    />
  );
};

const Card: React.FC<{
  text: string;
  subtitle?: string;
  isIntro: boolean;
  opacity: number;
  transform: string;
  clipPath?: string;
}> = ({ text, subtitle, isIntro, opacity, transform, clipPath = 'none' }) => {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: '#0a0a0a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity,
        transform,
        clipPath: clipPath === 'none' ? undefined : clipPath,
      }}
    >
      <div
        style={{
          width: '6vh',
          height: '0.4vh',
          backgroundColor: '#fbbf24',
          marginBottom: '2vh',
          borderRadius: '0.2vh',
        }}
      />
      <p
        style={{
          fontFamily: "'Inter', system-ui, sans-serif",
          fontWeight: 700,
          fontSize: '7vh',
          color: '#ffffff',
          margin: 0,
          textAlign: 'center',
          padding: '0 4vh',
        }}
      >
        {text}
      </p>
      {subtitle && (
        <p
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontWeight: 400,
            fontSize: '2.8vh',
            color: '#9ca3af',
            margin: '1.5vh 0 0 0',
            textAlign: 'center',
          }}
        >
          {subtitle}
        </p>
      )}
      {!isIntro && (
        <div
          style={{
            marginTop: '3vh',
            padding: '1vh 3vh',
            backgroundColor: '#fbbf24',
            borderRadius: '0.5vh',
          }}
        >
          <p
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontWeight: 600,
              fontSize: '2.2vh',
              color: '#18181b',
              margin: 0,
            }}
          >
            Subscribe
          </p>
        </div>
      )}
    </div>
  );
};
