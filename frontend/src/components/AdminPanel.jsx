import { useState } from 'react'

const formatAddress = (addr) => addr ? addr.slice(0, 6) + '...' + addr.slice(-4) : ''

export function AdminPanel({ contractOwner, account, totalForfeited, onWithdraw, loading, error }) {
  const [amount, setAmount] = useState('0.01')
  const isOwner = account && contractOwner && account.toLowerCase() === contractOwner.toLowerCase()
  const hasForfeited = Number(totalForfeited) > 0

  const handleSubmit = (e) => {
    e.preventDefault()
    onWithdraw(amount)
  }

  return (
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
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Amount (ETH)</label>
          <input
            type="number"
            step="0.001"
            min="0.001"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            disabled={!isOwner}
          />
        </div>
        <button type="submit" className="btn btn-warning" disabled={loading || !isOwner || !hasForfeited}>
          {loading ? 'Processing...' : hasForfeited ? 'Withdraw Forfeited' : 'No funds to withdraw'}
        </button>
      </form>
    </div>
  )
}
