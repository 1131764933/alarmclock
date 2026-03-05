# 第二阶段：智能合约开发

> 预计时长：2-3 小时  
> 目标：理解 Solidity 语法，编写功能完整的智能合约

## 2.1 课程目标

- 理解 Solidity 基本语法
- 掌握合约数据结构设计
- 实现核心业务逻辑
- 理解以太坊安全最佳实践

## 2.2 什么是智能合约？

### 2.2.1 定义

智能合约（Smart Contract）是部署在区块链上的程序代码，当满足预设条件时自动执行。

```
传统合约：
A 和 B 签订合约 → 违约时需起诉 → 法院强制执行

智能合约：
A 存入保证金 → 时间到打卡 → 自动返还/没收
```

### 2.2.2 合约生命周期

```
编写 → 编译 → 部署 → 调用 → 升级/销毁
```

## 2.3 Solidity 基础语法

### 2.3.1 第一个 Solidity 合约

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// 声明合约
contract HelloWorld {
    // 状态变量 - 存储在区块链上
    string public greet = "Hello, World!";
    
    // 函数 - 可以被外部调用
    function setGreet(string memory _greet) public {
        greet = _greet;
    }
}
```

### 2.3.2 数据类型

```solidity
// 值类型
bool public flag = true;           // 布尔值
uint256 public num = 100;          // 无符号整数
int256 public signedNum = -50;     // 有符号整数
address public owner = msg.sender; // 地址类型
bytes32 public data = "hello";     // 固定长度字节

// 引用类型
string public name = "Alice";      // 字符串
uint[] public numbers = [1, 2, 3]; // 动态数组
mapping(address => uint) public balances; // 映射
```

### 2.3.3 函数可见性

```solidity
contract Example {
    uint private privateVar;      // 仅本合约可见
    uint internal internalVar;     // 本合约及子合约可见
    uint public publicVar;        // 外部可读取
    uint external externalVar;     // 仅外部可调用
}
```

### 2.3.4 函数修饰符

```solidity
contract ModifierExample {
    address public owner;
    
    // 构造函数
    constructor() {
        owner = msg.sender;
    }
    
    // 自定义修饰符
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;  // 执行函数体
    }
    
    // 使用修饰符
    function protectedFunction() public onlyOwner() {
        // 只有 owner 才能执行
    }
}
```

## 2.4 合约功能设计

### 2.4.1 需求分析

我们的闹钟合约需要：

1. **创建闹钟** - 用户存入 ETH，设置时间段
2. **触发闹钟** - 在时间范围内取回存款
3. **取消闹钟** - 起始时间前可取消
4. **过期检查** - 超时自动标记过期
5. **提取没收金额** - 管理员提取被没收的 ETH

### 2.4.2 数据结构设计

```solidity
// 枚举：定义状态
enum AlarmStatus {
    Pending,     // 待触发
    Triggered,   // 已触发（已取回）
    Expired,     // 已过期（未取回，没收）
    Cancelled   // 已取消
}

// 结构体：复杂数据结构
struct Alarm {
    address user;           // 合约创建者
    uint256 amount;        // 存款金额
    uint256 startTime;     // 起始时间
    uint256 endTime;       // 结束时间
    AlarmStatus status;    // 当前状态
    uint256 createdAt;     // 创建时间
}
```

### 2.4.3 存储设计

```solidity
// 映射：类似字典/哈希表
mapping(uint256 => Alarm) public alarms;           // ID -> 闹钟详情
mapping(address => uint256[]) public userAlarms;   // 用户 -> 闹钟ID列表
```

### 2.4.4 核心函数实现

#### 创建闹钟

```solidity
function createAlarm(uint256 startTime, uint256 endTime) 
    external 
    payable 
    returns (uint256) 
{
    // 1. 验证存款金额
    require(msg.value >= MIN_DEPOSIT, "Amount too small");
    
    // 2. 验证时间范围
    require(startTime < endTime, "Invalid time range");
    require(endTime - startTime <= MAX_DURATION, "Duration too long");
    require(startTime > block.timestamp, "Must be future time");
    
    // 3. 创建闹钟
    uint256 alarmId = nextAlarmId++;
    alarms[alarmId] = Alarm({
        user: msg.sender,
        amount: msg.value,
        startTime: startTime,
        endTime: endTime,
        status: AlarmStatus.Pending,
        createdAt: block.timestamp
    });
    
    // 4. 记录用户闹钟
    userAlarms[msg.sender].push(alarmId);
    
    // 5. 更新统计
    totalDeposited += msg.value;
    
    return alarmId;
}
```

#### 触发闹钟（取回存款）

```solidity
function triggerAlarm(uint256 alarmId) external {
    Alarm storage alarm = alarms[alarmId];
    
    // 验证权限
    require(alarm.user == msg.sender, "Not owner");
    require(alarm.status == AlarmStatus.Pending, "Already processed");
    
    // 验证时间窗口
    require(block.timestamp >= alarm.startTime, "Not started");
    require(block.timestamp <= alarm.endTime, "Already ended");
    
    // 更新状态
    alarm.status = AlarmStatus.Triggered;
    
    // 转账（使用 call 更安全）
    (bool success, ) = payable(msg.sender).call{value: alarm.amount}("");
    require(success, "Transfer failed");
}
```

### 2.4.5 事件（Events）

事件用于记录链上操作，便于前端监听。

```solidity
// 定义事件
event AlarmCreated(
    uint256 indexed alarmId,
    address indexed user,
    uint256 amount,
    uint256 startTime,
    uint256 endTime
);

// 触发事件
emit AlarmCreated(alarmId, msg.sender, msg.value, startTime, endTime);
```

### 2.4.6 错误处理

```solidity
// 自定义错误（节省 Gas）
error AlarmNotExist();
error AlarmNotOwner();

// 使用错误
if (alarm.user == address(0)) revert AlarmNotExist();
if (alarm.user != msg.sender) revert AlarmNotOwner();
```

## 2.5 安全最佳实践

### 2.5.1 重入攻击防护

```solidity
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract AlarmClock is ReentrancyGuard {
    function createAlarm(...) external payable nonReentrant {
        // 函数体
    }
}
```

### 2.5.2 权限控制

```solidity
import "@openzeppelin/contracts/access/Ownable.sol";

contract AlarmClock is Ownable {
    function withdrawForfeited(uint256 amount) external onlyOwner {
        // 函数体
    }
}
```

### 2.5.3 检查-生效-交互模式

```solidity
function safeTransfer(address to, uint256 amount) internal {
    // 1. 检查
    require(amount > 0, "Zero amount");
    
    // 2. 生效（更新状态）
    balances[msg.sender] -= amount;
    balances[to] += amount;
    
    // 3. 交互（转账）
    (bool success, ) = to.call{value: amount}("");
    require(success, "Transfer failed");
}
```

## 2.6 完整合约代码

查看 `contracts/AlarmClock.sol`

## 2.7 本章小结

✅ 已掌握：
- Solidity 基本语法（变量、函数、修饰符）
- 数据结构设计（struct、enum、mapping）
- 合约业务逻辑实现
- 安全编程模式

❓ 下章预告：
- 编写单元测试验证合约功能
- 使用 Foundry 测试框架

---

**练习题：**

1. 为合约添加一个"冻结"功能，管理员可以暂停所有操作
2. 添加一个事件，记录每次取回的金额
3. 思考：如果想添加"续期"功能，应该如何设计？
