// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import {WRITUAL} from "../src/WRITUAL.sol";
import {AncestraRouter} from "../src/AncestraRouter.sol";
import {AncestraFactory} from "../src/AncestraFactory.sol";
import {MockERC20} from "../src/MockERC20.sol";
import {AncestraPair} from "../src/AncestraPair.sol";

contract DeployDegenTokens is Script {
    address constant WRITUAL_ADDR = 0x97bA2808dEe4B117145dEC51985ca2C70810E3bA;
    address constant FACTORY_ADDR = 0xB7a842c56Fc6797B6b1BBd50A0f03357bf9A1fB9;
    address payable constant ROUTER_ADDR = payable(0xe38fdE07E91cEBccF22BBB719dDdB434238DF721);

    // 0.003 WRITUAL per pool × 3 = 0.009 total + 0.003 gas buffer = 0.012
    uint256 constant LIQ_WRITUAL = 0.003 ether;

    // Testnet ratios (approximate real market prices, ~$5/RITUAL)
    // PEPE ~$0.000009  → 0.003 RITUAL ≈ 1,666 PEPE
    uint256 constant PEPE_AMT = 1666e18;
    // SHIB ~$0.000009  → 0.003 RITUAL ≈ 1,666 SHIB
    uint256 constant SHIB_AMT = 1666e18;
    // DOGE ~$0.15      → 0.003 RITUAL ≈ 0.1 DOGE  (8 dec)
    uint256 constant DOGE_AMT = 10000000; // 0.1 DOGE at 8 decimals

    function run() external {
        uint256 pk       = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(pk);
        console.log("Deployer:", deployer);
        console.log("Balance:", deployer.balance);
        require(deployer.balance > 0.015 ether, "Need >0.015 RITUAL");

        vm.startBroadcast(pk);

        // 1. Deploy mock tokens
        MockERC20 pepe = new MockERC20("Pepe",      "PEPE", 18, 1_000_000_000_000);
        MockERC20 shib = new MockERC20("Shiba Inu", "SHIB", 18, 1_000_000_000_000);
        MockERC20 doge = new MockERC20("Dogecoin",  "DOGE",  8,   100_000_000_000);
        console.log("PEPE:", address(pepe));
        console.log("SHIB:", address(shib));
        console.log("DOGE:", address(doge));

        // 2. Wrap RITUAL
        uint256 totalWrap = LIQ_WRITUAL * 3 + 0.002 ether;
        WRITUAL(payable(WRITUAL_ADDR)).deposit{value: totalWrap}();

        // 3. Approve
        WRITUAL(payable(WRITUAL_ADDR)).approve(ROUTER_ADDR, type(uint256).max);
        pepe.approve(ROUTER_ADDR, type(uint256).max);
        shib.approve(ROUTER_ADDR, type(uint256).max);
        doge.approve(ROUTER_ADDR, type(uint256).max);

        uint256 deadline = block.timestamp + 3_600_000;

        // 4. WRITUAL/PEPE
        AncestraRouter(ROUTER_ADDR).addLiquidity(
            WRITUAL_ADDR, address(pepe), LIQ_WRITUAL, PEPE_AMT, 0, 0, deployer, deadline
        );
        address pairPEPE = AncestraFactory(FACTORY_ADDR).getPair(WRITUAL_ADDR, address(pepe));
        console.log("WRITUAL/PEPE pair:", pairPEPE);
        console.log("PEPE is token0:", AncestraPair(pairPEPE).token0() == address(pepe));

        // 5. WRITUAL/SHIB
        AncestraRouter(ROUTER_ADDR).addLiquidity(
            WRITUAL_ADDR, address(shib), LIQ_WRITUAL, SHIB_AMT, 0, 0, deployer, deadline
        );
        address pairSHIB = AncestraFactory(FACTORY_ADDR).getPair(WRITUAL_ADDR, address(shib));
        console.log("WRITUAL/SHIB pair:", pairSHIB);
        console.log("SHIB is token0:", AncestraPair(pairSHIB).token0() == address(shib));

        // 6. WRITUAL/DOGE
        AncestraRouter(ROUTER_ADDR).addLiquidity(
            WRITUAL_ADDR, address(doge), LIQ_WRITUAL, DOGE_AMT, 0, 0, deployer, deadline
        );
        address pairDOGE = AncestraFactory(FACTORY_ADDR).getPair(WRITUAL_ADDR, address(doge));
        console.log("WRITUAL/DOGE pair:", pairDOGE);
        console.log("DOGE is token0:", AncestraPair(pairDOGE).token0() == address(doge));

        vm.stopBroadcast();

        console.log("=== DEGEN TOKENS DEPLOYED ===");
        console.log("PEPE:             ", address(pepe));
        console.log("SHIB:             ", address(shib));
        console.log("DOGE:             ", address(doge));
        console.log("Pair WRITUAL/PEPE:", pairPEPE);
        console.log("Pair WRITUAL/SHIB:", pairSHIB);
        console.log("Pair WRITUAL/DOGE:", pairDOGE);
        console.log("=============================");
    }
}
