// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title AlarmClock - 区块链闹钟合约
/// @notice 允许用户设置闹钟时间段，在时间范围内可触发取回存款，超时则没收
/// @dev 采用 ReentrancyGuard 防止重入攻击
contract AlarmClock is Ownable, ReentrancyGuard {
    
    // ============ 数据结构 ============
    
    /// @notice 闹钟状态
    enum AlarmStatus {
        Pending,    // 待触发
        Triggered,   // 已触发（已取回）
        Expired,     // 已过期（未取回，没收）
        Cancelled   // 已取消
    }
    
    /// @notice 闹钟信息
    struct Alarm {
        address user;           // 合约创建者
        uint256 amount;         // 存款金额
        uint256 startTime;      // 起始时间（可触发开始）
        uint256 endTime;        // 结束时间（可触发结束）
        AlarmStatus status;     // 当前状态
        uint256 createdAt;      // 创建时间
    }
    
    // ============ 状态变量 ============
    
    /// @notice 闹钟ID => 闹钟信息
    mapping(uint256 => Alarm) public alarms;
    
    /// @notice 用户地址 => 闹钟ID列表（便于查询）
    mapping(address => uint256[]) public userAlarms;
    
    /// @notice 下一个闹钟ID
    uint256 public nextAlarmId;
    
    /// @notice 合约收到的总存款（用于审计）
    uint256 public totalDeposited;
    
    /// @notice 已被没收的总金额（归社区）
    uint256 public totalForfeited;

    /// @notice 最小存款金额：0.01 ETH
    uint256 public constant MIN_DEPOSIT = 0.01 ether;

    /// @notice 闹钟最大允许持续时间：1 小时
    uint256 public constant MAX_DURATION = 1 hours;
    
    // ============ 事件 ============
    
    /// @notice 事件：创建闹钟
    event AlarmCreated(
        uint256 indexed alarmId,
        address indexed user,
        uint256 amount,
        uint256 startTime,
        uint256 endTime
    );
    
    /// @notice 事件：触发闹钟（取回存款）
    event AlarmTriggered(
        uint256 indexed alarmId,
        address indexed user,
        uint256 amount
    );
    
    /// @notice 事件：闹钟过期（未触发，没收）
    event AlarmExpired(
        uint256 indexed alarmId,
        address indexed user,
        uint256 amount
    );
    
    /// @notice 事件：取消闹钟
    event AlarmCancelled(
        uint256 indexed alarmId,
        address indexed user,
        uint256 amount
    );
    
    // ============ 错误定义 ============
    
    error AlarmNotExist();
    error AlarmNotOwner();
    error AlarmAlreadyTriggered();
    error AlarmAlreadyExpired();
    error AlarmAlreadyCancelled();
    error AlarmNotYetStarted();
    error AlarmAlreadyEnded();
    error ZeroAmount();
    error InvalidTimeRange();
    error AmountTooSmall();
    error DurationTooLong();
    error TransferFailed();

    // ============ 构造函数 ============
    
    constructor() Ownable(msg.sender) {
        nextAlarmId = 1;
    }

    // ============ 核心功能 ============
    
    /// @notice 创建闹钟（存入ETH）
    /// @param startTime 起始时间
    /// @param endTime 结束时间
    /// @return alarmId 创建的闹钟ID
    function createAlarm(uint256 startTime, uint256 endTime) 
        external 
        payable 
        nonReentrant 
        returns (uint256) 
    {
        // 验证：存款金额 > 0
        if (msg.value == 0) revert ZeroAmount();

        // 验证：存款金额不少于最小值
        if (msg.value < MIN_DEPOSIT) revert AmountTooSmall();
        
        // 验证：时间范围合理
        if (startTime >= endTime) revert InvalidTimeRange();

        // 验证：持续时间不超过最大限制
        if (endTime - startTime > MAX_DURATION) revert DurationTooLong();
        
        // 验证：起始时间必须是将来了（防止创建过去的闹钟）
        if (startTime < block.timestamp) revert InvalidTimeRange();
        
        uint256 alarmId = nextAlarmId++;
        
        // 存储闹钟信息
        alarms[alarmId] = Alarm({
            user: msg.sender,
            amount: msg.value,
            startTime: startTime,
            endTime: endTime,
            status: AlarmStatus.Pending,
            createdAt: block.timestamp
        });
        
        // 记录用户的闹钟列表
        userAlarms[msg.sender].push(alarmId);
        
        // 更新统计
        totalDeposited += msg.value;
        
        emit AlarmCreated(alarmId, msg.sender, msg.value, startTime, endTime);
        
        return alarmId;
    }
    
    /// @notice 触发闹钟（在时间范围内取回存款）
    /// @param alarmId 闹钟ID
    function triggerAlarm(uint256 alarmId) 
        external 
        nonReentrant 
    {
        Alarm storage alarm = alarms[alarmId];
        
        // 验证：闹钟存在
        if (alarm.user == address(0)) revert AlarmNotExist();
        
        // 验证：必须是闹钟所有者
        if (alarm.user != msg.sender) revert AlarmNotOwner();
        
        // 验证：状态必须是 Pending
        if (alarm.status != AlarmStatus.Pending) {
            if (alarm.status == AlarmStatus.Triggered) revert AlarmAlreadyTriggered();
            if (alarm.status == AlarmStatus.Expired) revert AlarmAlreadyExpired();
            if (alarm.status == AlarmStatus.Cancelled) revert AlarmAlreadyCancelled();
        }
        
        // 验证：必须在起始时间之后
        if (block.timestamp < alarm.startTime) revert AlarmNotYetStarted();
        
        // 验证：必须在结束时间之前
        if (block.timestamp > alarm.endTime) revert AlarmAlreadyEnded();
        
        // 更新状态
        alarm.status = AlarmStatus.Triggered;
        
        // 取回存款
        (bool success, ) = payable(msg.sender).call{value: alarm.amount}("");
        if (!success) revert TransferFailed();
        
        emit AlarmTriggered(alarmId, msg.sender, alarm.amount);
    }
    
    /// @notice 检查并处理过期闹钟（任何人可调用，触发状态更新）
    /// @param alarmId 闹钟ID
    function checkExpiredAlarm(uint256 alarmId) external {
        Alarm storage alarm = alarms[alarmId];
        
        // 验证：闹钟存在
        if (alarm.user == address(0)) revert AlarmNotExist();
        
        // 验证：状态必须是 Pending
        if (alarm.status != AlarmStatus.Pending) return;
        
        // 验证：确实已过期
        if (block.timestamp <= alarm.endTime) revert AlarmAlreadyEnded();
        
        // 更新状态为过期
        alarm.status = AlarmStatus.Expired;
        
        // 更新统计（金额归合约/社区）
        totalForfeited += alarm.amount;
        
        emit AlarmExpired(alarmId, alarm.user, alarm.amount);
    }
    
    /// @notice 取消闹钟（在起始时间之前可取消）
    /// @param alarmId 闹钟ID
    function cancelAlarm(uint256 alarmId) external nonReentrant {
        Alarm storage alarm = alarms[alarmId];
        
        // 验证：闹钟存在
        if (alarm.user == address(0)) revert AlarmNotExist();
        
        // 验证：必须是闹钟所有者
        if (alarm.user != msg.sender) revert AlarmNotOwner();
        
        // 验证：状态必须是 Pending
        if (alarm.status != AlarmStatus.Pending) revert AlarmNotYetStarted();
        
        // 验证：必须在起始时间之前取消
        if (block.timestamp >= alarm.startTime) revert AlarmNotYetStarted();
        
        // 更新状态
        alarm.status = AlarmStatus.Cancelled;
        
        // 退还存款
        (bool success, ) = payable(msg.sender).call{value: alarm.amount}("");
        if (!success) revert TransferFailed();
        
        emit AlarmCancelled(alarmId, msg.sender, alarm.amount);
    }
    
    // ============ 查询功能 ============
    
    /// @notice 获取用户的闹钟数量
    /// @param user 用户地址
    /// @return 用户拥有的闹钟数量
    function getUserAlarmCount(address user) external view returns (uint256) {
        return userAlarms[user].length;
    }
    
    /// @notice 获取用户的闹钟ID列表（使用 assembly 正确编码）
    /// @param user 用户地址
    /// @return 用户拥有的所有闹钟ID
    function getUserAlarms(address user) external view returns (uint256[] memory) {
        uint256[] memory result = new uint256[](userAlarms[user].length);
        for (uint256 i = 0; i < result.length; i++) {
            result[i] = userAlarms[user][i];
        }
        return result;
    }
    
    /// @notice 获取闹钟详情
    /// @param alarmId 闹钟ID
    /// @return alarm 闹钟详细信息
    function getAlarm(uint256 alarmId) external view returns (Alarm memory) {
        return alarms[alarmId];
    }
    
    /// @notice 获取合约余额
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    // ============ 管理员功能 ============
    
    /// @notice 管理员提取没收的ETH（归社区/团队）
    /// @param amount 提取金额
    function withdrawForfeited(uint256 amount) external onlyOwner {
        require(amount <= totalForfeited, "Exceeds forfeited amount");
        totalForfeited -= amount;
        (bool success, ) = payable(owner()).call{value: amount}("");
        if (!success) revert TransferFailed();
    }
}
