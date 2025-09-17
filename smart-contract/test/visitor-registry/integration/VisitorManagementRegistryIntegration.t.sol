// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Test} from "forge-std/Test.sol";
import {Ownable} from "@openzeppelin-contracts/access/Ownable.sol";
import {PropertyManagementFactory} from "src/PropertyManagementFactory.sol";
import {VisitorManagementRegistry} from "src/VisitorManagementRegistry.sol";

/// Integration tests: focus on cross-contract behavior between Factory and Registry
contract VisitorManagementRegistryIntegrationTest is Test {
	PropertyManagementFactory internal factory;
	VisitorManagementRegistry internal registry;

	address internal owner;   // factory deployer and initial registry owner
	address internal newAdm;  // new factory owner after transfer
	address internal alice;   // unit owner
	address internal bob;     // another unit owner
	address internal guard;   // authorized operator via factory

	function setUp() public {
		owner = makeAddr("owner");
		newAdm = makeAddr("newAdm");
		alice = makeAddr("alice");
		bob = makeAddr("bob");
		guard = makeAddr("guard");

		vm.prank(owner);
		factory = new PropertyManagementFactory();
		registry = VisitorManagementRegistry(factory.getVisitorManagementRegistry());
	}

	function _createApprovedVisitor(address unitOwner, string memory unitId, bytes32 piiHash) internal {
		vm.prank(owner); // only registry owner can create entries
		registry.createVisitorEntry(unitOwner, unitId, uint64(block.timestamp), uint64(block.timestamp + 1 days), piiHash);
	}

	function testIntegration_RegistryOwnerAnchoredToFactoryDeployOwner() public {
		// Registry owner set at factory deployment
		assertEq(registry.owner(), owner);

		// Prepare state: register U-1 for alice while owner still controls the factory
		vm.prank(owner);
		factory.registerUnit(alice, "U-1", 2);

		// Transfer factory ownership to newAdm
		vm.prank(owner);
		factory.transferOwnership(newAdm);
		assertEq(factory.owner(), newAdm);

		// Registry owner remains anchored to original owner
		assertEq(registry.owner(), owner);

		// New factory owner cannot call registry onlyOwner function
		vm.prank(newAdm);
		vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, newAdm));
		registry.createVisitorEntry(alice, "U-1", uint64(block.timestamp), uint64(block.timestamp + 1 days), keccak256("pii"));

		// Original owner still can
		vm.prank(owner);
		registry.createVisitorEntry(alice, "U-1", uint64(block.timestamp), uint64(block.timestamp + 1 days), keccak256("pii2"));
	}

	function testIntegration_CapacityReflectsFactoryUpdates() public {
		// Register a unit with capacity 1, then increase and then set to unlimited (0)
		vm.prank(owner);
		factory.registerUnit(alice, "A-1", 1);

		bytes32 v1 = keccak256("v1");
		bytes32 v2 = keccak256("v2");
		bytes32 v3 = keccak256("v3");
		bytes32 v4 = keccak256("v4");
		_createApprovedVisitor(alice, "A-1", v1);
		_createApprovedVisitor(alice, "A-1", v2);
		_createApprovedVisitor(alice, "A-1", v3);
		_createApprovedVisitor(alice, "A-1", v4);

		// Authorize guard to operate registry check-in/out
		vm.prank(owner);
		factory.authorizeWallet(guard);

		// With cap=1, only one check-in allowed
		vm.prank(guard);
		registry.checkInVisitor(v1);
		vm.prank(guard);
		vm.expectRevert(VisitorManagementRegistry.VisitorManagementRegistry__CapacityFull.selector);
		registry.checkInVisitor(v2);

		// Increase capacity to 2, second check-in should now work
		vm.prank(owner);
		factory.updateUnitCapacity("A-1", 2);
		vm.prank(guard);
		registry.checkInVisitor(v2);

		bytes32[] memory active = registry.getActiveVisitors("A-1");
		assertEq(active.length, 2);

		// Set capacity to 0 (unlimited) and check-in two more
		vm.prank(owner);
		factory.updateUnitCapacity("A-1", 0);
		vm.prank(guard);
		registry.checkInVisitor(v3);
		vm.prank(guard);
		registry.checkInVisitor(v4);

		active = registry.getActiveVisitors("A-1");
		assertEq(active.length, 4);
	}

	function testIntegration_AuthorizationChangesPropagateToRegistry() public {
		vm.prank(owner);
		factory.registerUnit(bob, "B-9", 2);

		bytes32 v = keccak256("visitor");
		_createApprovedVisitor(bob, "B-9", v);

		// guard not authorized yet
		vm.prank(guard);
		vm.expectRevert(VisitorManagementRegistry.VisitorManagementRegistry__NotAuthorized.selector);
		registry.checkInVisitor(v);

		// authorize guard -> can check-in
		vm.prank(owner);
		factory.authorizeWallet(guard);
		vm.prank(guard);
		registry.checkInVisitor(v);

		// revoke guard -> cannot check-out
		vm.prank(owner);
		factory.revokeWallet(guard);
		vm.prank(guard);
		vm.expectRevert(VisitorManagementRegistry.VisitorManagementRegistry__NotAuthorized.selector);
		registry.checkOutVisitor(v);

		// factory owner (who is also recognized as authorized by factory) can still check-out
		vm.prank(owner);
		registry.checkOutVisitor(v);
	}
}


