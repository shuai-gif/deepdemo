# DeepSeek API 问答应用

这是一个完整的前后端应用程序，用于接入DeepSeek API实现问答功能。

## 功能特点

### 后端功能
- 构建了一个API服务，负责接收前端请求并与DeepSeek API进行交互
- 实现了API密钥安全管理机制，确保DeepSeek API密钥不直接暴露在前端
- 配置使用DeepSeek API中性能最优的模型
- 实现了请求超时处理和错误捕获机制
- 支持速率限制，防止API滥用
- 提供健康检查端点

### 前端功能
- 设计了用户友好的聊天界面
- 实现了实时打字效果展示回答内容
- 添加了加载状态指示和错误提示功能
- 确保界面响应式设计，适配不同设备尺寸
- 支持问题历史记录功能，使用localStorage存储
- 实现了基本的文本格式化（使用markdown渲染）
- 提供复制消息内容功能

## 技术栈

### 后端
- Node.js + Express
- Axios（HTTP请求）
- dotenv（环境变量管理）
- cors（跨域支持）
- helmet（安全增强）
- morgan（日志记录）
- rate-limiter-flexible（速率限制）

### 前端
- React
- Vite
- axios（HTTP请求）
- react-markdown（Markdown渲染）

## 部署指南

### 1. 环境准备

确保已安装以下软件：
- Node.js (v14+)
- npm

### 2. 后端部署

```bash
# 进入后端目录
cd backend

# 安装依赖
npm install

# 配置环境变量
# 复制.env.example文件为.env并填写你的DeepSeek API密钥
cp .env.example .env
# 编辑.env文件，设置DEEPSEEK_API_KEY

# 启动后端服务
npm start
# 或使用开发模式
npm run dev
```

后端服务默认运行在 http://localhost:3000

### 3. 前端部署

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 构建前端应用
npm run build

# 启动前端开发服务器（可选）
npm run dev
```

前端应用默认运行在 http://localhost:5173

### 4. 生产环境部署

在生产环境中，你可以使用PM2来管理后端服务，并使用Nginx作为前端静态资源服务器和反向代理。

## API文档

### 健康检查
- **URL**: `/api/health`
- **方法**: `GET`
- **描述**: 检查API服务是否正常运行

### 问答接口
- **URL**: `/api/chat`
- **方法**: `POST`
- **请求体**: 
  ```json
  {
    "question": "你的问题",
    "history": [
      { "role": "user", "content": "历史问题" },
      { "role": "assistant", "content": "历史回答" }
    ]
  }
  ```
- **响应**: 使用Server-Sent Events (SSE)流式返回回答

### 获取配置信息
- **URL**: `/api/config`
- **方法**: `GET`
- **描述**: 获取API配置信息

## 使用说明

1. 确保后端服务正在运行
2. 打开前端应用
3. 在输入框中输入你的问题，然后点击发送按钮或按回车键
4. AI助手会实时显示回答内容
5. 聊天历史会自动保存，你可以随时查看之前的问答记录
6. 点击"清除历史"按钮可以清除所有聊天记录
7. 点击消息旁的复制按钮可以复制消息内容

## 注意事项

- 在生产环境中，请确保设置正确的CORS配置，不要使用通配符`*`
- 请妥善保管你的DeepSeek API密钥，不要提交到版本控制系统
- 建议根据你的API配额调整速率限制配置
- 在使用前，确保你的DeepSeek API账户有足够的额度

## 故障排除

- 如果无法连接到API，请检查你的网络连接和API密钥是否正确
- 如果收到速率限制错误，请稍后再试
- 如果前端无法连接到后端，请检查后端服务是否正在运行，以及CORS配置是否正确

## 许可证

MIT License