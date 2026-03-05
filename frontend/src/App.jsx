import { useState, useEffect, useMemo } from 'react'
import { BrowserProvider, Contract, formatEther, parseEther } from 'ethers'
import { AlarmItem } from './components/AlarmItem'
import { CreateAlarmForm } from './components/CreateAlarmForm'
import { Stats } from './components/Stats'
import { AdminPanel } from './components/AdminPanel'

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

const CONTRACT_ABI = [
  "function createAlarm(uint256 startTime, uint256 endTime) external payable returns (uint256)",
  "function triggerAlarm(uint256 alarmId) external",
  "function cancelAlarm(uint256 alarmId) external",
  "function checkExpiredAlarm(uint256 alarmId) external",
  "function withdrawForfeited(uint256 amount) external",
  "function alarms(uint256 alarmId) external view returns (address user, uint256 amount, uint256 startTime, uint256 endTime, uint8 status, uint256 createdAt)",
  "function getUserAlarms(address user) external view returns (uint256[])",
  "function getContractBalance() external view returns (uint256)",
  "function owner() external view returns (address)",
  "function totalDeposited() external view returns (uint256)",
  "function totalForfeited() external view returns (uint256)"
]

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
  const [chainNow, setChainNow] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

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
            const startTimeNum = Number(data.startTime)
            const endTimeNum = Number(data.endTime)
            alarmsData.push({
              id: alarmId.toString(),
              amount: formatEther(data.amount),
              startTime: new Date(startTimeNum * 1000).toLocaleString(),
              endTime: new Date(endTimeNum * 1000).toLocaleString(),
              status: STATUS_MAP[Number(data.status)] || 'Unknown',
              startTimeRaw: startTimeNum,
              endTimeRaw: endTimeNum
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
        const newTime = Number(latestBlock.timestamp)
        console.log("Chain time synced:", newTime, new Date(newTime * 1000).toLocaleString())
        setChainNow(newTime)
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

    syncChainTime()
    const timer = setInterval(() => {
      syncChainTime()
    }, 5000)

    return () => clearInterval(timer)
  }, [account, chainId, isSupportedChain, contractAddress])

  const handleWithdrawForfeited = async (withdrawAmount) => {
    if (!isSupportedChain) return

    const isOwner = account && contractOwner && account.toLowerCase() === contractOwner.toLowerCase()
    if (!isOwner) {
      setError("Only contract owner can withdraw forfeited funds.")
      return
    }

    if (Number(totalForfeited) <= 0) {
      setError("No forfeited funds available.")
      return
    }

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
      loadStats()
    } catch (err) {
      setError("Error: " + (err.message || err.toString()))
    }

    setLoading(false)
  }

  const handleCreate = async ({ startTime, endTime, amount }) => {
    if (!account || !isSupportedChain) return

    setError("")
    setSuccess("")
    setLoading(true)

    try {
      // 正确解析 datetime-local 输入
      // datetime-local 返回的是本地时间，不需要时区转换
      const parseDateTimeLocal = (value) => {
        // datetime-local 格式: "YYYY-MM-DDTHH:mm"
        // JavaScript Date 构造函数会正确解析为本地时间
        const dateObj = new Date(value)
        return Math.floor(dateObj.getTime() / 1000)
      }
      
      const startTimestamp = parseDateTimeLocal(startTime)
      const endTimestamp = parseDateTimeLocal(endTime)
      const parsedAmount = parseFloat(amount)

      console.log("=== Create Alarm Debug ===")
      console.log("startTime input:", startTime)
      console.log("endTime input:", endTime)
      console.log("startTimestamp:", startTimestamp)
      console.log("endTimestamp:", endTimestamp)
      console.log("duration:", endTimestamp - startTimestamp, "seconds")
      console.log("chainNow:", chainNow)
      console.log("currentTimestamp:", Math.floor(Date.now() / 1000))

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

      const currentTimestamp = chainNow || Math.floor(Date.now() / 1000)

      // 验证：开始时间必须是未来（至少 5 分钟后，防止交易确认时已过期）
      const MIN_START_BUFFER = 300 // 5 分钟缓冲
      if (startTimestamp < currentTimestamp + MIN_START_BUFFER) {
        setError(`Start time must be at least ${MIN_START_BUFFER / 60} minute(s) in the future to allow for transaction confirmation.`)
        setLoading(false)
        return
      }
      const provider = new BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const contract = new Contract(contractAddress, CONTRACT_ABI, signer)
      
      const tx = await contract.createAlarm(BigInt(startTimestamp), BigInt(endTimestamp), {
        value: parseEther(amount)
      })

      setSuccess("Transaction sent! Hash: " + tx.hash)
      await tx.wait()
      setSuccess("Alarm created successfully!")
      
      setTimeout(() => {
        loadAlarms()
        loadStats()
        setTimeout(() => {
          loadAlarms()
          loadStats()
        }, 1500)
      }, 1500)
      
    } catch (err) {
      console.error("Create alarm error:", err)
      // 尝试解析合约 revert 错误
      let errorMessage = err.message || err.toString()
      if (err.data) {
        // ethers.js v6 格式
        if (err.data.message) {
          errorMessage = err.data.message
        }
        // 尝试提取 revert 原因
        const revertMatch = errorMessage.match(/reason[:\s]+([^"'\\]+)/)
        if (revertMatch) {
          errorMessage = "Contract reverted: " + revertMatch[1].trim()
        }
      }
      setError("Error: " + errorMessage)
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
      console.error("Cancel alarm error:", err)
      let errorMessage = err.message || err.toString()
      // 解析合约错误
      if (errorMessage.includes('0xcd1256ef')) {
        errorMessage = "Cannot cancel: alarm start time has passed. You can only trigger the alarm or wait for it to expire."
      } else if (errorMessage.includes('0x1878fe86')) {
        errorMessage = "You are not the owner of this alarm."
      } else if (errorMessage.includes('0x1b77d1c2')) {
        errorMessage = "Alarm has already been triggered."
      } else if (errorMessage.includes('0x5f38b019')) {
        errorMessage = "Alarm has already been cancelled."
      } else if (errorMessage.includes('0x2dcatr4b')) {
        errorMessage = "Alarm has already expired."
      }
      setError("Error: " + errorMessage)
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

  const formatAddress = (addr) => addr ? addr.slice(0, 6) + '...' + addr.slice(-4) : ''
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
          <Stats alarms={alarms} totalDeposited={totalDeposited} totalForfeited={totalForfeited} />

          <CreateAlarmForm 
            chainNow={chainNow} 
            onCreate={handleCreate} 
            loading={loading} 
            error={error} 
            success={success} 
          />

          <AdminPanel 
            contractOwner={contractOwner}
            account={account}
            totalForfeited={totalForfeited}
            onWithdraw={handleWithdrawForfeited}
            loading={loading}
            error={error}
          />

          <div className="alarm-list">
            <h3>Your Alarms</h3>
            {alarms.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No alarms yet. Create one above!</p>
            ) : (
              alarms.map(alarm => (
                <AlarmItem 
                  key={alarm.id} 
                  alarm={alarm} 
                  nowSec={nowSec}
                  onTrigger={handleTrigger}
                  onCancel={handleCancel}
                  onCheckExpired={handleCheckExpired}
                  loading={loading}
                />
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default App
