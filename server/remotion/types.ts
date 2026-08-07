export type MediaKind = 'image' | 'video';

export interface MediaAsset {
  id: string;
  name: string;
  kind: MediaKind;
  url: string;
  durationSec?: number;
  width: number;
  height: number;
  file: File;
}

export interface LowerThirdData {
  name: string;
  role?: string;
}

export interface ScriptSegment {
  sceneId: string;
  mediaId: string;
  startTime: number;
  endTime: number;
  text?: string;
  callout?: string;
  location?: string;
  date?: string;
  quote?: string;
  lowerThird?: LowerThirdData;
}

export type TransitionType =
  | 'crossfade'
  | 'slide-left'
  | 'slide-right'
  | 'slide-up'
  | 'slide-down'
  | 'whip-pan'
  | 'zoom-blur'
  | 'hard-cut'
  | 'wipe'
  | 'wipe-left'
  | 'wipe-right'
  | 'wipe-up'
  | 'wipe-down'
  | 'iris-wipe'
  | 'glitch'
  | 'flash-white'
  | 'push'
  | 'push-left'
  | 'push-right'
  | 'push-up'
  | 'push-down'
  | 'blur-dissolve'
  | 'star-wipe'
  | 'clock-wipe';

export type KenBurnsDirection =
  | 'zoom-in'
  | 'zoom-out'
  | 'pan-left'
  | 'pan-right'
  | 'pan-up'
  | 'pan-down'
  | 'zoom-in-pan-left'
  | 'zoom-in-pan-right'
  | 'zoom-in-pan-up'
  | 'zoom-in-pan-down'
  | 'zoom-out-pan-left'
  | 'zoom-out-pan-right'
  | 'zoom-out-pan-up'
  | 'zoom-out-pan-down'
  | 'static';

export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:5';

export type CaptionStyle = 'none' | 'fade' | 'slide' | 'typewriter' | 'karaoke';
export type CaptionPosition = 'lower-third' | 'center' | 'top';
export type CaptionFontFamily = 'inter' | 'roboto-mono' | 'georgia' | 'system';
export type ColorGradePreset = 'none' | 'cinematic' | 'warm' | 'cool' | 'vintage' | 'vivid';
export type TransitionPack = 'mixed' | 'smooth' | 'dynamic' | 'minimal';
export type ExportResolution = '720p' | '1080p' | '4k';
export type ExportFormat = 'mp4' | 'webm';
export type IntroOutroStyle = 'fade' | 'slide-up' | 'typewriter' | 'zoom' | 'reveal';

export interface ManualColorGrade {
  brightness: number;
  contrast: number;
  saturation: number;
  vignette: number;
  filmGrain: number;
}

export interface CaptionSettings {
  fontFamily: CaptionFontFamily;
  fontSize: number;
  textColor: string;
  karaokeColor: string;
  backgroundPill: boolean;
  outline: boolean;
  outlineColor: string;
  timingOffsetMs: number;
}

export interface EditSettings {
  fps: number;
  aspectRatio: AspectRatio;
  transitionPack: TransitionPack;
  transitionDuration: number;
  captionStyle: CaptionStyle;
  captionPosition: CaptionPosition;
  captionSettings: CaptionSettings;
  colorGrade: ColorGradePreset;
  manualColorGrade: ManualColorGrade;
  exportResolution: ExportResolution;
  exportFormat: ExportFormat;
  showIntro: boolean;
  showOutro: boolean;
  introText: string;
  introSubtitle: string;
  outroText: string;
  channelName: string;
  introOutroStyle: IntroOutroStyle;
  musicVolume: number;
  musicUrl: string | null;
  autoDuck: boolean;
  trimSilence: boolean;
  normalizeLoudness: boolean;
  voiceFadeInSec: number;
  voiceFadeOutSec: number;
  voiceClarityBoost: boolean;
}

export interface KenBurnsConfig {
  enabled: boolean;
  direction: KenBurnsDirection;
  intensity: number;
  startX: number;
  startY: number;
  startScale: number;
  endX: number;
  endY: number;
  endScale: number;
}

export interface TimelineScene {
  id: string;
  media: MediaAsset;
  startFrame: number;
  endFrame: number;
  durationFrames: number;
  durationSec: number;
  text?: string;
  callout?: string;
  location?: string;
  date?: string;
  quote?: string;
  lowerThird?: LowerThirdData;
  transitionIn: TransitionType;
  transitionOut: TransitionType;
  kenBurns: KenBurnsConfig;
}

export interface TimelineData {
  scenes: TimelineScene[];
  totalFrames: number;
  totalDurationSec: number;
  fps: number;
  voiceoverUrl: string | null;
  voiceoverDurationSec: number;
  musicUrl: string | null;
  settings: EditSettings;
}

export type PipelineStage =
  | 'idle'
  | 'parsing'
  | 'validating'
  | 'building'
  | 'applying'
  | 'rendering'
  | 'done'
  | 'error';

export interface PipelineProgress {
  stage: PipelineStage;
  message: string;
  progress: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  voiceoverDurationSec: number;
  scriptDurationSec: number;
  gaps: { sceneId: string; gapSec: number }[];
  overlaps: { sceneId: string; overlapSec: number }[];
  missingMedia: string[];
}
