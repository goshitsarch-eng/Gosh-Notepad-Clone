# Notepad

A faithful Windows 95/98 Notepad clone built with Tauri, Svelte 5, Vite, and [98.css](https://jdan.github.io/98.css/).

Experience the nostalgia of classic Windows on your modern machine.

## Philosophy

Gosh apps are built with a Linux-first mindset: simplicity, transparency, and user control.

We also provide Windows and macOS builds not as a compromise, but as an on-ramp. Many people are curious about Linux but still live on other platforms day-to-day. If these tools help someone get comfortable and eventually make the jump, we're happy to meet them where they are.

## Features

- **Authentic Windows 98 UI** - Classic styling with sunken borders, 3D buttons, and system fonts
- **Full text editing** - Create, open, save, and edit text files (.txt and all file types)
- **Find & Replace** - Search through documents with find next/previous, case sensitivity, and replace functionality
- **Go To Line** - Jump to any line number instantly
- **Font customization** - Change font family, style, and size (settings do not persist across sessions)
- **Word wrap toggle** - Enable/disable word wrapping via Format menu
- **Status bar** - Shows current line and column position (toggleable via View menu)
- **Dark mode support** - Toggle dark theme from Format menu (does not persist across sessions)
- **Native keyboard shortcuts** - Ctrl+O, Ctrl+S, Ctrl+Shift+S, Ctrl+F, Ctrl+H, Ctrl+G, and more
- **Unsaved changes detection** - Prompts before closing with unsaved work

**Not Implemented:**
- Page Setup (menu item disabled)

## Installation

### Pre-built Binaries

Download the latest release for your platform from the [Releases](https://github.com/goshitsarch-eng/Gosh-Notepad-Clone/releases) page.

### Building from Source

#### Prerequisites

- [Rust](https://rustup.rs/)
- [Node.js](https://nodejs.org/) (18 or later)
- Platform-specific dependencies:
  - **Linux**: `sudo apt install libwebkit2gtk-4.1-dev librsvg2-dev patchelf`
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
npm run dev             # Run the app in development mode
npm run dev:ui          # Run only the Svelte/Vite frontend
npm run build           # Build for current platform
npm run build:ui        # Build only the frontend
npm run build:mac       # Build for macOS (Apple Silicon)
npm run build:win       # Build for Windows x64
npm run build:linux     # Build for Linux x64
npm run build:linux-arm64  # Build for Linux ARM64
```

### Project Structure

```
Gosh-Notepad-Clone/
├── frontend/                 # Svelte 5 + Vite frontend
│   ├── index.html           # Vite entry HTML
│   ├── vite.config.mjs      # Vite configuration
│   ├── svelte.config.mjs    # Svelte configuration
│   └── src/
│       ├── App.svelte       # UI with menu bar and dialogs
│       ├── main.js          # App bootstrap
│       ├── lib/notepad.js   # Application logic and state
│       └── styles/
│           └── main.css     # Windows 98 styling and dark mode
├── src-tauri/               # Rust backend
│   ├── Cargo.toml           # Rust dependencies
│   ├── tauri.conf.json      # Tauri configuration
│   ├── capabilities/        # Tauri 2 permissions
│   │   └── default.json     # Filesystem and dialog permissions
│   └── src/
│       ├── main.rs          # App entry point
│       └── lib.rs           # FileResult struct, command handlers, and app initialization
└── package.json             # npm scripts and dependencies
```

### Architecture

This is a Tauri 2 application with two main components:

1. **Rust Backend** (`src-tauri/`) - Native backend handling:
   - Window creation and lifecycle
   - File system operations via native dialogs
   - Platform-specific functionality

2. **WebView Frontend** (`frontend/`) - Svelte 5 UI handling:
   - Custom Windows 98-style menu bar
   - Modal dialogs (Find, Replace, Go To, Font, About, Unsaved Changes)
   - State management and keyboard shortcuts
   - Communication with backend via `invoke()`

### Tauri Commands

The Rust backend exposes these commands to the frontend:

| Command | Description |
|---------|-------------|
| `new_file` | Reset to empty document |
| `open_file` | Show file picker (filters: .txt, all files), read selected file |
| `save_file` | Write content to specified path |
| `save_file_as` | Show save dialog (default: Untitled.txt), write to new file |
| `print_document` | Trigger browser print dialog via `window.print()` |
| `set_window_title` | Update window title bar |
| `quit_app` | Exit the application |

### Tauri 2 Permissions

The app requests the following permissions via `src-tauri/capabilities/default.json`:

- **Window**: Set title, close
- **Dialog**: Open/save file dialogs
- **Filesystem**: Read/write access to home, documents, desktop, and downloads directories

## Building for Distribution

### macOS

```bash
npm run build:mac
```

Output located in `src-tauri/target/release/bundle/dmg/`

### Windows

```bash
npm run build:win
```

Output located in `src-tauri/target/release/bundle/nsis/`

### Linux

```bash
npm run build:linux        # x64
npm run build:linux-arm64  # ARM64
```

Output located in:
- `src-tauri/target/release/bundle/appimage/`
- `src-tauri/target/release/bundle/deb/`

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
| Ctrl+X | Cut |
| Ctrl+C | Copy |
| Ctrl+V | Paste |
| Del | Delete selection |
| Escape | Close dialogs |

## Technologies

- [Tauri 2](https://tauri.app/) - Rust-based desktop framework
- [Svelte 5](https://svelte.dev/) - UI framework
- [Vite](https://vitejs.dev/) - Frontend build tool
- [98.css](https://jdan.github.io/98.css/) - Windows 98 CSS library

## Known Limitations

- Font and dark mode preferences do not persist between sessions
- Page Setup functionality is not implemented
- Print uses the WebView's native print dialog (behavior may vary by platform)
- Unsaved changes dialog is rendered in HTML, not as a native OS dialog

## Disclaimer

This application is an independent project and is not sponsored by, endorsed by, or affiliated with Microsoft Corporation. It's a personal project created for fun and learning purposes and is not intended to be confused with Microsoft / Windows Notepad. All Microsoft trademarks belong to Microsoft Corporation.

This software is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0). It is provided "as is", without warranty of any kind, express or implied, including but not limited to the warranties of merchantability or fitness for a particular purpose. Use at your own risk.

## License

AGPL-3.0 - See [LICENSE](LICENSE)
