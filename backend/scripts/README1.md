# Rust-eze Simulation Lab Backend

FastAPI backend for the DeFi Risk & Liquidity Simulation Platform.

## Setup

### 1. Create Virtual Environment
```bash
python -m venv venv
```

### 2. Activate Virtual Environment

**Windows:**
```bash
venv\Scripts\activate
```

**Linux/Mac:**
```bash
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Environment Configuration
Make sure `.env.local` file exists in the parent directory with:
- DATABASE_URL (PostgreSQL connection string)
- SEPOLIA_RPC_URL (Alchemy RPC endpoint)
- PRIVATE_KEY (Ethereum private key)
- Contract addresses

### 5. Run the Server

**Using the startup script (Windows):**
```bash
cd scripts
.\start.bat
```

**Or manually:**
```bash
python main.py
```

**Or with uvicorn directly:**
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## API Documentation

Once the server is running, visit:
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

## API Endpoints

### Participants
- `POST /participants/register` - Register new participant
- `GET /participants` - Get all participants
- `GET /participants/{wallet}` - Get participant by wallet

### Liquidity Pool
- `GET /pool/state` - Get current pool state
- `POST /pool/add-liquidity` - Add liquidity
- `POST /pool/remove-liquidity` - Remove liquidity
- `POST /pool/swap` - Swap tokens
- `POST /pool/stress-test` - Run stress test simulation

### Lending & Borrowing
- `POST /lending/deposit-collateral` - Deposit collateral
- `POST /lending/borrow` - Borrow against collateral
- `POST /lending/repay` - Repay loan
- `GET /lending/health-factor/{wallet}` - Get health factor
- `POST /lending/liquidate/{wallet}` - Liquidate position
- `POST /lending/cascade-simulation` - Simulate cascade liquidations

### Alerts
- `POST /alerts` - Create new alert
- `GET /alerts` - Get all alerts (with filters)
- `GET /alerts/{alert_id}` - Get specific alert
- `PATCH /alerts/{alert_id}/resolve` - Resolve alert
- `GET /alerts/fraud-score/{wallet}` - Get fraud score

### Simulations
- `POST /simulations` - Start new simulation
- `GET /simulations` - Get all simulations
- `GET /simulations/{id}` - Get specific simulation
- `PATCH /simulations/{id}/stop` - Stop simulation
- `GET /simulations/{id}/summary` - Get simulation summary

## Database Schema

### participants
- wallet (unique)
- role (ADMIN, LENDER, BORROWER, AUDITOR)
- score (credit score 300-850)

### transactions
- hash (unique transaction hash)
- type (ADD_LIQUIDITY, SWAP, BORROW, etc.)
- wallet, amount, token
- timestamp

### alerts
- type (wash_trading, flash_loan_attack, etc.)
- severity (LOW, MEDIUM, HIGH, CRITICAL)
- wallet, description
- resolved (0/1)

### simulations
- name, start_time, end_time
- status (running, completed, failed)
- agents_count, transactions_count, alerts_count
- summary (JSON)

## Development

### Project Structure
```
backend/
├── main.py                  # FastAPI application
├── config.py                # Configuration management
├── database.py              # Database setup
├── models.py                # SQLAlchemy models
├── schemas.py               # Pydantic schemas
├── blockchain_service.py    # Web3 service
├── routers/                 # API routes
│   ├── participants.py
│   ├── pool.py
│   ├── lending.py
│   ├── alerts.py
│   └── simulations.py
├── scripts/                 # Utility scripts
│   ├── start.bat            # Windows startup script
│   ├── verify_backend.py    # Backend testing script
│   └── README.md           # Scripts documentation
├── requirements.txt         # Python dependencies
└── README.md               # This file
```
