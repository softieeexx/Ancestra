// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// src/interfaces/IAncestraFactory.sol

interface IAncestraFactory {
    event PairCreated(address indexed token0, address indexed token1, address pair, uint256 totalPairs);

    function feeTo() external view returns (address);
    function feeToSetter() external view returns (address);
    function getPair(address tokenA, address tokenB) external view returns (address pair);
    function allPairs(uint256) external view returns (address pair);
    function allPairsLength() external view returns (uint256);
    function createPair(address tokenA, address tokenB) external returns (address pair);
    function setFeeTo(address) external;
    function setFeeToSetter(address) external;
}

// src/interfaces/IAncestraPair.sol

interface IAncestraPair {
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Mint(address indexed sender, uint256 amount0, uint256 amount1);
    event Burn(address indexed sender, uint256 amount0, uint256 amount1, address indexed to);
    event Swap(
        address indexed sender,
        uint256 amount0In,
        uint256 amount1In,
        uint256 amount0Out,
        uint256 amount1Out,
        address indexed to
    );
    event Sync(uint112 reserve0, uint112 reserve1);

    function name() external pure returns (string memory);
    function symbol() external pure returns (string memory);
    function decimals() external pure returns (uint8);
    function totalSupply() external view returns (uint256);
    function balanceOf(address owner) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 value) external returns (bool);
    function transfer(address to, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);

    function DOMAIN_SEPARATOR() external view returns (bytes32);
    function PERMIT_TYPEHASH() external pure returns (bytes32);
    function nonces(address owner) external view returns (uint256);
    function permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s) external;

    function MINIMUM_LIQUIDITY() external pure returns (uint256);
    function factory() external view returns (address);
    function token0() external view returns (address);
    function token1() external view returns (address);
    function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast);
    function price0CumulativeLast() external view returns (uint256);
    function price1CumulativeLast() external view returns (uint256);
    function kLast() external view returns (uint256);

    function mint(address to) external returns (uint256 liquidity);
    function burn(address to) external returns (uint256 amount0, uint256 amount1);
    function swap(uint256 amount0Out, uint256 amount1Out, address to, bytes calldata data) external;
    function skim(address to) external;
    function sync() external;
    function initialize(address, address) external;
}

// src/interfaces/IAncestraRouter.sol

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

// src/interfaces/IERC20.sol

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

// src/interfaces/IWRITUAL.sol

interface IWRITUAL {
    function deposit() external payable;
    function transfer(address to, uint256 value) external returns (bool);
    function withdraw(uint256) external;
    function balanceOf(address) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

// src/AncestraLibrary.sol

library AncestraLibrary {
    // Returns sorted token addresses for consistent pair identification
    function sortTokens(address tokenA, address tokenB)
        internal pure returns (address token0, address token1)
    {
        require(tokenA != tokenB, "AncestraLibrary: IDENTICAL_ADDRESSES");
        (token0, token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        require(token0 != address(0), "AncestraLibrary: ZERO_ADDRESS");
    }

    // Calculates the CREATE2 address for a pair without making any external calls
    function pairFor(address factory, address tokenA, address tokenB)
        internal pure returns (address pair)
    {
        (address token0, address token1) = sortTokens(tokenA, tokenB);
        pair = address(uint160(uint256(keccak256(abi.encodePacked(
            hex"ff",
            factory,
            keccak256(abi.encodePacked(token0, token1)),
            // Init code hash of AncestraPair
            hex"1b6504a566ffc6db8eb9b402dc226543bda41abf57fe6c705df0650165663c47"
        )))));
    }

    // Fetches and sorts the reserves for a pair
    function getReserves(address factory, address tokenA, address tokenB)
        internal view returns (uint256 reserveA, uint256 reserveB)
    {
        (address token0,) = sortTokens(tokenA, tokenB);
        (uint256 reserve0, uint256 reserve1,) = IAncestraPair(pairFor(factory, tokenA, tokenB)).getReserves();
        (reserveA, reserveB) = tokenA == token0 ? (reserve0, reserve1) : (reserve1, reserve0);
    }

    // Given some amount of an asset and pair reserves, returns an equivalent amount of the other asset
    function quote(uint256 amountA, uint256 reserveA, uint256 reserveB)
        internal pure returns (uint256 amountB)
    {
        require(amountA > 0, "AncestraLibrary: INSUFFICIENT_AMOUNT");
        require(reserveA > 0 && reserveB > 0, "AncestraLibrary: INSUFFICIENT_LIQUIDITY");
        amountB = amountA * reserveB / reserveA;
    }

    // Given an input amount, returns the maximum output amount (0.3% fee)
    function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut)
        internal pure returns (uint256 amountOut)
    {
        require(amountIn > 0, "AncestraLibrary: INSUFFICIENT_INPUT_AMOUNT");
        require(reserveIn > 0 && reserveOut > 0, "AncestraLibrary: INSUFFICIENT_LIQUIDITY");
        uint256 amountInWithFee = amountIn * 997;
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = reserveIn * 1000 + amountInWithFee;
        amountOut = numerator / denominator;
    }

    // Given an output amount, returns the required input amount (0.3% fee)
    function getAmountIn(uint256 amountOut, uint256 reserveIn, uint256 reserveOut)
        internal pure returns (uint256 amountIn)
    {
        require(amountOut > 0, "AncestraLibrary: INSUFFICIENT_OUTPUT_AMOUNT");
        require(reserveIn > 0 && reserveOut > 0, "AncestraLibrary: INSUFFICIENT_LIQUIDITY");
        uint256 numerator = reserveIn * amountOut * 1000;
        uint256 denominator = (reserveOut - amountOut) * 997;
        amountIn = numerator / denominator + 1;
    }

    // Performs chained getAmountOut calculations for a multi-hop swap path
    function getAmountsOut(address factory, uint256 amountIn, address[] memory path)
        internal view returns (uint256[] memory amounts)
    {
        require(path.length >= 2, "AncestraLibrary: INVALID_PATH");
        amounts = new uint256[](path.length);
        amounts[0] = amountIn;
        for (uint256 i; i < path.length - 1; i++) {
            (uint256 reserveIn, uint256 reserveOut) = getReserves(factory, path[i], path[i + 1]);
            amounts[i + 1] = getAmountOut(amounts[i], reserveIn, reserveOut);
        }
    }

    // Performs chained getAmountIn calculations for a multi-hop swap path
    function getAmountsIn(address factory, uint256 amountOut, address[] memory path)
        internal view returns (uint256[] memory amounts)
    {
        require(path.length >= 2, "AncestraLibrary: INVALID_PATH");
        amounts = new uint256[](path.length);
        amounts[amounts.length - 1] = amountOut;
        for (uint256 i = path.length - 1; i > 0; i--) {
            (uint256 reserveIn, uint256 reserveOut) = getReserves(factory, path[i - 1], path[i]);
            amounts[i - 1] = getAmountIn(amounts[i], reserveIn, reserveOut);
        }
    }
}

// src/AncestraRouter.sol

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
