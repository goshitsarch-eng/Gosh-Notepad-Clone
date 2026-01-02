const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // File operations
  newFile: () => ipcRenderer.invoke('file:new'),
  openFile: () => ipcRenderer.invoke('file:open'),
  saveFile: (data) => ipcRenderer.invoke('file:save', data),
  saveFileAs: (data) => ipcRenderer.invoke('file:saveAs', data),

  // Dialog operations
  showUnsavedChangesDialog: (filename) => ipcRenderer.invoke('dialog:unsavedChanges', { filename }),

  // Print
  print: () => ipcRenderer.invoke('print'),

  // Window title
  setTitle: (title) => ipcRenderer.send('window:setTitle', title),

  // App control
  quit: () => ipcRenderer.send('app:quit'),

  // Menu event listeners
  onMenuNew: (callback) => ipcRenderer.on('menu:new', (event) => callback()),
  onMenuOpen: (callback) => ipcRenderer.on('menu:open', (event) => callback()),
  onMenuSave: (callback) => ipcRenderer.on('menu:save', (event) => callback()),
  onMenuSaveAs: (callback) => ipcRenderer.on('menu:saveAs', (event) => callback()),
  onMenuPrint: (callback) => ipcRenderer.on('menu:print', (event) => callback()),
  onMenuFind: (callback) => ipcRenderer.on('menu:find', (event) => callback()),
  onMenuFindNext: (callback) => ipcRenderer.on('menu:findNext', (event) => callback()),
  onMenuReplace: (callback) => ipcRenderer.on('menu:replace', (event) => callback()),
  onMenuGoTo: (callback) => ipcRenderer.on('menu:goTo', (event) => callback()),
  onMenuTimeDate: (callback) => ipcRenderer.on('menu:timeDate', (event) => callback()),
  onMenuWordWrap: (callback) => ipcRenderer.on('menu:wordWrap', (event, enabled) => callback(enabled)),
  onMenuFont: (callback) => ipcRenderer.on('menu:font', (event) => callback()),
  onMenuStatusBar: (callback) => ipcRenderer.on('menu:statusBar', (event, visible) => callback(visible)),
  onMenuAbout: (callback) => ipcRenderer.on('menu:about', (event) => callback()),

  // Editor actions from dialogs
  onFind: (callback) => ipcRenderer.on('action:find', (event, data) => callback(data)),
  onReplace: (callback) => ipcRenderer.on('action:replace', (event, data) => callback(data)),
  onGoToLine: (callback) => ipcRenderer.on('action:goToLine', (event, data) => callback(data)),
  onSetFont: (callback) => ipcRenderer.on('action:setFont', (event, data) => callback(data)),

  // Dialog communication
  sendFindRequest: (data) => ipcRenderer.send('dialog:find', data),
  sendReplaceRequest: (data) => ipcRenderer.send('dialog:replace', data),
  sendGoToRequest: (data) => ipcRenderer.send('dialog:goTo', data),
  sendFontRequest: (data) => ipcRenderer.send('dialog:font', data),
  closeDialog: () => ipcRenderer.send('dialog:close'),

  // Get editor content for dialogs
  getEditorContent: () => ipcRenderer.invoke('editor:getContent'),
  getEditorSelection: () => ipcRenderer.invoke('editor:getSelection'),
  getCurrentFont: () => ipcRenderer.invoke('editor:getCurrentFont')
});
