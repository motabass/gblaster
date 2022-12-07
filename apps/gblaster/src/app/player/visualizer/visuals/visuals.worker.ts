/// <reference types="offscreencanvas" />

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

// TODO: messages sauber typisieren
addEventListener(
  'message',
  (event: MessageEvent<{ canvas?: OffscreenCanvas; newSize?: DOMRect; stop?: boolean; start?: boolean; analyserData: Uint8Array }>) => {
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
      // @ts-ignore
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
  }
);

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
  // @ts-ignore
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

  // @ts-ignore
  canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);
  // @ts-ignore
  canvasCtx.lineWidth = thickness;
  // @ts-ignore
  canvasCtx.strokeStyle = mainColor;
  // @ts-ignore
  canvasCtx.beginPath();

  const sliceWidth = canvasWidth / bufferLength;
  let x = 0;

  for (let i = 0; i < bufferLength; i++) {
    const v = analyserData[i] / 128.0;
    const y = (v * canvasHeight) / 2;

    if (i === 0) {
      // @ts-ignore
      canvasCtx.moveTo(x, y);
    } else {
      // @ts-ignore
      canvasCtx.lineTo(x, y);
    }

    x += sliceWidth;
  }
  // @ts-ignore
  canvasCtx.stroke();
}

function drawBars() {
  if (!canvasCtx) {
    return;
  }

  // @ts-ignore
  canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);

  for (let i = 0; i < meterNum; i++) {
    const freqScaleValue = frequencyCorrectionScale(i);
    const position = freqScaleValue ? Math.round(freqScaleValue) : 0;

    let value = amplitudeScale(analyserData[position]) || 0;

    if (value > canvasHeight) {
      value = canvasHeight;
    }

    if (capYPositionArray.length < Math.round(meterNum)) {
      capYPositionArray.push(value);
    }
    // @ts-ignore
    canvasCtx.fillStyle = mainColor;

    if (value < capYPositionArray[i]) {
      // draw cap on last position and decrease position
      // @ts-ignore
      canvasCtx.fillRect((barWidth + gap) * i, canvasHeight - capYPositionArray[i], barWidth, capHeight);
      if (capYPositionArray[i] > capHeight) {
        capYPositionArray[i] = capYPositionArray[i] - capFalldown;
      }
    } else {
      // draw cap on top of bar and save position
      // @ts-ignore
      canvasCtx.fillRect((barWidth + gap) * i, canvasHeight - value, barWidth, capHeight);
      capYPositionArray[i] = value;
    }
    // @ts-ignore
    canvasCtx.fillStyle = gradient; // set the fillStyle to gradient for a better look

    // @ts-ignore
    canvasCtx.fillRect((barWidth + gap) * i, canvasHeight - value + capHeight, barWidth, value - capHeight); // the bar
  }
}
