# Testing & Verification Guide for IRA Calculator

## 🧪 Local Build Testing

### Prerequisites
- Node.js v18+ installed
- Git configured with GitHub access
- Clean working directory (no uncommitted changes)

### Step 1: Install Dependencies
```bash
# Clean install to ensure consistency
rm -rf node_modules package-lock.json
npm install
```

### Step 2: Test Development Mode
```bash
# Run the app in development mode
npm run electron

# Verify:
# - App window opens
# - No console errors
# - All features work as expected
# - Hot reload works (make a change and save)
```

### Step 3: Build for macOS

```bash
# Build for both Intel and Apple Silicon
npm run dist:mac

# Or use the build script
./build-mac.sh

# Output will be in:
# - dist/IRA Calculator-{version}-x64.dmg (Intel)
# - dist/IRA Calculator-{version}-arm64.dmg (Apple Silicon)
```

**Note**: The build process will create both architectures regardless of which Mac you're building on.

### Step 4: Test the Built Application
1. Install/run the built application
2. Verify all features work correctly
3. Check that the app icon appears correctly
4. Test file associations (if any)
5. Verify auto-updater initialization (check logs)

## 🚀 GitHub Actions Verification

### Step 1: Push Changes
```bash
# Stage all changes
git add .

# Commit with descriptive message
git commit -m "Fix build issues and add GitHub Actions workflow for releases"

# Push to main branch
git push origin main
```

### Step 2: Verify Test Build Workflow
1. Go to your GitHub repository
2. Click on "Actions" tab
3. You should see "Test Build" workflow running
4. Click on it to see progress
5. Verify all jobs complete successfully

### Step 3: Create a Release

#### Option A: Using Git Tags (Recommended)
```bash
# Create a version tag
git tag v1.0.1

# Push the tag to GitHub
git push origin v1.0.1
```

#### Option B: Manual Trigger
1. Go to Actions tab in GitHub
2. Select "Build and Release" workflow
3. Click "Run workflow"
4. Enter version tag (e.g., v1.0.1)
5. Click "Run workflow"

### Step 4: Monitor Release Build
1. Go to Actions tab
2. Click on the running "Build and Release" workflow
3. Monitor progress for macOS build
4. The build should:
   - Check out code ✓
   - Install Node.js ✓
   - Install dependencies ✓
   - Build React app ✓
   - Build Electron app for both architectures ✓
   - Upload both DMG files ✓

### Step 5: Verify GitHub Release
1. Go to "Releases" section of your repository
2. You should see a draft release for your version
3. Verify all artifacts are uploaded:
   - macOS Intel: `IRA-Calculator-v{VERSION}-x64.dmg`
   - macOS Apple Silicon: `IRA-Calculator-v{VERSION}-arm64.dmg`
   - Auto-update file: `latest-mac.yml`
4. Edit release notes using the template
5. Publish the release when ready

## 🔍 Post-Release Verification

### Test Auto-Updates
1. Install an older version of your app
2. Open the app and check for updates
3. Verify update notification appears
4. Test the update installation process

### macOS-Specific Tests

#### Intel Mac (x64)
- [ ] DMG mounts correctly
- [ ] Drag-to-Applications works
- [ ] App launches successfully
- [ ] No Rosetta translation warning
- [ ] Performance is native

#### Apple Silicon Mac (arm64)
- [ ] DMG mounts correctly
- [ ] Drag-to-Applications works
- [ ] App launches successfully
- [ ] Activity Monitor shows "Kind: Apple" (not "Intel")
- [ ] No performance issues

#### Both Architectures
- [ ] First launch requires right-click → Open
- [ ] Auto-updater initializes
- [ ] All features work correctly
- [ ] Window resizing works
- [ ] Menu bar integration correct

## 🛠️ Troubleshooting

### Build Failures

#### "Cannot find module" errors
```bash
# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### macOS build errors
- Install Xcode Command Line Tools: `xcode-select --install`
- Ensure you have enough disk space (need ~5GB free)
- If builds fail, try: `npm run postinstall` to rebuild native dependencies
- For code signing issues, build unsigned for testing

### GitHub Actions Issues

#### Workflow not triggering
- Verify tag format matches `v*` pattern
- Check workflow file is in `.github/workflows/`
- Ensure you have push permissions

#### Build succeeds but release fails
- Check GitHub token permissions
- Verify artifact paths match actual output
- Check file size limits (2GB per file)

### Auto-Update Issues

#### Updates not detected
1. Check app-update.yml configuration
2. Verify version number is higher
3. Check GitHub release is published (not draft)
4. Review electron-updater logs

#### Update download fails
- Check network connectivity
- Verify GitHub releases are public
- Check firewall/proxy settings

## 📊 Performance Benchmarks

After building, verify performance:

1. **Startup Time**: Should be < 3 seconds
2. **Memory Usage**: Check in Task Manager/Activity Monitor
   - Initial: < 200MB
   - During use: < 500MB
3. **CPU Usage**: Should be minimal when idle
4. **Disk Space**: 
   - Windows: ~150MB installed
   - macOS: ~200MB
   - Linux: ~180MB

## ✅ Final Checklist

Before considering the release process complete:

- [ ] All platforms build successfully
- [ ] GitHub Actions workflow completes without errors
- [ ] Release artifacts are uploaded to GitHub
- [ ] At least one platform tested end-to-end
- [ ] Auto-updater configuration verified
- [ ] Release notes updated
- [ ] Version number incremented
- [ ] No critical errors in production logs

## 📝 Maintenance

### Regular Tasks
1. Update dependencies monthly
2. Test builds on all platforms quarterly
3. Review and update GitHub Actions runners
4. Monitor user feedback for platform-specific issues

### Version Numbering
Follow semantic versioning:
- **Major** (1.0.0): Breaking changes
- **Minor** (1.1.0): New features
- **Patch** (1.1.1): Bug fixes

Always create a git tag for releases:
```bash
git tag v1.1.1 -m "Fix calculation bug"
git push origin v1.1.1
```
