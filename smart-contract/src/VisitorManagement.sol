// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Ownable} from "@openzeppelin-contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin-contracts/utils/ReentrancyGuard.sol";

/// Minimal interface to the factory to avoid circular imports
interface IPropertyManagementFactory {
    function getUnitOwner(string calldata unitId) external view returns (address);
    function getMaxVisitors(string calldata unitId) external view returns (uint256);
    function isAuthorized(address wallet) external view returns (bool);
}

/// VisitorManagement
///
/// Registry and lifecycle controller for already-approved visitor access to property units.
/// - Off-chain systems handle request, review, and approval; on-chain state starts as Approved.
/// - Stores immutable audit logs via events and minimal on-chain state.
/// - PII is stored off-chain; only a hash is stored on-chain.
/// - Enforces unit-level concurrent visitor capacity checks.
contract VisitorManagement is Ownable, ReentrancyGuard {
    /*//////////////////////////////////////////////////////////////
                                ERRORS
    //////////////////////////////////////////////////////////////*/
    error NotUnitOwner();
    error InvalidStatus();
    error CapacityFull();
    error NotAuthorized();

    /*//////////////////////////////////////////////////////////////
                              DATA TYPES
    //////////////////////////////////////////////////////////////*/
    enum VisitorStatus {
        Approved,
        CheckedIn,
        CheckedOut
    }

    struct Visitor {
        bytes32 piiHash;            // Hash of PII blob (primary identifier)
        address unitOwner;          // Resident (unit owner) who requested
        string unitId;              // Unit identifier managed by factory
        uint64 visitStart;          // Start of access window (unix secs)
        uint64 visitEnd;            // End of access window (unix secs)
        uint64 createdAt;           // Creation timestamp
        VisitorStatus status;       // Lifecycle status
        uint64 checkInAt;           // Timestamp when checked in
        uint64 checkOutAt;          // Timestamp when checked out
    }

    /*//////////////////////////////////////////////////////////////
                            STATE VARIABLES
    //////////////////////////////////////////////////////////////*/
    IPropertyManagementFactory s_propertyManagementFactory;

    // Main registry: piiHash => Visitor
    mapping(bytes32 => Visitor) private s_visitors;

    // Per unitOwner (resident): list of their visitor piiHashes
    mapping(address => bytes32[]) private s_visitorIdsByunitOwner;

    // Per unit: historical list of all visitor piiHashes
    mapping(string => bytes32[]) private s_visitorIdsByUnit;

    // Per unit: currently active (checked-in) visitor piiHashes
    mapping(string => bytes32[]) private s_activeVisitorIdsByUnit;
    mapping(string => uint256) private s_activeVisitorCountByUnit;

    // Visitor documents: e.g., additional proof hashes uploaded off-chain (kept for audit reads)
    mapping(bytes32 => bytes32[]) private s_visitorDocuments;

    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/
    // Creation lifecycle
    event VisitorEntryCreated(bytes32 indexed piiHash, address indexed unitOwner, string unitId);

    // Access lifecycle
    event VisitorCheckedIn(bytes32 indexed piiHash, string unitId, uint64 timestamp);
    event VisitorCheckedOut(bytes32 indexed piiHash, string unitId, uint64 timestamp);


    /*//////////////////////////////////////////////////////////////
                              MODIFIERS
    //////////////////////////////////////////////////////////////*/
    modifier onlyAuthorized() {
        if (msg.sender != owner() && !s_propertyManagementFactory.isAuthorized(msg.sender)) revert NotAuthorized();
        _;
    }

    /*//////////////////////////////////////////////////////////////
                             CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/
    constructor(address initialOwner, address factoryAddress) Ownable(initialOwner) {
        s_propertyManagementFactory = IPropertyManagementFactory(factoryAddress);
    }

    /*//////////////////////////////////////////////////////////////
                       PUBLIC / EXTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// getMyVisitors: Returns visitor IDs for the caller (pagination via offset/limit).
    /// @notice Lists visitor identifiers created for the caller's address.
    /// @param offset Start index for pagination.
    /// @param limit Maximum number of items to return.
    /// @return slice Array of visitor `piiHash` identifiers.
    function getMyVisitors(uint256 offset, uint256 limit) external view returns (bytes32[] memory) {
        bytes32[] storage allIds = s_visitorIdsByunitOwner[msg.sender];
        if (offset >= allIds.length) return new bytes32[](0);
        uint256 end = offset + limit;
        if (end > allIds.length) end = allIds.length;
        bytes32[] memory slice = new bytes32[](end - offset);
        for (uint256 i = 0; i < slice.length; i++) {
            slice[i] = allIds[offset + i];
        }
        return slice;
    }

    /// createVisitorEntry: Admin/backoffice creates a visitor on behalf of a resident.
    /// @notice Inserts a new visitor entry as already Approved (off-chain approval assumed).
    /// @dev Validates that `unitOwner` is indeed the registered owner for `unitId`.
    /// @param unitOwner The address of the resident who owns the unit.
    /// @param unitId The unit identifier managed by the factory.
    /// @param visitStart Start of access window in unix seconds.
    /// @param visitEnd End of access window in unix seconds.
    /// @param piiHash Hash of the off-chain PII blob; unique visitor identifier.
    /// @return The inserted visitor identifier `piiHash`.
    function createVisitorEntry(
        address unitOwner,
        string calldata unitId,
        uint64 visitStart,
        uint64 visitEnd,
        bytes32 piiHash
    ) external onlyOwner nonReentrant returns (bytes32) {
        if (s_propertyManagementFactory.getUnitOwner(unitId) != unitOwner) revert NotUnitOwner();

        // Optional early capacity check
        uint256 maxCap = s_propertyManagementFactory.getMaxVisitors(unitId);
        if (maxCap > 0 && s_activeVisitorCountByUnit[unitId] >= maxCap) revert CapacityFull();

        Visitor storage v = s_visitors[piiHash];
        v.unitOwner = unitOwner;
        v.unitId = unitId;
        v.piiHash = piiHash;
        v.visitStart = visitStart;
        v.visitEnd = visitEnd;
        v.createdAt = uint64(block.timestamp);
        // Off-chain approval is assumed. Store as Approved.
        v.status = VisitorStatus.Approved;

        s_visitorIdsByunitOwner[unitOwner].push(piiHash);
        s_visitorIdsByUnit[unitId].push(piiHash);

        emit VisitorEntryCreated(piiHash, unitOwner, unitId);
        return piiHash;
    }

    /// getVisitorLog: Returns the full visitor record for auditing.
    /// @notice Fetches a visitor's stored data and any associated document hashes.
    /// @param piiHash The visitor identifier.
    /// @return visitor The visitor record.
    /// @return documents The list of associated document hashes (if any).
    function getVisitorLog(bytes32 piiHash)
        external
        view
        returns (
            Visitor memory visitor,
            bytes32[] memory documents
        )
    {
        visitor = s_visitors[piiHash];
        documents = s_visitorDocuments[piiHash];
    }

    /// checkInVisitor: Checks in an Approved visitor if capacity allows.
    /// @notice Only the owner or an authorized wallet can perform check-ins.
    /// @param piiHash The visitor identifier to check in.
    function checkInVisitor(bytes32 piiHash) external onlyAuthorized nonReentrant {
        Visitor storage v = s_visitors[piiHash];
        if (v.status != VisitorStatus.Approved) revert InvalidStatus();
        uint256 maxCap = s_propertyManagementFactory.getMaxVisitors(v.unitId);
        if (maxCap > 0 && s_activeVisitorCountByUnit[v.unitId] >= maxCap) revert CapacityFull();

        v.status = VisitorStatus.CheckedIn;
        v.checkInAt = uint64(block.timestamp);
        s_activeVisitorCountByUnit[v.unitId] += 1;
        s_activeVisitorIdsByUnit[v.unitId].push(piiHash);
        emit VisitorCheckedIn(piiHash, v.unitId, v.checkInAt);
    }

    /// checkOutVisitor: Checks out a currently checked-in visitor and frees capacity.
    /// @notice Only the owner or an authorized wallet can perform check-outs.
    /// @param piiHash The visitor identifier to check out.
    function checkOutVisitor(bytes32 piiHash) external onlyAuthorized nonReentrant {
        Visitor storage v = s_visitors[piiHash];
        if (v.status != VisitorStatus.CheckedIn) revert InvalidStatus();
        v.status = VisitorStatus.CheckedOut;
        v.checkOutAt = uint64(block.timestamp);
        _removeActiveVisitor(v.unitId, piiHash);
        emit VisitorCheckedOut(piiHash, v.unitId, v.checkOutAt);
    }

    /// getActiveVisitors: Returns currently checked-in visitor IDs for a unit.
    /// @param unitId The unit identifier.
    /// @return Array of visitor identifiers that are currently checked in for the unit.
    function getActiveVisitors(string calldata unitId) external view returns (bytes32[] memory) {
        return s_activeVisitorIdsByUnit[unitId];
    }

    /// searchVisitorHistory: Returns visitor IDs for unit within [from,to] by creation time.
    /// @param unitId The unit identifier.
    /// @param fromTs Inclusive lower bound unix timestamp.
    /// @param toTs Inclusive upper bound unix timestamp.
    /// @param offset Pagination start index in the unit's historical list.
    /// @param limit Maximum number of results to return.
    /// @return result Array of visitor identifiers within the given time window.
    function searchVisitorHistory(
        string calldata unitId,
        uint64 fromTs,
        uint64 toTs,
        uint256 offset,
        uint256 limit
    ) external view returns (bytes32[] memory) {
        bytes32[] storage allIds = s_visitorIdsByUnit[unitId];
        if (offset >= allIds.length) return new bytes32[](0);
        uint256 end = offset + limit;
        if (end > allIds.length) end = allIds.length;
        // Pre-allocate with upper bound; fill as we filter
        bytes32[] memory buf = new bytes32[](end - offset);
        uint256 count = 0;
        for (uint256 i = offset; i < end; i++) {
            Visitor storage v = s_visitors[allIds[i]];
            if (v.createdAt >= fromTs && v.createdAt <= toTs) {
                buf[count++] = v.piiHash;
            }
        }
        // Resize copy to exact count
        bytes32[] memory result = new bytes32[](count);
        for (uint256 j = 0; j < count; j++) {
            result[j] = buf[j];
        }
        return result;
    }

    /*//////////////////////////////////////////////////////////////
                        INTERNAL / UTILITY LOGIC
    //////////////////////////////////////////////////////////////*/
    function _removeActiveVisitor(string memory unitId, bytes32 piiHash) internal {
        bytes32[] storage ids = s_activeVisitorIdsByUnit[unitId];
        for (uint256 i = 0; i < ids.length; i++) {
            if (ids[i] == piiHash) {
                // swap and pop
                ids[i] = ids[ids.length - 1];
                ids.pop();
                if (s_activeVisitorCountByUnit[unitId] > 0) {
                    s_activeVisitorCountByUnit[unitId] -= 1;
                }
                break;
            }
        }
    }
}