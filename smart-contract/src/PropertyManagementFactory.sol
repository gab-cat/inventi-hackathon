// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Ownable} from "@openzeppelin-contracts/access/Ownable.sol";
import {VisitorManagementRegistry} from "./VisitorManagementRegistry.sol";

/**
 * @title PropertyManagementFactory
 * @notice Admin-owned registry for property units that maps a string `unitId` to
 *         its owner and a max concurrent visitor capacity.
 * @dev
 * - Inherits `Ownable`; only the contract owner can mutate state (register units,
 *   update capacities, or transfer unit ownership).
 * - Deploys a linked `VisitorManagement` registry in the constructor and exposes
 *   its address via `getVisitorManagementRegistry()`.
 * - Stores units in `s_unitById` and maintains a reverse index `s_unitIdsByOwner`.
 * - Emits `UnitRegistered`, `UnitCapacityUpdated`, and `UnitOwnerUpdated` on changes.
 *
 * Key concepts
 * - Unit identifier: an arbitrary, unique string (e.g., "A-101").
 * - Capacity: this contract stores the max visitor capacity per unit; it does not
 *   itself enforce it in business logic here.
 * - Ownership transfer: updates both the primary record and the reverse index.
 */

contract PropertyManagementFactory is Ownable {
    /*//////////////////////////////////////////////////////////////
                                ERRORS
    //////////////////////////////////////////////////////////////*/
    
    error PropertyManagementFactory__InvalidOwner();
    error PropertyManagementFactory__InvalidUnitId();
    error PropertyManagementFactory__UnitExists();
    error PropertyManagementFactory__UnitNotFound();
    error PropertyManagementFactory__InvalidMaxVisitors();
    error PropertyManagementFactory__InvalidUnitOwner();
    error PropertyManagementFactory__ZeroAddress();

    /*//////////////////////////////////////////////////////////////
                            STATE VARIABLES
    //////////////////////////////////////////////////////////////*/

    /// @notice Unit record managed by this factory
    struct Unit {
        string unitNumber;
        uint256 maxVisitorCapacity;
        address unitOwner;
    }

    /// @notice unitId => Unit
    mapping(string => Unit) private s_unitById;

    /// @notice owner => unitIds[]
    mapping(address => string[]) private s_unitIdsByOwner;

    /// @notice Visitor management registry
    VisitorManagementRegistry private s_visitorManagementRegistry;

    /// @notice Authorized wallets allowed to perform privileged actions in the system
    mapping(address => bool) private s_authorizedWallets;

    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/
    event PropertyManagementFactory__UnitRegistered(string unitId, address unitOwner, uint256 maxVisitors);
    event PropertyManagementFactory__UnitCapacityUpdated(string unitId, uint256 oldCapacity, uint256 newCapacity);
    event PropertyManagementFactory__UnitOwnerUpdated(string unitId, address oldOwner, address newOwner);
    event PropertyManagementFactory__AuthorizedWalletAdded(address indexed wallet);
    event PropertyManagementFactory__AuthorizedWalletRemoved(address indexed wallet);

    /*//////////////////////////////////////////////////////////////
                             CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor() Ownable(msg.sender) {
        s_visitorManagementRegistry = new VisitorManagementRegistry(owner(), address(this));
    }

    /*//////////////////////////////////////////////////////////////
                        EXTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Authorize a wallet to perform privileged actions (e.g., check-in/out in VisitorManagement).
     * @dev Access: onlyOwner (property admin)
     * @param wallet Address to authorize
     */
    function authorizeWallet(address wallet) external onlyOwner {
        if (wallet == address(0)) revert PropertyManagementFactory__ZeroAddress();
        if (!s_authorizedWallets[wallet]) {
            s_authorizedWallets[wallet] = true;
            emit PropertyManagementFactory__AuthorizedWalletAdded(wallet);
        }
    }

    /**
     * @notice Revoke a wallet's authorization.
     * @dev Access: onlyOwner (property admin)
     * @param wallet Address to revoke
     */
    function revokeWallet(address wallet) external onlyOwner {
        if (wallet == address(0)) revert PropertyManagementFactory__ZeroAddress();
        if (s_authorizedWallets[wallet]) {
            s_authorizedWallets[wallet] = false;
            emit PropertyManagementFactory__AuthorizedWalletRemoved(wallet);
        }
    }

    /**
     * @notice Returns whether a wallet is authorized for privileged actions.
     * @param wallet Wallet to check
     */
    function isAuthorized(address wallet) external view returns (bool) {
        if (wallet == owner()) return true;
        return s_authorizedWallets[wallet];
    }

    /** 
     * @notice Registers a new unit with an owner and maximum visitor capacity.
     *  @dev Access: onlyOwner (property admin).
     *      Reverts if:
     *      - `unitOwner` is the zero address (`PropertyManagementFactory__InvalidOwner`).
     *      - `unitId` is empty (`PropertyManagementFactory__InvalidUnitId`).
     *      - a unit with `unitId` already exists (`PropertyManagementFactory__UnitExists`).
     *      Emits a `UnitRegistered` event on success.
     * @param unitOwner The address that will be marked as the owner of the unit.
     * @param unitId The unique string identifier for the unit (e.g., "A-101").
     * @param maxVisitors The maximum number of concurrent visitors allowed for the unit.
     * @custom:access onlyOwner 
    */
    function registerUnit(address unitOwner, string calldata unitId, uint256 maxVisitors) external onlyOwner {
        if (unitOwner == address(0)) revert PropertyManagementFactory__InvalidOwner();
        if (bytes(unitId).length == 0) revert PropertyManagementFactory__InvalidUnitId();
        if (s_unitById[unitId].unitOwner != address(0)) revert PropertyManagementFactory__UnitExists();

        s_unitById[unitId] = Unit({
            unitNumber: unitId,
            maxVisitorCapacity: maxVisitors,
            unitOwner: unitOwner
        });
        s_unitIdsByOwner[unitOwner].push(unitId);

        emit PropertyManagementFactory__UnitRegistered(unitId, unitOwner, maxVisitors);
    }

    /** 
     * @notice Updates the maximum visitor capacity for an existing unit.
     * @dev Access: onlyOwner (property admin).
     *      Reverts if:
     *      - `unitId` is empty (`PropertyManagementFactory__InvalidUnitId`).
     *      - no unit exists for `unitId` (`PropertyManagementFactory__UnitNotFound`).
     *      Emits a `UnitCapacityUpdated` event on success.
     * @param unitId The unique string identifier for the unit to update.
     * @param newMaxVisitors The new maximum number of concurrent visitors allowed.
     * @custom:access onlyOwner
    */
    function updateUnitCapacity(string calldata unitId, uint256 newMaxVisitors) external onlyOwner {
        if (bytes(unitId).length == 0) revert PropertyManagementFactory__InvalidUnitId();
        if (s_unitById[unitId].unitOwner == address(0)) revert PropertyManagementFactory__UnitNotFound();
        uint256 old = s_unitById[unitId].maxVisitorCapacity;
        s_unitById[unitId].maxVisitorCapacity = newMaxVisitors;
        emit PropertyManagementFactory__UnitCapacityUpdated(unitId, old, newMaxVisitors);
    }

    /** 
     * @notice Transfers the ownership of a unit to a new owner address.
     * @dev Access: onlyOwner (property admin).
     *      Reverts if:
     *      - `unitId` is empty (`PropertyManagementFactory__InvalidUnitId`).
     *      - `newOwner` is the zero address (`PropertyManagementFactory__InvalidOwner`).
     *      - the unit does not exist (`PropertyManagementFactory__UnitNotFound`).
     *      Updates both the primary record and the reverse index.
     *      Emits a `UnitOwnerUpdated` event on success.
     * @param unitId The unique string identifier for the unit being transferred.
     * @param newOwner The address that will become the new owner of the unit.
     * @custom:access onlyOwner
    */
    function setUnitOwner(string calldata unitId, address newOwner) external onlyOwner {
        if (bytes(unitId).length == 0) revert PropertyManagementFactory__InvalidUnitId();
        if (newOwner == address(0)) revert PropertyManagementFactory__InvalidOwner();
        address oldOwner = s_unitById[unitId].unitOwner;
        if (oldOwner == address(0)) revert PropertyManagementFactory__UnitNotFound();

        // Remove unitId from old owner's list
        _removeOwnerUnit(oldOwner, unitId);

        s_unitById[unitId].unitOwner = newOwner;
        s_unitIdsByOwner[newOwner].push(unitId);
        emit PropertyManagementFactory__UnitOwnerUpdated(unitId, oldOwner, newOwner);
    }

    /*//////////////////////////////////////////////////////////////
                        VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/
    /// @notice Returns all unit IDs owned by the given address.
    function getUnitIds(address _unitOwner) external view returns (string[] memory) {
        string[] storage ids = s_unitIdsByOwner[_unitOwner];
        string[] memory copy = new string[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            copy[i] = ids[i];
        }
        return copy;
    }

    /// @notice Returns how many units an owner controls.
    function getUnitCount(address _unitOwner) external view returns (uint256) {
        return s_unitIdsByOwner[_unitOwner].length;
    }

    /// @notice Returns the current owner address for a given unit identifier.
    function getUnitOwner(string calldata unitId) external view returns (address) {
        return s_unitById[unitId].unitOwner;
    }

    /// @notice Returns the maximum allowed concurrent visitors for the unit.
    function getMaxVisitors(string calldata unitId) external view returns (uint256) {
        return s_unitById[unitId].maxVisitorCapacity;
    }

    /// @notice Convenience getter for the linked registry address
    function getVisitorManagementRegistry() external view returns (address) {
        return address(s_visitorManagementRegistry);
    }

    /*//////////////////////////////////////////////////////////////
                        INTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/
    /// @notice Removes a unit from the owner's list of units
    function _removeOwnerUnit(address owner, string calldata unitId) internal {
        string[] storage ids = s_unitIdsByOwner[owner];
        for (uint256 i = 0; i < ids.length; i++) {
            // String comparison via keccak256 since direct == is not supported for storage strings
            if (keccak256(bytes(ids[i])) == keccak256(bytes(unitId))) {
                // swap & pop
                ids[i] = ids[ids.length - 1];
                ids.pop();
                break;
            }
        }
    }
}