const formatAddress = (addr) => addr ? addr.slice(0, 6) + '...' + addr.slice(-4) : ''

const getCountdown = (targetSec, nowSec) => {
  const diff = targetSec - nowSec
  if (diff <= 0) return 'Expired'
  const h = Math.floor(diff / 3600)
  const m = Math.floor((diff % 3600) / 60)
  const s = diff % 60
  return `${h}h ${m}m ${s}s`
}

export function AlarmItem({ alarm, nowSec, onTrigger, onCancel, onCheckExpired, loading }) {
  const handleTrigger = () => onTrigger(alarm.id)
  const handleCancel = () => onCancel(alarm.id)
  const handleCheck = () => onCheckExpired(alarm.id)

  return (
    <div className="alarm-item">
      <div>
        <h4>Alarm #{alarm.id}</h4>
        <p>{alarm.startTime} ~ {alarm.endTime}</p>
        <p>Deposit: {alarm.amount} ETH</p>
        {alarm.status === 'Pending' && (
          <p style={{ 
            color: nowSec >= alarm.startTimeRaw && nowSec <= alarm.endTimeRaw ? 'var(--success)' : 'var(--text-muted)', 
            fontSize: '0.85rem' 
          }}>
            {nowSec < alarm.startTimeRaw 
              ? `Starts in: ${getCountdown(alarm.startTimeRaw, nowSec)}` 
              : nowSec <= alarm.endTimeRaw 
                ? `Ends in: ${getCountdown(alarm.endTimeRaw, nowSec)}` 
                : 'Expired'}
          </p>
        )}
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <span className={`status ${alarm.status.toLowerCase()}`}>{alarm.status}</span>
        {alarm.status === 'Pending' && (
          <>
            {nowSec >= alarm.startTimeRaw && nowSec <= alarm.endTimeRaw && (
              <button className="btn btn-success" style={{ padding: '0.5rem' }} onClick={handleTrigger} disabled={loading}>Trigger</button>
            )}
            {nowSec < alarm.startTimeRaw && (
              <button className="btn btn-danger" style={{ padding: '0.5rem' }} onClick={handleCancel} disabled={loading}>Cancel</button>
            )}
            {nowSec > alarm.endTimeRaw && (
              <button className="btn btn-warning" style={{ padding: '0.5rem' }} onClick={handleCheck} disabled={loading}>Check</button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
