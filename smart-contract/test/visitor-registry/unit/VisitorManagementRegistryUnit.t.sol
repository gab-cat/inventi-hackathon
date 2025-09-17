// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import {Ownable} from "@openzeppelin-contracts/access/Ownable.sol";
import {VisitorManagementRegistry, IPropertyManagementFactory} from "../../../src/VisitorManagementRegistry.sol";

contract MockPropertyManagementFactory is IPropertyManagementFactory {
    // Simple mock with explicit setters for unit ownership, capacity and authorization
    mapping(string => address) private _unitOwnerOf;
    mapping(string => uint256) private _maxVisitorsOf;
    mapping(address => bool) private _isAuthorized;

    function setUnitOwner(string calldata unitId, address owner) external {
        _unitOwnerOf[unitId] = owner;
    }

    function setMaxVisitors(string calldata unitId, uint256 cap) external {
        _maxVisitorsOf[unitId] = cap;
    }

    function setAuthorized(address wallet, bool authorized) external {
        _isAuthorized[wallet] = authorized;
    }

    function getUnitOwner(string calldata unitId) external view returns (address) {
        return _unitOwnerOf[unitId];
    }

    function getMaxVisitors(string calldata unitId) external view returns (uint256) {
        return _maxVisitorsOf[unitId];
    }

    function isAuthorized(address wallet) external view returns (bool) {
        return _isAuthorized[wallet];
    }
}

contract VisitorManagementRegistryUnitTest is Test {
    // Re-declare events to leverage vm.expectEmit
    event VisitorEntryCreated(bytes32 indexed piiHash, address indexed unitOwner, string unitId);
    event VisitorCheckedIn(bytes32 indexed piiHash, string unitId, uint64 timestamp);
    event VisitorCheckedOut(bytes32 indexed piiHash, string unitId, uint64 timestamp);

    VisitorManagementRegistry private registry;
    MockPropertyManagementFactory private factory;

    address private deployer;
    address private contractOwner;
    address private unitOwner;
    address private anotherUnitOwner;
    address private authorizedOperator;
    address private unauthorizedUser;

    string private constant UNIT_A = "A-101";
    string private constant UNIT_B = "B-202";

    function setUp() public {
        deployer = makeAddr("deployer");
        contractOwner = makeAddr("contractOwner");
        unitOwner = makeAddr("unitOwner");
        anotherUnitOwner = makeAddr("anotherUnitOwner");
        authorizedOperator = makeAddr("authorizedOperator");
        unauthorizedUser = makeAddr("unauthorizedUser");

        vm.startPrank(deployer);
        factory = new MockPropertyManagementFactory();
        registry = new VisitorManagementRegistry(contractOwner, address(factory));
        vm.stopPrank();

        // Configure factory defaults
        factory.setUnitOwner(UNIT_A, unitOwner);
        factory.setUnitOwner(UNIT_B, anotherUnitOwner);
        factory.setMaxVisitors(UNIT_A, 2); // default capacity
        factory.setMaxVisitors(UNIT_B, 1);
        factory.setAuthorized(authorizedOperator, true);
    }

    // ------------------------- Helpers -------------------------
    function _pii(string memory label) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(label));
    }

    function _createApproved(
        address caller,
        address unitOwner_,
        string memory unitId,
        uint64 startTs,
        uint64 endTs,
        bytes32 pii
    ) internal returns (bytes32) {
        vm.prank(caller);
        return registry.createVisitorEntry(unitOwner_, unitId, startTs, endTs, pii);
    }

    function _checkIn(address caller, bytes32 pii) internal {
        vm.prank(caller);
        registry.checkInVisitor(pii);
    }

    function _checkOut(address caller, bytes32 pii) internal {
        vm.prank(caller);
        registry.checkOutVisitor(pii);
    }

    // ------------------------- createVisitorEntry -------------------------
    function testCreateVisitorEntry_SucceedsAndStoresData() public {
        bytes32 pii = _pii("alice");
        uint64 startTs = uint64(block.timestamp + 10);
        uint64 endTs = startTs + 3600;

        vm.expectEmit(true, true, false, false, address(registry));
        emit VisitorEntryCreated(pii, unitOwner, UNIT_A);
        vm.prank(contractOwner);
        bytes32 ret = registry.createVisitorEntry(unitOwner, UNIT_A, startTs, endTs, pii);
        assertEq(ret, pii, "pii should be returned");

        (VisitorManagementRegistry.Visitor memory v, bytes32[] memory docs) = registry.getVisitorLog(pii);
        assertEq(v.piiHash, pii);
        assertEq(v.unitOwner, unitOwner);
        assertEq(v.unitId, UNIT_A);
        assertEq(v.visitStart, startTs);
        assertEq(v.visitEnd, endTs);
        assertEq(uint256(v.status), uint256(VisitorManagementRegistry.VisitorStatus.Approved));
        assertEq(docs.length, 0, "no documents expected");

        // getMyVisitors should return this id for unitOwner
        bytes32[] memory mine = registry.getMyVisitors(0, 10);
        assertEq(mine.length, 0, "msg.sender has no visitors");
        vm.startPrank(unitOwner);
        bytes32[] memory mineOwner = registry.getMyVisitors(0, 10);
        vm.stopPrank();
        assertEq(mineOwner.length, 1);
        assertEq(mineOwner[0], pii);
    }

    function testCreateVisitorEntry_RevertsWhenCalledByNonOwner() public {
        bytes32 pii = _pii("bob");
        vm.prank(unauthorizedUser);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, unauthorizedUser));
        registry.createVisitorEntry(unitOwner, UNIT_A, 0, 0, pii);
    }

    function testCreateVisitorEntry_RevertsWhenNotUnitOwner() public {
        bytes32 pii = _pii("charlie");
        vm.prank(contractOwner);
        vm.expectRevert(VisitorManagementRegistry.VisitorManagementRegistry__NotUnitOwner.selector);
        registry.createVisitorEntry(anotherUnitOwner, UNIT_A, 0, 0, pii);
    }

    function testCreateVisitorEntry_RevertsWhenCapacityAlreadyFull() public {
        // Set UNIT_B cap to 1, fill with a checked-in visitor, then attempt creation for second
        factory.setMaxVisitors(UNIT_B, 1);

        bytes32 p1 = _pii("p1");
        bytes32 p2 = _pii("p2");
        // Create first, then check-in to fill capacity
        _createApproved(contractOwner, anotherUnitOwner, UNIT_B, 0, 0, p1);
        _checkIn(contractOwner, p1);

        vm.prank(contractOwner);
        vm.expectRevert(VisitorManagementRegistry.VisitorManagementRegistry__CapacityFull.selector);
        registry.createVisitorEntry(anotherUnitOwner, UNIT_B, 0, 0, p2);
    }

    // ------------------------- checkInVisitor -------------------------
    function testCheckInVisitor_AsOwner_SucceedsAndEmits() public {
        bytes32 pii = _pii("dave");
        _createApproved(contractOwner, unitOwner, UNIT_A, 0, 0, pii);

        vm.expectEmit(true, false, false, false, address(registry));
        emit VisitorCheckedIn(pii, UNIT_A, uint64(0));
        _checkIn(contractOwner, pii);

        (VisitorManagementRegistry.Visitor memory v,) = registry.getVisitorLog(pii);
        assertEq(uint256(v.status), uint256(VisitorManagementRegistry.VisitorStatus.CheckedIn));
        bytes32[] memory actives = registry.getActiveVisitors(UNIT_A);
        assertEq(actives.length, 1);
        assertEq(actives[0], pii);
    }

    function testCheckInVisitor_AsAuthorizedOperator_Succeeds() public {
        bytes32 pii = _pii("erin");
        _createApproved(contractOwner, unitOwner, UNIT_A, 0, 0, pii);
        _checkIn(authorizedOperator, pii);
        (VisitorManagementRegistry.Visitor memory v,) = registry.getVisitorLog(pii);
        assertEq(uint256(v.status), uint256(VisitorManagementRegistry.VisitorStatus.CheckedIn));
    }

    function testCheckInVisitor_RevertsWhenNotAuthorized() public {
        bytes32 pii = _pii("frank");
        _createApproved(contractOwner, unitOwner, UNIT_A, 0, 0, pii);
        vm.prank(unauthorizedUser);
        vm.expectRevert(VisitorManagementRegistry.VisitorManagementRegistry__NotAuthorized.selector);
        registry.checkInVisitor(pii);
    }

    function testCheckInVisitor_RevertsWhenAlreadyCheckedIn() public {
        bytes32 pii = _pii("gina");
        _createApproved(contractOwner, unitOwner, UNIT_A, 0, 0, pii);
        _checkIn(contractOwner, pii);
        vm.prank(contractOwner);
        vm.expectRevert(VisitorManagementRegistry.VisitorManagementRegistry__InvalidStatus.selector);
        registry.checkInVisitor(pii);
    }

    function testCheckInVisitor_RevertsWhenCapacityFull() public {
        factory.setMaxVisitors(UNIT_A, 1);
        bytes32 p1 = _pii("h1");
        bytes32 p2 = _pii("h2");
        _createApproved(contractOwner, unitOwner, UNIT_A, 0, 0, p1);
        _createApproved(contractOwner, unitOwner, UNIT_A, 0, 0, p2);
        _checkIn(contractOwner, p1);

        vm.prank(contractOwner);
        vm.expectRevert(VisitorManagementRegistry.VisitorManagementRegistry__CapacityFull.selector);
        registry.checkInVisitor(p2);
    }

    function testCheckInVisitor_ZeroCapacityMeansUnlimited() public {
        factory.setMaxVisitors(UNIT_A, 0);
        bytes32 p1 = _pii("z1");
        bytes32 p2 = _pii("z2");
        _createApproved(contractOwner, unitOwner, UNIT_A, 0, 0, p1);
        _createApproved(contractOwner, unitOwner, UNIT_A, 0, 0, p2);
        _checkIn(contractOwner, p1);
        _checkIn(contractOwner, p2);
        bytes32[] memory actives = registry.getActiveVisitors(UNIT_A);
        assertEq(actives.length, 2);
    }

    // ------------------------- checkOutVisitor -------------------------
    function testCheckOutVisitor_AsOwner_UpdatesStateAndEmits() public {
        bytes32 pii = _pii("ian");
        _createApproved(contractOwner, unitOwner, UNIT_A, 0, 0, pii);
        _checkIn(contractOwner, pii);

        vm.expectEmit(true, false, false, false, address(registry));
        emit VisitorCheckedOut(pii, UNIT_A, uint64(0));
        _checkOut(contractOwner, pii);

        (VisitorManagementRegistry.Visitor memory v,) = registry.getVisitorLog(pii);
        assertEq(uint256(v.status), uint256(VisitorManagementRegistry.VisitorStatus.CheckedOut));
        bytes32[] memory actives = registry.getActiveVisitors(UNIT_A);
        assertEq(actives.length, 0);
    }

    function testCheckOutVisitor_RevertsWhenNotAuthorized() public {
        bytes32 pii = _pii("jack");
        _createApproved(contractOwner, unitOwner, UNIT_A, 0, 0, pii);
        _checkIn(contractOwner, pii);
        vm.prank(unauthorizedUser);
        vm.expectRevert(VisitorManagementRegistry.VisitorManagementRegistry__NotAuthorized.selector);
        registry.checkOutVisitor(pii);
    }

    function testCheckOutVisitor_RevertsWhenNotCheckedIn() public {
        bytes32 pii = _pii("kate");
        _createApproved(contractOwner, unitOwner, UNIT_A, 0, 0, pii);
        vm.prank(contractOwner);
        vm.expectRevert(VisitorManagementRegistry.VisitorManagementRegistry__InvalidStatus.selector);
        registry.checkOutVisitor(pii);
    }

    // ------------------------- view functions -------------------------
    function testGetMyVisitors_PaginationAndBounds() public {
        bytes32 p1 = _pii("m1");
        bytes32 p2 = _pii("m2");
        bytes32 p3 = _pii("m3");
        _createApproved(contractOwner, unitOwner, UNIT_A, 0, 0, p1);
        _createApproved(contractOwner, unitOwner, UNIT_A, 0, 0, p2);
        _createApproved(contractOwner, unitOwner, UNIT_A, 0, 0, p3);

        vm.startPrank(unitOwner);
        bytes32[] memory page1 = registry.getMyVisitors(0, 2);
        bytes32[] memory page2 = registry.getMyVisitors(2, 2);
        bytes32[] memory page3 = registry.getMyVisitors(5, 2);
        vm.stopPrank();

        assertEq(page1.length, 2);
        assertEq(page1[0], p1);
        assertEq(page1[1], p2);
        assertEq(page2.length, 1);
        assertEq(page2[0], p3);
        assertEq(page3.length, 0);
    }

    function testGetActiveVisitors_ReflectsCheckInAndOut() public {
        bytes32 p1 = _pii("a1");
        bytes32 p2 = _pii("a2");
        _createApproved(contractOwner, unitOwner, UNIT_A, 0, 0, p1);
        _createApproved(contractOwner, unitOwner, UNIT_A, 0, 0, p2);
        _checkIn(contractOwner, p1);
        _checkIn(contractOwner, p2);
        bytes32[] memory list = registry.getActiveVisitors(UNIT_A);
        assertEq(list.length, 2);

        _checkOut(contractOwner, p1);
        list = registry.getActiveVisitors(UNIT_A);
        assertEq(list.length, 1);
        assertEq(list[0], p2);
    }

    function testSearchVisitorHistory_FiltersByTimeWindow() public {
        // Create three entries at different timestamps
        bytes32 p1 = _pii("t1");
        bytes32 p2 = _pii("t2");
        bytes32 p3 = _pii("t3");

        vm.warp(1000);
        _createApproved(contractOwner, unitOwner, UNIT_A, 1000, 2000, p1);
        vm.warp(2000);
        _createApproved(contractOwner, unitOwner, UNIT_A, 2000, 3000, p2);
        vm.warp(3000);
        _createApproved(contractOwner, unitOwner, UNIT_A, 3000, 4000, p3);

        // Search window that only captures p2
        bytes32[] memory mid = registry.searchVisitorHistory(UNIT_A, 1500, 2500, 0, 10);
        assertEq(mid.length, 1);
        assertEq(mid[0], p2);

        // Search wide window captures all
        bytes32[] memory all = registry.searchVisitorHistory(UNIT_A, 0, 10_000, 0, 10);
        assertEq(all.length, 3);
        assertEq(all[0], p1);
        assertEq(all[1], p2);
        assertEq(all[2], p3);

        // Pagination window from index 1 should consider only p2, p3
        bytes32[] memory paged = registry.searchVisitorHistory(UNIT_A, 0, 10_000, 1, 2);
        assertEq(paged.length, 2);
        assertEq(paged[0], p2);
        assertEq(paged[1], p3);
    }

    function testGetVisitorLog_ReturnsStoredData() public {
        bytes32 pii = _pii("log");
        uint64 startTs = 1111;
        uint64 endTs = 2222;
        _createApproved(contractOwner, unitOwner, UNIT_A, startTs, endTs, pii);
        (VisitorManagementRegistry.Visitor memory v, bytes32[] memory docs) = registry.getVisitorLog(pii);
        assertEq(v.piiHash, pii);
        assertEq(v.unitOwner, unitOwner);
        assertEq(v.unitId, UNIT_A);
        assertEq(v.visitStart, startTs);
        assertEq(v.visitEnd, endTs);
        assertEq(uint256(v.status), uint256(VisitorManagementRegistry.VisitorStatus.Approved));
        assertEq(docs.length, 0);
    }
}


