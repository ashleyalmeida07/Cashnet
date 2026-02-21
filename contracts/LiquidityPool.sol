// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "./AccessControl.sol";

contract LiquidityPool is ERC20 {
    IERC20 public tokenA;
    IERC20 public tokenB;
    AccessControl public accessControl;

    uint256 public reserveA;
    uint256 public reserveB;

    event LiquidityAdded(address indexed provider, uint256 amountA, uint256 amountB, uint256 shares);
    event LiquidityRemoved(address indexed provider, uint256 amountA, uint256 amountB, uint256 shares);
    event Swap(address indexed user, address tokenIn, uint256 amountIn, uint256 amountOut);

    constructor(address _tokenA, address _tokenB, address _accessControl) ERC20("LP Token", "LPT") {
        tokenA = IERC20(_tokenA);
        tokenB = IERC20(_tokenB);
        accessControl = AccessControl(_accessControl);
    }

    function addLiquidity(uint256 amountA, uint256 amountB) external {
        require(!accessControl.paused(), "System Paused");
        
        tokenA.transferFrom(msg.sender, address(this), amountA);
        tokenB.transferFrom(msg.sender, address(this), amountB);

        uint256 shares;
        if (totalSupply() == 0) {
            shares = Math.sqrt(amountA * amountB);
        } else {
            shares = Math.min(
                (amountA * totalSupply()) / reserveA,
                (amountB * totalSupply()) / reserveB
            );
        }

        require(shares > 0, "Zero shares minted");
        _mint(msg.sender, shares);

        reserveA += amountA;
        reserveB += amountB;

        emit LiquidityAdded(msg.sender, amountA, amountB, shares);
    }

    function removeLiquidity(uint256 shares) external {
        require(!accessControl.paused(), "System Paused");
        require(balanceOf(msg.sender) >= shares, "Insufficient shares");

        uint256 amountA = (shares * reserveA) / totalSupply();
        uint256 amountB = (shares * reserveB) / totalSupply();

        _burn(msg.sender, shares);
        reserveA -= amountA;
        reserveB -= amountB;

        tokenA.transfer(msg.sender, amountA);
        tokenB.transfer(msg.sender, amountB);

        emit LiquidityRemoved(msg.sender, amountA, amountB, shares);
    }

    function swap(address _tokenIn, uint256 _amountIn) external {
        require(!accessControl.paused(), "System Paused");
        require(_tokenIn == address(tokenA) || _tokenIn == address(tokenB), "Invalid token");

        bool isTokenA = _tokenIn == address(tokenA);
        IERC20 tokenIn = isTokenA ? tokenA : tokenB;
        IERC20 tokenOut = isTokenA ? tokenB : tokenA;
        
        uint256 reserveIn = isTokenA ? reserveA : reserveB;
        uint256 reserveOut = isTokenA ? reserveB : reserveA;

        uint256 amountInWithFee = _amountIn * 997;
        uint256 amountOut = (amountInWithFee * reserveOut) / ((reserveIn * 1000) + amountInWithFee);

        tokenIn.transferFrom(msg.sender, address(this), _amountIn);
        tokenOut.transfer(msg.sender, amountOut);

        if (isTokenA) {
            reserveA += _amountIn;
            reserveB -= amountOut;
        } else {
            reserveB += _amountIn;
            reserveA -= amountOut;
        }

        emit Swap(msg.sender, _tokenIn, _amountIn, amountOut);
    }
}