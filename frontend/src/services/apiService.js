import axios from 'axios';
import { API_CONFIG, getApiUrl, handleApiError } from '../utils/apiConfig';

/**
 * API服务类
 */
class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.baseURL,
      timeout: API_CONFIG.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
  }

  /**
   * 检查API健康状态
   * @returns {Promise<Object>}
   */
  async checkHealth() {
    try {
      const response = await this.client.get(getApiUrl('health'));
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * 发送消息到DeepSeek API
   * @param {string} question - 用户问题
   * @param {Array} history - 历史记录
   * @param {Function} onMessage - 接收消息块的回调函数
   * @param {Function} onStart - 开始接收响应的回调
   * @param {Function} onEnd - 接收完所有响应的回调
   * @param {Function} onError - 错误回调
   * @returns {Promise<void>}
   */
  async sendMessage(question, history = [], onMessage, onStart, onEnd, onError) {
    try {
      const response = await fetch(getApiUrl('chat'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          history
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          
          // 使用索引遍历，确保正确处理event和data配对
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.trim() === '') continue;
            
            try {
              // 解析SSE事件格式
              if (line.startsWith('event: ')) {
                const eventType = line.substring(7).trim();
                
                // 查找对应的data行（下一行）
                if (i + 1 < lines.length && lines[i + 1].startsWith('data: ')) {
                  const dataStr = lines[i + 1].substring(6).trim();
                  const data = JSON.parse(dataStr);
                  
                  switch (eventType) {
                    case 'start':
                      if (onStart) onStart(data);
                      break;
                    case 'message':
                      if (onMessage) onMessage(data.content);
                      break;
                    case 'end':
                      if (onEnd) onEnd(data);
                      break;
                    case 'error':
                      if (onError) onError(data.error);
                      break;
                  }
                }
              }
            } catch (parseError) {
              console.error('解析响应失败:', parseError);
              if (onError) onError('响应格式错误');
            }
          }
        }
      }
    } catch (error) {
      console.error('发送消息失败:', error);
      if (onError) onError(error.message || '发送消息失败');
    }
  }

  /**
   * 获取API配置信息
   * @returns {Promise<Object>}
   */
  async getConfig() {
    try {
      const response = await this.client.get(getApiUrl('config'));
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return handleApiError(error);
    }
  }
}

export default new ApiService();