# 以太坊 DApp 钱包连接方案完整技术盘点（2026版）

> 面向生产级 DApp 的钱包连接技术全解析

---

## 一、背景

钱包连接是 DApp 的核心基础设施。本文从**技术实现层级**角度，对当前以太坊生态中所有主流的钱包连接方案进行完整盘点，帮助开发者在架构选型时做出明智决策。

---

## 二、技术层级概览

```
┌─────────────────────────────────────────────────────────────┐
│  第九层：嵌入式钱包（Web2 融合）                              │
│  Privy | Dynamic | Thirdweb                                │
├─────────────────────────────────────────────────────────────┤
│  第八层：账户抽象方案（未来趋势）                              │
│  ERC-4337 (ZeroDev / Biconomy)                            │
├─────────────────────────────────────────────────────────────┤
│  第七层：移动端方案                                          │
│  WalletConnect | Deep Link | In-app Browser                 │
├─────────────────────────────────────────────────────────────┤
│  第六层：中心化钱包 SDK                                       │
│  Coinbase Wallet SDK | Safe Apps SDK                        │
├─────────────────────────────────────────────────────────────┤
│  第五层：协议层远程连接                                        │
│  WalletConnect v2                                            │
├─────────────────────────────────────────────────────────────┤
│  第四层：钱包聚合 SDK（多钱包统一入口）                          │
│  RainbowKit | Web3Modal | ConnectKit                        │
├─────────────────────────────────────────────────────────────┤
│  第三层：React Hooks 框架                                     │
│  wagmi | useDApp                                            │
├─────────────────────────────────────────────────────────────┤
│  第二层：RPC 客户端库                                         │
│  viem | ethers.js | web3.js                                 │
├─────────────────────────────────────────────────────────────┤
│  第一层：EIP 注入式 Provider（原生）                           │
│  window.ethereum (EIP-1193)                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 三、详细技术方案

---

### 第一层：EIP 注入式 Provider（原生方式）

这是所有钱包连接的基础，所有上层方案最终都依赖这套标准。

#### EIP 核心规范

| 规范 | 说明 |
|------|------|
| EIP-1193 | Provider API 标准 |
| EIP-1102 | 用户授权（已废弃，被 1193 取代）|
| EIP-3085 | 添加网络 |
| EIP-3326 | 切换网络 |
| EIP-6963 | 多钱包发现机制（2023 新增，解决多钱包冲突）|

#### 典型实现

```javascript
// 最简单的原生方式
if (window.ethereum) {
  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts"
  });
}
```

#### 支持的钱包类型

- 浏览器插件钱包
- 注入式移动钱包浏览器

#### 典型钱包

- MetaMask
- Brave Wallet
- OKX Wallet
- Bitget Wallet
- Rabby Wallet

#### 优点

- 零依赖
- 最轻量
- 理解门槛最低

#### 缺点

- 只支持注入式钱包
- 需要手动处理链切换
- 需要手动处理重连
- 无 UI

---

### 第二层：RPC 客户端库

提供低层次的区块链交互能力。

#### ethers.js

```javascript
import { ethers } from "ethers";

const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const address = await signer.getAddress();
```

**特点：**

- 最成熟稳定
- 大量老项目在用
- v6 更贴近 EIP-1193
- 文档丰富

**GitHub:** 22.5k ⭐

---

#### viem

```typescript
import { createWalletClient, custom } from 'viem'

const client = createWalletClient({
  transport: custom(window.ethereum),
  chain: mainnet
})
```

**特点：**

- 更轻量（比 ethers 小 90%）
- 完整的 TypeScript 支持
- 被 wagmi 内部使用
- 支持 ENS

**GitHub:** 17.8k ⭐

---

#### web3.js（逐渐退出主流）

```javascript
import Web3 from 'web3'

const web3 = new Web3(window.ethereum)
```

**特点：**

- 老牌库，功能全
- 体积较大
- 逐渐被边缘化

**GitHub:** 15.9k ⭐

---

### 第三层：React Hooks 框架

这是现在主流 DApp 的标准做法，提供状态管理抽象。

#### wagmi

```javascript
import { useConnect, useAccount, useDisconnect } from 'wagmi'

function ConnectButton() {
  const { connect, connectors } = useConnect()
  const { address, isConnected } = useAccount()
  
  return isConnected ? (
    <button onClick={() => disconnect()}>Disconnect</button>
  ) : (
    <button onClick={() => connect({ connector: connectors[0] })}>
      Connect
    </button>
  )
}
```

**内部组合：**

- viem
- EIP-1193

**优点：**

- Hooks 化，React 友好
- 自动链切换
- 自动重连
- 多钱包支持
- 活跃维护

**GitHub:** 10k ⭐

---

#### useDApp（旧）

- 维护较少
- 功能类似 wagmi

---

### 第四层：钱包聚合 SDK（多钱包统一入口）

这是生产级项目最常用的方案，提供开箱即用的 UI。

#### RainbowKit

```javascript
import '@rainbow-me/rainbowkit/styles.css'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { WagmiProvider } from 'wagmi'
import { mainnet } from 'wagmi/chains'
import { QueryClientProvider } from '@tanstack/react-query'

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectButton />
      </QueryClientProvider>
    </WagmiProvider>
  )
}
```

**内部组合：**

- wagmi
- viem
- WalletConnect

**支持钱包：**

- MetaMask
- Coinbase Wallet
- Rainbow Wallet
- WalletConnect
- Safe
- Ledger
- Trust Wallet
- 等几十个

**特点：**

- UI 最精美
- MetaMask 官方推荐
- 高度可定制

**GitHub:** 7.5k ⭐

---

#### Web3Modal（AppKit）

```javascript
import { useWeb3Modal } from '@web3modal/wagmi/react'

function ConnectButton() {
  const { open } = useWeb3Modal()
  return <button onClick={() => open()}>Connect Wallet</button>
}
```

**v2 基于：**

- WalletConnect v2 协议

**支持：**

- 移动端钱包（通过 WalletConnect）
- 浏览器插件
- 桌面钱包

**GitHub:** 7k ⭐

**现在已升级为 AppKit，功能更强大**

---

#### ConnectKit

```javascript
import { ConnectButton } from 'connectkit'

function App() {
  return <ConnectButton />
}
```

**特点：**

- 类似 RainbowKit
- UI 更轻量简洁
- 高度可定制

**GitHub:** 1.5k ⭐

---

### 第五层：协议层远程连接

这是跨设备连接的核心。

#### WalletConnect v2

**工作原理：**

1. DApp 生成 session
2. 钱包扫码或 deep link
3. 通过 relay server 通信

**支持：**

- 移动钱包（iOS/Android）
- 桌面钱包
- 浏览器钱包

**核心功能：**

- QR 码连接
- Deep link
- 多链支持

---

### 第六层：中心化钱包 SDK

#### Coinbase Wallet SDK

```javascript
import { CoinbaseWalletSDK } from '@coinbase/wallet-sdk'

const coinbaseWallet = new CoinbaseWalletSDK({
  appName: 'My DApp',
  appLogoUrl: '...'
})

const provider = coinbaseWallet.makeWeb3Provider()
```

**特点：**

- Coinbase 官方
- 可 fallback 到 WalletConnect
- 支持 mobile deep link

---

#### Safe Apps SDK

**用于：**

- Gnosis Safe 内嵌 DApp

```javascript
import { useSafeAppsSDK } from '@safe-global/safe-apps-react-sdk'

function App() {
  const { safe, sdk } = useSafeAppsSDK()
}
```

---

### 第七层：账户抽象方案（未来趋势）

#### ERC-4337 Account Abstraction

不再依赖传统 EOA（外部拥有账户），通过智能合约钱包操作。

**核心组件：**

- Bundler：发送用户操作
- Paymaster：代付 Gas

**典型实现：**

- ZeroDev
- Biconomy
- Stackup

**优点：**

- 无 Gas 交易
- 社交恢复
- 多签支持
- 批量交易

---

### 第八层：嵌入式钱包（Web2 融合）

#### Privy

```javascript
import { PrivyProvider } from '@privy-io/react-auth'

function App() {
  return (
    <PrivyProvider
      appId="your-app-id"
      config={{
        loginMethods: ['email', 'google', 'twitter'],
        embeddedWallets: {
          createOnLogin: 'users-without-wallets'
        }
      }}
    >
      <DApp />
    </PrivyProvider>
  )
}
```

**特点：**

- 邮箱/社交登录
- 嵌入式钱包
- 无需安装插件

---

#### Dynamic

```javascript
import { DynamicContextProvider } from '@dynamic-labs/sdk-react'

function App() {
  return (
    <DynamicContextProvider
      settings={{
        environmentId: 'your-env-id'
      }}
    >
      <DApp />
    </DynamicContextProvider>
  )
}
```

**特点：**

- 嵌入式钱包
- 多链支持
- Web2 登录即有钱包

---

#### Thirdweb Auth

- 嵌入式钱包
- NFT 优先

---

### 第九层：移动端方案

#### 方案类型

| 方案 | 说明 |
|------|------|
| WalletConnect v2 | 扫码 + relay server |
| Coinbase Deep Link | 移动端直接唤起 |
| In-app Browser | 应用内浏览器注入 provider |

#### React Native

```javascript
// Web3Modal for React Native
import { Web3ModalProvider } from '@web3modal/react-native'

// 或使用 wagmi + WalletConnect
```

---

## 四、技术选型建议

### 按场景推荐

| 场景 | 推荐方案 |
|------|----------|
| **DeFi** | wagmi + RainbowKit + WalletConnect |
| **NFT 平台** | RainbowKit + wagmi |
| **企业 DApp** | Safe Apps SDK |
| **Web2 融合** | Privy + ERC-4337 |
| **Gas 抽象** | ZeroDev / Biconomy |
| **最小依赖** | window.ethereum 原生 |
| **移动端优先** | Web3Modal + WalletConnect |

### 按团队能力推荐

| 团队能力 | 推荐方案 |
|----------|----------|
| 新手/简单需求 | RainbowKit（开箱即用）|
| 中级/需要定制 | wagmi + 自定义 UI |
| 高级/完全控制 | viem（底层）+ 自建 UI |
| 快速 MVP | Web3Modal + wagmi |

### 2026 主流组合

```
生产级 DApp：
wagmi + viem + RainbowKit

移动端支持：
+ WalletConnect v2

Web2 融合：
+ Privy 或 Dynamic
```

---

## 五、完整分类总结

| 层级 | 方案类型 | 是否主流 | GitHub 热度 |
|------|----------|----------|-------------|
| 原生 | window.ethereum | 基础 | - |
| RPC 库 | viem | 必备 | 17.8k ⭐ |
| RPC 库 | ethers.js | 主流 | 22.5k ⭐ |
| React Hooks | wagmi | 主流 | 10k ⭐ |
| UI SDK | RainbowKit | 主流 | 7.5k ⭐ |
| UI SDK | Web3Modal/AppKit | 主流 | 7k ⭐ |
| 协议层 | WalletConnect v2 | 必备 | - |
| AA | ERC-4337 | 增长中 | - |
| 嵌入式 | Privy/Dynamic | Web2友好型 | - |

---

## 六、决策树

```
需要支持移动端钱包吗？
├─ 是 → WalletConnect v2 + Web3Modal
└─ 否 → 继续

Web2 用户登录需求？
├─ 是 → Privy 或 Dynamic
└─ 否 → 继续

团队 React 能力？
├─ 强 → wagmi + 自定义 UI
├─ 中 → wagmi + RainbowKit
└─ 弱 → RainbowKit（开箱即用）

需要完全控制？
└─ 是 → viem 底层 + 自建 UI
```

---

## 七、总结

钱包连接是 DApp 的第一入口，选择合适的方案至关重要：

1. **从 0 到 1**：用 RainbowKit 快速上线
2. **从 1 到 10**：用 wagmi + viem 深耕
3. **从 10 到 100**：考虑 Account Abstraction + 嵌入式钱包

---

*文档版本：2026.03*
*维护者：AlarmClock Team*
