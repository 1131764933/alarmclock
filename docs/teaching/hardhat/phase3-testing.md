# 第三阶段：智能合约测试 (Hardhat)

> 预计时长：1-2 小时  
> 目标：编写测试用例，确保合约功能正确

## 3.1 课程目标

- 理解智能合约测试的重要性
- 掌握 Hardhat + Waffle 测试框架
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
-相关

### 3.2. 资金安全直接2 测试金字塔

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

## 3.3 Hardhat 测试框架

### 3.3.1 技术栈

Hardhat 测试通常配合以下工具使用：

| 工具 | 功能 |
|------|------|
| **Mocha** | 测试框架 |
| **Chai** | 断言库 |
| **Waffle** | 智能合约测试 |

### 3.3.2 安装测试依赖

```bash
npm install --save-dev @nomicfoundation/hardhat-toolbox
```

`hardhat-toolbox` 已包含测试所需的所有依赖。

### 3.3.3 测试文件结构

```javascript
// test/alarmclock.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AlarmClock", function () {
  let alarmClock;
  let owner;
  let user;

  beforeEach(async () => {
    const AlarmClock = await ethers.getContractFactory("AlarmClock");
    alarmClock = await AlarmClock.deploy();
    await alarmClock.waitForDeployment();
    
    [owner, user] = await ethers.getSigners();
  });

  it("should create an alarm", async () => {
    const tx = await alarmClock.createAlarm(
      Math.floor(Date.now() / 1000) + 3600,
      Math.floor(Date.now() / 1000) + 7200,
      { value: ethers.parseEther("0.01") }
    );
    await tx.wait();
    
    const nextId = await alarmClock.nextAlarmId();
    expect(nextId).to.equal(2n);
  });
});
```

## 3.4 运行测试

### 3.4.1 基本命令

```bash
# 运行所有测试
npx hardhat test

# 运行特定测试文件
npx hardhat test test/alarmclock.js

# 运行特定测试
npx hardhat test --grep "should create"

# 查看详细输出
npx hardhat test --verbose
```

### 3.4.2 测试报告

```bash
# 运行测试并显示气体用量
REPORT_GAS=true npx hardhat test
```

## 3.5 编写测试用例

### 3.5.1 测试创建闹钟

```javascript
it("should create an alarm with valid params", async () => {
  const startTime = Math.floor(Date.now() / 1000) + 3600; // 1小时后
  const endTime = startTime + 1800; // 30分钟后
  
  const tx = await alarmClock.createAlarm(startTime, endTime, {
    value: ethers.parseEther("0.01")
  });
  await tx.wait();
  
  const alarm = await alarmClock.alarms(1n);
  expect(alarm.user).to.equal(owner.address);
  expect(alarm.amount).to.equal(ethers.parseEther("0.01"));
  expect(alarm.status).to.equal(0); // Pending
});
```

### 3.5.2 测试失败情况

```javascript
it("should fail with zero amount", async () => {
  const startTime = Math.floor(Date.now() / 1000) + 3600;
  const endTime = startTime + 1800;
  
  await expect(
    alarmClock.createAlarm(startTime, endTime, { value: 0 })
  ).to.be.revertedWith("ZeroAmount()");
});

it("should fail with invalid time range", async () => {
  const startTime = Math.floor(Date.now() / 1000) + 3600;
  const endTime = startTime - 1800; // 结束时间早于开始时间
  
  await expect(
    alarmClock.createAlarm(startTime, endTime, {
      value: ethers.parseEther("0.01")
    })
  ).to.be.revertedWith("InvalidTimeRange()");
});
```

### 3.5.3 测试时间相关功能

```javascript
it("should trigger alarm in time window", async () => {
  const startTime = Math.floor(Date.now() / 1000) + 3600;
  const endTime = startTime + 1800;
  
  // 创建闹钟
  await alarmClock.createAlarm(startTime, endTime, {
    value: ethers.parseEther("0.01")
  });
  
  // 快进时间
  await ethers.provider.send("evm_increaseTime", [3601]);
  await ethers.provider.send("evm_mine", []);
  
  // 触发闹钟
  const tx = await alarmClock.triggerAlarm(1n);
  await tx.wait();
  
  const alarm = await alarmClock.alarms(1n);
  expect(alarm.status).to.equal(1); // Triggered
});
```

### 3.5.4 模拟不同账户

```javascript
it("should not allow non-owner to trigger", async () => {
  const startTime = Math.floor(Date.now() / 1000) + 3600;
  const endTime = startTime + 1800;
  
  // user 创建闹钟
  await alarmClock.connect(user).createAlarm(startTime, endTime, {
    value: ethers.parseEther("0.01")
  });
  
  // owner 尝试触发
  await expect(alarmClock.triggerAlarm(1n))
    .to.be.revertedWith("AlarmNotOwner()");
});
```

## 3.6 测试覆盖的场景

### 3.6.1 成功场景

| 测试名称 | 描述 |
|---------|------|
| createAlarm | 成功创建闹钟 |
| triggerAlarm | 在时间窗口内触发 |
| cancelAlarm | 开始前取消 |
| checkExpiredAlarm | 检查过期闹钟 |

### 3.6.2 失败场景

| 测试名称 | 描述 |
|---------|------|
| createAlarmZeroAmount | 零金额创建 |
| createAlarmInvalidTimeRange | 无效时间范围 |
| createAlarmPastTime | 过去的时间 |
| triggerAlarmNotStarted | 未到开始时间 |
| triggerAlarmAlreadyEnded | 已超过结束时间 |
| triggerNotOwner | 非所有者触发 |

## 3.7 常见测试问题

### Q: 时间相关测试不稳定?

使用 Hardhat 的时间控制:

```javascript
// 快进时间
await ethers.provider.send("evm_increaseTime", [seconds]);

// 挖一个新块
await ethers.provider.send("evm_mine", []);

// 设置特定时间
await ethers.provider.send("evm_setNextBlockTimestamp", [timestamp]);
```

### Q: 如何测试 ETH 转账?

```javascript
// 检查合约余额
expect(await ethers.provider.getBalance(contractAddress))
  .to.equal(ethers.parseEther("1"));
```

### Q: 测试失败怎么办?

1. 查看详细错误信息
2. 使用 `console.log` 调试
3. 检查时间是否正确设置

## 3.8 本章小结

✅ 已掌握:
- Hardhat 测试框架使用
- 编写 Mocha/Chai 测试用例
- 测试成功和失败场景
- 运行测试并解读结果

❓ 下章预告:
- 前端开发基础
- React + Ethers.js 连接合约

---

**练习题:**

1. 为 "管理员提取没收金额" 功能编写测试
2. 添加一个测试：创建多个闹钟，检查 nextAlarmId 是否正确递增
3. 思考：如何测试 "重入攻击" 防护是否有效？
