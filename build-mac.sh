#!/bin/bash

# Build script for macOS (both Intel and Apple Silicon)

echo "🏗️  Building IRA Calculator for macOS..."
echo "This will create both Intel (x64) and Apple Silicon (arm64) versions."
echo ""

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist/
rm -rf build/

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build React app
echo "⚛️  Building React app..."
npm run build-electron-prod

# Build for both architectures separately
echo "🖥️  Building Electron app for Intel (x64)..."
npm run dist:mac:x64

echo ""
echo "🖥️  Building Electron app for Apple Silicon (arm64)..."
npm run dist:mac:arm64

# Check if builds were successful
echo ""
echo "✅ Build complete! Checking artifacts..."
echo ""

if [ -f "dist/IRA Calculator-"*"-x64.dmg" ]; then
    echo "✓ Intel (x64) DMG found:"
    ls -lh dist/*-x64.dmg
else
    echo "❌ Intel (x64) DMG not found!"
fi

echo ""

if [ -f "dist/IRA Calculator-"*"-arm64.dmg" ]; then
    echo "✓ Apple Silicon (arm64) DMG found:"
    ls -lh dist/*-arm64.dmg
else
    echo "❌ Apple Silicon (arm64) DMG not found!"
fi

echo ""
echo "📁 All build artifacts:"
ls -lh dist/

echo ""
echo "🎉 Done! Your DMG files are in the dist/ directory."
