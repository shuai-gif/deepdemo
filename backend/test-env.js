require('dotenv').config();

console.log('环境变量加载测试:');
console.log('DEEPSEEK_API_KEY:', process.env.DEEPSEEK_API_KEY);
console.log('API密钥长度:', process.env.DEEPSEEK_API_KEY ? process.env.DEEPSEEK_API_KEY.length : '未定义');
console.log('是否为默认值:', process.env.DEEPSEEK_API_KEY === 'your_api_key_here');

// 测试配置加载
const config = require('./src/config');
console.log('\n配置对象中的API密钥:');
console.log('config.deepseek.apiKey:', config.deepseek.apiKey);
console.log('配置中密钥长度:', config.deepseek.apiKey ? config.deepseek.apiKey.length : '未定义');
console.log('配置中是否为默认值:', config.deepseek.apiKey === 'your_api_key_here');