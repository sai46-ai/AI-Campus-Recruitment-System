# Quick verification script to check system readiness
# Run this BEFORE start-all.ps1 to verify prerequisites

Write-Host "=== AI CAMPUS RECRUITMENT SYSTEM - PREREQUISITE CHECK ===" -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# Check Python
Write-Host "Checking Python..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    if ($pythonVersion -match "Python (\d+\.\d+)") {
        $version = [version]$matches[1]
        if ($version -ge [version]"3.8") {
            Write-Host "  ✅ Python $($matches[1]) found" -ForegroundColor Green
        } else {
            Write-Host "  ❌ Python version too old: $($matches[1]) (need 3.8+)" -ForegroundColor Red
            $allGood = $false
        }
    }
} catch {
    Write-Host "  ❌ Python not found in PATH" -ForegroundColor Red
    $allGood = $false
}

# Check pip
Write-Host "Checking pip..." -ForegroundColor Yellow
try {
    $pipVersion = pip --version 2>&1
    if ($pipVersion -match "pip") {
        Write-Host "  ✅ pip found" -ForegroundColor Green
    }
} catch {
    Write-Host "  ❌ pip not found" -ForegroundColor Red
    $allGood = $false
}

# Check Node.js
Write-Host "Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>&1
    if ($nodeVersion -match "v(\d+)\.") {
        $majorVersion = [int]$matches[1]
        if ($majorVersion -ge 18) {
            Write-Host "  ✅ Node.js $nodeVersion found" -ForegroundColor Green
        } else {
            Write-Host "  ❌ Node.js version too old: $nodeVersion (need v18+)" -ForegroundColor Red
            $allGood = $false
        }
    }
} catch {
    Write-Host "  ❌ Node.js not found in PATH" -ForegroundColor Red
    $allGood = $false
}

# Check npm
Write-Host "Checking npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version 2>&1
    Write-Host "  ✅ npm $npmVersion found" -ForegroundColor Green
} catch {
    Write-Host "  ❌ npm not found" -ForegroundColor Red
    $allGood = $false
}

# Check MongoDB connection string
Write-Host "Checking MongoDB configuration..." -ForegroundColor Yellow
$envFile = ".\backend\.env"
if (Test-Path $envFile) {
    $envContent = Get-Content $envFile -Raw
    if ($envContent -match "MONGO_URI=mongodb") {
        Write-Host "  ✅ MongoDB URI configured" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  MongoDB URI not found in .env" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ⚠️  backend/.env file not found" -ForegroundColor Yellow
}

# Check AI Service URL
if ($envContent -match "AI_SERVICE_URL=") {
    Write-Host "  ✅ AI_SERVICE_URL configured" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  AI_SERVICE_URL not found in .env" -ForegroundColor Yellow
}

# Check ports availability
Write-Host "Checking port availability..." -ForegroundColor Yellow
$portsToCheck = @(3000, 5000, 8000)
foreach ($port in $portsToCheck) {
    $portInUse = netstat -ano | Select-String ":$port" | Select-String "LISTENING"
    if ($portInUse) {
        Write-Host "  ⚠️  Port $port is already in use" -ForegroundColor Yellow
    } else {
        Write-Host "  ✅ Port $port is available" -ForegroundColor Green
    }
}

# Check directory structure
Write-Host "Checking project structure..." -ForegroundColor Yellow
$requiredDirs = @(
    ".\ai-service",
    ".\backend",
    ".\frontend"
)
foreach ($dir in $requiredDirs) {
    if (Test-Path $dir) {
        Write-Host "  ✅ $dir exists" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $dir not found" -ForegroundColor Red
        $allGood = $false
    }
}

# Check critical files
Write-Host "Checking critical files..." -ForegroundColor Yellow
$criticalFiles = @(
    ".\ai-service\main.py",
    ".\ai-service\requirements.txt",
    ".\backend\server.js",
    ".\backend\package.json",
    ".\frontend\package.json",
    ".\start-all.ps1"
)
foreach ($file in $criticalFiles) {
    if (Test-Path $file) {
        Write-Host "  ✅ $file exists" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file not found" -ForegroundColor Red
        $allGood = $false
    }
}

Write-Host ""
Write-Host "=== SUMMARY ===" -ForegroundColor Cyan

if ($allGood) {
    Write-Host "✅ ALL PREREQUISITES MET! Ready to run .\start-all.ps1" -ForegroundColor Green
} else {
    Write-Host "❌ SOME PREREQUISITES MISSING! Please fix the issues above." -ForegroundColor Red
    Write-Host ""
    Write-Host "Installation Instructions:" -ForegroundColor Yellow
    Write-Host "  - Python 3.8+: https://www.python.org/downloads/" -ForegroundColor White
    Write-Host "  - Node.js 18+: https://nodejs.org/" -ForegroundColor White
    Write-Host "  - MongoDB Atlas: https://www.mongodb.com/atlas" -ForegroundColor White
}

Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Fix any issues above" -ForegroundColor White
Write-Host "  2. Run: .\start-all.ps1" -ForegroundColor White
Write-Host "  3. Wait 30-60 seconds for services to start" -ForegroundColor White
Write-Host "  4. Open http://localhost:3000 in browser" -ForegroundColor White
Write-Host ""
