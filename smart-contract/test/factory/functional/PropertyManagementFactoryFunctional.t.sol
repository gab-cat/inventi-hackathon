// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Test} from "forge-std/Test.sol";
import {PropertyManagementFactory} from "src/PropertyManagementFactory.sol";
import {VisitorManagementRegistry} from "src/VisitorManagementRegistry.sol";

contract PropertyManagementFactoryFunctionalTest is Test {
	PropertyManagementFactory internal factory;

	address internal owner;
	address internal alice;
	address internal bob;
	address internal carol;
	address internal dave;

	function setUp() public {
		owner = makeAddr("owner");
		alice = makeAddr("alice");
		bob = makeAddr("bob");
		carol = makeAddr("carol");
		dave = makeAddr("dave");

		vm.prank(owner);
		factory = new PropertyManagementFactory();
	}

	function testFunctional_MultiUnitLifecycleFlow() public {
		// Owner registers multiple units for alice
		vm.startPrank(owner);
		factory.registerUnit(alice, "A-101", 2);
		factory.registerUnit(alice, "A-102", 4);

		// Verify reverse index and getters
		assertEq(factory.getUnitOwner("A-101"), alice);
		assertEq(factory.getUnitOwner("A-102"), alice);
		assertEq(factory.getMaxVisitors("A-101"), 2);
		assertEq(factory.getMaxVisitors("A-102"), 4);
		assertEq(factory.getUnitCount(alice), 2);

		// Update capacity on one unit
		factory.updateUnitCapacity("A-101", 5);
		assertEq(factory.getMaxVisitors("A-101"), 5);

		// Transfer ownership of A-101 to bob
		factory.setUnitOwner("A-101", bob);
		vm.stopPrank();

		// Post-conditions: indexes consistent
		string[] memory aliceIds = factory.getUnitIds(alice);
		assertEq(aliceIds.length, 1);
		assertEq(keccak256(bytes(aliceIds[0])), keccak256(bytes("A-102")));

		string[] memory bobIds = factory.getUnitIds(bob);
		assertEq(bobIds.length, 1);
		assertEq(keccak256(bytes(bobIds[0])), keccak256(bytes("A-101")));

		// Read functions still correct
		assertEq(factory.getUnitOwner("A-101"), bob);
		assertEq(factory.getUnitOwner("A-102"), alice);
	}

	function testFunctional_AuthorizationFlow() public {
		// Initially, only owner is authorized
		assertTrue(factory.isAuthorized(owner));
		assertFalse(factory.isAuthorized(alice));
		assertFalse(factory.isAuthorized(bob));

		// Owner authorizes alice and carol
		vm.startPrank(owner);
		factory.authorizeWallet(alice);
		factory.authorizeWallet(carol);
		vm.stopPrank();

		assertTrue(factory.isAuthorized(alice));
		assertTrue(factory.isAuthorized(carol));
		assertFalse(factory.isAuthorized(bob));

		// Revoke one, keep the other
		vm.prank(owner);
		factory.revokeWallet(alice);
		assertFalse(factory.isAuthorized(alice));
		assertTrue(factory.isAuthorized(carol));
	}

	function testFunctional_DuplicateUnitPreventionAcrossOwners() public {
		vm.startPrank(owner);
		factory.registerUnit(alice, "U-1", 1);
		// Attempt to reuse same ID for a different owner should revert
		vm.expectRevert(PropertyManagementFactory.PropertyManagementFactory__UnitExists.selector);
		factory.registerUnit(bob, "U-1", 3);
		vm.stopPrank();
	}

	function testFuzz_RegisterAndReadConsistency(bytes32 seed) public {
		// Create a deterministic but varying unit ID and cap from seed
		string memory unitId = string(abi.encodePacked("UNIT-", vm.toString(uint256(seed))));
		uint256 cap = uint256(seed) % 20; // 0..19

		vm.prank(owner);
		factory.registerUnit(dave, unitId, cap);

		assertEq(factory.getUnitOwner(unitId), dave);
		assertEq(factory.getMaxVisitors(unitId), cap);

		string[] memory ids = factory.getUnitIds(dave);
		bool found = false;
		for (uint256 i = 0; i < ids.length; i++) {
			if (keccak256(bytes(ids[i])) == keccak256(bytes(unitId))) {
				found = true;
				break;
			}
		}
		assertTrue(found, "unit should be present in reverse index");
	}

	function testFunctional_RegistryLinkage() public view {
		address registryAddr = factory.getVisitorManagementRegistry();
		assertTrue(registryAddr != address(0));
		VisitorManagementRegistry registry = VisitorManagementRegistry(registryAddr);
		assertEq(registry.owner(), owner);
	}
}
