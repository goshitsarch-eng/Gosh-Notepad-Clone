<script>
  import { onMount } from 'svelte';
  import { initNotepadApp } from './lib/notepad';

  onMount(() => {
    initNotepadApp();
  });
</script>

<div class="notepad-container">
  <!-- Custom Menu Bar -->
  <div class="menu-bar">
    <div class="menu-item" data-menu="file">
      <span class="menu-title">File</span>
      <div class="menu-dropdown">
        <div class="menu-option" data-action="new">New<span class="shortcut">Ctrl+N</span></div>
        <div class="menu-option" data-action="open">Open...<span class="shortcut">Ctrl+O</span></div>
        <div class="menu-option" data-action="save">Save<span class="shortcut">Ctrl+S</span></div>
        <div class="menu-option" data-action="saveAs">Save As...</div>
        <div class="menu-separator"></div>
        <div class="menu-option disabled">Page Setup...</div>
        <div class="menu-option" data-action="print">Print...<span class="shortcut">Ctrl+P</span></div>
        <div class="menu-separator"></div>
        <div class="menu-option" data-action="exit">Exit</div>
      </div>
    </div>
    <div class="menu-item" data-menu="edit">
      <span class="menu-title">Edit</span>
      <div class="menu-dropdown">
        <div class="menu-option" data-action="undo">Undo<span class="shortcut">Ctrl+Z</span></div>
        <div class="menu-separator"></div>
        <div class="menu-option" data-action="cut">Cut<span class="shortcut">Ctrl+X</span></div>
        <div class="menu-option" data-action="copy">Copy<span class="shortcut">Ctrl+C</span></div>
        <div class="menu-option" data-action="paste">Paste<span class="shortcut">Ctrl+V</span></div>
        <div class="menu-option" data-action="delete">Delete<span class="shortcut">Del</span></div>
        <div class="menu-separator"></div>
        <div class="menu-option" data-action="find">Find...<span class="shortcut">Ctrl+F</span></div>
        <div class="menu-option" data-action="findNext">Find Next<span class="shortcut">F3</span></div>
        <div class="menu-option" data-action="replace">Replace...<span class="shortcut">Ctrl+H</span></div>
        <div class="menu-option" data-action="goTo">Go To...<span class="shortcut">Ctrl+G</span></div>
        <div class="menu-separator"></div>
        <div class="menu-option" data-action="selectAll">Select All<span class="shortcut">Ctrl+A</span></div>
        <div class="menu-option" data-action="timeDate">Time/Date<span class="shortcut">F5</span></div>
      </div>
    </div>
    <div class="menu-item" data-menu="format">
      <span class="menu-title">Format</span>
      <div class="menu-dropdown">
        <div class="menu-option checkable" data-action="wordWrap" id="menu-wordwrap">Word Wrap</div>
        <div class="menu-option checkable" data-action="darkMode" id="menu-darkmode">Dark Mode</div>
        <div class="menu-option" data-action="font">Font...</div>
      </div>
    </div>
    <div class="menu-item" data-menu="view">
      <span class="menu-title">View</span>
      <div class="menu-dropdown">
        <div class="menu-option checkable checked" data-action="statusBar" id="menu-statusbar">Status Bar</div>
      </div>
    </div>
    <div class="menu-item" data-menu="help">
      <span class="menu-title">Help</span>
      <div class="menu-dropdown">
        <div class="menu-option" data-action="about">About Notepad</div>
      </div>
    </div>
  </div>
  <textarea id="editor" class="notepad-editor no-wrap" spellcheck="false"></textarea>
  <div id="status-bar" class="status-bar">
    <div class="status-bar-field">Ln 1, Col 1</div>
  </div>
</div>

<!-- Find Dialog -->
<div id="find-dialog" class="dialog-overlay hidden">
  <div class="window dialog-window">
    <div class="title-bar">
      <div class="title-bar-text">Find</div>
      <div class="title-bar-controls">
        <button aria-label="Close" data-close="find-dialog">&times;</button>
      </div>
    </div>
    <div class="window-body">
      <div class="field-row-stacked">
        <label for="find-input">Find what:</label>
        <input type="text" id="find-input" />
      </div>
      <div class="field-row" style="margin-top: 8px;">
        <input type="checkbox" id="find-match-case" />
        <label for="find-match-case">Match case</label>
      </div>
      <fieldset style="margin-top: 8px;">
        <legend>Direction</legend>
        <div class="field-row">
          <input type="radio" id="find-dir-up" name="find-direction" value="up" />
          <label for="find-dir-up">Up</label>
          <input type="radio" id="find-dir-down" name="find-direction" value="down" checked />
          <label for="find-dir-down">Down</label>
        </div>
      </fieldset>
      <div class="button-row" style="margin-top: 12px;">
        <button id="find-next-btn">Find Next</button>
        <button data-close="find-dialog">Cancel</button>
      </div>
    </div>
  </div>
</div>

<!-- Replace Dialog -->
<div id="replace-dialog" class="dialog-overlay hidden">
  <div class="window dialog-window">
    <div class="title-bar">
      <div class="title-bar-text">Replace</div>
      <div class="title-bar-controls">
        <button aria-label="Close" data-close="replace-dialog">&times;</button>
      </div>
    </div>
    <div class="window-body">
      <div class="field-row-stacked">
        <label for="replace-find-input">Find what:</label>
        <input type="text" id="replace-find-input" />
      </div>
      <div class="field-row-stacked" style="margin-top: 8px;">
        <label for="replace-with-input">Replace with:</label>
        <input type="text" id="replace-with-input" />
      </div>
      <div class="field-row" style="margin-top: 8px;">
        <input type="checkbox" id="replace-match-case" />
        <label for="replace-match-case">Match case</label>
      </div>
      <div class="button-row" style="margin-top: 12px;">
        <button id="replace-find-btn">Find Next</button>
        <button id="replace-btn">Replace</button>
        <button id="replace-all-btn">Replace All</button>
        <button data-close="replace-dialog">Cancel</button>
      </div>
    </div>
  </div>
</div>

<!-- Go To Dialog -->
<div id="goto-dialog" class="dialog-overlay hidden">
  <div class="window dialog-window dialog-small">
    <div class="title-bar">
      <div class="title-bar-text">Go To Line</div>
      <div class="title-bar-controls">
        <button aria-label="Close" data-close="goto-dialog">&times;</button>
      </div>
    </div>
    <div class="window-body">
      <div class="field-row-stacked">
        <label for="goto-line-input">Line number:</label>
        <input type="number" id="goto-line-input" min="1" />
      </div>
      <div class="button-row" style="margin-top: 12px;">
        <button id="goto-btn">Go To</button>
        <button data-close="goto-dialog">Cancel</button>
      </div>
    </div>
  </div>
</div>

<!-- Font Dialog -->
<div id="font-dialog" class="dialog-overlay hidden">
  <div class="window dialog-window dialog-large">
    <div class="title-bar">
      <div class="title-bar-text">Font</div>
      <div class="title-bar-controls">
        <button aria-label="Close" data-close="font-dialog">&times;</button>
      </div>
    </div>
    <div class="window-body">
      <div class="font-selectors">
        <div class="font-column">
          <label>Font:</label>
          <input type="text" id="font-family-input" readonly />
          <div class="font-listbox" id="font-family-list">
            <div class="font-listbox-item" data-value="'Fixedsys Excelsior', Fixedsys, monospace">Fixedsys</div>
            <div class="font-listbox-item selected" data-value="'Lucida Console', monospace">Lucida Console</div>
            <div class="font-listbox-item" data-value="'Courier New', monospace">Courier New</div>
            <div class="font-listbox-item" data-value="Consolas, monospace">Consolas</div>
            <div class="font-listbox-item" data-value="Monaco, monospace">Monaco</div>
            <div class="font-listbox-item" data-value="'DejaVu Sans Mono', monospace">DejaVu Sans Mono</div>
            <div class="font-listbox-item" data-value="'Liberation Mono', monospace">Liberation Mono</div>
            <div class="font-listbox-item" data-value="'Ubuntu Mono', monospace">Ubuntu Mono</div>
            <div class="font-listbox-item" data-value="'Noto Sans Mono', monospace">Noto Sans Mono</div>
            <div class="font-listbox-item" data-value="monospace">System Monospace</div>
          </div>
        </div>
        <div class="font-column-small">
          <label>Font Style:</label>
          <input type="text" id="font-style-input" readonly />
          <div class="font-listbox" id="font-style-list">
            <div class="font-listbox-item selected" data-value="normal">Regular</div>
            <div class="font-listbox-item" data-value="italic">Italic</div>
            <div class="font-listbox-item" data-value="bold">Bold</div>
            <div class="font-listbox-item" data-value="bold italic">Bold Italic</div>
          </div>
        </div>
        <div class="font-column-small">
          <label>Size:</label>
          <input type="text" id="font-size-input" readonly />
          <div class="font-listbox" id="font-size-list">
            <div class="font-listbox-item" data-value="8">8</div>
            <div class="font-listbox-item" data-value="9">9</div>
            <div class="font-listbox-item" data-value="10">10</div>
            <div class="font-listbox-item" data-value="11">11</div>
            <div class="font-listbox-item selected" data-value="12">12</div>
            <div class="font-listbox-item" data-value="14">14</div>
            <div class="font-listbox-item" data-value="16">16</div>
            <div class="font-listbox-item" data-value="18">18</div>
            <div class="font-listbox-item" data-value="20">20</div>
            <div class="font-listbox-item" data-value="24">24</div>
          </div>
        </div>
      </div>
      <fieldset style="margin-top: 12px;">
        <legend>Sample</legend>
        <div id="font-sample">AaBbYyZz</div>
      </fieldset>
      <div class="button-row" style="margin-top: 12px; justify-content: flex-end;">
        <button id="font-ok-btn">OK</button>
        <button data-close="font-dialog">Cancel</button>
      </div>
    </div>
  </div>
</div>

<!-- About Dialog -->
<div id="about-dialog" class="dialog-overlay hidden">
  <div class="window dialog-window">
    <div class="title-bar">
      <div class="title-bar-text">About Notepad</div>
    </div>
    <div class="window-body about-content">
      <div class="about-icon">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <rect x="4" y="2" width="24" height="28" fill="#fff" stroke="#000" />
          <line x1="8" y1="8" x2="24" y2="8" stroke="#000" />
          <line x1="8" y1="12" x2="24" y2="12" stroke="#000" />
          <line x1="8" y1="16" x2="24" y2="16" stroke="#000" />
          <line x1="8" y1="20" x2="18" y2="20" stroke="#000" />
        </svg>
      </div>
      <h3>Notepad</h3>
      <p>Version 2.0.1</p>
      <hr />
      <p class="about-description">
        A Windows 95/98 Notepad clone<br />
        Built with Tauri by Goshitsarch
      </p>
      <button data-close="about-dialog" style="margin-top: 12px;">OK</button>
    </div>
  </div>
</div>

<!-- Unsaved Changes Dialog -->
<div id="unsaved-dialog" class="dialog-overlay hidden">
  <div class="window dialog-window">
    <div class="title-bar">
      <div class="title-bar-text">Notepad</div>
    </div>
    <div class="window-body">
      <div style="display: flex; align-items: flex-start; gap: 12px;">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style="flex-shrink: 0;">
          <circle cx="16" cy="16" r="14" fill="#ffff00" stroke="#000" />
          <rect x="14" y="8" width="4" height="12" fill="#000" />
          <rect x="14" y="22" width="4" height="4" fill="#000" />
        </svg>
        <p id="unsaved-message" style="margin: 0;">Do you want to save changes to Untitled?</p>
      </div>
      <div class="button-row" style="margin-top: 16px; justify-content: flex-end;">
        <button id="unsaved-save-btn">Save</button>
        <button id="unsaved-dontsave-btn">Don't Save</button>
        <button id="unsaved-cancel-btn">Cancel</button>
      </div>
    </div>
  </div>
</div>
