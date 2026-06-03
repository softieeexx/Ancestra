// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {AncestraPool} from "../src/AncestraPool.sol";
import {MockERC20} from "../src/MockERC20.sol";

contract DeployAncestra {
    // Deployed addresses (set during run)
    MockERC20 public ritual;
    MockERC20 public usdc;
    MockERC20 public weth;
    MockERC20 public alt;

    AncestraPool public poolStable;   // RITUAL/USDC
    AncestraPool public poolCrypto;   // RITUAL/WETH
    AncestraPool public poolAlt;      // RITUAL/ALT

    function run() external {
        // Deploy tokens
        ritual = new MockERC20("Ritual Testnet", "RITUAL", 18, 1_000_000);
        usdc = new MockERC20("USD Coin", "USDC", 6, 10_000_000);
        weth = new MockERC20("Wrapped Ether", "WETH", 18, 100_000);
        alt = new MockERC20("Alt Token", "ALT", 18, 10_000_000);

        // Deploy pools
        poolStable = new AncestraPool(
            address(ritual), address(usdc),
            "Amina", "Stable Mode — RITUAL / USDC"
        );
        poolCrypto = new AncestraPool(
            address(ritual), address(weth),
            "Nefertiti", "Crypto Mode — RITUAL / WETH"
        );
        poolAlt = new AncestraPool(
            address(ritual), address(alt),
            "Yaa Asantewa", "Alt Mode — RITUAL / ALT"
        );

        // Mint liquidity to deployer
        ritual.mint(address(this), 100_000 ether);
        usdc.mint(address(this), 1_000_000 * 10**6);
        weth.mint(address(this), 10_000 ether);
        alt.mint(address(this), 10_000_000 ether);

        // Approve pools
        ritual.approve(address(poolStable), 100_000 ether);
        usdc.approve(address(poolStable), 1_000_000 * 10**6);
        ritual.approve(address(poolCrypto), 100_000 ether);
        weth.approve(address(poolCrypto), 10_000 ether);
        ritual.approve(address(poolAlt), 100_000 ether);
        alt.approve(address(poolAlt), 10_000_000 ether);

        // Initialize pools with liquidity
        poolStable.initialize(100_000 ether, 1_000_000 * 10**6);    // 1 RITUAL = 10 USDC
        poolCrypto.initialize(100_000 ether, 10_000 ether);          // 1 RITUAL = 0.1 WETH
        poolAlt.initialize(100_000 ether, 10_000_000 ether);         // 1 RITUAL = 100 ALT

        // Approve Ritual token for pool
        ritual.approve(address(poolStable), type(uint256).max);
        ritual.approve(address(poolCrypto), type(uint256).max);
        ritual.approve(address(poolAlt), type(uint256).max);
    }
}
