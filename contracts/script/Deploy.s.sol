// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {AncestraPool} from "../src/AncestraPool.sol";
import {MockERC20} from "../src/MockERC20.sol";

contract DeployAncestra is Script {
    MockERC20 public ritual;
    MockERC20 public usdc;
    MockERC20 public weth;
    MockERC20 public alt;

    AncestraPool public poolStable;
    AncestraPool public poolCrypto;
    AncestraPool public poolAlt;

    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerKey);

        // Deploy tokens
        ritual = new MockERC20("Ritual Testnet", "RITUAL", 18, 1_000_000);
        usdc = new MockERC20("USD Coin", "USDC", 6, 10_000_000);
        weth = new MockERC20("Wrapped Ether", "WETH", 18, 100_000);
        alt = new MockERC20("Alt Token", "ALT", 18, 10_000_000);

        // Deploy pools
        poolStable = new AncestraPool(
            address(ritual), address(usdc),
            "Amina", "Stable Mode - RITUAL / USDC"
        );
        poolCrypto = new AncestraPool(
            address(ritual), address(weth),
            "Nefertiti", "Crypto Mode - RITUAL / WETH"
        );
        poolAlt = new AncestraPool(
            address(ritual), address(alt),
            "Yaa Asantewa", "Alt Mode - RITUAL / ALT"
        );

        // Mint liquidity to deployer
        ritual.mint(msg.sender, 100_000 ether);
        usdc.mint(msg.sender, 1_000_000 * 10**6);
        weth.mint(msg.sender, 10_000 ether);
        alt.mint(msg.sender, 10_000_000 ether);

        vm.stopBroadcast();

        // Approve and initialize (via deployer)
        vm.startBroadcast(deployerKey);

        ritual.approve(address(poolStable), 100_000 ether);
        usdc.approve(address(poolStable), 1_000_000 * 10**6);
        ritual.approve(address(poolCrypto), 100_000 ether);
        weth.approve(address(poolCrypto), 10_000 ether);
        ritual.approve(address(poolAlt), 100_000 ether);
        alt.approve(address(poolAlt), 10_000_000 ether);

        poolStable.initialize(100_000 ether, 1_000_000 * 10**6);
        poolCrypto.initialize(100_000 ether, 10_000 ether);
        poolAlt.initialize(100_000 ether, 10_000_000 ether);

        ritual.approve(address(poolStable), type(uint256).max);
        ritual.approve(address(poolCrypto), type(uint256).max);
        ritual.approve(address(poolAlt), type(uint256).max);

        vm.stopBroadcast();
    }
}
