# CocoFile Performance Measurement Script (Windows)
# Usage: .\scripts\measure_performance.ps1

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "CocoFile Performance Measurement" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Process name
$ProcessName = "CocoFile"

# Check if CocoFile is running
$Process = Get-Process -Name $ProcessName -ErrorAction SilentlyContinue

if (-not $Process) {
    Write-Host "❌ CocoFile が起動していません。" -ForegroundColor Red
    Write-Host "   CocoFile を起動してから再度実行してください。" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ CocoFile が起動していることを確認しました。" -ForegroundColor Green
Write-Host ""
Write-Host "PID: $($Process.Id)"
Write-Host ""

# Measure memory usage (5 times, 2 second interval)
Write-Host "📊 メモリ使用量を測定中..." -ForegroundColor Cyan
Write-Host "   （5回測定、2秒間隔）" -ForegroundColor Gray
Write-Host ""

$TotalMem = 0
$Count = 0

for ($i = 1; $i -le 5; $i++) {
    $Proc = Get-Process -Name $ProcessName -ErrorAction SilentlyContinue
    
    if ($Proc) {
        $MemMB = [math]::Round($Proc.WorkingSet64 / 1MB, 2)
        Write-Host "   測定 $i: $MemMB MB" -ForegroundColor White
        $TotalMem += $MemMB
        $Count++
    }
    
    if ($i -lt 5) {
        Start-Sleep -Seconds 2
    }
}

Write-Host ""

# Calculate average
if ($Count -gt 0) {
    $AvgMem = [math]::Round($TotalMem / $Count, 2)
    Write-Host "✅ 平均メモリ使用量: $AvgMem MB" -ForegroundColor Green
} else {
    Write-Host "❌ メモリ使用量の測定に失敗しました。" -ForegroundColor Red
}

Write-Host ""

# Measure CPU usage
Write-Host "📊 CPU使用率を測定中..." -ForegroundColor Cyan
Write-Host "   （5秒間測定）" -ForegroundColor Gray
Write-Host ""

$Proc1 = Get-Process -Name $ProcessName -ErrorAction SilentlyContinue
$CPU1 = $Proc1.CPU
Start-Sleep -Seconds 5
$Proc2 = Get-Process -Name $ProcessName -ErrorAction SilentlyContinue
$CPU2 = $Proc2.CPU

$CPUUsage = [math]::Round(($CPU2 - $CPU1) / 5, 2)

Write-Host "✅ CPU使用時間: $CPUUsage 秒（5秒間）" -ForegroundColor Green

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "測定完了" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 結果をGitHub Issueに報告する際は、以下の情報を含めてください：" -ForegroundColor Yellow
Write-Host ""
Write-Host "- OS: Windows $([System.Environment]::OSVersion.Version)"
Write-Host "- メモリ使用量: $AvgMem MB"
Write-Host "- CPU使用時間: $CPUUsage 秒（5秒間）"
Write-Host "- 測定時の状態: （アイドル/スキャン中/検索中）"
Write-Host ""
