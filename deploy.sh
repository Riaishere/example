#!/bin/bash

# AI集成系统部署脚本
# 适用于阿里云函数计算等云服务

echo "🤖 AI集成系统部署脚本"
echo "========================"

# 检查必要文件
echo "📋 检查必要文件..."
required_files=("ai-chat.html" "ai-service.js" "config.js" "index.js")
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ 缺少必要文件: $file"
        exit 1
    fi
done
echo "✅ 所有必要文件存在"

# 检查环境变量
echo "🔧 检查环境变量..."
if [ -z "$OPENAI_API_KEY" ] && [ -z "$ANTHROPIC_API_KEY" ]; then
    echo "⚠️  警告: 未设置AI API密钥，将使用本地智能回复"
    echo "   建议设置以下环境变量之一:"
    echo "   - OPENAI_API_KEY"
    echo "   - ANTHROPIC_API_KEY"
else
    echo "✅ API密钥已配置"
fi

# 创建部署包
echo "📦 创建部署包..."
deploy_dir="ai-deploy-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$deploy_dir"

# 复制必要文件
cp ai-chat.html "$deploy_dir/"
cp ai-service.js "$deploy_dir/"
cp config.js "$deploy_dir/"
cp index.js "$deploy_dir/"
cp AI_INTEGRATION_README.md "$deploy_dir/"

# 创建package.json（如果需要）
if [ ! -f "package.json" ]; then
    echo "📝 创建package.json..."
    cat > "$deploy_dir/package.json" << EOF
{
  "name": "ai-chat-system",
  "version": "1.0.0",
  "description": "AI聊天系统",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": ["ai", "chat", "openai", "anthropic"],
  "author": "Your Name",
  "license": "MIT",
  "dependencies": {}
}
EOF
fi

# 创建环境变量文件模板
echo "🔐 创建环境变量模板..."
cat > "$deploy_dir/.env.example" << EOF
# AI服务配置
OPENAI_API_KEY=your-openai-api-key-here
ANTHROPIC_API_KEY=your-anthropic-api-key-here

# 日志配置
LOG_LEVEL=info

# 安全配置
MAX_MESSAGE_LENGTH=1000
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX_REQUESTS=100
EOF

# 创建部署说明
echo "📖 创建部署说明..."
cat > "$deploy_dir/DEPLOYMENT.md" << EOF
# 部署说明

## 快速部署

1. 设置环境变量：
   \`\`\`bash
   export OPENAI_API_KEY="your-api-key"
   export ANTHROPIC_API_KEY="your-api-key"
   \`\`\`

2. 上传文件到云服务：
   - 阿里云函数计算
   - AWS Lambda
   - 腾讯云云函数
   - 其他支持Node.js的平台

3. 配置触发器：
   - HTTP触发器
   - API网关
   - 负载均衡器

## 访问地址

- 主页: \`https://your-domain.com/\`
- AI聊天: \`https://your-domain.com/ai-chat\`

## 测试

1. 访问AI聊天页面
2. 发送测试消息
3. 检查响应是否正常

## 故障排除

1. 检查环境变量
2. 查看函数日志
3. 验证API密钥
4. 测试网络连接
EOF

echo "✅ 部署包创建完成: $deploy_dir"
echo ""
echo "📋 部署包内容:"
ls -la "$deploy_dir"
echo ""
echo "🚀 下一步:"
echo "1. 设置环境变量"
echo "2. 上传文件到云服务"
echo "3. 配置HTTP触发器"
echo "4. 测试功能"
echo ""
echo "📖 详细说明请查看: $deploy_dir/DEPLOYMENT.md"
echo "📚 完整文档请查看: $deploy_dir/AI_INTEGRATION_README.md" 