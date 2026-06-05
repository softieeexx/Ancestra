// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import {WRITUAL} from "../src/WRITUAL.sol";
import {AncestraRouter} from "../src/AncestraRouter.sol";
import {AncestraFactory} from "../src/AncestraFactory.sol";
import {MockERC20} from "../src/MockERC20.sol";
import {AncestraPair} from "../src/AncestraPair.sol";

contract DeployUSDT is Script {
    // Existing deployed contracts
    address constant WRITUAL_ADDR  = 0x97bA2808dEe4B117145dEC51985ca2C70810E3bA;
    address constant FACTORY_ADDR  = 0xB7a842c56Fc6797B6b1BBd50A0f03357bf9A1fB9;
    address payable constant ROUTER_ADDR = payable(0xe38fdE07E91cEBccF22BBB719dDdB434238DF721);

    // Bootstrap: 0.01 WRITUAL / 50 USDT → $5 per RITUAL (fits low balance)
    uint256 constant WRITUAL_AMT = 0.01 ether;
    uint256 constant USDT_AMT    = 50e6; // 50 USDT (6 decimals)

    function run() external {
        uint256 pk       = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(pk);

        console.log("Deployer:", deployer);
        console.log("Balance (wei):", deployer.balance);
        require(deployer.balance > 0.02 ether, "Need >0.02 RITUAL for gas + liquidity");

        vm.startBroadcast(pk);

        // 1. Deploy USDT mock
        MockERC20 usdt = new MockERC20("Tether USD", "USDT", 6, 10_000_000);
        console.log("USDT deployed at:", address(usdt));

        // 2. Wrap RITUAL → WRITUAL
        WRITUAL(payable(WRITUAL_ADDR)).deposit{value: WRITUAL_AMT + 0.002 ether}();

        // 3. Approve router
        WRITUAL(payable(WRITUAL_ADDR)).approve(ROUTER_ADDR, type(uint256).max);
        usdt.approve(ROUTER_ADDR, type(uint256).max);

        // 4. Add liquidity — creates the pair
        uint256 deadline = block.timestamp + 3_600_000;
        (uint256 aW, uint256 aU, uint256 lp) = AncestraRouter(ROUTER_ADDR).addLiquidity(
            WRITUAL_ADDR, address(usdt),
            WRITUAL_AMT, USDT_AMT,
            0, 0,
            deployer, deadline
        );

        address pair = AncestraFactory(FACTORY_ADDR).getPair(WRITUAL_ADDR, address(usdt));
        console.log("WRITUAL/USDT pair:", pair);
        console.log("WRITUAL added (wei):", aW);
        console.log("USDT added (units):", aU);
        console.log("LP minted (wei):", lp);

        // 5. Verify
        (uint112 r0, uint112 r1,) = AncestraPair(pair).getReserves();
        require(r0 > 0 && r1 > 0, "Zero reserves after liquidity add");

        // 6. Which token is token0?
        address t0 = AncestraPair(pair).token0();
        console.log("token0:", t0);
        console.log("WRITUAL is token0:", t0 == WRITUAL_ADDR);

        vm.stopBroadcast();

        console.log("=== USDT DEPLOYMENT COMPLETE ===");
        console.log("USDT:             ", address(usdt));
        console.log("Pair WRITUAL/USDT:", pair);
        console.log("================================");
    }
}
