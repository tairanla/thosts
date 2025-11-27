# tHosts

[English](./README.md) | 中文

tHosts 是一个跨平台的 hosts 文件管理工具，使用 Tauri 2.0 + Rust + React 技术栈，灵感来源于 [SwitchHosts](https://github.com/oldj/SwitchHosts)。

## 🌟 功能特色

### ✨ 核心功能

- 📝 **编辑系统 hosts 文件**：直接读取和修改系统 hosts 文件
- 🔄 **多 hosts 配置管理**：支持创建、编辑、切换多个 hosts 配置文件
- 🎯 **快速切换**：一键启用/禁用不同的 hosts 配置
- 💾 **本地存储**：使用 LocalStorage 保存配置和设置

### 🎨 界面定制

- 🌓 **主题支持**：浅色、深色、跟随系统
- 🌍 **多语言**：简体中文、繁体中文、英文
- 🔤 **字体定制**：可自定义字体和大小

### 🖥️ 跨平台支持

- **Windows**：`C:\Windows\System32\drivers\etc\hosts`
- **macOS & Linux**：`/etc/hosts`

## 快速开始

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 生产模式
npm run build
```

## 运行 Tauri 应用

```bash
# 开发模式
npm run tauri dev

# 生产模式
npm run tauri build
```

## 推荐 IDE 设置

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## 使用指南

1. **查看系统 hosts**: 默认显示您的实际系统 hosts 文件
2. **创建配置**: 点击侧边栏的 `+` 按钮
3. **编辑内容**: 选择一个配置并在主编辑器中编辑
4. **保存更改**: 点击保存按钮以持久化更改
5. **切换配置**: 使用开关来启用/禁用配置
6. **设置**: 通过设置按钮访问主题、语言和字体设置

## 项目结构

查看 [docs/PLAN.md](docs/PLAN.md) 了解开发计划和 [docs/SUMMARY.md](docs/SUMMARY.md) 了解实现细节。

## 技术栈

- **前端**: React 19，TypeScript，Vite
- **后端**: Tauri 2.0，Rust
- **样式**: 原生 CSS，CSS 变量
- **图标**: Lucide React

## 许可

MIT
