# AlarmClock ⏰

一个基于区块链的闹钟合约应用，用户存入 ETH 保证金 → 设置时间段 → 按时打卡取回存款，错过则没收归社区。

## 项目背景

这是为**黑客松比赛**设计的区块链应用，旨在通过激励机制帮助活动参与者准时参加。

## 技术栈

| 层级 | 技术 |
|------|------|
| 智能合约 | Solidity 0.8.20 + OpenZeppelin |
| 开发框架 | Foundry (主) + Hardhat (备选) |
| 测试 | Forge Std / Mocha + Chai |
| 前端 | React 18 + Vite + Ethers.js |
| 钱包 | MetaMask |

## 核心功能

1. **创建闹钟** - 用户设置起始时间和结束时间，存入 ETH 保证金（**至少 0.01 ETH**）
2. **时间段验证** - 使用 `block.timestamp` 精确检测当前块时间，闹钟持续时间**不超过 1 小时**
3. **触发取回** - 在时间范围内调用 `triggerAlarm()` 取回存款
4. **过期没收** - 超过结束时间未触发，保证金归合约/社区
5. **提前取消** - 起始时间之前可取消，取回全部存款

## 合约架构

```
AlarmClock (核心合约)
├── createAlarm()      - 创建闹钟 + 存款
├── triggerAlarm()    - 触发并取回存款
├── cancelAlarm()     - 取消（起始时间前）
├── checkExpiredAlarm()- 检查过期状态
├── withdrawForfeited()- 管理员提取没收金额
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

### 2. 启动本地区块链

```bash
# 使用 Anvil (Foundry)
anvil --chain-id 31337 --host 127.0.0.1 --port 8545
```

### 3. 部署合约

```bash
# 使用 Foundry
forge create --rpc-url http://127.0.0.1:8545 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  --broadcast \
  contracts/AlarmClock.sol:AlarmClock
```

### 4. 配置前端

```bash
cd frontend
cp .env.example .env
# 编辑 .env，填入合约地址 VITE_CONTRACT_ADDRESS_31337=0x...
```

### 5. 启动前端

```bash
npm run dev
```

## 运行测试

```bash
# Foundry 测试
forge test -vv

# Hardhat 测试
npx hardhat test
```

## 测试覆盖

```
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

// 管理员提取没收金额
function withdrawForfeited(uint256 amount) external;

// 查询
function alarms(uint256 alarmId) external view returns (Alarm memory);
function getUserAlarms(address user) external view returns (uint256[]);
```

## 项目结构

```
alarmclock/
├── contracts/           # 智能合约 (Foundry)
│   └── AlarmClock.sol
├── test/               # 测试 (Foundry)
│   └── AlarmClock.t.sol
├── script/             # 部署脚本 (Foundry)
│   └── Deploy.s.sol
├── scripts/            # Hardhat 脚本
│   └── deploy.js
├── frontend/           # React 前端
│   ├── src/
│   │   ├── App.jsx
│   │   └── components/
│   │       ├── AlarmItem.jsx
│   │       ├── CreateAlarmForm.jsx
│   │       ├── Stats.jsx
│   │       └── AdminPanel.jsx
│   └── package.json
├── foundry.toml         # Foundry 配置
├── hardhat.config.js   # Hardhat 配置
└── package.json        # 项目依赖
```

## 教学文档

详细的开发教程请查看 [docs/teaching](./docs/teaching/) 目录：

### Foundry 版本 (推荐)
- [环境搭建](./docs/teaching/foundry/phase1-env-setup.md)
- [智能合约开发](./docs/teaching/foundry/phase2-smart-contract.md)
- [测试](./docs/teaching/foundry/phase3-testing.md)
- [前端开发](./docs/teaching/foundry/phase4-frontend.md)
- [部署上线](./docs/teaching/foundry/phase5-deployment.md)

### Hardhat 版本
- [环境搭建](./docs/teaching/hardhat/phase1-env-setup.md)
- [智能合约开发](./docs/teaching/hardhat/phase2-smart-contract.md)
- [测试](./docs/teaching/hardhat/phase3-testing.md)
- [前端开发](./docs/teaching/hardhat/phase4-frontend.md)
- [部署上线](./docs/teaching/hardhat/phase5-deployment.md)

## 测试账号

Anvil 启动后会提供 10 个测试账号：

| 账号 | 地址 | 私钥 |
|------|------|------|
| #0 | 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 | 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 |
| #1 | 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 | 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d |

⚠️ **注意**: 这些是测试账号，私钥公开，仅用于本地开发！

## License

MIT
