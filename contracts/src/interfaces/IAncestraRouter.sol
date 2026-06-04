// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IAncestraRouter {
    function factory() external view returns (address);
    function WRITUAL() external view returns (address);

    function addLiquidity(
        address tokenA, address tokenB,
        uint256 amountADesired, uint256 amountBDesired,
        uint256 amountAMin, uint256 amountBMin,
        address to, uint256 deadline
    ) external returns (uint256 amountA, uint256 amountB, uint256 liquidity);

    function addLiquidityRITUAL(
        address token,
        uint256 amountTokenDesired,
        uint256 amountTokenMin,
        uint256 amountRITUALMin,
        address to, uint256 deadline
    ) external payable returns (uint256 amountToken, uint256 amountRITUAL, uint256 liquidity);

    function removeLiquidity(
        address tokenA, address tokenB,
        uint256 liquidity,
        uint256 amountAMin, uint256 amountBMin,
        address to, uint256 deadline
    ) external returns (uint256 amountA, uint256 amountB);

    function removeLiquidityRITUAL(
        address token,
        uint256 liquidity,
        uint256 amountTokenMin,
        uint256 amountRITUALMin,
        address to, uint256 deadline
    ) external returns (uint256 amountToken, uint256 amountRITUAL);

    function swapExactTokensForTokens(
        uint256 amountIn, uint256 amountOutMin,
        address[] calldata path, address to, uint256 deadline
    ) external returns (uint256[] memory amounts);

    function swapTokensForExactTokens(
        uint256 amountOut, uint256 amountInMax,
        address[] calldata path, address to, uint256 deadline
    ) external returns (uint256[] memory amounts);

    function swapExactRITUALForTokens(
        uint256 amountOutMin, address[] calldata path, address to, uint256 deadline
    ) external payable returns (uint256[] memory amounts);

    function swapTokensForExactRITUAL(
        uint256 amountOut, uint256 amountInMax,
        address[] calldata path, address to, uint256 deadline
    ) external returns (uint256[] memory amounts);

    function swapExactTokensForRITUAL(
        uint256 amountIn, uint256 amountOutMin,
        address[] calldata path, address to, uint256 deadline
    ) external returns (uint256[] memory amounts);

    function swapRITUALForExactTokens(
        uint256 amountOut, address[] calldata path, address to, uint256 deadline
    ) external payable returns (uint256[] memory amounts);

    function quote(uint256 amountA, uint256 reserveA, uint256 reserveB) external pure returns (uint256 amountB);
    function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) external pure returns (uint256 amountOut);
    function getAmountIn(uint256 amountOut, uint256 reserveIn, uint256 reserveOut) external pure returns (uint256 amountIn);
    function getAmountsOut(uint256 amountIn, address[] calldata path) external view returns (uint256[] memory amounts);
    function getAmountsIn(uint256 amountOut, address[] calldata path) external view returns (uint256[] memory amounts);
}
