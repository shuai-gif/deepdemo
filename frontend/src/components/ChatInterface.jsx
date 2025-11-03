import React, { useState, useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage.jsx';
import apiService from '../services/apiService';
import '../assets/styles/ChatInterface.css';

/**
 * 聊天界面组件
 */
const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);

  // 加载本地存储的历史记录
  useEffect(() => {
    const savedHistory = localStorage.getItem('chatHistory');
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        setMessages(parsedHistory);
        
        // 构建API所需的历史格式
        const apiHistory = parsedHistory.map(msg => ({
          role: msg.type === 'user' ? 'user' : 'assistant', 
          content: msg.content 
        }));
        setHistory(apiHistory);
      } catch (e) {
        console.error('加载历史记录失败:', e);
      }
    }
  }, []);

  // 保存历史记录到本地存储
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chatHistory', JSON.stringify(messages));
    }
  }, [messages]);

  // 自动滚动到底部
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // 处理发送消息
  const handleSendMessage = async () => {
    const trimmedMessage = inputMessage.trim();
    
    if (!trimmedMessage || isLoading) return;
    
    // 清空输入框
    setInputMessage('');
    setError(null);
    
    // 添加用户消息
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: trimmedMessage,
      timestamp: new Date().toISOString()
    };
    
    // 创建AI消息占位符
    const aiMessageId = Date.now() + 1;
    const aiMessagePlaceholder = {
      id: aiMessageId,
      type: 'ai',
      content: '',
      isTyping: true,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage, aiMessagePlaceholder]);
    setIsLoading(true);
    
    try {
      // 构建新的历史记录
      const newHistory = [...history, { role: 'user', content: trimmedMessage }];
      let aiResponseContent = '';
      
      // 发送消息到API
      await apiService.sendMessage(
        trimmedMessage,
        newHistory,
        // 接收消息块的回调
        (chunk) => {
          aiResponseContent += chunk;
          updateAiMessage(aiMessageId, aiResponseContent, true);
        },
        // 开始接收响应的回调
        () => {
          console.log('开始接收响应');
        },
        // 接收完所有响应的回调
        () => {
          updateAiMessage(aiMessageId, aiResponseContent, false);
          // 更新历史记录
          setHistory([...newHistory, { role: 'assistant', content: aiResponseContent }]);
          setIsLoading(false);
        },
        // 错误回调
        (errorMsg) => {
          handleApiError(errorMsg);
        }
      );
    } catch (err) {
      handleApiError(err.message || '发送消息失败');
    }
  };

  // 更新AI消息
  const updateAiMessage = (messageId, content, isTyping) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, content, isTyping }
        : msg
    ));
  };

  // 处理API错误
  const handleApiError = (errorMsg) => {
    setError(errorMsg);
    setIsLoading(false);
    
    // 更新AI消息为错误状态
    setMessages(prev => prev.map(msg => 
      msg.type === 'ai' && msg.isTyping
        ? { ...msg, content: `错误: ${errorMsg}`, isTyping: false }
        : msg
    ));
  };

  // 处理回车键发送
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 清除历史记录
  const clearHistory = () => {
    if (window.confirm('确定要清除所有聊天历史吗？')) {
      setMessages([]);
      setHistory([]);
      localStorage.removeItem('chatHistory');
    }
  };

  // 复制消息内容
  const copyToClipboard = (content) => {
    navigator.clipboard.writeText(content)
      .then(() => {
        // 可以添加复制成功的提示
        console.log('内容已复制到剪贴板');
      })
      .catch(err => {
        console.error('复制失败:', err);
      });
  };

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <h1>DeepSeek AI 助手</h1>
        <button 
          className="clear-history-btn" 
          onClick={clearHistory}
          disabled={messages.length === 0}
        >
          清除历史
        </button>
      </div>
      
      <div className="chat-container" ref={chatContainerRef}>
        {messages.length === 0 ? (
          <div className="welcome-message">
            <p>欢迎使用 DeepSeek AI 助手！</p>
            <p>请输入您的问题，我将尽力为您提供帮助。</p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="message-wrapper">
              <ChatMessage
                type={message.type}
                content={message.content}
                isTyping={message.isTyping}
                timestamp={message.timestamp}
              />
              {!message.isTyping && (
                <button
                  className="copy-btn"
                  onClick={() => copyToClipboard(message.content)}
                  title="复制内容"
                >
                  📋
                </button>
              )}
            </div>
          ))
        )}
        
        {error && (
          <div className="error-message">
            <span>❌ {error}</span>
          </div>
        )}
      </div>
      
      <div className="chat-input-container">
        <textarea
          ref={inputRef}
          className="chat-input"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="请输入您的问题..."
          disabled={isLoading}
          rows={3}
          maxLength={2000}
        />
        <button
          className="send-btn"
          onClick={handleSendMessage}
          disabled={!inputMessage.trim() || isLoading}
        >
          {isLoading ? '发送中...' : '发送'}
        </button>
      </div>
      
      <div className="input-counter">
        {inputMessage.length}/2000
      </div>
    </div>
  );
};

export default ChatInterface;