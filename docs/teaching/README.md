# AlarmClock DApp 教学文档

> 从零开始学习区块链 DApp 开发

## 文档结构

本教程提供 **两种开发框架** 的完整指南：

### 选择你的框架

| 框架 | 文档 | 特点 |
|------|------|------|
| **Foundry** | [查看](./foundry/) | 快、现代、Rust 实现 |
| **Hardhat** | [查看](./hardhat/) | 传统、JavaScript、生态丰富 |

---

## 快速开始

### 1. 选择开发框架

**推荐使用 Foundry**（本项目默认）：
- 编译速度快
- 测试效率高
- 内置本地区块链

**使用 Hardhat**（备选）：
- JavaScript/TypeScript
- 插件生态丰富
- 更多教程资源

### 2. 环境要求

**通用要求：**
- Node.js 18+
- Git

**Foundry 额外要求：**
- Rust
- Cargo

**Hardhat 额外要求：**
- Node.js 生态

### 3. 快速启动命令

#### Foundry 版本
```bash
# 克隆项目
git clone <repo-url>
cd alarmclock

# 安装依赖
forge install
cd frontend && npm install

# 启动本地区块链
anvil

# 部署合约（新终端）
forge create --rpc-url http://127.0.0.1:8545 --private-key <KEY> --broadcast contracts/AlarmClock.sol:AlarmClock

# 启动前端
cd frontend && npm run dev
```

#### Hardhat 版本
```bash
# 克隆项目
git clone <repo-url>
cd alarmclock

# 安装依赖
npm install
cd frontend && npm install

# 启动本地区块链
npx hardhat node

# 部署合约（新终端）
npx hardhat run scripts/deploy.js --network localhost

# 启动前端
cd frontend && npm run dev
```

---

## 学习路径

### Foundry 版本
1. [环境搭建 (Foundry)](./foundry/phase1-env-setup.md)
2. [智能合约开发](./foundry/phase2-smart-contract.md)
3. [测试](./foundry/phase3-testing.md)
4. [前端开发](./foundry/phase4-frontend.md)
5. [部署上线](./foundry/phase5-deployment.md)

### Hardhat 版本
1. [环境搭建 (Hardhat)](./hardhat/phase1-env-setup.md)
2. [智能合约开发](./hardhat/phase2-smart-contract.md)
3. [测试](./hardhat/phase3-testing.md)
4. [前端开发](./hardhat/phase4-frontend.md)
5. [部署上线](./hardhat/phase5-deployment.md)

---

## 项目概述

AlarmClock 是一个区块链闹钟应用：
- 用户存入 ETH 作为保证金
- 设置一个时间范围（开始时间、结束时间）
- 在时间范围内触发可以取回存款
- 超过时间未触发则存款被没收

### 功能列表
- ✅ 创建闹钟（存入 ETH）
- ✅ 在时间范围内触发（取回存款）
- ✅ 过期检查
- ✅ 取消闹钟（时间开始前）
- ✅ 管理员提取没收金额
