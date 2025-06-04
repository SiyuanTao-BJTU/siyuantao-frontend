import API_PRO from '@/API_PRO';

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
  SET_CONVERSATIONS(state, conversations) {
    state.conversations = conversations;
  },
  SET_CURRENT_CHAT_MESSAGES(state, messages) {
    state.currentChatMessages = messages;
  },
  ADD_CHAT_MESSAGE(state, message) {
    state.currentChatMessages.push(message);
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
      const conversations = await API_PRO.getUserChatSessions();
      commit('SET_CONVERSATIONS', conversations);
      return conversations;
    } catch (error) {
      console.error('获取会话列表失败:', error);
      throw error;
    }
  },
  async fetchChatMessages({ commit }, { otherUserId, productId }) {
    try {
      const messages = await API_PRO.getMessagesForSession(otherUserId, productId);
      commit('SET_CURRENT_CHAT_MESSAGES', messages);
      // 标记消息为已读 (如果需要)
      // 后端应该在获取消息时自动标记为已读
      return messages;
    } catch (error) {
      console.error('获取聊天记录失败:', error);
      throw error;
    }
  },
  async sendMessage({ commit }, messageData) {
    try {
      const newMessage = await API_PRO.createChatMessage(messageData);
      commit('ADD_CHAT_MESSAGE', newMessage); // 添加新消息到当前会话
      return newMessage;
    } catch (error) {
      console.error('发送消息失败:', error);
      throw error;
    }
  },
  async hideConversation({ commit }, { otherUserId, productId }) {
    try {
      await API_PRO.hideChatSession(otherUserId, productId);
      // 可以在这里更新前端会话列表，例如从列表中移除该会话
      // 或者重新获取会话列表
      const conversations = await API_PRO.getUserChatSessions();
      commit('SET_CONVERSATIONS', conversations);
    } catch (error) {
      console.error('隐藏会话失败:', error);
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