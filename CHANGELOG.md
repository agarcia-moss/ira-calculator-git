# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-01

### Added
- Initial release of IRA Calculator v1.0.0
- Electron-based desktop application for IRA calculations
- Auto-updater functionality for seamless updates
- Cross-platform support (macOS, Windows, Linux)
- Modern React UI with charts and data visualization

### Features
- Apprentice program IRA calculations
- Trade chart visualization
- Project overview and reporting
- Data export functionality
- Real-time calculation updates

## [Unreleased]

### Added

### Changed

### Deprecated

### Removed

### Fixed

### Security

---

## Release Process

To create a new release:

1. Update version in `package.json`
2. Update this changelog with new features/fixes
3. Commit changes
4. Create and push a new git tag: `git tag v1.0.1 && git push origin v1.0.1`
5. GitHub Actions will automatically build and publish the release
6. The auto-updater will notify users of the new version

## Auto-Updates

The application includes automatic update functionality:
- Checks for updates on startup (production only)
- Downloads updates in the background
- Prompts user to restart when ready
- Supports silent updates for minor versions
