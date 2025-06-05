import API_PRO from '@/API_PRO';
import { ElMessage } from 'element-plus'; // Import ElMessage

const state = () => ({
  // 聊天模块的状态
  conversations: [], // 会话列表
  currentChatMessages: [], // 当前会话的消息列表
  commonPhrases: [ // 新增：校园二手交易常用语
    '你好，这个商品还在吗？',
    '请问最低价是多少？',
    '我在学校附近，方便面交吗？',
    '商品有什么瑕疵吗？',
    '可以发更多细节图看看吗？',
    '我是东校区，你方便送到哪里？',
    '请问大概什么时候能交易？',
    '谢谢，我考虑一下。',
    '已读不回，请问还在吗？',
    '我有点急用，能快点发货吗？'
  ],
  // 可能需要的其他状态：
  // chatLoading: false,
  // currentChatPartner: null, // 当前聊天对象
})

const mutations = {
  // 聊天模块的 mutations
  SET_CONVERSATIONS(state, rawConversations) {
    state.conversations = rawConversations.map(conv => ({
      session_id: conv['会话ID'],
      other_user_id: conv['对方用户ID'],
      other_username: conv['对方用户名'],
      other_avatar_url: conv['对方头像URL'], // Directly from backend
      product_id: conv['相关商品ID'],
      product_name: conv['相关商品名称'],
      product_image_url: conv['相关商品图片URL'], // Directly from backend
      last_message_content: conv['最近一条消息'],
      last_message_time: conv['最近消息时间'],
      unread_count: conv['未读消息数'],
    }));
  },
  SET_CURRENT_CHAT_MESSAGES(state, rawMessages) {
    state.currentChatMessages = rawMessages.map(msg => ({
      message_id: msg['消息ID'],
      conversation_identifier: msg['会话标识符'],
      sender_id: msg['发送者ID'],
      sender_username: msg['发送者用户名'],
      receiver_id: msg['接收者ID'],
      receiver_username: msg['接收者用户名'],
      product_id: msg['商品ID'],
      product_name: msg['商品名称'],
      content: msg['消息内容'],
      send_time: msg['发送时间'],
      is_read: msg['是否已读'],
      sender_visible: msg['发送者可见'],
      receiver_visible: msg['接收者可见'],
    }));
  },
  ADD_CHAT_MESSAGE(state, rawMessage) {
    const message = {
      message_id: rawMessage['消息ID'],
      conversation_identifier: rawMessage['会话标识符'],
      sender_id: rawMessage['发送者ID'],
      sender_username: rawMessage['发送者用户名'],
      receiver_id: rawMessage['接收者ID'],
      receiver_username: rawMessage['接收者用户名'],
      product_id: rawMessage['商品ID'],
      product_name: rawMessage['商品名称'],
      content: rawMessage['消息内容'],
      send_time: rawMessage['发送时间'],
      is_read: rawMessage['是否已读'],
      sender_visible: rawMessage['发送者可见'],
      receiver_visible: rawMessage['接收者可见'],
    };
    state.currentChatMessages.push(message);
    // Optionally, update the corresponding conversation's last message details
    const conversationIndex = state.conversations.findIndex(
      c => c.session_id === message.conversation_identifier || (c.other_user_id === (message.sender_id === state.currentUser?.user_id ? message.receiver_id : message.sender_id) && c.product_id === message.product_id)
    );
    if (conversationIndex > -1) {
      const updatedConversation = {
        ...state.conversations[conversationIndex],
        last_message_content: message.content,
        last_message_time: message.send_time,
        // unread_count logic would be more complex, usually handled by backend or WebSocket push
      };
      state.conversations.splice(conversationIndex, 1, updatedConversation);
      // Sort conversations to bring the updated one to the top
      state.conversations.sort((a, b) => new Date(b.last_message_time) - new Date(a.last_message_time));
    }
  },
  // 可能需要的其他 mutations：
  // SET_CHAT_LOADING(state, loading) { state.chatLoading = loading; },
  // SET_CURRENT_CHAT_PARTNER(state, user) { state.currentChatPartner = user; },
  // MARK_MESSAGES_AS_READ(state, conversationId) { /* 标记某个会话的消息为已读 */ },
}

const actions = {
  // 聊天模块的 actions (异步操作，通常涉及 API/WebSocket 调用)
  // 对应 TODO: 5. 消息与退货模块 - 站内信聊天 (开发者 D)
  async fetchConversations({ commit }) {
    try {
      const conversationsFromAPI = await API_PRO.getUserChatSessions();
      commit('SET_CONVERSATIONS', conversationsFromAPI);
      return conversationsFromAPI; //原始数据，组件内通过getter获取规范化数据
    } catch (error) {
      console.error('获取会话列表失败:', error);
      ElMessage.error('获取会话列表失败!'); // Added ElMessage for user feedback
      throw error;
    }
  },
  async fetchChatMessages({ commit }, { otherUserId, productId }) {
    try {
      const messages = await API_PRO.getMessagesForSession(otherUserId, productId);
      commit('SET_CURRENT_CHAT_MESSAGES', messages);
      // 标记消息为已读 (如果需要)
      // 后端应该在获取消息时自动标记为已读
      return messages; //原始数据，组件内通过getter获取规范化数据
    } catch (error) {
      console.error('获取聊天记录失败:', error);
      ElMessage.error('获取聊天记录失败!'); // Added ElMessage for user feedback
      throw error;
    }
  },
  async sendMessage({ commit }, messageData) {
    try {
      const newMessage = await API_PRO.createChatMessage(messageData);
      commit('ADD_CHAT_MESSAGE', newMessage); // 添加新消息到当前会话 (mutation will normalize)
      return newMessage; // 返回原始的后端响应 (带中文键)
    } catch (error) {
      console.error('发送消息失败:', error);
      ElMessage.error('发送消息失败!'); // Added ElMessage for user feedback
      throw error;
    }
  },
  async hideConversation({ commit, dispatch }, { otherUserId, productId }) {
    try {
      await API_PRO.hideChatSession(otherUserId, productId);
      // 可以在这里更新前端会话列表，例如从列表中移除该会话
      // 或者重新获取会话列表
      await dispatch('fetchConversations'); // Re-fetch and normalize
    } catch (error) {
      console.error('隐藏会话失败:', error);
      ElMessage.error('隐藏会话失败!'); // Added ElMessage for user feedback
      throw error;
    }
  },
  // handleIncomingMessage({ commit }, message) { /* 处理接收到的新消息 (WebSocket) */ },
}

const getters = {
  // 聊天模块的 getters (从 state 计算派生数据)
  getConversations: state => state.conversations,
  getCurrentChatMessages: state => state.currentChatMessages,
  getCommonPhrases: state => state.commonPhrases, // 新增：获取常用语
  // isChatLoading: state => state.chatLoading,
  // getCurrentChatPartner: state => state.currentChatPartner,
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
} 