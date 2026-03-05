# 第三阶段：智能合约测试

> 预计时长：1-2 小时  
> 目标：编写测试用例，确保合约功能正确

## 3.1 课程目标

- 理解智能合约测试的重要性
- 掌握 Foundry 测试框架
- 编写完整的单元测试
- 理解测试覆盖的概念

## 3.2 为什么要测试？

### 3.2.1 区块链特殊性

```
传统应用 → 可以随时更新修复 bug
智能合约 → 部署后不可更改！
```

**一旦部署：**
- 代码公开透明
- 无法修改逻辑
- 任何人都可以调用
- 资金安全直接相关

### 3.2.2 测试金字塔

```
           /\
          /  \       E2E 测试 (端到端)
         /----\      少量，长期运行
        /      \
       /--------\   集成测试
      /          \
     /------------\ 单元测试
    /              大量，快速执行
```

## 3.3 Foundry 测试框架

### 3.3.1 简介

Foundry 是专为 Solidity 打造的开发框架，包含：
- **Forge** - 测试运行器
- **Cast** - 合约交互工具
- **Anvil** - 本地开发节点

### 3.3.2 测试文件结构

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../contracts/AlarmClock.sol";

contract AlarmClockTest is Test {
    AlarmClock public alarmClock;
    
    address public user1 = address(0x1);
    address public user2 = address(0x2);
    
    // 测试前准备
    function setUp() public {
        alarmClock = new AlarmClock();
        vm.deal(user1, 100 ether);  // 给测试用户充值
    }
    
    // 测试函数
    function testCreateAlarm() public {
        // 测试代码
    }
}
```

### 3.3.3 测试命令

```bash
# 运行所有测试
forge test

# 运行指定测试
forge test --match-test testCreateAlarm

# 详细输出
forge test -vv

# 显示测试覆盖
forge coverage
```

## 3.4 测试用例设计

### 3.4.1 功能测试

#### 测试：创建闹钟成功

```solidity
function testCreateAlarm() public {
    vm.prank(user1);  // 模拟 user1 发起交易
    
    uint256 startTime = block.timestamp + 1 hours;
    uint256 endTime = startTime + 30 minutes;
    
    uint256 alarmId = alarmClock.createAlarm{value: 1 ether}(startTime, endTime);
    
    // 验证返回值
    assertEq(alarmId, 1);
    
    // 验证状态变量
    assertEq(alarmClock.nextAlarmId(), 2);
    assertEq(alarmClock.totalDeposited(), 1 ether);
}
```

#### 测试：创建闹钟 - 金额为0应失败

```solidity
function testCreateAlarmZeroAmount() public {
    vm.prank(user1);
    uint256 startTime = block.timestamp + 1 hours;
    uint256 endTime = startTime + 30 minutes;
    
    // 期望 revert
    vm.expectRevert(abi.encodeWithSignature("ZeroAmount()"));
    alarmClock.createAlarm(startTime, endTime);
}
```

#### 测试：创建闹钟 - 金额低于最小值应失败

```solidity
function testCreateAlarmBelowMinDeposit() public {
    vm.prank(user1);
    uint256 startTime = block.timestamp + 1 hours;
    uint256 endTime = startTime + 30 minutes;
    
    vm.expectRevert(abi.encodeWithSignature("AmountTooSmall()"));
    alarmClock.createAlarm{value: 0.005 ether}(startTime, endTime);
}
```

### 3.4.2 时间相关测试

#### 测试：触发闹钟 - 时间未到应失败

```solidity
function testTriggerAlarmNotYetStarted() public {
    vm.prank(user1);
    uint256 startTime = block.timestamp + 1 hours;
    uint256 endTime = startTime + 30 minutes;
    uint256 alarmId = alarmClock.createAlarm{value: 1 ether}(startTime, endTime);
    
    // 还没到时间，触发应该失败
    vm.expectRevert(abi.encodeWithSignature("AlarmNotYetStarted()"));
    vm.prank(user1);
    alarmClock.triggerAlarm(alarmId);
}
```

#### 测试：触发闹钟 - 已过期应失败

```solidity
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
```

### 3.4.3 权限测试

#### 测试：非所有者不能触发

```solidity
function testTriggerAlarmNotOwner() public {
    vm.prank(user1);
    uint256 startTime = block.timestamp + 1 hours;
    uint256 endTime = startTime + 30 minutes;
    uint256 alarmId = alarmClock.createAlarm{value: 1 ether}(startTime, endTime);
    
    vm.warp(startTime + 30 minutes);
    
    // user2 尝试触发 user1 的闹钟
    vm.expectRevert(abi.encodeWithSignature("AlarmNotOwner()"));
    vm.prank(user2);
    alarmClock.triggerAlarm(alarmId);
}
```

### 3.4.4 边界条件测试

#### 测试：时间范围无效

```solidity
function testCreateAlarmInvalidTimeRange() public {
    vm.prank(user1);
    uint256 startTime = block.timestamp + 1 hours;
    uint256 endTime = startTime - 1 hours;  // 结束时间早于起始时间
    
    vm.expectRevert(abi.encodeWithSignature("InvalidTimeRange()"));
    alarmClock.createAlarm{value: 1 ether}(startTime, endTime);
}
```

#### 测试：持续时间超过最大限制

```solidity
function testCreateAlarmDurationTooLong() public {
    vm.prank(user1);
    uint256 startTime = block.timestamp + 1 hours;
    uint256 endTime = startTime + 2 hours;  // 超过 1 小时
    
    vm.expectRevert(abi.encodeWithSignature("DurationTooLong()"));
    alarmClock.createAlarm{value: 1 ether}(startTime, endTime);
}
```

## 3.5 常用测试命令

### 3.5.1 Forge 命令

```bash
# 运行所有测试
forge test

# 详细模式 (-v 添加更多 v)
forge test -vv

# 只运行匹配的测试
forge test --match-test "testCreate"

# 跳过某些测试
forge test --skip-test "testFail"

# 运行指定合约的测试
forge test --match-contract "AlarmClockTest"

# 查看测试覆盖
forge coverage
```

### 3.5.2 Cheat Codes

Forge 提供了特殊的 "Cheat Codes" 用于测试：

```solidity
// 模拟用户
vm.prank(user1);      // 下次调用使用 user1 地址
vm.startPrank(user1); // 开始模拟
vm.stopPrank();       // 停止模拟

// 操纵时间
vm.warp(timestamp);           // 设置区块时间
vm.roll(blockNumber);         // 设置区块号
vm.skip(seconds);             // 快进指定秒数
vm.rewind(seconds);           // 后退指定秒数

// 操纵余额
vm.deal(user, amount);        // 设置账户余额
vm.assertTrue(condition);     // 断言
```

## 3.6 测试运行演示

### 3.6.1 运行测试

```bash
forge test -vv
```

**预期输出：**
```
Running 10 tests for test/AlarmClock.t.sol:AlarmClockTest
[PASS] testCreateAlarm() (gas: 123456)
[PASS] testCreateAlarmZeroAmount() (gas: 23456)
[PASS] testCreateAlarmBelowMinDeposit() (gas: 23456)
[PASS] testTriggerAlarm() (gas: 234567)
[PASS] testTriggerAlarmNotYetStarted() (gas: 34567)
...
Test result: ok. 10 passed; 0 failed
```

## 3.7 本章小结

✅ 已掌握：
- Foundry 测试框架使用
- 功能测试用例编写
- 边界条件测试
- 权限测试
- 时间操纵测试

❓ 下章预告：
- React 前端开发
- 与智能合约交互

---

**练习题：**

1. 编写测试：测试取消闹钟功能
2. 编写测试：测试管理员提取没收金额
3. 思考：如何测试"并发调用"场景？
