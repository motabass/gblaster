import { VisualizerMode, VisualizerOptions, VisualsWorkerMessage } from './visuals.types';

let mode: VisualizerMode = 'off';
let canvas: OffscreenCanvas;
let context: OffscreenCanvasRenderingContext2D | null;
let analyserData: Uint8Array;

// Pre-calculated values
let fftSize: number;
let sampleRate: number;
let capYPositionArray: Float32Array; // Changed to typed array
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
let frequencyToBarkMap: Float32Array;
let barkScaleBandEnergy: Float32Array;
let sliceWidthCache: number;

function initBarkScaleMap(sr: number, fft: number) {
  frequencyToBarkMap = new Float32Array(fft / 2);
  for (let index = 0; index < fft / 2; index++) {
    const frequency = (index * sr) / fft;
    frequencyToBarkMap[index] = 13 * Math.atan(0.000_76 * frequency) + 3.5 * Math.atan((frequency / 7500) ** 2);
  }
}

addEventListener('message', (event: MessageEvent<VisualsWorkerMessage>) => {
  if (event.data.canvas) {
    canvas = event.data.canvas;
    context = canvas.getContext('2d');
  }

  if (event.data.newSize) {
    canvas.width = event.data.newSize.width;
    canvas.height = event.data.newSize.height;
  }

  if (event.data.stop && context) {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  }

  if (event.data.visualizerOptions) {
    setup(event.data.visualizerOptions);
  }

  if (event.data.analyserData) {
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
    }
  }
});

function setup(options: VisualizerOptions) {
  if (!context) return;

  mode = options.mode;
  if (mode === 'bars') {
    meterNumber = options.barCount;
    gap = options.gap;
    capHeight = options.capHeight;
    capFalldown = options.capFalldown;
    fftSize = options.fftSize;
    sampleRate = options.sampleRate;

    // Pre-allocate arrays
    capYPositionArray = new Float32Array(meterNumber).fill(capHeight);
    barkScaleBandEnergy = new Float32Array(meterNumber);
  } else if (mode === 'osc') {
    thickness = options.thickness;
  }

  mainColor = options.mainColor;
  peakColor = options.peakColor;
  alpha = options.alpha;
  bufferLength = options.bufferLength;

  canvasWidth = context.canvas.width;
  canvasHeight = context.canvas.height;
  barWidth = canvasWidth / meterNumber - gap;

  // Pre-calculate slice width for oscilloscope
  sliceWidthCache = canvasWidth / bufferLength;

  analyserData = new Uint8Array(bufferLength);

  gradient = context.createLinearGradient(0, 0, 0, canvasHeight);
  gradient.addColorStop(1, mainColor);
  gradient.addColorStop(0.7, peakColor);
  gradient.addColorStop(0, peakColor);
}

let oscilloscopePath: Path2D;

function drawOsc() {
  if (!context) return;

  context.clearRect(0, 0, canvasWidth, canvasHeight);
  context.globalAlpha = alpha;
  context.lineWidth = thickness;
  context.strokeStyle = mainColor;

  const halfCanvasHeight = canvasHeight / 2;
  const scaleFactor = halfCanvasHeight / 128;

  oscilloscopePath = new Path2D();
  let x = 0;
  oscilloscopePath.moveTo(x, analyserData[0] * scaleFactor);

  for (let index = 1; index < bufferLength; index++) {
    x += sliceWidthCache;
    oscilloscopePath.lineTo(x, analyserData[index] * scaleFactor);
  }

  context.stroke(oscilloscopePath);
}

function drawBars() {
  if (!context) return;

  const barkScaleData = convertToBarkScale();

  context.clearRect(0, 0, canvasWidth, canvasHeight);
  context.globalAlpha = alpha;

  const barGapWidth = barWidth + gap;
  const capYPositionArrayCopy = capYPositionArray.slice();

  context.fillStyle = gradient;

  for (let index = 0; index < meterNumber; index++) {
    const value = Math.min(barkScaleData[index] || 0, canvasHeight);
    const x = barGapWidth * index;

    // Draw cap
    if (value < capYPositionArrayCopy[index]) {
      context.fillStyle = mainColor;
      context.fillRect(x, canvasHeight - capYPositionArrayCopy[index], barWidth, capHeight);
      capYPositionArrayCopy[index] = Math.max(capYPositionArrayCopy[index] - capFalldown, capHeight);
    } else {
      context.fillStyle = mainColor;
      context.fillRect(x, canvasHeight - value, barWidth, capHeight);
      capYPositionArrayCopy[index] = value;
    }

    // Draw bar
    context.fillStyle = gradient;
    context.fillRect(x, canvasHeight - value + capHeight, barWidth, value - capHeight);
  }

  capYPositionArray.set(capYPositionArrayCopy);
}

function convertToBarkScale(): Float32Array {
  if (!frequencyToBarkMap) {
    initBarkScaleMap(sampleRate, fftSize);
  }

  const barkScaleBandSize = (frequencyToBarkMap.at(-1) - frequencyToBarkMap[0]) / meterNumber;
  barkScaleBandEnergy.fill(0);

  for (const [index, analyserDatum] of analyserData.entries()) {
    const bandIndex = Math.floor((frequencyToBarkMap[index] - frequencyToBarkMap[0]) / barkScaleBandSize);
    if (bandIndex < meterNumber) {
      barkScaleBandEnergy[bandIndex] += analyserDatum;
    }
  }

  return barkScaleBandEnergy;
}
