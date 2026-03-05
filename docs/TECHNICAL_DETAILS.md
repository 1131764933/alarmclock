# 区块链开发技术细节 - 中英文对照

> Technical Details for Blockchain Development Interviews

---

## 1. 以太坊虚拟机 / Ethereum Virtual Machine (EVM)

### 中文
**什么是 EVM？**

EVM 是以太坊虚拟机的缩写，它是运行智能合约的运行时环境。每个以太坊节点都运行 EVM，执行智能合约的字节码。EVM 是栈式虚拟机，使用 256 位字长，支持合约之间的调用和消息传递。

### English
**What is EVM?**

EVM stands for Ethereum Virtual Machine. It is the runtime environment for executing smart contracts. Every Ethereum node runs EVM, executing smart contract bytecode. EVM is a stack-based virtual machine with 256-bit word size, supporting calls and messages between contracts.

---

## 2. Gas 机制 / Gas Mechanism

### 中文
**什么是 Gas？**

Gas 是以太坊网络中执行操作所需的计算工作量单位。每个操作（如存储、计算、调用合约）都需要消耗一定数量的 Gas。Gas 的目的是：
1. 防止无限循环攻击
2. 补偿节点计算资源
3. 决定交易优先级

**Gas Limit** 是用户愿意支付的最大 Gas 数量
**Gas Price** 是用户愿意支付的每单位 Gas 价格

### English
**What is Gas?**

Gas is the unit of computational work required to execute operations in the Ethereum network. Every operation (storage, computation, contract call) consumes a certain amount of Gas. The purpose of Gas is:
1. Prevent infinite loop attacks
2. Compensate nodes for computational resources
3. Determine transaction priority

**Gas Limit** is the maximum amount of Gas the user is willing to pay
**Gas Price** is the price per unit of Gas the user is willing to pay

---

## 3. 智能合约部署 / Smart Contract Deployment

### 中文
**智能合约是如何部署的？**

1. 编写 Solidity 源代码
2. 使用编译器 (solc 或 foundry) 编译成字节码
3. 创建部署交易，字节码作为输入数据
4. 矿工执行初始化代码，创建合约账户
5. 合约地址由创建者地址和 nonce 决定

### English
**How are smart contracts deployed?**

1. Write Solidity source code
2. Compile to bytecode using compiler (solc or foundry)
3. Create deployment transaction with bytecode as input data
4. Miners execute initialization code, create contract account
5. Contract address is determined by creator address and nonce

---

## 4. 存储机制 / Storage Mechanism

### 中文
**以太坊如何存储数据？**

每个合约都有独立的存储空间（Storage），是一个键值对映射：
- 键：256 位哈希
- 值：256 位字

存储操作昂贵（20,000 Gas），应尽量减少。需要长期存储的数据放在 storage，临时变量放 memory。

### English
**How does Ethereum store data?**

Each contract has its own storage space (Storage), a key-value mapping:
- Key: 256-bit hash
- Value: 256-bit word

Storage operations are expensive (20,000 Gas). Store long-term data in storage, temporary variables in memory.

---

## 5. CALL vs DELEGATECALL

### 中文
**CALL 和 DELEGATE CALL 的区别？**

- **CALL**: 调用其他合约，msg.sender 改变
- **DELEGATECALL**: 在当前合约上下文执行代码，msg.sender 不变

DELEGATE CALL 用于代理模式，实现可升级合约。

### English
**Difference between CALL and DELEGATE CALL?**

- **CALL**: Calls another contract, msg.sender changes
- **DELEGATECALL**: Executes code in current contract context, msg.sender unchanged

DELEGATECALL is used in proxy patterns for upgradeable contracts.

---

## 6. Reentrancy Attack / 重入攻击

### 中文
**什么是重入攻击？如何防范？**

重入攻击是指合约在更新状态之前调用外部合约，外部合约回调原合约再次执行，重复提取资金。

**防范方法**：
1. Checks-Effects-Interactions 模式
2. 使用 ReentrancyGuard 修饰符
3. 使用 SafeMath 库

### English
**What is a reentrancy attack? How to prevent it?**

A reentrancy attack occurs when a contract calls an external contract before updating state, causing the external contract to callback and execute again, extracting funds repeatedly.

**Prevention methods**:
1. Checks-Effects-Interactions pattern
2. Use ReentrancyGuard modifier
3. Use SafeMath library

---

## 7. 常见加密操作 / Common Cryptographic Operations

### 中文
**智能合约中常用的加密操作？**

1. **哈希**: keccak256 (SHA-3)
2. **签名验证**: ecrecover
3. **加密**: 需要外部库（如 solidity-rlp）

### English
**Common cryptographic operations in smart contracts?**

1. **Hashing**: keccak256 (SHA-3)
2. **Signature verification**: ecrecover
3. **Encryption**: Requires external libraries (e.g., solidity-rlp)

---

## 8. ERC Standards / ERC 标准

### 中文
**常见的 ERC 标准？**

- **ERC-20**: 代币标准
- **ERC-721**: NFT 标准
- **ERC-1155**: 多代币标准
- **ERC-4626**: Vault 代币化标准
- **ERC-4337**: 账户抽象 (Account Abstraction)

### English
**Common ERC standards?**

- **ERC-20**: Token standard
- **ERC-721**: NFT standard
- **ERC-1155**: Multi-token standard
- **ERC-4626**: Vault tokenization standard
- **ERC-4337**: Account Abstraction

---

## 9. 事件和日志 / Events and Logs

### 中文
**什么是事件（Event）？**

事件是以太坊的日志机制，用于记录合约执行过程中的重要信息。事件：
- 存储在交易日志中
- 索引参数可用于搜索
- 消耗 Gas 较少（约 2000 Gas/索引参数）

### English
**What are Events?**

Events are Ethereum's logging mechanism for recording important information during contract execution. Events:
- Stored in transaction logs
- Indexed parameters can be searched
- Consume less Gas (about 2000 Gas/indexed parameter)

---

## 10. 随机数 / Random Number

### 中文
**智能合约如何生成随机数？**

**不推荐**：
- `block.timestamp` - 可被矿工操纵
- `blockhash` - 可预测

**推荐**：
- Chainlink VRF (可验证随机函数)
- 提交-揭示方案 (Commit-Reveal)
- RANDAO

### English
**How to generate random numbers in smart contracts?**

**Not recommended**:
- `block.timestamp` - Can be manipulated by miners
- `blockhash` - Predictable

**Recommended**:
- Chainlink VRF (Verifiable Random Function)
- Commit-Reveal scheme
- RANDAO

---

## 11. 可升级合约 / Upgradeable Contracts

### 中文
**如何实现可升级合约？**

1. **代理模式 (Proxy Pattern)**：
   - 存储在代理合约
   - 逻辑在实现合约
   - 使用 DELEGATECALL

2. **Diamond 标准 (EIP-2535)**：
   - 多个实现合约
   - 代理合约路由

### English
**How to implement upgradeable contracts?**

1. **Proxy Pattern**:
   - Storage in proxy contract
   - Logic in implementation contract
   - Uses DELEGATECALL

2. **Diamond Standard (EIP-2535)**:
   - Multiple implementation contracts
   - Proxy contract routes calls

---

## 12. 跨链合约 / Cross-Chain Contracts

### 中文
**如何实现跨链交互？**

1. **预言机 (Oracle)**：Chainlink, Tellor
2. **桥接 (Bridge)**：LayerZero, Axelar
3. **消息传递**：自行实现的消息验证

### English
**How to implement cross-chain interaction?**

1. **Oracle**: Chainlink, Tellor
2. **Bridge**: LayerZero, Axelar
3. **Message passing**: Self-implemented message verification

---

## 13. 以太坊升级 / Ethereum Upgrades

### 中文
**以太坊的升级机制？**

- **硬分叉**: 不兼容的协议变更
- **EIP**: 以太坊改进提案
- **测试网**: Sepolia, Goerli (已弃用), Holesky

### English
**Ethereum's upgrade mechanism?**

- **Hard fork**: Incompatible protocol changes
- **EIP**: Ethereum Improvement Proposal
- **Testnet**: Sepolia, Goerli (deprecated), Holesky

---

## 14. Layer 2 解决方案 / Layer 2 Solutions

### 中文
**常见的 Layer 2 方案？**

- **Rollups**: Optimistic Rollup, ZK Rollup
- **Sidechains**: Polygon, BSC
- **State Channels**: 状态通道

### English
**Common Layer 2 solutions?**

- **Rollups**: Optimistic Rollup, ZK Rollup
- **Sidechains**: Polygon, BSC
- **State Channels**
