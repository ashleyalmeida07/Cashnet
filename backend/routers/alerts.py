"""
Alert and fraud detection routes
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Alert
from schemas import AlertCreate, AlertResponse
from typing import List

router = APIRouter(prefix="/alerts", tags=["Fraud Detection"])


@router.post("/", response_model=AlertResponse)
async def create_alert(
    alert: AlertCreate,
    db: Session = Depends(get_db)
):
    """Create a new fraud/risk alert"""
    db_alert = Alert(
        type=alert.type,
        severity=alert.severity,
        wallet=alert.wallet,
        description=alert.description,
        transaction_hash=alert.transaction_hash
    )
    
    db.add(db_alert)
    db.commit()
    db.refresh(db_alert)
    
    return db_alert


@router.get("/", response_model=List[AlertResponse])
async def get_all_alerts(
    severity: str = None,
    resolved: bool = None,
    db: Session = Depends(get_db)
):
    """Get all alerts with optional filters"""
    query = db.query(Alert)
    
    if severity:
        query = query.filter(Alert.severity == severity)
    
    if resolved is not None:
        query = query.filter(Alert.resolved == (1 if resolved else 0))
    
    alerts = query.order_by(Alert.timestamp.desc()).all()
    return alerts


@router.get("/{alert_id}", response_model=AlertResponse)
async def get_alert(alert_id: int, db: Session = Depends(get_db)):
    """Get specific alert by ID"""
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    return alert


@router.patch("/{alert_id}/resolve")
async def resolve_alert(alert_id: int, db: Session = Depends(get_db)):
    """Mark an alert as resolved"""
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    alert.resolved = 1
    db.commit()
    
    return {"message": "Alert resolved", "alert_id": alert_id}


@router.get("/fraud-score/{wallet}")
async def get_fraud_score(wallet: str, db: Session = Depends(get_db)):
    """Get fraud risk score for a wallet"""
    # Count alerts for this wallet
    alert_count = db.query(Alert).filter(
        Alert.wallet == wallet,
        Alert.resolved == 0
    ).count()
    
    # Simple scoring: more alerts = higher risk
    risk_score = min(alert_count * 20, 100)  # Max 100
    
    risk_level = "LOW"
    if risk_score >= 70:
        risk_level = "CRITICAL"
    elif risk_score >= 50:
        risk_level = "HIGH"
    elif risk_score >= 30:
        risk_level = "MEDIUM"
    
    return {
        "wallet": wallet,
        "risk_score": risk_score,
        "risk_level": risk_level,
        "alert_count": alert_count
    }
