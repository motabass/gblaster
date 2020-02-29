import { BrowserWindow, ipcMain, shell } from 'electron';
import debug from 'electron-debug';
import { join } from 'path';
import { format } from 'url';
import { rendererAppName, rendererAppPort } from './constants';
import IpcMainEvent = Electron.IpcMainEvent;

debug();

export default class App {
  // Keep a global reference of the window object, if you don't, the window will
  // be closed automatically when the JavaScript object is garbage collected.
  static mainWindow: BrowserWindow;
  static application: Electron.App;
  static BrowserWindow: typeof BrowserWindow;

  public static isDevelopmentMode() {
    if (process.env.ELECTRON_IS_DEV) {
      return true;
    } else {
      return !App.application.isPackaged;
    }
  }

  private static onWindowAllClosed() {
    if (process.platform !== 'darwin') {
      App.application.quit();
    }
  }

  private static onClose() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    App.mainWindow = null!;
  }

  private static onRedirect(event: any, url: string) {
    if (url !== App.mainWindow.webContents.getURL()) {
      // this is a normal external redirect, open it in a new browser window
      event.preventDefault();
      shell.openExternal(url);
    }
  }

  private static onAppReady() {
    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    App.initMainWindow();
    App.loadMainWindow();
    App.startHandlers();
  }

  private static onAppActivate() {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (App.mainWindow === null) {
      App.onAppReady();
    }
  }

  private static initMainWindow() {
    const { screen } = require('electron');
    const workAreaSize = screen.getPrimaryDisplay().workAreaSize;
    const width = Math.min(1280, workAreaSize.width || 1280);
    const height = Math.min(720, workAreaSize.height || 720);

    // Create the browser window.
    App.mainWindow = new BrowserWindow({
      width: width,
      height: height,
      backgroundColor: '#000000',
      titleBarStyle: 'hidden',
      autoHideMenuBar: true,
      darkTheme: true,
      frame: true,
      icon: `file://${__dirname}/../motabass/assets/icons/icon-512x512.png`,
      show: false,
      webPreferences: {
        nodeIntegration: true,
        backgroundThrottling: false,
        enableBlinkFeatures: 'NativeFileSystem'
      }
    });
    App.mainWindow.setMenu(null);
    App.mainWindow.center();

    // if main window is ready to show, close the splash window and show the main window
    App.mainWindow.once('ready-to-show', () => {
      App.mainWindow.show();
    });

    // handle all external redirects in a new browser window
    // App.mainWindow.webContents.on('will-navigate', App.onRedirect);
    // App.mainWindow.webContents.on('new-window', (event, url, frameName, disposition, options) => {
    //     App.onRedirect(event, url);
    // });

    // Emitted when the window is closed.
    App.mainWindow.on('closed', () => {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      App.mainWindow = null!;
    });
  }

  private static loadMainWindow() {
    // load the index.html of the app.
    if (App.isDevelopmentMode()) {
      App.mainWindow.loadURL(`http://localhost:${rendererAppPort}`);
    } else {
      App.mainWindow.loadURL(
        format({
          pathname: join(__dirname, '..', rendererAppName, 'index.html'),
          protocol: 'file:',
          slashes: true
        })
      );
    }
  }

  private static startHandlers() {
    ipcMain.on('extractId3Tags', App.extractId3TagHandler);
  }

  private static extractId3TagHandler(event: IpcMainEvent, arg: ArrayBuffer) {
    event.sender.send('extractId3Tags', 'Hallo back!');
  }

  static main(app: Electron.App, browserWindow: typeof BrowserWindow) {
    // we pass the Electron.App object and the
    // Electron.BrowserWindow into this function
    // so this class has no dependencies. This
    // makes the code easier to write tests for

    App.BrowserWindow = browserWindow;
    App.application = app;

    app.allowRendererProcessReuse = true;

    App.application.on('window-all-closed', App.onWindowAllClosed); // Quit when all windows are closed.
    App.application.on('ready', App.onAppReady); // App is ready to load data
    App.application.on('activate', App.onAppActivate); // App is activated
  }
}
