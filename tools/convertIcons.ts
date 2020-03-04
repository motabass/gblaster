import * as fs from 'fs';
import * as path from 'path';
import SVGO from 'svgo';

const svgo: SVGO = new SVGO({
  plugins: [
    {
      cleanupAttrs: true
    },
    {
      removeDoctype: true
    },
    {
      removeXMLProcInst: true
    },
    {
      removeComments: true
    },
    {
      removeMetadata: true
    },
    {
      removeTitle: true
    },
    {
      removeDesc: true
    },
    {
      removeUselessDefs: true
    },
    {
      removeEditorsNSData: true
    },
    {
      removeEmptyAttrs: true
    },
    {
      removeHiddenElems: true
    },
    {
      removeEmptyText: true
    },
    {
      removeEmptyContainers: true
    },
    {
      removeViewBox: false
    },
    {
      cleanupEnableBackground: true
    },
    {
      convertStyleToAttrs: true
    },
    {
      convertColors: true
    },
    {
      convertPathData: true
    },
    {
      convertTransform: true
    },
    {
      removeUnknownsAndDefaults: true
    },
    {
      removeNonInheritableGroupAttrs: true
    },
    {
      removeUselessStrokeAndFill: true
    },
    {
      removeUnusedNS: true
    },
    {
      cleanupIDs: true
    },
    {
      cleanupNumericValues: true
    },
    {
      moveElemsAttrsToGroup: true
    },
    {
      moveGroupAttrsToElems: true
    },
    {
      collapseGroups: true
    },
    {
      removeRasterImages: false
    },
    {
      mergePaths: true
    },
    {
      convertShapeToPath: true
    },
    {
      sortAttrs: true
    },
    {
      removeDimensions: true
    },
    {
      // removeAttrs: { attrs: '(stroke|fill)' }
      removeAttrs: false
    }
  ]
});

const optimizeSvg = async (svg: string): Promise<string> => {
  const optimized = await svgo.optimize(svg);
  return optimized.data;
};

const convertSvgFileToSvgIconMapString = async (svgIconFile: string, svgFilesFolder: string): Promise<string> => {
  let fileContent = await fs.promises.readFile(path.join(svgFilesFolder, svgIconFile), 'utf8');
  fileContent = await optimizeSvg(fileContent);
  const fileId = svgIconFile.replace('.svg', '');
  fileContent = fileContent.replace('<svg ', '<svg id="' + fileId + '" ');
  return fileContent;
};

const convertToIconSet = async (svgFilesFolder: string, svgMapFile: string): Promise<void> => {
  let files: string[] = [];

  console.log(path.join(svgFilesFolder));

  try {
    files = await fs.promises.readdir(path.join(svgFilesFolder));
  } catch (err) {
    return console.log('Unable to scan directory: ' + err);
  }

  let iconSetSvgString = '';

  for (const svgIconFile of files) {
    const fileContent = await convertSvgFileToSvgIconMapString(svgIconFile, svgFilesFolder);
    iconSetSvgString = iconSetSvgString + fileContent;
  }

  const finalIconSetSvgString = '<svg><defs>' + iconSetSvgString + '</defs></svg>';

  fs.writeFileSync(path.join(svgMapFile), finalIconSetSvgString, { encoding: 'utf8' });
};

convertToIconSet('libs/icons', 'apps/gblaster/src/assets/icon-set.svg').then(() => console.log('Icon-Set successful generated'));
