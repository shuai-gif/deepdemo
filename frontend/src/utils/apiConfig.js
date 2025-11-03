// API配置文件
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  endpoints: {
    chat: '/api/chat',
    health: '/api/health',
    config: '/api/config'
  },
  timeout: 60000, // 60秒超时
};

// 构建完整的API URL
export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.baseURL}${API_CONFIG.endpoints[endpoint]}`;
};

// 默认请求头
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// 错误处理
export const handleApiError = (error) => {
  console.error('API请求错误:', error);
  
  if (error.response) {
    // 服务器返回错误状态码
    return {
      success: false,
      message: error.response.data?.message || '服务器错误',
      status: error.response.status,
      data: error.response.data
    };
  } else if (error.request) {
    // 请求已发送但未收到响应
    return {
      success: false,
      message: '网络错误，无法连接到服务器',
      status: 0
    };
  } else {
    // 请求配置出错
    return {
      success: false,
      message: error.message || '请求错误',
      status: 0
    };
  }
};