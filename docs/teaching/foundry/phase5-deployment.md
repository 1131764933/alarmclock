# 第五阶段：部署上线

> 预计时长：1 小时  
> 目标：将 DApp 部署到测试网，理解完整部署流程

## 5.1 课程目标

- 理解不同网络的区别
- 掌握部署到测试网
- 理解前端配置
- 了解生产环境注意事项

## 5.2 网络类型

### 5.2.1 网络类型对比

| 网络 | 特点 | 用途 |
|------|------|------|
| 主网 (Mainnet) | 真金白银 | 生产环境 |
| 测试网 (Testnet) | 免费代币 | 测试 |
| 本地网络 | 自己搭建 | 开发 |

### 5.2.2 以太坊测试网

```
主流测试网：
- Sepolia   ← 推荐使用
- Goerli    ← 即将弃用
- Holesky   ← 新测试网
```

### 5.2.3 测试网水龙头

获取测试网 ETH（水龙头）：

1. **Sepolia 水龙头**
   - https://faucet.sepolia.org
   - https://www.alchemy.com/faucets
   - https://faucet.quicknode.com

2. **操作步骤**
   - 访问水龙头网站
   - 粘贴你的 MetaMask 地址
   - 等待 ETH 到账（可能需要几分钟）

## 5.3 部署到 Sepolia 测试网

### 5.3.1 配置环境变量

```bash
# 复制示例配置
cp .env.example .env

# 编辑 .env 文件，填写：
SEPOLIA_RPC_URL=https://rpc.sepolia.org
PRIVATE_KEY=你的私钥（不要泄露！）
ETHERSCAN_API_KEY=etherscan API key（可选）
```

**⚠️ 重要：**

- `.env` 文件已添加到 `.gitignore`，不会被提交
- 私钥非常危险，不要分享给任何人！

### 5.3.2 修改前端配置

编辑 `frontend/src/App.jsx`：

```javascript
const CHAIN_CONFIG = {
  11155111: {  // Sepolia Chain ID
    name: "Sepolia",
    contractAddress: "你的合约地址"
  }
}
```

### 5.3.3 部署命令

```bash
# 使用 Hardhat
npx hardhat run scripts/deploy.js --network sepolia

# 使用 Foundry
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url sepolia \
  --broadcast \
  --verify
```

### 5.3.4 验证部署

1. 打开 https://sepolia.etherscan.io
2. 搜索合约地址
3. 确认合约已验证（Source Code 已公开）

## 5.4 前端部署

### 5.4.1 构建生产版本

```bash
cd frontend
npm run build
```

生成的文件在 `frontend/dist/`

### 5.4.2 部署选项

#### 选项 1：Vercel（推荐）

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel
```

#### 选项 2：Netlify

```bash
# 安装 Netlify CLI
npm i -g netlify-cli

# 部署
netlify deploy --prod
```

#### 选项 3：GitHub Pages

```bash
# 在 package.json 添加
{
  "scripts": {
    "deploy": "gh-pages -d dist"
  }
}

# 安装 gh-pages
npm i -g gh-pages

# 部署
npm run deploy
```

## 5.5 完整上线流程

### 5.5.1 部署清单

```
□ 1. 智能合约测试通过
□ 2. 获取测试网 ETH
□ 3. 部署合约到测试网
□ 4. 测试网验证功能正常
□ 5. 更新前端合约地址
□ 6. 构建前端
□ 7. 部署前端
□ 8. 分享链接测试
```

### 5.5.2 测试网测试清单

```
功能测试：
□ 创建闹钟成功
□ 触发闹钟（时间范围内）
□ 取消闹钟（时间范围前）
□ 过期检查
□ 管理员提取

异常测试：
□ 金额不足被拒绝
□ 时间错误被拒绝
□ 非所有者操作被拒绝
```

## 5.6 生产环境注意事项

### 5.6.1 安全清单

```
□ 智能合约已通过审计
□ 合约所有者权限已限制
□ 前端敏感信息已移除
□ API Keys 已配置在服务端
□ 监控告警已设置
```

### 5.6.2 性能优化

```
□ 静态资源已压缩
□ 图片已优化
□ 使用 CDN
□ 代码分割
```

## 5.7 本章小结

✅ 已掌握：
- 测试网和主网区别
- 部署到 Sepolia 测试网
- 前端构建和部署
- 完整上线流程

---

## 6. 总结与展望

### 6.1 项目总结

经过 5 个阶段的学习，你已经：

1. **环境搭建** - 掌握开发工具
2. **合约开发** - 编写 Solidity 智能合约
3. **测试** - 使用 Foundry 进行测试驱动开发
4. **前端开发** - 构建 React DApp
5. **部署上线** - 部署到测试网

### 6.2 进阶学习路径

```
                    ┌──────────────┐
                    │  进阶方向     │
                    └──────┬───────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│  DeFi 开发    │  │  NFT/游戏    │  │  基础设施    │
│ - 借贷协议    │  │ - ERC-721    │  │ - 节点运营   │
│ - DEX        │  │ - 链游开发    │  │ - 索引服务   │
└───────────────┘  └───────────────┘  └───────────────┘
```

### 6.3 推荐资源

**学习资源：**
- https://solidity-by-example.org
- https://cryptozombies.io
- https://docs.ethers.org

**文档：**
- https://docs.openzeppelin.com
- https://hardhat.org/docs
- https://book.getfoundry.sh

**社区：**
- Ethereum Discord
- Twitter/X
- Reddit r/ethereum

---

**恭喜你完成本课程！🎉**

你已具备独立开发简单 DApp 的能力。继续加油！
