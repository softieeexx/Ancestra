// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import {WRITUAL} from "../src/WRITUAL.sol";
import {AncestraFactory} from "../src/AncestraFactory.sol";
import {AncestraRouter} from "../src/AncestraRouter.sol";
import {AncestraPair} from "../src/AncestraPair.sol";
import {MockERC20} from "../src/MockERC20.sol";
import {IAncestraFactory} from "../src/interfaces/IAncestraFactory.sol";
import {IAncestraPair} from "../src/interfaces/IAncestraPair.sol";
import {IAncestraRouter} from "../src/interfaces/IAncestraRouter.sol";
import {IERC20} from "../src/interfaces/IERC20.sol";

contract DeployAncestra is Script {
    // Deployer address derived from PRIVATE_KEY
    address deployer;

    // Deployed contract addresses
    WRITUAL writual;
    AncestraFactory factory;
    AncestraRouter router;
    MockERC20 usdc;
    MockERC20 weth;
    MockERC20 dai;

    // Pair addresses
    address pairWRITUAL_USDC;
    address pairWRITUAL_WETH;
    address pairWRITUAL_DAI;

    // Bootstrap liquidity amounts (small — deployer has ~0.25 RITUAL)
    // WRITUAL is 18 decimals. USDC is 6. WETH is 18. DAI is 18.
    uint256 constant WRITUAL_USDC_WRITUAL = 0.05 ether;     // 0.05 WRITUAL
    uint256 constant WRITUAL_USDC_USDC    = 250e6;          // 250 USDC → $5/RITUAL

    uint256 constant WRITUAL_WETH_WRITUAL = 0.05 ether;     // 0.05 WRITUAL
    uint256 constant WRITUAL_WETH_WETH    = 0.0001 ether;   // 0.0001 WETH → ~500 RITUAL/ETH

    uint256 constant WRITUAL_DAI_WRITUAL  = 0.05 ether;     // 0.05 WRITUAL
    uint256 constant WRITUAL_DAI_DAI      = 250 ether;      // 250 DAI

    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        deployer = vm.addr(pk);

        console.log("=== ANCESTRA DEX DEPLOYMENT ===");
        console.log("Deployer:", deployer);
        console.log("Chain ID:", block.chainid);
        console.log("Balance:", deployer.balance);

        require(deployer.balance > 0.1 ether, "Insufficient RITUAL for gas");

        vm.startBroadcast(pk);

        // ── 1. Deploy WRITUAL ────────────────────────────────────────────────
        writual = new WRITUAL();
        console.log("WRITUAL deployed at:", address(writual));

        // ── 2. Deploy Factory ────────────────────────────────────────────────
        factory = new AncestraFactory(deployer);
        console.log("Factory deployed at:", address(factory));

        // ── 3. Deploy Router ─────────────────────────────────────────────────
        router = new AncestraRouter(address(factory), address(writual));
        console.log("Router deployed at:", address(router));

        // ── 4. Deploy mock tokens ────────────────────────────────────────────
        usdc = new MockERC20("USD Coin", "USDC", 6, 10_000_000);
        console.log("USDC deployed at:", address(usdc));

        weth = new MockERC20("Wrapped Ether", "WETH", 18, 10_000);
        console.log("WETH deployed at:", address(weth));

        dai = new MockERC20("Dai Stablecoin", "DAI", 18, 10_000_000);
        console.log("DAI deployed at:", address(dai));

        // ── 5. Wrap RITUAL for liquidity ─────────────────────────────────────
        // Reserve 0.05 RITUAL for gas; wrap the rest
        uint256 totalWRITUALNeeded = WRITUAL_USDC_WRITUAL + WRITUAL_WETH_WRITUAL + WRITUAL_DAI_WRITUAL + 0.02 ether;
        writual.deposit{value: totalWRITUALNeeded}();
        console.log("Wrapped RITUAL into WRITUAL (wei):", totalWRITUALNeeded);

        // ── 6. Approve router for all tokens ────────────────────────────────
        writual.approve(address(router), type(uint256).max);
        usdc.approve(address(router), type(uint256).max);
        weth.approve(address(router), type(uint256).max);
        dai.approve(address(router), type(uint256).max);

        // ── 7. Create pools & add liquidity ──────────────────────────────────
        // Ritual Chain uses millisecond timestamps; add 1 hour in ms
        uint256 deadline = block.timestamp + 3_600_000;

        // Pool 1: WRITUAL / USDC
        (uint256 a0, uint256 b0, uint256 lp0) = router.addLiquidity(
            address(writual), address(usdc),
            WRITUAL_USDC_WRITUAL, WRITUAL_USDC_USDC,
            0, 0,
            deployer, deadline
        );
        pairWRITUAL_USDC = factory.getPair(address(writual), address(usdc));
        console.log("--- Pool WRITUAL/USDC ---");
        console.log("  Pair address:", pairWRITUAL_USDC);
        console.log("  WRITUAL added:", a0 / 1e18);
        console.log("  USDC added:", b0 / 1e6);
        console.log("  LP tokens:", lp0 / 1e18);

        // Pool 2: WRITUAL / WETH
        (uint256 a1, uint256 b1, uint256 lp1) = router.addLiquidity(
            address(writual), address(weth),
            WRITUAL_WETH_WRITUAL, WRITUAL_WETH_WETH,
            0, 0,
            deployer, deadline
        );
        pairWRITUAL_WETH = factory.getPair(address(writual), address(weth));
        console.log("--- Pool WRITUAL/WETH ---");
        console.log("  Pair address:", pairWRITUAL_WETH);
        console.log("  WRITUAL added:", a1 / 1e18);
        console.log("  WETH added:", b1 / 1e18);
        console.log("  LP tokens:", lp1 / 1e18);

        // Pool 3: WRITUAL / DAI
        (uint256 a2, uint256 b2, uint256 lp2) = router.addLiquidity(
            address(writual), address(dai),
            WRITUAL_DAI_WRITUAL, WRITUAL_DAI_DAI,
            0, 0,
            deployer, deadline
        );
        pairWRITUAL_DAI = factory.getPair(address(writual), address(dai));
        console.log("--- Pool WRITUAL/DAI ---");
        console.log("  Pair address:", pairWRITUAL_DAI);
        console.log("  WRITUAL added:", a2 / 1e18);
        console.log("  DAI added:", b2 / 1e18);
        console.log("  LP tokens:", lp2 / 1e18);

        // ── 8. Verify reserves ───────────────────────────────────────────────
        (uint112 r0u, uint112 r1u,) = AncestraPair(pairWRITUAL_USDC).getReserves();
        require(r0u > 0 && r1u > 0, "WRITUAL/USDC: zero reserves");

        (uint112 r0w, uint112 r1w,) = AncestraPair(pairWRITUAL_WETH).getReserves();
        require(r0w > 0 && r1w > 0, "WRITUAL/WETH: zero reserves");

        (uint112 r0d, uint112 r1d,) = AncestraPair(pairWRITUAL_DAI).getReserves();
        require(r0d > 0 && r1d > 0, "WRITUAL/DAI: zero reserves");

        // ── 9. Test swap: WRITUAL → USDC ─────────────────────────────────────
        {
            address[] memory path = new address[](2);
            path[0] = address(writual);
            path[1] = address(usdc);
            uint256 testAmountIn = 0.001 ether; // tiny test
            uint256[] memory amts = router.swapExactTokensForTokens(
                testAmountIn, 0, path, deployer, deadline
            );
            console.log("Test swap WRITUAL->USDC succeeded: out (USDC units):", amts[1]);
            require(amts[1] > 0, "Test swap WRITUAL->USDC returned 0");
        }

        // ── 10. Test swap: WRITUAL → WETH ────────────────────────────────────
        {
            address[] memory path = new address[](2);
            path[0] = address(writual);
            path[1] = address(weth);
            uint256 testAmountIn = 0.001 ether;
            uint256[] memory amts = router.swapExactTokensForTokens(
                testAmountIn, 0, path, deployer, deadline
            );
            console.log("Test swap WRITUAL->WETH succeeded: out (wei):", amts[1]);
            require(amts[1] > 0, "Test swap WRITUAL->WETH returned 0");
        }

        // ── 11. Test swap: WRITUAL → DAI ─────────────────────────────────────
        {
            address[] memory path = new address[](2);
            path[0] = address(writual);
            path[1] = address(dai);
            uint256 testAmountIn = 0.001 ether;
            uint256[] memory amts = router.swapExactTokensForTokens(
                testAmountIn, 0, path, deployer, deadline
            );
            console.log("Test swap WRITUAL->DAI succeeded: out (wei):", amts[1]);
            require(amts[1] > 0, "Test swap WRITUAL->DAI returned 0");
        }

        vm.stopBroadcast();

        // ── 12. Print deployment summary ──────────────────────────────────────
        console.log("");
        console.log("=== DEPLOYMENT COMPLETE ===");
        console.log("WRITUAL:          ", address(writual));
        console.log("Factory:          ", address(factory));
        console.log("Router:           ", address(router));
        console.log("USDC:             ", address(usdc));
        console.log("WETH:             ", address(weth));
        console.log("DAI:              ", address(dai));
        console.log("Pair WRITUAL/USDC:", pairWRITUAL_USDC);
        console.log("Pair WRITUAL/WETH:", pairWRITUAL_WETH);
        console.log("Pair WRITUAL/DAI: ", pairWRITUAL_DAI);
        console.log("===========================");
    }
}
