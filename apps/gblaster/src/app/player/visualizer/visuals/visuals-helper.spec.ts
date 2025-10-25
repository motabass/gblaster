import { getNextVisualizerMode } from './visuals-helper';
import { VisualizerMode } from './visuals.types';

describe('getNextVisualizerMode', () => {
  it('should cycle from off to bars', () => {
    const result = getNextVisualizerMode('off');
    expect(result).toBe('bars');
  });

  it('should cycle from bars to circular-bars', () => {
    const result = getNextVisualizerMode('bars');
    expect(result).toBe('circular-bars');
  });

  it('should cycle from circular-bars to osc', () => {
    const result = getNextVisualizerMode('circular-bars');
    expect(result).toBe('osc');
  });

  it('should cycle from osc to circular-osc', () => {
    const result = getNextVisualizerMode('osc');
    expect(result).toBe('circular-osc');
  });

  it('should cycle from circular-osc back to off', () => {
    const result = getNextVisualizerMode('circular-osc');
    expect(result).toBe('off');
  });

  it('should complete a full cycle', () => {
    let mode: VisualizerMode = 'off';

    mode = getNextVisualizerMode(mode);
    expect(mode).toBe('bars');

    mode = getNextVisualizerMode(mode);
    expect(mode).toBe('circular-bars');

    mode = getNextVisualizerMode(mode);
    expect(mode).toBe('osc');

    mode = getNextVisualizerMode(mode);
    expect(mode).toBe('circular-osc');

    mode = getNextVisualizerMode(mode);
    expect(mode).toBe('off');
  });
});
