import type { TransitionType } from './types';
import { fade } from '@remotion/transitions/fade';
import { slide } from '@remotion/transitions/slide';
import { wipe } from '@remotion/transitions/wipe';
import { clockWipe } from '@remotion/transitions/clock-wipe';
import { iris } from '@remotion/transitions/iris';
import { linearBlur } from '@remotion/transitions/linear-blur';
import { zoomBlur } from '@remotion/transitions/zoom-blur';
import { pushCut } from '@remotion/transitions/push-cut';
import { dissolve } from '@remotion/transitions/dissolve';
import { linearTiming } from '@remotion/transitions';
import type { TransitionTiming } from '@remotion/transitions';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getTransition(
  type: TransitionType,
  fps: number,
  transitionDurationSec: number,
  width = 1920,
  height = 1080,
): { presentation: any; timing: TransitionTiming } {
  const durationInFrames = Math.max(1, Math.round(transitionDurationSec * fps));
  const timing = linearTiming({ durationInFrames });

  switch (type) {
    case 'crossfade':
      return { presentation: fade({}), timing };
    case 'slide-left':
      return { presentation: slide({ direction: 'from-left' }), timing };
    case 'slide-right':
      return { presentation: slide({ direction: 'from-right' }), timing };
    case 'slide-up':
      return { presentation: slide({ direction: 'from-top' }), timing };
    case 'slide-down':
      return { presentation: slide({ direction: 'from-bottom' }), timing };
    case 'whip-pan':
      return { presentation: slide({ direction: 'from-right' }), timing };
    case 'zoom-blur':
      return { presentation: zoomBlur({}), timing };
    case 'hard-cut':
      return { presentation: fade({}), timing };
    case 'wipe':
    case 'wipe-left':
      return { presentation: wipe({ direction: 'from-left' }), timing };
    case 'wipe-right':
      return { presentation: wipe({ direction: 'from-right' }), timing };
    case 'wipe-up':
      return { presentation: wipe({ direction: 'from-top' }), timing };
    case 'wipe-down':
      return { presentation: wipe({ direction: 'from-bottom' }), timing };
    case 'iris-wipe':
      return { presentation: iris({ width, height }), timing };
    case 'glitch':
      return { presentation: dissolve({}), timing };
    case 'flash-white':
      return { presentation: fade({}), timing };
    case 'push':
    case 'push-left':
    case 'push-right':
    case 'push-up':
    case 'push-down':
      return { presentation: pushCut({}), timing };
    case 'blur-dissolve':
      return { presentation: linearBlur({}), timing };
    case 'star-wipe':
      return { presentation: wipe({ direction: 'from-top-left' }), timing };
    case 'clock-wipe':
      return { presentation: clockWipe({ width, height }), timing };
    default:
      return { presentation: fade({}), timing };
  }
}
