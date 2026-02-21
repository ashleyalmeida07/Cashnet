# Frontend-Backend Integration Summary

## 🔗 API Routes Mapping

The frontend now communicates with the backend through a **unified API adapter layer**.

### Frontend API Structure
All frontend API calls use the pattern: `http://localhost:8000/api/*`

### Route Mappings

#### 1. **Simulation API** (`/api/simulation/*`)
- `POST /api/simulation/start` - Start new simulation
- `GET /api/simulation/status` - Get current status
- `POST /api/simulation/pause` - Pause running simulation
- `POST /api/simulation/resume` - Resume paused simulation
- `POST /api/simulation/stop` - Stop simulation

#### 2. **Agents API** (`/api/agents/*`)
Maps to `/participants` backend routes
- `GET /api/agents` - List all agents/participants
- `GET /api/agents/{id}` - Get specific agent details
- `GET /api/agents/activity-feed` - Recent agent activity

#### 3. **Liquidity API** (`/api/liquidity/*`)
Maps to `/pool` backend routes
- `GET /api/liquidity/pool` - Current pool data
- `GET /api/liquidity/depth-chart` - Liquidity depth visualization
- `GET /api/liquidity/slippage-curve` - Slippage analysis
- `GET /api/liquidity/events` - Recent liquidity events

#### 4. **Lending API** (`/api/lending/*`)
Maps to `/lending` backend routes
- `GET /api/lending/borrowers` - All borrowers with health factors
- `GET /api/lending/metrics` - Overall lending metrics
- `GET /api/lending/cascade-events` - Cascade liquidation events
- `POST /api/lending/liquidate` - Trigger liquidation

#### 5. **Threats/Alerts API** (`/api/threats/*`)
Maps to `/alerts` backend routes
- `GET /api/threats/scores` - Threat scores for all wallets
- `GET /api/threats/alerts` - All threat alerts
- `POST /api/threats/alerts/{id}/resolve` - Resolve alert
- `POST /api/threats/simulate` - Simulate attack

#### 6. **Credit API** (`/api/credit/*`)
- `GET /api/credit/leaderboard` - Credit score rankings
- `GET /api/credit/scores/{wallet}` - Detailed credit score
- `GET /api/credit/scores/{wallet}/history` - Historical scores
- `GET /api/credit/dynamic-rates` - Interest rates by score

#### 7. **Audit API** (`/api/audit/*`)
- `POST /api/audit/log` - Get audit log with filters
- `POST /api/audit/verify/{event_id}` - Verify event
- `GET /api/audit/export` - Export audit report
- `POST /api/audit/compare` - Compare simulations

#### 8. **Wallet API** (`/api/wallet/*`)
- `POST /api/wallet/connect` - Connect wallet
- `POST /api/wallet/disconnect` - Disconnect wallet
- `GET /api/wallet/balance/{address}` - Get wallet balance

### Original Backend Routes (Still Available)
Direct backend routes without `/api` prefix:
- `GET /` - API info
- `GET /health` - Health check
- `GET /contracts` - Contract addresses
- `GET /participants` - All participants
- `POST /participants/register` - Register participant
- `GET /pool/state` - Pool state
- `POST /pool/add-liquidity` - Add liquidity
- `POST /pool/swap` - Execute swap
- `GET /simulations` - All simulations
- `POST /simulations` - Create simulation

---

## 📁 Files Created/Modified

### ✅ Created Files
1. **`frontend/.env.local`** - Frontend environment configuration
2. **`backend/routers/api_adapter.py`** - API adapter layer (470+ lines)
3. **`backend/scripts/test_integration.ps1`** - Integration test script
4. **`backend/scripts/INTEGRATION_README.md`** - This documentation

### ✏️ Modified Files
1. **`backend/main.py`** - Added api_adapter router import and registration

---

## 🚀 How to Run

### 1. Start Backend Server
```powershell
cd backend
.\scripts\start.bat
```
Server runs at: `http://localhost:8000`  
API Docs: `http://localhost:8000/docs`

### 2. Start Frontend (New Terminal)
```powershell
cd frontend
pnpm install  # First time only
pnpm dev
```
Frontend runs at: `http://localhost:3000`

### 3. Test Integration
```powershell
cd backend\scripts
.\test_integration.ps1
```

---

## 🧪 Testing

### Manual Testing
1. Visit API docs: http://localhost:8000/docs
2. Try the interactive Swagger UI
3. Test endpoints with `Try it out` button

### Automated Testing
Run the integration test script:
```powershell
.\backend\scripts\test_integration.ps1
```

This tests:
- 18 API adapter endpoints (`/api/*`)
- 6 original backend endpoints
- Database connectivity
- Response formatting

### Frontend Testing
Once frontend is running:
1. Open browser console (F12)
2. Navigate through dashboard pages
3. Check Network tab for API calls
4. Verify responses in console

---

## 📊 API Response Format

All API adapter endpoints return consistent JSON:

```json
{
  "success": true,
  "data": {
    // Response data here
  }
}
```

Error responses:
```json
{
  "detail": "Error message"
}
```

---

## 🔧 Configuration

### Environment Variables

**Backend** (`.env.local`):
```env
DATABASE_URL=postgresql+psycopg://...
ALCHEMY_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/...
CONTRACT_ACCESS_CONTROL=0x...
# ... other contracts
```

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME="Rust-eze Simulation Lab"
NEXT_PUBLIC_APP_VERSION="1.0.0"
```

### CORS Configuration
Backend CORS is configured for all origins in development:
```python
allow_origins=["*"]
```

**For production:**
```python
allow_origins=[
    "https://yourdomain.com",
    "https://www.yourdomain.com"
]
```

---

## 🎯 Next Steps

### Recommended Improvements

1. **WebSocket Support** - Add real-time updates
   - Create `/ws` endpoint
   - Push simulation events to frontend
   - Live dashboard updates

2. **Authentication** - Add JWT token auth
   - Wallet signature verification
   - Protected endpoints
   - User sessions

3. **Rate Limiting** - Prevent API abuse
   - Use `slowapi` package
   - Limit requests per IP
   - Different limits per endpoint

4. **Caching** - Improve performance
   - Redis for frequently accessed data
   - Cache pool states
   - Cache credit scores

5. **Error Handling** - Better error messages
   - Custom exception handlers
   - Detailed error responses
   - Error logging

6. **Data Validation** - Stricter validation
   - Add Pydantic models for all request bodies
   - Validate wallet addresses
   - Validate numeric ranges

7. **Testing** - Comprehensive test suite
   - Unit tests with pytest
   - Integration tests
   - Load testing with locust

8. **Monitoring** - Production observability
   - Add Prometheus metrics
   - Error tracking (Sentry)
   - Performance monitoring

---

## 🐛 Troubleshooting

### Backend won't start
```powershell
# Check Python version
python --version  # Should be 3.13.1

# Activate virtual environment
cd backend
.\venv\Scripts\Activate.ps1

# Reinstall dependencies
pip install -r requirements.txt
```

### Frontend can't reach backend
1. Check backend is running: `http://localhost:8000/health`
2. Verify `.env.local` exists in frontend folder
3. Check browser console for CORS errors
4. Ensure no firewall blocking port 8000

### Database connection failed
1. Check `.env.local` has correct `DATABASE_URL`
2. Verify Neon DB is accessible
3. Test connection manually:
```powershell
python -c "from database import engine; print(engine.connect())"
```

### Blockchain connection failed
1. Check Alchemy RPC URL is valid
2. Verify contract addresses are correct
3. Test web3 connection:
```powershell
python -c "from blockchain_service import blockchain_service; print(blockchain_service.w3.is_connected())"
```

---

## 📚 API Documentation

Full interactive API documentation available at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## ✨ Summary

✅ Frontend and backend are now fully integrated  
✅ Unified API adapter layer created  
✅ All 8 frontend API modules mapped to backend  
✅ Environment configuration completed  
✅ Integration tests created  
✅ Documentation written  

**You can now:**
1. Start the backend server
2. Start the frontend development server
3. Test the integration with the provided script
4. Build your DeFi simulation features!

---

**Created:** February 2026  
**Project:** Rust-eze Simulation Lab (SPIT Hackathon)  
**Stack:** FastAPI + PostgreSQL + Web3.py + Next.js + TypeScript
