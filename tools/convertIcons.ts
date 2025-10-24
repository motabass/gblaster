import * as fs from 'fs';
import * as path from 'path';
import { loadConfig, optimize } from 'svgo';

const optimizeSvg = async (svg: string): Promise<string> => {
  try {
    const config = await loadConfig('tools/svgo.config.js');
    const optimized = await optimize(svg, config);
    return optimized.data;
  } catch (err) {
    console.error('Error optimizing SVG:', err);
    throw err;
  }
};

const convertSvgFileToSvgIconMapString = async (svgIconFile: string, svgFilesFolder: string): Promise<string> => {
  let fileContent = await fs.promises.readFile(path.join(svgFilesFolder, svgIconFile), 'utf8');
  fileContent = await optimizeSvg(fileContent);
  const fileId = svgIconFile.replace('.svg', '');
  fileContent = fileContent.replace('<svg ', `<svg id="${fileId}" `);
  return fileContent;
};

const convertToIconSet = async (svgFilesFolder: string, svgMapFile: string): Promise<void> => {
  let files: string[] = [];

  try {
    files = await fs.promises.readdir(path.join(svgFilesFolder));
  } catch (err) {
    console.error('Unable to scan directory:', err);
    throw err;
  }

  const iconSetSvgStrings = [];

  for (const svgIconFile of files) {
    const fileContent = await convertSvgFileToSvgIconMapString(svgIconFile, svgFilesFolder);
    iconSetSvgStrings.push(fileContent);
  }

  const finalIconSetSvgString = `<svg><defs>${iconSetSvgStrings.join('')}</defs></svg>`;

  try {
    fs.writeFileSync(path.join(svgMapFile), finalIconSetSvgString, {
      encoding: 'utf8'
    });
  } catch (err) {
    console.error('Error writing SVG file:', err);
    throw err;
  }
};

convertToIconSet('libs/icons', 'apps/gblaster/src/assets/icon-set.svg')
  .then(() => console.log('Icon-Set successful generated'))
  .catch((err) => console.error('Error generating icon set:', err));
