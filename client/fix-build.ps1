# PowerShell Fix Script for MERN Final Project Client
# Run this script from the project root directory

Write-Host "🔧 Starting build fix process..." -ForegroundColor Cyan

# Navigate to client directory
Set-Location client

# Clean build artifacts
Write-Host "`n🧹 Cleaning build artifacts..." -ForegroundColor Yellow
if (Test-Path node_modules) { 
    Remove-Item -Recurse -Force node_modules
    Write-Host "  ✓ Removed node_modules" -ForegroundColor Green
}
if (Test-Path dist) { 
    Remove-Item -Recurse -Force dist
    Write-Host "  ✓ Removed dist" -ForegroundColor Green
}
if (Test-Path .vite) { 
    Remove-Item -Recurse -Force .vite
    Write-Host "  ✓ Removed .vite" -ForegroundColor Green
}

# Reinstall dependencies
Write-Host "`n📦 Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "  ✗ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Build project
Write-Host "`n🔨 Building project..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Build successful!" -ForegroundColor Green
    Write-Host "`n🚀 Ready to start dev server with: npm run dev" -ForegroundColor Cyan
} else {
    Write-Host "`n✗ Build failed" -ForegroundColor Red
    exit 1
}

# Return to project root
Set-Location ..

Write-Host "`n✨ Fix process completed!" -ForegroundColor Green

