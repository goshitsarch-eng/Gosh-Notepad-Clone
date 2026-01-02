const { ipcMain, dialog } = require('electron');
const fs = require('fs');
const path = require('path');

function setupFileHandlers(mainWindow) {
  // New file
  ipcMain.handle('file:new', async () => {
    return { success: true };
  });

  // Open file
  ipcMain.handle('file:open', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
      filters: [
        { name: 'Text Documents', extensions: ['txt'] },
        { name: 'All Files', extensions: ['*'] }
      ],
      properties: ['openFile']
    });

    if (!canceled && filePaths.length > 0) {
      try {
        const content = fs.readFileSync(filePaths[0], 'utf-8');
        return { success: true, path: filePaths[0], content };
      } catch (err) {
        return { success: false, error: err.message };
      }
    }
    return { success: false };
  });

  // Save file
  ipcMain.handle('file:save', async (event, { path: filePath, content }) => {
    try {
      fs.writeFileSync(filePath, content, 'utf-8');
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // Save As
  ipcMain.handle('file:saveAs', async (event, { content }) => {
    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
      filters: [
        { name: 'Text Documents', extensions: ['txt'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });

    if (!canceled && filePath) {
      try {
        fs.writeFileSync(filePath, content, 'utf-8');
        return { success: true, path: filePath };
      } catch (err) {
        return { success: false, error: err.message };
      }
    }
    return { success: false };
  });

  // Unsaved changes confirmation dialog
  ipcMain.handle('dialog:unsavedChanges', async (event, { filename }) => {
    const result = await dialog.showMessageBox(mainWindow, {
      type: 'warning',
      title: 'Notepad',
      message: `Do you want to save changes to ${filename}?`,
      buttons: ['Save', "Don't Save", 'Cancel'],
      defaultId: 0,
      cancelId: 2,
      noLink: true
    });
    return result.response; // 0=Save, 1=Don't Save, 2=Cancel
  });

  // Print
  ipcMain.handle('print', async () => {
    mainWindow.webContents.print({}, (success, errorType) => {
      if (!success) {
        console.error('Print failed:', errorType);
      }
    });
  });
}

module.exports = { setupFileHandlers };
