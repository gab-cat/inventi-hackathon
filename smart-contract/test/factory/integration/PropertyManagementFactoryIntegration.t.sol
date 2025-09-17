// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Test} from "forge-std/Test.sol";
import {PropertyManagementFactory} from "src/PropertyManagementFactory.sol";
import {VisitorManagementRegistry} from "src/VisitorManagementRegistry.sol";

contract PropertyManagementFactoryIntegrationTest is Test {
	PropertyManagementFactory internal factory;
	VisitorManagementRegistry internal registry;

	address internal owner;
	address internal alice; // initial unit owner
	address internal bob;   // new unit owner after transfer
	address internal guard; // authorized security guard

	function setUp() public {
		owner = makeAddr("owner");
		alice = makeAddr("alice");
		bob = makeAddr("bob");
		guard = makeAddr("guard");

		vm.prank(owner);
		factory = new PropertyManagementFactory();
		registry = VisitorManagementRegistry(factory.getVisitorManagementRegistry());
	}

	function _createApprovedVisitor(address unitOwner, string memory unitId, bytes32 piiHash) internal {
		// Only factory owner may create visitor entries in registry
		vm.prank(owner);
		registry.createVisitorEntry(unitOwner, unitId, uint64(block.timestamp), uint64(block.timestamp + 1 days), piiHash);
	}

	function testIntegration_VisitorLifecycle_withCapacityAndAuth() public {
		// Setup: register unit with capacity 2 for alice
		vm.prank(owner);
		factory.registerUnit(alice, "A-1", 2);

		// Create two approved visitors
		bytes32 v1 = keccak256("v1");
		bytes32 v2 = keccak256("v2");
		_createApprovedVisitor(alice, "A-1", v1);
		_createApprovedVisitor(alice, "A-1", v2);

		// Guard not authorized yet; check-in should revert with NotAuthorized
		vm.prank(guard);
		vm.expectRevert(VisitorManagementRegistry.VisitorManagementRegistry__NotAuthorized.selector);
		registry.checkInVisitor(v1);

		// Authorize guard through factory
		vm.prank(owner);
		factory.authorizeWallet(guard);

		// Check-in two visitors under capacity
		vm.prank(guard);
		registry.checkInVisitor(v1);
		vm.prank(guard);
		registry.checkInVisitor(v2);

		bytes32[] memory activeNow = registry.getActiveVisitors("A-1");
		assertEq(activeNow.length, 2);

		// Third visitor: creation should revert at full capacity due to early check in createVisitorEntry
		bytes32 v3 = keccak256("v3");
		vm.prank(owner);
		vm.expectRevert(VisitorManagementRegistry.VisitorManagementRegistry__CapacityFull.selector);
		registry.createVisitorEntry(alice, "A-1", uint64(block.timestamp), uint64(block.timestamp + 1 days), v3);

		// Checkout one, then creation and check-in of third should succeed
		vm.prank(guard);
		registry.checkOutVisitor(v1);

		vm.prank(owner);
		registry.createVisitorEntry(alice, "A-1", uint64(block.timestamp), uint64(block.timestamp + 1 days), v3);

		vm.prank(guard);
		registry.checkInVisitor(v3);

		bytes32[] memory activeFinal = registry.getActiveVisitors("A-1");
		assertEq(activeFinal.length, 2);
	}

	function testIntegration_OwnerTransferAffectsRegistryValidation() public {
		// Register a unit for alice
		vm.prank(owner);
		factory.registerUnit(alice, "U-77", 1);

		bytes32 v = keccak256("visitor");
		_createApprovedVisitor(alice, "U-77", v);

		// After transfer of ownership to bob, creating entry for alice should revert NotUnitOwner
		vm.prank(owner);
		factory.setUnitOwner("U-77", bob);

		vm.prank(owner);
		vm.expectRevert(VisitorManagementRegistry.VisitorManagementRegistry__NotUnitOwner.selector);
		registry.createVisitorEntry(alice, "U-77", uint64(block.timestamp), uint64(block.timestamp + 1 days), keccak256("v2"));

		// But creating for bob should work
		vm.prank(owner);
		registry.createVisitorEntry(bob, "U-77", uint64(block.timestamp), uint64(block.timestamp + 1 days), keccak256("v3"));
	}

	function testIntegration_AuthorizationViaFactoryEnablesRegistryOps() public {
		vm.prank(owner);
		factory.registerUnit(alice, "R-9", 1);

		bytes32 v = keccak256("v");
		_createApprovedVisitor(alice, "R-9", v);

		// Before authorization, bob cannot check-in
		vm.prank(bob);
		vm.expectRevert(VisitorManagementRegistry.VisitorManagementRegistry__NotAuthorized.selector);
		registry.checkInVisitor(v);

		// Authorize bob
		vm.prank(owner);
		factory.authorizeWallet(bob);

		// Now bob can check-in
		vm.prank(bob);
		registry.checkInVisitor(v);
	}
}
