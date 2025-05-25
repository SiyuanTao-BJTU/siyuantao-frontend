const state = () => ({
  // 聊天模块的状态
  conversations: [], // 会话列表
  currentChatMessages: [], // 当前会话的消息列表
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
  async fetchConversations({ commit }) { /* 获取会话列表 */ },
  async fetchChatMessages({ commit }, { productId, otherUserId }) { /* 获取指定会话的聊天记录 */ },
  async sendMessage({ commit }, messageData) { /* 发送消息 (可能通过 WebSocket) */ },
  async markMessageAsRead({ commit }, messageId) { /* 标记消息为已读 */ },
  async hideConversation({ commit }, productId) { /* 隐藏会话 */ },
  // handleIncomingMessage({ commit }, message) { /* 处理接收到的新消息 (WebSocket) */ },
}

const getters = {
  // 聊天模块的 getters (从 state 计算派生数据)
  getConversations: state => state.conversations,
  getCurrentChatMessages: state => state.currentChatMessages,
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