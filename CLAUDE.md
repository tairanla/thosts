# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

thosts is a cross-platform hosts file management tool built with Tauri 2.0 + React + Rust, inspired by SwitchHosts. It allows users to edit system hosts files and manage multiple host profiles with toggling functionality.

## Development Commands

### Frontend Development
```bash
# Install dependencies
npm install

# Start frontend dev server (Vite)
npm run dev

# Build frontend for production
npm run build

# Preview production build
npm run preview
```

### Tauri Development
```bash
# Run full Tauri app in development mode
npm run tauri dev

# Build native application for production
npm run tauri build

# Build without dev server debug output
npm run tauri build -- --no-debug
```

### Type Checking
```bash
# TypeScript compilation check
npx tsc --noEmit
```

## Architecture

### Core Structure
- **Frontend**: React 19 + TypeScript with Vite
- **Backend**: Tauri 2.0 with Rust for system operations
- **UI**: Vanilla CSS with CSS variables for theming
- **Storage**: LocalStorage for profiles and settings persistence

### Key Directories
- `src/components/`: UI components (Editor, Sidebar, Settings)
- `src/contexts/`: React context providers (SettingsContext)
- `src/layouts/`: Layout components (MainLayout)
- `src/services/`: Tauri command interfaces (hostsService)
- `src/utils/`: Utility functions (storage abstraction)
- `src-tauri/`: Rust backend code and Tauri configuration

### Component Hierarchy
```
App (theme initialization)
├── SettingsProvider (global settings context)
└── MainLayout (root layout)
    ├── Sidebar (profile navigation)
    ├── Editor (Monaco code editor)
    └── Settings (settings modal)
```

## Tauri Commands (Backend API)

The Rust backend exposes these Tauri commands for frontend use:

- `get_hosts_path() -> String`: Returns OS-specific hosts file path
- `read_hosts(path: &str) -> Result<String, String>`: Reads file content
- `write_hosts(path: &str, content: &str) -> Result<(), String>`: Writes to file
- `greet(name: &str) -> String`: Example greeting command

All file operations require elevated permissions on the system hosts file.

## Key Interfaces

### HostsProfile
```typescript
interface HostsProfile {
  id: string;
  name: string;
  content: string;
  active: boolean;
  type: 'system' | 'local' | 'remote';
}
```

### Settings
```typescript
interface Settings {
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'zh-CN' | 'zh-TW';
  fontFamily: string;
  fontSize: number;
}
```

## Cross-Platform Considerations

- **Windows**: Hosts file at `C:\Windows\System32\drivers\etc\hosts`
- **macOS/Linux**: Hosts file at `/etc/hosts`
- System file writes require Administrator/sudo privileges
- Application targets Windows, macOS, and Linux via Tauri bundling

## Development Notes

- Frontend runs on `http://localhost:1420` during development
- Monaco Editor is used for code editing with syntax highlighting
- State management uses React hooks and context (no external state library)
- CSS variables are used extensively for theming and dynamic styling
- All user data is stored in LocalStorage for persistence
- The app follows a desktop-first design pattern

## Build Output

Production builds create platform-specific installers:
- **Windows**: `.exe` installer
- **macOS**: `.dmg` disk image
- **Linux**: `.deb` and `.rpm` packages (configurable in `src-tauri/tauri.conf.json`)