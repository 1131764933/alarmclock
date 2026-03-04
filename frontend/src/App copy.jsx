import { useState, useEffect } from 'react'
import { BrowserProvider, Contract, formatEther, parseEther } from 'ethers'

// 合约地址 - 本地测试网 (Anvil)
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"

// 合约 ABI
const CONTRACT_ABI = [
  "function createAlarm(uint256 startTime, uint256 endTime) external payable returns (uint256)",
  "function triggerAlarm(uint256 alarmId) external",
  "function cancelAlarm(uint256 alarmId) external",
  "function checkExpiredAlarm(uint256 alarmId) external",
  "function alarms(uint256 alarmId) external view returns (address user, uint256 amount, uint256 startTime, uint256 endTime, uint8 status, uint256 createdAt)",
  "function getUserAlarms(address user) external view returns (uint256[])",
  "function totalDeposited() external view returns (uint256)",
  "function totalForfeited() external view returns (uint256)"
]

// 状态映射
const STATUS_MAP = {
  0: 'Pending',
  1: 'Triggered', 
  2: 'Expired',
  3: 'Cancelled'
}

function App() {
  const [account, setAccount] = useState(null)
  const [chainId, setChainId] = useState(null)
  const [alarms, setAlarms] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [amount, setAmount] = useState("0.01")

  // 检查钱包
  useEffect(() => {
    checkConnection()
    
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', handleChainChanged)
    }
    
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
        window.ethereum.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [])

  const handleAccountsChanged = (accounts) => {
    if (accounts.length > 0) {
      setAccount(accounts[0])
    } else {
      setAccount(null)
    }
  }

  const handleChainChanged = (chainId) => {
    setChainId(parseInt(chainId, 16))
  }

  // 检查连接 - ethers v6
  const checkConnection = async () => {
    if (!window.ethereum) {
      setError("Please install MetaMask!")
      return
    }
    
    try {
      const provider = new BrowserProvider(window.ethereum)
      const accounts = await provider.send("eth_requestAccounts", [])
      if (accounts.length > 0) {
        setAccount(accounts[0])
      }
      
      const network = await provider.getNetwork()
      setChainId(Number(network.chainId))
    } catch (err) {
      console.error(err)
    }
  }

  // 连接钱包 - ethers v6
  const connectWallet = async () => {
    if (!window.ethereum) {
      setError("Please install MetaMask!")
      return
    }
    
    try {
      const provider = new BrowserProvider(window.ethereum)
      const accounts = await provider.send("eth_requestAccounts", [])
      setAccount(accounts[0])
      
      const network = await provider.getNetwork()
      setChainId(Number(network.chainId))
      setError("")
    } catch (err) {
      setError("Failed to connect: " + err.message)
    }
  }

  // 切换到 Anvil
  const switchToAnvil = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x7A69' }] // 31337
      })
    } catch (err) {
      if (err.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x7A69',
              chainName: 'Anvil Local',
              nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
              rpcUrls: ['http://127.0.0.1:8545']
            }]
          })
        } catch (addErr) {
          setError("Failed to add network: " + addErr.message)
        }
      } else {
        setError("Failed to switch network: " + err.message)
      }
    }
  }

  // 加载闹钟 - 通过遍历所有闹钟ID查找用户的
  const loadAlarms = async () => {
    if (!account) return
    
    try {
      const provider = new BrowserProvider(window.ethereum)
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)
      
      // 获取总闹钟数量
      let nextId = 1n
      try {
        nextId = await contract.nextAlarmId()
        console.log("Total alarms:", nextId)
      } catch (e) {
        console.warn("Could not get nextAlarmId:", e.message)
      }
      
      const alarmsData = []
      const userAddress = account.toLowerCase()
      
      // 遍历所有闹钟ID，查找属于当前用户的
      for (let i = 1n; i < nextId; i++) {
        try {
          const data = await contract.alarms(i)
          
          // 检查是否是有效闹钟且属于当前用户
          if (data && data.amount && data.amount > 0n && 
              data.user && data.user.toLowerCase() === userAddress) {
            alarmsData.push({
              id: i.toString(),
              amount: formatEther(data.amount),
              startTime: new Date(Number(data.startTime) * 1000).toLocaleString(),
              endTime: new Date(Number(data.endTime) * 1000).toLocaleString(),
              status: STATUS_MAP[Number(data.status)] || 'Unknown',
              startTimeRaw: Number(data.startTime),
              endTimeRaw: Number(data.endTime)
            })
          }
        } catch (e) {
          // 跳过不存在的闹钟
        }
      }
      
      console.log("Found alarms:", alarmsData)
      setAlarms(alarmsData.reverse())
    } catch (err) {
      console.warn("loadAlarms error:", err.message)
      setAlarms([])
    }
  }

  useEffect(() => {
    if (account && chainId === 31337) {
      loadAlarms()
    }
  }, [account, chainId])

  // 创建闹钟 - ethers v6
  const handleCreate = async (e) => {
    e.preventDefault()
    if (!account) return

    setError("")
    setSuccess("")
    setLoading(true)

    try {
      const startTimestamp = Math.floor(new Date(startTime).getTime() / 1000)
      const endTimestamp = Math.floor(new Date(endTime).getTime() / 1000)
      const parsedAmount = parseFloat(amount)

      // 前端校验
      if (Number.isNaN(startTimestamp) || Number.isNaN(endTimestamp)) {
        setError("Invalid time selection.")
        setLoading(false)
        return
      }
      if (endTimestamp <= startTimestamp) {
        setError("End time must be after start time.")
        setLoading(false)
        return
      }
      if (endTimestamp - startTimestamp > 60 * 60) {
        setError("Alarm duration cannot exceed 1 hour.")
        setLoading(false)
        return
      }
      if (Number.isNaN(parsedAmount) || parsedAmount < 0.01) {
        setError("Minimum deposit is 0.01 ETH.")
        setLoading(false)
        return
      }

      console.log("Creating alarm...", { startTimestamp, endTimestamp, amount })

      // ethers v6
      const provider = new BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)
      
      // 发送交易 - 会弹出 MetaMask 确认
      const tx = await contract.createAlarm(startTimestamp, endTimestamp, {
        value: parseEther(amount)
      })

      console.log("Transaction sent:", tx.hash)
      setSuccess("Transaction sent! Hash: " + tx.hash)
      
      // 等待确认
      await tx.wait()
      
      console.log("Transaction confirmed!")
      setSuccess("Alarm created successfully!")
      
      // 清空表单
      setStartTime("")
      setEndTime("")
      setAmount("0.01")
      
      // 多次尝试刷新，确保数据同步
      setTimeout(() => {
        loadAlarms()
        // 1秒后再试一次
        setTimeout(() => loadAlarms(), 1500)
      }, 1500)
      
    } catch (err) {
      console.error("Create error:", err)
      setError("Error: " + (err.message || err.toString()))
    }

    setLoading(false)
  }

  // 触发闹钟 - ethers v6
  const handleTrigger = async (id) => {
    setError("")
    setLoading(true)
    
    try {
      const provider = new BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)
      
      const tx = await contract.triggerAlarm(id)
      setSuccess("Transaction sent! Wait for confirmation...")
      await tx.wait()
      setSuccess("Alarm triggered! ETH returned.")
      
      // 刷新列表
      setTimeout(() => loadAlarms(), 1000)
    } catch (err) {
      setError("Error: " + (err.message || err.toString()))
    }
    setLoading(false)
  }

  // 取消闹钟 - ethers v6
  const handleCancel = async (id) => {
    setError("")
    setLoading(true)
    
    try {
      const provider = new BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)
      
      const tx = await contract.cancelAlarm(id)
      setSuccess("Transaction sent! Wait for confirmation...")
      await tx.wait()
      setSuccess("Alarm cancelled! ETH returned.")
      
      // 刷新列表
      setTimeout(() => loadAlarms(), 1000)
    } catch (err) {
      setError("Error: " + (err.message || err.toString()))
    }
    setLoading(false)
  }

  // 检查过期 - ethers v6
  const handleCheckExpired = async (id) => {
    try {
      const provider = new BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)
      
      const tx = await contract.checkExpiredAlarm(id)
      await tx.wait()
      loadAlarms()
    } catch (err) {
      console.error(err)
    }
  }

  // 设置默认时间
  useEffect(() => {
    const now = new Date()
    const start = new Date(now.getTime() + 60 * 60 * 1000)
    const end = new Date(now.getTime() + 2 * 60 * 60 * 1000)
    setStartTime(start.toISOString().slice(0, 16))
    setEndTime(end.toISOString().slice(0, 16))
  }, [])

  const formatAddress = (addr) => addr ? addr.slice(0, 6) + '...' + addr.slice(-4) : ''

  const isAnvil = chainId === 31337

  return (
    <div className="container">
      <header className="header">
        <h1>⏰ AlarmClock</h1>
        <p>Blockchain Alarm with Staking</p>
      </header>

      {/* 连接按钮 */}
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        {!account ? (
          <button className="connect-btn" onClick={connectWallet}>
            🦊 Connect Wallet
          </button>
        ) : (
          <div>
            <p style={{ marginBottom: '0.5rem' }}>
              Connected: <span style={{ color: '#6366f1' }}>{formatAddress(account)}</span>
            </p>
            <p style={{ fontSize: '0.85rem', color: isAnvil ? '#22c55e' : '#ef4444' }}>
              Network: {isAnvil ? '✅ Anvil Local' : '❌ Wrong Network'}
            </p>
          </div>
        )}
      </div>

      {/* 网络切换 */}
      {account && !isAnvil && (
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <button className="btn btn-warning" onClick={switchToAnvil}>
            Switch to Anvil (31337)
          </button>
        </div>
      )}

      {account && isAnvil && (
        <>
          {/* 统计 */}
          <div className="stats">
            <div className="stat-card">
              <h3>Your Alarms</h3>
              <p>{alarms.length}</p>
            </div>
          </div>

          {/* 创建表单 */}
          <div className="card">
            <h3>Create New Alarm</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Minimum deposit 0.01 ETH, maximum duration 1 hour.
            </p>
            
            {error && <div className="error">{error}</div>}
            {success && <div className="success">{success}</div>}
            
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Start Time</label>
                <input 
                  type="datetime-local" 
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>End Time</label>
                <input 
                  type="datetime-local" 
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Deposit (ETH)</label>
                <input 
                  type="number" 
                  step="0.001"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Processing...' : 'Create Alarm'}
              </button>
            </form>
          </div>

          {/* 列表 */}
          <div className="alarm-list">
            <h3>Your Alarms</h3>
            
            {alarms.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                No alarms yet. Create one above!
              </p>
            ) : (
              alarms.map(alarm => (
                <div key={alarm.id} className="alarm-item">
                  <div>
                    <h4>Alarm #{alarm.id}</h4>
                    <p>{alarm.startTime} ~ {alarm.endTime}</p>
                    <p>Deposit: {alarm.amount} ETH</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span className={`status ${alarm.status.toLowerCase()}`}>
                      {alarm.status}
                    </span>
                    
                    {alarm.status === 'Pending' && (
                      <>
                        {Date.now() / 1000 > alarm.startTimeRaw && Date.now() / 1000 < alarm.endTimeRaw && (
                          <button className="btn btn-success" style={{ padding: '0.5rem' }} onClick={() => handleTrigger(alarm.id)}>
                            Trigger
                          </button>
                        )}
                        {Date.now() / 1000 < alarm.startTimeRaw && (
                          <button className="btn btn-danger" style={{ padding: '0.5rem' }} onClick={() => handleCancel(alarm.id)}>
                            Cancel
                          </button>
                        )}
                        {Date.now() / 1000 > alarm.endTimeRaw && (
                          <button className="btn btn-warning" style={{ padding: '0.5rem' }} onClick={() => handleCheckExpired(alarm.id)}>
                            Check
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default App
