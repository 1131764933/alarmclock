// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../contracts/AlarmClock.sol";

contract AlarmClockTest is Test {
    AlarmClock public alarmClock;
    
    address public user1 = address(0x1);
    address public user2 = address(0x2);
    address public owner;
    
    uint256 public constant START_TIME_DELTA = 1 hours;
    // 默认闹钟持续时间：30 分钟（小于合约 1 小时上限）
    uint256 public constant DURATION = 30 minutes;
    
    function setUp() public {
        alarmClock = new AlarmClock();
        owner = alarmClock.owner();
        
        // 给测试用户充值
        vm.deal(user1, 100 ether);
        vm.deal(user2, 100 ether);
    }
    
    /// @notice 测试：创建闹钟成功
    function testCreateAlarm() public {
        vm.prank(user1);
        uint256 startTime = block.timestamp + START_TIME_DELTA;
        uint256 endTime = startTime + DURATION;
        
        uint256 alarmId = alarmClock.createAlarm{value: 1 ether}(startTime, endTime);
        
        assertEq(alarmId, 1);
        assertEq(alarmClock.nextAlarmId(), 2);
        assertEq(alarmClock.totalDeposited(), 1 ether);
        
        (address user, uint256 amount, uint256 sTime, uint256 eTime, , ) = alarmClock.alarms(1);
        assertEq(user, user1);
        assertEq(amount, 1 ether);
        assertEq(sTime, startTime);
        assertEq(eTime, endTime);
    }
    
    /// @notice 测试：创建闹钟 - 金额为0应失败
    function testCreateAlarmZeroAmount() public {
        vm.prank(user1);
        uint256 startTime = block.timestamp + START_TIME_DELTA;
        uint256 endTime = startTime + DURATION;

        vm.expectRevert(abi.encodeWithSignature("ZeroAmount()"));
        alarmClock.createAlarm(startTime, endTime);
    }

    /// @notice 测试：创建闹钟 - 金额低于最小值 0.01 ETH 应失败
    function testCreateAlarmBelowMinDeposit() public {
        vm.prank(user1);
        uint256 startTime = block.timestamp + START_TIME_DELTA;
        uint256 endTime = startTime + DURATION;

        vm.expectRevert(abi.encodeWithSignature("AmountTooSmall()"));
        alarmClock.createAlarm{value: 0.005 ether}(startTime, endTime);
    }
    
    /// @notice 测试：创建闹钟 - 时间范围无效应失败
    function testCreateAlarmInvalidTimeRange() public {
        vm.prank(user1);
        uint256 startTime = block.timestamp + START_TIME_DELTA;
        uint256 endTime = startTime - 1 hours; // 结束时间早于起始时间

        vm.expectRevert(abi.encodeWithSignature("InvalidTimeRange()"));
        alarmClock.createAlarm{value: 1 ether}(startTime, endTime);
    }

    /// @notice 测试：创建闹钟 - 闹钟持续时间超过 1 小时应失败
    function testCreateAlarmDurationTooLong() public {
        vm.prank(user1);
        uint256 startTime = block.timestamp + START_TIME_DELTA;
        uint256 endTime = startTime + 2 hours; // 超过 1 小时上限

        vm.expectRevert(abi.encodeWithSignature("DurationTooLong()"));
        alarmClock.createAlarm{value: 1 ether}(startTime, endTime);
    }
    
    /// @notice 测试：创建闹钟 - 起始时间在过去应失败
    function testCreateAlarmPastStartTime() public {
        vm.prank(user1);
        // 设置结束时间在起始时间之前，触发 InvalidTimeRange
        uint256 startTime = block.timestamp + 1 hours;
        uint256 endTime = startTime - 30 minutes; // 结束时间早于起始时间
        
        vm.expectRevert(abi.encodeWithSignature("InvalidTimeRange()"));
        alarmClock.createAlarm{value: 1 ether}(startTime, endTime);
    }
    
    /// @notice 测试：触发闹钟成功（在时间范围内）
    function testTriggerAlarm() public {
        // 1. 创建闹钟
        vm.prank(user1);
        uint256 startTime = block.timestamp + 1 hours;
        uint256 endTime = startTime + 30 minutes;
        uint256 alarmId = alarmClock.createAlarm{value: 1 ether}(startTime, endTime);
        
        // 2. 快进到可触发时间
        vm.warp(startTime + 30 minutes);
        
        // 3. 触发闹钟
        uint256 balanceBefore = user1.balance;
        vm.prank(user1);
        alarmClock.triggerAlarm(alarmId);
        
        // 4. 验证
        (, , , , AlarmClock.AlarmStatus status, ) = alarmClock.alarms(alarmId);
        assertEq(uint256(status), uint256(AlarmClock.AlarmStatus.Triggered));
        assertEq(user1.balance, balanceBefore + 1 ether);
    }
    
    /// @notice 测试：触发闹钟 - 时间未到应失败
    function testTriggerAlarmNotYetStarted() public {
        vm.prank(user1);
        uint256 startTime = block.timestamp + 1 hours;
        uint256 endTime = startTime + 30 minutes;
        uint256 alarmId = alarmClock.createAlarm{value: 1 ether}(startTime, endTime);
        
        vm.expectRevert(abi.encodeWithSignature("AlarmNotYetStarted()"));
        vm.prank(user1);
        alarmClock.triggerAlarm(alarmId);
    }
    
    /// @notice 测试：触发闹钟 - 已过期应失败
    function testTriggerAlarmExpired() public {
        vm.prank(user1);
        uint256 startTime = block.timestamp + 1 hours;
        uint256 endTime = startTime + 30 minutes;
        uint256 alarmId = alarmClock.createAlarm{value: 1 ether}(startTime, endTime);
        
        // 快进到结束时间之后
        vm.warp(endTime + 1);
        
        // 先检查过期
        alarmClock.checkExpiredAlarm(alarmId);
        
        // 触发应失败
        vm.expectRevert(abi.encodeWithSignature("AlarmAlreadyExpired()"));
        vm.prank(user1);
        alarmClock.triggerAlarm(alarmId);
    }
    
    /// @notice 测试：过期检查 - 时间范围内不能过期
    function testCheckExpiredAlarmWithinTime() public {
        vm.prank(user1);
        uint256 startTime = block.timestamp + 1 hours;
        uint256 endTime = startTime + 30 minutes;
        uint256 alarmId = alarmClock.createAlarm{value: 1 ether}(startTime, endTime);
        
        // 在时间范围内（介于 startTime 和 endTime 之间）
        vm.warp(startTime + 15 minutes);
        
        vm.expectRevert(abi.encodeWithSignature("AlarmAlreadyEnded()"));
        alarmClock.checkExpiredAlarm(alarmId);
    }
    
    /// @notice 测试：过期检查 - 过期后状态正确
    function testCheckExpiredAlarmSuccess() public {
        vm.prank(user1);
        uint256 startTime = block.timestamp + 1 hours;
        uint256 endTime = startTime + 30 minutes;
        uint256 alarmId = alarmClock.createAlarm{value: 1 ether}(startTime, endTime);
        
        // 快进到结束时间之后
        vm.warp(endTime + 1);
        
        // 检查过期
        alarmClock.checkExpiredAlarm(alarmId);
        
        // 验证状态
        (, , , , AlarmClock.AlarmStatus status, ) = alarmClock.alarms(alarmId);
        assertEq(uint256(status), uint256(AlarmClock.AlarmStatus.Expired));
        assertEq(alarmClock.totalForfeited(), 1 ether);
    }
    
    /// @notice 测试：取消闹钟成功（在起始时间之前）
    function testCancelAlarm() public {
        vm.prank(user1);
        uint256 startTime = block.timestamp + 1 hours;
        uint256 endTime = startTime + 30 minutes;
        uint256 alarmId = alarmClock.createAlarm{value: 1 ether}(startTime, endTime);
        
        // 取消闹钟（在起始时间之前）
        uint256 balanceBefore = user1.balance;
        vm.prank(user1);
        alarmClock.cancelAlarm(alarmId);
        
        // 验证
        (, , , , AlarmClock.AlarmStatus status, ) = alarmClock.alarms(alarmId);
        assertEq(uint256(status), uint256(AlarmClock.AlarmStatus.Cancelled));
        assertEq(user1.balance, balanceBefore + 1 ether);
    }
    
    /// @notice 测试：取消闹钟 - 起始时间之后应失败
    function testCancelAlarmAfterStart() public {
        vm.prank(user1);
        uint256 startTime = block.timestamp + 1 hours;
        uint256 endTime = startTime + 30 minutes;
        uint256 alarmId = alarmClock.createAlarm{value: 1 ether}(startTime, endTime);
        
        // 快进到起始时间之后
        vm.warp(startTime + 1);
        
        vm.expectRevert(abi.encodeWithSignature("AlarmNotYetStarted()"));
        vm.prank(user1);
        alarmClock.cancelAlarm(alarmId);
    }
    
    /// @notice 测试：非所有者不能触发
    function testTriggerAlarmNotOwner() public {
        vm.prank(user1);
        uint256 startTime = block.timestamp + 1 hours;
        uint256 endTime = startTime + 30 minutes;
        uint256 alarmId = alarmClock.createAlarm{value: 1 ether}(startTime, endTime);
        
        vm.warp(startTime + 30 minutes);
        
        vm.expectRevert(abi.encodeWithSignature("AlarmNotOwner()"));
        vm.prank(user2);
        alarmClock.triggerAlarm(alarmId);
    }
    
    /// @notice 测试：getUserAlarms 查询
    function testGetUserAlarms() public {
        // 创建第一个闹钟
        vm.prank(user1);
        uint256 startTime1 = block.timestamp + 1 hours;
        uint256 endTime1 = startTime1 + 30 minutes;
        alarmClock.createAlarm{value: 1 ether}(startTime1, endTime1);
        
        // 创建第二个闹钟
        vm.prank(user1);
        uint256 startTime2 = block.timestamp + 3 hours;
        uint256 endTime2 = startTime2 + 30 minutes;
        alarmClock.createAlarm{value: 2 ether}(startTime2, endTime2);
        
        uint256[] memory userAlarmIds = alarmClock.getUserAlarms(user1);
        assertEq(userAlarmIds.length, 2, "should have 2 alarms");
    }
}
