export function Stats({ alarms, totalDeposited, totalForfeited }) {
  return (
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
  )
}
