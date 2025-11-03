import React from 'react';
import ReactMarkdown from 'react-markdown';
import '../assets/styles/ChatMessage.css';

/**
 * 聊天消息组件
 * @param {Object} props
 * @param {string} props.type - 消息类型: 'user' 或 'ai'
 * @param {string} props.content - 消息内容
 * @param {boolean} props.isTyping - 是否正在输入
 * @param {string} props.timestamp - 时间戳
 */
const ChatMessage = ({ type, content, isTyping = false, timestamp }) => {
  // 确定消息的样式类
  const messageClass = type === 'user' ? 'user-message' : 'ai-message';
  
  // 格式化时间戳
  const formatTime = (time) => {
    if (!time) return '';
    const date = new Date(time);
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className={`chat-message ${messageClass}`}>
      <div className="message-header">
        <span className="message-type">
          {type === 'user' ? '用户' : 'AI助手'}
        </span>
        {timestamp && (
          <span className="message-time">{formatTime(timestamp)}</span>
        )}
      </div>
      <div className="message-content">
        {isTyping ? (
          <div className="typing-indicator">
            <span className="typing-dot"></span>
            <span className="typing-dot"></span>
            <span className="typing-dot"></span>
          </div>
        ) : (
          <ReactMarkdown className="markdown-content">
            {content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;