# AlarmClock 项目介绍话术

---

## 📝 中文介绍

### 1. 项目概述（30秒）

> AlarmClock 是一个基于以太坊的区块链闹钟应用，我主要负责智能合约开发。
> 
> 核心功能是：用户存入 ETH 保证金 → 设置一个时间段的闹钟 → 如果按时触发（打卡），就能取回全部存款；如果超时未触发，保证金就归社区所有。
> 
> 这个设计是为了激励大家准时参加黑客松活动。

### 2. 技术实现（1分钟）

> **合约层面**，我使用了 Solidity 0.8.19 + OpenZeppelin 库，主要包含这几个核心功能：
> 
> 1. **时间验证**：使用 `block.timestamp` 获取区块时间戳，确保用户不能在时间范围外触发
> 2. **状态机设计**：Pending → Triggered/Expired/Cancelled，不同状态有不同的操作权限
> 3. **重入防护**：引入 `ReentrancyGuard`，防止递归调用攻击
> 4. **权限控制**：使用 `Ownable`，只有合约所有者可以提取没收的资金
> 
> **测试方面**，我用 Foundry 写了完整的单元测试，覆盖了创建、触发、取消、过期等核心场景，所有测试都通过了。

### 3. 亮点与挑战（30秒）

> 最大的挑战是**时间窗口的设计**。如果用户创建了一个过去的闹钟时间怎么办？如果在临界点触发怎么处理？
> 
> 我的解决方案是：要求起始时间必须是未来的时间，并且在时间范围外增加状态检查，确保不会出现边界问题。
> 
> 这个项目让我对 Solidity 的时间处理、状态机设计、测试驱动开发有了更深的理解。

---

## 🇺🇸 English Introduction

### 1. Project Overview (30 seconds)

> AlarmClock is an Ethereum-based blockchain alarm application. I was responsible for smart contract development.
> 
> The core mechanism: users deposit ETH as collateral → set an alarm time window → if they trigger (check-in) on time, they get their deposit back; if they miss the deadline, the funds go to the community.
> 
> This was designed to incentivize hackathon participants to show up on time.

### 2. Technical Implementation (1 minute)

> On the contract side, I used **Solidity 0.8.19 + OpenZeppelin**. The main features include:
> 
> 1. **Time Validation**: Using `block.timestamp` to get the current block time, ensuring users cannot trigger outside the valid time window
> 2. **State Machine**: Pending → Triggered/Expired/Cancelled, with different operation permissions for each state
> 3. **Reentrancy Protection**: Using `ReentrancyGuard` to prevent recursive call attacks
> 4. **Access Control**: Using `Ownable`, only the contract owner can withdraw forfeited funds
> 
> For testing, I used **Foundry** to write comprehensive unit tests covering create, trigger, cancel, and expiry scenarios. All tests passed.

### 3. Highlights & Challenges (30 seconds)

> The biggest challenge was **designing the time window logic**. What if a user creates an alarm with a past timestamp? What happens at the exact boundary?
> 
> My solution: require start time to be in the future, and add state checks to prevent edge cases.
> 
> This project deepened my understanding of Solidity time handling, state machine design, and test-driven development.

---

## 🎯 面试官可能问的问题 + 答案

### Q1: 为什么用 block.timestamp？不怕矿工操纵吗？

> 答：这是一个很好的问题。对于这个场景，**block.timestamp 是合适的**，因为：
> 1. 我们的时间窗口是**小时级别**（1-3小时），矿工最多只能操纵十几秒，对结果没有影响
> 2. 如果要更精确，可以用 Chainlink 的时间戳预言机，但对于这个场景来说过度设计了
> 3. 核心是**激励用户准时**，而不是精确到秒

### Q2: 如何防止重入攻击？

> 答：我使用了 OpenZeppelin 的 `ReentranscyGuard`，它通过一个 `nonReentrant` 修饰器来防止递归调用。具体来说：
> - 在 `createAlarm`、`triggerAlarm`、`cancelAlarm` 等函数上都加了这个修饰器
> - 每次调用前检查 `locked` 状态，调用后重置

### Q3: 合约的 Gas 优化做了什么？

> 答：主要有两个优化：
> 1. **使用 mapping 代替数组遍历**：用户闹钟列表用 `mapping(address => uint256[])` 存储，查询是 O(1)
> 2. **尽量减少 Sstore**：只在状态变化时更新，合理使用 `storage` 和 `memory`

### Q4: 如果用户错过了时间，保证金去哪里了？

> 答：保证金会留在合约里。任何人都可以调用 `checkExpiredAlarm()` 来标记过期的闹钟，标记后状态变为 `Expired`，金额计入 `totalForfeited`。管理员（Owner）可以调用 `withdrawForfeited()` 提取这些资金用于社区建设。

---

## 💡 补充：与简历项目的关联话术

> 除了这个 AlarmClock 项目，我的简历里还有三个区块链项目：
> 
> 1. **MDLedger** - 一个行为记录平台，用 React + viem.js + IPFS，跟这个项目的前端技术栈类似
> 2. **RNT Staking** - 质押挖矿，让我对 DeFi 合约的代币经济学有深入理解
> 3. **NFT Marketplace** - 包含 UUPS 升级和离线签名，展示了合约扩展能力
> 
> 我觉得 AlarmClock 这个项目最能体现我在**智能合约安全**和**时间逻辑处理**方面的能力。
