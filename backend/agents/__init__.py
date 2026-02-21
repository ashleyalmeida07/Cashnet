"""
AI Agents & Simulation Engine for Rust-eze Simulation Lab
=========================================================

Agent Types:
  - RetailTrader:   Small randomized trades with emotional panic-sell logic
  - WhaleAgent:     Large trades that move AMM price and cause slippage spikes
  - ArbitrageBot:   Exploits price inefficiencies vs reference price
  - LiquidatorBot:  Monitors health factors and liquidates instantly
  - MEVBot:         Front-runs transactions from a simulated mempool
  - AttackerAgent:  Simulates flash-loan exploit patterns

Real Market Data:
  - MarketDataService: Fetches live crypto prices from CoinDesk API
  - Agents react to real BTC/ETH/SOL price movements and volatility

Architecture Flow:
  Real Market Data → Agents → Transactions → Smart Contracts → Events → Fraud Monitor → Backend Logs → Frontend

Usage:
  from agents.simulation_runner import SimulationRunner
  runner = SimulationRunner(db_session)
  await runner.start()
"""

from agents.base import BaseAgent, AgentType, AgentState
from agents.retail_trader import RetailTrader
from agents.whale_agent import WhaleAgent
from agents.arbitrage_bot import ArbitrageBot
from agents.liquidator_bot import LiquidatorBot
from agents.mev_bot import MEVBot
from agents.attacker_agent import AttackerAgent
from agents.fraud_monitor import FraudMonitor
from agents.simulation_runner import SimulationRunner
from agents.market_data import MarketDataService, market_data_service

__all__ = [
    "BaseAgent",
    "AgentType",
    "AgentState",
    "RetailTrader",
    "WhaleAgent",
    "ArbitrageBot",
    "LiquidatorBot",
    "MEVBot",
    "AttackerAgent",
    "FraudMonitor",
    "SimulationRunner",
    "MarketDataService",
    "market_data_service",
]
