const app = require('./app');
const config = require('./config');

// 启动服务器
const server = app.listen(config.server.port, config.server.host, () => {
  console.log(`服务器正在运行在 ${config.server.host}:${config.server.port}`);
  console.log(`健康检查端点: http://${config.server.host}:${config.server.port}/api/health`);
  console.log(`API文档: http://${config.server.host}:${config.server.port}/api/config`);
});

// 处理服务器错误
server.on('error', (error) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof config.server.port === 'string' 
    ? `Pipe ${config.server.port}` 
    : `Port ${config.server.port}`;

  // 处理不同类型的错误
  switch (error.code) {
    case 'EACCES':
      console.error(`${bind} 需要管理员权限`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`${bind} 端口已被占用`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});

// 优雅关闭
const gracefulShutdown = () => {
  console.log('正在关闭服务器...');
  server.close(() => {
    console.log('服务器已关闭');
    process.exit(0);
  });
};

// 监听终止信号
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);