"""
RetailTrader Agent
==================
- Small, randomized trades
- Emotional panic-sell logic when price drops significantly
- Herd behaviour: sells more aggressively during downtrends
"""

import random
from typing import List

from agents.base import (
    BaseAgent,
    AgentType,
    TradeAction,
    PendingTx,
)


class RetailTrader(BaseAgent):
    """
    Simulates a small retail user:
      • Random buys/sells of modest size
      • Panic-sell mode triggers when pool price drops >5 % from entry
      • Emotional cooldown period after panic events
    """

    def __init__(
        self,
        name: str = "RetailTrader",
        capital: float = 10_000.0,
    ):
        super().__init__(
            agent_type=AgentType.RETAIL_TRADER,
            name=name,
            capital=capital,
            risk="low",
            speed="slow",
        )
        self.entry_price: float = 0.0
        self.panic_threshold_pct: float = 5.0
        self.is_panicking: bool = False
        self.cooldown_ticks: int = 0
        self.position_token: str = "TOKEN_A"
        self.position_size: float = 0.0
        self.trade_min: float = capital * 0.01   # 1 % of capital
        self.trade_max: float = capital * 0.05   # 5 % of capital

    async def tick(self, step: int) -> List[TradeAction]:
        if not self.pool or not self.active:
            return []

        actions: List[TradeAction] = []

        # Record entry price on first tick
        if self.entry_price == 0.0:
            self.entry_price = self.pool.price_a_per_b

        current_price = self.pool.price_a_per_b
        price_change_pct = (
            (current_price - self.entry_price) / self.entry_price * 100
            if self.entry_price
            else 0.0
        )

        # --- Get market-driven behavior modifier ---
        aggression = getattr(self, '_market_aggression', 1.0)
        
        # --- Get real market sentiment if available ---
        market_sentiment = "neutral"
        real_btc_change = 0.0
        if self.market_data:
            try:
                condition = self.market_data.get_market_condition()
                market_sentiment = condition.sentiment
                # Adjust panic threshold based on real market fear
                if market_sentiment == "extreme_fear":
                    self.panic_threshold_pct = 3.0  # More trigger-happy
                elif market_sentiment == "bearish":
                    self.panic_threshold_pct = 4.0
                else:
                    self.panic_threshold_pct = 5.0
                    
                # Get real BTC price change for sentiment
                if hasattr(self.market_data, '_cache') and 'BTC' in self.market_data._cache:
                    real_btc_change = self.market_data._cache['BTC'].change_pct_24h
            except Exception:
                pass

        # --- cooldown ---
        if self.cooldown_ticks > 0:
            self.cooldown_ticks -= 1
            return []

        # --- panic sell check (more likely during real market fear) ---
        panic_trigger = price_change_pct <= -self.panic_threshold_pct
        # Also panic if real BTC is crashing
        if real_btc_change < -5 and self.position_size > 0:
            panic_trigger = True
            
        if panic_trigger and self.position_size > 0:
            self.is_panicking = True
            sell_amount = self.position_size * random.uniform(0.5, 1.0) * aggression
            sell_amount = min(sell_amount, self.current_value * 0.3)

            action = TradeAction(
                agent_id=self.id,
                agent_type=self.agent_type.value,
                action="panic_sell",
                token_in=self.position_token,
                token_out="TOKEN_B" if self.position_token == "TOKEN_A" else "TOKEN_A",
                amount=sell_amount,
                metadata={
                    "reason": "panic",
                    "price_drop_pct": round(price_change_pct, 2),
                    "market_sentiment": market_sentiment,
                    "real_btc_change": round(real_btc_change, 2),
                },
            )
            actions.append(action)

            # Execute on pool
            receipt = self.pool.execute_swap(sell_amount, self.position_token)
            profit = receipt["amount_out"] - sell_amount
            self.record_trade(sell_amount, profit)
            self.position_size -= sell_amount
            self.cooldown_ticks = random.randint(3, 8)

            self.emit_event("panic_sell", {
                "amount": sell_amount,
                "price_drop_pct": round(price_change_pct, 2),
                "market_sentiment": market_sentiment,
                "real_btc_change_24h": round(real_btc_change, 2),
                "receipt": receipt,
            })

            # Submit to mempool so MEV bot can see it
            if self.mempool:
                self.mempool.submit(PendingTx(
                    tx_id=f"tx_{self.id}_{step}",
                    agent_id=self.id,
                    action="panic_sell",
                    token_in=self.position_token,
                    token_out=receipt["token_out"],
                    amount=sell_amount,
                    gas_price=random.uniform(5, 20),
                ))

            return actions

        # --- normal random trading ---
        self.is_panicking = False

        # Activity rate adjusted by market sentiment
        # More active in bullish, less in bearish
        activity_rate = 0.6 * aggression
        if random.random() > activity_rate:
            return []

        trade_size = random.uniform(self.trade_min, self.trade_max)
        trade_size = min(trade_size, self.current_value * 0.1)

        if trade_size <= 0:
            return []

        # Randomly buy or sell
        if random.random() < 0.55:  # slight buy bias
            direction = "buy"
            token_in = "TOKEN_B"
            token_out = "TOKEN_A"
        else:
            direction = "sell"
            token_in = "TOKEN_A"
            token_out = "TOKEN_B"

        action = TradeAction(
            agent_id=self.id,
            agent_type=self.agent_type.value,
            action=f"retail_{direction}",
            token_in=token_in,
            token_out=token_out,
            amount=trade_size,
            metadata={"direction": direction},
        )
        actions.append(action)

        receipt = self.pool.execute_swap(trade_size, token_in)
        profit = receipt["amount_out"] - trade_size
        self.record_trade(trade_size, profit)

        if direction == "buy":
            self.position_size += receipt["amount_out"]
        else:
            self.position_size = max(0, self.position_size - trade_size)

        # Submit to mempool
        if self.mempool:
            self.mempool.submit(PendingTx(
                tx_id=f"tx_{self.id}_{step}",
                agent_id=self.id,
                action=f"retail_{direction}",
                token_in=token_in,
                token_out=token_out,
                amount=trade_size,
                gas_price=random.uniform(5, 15),
            ))

        self.emit_event("trade", {
            "direction": direction,
            "amount": round(trade_size, 2),
            "receipt": receipt,
        })

        return actions
