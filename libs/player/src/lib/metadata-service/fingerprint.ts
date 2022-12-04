export interface Fingerprint {
  fingerprint: string;
  duration: number;
}

function readToEnd(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = (e) => reject(e);
    reader.readAsArrayBuffer(file);
  });
}

function toPCM16(data: Float32Array): Int16Array {
  const pcm16 = new Int16Array(data.length);
  for (let i = 0; i < data.length; i++) {
    pcm16[i] = data[i] * 32767;
  }

  return pcm16;
}

async function getFingerprint(file: File): Promise<Fingerprint> {
  const sampleRate = 44100;
  const time = 120;

  const context = new OfflineAudioContext(1, sampleRate * time, sampleRate);
  const rawBuffer = await readToEnd(file);
  const audioBuffer = await context.decodeAudioData(rawBuffer);
  const data = audioBuffer.getChannelData(0);
  const duration = Math.round(data.length / sampleRate);
  const pcm16 = toPCM16(data.slice(0, sampleRate * time));

  const chromaprint = await import('chromaprint-wasm');

  const chromaprintContext = new chromaprint.ChromaprintContext();
  chromaprintContext.feed(pcm16);
  const fingerprint = chromaprintContext.finish();
  return { fingerprint, duration };
}
