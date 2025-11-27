# thosts

English | [中文](./README.zh_CN.md)

A cross-platform hosts file management tool built with Tauri 2.0 + React + Rust, inspired by [SwitchHosts](https://github.com/oldj/SwitchHosts).

## Features

✨ **Core Functionality**

- 📝 Edit system hosts file
- 🔄 Manage multiple host profiles
- 🎯 Toggle profiles on/off
- 💾 LocalStorage persistence

🎨 **Customization**

- 🌓 Theme: Light, Dark, Follow System
- 🌍 Language: English, 简体中文, 繁体中文
- 🔤 Font: Customizable family and size

🖥️ **Cross-Platform**

- Windows: `C:\Windows\System32\drivers\etc\hosts`
- MacOS & Linux: `/etc/hosts`

## Quick Start

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build
```

## Running Tauri App

```bash
# Development mode (opens desktop app)
npm run tauri dev

# Build production app
npm run tauri build
```

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## Usage

1. **View System Hosts**: The first profile always shows your actual system hosts file
2. **Create Profile**: Click the `+` button in the sidebar
3. **Edit Content**: Select a profile and edit in the main editor
4. **Save Changes**: Click the Save button to persist changes
5. **Toggle Profiles**: Use the switches to enable/disable profiles
6. **Settings**: Access theme, language, and font settings via the settings button

## Project Structure

See [docs/PLAN.md](docs/PLAN.md) for the development plan and [docs/SUMMARY.md](docs/SUMMARY.md) for implementation details.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Backend**: Tauri 2.0, Rust
- **Styling**: Vanilla CSS with CSS Variables
- **Icons**: Lucide React

## License

MIT
