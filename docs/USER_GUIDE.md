# thosts User Guide

## Getting Started

### First Launch

When you first launch thosts, you'll see:
- **Sidebar** (left): List of host profiles
- **Editor** (center): Code editor with line numbers
- **Toolbar** (top): Action buttons (Refresh, Save)

### Default Profiles

The app comes with three default profiles:
1. **System Hosts** - Your actual system hosts file (read from disk)
2. **Dev Environment** - Example local profile
3. **Staging** - Example remote profile

## Core Features

### 1. Editing System Hosts

1. Select **System Hosts** from the sidebar (it's selected by default)
2. Edit the content in the editor
3. Click **Save** to write changes to your system hosts file

⚠️ **Important**: You need administrator/sudo permissions to save system hosts.

### 2. Creating Profiles

1. Click the **+** button in the sidebar header
2. Enter a name for your new profile
3. Edit the content in the editor
4. Changes are automatically saved to localStorage

### 3. Switching Between Profiles

- Click any profile in the sidebar to view/edit it
- The editor will display the selected profile's content
- Each profile maintains its own content independently

### 4. Toggling Profiles

- Each profile has a toggle switch on the right
- Enable/disable profiles by clicking the switch
- **Note**: Currently, toggling doesn't merge profiles (planned feature)

### 5. Settings

Click the **Settings** button at the bottom of the sidebar to configure:

#### Theme
- **Light**: Bright color scheme
- **Dark**: Dark color scheme (easier on the eyes)
- **System**: Follow your OS theme preference

#### Language
- **English**: English UI
- **简体中文**: Simplified Chinese UI
- **繁体中文**: Traditional Chinese UI

#### Font
- **Font Family**: Change the editor's font (monospace recommended)
- **Font Size**: Adjust text size (default: 14px)

## Tips & Tricks

### Keyboard Navigation
- Use arrow keys to navigate the editor
- `Ctrl/Cmd + A` to select all
- `Ctrl/Cmd + C/V` to copy/paste

### Editor Features
- **Line Numbers**: Automatically shown on the left
- **No Spell Check**: Disabled for technical content
- **Monospace Font**: Better alignment for IP addresses

### Best Practices

1. **Backup First**: Before editing system hosts, create a backup profile
2. **Comment Your Entries**: Use `#` for comments to document your changes
3. **Test Changes**: Toggle profiles to quickly test different configurations
4. **Organize**: Create separate profiles for different environments (dev, staging, prod)

## Common Use Cases

### Development Environment

Create a profile named "Dev" with:
```
# Local Development
127.0.0.1 api.local
127.0.0.1 app.local
127.0.0.1 admin.local
```

### Blocking Ads/Trackers

Create a profile named "Ad Block" with:
```
# Block common trackers
0.0.0.0 ads.example.com
0.0.0.0 tracker.example.com
```

### Multiple Environments

Create profiles for each environment:
- **Production**: Real server IPs
- **Staging**: Staging server IPs
- **Development**: Local/localhost entries

## Troubleshooting

### Cannot Save System Hosts

**Problem**: Error when clicking Save on System Hosts

**Solution**: 
- **Windows**: Run thosts as Administrator (right-click → Run as Administrator)
- **MacOS/Linux**: Grant necessary permissions or run with sudo

### Changes Not Appearing

**Problem**: Edited hosts but website still loads old IP

**Solution**:
- Flush DNS cache:
  - **Windows**: `ipconfig /flushdns`
  - **MacOS**: `sudo dscacheutil -flushcache`
  - **Linux**: `sudo systemd-resolve --flush-caches`

### Profile Not Saving

**Problem**: Created profile but it disappeared after restart

**Solution**: 
- Check browser console for localStorage errors
- Ensure localStorage is enabled
- Try clearing localStorage and recreating profiles

## Hosts File Syntax

### Basic Format
```
IP_ADDRESS    HOSTNAME    [ALIAS...]
```

### Examples
```
# IPv4
127.0.0.1       localhost
192.168.1.100   server.local

# IPv6
::1             localhost
fe80::1         link-local

# Comments
# This is a comment
127.0.0.1       test.local  # Inline comment also works
```

### Special IPs
- `127.0.0.1` - Localhost (this computer)
- `0.0.0.0` - Block/blackhole (commonly used for ad blocking)
- `::1` - IPv6 localhost

## Data Storage

### Where is data stored?

- **Settings**: Browser localStorage (`thosts-settings`)
- **Profiles**: Browser localStorage (`thosts-profiles`)
- **System Hosts**: Read from system file, not cached

### Clearing Data

To reset all settings and profiles:
1. Open browser DevTools (F12)
2. Go to Application → Storage → Local Storage
3. Delete `thosts-settings` and `thosts-profiles`
4. Refresh the app

## Updates & Support

### Checking for Updates
- Currently manual - check GitHub releases

### Reporting Issues
- GitHub Issues: [Create an issue](https://github.com/yourusername/thosts/issues)
- Include: OS, app version, error message, steps to reproduce

## FAQ

**Q: Can I use this to block websites?**  
A: Yes, point domains to `0.0.0.0` to block them.

**Q: Will my profiles sync across devices?**  
A: Not yet - profiles are stored locally. Cloud sync is a planned feature.

**Q: Can I share my profiles?**  
A: Import/export feature is planned. For now, copy the JSON from localStorage.

**Q: Is it safe to edit system hosts?**  
A: Yes, but make backups first. Invalid entries may cause connectivity issues.

**Q: What happens if I make a mistake?**  
A: You can always restore from a backup profile or manually edit the system hosts file.
