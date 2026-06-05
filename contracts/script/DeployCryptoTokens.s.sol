// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import {WRITUAL} from "../src/WRITUAL.sol";
import {AncestraRouter} from "../src/AncestraRouter.sol";
import {AncestraFactory} from "../src/AncestraFactory.sol";
import {MockERC20} from "../src/MockERC20.sol";
import {AncestraPair} from "../src/AncestraPair.sol";

contract DeployCryptoTokens is Script {
    address constant WRITUAL_ADDR = 0x97bA2808dEe4B117145dEC51985ca2C70810E3bA;
    address constant FACTORY_ADDR = 0xB7a842c56Fc6797B6b1BBd50A0f03357bf9A1fB9;
    address payable constant ROUTER_ADDR = payable(0xe38fdE07E91cEBccF22BBB719dDdB434238DF721);

    // 0.012 WRITUAL total across 3 pools — conservative given ~0.054 balance
    uint256 constant LIQ_WRITUAL = 0.004 ether; // per pool

    // Ratios: rough market prices relative to RITUAL ~$5
    // MON (Monad) ~$2  →  1 RITUAL = 0.4 MON  →  0.004 WRITUAL : 0.0016 MON
    uint256 constant MON_AMT  = 0.0016 ether;   // 18 decimals

    // SOL ~$150  →  1 RITUAL = 0.033 SOL  →  0.004 WRITUAL : 0.000133 SOL
    uint256 constant SOL_AMT  = 133000000;       // 9 decimals = 0.000133 SOL

    // BTC ~$100k →  1 RITUAL = 0.00005 BTC →  0.004 WRITUAL : 0.0000002 BTC
    uint256 constant BTC_AMT  = 20000;           // 8 decimals = 0.0002 BTC (generous for readability)

    function run() external {
        uint256 pk       = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(pk);
        console.log("Deployer:", deployer);
        console.log("Balance (wei):", deployer.balance);
        require(deployer.balance > 0.03 ether, "Need >0.03 RITUAL");

        vm.startBroadcast(pk);

        // 1. Deploy mock tokens
        MockERC20 mon = new MockERC20("Monad",   "MON", 18, 10_000_000);
        MockERC20 sol = new MockERC20("Solana",  "SOL",  9, 10_000_000);
        MockERC20 btc = new MockERC20("Bitcoin", "BTC",  8,  1_000_000);
        console.log("MON:", address(mon));
        console.log("SOL:", address(sol));
        console.log("BTC:", address(btc));

        // 2. Wrap RITUAL
        uint256 totalWrap = LIQ_WRITUAL * 3 + 0.003 ether; // small gas buffer
        WRITUAL(payable(WRITUAL_ADDR)).deposit{value: totalWrap}();

        // 3. Approve router
        WRITUAL(payable(WRITUAL_ADDR)).approve(ROUTER_ADDR, type(uint256).max);
        mon.approve(ROUTER_ADDR, type(uint256).max);
        sol.approve(ROUTER_ADDR, type(uint256).max);
        btc.approve(ROUTER_ADDR, type(uint256).max);

        uint256 deadline = block.timestamp + 3_600_000;

        // 4. WRITUAL/MON
        AncestraRouter(ROUTER_ADDR).addLiquidity(
            WRITUAL_ADDR, address(mon),
            LIQ_WRITUAL, MON_AMT, 0, 0, deployer, deadline
        );
        address pairMON = AncestraFactory(FACTORY_ADDR).getPair(WRITUAL_ADDR, address(mon));
        console.log("WRITUAL/MON pair:", pairMON);
        console.log("MON token0:", AncestraPair(pairMON).token0() == address(mon));

        // 5. WRITUAL/SOL
        AncestraRouter(ROUTER_ADDR).addLiquidity(
            WRITUAL_ADDR, address(sol),
            LIQ_WRITUAL, SOL_AMT, 0, 0, deployer, deadline
        );
        address pairSOL = AncestraFactory(FACTORY_ADDR).getPair(WRITUAL_ADDR, address(sol));
        console.log("WRITUAL/SOL pair:", pairSOL);
        console.log("SOL token0:", AncestraPair(pairSOL).token0() == address(sol));

        // 6. WRITUAL/BTC
        AncestraRouter(ROUTER_ADDR).addLiquidity(
            WRITUAL_ADDR, address(btc),
            LIQ_WRITUAL, BTC_AMT, 0, 0, deployer, deadline
        );
        address pairBTC = AncestraFactory(FACTORY_ADDR).getPair(WRITUAL_ADDR, address(btc));
        console.log("WRITUAL/BTC pair:", pairBTC);
        console.log("BTC token0:", AncestraPair(pairBTC).token0() == address(btc));

        vm.stopBroadcast();

        console.log("=== CRYPTO TOKENS DEPLOYED ===");
        console.log("MON:             ", address(mon));
        console.log("SOL:             ", address(sol));
        console.log("BTC:             ", address(btc));
        console.log("Pair WRITUAL/MON:", pairMON);
        console.log("Pair WRITUAL/SOL:", pairSOL);
        console.log("Pair WRITUAL/BTC:", pairBTC);
        console.log("==============================");
    }
}
