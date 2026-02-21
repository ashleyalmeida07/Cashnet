"""
LiquidatorBot
==============
- Monitors borrower health factors every tick
- Instantly liquidates under-collateralized positions
- Earns liquidation bonus
"""

import random
from typing import List

from agents.base import (
    BaseAgent,
    AgentType,
    TradeAction,
)


class LiquidatorBot(BaseAgent):
    """
    Watches the lending market and liquidates any position
    whose health factor falls below the liquidation threshold.
    """

    def __init__(
        self,
        name: str = "LiquidatorBot",
        capital: float = 200_000.0,
        liquidation_bonus_pct: float = 5.0,
    ):
        super().__init__(
            agent_type=AgentType.LIQUIDATOR_BOT,
            name=name,
            capital=capital,
            risk="medium",
            speed="fast",
        )
        self.liquidation_bonus_pct = liquidation_bonus_pct
        self.liquidations_performed: int = 0

    async def tick(self, step: int) -> List[TradeAction]:
        if not self.lending or not self.active:
            return []

        actions: List[TradeAction] = []

        liquidatable = self.lending.get_liquidatable()

        if not liquidatable:
            self.emit_event("liquidator_scan", {
                "liquidatable_count": 0,
                "action": "no_targets",
            })
            return []

        # Liquidate all eligible positions
        for position in liquidatable:
            result = self.lending.liquidate(position.wallet)
            if not result:
                continue

            bonus = result["seized_collateral"] * (self.liquidation_bonus_pct / 100)
            self.record_trade(result["debt_covered"], bonus)
            self.liquidations_performed += 1

            action = TradeAction(
                agent_id=self.id,
                agent_type=self.agent_type.value,
                action="liquidation",
                token_in="COLLATERAL",
                token_out="DEBT",
                amount=result["debt_covered"],
                metadata={
                    "target_wallet": position.wallet,
                    "seized": result["seized_collateral"],
                    "bonus": round(bonus, 2),
                    "remaining_hf": result["remaining_hf"],
                },
            )
            actions.append(action)

            self.emit_event("liquidation_executed", {
                "target": position.wallet,
                "seized_collateral": result["seized_collateral"],
                "debt_covered": result["debt_covered"],
                "bonus_earned": round(bonus, 2),
                "remaining_hf": result["remaining_hf"],
            })

        return actions
