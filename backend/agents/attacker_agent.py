"""
AttackerAgent
==============
- Simulates flash-loan exploit patterns
- Borrows large amount → manipulates price → repays → keeps profit
- Triggers cascade liquidations via price manipulation
"""

import random
from typing import List

from agents.base import (
    BaseAgent,
    AgentType,
    TradeAction,
)


class AttackerAgent(BaseAgent):
    """
    Simulates flash-loan attack patterns:
      1. "Borrow" a massive amount (simulated, no collateral)
      2. Use it to crash the pool price
      3. Trigger cascade liquidations in the lending market
      4. Profit from discounted collateral seizures
      5. Repay the flash loan
    """

    def __init__(
        self,
        name: str = "AttackerAgent",
        capital: float = 50_000.0,
        attack_cooldown_ticks: int = 15,
    ):
        super().__init__(
            agent_type=AgentType.ATTACKER,
            name=name,
            capital=capital,
            risk="high",
            speed="fast",
        )
        self.attack_cooldown_ticks = attack_cooldown_ticks
        self._cooldown: int = random.randint(5, 10)  # wait a bit before first attack
        self.attacks_performed: int = 0
        self.total_exploit_profit: float = 0.0
        self.flash_loan_multiplier: float = 20.0  # can borrow 20× capital

    async def tick(self, step: int) -> List[TradeAction]:
        if not self.pool or not self.lending or not self.active:
            return []

        actions: List[TradeAction] = []

        # Cooldown
        if self._cooldown > 0:
            self._cooldown -= 1
            return []

        # Roll the dice – attacker only attacks ~20 % of eligible ticks
        if random.random() > 0.20:
            return []

        # ====== FLASH LOAN ATTACK SEQUENCE ======

        flash_amount = self.capital * self.flash_loan_multiplier
        self.emit_event("flash_loan_start", {
            "borrowed_amount": round(flash_amount, 2),
            "step": step,
        })

        # Step 1: Record pool state before attack
        price_before = self.pool.price_a_per_b
        pool_state_before = self.pool.to_dict()

        # Step 2: Massive dump to crash price
        dump_size = min(flash_amount * 0.5, self.pool.reserve_a * 0.25)
        if dump_size <= 0:
            self._cooldown = 3
            return []

        dump_receipt = self.pool.execute_swap(dump_size, "TOKEN_A")
        price_after_dump = self.pool.price_a_per_b
        price_crash_pct = (price_after_dump - price_before) / price_before * 100

        dump_action = TradeAction(
            agent_id=self.id,
            agent_type=self.agent_type.value,
            action="flash_dump",
            token_in="TOKEN_A",
            token_out="TOKEN_B",
            amount=dump_size,
            metadata={
                "flash_loan_amount": round(flash_amount, 2),
                "price_crash_pct": round(price_crash_pct, 2),
            },
        )
        actions.append(dump_action)

        # Step 3: Price crash affects collateral values → trigger liquidations
        self.lending.apply_price_change(price_crash_pct * 0.7)
        liquidatable = self.lending.get_liquidatable()

        liquidation_profit = 0.0
        for pos in liquidatable[:5]:  # max 5 liquidations per attack
            result = self.lending.liquidate(pos.wallet)
            if result:
                liq_bonus = result["seized_collateral"] * 0.08  # 8% liquidation discount
                liquidation_profit += liq_bonus

                liq_action = TradeAction(
                    agent_id=self.id,
                    agent_type=self.agent_type.value,
                    action="exploit_liquidation",
                    token_in="COLLATERAL",
                    token_out="DEBT",
                    amount=result["debt_covered"],
                    metadata={
                        "target": pos.wallet,
                        "discount_profit": round(liq_bonus, 2),
                    },
                )
                actions.append(liq_action)

        # Step 4: Buy back cheap tokens to repay
        buyback_size = dump_receipt["amount_out"] * 0.9
        if buyback_size > 0:
            buyback_receipt = self.pool.execute_swap(buyback_size, "TOKEN_B")

            buyback_action = TradeAction(
                agent_id=self.id,
                agent_type=self.agent_type.value,
                action="flash_buyback",
                token_in="TOKEN_B",
                token_out="TOKEN_A",
                amount=buyback_size,
                metadata={
                    "bought_back": round(buyback_receipt["amount_out"], 2),
                },
            )
            actions.append(buyback_action)

        # Step 5: Flash loan repaid (simulated), profit = liquidation bonuses + arb
        arb_profit = abs(dump_size - (buyback_receipt["amount_out"] if buyback_size > 0 else 0)) * 0.1
        total_profit = liquidation_profit + arb_profit
        flash_loan_fee = flash_amount * 0.0009  # 0.09% flash loan fee
        net_profit = total_profit - flash_loan_fee

        self.total_exploit_profit += net_profit
        self.attacks_performed += 1
        self.record_trade(dump_size, net_profit)

        repay_action = TradeAction(
            agent_id=self.id,
            agent_type=self.agent_type.value,
            action="flash_repay",
            token_in="TOKEN_A",
            token_out="FLASH_LOAN",
            amount=flash_amount,
            metadata={
                "net_profit": round(net_profit, 2),
                "liquidations_triggered": len(liquidatable[:5]),
                "price_crash_pct": round(price_crash_pct, 2),
                "flash_fee": round(flash_loan_fee, 2),
            },
        )
        actions.append(repay_action)

        self.emit_event("flash_loan_attack", {
            "flash_amount": round(flash_amount, 2),
            "price_crash_pct": round(price_crash_pct, 2),
            "liquidations": len(liquidatable[:5]),
            "liquidation_profit": round(liquidation_profit, 2),
            "arb_profit": round(arb_profit, 2),
            "net_profit": round(net_profit, 2),
            "attacks_total": self.attacks_performed,
        })

        self._cooldown = self.attack_cooldown_ticks
        return actions
