// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "./interfaces/IERC20.sol";

/// @title AncestraPool — Constant Product AMM (RITUAL-centric)
/// @notice Single-pair AMM where token0 is always RITUAL. Uses x*y=k formula.
contract AncestraPool {
    error InsufficientOutputAmount();
    error InsufficientLiquidity();
    error InvalidPath();
    error DeadlineExceeded();

    event Swapped(
        address indexed sender,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut,
        uint256 fee,
        uint256 timestamp
    );

    address public immutable token0; // RITUAL
    address public immutable token1; // paired token
    string public modeName;
    string public modeDescription;

    uint256 public reserve0;
    uint256 public reserve1;
    uint256 public constant FEE_NUMERATOR = 30;   // 0.3% fee
    uint256 public constant FEE_DENOMINATOR = 10000;
    uint256 public constant MINIMUM_LIQUIDITY = 1000;

    constructor(
        address _token0,
        address _token1,
        string memory _modeName,
        string memory _modeDescription
    ) {
        token0 = _token0;
        token1 = _token1;
        modeName = _modeName;
        modeDescription = _modeDescription;
    }

    /// @notice Initialize pool with liquidity
    function initialize(uint256 amount0, uint256 amount1) external {
        require(reserve0 == 0 && reserve1 == 0, "already initialized");
        IERC20(token0).transferFrom(msg.sender, address(this), amount0);
        IERC20(token1).transferFrom(msg.sender, address(this), amount1);
        reserve0 = amount0;
        reserve1 = amount1;
    }

    /// @notice Swap RITUAL (token0) for the paired token (token1)
    function swapRitualForToken(uint256 amountOut, uint256 amountInMax) external returns (uint256) {
        require(amountOut > 0, "amountOut must be > 0");
        uint256 amountIn = getAmountIn(amountOut, reserve0, reserve1);
        require(amountIn <= amountInMax, "slippage exceeded");
        require(reserve1 >= amountOut, "insufficient reserve");

        uint256 fee = (amountIn * FEE_NUMERATOR) / FEE_DENOMINATOR;

        IERC20(token0).transferFrom(msg.sender, address(this), amountIn);
        IERC20(token1).transfer(msg.sender, amountOut);

        reserve0 += amountIn;
        reserve1 -= amountOut;

        emit Swapped(msg.sender, token0, token1, amountIn, amountOut, fee, block.timestamp);
        return amountIn;
    }

    /// @notice Swap paired token (token1) for RITUAL (token0)
    function swapTokenForRitual(uint256 amountOut, uint256 amountInMax) external returns (uint256) {
        require(amountOut > 0, "amountOut must be > 0");
        uint256 amountIn = getAmountIn(amountOut, reserve1, reserve0);
        require(amountIn <= amountInMax, "slippage exceeded");
        require(reserve0 >= amountOut, "insufficient reserve");

        uint256 fee = (amountIn * FEE_NUMERATOR) / FEE_DENOMINATOR;

        IERC20(token1).transferFrom(msg.sender, address(this), amountIn);
        IERC20(token0).transfer(msg.sender, amountOut);

        reserve1 += amountIn;
        reserve0 -= amountOut;

        emit Swapped(msg.sender, token1, token0, amountIn, amountOut, fee, block.timestamp);
        return amountIn;
    }

    /// @notice Get amount of input token needed for a given output
    /// @param amountOut Desired output amount
    /// @param reserveIn Reserve of input token
    /// @param reserveOut Reserve of output token
    function getAmountIn(uint256 amountOut, uint256 reserveIn, uint256 reserveOut)
        public pure returns (uint256)
    {
        require(reserveIn > 0 && reserveOut > 0, "no liquidity");
        require(amountOut < reserveOut, "insufficient liquidity");
        uint256 numerator = reserveIn * amountOut * FEE_DENOMINATOR;
        uint256 denominator = (reserveOut - amountOut) * (FEE_DENOMINATOR - FEE_NUMERATOR);
        return (numerator / denominator) + 1;
    }

    /// @notice Get output amount for a given input
    function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut)
        public pure returns (uint256)
    {
        require(reserveIn > 0 && reserveOut > 0, "no liquidity");
        uint256 amountInAfterFee = amountIn * (FEE_DENOMINATOR - FEE_NUMERATOR);
        uint256 numerator = amountInAfterFee * reserveOut;
        uint256 denominator = (reserveIn * FEE_DENOMINATOR) + amountInAfterFee;
        return numerator / denominator;
    }
}
