export type VisualizerMode = 'off' | 'osc' | 'bars';

export type FftSize = 32 | 64 | 128 | 256 | 512 | 1024 | 2048 | 4096 | 8192 | 16384 | 32768;

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
  mainColor: string;
  peakColor: string;
}
