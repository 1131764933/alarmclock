# AlarmClock 项目命令执行记录

> 用于复盘整个项目操作流程

---

## 一、环境检查

```bash
# 检查 anvil 是否安装
which anvil && anvil --version
```

**输出：**
```
/usr/local/bin/anvil
anvil 0.2.0 (6e0964bf 2024-11-28 00:13:10)
```

---

## 二、启动本地测试网 (Anvil)

```bash
# 启动 anvil 本地节点（后台运行）
anvil --host 127.0.0.1 --port 8545
```

**说明：**
- Anvil 是 Foundry 的本地测试网
- 默认账户：https://book.getfoundry.sh/anvil/#default-private-keys
- 默认账户 0: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80` (10000 ETH)

---

## 三、部署合约

```bash
# 部署 AlarmClock 合约到本地测试网
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url http://127.0.0.1:8545 \
  --broadcast \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

**输出：**
```
Deployer: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
Transaction hash: 0x...
```

**部署后的合约地址：** `0x5FbDB2315678afecb367f032d93F642f64180aa3`

---

## 四、安装 RainbowKit 及依赖

```bash
# 进入前端目录
cd frontend

# 安装 RainbowKit + wagmi + viem + tanstack/react-query
npm install @rainbow-me/rainbowkit wagmi viem @tanstack/react-query
```

**安装的依赖：**
- `@rainbow-me/rainbowkit` - UI 组件
- `wagmi` - React Hooks 框架
- `viem` - 底层 RPC 库
- `@tanstack/react-query` - 状态管理

---

## 五、前端代码改造

### 5.1 修改 main.jsx - 添加 Providers

```javascript
import React from 'react'
import ReactDOM from 'react-dom/client'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'
import App from './App'
import './index.css'

// wagmi 配置
import { WagmiConfig, createConfig, http } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

const config = createConfig({
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http('http://127.0.0.1:8545'),
  },
  connectors: [
    injected(),  // MetaMask 等插件钱包
  ],
})

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider 
          theme={darkTheme()}
          chains={[mainnet, sepolia]}
        >
          <App />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>,
)
```

### 5.2 重写 App.jsx - 使用 wagmi Hooks

```javascript
import { useAccount, useConnect, useDisconnect, useWriteContract, useReadContract } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { ethers } from 'ethers'

// 合约地址 - 本地测试网
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"

// 合约 ABI
const CONTRACT_ABI = [
  "function createAlarm(uint256 startTime, uint256 endTime) external payable returns (uint256)",
  "function triggerAlarm(uint256 alarmId) external",
  "function cancelAlarm(uint256 alarmId) external",
  "function alarms(uint256 alarmId) external view returns (address, uint256, uint256, uint256, uint8, uint256)",
  "function getUserAlarms(address user) external view returns (uint256[])",
  "function totalDeposited() external view returns (uint256)",
  "function totalForfeited() external view returns (uint256)",
]

// 状态映射
const STATUS_MAP = { 0: 'Pending', 1: 'Triggered', 2: 'Expired', 3: 'Cancelled' }

function App() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  
  // ... 使用 wagmi hooks 重写业务逻辑
}
```

---

## 六、启动前端

```bash
# 启动开发服务器
npm run dev
```

---

## 七、清理无关文件

```bash
# 删除不需要的文件
rm frontend/src/AppDemo.jsx
rm frontend/src/AppReal.jsx

# 或者只保留 App.jsx 作为主文件
```

---

## 八、常用命令汇总

```bash
# 启动测试网
anvil --host 127.0.0.1 --port 8545

# 部署合约
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url http://127.0.0.1:8545 \
  --broadcast \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# 运行测试
forge test -vv

# 启动前端
cd frontend && npm run dev
```

---

## 九、WalletConnect 项目 ID（可选）

如果需要支持 WalletConnect（手机扫码），需要在 https://cloud.walletconnect.com 注册项目获取 `projectId`。

```javascript
// 添加 WalletConnect 支持
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'

const config = createConfig({
  // ...
  connectors: [
    injected(),
    new WalletConnectConnector({
      options: {
        projectId: 'YOUR_PROJECT_ID',
      },
    }),
  ],
})
```

## 十、任务完成状态

| 任务 | 状态 | 完成时间 |
|------|------|----------|
| 启动 Foundry 本地测试网 | ✅ 完成 | - |
| 部署合约到本地测试网 | ✅ 完成 | - |
| 升级前端到 RainbowKit | ✅ 完成 | - |
| 清理无关文件 | ✅ 完成 | - |

---

## 十一、项目文件变更

### 删除的文件
- `frontend/src/AppDemo.jsx` - Demo 模式
- `frontend/src/AppReal.jsx` - 真实网络模式

### 修改的文件
- `frontend/src/main.jsx` - 添加 WagmiProvider + RainbowKitProvider
- `frontend/src/App.jsx` - 使用 wagmi hooks + ConnectButton

### 保留的文件
- `frontend/src/App.jsx` - 主应用（使用 RainbowKit）
- `frontend/src/main.jsx` - 入口文件
- `frontend/src/index.css` - 样式文件

---

*记录时间：2026-03-04*
