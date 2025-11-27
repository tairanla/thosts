# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

thosts is a cross-platform hosts file management tool built with Tauri 2.0 + React + Rust, inspired by SwitchHosts. It allows users to edit system hosts files and manage multiple host profiles with toggling functionality.

## Development Commands

### Core Development Workflow

```bash
# Install dependencies
npm install

# Development mode (full Tauri app with hot reload)
npm run tauri dev

# Frontend-only development (Vite dev server on port 1420)
npm run dev

# Production build (creates platform-specific installers)
npm run tauri build

# Frontend-only build
npm run build

# TypeScript type checking
npx tsc --noEmit
```

### Build Outputs
Production builds create installers in `src-tauri/target/release/bundle/`:
- **Linux**: `.deb` (Debian/Ubuntu) and `.rpm` (Fedora/RHEL) packages
- **Windows**: `.msi` and `.nsis` installers
- **macOS**: `.dmg` disk image and `.app` bundle

## Architecture & Key Components

### Technology Stack
- **Frontend**: React 19 + TypeScript + Vite
- **Backend**: Tauri 2.0 + Rust for system operations
- **UI**: Monaco Editor + vanilla CSS with CSS variables
- **Storage**: LocalStorage for profiles and settings

### Application Flow

**Main Layout (`src/layouts/MainLayout.tsx`)** - Central coordinator:
- Manages profile state, editor content, and system hosts path
- Handles save operations with admin authentication fallback
- Coordinates between Sidebar, Editor, and Settings components

**Tauri Commands (`src-tauri/src/lib.rs`)** - Rust backend:
- `get_hosts_path()`: Returns OS-specific hosts file path
- `read_hosts(path)`, `write_hosts(path, content)`: Basic file operations
- `write_hosts_with_admin(path, content, credentials)`: Privileged writes
- `validate_admin_credentials(credentials)`: Authentication verification

**Frontend Services (`src/services/hostsService.ts`)** - Backend interface:
- Typesafe wrappers around Tauri commands
- Defines `HostsProfile` and `AdminCredentials` interfaces
- Handles cross-platform hosts path resolution

**State Management**:
- **SettingsContext**: Global theme, language, font preferences
- **LocalStorage**: Profile persistence via `utils/storage.ts`
- **React hooks**: Local component state (no external state library)

### Component Architecture

```
App (theme initialization)
├── SettingsProvider (global settings with localStorage persistence)
└── MainLayout (central coordinator, profile state, admin auth)
    ├── Sidebar (profile list, toggles, add profile, settings access)
    ├── Editor (Monaco editor for hosts content)
    ├── Settings (theme, language, font configuration)
    └── AdminAuthModal (credential modal for system file writes)
```

## Critical Implementation Details

### System File Operations
The app handles privileged system hosts file writes with a two-stage approach:

1. **First attempt**: Try `write_hosts()` without admin privileges
2. **Fallback**: If failed, show `AdminAuthModal` and retry with `write_hosts_with_admin()`

**Cross-platform credential handling**:
- **Windows**: Uses PowerShell elevation (currently WSL-compatible with sudo fallback)
- **Unix-like**: Uses `echo password | sudo -S command` pattern

### Profile Management Logic
- **System hosts** (`id: '1'`): Always reflects actual `/etc/hosts` file
- **Local profiles**: User-defined content stored in LocalStorage
- **Profile toggling**: Currently UI-only (system hosts not recomputed yet)

### Key TypeScript Interfaces

```typescript
interface HostsProfile {
  id: string;
  name: string;
  content: string;
  active: boolean;
  type: 'system' | 'local' | 'remote';
}

interface Settings {
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'zh-CN' | 'zh-TW';
  fontFamily: string;
  fontSize: number;
}

interface AdminCredentials {
  username: string;
  password: string;
}
```

### Internationalization
- **Translation files**: `src/locales/{en,zh-CN,zh-TW}.ts`
- **Hook**: `useTranslation()` provides type-safe translations
- **Dynamic naming**: System hosts profile name updates with language changes

## Development Patterns

### State Updates
Always update profiles array immutably and save to LocalStorage:
```typescript
setProfiles(prev => prev.map(p =>
  p.id === targetId ? { ...p, updatedField } : p
));
```

### Error Handling
All Rust file operations return `Result<T, String>` - errors are handled in TypeScript with user-friendly messages.

### CSS Architecture
- **Theme system**: CSS variables with `[data-theme]` attributes
- **Responsive**: Desktop-first design with fixed sidebar width
- **Monaco Editor**: Custom font size via CSS variables

## Build Configuration

**Tauri config (`src-tauri/tauri.conf.json`)**:
- Development server: `http://localhost:1420`
- Bundle targets: `["msi", "nsis", "deb", "rpm"]` (Windows/Linux focused)
- Multi-language installers with embedded translations

**Cross-platform paths**:
- Windows: `C:\Windows\System32\drivers\etc\hosts`
- macOS/Linux: `/etc/hosts`

## Future Development Areas

1. **Profile synthesis**: Combine active profiles into system hosts file
2. **Enhanced security**: Input validation and sandboxing
3. **Performance**: Virtual scrolling for large hosts files
4. **Remote profiles**: HTTP-based profile fetching and syncing
