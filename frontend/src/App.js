import React, { useEffect } from 'react';
import ChatInterface from './components/ChatInterface';
import apiService from './services/apiService';
import './assets/styles/App.css';

function App() {
  // 在应用启动时检查API健康状态
  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        const result = await apiService.checkHealth();
        if (result.success) {
          console.log('API服务运行正常');
        } else {
          console.warn('API服务可能存在问题:', result.message);
          // 可以在这里添加提示用户的逻辑
        }
      } catch (error) {
        console.error('检查API健康状态失败:', error);
        // API可能未启动，这在开发环境中是正常的
      }
    };

    checkApiHealth();
  }, []);

  return (
    <div className="app">
      <ChatInterface />
    </div>
  );
}

export default App;