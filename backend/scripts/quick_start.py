"""
Quick Start Guide - Rust-eze Simulation Lab
Frontend-Backend Integration
"""

print("=" * 60)
print("🚀 RUST-EZE SIMULATION LAB - QUICK START")
print("=" * 60)

print("\n📋 SETUP CHECKLIST:")
print("   ✅ Backend created (FastAPI + PostgreSQL + Web3)")
print("   ✅ Frontend integrated (Next.js + TypeScript)")
print("   ✅ API adapter layer created (63 routes)")
print("   ✅ Environment files configured")
print("   ✅ Integration tests created")

print("\n" + "=" * 60)
print("🔧 STEP 1: START BACKEND")
print("=" * 60)
print("\n1. Open a terminal")
print("2. Run:")
print("   cd backend")
print("   .\\scripts\\start.bat")
print("\n3. Wait for:")
print("   ✅ Database initialized successfully")
print("   ✅ Blockchain connected to Sepolia")
print("   INFO:     Uvicorn running on http://127.0.0.1:8000")

print("\n" + "=" * 60)
print("🌐 STEP 2: START FRONTEND")
print("=" * 60)
print("\n1. Open a NEW terminal")
print("2. Run:")
print("   cd frontend")
print("   pnpm install    # First time only")
print("   pnpm dev")
print("\n3. Wait for:")
print("   ▲ Next.js 15.1.6")
print("   - Local:        http://localhost:3000")

print("\n" + "=" * 60)
print("🧪 STEP 3: TEST INTEGRATION")
print("=" * 60)
print("\n1. Open a NEW terminal")
print("2. Run:")
print("   cd backend\\scripts")
print("   .\\test_integration.ps1")
print("\n3. Check results:")
print("   - Should see ~24 tests pass")
print("   - Pass rate should be 100%")

print("\n" + "=" * 60)
print("📚 USEFUL URLS")
print("=" * 60)
print("\n   Frontend:        http://localhost:3000")
print("   Backend API:     http://localhost:8000")
print("   API Docs:        http://localhost:8000/docs")
print("   ReDoc:           http://localhost:8000/redoc")
print("   Health Check:    http://localhost:8000/health")

print("\n" + "=" * 60)
print("🎯 WHAT'S BEEN DONE")
print("=" * 60)
print("\n✅ Backend Setup:")
print("   - FastAPI application with 63 endpoints")
print("   - PostgreSQL database (4 tables)")
print("   - Web3 blockchain integration (Sepolia)")
print("   - 8 smart contracts configured")
print("   - CORS middleware enabled")
print("\n✅ Frontend Integration:")
print("   - API client configured (lib/api.ts)")
print("   - Environment file created (.env.local)")
print("   - Base URL: http://localhost:8000")
print("\n✅ API Adapter Layer:")
print("   - /api/simulation/* - Simulation controls")
print("   - /api/agents/* - Agent management")
print("   - /api/liquidity/* - Liquidity pool")
print("   - /api/lending/* - Lending protocol")
print("   - /api/threats/* - Threat detection")
print("   - /api/credit/* - Credit scoring")
print("   - /api/audit/* - Audit & compliance")
print("   - /api/wallet/* - Wallet operations")

print("\n" + "=" * 60)
print("🔄 API REQUEST FLOW")
print("=" * 60)
print("""
Frontend (Next.js)
   │
   │ fetch('http://localhost:8000/api/simulation/start')
   │
   ▼
Backend API Adapter (FastAPI)
   │
   │ Routes /api/* requests
   │
   ▼
Backend Routers
   │
   ├─ Simulation Router ─────► Database (PostgreSQL)
   ├─ Participants Router ───► Database
   ├─ Pool Router ───────────► Blockchain (Web3)
   ├─ Lending Router ────────► Blockchain + Database
   └─ Alerts Router ─────────► Database
   │
   ▼
Response (JSON)
   │
   │ { "success": true, "data": {...} }
   │
   ▼
Frontend (React Components)
""")

print("=" * 60)
print("📊 DATABASE SCHEMA")
print("=" * 60)
print("""
participants
   ├─ id (Primary Key)
   ├─ wallet (Unique)
   ├─ role (BORROWER/LENDER/LP/GOVERNANCE)
   ├─ score (Credit score)
   └─ created_at

transactions
   ├─ id (Primary Key)
   ├─ hash (Blockchain tx hash)
   ├─ type (DEPOSIT/BORROW/SWAP/LIQUIDATE)
   ├─ wallet
   ├─ amount
   └─ timestamp

alerts
   ├─ id (Primary Key)
   ├─ type (FRAUD/LIQUIDATION_RISK/etc)
   ├─ severity (LOW/MEDIUM/HIGH/CRITICAL)
   ├─ wallet
   ├─ description
   ├─ resolved (0/1)
   └─ timestamp

simulations
   ├─ id (Primary Key)
   ├─ name
   ├─ status (running/paused/completed)
   ├─ agents_count
   ├─ transactions_count
   ├─ alerts_count
   ├─ start_time
   └─ end_time
""")

print("=" * 60)
print("🔐 SMART CONTRACTS")
print("=" * 60)
print("""
1. AccessControl       - Role-based access management
2. IdentityRegistry    - User identity & KYC
3. CreditRegistry      - Credit scores & history
4. CollateralVault     - Collateral management
5. LendingPool         - Lending & borrowing
6. LiquidityPool       - AMM liquidity pool
7. SimTokenA           - Test token A
8. SimTokenB           - Test token B

Network: Sepolia Testnet
RPC: Alchemy
All contracts deployed and ABIs available
""")

print("=" * 60)
print("🎨 FRONTEND STRUCTURE")
print("=" * 60)
print("""
frontend/
├── app/
│   ├── dashboard/
│   │   ├── page.tsx          - Main dashboard
│   │   ├── simulation/       - Simulation controls
│   │   ├── agents/           - Agent management
│   │   ├── liquidity/        - Liquidity pool
│   │   ├── lending/          - Lending protocol
│   │   ├── threats/          - Threat detection
│   │   ├── credit/           - Credit scoring
│   │   └── audit/            - Audit & compliance
│   └── page.tsx              - Landing page
├── components/
│   └── ui/                   - Reusable UI components
├── lib/
│   └── api.ts               - API client (YOUR FRONTEND CALLS)
└── store/
    └── useAuth.ts           - Authentication state
""")

print("=" * 60)
print("💡 DEVELOPMENT TIPS")
print("=" * 60)
print("""
1. API Testing:
   - Use http://localhost:8000/docs for interactive testing
   - Click "Try it out" on any endpoint
   - See request/response examples

2. Database Inspection:
   - Use pgAdmin or DBeaver
   - Connect to Neon DB with DATABASE_URL
   - View tables and data

3. Blockchain Debugging:
   - Check Sepolia Etherscan
   - View transaction details
   - Monitor contract interactions

4. Frontend Development:
   - Hot reload enabled (automatic refresh)
   - Check browser console for errors
   - Use React DevTools for debugging

5. Error Handling:
   - Backend errors show in terminal
   - Frontend errors show in browser console
   - API errors logged in both places
""")

print("\n" + "=" * 60)
print("🐛 COMMON ISSUES & SOLUTIONS")
print("=" * 60)
print("""
❌ Backend won't start:
   → Check Python version: python --version (should be 3.13.1)
   → Activate venv: .\\venv\\Scripts\\Activate.ps1
   → Reinstall: pip install -r requirements.txt

❌ Frontend can't reach backend:
   → Check backend running: http://localhost:8000/health
   → Verify .env.local exists in frontend/
   → Check CORS settings in backend/main.py

❌ Database connection failed:
   → Verify DATABASE_URL in .env.local
   → Check Neon DB is accessible
   → Test: python -c "from database import engine"

❌ Blockchain connection failed:
   → Check ALCHEMY_RPC_URL in .env.local
   → Verify contract addresses
   → Test: python -c "from blockchain_service import blockchain_service"

❌ Import errors:
   → Activate venv before running
   → Check pyrightconfig.json exists
   → Restart VS Code

❌ CORS errors in browser:
   → Backend CORS already configured for all origins
   → Check frontend is using correct API_URL
   → Clear browser cache
""")

print("\n" + "=" * 60)
print("📖 DOCUMENTATION FILES")
print("=" * 60)
print("""
backend/scripts/
├── start.bat                    - Start backend server
├── verify_backend.py            - Verify backend setup
├── test_integration.ps1         - Test API integration
├── INTEGRATION_README.md        - Full integration docs
├── README.md                    - Scripts documentation
└── quick_start.py               - This file

Read INTEGRATION_README.md for complete details!
""")

print("\n" + "=" * 60)
print("✨ YOU'RE ALL SET!")
print("=" * 60)
print("\nNext steps:")
print("1. Start backend:    cd backend && .\\scripts\\start.bat")
print("2. Start frontend:   cd frontend && pnpm dev")
print("3. Test integration: cd backend\\scripts && .\\test_integration.ps1")
print("4. Open browser:     http://localhost:3000")
print("\nHappy hacking! 🚀")
print("=" * 60 + "\n")
