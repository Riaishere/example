document.addEventListener('DOMContentLoaded', () => {
    // 获取所有需要的 DOM 元素
    const assistantButton = document.getElementById('ai-assistant-button');
    const chatWindow = document.getElementById('ai-assistant-chat-window');
    const closeButton = document.getElementById('ai-chat-close-button');
    const chatBody = document.getElementById('ai-chat-body');
    const chatInput = document.getElementById('ai-chat-input');
    const sendButton = document.getElementById('ai-chat-send-button');

    // 我们从函数计算得到的，真实有效的后端 API 地址
    const apiUrl = 'https://ai-assi-handler-ai-assi-service-baiwhjuqdw.cn-hongkong.fcapp.run';

    // 如果页面上没有找到这些元素，就直接退出，防止报错
    if (!assistantButton || !chatWindow || !closeButton || !chatBody || !chatInput || !sendButton) {
        console.warn('AI Assistant DOM elements not found. Assistant will not be initialized.');
        return;
    }

    // --- 事件监听 ---

    // 点击悬浮按钮，打开聊天窗口
    assistantButton.addEventListener('click', () => {
        chatWindow.classList.add('active');
    });

    // 点击关闭按钮，关闭聊天窗口
    closeButton.addEventListener('click', () => {
        chatWindow.classList.remove('active');
    });

    // 点击发送按钮
    sendButton.addEventListener('click', sendMessage);

    // 在输入框按回车键
    chatInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            sendMessage();
        }
    });


    // --- 核心功能函数 ---

    /**
     * 发送消息到后端并处理回复
     */
    async function sendMessage() {
        const messageText = chatInput.value.trim();
        if (messageText === '') return;

        // 1. 在界面上显示用户自己发送的消息
        addMessage(messageText, 'user');
        chatInput.value = ''; // 清空输入框

        try {
            // 2. 调用后端 API
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt: messageText }),
            });

            if (!response.ok) {
                // 如果后端返回了错误状态码 (比如 500)
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // 3. 在界面上显示 AI 的回复
            if (data.reply) {
                addMessage(data.reply, 'ai');
            } else if (data.error) {
                addMessage(`抱歉，出错了: ${data.error}`, 'error');
            }

        } catch (error) {
            console.error('Error fetching AI response:', error);
            addMessage('抱歉，服务暂时无法连接，请稍后再试。', 'error');
        }
    }

    /**
     * 在聊天窗口中添加一条消息
     * @param {string} text - 消息内容
     * @param {'user' | 'ai' | 'error'} sender - 发送者类型
     */
    function addMessage(text, sender) {
        const messageWrapper = document.createElement('div');
        messageWrapper.className = `ai-chat-message ${sender}`;

        let messageBubble;
        if (sender === 'error') {
            messageBubble = `<div class="ai-chat-bubble error-bubble">${text}</div>`;
        } else {
            const avatar = sender === 'user'
                ? `<div class="ai-chat-avatar"><i class="fas fa-user"></i></div>`
                : `<div class="ai-chat-avatar"><i class="fas fa-robot"></i></div>`;
            
            messageBubble = `
                ${sender === 'ai' ? avatar : ''}
                <div class="ai-chat-bubble">${text}</div>
                ${sender === 'user' ? avatar : ''}
            `;
        }

        messageWrapper.innerHTML = messageBubble;
        chatBody.appendChild(messageWrapper);

        // 自动滚动到最新消息
        chatBody.scrollTop = chatBody.scrollHeight;
    }
});
