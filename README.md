# Notepad

A faithful Windows 95/98 Notepad clone built with Electron and [98.css](https://jdan.github.io/98.css/).

Experience the nostalgia of classic Windows on your modern machine.

## Features

- **Authentic Windows 98 UI** - Classic styling with sunken borders, 3D buttons, and system fonts
- **Full text editing** - Create, open, save, and edit text files
- **Find & Replace** - Search through documents with find next/previous and replace functionality
- **Go To Line** - Jump to any line number instantly
- **Font customization** - Change font family, style, and size
- **Word wrap toggle** - Enable/disable word wrapping
- **Status bar** - Shows current line and column position
- **Dark mode support** - Automatic theme switching based on system preferences
- **Native keyboard shortcuts** - Ctrl+O, Ctrl+S, Ctrl+F, Ctrl+H, Ctrl+G, and more
- **Unsaved changes detection** - Prompts before closing with unsaved work

## Installation

### Pre-built Binaries

Download the latest release for your platform:

| Platform | Download |
|----------|----------|
| macOS (Apple Silicon) | `Notepad.dmg` |
| Windows | Coming soon |
| Linux | Coming soon |

### Building from Source

```bash
# Clone the repository
git clone https://github.com/yourusername/NotepadElectron.git
cd NotepadElectron

# Install dependencies
npm install

# Run in development mode
npm start

# Build for your platform
npm run build
```

## Development

### Commands

```bash
npm start           # Run the app in development mode
npm run build       # Build for current platform
npm run build:mac   # Build for macOS
npm run build:win   # Build for Windows
npm run build:linux # Build for Linux
```

### Project Structure

```
NotepadElectron/
├── src/
│   ├── main/                 # Main process (Node.js)
│   │   ├── main.js          # App lifecycle, window management
│   │   ├── fileOperations.js # File I/O handlers
│   │   └── menu.js          # Native menu template (unused)
│   ├── preload/
│   │   └── preload.js       # Secure IPC bridge
│   └── renderer/            # Frontend (Chromium)
│       ├── index.html       # UI with dialogs
│       ├── js/app.js        # Application logic
│       └── styles/main.css  # Windows 98 styling
├── assets/
│   └── icons/               # App icons for all platforms
├── entitlements.plist       # macOS code signing entitlements
└── package.json             # Dependencies and build config
```

### Architecture

This is an Electron application with three main components:

1. **Main Process** (`src/main/`) - Node.js backend handling:
   - Window creation and lifecycle
   - File system operations via Electron dialogs
   - IPC message handling

2. **Preload Script** (`src/preload/preload.js`) - Secure bridge exposing:
   - `window.electronAPI` for renderer-to-main communication
   - File operations (open, save, save-as)
   - Window management (title, close)

3. **Renderer Process** (`src/renderer/`) - Frontend handling:
   - Custom Windows 98-style menu bar
   - Modal dialogs (Find, Replace, Go To, Font, About)
   - State management and keyboard shortcuts

## Building for macOS

### Requirements

- macOS with Xcode Command Line Tools
- Apple Developer account (for signing/notarization)
- Developer ID Application certificate

### Build Steps

1. **Build the unsigned app:**
   ```bash
   npm run build:mac
   ```
   This creates `build/mac-arm64/Notepad.app`

2. **Sign all components with entitlements:**
   ```bash
   APP="build/mac-arm64/Notepad.app"
   IDENTITY="Developer ID Application: Your Name (TEAMID)"
   ENTITLEMENTS="entitlements.plist"

   # Sign dylibs
   find "$APP/Contents/Frameworks" -type f -name "*.dylib" \
     -exec codesign --force --timestamp --options runtime \
     --entitlements "$ENTITLEMENTS" --sign "$IDENTITY" {} \;

   # Sign helper binaries
   codesign --force --timestamp --options runtime \
     --entitlements "$ENTITLEMENTS" --sign "$IDENTITY" \
     "$APP/Contents/Frameworks/Electron Framework.framework/Versions/A/Helpers/chrome_crashpad_handler"

   codesign --force --timestamp --options runtime \
     --entitlements "$ENTITLEMENTS" --sign "$IDENTITY" \
     "$APP/Contents/Frameworks/Squirrel.framework/Versions/A/Resources/ShipIt"

   # Sign helper apps
   for helper in "Notepad Helper" "Notepad Helper (GPU)" "Notepad Helper (Plugin)" "Notepad Helper (Renderer)"; do
     codesign --force --timestamp --options runtime \
       --entitlements "$ENTITLEMENTS" --sign "$IDENTITY" \
       "$APP/Contents/Frameworks/$helper.app"
   done

   # Sign frameworks
   for framework in "Electron Framework" "Mantle" "ReactiveObjC" "Squirrel"; do
     codesign --force --timestamp --options runtime \
       --entitlements "$ENTITLEMENTS" --sign "$IDENTITY" \
       "$APP/Contents/Frameworks/$framework.framework"
   done

   # Sign main app
   codesign --force --timestamp --options runtime \
     --entitlements "$ENTITLEMENTS" --sign "$IDENTITY" "$APP"
   ```

3. **Notarize the app:**
   ```bash
   # Create zip for upload
   ditto -c -k --keepParent build/mac-arm64/Notepad.app Notepad.zip

   # Submit for notarization
   xcrun notarytool submit Notepad.zip \
     --apple-id "your@email.com" \
     --team-id "TEAMID" \
     --password "app-specific-password" \
     --wait

   # Staple the ticket
   xcrun stapler staple build/mac-arm64/Notepad.app
   ```

4. **Create DMG:**
   ```bash
   hdiutil create -volname "Notepad" \
     -srcfolder build/mac-arm64/Notepad.app \
     -ov -format UDZO build/Notepad.dmg

   # Sign and notarize DMG
   codesign --force --timestamp \
     --sign "Developer ID Application: Your Name (TEAMID)" \
     build/Notepad.dmg

   xcrun notarytool submit build/Notepad.dmg \
     --apple-id "your@email.com" \
     --team-id "TEAMID" \
     --password "app-specific-password" \
     --wait

   xcrun stapler staple build/Notepad.dmg
   ```

### Required Entitlements

The `entitlements.plist` file is **critical** for Electron apps:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.security.cs.allow-jit</key>
    <true/>
    <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
    <true/>
    <key>com.apple.security.cs.disable-library-validation</key>
    <true/>
</dict>
</plist>
```

Without these entitlements, the app will crash on launch with a `pthread_jit_write_protect_np` error.

## Lessons Learned

### macOS Code Signing

1. **`--deep` is insufficient** - The `codesign --deep` flag does NOT properly sign all nested Electron binaries. You must sign each component individually, from the inside out.

2. **Timestamps are required** - Always use `--timestamp` flag. Without it, notarization will fail with "signature does not include a secure timestamp".

3. **Hardened runtime needs entitlements** - The `--options runtime` flag enables hardened runtime (required for notarization), but Electron apps need JIT entitlements to function.

4. **Sign order matters** - Sign in this order:
   - dylibs first
   - Helper binaries (chrome_crashpad_handler, ShipIt)
   - Helper apps
   - Frameworks
   - Main app last

5. **Don't forget chrome_crashpad_handler** - This binary is easily missed and will cause notarization to fail.

### Development Mode on macOS

To show your app name (not "Electron") in the menu bar during development, you must modify the Electron.app bundle:

```bash
# Update Info.plist
PLIST="node_modules/electron/dist/Electron.app/Contents/Info.plist"
/usr/libexec/PlistBuddy -c "Set :CFBundleName Notepad" "$PLIST"
/usr/libexec/PlistBuddy -c "Set :CFBundleDisplayName Notepad" "$PLIST"

# Replace icon
cp assets/icons/icon.icns \
  node_modules/electron/dist/Electron.app/Contents/Resources/electron.icns
```

Note: These changes are in `node_modules/` and will reset on `npm install`.

### Icon Generation

For macOS, create an iconset from a 1024x1024 PNG:

```bash
mkdir -p icon.iconset
sips -z 16 16 source.png --out icon.iconset/icon_16x16.png
sips -z 32 32 source.png --out icon.iconset/icon_16x16@2x.png
sips -z 32 32 source.png --out icon.iconset/icon_32x32.png
sips -z 64 64 source.png --out icon.iconset/icon_32x32@2x.png
sips -z 128 128 source.png --out icon.iconset/icon_128x128.png
sips -z 256 256 source.png --out icon.iconset/icon_128x128@2x.png
sips -z 256 256 source.png --out icon.iconset/icon_256x256.png
sips -z 512 512 source.png --out icon.iconset/icon_256x256@2x.png
sips -z 512 512 source.png --out icon.iconset/icon_512x512.png
sips -z 1024 1024 source.png --out icon.iconset/icon_512x512@2x.png
iconutil -c icns icon.iconset -o icon.icns
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl+N | New file |
| Ctrl+O | Open file |
| Ctrl+S | Save file |
| Ctrl+Shift+S | Save as |
| Ctrl+F | Find |
| Ctrl+H | Replace |
| Ctrl+G | Go to line |
| F3 | Find next |
| Shift+F3 | Find previous |
| Ctrl+A | Select all |
| Ctrl+Z | Undo |
| Ctrl+Y | Redo |

## Technologies

- [Electron](https://www.electronjs.org/) - Cross-platform desktop framework
- [98.css](https://jdan.github.io/98.css/) - Windows 98 CSS library
- [electron-builder](https://www.electron.build/) - Build and distribution

## License

MIT
