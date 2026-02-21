// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./AccessControl.sol";

contract CreditRegistry {
    AccessControl public accessControl;

    mapping(address => uint256) public creditScores;

    event ScoreUpdated(address indexed user, uint256 newScore);

    constructor(address _accessControl) {
        accessControl = AccessControl(_accessControl);
    }

    function updateScore(address user, uint256 score) external {
        require(accessControl.hasRole(accessControl.ORACLE_ROLE(), msg.sender), "Not Oracle");
        creditScores[user] = score;
        emit ScoreUpdated(user, score);
    }

    function getMaxLTV(address user) public view returns (uint256) {
        uint256 score = creditScores[user];
        if (score >= 800) return 80;
        if (score >= 600) return 60;
        if (score >= 400) return 40;
        return 0;
    }

    function getInterestMultiplier(address user) public view returns (uint256) {
        uint256 score = creditScores[user];
        if (score >= 800) return 100;
        if (score >= 600) return 125;
        if (score >= 400) return 150;
        return 200;
    }
}