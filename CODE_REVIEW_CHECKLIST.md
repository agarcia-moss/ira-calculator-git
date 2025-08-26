# Code Review Checklist for IRA Calculator

## ✅ Pre-Build Checklist

### Package Configuration
- [x] **package.json** properly configured
  - [x] Valid version number following semantic versioning
  - [x] Author information filled out
  - [x] Repository field points to correct GitHub repo
  - [x] Main entry point set to `public/electron.js`
  - [x] Homepage set to `./` for proper file loading
  - [x] Build scripts use cross-platform commands (cross-env)
  - [x] Electron and electron-builder versions are compatible

### Dependencies
- [x] All production dependencies listed in `dependencies`
- [x] All dev dependencies listed in `devDependencies`
- [x] No missing dependencies that could cause runtime errors
- [x] `cross-env` added for cross-platform environment variables

### Electron Configuration
- [x] **electron.js** has proper error handling
  - [x] Uses `app.isPackaged` instead of NODE_ENV
  - [x] Handles file loading errors
  - [x] Implements crash recovery
  - [x] Single instance lock implemented
  - [x] Certificate error handling for development

### Build Configuration
- [x] **electron-builder.yml** created with proper settings
  - [x] AppId and product name set
  - [x] Multi-platform targets configured
  - [x] Artifact naming includes version
  - [x] Auto-updater configuration present
  - [x] File inclusion patterns correct

### Platform-Specific Settings
- [x] **Windows (NSIS)**
  - [x] Installer allows directory selection
  - [x] Creates desktop and start menu shortcuts
  - [x] Proper uninstaller configuration

- [x] **macOS**
  - [x] Category set for App Store
  - [x] Universal binary support (x64 + arm64)
  - [x] Entitlements file created
  - [x] DMG configuration present

- [x] **Linux**
  - [x] AppImage configuration
  - [x] Debian package configuration
  - [x] Desktop file metadata

### Auto-Update Configuration
- [x] **app-update.yml** configured with GitHub release info
- [x] Auto-updater properly initialized in electron.js
- [x] Update notifications implemented
- [x] Error handling for update failures

### GitHub Configuration
- [x] **.gitignore** includes all necessary patterns
  - [x] `node_modules/`
  - [x] `dist/`
  - [x] `build/`
  - [x] `coverage/`
  - [x] OS-specific files

### CI/CD Configuration
- [x] **GitHub Actions workflows** created
  - [x] Release workflow triggers on version tags
  - [x] Builds for all three platforms
  - [x] Uploads artifacts to GitHub Releases
  - [x] Creates draft release with template
  - [x] Test build workflow for PRs

## 🔍 Common Build Issues to Check

### Before Building
1. **Clean previous builds**
   ```bash
   rm -rf dist/ build/
   ```

2. **Fresh dependency install**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Check Node.js version**
   - Should be v16+ (v18 recommended)

4. **Verify all assets exist**
   - `public/transparent_moss.png` (app icon)
   - `public/electron.js` (main process)
   - `public/preload.js` (preload script)

### Platform-Specific Issues

#### Windows
- [ ] Visual Studio Build Tools installed (for native modules)
- [ ] No path length issues (keep project path short)
- [ ] Antivirus not blocking electron-builder

#### macOS
- [ ] Xcode Command Line Tools installed
- [ ] No code signing errors (can build unsigned for testing)
- [ ] Permissions for app to access required resources

#### Linux
- [ ] Required system libraries installed
- [ ] Proper permissions on build scripts
- [ ] Desktop integration configured

## 📋 Final Pre-Release Checklist

1. **Version Management**
   - [ ] Version bumped in package.json
   - [ ] CHANGELOG.md updated
   - [ ] No debug code left in production

2. **Testing**
   - [ ] App launches successfully after build
   - [ ] All features work in packaged app
   - [ ] Auto-updater tested (if possible)
   - [ ] No console errors in production

3. **Security**
   - [ ] Context isolation enabled
   - [ ] Node integration disabled in renderer
   - [ ] No hardcoded secrets or tokens
   - [ ] CSP headers configured (if applicable)

4. **Performance**
   - [ ] Bundle size reasonable
   - [ ] No memory leaks
   - [ ] Startup time acceptable

5. **Documentation**
   - [ ] README updated with installation instructions
   - [ ] Release notes prepared
   - [ ] Known issues documented

## 🚀 Release Process

1. Commit all changes
2. Create and push version tag: `git tag v1.0.1 && git push origin v1.0.1`
3. GitHub Actions will automatically build and create draft release
4. Edit release notes and publish when ready
5. Verify auto-updater works for existing installations

## ⚠️ Troubleshooting

### Build Fails
- Check GitHub Actions logs for specific errors
- Verify all dependencies are installed
- Ensure no conflicting global packages
- Try building locally first

### Release Not Created
- Verify GitHub token has proper permissions
- Check tag format matches `v*` pattern
- Ensure workflow file syntax is correct

### Auto-Update Not Working
- Check app-update.yml configuration
- Verify GitHub releases are public
- Check electron-updater logs
- Ensure version numbers are incrementing properly
