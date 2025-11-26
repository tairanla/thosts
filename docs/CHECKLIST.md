# Development Checklist

## ✅ Completed Tasks

### Phase 1: Foundation & UI Setup
- [x] Project configuration with CSS variables for theming
- [x] Basic layout (Sidebar, Main Content, Toolbar)
- [x] Settings UI (Theme, Language, Font)
- [x] Component structure

### Phase 2: Rust Backend
- [x] `get_hosts_path` command
- [x] `read_hosts` command  
- [x] `write_hosts` command
- [x] Cross-platform path detection

### Phase 3: Frontend Logic
- [x] Line-numbered editor
- [x] Profile management (Create/Edit/Toggle)
- [x] LocalStorage persistence
- [x] System hosts integration

### Phase 4: Settings Implementation
- [x] Theme switching (Light/Dark/System)
- [x] Internationalization (en, zh-CN, zh-TW)
- [x] Dynamic font configuration
- [x] Settings persistence

## 🔨 Optional Enhancements

### High Priority
- [ ] Fix CSS transition issue (apply selectively to avoid conflicts)
- [ ] Implement profile merging (combine active profiles → system hosts)
- [ ] Add delete profile functionality
- [ ] Add duplicate profile functionality
- [ ] Better error handling with user-friendly messages
- [ ] Add confirmation dialogs for destructive actions

### Medium Priority
- [ ] Syntax highlighting for hosts file (IPs, domains, comments)
- [ ] Search functionality in editor
- [ ] Profile import/export (JSON format)
- [ ] Keyboard shortcuts (Ctrl+S to save, etc.)
- [ ] Recent profiles list
- [ ] Profile templates (dev, staging, production)

### Low Priority
- [ ] Profile grouping/folders
- [ ] Remote profile sync (cloud storage)
- [ ] History/undo functionality
- [ ] Dark mode auto-switching based on time
- [ ] Profile backup/restore
- [ ] Statistics (lines, active entries, etc.)

### Polish & Distribution
- [ ] Custom app icon and branding
- [ ] Splash screen
- [ ] About dialog
- [ ] Update checker
- [ ] Installer for Windows/MacOS/Linux
- [ ] Code signing
- [ ] GitHub releases automation

## 🐛 Known Issues

1. **CSS Transitions**: Global `*` selector may cause performance issues - should be scoped
2. **Permission Handling**: No automatic elevation request - user must run as admin/sudo manually
3. **Profile Merging**: Toggle switches don't actually merge profiles into system hosts yet
4. **No Validation**: Editor allows invalid hosts file syntax
5. **Line Numbers**: Don't scroll sync perfectly (minor visual issue)

## 📋 Testing Needed

- [ ] Test on Windows
- [ ] Test on MacOS
- [ ] Test on Linux
- [ ] Test with large hosts files (1000+ lines)
- [ ] Test theme switching
- [ ] Test language switching
- [ ] Test profile persistence across app restarts
- [ ] Test permission errors
- [ ] Test edge cases (empty file, malformed content, etc.)

## 🚀 Next Steps

1. Fix the CSS transition performance issue
2. Implement profile merging logic
3. Add delete/duplicate profile
4. Improve error messages
5. Test on all platforms
6. Create app icon
7. Package for distribution
