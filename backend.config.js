const BackendConfig = {
  // --- Deployed Server Configuration ---
  BASIC_URL: 'http://1.92.122.228',
  RESTFUL_API_URL: 'http://1.92.122.228/api',
  WebSocket_URL: 'ws://1.92.122.228/ws/chat',

  // --- Local Development Configuration ( uncomment to use ) ---
  // BASIC_URL: 'http://127.0.0.1:8000', // 本地Django默认端口
  // RESTFUL_API_URL: 'http://127.0.0.1:8000/api',
  // WebSocket_URL: 'ws://127.0.0.1:8000/ws/chat'
};

export default BackendConfig;