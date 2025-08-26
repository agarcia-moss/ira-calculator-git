const { app, BrowserWindow, Menu, dialog, Notification, ipcMain } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

// Auto-updater setup
const log = require('electron-log');
const { autoUpdater } = require('electron-updater');

// Configure logging
log.transports.file.level = 'info';
autoUpdater.logger = log;

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

// Auto-updater functions
function sendStatusToWindow(text) {
  log.info(text);
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send('update-message', text);
  }
}

function showNotification(title, body) {
  if (Notification.isSupported()) {
    new Notification({
      title: title,
      body: body,
      icon: path.join(__dirname, 'transparent_moss.png')
    }).show();
  }
}

// Auto-updater event listeners
autoUpdater.on('checking-for-update', () => {
  sendStatusToWindow('Checking for update...');
});

autoUpdater.on('update-available', (info) => {
  sendStatusToWindow('Update available.');
  showNotification('Update Available', `Version ${info.version} is available and will be installed on next restart.`);
});

autoUpdater.on('update-not-available', (info) => {
  sendStatusToWindow('Update not available.');
});

autoUpdater.on('error', (err) => {
  sendStatusToWindow('Error in auto-updater. ' + err);
});

autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  sendStatusToWindow(log_message);
});

autoUpdater.on('update-downloaded', (info) => {
  sendStatusToWindow('Update downloaded');

  const dialogOpts = {
    type: 'info',
    buttons: ['Restart', 'Later'],
    title: 'Application Update',
    message: process.platform === 'win32' ? info.releaseNotes : info.releaseName,
    detail: 'A new version has been downloaded. Restart the application to apply the updates.'
  };

  dialog.showMessageBox(dialogOpts).then((returnValue) => {
    if (returnValue.response === 0) autoUpdater.quitAndInstall();
  });
});

// IPC handlers
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('check-for-updates', () => {
  if (!isDev) {
    return autoUpdater.checkForUpdatesAndNotify();
  }
});

ipcMain.handle('open-external', (event, url) => {
  require('electron').shell.openExternal(url);
});

// Check for updates (only in production)
function checkForUpdates() {
  if (!isDev) {
    autoUpdater.checkForUpdatesAndNotify();
  }
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();

  // Check for updates after window is created
  setTimeout(checkForUpdates, 2000);
});

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
