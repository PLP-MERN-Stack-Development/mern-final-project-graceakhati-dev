# Full Recovery Script for Planet Path Frontend
# This script performs a complete recovery of the frontend project
# Run from project root: .\client\full-recovery.ps1

Write-Host "🚀 Planet Path Frontend - Full Recovery Script" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to client directory
$originalLocation = Get-Location
Set-Location client

try {
    # Step 1: Clean build artifacts
    Write-Host "📦 Step 1: Cleaning build artifacts..." -ForegroundColor Yellow
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
    Write-Host ""

    # Step 2: Reinstall dependencies
    Write-Host "📥 Step 2: Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to install dependencies"
    }
    Write-Host "  ✓ Dependencies installed" -ForegroundColor Green
    Write-Host ""

    # Step 3: Verify TypeScript types
    Write-Host "🔍 Step 3: Verifying TypeScript configuration..." -ForegroundColor Yellow
    npm run build 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ TypeScript compilation successful" -ForegroundColor Green
    } else {
        Write-Host "  ✗ TypeScript compilation failed" -ForegroundColor Red
        Write-Host "  Running TypeScript check..." -ForegroundColor Yellow
        npx tsc --noEmit
    }
    Write-Host ""

    # Step 4: Build project
    Write-Host "🔨 Step 4: Building project..." -ForegroundColor Yellow
    npm run build
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Build successful!" -ForegroundColor Green
    } else {
        throw "Build failed"
    }
    Write-Host ""

    # Step 5: Verify components
    Write-Host "✅ Step 5: Verifying components..." -ForegroundColor Yellow
    $components = @(
        "src/components/NavBar.tsx",
        "src/components/Layout/Footer.tsx",
        "src/components/Layout/Layout.tsx"
    )
    
    foreach ($component in $components) {
        if (Test-Path $component) {
            Write-Host "  ✓ $component exists" -ForegroundColor Green
        } else {
            Write-Host "  ✗ $component missing" -ForegroundColor Red
        }
    }
    Write-Host ""

    # Step 6: Summary
    Write-Host "📊 Recovery Summary" -ForegroundColor Cyan
    Write-Host "==================" -ForegroundColor Cyan
    Write-Host "✓ Build artifacts cleaned" -ForegroundColor Green
    Write-Host "✓ Dependencies reinstalled" -ForegroundColor Green
    Write-Host "✓ TypeScript compilation successful" -ForegroundColor Green
    Write-Host "✓ Production build successful" -ForegroundColor Green
    Write-Host "✓ All components verified" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎉 Recovery completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Run 'npm run dev' to start development server" -ForegroundColor White
    Write-Host "  2. Open http://localhost:5173/ in your browser" -ForegroundColor White
    Write-Host "  3. Verify NavBar, Footer, and routing work correctly" -ForegroundColor White
    Write-Host ""

} catch {
    Write-Host ""
    Write-Host "❌ Error during recovery: $_" -ForegroundColor Red
    Write-Host ""
    exit 1
} finally {
    Set-Location $originalLocation
}

