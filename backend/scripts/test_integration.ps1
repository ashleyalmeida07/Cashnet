# Test Frontend-Backend API Integration
Write-Host "🧪 Testing Rust-eze Simulation Lab API Integration" -ForegroundColor Cyan
Write-Host "=" * 60

$apiUrl = "http://localhost:8000"
$baseUrl = "$apiUrl/api"

# Function to make API test calls
function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Body = $null
    )
    
    Write-Host "`n📡 Testing: $Name" -ForegroundColor Yellow
    Write-Host "   URL: $Url"
    Write-Host "   Method: $Method"
    
    try {
        if ($Method -eq "GET") {
            $response = Invoke-WebRequest -Uri $Url -Method $Method -UseBasicParsing
        } else {
            $jsonBody = $Body | ConvertTo-Json
            $response = Invoke-WebRequest -Uri $Url -Method $Method -Body $jsonBody -ContentType "application/json" -UseBasicParsing
        }
        
        $statusCode = $response.StatusCode
        $content = $response.Content | ConvertFrom-Json
        
        if ($statusCode -eq 200) {
            Write-Host "   ✅ Status: $statusCode" -ForegroundColor Green
            Write-Host "   Response: $($content | ConvertTo-Json -Compress -Depth 2)" -ForegroundColor Gray
            return $true
        } else {
            Write-Host "   ⚠️  Status: $statusCode" -ForegroundColor Yellow
            return $false
        }
    } catch {
        Write-Host "   ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Track test results
$passedTests = 0
$failedTests = 0

# =============================================================================
# Test Simulation API
# =============================================================================
Write-Host "`n" + ("=" * 60) -ForegroundColor Cyan
Write-Host "🎮 SIMULATION API TESTS" -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor Cyan

if (Test-Endpoint "Get Simulation Status" "$baseUrl/simulation/status") { $passedTests++ } else { $failedTests++ }
if (Test-Endpoint "Start Simulation" "$baseUrl/simulation/start" -Method "POST") { $passedTests++ } else { $failedTests++ }
if (Test-Endpoint "Pause Simulation" "$baseUrl/simulation/pause" -Method "POST") { $passedTests++ } else { $failedTests++ }
if (Test-Endpoint "Resume Simulation" "$baseUrl/simulation/resume" -Method "POST") { $passedTests++ } else { $failedTests++ }
if (Test-Endpoint "Stop Simulation" "$baseUrl/simulation/stop" -Method "POST") { $passedTests++ } else { $failedTests++ }

# =============================================================================
# Test Agents API
# =============================================================================
Write-Host "`n" + ("=" * 60) -ForegroundColor Cyan
Write-Host "🤖 AGENTS API TESTS" -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor Cyan

if (Test-Endpoint "List All Agents" "$baseUrl/agents") { $passedTests++ } else { $failedTests++ }
if (Test-Endpoint "Get Activity Feed" "$baseUrl/agents/activity-feed") { $passedTests++ } else { $failedTests++ }

# =============================================================================
# Test Liquidity API
# =============================================================================
Write-Host "`n" + ("=" * 60) -ForegroundColor Cyan
Write-Host "💧 LIQUIDITY API TESTS" -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor Cyan

if (Test-Endpoint "Get Pool Data" "$baseUrl/liquidity/pool") { $passedTests++ } else { $failedTests++ }
if (Test-Endpoint "Get Depth Chart" "$baseUrl/liquidity/depth-chart") { $passedTests++ } else { $failedTests++ }
if (Test-Endpoint "Get Slippage Curve" "$baseUrl/liquidity/slippage-curve") { $passedTests++ } else { $failedTests++ }
if (Test-Endpoint "Get Liquidity Events" "$baseUrl/liquidity/events") { $passedTests++ } else { $failedTests++ }

# =============================================================================
# Test Lending API
# =============================================================================
Write-Host "`n" + ("=" * 60) -ForegroundColor Cyan
Write-Host "🏦 LENDING API TESTS" -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor Cyan

if (Test-Endpoint "Get Borrowers" "$baseUrl/lending/borrowers") { $passedTests++ } else { $failedTests++ }
if (Test-Endpoint "Get Lending Metrics" "$baseUrl/lending/metrics") { $passedTests++ } else { $failedTests++ }
if (Test-Endpoint "Get Cascade Events" "$baseUrl/lending/cascade-events") { $passedTests++ } else { $failedTests++ }

# =============================================================================
# Test Threats API
# =============================================================================
Write-Host "`n" + ("=" * 60) -ForegroundColor Cyan
Write-Host "🛡️  THREATS/ALERTS API TESTS" -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor Cyan

if (Test-Endpoint "Get Threat Scores" "$baseUrl/threats/scores") { $passedTests++ } else { $failedTests++ }
if (Test-Endpoint "Get Alerts" "$baseUrl/threats/alerts") { $passedTests++ } else { $failedTests++ }

# =============================================================================
# Test Credit API
# =============================================================================
Write-Host "`n" + ("=" * 60) -ForegroundColor Cyan
Write-Host "💳 CREDIT API TESTS" -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor Cyan

if (Test-Endpoint "Get Credit Leaderboard" "$baseUrl/credit/leaderboard") { $passedTests++ } else { $failedTests++ }
if (Test-Endpoint "Get Dynamic Rates" "$baseUrl/credit/dynamic-rates") { $passedTests++ } else { $failedTests++ }

# =============================================================================
# Test Audit API
# =============================================================================
Write-Host "`n" + ("=" * 60) -ForegroundColor Cyan
Write-Host "📊 AUDIT API TESTS" -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor Cyan

$auditFilters = @{ "wallet" = "0x123" }
if (Test-Endpoint "Get Audit Log" "$baseUrl/audit/log" -Method "POST" -Body $auditFilters) { $passedTests++ } else { $failedTests++ }
if (Test-Endpoint "Export Report" "$baseUrl/audit/export?format=json") { $passedTests++ } else { $failedTests++ }

# =============================================================================
# Test Original Backend Routes (Direct Routes)
# =============================================================================
Write-Host "`n" + ("=" * 60) -ForegroundColor Cyan
Write-Host "🔧 ORIGINAL BACKEND ROUTES TESTS" -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor Cyan

if (Test-Endpoint "Root Endpoint" "$apiUrl/") { $passedTests++ } else { $failedTests++ }
if (Test-Endpoint "Health Check" "$apiUrl/health") { $passedTests++ } else { $failedTests++ }
if (Test-Endpoint "Get Contracts" "$apiUrl/contracts") { $passedTests++ } else { $failedTests++ }
if (Test-Endpoint "Get Participants" "$apiUrl/participants") { $passedTests++ } else { $failedTests++ }
if (Test-Endpoint "Get Pool State" "$apiUrl/pool/state") { $passedTests++ } else { $failedTests++ }
if (Test-Endpoint "Get Simulations" "$apiUrl/simulations") { $passedTests++ } else { $failedTests++ }

# =============================================================================
# Summary
# =============================================================================
Write-Host "`n" + ("=" * 60) -ForegroundColor Cyan
Write-Host "📈 TEST SUMMARY" -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor Cyan

$totalTests = $passedTests + $failedTests
$passPercentage = if ($totalTests -gt 0) { [math]::Round(($passedTests / $totalTests) * 100, 2) } else { 0 }

Write-Host "`n   Total Tests: $totalTests" -ForegroundColor White
Write-Host "   ✅ Passed: $passedTests" -ForegroundColor Green
Write-Host "   ❌ Failed: $failedTests" -ForegroundColor Red
Write-Host "   Pass Rate: $passPercentage%" -ForegroundColor $(if ($passPercentage -ge 80) { "Green" } elseif ($passPercentage -ge 50) { "Yellow" } else { "Red" })

if ($failedTests -eq 0) {
    Write-Host "`n🎉 All tests passed! Frontend-Backend integration is ready!" -ForegroundColor Green
} else {
    Write-Host "`n⚠️  Some tests failed. Please check the backend server and database connection." -ForegroundColor Yellow
}

Write-Host "`n" + ("=" * 60) -ForegroundColor Cyan
Write-Host "✨ API Documentation: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor Cyan
