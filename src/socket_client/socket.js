import { ElMessage } from "element-plus";
import i18n from './../vue_i18n/index.js';
import BackendConfig from "../../backend.config";

const onErrorMessage = (data) => {
    console.error(`WebSocket error with code ${data.code} \n ${data.message}`);
};

const onReceiveNotice = (data) => {
    ElMessage.info(i18n.global.t('chatroom.new_chatroom'))
    WebSocketService.fetchMessage(data.room_id)
}

const WebSocketService = {
    userId: null,
    socket: null,
    callbacks: {
        FetchChatroomlist: [],
        ReceiveNotice: [],
        FetchMessage: [],
        ReceiveMessage: [onReceiveNotice],
        ErrorMessage: [onErrorMessage],
        SendNoticeResponse: [],
    },
    messageQueue: [],  // 添加消息队列

    init(userId) {
        console.log('WebSocketService init');
        this.userId = userId;
        this.socket = new WebSocket(BackendConfig.WebSocket_URL + `/${this.userId}/`);

        this.socket.onopen = () => {
            console.log('WebSocket connection opened');
            // 清空消息队列，发送所有等待中的消息
            this.flushMessageQueue();
        };

        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
        };

        this.socket.onclose = (event) => {
            console.log('WebSocket connection closed');
            console.log(`WebSocket connection Exit with the code ${event.code}`);
            setTimeout(() => {
                if (this.userId) {
                    this.init(this.userId); // 重新初始化连接
                }
            }, 3000); // 等待3秒后重连
        };

        this.socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    },

    handleMessage(data) {
        const event = data.event;
        if (this.callbacks[event]) {
            this.callbacks[event].forEach(callback => callback(data));
        }
    },

    send(event, payload) {
        const message = JSON.stringify({ event, ...payload });
        if (this.socket.readyState === WebSocket.OPEN) {
            // 如果连接已打开，直接发送消息
            this.socket.send(message);
        } else if (this.socket.readyState === WebSocket.CONNECTING) {
            // 如果连接正在建立中，将消息存入队列
            console.log('WebSocket is connecting. Queuing message:', message);
            this.messageQueue.push(message);
        } else {
            console.error('WebSocket is not open. Cannot send message:', message);
            // 如果连接已关闭或错误状态，重新建立连接
            this.reconnect();
            this.messageQueue.push(message);  // 将消息存入队列等待重新发送
        }
    },

    flushMessageQueue() {
        // 当 WebSocket 连接变为 OPEN 时，清空队列中的所有消息
        while (this.messageQueue.length > 0 && this.socket.readyState === WebSocket.OPEN) {
            const message = this.messageQueue.shift();
            this.socket.send(message);
        }
    },

    reconnect() {
        // 重新连接逻辑
        if (this.socket.readyState !== WebSocket.OPEN) {
            console.log('Attempting to reconnect WebSocket...');
            this.init(this.userId);  // 重新初始化连接
        }
    },

    fetchAllChatrooms() {
        this.send('fetchallchatrooms', { userid: this.userId });
    },

    sendNotice(anotherUserId) {
        console.log("send notice");
        this.send('sendnotice', {
            userid: this.userId,
            another_userid: anotherUserId
        });
    },

    fetchMessage(tradeId) {
        this.send('fetchmessage', { tradeid: tradeId });
    },

    sendMessage(content, tradeId) {
        this.send('sendmessage', { content, tradeid: tradeId });
        console.log("send message");
    },

    getState() {
        return this.socket.readyState;
    },

    on(type, callback) {
        if (this.callbacks[type]) {
            this.callbacks[type].push(callback);
        }
    },

    off(type, callback) {
        if (this.callbacks[type]) {
            this.callbacks[type] = this.callbacks[type].filter(cb => cb !== callback);
        }
    },

    close() {
        if (this.socket) {
            this.socket.close();  // 关闭 WebSocket 连接
            this.socket = null;   // 清空 socket 实例以便重新连接
            console.log('WebSocket connection manually closed');
        }
    }
};

export default WebSocketService;
