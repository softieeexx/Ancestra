// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IAncestraRouter} from "./interfaces/IAncestraRouter.sol";
import {IAncestraFactory} from "./interfaces/IAncestraFactory.sol";
import {IAncestraPair} from "./interfaces/IAncestraPair.sol";
import {IWRITUAL} from "./interfaces/IWRITUAL.sol";
import {AncestraLibrary} from "./AncestraLibrary.sol";
import {IERC20} from "./interfaces/IERC20.sol";

contract AncestraRouter is IAncestraRouter {
    address public immutable override factory;
    address public immutable override WRITUAL;

    modifier ensure(uint256 deadline) {
        require(deadline >= block.timestamp, "AncestraRouter: EXPIRED");
        _;
    }

    constructor(address _factory, address _WRITUAL) {
        factory = _factory;
        WRITUAL = _WRITUAL;
    }

    receive() external payable {
        // Only accept ETH from WRITUAL on unwrap
        assert(msg.sender == WRITUAL);
    }

    // ── Internal helpers ────────────────────────────────────────────────────

    function _addLiquidity(
        address tokenA, address tokenB,
        uint256 amountADesired, uint256 amountBDesired,
        uint256 amountAMin, uint256 amountBMin
    ) internal returns (uint256 amountA, uint256 amountB) {
        if (IAncestraFactory(factory).getPair(tokenA, tokenB) == address(0)) {
            IAncestraFactory(factory).createPair(tokenA, tokenB);
        }
        (uint256 reserveA, uint256 reserveB) = AncestraLibrary.getReserves(factory, tokenA, tokenB);
        if (reserveA == 0 && reserveB == 0) {
            (amountA, amountB) = (amountADesired, amountBDesired);
        } else {
            uint256 amountBOptimal = AncestraLibrary.quote(amountADesired, reserveA, reserveB);
            if (amountBOptimal <= amountBDesired) {
                require(amountBOptimal >= amountBMin, "AncestraRouter: INSUFFICIENT_B_AMOUNT");
                (amountA, amountB) = (amountADesired, amountBOptimal);
            } else {
                uint256 amountAOptimal = AncestraLibrary.quote(amountBDesired, reserveB, reserveA);
                assert(amountAOptimal <= amountADesired);
                require(amountAOptimal >= amountAMin, "AncestraRouter: INSUFFICIENT_A_AMOUNT");
                (amountA, amountB) = (amountAOptimal, amountBDesired);
            }
        }
    }

    function _safeTransferFrom(address token, address from, address to, uint256 value) private {
        (bool success, bytes memory data) = token.call(
            abi.encodeWithSelector(IERC20.transferFrom.selector, from, to, value)
        );
        require(success && (data.length == 0 || abi.decode(data, (bool))), "AncestraRouter: TRANSFER_FROM_FAILED");
    }

    function _safeTransfer(address token, address to, uint256 value) private {
        (bool success, bytes memory data) = token.call(
            abi.encodeWithSelector(IERC20.transfer.selector, to, value)
        );
        require(success && (data.length == 0 || abi.decode(data, (bool))), "AncestraRouter: TRANSFER_FAILED");
    }

    // ── Add Liquidity ───────────────────────────────────────────────────────

    function addLiquidity(
        address tokenA, address tokenB,
        uint256 amountADesired, uint256 amountBDesired,
        uint256 amountAMin, uint256 amountBMin,
        address to, uint256 deadline
    ) external override ensure(deadline) returns (uint256 amountA, uint256 amountB, uint256 liquidity) {
        (amountA, amountB) = _addLiquidity(tokenA, tokenB, amountADesired, amountBDesired, amountAMin, amountBMin);
        address pair = AncestraLibrary.pairFor(factory, tokenA, tokenB);
        _safeTransferFrom(tokenA, msg.sender, pair, amountA);
        _safeTransferFrom(tokenB, msg.sender, pair, amountB);
        liquidity = IAncestraPair(pair).mint(to);
    }

    function addLiquidityRITUAL(
        address token,
        uint256 amountTokenDesired,
        uint256 amountTokenMin,
        uint256 amountRITUALMin,
        address to, uint256 deadline
    ) external payable override ensure(deadline) returns (uint256 amountToken, uint256 amountRITUAL, uint256 liquidity) {
        (amountToken, amountRITUAL) = _addLiquidity(
            token, WRITUAL,
            amountTokenDesired, msg.value,
            amountTokenMin, amountRITUALMin
        );
        address pair = AncestraLibrary.pairFor(factory, token, WRITUAL);
        _safeTransferFrom(token, msg.sender, pair, amountToken);
        IWRITUAL(WRITUAL).deposit{value: amountRITUAL}();
        assert(IWRITUAL(WRITUAL).transfer(pair, amountRITUAL));
        liquidity = IAncestraPair(pair).mint(to);
        // Refund excess native
        if (msg.value > amountRITUAL) {
            (bool ok,) = payable(msg.sender).call{value: msg.value - amountRITUAL}("");
            require(ok, "AncestraRouter: REFUND_FAILED");
        }
    }

    // ── Remove Liquidity ────────────────────────────────────────────────────

    function removeLiquidity(
        address tokenA, address tokenB,
        uint256 liquidity,
        uint256 amountAMin, uint256 amountBMin,
        address to, uint256 deadline
    ) public override ensure(deadline) returns (uint256 amountA, uint256 amountB) {
        address pair = AncestraLibrary.pairFor(factory, tokenA, tokenB);
        IAncestraPair(pair).transferFrom(msg.sender, pair, liquidity);
        (uint256 amount0, uint256 amount1) = IAncestraPair(pair).burn(to);
        (address token0,) = AncestraLibrary.sortTokens(tokenA, tokenB);
        (amountA, amountB) = tokenA == token0 ? (amount0, amount1) : (amount1, amount0);
        require(amountA >= amountAMin, "AncestraRouter: INSUFFICIENT_A_AMOUNT");
        require(amountB >= amountBMin, "AncestraRouter: INSUFFICIENT_B_AMOUNT");
    }

    function removeLiquidityRITUAL(
        address token,
        uint256 liquidity,
        uint256 amountTokenMin,
        uint256 amountRITUALMin,
        address to, uint256 deadline
    ) public override ensure(deadline) returns (uint256 amountToken, uint256 amountRITUAL) {
        (amountToken, amountRITUAL) = removeLiquidity(
            token, WRITUAL,
            liquidity, amountTokenMin, amountRITUALMin,
            address(this), deadline
        );
        _safeTransfer(token, to, amountToken);
        IWRITUAL(WRITUAL).withdraw(amountRITUAL);
        (bool ok,) = payable(to).call{value: amountRITUAL}("");
        require(ok, "AncestraRouter: RITUAL_TRANSFER_FAILED");
    }

    // ── Swap internals ──────────────────────────────────────────────────────

    function _swap(uint256[] memory amounts, address[] memory path, address _to) internal {
        for (uint256 i; i < path.length - 1; i++) {
            (address input, address output) = (path[i], path[i + 1]);
            (address token0,) = AncestraLibrary.sortTokens(input, output);
            uint256 amountOut = amounts[i + 1];
            (uint256 amount0Out, uint256 amount1Out) = input == token0
                ? (uint256(0), amountOut)
                : (amountOut, uint256(0));
            address to = i < path.length - 2
                ? AncestraLibrary.pairFor(factory, output, path[i + 2])
                : _to;
            IAncestraPair(AncestraLibrary.pairFor(factory, input, output))
                .swap(amount0Out, amount1Out, to, new bytes(0));
        }
    }

    // ── Token → Token swaps ─────────────────────────────────────────────────

    function swapExactTokensForTokens(
        uint256 amountIn, uint256 amountOutMin,
        address[] calldata path, address to, uint256 deadline
    ) external override ensure(deadline) returns (uint256[] memory amounts) {
        amounts = AncestraLibrary.getAmountsOut(factory, amountIn, path);
        require(amounts[amounts.length - 1] >= amountOutMin, "AncestraRouter: INSUFFICIENT_OUTPUT_AMOUNT");
        _safeTransferFrom(path[0], msg.sender, AncestraLibrary.pairFor(factory, path[0], path[1]), amounts[0]);
        _swap(amounts, path, to);
    }

    function swapTokensForExactTokens(
        uint256 amountOut, uint256 amountInMax,
        address[] calldata path, address to, uint256 deadline
    ) external override ensure(deadline) returns (uint256[] memory amounts) {
        amounts = AncestraLibrary.getAmountsIn(factory, amountOut, path);
        require(amounts[0] <= amountInMax, "AncestraRouter: EXCESSIVE_INPUT_AMOUNT");
        _safeTransferFrom(path[0], msg.sender, AncestraLibrary.pairFor(factory, path[0], path[1]), amounts[0]);
        _swap(amounts, path, to);
    }

    // ── Native RITUAL → Token swaps ─────────────────────────────────────────

    function swapExactRITUALForTokens(
        uint256 amountOutMin, address[] calldata path, address to, uint256 deadline
    ) external payable override ensure(deadline) returns (uint256[] memory amounts) {
        require(path[0] == WRITUAL, "AncestraRouter: INVALID_PATH");
        amounts = AncestraLibrary.getAmountsOut(factory, msg.value, path);
        require(amounts[amounts.length - 1] >= amountOutMin, "AncestraRouter: INSUFFICIENT_OUTPUT_AMOUNT");
        IWRITUAL(WRITUAL).deposit{value: amounts[0]}();
        assert(IWRITUAL(WRITUAL).transfer(AncestraLibrary.pairFor(factory, path[0], path[1]), amounts[0]));
        _swap(amounts, path, to);
    }

    function swapTokensForExactRITUAL(
        uint256 amountOut, uint256 amountInMax,
        address[] calldata path, address to, uint256 deadline
    ) external override ensure(deadline) returns (uint256[] memory amounts) {
        require(path[path.length - 1] == WRITUAL, "AncestraRouter: INVALID_PATH");
        amounts = AncestraLibrary.getAmountsIn(factory, amountOut, path);
        require(amounts[0] <= amountInMax, "AncestraRouter: EXCESSIVE_INPUT_AMOUNT");
        _safeTransferFrom(path[0], msg.sender, AncestraLibrary.pairFor(factory, path[0], path[1]), amounts[0]);
        _swap(amounts, path, address(this));
        IWRITUAL(WRITUAL).withdraw(amounts[amounts.length - 1]);
        (bool ok,) = payable(to).call{value: amounts[amounts.length - 1]}("");
        require(ok, "AncestraRouter: RITUAL_TRANSFER_FAILED");
    }

    function swapExactTokensForRITUAL(
        uint256 amountIn, uint256 amountOutMin,
        address[] calldata path, address to, uint256 deadline
    ) external override ensure(deadline) returns (uint256[] memory amounts) {
        require(path[path.length - 1] == WRITUAL, "AncestraRouter: INVALID_PATH");
        amounts = AncestraLibrary.getAmountsOut(factory, amountIn, path);
        require(amounts[amounts.length - 1] >= amountOutMin, "AncestraRouter: INSUFFICIENT_OUTPUT_AMOUNT");
        _safeTransferFrom(path[0], msg.sender, AncestraLibrary.pairFor(factory, path[0], path[1]), amounts[0]);
        _swap(amounts, path, address(this));
        IWRITUAL(WRITUAL).withdraw(amounts[amounts.length - 1]);
        (bool ok,) = payable(to).call{value: amounts[amounts.length - 1]}("");
        require(ok, "AncestraRouter: RITUAL_TRANSFER_FAILED");
    }

    function swapRITUALForExactTokens(
        uint256 amountOut, address[] calldata path, address to, uint256 deadline
    ) external payable override ensure(deadline) returns (uint256[] memory amounts) {
        require(path[0] == WRITUAL, "AncestraRouter: INVALID_PATH");
        amounts = AncestraLibrary.getAmountsIn(factory, amountOut, path);
        require(amounts[0] <= msg.value, "AncestraRouter: EXCESSIVE_INPUT_AMOUNT");
        IWRITUAL(WRITUAL).deposit{value: amounts[0]}();
        assert(IWRITUAL(WRITUAL).transfer(AncestraLibrary.pairFor(factory, path[0], path[1]), amounts[0]));
        _swap(amounts, path, to);
        // Refund excess
        if (msg.value > amounts[0]) {
            (bool ok,) = payable(msg.sender).call{value: msg.value - amounts[0]}("");
            require(ok, "AncestraRouter: REFUND_FAILED");
        }
    }

    // ── View helpers ────────────────────────────────────────────────────────

    function quote(uint256 amountA, uint256 reserveA, uint256 reserveB)
        public pure override returns (uint256 amountB)
    {
        return AncestraLibrary.quote(amountA, reserveA, reserveB);
    }

    function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut)
        public pure override returns (uint256 amountOut)
    {
        return AncestraLibrary.getAmountOut(amountIn, reserveIn, reserveOut);
    }

    function getAmountIn(uint256 amountOut, uint256 reserveIn, uint256 reserveOut)
        public pure override returns (uint256 amountIn)
    {
        return AncestraLibrary.getAmountIn(amountOut, reserveIn, reserveOut);
    }

    function getAmountsOut(uint256 amountIn, address[] calldata path)
        public view override returns (uint256[] memory amounts)
    {
        return AncestraLibrary.getAmountsOut(factory, amountIn, path);
    }

    function getAmountsIn(uint256 amountOut, address[] calldata path)
        public view override returns (uint256[] memory amounts)
    {
        return AncestraLibrary.getAmountsIn(factory, amountOut, path);
    }
}
