// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Script} from "forge-std/Script.sol";
import {PropertyManagementFactory} from "../src/PropertyManagementFactory.sol";

contract DeployFactory is Script {
    function run() external {
        vm.startBroadcast();
        PropertyManagementFactory factory = new PropertyManagementFactory();
        vm.stopBroadcast();

        factory; 
    }
}


