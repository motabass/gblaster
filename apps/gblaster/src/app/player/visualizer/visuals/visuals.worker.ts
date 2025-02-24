import { VisualizerMode, VisualizerOptions, VisualsWorkerMessage } from './visuals.types';

let mode: VisualizerMode = 'off';

let canvas: OffscreenCanvas;
let ctx: OffscreenCanvasRenderingContext2D | null;
let analyserData: Uint8Array;

let fftSize: number;
let sampleRate: number;

let capYPositionArray: number[] = []; // store the vertical position of hte caps for the preivous frame

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

// Pre-calculate frequency to bark conversion map
let frequencyToBarkMap: number[];

function initBarkScaleMap(sr: number, fft: number) {
  frequencyToBarkMap = new Array(fft / 2);
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

  if (event.data.stop) {
    if (!ctx) {
      return;
    }

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  // Setup
  if (event.data.visualizerOptions) {
    setup(event.data.visualizerOptions);
  }

  // Visualize
  if (event.data.analyserData) {
    analyserData = event.data.analyserData;

    if (mode === 'osc') {
      drawOsc();
    }

    if (mode === 'bars') {
      drawBars();
    }
  }
});

function setup(options: VisualizerOptions) {
  if (!ctx) {
    return;
  }

  if (options.mode === 'bars') {
    meterNum = options.barCount;
    gap = options.gap;
    capHeight = options.capHeight;
    capFalldown = options.capFalldown;
    fftSize = options.fftSize;
    sampleRate = options.sampleRate;
  } else if (options.mode === 'osc') {
    thickness = options.thickness;
  }

  mode = options.mode;
  mainColor = options.mainColor;
  peakColor = options.peakColor;
  alpha = options.alpha;
  bufferLength = options.bufferLength;

  canvasWidth = ctx.canvas.width;
  canvasHeight = ctx.canvas.height;
  barWidth = canvasWidth / meterNum - gap;

  analyserData = new Uint8Array(bufferLength);

  gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
  gradient.addColorStop(1, mainColor);
  gradient.addColorStop(0.7, peakColor);
  gradient.addColorStop(0, peakColor);

  capYPositionArray = []; // store the vertical position of hte caps for the preivous frame
  for (let i = 0; i < meterNum; i++) {
    capYPositionArray[i] = capHeight;
  }
}

function drawOsc() {
  if (!ctx) {
    return;
  }
  ctx.globalAlpha = alpha;
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  ctx.lineWidth = thickness;
  ctx.strokeStyle = mainColor;

  ctx.beginPath();

  const sliceWidth = canvasWidth / bufferLength;
  let x = 0;

  for (let i = 0; i < bufferLength; i++) {
    const v = analyserData[i] / 128;
    const y = (v * canvasHeight) / 2;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }

    x += sliceWidth;
  }

  ctx.stroke();
}

function drawBars() {
  if (!ctx) return;

  const barkScaleData = convertToBarkScale(analyserData, sampleRate, fftSize, meterNum);

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  for (let i = 0; i < meterNum; i++) {
    let value = barkScaleData[i] ?? 0;

    if (value > canvasHeight) {
      value = canvasHeight;
    }

    if (capYPositionArray.length < Math.round(meterNum)) {
      capYPositionArray.push(value);
    }

    ctx.fillStyle = mainColor;

    if (value < capYPositionArray[i]) {
      // draw cap on last position and decrease position

      ctx.fillRect((barWidth + gap) * i, canvasHeight - capYPositionArray[i], barWidth, capHeight);
      if (capYPositionArray[i] > capHeight) {
        capYPositionArray[i] = capYPositionArray[i] - capFalldown;
      }
    } else {
      // draw cap on top of bar and save position

      ctx.fillRect((barWidth + gap) * i, canvasHeight - value, barWidth, capHeight);
      capYPositionArray[i] = value;
    }

    ctx.fillStyle = gradient; // set the fillStyle to gradient for a better look

    ctx.fillRect((barWidth + gap) * i, canvasHeight - value + capHeight, barWidth, value - capHeight); // the bar
  }

  ctx.restore(); // Restore state once
}

// Function to convert frequency data to bark bands
function convertToBarkScale(frequencyData: Uint8Array, sr: number, fft: number, numBands: number): number[] {
  if (!frequencyToBarkMap) {
    initBarkScaleMap(sr, fft);
  }

  const barkScaleBandSize = (frequencyToBarkMap[frequencyToBarkMap.length - 1] - frequencyToBarkMap[0]) / numBands;
  const barkScaleBandEnergy = new Float32Array(numBands);

  for (let i = 0; i < frequencyData.length; i++) {
    const bandIndex = Math.floor((frequencyToBarkMap[i] - frequencyToBarkMap[0]) / barkScaleBandSize);
    if (bandIndex < numBands) {
      barkScaleBandEnergy[bandIndex] += frequencyData[i];
    }
  }

  return Array.from(barkScaleBandEnergy);
}
