import { useState, useEffect, useMemo } from 'react'
import { BrowserProvider, Contract, formatEther, parseEther } from 'ethers'

const CHAIN_CONFIG = {
  31337: {
    name: "Anvil Local",
    contractAddress:
      import.meta.env.VITE_CONTRACT_ADDRESS_31337 ||
      "0x5FbDB2315678afecb367f032d93F642f64180aa3"
  },
  11155111: {
    name: "Sepolia",
    contractAddress: import.meta.env.VITE_CONTRACT_ADDRESS_11155111 || ""
  }
}

// 合约 ABI
const CONTRACT_ABI = [
  "function createAlarm(uint256 startTime, uint256 endTime) external payable returns (uint256)",
  "function triggerAlarm(uint256 alarmId) external",
  "function cancelAlarm(uint256 alarmId) external",
  "function checkExpiredAlarm(uint256 alarmId) external",
  "function withdrawForfeited(uint256 amount) external",
  "function alarms(uint256 alarmId) external view returns (address user, uint256 amount, uint256 startTime, uint256 endTime, uint8 status, uint256 createdAt)",
  "function getUserAlarms(address user) external view returns (uint256[])",
  "function owner() external view returns (address)",
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
  const [totalDeposited, setTotalDeposited] = useState("0")
  const [totalForfeited, setTotalForfeited] = useState("0")
  const [contractOwner, setContractOwner] = useState("")
  const [withdrawAmount, setWithdrawAmount] = useState("0.01")
  const [chainNow, setChainNow] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [amount, setAmount] = useState("0.01")

  const activeChain = useMemo(() => (chainId ? CHAIN_CONFIG[chainId] : null), [chainId])
  const contractAddress = activeChain?.contractAddress || ""
  const isSupportedChain = Boolean(activeChain && contractAddress)

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

  const checkConnection = async () => {
    if (!window.ethereum) {
      setError("Please install MetaMask!")
      return
    }
    
    try {
      const provider = new BrowserProvider(window.ethereum)
      const accounts = await provider.send("eth_requestAccounts", [])
      if (accounts.length > 0) setAccount(accounts[0])
      
      const network = await provider.getNetwork()
      setChainId(Number(network.chainId))
    } catch (err) {
      console.error(err)
    }
  }

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

  const switchToAnvil = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x7A69' }]
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

  // 通过 getUserAlarms 获取当前用户闹钟ID，再逐个读取详情
  const loadAlarms = async () => {
    if (!account || !isSupportedChain) return
    
    try {
      const provider = new BrowserProvider(window.ethereum)
      const contract = new Contract(contractAddress, CONTRACT_ABI, provider)

      const alarmsData = []

      const userAlarmIds = await contract.getUserAlarms(account)

      for (const alarmId of userAlarmIds) {
        try {
          const data = await contract.alarms(alarmId)
          if (data && data.amount && data.amount > 0n) {
            alarmsData.push({
              id: alarmId.toString(),
              amount: formatEther(data.amount),
              startTime: new Date(Number(data.startTime) * 1000).toLocaleString(),
              endTime: new Date(Number(data.endTime) * 1000).toLocaleString(),
              status: STATUS_MAP[Number(data.status)] || 'Unknown',
              startTimeRaw: Number(data.startTime),
              endTimeRaw: Number(data.endTime)
            })
          }
        } catch (e) {
          console.warn("Failed to load alarm:", alarmId.toString(), e.message)
        }
      }
      
      setAlarms(alarmsData.reverse())
    } catch (err) {
      console.warn("loadAlarms error:", err.message)
      setAlarms([])
    }
  }

  const loadStats = async () => {
    if (!isSupportedChain) return

    try {
      const provider = new BrowserProvider(window.ethereum)
      const contract = new Contract(contractAddress, CONTRACT_ABI, provider)

      const [deposited, forfeited] = await Promise.all([
        contract.totalDeposited(),
        contract.totalForfeited()
      ])

      setTotalDeposited(formatEther(deposited))
      setTotalForfeited(formatEther(forfeited))
    } catch (err) {
      console.warn("loadStats error:", err.message)
      setTotalDeposited("0")
      setTotalForfeited("0")
    }
  }

  const loadContractOwner = async () => {
    if (!isSupportedChain) return

    try {
      const provider = new BrowserProvider(window.ethereum)
      const contract = new Contract(contractAddress, CONTRACT_ABI, provider)
      const ownerAddress = await contract.owner()
      setContractOwner(ownerAddress)
    } catch (err) {
      console.warn("loadContractOwner error:", err.message)
      setContractOwner("")
    }
  }

  const syncChainTime = async () => {
    if (!isSupportedChain) return

    try {
      const provider = new BrowserProvider(window.ethereum)
      const latestBlock = await provider.getBlock("latest")
      if (latestBlock?.timestamp) {
        setChainNow(Number(latestBlock.timestamp))
      }
    } catch (err) {
      console.warn("syncChainTime error:", err.message)
    }
  }

  useEffect(() => {
    if (account && isSupportedChain) {
      loadAlarms()
      loadStats()
      loadContractOwner()
      syncChainTime()
    }
  }, [account, chainId, isSupportedChain, contractAddress])

  useEffect(() => {
    if (!account || !isSupportedChain) return

    const timer = setInterval(() => {
      syncChainTime()
    }, 5000)

    return () => clearInterval(timer)
  }, [account, chainId, isSupportedChain, contractAddress])

  const handleWithdrawForfeited = async (e) => {
    e.preventDefault()
    if (!isOwner || !isSupportedChain) return

    setError("")
    setSuccess("")
    setLoading(true)

    try {
      const parsedAmount = parseFloat(withdrawAmount)
      if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
        setError("Withdraw amount must be greater than 0.")
        setLoading(false)
        return
      }

      if (parsedAmount > Number(totalForfeited)) {
        setError("Amount exceeds total forfeited balance.")
        setLoading(false)
        return
      }

      const provider = new BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const contract = new Contract(contractAddress, CONTRACT_ABI, signer)

      const tx = await contract.withdrawForfeited(parseEther(withdrawAmount))
      setSuccess("Withdraw transaction sent! Hash: " + tx.hash)
      await tx.wait()
      setSuccess("Withdraw successful.")
      setWithdrawAmount("0.01")
      loadStats()
    } catch (err) {
      setError("Error: " + (err.message || err.toString()))
    }

    setLoading(false)
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!account || !isSupportedChain) return

    setError("")
    setSuccess("")
    setLoading(true)

    try {
      const startTimestamp = Math.floor(new Date(startTime).getTime() / 1000)
      const endTimestamp = Math.floor(new Date(endTime).getTime() / 1000)
      const parsedAmount = parseFloat(amount)

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

      // 获取当前时间戳（秒）
      const currentTimestamp = chainNow || Math.floor(Date.now() / 1000)
      console.log("Current timestamp:", currentTimestamp)
      console.log("Start timestamp:", startTimestamp)
      console.log("End timestamp:", endTimestamp)

      // 额外校验
      if (startTimestamp < currentTimestamp) {
        setError("Start time must be in the future!")
        setLoading(false)
        return
      }

      const provider = new BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const contract = new Contract(contractAddress, CONTRACT_ABI, signer)
      
      // 使用 BigInt 转换参数
      const tx = await contract.createAlarm(BigInt(startTimestamp), BigInt(endTimestamp), {
        value: parseEther(amount)
      })

      setSuccess("Transaction sent! Hash: " + tx.hash)
      await tx.wait()
      setSuccess("Alarm created successfully!")

      setStartTime("")
      setEndTime("")
      setAmount("0.01")
      
      setTimeout(() => {
        loadAlarms()
        loadStats()
        setTimeout(() => {
          loadAlarms()
          loadStats()
        }, 1500)
      }, 1500)
      
    } catch (err) {
      setError("Error: " + (err.message || err.toString()))
    }

    setLoading(false)
  }

  const handleTrigger = async (id) => {
    if (!isSupportedChain) return

    setError("")
    setLoading(true)
    
    try {
      const provider = new BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const contract = new Contract(contractAddress, CONTRACT_ABI, signer)
      
      const tx = await contract.triggerAlarm(BigInt(id))
      setSuccess("Transaction sent! Wait for confirmation...")
      await tx.wait()
      setSuccess("Alarm triggered! ETH returned.")
      setTimeout(() => {
        loadAlarms()
        loadStats()
      }, 1000)
    } catch (err) {
      setError("Error: " + (err.message || err.toString()))
    }
    setLoading(false)
  }

  const handleCancel = async (id) => {
    if (!isSupportedChain) return

    setError("")
    setLoading(true)
    
    try {
      const provider = new BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const contract = new Contract(contractAddress, CONTRACT_ABI, signer)
      
      const tx = await contract.cancelAlarm(BigInt(id))
      setSuccess("Transaction sent! Wait for confirmation...")
      await tx.wait()
      setSuccess("Alarm cancelled! ETH returned.")
      setTimeout(() => {
        loadAlarms()
        loadStats()
      }, 1000)
    } catch (err) {
      setError("Error: " + (err.message || err.toString()))
    }
    setLoading(false)
  }

  const handleCheckExpired = async (id) => {
    if (!isSupportedChain) return

    try {
      const provider = new BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const contract = new Contract(contractAddress, CONTRACT_ABI, signer)
      
      const tx = await contract.checkExpiredAlarm(BigInt(id))
      await tx.wait()
      loadAlarms()
      loadStats()
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    const now = new Date()
    const start = new Date(now.getTime() + 60 * 60 * 1000)
    const end = new Date(now.getTime() + 2 * 60 * 60 * 1000)
    setStartTime(start.toISOString().slice(0, 16))
    setEndTime(end.toISOString().slice(0, 16))
  }, [])

  const formatAddress = (addr) => addr ? addr.slice(0, 6) + '...' + addr.slice(-4) : ''
  const isOwner = account && contractOwner && account.toLowerCase() === contractOwner.toLowerCase()
  const nowSec = chainNow || Math.floor(Date.now() / 1000)

  return (
    <div className="container">
      <header className="header">
        <h1>⏰ AlarmClock</h1>
        <p>Blockchain Alarm with Staking</p>
      </header>

      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        {!account ? (
          <button className="connect-btn" onClick={connectWallet}>🦊 Connect Wallet</button>
        ) : (
          <div>
            <p style={{ marginBottom: '0.5rem' }}>
              Connected: <span style={{ color: '#6366f1' }}>{formatAddress(account)}</span>
            </p>
            <p style={{ fontSize: '0.85rem', color: isSupportedChain ? '#22c55e' : '#ef4444' }}>
              Network: {isSupportedChain ? `✅ ${activeChain.name}` : '❌ Unsupported Network'}
            </p>
          </div>
        )}
      </div>

      {account && !isSupportedChain && (
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <button className="btn btn-warning" onClick={switchToAnvil}>Switch to Anvil (31337)</button>
        </div>
      )}

      {account && isSupportedChain && (
        <>
          <div className="stats">
            <div className="stat-card">
              <h3>Your Alarms</h3>
              <p>{alarms.length}</p>
            </div>
            <div className="stat-card">
              <h3>Total Deposited</h3>
              <p>{Number(totalDeposited).toFixed(4)} ETH</p>
            </div>
            <div className="stat-card">
              <h3>Total Forfeited</h3>
              <p>{Number(totalForfeited).toFixed(4)} ETH</p>
            </div>
          </div>

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
                <input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>End Time</label>
                <input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Deposit (ETH)</label>
                <input type="number" step="0.001" min="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Processing...' : 'Create Alarm'}
              </button>
            </form>
          </div>

          <div className="card">
            <h3>Admin: Withdraw Forfeited</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Owner: {contractOwner ? formatAddress(contractOwner) : 'Loading...'}
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Available forfeited: {Number(totalForfeited).toFixed(4)} ETH
            </p>
            {!isOwner && (
              <div className="error">Only contract owner can withdraw forfeited funds.</div>
            )}
            <form onSubmit={handleWithdrawForfeited}>
              <div className="form-group">
                <label>Amount (ETH)</label>
                <input
                  type="number"
                  step="0.001"
                  min="0.001"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  required
                  disabled={!isOwner}
                />
              </div>
              <button type="submit" className="btn btn-warning" disabled={loading || !isOwner}>
                {loading ? 'Processing...' : 'Withdraw Forfeited'}
              </button>
            </form>
          </div>

          <div className="alarm-list">
            <h3>Your Alarms</h3>
            {alarms.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No alarms yet. Create one above!</p>
            ) : (
              alarms.map(alarm => (
                <div key={alarm.id} className="alarm-item">
                  <div>
                    <h4>Alarm #{alarm.id}</h4>
                    <p>{alarm.startTime} ~ {alarm.endTime}</p>
                    <p>Deposit: {alarm.amount} ETH</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span className={`status ${alarm.status.toLowerCase()}`}>{alarm.status}</span>
                    {alarm.status === 'Pending' && (
                      <>
                        {nowSec >= alarm.startTimeRaw && nowSec <= alarm.endTimeRaw && (
                          <button className="btn btn-success" style={{ padding: '0.5rem' }} onClick={() => handleTrigger(alarm.id)}>Trigger</button>
                        )}
                        {nowSec < alarm.startTimeRaw && (
                          <button className="btn btn-danger" style={{ padding: '0.5rem' }} onClick={() => handleCancel(alarm.id)}>Cancel</button>
                        )}
                        {nowSec > alarm.endTimeRaw && (
                          <button className="btn btn-warning" style={{ padding: '0.5rem' }} onClick={() => handleCheckExpired(alarm.id)}>Check</button>
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
