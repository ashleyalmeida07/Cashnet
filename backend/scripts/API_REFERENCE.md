# API Endpoint Reference - Frontend to Backend Mapping

## Quick Reference Table

| Frontend API Call | Backend Endpoint | Method | Description |
|------------------|------------------|--------|-------------|
| **SIMULATION** | | | |
| `/api/simulation/start` | `/api/simulation/start` | POST | Start new simulation |
| `/api/simulation/status` | `/api/simulation/status` | GET | Get simulation status |
| `/api/simulation/pause` | `/api/simulation/pause` | POST | Pause simulation |
| `/api/simulation/resume` | `/api/simulation/resume` | POST | Resume simulation |
| `/api/simulation/stop` | `/api/simulation/stop` | POST | Stop simulation |
| **AGENTS** | | | |
| `/api/agents` | `/api/agents` | GET | List all agents |
| `/api/agents/{id}` | `/api/agents/{id}` | GET | Get agent details |
| `/api/agents/activity-feed` | `/api/agents/activity-feed` | GET | Get activity feed |
| **LIQUIDITY** | | | |
| `/api/liquidity/pool` | `/api/liquidity/pool` | GET | Get pool data |
| `/api/liquidity/depth-chart` | `/api/liquidity/depth-chart` | GET | Get depth chart |
| `/api/liquidity/slippage-curve` | `/api/liquidity/slippage-curve` | GET | Get slippage curve |
| `/api/liquidity/events` | `/api/liquidity/events` | GET | Get liquidity events |
| **LENDING** | | | |
| `/api/lending/borrowers` | `/api/lending/borrowers` | GET | Get all borrowers |
| `/api/lending/metrics` | `/api/lending/metrics` | GET | Get lending metrics |
| `/api/lending/cascade-events` | `/api/lending/cascade-events` | GET | Get cascade events |
| `/api/lending/liquidate` | `/api/lending/liquidate` | POST | Trigger liquidation |
| **THREATS** | | | |
| `/api/threats/scores` | `/api/threats/scores` | GET | Get threat scores |
| `/api/threats/alerts` | `/api/threats/alerts` | GET | Get all alerts |
| `/api/threats/alerts/{id}/resolve` | `/api/threats/alerts/{id}/resolve` | POST | Resolve alert |
| `/api/threats/simulate` | `/api/threats/simulate` | POST | Simulate attack |
| **CREDIT** | | | |
| `/api/credit/leaderboard` | `/api/credit/leaderboard` | GET | Get leaderboard |
| `/api/credit/scores/{wallet}` | `/api/credit/scores/{wallet}` | GET | Get score details |
| `/api/credit/scores/{wallet}/history` | `/api/credit/scores/{wallet}/history` | GET | Get score history |
| `/api/credit/dynamic-rates` | `/api/credit/dynamic-rates` | GET | Get dynamic rates |
| **AUDIT** | | | |
| `/api/audit/log` | `/api/audit/log` | POST | Get audit log |
| `/api/audit/verify/{id}` | `/api/audit/verify/{id}` | POST | Verify event |
| `/api/audit/export` | `/api/audit/export` | GET | Export report |
| `/api/audit/compare` | `/api/audit/compare` | POST | Compare simulations |
| **WALLET** | | | |
| `/api/wallet/connect` | `/api/wallet/connect` | POST | Connect wallet |
| `/api/wallet/disconnect` | `/api/wallet/disconnect` | POST | Disconnect wallet |
| `/api/wallet/balance/{address}` | `/api/wallet/balance/{address}` | GET | Get wallet balance |

## Original Backend Routes (Without /api prefix)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | API info |
| `/health` | GET | Health check |
| `/contracts` | GET | Contract addresses |
| `/participants` | GET | List participants |
| `/participants/register` | POST | Register participant |
| `/participants/{wallet}` | GET | Get participant by wallet |
| `/pool/state` | GET | Get pool state |
| `/pool/add-liquidity` | POST | Add liquidity |
| `/pool/swap` | POST | Execute swap |
| `/pool/stress-test` | POST | Run stress test |
| `/lending/deposit-collateral` | POST | Deposit collateral |
| `/lending/borrow` | POST | Borrow funds |
| `/lending/health-factor/{wallet}` | GET | Get health factor |
| `/lending/liquidate/{wallet}` | POST | Liquidate position |
| `/lending/cascade-simulation` | POST | Simulate cascade |
| `/alerts` | GET | List alerts |
| `/alerts` | POST | Create alert |
| `/alerts/fraud-score/{wallet}` | GET | Get fraud score |
| `/simulations` | GET | List simulations |
| `/simulations` | POST | Create simulation |
| `/simulations/{id}/summary` | GET | Get simulation summary |

## Request/Response Examples

### Start Simulation
```javascript
// Frontend
const response = await fetch('http://localhost:8000/api/simulation/start', {
  method: 'POST'
});
const data = await response.json();

// Response
{
  "success": true,
  "data": {
    "id": 1,
    "status": "running",
    "start_time": "2026-02-21T10:30:00"
  }
}
```

### Get Agents
```javascript
// Frontend
const response = await fetch('http://localhost:8000/api/agents');
const data = await response.json();

// Response
{
  "success": true,
  "data": [
    {
      "id": "1",
      "wallet": "0x123...",
      "role": "BORROWER",
      "score": 750,
      "status": "active"
    }
  ]
}
```

### Get Pool Data
```javascript
// Frontend
const response = await fetch('http://localhost:8000/api/liquidity/pool');
const data = await response.json();

// Response
{
  "success": true,
  "data": {
    "reserve_a": 1000000.0,
    "reserve_b": 2000000.0,
    "price_a_per_b": 2.0,
    "total_liquidity": 3000000.0,
    "volume_24h": 150000.0
  }
}
```

### Trigger Liquidation
```javascript
// Frontend
const response = await fetch('http://localhost:8000/api/lending/liquidate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ borrower_id: "5" })
});
const data = await response.json();

// Response
{
  "success": true,
  "data": {
    "message": "Liquidation triggered",
    "borrower_id": "5"
  }
}
```

### Get Threat Alerts
```javascript
// Frontend
const response = await fetch('http://localhost:8000/api/threats/alerts');
const data = await response.json();

// Response
{
  "success": true,
  "data": [
    {
      "id": "1",
      "type": "FRAUD_DETECTION",
      "severity": "HIGH",
      "wallet": "0xabc...",
      "description": "Suspicious activity detected",
      "timestamp": "2026-02-21T09:15:00",
      "resolved": false
    }
  ]
}
```

## Frontend API Client Usage (lib/api.ts)

```typescript
// Import the API client
import { simulationApi, agentApi, liquidityApi } from '@/lib/api';

// Start simulation
const result = await simulationApi.start();

// Get agents
const agents = await agentApi.list();

// Get pool data
const poolData = await liquidityApi.getPool();

// Get borrowers
const borrowers = await lendingApi.getBorrowers();

// Get threat scores
const scores = await threatApi.getScores();
```

## Environment Configuration

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME="Rust-eze Simulation Lab"
NEXT_PUBLIC_APP_VERSION="1.0.0"
```

### Backend (.env.local)
```env
DATABASE_URL=postgresql+psycopg://...
ALCHEMY_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/...
CONTRACT_ACCESS_CONTROL=0x...
# ... other contracts
```

## Testing Endpoints

### Using curl
```bash
# Health check
curl http://localhost:8000/health

# Start simulation
curl -X POST http://localhost:8000/api/simulation/start

# Get agents
curl http://localhost:8000/api/agents

# Get pool data
curl http://localhost:8000/api/liquidity/pool
```

### Using PowerShell
```powershell
# Health check
Invoke-WebRequest http://localhost:8000/health

# Start simulation
Invoke-WebRequest -Uri http://localhost:8000/api/simulation/start -Method POST

# Get agents
Invoke-WebRequest http://localhost:8000/api/agents
```

### Using JavaScript (Browser Console)
```javascript
// Health check
fetch('http://localhost:8000/health').then(r => r.json()).then(console.log);

// Start simulation
fetch('http://localhost:8000/api/simulation/start', { method: 'POST' })
  .then(r => r.json())
  .then(console.log);

// Get agents
fetch('http://localhost:8000/api/agents')
  .then(r => r.json())
  .then(console.log);
```

## CORS Configuration

All API requests from `http://localhost:3000` are allowed. The backend includes:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # All origins in development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Error Handling

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "detail": "Error message"
}
```

### HTTP Status Codes
- `200` - Success
- `400` - Bad Request
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

## Rate Limiting

Currently no rate limiting is implemented. For production, consider adding:
- Per-IP rate limits
- Per-endpoint rate limits
- API key authentication

## WebSocket Support (Future)

For real-time updates, consider adding WebSocket endpoints:
- `/ws/simulation` - Real-time simulation updates
- `/ws/alerts` - Real-time threat alerts
- `/ws/pool` - Real-time pool state changes

## Documentation Links

- **Interactive API Docs**: http://localhost:8000/docs
- **ReDoc Documentation**: http://localhost:8000/redoc
- **Integration Guide**: backend/scripts/INTEGRATION_README.md
- **Quick Start**: backend/scripts/quick_start.py

---

**Last Updated**: February 2026  
**Total Endpoints**: 63 (33 adapter + 30 original)  
**API Version**: 1.0.0
