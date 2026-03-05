# 第一阶段：开发环境搭建 (Hardhat)

> 预计时长：1-2 小时  
> 目标：完成 Hardhat 开发环境配置，能够运行项目

## 1.1 课程目标

- 理解区块链开发的基本概念
- 安装并配置 Hardhat 开发工具
- 运行本地区块链节点
- 部署智能合约并与前端连接

## 1.2 什么是 Hardhat？

Hardhat 是以太坊开发的专业工具，用 JavaScript/TypeScript 编写。

### Hardhat 核心组件

| 组件 | 功能 |
|------|------|
| **Hardhat Network** | 本地区块链（类似 Ganache） |
| **Solidity 编译器** | 编译智能合约 |
| **测试运行器** | 编写和运行测试 |
| **部署插件** | 部署脚本 |

### 为什么选择 Hardhat？

- 📚 **学习资源多** - 文档丰富，社区活跃
- 🔌 **插件生态** - 大量插件可用
- 📖 **TypeScript** - 强类型支持
- 🌍 **广泛使用** - 行业标准之一

## 1.3 环境要求

- **操作系统**: Windows / macOS / Linux
- **Node.js**: 18+ (必须)
- **npm** 或 **yarn**: 包管理器

## 1.4 安装步骤

### 1.4.1 安装 Node.js

```bash
# 检查 Node.js 版本
node --version

# 如果没有，访问 https://nodejs.org 下载 LTS 版本
```

### 1.4.2 安装 Hardhat

```bash
# 创建新项目（如果从零开始）
mkdir alarmclock-hardhat
cd alarmclock-hardhat
npm init -y

# 安装 Hardhat
npm install --save-dev hardhat

# 安装 Solidity 编译器
npm install --save-dev solc
```

### 1.4.3 初始化 Hardhat 项目

```bash
# 初始化 Hardhat
npx hardhat init
```

选择:
```
- Create a JavaScript project
- Yes to everything
```

### 1.4.4 安装 VS Code (推荐)

1. 访问 https://code.visualstudio.com
2. 安装后搜索并安装:
   - "Solidity" (Juan Blanco)
   - "Prettier"

### 1.4.5 安装 MetaMask 钱包

1. 访问 https://metamask.io
2. 下载浏览器插件
3. 创建钱包，**务必备份助记词！**

## 1.5 项目结构

```
alarmclock/
├── contracts/
│   └── AlarmClock.sol
├── scripts/
│   └── deploy.js
├── test/
│   └── alarmclock.js
├── hardhat.config.js
├── package.json
└── frontend/
    └── ...
```

## 1.6 配置 Hardhat

### 1.6.1 hardhat.config.js

```javascript
require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {},
    localhost: {
      url: "http://127.0.0.1:8545"
    }
  }
};
```

### 1.6.2 安装 OpenZeppelin

```bash
npm install @openzeppelin/contracts
```

## 1.7 运行本地区块链

### 1.7.1 启动 Hardhat 节点

```bash
npx hardhat node
```

**预期输出:**
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545

Accounts
========
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
Private Key (this is not secure, use mnemonics in production): 0xac09...
...
```

⚠️ **注意**: 这些是测试账户，私钥公开，不要存入真实资产！

### 1.7.2 配置 MetaMask

1. 打开 MetaMask
2. 点击网络下拉 → "添加网络"
3. 填写:
   - 网络名称: `Localhost 8545`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `31337`
   - 符号: `ETH`

### 1.7.3 导入测试账户 (可选)

1. MetaMask → 账户图标 → "导入账户"
2. 粘贴私钥: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`

## 1.8 部署智能合约

### 1.8.1 编译合约

```bash
npx hardhat compile
```

### 1.8.2 部署脚本 (scripts/deploy.js)

```javascript
const hre = require("hardhat");

async function main() {
  const AlarmClock = await hre.ethers.getContractFactory("AlarmClock");
  const alarmClock = await AlarmClock.deploy();
  
  await alarmClock.waitForDeployment();
  const address = await alarmClock.getAddress();
  
  console.log("AlarmClock deployed to:", address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

### 1.8.3 部署到本地网络

```bash
npx hardhat run scripts/deploy.js --network localhost
```

**预期输出:**
```
AlarmClock deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

## 1.9 配置前端

```bash
cd frontend
cp .env.example .env
```

编辑 `.env`:
```
VITE_CONTRACT_ADDRESS_31337=0x5FbDB2315678afecb367f032d93F642f64180aa3
```

## 1.10 启动前端

```bash
cd frontend
npm install
npm run dev
```

打开浏览器访问: http://localhost:5173

## 1.11 常用命令

### Hardhat 命令

| 命令 | 说明 |
|------|------|
| `npx hardhat compile` | 编译合约 |
| `npx hardhat test` | 运行测试 |
| `npx hardhat node` | 启动本地区块链 |
| `npx hardhat run <script>` | 运行脚本 |
| `npx hardhat clean` | 清理构建文件 |

### 使用 Ethers.js 交互

```javascript
const { ethers } = require("ethers");

// 连接本地网络
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

// 查询合约
const alarmClock = new ethers.Contract(
  "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  ABI,
  provider
);

const nextId = await alarmClock.nextAlarmId();
console.log("Next alarm ID:", nextId);
```

## 1.12 常见问题

### Q: 端口 8545 被占用?

```bash
# Windows
netstat -ano | findstr :8545

# macOS/Linux
lsof -i :8545

# 使用其他端口启动
npx hardhat node --port 8546
```

### Q: 编译失败?

1. 检查 Solidity 版本兼容性
2. 清理并重新编译:
```bash
npx hardhat clean
npx hardhat compile
```

### Q: 前端连接 MetaMask 失败?

1. 确认 Hardhat 节点在运行
2. 确认 MetaMask 连接到 localhost:8545
3. 检查网络 Chain ID 是 31337

## 1.13 本章小结

✅ 已掌握:
- Hardhat 环境安装
- 本地区块链运行
- 智能合约部署
- MetaMask 配置
- 前端连接

❓ 下章预告:
- Solidity 智能合约开发
- 编写 AlarmClock 合约

---

**思考题:**
1. Hardhat 和 Foundry 有什么区别？
2. 为什么 Hardhat 需要 Node.js 而 Foundry 不需要？
3. Hardhat Network 和 Anvil 有什么不同？
