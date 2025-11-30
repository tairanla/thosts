# Building and Packaging thosts

## Build Status

✅ **Successfully builds**:

- `.deb` package (Debian/Ubuntu)
- `.rpm` package (Fedora/RHEL/openSUSE)

⚠️ **AppImage bundling disabled** due to missing `xdg-open` dependency (not critical)

## Quick Build Commands

### Development Build

```bash
# Run in development mode (with hot reload)
npm run tauri dev
```

### Production Build

```bash
# Build optimized production bundle
npm run tauri build
```

This will create:

- **DEB**: `/src-tauri/target/release/bundle/deb/thosts_0.1.0_amd64.deb`
- **RPM**: `/src-tauri/target/release/bundle/rpm/thosts-0.1.0-1.x86_64.rpm`

## Installation

### Debian/Ubuntu (DEB)

```bash
sudo dpkg -i src-tauri/target/release/bundle/deb/thosts_0.1.0_amd64.deb

# If dependencies are missing:
sudo apt-get install -f
```

### Fedora/RHEL/openSUSE (RPM)

```bash
sudo rpm -i src-tauri/target/release/bundle/rpm/thosts-0.1.0-1.x86_64.rpm

# Or using dnf:
sudo dnf install src-tauri/target/release/bundle/rpm/thosts-0.1.0-1.x86_64.rpm
```

## Bundle Configuration

The bundle targets are configured in `src-tauri/tauri.conf.json`:

```json
{
  "bundle": {
    "active": true,
    "targets": ["deb", "rpm"],  // Only build DEB and RPM
    "icon": [...]
  }
}
```

### Available Bundle Targets

You can customize the `targets` array:

- **Linux**:
  - `"deb"` - Debian package
  - `"rpm"` - RPM package
  - `"appimage"` - AppImage (requires xdg-utils)
  
- **macOS**:
  - `"dmg"` - DMG installer
  - `"app"` - .app bundle
  
- **Windows**:
  - `"msi"` - MSI installer
  - `"nsis"` - NSIS installer

- **All platforms**:
  - `"all"` - All available formats for current platform

## AppImage Support (Optional)

If you need AppImage bundling, install xdg-utils:

```bash
# Debian/Ubuntu
sudo apt-get install xdg-utils

# Fedora/RHEL
sudo dnf install xdg-utils

# Arch
sudo pacman -S xdg-utils
```

Then update `tauri.conf.json`:

```json
"targets": ["deb", "rpm", "appimage"]
```

## Build Artifacts

After a successful build, you'll find:

```txt
src-tauri/target/release/
├── bundle/
│   ├── deb/
│   │   └── thosts_0.1.0_amd64.deb          # Debian package
│   └── rpm/
│       └── thosts-0.1.0-1.x86_64.rpm       # RPM package
└── thosts                                   # Standalone binary
```

## Running the Binary Directly

You can run the binary without installing:

```bash
# After building
./src-tauri/target/release/thosts
```

⚠️ **Note**: Running as a standalone binary may require adjusting permissions for writing to `/etc/hosts`.

## Cross-Platform Building

To build for different platforms:

### From Linux → Windows

```bash
# Install cross-compilation tools
sudo apt install nsis
sudo apt install lld llvm clang
rustup target add x86_64-pc-windows-msvc
cargo install --locked cargo-xwin

# Build
npm run tauri build -- --runner cargo-xwin --target x86_64-pc-windows-msvc
```

### From Linux → macOS

Building for macOS from Linux requires OSX SDK (complex setup). Consider using:

- GitHub Actions for automated cross-platform builds
- Docker containers with cross-compilation tools

## Automated Builds with GitHub Actions

Create `.github/workflows/build.yml`:

```yaml
name: Build

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    strategy:
      matrix:
        platform: [ubuntu-latest, windows-latest, macos-latest]
    
    runs-on: ${{ matrix.platform }}
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 20
      
      - name: Setup Rust
        uses: dtolnay/rust-toolchain@stable
      
      - name: Install dependencies (Ubuntu)
        if: matrix.platform == 'ubuntu-latest'
        run: |
          sudo apt-get update
          sudo apt-get install -y libgtk-3-dev libwebkit2gtk-4.0-dev librsvg2-dev
      
      - name: Install Node dependencies
        run: npm install
      
      - name: Build Tauri app
        run: npm run tauri build
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: ${{ matrix.platform }}-build
          path: src-tauri/target/release/bundle/
```

## Signing and Distribution

### Code Signing (for production)

**macOS:**

```bash
# Requires Apple Developer account
codesign --sign "Developer ID Application: Your Name" \
  src-tauri/target/release/bundle/macos/thosts.app
```

**Windows:**

```powershell
# Requires code signing certificate
signtool sign /f certificate.pfx /p password \
  src-tauri/target/release/bundle/msi/thosts.msi
```

### Distribution Channels

1. **GitHub Releases**: Upload built packages
2. **Package Repositories**:
   - DEB: Create PPA or host on GitHub
   - RPM: COPR or custom repo
   - AUR: Create AUR package (Arch Linux)
3. **Snap Store**: Create snap package
4. **Flatpak**: Create Flatpak package

## Troubleshooting

### Build Fails with Missing Dependencies

**Linux:**

```bash
# Ubuntu/Debian
sudo apt-get install libgtk-3-dev libwebkit2gtk-4.0-dev \
  librsvg2-dev libjavascriptcoregtk-4.0-dev

# Fedora
sudo dnf install gtk3-devel webkit2gtk4.0-devel \
  librsvg2-devel
```

### Cargo Warning

If you see warnings during build:

```bash
cd src-tauri
cargo fix --lib -p thosts --allow-dirty
```

### Binary Size Too Large

The release binary can be large due to webkit dependencies. To optimize:

```toml
# In src-tauri/Cargo.toml
[profile.release]
opt-level = "z"     # Optimize for size
lto = true          # Link-time optimization
codegen-units = 1   # Better optimization
strip = true        # Strip symbols
```

## Version Management

Update version in multiple files:

1. **package.json**: `"version": "0.1.0"`
2. **src-tauri/Cargo.toml**: `version = "0.1.0"`
3. **src-tauri/tauri.conf.json**: `"version": "0.1.0"`

Consider using a script to sync versions across files.

## Next Steps

1. ✅ Build successful (DEB + RPM)
2. [ ] Test installation on target systems
3. [ ] Create GitHub release
4. [ ] Setup CI/CD pipeline
5. [ ] Submit to package repositories
6. [ ] Create custom app icon
7. [ ] Setup code signing
