# thosts Architecture

## Overview

thosts is a cross-platform hosts file management application built using the **Tauri framework**, combining a **React frontend** with a **Rust backend**.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    thosts Application                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │            React Frontend (UI)                 │    │
│  │                                                 │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐    │    │
│  │  │ Sidebar  │  │  Editor  │  │ Settings │    │    │
│  │  └──────────┘  └──────────┘  └──────────┘    │    │
│  │                                                 │    │
│  │  ┌──────────────────────────────────────┐    │    │
│  │  │      SettingsContext                 │    │    │
│  │  │  (Theme, Language, Font)             │    │    │
│  │  └──────────────────────────────────────┘    │    │
│  │                                                 │    │
│  │  ┌──────────────────────────────────────┐    │    │
│  │  │      LocalStorage                    │    │    │
│  │  │  - Profiles                          │    │    │
│  │  │  - Settings                          │    │    │
│  │  └──────────────────────────────────────┘    │    │
│  └─────────────────┬───────────────────────────┘    │
│                    │ @tauri-apps/api                  │
│                    ▼                                   │
│  ┌────────────────────────────────────────────────┐  │
│  │           Rust Backend (Tauri Core)            │  │
│  │                                                 │  │
│  │  Commands:                                     │  │
│  │  - get_hosts_path()                            │  │
│  │  - read_hosts(path)                            │  │
│  │  - write_hosts(path, content)                  │  │
│  │                                                 │  │
│  └─────────────────┬───────────────────────────────┘  │
│                    │ std::fs                           │
│                    ▼                                   │
│  ┌────────────────────────────────────────────────┐  │
│  │          Operating System                      │  │
│  │                                                 │  │
│  │  Windows: C:\Windows\System32\drivers\etc\    │  │
│  │  MacOS/Linux: /etc/hosts                       │  │
│  └────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **React 19**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool and dev server
- **Lucide React**: Icon library
- **Vanilla CSS**: Styling with CSS variables

### Backend
- **Tauri 2.0**: Cross-platform framework
- **Rust**: System-level operations
- **std::fs**: File system operations

## Component Architecture

### UI Components

#### 1. MainLayout (`layouts/MainLayout.tsx`)
- **Purpose**: Root layout component
- **State Management**:
  - Selected profile ID
  - Profile list
  - Current editor content
  - Loading state
  - Status messages
- **Responsibilities**:
  - Coordinate between components
  - Handle save/load operations
  - Manage profile state
  - Call Tauri commands

#### 2. Sidebar (`components/Sidebar/Sidebar.tsx`)
- **Purpose**: Profile navigation
- **Props**:
  - `profiles`: Array of host profiles
  - `selectedId`: Currently selected profile
  - `onSelect`: Profile selection handler
  - `onToggle`: Profile toggle handler
  - `onAddProfile`: New profile handler
- **Features**:
  - Profile list with icons
  - Toggle switches
  - Add profile button
  - Settings button

#### 3. Editor (`components/Editor/Editor.tsx`)
- **Purpose**: Code editor for hosts content
- **Props**:
  - `content`: Text content to edit
  - `onChange`: Content change handler
  - `readOnly`: Optional read-only mode
- **Features**:
  - Line numbers
  - Monospace font
  - Auto-synced scrolling
  - Configurable font size

#### 4. Settings (`components/Settings/Settings.tsx`)
- **Purpose**: Application settings panel
- **Uses**: SettingsContext
- **Features**:
  - Theme selector (radio buttons)
  - Language dropdown
  - Font family input
  - Font size input

### Context & State Management

#### SettingsContext (`contexts/SettingsContext.tsx`)
```typescript
interface Settings {
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'zh-CN' | 'zh-TW';
  fontFamily: string;
  fontSize: number;
}
```

- **Purpose**: Global settings state
- **Persistence**: localStorage
- **Side Effects**:
  - Apply theme to DOM
  - Update CSS variables
  - Auto-detect system theme

### Services & Utilities

#### hostsService (`services/hostsService.ts`)
```typescript
interface HostsProfile {
  id: string;
  name: string;
  content: string;
  active: boolean;
  type: 'system' | 'local' | 'remote';
}
```

- **Purpose**: Interface to Tauri commands
- **Methods**:
  - `getHostsPath()`: Get OS-specific hosts path
  - `readHosts(path)`: Read file content
  - `writeHosts(path, content)`: Write file content

#### profileStorage (`utils/storage.ts`)
- **Purpose**: LocalStorage abstraction
- **Methods**:
  - `save(profiles)`: Persist profiles
  - `load()`: Restore profiles
  - `clear()`: Remove all data

#### Translations (`locales/`)
- **Structure**: Type-safe translation objects
- **Languages**: en, zh-CN, zh-TW
- **Hook**: `useTranslation()` for accessing current language

## Data Flow

### 1. Loading System Hosts

```
User launches app
    ↓
MainLayout.useEffect()
    ↓
loadSystemHosts()
    ↓
hostsService.getHostsPath() → Rust: get_hosts_path()
    ↓
hostsService.readHosts(path) → Rust: read_hosts(path)
    ↓
Update profiles state (System Hosts content)
    ↓
Update editor content
```

### 2. Saving Changes

```
User clicks Save button
    ↓
handleSave()
    ↓
If System Hosts:
    hostsService.writeHosts(path, content) → Rust: write_hosts()
    Update profiles state
Else:
    Update local profile in state
    ↓
profileStorage.save(profiles) → localStorage
    ↓
Show success message
```

### 3. Changing Settings

```
User changes theme/language/font
    ↓
updateSettings() in SettingsContext
    ↓
Settings state updated
    ↓
useEffect triggers:
    - Apply theme to DOM (data-theme attribute)
    - Update CSS variables (--font-mono, --editor-font-size)
    - Save to localStorage
```

## Tauri Backend

### Commands (`src-tauri/src/lib.rs`)

#### `get_hosts_path() -> String`
```rust
fn get_hosts_path() -> String {
    if cfg!(target_os = "windows") {
        "C:\\Windows\\System32\\drivers\\etc\\hosts".to_string()
    } else {
        "/etc/hosts".to_string()
    }
}
```

#### `read_hosts(path: &str) -> Result<String, String>`
```rust
fn read_hosts(path: &str) -> Result<String, String> {
    fs::read_to_string(path).map_err(|e| e.to_string())
}
```

#### `write_hosts(path: &str, content: &str) -> Result<(), String>`
```rust
fn write_hosts(path: &str, content: &str) -> Result<(), String> {
    fs::write(path, content).map_err(|e| e.to_string())
}
```

### Security Considerations

- **File Access**: Limited to hosts file path only
- **Permissions**: Requires admin/sudo for system file writes
- **Validation**: Frontend validates before sending to backend (future enhancement)
- **Error Handling**: All errors returned as strings to frontend

## CSS Architecture

### Theme System

```css
:root {
  /* Light theme variables */
  --bg-primary: #ffffff;
  --text-primary: #111827;
  /* ... */
}

[data-theme='dark'] {
  /* Dark theme variables */
  --bg-primary: #111827;
  --text-primary: #f9fafb;
  /* ... */
}
```

### CSS Variables
- `--bg-primary, --bg-secondary, --bg-tertiary`: Background colors
- `--text-primary, --text-secondary, --text-tertiary`: Text colors
- `--accent-color, --accent-hover`: Accent colors
- `--border-color`: Border colors
- `--font-mono, --font-sans`: Font families
- `--editor-font-size`: Dynamic font size
- `--sidebar-width, --header-height`: Layout dimensions

## Performance Optimizations

1. **React.memo**: Not currently used, but recommended for Sidebar items
2. **useMemo**: Used for line numbers calculation in Editor
3. **LocalStorage**: Batched writes via useEffect
4. **CSS**: Avoid global transition rules for better performance
5. **Lazy Loading**: Could be added for Settings component

## Future Architecture Improvements

### Planned Features
1. **State Management**: Consider Zustand or Jotai for complex state
2. **Virtual Scrolling**: For large hosts files (1000+ lines)
3. **Web Workers**: For hosts file parsing/validation
4. **IndexedDB**: Better storage for large profiles
5. **Rust Parser**: Move hosts parsing to Rust for better performance

### Scalability
- **Plugin System**: Allow community extensions
- **Profile Sync**: Cloud backend for cross-device sync
- **Multi-Window**: Support multiple editor windows
- **Diff View**: Compare profiles side-by-side

## Build & Deployment

### Development
```bash
npm run dev          # Frontend dev server
npm run tauri dev    # Full app with hot reload
```

### Production
```bash
npm run build        # Build frontend
npm run tauri build  # Build native app
```

### Output
- **Windows**: `.exe` installer
- **MacOS**: `.dmg` or `.app` bundle
- **Linux**: `.deb`, `.rpm`, or `.AppImage`
