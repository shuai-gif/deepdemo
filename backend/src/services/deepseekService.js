const axios = require('axios');
const config = require('../config');

class DeepseekService {
  constructor() {
    // 添加详细调试信息
    console.log('调试信息 - 配置对象:');
    console.log('config.deepseek.apiKey:', config.deepseek.apiKey);
    console.log('API密钥长度:', config.deepseek.apiKey ? config.deepseek.apiKey.length : 'undefined');
    console.log('API密钥类型:', typeof config.deepseek.apiKey);
    console.log('是否为默认字符串:', config.deepseek.apiKey === 'your_api_key_here');
    
    // 验证API密钥是否存在
    if (!config.deepseek.apiKey || config.deepseek.apiKey === 'your_api_key_here' || config.deepseek.apiKey.length !== 35) {
      console.error('警告: DeepSeek API密钥未正确配置!', {
        hasKey: !!config.deepseek.apiKey,
        keyLength: config.deepseek.apiKey ? config.deepseek.apiKey.length : 'undefined',
        isDefault: config.deepseek.apiKey === 'your_api_key_here'
      });
    }
    
    this.client = axios.create({
      baseURL: config.deepseek.apiUrl,
      timeout: config.timeout.requestTimeoutMs,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.deepseek.apiKey}`
      }
    });
  }

  /**
   * 调用DeepSeek API获取回答
   * @param {string} question - 用户的问题
   * @param {Array} history - 历史对话记录
   * @returns {Promise<Object>} API响应
   */
  async getAnswer(question, history = []) {
    try {
      // 构建消息数组，包括历史记录和当前问题
      const messages = [
        ...history,
        { role: 'user', content: question }
      ];

      const response = await this.client.post('', {
        model: config.deepseek.model,
        messages: messages,
        max_tokens: config.deepseek.maxTokens,
        temperature: config.deepseek.temperature,
        stream: true // 启用流式响应以支持实时打字效果
      });

      // 返回完整的响应对象，而不仅仅是data部分
      // 这样processStream方法才能访问response.data.on方法
      return response;
    } catch (error) {
      console.error('DeepSeek API 调用失败:', error.message);
      
      // 记录详细错误信息以便调试
      if (error.response) {
        console.error('API响应错误:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
        // 服务器返回错误状态码
        throw new Error(`DeepSeek API 返回错误: ${error.response.status} ${error.response.statusText} - ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        console.error('请求发送但未收到响应');
        // 请求已发送但未收到响应
        throw new Error('网络错误: 无法连接到DeepSeek API');
      } else {
        console.error('请求配置错误:', error.message);
        // 请求配置出错
        throw new Error(`请求配置错误: ${error.message}`);
      }
    }
  }

  /**
   * 处理流式响应
   * @param {Object} response - API响应
   * @param {Function} onData - 处理数据的回调函数
   * @returns {Promise<void>}
   */
  async processStream(response, onData) {
    return new Promise((resolve, reject) => {
      // 添加错误检查，防止访问undefined对象的属性
      if (!response || !response.data) {
        console.error('无效的响应对象:', { response });
        reject(new Error('无效的API响应: 缺少数据字段'));
        return;
      }
      
      // 检查response.data是否有on方法（是否为流对象）
      if (typeof response.data.on === 'function') {
        // 处理流式响应（理想情况）
        response.data.on('data', (chunk) => {
          try {
            const chunkStr = chunk.toString('utf8');
            const lines = chunkStr.split(/\r?\n/);
            
            for (const line of lines) {
              if (line.trim() === '') continue;
              if (line.startsWith(':')) continue;
              
              try {
                if (line.startsWith('data: ')) {
                  const data = line.slice(6);
                  
                  // 检查是否为结束标志
                  if (data === '[DONE]') {
                    return;
                  }
                  
                  const json = JSON.parse(data);
                  if (json.choices && json.choices[0] && json.choices[0].delta && json.choices[0].delta.content) {
                    onData(json.choices[0].delta.content);
                  }
                } else {
                  // 尝试解析普通JSON
                  try {
                    const data = JSON.parse(line);
                    if (data.choices && data.choices[0] && data.choices[0].delta && data.choices[0].delta.content) {
                      onData(data.choices[0].delta.content);
                    }
                  } catch (e) {
                    console.error('解析JSON失败:', e.message);
                  }
                }
              } catch (parseError) {
                console.error('解析流式响应失败:', parseError);
              }
            }
          } catch (error) {
            console.error('处理流数据时出错:', error.message);
          }
        });
        
        response.data.on('end', () => {
          resolve();
        });
        
        response.data.on('error', (error) => {
          console.error('流式传输错误:', error.message);
          reject(error);
        });
      } else {
        // 处理非流式响应（字符串或对象）
        console.log('响应数据不是有效的流对象，开始处理非流式响应');
        console.log('响应数据类型:', typeof response.data);
        console.log('响应数据长度:', response.data ? String(response.data).length : 0);
        console.log('响应数据预览:', response.data ? String(response.data).substring(0, 100) + '...' : 'null');
        
        try {
          let contentProcessed = false;
          
          // 重点处理SSE格式字符串
          if (typeof response.data === 'string' && response.data.trim().startsWith('data: ')) {
            console.log('检测到SSE格式响应，开始解析');
            const events = response.data.split(/\r?\n/);
            
            for (const event of events) {
              if (event.trim().startsWith('data: ')) {
                try {
                  const data = event.trim().substring(6);
                  if (data === '[DONE]') continue;
                  
                  const json = JSON.parse(data);
                  if (json.choices && json.choices[0] && json.choices[0].delta && json.choices[0].delta.content) {
                    onData(json.choices[0].delta.content);
                    contentProcessed = true;
                  }
                } catch (parseError) {
                  console.error('解析单个SSE事件时出错:', parseError.message);
                  // 继续处理下一个事件
                }
              }
            }
          } 
          // 处理JSON对象
          else if (typeof response.data === 'object' && response.data !== null) {
            if (response.data.choices && response.data.choices[0]) {
              if (response.data.choices[0].message && response.data.choices[0].message.content) {
                onData(response.data.choices[0].message.content);
                contentProcessed = true;
              } else if (response.data.choices[0].delta && response.data.choices[0].delta.content) {
                onData(response.data.choices[0].delta.content);
                contentProcessed = true;
              }
            }
          }
          // 尝试解析普通JSON字符串
          else if (typeof response.data === 'string' && !contentProcessed) {
            try {
              const parsedData = JSON.parse(response.data);
              if (parsedData.choices && parsedData.choices[0]) {
                if (parsedData.choices[0].message && parsedData.choices[0].message.content) {
                  onData(parsedData.choices[0].message.content);
                  contentProcessed = true;
                } else if (parsedData.choices[0].delta && parsedData.choices[0].delta.content) {
                  onData(parsedData.choices[0].delta.content);
                  contentProcessed = true;
                }
              }
            } catch (parseError) {
              console.error('无法将字符串响应解析为JSON:', parseError.message);
              // 只有在内容未被处理的情况下，才作为回退传递原始内容
              if (!contentProcessed) {
                onData(response.data);
                contentProcessed = true;
              }
            }
          }
          // 最后的回退
          else if (!contentProcessed) {
            const fallbackContent = String(response.data || '无法获取响应内容');
            console.warn('使用回退内容格式');
            onData(fallbackContent);
            contentProcessed = true;
          }
          
          resolve();
        } catch (error) {
          console.error('处理非流式响应时发生错误:', error.message);
          reject(new Error('处理非流式响应失败: ' + error.message));
        }
      }
    });
  }
}

module.exports = new DeepseekService();