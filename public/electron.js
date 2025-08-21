const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';
const { autoUpdater } = require('electron-updater');

// Keep a global reference of the window object
let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1000,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'transparent_moss.png'), // Use your app icon
    show: false, // Don't show until ready-to-show
    title: 'IRA Calculator'
  });

  // Load the app
  const startUrl = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../build/index.html')}`;

  mainWindow.loadURL(startUrl);

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();

    // Open DevTools in development
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Emitted when the window is closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    require('electron').shell.openExternal(url);
    return { action: 'deny' };
  });
}

// This method will be called when Electron has finished initialization
app.whenReady().then(createWindow);

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In development, hide the menu bar
if (isDev) {
  Menu.setApplicationMenu(null);
}

// Auto-updater configuration
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

// Auto-updater event handlers
autoUpdater.on('checking-for-update', () => {
  mainWindow.webContents.send('update-message', 'Checking for updates...');
});

autoUpdater.on('update-available', (info) => {
  mainWindow.webContents.send('update-message', 'Update available. Downloading...');
  autoUpdater.downloadUpdate();
});

autoUpdater.on('update-not-available', (info) => {
  mainWindow.webContents.send('update-message', 'No updates available.');
});

autoUpdater.on('update-downloaded', (info) => {
  mainWindow.webContents.send('update-message', 'Update downloaded. Installing...');

  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Update Downloaded',
    message: 'A new version has been downloaded. Restart the application to apply the updates.',
    buttons: ['Restart', 'Later']
  }).then(result => {
    if (result.response === 0) {
      autoUpdater.quitAndInstall();
    }
  });
});

autoUpdater.on('error', (err) => {
  mainWindow.webContents.send('update-message', `Update error: ${err.message}`);
});

// IPC handlers
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('open-external', (event, url) => {
  require('electron').shell.openExternal(url);
});

ipcMain.handle('check-for-updates', () => {
  if (!isDev) {
    autoUpdater.checkForUpdates();
  } else {
    mainWindow.webContents.send('update-message', 'Updates disabled in development mode');
  }
});

// Check for updates (not in development)
if (!isDev) {
  app.on('ready', () => {
    // Check for updates after a short delay
    setTimeout(() => {
      autoUpdater.checkForUpdates();
    }, 3000);
  });
}
