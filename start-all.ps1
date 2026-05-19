# =============================================================================
# AI CAMPUS RECRUITMENT SYSTEM - COMPLETE STARTUP SCRIPT
# =============================================================================
# This script starts all three services:
# 1. Python AI Service (FastAPI) - Port 8000
# 2. Node.js Backend (Express) - Port 5000
# 3. React Frontend - Port 3000
#
# Requirements:
# - Python 3.8+ with pip
# - Node.js 18+ with npm
# - MongoDB Atlas connection (configured in backend\.env)
# =============================================================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " AI CAMPUS RECRUITMENT SYSTEM" -ForegroundColor Cyan
Write-Host " Complete Startup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get the script directory
$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$PROJECT_ROOT = $SCRIPT_DIR

# =============================================================================
# STEP 1: Setup Python AI Service
# =============================================================================
Write-Host "[1/7] Setting up Python AI Service..." -ForegroundColor Yellow

$AI_SERVICE_DIR = Join-Path $PROJECT_ROOT "ai-service"

if (-not (Test-Path $AI_SERVICE_DIR)) {
    Write-Host "ERROR: ai-service directory not found!" -ForegroundColor Red
    exit 1
}

Set-Location $AI_SERVICE_DIR

# Check if virtual environment exists
if (-not (Test-Path "venv")) {
    Write-Host "Creating Python virtual environment..." -ForegroundColor Green
    python -m venv venv
}

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Green
& ".\venv\Scripts\Activate.ps1"

# Install Python dependencies (pure Python packages for Python 3.14 compatibility)
Write-Host "Installing Python dependencies (pure Python only)..." -ForegroundColor Green
pip install --upgrade pip | Out-Null
pip install -r requirements.txt

# Try to install spaCy (optional - will use regex fallback if unavailable)
Write-Host "Attempting optional spaCy installation..." -ForegroundColor Yellow
try {
    pip install spacy 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Downloading spaCy language model..." -ForegroundColor Green
        python -m spacy download en_core_web_sm 2>$null
        Write-Host "spaCy installed successfully!" -ForegroundColor Green
    } else {
        Write-Host "spaCy not available for this Python version - using regex fallback" -ForegroundColor Yellow
    }
} catch {
    Write-Host "spaCy not available - using regex fallback (this is OK)" -ForegroundColor Yellow
}

Write-Host "Python AI Service setup complete!" -ForegroundColor Green
Write-Host ""

# =============================================================================
# STEP 2: Setup Node.js Backend
# =============================================================================
Write-Host "[2/7] Setting up Node.js Backend..." -ForegroundColor Yellow

$BACKEND_DIR = Join-Path $PROJECT_ROOT "backend"
Set-Location $BACKEND_DIR

Write-Host "Installing backend dependencies..." -ForegroundColor Green
npm install

Write-Host "Backend setup complete!" -ForegroundColor Green
Write-Host ""

# =============================================================================
# STEP 3: Setup React Frontend
# =============================================================================
Write-Host "[3/7] Setting up React Frontend..." -ForegroundColor Yellow

$FRONTEND_DIR = Join-Path $PROJECT_ROOT "frontend"
Set-Location $FRONTEND_DIR

Write-Host "Installing frontend dependencies..." -ForegroundColor Green
npm install

Write-Host "Frontend setup complete!" -ForegroundColor Green
Write-Host ""

# =============================================================================
# STEP 4: Start Python AI Service
# =============================================================================
Write-Host "[4/7] Starting Python AI Service on port 8000..." -ForegroundColor Yellow

Set-Location $AI_SERVICE_DIR
& ".\venv\Scripts\Activate.ps1"

$aiJob = Start-Job -ScriptBlock {
    param($aiDir)
    Set-Location $aiDir
    & ".\venv\Scripts\Activate.ps1"
    python main.py
} -ArgumentList $AI_SERVICE_DIR

Start-Sleep -Seconds 3
Write-Host "AI Service started (Job ID: $($aiJob.Id))" -ForegroundColor Green
Write-Host ""

# =============================================================================
# STEP 5: Start Node.js Backend
# =============================================================================
Write-Host "[5/7] Starting Node.js Backend on port 5000..." -ForegroundColor Yellow

Set-Location $BACKEND_DIR

$backendJob = Start-Job -ScriptBlock {
    param($backendDir)
    Set-Location $backendDir
    npm run dev
} -ArgumentList $BACKEND_DIR

Start-Sleep -Seconds 3
Write-Host "Backend started (Job ID: $($backendJob.Id))" -ForegroundColor Green
Write-Host ""

# =============================================================================
# STEP 6: Start React Frontend
# =============================================================================
Write-Host "[6/7] Starting React Frontend on port 3000..." -ForegroundColor Yellow

Set-Location $FRONTEND_DIR

$frontendJob = Start-Job -ScriptBlock {
    param($frontendDir)
    Set-Location $frontendDir
    npm start
} -ArgumentList $FRONTEND_DIR

Start-Sleep -Seconds 5
Write-Host "Frontend started (Job ID: $($frontendJob.Id))" -ForegroundColor Green
Write-Host ""

# =============================================================================
# STEP 7: Display Status
# =============================================================================
Write-Host "[7/7] All services started successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " SYSTEM IS READY!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Service URLs:" -ForegroundColor Yellow
Write-Host "  AI Service:  http://localhost:8000" -ForegroundColor White
Write-Host "  AI Docs:     http://localhost:8000/docs" -ForegroundColor White
Write-Host "  Backend API: http://localhost:5000" -ForegroundColor White
Write-Host "  Frontend:    http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Job IDs:" -ForegroundColor Yellow
Write-Host "  AI Service:  $($aiJob.Id)" -ForegroundColor White
Write-Host "  Backend:     $($backendJob.Id)" -ForegroundColor White
Write-Host "  Frontend:    $($frontendJob.Id)" -ForegroundColor White
Write-Host ""
Write-Host "To stop all services:" -ForegroundColor Yellow
Write-Host "  Stop-Job $($aiJob.Id),$($backendJob.Id),$($frontendJob.Id)" -ForegroundColor White
Write-Host "  Remove-Job $($aiJob.Id),$($backendJob.Id),$($frontendJob.Id)" -ForegroundColor White
Write-Host ""
Write-Host "Or use: .\stop-all.ps1" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to exit monitoring (services will continue running)" -ForegroundColor Yellow
Write-Host ""

# Monitor jobs
try {
    while ($true) {
        Start-Sleep -Seconds 5
        
        # Check if jobs are still running
        if ((Get-Job -Id $aiJob.Id).State -ne 'Running') {
            Write-Host "WARNING: AI Service stopped!" -ForegroundColor Red
        }
        if ((Get-Job -Id $backendJob.Id).State -ne 'Running') {
            Write-Host "WARNING: Backend stopped!" -ForegroundColor Red
        }
        if ((Get-Job -Id $frontendJob.Id).State -ne 'Running') {
            Write-Host "WARNING: Frontend stopped!" -ForegroundColor Red
        }
    }
} catch {
    Write-Host ""
    Write-Host "Monitoring stopped. Services are still running in background." -ForegroundColor Yellow
}
