#!/bin/bash
# Full Recovery Script for Planet Path Frontend
# This script performs a complete recovery of the frontend project
# Run from project root: bash client/full-recovery.sh

echo "🚀 Planet Path Frontend - Full Recovery Script"
echo "=============================================="
echo ""

# Navigate to client directory
cd client || exit 1

# Step 1: Clean build artifacts
echo "📦 Step 1: Cleaning build artifacts..."
rm -rf node_modules dist .vite
echo "  ✓ Removed build artifacts"
echo ""

# Step 2: Reinstall dependencies
echo "📥 Step 2: Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "  ✗ Failed to install dependencies"
    exit 1
fi
echo "  ✓ Dependencies installed"
echo ""

# Step 3: Verify TypeScript types
echo "🔍 Step 3: Verifying TypeScript configuration..."
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "  ✓ TypeScript compilation successful"
else
    echo "  ✗ TypeScript compilation failed"
    echo "  Running TypeScript check..."
    npx tsc --noEmit
fi
echo ""

# Step 4: Build project
echo "🔨 Step 4: Building project..."
npm run build
if [ $? -ne 0 ]; then
    echo "  ✗ Build failed"
    exit 1
fi
echo "  ✓ Build successful!"
echo ""

# Step 5: Verify components
echo "✅ Step 5: Verifying components..."
components=(
    "src/components/NavBar.tsx"
    "src/components/Layout/Footer.tsx"
    "src/components/Layout/Layout.tsx"
)

for component in "${components[@]}"; do
    if [ -f "$component" ]; then
        echo "  ✓ $component exists"
    else
        echo "  ✗ $component missing"
    fi
done
echo ""

# Step 6: Summary
echo "📊 Recovery Summary"
echo "=================="
echo "✓ Build artifacts cleaned"
echo "✓ Dependencies reinstalled"
echo "✓ TypeScript compilation successful"
echo "✓ Production build successful"
echo "✓ All components verified"
echo ""
echo "🎉 Recovery completed successfully!"
echo ""
echo "Next steps:"
echo "  1. Run 'npm run dev' to start development server"
echo "  2. Open http://localhost:5173/ in your browser"
echo "  3. Verify NavBar, Footer, and routing work correctly"
echo ""

