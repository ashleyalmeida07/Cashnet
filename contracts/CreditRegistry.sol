// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./GlobalAccessControl.sol";

contract CreditRegistry {
    GlobalAccessControl public access;

    mapping(address => uint256) public creditScores;

    event ScoreUpdated(address indexed user, uint256 newScore);

    constructor(address _access) {
        access = GlobalAccessControl(_access);
    }

    // Only trusted backend oracle can update
    function updateScore(address user, uint256 score) external {
        require(access.hasRole(access.ORACLE_ROLE(), msg.sender), "Not Oracle");
        creditScores[user] = score;
        emit ScoreUpdated(user, score);
    }

    // Dynamic LTV based on score (Returns percentage out of 100)
    function getMaxLTV(address user) public view returns (uint256) {
        uint256 score = creditScores[user];
        if (score >= 800) return 80; // 80% LTV
        if (score >= 600) return 60; // 60% LTV
        if (score >= 400) return 40; // 40% LTV
        return 0; // Cannot borrow
    }

    // Dynamic Interest Multiplier based on score
    function getInterestMultiplier(address user) public view returns (uint256) {
        uint256 score = creditScores[user];
        if (score >= 800) return 100; // Base rate (1x)
        if (score >= 600) return 125; // 1.25x rate
        if (score >= 400) return 150; // 1.5x rate
        return 200; // 2x rate
    }
}