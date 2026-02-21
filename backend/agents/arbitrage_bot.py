"""
ArbitrageBot
=============
- Compares internal AMM pool price vs external reference price
- Exploits price inefficiencies when spread > threshold
- Profits from bringing price back to equilibrium
"""

import random
from typing import List

from agents.base import (
    BaseAgent,
    AgentType,
    TradeAction,
    PendingTx,
)


class ArbitrageBot(BaseAgent):
    """
    Monitors the difference between pool price and reference (oracle) price.
    When the spread exceeds a configurable threshold, executes an arb trade
    to capture the difference.
    """

    def __init__(
        self,
        name: str = "ArbitrageBot",
        capital: float = 100_000.0,
        spread_threshold_pct: float = 0.5,
    ):
        super().__init__(
            agent_type=AgentType.ARBITRAGE_BOT,
            name=name,
            capital=capital,
            risk="medium",
            speed="fast",
        )
        self.spread_threshold_pct = spread_threshold_pct
        self.max_trade_pct: float = 5.0   # max % of pool reserve per arb

    async def tick(self, step: int) -> List[TradeAction]:
        if not self.pool or not self.active:
            return []

        actions: List[TradeAction] = []

        pool_price = self.pool.price_a_per_b
        ref_price = self.pool.reference_price

        if ref_price == 0:
            return []

        spread_pct = (pool_price - ref_price) / ref_price * 100

        # Only arb if spread exceeds threshold
        if abs(spread_pct) < self.spread_threshold_pct:
            self.emit_event("arb_scan", {
                "spread_pct": round(spread_pct, 4),
                "action": "no_opportunity",
            })
            return []

        # Determine trade direction to close the spread
        if spread_pct > 0:
            # Pool price too high → sell TOKEN_A (buy TOKEN_B) to push price down
            token_in = "TOKEN_A"
        else:
            # Pool price too low → buy TOKEN_A (sell TOKEN_B) to push price up
            token_in = "TOKEN_B"

        # Size the trade proportional to the spread
        reserve = self.pool.reserve_a if token_in == "TOKEN_A" else self.pool.reserve_b
        trade_pct = min(abs(spread_pct) * 0.8, self.max_trade_pct)
        trade_size = reserve * trade_pct / 100
        trade_size = min(trade_size, self.current_value * 0.15)

        if trade_size <= 0:
            return []

        receipt = self.pool.execute_swap(trade_size, token_in)

        # Arb profit estimate: spread captured minus slippage
        ideal_out = trade_size * (ref_price if token_in == "TOKEN_A" else 1 / ref_price)
        profit = receipt["amount_out"] - trade_size
        arb_profit = abs(receipt["amount_out"] - ideal_out) * 0.5  # conservative estimate
        self.record_trade(trade_size, arb_profit)

        action = TradeAction(
            agent_id=self.id,
            agent_type=self.agent_type.value,
            action="arbitrage",
            token_in=token_in,
            token_out=receipt["token_out"],
            amount=trade_size,
            metadata={
                "spread_pct": round(spread_pct, 4),
                "arb_profit": round(arb_profit, 2),
                "price_before": round(pool_price, 6),
                "price_after": receipt["price_after"],
            },
        )
        actions.append(action)

        self.emit_event("arbitrage_executed", {
            "spread_pct": round(spread_pct, 4),
            "trade_size": round(trade_size, 2),
            "arb_profit": round(arb_profit, 2),
            "receipt": receipt,
        })

        # Submit to mempool
        if self.mempool:
            self.mempool.submit(PendingTx(
                tx_id=f"tx_{self.id}_{step}",
                agent_id=self.id,
                action="arbitrage",
                token_in=token_in,
                token_out=receipt["token_out"],
                amount=trade_size,
                gas_price=random.uniform(30, 100),
            ))

        return actions
