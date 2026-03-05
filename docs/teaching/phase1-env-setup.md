# 第一阶段：开发环境搭建

> 预计时长：1-2 小时  
> 目标：完成开发环境配置，能够运行项目

## 1.1 课程目标

- 理解区块链开发的基本概念
- 安装并配置开发工具（Foundry + React）
- 运行第一个本地区块链节点
- 部署智能合约并与前端连接

## 1.2 什么是区块链开发？

### 传统开发 vs 区块链开发

| 传统开发 | 区块链开发 |
|---------|-----------|
| 中心化服务器 | 去中心化网络 |
| 一个数据库 | 多个节点共识 |
| 可以随时修改数据 | 数据不可篡改 |
| 后端代码自己运行 | 智能合约部署后自动执行 |
| 一台服务器 | 全球分布的节点 |

### 区块链技术栈

```
┌─────────────────────────────────────────┐
│              前端 DApp                   │
│         (React + Ethers.js)             │
├─────────────────────────────────────────┤
│              智能合约                    │
│           (Solidity)                    │
├─────────────────────────────────────────┤
│            以太坊虚拟机                  │
│         (EVM - Ethereum VM)             │
├─────────────────────────────────────────┤
│         以太坊网络 (Ethereum)           │
│      (主网 / 测试网 / 本地网络)          │
└─────────────────────────────────────────┘
```

### 为什么要用本地区块链？

1. **速度快** - 秒级确认，不用等测试网
2. **免费** - 不需要测试币
3. **可控** - 可以随意操作时间、余额等
4. **安全** - 测试不影响真实资产

## 1.3 必备工具安装

### 1.3.1 安装 Node.js

Node.js 是 JavaScript 运行时，用于运行前端开发服务器。

**步骤：**

1. 打开浏览器访问：https://nodejs.org
2. 下载 LTS（长期支持）版本
3. 运行安装程序
4. 验证安装：
   ```bash
   node --version
   npm --version
   ```

**预期输出：**
```
v18.x.x 或 v20.x.x
10.x.x
```

### 1.3.2 安装 Rust

Foundry 是基于 Rust 编写的，需要先安装 Rust。

**macOS / Linux：**
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

**Windows：**
访问 https://rustup.rs 下载安装程序

**验证：**
```bash
rustc --version
cargo --version
```

### 1.3.3 安装 Foundry

Foundry 是智能合约开发工具包，包含：
- `forge` - 编译和测试智能合约
- `cast` - 与合约交互
- `anvil` - 本地区块链节点

**安装：**
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

**验证：**
```bash
forge --version
cast --version
anvil --version
```

### 1.3.4 安装 VS Code

Visual Studio Code 是推荐的代码编辑器。

**步骤：**

1. 访问：https://code.visualstudio.com
2. 下载并安装
3. 安装 Solidity 插件：
   - 打开 VS Code
   - 按 `Ctrl+Shift+X` 打开扩展商店
   - 搜索 "Solidity" 并安装 "Juan Blanco" 提供的插件

### 1.3.5 安装 MetaMask 钱包

MetaMask 是浏览器插件钱包，用于与 DApp 交互。

**步骤：**

1. 访问：https://metamask.io
2. 点击 "Download"
3. 选择 Chrome/Browser 安装
4. 创建钱包账户
5. **重要**：备份助记词！

## 1.4 项目初始化

### 1.4.1 克隆项目

```bash
# 打开终端
cd ~/Desktop
git clone <项目仓库地址>
cd alarmclock
```

### 1.4.2 安装项目依赖

```bash
# 安装 Solidity 依赖（Foundry）
cd alarmclock
forge install

# 安装前端依赖
cd frontend
npm install
```

### 1.4.3 项目结构介绍

```
alarmclock/
├── contracts/          # 智能合约源代码
│   └── AlarmClock.sol
├── test/              # 测试文件
│   └── AlarmClock.t.sol
├── script/            # 部署脚本
│   └── Deploy.s.sol
├── frontend/          # 前端应用
│   ├── src/
│   │   ├── App.jsx
│   │   └── components/
│   └── package.json
├── foundry.toml       # Foundry 配置
└── .env               # 环境变量（不要提交！）
```

## 1.5 运行本地区块链

### 1.5.1 启动 Anvil

Anvil 是 Foundry 的本地区块链节点。

```bash
cd alarmclock
anvil --chain-id 31337 --host 127.0.0.1 --port 8545
```

**预期输出：**
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

(0) 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000.000000000000000000 ETH)
(1) 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (10000.000000000000000000 ETH)
...

Private Keys
==================

(0) 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
...

Chain ID: 31337

Listening on 127.0.0.1:8545
```

**⚠️ 注意**：这些是测试账户，私钥公开，不要存入真实资产！

### 1.5.2 配置 MetaMask 连接本地网络

1. 打开 MetaMask 插件
2. 点击网络下拉菜单 → "添加网络"
3. 填写：
   - 网络名称：`Anvil Local`
   - RPC URL：`http://127.0.0.1:8545`
   - Chain ID：`31337`
   - 符号：`ETH`

### 1.5.3 导入测试账户（可选）

如果你想在 MetaMask 中使用测试账户：

1. MetaMask → 点击账户图标 → "导入账户"
2. 粘贴私钥：`0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
3. 账户会自动导入（余额 10000 ETH）

## 1.6 部署智能合约

### 1.6.1 部署到本地网络

```bash
cd alarmclock
forge create --rpc-url http://127.0.0.1:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --broadcast contracts/AlarmClock.sol:AlarmClock
```

**预期输出：**
```
Deployer: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
Transaction hash: 0x...
```

### 1.6.2 配置前端

创建 `.env` 文件：
```bash
cd frontend
cp .env.example .env
```

编辑 `.env`：
```
VITE_CONTRACT_ADDRESS_31337=0x5FbDB2315678afecb367f032d93F642f64180aa3
```

### 1.6.3 启动前端

```bash
cd frontend
npm run dev
```

打开浏览器访问：http://localhost:5173

## 1.7 常见问题

### Q: Anvil 启动失败，端口被占用？

```bash
# 查看占用 8545 端口的进程
lsof -i :8545

# 杀掉进程
kill -9 <PID>

# 或者使用其他端口
anvil --port 8546
```

### Q: 前端连接不上合约？

1. 检查 Anvil 是否在运行
2. 检查 MetaMask 是否连接到正确的网络
3. 检查 `.env` 中的合约地址是否正确

### Q: 交易失败怎么办？

1. 查看浏览器控制台的错误信息
2. 检查时间设置是否正确（开始时间需要在未来）
3. 检查余额是否充足

## 1.8 本章小结

✅ 已掌握：
- Node.js 和 Rust 环境安装
- Foundry 工具链使用
- Anvil 本地网络运行
- MetaMask 钱包配置
- 智能合约部署
- 前端连接

❓ 下章预告：
- 理解智能合约基本结构
- 编写你的第一个 Solidity 合约

---

**思考题：**
1. 为什么区块链需要多个节点？
2. 智能合约部署后还能修改吗？
3. 测试网和本地网络的区别是什么？
4. 为什么要用 Foundry 而不是 Hardhat？
