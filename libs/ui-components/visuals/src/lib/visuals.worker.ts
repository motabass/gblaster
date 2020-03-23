/// <reference lib="webworker" />

import { scalePow, ScalePower } from 'd3-scale';

let mode: string;

let canvas: OffscreenCanvas;
let canvasCtx: OffscreenCanvasRenderingContext2D | null;
let analyserData: Uint8Array;

let capYPositionArray: number[] = []; // store the vertical position of hte caps for the preivous frame

let meterNum: number;
let gap: number;
let capHeight: number;
let capFalldown: number;

let mainColor: string;
let peakColor: string;

let canvasWidth: number;
let canvasHeight: number;
let barWidth: number;

let thickness: number;

let bufferLength: number;

let frequencyCorrectionScale: ScalePower<number, number>;
let amplitudeScale: ScalePower<number, number>;

let gradient: CanvasGradient;

addEventListener('message', (event) => {
  if (event.data.canvas) {
    canvas = event.data.canvas;
    canvasCtx = canvas.getContext('2d');
  }

  if (event.data.newSize) {
    canvas.width = event.data.newSize.width;
    canvas.height = event.data.newSize.height;
  }

  if (event.data.stop) {
    if (!canvasCtx) {
      return;
    }
    canvasCtx.clearRect(0, 0, canvasCtx.canvas.width, canvasCtx.canvas.height);
  }

  // Setup
  if (event.data.start) {
    setup(event.data);
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

function setup(options: any) {
  if (!canvasCtx) {
    return;
  }

  mode = options.mode;

  meterNum = options.barCount;
  gap = options.gap; // gap between meters
  capHeight = options.capHeight; // cap thickness
  capFalldown = options.capFalldown;

  mainColor = options.mainColor;
  peakColor = options.peakColor;

  thickness = options.thickness;

  canvasWidth = canvasCtx.canvas.width;
  canvasHeight = canvasCtx.canvas.height;
  barWidth = canvasWidth / meterNum - gap;

  bufferLength = options.bufferLength;

  analyserData = new Uint8Array(bufferLength);

  frequencyCorrectionScale = scalePow()
    .exponent(2.5)
    .domain([-7, meterNum + 5])
    .range([0, bufferLength - bufferLength / 3]);

  amplitudeScale = scalePow().exponent(1.7).domain([0, 255]).range([0, canvasHeight]);

  gradient = canvasCtx.createLinearGradient(0, 0, 0, canvasHeight);
  gradient.addColorStop(1, mainColor);
  gradient.addColorStop(0.7, peakColor);
  gradient.addColorStop(0, peakColor);

  capYPositionArray = []; // store the vertical position of hte caps for the preivous frame
  for (let i = 0; i < meterNum; i++) {
    capYPositionArray[i] = capHeight;
  }
}

function drawOsc() {
  if (!canvasCtx) {
    return;
  }

  canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);

  canvasCtx.lineWidth = thickness;
  canvasCtx.strokeStyle = mainColor;
  canvasCtx.beginPath();

  const sliceWidth = canvasWidth / bufferLength;
  let x = 0;

  for (let i = 0; i < bufferLength; i++) {
    const v = analyserData[i] / 128.0;
    const y = (v * canvasHeight) / 2;

    if (i === 0) {
      canvasCtx.moveTo(x, y);
    } else {
      canvasCtx.lineTo(x, y);
    }

    x += sliceWidth;
  }

  canvasCtx.stroke();
}

function drawBars() {
  if (!canvasCtx) {
    return;
  }

  canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);

  for (let i = 0; i < meterNum; i++) {
    const position = Math.round(frequencyCorrectionScale(i));
    let value = analyserData[position];
    value = amplitudeScale(value);

    if (value > canvasHeight) {
      value = canvasHeight;
    }

    if (capYPositionArray.length < Math.round(meterNum)) {
      capYPositionArray.push(value);
    }

    canvasCtx.fillStyle = mainColor;

    if (value < capYPositionArray[i]) {
      // draw cap on last position and decrease position
      canvasCtx.fillRect((barWidth + gap) * i, canvasHeight - capYPositionArray[i], barWidth, capHeight);
      if (capYPositionArray[i] > capHeight) {
        capYPositionArray[i] = capYPositionArray[i] - capFalldown;
      }
    } else {
      // draw cap on top of bar and save position
      canvasCtx.fillRect((barWidth + gap) * i, canvasHeight - value, barWidth, capHeight);
      capYPositionArray[i] = value;
    }
    canvasCtx.fillStyle = gradient; // set the fillStyle to gradient for a better look

    canvasCtx.fillRect((barWidth + gap) * i, canvasHeight - value + capHeight, barWidth, value - capHeight); // the bar
  }
}
