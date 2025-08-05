const https = require('https');
const crypto = require('crypto');
const config = require('./config.js');

// AI服务配置
const AI_CONFIG = {
    // DeepSeek配置
    deepseek: {
        apiKey: config.deepseek.apiKey,
        baseURL: 'https://api.deepseek.com/v1',
        model: config.deepseek.model,
        maxTokens: config.deepseek.maxTokens,
        temperature: config.deepseek.temperature
    },
    // 本地AI模型配置（如果有的话）
    local: {
        enabled: config.local.enabled,
        endpoint: config.local.endpoint,
        model: config.local.model
    },
    // 备用AI服务
    backup: {
        enabled: true,
        endpoint: 'https://api.anthropic.com/v1/messages',
        apiKey: config.anthropic.apiKey,
        model: config.anthropic.model,
        maxTokens: config.anthropic.maxTokens
    }
};

// 对话历史管理
class ConversationManager {
    constructor() {
        this.conversations = new Map();
        this.maxHistory = config.conversation.maxHistory;
        this.maxAge = config.conversation.maxAge;
        this.cleanupInterval = config.conversation.cleanupInterval;
    }

    // 获取或创建对话历史
    getConversation(sessionId) {
        if (!this.conversations.has(sessionId)) {
            this.conversations.set(sessionId, []);
        }
        return this.conversations.get(sessionId);
    }

    // 添加消息到对话历史
    addMessage(sessionId, role, content) {
        const conversation = this.getConversation(sessionId);
        conversation.push({ role, content, timestamp: new Date() });
        
        // 保持历史记录在限制范围内
        if (conversation.length > this.maxHistory) {
            conversation.shift();
        }
    }

    // 获取格式化的对话历史
    getFormattedHistory(sessionId) {
        const conversation = this.getConversation(sessionId);
        return conversation.map(msg => ({
            role: msg.role,
            content: msg.content
        }));
    }

    // 清理过期对话（可选）
    cleanup() {
        const now = new Date();
        
        for (const [sessionId, conversation] of this.conversations.entries()) {
            const lastMessage = conversation[conversation.length - 1];
            if (lastMessage && (now - lastMessage.timestamp) > this.maxAge) {
                this.conversations.delete(sessionId);
            }
        }
    }
}

// 创建对话管理器实例
const conversationManager = new ConversationManager();

// 定期清理过期对话
setInterval(() => conversationManager.cleanup(), conversationManager.cleanupInterval);

// HTTP请求工具函数
function makeRequest(options, data = null) {
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const response = JSON.parse(body);
                    resolve({ statusCode: res.statusCode, data: response });
                } catch (error) {
                    resolve({ statusCode: res.statusCode, data: body });
                }
            });
        });

        req.on('error', reject);
        
        if (data) {
            req.write(JSON.stringify(data));
        }
        
        req.end();
    });
}

// AI响应生成器
class AIResponseGenerator {
    constructor() {
        this.fallbackResponses = config.localResponses.fallback;
        this.localResponses = config.localResponses;
    }

    // 生成会话ID
    generateSessionId(userMessage) {
        const hash = crypto.createHash('md5').update(userMessage + Date.now()).digest('hex');
        return hash.substring(0, 8);
    }

    // 调用DeepSeek API
    async callDeepSeek(messages, sessionId) {
        if (!AI_CONFIG.deepseek.apiKey) {
            throw new Error('DeepSeek API密钥未配置');
        }

        const options = {
            hostname: 'api.deepseek.com',
            path: '/v1/chat/completions',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${AI_CONFIG.deepseek.apiKey}`
            }
        };

        const data = {
            model: AI_CONFIG.deepseek.model,
            messages: messages,
            max_tokens: AI_CONFIG.deepseek.maxTokens,
            temperature: AI_CONFIG.deepseek.temperature,
            presence_penalty: 0.1,
            frequency_penalty: 0.1
        };

        try {
            const response = await makeRequest(options, data);
            
            if (response.statusCode === 200 && response.data.choices && response.data.choices[0]) {
                const aiResponse = response.data.choices[0].message.content;
                conversationManager.addMessage(sessionId, 'assistant', aiResponse);
                return aiResponse;
            } else {
                throw new Error(`DeepSeek API错误: ${response.statusCode}`);
            }
        } catch (error) {
            console.error('DeepSeek API调用失败:', error);
            throw error;
        }
    }

    // 调用备用AI服务
    async callBackupAI(messages, sessionId) {
        if (!AI_CONFIG.backup.enabled || !AI_CONFIG.backup.apiKey) {
            throw new Error('备用AI服务未配置');
        }

        const options = {
            hostname: 'api.anthropic.com',
            path: '/v1/messages',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': AI_CONFIG.backup.apiKey,
                'anthropic-version': '2023-06-01'
            }
        };

        const data = {
            model: AI_CONFIG.backup.model,
            max_tokens: AI_CONFIG.backup.maxTokens,
            messages: messages
        };

        try {
            const response = await makeRequest(options, data);
            
            if (response.statusCode === 200 && response.data.content && response.data.content[0]) {
                const aiResponse = response.data.content[0].text;
                conversationManager.addMessage(sessionId, 'assistant', aiResponse);
                return aiResponse;
            } else {
                throw new Error(`备用AI API错误: ${response.statusCode}`);
            }
        } catch (error) {
            console.error('备用AI API调用失败:', error);
            throw error;
        }
    }

    // 智能回复生成
    async generateSmartResponse(userMessage, sessionId) {
        try {
            // 添加用户消息到历史
            conversationManager.addMessage(sessionId, 'user', userMessage);
            
            // 获取对话历史
            const messages = conversationManager.getFormattedHistory(sessionId);
            
            // 添加系统提示
            const systemPrompt = {
                role: 'system',
                content: config.systemPrompt
            };
            
            const fullMessages = [systemPrompt, ...messages];
            
            // 尝试调用DeepSeek
            try {
                return await this.callDeepSeek(fullMessages, sessionId);
            } catch (deepseekError) {
                console.log('DeepSeek失败，尝试备用AI服务...');
                
                // 尝试备用AI服务
                try {
                    return await this.callBackupAI(fullMessages, sessionId);
                } catch (backupError) {
                    console.log('所有AI服务都失败，使用本地回复...');
                    
                    // 使用本地智能回复
                    return this.generateLocalResponse(userMessage, sessionId);
                }
            }
        } catch (error) {
            console.error('AI响应生成失败:', error);
            return this.getFallbackResponse();
        }
    }

    // 本地智能回复（当所有AI服务都不可用时）
    generateLocalResponse(userMessage, sessionId) {
        const lowerMessage = userMessage.toLowerCase();
        
        // 问候语匹配
        if (lowerMessage.includes('你好') || lowerMessage.includes('hello') || lowerMessage.includes('嗨')) {
            const responses = this.localResponses.greetings;
            return responses[Math.floor(Math.random() * responses.length)];
        }
        
        // 感谢语匹配
        if (lowerMessage.includes('谢谢') || lowerMessage.includes('感谢') || lowerMessage.includes('谢了')) {
            const responses = this.localResponses.thanks;
            return responses[Math.floor(Math.random() * responses.length)];
        }
        
        // 告别语匹配
        if (lowerMessage.includes('再见') || lowerMessage.includes('拜拜') || lowerMessage.includes('goodbye')) {
            const responses = this.localResponses.farewell;
            return responses[Math.floor(Math.random() * responses.length)];
        }
        
        // 帮助信息
        if (lowerMessage.includes('帮助') || lowerMessage.includes('功能') || lowerMessage.includes('help')) {
            return this.localResponses.help;
        }
        
        // 天气查询
        if (lowerMessage.includes('天气')) {
            return '抱歉，我目前无法获取实时天气信息。建议您查看天气应用或网站获取准确的天气信息。 🌤️';
        }
        
        // 时间查询
        if (lowerMessage.includes('时间') || lowerMessage.includes('几点')) {
            const now = new Date();
            return `现在是 ${now.toLocaleString('zh-CN')}。希望这个信息对您有帮助！ ⏰`;
        }
        
        // 默认回复
        return this.getFallbackResponse();
    }

    // 获取备用回复
    getFallbackResponse() {
        const randomIndex = Math.floor(Math.random() * this.fallbackResponses.length);
        return this.fallbackResponses[randomIndex] + ' 🤖';
    }

    // 处理特殊命令
    handleSpecialCommands(userMessage) {
        const lowerMessage = userMessage.toLowerCase();
        
        // 遍历所有配置的命令
        for (const [commandName, commandConfig] of Object.entries(config.commands)) {
            for (const trigger of commandConfig.triggers) {
                if (lowerMessage.includes(trigger)) {
                    let response = commandConfig.response;
                    
                    // 如果响应是函数，则调用它
                    if (typeof response === 'function') {
                        response = response();
                    }
                    
                    return {
                        isCommand: true,
                        response: response,
                        action: commandConfig.action
                    };
                }
            }
        }
        
        return { isCommand: false };
    }
}

// 创建AI响应生成器实例
const aiGenerator = new AIResponseGenerator();

// 主处理函数
async function handleAIRequest(requestBody) {
    try {
        const { message, sessionId: providedSessionId } = requestBody;
        
        if (!message || typeof message !== 'string') {
            return {
                success: false,
                error: '无效的消息格式'
            };
        }

        // 检查特殊命令
        const commandResult = aiGenerator.handleSpecialCommands(message);
        if (commandResult.isCommand) {
            return {
                success: true,
                response: commandResult.response,
                isCommand: true,
                action: commandResult.action
            };
        }

        // 生成或使用会话ID
        const sessionId = providedSessionId || aiGenerator.generateSessionId(message);
        
        // 生成AI回复
        const aiResponse = await aiGenerator.generateSmartResponse(message, sessionId);
        
        return {
            success: true,
            response: aiResponse,
            sessionId: sessionId
        };
        
    } catch (error) {
        console.error('AI请求处理失败:', error);
        return {
            success: false,
            error: 'AI服务暂时不可用，请稍后再试',
            fallbackResponse: aiGenerator.getFallbackResponse()
        };
    }
}

// 导出函数供主模块使用
module.exports = {
    handleAIRequest,
    conversationManager,
    aiGenerator
}; 