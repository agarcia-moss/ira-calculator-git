const { app, BrowserWindow, Menu, dialog, Notification, shell, ipcMain } = require('electron');
const path = require('path');
const isDev = !app.isPackaged;

// Auto-updater setup
const log = require('electron-log');
const { autoUpdater } = require('electron-updater');

// Configure logging
log.transports.file.level = 'info';
autoUpdater.logger = log;

// Configure auto-updater to check for pre-releases if in beta
autoUpdater.allowPrerelease = false;
autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

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

  // Load the app with error handling
  const startUrl = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../build/index.html')}`;

  // Handle file loading errors
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    log.error(`Failed to load: ${errorDescription} (${errorCode})`);
    if (!isDev && errorCode === -6) { // ERR_FILE_NOT_FOUND
      log.error('Build files not found. Make sure to run "npm run build" first.');
    }
  });

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
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Handle window errors
  mainWindow.webContents.on('crashed', (event, killed) => {
    log.error(`Renderer process crashed. Killed: ${killed}`);
  });

  mainWindow.on('unresponsive', () => {
    log.error('Window became unresponsive');
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
  sendStatusToWindow(`Update available: v${info.version}`);
  showNotification('Update Available', `Version ${info.version} is available and will be downloaded automatically.`);
});

autoUpdater.on('update-not-available', (info) => {
  sendStatusToWindow('You have the latest version!');
});

autoUpdater.on('error', (err) => {
  let errorMessage = 'Update check failed';
  
  // Provide more user-friendly error messages
  if (err.message.includes('ERR_INTERNET_DISCONNECTED')) {
    errorMessage = 'No internet connection';
  } else if (err.message.includes('GitHub')) {
    errorMessage = 'Unable to connect to update server';
  } else if (err.message.includes('404')) {
    errorMessage = 'No updates available yet (no releases published)';
  } else {
    errorMessage = `Update error: ${err.message}`;
  }
  
  sendStatusToWindow(errorMessage);
  log.error('Auto-updater error:', err);
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

// Check for updates (only in production)
function checkForUpdates() {
  if (!isDev) {
    try {
      autoUpdater.checkForUpdatesAndNotify();
    } catch (error) {
      log.error('Error checking for updates:', error);
    }
  }
}

// IPC handlers
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('check-for-updates', async () => {
  try {
    if (isDev) {
      sendStatusToWindow('Update check disabled in development mode');
      return;
    }
    await autoUpdater.checkForUpdatesAndNotify();
  } catch (error) {
    log.error('Error checking for updates:', error);
    sendStatusToWindow('Failed to check for updates: ' + error.message);
  }
});

ipcMain.handle('open-external', async (event, url) => {
  try {
    await shell.openExternal(url);
  } catch (error) {
    log.error('Error opening external URL:', error);
  }
});

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

// Handle certificate errors
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  if (isDev) {
    // Ignore certificate errors in development
    event.preventDefault();
    callback(true);
  } else {
    // Use default behavior in production
    callback(false);
  }
});

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    // Someone tried to run a second instance, focus our window instead
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}
