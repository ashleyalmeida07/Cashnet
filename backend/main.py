"""
Rust-eze Simulation Lab - FastAPI Backend
Main application entry point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import init_db
from blockchain_service import blockchain_service
from config import settings

# Import routers
from agents.router import router as agents_router
from agents.scenario_router import router as scenario_router
from routers import participants, pool, lending, alerts, simulations, api_adapter, auth, wallet_auth, system_control, blockchain, logs
from routers.contract_analyzer import router as contract_analyzer_router
from routers.market_intelligence import router as market_intel_router
from liquidity_engine.router import router as liquidity_engine_router
from liquidity_engine.ml_router import router as ml_risk_router
from agents.ml_router import router as agent_intel_router


# Create FastAPI app
app = FastAPI(
    title="Rust-eze Simulation Lab API",
    description="DeFi Risk & Liquidity Simulation Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)          # Firebase/Google SSO → /auth/*
app.include_router(wallet_auth.router)   # Wallet/MetaMask auth → /api/auth/*
app.include_router(system_control.router) # System pause/unpause → /system/*
app.include_router(blockchain.router)    # Blockchain transactions → /blockchain/*
app.include_router(logs.router)          # System logs → /api/logs/*
app.include_router(api_adapter.router)   # Frontend API adapter → /api/*
app.include_router(participants.router)
app.include_router(pool.router)
app.include_router(lending.router)
app.include_router(alerts.router)
app.include_router(simulations.router)
app.include_router(agents_router)
app.include_router(scenario_router)
app.include_router(liquidity_engine_router)
app.include_router(ml_risk_router)
app.include_router(agent_intel_router)
app.include_router(contract_analyzer_router)
app.include_router(market_intel_router)   # Market Intelligence → /api/market-intel/*


@app.on_event("startup")
async def startup_event():
    """Minimal startup for Vercel serverless"""
    print("🚀 CashNet Backend started")
    # Heavy initialization is done lazily on first request
    # Avoid timeouts on cold starts


@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "name": "CashNet Backend API",
        "version": "1.0.0",
        "status": "operational"
    }


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "ok"}
            "participants": "/participants",
            "pool": "/pool",
            "lending": "/lending",
            "alerts": "/alerts",
            "simulations": "/simulations",
            "agents_simulation": "/agents-sim"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        blockchain_connected = blockchain_service.is_connected()
        block_number = blockchain_service.get_block_number() if blockchain_connected else None
        


@app.get("/contracts")
async def get_contract_addresses():
    """Get all deployed contract addresses"""
    return {
        "network": "Sepolia",
        "contracts": {
            "AccessControl": settings.access_control_address,
            "IdentityRegistry": settings.identity_registry_address,
            "CreditRegistry": settings.credit_registry_address,
            "CollateralVault": settings.collateral_vault_address,
            "LendingPool": settings.lending_pool_address,
            "LiquidityPool": settings.liquidity_pool_address,
            "Palladium (PLDM)": settings.palladium_address,
            "Badassium (BADM)": settings.badassium_address
        }
    }


if __name__ == "__main__":
    import uvicorn
    # Disable reload to avoid Windows multiprocessing errors with Python 3.13
    uvicorn.run(
        "main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=False  # Set to False to avoid multiprocessing issues on Windows
    )
