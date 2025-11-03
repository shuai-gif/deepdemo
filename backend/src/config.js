require('dotenv').config();

module.exports = {
  // DeepSeek API 配置
  deepseek: {
    apiKey: process.env.DEEPSEEK_API_KEY,
    apiUrl: process.env.DEEPSEEK_API_URL,
    // 使用性能最优的模型（不考虑响应时间）
    model: 'deepseek-chat',
    maxTokens: 4096,
    temperature: 0.7
  },
  
  // 服务器配置
  server: {
    port: 3000,
    host: '0.0.0.0'
  },
  
  // 安全配置
  security: {
    rateLimitWindowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000,
    rateLimitMax: process.env.RATE_LIMIT_MAX || 100
  },
  
  // 请求超时配置
  timeout: {
    requestTimeoutMs: process.env.REQUEST_TIMEOUT_MS || 60000
  }
};