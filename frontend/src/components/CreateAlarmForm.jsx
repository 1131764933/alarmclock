import { useState, useEffect } from 'react'

export function CreateAlarmForm({ chainNow, onCreate, loading, error, success }) {
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [amount, setAmount] = useState('0.01')

  useEffect(() => {
    if (chainNow) {
      const start = new Date((chainNow + 60) * 1000)
      const end = new Date((chainNow + 120) * 1000)
      setStartTime(start.toISOString().slice(0, 16))
      setEndTime(end.toISOString().slice(0, 16))
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
        Minimum deposit 0.01 ETH, maximum duration 1 hour.
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
