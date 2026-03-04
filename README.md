# AlarmClock ⏰

一个基于区块链的闹钟合约应用，用户存入 ETH 保证金 → 设置时间段 → 按时打卡取回存款，错过则没收归社区。

## 项目背景

这是为**黑客松比赛**设计的区块链应用，旨在通过激励机制帮助活动参与者准时参加。

## 技术栈

| 层级 | 技术 |
|------|------|
| 智能合约 | Solidity 0.8.20 + OpenZeppelin |
| 开发框架 | Foundry (Forge) |
| 测试 | Forge Std |
| 前端 | React 18 + Vite + Ethers.js |
| 钱包 | MetaMask |

## 核心功能

1. **创建闹钟** - 用户设置起始时间和结束时间，存入 ETH 保证金（**至少 0.01 ETH**）
2. **时间段验证** - 使用 `block.timestamp` 精确检测当前块时间，闹钟持续时间**不超过 1 小时**
3. **触发取回** - 在时间范围内调用 `triggerAlarm()` 取回存款 + 奖励
4. **过期没收** - 超过结束时间未触发，保证金归合约/社区
5. **提前取消** - 起始时间之前可取消，取回全部存款

## 合约架构

```
AlarmClock (核心合约)
├── createAlarm()      - 创建闹钟 + 存款
├── triggerAlarm()    - 触发并取回存款
├── cancelAlarm()     - 取消（起始时间前）
├── checkExpiredAlarm()- 检查过期状态
└── 事件
    ├── AlarmCreated
    ├── AlarmTriggered
    ├── AlarmExpired
    └── AlarmCancelled
```

## 安全特性

- ✅ **ReentrancyGuard** - 防止重入攻击
- ✅ **Ownable** - 管理员权限控制
- ✅ **输入验证** - 严格的参数检查
- ✅ **时间戳验证** - 防止前端篡改时间

## 快速开始

### 1. 安装依赖

```bash
cd alarmclock
forge install
cd frontend && npm install
```

### 2. 运行测试

```bash
forge test -vv
```

### 3. 部署合约

```bash
# 3.1 本地 Anvil / Hardhat 网络（推荐）
# 先启动本地节点，然后执行：
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url http://localhost:8545 \
  --broadcast

# 3.2 Sepolia 测试网
# 先在项目根目录复制 .env.example 为 .env，并填好：
# SEPOLIA_RPC_URL, PRIVATE_KEY, ETHERSCAN_API_KEY

# 使用 foundry.toml 中的 rpc_endpoints & etherscan 配置：
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url sepolia \
  --broadcast \
  --verify
```

### 4. 启动前端

```bash
cd frontend
npm run dev
```

## 测试覆盖

```bash
✓ testCreateAlarm              - 创建闹钟成功
✓ testCreateAlarmZeroAmount    - 金额为0应失败
✓ testCreateAlarmInvalidTimeRange - 无效时间范围
✓ testTriggerAlarm             - 时间范围内触发成功
✓ testTriggerAlarmNotYetStarted - 时间未到应失败
✓ testTriggerAlarmExpired      - 已过期应失败
✓ testCheckExpiredAlarmSuccess - 过期检查成功
✓ testCancelAlarm              - 取消成功
✓ testCancelAlarmAfterStart    - 起始时间后不能取消
✓ testTriggerAlarmNotOwner     - 非所有者不能触发
```

## 合约接口

```solidity
// 创建闹钟
function createAlarm(uint256 startTime, uint256 endTime) external payable returns (uint256);

// 触发闹钟（在时间范围内）
function triggerAlarm(uint256 alarmId) external;

// 取消闹钟（起始时间之前）
function cancelAlarm(uint256 alarmId) external;

// 检查过期
function checkExpiredAlarm(uint256 alarmId) external;

// 查询
function alarms(uint256 alarmId) external view returns (Alarm memory);
function getUserAlarms(address user) external view returns (uint256[]);
```

## 项目团队

| 角色 | GitHub |
|------|--------|
| Team Leader | - |
| Solidity Contract | [1131764933](https://github.com/1131764933) |
| Frontend | - |

## License

MIT
