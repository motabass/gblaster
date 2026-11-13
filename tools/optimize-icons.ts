import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { loadConfig, optimize } from 'svgo';

async function optimizeIcons(directory: string): Promise<void> {
  const config = await loadConfig('tools/svgo.config.js');
  if (!config) {
    throw new Error('Unable to load tools/svgo.config.js');
  }

  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.svg')) {
      continue;
    }

    const file = path.join(directory, entry.name);
    const svg = await readFile(file, 'utf8');
    const optimized = optimize(svg, { ...config, path: file });
    await writeFile(file, optimized.data, 'utf8');
  }
}

async function main(): Promise<void> {
  try {
    await optimizeIcons(process.argv[2] ?? 'apps/gblaster/src/assets/icons');
    console.log('SVG icons optimized');
  } catch (error: unknown) {
    console.error('Error optimizing SVG icons:', error);
    process.exitCode = 1;
  }
}

void main();
