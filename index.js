
const fs = require('fs');
const path = require('path');
const https = require('https');

// 统一的响应头，包含CORS，允许跨域访问
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// 导入AI服务模块
const aiService = require('./ai-service.js');

// 主处理函数
exports.handler = async (event, context, callback) => {
  // 解码并解析真实事件
  const eventString = event.toString('utf-8');
  const parsedEvent = JSON.parse(eventString);

  // 从解析后的事件中，提取出真正的路径和方法
  const requestPath = parsedEvent.rawPath || parsedEvent.path || '/';
  const httpMethod = parsedEvent.requestContext.http.method;
  
  console.log(`[最终解析] 收到请求: 方法=${httpMethod}, 路径=${requestPath}`);

  // 1. 处理浏览器的OPTIONS预检请求
  if (httpMethod.toUpperCase() === 'OPTIONS') {
    console.log("正在处理 OPTIONS 预检请求");
    callback(null, { statusCode: 204, headers: CORS_HEADERS, body: '' });
    return;
  }
  
  // 2. 处理聊天API的POST请求
  if (requestPath === '/chat' && httpMethod.toUpperCase() === 'POST') {
    console.log("匹配到聊天API路由，准备调用AI");
    try {
        const chatResponse = await handleChatRequest(parsedEvent);
        callback(null, chatResponse);
        return;
    } catch (e) {
        console.error("AI聊天处理出错:", e);
        callback(null, {
            statusCode: 500,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: "AI服务暂时不可用" })
        });
        return;
    }
  }
  
  // 3. 处理AI聊天页面请求
  if (requestPath === '/ai-chat' && httpMethod.toUpperCase() === 'GET') {
    console.log("匹配到AI聊天页面路由");
    callback(null, handleAIChatPageRequest());
    return;
  }
  
  // 4. 处理GET请求
  if (httpMethod.toUpperCase() === 'GET') {
      // 根路径返回主页
      if (requestPath === '/') {
        console.log("匹配到主页GET路由");
        callback(null, handleStaticPageRequest());
        return;
      }
      // 其他路径尝试作为静态资源（如图片）返回
      console.log(`尝试提供静态资源: ${requestPath}`);
      callback(null, handleStaticAssetRequest(requestPath));
      return;
  }

  // 5. 对于其他所有未知请求，返回404
  console.log(`未匹配到任何路由，返回404 for ${httpMethod} ${requestPath}`);
  callback(null, {
      statusCode: 404,
      headers: { ...CORS_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' },
      body: 'Not Found'
  });
};

// 子函数

/**
 * 处理静态主页HTML的请求
 */
function handleStaticPageRequest() {
  try {
    const htmlContent = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
    return {
      statusCode: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'text/html; charset=utf-8' },
      body: htmlContent,
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' },
      body: '服务器内部错误：无法读取主页文件。',
    };
  }
}

/**
 * 处理AI聊天页面HTML的请求
 */
function handleAIChatPageRequest() {
  try {
    const htmlContent = fs.readFileSync(path.resolve(__dirname, 'ai-chat.html'), 'utf-8');
    return {
      statusCode: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'text/html; charset=utf-8' },
      body: htmlContent,
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' },
      body: '服务器内部错误：无法读取AI聊天页面文件。',
    };
  }
}

/**
 * 处理静态资源（如图片）的请求
 * @param {string} requestPath - 请求的资源路径, e.g., /Ria.jpg?t=12345
 */
function handleStaticAssetRequest(requestPath) {
    // 从请求路径中移除查询参数（例如 ?t=...），得到纯粹的文件路径
    const cleanPath = requestPath.split('?')[0];
    
    // 安全检查：防止路径遍历攻击
    if (cleanPath.includes('..') || cleanPath.includes('//')) {
        return {
            statusCode: 403,
            headers: { ...CORS_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' },
            body: 'Forbidden: 不允许访问此路径'
        };
    }
    
    // 构建文件路径
    const filePath = path.resolve(__dirname, cleanPath.substring(1)); // 移除开头的 '/'
    
    try {
        // 检查文件是否存在
        if (!fs.existsSync(filePath)) {
            return {
                statusCode: 404,
                headers: { ...CORS_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' },
                body: 'File not found'
            };
        }
        
        // 读取文件
        const fileContent = fs.readFileSync(filePath);
        const contentType = getContentType(path.extname(filePath));
        
        return {
            statusCode: 200,
            headers: { ...CORS_HEADERS, 'Content-Type': contentType },
            body: fileContent.toString('base64'),
            isBase64Encoded: true
        };
        
    } catch (error) {
        console.error(`读取文件失败: ${filePath}`, error);
        return {
            statusCode: 500,
            headers: { ...CORS_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' },
            body: '服务器内部错误：无法读取文件。'
        };
    }
}

/**
 * 根据文件扩展名获取MIME类型
 * @param {string} fileExtension - 文件扩展名
 * @returns {string} MIME类型
 */
function getContentType(fileExtension) {
    switch (fileExtension.toLowerCase()) {
        case '.html':
        case '.htm':
            return 'text/html; charset=utf-8';
        case '.txt':
            return 'text/plain; charset=utf-8';
        case '.json':
            return 'application/json; charset=utf-8';
        case '.jpg':
        case '.jpeg':
            return 'image/jpeg';
        case '.png':
            return 'image/png';
        case '.gif':
            return 'image/gif';
        case '.ico':
            return 'image/x-icon';
        case '.css':
            return 'text/css';
        case '.js':
            return 'application/javascript';
        default:
            return 'application/octet-stream';
    }
}

/**
 * 处理对AI聊天API的请求（使用新的AI服务模块）
 * @param {object} parsedEvent - 已解析的真实事件对象
 */
async function handleChatRequest(parsedEvent) {
    let requestBody;
    try {
        if (!parsedEvent.body) throw new Error("Request body is empty.");
        requestBody = JSON.parse(parsedEvent.body);
        if (!requestBody.message) throw new Error("'message' field is missing.");
        console.log("收到用户消息:", requestBody.message);
    } catch (e) {
        return {
            statusCode: 400,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
            body: JSON.stringify({error: e.message})
        };
    }

    try {
        // 使用新的AI服务处理请求
        const result = await aiService.handleAIRequest(requestBody);
        
        if (result.success) {
            return {
                statusCode: 200,
                headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    response: result.response,
                    sessionId: result.sessionId,
                    isCommand: result.isCommand || false,
                    action: result.action
                })
            };
        } else {
            return {
                statusCode: 500,
                headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    error: result.error,
                    fallbackResponse: result.fallbackResponse
                })
            };
        }
    } catch (error) {
        console.error("AI服务处理失败:", error);
        return {
            statusCode: 500,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
            body: JSON.stringify({error: 'AI服务暂时不可用，请稍后再试'})
        };
    }
}
