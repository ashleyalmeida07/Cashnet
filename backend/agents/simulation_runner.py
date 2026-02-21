"""
SimulationRunner — Orchestrates all agents together
=====================================================
- Creates & manages all agent instances
- Runs the tick loop (async)
- Coordinates shared state (pool, lending, mempool)
- Feeds events into the FraudMonitor
- Logs everything for the backend & frontend
"""

import asyncio
import time
import random
from typing import Any, Dict, List, Optional

from agents.base import (
    BaseAgent,
    AgentState,
    AgentType,
    PoolState,
    LendingState,
    Mempool,
    TradeAction,
)
from agents.retail_trader import RetailTrader
from agents.whale_agent import WhaleAgent
from agents.arbitrage_bot import ArbitrageBot
from agents.liquidator_bot import LiquidatorBot
from agents.mev_bot import MEVBot
from agents.attacker_agent import AttackerAgent
from agents.fraud_monitor import FraudMonitor


class SimulationRunner:
    """
    Central orchestrator that:
      1. Spawns all agent types
      2. Shares PoolState, LendingState, Mempool across agents
      3. Runs a step-based event loop
      4. Pipes every event through FraudMonitor
      5. Exposes state for the API layer
    """

    def __init__(self):
        # Shared world state
        self.pool = PoolState(reserve_a=1_000_000, reserve_b=1_000_000)
        self.lending = LendingState()
        self.mempool = Mempool()
        self.fraud_monitor = FraudMonitor()

        # Agents
        self.agents: List[BaseAgent] = []

        # Simulation metadata
        self.status: str = "idle"        # idle | running | paused | completed
        self.current_step: int = 0
        self.max_steps: int = 200
        self.tick_delay: float = 0.5     # seconds between ticks
        self.start_time: Optional[float] = None
        self.end_time: Optional[float] = None

        # Event log (recent N for the API)
        self.activity_feed: List[Dict[str, Any]] = []
        self._max_feed: int = 200

        # All trade actions log
        self.trade_log: List[Dict[str, Any]] = []

        # Background task handle
        self._task: Optional[asyncio.Task] = None

    # ------------------------------------------------------------------
    # Agent creation
    # ------------------------------------------------------------------

    def _create_default_agents(self) -> List[BaseAgent]:
        """Spawn the default set of agents."""
        agents: List[BaseAgent] = []

        # 3 retail traders
        for i in range(1, 4):
            agents.append(RetailTrader(
                name=f"Retail_{i}",
                capital=random.uniform(5_000, 25_000),
            ))

        # 1 whale
        agents.append(WhaleAgent(
            name="MegaWhale",
            capital=500_000,
        ))

        # 1 arbitrage bot
        agents.append(ArbitrageBot(
            name="ArbBot",
            capital=100_000,
            spread_threshold_pct=0.3,
        ))

        # 1 liquidator
        agents.append(LiquidatorBot(
            name="LiqBot",
            capital=200_000,
        ))

        # 1 MEV bot
        agents.append(MEVBot(
            name="SandwichBot",
            capital=150_000,
            min_victim_size=3_000,
        ))

        # 1 attacker
        agents.append(AttackerAgent(
            name="FlashAttacker",
            capital=50_000,
            attack_cooldown_ticks=20,
        ))

        return agents

    def _inject_shared_state(self):
        """Give every agent references to shared simulation state."""
        for agent in self.agents:
            agent.pool = self.pool
            agent.lending = self.lending
            agent.mempool = self.mempool
            agent._event_callback = self._on_agent_event

    # ------------------------------------------------------------------
    # Event handling
    # ------------------------------------------------------------------

    def _on_agent_event(self, event: Dict[str, Any]):
        """Callback wired into every agent. Routes events to FraudMonitor + log."""
        self.activity_feed.append(event)
        if len(self.activity_feed) > self._max_feed:
            self.activity_feed = self.activity_feed[-self._max_feed:]

        # Feed into fraud monitor
        self.fraud_monitor.process_event(event)

    # ------------------------------------------------------------------
    # Simulation lifecycle
    # ------------------------------------------------------------------

    async def start(
        self,
        max_steps: int = 200,
        tick_delay: float = 0.5,
        custom_agents: Optional[List[BaseAgent]] = None,
    ):
        """Start the simulation. Runs in the background."""
        if self.status == "running":
            return {"error": "Simulation already running"}

        # Reset
        self.pool = PoolState(reserve_a=1_000_000, reserve_b=1_000_000)
        self.lending = LendingState()
        self.mempool = Mempool()
        self.fraud_monitor.reset()
        self.activity_feed.clear()
        self.trade_log.clear()
        self.current_step = 0
        self.max_steps = max_steps
        self.tick_delay = tick_delay
        self.start_time = time.time()
        self.end_time = None

        # Create agents
        self.agents = custom_agents or self._create_default_agents()
        self._inject_shared_state()

        for agent in self.agents:
            agent.start()

        self.status = "running"

        # Launch background loop
        self._task = asyncio.create_task(self._run_loop())

        return {
            "status": "running",
            "agents": len(self.agents),
            "max_steps": self.max_steps,
        }

    async def _run_loop(self):
        """Main simulation loop."""
        try:
            while self.current_step < self.max_steps and self.status == "running":
                await self._tick()
                self.current_step += 1
                await asyncio.sleep(self.tick_delay)

            if self.status == "running":
                self.status = "completed"
            self.end_time = time.time()

        except asyncio.CancelledError:
            self.status = "stopped"
            self.end_time = time.time()
        except Exception as e:
            self.status = "error"
            self.end_time = time.time()
            self._on_agent_event({
                "agent_id": "system",
                "agent_type": "system",
                "agent_name": "SimulationRunner",
                "event_type": "error",
                "data": {"error": str(e)},
                "timestamp": time.time(),
            })

    async def _tick(self):
        """Execute one simulation step: all agents act, then world updates."""

        # 1. Drift the reference price slightly each tick
        self.pool.drift_reference_price(0.3)

        # 2. Occasionally apply random market conditions to lending
        if random.random() < 0.15:
            price_shock = random.uniform(-3, 1)  # slight down bias
            self.lending.apply_price_change(price_shock)

        # 3. Each agent ticks
        all_actions: List[TradeAction] = []
        for agent in self.agents:
            if agent.state != AgentState.RUNNING or not agent.active:
                continue
            try:
                actions = await agent.tick(self.current_step)
                all_actions.extend(actions)
            except Exception as e:
                agent.state = AgentState.ERROR
                self._on_agent_event({
                    "agent_id": agent.id,
                    "agent_type": agent.agent_type.value,
                    "agent_name": agent.name,
                    "event_type": "agent_error",
                    "data": {"error": str(e)},
                    "timestamp": time.time(),
                })

        # 4. Log actions
        for action in all_actions:
            self.trade_log.append(action.to_dict())

        # 5. Clear processed mempool transactions periodically
        if self.current_step % 5 == 0:
            self.mempool.pop_all()

    async def pause(self):
        if self.status == "running":
            self.status = "paused"
            for agent in self.agents:
                if agent.state == AgentState.RUNNING:
                    agent.pause()
        return {"status": self.status}

    async def resume(self):
        if self.status == "paused":
            self.status = "running"
            for agent in self.agents:
                if agent.state == AgentState.PAUSED:
                    agent.resume()
            # Re-launch loop
            self._task = asyncio.create_task(self._run_loop())
        return {"status": self.status}

    async def stop(self):
        if self._task and not self._task.done():
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
        self.status = "completed"
        self.end_time = time.time()
        for agent in self.agents:
            agent.stop()
        return {"status": "completed"}

    # ------------------------------------------------------------------
    # Agent management
    # ------------------------------------------------------------------

    def toggle_agent(self, agent_id: str, active: bool) -> Optional[Dict]:
        for agent in self.agents:
            if agent.id == agent_id:
                agent.active = active
                if active:
                    agent.start()
                else:
                    agent.stop()
                return agent.to_dict()
        return None

    def update_agent_capital(self, agent_id: str, capital: float) -> Optional[Dict]:
        for agent in self.agents:
            if agent.id == agent_id:
                agent.capital = capital
                return agent.to_dict()
        return None

    # ------------------------------------------------------------------
    # State queries (for API)
    # ------------------------------------------------------------------

    def get_status(self) -> Dict[str, Any]:
        elapsed = 0
        if self.start_time:
            end = self.end_time or time.time()
            elapsed = round(end - self.start_time, 1)

        return {
            "status": self.status,
            "current_step": self.current_step,
            "max_steps": self.max_steps,
            "elapsed_seconds": elapsed,
            "agents_count": len(self.agents),
            "active_agents": sum(1 for a in self.agents if a.active),
            "total_trades": len(self.trade_log),
            "total_alerts": len(self.fraud_monitor.alerts),
            "pool": self.pool.to_dict(),
            "lending": self.lending.to_dict(),
        }

    def get_agents(self) -> List[Dict[str, Any]]:
        return [a.to_dict() for a in self.agents]

    def get_agent(self, agent_id: str) -> Optional[Dict[str, Any]]:
        for a in self.agents:
            if a.id == agent_id:
                return a.to_dict()
        return None

    def get_activity_feed(self, limit: int = 50) -> List[Dict[str, Any]]:
        return self.activity_feed[-limit:]

    def get_trade_log(self, limit: int = 100) -> List[Dict[str, Any]]:
        return self.trade_log[-limit:]

    def get_summary(self) -> Dict[str, Any]:
        total_pnl = sum(a.stats.pnl for a in self.agents)
        total_volume = sum(a.stats.total_volume for a in self.agents)
        return {
            "simulation": self.get_status(),
            "agents_summary": [
                {
                    "id": a.id,
                    "name": a.name,
                    "type": a.agent_type.value,
                    "pnl": round(a.stats.pnl, 2),
                    "trades": a.stats.trades_count,
                    "volume": round(a.stats.total_volume, 2),
                    "win_rate": round(a.stats.win_rate, 4),
                }
                for a in self.agents
            ],
            "totals": {
                "pnl": round(total_pnl, 2),
                "volume": round(total_volume, 2),
                "trades": len(self.trade_log),
            },
            "fraud_stats": self.fraud_monitor.get_stats(),
            "threat_scores": self.fraud_monitor.get_threat_scores(),
        }


# ---------------------------------------------------------------------------
# Singleton instance shared by the API layer
# ---------------------------------------------------------------------------
simulation_runner = SimulationRunner()
