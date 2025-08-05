# AI集成系统使用指南

## 概述

这个AI集成系统为您的个人网站提供了完整的AI聊天功能，支持多种AI模型和智能回复机制。

## 功能特性

### 🤖 AI聊天功能
- **多模型支持**: OpenAI GPT-3.5/4, Anthropic Claude, 本地AI模型
- **智能回复**: 当外部AI服务不可用时，提供本地智能回复
- **对话历史**: 保持对话上下文，支持多轮对话
- **特殊命令**: 支持清空历史、帮助、时间等命令

### 🎨 现代化UI
- **响应式设计**: 适配桌面和移动设备
- **实时反馈**: 打字指示器、状态显示
- **建议按钮**: 快速发送常用问题
- **优雅动画**: 平滑的过渡效果

### 🔧 技术特性
- **容错机制**: 多重备用方案确保服务可用
- **配置管理**: 集中化配置，易于维护
- **安全防护**: 输入验证、路径安全检查
- **性能优化**: 对话历史管理、自动清理

## 文件结构

```
example/
├── ai-chat.html          # AI聊天页面
├── ai-service.js         # AI服务核心模块
├── config.js            # 配置文件
├── index.js             # 主服务器文件
├── index.html           # 原主页
└── AI_INTEGRATION_README.md  # 本文件
```

## 快速开始

### 1. 环境配置

设置必要的环境变量：

```bash
# OpenAI API密钥（可选）
export OPENAI_API_KEY="your-openai-api-key"

# Anthropic API密钥（可选）
export ANTHROPIC_API_KEY="your-anthropic-api-key"
```

### 2. 访问AI聊天

- **主页**: `http://your-domain.com/`
- **AI聊天**: `http://your-domain.com/ai-chat`

### 3. API端点

- **聊天API**: `POST /chat`
- **AI聊天页面**: `GET /ai-chat`

## 配置说明

### config.js 配置项

```javascript
module.exports = {
    // OpenAI配置
    openai: {
        apiKey: process.env.OPENAI_API_KEY || '',
        model: 'gpt-3.5-turbo',
        maxTokens: 1000,
        temperature: 0.7
    },
    
    // Anthropic配置
    anthropic: {
        apiKey: process.env.ANTHROPIC_API_KEY || '',
        model: 'claude-3-sonnet-20240229',
        maxTokens: 1000
    },
    
    // 对话管理
    conversation: {
        maxHistory: 10,        // 最大历史记录数
        maxAge: 24 * 60 * 60 * 1000,  // 对话过期时间
        cleanupInterval: 60 * 60 * 1000 // 清理间隔
    },
    
    // 系统提示词
    systemPrompt: `你是一个友好、专业的AI助手...`,
    
    // 本地回复配置
    localResponses: {
        greetings: [...],      // 问候语
        thanks: [...],         // 感谢语
        farewell: [...],       // 告别语
        help: `...`,           // 帮助信息
        fallback: [...]        // 备用回复
    },
    
    // 特殊命令
    commands: {
        clear: { triggers: ['/clear', '/清空'], ... },
        help: { triggers: ['/help', '/帮助'], ... },
        time: { triggers: ['/time', '/时间'], ... },
        status: { triggers: ['/status', '/状态'], ... }
    }
};
```

## API使用示例

### 发送消息

```javascript
// 发送聊天消息
const response = await fetch('/chat', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        message: '你好，请介绍一下你自己',
        sessionId: 'optional-session-id' // 可选
    })
});

const data = await response.json();
console.log(data.response); // AI回复
```

### 响应格式

```javascript
// 成功响应
{
    "response": "你好！我是您的AI助手...",
    "sessionId": "abc12345",
    "isCommand": false,
    "action": null
}

// 命令响应
{
    "response": "对话历史已清空！ 🗑️",
    "sessionId": "abc12345",
    "isCommand": true,
    "action": "clear_history"
}

// 错误响应
{
    "error": "AI服务暂时不可用，请稍后再试",
    "fallbackResponse": "我理解您的问题，让我为您提供一些帮助。 🤖"
}
```

## 特殊命令

| 命令 | 触发词 | 功能 |
|------|--------|------|
| 清空历史 | `/clear` 或 `/清空` | 清空当前对话历史 |
| 帮助 | `/help` 或 `/帮助` | 显示可用命令列表 |
| 时间 | `/time` 或 `/时间` | 显示当前时间 |
| 状态 | `/status` 或 `/状态` | 显示系统状态 |

## 自定义配置

### 1. 修改系统提示词

编辑 `config.js` 中的 `systemPrompt`：

```javascript
systemPrompt: `你是一个专业的AI助手，专门帮助用户解决技术问题...`
```

### 2. 添加新的本地回复

在 `config.js` 的 `localResponses` 中添加：

```javascript
localResponses: {
    // ... 现有配置
    custom: [
        '自定义回复1',
        '自定义回复2'
    ]
}
```

### 3. 添加新的特殊命令

在 `config.js` 的 `commands` 中添加：

```javascript
commands: {
    // ... 现有命令
    custom: {
        triggers: ['/custom', '/自定义'],
        response: '这是自定义命令的回复',
        action: 'custom_action'
    }
}
```

## 故障排除

### 常见问题

1. **AI服务不可用**
   - 检查API密钥是否正确设置
   - 确认网络连接正常
   - 查看服务器日志

2. **页面无法加载**
   - 确认文件路径正确
   - 检查服务器配置
   - 验证CORS设置

3. **对话历史丢失**
   - 检查对话管理配置
   - 确认清理间隔设置
   - 查看内存使用情况

### 调试模式

启用详细日志：

```bash
export LOG_LEVEL=debug
```

## 性能优化

### 1. 对话历史管理
- 自动清理过期对话
- 限制历史记录数量
- 定期内存清理

### 2. 响应时间优化
- 多重备用方案
- 本地智能回复
- 异步处理

### 3. 资源使用
- 配置合理的清理间隔
- 限制最大消息长度
- 优化文件读取

## 安全考虑

### 1. 输入验证
- 消息长度限制
- 特殊字符过滤
- 路径安全检查

### 2. API密钥管理
- 使用环境变量
- 不在代码中硬编码
- 定期轮换密钥

### 3. 访问控制
- CORS配置
- 请求频率限制
- 错误信息脱敏

## 扩展功能

### 1. 添加新的AI模型
在 `ai-service.js` 中添加新的模型支持：

```javascript
async callNewAI(messages, sessionId) {
    // 实现新的AI模型调用
}
```

### 2. 集成数据库
- 持久化对话历史
- 用户会话管理
- 统计分析

### 3. 添加更多功能
- 文件上传
- 语音识别
- 多语言支持
- 情感分析

## 技术支持

如果您在使用过程中遇到问题，请：

1. 查看服务器日志
2. 检查配置文件
3. 验证环境变量
4. 测试网络连接

## 更新日志

### v1.0.0
- 初始版本发布
- 支持OpenAI和Anthropic
- 现代化UI界面
- 完整的配置系统

---

**注意**: 请确保在生产环境中正确配置API密钥和安全设置。 