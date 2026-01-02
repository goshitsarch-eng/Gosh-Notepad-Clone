# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Windows 95/98 Notepad clone built with Tauri (Rust backend + WebView frontend). Uses the 98.css library for authentic retro styling.

**Author:** Goshitsarch
**Repository:** https://github.com/goshitsarch-eng/Gosh-Notepad-Clone

## Development Commands

```bash
npm run dev         # Run the app in development mode
npm run build       # Build for current platform
npm run build:win   # Build for Windows x64
npm run build:mac   # Build for macOS (Apple Silicon)
npm run build:linux # Build for Linux x64
```

**Prerequisites:**
- Rust toolchain (rustup)
- Node.js 18+
- Platform-specific: `libwebkit2gtk-4.1-dev` on Linux, Xcode on macOS, VS C++ Build Tools on Windows

## Architecture

### Tauri Structure

- **Rust Backend** (`src-tauri/`):
  - `main.rs` - App entry point
  - `lib.rs` - Tauri commands (file operations, dialogs, window management)
  - `tauri.conf.json` - App configuration (window size, permissions, bundling)
  - `Cargo.toml` - Rust dependencies

- **WebView Frontend** (`src/`):
  - `index.html` - Main UI with custom Windows 98-style menu bar and modal dialogs
  - `js/app.js` - All UI logic, state management, keyboard shortcuts
  - `styles/main.css` - Windows 98 styling (sunken borders, status bar, menu system)
  - `styles/98.css` - 98.css library (copy from node_modules after npm install)

### Key Patterns

- **State Management**: Single `state` object in `app.js` tracks current file path, content changes, search state, and font settings
- **Menu System**: Custom in-app menu bar with dropdown behavior implemented in `setupMenuBar()`
- **Dialogs**: Modal overlays with `.dialog-overlay.hidden` class toggling, all defined in `index.html`
- **IPC Flow**: Frontend calls `invoke('command_name', {args})` → Tauri routes to Rust `#[tauri::command]` handlers

### Tauri Commands

| Command | Args | Returns | Purpose |
|---------|------|---------|---------|
| `new_file` | - | `FileResult` | Reset document |
| `open_file` | - | `FileResult` | Show picker, read file |
| `save_file` | `path`, `content` | `FileResult` | Write to path |
| `save_file_as` | `content` | `FileResult` | Show save dialog, write |
| `print_document` | - | `Result<()>` | Trigger print |
| `set_window_title` | `title` | `Result<()>` | Update title bar |
| `quit_app` | - | - | Exit application |

### Unsaved Changes Handling

The app tracks modifications via `state.hasUnsavedChanges` (comparing `editor.value` to `state.originalContent`). A custom HTML dialog prompts for save/don't save/cancel. The `window.checkUnsavedBeforeClose()` function handles this flow.

## Build & Distribution

### Build Output Locations

- **macOS**: `src-tauri/target/release/bundle/dmg/`
- **Windows**: `src-tauri/target/release/bundle/nsis/`
- **Linux**: `src-tauri/target/release/bundle/appimage/` and `deb/`

### Icons

Icons are stored in `src-tauri/icons/`:
- `icon.png` - Source icon
- `icon.icns` - macOS
- `icon.ico` - Windows (generate from PNG)
- `32x32.png`, `128x128.png`, `128x128@2x.png` - Required sizes

### macOS Signing

Tauri apps don't require the complex signing process that Electron apps do. Use standard `codesign` and `notarytool` commands.

## File Structure

```
Gosh-Notepad-Clone/
├── src/                      # Frontend
│   ├── index.html
│   ├── js/app.js
│   └── styles/
│       ├── main.css
│       └── 98.css           # Copy from node_modules/98.css/dist/
├── src-tauri/               # Rust backend
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   ├── build.rs
│   ├── icons/
│   └── src/
│       ├── main.rs
│       └── lib.rs
├── assets/icons/            # Source icons
├── package.json
└── README.md
```

## Common Tasks

### Adding a New Command

1. Add `#[tauri::command]` function in `src-tauri/src/lib.rs`
2. Register in `invoke_handler!` macro in `run()` function
3. Call from JS via `invoke('command_name', {args})`

### Updating Window Configuration

Edit `src-tauri/tauri.conf.json` under `app.windows[]`

### Adding Dependencies

- **Rust**: Add to `src-tauri/Cargo.toml`
- **JavaScript**: Add to `package.json`, ensure Tauri CSP allows it

## Setup After Clone

```bash
npm install
cp node_modules/98.css/dist/98.css src/styles/
npm run dev
```
