#!/bin/bash
# Bash Fix Script for MERN Final Project Client
# Run this script from the project root directory

echo "🔧 Starting build fix process..."

# Navigate to client directory
cd client || exit 1

# Clean build artifacts
echo ""
echo "🧹 Cleaning build artifacts..."
rm -rf node_modules dist .vite
echo "  ✓ Removed build artifacts"

# Reinstall dependencies
echo ""
echo "📦 Installing dependencies..."
npm install
if [ $? -eq 0 ]; then
    echo "  ✓ Dependencies installed"
else
    echo "  ✗ Failed to install dependencies"
    exit 1
fi

# Build project
echo ""
echo "🔨 Building project..."
npm run build
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful!"
    echo ""
    echo "🚀 Ready to start dev server with: npm run dev"
else
    echo ""
    echo "✗ Build failed"
    exit 1
fi

# Return to project root
cd ..

echo ""
echo "✨ Fix process completed!"

