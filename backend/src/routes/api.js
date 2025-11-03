const express = require('express');
const router = express.Router();
const deepseekService = require('../services/deepseekService');
const { validateRequest } = require('../middleware');

/**
 * @route POST /api/chat
 * @description 处理用户问答请求
 */
router.post('/chat', validateRequest, async (req, res) => {
  const { question, history = [] } = req.body;
  
  try {
    // 设置响应头以支持流式传输
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    // 发送开始事件
    res.write('event: start\ndata: {"status":"processing"}\n\n');
    
    // 获取DeepSeek API响应
    const response = await deepseekService.getAnswer(question, history);
    
    // 处理流式响应
    await deepseekService.processStream(response, (content) => {
      // 发送数据事件
      res.write(`event: message\ndata: ${JSON.stringify({ content })}\n\n`);
    });
    
    // 发送结束事件
    res.write('event: end\ndata: {"status":"completed"}\n\n');
    res.end();
  } catch (error) {
    // 发生错误时发送错误事件
    res.status(500).write(`event: error\ndata: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
});

/**
 * @route GET /api/health
 * @description 健康检查端点
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: '服务运行正常',
    timestamp: new Date().toISOString()
  });
});

/**
 * @route GET /api/config
 * @description 获取API配置信息（不包含敏感信息）
 */
router.get('/config', (req, res) => {
  res.status(200).json({
    success: true,
    supportedFeatures: {
      streaming: true,
      history: true,
      maxQuestionLength: 2000
    }
  });
});

module.exports = router;