/* eslint-disable unicorn/no-top-level-assignment-in-function */
import type {
  BarsVisualizerOptions,
  OscVisualizerOptions,
  VisualizerMode,
  VisualizerOptions,
  VisualsWorkerMessage
} from './visuals.types';

let mode: VisualizerMode = 'off';
let canvas: OffscreenCanvas;
let context: OffscreenCanvasRenderingContext2D | null;
let analyserData: Uint8Array;

// Pre-calculated values
let fftSize: number;
let sampleRate: number;
let capYPositionArray: Float32Array;
let meterNumber: number;
let gap: number;
let capHeight: number;
let capFalldown: number;
let mainColor: string;
let peakColor: string;
let alpha: number;
let canvasWidth: number;
let canvasHeight: number;
let barWidth: number;
let thickness: number;
let bufferLength: number;
let gradient: CanvasGradient;

// Pre-calculated arrays
let frequencyToBarkMap: Float32Array | undefined;
let barkScaleBandEnergy: Float32Array;
let sliceWidthCache: number;
let rotation = 0;

addEventListener('message', (event: MessageEvent<VisualsWorkerMessage>) => {
  // message for offscreen canvas
  if (event.data.canvas) {
    canvas = event.data.canvas;
    context = canvas.getContext('2d');
    canvasWidth = canvas.width;
    canvasHeight = canvas.height;
  }

  //  message for resizing canvas
  if (event.data.newSize) {
    if (!context) {
      return;
    }
    const newWidth = event.data.newSize.width;
    const newHeight = event.data.newSize.height;

    if (canvas.width !== newWidth || canvas.height !== newHeight) {
      canvas.width = newWidth;
      canvas.height = newHeight;

      // Update any cached dimensions
      canvasWidth = newWidth;
      canvasHeight = newHeight;

      barWidth = canvasWidth / meterNumber - gap;

      // Pre-calculate slice width for oscilloscope
      sliceWidthCache = canvasWidth / bufferLength;

      gradient = context.createLinearGradient(0, 0, 0, canvasHeight);
      gradient.addColorStop(1, mainColor);
      gradient.addColorStop(0.7, peakColor);
      gradient.addColorStop(0, peakColor);
    }
  }
  // message for stopping and clearing the visualizer
  if (context && event.data.stop) {
    context.clearRect(0, 0, canvasWidth, canvasHeight);
  }

  // message for setting up the visualizer
  if (event.data.visualizerOptions) {
    setupVisualsWorkerWithOptions(event.data.visualizerOptions);
  }

  // Handle analyzer data (optimized for transferable objects)
  if (!event.data.analyserData) {
    return;
  }

  analyserData = event.data.analyserData;

  switch (mode) {
    case 'osc': {
      drawOsc();
      break;
    }
    case 'bars': {
      drawBars();
      break;
    }
    case 'circular-osc': {
      drawCircularOsc();
      break;
    }
    case 'circular-bars': {
      drawCircularBars();
      break;
    }
  }

  // Notify main thread we're ready for more data, including the buffer for reuse
  postMessage({ bufferReady: true, reusableBuffer: analyserData }, [analyserData.buffer]);
});

function setupVisualsWorkerWithOptions(options: VisualizerOptions) {
  if (!context) return;

  mode = options.mode;
  if (isBarsVisualizerOptions(options)) {
    meterNumber = options.barCount;
    gap = options.gap;
    capHeight = options.capHeight;
    capFalldown = options.capFalldown;
    fftSize = options.fftSize;
    sampleRate = options.sampleRate;
    frequencyToBarkMap = undefined;

    // Pre-allocate arrays
    capYPositionArray = new Float32Array(meterNumber).fill(capHeight);
    barkScaleBandEnergy = new Float32Array(meterNumber);
  } else if (isOscVisualizerOptions(options)) {
    thickness = options.thickness;
  }

  mainColor = options.mainColor;
  peakColor = options.peakColor;
  alpha = options.alpha;
  bufferLength = options.bufferLength;

  barWidth = canvasWidth / meterNumber - gap;

  // Pre-calculate slice width for oscilloscope
  sliceWidthCache = canvasWidth / bufferLength;

  gradient = context.createLinearGradient(0, 0, 0, canvasHeight);
  gradient.addColorStop(1, mainColor);
  gradient.addColorStop(0.7, peakColor);
  gradient.addColorStop(0, peakColor);

  analyserData = new Uint8Array(bufferLength);
}

function drawOsc() {
  if (!context) return;

  context.clearRect(0, 0, canvasWidth, canvasHeight);
  context.globalAlpha = alpha;
  context.lineWidth = thickness;
  context.strokeStyle = peakColor;

  const halfCanvasHeight = canvasHeight / 2;
  const scaleFactor = halfCanvasHeight / 128;

  context.beginPath();
  let x = 0;
  context.moveTo(x, analyserData[0] * scaleFactor);

  for (let index = 1; index < bufferLength; index++) {
    x += sliceWidthCache;
    context.lineTo(x, analyserData[index] * scaleFactor);
  }

  context.stroke();
}

function drawCircularOsc() {
  if (!context) return;

  context.clearRect(0, 0, canvasWidth, canvasHeight);
  context.globalAlpha = alpha;

  // Slowly rotate the visualization
  rotation += 0.003;

  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  const radius = Math.min(centerX, centerY) * 0.5;

  // Draw the waveform as a circular path
  context.beginPath();
  const angleStep = (Math.PI * 2) / bufferLength;

  for (let index = 0; index < bufferLength; index++) {
    // Convert the time domain data (0-255) to radius variation
    // 128 is the center line for audio data
    const scaleFactor = 1 + ((analyserData[index] - 128) / 128) * 0.9;
    const currentRadius = radius * scaleFactor;

    const angle = rotation + index * angleStep;
    const x = centerX + Math.cos(angle) * currentRadius;
    const y = centerY + Math.sin(angle) * currentRadius;

    if (index === 0) {
      context.moveTo(x, y);
    } else {
      context.lineTo(x, y);
    }
  }

  // Close the path to form a complete circle
  context.closePath();
  context.lineWidth = thickness;
  context.strokeStyle = peakColor;
  context.stroke();
}

function drawBars() {
  if (!context) return;

  const barkScaleData = convertToBarkScale();

  context.clearRect(0, 0, canvasWidth, canvasHeight);
  context.globalAlpha = alpha;

  const barGapWidth = barWidth + gap;

  context.fillStyle = gradient;

  for (let index = 0; index < meterNumber; index++) {
    const value = Math.min(barkScaleData[index] || 0, canvasHeight);
    const x = barGapWidth * index;

    // Draw cap
    context.fillStyle = mainColor;
    if (value < capYPositionArray[index]) {
      context.fillRect(x, canvasHeight - capYPositionArray[index], barWidth, capHeight);
      capYPositionArray[index] = Math.max(capYPositionArray[index] - capFalldown, capHeight);
    } else {
      context.fillRect(x, canvasHeight - value, barWidth, capHeight);
      capYPositionArray[index] = value;
    }

    // Draw bar
    context.fillStyle = gradient;
    context.fillRect(x, canvasHeight - value + capHeight, barWidth, value - capHeight);
  }
}

function drawCircularBars() {
  if (!context) return;

  const barkScaleData = convertToBarkScale();

  context.clearRect(0, 0, canvasWidth, canvasHeight);
  context.globalAlpha = alpha;

  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  const radius = Math.min(centerX, centerY) * 1.2;

  // Slowly rotate the visualization
  rotation += 0.003;

  // Draw circle backdrop
  context.beginPath();
  context.arc(centerX, centerY, radius * 0.3, 0, Math.PI * 2);
  context.fillStyle = mainColor;
  context.globalAlpha = 0.2 * alpha;
  context.fill();
  context.globalAlpha = alpha;

  // Draw frequency bars in circular pattern
  const angleStep = (Math.PI * 2) / meterNumber;
  const lineWidth = ((radius * Math.PI) / meterNumber) * 0.7;

  context.beginPath();
  for (let index = 0; index < meterNumber; index++) {
    const value = Math.min(barkScaleData[index] || 0, 256) / 256;
    const angle = rotation + index * angleStep;

    const innerRadius = radius * 0.3;
    const outerRadius = innerRadius + radius * 0.9 * value;

    context.moveTo(centerX + innerRadius * Math.cos(angle), centerY + innerRadius * Math.sin(angle));
    context.lineTo(centerX + outerRadius * Math.cos(angle), centerY + outerRadius * Math.sin(angle));
  }

  context.lineWidth = lineWidth;
  context.strokeStyle = gradient;
  context.stroke();

  context.beginPath();
  for (let index = 0; index < meterNumber; index++) {
    const value = Math.min(barkScaleData[index] || 0, 256) / 256;
    if (value <= 0.05) continue;

    const angle = rotation + index * angleStep;
    const outerRadius = radius * 0.3 + radius * 0.9 * value;
    const capX = centerX + outerRadius * Math.cos(angle);
    const capY = centerY + outerRadius * Math.sin(angle);
    context.moveTo(capX + lineWidth / 2, capY);
    context.arc(capX, capY, lineWidth / 2, 0, Math.PI * 2);
  }

  context.fillStyle = peakColor;
  context.fill();
}

function convertToBarkScale(): Float32Array {
  let barkMap = frequencyToBarkMap;
  if (!barkMap) {
    barkMap = initBarkScale();
    frequencyToBarkMap = barkMap;
  }

  const firstBarkValue = barkMap[0];
  const barkScaleBandSize = (barkMap.at(-1) - firstBarkValue) / meterNumber;
  barkScaleBandEnergy.fill(0);

  let index = 0;
  for (const analyserDatum of analyserData) {
    const barkValue = barkMap[index];
    const bandIndex = Math.floor((barkValue - firstBarkValue) / barkScaleBandSize);
    if (bandIndex < meterNumber) {
      barkScaleBandEnergy[bandIndex] += analyserDatum;
    }
    index++;
  }

  return barkScaleBandEnergy;
}

function initBarkScale(): Float32Array {
  const barkMap = new Float32Array(fftSize / 2);
  for (let index = 0; index < fftSize / 2; index++) {
    const frequency = (index * sampleRate) / fftSize;
    barkMap[index] = 13 * Math.atan(0.00076 * frequency) + 3.5 * Math.atan((frequency / 7500) ** 2);
  }
  return barkMap;
}

function isBarsVisualizerOptions(options: VisualizerOptions): options is BarsVisualizerOptions {
  return options.mode === 'bars' || options.mode === 'circular-bars';
}

function isOscVisualizerOptions(options: VisualizerOptions): options is OscVisualizerOptions {
  return options.mode === 'osc' || options.mode === 'circular-osc';
}
