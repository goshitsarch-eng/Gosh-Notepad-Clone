# Notepad

A faithful Windows 95/98 Notepad clone built with Tauri, Svelte 5, Vite, and [98.css](https://jdan.github.io/98.css/).

Experience the nostalgia of classic Windows on your modern machine.

## Features

- **Authentic Windows 98 UI** - Classic styling with sunken borders, 3D buttons, and system fonts
- **Full text editing** - Create, open, save, and edit text files
- **Find & Replace** - Search through documents with find next/previous and replace functionality
- **Go To Line** - Jump to any line number instantly
- **Font customization** - Change font family, style, and size
- **Word wrap toggle** - Enable/disable word wrapping
- **Status bar** - Shows current line and column position
- **Dark mode support** - Toggle dark theme from Format menu
- **Native keyboard shortcuts** - Ctrl+O, Ctrl+S, Ctrl+F, Ctrl+H, Ctrl+G, and more
- **Unsaved changes detection** - Prompts before closing with unsaved work

## Installation

### Pre-built Binaries

Download the latest release for your platform:

| Platform | Download |
|----------|----------|
| macOS (Apple Silicon) | `Notepad.dmg` |
| Windows | `Notepad_x64-setup.exe` |
| Linux | `notepad_amd64.AppImage` |

### Building from Source

#### Prerequisites

- [Rust](https://rustup.rs/) (1.70 or later)
- [Node.js](https://nodejs.org/) (18 or later)
- Platform-specific dependencies:
  - **Linux**: `sudo apt install libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf`
  - **macOS**: Xcode Command Line Tools
  - **Windows**: Visual Studio C++ Build Tools

```bash
# Clone the repository
git clone https://github.com/goshitsarch-eng/Gosh-Notepad-Clone.git
cd Gosh-Notepad-Clone

# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for your platform
npm run build
```

## Development

### Commands

```bash
npm run dev         # Run the app in development mode
npm run dev:ui      # Run only the Svelte/Vite frontend
npm run build       # Build for current platform
npm run build:mac   # Build for macOS (Apple Silicon)
npm run build:win   # Build for Windows x64
npm run build:linux # Build for Linux x64
```

### Project Structure

```
Gosh-Notepad-Clone/
├── frontend/                 # Svelte 5 + Vite frontend
│   ├── index.html           # Vite entry HTML
│   ├── vite.config.mjs      # Vite + Tauri config
│   ├── svelte.config.mjs    # Svelte config
│   └── src/
│       ├── App.svelte       # UI with dialogs
│       ├── main.js          # App bootstrap
│       ├── lib/notepad.js   # Application logic
│       └── styles/
│           └── main.css     # Windows 98 styling
├── src-tauri/               # Rust backend
│   ├── Cargo.toml           # Rust dependencies
│   ├── tauri.conf.json      # Tauri configuration
│   └── src/
│       ├── main.rs          # App entry point
│       └── lib.rs           # Command handlers
├── assets/
│   └── icons/               # Source icons
└── package.json             # npm scripts and dependencies
```

### Architecture

This is a Tauri application with two main components:

1. **Rust Backend** (`src-tauri/`) - Native backend handling:
   - Window creation and lifecycle
   - File system operations via native dialogs
   - Platform-specific functionality

2. **WebView Frontend** (`frontend/`) - Svelte 5 UI handling:
   - Custom Windows 98-style menu bar
   - Modal dialogs (Find, Replace, Go To, Font, About)
   - State management and keyboard shortcuts
   - Communication with backend via `invoke()`

### Tauri Commands

The Rust backend exposes these commands to the frontend:

| Command | Description |
|---------|-------------|
| `new_file` | Reset to empty document |
| `open_file` | Show file picker, read selected file |
| `save_file` | Write content to specified path |
| `save_file_as` | Show save dialog, write to new file |
| `print_document` | Open system print dialog |
| `set_window_title` | Update window title bar |
| `quit_app` | Exit the application |

## Building for Distribution

### macOS

```bash
npm run build:mac
```

Output: `src-tauri/target/release/bundle/dmg/Notepad_1.0.0_aarch64.dmg`

For signing and notarization, use Apple's standard `codesign` and `notarytool` commands.

### Windows

```bash
npm run build:win
```

Output: `src-tauri/target/release/bundle/nsis/Notepad_1.0.0_x64-setup.exe`

### Linux

```bash
npm run build:linux
```

Output:
- `src-tauri/target/release/bundle/appimage/notepad_1.0.0_amd64.AppImage`
- `src-tauri/target/release/bundle/deb/notepad_1.0.0_amd64.deb`

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl+N | New file |
| Ctrl+O | Open file |
| Ctrl+S | Save file |
| Ctrl+Shift+S | Save as |
| Ctrl+P | Print |
| Ctrl+F | Find |
| Ctrl+H | Replace |
| Ctrl+G | Go to line |
| F3 | Find next |
| F5 | Insert time/date |
| Ctrl+A | Select all |
| Ctrl+Z | Undo |

## Technologies

- [Svelte 5](https://svelte.dev/) - UI framework
- [Vite](https://vitejs.dev/) - Frontend build tool
- [Tauri](https://tauri.app/) - Rust-based desktop framework
- [98.css](https://jdan.github.io/98.css/) - Windows 98 CSS library

## Author

Goshitsarch

## License

MIT
