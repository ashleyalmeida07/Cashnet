"""
Lending and borrowing routes
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from schemas import (
    DepositCollateralRequest,
    BorrowRequest,
    RepayRequest,
    HealthFactorResponse
)

router = APIRouter(prefix="/lending", tags=["Lending & Borrowing"])


@router.post("/deposit-collateral")
async def deposit_collateral(
    request: DepositCollateralRequest,
    db: Session = Depends(get_db)
):
    """Deposit collateral to enable borrowing"""
    try:
        return {
            "status": "success",
            "wallet": request.wallet,
            "collateral_deposited": request.amount,
            "message": f"Deposited {request.amount} ETH as collateral"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/borrow")
async def borrow_tokens(
    request: BorrowRequest,
    db: Session = Depends(get_db)
):
    """Borrow tokens against collateral"""
    try:
        # Mock health factor check
        health_factor = 2.5  # Mock value
        
        if health_factor < 1.0:
            raise HTTPException(
                status_code=400,
                detail="Insufficient collateral. Health factor too low."
            )
        
        return {
            "status": "success",
            "wallet": request.wallet,
            "borrowed_amount": request.amount,
            "health_factor": health_factor,
            "message": f"Borrowed {request.amount} tokens"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/repay")
async def repay_loan(
    request: RepayRequest,
    db: Session = Depends(get_db)
):
    """Repay borrowed tokens"""
    try:
        return {
            "status": "success",
            "wallet": request.wallet,
            "repaid_amount": request.amount,
            "message": f"Repaid {request.amount} tokens"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health-factor/{wallet}", response_model=HealthFactorResponse)
async def get_health_factor(wallet: str):
    """Get health factor for a borrower"""
    try:
        # Mock data - will be replaced with actual blockchain calls
        collateral_value = 10000.0
        debt_value = 4000.0
        health_factor = collateral_value / debt_value if debt_value > 0 else 999.0
        liquidation_threshold = 1.5
        
        return {
            "wallet": wallet,
            "collateral_value": collateral_value,
            "debt_value": debt_value,
            "health_factor": health_factor,
            "liquidation_threshold": liquidation_threshold,
            "at_risk": health_factor < liquidation_threshold
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/liquidate/{wallet}")
async def liquidate_position(wallet: str, db: Session = Depends(get_db)):
    """Liquidate an undercollateralized position"""
    try:
        return {
            "status": "liquidated",
            "wallet": wallet,
            "collateral_seized": 5000.0,
            "debt_covered": 4000.0,
            "message": "Position liquidated successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/cascade-simulation")
async def simulate_cascade(price_drop_percentage: float = 30.0):
    """Simulate price crash and cascade liquidations"""
    try:
        return {
            "status": "simulation_started",
            "price_drop": price_drop_percentage,
            "positions_at_risk": 15,
            "estimated_liquidations": 8,
            "total_debt_at_risk": 50000.0
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
