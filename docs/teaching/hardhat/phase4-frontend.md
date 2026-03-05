# 第四阶段：前端开发

> 预计时长：2-3 小时  
> 目标：智能构建与合约交互的 Web 应用

## 4.1 课程目标

- 理解 DApp 前端架构
- 掌握 React 基础
- 使用 Ethers.js 与合约交互
- 实现钱包连接和交易功能

## 4.2 DApp 前端架构

### 4.2.1 整体架构

```
┌─────────────────────────────────────────────────────────┐
│                    React 前端                            │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  组件层      │  │  状态管理   │  │  工具函数   │    │
│  │ App.jsx     │  │  useState   │  │ Ethers.js  │    │
│  │ Components  │  │  useEffect  │  │  格式化    │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
├─────────────────────────────────────────────────────────┤
│                    钱包层 (MetaMask)                    │
├─────────────────────────────────────────────────────────┤
│                    以太坊网络 (JSON-RPC)                │
├─────────────────────────────────────────────────────────┤
│                    智能合约 (EVM)                        │
└─────────────────────────────────────────────────────────┘
```

### 4.2.2 技术栈

| 技术 | 用途 |
|------|------|
| React | UI 框架 |
| Ethers.js | 合约交互库 |
| Vite | 构建工具 |
| MetaMask | 钱包连接 |

## 4.3 项目初始化

### 4.3.1 安装依赖

```bash
cd frontend
npm install ethers
```

### 4.3.2 项目结构

```
frontend/
├── src/
│   ├── App.jsx           # 主组件
│   ├── main.jsx          # 入口
│   ├── index.css         # 样式
│   └── components/       # 组件目录
│       ├── AlarmItem.jsx
│       ├── CreateAlarmForm.jsx
│       ├── Stats.jsx
│       └── AdminPanel.jsx
├── index.html
├── package.json
└── vite.config.js
```

## 4.4 Ethers.js 基础

### 4.4.1 连接钱包

```javascript
import { BrowserProvider } from 'ethers'

// 检测 MetaMask 是否安装
if (window.ethereum) {
  // 创建 provider
  const provider = new BrowserProvider(window.ethereum)
  
  // 请求连接钱包
  const accounts = await provider.send("eth_requestAccounts", [])
  console.log("已连接账户:", accounts[0])
}
```

### 4.4.2 创建合约实例

```javascript
import { Contract } from 'ethers'

// 合约 ABI（接口描述）
const CONTRACT_ABI = [
  "function createAlarm(uint256 startTime, uint256 endTime) external payable returns (uint256)",
  "function triggerAlarm(uint256 alarmId) external",
  "function alarms(uint256 alarmId) external view returns (address, uint256, uint256, uint256, uint8, uint256)"
]

// 合约地址
const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"

// 只读合约（使用 provider）
const contract = new Contract(contractAddress, CONTRACT_ABI, provider)

// 可写合约（需要签名者）
const signer = await provider.getSigner()
const contractWrite = new Contract(contractAddress, CONTRACT_ABI, signer)
```

### 4.4.3 调用合约函数

```javascript
// 调用只读函数（不花费 gas）
const alarm = await contract.alarms(1)
console.log("闹钟详情:", alarm)

// 调用写入函数（花费 gas）
const tx = await contract.createAlarm(startTime, endTime, {
  value: parseEther("0.01")  // 发送 ETH
})

console.log("交易已发送:", tx.hash)

// 等待交易确认
await tx.wait()
console.log("交易已确认!")
```

### 4.4.4 格式化

```javascript
import { formatEther, parseEther } from 'ethers'

// 人类可读格式（wei -> ETH）
const ethAmount = formatEther(bigIntValue)
console.log(ethAmount)  // "1.0"

// 机器格式（ETH -> wei）
const weiAmount = parseEther("0.01")
console.log(weiAmount)  // 10000000000000000n
```

## 4.5 React 组件开发

### 4.5.1 状态管理

```javascript
import { useState, useEffect } from 'react'

function App() {
  // 状态变量
  const [account, setAccount] = useState(null)
  const [alarms, setAlarms] = useState([])
  const [loading, setLoading] = useState(false)
  
  // 副作用 - 组件挂载时执行
  useEffect(() => {
    checkConnection()
  }, [])
  
  return (
    <div>
      {account ? <p>已连接: {account}</p> : <button>连接钱包</button>}
    </div>
  )
}
```

### 4.5.2 钱包连接

```javascript
const connectWallet = async () => {
  if (!window.ethereum) {
    alert("请安装 MetaMask!")
    return
  }
  
  try {
    const provider = new BrowserProvider(window.ethereum)
    const accounts = await provider.send("eth_requestAccounts", [])
    setAccount(accounts[0])
    
    const network = await provider.getNetwork()
    setChainId(Number(network.chainId))
  } catch (err) {
    console.error(err)
  }
}
```

### 4.5.3 加载闹钟列表

```javascript
const loadAlarms = async () => {
  const provider = new BrowserProvider(window.ethereum)
  const contract = new Contract(contractAddress, CONTRACT_ABI, provider)
  
  // 获取用户的闹钟 ID 列表
  const alarmIds = await contract.getUserAlarms(account)
  
  // 逐个获取详情
  const alarmsData = []
  for (const id of alarmIds) {
    const data = await contract.alarms(id)
    alarmsData.push({
      id: id.toString(),
      amount: formatEther(data.amount),
      startTime: Number(data.startTime),
      endTime: Number(data.endTime),
      status: STATUS_MAP[data.status]
    })
  }
  
  setAlarms(alarmsData)
}
```

### 4.5.4 创建闹钟

```javascript
const handleCreate = async (startTime, endTime, amount) => {
  const provider = new BrowserProvider(window.ethereum)
  const signer = await provider.getSigner()
  const contract = new Contract(contractAddress, CONTRACT_ABI, signer)
  
  // 转换时间格式
  const startTimestamp = Math.floor(new Date(startTime).getTime() / 1000)
  const endTimestamp = Math.floor(new Date(endTime).getTime() / 1000)
  
  try {
    // 发送交易
    const tx = await contract.createAlarm(
      BigInt(startTimestamp),
      BigInt(endTimestamp),
      { value: parseEther(amount) }
    )
    
    console.log("交易哈希:", tx.hash)
    await tx.wait()
    console.log("创建成功!")
    
    // 刷新列表
    loadAlarms()
  } catch (err) {
    console.error(err)
  }
}
```

## 4.6 组件拆分

### 4.6.1 组件划分原则

```
┌─────────────────────────────────────────┐
│              App.jsx                    │
│  - 状态管理                            │
│  - 业务逻辑                            │
│  - 组件组合                            │
├─────────────────────────────────────────┤
│  CreateAlarmForm  │  闹钟创建表单       │
│  AlarmItem        │  单个闹钟展示       │
│  Stats            │  统计数据展示       │
│  AdminPanel       │  管理员面板         │
└─────────────────────────────────────────┘
```

### 4.6.2 示例：AlarmItem 组件

```javascript
// components/AlarmItem.jsx
export function AlarmItem({ alarm, onTrigger, onCancel }) {
  return (
    <div className="alarm-item">
      <div>
        <h4>Alarm #{alarm.id}</h4>
        <p>金额: {alarm.amount} ETH</p>
        <p>状态: {alarm.status}</p>
      </div>
      <div>
        {alarm.status === 'Pending' && (
          <>
            <button onClick={() => onTrigger(alarm.id)}>触发</button>
            <button onClick={() => onCancel(alarm.id)}>取消</button>
          </>
        )}
      </div>
    </div>
  )
}
```

## 4.7 实时倒计时

### 4.7.1 计算倒计时

```javascript
const getCountdown = (targetTime, now) => {
  const diff = targetTime - now
  if (diff <= 0) return '已过期'
  
  const hours = Math.floor(diff / 3600)
  const minutes = Math.floor((diff % 3600) / 60)
  const seconds = diff % 60
  
  return `${hours}小时 ${minutes}分 ${seconds}秒`
}
```

### 4.7.2 定时更新

```javascript
useEffect(() => {
  // 每秒更新
  const timer = setInterval(() => {
    setNowSec(Math.floor(Date.now() / 1000))
  }, 1000)
  
  return () => clearInterval(timer)
}, [])
```

## 4.8 完整流程演示

### 4.8.1 用户操作流程

```
1. 连接钱包
   ↓
2. 创建闹钟（存入 ETH）
   ↓
3. 等待时间到达
   ↓
4. 触发闹钟（取回 ETH）
   ↓
5. 显示成功
```

### 4.8.2 运行前端

```bash
cd frontend
npm run dev
```

访问 http://localhost:3000

## 4.9 本章小结

✅ 已掌握：
- DApp 前端架构
- Ethers.js 合约交互
- React 状态管理
- 组件拆分
- 实时倒计时

❓ 下章预告：
- 部署到测试网
- 生产环境配置

---

**练习题：**

1. 添加"交易历史"功能，记录所有操作
2. 添加"刷新"按钮，手动刷新数据
3. 思考：如何处理交易失败的情况？
