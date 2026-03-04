// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "../contracts/AlarmClock.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        AlarmClock alarmClock = new AlarmClock();
        console.log("Deploying AlarmClock...");
        console.log("  Chain ID:", block.chainid);
        console.log("  Deployer:", msg.sender);
        console.log("  AlarmClock deployed at:", address(alarmClock));

        vm.stopBroadcast();
    }
}
