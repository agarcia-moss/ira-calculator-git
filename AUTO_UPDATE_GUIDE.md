# Auto-Update Guide for IRA Calculator

## 🎯 Current Status

The auto-update functionality is now properly configured but requires a published GitHub release to work. Here's what you need to know:

## 📋 Expected Behavior

### Before First Release
- **Version Display**: Will show "1.0.0" (from package.json)
- **Update Check**: Will show "No updates available yet (no releases published)" or similar error
- **This is normal** - The auto-updater needs a published release on GitHub to check against

### After First Release
- **Version Display**: Will show the current app version
- **Update Check**: Will properly check GitHub for newer releases
- **Auto-Updates**: Will download and install updates automatically

## 🚀 Setting Up Your First Release

1. **Update version in package.json**:
   ```bash
   npm version patch  # Changes 1.0.0 to 1.0.1
   ```

2. **Commit and push all changes**:
   ```bash
   git add .
   git commit -m "Add auto-update functionality and fix version display"
   git push origin main
   ```

3. **Create and push a version tag**:
   ```bash
   git tag v1.0.1 -m "First release with auto-updates"
   git push origin v1.0.1
   ```

4. **Wait for GitHub Actions** to build and create the draft release

5. **Publish the release** on GitHub with release notes

## 🔄 How Auto-Updates Work

### For End Users

1. **Automatic Checks**: The app checks for updates:
   - On app startup (2 seconds after launch)
   - When clicking "Check for Updates" button

2. **Update Process**:
   - If an update is found, it downloads automatically in the background
   - Users see progress in the update notification
   - Once downloaded, users can choose to restart immediately or later
   - If they choose later, the update installs on next app quit

3. **Version Requirements**:
   - Updates only work when the new version number is higher
   - Follow semantic versioning: 1.0.0 → 1.0.1 → 1.1.0 etc.

### Update Messages Users Will See

- **"Checking for update..."** - When checking starts
- **"Update available: v1.0.2"** - When a new version is found
- **"You have the latest version!"** - When no updates are available
- **"Download progress: X%"** - During download
- **"Update downloaded"** - Ready to install
- **"No updates available yet (no releases published)"** - Before first release

## 🧪 Testing Updates with Your Friend

1. **First Installation**:
   - Have your friend download and install the current arm64.dmg
   - They should see version 1.0.0 in the settings
   - Update check will fail (expected before first release)

2. **After You Publish v1.0.1**:
   - Your friend's app will automatically check for updates on next launch
   - They'll see an update notification for v1.0.1
   - The update will download automatically
   - They can restart to apply the update

3. **Verification**:
   - After update, version should show 1.0.1
   - All data and settings should be preserved

## ⚠️ Important Notes

### Code Signing
- The app is currently **not code signed**
- macOS users need to right-click → Open on first launch
- This doesn't affect auto-updates, but users may see security warnings

### Update Server
- Updates are served directly from GitHub Releases
- The app needs internet access to check for updates
- GitHub API rate limits apply (60 requests/hour for unauthenticated)

### Rollback
- If an update causes issues, users can manually download previous versions from GitHub Releases
- Consider keeping older releases available for this purpose

## 🛠️ Troubleshooting

### "Failed to check for updates"
1. **No Internet**: Check network connection
2. **No Releases**: Publish at least one release on GitHub
3. **GitHub Down**: Check GitHub status
4. **Firewall**: Ensure app can access github.com

### Version Still Shows "Loading..."
1. Restart the app
2. Check if electron.js was updated correctly
3. Verify IPC handlers are registered

### Updates Not Installing
1. Check available disk space
2. Ensure app has write permissions
3. Check logs at:
   - **macOS**: `~/Library/Logs/IRA Calculator/`
   - **Windows**: `%APPDATA%/IRA Calculator/logs/`

## 📊 Update Analytics

The electron-log package creates logs that can help debug issues:
- Auto-updater events
- Error messages
- Download progress

Users can share these logs if they experience update issues.

## 🎉 Next Steps

1. **Test Locally**: Run the app and click the settings button - version should show
2. **Push Changes**: Commit and push all the fixes
3. **Create Release**: Tag v1.0.1 and let GitHub Actions build
4. **Test Updates**: Have your friend test the update process
5. **Monitor**: Check GitHub issues for any update-related problems

The auto-update system is now fully configured and will work perfectly once you have your first GitHub release published!
