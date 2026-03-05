# 区块链开发面试八股文 - 中英文对照

> Blockchain Development Interview Q&A

---

## 1. 以太坊账户类型 / Ethereum Account Types

### 中文
**以太坊有几种账户？有什么区别？**

两种：
1. **外部账户 (EOA)**：由私钥控制，可以发起交易
2. **合约账户 (CA)**：由代码控制，只能被动响应交易

区别：
- EOA 有私钥，CA 没有
- EOA 可以发起交易，CA 只能在被调用时执行代码
- EOA 存储余额，CA 存储代码和存储

### English
**How many types of Ethereum accounts? What's the difference?**

Two types:
1. **EOA (Externally Owned Account)**: Controlled by private key, can initiate transactions
2. **CA (Contract Account)**: Controlled by code, can only respond passively

Difference:
- EOA has private key, CA doesn't
- EOA can initiate transactions, CA only executes when called
- EOA stores balance, CA stores code and storage

---

## 2. 交易类型 / Transaction Types

### 中文
**以太坊有哪些交易类型？**

1. **Legacy 交易**: EIP-155
2. **EIP-2930**: 访问列表交易
3. **EIP-1559**: 基础费用燃烧交易 (Type 2)

### English
**What are the transaction types in Ethereum?**

1. **Legacy transactions**: EIP-155
2. **EIP-2930**: Access List transactions
3. **EIP-1559**: Base fee burning transactions (Type 2)

---

## 3. 以太坊共识 / Ethereum Consensus

### 中文
**以太坊的共识机制是什么？**

- **PoW (工作量证明)**: 之前使用，消耗大量能源
- **PoS (权益证明)**: 2022 年 The Merge 后使用
  - 验证者 (Validator) 质押 ETH
  - 提案和证明职责
  - 约 12 秒出一个区块

### English
**What is Ethereum's consensus mechanism?**

- **PoW (Proof of Work)**: Used before, consumed lots of energy
- **PoS (Proof of Stake)**: Used since The Merge in 2022
  - Validators stake ETH
  - Proposing and attesting responsibilities
  - ~12 seconds per block

---

## 4. 状态树 / State Trie

### 中文
**以太坊使用什么数据结构存储状态？**

Merkle Patricia Trie (MPT)

- **状态树**: 账户状态 (余额、nonce、代码哈希、存储根)
- **存储树**: 合约存储
- **交易树**: 交易列表
- **收据树**: 交易收据

### English
**What data structure does Ethereum use to store state?**

Merkle Patricia Trie (MPT)

- **State Trie**: Account state (balance, nonce, code hash, storage root)
- **Storage Trie**: Contract storage
- **Transaction Trie**: List of transactions
- **Receipt Trie**: Transaction receipts

---

## 5. 区块结构 / Block Structure

### 中文
**以太坊区块包含哪些内容？**

- **Header**: 父哈希、状态根、交易根、收据根、时间戳、难度、区块号等
- **Body**: 交易列表
- **Uncles**: 叔块列表

### English
**What does an Ethereum block contain?**

- **Header**: Parent hash, state root, transaction root, receipt root, timestamp, difficulty, block number, etc.
- **Body**: List of transactions
- **Uncles**: List of uncle blocks

---

## 6. Account Abstraction / 账户抽象

### 中文
**什么是账户抽象 (ERC-4337)？**

允许合约成为账户，无需私钥，通过签名验证实现。

优点：
- 社交恢复
- 多签支持
- 无需 ETH 也能发起交易（通过元交易）

### English
**What is Account Abstraction (ERC-4337)?**

Allows contracts to become accounts, no private key needed, uses signature verification.

Benefits:
- Social recovery
- Multi-sig support
- Can initiate transactions without ETH (via meta-transactions)

---

## 7. EIP-1559

### 中文
**EIP-1559 带来了什么变化？**

1. 基础费用 (Base Fee) 燃烧
2. 动态区块大小 (目标 15M gas)
3. 优先费用 (Priority Fee) 给矿工/验证者
4. 费用估算更简单

### English
**What changes did EIP-1559 bring?**

1. Base Fee burning
2. Dynamic block size (target 15M gas)
3. Priority Fee to miners/validators
4. Easier fee estimation

---

## 8. Merkle Tree / 默克尔树

### 中文
**什么是 Merkle 树？有什么作用？**

- 每个叶子节点是数据的哈希
- 非叶子节点是子节点哈希的哈希
- 根节点代表整个数据集

**作用**：
- 轻客户端验证
- 数据完整性证明
- SPV (Simplified Payment Verification)

### English
**What is a Merkle Tree? What's its purpose?**

- Each leaf node is a hash of data
- Non-leaf nodes are hashes of child hashes
- Root node represents entire dataset

**Purpose**:
- Light client verification
- Data integrity proof
- SPV (Simplified Payment Verification)

---

## 9. DAO Attack / DAO 攻击

### 中文
**什么是 DAO 攻击？**

2016 年，DAO 合约被重入攻击，损失 360 万 ETH。

**教训**：
- 使用 Checks-Effects-Interactions
- 使用 ReentrancyGuard
- 智能合约审计重要性

### English
**What was the DAO attack?**

In 2016, DAO contract was attacked via reentrancy, losing 3.6 million ETH.

**Lessons**:
- Use Checks-Effects-Interactions
- Use ReentrancyGuard
- Importance of smart contract audits

---

## 10. Front-Running / 前置交易

### 中文
**什么是 Front-Running？**

在区块链上，矿工或验证者可以看到待处理交易，利用信息优势在自己区块中优先执行高费用交易。

**解决方案**：
- 暗箱交易 (Commit-Reveal)
- Flashbots
- MEV (Miner Extractable Value) 保护

### English
**What is Front-Running?**

On blockchain, miners/validators can see pending transactions, using information advantage to prioritize high-fee transactions in their blocks.

**Solutions**:
- Commit-Reveal schemes
- Flashbots
- MEV protection

---

## 11. 合约调用方式 / Contract Call Methods

### 中文
**call, delegatecall, staticcall, callcode 的区别？**

- **call**: 普通调用，上下文分离
- **delegatecall**: 委托调用，保留调用者上下文
- **staticcall**: 静态调用，不能修改状态
- **callcode**: 已废弃，类似 delegatecall

### English
**Difference between call, delegatecall, staticcall, callcode?**

- **call**: Regular call, separate context
- **delegatecall**: Delegate call, preserves caller's context
- **staticcall**: Static call, cannot modify state
- **callcode**: Deprecated, similar to delegatecall

---

## 12. 签名验证 / Signature Verification

### 中文
**如何在智能合约中验证签名？**

使用 `ecrecover` 函数：
```solidity
function verifySignature(bytes32 hash, bytes memory signature) public pure returns (address) {
    bytes32 r;
    bytes32 s;
    uint8 v;
    (v, r, s) = splitSignature(signature);
    return ecrecover(hash, v, r, s);
}
```

**注意**：需要处理签名 malleability

### English
**How to verify signatures in smart contracts?**

Use `ecrecover` function:
```solidity
function verifySignature(bytes32 hash, bytes memory signature) public pure returns (address) {
    bytes32 r;
    bytes32 s;
    uint8 v;
    (v, r, s) = splitSignature(signature);
    return ecrecover(hash, v, r, s);
}
```

**Note**: Need to handle signature malleability

---

## 13. Token 标准 / Token Standards

### 中文
**ERC-20 和 ERC-721 的区别？**

| 特性 | ERC-20 | ERC-721 |
|------|---------|---------|
| 类型 | 可替代代币 | 不可替代代币 (NFT) |
| 转移 | 任意数量 | 逐个转移 |
| 标识 | 无 | 唯一 ID |

### English
**Difference between ERC-20 and ERC-721?**

| Feature | ERC-20 | ERC-721 |
|---------|--------|---------|
| Type | Fungible Token | Non-Fungible Token (NFT) |
| Transfer | Any amount | One by one |
| Identifier | None | Unique ID |

---

## 14. 部署成本 / Deployment Cost

### 中文
**部署合约需要多少 Gas？**

- 基础部署：~53,000 Gas
- 合约大小：每字节 200 Gas
- 1KB 合约：~320,000 Gas

### English
**How much Gas does contract deployment cost?**

- Base deployment: ~53,000 Gas
- Contract size: 200 Gas per byte
- 1KB contract: ~320,000 Gas
