const { Menu, app } = require('electron');

function createMenu(mainWindow) {
  const isMac = process.platform === 'darwin';

  const template = [
    // macOS app menu
    ...(isMac ? [{
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }] : []),
    {
      label: '&File',
      submenu: [
        {
          label: '&New',
          accelerator: 'CmdOrCtrl+N',
          click: () => mainWindow.webContents.send('menu:new')
        },
        {
          label: '&Open...',
          accelerator: 'CmdOrCtrl+O',
          click: () => mainWindow.webContents.send('menu:open')
        },
        {
          label: '&Save',
          accelerator: 'CmdOrCtrl+S',
          click: () => mainWindow.webContents.send('menu:save')
        },
        {
          label: 'Save &As...',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => mainWindow.webContents.send('menu:saveAs')
        },
        { type: 'separator' },
        {
          label: 'Page Set&up...',
          enabled: false // Not implemented
        },
        {
          label: '&Print...',
          accelerator: 'CmdOrCtrl+P',
          click: () => mainWindow.webContents.send('menu:print')
        },
        { type: 'separator' },
        {
          label: 'E&xit',
          accelerator: isMac ? 'Cmd+Q' : 'Alt+F4',
          click: () => app.quit()
        }
      ]
    },
    {
      label: '&Edit',
      submenu: [
        {
          label: '&Undo',
          accelerator: 'CmdOrCtrl+Z',
          role: 'undo'
        },
        { type: 'separator' },
        {
          label: 'Cu&t',
          accelerator: 'CmdOrCtrl+X',
          role: 'cut'
        },
        {
          label: '&Copy',
          accelerator: 'CmdOrCtrl+C',
          role: 'copy'
        },
        {
          label: '&Paste',
          accelerator: 'CmdOrCtrl+V',
          role: 'paste'
        },
        {
          label: 'De&lete',
          accelerator: 'Delete',
          role: 'delete'
        },
        { type: 'separator' },
        {
          label: '&Find...',
          accelerator: 'CmdOrCtrl+F',
          click: () => mainWindow.webContents.send('menu:find')
        },
        {
          label: 'Find &Next',
          accelerator: 'F3',
          click: () => mainWindow.webContents.send('menu:findNext')
        },
        {
          label: '&Replace...',
          accelerator: 'CmdOrCtrl+H',
          click: () => mainWindow.webContents.send('menu:replace')
        },
        {
          label: '&Go To...',
          accelerator: 'CmdOrCtrl+G',
          click: () => mainWindow.webContents.send('menu:goTo')
        },
        { type: 'separator' },
        {
          label: 'Select &All',
          accelerator: 'CmdOrCtrl+A',
          role: 'selectAll'
        },
        {
          label: 'Time/&Date',
          accelerator: 'F5',
          click: () => mainWindow.webContents.send('menu:timeDate')
        }
      ]
    },
    {
      label: 'F&ormat',
      submenu: [
        {
          id: 'wordWrap',
          label: '&Word Wrap',
          type: 'checkbox',
          checked: false,
          click: (menuItem) => {
            mainWindow.webContents.send('menu:wordWrap', menuItem.checked);
          }
        },
        {
          label: '&Font...',
          click: () => mainWindow.webContents.send('menu:font')
        }
      ]
    },
    {
      label: '&View',
      submenu: [
        {
          id: 'statusBar',
          label: '&Status Bar',
          type: 'checkbox',
          checked: true,
          click: (menuItem) => {
            mainWindow.webContents.send('menu:statusBar', menuItem.checked);
          }
        }
      ]
    },
    {
      label: '&Help',
      submenu: [
        {
          label: '&About Notepad',
          click: () => mainWindow.webContents.send('menu:about')
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

module.exports = { createMenu };
