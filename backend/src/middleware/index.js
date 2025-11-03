const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { RateLimiterMemory } = require('rate-limiter-flexible');
const config = require('../config');

// 创建速率限制器
const rateLimiter = new RateLimiterMemory({
  points: config.security.rateLimitMax,
  duration: Math.floor(config.security.rateLimitWindowMs / 1000),
});

/**
 * 速率限制中间件
 */
const rateLimiterMiddleware = (req, res, next) => {
  const ip = req.ip;
  
  rateLimiter.consume(ip)
    .then(() => {
      next();
    })
    .catch(() => {
      res.status(429).json({
        success: false,
        message: '请求过于频繁，请稍后再试',
        error: 'Rate limit exceeded'
      });
    });
};

/**
 * 错误处理中间件
 */
const errorHandler = (err, req, res, next) => {
  console.error('错误处理中间件捕获到错误:', err);
  
  // 设置默认错误状态码和消息
  let statusCode = err.status || 500;
  let message = err.message || '服务器内部错误';
  
  // 根据错误类型设置不同的状态码
  if (err.name === 'SyntaxError') {
    statusCode = 400;
    message = '无效的请求数据格式';
  } else if (err.message.includes('DeepSeek API')) {
    statusCode = 503;
    message = '外部API服务暂时不可用';
  } else if (err.message.includes('网络错误')) {
    statusCode = 502;
    message = '网络连接失败';
  }
  
  // 返回错误响应
  res.status(statusCode).json({
    success: false,
    message: message,
    error: process.env.NODE_ENV === 'production' ? undefined : err.message
  });
};

/**
 * 请求验证中间件
 */
const validateRequest = (req, res, next) => {
  const { question } = req.body;
  
  if (!question || typeof question !== 'string' || question.trim() === '') {
    return res.status(400).json({
      success: false,
      message: '问题不能为空',
      error: 'Missing or invalid question parameter'
    });
  }
  
  // 限制问题长度
  if (question.length > 2000) {
    return res.status(400).json({
      success: false,
      message: '问题长度不能超过2000个字符',
      error: 'Question too long'
    });
  }
  
  next();
};

/**
 * 初始化所有中间件
 */
const initializeMiddlewares = (app) => {
  // 安全相关中间件
  app.use(helmet());
  
  // CORS配置
  app.use(cors({
    origin: '*', // 在生产环境中应该配置具体的域名
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }));
  
  // 请求体解析
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  
  // 日志记录
  app.use(morgan('combined'));
  
  // 速率限制
  app.use(rateLimiterMiddleware);
};

module.exports = {
  initializeMiddlewares,
  errorHandler,
  validateRequest
};