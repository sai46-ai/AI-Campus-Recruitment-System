# Stop all services script for AI Campus Recruitment System

Write-Host "Stopping all services..." -ForegroundColor Yellow

# Get all PowerShell jobs
$jobs = Get-Job

foreach ($job in $jobs) {
    Write-Host "Stopping Job $($job.Id): $($job.Name)..." -ForegroundColor Cyan
    Stop-Job -Id $job.Id
    Remove-Job -Id $job.Id -Force
}

# Also kill processes by port if jobs don't stop them
$ports = @(8000, 5000, 3000)
foreach ($port in $ports) {
    $processInfo = netstat -ano | Select-String ":$port" | Select-String "LISTENING"
    if ($processInfo) {
        $pidString = $processInfo -split '\s+' | Select-Object -Last 1
        $processId = [int]$pidString
        if ($processId -gt 0) {
            Write-Host "Killing process on port $port (PID: $processId)..." -ForegroundColor Red
            Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
        }
    }
}

Write-Host "All services stopped!" -ForegroundColor Green
