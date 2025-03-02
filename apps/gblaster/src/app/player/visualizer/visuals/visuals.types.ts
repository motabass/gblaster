export type FftSize = 32 | 64 | 128 | 256 | 512 | 1024 | 2048 | 4096 | 8192 | 16_384 | 32_768;

export interface AnalyserConfig {
  fftSize: FftSize;
  smoothingTimeConstant: number;
  minDecibels: number;
  maxDecibels: number;
}

export interface FrequencyBarsConfig {
  barCount: number;
  capHeight: number;
  gap: number;
  capFalldown: number;
}

export interface OsciloscopeConfig {
  thickness: number;
}

export interface VisualsColorConfig {
  mainColor?: string;
  peakColor?: string;
  alpha?: number;
}

export interface VisualsWorkerMessage {
  canvas?: OffscreenCanvas;
  newSize?: DOMRect;
  stop?: boolean;
  visualizerOptions?: VisualizerOptions;
  analyserData: Uint8Array;
}
export interface BaseVisualizerOptions {
  mode: VisualizerMode;
  mainColor: string;
  peakColor: string;
  alpha: number;
  bufferLength: number;
}

export interface BarsVisualizerOptions extends BaseVisualizerOptions {
  mode: 'bars';
  barCount: number;
  gap: number;
  capHeight: number;
  capFalldown: number;
  fftSize: number;
  sampleRate: number;
}

export interface OscVisualizerOptions extends BaseVisualizerOptions {
  mode: 'osc';
  thickness: number;
}

export type VisualizerOptions = BarsVisualizerOptions | OscVisualizerOptions;

export type VisualizerMode = 'off' | 'bars' | 'osc' | 'circular-bars' | 'circular-osc';
