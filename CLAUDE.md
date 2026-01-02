# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Windows 95/98 Notepad clone built with Electron. Uses the 98.css library for authentic retro styling.

## Development Commands

```bash
npm start          # Run the app in development mode
npm run build      # Build for current platform
npm run build:win  # Build for Windows (nsis + portable)
npm run build:mac  # Build for macOS (dir output, unsigned)
npm run build:linux # Build for Linux (AppImage + deb)
```

## Architecture

### Process Structure (Electron)

- **Main Process** (`src/main/`): Node.js backend
  - `main.js` - App lifecycle, window creation, IPC handlers for window management
  - `fileOperations.js` - File I/O via Electron dialog APIs (open, save, save-as)
  - `menu.js` - Native application menu template (currently unused - app uses in-window menu)

- **Preload** (`src/preload/preload.js`): Bridge between main and renderer using `contextBridge.exposeInMainWorld('electronAPI', ...)`. All IPC communication goes through this secure API.

- **Renderer** (`src/renderer/`): Frontend
  - `index.html` - Main UI with custom Windows 98-style menu bar and modal dialogs (Find, Replace, Go To, Font, About)
  - `js/app.js` - All UI logic, state management, keyboard shortcuts, dialog handlers
  - `styles/main.css` - Windows 98 styling (sunken borders, status bar, menu system)

### Key Patterns

- **State Management**: Single `state` object in `app.js` tracks current file path, content changes, search state, and font settings
- **Menu System**: Custom in-app menu bar (not Electron's native menu) with dropdown behavior implemented in `setupMenuBar()`
- **Dialogs**: Modal overlays with `.dialog-overlay.hidden` class toggling, all defined in `index.html`
- **IPC Flow**: Renderer calls `window.electronAPI.*` methods → Preload forwards via `ipcRenderer` → Main handles with `ipcMain.handle/on`

### Unsaved Changes Handling

The app tracks modifications via `state.hasUnsavedChanges` (comparing `editor.value` to `state.originalContent`). Window close is intercepted in main process, which calls back to renderer's `window.checkUnsavedBeforeClose()` function.

## macOS Build & Signing

### Important Files

- `entitlements.plist` - Required entitlements for Electron apps (JIT, unsigned memory, library validation)
- `assets/icons/icon.icns` - macOS icon file
- `assets/icons/icon.png` - Source icon for Windows/Linux

### Build Process

1. `npm run build:mac` outputs unsigned app to `build/mac-arm64/Notepad.app`
2. Sign all components individually with `--timestamp --options runtime --entitlements entitlements.plist`
3. Notarize with `xcrun notarytool submit`
4. Staple with `xcrun stapler staple`
5. Create DMG with `hdiutil create`

### Critical Signing Notes

**DO NOT use `codesign --deep`** - It fails to properly sign nested Electron binaries.

Sign in this order (inside out):
1. All `.dylib` files in Frameworks
2. `chrome_crashpad_handler` binary
3. `ShipIt` binary in Squirrel.framework
4. Helper apps (Helper, Helper GPU, Helper Plugin, Helper Renderer)
5. Frameworks (Electron Framework, Mantle, ReactiveObjC, Squirrel)
6. Main app

### Required Entitlements

Without these in `entitlements.plist`, app crashes with `pthread_jit_write_protect_np`:

```xml
<key>com.apple.security.cs.allow-jit</key>
<true/>
<key>com.apple.security.cs.allow-unsigned-executable-memory</key>
<true/>
<key>com.apple.security.cs.disable-library-validation</key>
<true/>
```

### Development Mode Customization

To show "Notepad" instead of "Electron" in macOS menu bar during development:

```bash
# Modify Electron.app's Info.plist
PLIST="node_modules/electron/dist/Electron.app/Contents/Info.plist"
/usr/libexec/PlistBuddy -c "Set :CFBundleName Notepad" "$PLIST"
/usr/libexec/PlistBuddy -c "Set :CFBundleDisplayName Notepad" "$PLIST"

# Replace icon
cp assets/icons/icon.icns node_modules/electron/dist/Electron.app/Contents/Resources/electron.icns
```

These changes reset on `npm install`.

## Icon Generation

Generate macOS .icns from 1024x1024 PNG:

```bash
mkdir -p assets/icons/icon.iconset
sips -z 16 16 source.png --out assets/icons/icon.iconset/icon_16x16.png
sips -z 32 32 source.png --out assets/icons/icon.iconset/icon_16x16@2x.png
# ... (see README.md for full list)
iconutil -c icns assets/icons/icon.iconset -o assets/icons/icon.icns
rm -rf assets/icons/icon.iconset
```

For Windows, electron-builder auto-converts PNG to ICO.

## Common Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| App crashes with `pthread_jit_write_protect_np` | Missing JIT entitlements | Add entitlements.plist with allow-jit |
| Notarization fails "no timestamp" | Signed without `--timestamp` | Re-sign with `--timestamp` flag |
| Notarization fails "not signed" | Used `--deep` flag | Sign each component individually |
| Menu bar shows "Electron" | Default Electron bundle name | Modify Info.plist (dev) or build config (prod) |
| Icon not showing | Wrong path or format | Ensure .icns for macOS, .png for others |
