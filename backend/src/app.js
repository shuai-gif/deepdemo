const express = require('express');
const { initializeMiddlewares, errorHandler } = require('./middleware');
const apiRoutes = require('./routes/api');

// 创建Express应用实例
const app = express();

// 初始化中间件
initializeMiddlewares(app);

// 注册路由
app.use('/api', apiRoutes);

// 根路径处理
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'DeepSeek API 后端服务',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      chat: '/api/chat',
      config: '/api/config'
    }
  });
});

// 404处理
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: '请求的资源不存在',
    error: 'Not found'
  });
});

// 全局错误处理
app.use(errorHandler);

module.exports = app;