# AlarmClock ⏰

A blockchain-based alarm clock DApp where users deposit ETH as collateral → set a time window → trigger to withdraw within the window, or lose it if they miss!

## Project Background

A blockchain application designed for hackathons that helps participants arrive on time through incentive mechanisms.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Smart Contract | Solidity 0.8.20 + OpenZeppelin |
| Development | Foundry (Main) + Hardhat (Alternative) |
| Testing | Forge Std / Mocha + Chai |
| Frontend | React 18 + Vite + Ethers.js |
| Wallet | MetaMask |

## Core Features

1. **Create Alarm** - User sets start/end time, deposits ETH (min 0.01 ETH)
2. **Time Validation** - Uses `block.timestamp` for precise time detection, max 1 hour duration
3. **Trigger & Withdraw** - Call `triggerAlarm()` within time window to get deposit back
4. **Forfeit** - If not triggered after end time, deposit goes to contract/community
5. **Cancel** - Can cancel before start time and get full deposit back

## Contract Architecture

```
AlarmClock (Core Contract)
├── createAlarm()      - Create alarm + deposit
├── triggerAlarm()    - Trigger and withdraw
├── cancelAlarm()     - Cancel (before start)
├── checkExpiredAlarm()- Check expired status
├── withdrawForfeited()- Admin withdraw forfeited funds
└── Events
    ├── AlarmCreated
    ├── AlarmTriggered
    ├── AlarmExpired
    └── AlarmCancelled
```

## Security Features

- ✅ **ReentrancyGuard** - Prevents reentrancy attacks
- ✅ **Ownable** - Admin access control
- ✅ **Input Validation** - Strict parameter checks
- ✅ **Timestamp Validation** - Prevents front-end time tampering

## Quick Start

### 1. Install Dependencies

```bash
cd alarmclock
forge install
cd frontend && npm install
```

### 2. Start Local Blockchain

```bash
# Using Anvil (Foundry)
anvil --chain-id 31337 --host 127.0.0.1 --port 8545
```

### 3. Deploy Contract

```bash
# Using Foundry
forge create --rpc-url http://127.0.0.1:8545 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  --broadcast \
  contracts/AlarmClock.sol:AlarmClock
```

### 4. Configure Frontend

```bash
cd frontend
cp .env.example .env
# Edit .env, add contract address VITE_CONTRACT_ADDRESS_31337=0x...
```

### 5. Start Frontend

```bash
npm run dev
```

## Run Tests

```bash
# Foundry tests
forge test -vv

# Hardhat tests
npx hardhat test
```

## Test Coverage

```
✓ testCreateAlarm              - Create alarm success
✓ testCreateAlarmZeroAmount   - Zero amount should fail
✓ testCreateAlarmInvalidTimeRange - Invalid time range
✓ testTriggerAlarm           - Trigger within time window
✓ testTriggerAlarmNotYetStarted - Before start time should fail
✓ testTriggerAlarmExpired    - After end time should fail
✓ testCheckExpiredAlarmSuccess - Check expired success
✓ testCancelAlarm            - Cancel success
✓ testCancelAlarmAfterStart  - Cannot cancel after start
✓ testTriggerAlarmNotOwner   - Non-owner cannot trigger
```

## Contract Interface

```solidity
// Create alarm
function createAlarm(uint256 startTime, uint256 endTime) external payable returns (uint256);

// Trigger alarm (within time window)
function triggerAlarm(uint256 alarmId) external;

// Cancel alarm (before start time)
function cancelAlarm(uint256 alarmId) external;

// Check expired
function checkExpiredAlarm(uint256 alarmId) external;

// Admin withdraw
function withdrawForfeited(uint256 amount) external;

// Queries
function alarms(uint256 alarmId) external view returns (Alarm memory);
function getUserAlarms(address user) external view returns (uint256[]);
```

## Project Structure

```
alarmclock/
├── contracts/           # Smart contracts (Foundry)
│   └── AlarmClock.sol
├── test/               # Tests (Foundry)
│   └── AlarmClock.t.sol
├── script/             # Deployment scripts (Foundry)
├── scripts/            # Hardhat scripts
│   └── deploy.js
├── frontend/           # React frontend
│   ├── src/
│   │   ├── App.jsx
│   │   └── components/
│   │       ├── AlarmItem.jsx
│   │       ├── CreateAlarmForm.jsx
│   │       ├── Stats.jsx
│   │       └── AdminPanel.jsx
│   └── package.json
├── foundry.toml         # Foundry config
├── hardhat.config.js   # Hardhat config
└── package.json        # Project dependencies
```

## Test Accounts

Anvil provides 10 test accounts:

| Account | Address | Private Key |
|---------|---------|-------------|
| #0 | 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 | 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 |
| #1 | 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 | 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d |

⚠️ **Note**: These are test accounts with exposed private keys, for local development only!

## Deployment

### Sepolia Testnet
- **Contract**: `0xFC9C9c36EC5BCf851E101B81cF05fd151AA0C4C2`
- **Etherscan**: https://sepolia.etherscan.io/address/0xFC9C9c36EC5BCf851E101B81cF05fd151AA0C4C2
- **Website**: https://alarmclock-drab.vercel.app/

## License

MIT
