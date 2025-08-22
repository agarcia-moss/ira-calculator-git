const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Get app version
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),

  // Open external links
  openExternal: (url) => ipcRenderer.invoke('open-external', url),

  // Check for updates
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),

  // Platform info
  platform: process.platform,
  version: process.versions,

  // Update-related functions
  onUpdateMessage: (callback) => ipcRenderer.on('update-message', callback),
  removeUpdateListener: (callback) => ipcRenderer.removeListener('update-message', callback)
});

// Remove this if you don't need it for security
console.log('Preload script loaded successfully');
