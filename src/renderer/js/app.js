// State management
const state = {
  currentFilePath: null,
  originalContent: '',
  hasUnsavedChanges: false,
  wordWrap: false,
  darkMode: false,
  statusBarVisible: true,
  lastSearchQuery: '',
  lastSearchDirection: 'down',
  lastSearchCaseSensitive: false,
  currentFont: {
    family: "'Lucida Console', 'Courier New', monospace",
    style: 'normal',
    size: 12
  }
};

// DOM elements
const editor = document.getElementById('editor');
const statusBar = document.getElementById('status-bar');
const statusField = statusBar.querySelector('.status-bar-field');

// Dialog elements
const findDialog = document.getElementById('find-dialog');
const replaceDialog = document.getElementById('replace-dialog');
const gotoDialog = document.getElementById('goto-dialog');
const fontDialog = document.getElementById('font-dialog');
const aboutDialog = document.getElementById('about-dialog');

// Initialize
function init() {
  setupEventListeners();
  setupMenuBar();
  setupDialogListeners();
  setupKeyboardShortcuts();
  updateTitle();
  updateStatusBar();
}

function setupEventListeners() {
  // Track changes for unsaved detection
  editor.addEventListener('input', () => {
    state.hasUnsavedChanges = editor.value !== state.originalContent;
    updateTitle();
  });

  // Update cursor position in status bar
  editor.addEventListener('keyup', updateStatusBar);
  editor.addEventListener('click', updateStatusBar);
  editor.addEventListener('mouseup', updateStatusBar);

  // Handle keyboard shortcuts for dialogs
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllDialogs();
    }
  });
}

// Custom in-window menu bar
function setupMenuBar() {
  const menuItems = document.querySelectorAll('.menu-item');
  let activeMenu = null;

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.menu-bar')) {
      closeMenu();
    }
  });

  // Menu item click handling
  menuItems.forEach(item => {
    const title = item.querySelector('.menu-title');

    title.addEventListener('click', (e) => {
      e.stopPropagation();
      if (activeMenu === item) {
        closeMenu();
      } else {
        openMenu(item);
      }
    });

    // Hover to switch menus when one is open
    title.addEventListener('mouseenter', () => {
      if (activeMenu && activeMenu !== item) {
        openMenu(item);
      }
    });
  });

  // Menu option click handling
  document.querySelectorAll('.menu-option').forEach(option => {
    option.addEventListener('click', (e) => {
      if (option.classList.contains('disabled')) return;

      const action = option.dataset.action;
      if (action) {
        handleMenuAction(action, option);
      }
      closeMenu();
    });
  });

  function openMenu(item) {
    closeMenu();
    item.classList.add('active');
    activeMenu = item;
  }

  function closeMenu() {
    if (activeMenu) {
      activeMenu.classList.remove('active');
      activeMenu = null;
    }
  }
}

// Handle menu actions
function handleMenuAction(action, element) {
  switch (action) {
    // File menu
    case 'new': handleNew(); break;
    case 'open': handleOpen(); break;
    case 'save': handleSave(); break;
    case 'saveAs': handleSaveAs(); break;
    case 'print': handlePrint(); break;
    case 'exit': handleExit(); break;

    // Edit menu
    case 'undo': document.execCommand('undo'); break;
    case 'cut': document.execCommand('cut'); break;
    case 'copy': document.execCommand('copy'); break;
    case 'paste': navigator.clipboard.readText().then(text => {
      const start = editor.selectionStart;
      const end = editor.selectionEnd;
      editor.value = editor.value.slice(0, start) + text + editor.value.slice(end);
      editor.selectionStart = editor.selectionEnd = start + text.length;
      state.hasUnsavedChanges = editor.value !== state.originalContent;
      updateTitle();
    }); break;
    case 'delete':
      const start = editor.selectionStart;
      const end = editor.selectionEnd;
      if (start !== end) {
        editor.value = editor.value.slice(0, start) + editor.value.slice(end);
        editor.selectionStart = editor.selectionEnd = start;
        state.hasUnsavedChanges = editor.value !== state.originalContent;
        updateTitle();
      }
      break;
    case 'find': openDialog('find-dialog'); break;
    case 'findNext': handleFindNext(); break;
    case 'replace': openDialog('replace-dialog'); break;
    case 'goTo': openDialog('goto-dialog'); break;
    case 'selectAll': editor.select(); break;
    case 'timeDate': handleTimeDate(); break;

    // Format menu
    case 'wordWrap':
      state.wordWrap = !state.wordWrap;
      handleWordWrap(state.wordWrap);
      element.classList.toggle('checked', state.wordWrap);
      break;
    case 'darkMode':
      state.darkMode = !state.darkMode;
      handleDarkMode(state.darkMode);
      element.classList.toggle('checked', state.darkMode);
      break;
    case 'font': openFontDialog(); break;

    // View menu
    case 'statusBar':
      state.statusBarVisible = !state.statusBarVisible;
      handleStatusBar(state.statusBarVisible);
      element.classList.toggle('checked', state.statusBarVisible);
      break;

    // Help menu
    case 'about': openDialog('about-dialog'); break;
  }
  editor.focus();
}

// Handle exit
async function handleExit() {
  const canClose = await window.checkUnsavedBeforeClose();
  if (canClose) {
    window.electronAPI.quit();
  }
}

// Keyboard shortcuts
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    const ctrl = e.ctrlKey || e.metaKey;

    if (ctrl && e.key === 'n') { e.preventDefault(); handleNew(); }
    else if (ctrl && e.key === 'o') { e.preventDefault(); handleOpen(); }
    else if (ctrl && e.key === 's' && e.shiftKey) { e.preventDefault(); handleSaveAs(); }
    else if (ctrl && e.key === 's') { e.preventDefault(); handleSave(); }
    else if (ctrl && e.key === 'p') { e.preventDefault(); handlePrint(); }
    else if (ctrl && e.key === 'f') { e.preventDefault(); openDialog('find-dialog'); }
    else if (e.key === 'F3') { e.preventDefault(); handleFindNext(); }
    else if (ctrl && e.key === 'h') { e.preventDefault(); openDialog('replace-dialog'); }
    else if (ctrl && e.key === 'g') { e.preventDefault(); openDialog('goto-dialog'); }
    else if (e.key === 'F5') { e.preventDefault(); handleTimeDate(); }
  });
}

function setupDialogListeners() {
  // Setup close buttons for all dialogs (using data-close attribute)
  document.querySelectorAll('[data-close]').forEach(button => {
    button.addEventListener('click', () => {
      const dialogId = button.dataset.close;
      closeDialog(dialogId);
    });
  });

  // Find dialog
  document.getElementById('find-next-btn').addEventListener('click', () => {
    const query = document.getElementById('find-input').value;
    const matchCase = document.getElementById('find-match-case').checked;
    const direction = document.querySelector('input[name="find-direction"]:checked').value;
    performFind(query, matchCase, direction);
  });

  document.getElementById('find-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      document.getElementById('find-next-btn').click();
    }
  });

  // Replace dialog
  document.getElementById('replace-find-btn').addEventListener('click', () => {
    const query = document.getElementById('replace-find-input').value;
    const matchCase = document.getElementById('replace-match-case').checked;
    performFind(query, matchCase, 'down');
  });

  document.getElementById('replace-btn').addEventListener('click', () => {
    performReplace();
  });

  document.getElementById('replace-all-btn').addEventListener('click', () => {
    performReplaceAll();
  });

  // Go To dialog
  document.getElementById('goto-btn').addEventListener('click', () => {
    const lineNum = parseInt(document.getElementById('goto-line-input').value, 10);
    performGoTo(lineNum);
  });

  document.getElementById('goto-line-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      document.getElementById('goto-btn').click();
    }
  });

  // Font dialog
  document.getElementById('font-ok-btn').addEventListener('click', () => {
    applyFont();
    closeDialog('font-dialog');
  });

  // Font listbox click handlers
  document.querySelectorAll('.font-listbox').forEach(listbox => {
    listbox.addEventListener('click', (e) => {
      const item = e.target.closest('.font-listbox-item');
      if (!item) return;

      // Remove selection from siblings
      listbox.querySelectorAll('.font-listbox-item').forEach(i => i.classList.remove('selected'));
      // Add selection to clicked item
      item.classList.add('selected');

      // Update the corresponding input field
      const inputId = listbox.id.replace('-list', '-input');
      document.getElementById(inputId).value = item.textContent;

      // Update preview
      updateFontSample();
    });
  });
}

// Update window title
function updateTitle() {
  const filename = state.currentFilePath
    ? state.currentFilePath.split(/[\\/]/).pop()
    : 'Untitled';
  const modified = state.hasUnsavedChanges ? '*' : '';
  const title = `${modified}${filename} - Notepad`;
  document.title = title;
  window.electronAPI.setTitle(title);
}

// Update status bar with line and column
function updateStatusBar() {
  const text = editor.value;
  const cursorPos = editor.selectionStart;

  const textBeforeCursor = text.substring(0, cursorPos);
  const lines = textBeforeCursor.split('\n');
  const lineNumber = lines.length;
  const columnNumber = lines[lines.length - 1].length + 1;

  statusField.textContent = `Ln ${lineNumber}, Col ${columnNumber}`;
}

// File operations
async function handleNew() {
  if (state.hasUnsavedChanges) {
    const result = await checkUnsavedChanges();
    if (result === 2) return; // Cancel
    if (result === 0) {
      const saved = await handleSave();
      if (!saved) return;
    }
  }

  editor.value = '';
  state.currentFilePath = null;
  state.originalContent = '';
  state.hasUnsavedChanges = false;
  updateTitle();
  updateStatusBar();
  editor.focus();
}

async function handleOpen() {
  if (state.hasUnsavedChanges) {
    const result = await checkUnsavedChanges();
    if (result === 2) return;
    if (result === 0) {
      const saved = await handleSave();
      if (!saved) return;
    }
  }

  const result = await window.electronAPI.openFile();
  if (result.success) {
    editor.value = result.content;
    state.currentFilePath = result.path;
    state.originalContent = result.content;
    state.hasUnsavedChanges = false;
    updateTitle();
    updateStatusBar();
    editor.focus();
  }
}

async function handleSave() {
  if (!state.currentFilePath) {
    return handleSaveAs();
  }

  const result = await window.electronAPI.saveFile({
    path: state.currentFilePath,
    content: editor.value
  });

  if (result.success) {
    state.originalContent = editor.value;
    state.hasUnsavedChanges = false;
    updateTitle();
    return true;
  }
  return false;
}

async function handleSaveAs() {
  const result = await window.electronAPI.saveFileAs({
    content: editor.value
  });

  if (result.success) {
    state.currentFilePath = result.path;
    state.originalContent = editor.value;
    state.hasUnsavedChanges = false;
    updateTitle();
    return true;
  }
  return false;
}

async function checkUnsavedChanges() {
  const filename = state.currentFilePath
    ? state.currentFilePath.split(/[\\/]/).pop()
    : 'Untitled';
  return await window.electronAPI.showUnsavedChangesDialog(filename);
}

function handlePrint() {
  window.electronAPI.print();
}

// Edit operations
function handleTimeDate() {
  const now = new Date();
  const timeString = now.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  const dateString = now.toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric'
  });

  const cursorPos = editor.selectionStart;
  const text = editor.value;
  const insertion = `${timeString} ${dateString}`;

  editor.value = text.slice(0, cursorPos) + insertion + text.slice(editor.selectionEnd);
  editor.selectionStart = editor.selectionEnd = cursorPos + insertion.length;
  editor.focus();

  state.hasUnsavedChanges = editor.value !== state.originalContent;
  updateTitle();
}

// Format operations
function handleWordWrap(enabled) {
  state.wordWrap = enabled;
  if (enabled) {
    editor.classList.add('word-wrap');
    editor.classList.remove('no-wrap');
  } else {
    editor.classList.remove('word-wrap');
    editor.classList.add('no-wrap');
  }
}

function handleDarkMode(enabled) {
  state.darkMode = enabled;
  document.body.classList.toggle('dark-mode', enabled);
}

function handleStatusBar(visible) {
  state.statusBarVisible = visible;
  if (visible) {
    statusBar.classList.remove('hidden');
  } else {
    statusBar.classList.add('hidden');
  }
}

// Dialog operations
function openDialog(dialogId) {
  closeAllDialogs();
  document.getElementById(dialogId).classList.remove('hidden');

  // Focus first input
  const firstInput = document.getElementById(dialogId).querySelector('input');
  if (firstInput) {
    firstInput.focus();
    firstInput.select();
  }
}

function closeDialog(dialogId) {
  document.getElementById(dialogId).classList.add('hidden');
  editor.focus();
}

function closeAllDialogs() {
  document.querySelectorAll('.dialog-overlay').forEach(dialog => {
    dialog.classList.add('hidden');
  });
}

// Make closeDialog available globally for onclick handlers
window.closeDialog = closeDialog;

// Find operations
function performFind(query, matchCase, direction) {
  if (!query) return;

  state.lastSearchQuery = query;
  state.lastSearchCaseSensitive = matchCase;
  state.lastSearchDirection = direction;

  const text = editor.value;
  const searchText = matchCase ? text : text.toLowerCase();
  const searchQuery = matchCase ? query : query.toLowerCase();

  let startPos;
  if (direction === 'down') {
    startPos = editor.selectionEnd;
    const foundIndex = searchText.indexOf(searchQuery, startPos);
    if (foundIndex !== -1) {
      editor.setSelectionRange(foundIndex, foundIndex + query.length);
      editor.focus();
    } else {
      alert('Cannot find "' + query + '"');
    }
  } else {
    startPos = editor.selectionStart;
    const searchArea = searchText.substring(0, startPos);
    const foundIndex = searchArea.lastIndexOf(searchQuery);
    if (foundIndex !== -1) {
      editor.setSelectionRange(foundIndex, foundIndex + query.length);
      editor.focus();
    } else {
      alert('Cannot find "' + query + '"');
    }
  }
}

function handleFindNext() {
  if (state.lastSearchQuery) {
    performFind(state.lastSearchQuery, state.lastSearchCaseSensitive, state.lastSearchDirection);
  } else {
    openDialog('find-dialog');
  }
}

// Replace operations
function performReplace() {
  const findQuery = document.getElementById('replace-find-input').value;
  const replaceWith = document.getElementById('replace-with-input').value;
  const matchCase = document.getElementById('replace-match-case').checked;

  if (!findQuery) return;

  const selectedText = editor.value.substring(editor.selectionStart, editor.selectionEnd);
  const compareSelected = matchCase ? selectedText : selectedText.toLowerCase();
  const compareQuery = matchCase ? findQuery : findQuery.toLowerCase();

  if (compareSelected === compareQuery) {
    const start = editor.selectionStart;
    editor.value = editor.value.substring(0, start) + replaceWith + editor.value.substring(editor.selectionEnd);
    editor.setSelectionRange(start, start + replaceWith.length);
    state.hasUnsavedChanges = editor.value !== state.originalContent;
    updateTitle();
  }

  performFind(findQuery, matchCase, 'down');
}

function performReplaceAll() {
  const findQuery = document.getElementById('replace-find-input').value;
  const replaceWith = document.getElementById('replace-with-input').value;
  const matchCase = document.getElementById('replace-match-case').checked;

  if (!findQuery) return;

  let text = editor.value;
  let count = 0;

  if (matchCase) {
    while (text.includes(findQuery)) {
      text = text.replace(findQuery, replaceWith);
      count++;
    }
  } else {
    const regex = new RegExp(findQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const matches = text.match(regex);
    count = matches ? matches.length : 0;
    text = text.replace(regex, replaceWith);
  }

  if (count > 0) {
    editor.value = text;
    state.hasUnsavedChanges = editor.value !== state.originalContent;
    updateTitle();
  }

  alert(`Replaced ${count} occurrence(s).`);
}

// Go To operations
function performGoTo(lineNum) {
  if (!lineNum || lineNum < 1) return;

  const lines = editor.value.split('\n');
  if (lineNum > lines.length) {
    alert('The line number is beyond the total number of lines');
    return;
  }

  let charIndex = 0;
  for (let i = 0; i < lineNum - 1; i++) {
    charIndex += lines[i].length + 1; // +1 for newline
  }

  editor.setSelectionRange(charIndex, charIndex);
  editor.focus();
  closeDialog('goto-dialog');
  updateStatusBar();
}

// Font operations
function openFontDialog() {
  const familyList = document.getElementById('font-family-list');
  const styleList = document.getElementById('font-style-list');
  const sizeList = document.getElementById('font-size-list');

  // Clear all selections first
  document.querySelectorAll('.font-listbox-item').forEach(item => item.classList.remove('selected'));

  // Select current font family
  let familyFound = false;
  familyList.querySelectorAll('.font-listbox-item').forEach(item => {
    if (state.currentFont.family.includes(item.textContent) || item.dataset.value === state.currentFont.family) {
      item.classList.add('selected');
      document.getElementById('font-family-input').value = item.textContent;
      familyFound = true;
    }
  });
  if (!familyFound) {
    const firstItem = familyList.querySelector('.font-listbox-item');
    firstItem.classList.add('selected');
    document.getElementById('font-family-input').value = firstItem.textContent;
  }

  // Select current font style
  let styleFound = false;
  styleList.querySelectorAll('.font-listbox-item').forEach(item => {
    if (item.dataset.value === state.currentFont.style) {
      item.classList.add('selected');
      document.getElementById('font-style-input').value = item.textContent;
      styleFound = true;
    }
  });
  if (!styleFound) {
    const firstItem = styleList.querySelector('.font-listbox-item');
    firstItem.classList.add('selected');
    document.getElementById('font-style-input').value = firstItem.textContent;
  }

  // Select current font size
  let sizeFound = false;
  sizeList.querySelectorAll('.font-listbox-item').forEach(item => {
    if (parseInt(item.dataset.value, 10) === state.currentFont.size) {
      item.classList.add('selected');
      document.getElementById('font-size-input').value = item.textContent;
      sizeFound = true;
    }
  });
  if (!sizeFound) {
    const firstItem = sizeList.querySelector('.font-listbox-item');
    firstItem.classList.add('selected');
    document.getElementById('font-size-input').value = firstItem.textContent;
  }

  updateFontSample();
  openDialog('font-dialog');
}

function updateFontSample() {
  const familyItem = document.querySelector('#font-family-list .font-listbox-item.selected');
  const styleItem = document.querySelector('#font-style-list .font-listbox-item.selected');
  const sizeItem = document.querySelector('#font-size-list .font-listbox-item.selected');

  if (!familyItem || !styleItem || !sizeItem) return;

  const family = familyItem.dataset.value;
  const style = styleItem.dataset.value;
  const size = sizeItem.dataset.value;
  const sample = document.getElementById('font-sample');

  sample.style.fontFamily = family;
  sample.style.fontSize = size + 'px';

  if (style.includes('bold')) {
    sample.style.fontWeight = 'bold';
  } else {
    sample.style.fontWeight = 'normal';
  }

  if (style.includes('italic')) {
    sample.style.fontStyle = 'italic';
  } else {
    sample.style.fontStyle = 'normal';
  }
}

function applyFont() {
  const familyItem = document.querySelector('#font-family-list .font-listbox-item.selected');
  const styleItem = document.querySelector('#font-style-list .font-listbox-item.selected');
  const sizeItem = document.querySelector('#font-size-list .font-listbox-item.selected');

  if (!familyItem || !styleItem || !sizeItem) return;

  const family = familyItem.dataset.value;
  const style = styleItem.dataset.value;
  const size = parseInt(sizeItem.dataset.value, 10);

  state.currentFont = { family, style, size };

  editor.style.fontFamily = family;
  editor.style.fontSize = size + 'px';

  if (style.includes('bold')) {
    editor.style.fontWeight = 'bold';
  } else {
    editor.style.fontWeight = 'normal';
  }

  if (style.includes('italic')) {
    editor.style.fontStyle = 'italic';
  } else {
    editor.style.fontStyle = 'normal';
  }
}

// Check unsaved changes before closing (called from main process)
window.checkUnsavedBeforeClose = async function() {
  if (state.hasUnsavedChanges) {
    const result = await checkUnsavedChanges();
    if (result === 2) return false; // Cancel
    if (result === 0) {
      const saved = await handleSave();
      if (!saved) return false;
    }
  }
  return true;
};

// Initialize application
init();
