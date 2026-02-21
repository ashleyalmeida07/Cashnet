// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract GlobalAccessControl is AccessControl, Pausable {
    bytes32 public constant ADMIN_ROLE = DEFAULT_ADMIN_ROLE;
    bytes32 public constant LENDER_ROLE = keccak256("LENDER_ROLE");
    bytes32 public constant BORROWER_ROLE = keccak256("BORROWER_ROLE");
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE"); // For backend credit updates

    constructor() {
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, msg.sender), "Not Admin");
        _;
    }

    modifier onlyBorrower() {
        require(hasRole(BORROWER_ROLE, msg.sender), "Not Borrower");
        _;
    }

    modifier onlyLender() {
        require(hasRole(LENDER_ROLE, msg.sender), "Not Lender");
        _;
    }

    function pauseAll() external onlyAdmin {
        _pause();
    }

    function unpauseAll() external onlyAdmin {
        _unpause();
    }
}