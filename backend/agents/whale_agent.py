"""
WhaleAgent
==========
- Large trades that can move the AMM price significantly
- Causes slippage spikes visible to other agents
- Occasionally adds/removes large chunks of liquidity
"""

import random
from typing import List

from agents.base import (
    BaseAgent,
    AgentType,
    TradeAction,
    PendingTx,
)


class WhaleAgent(BaseAgent):
    """
    Simulates a whale:
      • Trades 1-10 % of pool reserves in a single swap
      • Creates large slippage events
      • Periodically adds or yanks liquidity (rug-pull style)
    """

    def __init__(
        self,
        name: str = "WhaleAgent",
        capital: float = 500_000.0,
    ):
        super().__init__(
            agent_type=AgentType.WHALE,
            name=name,
            capital=capital,
            risk="high",
            speed="normal",
        )
        self.trade_cooldown: int = 0
        self.min_trade_pct: float = 1.0   # % of pool reserve
        self.max_trade_pct: float = 10.0

    async def tick(self, step: int) -> List[TradeAction]:
        if not self.pool or not self.active:
            return []

        actions: List[TradeAction] = []

        if self.trade_cooldown > 0:
            self.trade_cooldown -= 1
            return []

        # --- Get market-driven behavior modifier ---
        aggression = getattr(self, '_market_aggression', 1.0)
        
        # --- Get real market conditions ---
        market_sentiment = "neutral"
        volatility = "medium"
        real_btc_price = 0.0
        if self.market_data:
            try:
                condition = self.market_data.get_market_condition()
                market_sentiment = condition.sentiment
                volatility = condition.volatility
                
                # Get real BTC price
                if hasattr(self.market_data, '_cache') and 'BTC' in self.market_data._cache:
                    real_btc_price = self.market_data._cache['BTC'].price
                    
                # Whales love volatility - increase trading
                if volatility == "extreme":
                    aggression *= 1.5
                elif volatility == "high":
                    aggression *= 1.25
            except Exception:
                pass

        # Whales activity rate adjusted by aggression
        activity_rate = 0.30 * aggression
        if random.random() > activity_rate:
            return []

        action_roll = random.random()

        if action_roll < 0.65:
            # --- large swap ---
            # Adjust trade size based on market volatility
            min_pct = self.min_trade_pct * aggression
            max_pct = self.max_trade_pct * aggression
            pct = random.uniform(min_pct, max_pct)
            
            # Whales buy fear, sell greed (contrarian)
            if market_sentiment == "extreme_fear":
                token_in = "TOKEN_B"  # Buy TOKEN_A (the "risky" asset)
            elif market_sentiment == "extreme_greed":
                token_in = "TOKEN_A"  # Sell TOKEN_A, take profits
            else:
                token_in = random.choice(["TOKEN_A", "TOKEN_B"])
                
            reserve = self.pool.reserve_a if token_in == "TOKEN_A" else self.pool.reserve_b
            trade_size = reserve * pct / 100
            trade_size = min(trade_size, self.current_value * 0.2)

            if trade_size <= 0:
                return []

            slippage_before = self.pool.get_slippage(trade_size, token_in)
            receipt = self.pool.execute_swap(trade_size, token_in)
            profit = receipt["amount_out"] - trade_size
            self.record_trade(trade_size, profit)

            action = TradeAction(
                agent_id=self.id,
                agent_type=self.agent_type.value,
                action="whale_swap",
                token_in=token_in,
                token_out=receipt["token_out"],
                amount=trade_size,
                metadata={
                    "pool_pct": round(pct, 2),
                    "slippage": round(receipt["slippage_pct"], 4),
                    "price_after": receipt["price_after"],
                    "market_sentiment": market_sentiment,
                    "real_btc_price": round(real_btc_price, 2),
                },
            )
            actions.append(action)

            self.emit_event("whale_swap", {
                "amount": round(trade_size, 2),
                "slippage_pct": round(receipt["slippage_pct"], 4),
                "pool_impact_pct": round(pct, 2),
                "market_sentiment": market_sentiment,
                "real_btc_price": round(real_btc_price, 2),
                "receipt": receipt,
            })

            # Submit to mempool
            if self.mempool:
                self.mempool.submit(PendingTx(
                    tx_id=f"tx_{self.id}_{step}",
                    agent_id=self.id,
                    action="whale_swap",
                    token_in=token_in,
                    token_out=receipt["token_out"],
                    amount=trade_size,
                    gas_price=random.uniform(20, 80),
                ))

            self.trade_cooldown = random.randint(2, 5)

        elif action_roll < 0.85:
            # --- add liquidity ---
            add_a = random.uniform(10_000, 50_000)
            add_b = add_a * self.pool.price_a_per_b
            self.pool.add_liquidity(add_a, add_b)

            action = TradeAction(
                agent_id=self.id,
                agent_type=self.agent_type.value,
                action="whale_add_liquidity",
                token_in="TOKEN_A",
                token_out="TOKEN_B",
                amount=add_a + add_b,
                metadata={"added_a": round(add_a, 2), "added_b": round(add_b, 2)},
            )
            actions.append(action)

            self.emit_event("add_liquidity", {
                "amount_a": round(add_a, 2),
                "amount_b": round(add_b, 2),
            })
            self.trade_cooldown = random.randint(3, 6)

        else:
            # --- remove liquidity (rug-lite) ---
            remove_pct = random.uniform(2, 8)
            removed = self.pool.remove_liquidity(remove_pct)

            action = TradeAction(
                agent_id=self.id,
                agent_type=self.agent_type.value,
                action="whale_remove_liquidity",
                token_in="LP",
                token_out="TOKEN_A+TOKEN_B",
                amount=removed["removed_a"] + removed["removed_b"],
                metadata={
                    "remove_pct": round(remove_pct, 2),
                    **{k: round(v, 2) for k, v in removed.items()},
                },
            )
            actions.append(action)

            self.emit_event("remove_liquidity", {
                "pct": round(remove_pct, 2),
                **{k: round(v, 2) for k, v in removed.items()},
            })
            self.trade_cooldown = random.randint(4, 8)

        return actions
