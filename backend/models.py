"""
SQLAlchemy database models for Rust-eze Simulation Lab
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Enum
from sqlalchemy.sql import func
from database import Base
import enum


class RoleEnum(str, enum.Enum):
    """User roles in the system"""
    ADMIN = "ADMIN"
    LENDER = "LENDER"
    BORROWER = "BORROWER"
    AUDITOR = "AUDITOR"


class TransactionTypeEnum(str, enum.Enum):
    """Transaction types"""
    ADD_LIQUIDITY = "ADD_LIQUIDITY"
    REMOVE_LIQUIDITY = "REMOVE_LIQUIDITY"
    SWAP = "SWAP"
    DEPOSIT_COLLATERAL = "DEPOSIT_COLLATERAL"
    BORROW = "BORROW"
    REPAY = "REPAY"
    LIQUIDATE = "LIQUIDATE"


class AlertSeverityEnum(str, enum.Enum):
    """Alert severity levels"""
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class Participant(Base):
    """Registered participants with wallet addresses and roles"""
    __tablename__ = "participants"
    
    id = Column(Integer, primary_key=True, index=True)
    wallet = Column(String, unique=True, index=True, nullable=False)
    role = Column(Enum(RoleEnum), nullable=False)
    score = Column(Integer, default=500)  # Credit score 300-850
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class Transaction(Base):
    """All blockchain transactions"""
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    hash = Column(String, unique=True, index=True, nullable=False)
    type = Column(Enum(TransactionTypeEnum), nullable=False)
    wallet = Column(String, index=True)
    amount = Column(Float)
    token = Column(String)  # Token symbol or address
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    block_number = Column(Integer)
    gas_used = Column(Integer)
    tx_metadata = Column(Text)  # JSON string for additional data (renamed from metadata)


class Alert(Base):
    """Fraud and risk alerts"""
    __tablename__ = "alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    type = Column(String, nullable=False)  # wash_trading, flash_loan_attack, etc.
    severity = Column(Enum(AlertSeverityEnum), nullable=False)
    wallet = Column(String, index=True)
    description = Column(Text)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    transaction_hash = Column(String)
    resolved = Column(Integer, default=0)  # 0 = unresolved, 1 = resolved


class Simulation(Base):
    """Simulation runs"""
    __tablename__ = "simulations"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    start_time = Column(DateTime(timezone=True), server_default=func.now())
    end_time = Column(DateTime(timezone=True))
    summary = Column(Text)  # JSON string with simulation results
    status = Column(String, default="running")  # running, completed, failed
    agents_count = Column(Integer, default=0)
    transactions_count = Column(Integer, default=0)
    alerts_count = Column(Integer, default=0)
