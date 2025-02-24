import { VisualizerMode, VisualizerOptions, VisualsWorkerMessage } from './visuals.types';

let mode: VisualizerMode = 'off';
let canvas: OffscreenCanvas;
let ctx: OffscreenCanvasRenderingContext2D | null;
let analyserData: Uint8Array;

// Pre-calculated values
let fftSize: number;
let sampleRate: number;
let capYPositionArray: Float32Array; // Changed to typed array
let meterNum: number;
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
  for (let i = 0; i < fft / 2; i++) {
    const frequency = (i * sr) / fft;
    frequencyToBarkMap[i] = 13 * Math.atan(0.00076 * frequency) + 3.5 * Math.atan((frequency / 7500) ** 2);
  }
}

addEventListener('message', (event: MessageEvent<VisualsWorkerMessage>) => {
  if (event.data.canvas) {
    canvas = event.data.canvas;
    ctx = canvas.getContext('2d');
  }

  if (event.data.newSize) {
    canvas.width = event.data.newSize.width;
    canvas.height = event.data.newSize.height;
  }

  if (event.data.stop && ctx) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  if (event.data.visualizerOptions) {
    setup(event.data.visualizerOptions);
  }

  if (event.data.analyserData) {
    analyserData = event.data.analyserData;

    switch (mode) {
      case 'osc':
        drawOsc();
        break;
      case 'bars':
        drawBars();
        break;
    }
  }
});

function setup(options: VisualizerOptions) {
  if (!ctx) return;

  mode = options.mode;
  if (mode === 'bars') {
    meterNum = options.barCount;
    gap = options.gap;
    capHeight = options.capHeight;
    capFalldown = options.capFalldown;
    fftSize = options.fftSize;
    sampleRate = options.sampleRate;

    // Pre-allocate arrays
    capYPositionArray = new Float32Array(meterNum).fill(capHeight);
    barkScaleBandEnergy = new Float32Array(meterNum);
  } else if (mode === 'osc') {
    thickness = options.thickness;
  }

  mainColor = options.mainColor;
  peakColor = options.peakColor;
  alpha = options.alpha;
  bufferLength = options.bufferLength;

  canvasWidth = ctx.canvas.width;
  canvasHeight = ctx.canvas.height;
  barWidth = canvasWidth / meterNum - gap;

  // Pre-calculate slice width for oscilloscope
  sliceWidthCache = canvasWidth / bufferLength;

  analyserData = new Uint8Array(bufferLength);

  gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
  gradient.addColorStop(1, mainColor);
  gradient.addColorStop(0.7, peakColor);
  gradient.addColorStop(0, peakColor);
}

let oscilloscopePath: Path2D;

function drawOsc() {
  if (!ctx) return;

  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  ctx.globalAlpha = alpha;
  ctx.lineWidth = thickness;
  ctx.strokeStyle = mainColor;

  oscilloscopePath = new Path2D();
  let x = 0;
  oscilloscopePath.moveTo(x, (analyserData[0] / 128) * (canvasHeight / 2));

  for (let i = 1; i < bufferLength; i++) {
    x += sliceWidthCache;
    oscilloscopePath.lineTo(x, (analyserData[i] / 128) * (canvasHeight / 2));
  }

  ctx.stroke(oscilloscopePath);
}

function drawBars() {
  if (!ctx) return;

  const barkScaleData = convertToBarkScale();

  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  ctx.globalAlpha = alpha;

  const barGapWidth = barWidth + gap;

  for (let i = 0; i < meterNum; i++) {
    const value = Math.min(barkScaleData[i] || 0, canvasHeight);
    const x = barGapWidth * i;

    // Draw cap
    ctx.fillStyle = mainColor;
    if (value < capYPositionArray[i]) {
      ctx.fillRect(x, canvasHeight - capYPositionArray[i], barWidth, capHeight);
      if (capYPositionArray[i] > capHeight) {
        capYPositionArray[i] -= capFalldown;
      }
    } else {
      ctx.fillRect(x, canvasHeight - value, barWidth, capHeight);
      capYPositionArray[i] = value;
    }

    // Draw bar
    ctx.fillStyle = gradient;
    ctx.fillRect(x, canvasHeight - value + capHeight, barWidth, value - capHeight);
  }
}

function convertToBarkScale(): Float32Array {
  if (!frequencyToBarkMap) {
    initBarkScaleMap(sampleRate, fftSize);
  }

  const barkScaleBandSize = (frequencyToBarkMap[frequencyToBarkMap.length - 1] - frequencyToBarkMap[0]) / meterNum;
  barkScaleBandEnergy.fill(0);

  for (let i = 0; i < analyserData.length; i++) {
    const bandIndex = Math.floor((frequencyToBarkMap[i] - frequencyToBarkMap[0]) / barkScaleBandSize);
    if (bandIndex < meterNum) {
      barkScaleBandEnergy[bandIndex] += analyserData[i];
    }
  }

  return barkScaleBandEnergy;
}
