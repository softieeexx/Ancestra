// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {AncestraPool} from "../src/AncestraPool.sol";
import {MockERC20} from "../src/MockERC20.sol";

contract AncestraPoolTest is Test {
    MockERC20 ritual;
    MockERC20 usdc;
    AncestraPool pool;

    address user = address(0xACED);
    uint256 constant INITIAL_RITUAL = 100_000 ether;
    uint256 constant INITIAL_USDC = 1_000_000 * 10**6;

    function setUp() public {
        ritual = new MockERC20("Ritual", "RITUAL", 18, 1_000_000 ether);
        usdc = new MockERC20("USDC", "USDC", 6, 10_000_000 * 10**6);
        pool = new AncestraPool(address(ritual), address(usdc), "Amina", "Stable");

        ritual.mint(address(this), INITIAL_RITUAL);
        usdc.mint(address(this), INITIAL_USDC);
        ritual.approve(address(pool), INITIAL_RITUAL);
        usdc.approve(address(pool), INITIAL_USDC);
        pool.initialize(INITIAL_RITUAL, INITIAL_USDC);

        // Fund user
        ritual.mint(user, 10_000 ether);
        vm.startPrank(user);
        ritual.approve(address(pool), type(uint256).max);
        vm.stopPrank();
    }

    function test_InitialReserves() public view {
        (uint256 r0, uint256 r1) = (pool.reserve0(), pool.reserve1());
        assertEq(r0, INITIAL_RITUAL);
        assertEq(r1, INITIAL_USDC);
    }

    function test_SwapRitualForUsdc() public {
        vm.prank(user);
        uint256 amountOut = pool.getAmountOut(1000 ether, INITIAL_RITUAL, INITIAL_USDC);
        pool.swapRitualForToken(amountOut, 1000 ether);

        assertTrue(ritual.balanceOf(address(pool)) > INITIAL_RITUAL);
        assertTrue(usdc.balanceOf(user) > 0);
    }

    function test_GetAmountOut() public view {
        uint256 out = pool.getAmountOut(1000 ether, INITIAL_RITUAL, INITIAL_USDC);
        assertTrue(out > 0);
        assertTrue(out < INITIAL_USDC);
    }

    function test_GetAmountIn() public view {
        uint256 out = pool.getAmountOut(1000 ether, INITIAL_RITUAL, INITIAL_USDC);
        uint256 back = pool.getAmountIn(out, INITIAL_RITUAL, INITIAL_USDC);
        assertApproxEqAbs(back, 1000 ether, 1);
    }

    function test_FailInsufficientOutput() public {
        vm.prank(user);
        vm.expectRevert(AncestraPool.InsufficientOutputAmount.selector);
        pool.swapRitualForToken(0, 1 ether);
    }
}
