// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./AccessControl.sol";

contract IdentityRegistry {
    AccessControl public accessControl;

    struct Identity {
        bool isRegistered;
        bool isVerified;
    }

    mapping(address => Identity) public identities;

    event UserRegistered(address indexed wallet);
    event UserVerified(address indexed wallet);

    constructor(address _accessControl) {
        accessControl = AccessControl(_accessControl);
    }

    function register() external {
        require(!identities[msg.sender].isRegistered, "Already registered");
        identities[msg.sender] = Identity(true, false);
        emit UserRegistered(msg.sender);
    }

    function verifyUser(address user) external {
        require(accessControl.hasRole(accessControl.ADMIN_ROLE(), msg.sender), "Only admin can verify");
        require(identities[user].isRegistered, "Not registered");
        identities[user].isVerified = true;
        
        accessControl.grantRole(accessControl.BORROWER_ROLE(), user);
        accessControl.grantRole(accessControl.LENDER_ROLE(), user);
        
        emit UserVerified(user);
    }
}