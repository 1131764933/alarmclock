# 第一阶段：开发环境搭建

> 预计时长：1-2 小时  
> 目标：完成开发环境配置，能够运行项目

## 1.1 课程目标

- 理解区块链开发的基本概念
- 安装并配置开发工具
- 运行第一个本地区块链节点

## 1.2 什么是区块链开发？

### 传统开发 vs 区块链开发

| 传统开发 | 区块链开发 |
|---------|-----------|
| 中心化服务器 | 去中心化网络 |
| 一个数据库 | 多个节点共识 |
| 可以随时修改数据 | 数据不可篡改 |
| 后端代码自己运行 | 智能合约部署后自动执行 |

### 区块链技术栈

```
┌─────────────────────────────────────────┐
│              前端 DApp                   │
│         (React + Ethers.js)            │
├─────────────────────────────────────────┤
│              智能合约                    │
│           (Solidity)                    │
├─────────────────────────────────────────┤
│            以太坊虚拟机                  │
│         (EVM - Ethereum VM)            │
├─────────────────────────────────────────┤
│         以太坊网络 (Ethereum)           │
│      (主网 / 测试网 / 本地网络)          │
└─────────────────────────────────────────┘
```

## 1.3 必备工具安装

### 1.3.1 安装 Node.js

Node.js 是 JavaScript 运行时，用于运行前端开发服务器和构建工具。

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
v18.x.x
9.x.x
```

### 1.3.2 安装 VS Code

Visual Studio Code 是推荐的代码编辑器。

**步骤：**

1. 访问：https://code.visualstudio.com
2. 下载并安装
3. 安装 Solidity 插件：
   - 打开 VS Code
   - 按 `Ctrl+Shift+X` 打开扩展商店
   - 搜索 "Solidity" 并安装 "Juan Blanco" 提供的插件

### 1.3.3 安装 MetaMask 钱包

MetaMask 是浏览器插件钱包，用于与 DApp 交互。

**步骤：**

1. 访问：https://metamask.io
2. 点击 "Download"
3. 选择 Chrome/Browser 安装
4. 创建钱包账户
5. **重要**：备份助记词！

### 1.3.4 安装 Git

Git 是版本控制工具。

**步骤：**

1. 访问：https://git-scm.com
2. 下载 Windows 版本
3. 安装时选择 "Use Git from Git Bash only"

## 1.4 项目初始化

### 1.4.1 克隆项目

```bash
# 打开终端（Windows 使用 Git Bash 或 PowerShell）
cd C:\Users\你的用户名\Desktop
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
├── hardhat.config.js # Hardhat 配置
└── foundry.toml       # Foundry 配置
```

## 1.5 运行本地区块链

### 1.5.1 启动 Hardhat 节点

Hardhat 是一个本地以太坊开发网络。

```bash
cd alarmclock
npx hardhat node
```

**预期输出：**
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545

Accounts
========
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
...
```

**⚠️ 注意**：这些是测试账户，私钥公开，不要存入真实资产！

### 1.5.2 配置 MetaMask 连接本地网络

1. 打开 MetaMask 插件
2. 点击网络下拉菜单 → "添加网络"
3. 填写：
   - 网络名称：`Localhost 8545`
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
npx hardhat run scripts/deploy.js --network localhost
```

**预期输出：**
```
AlarmClock deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

### 1.6.2 启动前端

```bash
cd frontend
npm run dev
```

打开浏览器访问：http://localhost:3000

## 1.7 本章小结

✅ 已掌握：
- Node.js 和开发工具安装
- MetaMask 钱包使用
- Hardhat 本地网络运行
- 项目基本结构

❓ 下章预告：
- 编写你的第一个智能合约
- 理解 Solidity 语法

---

**思考题：**
1. 为什么区块链需要多个节点？
2. 智能合约部署后还能修改吗？
3. 测试网和本地网络的区别是什么？
