// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Test} from "forge-std/Test.sol";
import {PropertyManagementFactory} from "src/PropertyManagementFactory.sol";
import {VisitorManagementRegistry} from "src/VisitorManagementRegistry.sol";

contract PropertyManagementFactoryUnitTest is Test {
	PropertyManagementFactory internal factory;

	address internal owner;
	address internal alice;
	address internal bob;
	address internal carol;

	// Mirror events from the SUT for expectEmit
	event PropertyManagementFactory__UnitRegistered(string unitId, address unitOwner, uint256 maxVisitors);
	event PropertyManagementFactory__UnitCapacityUpdated(string unitId, uint256 oldCapacity, uint256 newCapacity);
	event PropertyManagementFactory__UnitOwnerUpdated(string unitId, address oldOwner, address newOwner);
	event PropertyManagementFactory__AuthorizedWalletAdded(address indexed wallet);
	event PropertyManagementFactory__AuthorizedWalletRemoved(address indexed wallet);

	function setUp() public {
		owner = makeAddr("owner");
		alice = makeAddr("alice");
		bob = makeAddr("bob");
		carol = makeAddr("carol");

		vm.prank(owner);
		factory = new PropertyManagementFactory();
	}

	/*//////////////////////////////////////////////////////////////
					ACCESS CONTROL
	//////////////////////////////////////////////////////////////*/
	function testOnlyOwner_registerUnit_revertsForNonOwner() public {
		// Calling as non-owner should hit OpenZeppelin Ownable's onlyOwner revert
		vm.prank(alice);
		vm.expectRevert();
		factory.registerUnit(alice, "A-101", 3);
	}

	function testOnlyOwner_updateUnitCapacity_revertsForNonOwner() public {
		// prepare one unit by owner
		vm.prank(owner);
		factory.registerUnit(alice, "A-101", 3);

		vm.prank(alice);
		vm.expectRevert();
		factory.updateUnitCapacity("A-101", 5);
	}

	function testOnlyOwner_setUnitOwner_revertsForNonOwner() public {
		vm.prank(owner);
		factory.registerUnit(alice, "A-101", 3);

		vm.prank(alice);
		vm.expectRevert();
		factory.setUnitOwner("A-101", bob);
	}

	function testOnlyOwner_authorizeAndRevokeWallet_revertsForNonOwner() public {
		vm.prank(alice);
		vm.expectRevert();
		factory.authorizeWallet(bob);

		vm.prank(alice);
		vm.expectRevert();
		factory.revokeWallet(bob);
	}

	/*//////////////////////////////////////////////////////////////
					REGISTER UNIT
	//////////////////////////////////////////////////////////////*/
	function testRegisterUnit_success_storesAndEmits() public {
		vm.prank(owner);
		vm.expectEmit(true, true, true, true);
		emit PropertyManagementFactory__UnitRegistered("A-101", alice, 3);
		factory.registerUnit(alice, "A-101", 3);

		// Reads
		address actualOwner = factory.getUnitOwner("A-101");
		uint256 cap = factory.getMaxVisitors("A-101");
		assertEq(actualOwner, alice, "owner mismatch");
		assertEq(cap, 3, "cap mismatch");

		// Reverse index
		string[] memory ids = factory.getUnitIds(alice);
		assertEq(ids.length, 1, "ids length");
		assertEq(keccak256(bytes(ids[0])), keccak256(bytes("A-101")), "unit id");
		assertEq(factory.getUnitCount(alice), 1, "count");
	}

	function testRegisterUnit_revertsOnZeroOwner() public {
		vm.prank(owner);
		vm.expectRevert(PropertyManagementFactory.PropertyManagementFactory__InvalidOwner.selector);
		factory.registerUnit(address(0), "A-101", 1);
	}

	function testRegisterUnit_revertsOnEmptyId() public {
		vm.prank(owner);
		vm.expectRevert(PropertyManagementFactory.PropertyManagementFactory__InvalidUnitId.selector);
		factory.registerUnit(alice, "", 1);
	}

	function testRegisterUnit_revertsOnDuplicateId() public {
		vm.startPrank(owner);
		factory.registerUnit(alice, "A-101", 1);
		vm.expectRevert(PropertyManagementFactory.PropertyManagementFactory__UnitExists.selector);
		factory.registerUnit(bob, "A-101", 2);
		vm.stopPrank();
	}

	/*//////////////////////////////////////////////////////////////
					UPDATE CAPACITY
	//////////////////////////////////////////////////////////////*/
	function testUpdateUnitCapacity_success_updatesAndEmits() public {
		vm.startPrank(owner);
		factory.registerUnit(alice, "A-101", 1);

		vm.expectEmit(true, true, true, true);
		emit PropertyManagementFactory__UnitCapacityUpdated("A-101", 1, 5);
		factory.updateUnitCapacity("A-101", 5);
		vm.stopPrank();

		assertEq(factory.getMaxVisitors("A-101"), 5, "new cap");
	}

	function testUpdateUnitCapacity_revertsOnEmptyId() public {
		vm.prank(owner);
		vm.expectRevert(PropertyManagementFactory.PropertyManagementFactory__InvalidUnitId.selector);
		factory.updateUnitCapacity("", 5);
	}

	function testUpdateUnitCapacity_revertsWhenUnitMissing() public {
		vm.prank(owner);
		vm.expectRevert(PropertyManagementFactory.PropertyManagementFactory__UnitNotFound.selector);
		factory.updateUnitCapacity("A-404", 5);
	}

	/*//////////////////////////////////////////////////////////////
					TRANSFER OWNER
	//////////////////////////////////////////////////////////////*/
	function testSetUnitOwner_success_updatesBothIndexesAndEmits() public {
		vm.startPrank(owner);
		factory.registerUnit(alice, "A-101", 3);
		factory.registerUnit(alice, "A-102", 2);

		vm.expectEmit(true, true, true, true);
		emit PropertyManagementFactory__UnitOwnerUpdated("A-101", alice, bob);
		factory.setUnitOwner("A-101", bob);
		vm.stopPrank();

		// Primary record owner updated
		assertEq(factory.getUnitOwner("A-101"), bob);

		// Reverse index: alice lost A-101 but keeps A-102; bob gained A-101
		string[] memory aliceIds = factory.getUnitIds(alice);
		assertEq(aliceIds.length, 1, "alice should have 1 unit after transfer");
		assertEq(keccak256(bytes(aliceIds[0])), keccak256(bytes("A-102")));

		string[] memory bobIds = factory.getUnitIds(bob);
		assertEq(bobIds.length, 1, "bob should have 1 unit");
		assertEq(keccak256(bytes(bobIds[0])), keccak256(bytes("A-101")));
	}

	function testSetUnitOwner_revertsOnEmptyId() public {
		vm.prank(owner);
		vm.expectRevert(PropertyManagementFactory.PropertyManagementFactory__InvalidUnitId.selector);
		factory.setUnitOwner("", bob);
	}

	function testSetUnitOwner_revertsOnZeroNewOwner() public {
		vm.startPrank(owner);
		factory.registerUnit(alice, "A-101", 1);
		vm.expectRevert(PropertyManagementFactory.PropertyManagementFactory__InvalidOwner.selector);
		factory.setUnitOwner("A-101", address(0));
		vm.stopPrank();
	}

	function testSetUnitOwner_revertsWhenUnitMissing() public {
		vm.prank(owner);
		vm.expectRevert(PropertyManagementFactory.PropertyManagementFactory__UnitNotFound.selector);
		factory.setUnitOwner("A-404", bob);
	}

	/*//////////////////////////////////////////////////////////////
					AUTHORIZED WALLETS
	//////////////////////////////////////////////////////////////*/
	function testIsAuthorized_ownerAlwaysTrue() public view {
		assertTrue(factory.isAuthorized(owner), "owner must be authorized");
	}

	function testAuthorizeWallet_success_setsFlagAndEmits() public {
		vm.prank(owner);
		vm.expectEmit(true, true, true, true);
		emit PropertyManagementFactory__AuthorizedWalletAdded(carol);
		factory.authorizeWallet(carol);
		// Non-owner, but authorized
		assertTrue(factory.isAuthorized(carol), "carol should be authorized");
	}

	function testAuthorizeWallet_revertsOnZeroAddress() public {
		vm.prank(owner);
		vm.expectRevert(PropertyManagementFactory.PropertyManagementFactory__ZeroAddress.selector);
		factory.authorizeWallet(address(0));
	}

	function testRevokeWallet_success_clearsFlagAndEmits() public {
		vm.startPrank(owner);
		factory.authorizeWallet(carol);
		vm.expectEmit(true, true, true, true);
		emit PropertyManagementFactory__AuthorizedWalletRemoved(carol);
		factory.revokeWallet(carol);
		vm.stopPrank();

		// Now unauthorized (note: owner is still authorized by default; carol is not)
		assertFalse(factory.isAuthorized(carol), "carol should be unauthorized");
	}

	function testRevokeWallet_revertsOnZeroAddress() public {
		vm.prank(owner);
		vm.expectRevert(PropertyManagementFactory.PropertyManagementFactory__ZeroAddress.selector);
		factory.revokeWallet(address(0));
	}

	/*//////////////////////////////////////////////////////////////
					REGISTRY LINKAGE
	//////////////////////////////////////////////////////////////*/
	function testGetVisitorManagementRegistry_linkedAndOwnerMatches() public view {
		address registryAddr = factory.getVisitorManagementRegistry();
		assertTrue(registryAddr != address(0), "registry address should not be zero");

		VisitorManagementRegistry registry = VisitorManagementRegistry(registryAddr);
		assertEq(registry.owner(), owner, "registry owner should equal factory owner");
	}

	function testRegistry_onlyAuthorizedReadsFactoryAuthorization() public {
		// Arrange
		VisitorManagementRegistry registry = VisitorManagementRegistry(factory.getVisitorManagementRegistry());
		bytes32 randomVisitor = keccak256(abi.encodePacked("random"));

		// As non-owner and not authorized: expect revert NotAuthorized
		vm.prank(alice);
		vm.expectRevert(VisitorManagementRegistry.VisitorManagementRegistry__NotAuthorized.selector);
		registry.checkInVisitor(randomVisitor);

		// After authorizing alice, onlyAuthorized should pass (we won't assert deeper effects here)
		vm.prank(owner);
		factory.authorizeWallet(alice);

		vm.prank(alice);
		// It may proceed to mutate state; ensure it no longer reverts by onlyAuthorized
		// We can't easily assert no revert except by calling without expectRevert
		registry.checkInVisitor(randomVisitor);
	}
}
