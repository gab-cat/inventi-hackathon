// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Test} from "forge-std/Test.sol";
import {PropertyManagementFactory} from "src/PropertyManagementFactory.sol";
import {VisitorManagementRegistry} from "src/VisitorManagementRegistry.sol";

/// Functional tests verify real-world flows across the factory and registry
contract VisitorManagementRegistryFunctionalTest is Test {
	PropertyManagementFactory internal factory;
 	VisitorManagementRegistry internal registry;

 	address internal owner;
 	address internal alice; // unit owner A
 	address internal bob;   // unit owner B / or transferee
 	address internal guard; // authorized operator

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
 		vm.prank(owner);
 		registry.createVisitorEntry(unitOwner, unitId, uint64(block.timestamp), uint64(block.timestamp + 1 days), piiHash);
 	}

 	function testFunctional_EndToEnd_MultiUnit_CheckInOut_CapacityRotation() public {
 		// Register two units: A has cap 2, B has cap 1
 		vm.startPrank(owner);
 		factory.registerUnit(alice, "A-10", 2);
 		factory.registerUnit(bob, "B-20", 1);
 		factory.authorizeWallet(guard);
 		vm.stopPrank();

 		// Create three visitors for A and one for B
 		bytes32 a1 = keccak256("a1");
 		bytes32 a2 = keccak256("a2");
 		bytes32 a3 = keccak256("a3");
 		bytes32 b1 = keccak256("b1");
 		_createApprovedVisitor(alice, "A-10", a1);
 		_createApprovedVisitor(alice, "A-10", a2);
 		_createApprovedVisitor(alice, "A-10", a3);
 		_createApprovedVisitor(bob, "B-20", b1);

 		// Use guard to check-in two on A (cap 2)
 		vm.prank(guard);
 		registry.checkInVisitor(a1);
 		vm.prank(guard);
 		registry.checkInVisitor(a2);

 		bytes32[] memory activeA = registry.getActiveVisitors("A-10");
 		assertEq(activeA.length, 2);

 		// Third check-in on A should revert (over capacity)
 		vm.prank(guard);
 		vm.expectRevert(VisitorManagementRegistry.VisitorManagementRegistry__CapacityFull.selector);
 		registry.checkInVisitor(a3);

 		// For B (cap 1): check-in b1
 		vm.prank(guard);
 		registry.checkInVisitor(b1);
 		bytes32[] memory activeB = registry.getActiveVisitors("B-20");
 		assertEq(activeB.length, 1);

 		// Rotate capacity on A: check-out one then check-in a3
 		vm.prank(guard);
 		registry.checkOutVisitor(a1);
 		vm.prank(guard);
 		registry.checkInVisitor(a3);

 		activeA = registry.getActiveVisitors("A-10");
 		assertEq(activeA.length, 2);
 	}

 	function testFunctional_OwnerTransferAndCreationRules_RealisticFlow() public {
 		// Alice owns U-7; later transferred to Bob. Creation must follow latest owner.
 		vm.prank(owner);
 		factory.registerUnit(alice, "U-7", 2);

 		bytes32 v1 = keccak256("v1");
 		_createApprovedVisitor(alice, "U-7", v1);

 		vm.prank(owner);
 		factory.setUnitOwner("U-7", bob);

 		vm.prank(owner);
 		vm.expectRevert(VisitorManagementRegistry.VisitorManagementRegistry__NotUnitOwner.selector);
 		registry.createVisitorEntry(alice, "U-7", uint64(block.timestamp), uint64(block.timestamp + 1 days), keccak256("v2"));

 		vm.prank(owner);
 		registry.createVisitorEntry(bob, "U-7", uint64(block.timestamp), uint64(block.timestamp + 1 days), keccak256("v3"));
 	}

 	function testFunctional_AuthorizationLifecycle_WithRevocation() public {
 		// Register unit and authorize guard, then revoke
 		vm.prank(owner);
 		factory.registerUnit(alice, "R-1", 1);

 		bytes32 v = keccak256("visitor");
 		_createApprovedVisitor(alice, "R-1", v);

 		vm.prank(owner);
 		factory.authorizeWallet(guard);

 		// Authorized path: guard can check-in
 		vm.prank(guard);
 		registry.checkInVisitor(v);

 		// Revoke and ensure future privileged actions fail
 		vm.prank(owner);
 		factory.revokeWallet(guard);

 		vm.prank(guard);
 		vm.expectRevert(VisitorManagementRegistry.VisitorManagementRegistry__NotAuthorized.selector);
 		registry.checkOutVisitor(v);
 	}
}


