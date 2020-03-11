import { app, BrowserWindow, ipcMain, screen } from 'electron';
import { IAudioMetadata } from 'music-metadata-browser';
import * as path from 'path';
import * as url from 'url';
import { Id3CoverPicture, Id3Tags } from '../../../libs/player/src/lib/metadata-service/id3-tags.types';

let serve;
const args = process.argv.slice(1);
serve = args.some((val) => val === '--serve');

let win: Electron.BrowserWindow = null;

const getFromEnv = parseInt(process.env.ELECTRON_IS_DEV, 10) === 1;
const isEnvSet = 'ELECTRON_IS_DEV' in process.env;
const debugMode = isEnvSet ? getFromEnv : process.defaultApp || /node_modules[\\/]electron[\\/]/.test(process.execPath);

/**
 * Electron window settings
 */
const mainWindowSettings: Electron.BrowserWindowConstructorOptions = {
  frame: true,
  resizable: true,
  focusable: true,
  darkTheme: true,
  autoHideMenuBar: true,
  fullscreenable: true,
  kiosk: false,
  // to hide title bar, uncomment:
  titleBarStyle: 'hidden',
  webPreferences: {
    devTools: debugMode,
    autoplayPolicy: 'no-user-gesture-required',
    nodeIntegration: debugMode,
    enableBlinkFeatures: 'NativeFileSystem'
  }
};

/**
 * Hooks for electron main process
 */
function initMainListener() {
  ipcMain.handle(
    'GET_ID3_TAGS',
    async (event, filePath): Promise<Id3Tags | undefined> => {
      const musicMetadata = require('music-metadata');

      let tags: IAudioMetadata | undefined;
      try {
        tags = await musicMetadata.parseFile(filePath);
      } catch (e) {
        console.warn(`Tags von "${filePath}) konnten nicht gelesen werden: `, e.info);
        return null;
      }

      let cover: Id3CoverPicture | undefined;
      if (tags.common.picture) {
        cover = { format: tags.common.picture[0].format, data: tags.common.picture[0].data };
      }
      return {
        picture: cover,
        artist: tags.common.artist,
        title: tags.common.title,
        track: tags.common.track,
        album: tags.common.album,
        year: tags.common.year?.toString()
      };
    }
  );
}

/**
 * Create main window presentation
 */
async function createWindow() {
  const sizes = screen.getPrimaryDisplay().workAreaSize;

  if (debugMode) {
    process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';

    mainWindowSettings.width = 800;
    mainWindowSettings.height = 600;
  } else {
    mainWindowSettings.width = sizes.width;
    mainWindowSettings.height = sizes.height;
    mainWindowSettings.x = 0;
    mainWindowSettings.y = 0;
  }

  win = new BrowserWindow(mainWindowSettings);

  let launchPath;
  if (serve) {
    require('electron-reload')(__dirname, {
      electron: require(`${__dirname}/../../../node_modules/electron`)
    });
    launchPath = 'http://localhost:4200';
    win.loadURL(launchPath);
  } else {
    launchPath = url.format({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file:',
      slashes: true
    });
    win.loadURL(launchPath);
  }

  console.log('launched electron with:', launchPath);

  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

  initMainListener();

  if (debugMode) {
    // Open the DevTools.
    win.webContents.openDevTools();
    // client.create(applicationRef);
  }
}

try {
  app.on('ready', createWindow);

  app.on('window-all-closed', quit);

  ipcMain.on('quit', quit);

  ipcMain.on('minimize', () => {
    win.minimize();
  });

  ipcMain.on('maximize', () => {
    win.maximize();
  });

  ipcMain.on('restore', () => {
    win.restore();
  });

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });
} catch (err) {}

function quit() {
  if (process.platform !== 'darwin') {
    app.quit();
  }
}
