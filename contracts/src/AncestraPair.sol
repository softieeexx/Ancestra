// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IAncestraPair} from "./interfaces/IAncestraPair.sol";
import {IAncestraFactory} from "./interfaces/IAncestraFactory.sol";
import {IERC20} from "./interfaces/IERC20.sol";

/// @title AncestraPair — LP token + AMM pair with TWAP oracle support
contract AncestraPair is IAncestraPair {
    string public constant override name = "Ancestra LP";
    string public constant override symbol = "AMLP";
    uint8 public constant override decimals = 18;
    uint256 public override totalSupply;
    mapping(address => uint256) public override balanceOf;
    mapping(address => mapping(address => uint256)) public override allowance;

    bytes32 public override DOMAIN_SEPARATOR;
    bytes32 public constant override PERMIT_TYPEHASH =
        keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)");
    mapping(address => uint256) public override nonces;

    uint256 public constant override MINIMUM_LIQUIDITY = 1000;
    bytes4 private constant SELECTOR = bytes4(keccak256("transfer(address,uint256)"));

    address public override factory;
    address public override token0;
    address public override token1;

    uint112 private _reserve0;
    uint112 private _reserve1;
    uint32 private _blockTimestampLast;

    uint256 public override price0CumulativeLast;
    uint256 public override price1CumulativeLast;
    uint256 public override kLast;

    uint256 private _unlocked = 1;
    modifier lock() {
        require(_unlocked == 1, "Ancestra: LOCKED");
        _unlocked = 0;
        _;
        _unlocked = 1;
    }

    constructor() {
        factory = msg.sender;
        uint256 chainId;
        assembly { chainId := chainid() }
        DOMAIN_SEPARATOR = keccak256(abi.encode(
            keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
            keccak256(bytes(name)),
            keccak256(bytes("1")),
            chainId,
            address(this)
        ));
    }

    function initialize(address _token0, address _token1) external override {
        require(msg.sender == factory, "Ancestra: FORBIDDEN");
        token0 = _token0;
        token1 = _token1;
    }

    function getReserves() public view override returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast) {
        reserve0 = _reserve0;
        reserve1 = _reserve1;
        blockTimestampLast = _blockTimestampLast;
    }

    function _safeTransfer(address token, address to, uint256 value) private {
        (bool success, bytes memory data) = token.call(abi.encodeWithSelector(SELECTOR, to, value));
        require(success && (data.length == 0 || abi.decode(data, (bool))), "Ancestra: TRANSFER_FAILED");
    }

    function _update(uint256 balance0, uint256 balance1, uint112 reserve0, uint112 reserve1) private {
        require(balance0 <= type(uint112).max && balance1 <= type(uint112).max, "Ancestra: OVERFLOW");
        uint32 blockTimestamp = uint32(block.timestamp % 2**32);
        uint32 timeElapsed;
        unchecked { timeElapsed = blockTimestamp - _blockTimestampLast; }
        // TWAP price accumulators — only update when reserves already populated
        // Defer 0→nonzero cold SSTORE cost to subsequent updates (not first swap)
        if (timeElapsed > 0 && reserve0 != 0 && reserve1 != 0 && price0CumulativeLast != 0) {
            unchecked {
                price0CumulativeLast += (uint256(uint224(reserve1) << 112) / reserve0) * timeElapsed;
                price1CumulativeLast += (uint256(uint224(reserve0) << 112) / reserve1) * timeElapsed;
            }
        } else if (timeElapsed > 0 && reserve0 != 0 && reserve1 != 0 && price0CumulativeLast == 0) {
            // Initialize accumulators on first swap (store sentinel 1 to make future updates warm)
            price0CumulativeLast = 1;
            price1CumulativeLast = 1;
        }
        _reserve0 = uint112(balance0);
        _reserve1 = uint112(balance1);
        _blockTimestampLast = blockTimestamp;
        emit Sync(_reserve0, _reserve1);
    }

    function _mintFee(uint112 reserve0, uint112 reserve1) private returns (bool feeOn) {
        address feeTo = IAncestraFactory(factory).feeTo();
        feeOn = feeTo != address(0);
        uint256 _kLast = kLast;
        if (feeOn) {
            if (_kLast != 0) {
                uint256 rootK = _sqrt(uint256(reserve0) * uint256(reserve1));
                uint256 rootKLast = _sqrt(_kLast);
                if (rootK > rootKLast) {
                    uint256 numerator = totalSupply * (rootK - rootKLast);
                    uint256 denominator = rootK * 5 + rootKLast;
                    uint256 liquidity = numerator / denominator;
                    if (liquidity > 0) _mint(feeTo, liquidity);
                }
            }
        } else if (_kLast != 0) {
            kLast = 0;
        }
    }

    function mint(address to) external override lock returns (uint256 liquidity) {
        (uint112 reserve0, uint112 reserve1,) = getReserves();
        uint256 balance0 = IERC20(token0).balanceOf(address(this));
        uint256 balance1 = IERC20(token1).balanceOf(address(this));
        uint256 amount0 = balance0 - reserve0;
        uint256 amount1 = balance1 - reserve1;

        bool feeOn = _mintFee(reserve0, reserve1);
        uint256 _totalSupply = totalSupply;
        if (_totalSupply == 0) {
            liquidity = _sqrt(amount0 * amount1) - MINIMUM_LIQUIDITY;
            _mint(address(0xdead), MINIMUM_LIQUIDITY);
        } else {
            liquidity = _min(amount0 * _totalSupply / reserve0, amount1 * _totalSupply / reserve1);
        }
        require(liquidity > 0, "Ancestra: INSUFFICIENT_LIQUIDITY_MINTED");
        _mint(to, liquidity);

        _update(balance0, balance1, reserve0, reserve1);
        if (feeOn) kLast = uint256(_reserve0) * uint256(_reserve1);
        emit Mint(msg.sender, amount0, amount1);
    }

    function burn(address to) external override lock returns (uint256 amount0, uint256 amount1) {
        (uint112 reserve0, uint112 reserve1,) = getReserves();
        address _token0 = token0;
        address _token1 = token1;
        uint256 balance0 = IERC20(_token0).balanceOf(address(this));
        uint256 balance1 = IERC20(_token1).balanceOf(address(this));
        uint256 liquidity = balanceOf[address(this)];

        bool feeOn = _mintFee(reserve0, reserve1);
        uint256 _totalSupply = totalSupply;
        amount0 = liquidity * balance0 / _totalSupply;
        amount1 = liquidity * balance1 / _totalSupply;
        require(amount0 > 0 && amount1 > 0, "Ancestra: INSUFFICIENT_LIQUIDITY_BURNED");

        _burn(address(this), liquidity);
        _safeTransfer(_token0, to, amount0);
        _safeTransfer(_token1, to, amount1);
        balance0 = IERC20(_token0).balanceOf(address(this));
        balance1 = IERC20(_token1).balanceOf(address(this));

        _update(balance0, balance1, reserve0, reserve1);
        if (feeOn) kLast = uint256(_reserve0) * uint256(_reserve1);
        emit Burn(msg.sender, amount0, amount1, to);
    }

    function swap(uint256 amount0Out, uint256 amount1Out, address to, bytes calldata data) external override lock {
        require(amount0Out > 0 || amount1Out > 0, "Ancestra: INSUFFICIENT_OUTPUT_AMOUNT");
        (uint112 reserve0, uint112 reserve1,) = getReserves();
        require(amount0Out < reserve0 && amount1Out < reserve1, "Ancestra: INSUFFICIENT_LIQUIDITY");

        uint256 balance0;
        uint256 balance1;
        {
            address _token0 = token0;
            address _token1 = token1;
            require(to != _token0 && to != _token1, "Ancestra: INVALID_TO");
            if (amount0Out > 0) _safeTransfer(_token0, to, amount0Out);
            if (amount1Out > 0) _safeTransfer(_token1, to, amount1Out);
            if (data.length > 0) {
                // Flash swap callback — call to(data) if needed
            }
            balance0 = IERC20(_token0).balanceOf(address(this));
            balance1 = IERC20(_token1).balanceOf(address(this));
        }
        uint256 amount0In = balance0 > reserve0 - amount0Out ? balance0 - (reserve0 - amount0Out) : 0;
        uint256 amount1In = balance1 > reserve1 - amount1Out ? balance1 - (reserve1 - amount1Out) : 0;
        require(amount0In > 0 || amount1In > 0, "Ancestra: INSUFFICIENT_INPUT_AMOUNT");
        {
            // k invariant check with 0.3% fee baked in
            uint256 balance0Adjusted = balance0 * 1000 - amount0In * 3;
            uint256 balance1Adjusted = balance1 * 1000 - amount1In * 3;
            require(
                balance0Adjusted * balance1Adjusted >= uint256(reserve0) * uint256(reserve1) * 1000**2,
                "Ancestra: K"
            );
        }
        _update(balance0, balance1, reserve0, reserve1);
        emit Swap(msg.sender, amount0In, amount1In, amount0Out, amount1Out, to);
    }

    function skim(address to) external override lock {
        address _token0 = token0;
        address _token1 = token1;
        _safeTransfer(_token0, to, IERC20(_token0).balanceOf(address(this)) - _reserve0);
        _safeTransfer(_token1, to, IERC20(_token1).balanceOf(address(this)) - _reserve1);
    }

    function sync() external override lock {
        _update(
            IERC20(token0).balanceOf(address(this)),
            IERC20(token1).balanceOf(address(this)),
            _reserve0,
            _reserve1
        );
    }

    // ── ERC20 ──────────────────────────────────────────────────────────────

    function approve(address spender, uint256 value) external override returns (bool) {
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

    function transfer(address to, uint256 value) external override returns (bool) {
        _transfer(msg.sender, to, value);
        return true;
    }

    function transferFrom(address from, address to, uint256 value) external override returns (bool) {
        if (allowance[from][msg.sender] != type(uint256).max) {
            allowance[from][msg.sender] -= value;
        }
        _transfer(from, to, value);
        return true;
    }

    function permit(
        address owner, address spender, uint256 value,
        uint256 deadline, uint8 v, bytes32 r, bytes32 s
    ) external override {
        require(deadline >= block.timestamp, "Ancestra: EXPIRED");
        bytes32 digest = keccak256(abi.encodePacked(
            "\x19\x01",
            DOMAIN_SEPARATOR,
            keccak256(abi.encode(PERMIT_TYPEHASH, owner, spender, value, nonces[owner]++, deadline))
        ));
        address recoveredAddress = ecrecover(digest, v, r, s);
        require(recoveredAddress != address(0) && recoveredAddress == owner, "Ancestra: INVALID_SIGNATURE");
        allowance[owner][spender] = value;
        emit Approval(owner, spender, value);
    }

    function _mint(address to, uint256 value) internal {
        totalSupply += value;
        balanceOf[to] += value;
        emit Transfer(address(0), to, value);
    }

    function _burn(address from, uint256 value) internal {
        balanceOf[from] -= value;
        totalSupply -= value;
        emit Transfer(from, address(0), value);
    }

    function _transfer(address from, address to, uint256 value) private {
        balanceOf[from] -= value;
        balanceOf[to] += value;
        emit Transfer(from, to, value);
    }

    function _sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }

    function _min(uint256 x, uint256 y) internal pure returns (uint256) {
        return x < y ? x : y;
    }
}
