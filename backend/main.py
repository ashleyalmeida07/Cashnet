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
from routers import participants, pool, lending, alerts, simulations, api_adapter

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
app.include_router(api_adapter.router)  # Frontend API adapter (must be first to catch /api/* routes)
app.include_router(participants.router)
app.include_router(pool.router)
app.include_router(lending.router)
app.include_router(alerts.router)
app.include_router(simulations.router)


@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    print("🚀 Starting Rust-eze Simulation Lab Backend...")
    
    # Initialize database
    try:
        init_db()
        print("✅ Database initialized successfully")
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")
    
    # Check blockchain connection
    try:
        if blockchain_service.is_connected():
            block_number = blockchain_service.get_block_number()
            print(f"✅ Connected to Sepolia testnet (Block: {block_number})")
        else:
            print("⚠️  Blockchain connection failed")
    except Exception as e:
        print(f"⚠️  Blockchain connection error: {e}")
    
    print(f"🌐 API running at http://{settings.api_host}:{settings.api_port}")
    print(f"📚 Docs available at http://{settings.api_host}:{settings.api_port}/docs")


@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "name": "Rust-eze Simulation Lab API",
        "version": "1.0.0",
        "status": "operational",
        "blockchain_connected": blockchain_service.is_connected(),
        "endpoints": {
            "docs": "/docs",
            "participants": "/participants",
            "pool": "/pool",
            "lending": "/lending",
            "alerts": "/alerts",
            "simulations": "/simulations"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        blockchain_connected = blockchain_service.is_connected()
        block_number = blockchain_service.get_block_number() if blockchain_connected else None
        
        return {
            "status": "healthy",
            "blockchain": {
                "connected": blockchain_connected,
                "network": "Sepolia",
                "block_number": block_number
            },
            "database": "connected"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e)
        }


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
            "SimTokenA": settings.sim_token_a_address,
            "SimTokenB": settings.sim_token_b_address
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.debug
    )
