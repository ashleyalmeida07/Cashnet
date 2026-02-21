"""
Simulation management routes
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Simulation
from schemas import SimulationCreate, SimulationResponse
from typing import List
from datetime import datetime

router = APIRouter(prefix="/simulations", tags=["Simulations"])


@router.post("/", response_model=SimulationResponse)
async def create_simulation(
    simulation: SimulationCreate,
    db: Session = Depends(get_db)
):
    """Start a new simulation run"""
    db_simulation = Simulation(
        name=simulation.name,
        status="running"
    )
    
    db.add(db_simulation)
    db.commit()
    db.refresh(db_simulation)
    
    return db_simulation


@router.get("/", response_model=List[SimulationResponse])
async def get_all_simulations(db: Session = Depends(get_db)):
    """Get all simulation runs"""
    simulations = db.query(Simulation).order_by(
        Simulation.start_time.desc()
    ).all()
    return simulations


@router.get("/{simulation_id}", response_model=SimulationResponse)
async def get_simulation(simulation_id: int, db: Session = Depends(get_db)):
    """Get specific simulation by ID"""
    simulation = db.query(Simulation).filter(
        Simulation.id == simulation_id
    ).first()
    
    if not simulation:
        raise HTTPException(status_code=404, detail="Simulation not found")
    
    return simulation


@router.patch("/{simulation_id}/stop")
async def stop_simulation(simulation_id: int, db: Session = Depends(get_db)):
    """Stop a running simulation"""
    simulation = db.query(Simulation).filter(
        Simulation.id == simulation_id
    ).first()
    
    if not simulation:
        raise HTTPException(status_code=404, detail="Simulation not found")
    
    simulation.status = "completed"
    simulation.end_time = datetime.utcnow()
    db.commit()
    
    return {"message": "Simulation stopped", "simulation_id": simulation_id}


@router.get("/{simulation_id}/summary")
async def get_simulation_summary(
    simulation_id: int,
    db: Session = Depends(get_db)
):
    """Get detailed summary of a simulation run"""
    simulation = db.query(Simulation).filter(
        Simulation.id == simulation_id
    ).first()
    
    if not simulation:
        raise HTTPException(status_code=404, detail="Simulation not found")
    
    return {
        "simulation_id": simulation.id,
        "name": simulation.name,
        "status": simulation.status,
        "start_time": simulation.start_time,
        "end_time": simulation.end_time,
        "duration_seconds": (
            (simulation.end_time - simulation.start_time).total_seconds()
            if simulation.end_time else None
        ),
        "agents_count": simulation.agents_count,
        "transactions_count": simulation.transactions_count,
        "alerts_count": simulation.alerts_count,
        "summary": simulation.summary
    }
