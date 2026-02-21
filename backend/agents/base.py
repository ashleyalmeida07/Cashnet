"""
Base agent class and shared types for the simulation engine.
Every concrete agent inherits from BaseAgent.
"""

import asyncio
import uuid
import time
import random
from abc import ABC, abstractmethod
from enum import Enum
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Callable


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------

class AgentType(str, Enum):
    RETAIL_TRADER = "retail_trader"
    WHALE = "whale"
    ARBITRAGE_BOT = "arbitrage_bot"
    LIQUIDATOR_BOT = "liquidator_bot"
    MEV_BOT = "mev_bot"
    ATTACKER = "attacker"


class AgentState(str, Enum):
    IDLE = "idle"
    RUNNING = "running"
    PAUSED = "paused"
    STOPPED = "stopped"
    ERROR = "error"


# ---------------------------------------------------------------------------
# Data containers
# ---------------------------------------------------------------------------

@dataclass
class TradeAction:
    """Represents a single trade / action an agent wants to perform."""
    agent_id: str
    agent_type: str
    action: str            # e.g. "swap", "add_liquidity", "liquidate", ...
    token_in: str
    token_out: str
    amount: float
    timestamp: float = field(default_factory=time.time)
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "agent_id": self.agent_id,
            "agent_type": self.agent_type,
            "action": self.action,
            "token_in": self.token_in,
            "token_out": self.token_out,
            "amount": self.amount,
            "timestamp": self.timestamp,
            "metadata": self.metadata,
        }


@dataclass
class AgentStats:
    """Running statistics for an agent."""
    trades_count: int = 0
    total_volume: float = 0.0
    pnl: float = 0.0
    win_count: int = 0
    loss_count: int = 0
    last_action_time: float = 0.0
    alerts_triggered: int = 0

    @property
    def win_rate(self) -> float:
        total = self.win_count + self.loss_count
        return self.win_count / total if total > 0 else 0.0

    def to_dict(self) -> Dict[str, Any]:
        return {
            "trades_count": self.trades_count,
            "total_volume": round(self.total_volume, 2),
            "pnl": round(self.pnl, 2),
            "win_rate": round(self.win_rate, 4),
            "alerts_triggered": self.alerts_triggered,
        }


# ---------------------------------------------------------------------------
# Pool state (in-memory simulated AMM)
# ---------------------------------------------------------------------------

class PoolState:
    """
    Simulated constant-product AMM pool (x * y = k).
    Shared across all agents during a simulation run.
    """

    def __init__(
        self,
        reserve_a: float = 1_000_000.0,
        reserve_b: float = 1_000_000.0,
        fee_bps: int = 30,           # 0.30 %
    ):
        self.reserve_a = reserve_a
        self.reserve_b = reserve_b
        self.fee_bps = fee_bps
        self.reference_price: float = reserve_b / reserve_a  # external "oracle"
        self._k = reserve_a * reserve_b
        self.total_volume: float = 0.0
        self.swap_count: int = 0

    # -- read helpers -------------------------------------------------------

    @property
    def price_a_per_b(self) -> float:
        return self.reserve_b / self.reserve_a if self.reserve_a else 0.0

    @property
    def price_b_per_a(self) -> float:
        return self.reserve_a / self.reserve_b if self.reserve_b else 0.0

    @property
    def k(self) -> float:
        return self.reserve_a * self.reserve_b

    def get_amount_out(self, amount_in: float, token_in: str) -> float:
        """Constant-product swap output (before fee)."""
        if token_in == "TOKEN_A":
            new_reserve_a = self.reserve_a + amount_in
            new_reserve_b = self._k / new_reserve_a
            amount_out = self.reserve_b - new_reserve_b
        else:
            new_reserve_b = self.reserve_b + amount_in
            new_reserve_a = self._k / new_reserve_b
            amount_out = self.reserve_a - new_reserve_a

        fee = amount_out * (self.fee_bps / 10_000)
        return max(amount_out - fee, 0.0)

    def get_slippage(self, amount_in: float, token_in: str) -> float:
        """Percentage price impact (slippage) for a given trade."""
        if amount_in == 0:
            return 0.0
        ideal_out = amount_in * (
            self.price_a_per_b if token_in == "TOKEN_A" else self.price_b_per_a
        )
        actual_out = self.get_amount_out(amount_in, token_in)
        if ideal_out == 0:
            return 0.0
        return abs(ideal_out - actual_out) / ideal_out * 100

    # -- mutators -----------------------------------------------------------

    def execute_swap(self, amount_in: float, token_in: str) -> Dict[str, Any]:
        """Execute a swap and update reserves. Returns trade receipt."""
        amount_out = self.get_amount_out(amount_in, token_in)
        slippage = self.get_slippage(amount_in, token_in)

        if token_in == "TOKEN_A":
            self.reserve_a += amount_in
            self.reserve_b -= amount_out
            token_out = "TOKEN_B"
        else:
            self.reserve_b += amount_in
            self.reserve_a -= amount_out
            token_out = "TOKEN_A"

        self._k = self.reserve_a * self.reserve_b
        self.total_volume += amount_in
        self.swap_count += 1

        return {
            "token_in": token_in,
            "token_out": token_out,
            "amount_in": round(amount_in, 4),
            "amount_out": round(amount_out, 4),
            "slippage_pct": round(slippage, 4),
            "price_after": round(self.price_a_per_b, 6),
        }

    def add_liquidity(self, amount_a: float, amount_b: float) -> None:
        self.reserve_a += amount_a
        self.reserve_b += amount_b
        self._k = self.reserve_a * self.reserve_b

    def remove_liquidity(self, pct: float) -> Dict[str, float]:
        """Remove `pct`% of reserves."""
        removed_a = self.reserve_a * pct / 100
        removed_b = self.reserve_b * pct / 100
        self.reserve_a -= removed_a
        self.reserve_b -= removed_b
        self._k = self.reserve_a * self.reserve_b
        return {"removed_a": removed_a, "removed_b": removed_b}

    def to_dict(self) -> Dict[str, Any]:
        return {
            "reserve_a": round(self.reserve_a, 2),
            "reserve_b": round(self.reserve_b, 2),
            "price_a_per_b": round(self.price_a_per_b, 6),
            "price_b_per_a": round(self.price_b_per_a, 6),
            "k": round(self.k, 2),
            "total_volume": round(self.total_volume, 2),
            "swap_count": self.swap_count,
            "reference_price": round(self.reference_price, 6),
        }

    def drift_reference_price(self, pct: float = 0.5):
        """Randomly drift the external reference price."""
        change = random.uniform(-pct, pct) / 100
        self.reference_price *= (1 + change)


# ---------------------------------------------------------------------------
# Lending state (in-memory)
# ---------------------------------------------------------------------------

@dataclass
class BorrowerPosition:
    wallet: str
    collateral: float
    debt: float
    liquidation_threshold: float = 1.5

    @property
    def health_factor(self) -> float:
        return self.collateral / self.debt if self.debt > 0 else 999.0

    @property
    def is_liquidatable(self) -> bool:
        return self.health_factor < self.liquidation_threshold

    def to_dict(self) -> Dict[str, Any]:
        return {
            "wallet": self.wallet,
            "collateral": round(self.collateral, 2),
            "debt": round(self.debt, 2),
            "health_factor": round(self.health_factor, 4),
            "liquidation_threshold": self.liquidation_threshold,
            "is_liquidatable": self.is_liquidatable,
        }


class LendingState:
    """Simulated lending market shared across agents."""

    def __init__(self):
        self.positions: Dict[str, BorrowerPosition] = {}
        self.liquidation_count: int = 0
        self.total_collateral: float = 0.0
        self.total_debt: float = 0.0
        self._seed_positions()

    def _seed_positions(self):
        """Create some starting borrower positions."""
        seeds = [
            ("0xBorrower_A1", 50_000, 25_000),
            ("0xBorrower_B2", 30_000, 22_000),
            ("0xBorrower_C3", 10_000, 8_500),
            ("0xBorrower_D4", 75_000, 40_000),
            ("0xBorrower_E5", 20_000, 18_000),
            ("0xBorrower_F6", 40_000, 15_000),
            ("0xBorrower_G7", 12_000, 10_000),
            ("0xBorrower_H8", 60_000, 30_000),
        ]
        for wallet, collateral, debt in seeds:
            pos = BorrowerPosition(wallet=wallet, collateral=collateral, debt=debt)
            self.positions[wallet] = pos
        self._recompute()

    def _recompute(self):
        self.total_collateral = sum(p.collateral for p in self.positions.values())
        self.total_debt = sum(p.debt for p in self.positions.values())

    def apply_price_change(self, pct: float):
        """Simulate a collateral price change across all positions."""
        for pos in self.positions.values():
            pos.collateral *= (1 + pct / 100)
        self._recompute()

    def get_liquidatable(self) -> List[BorrowerPosition]:
        return [p for p in self.positions.values() if p.is_liquidatable]

    def liquidate(self, wallet: str) -> Optional[Dict[str, Any]]:
        pos = self.positions.get(wallet)
        if not pos or not pos.is_liquidatable:
            return None
        seized = pos.collateral * 0.5
        debt_covered = pos.debt * 0.5
        pos.collateral -= seized
        pos.debt -= debt_covered
        self.liquidation_count += 1
        self._recompute()
        return {
            "wallet": wallet,
            "seized_collateral": round(seized, 2),
            "debt_covered": round(debt_covered, 2),
            "remaining_hf": round(pos.health_factor, 4),
        }

    def to_dict(self) -> Dict[str, Any]:
        return {
            "total_collateral": round(self.total_collateral, 2),
            "total_debt": round(self.total_debt, 2),
            "positions_count": len(self.positions),
            "liquidatable_count": len(self.get_liquidatable()),
            "liquidation_count": self.liquidation_count,
        }


# ---------------------------------------------------------------------------
# Mempool (simulated)
# ---------------------------------------------------------------------------

@dataclass
class PendingTx:
    """Represents a transaction sitting in the simulated mempool."""
    tx_id: str
    agent_id: str
    action: str
    token_in: str
    token_out: str
    amount: float
    gas_price: float
    timestamp: float = field(default_factory=time.time)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "tx_id": self.tx_id,
            "agent_id": self.agent_id,
            "action": self.action,
            "amount": self.amount,
            "gas_price": self.gas_price,
        }


class Mempool:
    """Simulated mempool that MEV bots can inspect."""

    def __init__(self):
        self.pending: List[PendingTx] = []

    def submit(self, tx: PendingTx):
        self.pending.append(tx)

    def peek(self) -> List[PendingTx]:
        return list(self.pending)

    def pop_all(self) -> List[PendingTx]:
        txs = list(self.pending)
        self.pending.clear()
        return txs

    def remove(self, tx_id: str):
        self.pending = [t for t in self.pending if t.tx_id != tx_id]


# ---------------------------------------------------------------------------
# BaseAgent
# ---------------------------------------------------------------------------

class BaseAgent(ABC):
    """
    Abstract base class for all simulation agents.
    Subclasses must implement `tick()` which is called every simulation step.
    """

    def __init__(
        self,
        agent_type: AgentType,
        name: str,
        capital: float,
        risk: str = "medium",
        speed: str = "normal",
    ):
        self.id: str = f"{agent_type.value}_{uuid.uuid4().hex[:8]}"
        self.agent_type = agent_type
        self.name = name
        self.capital = capital
        self.current_value = capital
        self.risk = risk
        self.speed = speed
        self.state = AgentState.IDLE
        self.active = True
        self.stats = AgentStats()

        # Will be injected by SimulationRunner
        self.pool: Optional[PoolState] = None
        self.lending: Optional[LendingState] = None
        self.mempool: Optional[Mempool] = None
        self.market_data: Optional[Any] = None  # MarketDataService instance
        self._event_callback: Optional[Callable] = None
        self._market_aggression: float = 1.0  # Modifier based on real market conditions

    # -- lifecycle ----------------------------------------------------------

    def start(self):
        self.state = AgentState.RUNNING

    def pause(self):
        self.state = AgentState.PAUSED

    def resume(self):
        self.state = AgentState.RUNNING

    def stop(self):
        self.state = AgentState.STOPPED

    # -- abstract -----------------------------------------------------------

    @abstractmethod
    async def tick(self, step: int) -> List[TradeAction]:
        """
        Called every simulation tick.
        Return a list of TradeAction objects the agent wants to execute.
        """
        ...

    # -- helpers ------------------------------------------------------------

    def emit_event(self, event_type: str, data: Dict[str, Any]):
        """Send an event to the fraud monitor / logger."""
        if self._event_callback:
            self._event_callback(
                {
                    "agent_id": self.id,
                    "agent_type": self.agent_type.value,
                    "agent_name": self.name,
                    "event_type": event_type,
                    "data": data,
                    "timestamp": time.time(),
                }
            )

    def record_trade(self, amount: float, profit: float):
        self.stats.trades_count += 1
        self.stats.total_volume += abs(amount)
        self.stats.pnl += profit
        self.current_value += profit
        if profit >= 0:
            self.stats.win_count += 1
        else:
            self.stats.loss_count += 1
        self.stats.last_action_time = time.time()

    # -- serialization ------------------------------------------------------

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "type": self.agent_type.value,
            "capital": round(self.capital, 2),
            "current_value": round(self.current_value, 2),
            "pnl": round(self.stats.pnl, 2),
            "win_rate": round(self.stats.win_rate, 4),
            "active": self.active,
            "state": self.state.value,
            "risk": self.risk,
            "speed": self.speed,
            "stats": self.stats.to_dict(),
        }
