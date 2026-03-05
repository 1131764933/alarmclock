import { useState, useEffect } from 'react'

export function CreateAlarmForm({ chainNow, onCreate, loading, error, success }) {
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [amount, setAmount] = useState('0.01')

  useEffect(() => {
    if (chainNow) {
      // 将链上时间转换为本地时间用于显示
      const formatForInput = (timestamp) => {
        const date = new Date(timestamp * 1000)
        // 格式化为 YYYY-MM-DDTHH:mm（datetime-local 格式）
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        return `${year}-${month}-${day}T${hours}:${minutes}`
      }
      
      // 默认从 5 分钟后开始（给交易确认留出时间）
      const startTimestamp = chainNow + 300
      const endTimestamp = chainNow + 360
      setStartTime(formatForInput(startTimestamp))
      setEndTime(formatForInput(endTimestamp))
    }
  }, [chainNow])

  const handleSubmit = (e) => {
    e.preventDefault()
    onCreate({ startTime, endTime, amount })
  }

  return (
    <div className="card">
      <h3>Create New Alarm</h3>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
        Chain time: {chainNow ? new Date(chainNow * 1000).toLocaleString() : 'Loading...'}
      </p>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
        Minimum deposit 0.01 ETH, maximum duration 1 hour. Start time must be at least 5 minutes in the future.
      </p>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      
      <form onSubmit={handleSubmit}>
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
  )
}
