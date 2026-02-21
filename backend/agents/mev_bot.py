"""
MEVBot (Maximal Extractable Value)
===================================
- Monitors simulated mempool for pending transactions
- Front-runs profitable trades (sandwich attacks)
- Extracts value by placing own trade before + after victim trade
"""

import random
from typing import List

from agents.base import (
    BaseAgent,
    AgentType,
    TradeAction,
    PendingTx,
)


class MEVBot(BaseAgent):
    """
    Inspects the simulated mempool. When it finds a large pending swap
    it performs a sandwich attack:
      1. Front-run: buy before the victim
      2. Victim's trade executes (price moves)
      3. Back-run: sell after the victim at the higher price
    """

    def __init__(
        self,
        name: str = "MEVBot",
        capital: float = 150_000.0,
        min_victim_size: float = 5_000.0,
    ):
        super().__init__(
            agent_type=AgentType.MEV_BOT,
            name=name,
            capital=capital,
            risk="high",
            speed="fast",
        )
        self.min_victim_size = min_victim_size
        self.sandwiches_executed: int = 0
        self.total_mev_profit: float = 0.0

    async def tick(self, step: int) -> List[TradeAction]:
        if not self.pool or not self.mempool or not self.active:
            return []

        actions: List[TradeAction] = []

        pending = self.mempool.peek()
        if not pending:
            return []

        # Find juicy targets – large pending swaps from other agents
        targets = [
            tx for tx in pending
            if tx.agent_id != self.id
            and tx.amount >= self.min_victim_size
            and tx.action in ("retail_buy", "retail_sell", "panic_sell", "whale_swap")
        ]

        if not targets:
            self.emit_event("mev_scan", {
                "pending_count": len(pending),
                "targets_found": 0,
            })
            return []

        # Pick the largest target
        target = max(targets, key=lambda t: t.amount)

        # --- Front-run ---
        front_size = min(target.amount * 0.3, self.current_value * 0.1)
        if front_size <= 0:
            return []

        # Front-run: trade in same direction as victim
        front_receipt = self.pool.execute_swap(front_size, target.token_in)

        front_action = TradeAction(
            agent_id=self.id,
            agent_type=self.agent_type.value,
            action="mev_frontrun",
            token_in=target.token_in,
            token_out=front_receipt["token_out"],
            amount=front_size,
            metadata={
                "victim_id": target.agent_id,
                "victim_amount": round(target.amount, 2),
                "type": "sandwich_front",
            },
        )
        actions.append(front_action)

        # --- Victim's trade executes (simulate) ---
        victim_receipt = self.pool.execute_swap(target.amount, target.token_in)

        # --- Back-run: sell what we bought ---
        back_token = front_receipt["token_out"]
        back_size = front_receipt["amount_out"]
        back_receipt = self.pool.execute_swap(back_size, back_token)

        mev_profit = back_receipt["amount_out"] - front_size
        self.total_mev_profit += mev_profit
        self.sandwiches_executed += 1
        self.record_trade(front_size, mev_profit)

        back_action = TradeAction(
            agent_id=self.id,
            agent_type=self.agent_type.value,
            action="mev_backrun",
            token_in=back_token,
            token_out=back_receipt["token_out"],
            amount=back_size,
            metadata={
                "victim_id": target.agent_id,
                "mev_profit": round(mev_profit, 2),
                "type": "sandwich_back",
            },
        )
        actions.append(back_action)

        self.emit_event("sandwich_attack", {
            "victim_id": target.agent_id,
            "victim_amount": round(target.amount, 2),
            "front_run_size": round(front_size, 2),
            "mev_profit": round(mev_profit, 2),
            "sandwiches_total": self.sandwiches_executed,
        })

        # Remove the target from mempool (it's been "included")
        self.mempool.remove(target.tx_id)

        return actions
