import { ElMessage } from 'element-plus';
import API from '../API_PRO';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 3000; // 3秒
  }

  init(userId) {
    if (!userId) {
      console.error('WebSocket 初始化失败：缺少用户ID');
      return;
    }

    try {
      const wsUrl = API.getChatWebSocketUrl(userId);
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        console.log('WebSocket 连接已建立');
        this.reconnectAttempts = 0;
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('WebSocket 消息解析错误:', error);
        }
      };

      this.socket.onclose = () => {
        console.log('WebSocket 连接已关闭');
        this.handleReconnect();
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket 错误:', error);
      };
    } catch (error) {
      console.error('WebSocket 初始化错误:', error);
    }
  }

  handleMessage(data) {
    // 根据消息类型处理不同的消息
    switch (data.type) {
      case 'chat':
        // 处理聊天消息
        break;
      case 'notification':
        // 处理通知消息
        ElMessage.info(data.content);
        break;
      default:
        console.log('收到未知类型的消息:', data);
    }
  }

  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`尝试重新连接 (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      setTimeout(() => {
        this.init(localStorage.getItem('userId'));
      }, this.reconnectInterval);
    } else {
      console.error('WebSocket 重连失败，已达到最大重试次数');
      ElMessage.error('聊天服务连接失败，请刷新页面重试');
    }
  }

  sendMessage(message) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.error('WebSocket 未连接，无法发送消息');
      ElMessage.error('聊天服务未连接，请刷新页面重试');
    }
  }

  close() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

// 创建单例实例
const websocketService = new WebSocketService();

export default websocketService; 