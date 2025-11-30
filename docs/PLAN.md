# thosts - Project Plan

## Project Goal

Build a cross-platform Hosts management tool using Tauri 2.0 + Rust + React, inspired by SwitchHosts.

## Requirements

### 1. Core Functionality

- **Hosts Editing**: View and edit the content of the system hosts file.
- **Hosts Switching**:
  - Manage multiple hosts configurations (profiles).
  - Toggle profiles on/off.
  - Apply changes to the system hosts file.
- **Cross-Platform Support**:
  - Windows: `C:\Windows\System32\drivers\etc\hosts`
  - MacOS & Linux: `/etc/hosts`
  - *Note*: Writing to system hosts file requires Administrator/Root privileges.

### 2. Settings

- **Theme**:
  - Light
  - Dark
  - Follow System
- **Language**:
  - English
  - Simplified Chinese (简体中文)
  - Traditional Chinese (繁体中文)
- **Font**:
  - Font Family (Default: `Cascadia Mono, Consolas, Menlo, Monaco, Ubuntu Mono, monospace`)
  - Font Size (Default: `14px`)

## Development Task List

### Phase 1: Foundation & UI Setup

- [ ] **Project Configuration**:
  - [ ] Initialize React project (already done).
  - [ ] Configure basic CSS variables for theming (Vanilla CSS).
  - [ ] Setup i18n structure (e.g., `react-i18next` or custom context).
- [ ] **Basic Layout**:
  - [ ] Sidebar (Profile list).
  - [ ] Main Content (Editor area).
  - [ ] Status Bar / Toolbar.
- [ ] **Settings UI**:
  - [ ] Settings Modal/Page.
  - [ ] Theme selector.
  - [ ] Language selector.
  - [ ] Font configuration.

### Phase 2: Rust Backend (Tauri Commands)

- [ ] **File Operations**:
  - [ ] `read_hosts_file`: Read content from system path.
  - [ ] `write_hosts_file`: Write content to system path (handle permissions).
  - [ ] `get_platform_info`: Identify OS to determine hosts path.
- [ ] **Privilege Management**:
  - [ ] Investigate and implement "sudo" or "admin" prompt for saving files.

### Phase 3: Frontend Logic & Integration

- [ ] **Editor Implementation**:
  - [ ] Integrate a code editor (e.g., CodeMirror or simple textarea with line numbers).
  - [ ] Syntax highlighting for Hosts file (comments, IP, domains).
- [ ] **Profile Management**:
  - [ ] Create/Delete/Rename profiles.
  - [ ] Store profiles locally (e.g., using `tauri-plugin-store` or `localStorage`).
- [ ] **Hosts Application**:
  - [ ] Logic to combine active profiles.
  - [ ] Call Rust command to write to system hosts.

### Phase 4: Settings Implementation

- [ ] **Theme Logic**: Apply CSS classes/variables based on selection.
- [ ] **Internationalization**: Translate UI strings.
- [ ] **Font Application**: Dynamically update editor styles.

### Phase 5: Polish & Distribution

- [ ] **Icon & Branding**.
- [ ] **Cross-Platform Testing** (Windows, Linux, MacOS).
- [ ] **CI/CD Setup** (Optional).
