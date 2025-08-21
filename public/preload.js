const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Example: Add methods here if you need to communicate between
  // renderer and main process in the future

  // Get app version
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),

  // Open external links
  openExternal: (url) => ipcRenderer.invoke('open-external', url),

  // Check for updates (we'll implement this later)
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),

  // Platform info
  platform: process.platform,
  version: process.versions
});

// Remove this if you don't need it for security
console.log('Preload script loaded successfully');
