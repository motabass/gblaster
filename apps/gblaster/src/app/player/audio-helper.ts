import { FREQUENCY_BANDS, FrequencyBand } from './player.types';

/**
 * Creates an equalizer chain of BiquadFilterNodes for an audio context
 * @param audioContext The AudioContext to create the equalizer in
 * @returns An object containing the input node, output node, and frequency filters
 */
export function createEqualizer(audioContext: AudioContext): {
  eqInput: AudioNode;
  eqOutput: AudioNode;
  frequencyFilters: Record<FrequencyBand, BiquadFilterNode>;
} {
  const frequencyFilters: Partial<Record<FrequencyBand, BiquadFilterNode>> = {};
  const input = audioContext.createGain();
  input.gain.value = 1;

  let output = input;
  for (const [index, bandFrequency] of FREQUENCY_BANDS.entries()) {
    const filter = audioContext.createBiquadFilter();

    frequencyFilters[bandFrequency] = filter;

    if (index === 0) {
      // The first filter, includes all lower frequencies
      filter.type = 'lowshelf';
      // Add a gentle slope for low shelf
      filter.Q.value = 0.7;
    } else if (index === FREQUENCY_BANDS.length - 1) {
      // The last filter, includes all higher frequencies
      filter.type = 'highshelf';
      // Add a gentle slope for high shelf
      filter.Q.value = 0.7;
    } else {
      filter.type = 'peaking';

      // Use different Q values based on frequency ranges
      if (bandFrequency < 250) {
        filter.Q.value = 0.8; // Wider for low frequencies
      } else if (bandFrequency < 2000) {
        filter.Q.value = 0.7; // Medium for mid frequencies
      } else {
        filter.Q.value = 0.6; // Narrower for high frequencies
      }
    }
    filter.frequency.value = bandFrequency;

    output.connect(filter);
    output = filter;
  }

  return {
    eqInput: input,
    eqOutput: output,
    frequencyFilters: frequencyFilters as Record<FrequencyBand, BiquadFilterNode>
  };
}
