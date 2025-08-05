// AI服务配置文件
module.exports = {
    // DeepSeek配置
    deepseek: {
        apiKey: process.env.DEEPSEEK_API_KEY || 'sk-7dbd81e6126c424c876d86ac72bd8fde',
        model: 'deepseek-chat',
        maxTokens: 1000,
        temperature: 0.7
    },
    
    // Anthropic配置（备用AI服务）
    anthropic: {
        apiKey: process.env.ANTHROPIC_API_KEY || '',
        model: 'claude-3-sonnet-20240229',
        maxTokens: 1000
    },
    
    // 本地AI模型配置
    local: {
        enabled: false,
        endpoint: 'http://localhost:8000/v1/chat/completions',
        model: 'local-model'
    },
    
    // 对话管理配置
    conversation: {
        maxHistory: 10, // 最大历史记录数
        maxAge: 24 * 60 * 60 * 1000, // 对话过期时间（24小时）
        cleanupInterval: 60 * 60 * 1000 // 清理间隔（1小时）
    },
    
    // 系统提示词
    systemPrompt: `你是一个友好、专业的AI助手。请用中文回答用户的问题，提供有用、准确的信息。保持对话自然流畅，适当时可以添加表情符号来增加亲和力。

你的特点：
- 友好、耐心、乐于助人
- 回答准确、有用
- 适当时使用表情符号
- 保持对话的连贯性
- 如果不知道答案，诚实承认并建议其他资源

请始终保持礼貌和专业的态度。`,
    
    // 本地回复配置
    localResponses: {
        greetings: [
            '你好！很高兴见到您！我是您的AI助手，有什么可以帮助您的吗？ 😊',
            '您好！我是您的AI助手，随时为您服务！ 🌟',
            '嗨！很高兴为您提供帮助！有什么问题吗？ 💫'
        ],
        
        thanks: [
            '不客气！很高兴能帮助到您。如果还有其他问题，随时可以问我！ 😄',
            '不用谢！为您服务是我的荣幸。有任何问题都可以继续问我！ 🌈',
            '应该的！很高兴能帮上忙。还有其他需要帮助的吗？ ✨'
        ],
        
        farewell: [
            '再见！祝您有愉快的一天！如果以后需要帮助，随时欢迎回来！ 👋',
            '再见！期待下次与您交流！祝您一切顺利！ 🌟',
            '拜拜！有任何问题都可以随时回来找我！祝您开心！ 💫'
        ],
        
        help: `我可以帮助您：
• 回答问题 📚
• 提供建议 💡
• 创意写作 ✍️
• 编程帮助 💻
• 日常聊天 💬
• 学习辅导 🎓
• 技术咨询 🔧

请告诉我您需要什么帮助！`,
        
        fallback: [
            "我理解您的问题，让我为您提供一些帮助。",
            "这是一个很有趣的问题，让我来回答一下。",
            "根据我的理解，我可以为您提供以下建议。",
            "让我为您详细解释一下这个问题。",
            "我注意到您提到的这个方面，让我为您分析一下。"
        ]
    },
    
    // 特殊命令配置
    commands: {
        clear: {
            triggers: ['/clear', '/清空'],
            response: '对话历史已清空！ 🗑️',
            action: 'clear_history'
        },
        
        help: {
            triggers: ['/help', '/帮助'],
            response: `可用命令：
• /clear 或 /清空 - 清空对话历史
• /help 或 /帮助 - 显示此帮助信息
• /time 或 /时间 - 显示当前时间
• /status 或 /状态 - 显示系统状态`,
            action: 'help'
        },
        
        time: {
            triggers: ['/time', '/时间'],
            response: () => `当前时间：${new Date().toLocaleString('zh-CN')} ⏰`,
            action: 'time'
        },
        
        status: {
            triggers: ['/status', '/状态'],
            response: '系统运行正常！所有服务都在线。 ✅',
            action: 'status'
        }
    },
    
    // 安全配置
    security: {
        maxMessageLength: 1000, // 最大消息长度
        rateLimit: {
            windowMs: 15 * 60 * 1000, // 15分钟
            maxRequests: 100 // 最大请求数
        }
    },
    
    // 日志配置
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        enableConsole: true,
        enableFile: false
    }
}; 