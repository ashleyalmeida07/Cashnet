// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./AccessControl.sol";

contract CollateralVault {
    AccessControl public accessControl;
    address public lendingPool;

    mapping(address => uint256) public ethCollateral;

    constructor(address _accessControl) {
        accessControl = AccessControl(_accessControl);
    }

    function setLendingPool(address _lendingPool) external {
        require(accessControl.hasRole(accessControl.ADMIN_ROLE(), msg.sender), "Not Admin");
        lendingPool = _lendingPool;
    }

    modifier onlyLendingPool() {
        require(msg.sender == lendingPool, "Only Lending Pool");
        _;
    }

    function lockCollateral(address user) external payable onlyLendingPool {
        ethCollateral[user] += msg.value;
    }

    function releaseCollateral(address user, uint256 amount) external onlyLendingPool {
        require(ethCollateral[user] >= amount, "Insufficient collateral");
        ethCollateral[user] -= amount;
        payable(user).transfer(amount);
    }

    function seizeCollateral(address user, address liquidator, uint256 amount) external onlyLendingPool {
        require(ethCollateral[user] >= amount, "Insufficient collateral");
        ethCollateral[user] -= amount;
        payable(liquidator).transfer(amount);
    }
}