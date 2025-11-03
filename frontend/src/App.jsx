import { useEffect, useState } from 'react';
import ChatInterface from './components/ChatInterface.jsx';
import apiService from './services/apiService';
import './assets/styles/App.css';

function App() {
  const [isHealthy, setIsHealthy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 检查API健康状态
    const checkApiHealth = async () => {
      try {
        const healthStatus = await apiService.checkHealth();
        setIsHealthy(healthStatus?.status === 'ok');
      } catch (err) {
        console.error('API健康检查失败:', err);
        setError('无法连接到API服务，请确保后端服务正在运行');
      } finally {
        setLoading(false);
      }
    };

    checkApiHealth();
  }, []);

  if (loading) {
    return (
      <div className="app">
        <div className="loading-container">
          <p>正在连接到服务...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>DeepSeek API 问答应用</h1>
        <div className="api-status">
          <span className={`status-indicator ${isHealthy ? 'healthy' : 'unhealthy'}`}>
            {isHealthy ? 'API 正常' : 'API 异常'}
          </span>
        </div>
      </header>
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}
      
      <main className="app-main">
        <ChatInterface />
      </main>
    </div>
  );
}

export default App;
