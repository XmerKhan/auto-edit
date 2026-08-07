import { Sequence, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import type { TimelineScene, EditSettings, CaptionStyle, CaptionPosition, CaptionFontFamily } from './types';

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const FONT_STACKS: Record<CaptionFontFamily, string> = {
  inter: "'Inter', system-ui, sans-serif",
  'roboto-mono': "'Roboto Mono', monospace",
  georgia: 'Georgia, serif',
  system: 'system-ui, sans-serif',
};

const CaptionText: React.FC<{
  text: string;
  style: CaptionStyle;
  position: CaptionPosition;
  sceneDuration: number;
  settings: EditSettings;
}> = ({ text, style, position, sceneDuration, settings }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cs = settings.captionSettings;

  // Apply timing offset
  const offsetFrames = Math.round(cs.timingOffsetMs / 1000 * fps);
  const adjustedFrame = frame + offsetFrames;
  const progress = sceneDuration > 0 ? adjustedFrame / sceneDuration : 0;

  let opacity = 1;
  let translateX = 0;
  let visibleChars = text.length;

  if (style === 'fade') {
    const fadeIn = Math.min(1, progress * 4);
    const fadeOut = Math.min(1, (1 - progress) * 4);
    opacity = Math.min(easeInOutCubic(fadeIn), easeInOutCubic(fadeOut));
  } else if (style === 'slide') {
    const slideIn = Math.min(1, progress * 3);
    const slideOut = Math.min(1, (1 - progress) * 3);
    opacity = Math.min(easeInOutCubic(slideIn), easeInOutCubic(slideOut));
    translateX =
      (1 - easeInOutCubic(slideIn)) * 60 - (1 - easeInOutCubic(slideOut)) * 60;
  } else if (style === 'typewriter') {
    const typeProgress = Math.min(1, progress * 1.5);
    visibleChars = Math.floor(text.length * typeProgress);
  }

  const fontSize = `${cs.fontSize * 0.06}vh`;
  const padding = `${cs.fontSize * 0.02}vh`;

  let alignItems: string;
  let justifyContent: string;
  if (position === 'lower-third') {
    alignItems = 'flex-end';
    justifyContent = 'center';
  } else if (position === 'top') {
    alignItems = 'flex-start';
    justifyContent = 'center';
  } else {
    alignItems = 'center';
    justifyContent = 'center';
  }

  const displayText = style === 'typewriter' ? text.slice(0, visibleChars) : text;

  const words = displayText.split(' ');
  const wordProgress = style === 'karaoke' ? Math.min(1, progress * 1.2) : 1;
  const activeWord = style === 'karaoke' ? Math.floor(words.length * wordProgress) : -1;

  const isPortrait = settings.aspectRatio === '9:16' || settings.aspectRatio === '4:5';
  const positionPadding = position === 'lower-third'
    ? isPortrait ? '0 8% 22% 8%' : '0 8% 18% 8%'
    : position === 'top'
      ? isPortrait ? '14% 8% 0 8%' : '12% 8% 0 8%'
      : '0 8%';

  const textShadow = cs.outline
    ? `2px 2px 0 ${cs.outlineColor}, -2px -2px 0 ${cs.outlineColor}, 2px -2px 0 ${cs.outlineColor}, -2px 2px 0 ${cs.outlineColor}`
    : '0 2px 4px rgba(0,0,0,0.5)';

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems,
        justifyContent,
        padding: positionPadding,
      }}
    >
      <div
        style={{
          backgroundColor: cs.backgroundPill ? 'rgba(0,0,0,0.55)' : 'transparent',
          padding: cs.backgroundPill ? `${padding} ${fontSize}` : 0,
          borderRadius: '0.4vh',
          maxWidth: '84%',
          opacity,
          transform: `translateX(${translateX}px)`,
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily: FONT_STACKS[cs.fontFamily],
            fontWeight: 600,
            fontSize,
            lineHeight: 1.3,
            textAlign: 'center',
            color: cs.textColor,
            textShadow,
          }}
        >
          {style === 'karaoke'
            ? words.map((w, i) => (
                <span key={i} style={{ color: i <= activeWord ? cs.karaokeColor : cs.textColor }}>
                  {w}{' '}
                </span>
              ))
            : displayText}
        </p>
      </div>
    </div>
  );
};

export const Caption: React.FC<{
  scene: TimelineScene;
  settings: EditSettings;
}> = ({ scene, settings }) => {
  if (!scene.text || settings.captionStyle === 'none') return null;

  return (
    <Sequence from={0} durationInFrames={scene.durationFrames}>
      <CaptionText
        text={scene.text}
        style={settings.captionStyle}
        position={settings.captionPosition}
        sceneDuration={scene.durationFrames}
        settings={settings}
      />
    </Sequence>
  );
};
