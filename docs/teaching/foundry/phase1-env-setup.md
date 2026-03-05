# 第一阶段：开发环境搭建 (Foundry)

> 预计时长：1-2 小时  
> 目标：完成 Foundry 开发环境配置，能够运行项目

## 1.1 课程目标

- 理解区块链开发的基本概念
- 安装并配置 Foundry 开发工具
- 运行本地区块链节点 (Anvil)
- 部署智能合约并与前端连接

## 1.2 什么是 Foundry？

Foundry 是专为 Solidity 打造的开发框架，由 Rust 编写，速度极快。

### Foundry 核心组件

| 工具 | 功能 |
|------|------|
| **Forge** | 编译和测试智能合约 |
| **Cast** | 与合约交互（命令行） |
| **Anvil** | 本地区块链节点 |

### 为什么选择 Foundry？

- ⚡ **速度快** - 比 Hardhat 快 10-100 倍
- 🔥 **热重载** - 修改代码立即生效
- 📦 **轻量级** - 无需额外依赖
- 🧪 **强大测试** - 内置模糊测试

## 1.3 环境要求

- **操作系统**: macOS / Linux / Windows (WSL)
- **Node.js**: 18+ (仅前端需要)
- **Rust**: 用于编译 Foundry

## 1.4 安装步骤

### 1.4.1 安装 Node.js

```bash
# 检查是否已安装
node --version

# 如果没有，访问 https://nodejs.org 下载 LTS 版本
```

### 1.4.2 安装 Rust

**macOS / Linux:**
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env
```

**Windows:**
1. 访问 https://rustup.rs
2. 下载并运行安装程序

**验证:**
```bash
rustc --version
cargo --version
```

### 1.4.3 安装 Foundry

```bash
# 安装 Foundry
curl -L https://foundry.paradigm.xyz | bash

# 更新到最新版本
foundryup
```

**验证安装:**
```bash
forge --version
cast --version
anvil --version
```

预期输出:
```
forge 1.3.0 (...)
cast 1.3.0 (...)
anvil 1.3.0 (...)
```

### 1.4.4 安装 VS Code (推荐)

1. 访问 https://code.visualstudio.com
2. 安装后搜索并安装 "Solidity" 插件 (Juan Blanco)

### 1.4.5 安装 MetaMask 钱包

1. 访问 https://metamask.io
2. 下载浏览器插件
3. 创建钱包，**务必备份助记词！**

## 1.5 项目初始化

### 1.5.1 克隆项目

```bash
cd ~/Desktop
git clone <项目仓库地址>
cd alarmclock
```

### 1.5.2 安装项目依赖

```bash
# 安装 Solidity 依赖（Foundry 自动管理）
forge install

# 安装前端依赖
cd frontend
npm install
```

### 1.5.3 项目结构

```
alarmclock/
├── contracts/          # 智能合约
│   └── AlarmClock.sol
├── test/               # 测试文件
│   └── AlarmClock.t.sol
├── script/             # 部署脚本
│   └── Deploy.s.sol
├── frontend/           # React 前端
│   ├── src/
│   └── package.json
├── foundry.toml        # Foundry 配置
└── .env               # 环境变量
```

## 1.6 运行本地区块链

### 1.6.1 启动 Anvil

```bash
anvil --chain-id 31337 --host 127.0.0.1 --port 8545
```

**预期输出:**
```
                             _   _
                            (_) | |
      __ _   _ __   __   __  _  | |
     / _` | | '_ \  \ \ / / | | | |
    | (_| | | | | |  \ V /  | | | |
     \__,_| |_| |_|   \_/   |_| |_|

    1.3.0 (...)
    https://github.com/foundry-rs/foundry

Available Accounts
==================

(0) 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
(1) 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (10000 ETH)
...

Private Keys
==================

(0) 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
...

Chain ID: 31337

Listening on 127.0.0.1:8545
```

⚠️ **注意**: 这些是测试账户，私钥公开，不要存入真实资产！

### 1.6.2 配置 MetaMask

1. 打开 MetaMask
2. 点击网络下拉 → "添加网络"
3. 填写:
   - 网络名称: `Anvil Local`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `31337`
   - 符号: `ETH`

### 1.6.3 导入测试账户 (可选)

1. MetaMask → 账户图标 → "导入账户"
2. 粘贴私钥: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`

## 1.7 部署智能合约

### 1.7.1 编译合约

```bash
forge build
```

### 1.7.2 部署到本地网络

```bash
forge create --rpc-url http://127.0.0.1:8545 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  --broadcast \
  contracts/AlarmClock.sol:AlarmClock
```

**预期输出:**
```
Deployer: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
Transaction hash: 0x...
```

### 1.7.3 配置前端

```bash
cd frontend

# 创建环境变量文件
cp .env.example .env
```

编辑 `.env`:
```
VITE_CONTRACT_ADDRESS_31337=0x5FbDB2315678afecb367f032d93F642f64180aa3
```

## 1.8 启动前端

```bash
cd frontend
npm run dev
```

打开浏览器访问: http://localhost:5173

## 1.9 常用命令

### Foundry 命令

| 命令 | 说明 |
|------|------|
| `forge build` | 编译合约 |
| `forge test` | 运行测试 |
| `forge test -vvv` | 详细测试输出 |
| `forge coverage` | 测试覆盖率 |
| `anvil` | 启动本地区块链 |
| `cast call` | 调用只读函数 |
| `cast send` | 发送交易 |

### 合约交互示例

```bash
# 查询合约
cast call 0x5FbDB2315678afecb367f032d93F642f64180aa3 "nextAlarmId()"

# 发送交易
cast send 0x5FbDB2315678afecb367f032d93F642f64180aa3 \
  "createAlarm(uint256,uint256)" 1772690000 1772693600 \
  --value 0.01ether --from 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 \
  --unlocked
```

## 1.10 常见问题

### Q: Anvil 端口被占用?

```bash
# 查看端口
lsof -i :8545

# 使用其他端口
anvil --port 8546
```

### Q: 前端连接不上?

1. 确认 Anvil 在运行
2. 确认 MetaMask 连接到正确网络
3. 检查 `.env` 合约地址

### Q: 交易失败?

查看控制台错误，可能原因:
- 时间设置错误
- 余额不足
- 签名账户不对

## 1.11 本章小结

✅ 已掌握:
- Foundry 工具安装
- Anvil 本地区块链运行
- 智能合约部署
- MetaMask 配置
- 前端连接

❓ 下章预告:
- Solidity 智能合约开发
- 编写 AlarmClock 合约

---

**思考题:**
1. Foundry 和 Hardhat 相比有什么优势？
2. 为什么测试网的私钥是公开的？
3. Anvil 和 MetaMask 是什么关系？
