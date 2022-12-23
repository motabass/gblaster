import { VisualsWorkerMessage } from './visuals.types';

let mode: string;

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

// TODO: typisieren
function setup(options: any) {
  if (!ctx) {
    return;
  }

  mode = options.mode;

  meterNum = options.barCount;
  gap = options.gap; // gap between meters
  capHeight = options.capHeight; // cap thickness
  capFalldown = options.capFalldown;

  mainColor = options.mainColor;
  peakColor = options.peakColor;
  alpha = options.alpha;

  thickness = options.thickness;

  canvasWidth = ctx.canvas.width;
  canvasHeight = ctx.canvas.height;
  barWidth = canvasWidth / meterNum - gap;

  bufferLength = options.bufferLength;

  fftSize = options.fftSize;
  sampleRate = options.sampleRate;

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
  if (!ctx) {
    return;
  }

  const barkScaleData = convertToBarkScale(analyserData, sampleRate, fftSize, meterNum);

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
}

// Function to convert frequency data to bark bands
function convertToBarkScale(frequencyData: Uint8Array, sr: number, fft: number, numBands: number): number[] {
  const barkScaleData = frequencyData.map((magnitude: number, index: number) => {
    const frequency = (index * sr) / fft;
    return 13 * Math.atan(0.00076 * frequency) + 3.5 * Math.atan((frequency / 7500) ** 2);
  });

  // Divide the range of bark values into 20 equal intervals to create bark scale bands
  const barkScaleBandSize = (barkScaleData[barkScaleData.length - 1] - barkScaleData[0]) / numBands;

  // Calculate the energy in each bark scale band
  const barkScaleBandEnergy = new Array(numBands).fill(0);
  for (let i = 0; i < barkScaleData.length; i++) {
    // TODO: fix not every index being set when high numBands
    const bandIndex = Math.floor((barkScaleData[i] - barkScaleData[0]) / barkScaleBandSize);
    barkScaleBandEnergy[bandIndex] += frequencyData[i];
  }
  return barkScaleBandEnergy;
}
