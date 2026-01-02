const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('node:path');
const { setupFileHandlers } = require('./fileOperations');

// Set app name for macOS menu bar
app.name = 'Notepad';

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 640,
    height: 480,
    minWidth: 320,
    minHeight: 240,
    autoHideMenuBar: true,
    icon: path.join(__dirname, '../../assets/icons/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // Remove the application menu (use in-app menu instead)
  Menu.setApplicationMenu(null);

  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  // Handle window title updates
  ipcMain.on('window:setTitle', (event, title) => {
    mainWindow.setTitle(title);
  });

  // Handle app quit request
  ipcMain.on('app:quit', () => {
    app.quit();
  });

  // Handle close with unsaved changes check
  mainWindow.on('close', async (e) => {
    const shouldClose = await mainWindow.webContents.executeJavaScript('window.checkUnsavedBeforeClose()');
    if (!shouldClose) {
      e.preventDefault();
    }
  });
}

app.whenReady().then(() => {
  // Set macOS About panel
  app.setAboutPanelOptions({
    applicationName: 'Notepad',
    applicationVersion: '1.0',
    version: '',
    copyright: 'A Windows 95/98 Notepad clone\nBuilt with Electron',
    iconPath: path.join(__dirname, '../../assets/icons/icon.png')
  });

  createWindow();
  setupFileHandlers(mainWindow);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Get main window reference for dialog handlers
function getMainWindow() {
  return mainWindow;
}

module.exports = { getMainWindow };
