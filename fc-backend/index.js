const axios = require('axios');

// 从函数计算的环境变量中安全地读取配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const CORS_ALLOWED_ORIGIN = process.env.CORS_ALLOWED_ORIGIN || 'http://www.galahad.website';

/**
 * 调用 DeepSeek AI 服务获取回复
 * @param {string} prompt 用户的输入
 * @returns {Promise<string>} AI 的回复
 */
async function getAIResponse(prompt) {
    if (!DEEPSEEK_API_KEY) {
        throw new Error('DEEPSEEK_API_KEY is not configured in environment variables.');
    }

    // DeepSeek API 的接入点
    const aiServiceEndpoint = 'https://api.deepseek.com/chat/completions';
    
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
    };

    // 构造符合 DeepSeek API 要求的请求体
    const body = {
        model: 'deepseek-chat',
        messages: [
            { "role": "system", "content": "You are a helpful assistant." },
            { "role": "user", "content": prompt }
        ]
    };

    try {
        const response = await axios.post(aiServiceEndpoint, body, { headers });
        // 从 DeepSeek 的返回结果中解析出 AI 的回复
        // 根据其文档，回复内容在 response.data.choices[0].message.content
        if (response.data && response.data.choices && response.data.choices.length > 0) {
            return response.data.choices[0].message.content;
        }
        throw new Error('Invalid response structure from AI service.');
    } catch (error) {
        console.error('Error calling AI service:', error.response ? error.response.data : error.message);
        throw new Error('Failed to get response from AI service.');
    }
}


exports.handler = async (req, res, context) => {
    // 设置 CORS 响应头，以允许前端跨域访问
    res.setHeader('Access-Control-Allow-Origin', CORS_ALLOWED_ORIGIN);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // 处理浏览器发送的 OPTIONS 预检请求
    if (req.method === 'OPTIONS') {
        res.setStatusCode(204);
        res.send('');
        return;
    }

    // 只处理 POST 请求
    if (req.method !== 'POST') {
        res.setStatusCode(405);
        res.send('Method Not Allowed');
        return;
    }
    
    try {
        const body = JSON.parse(req.body.toString());
        const userPrompt = body.prompt;

        if (!userPrompt) {
            res.setStatusCode(400);
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify({ error: 'Prompt is missing in the request body.' }));
            return;
        }

        const aiReply = await getAIResponse(userPrompt);

        res.setStatusCode(200);
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ reply: aiReply }));

    } catch (error) {
        console.error('Error in function handler:', error);
        res.setStatusCode(500);
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ error: error.message || 'An internal server error occurred.' }));
    }
}; 