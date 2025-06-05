import API_PRO from '@/API_PRO';

const state = () => ({
  // 管理员模块的状态
  users: [], // 用户列表
  products: [], // 待审核或需要管理的商品列表
  returnRequests: [], // 需要处理的退货请求列表
  reports: [], // 需要处理的举报列表
  // 可能需要的其他状态：
  // adminLoading: false,
})

const mutations = {
  // 管理员模块的 mutations
  SET_USERS(state, users) {
    state.users = users;
  },
  SET_ADMIN_PRODUCTS(state, products) {
    state.products = products;
  },
  SET_ADMIN_RETURN_REQUESTS(state, returnRequests) {
    state.returnRequests = returnRequests;
  },
  SET_ADMIN_REPORTS(state, reports) {
    state.reports = reports;
  },
  // 可能需要的其他 mutations：
  // SET_ADMIN_LOADING(state, loading) { state.adminLoading = loading; },
  // UPDATE_USER_STATUS(state, { userId, status }) { /* 更新用户状态 */ },
  // UPDATE_PRODUCT_STATUS(state, { productId, status }) { /* 更新商品状态 */ },
  // UPDATE_RETURN_REQUEST_STATUS(state, { requestId, status }) { /* 更新退货请求状态 */ },
  // UPDATE_REPORT_STATUS(state, { reportId, status }) { /* 更新举报状态 */ },
}

const actions = {
  // 管理员模块的 actions (异步操作，通常涉及 API 调用)
  // 对应 TODO: 7. 管理员后台前端 (开发者 A)
  async fetchUsers({ commit }, params) { /* 获取用户列表 */ },
  async changeUserStatus({ commit }, { userId, status }) { /* 更改用户状态 */ },
  async adjustUserCredit({ commit }, { userId, credit }) { /* 调整用户信用分 */ },
  async fetchAdminProducts({ commit }, params) { /* 获取待审核/管理商品列表 */ },
  async activateProduct({ commit }, productId) { /* 激活商品 */ },
  async rejectProduct({ commit }, productId) { /* 拒绝商品 */ },
  async fetchAdminReturnRequests({ commit }, params) { /* 获取退货请求列表 */ },
  async adminResolveReturnRequest({ commit }, { requestId, result }) { /* 管理员处理退货介入 */ },
  async fetchAdminReports({ commit }, params) { /* 获取举报列表 */ },
  async handleReport({ commit }, { reportId, result }) { /* 管理员处理举报 */ },
  async sendSystemNotification({ commit }, notificationData) { /* 发送系统通知 */ },
  async fetchAdminChatMessages({ commit }, params) {
    try {
      const { page_number, page_size, search_query } = params; // 解构参数
      const responseData = await API_PRO.getAdminChatMessages({ page_number, page_size, search_query });
      return responseData;
    } catch (error) {
      console.error('获取管理员聊天消息失败:', error);
      throw error;
    }
  },
  async updateAdminMessageVisibility({ commit }, { messageId, senderVisible, receiverVisible }) {
    try {
      await API_PRO.adminUpdateSingleMessageVisibility(messageId, senderVisible, receiverVisible);
      // Optionally, you might want to re-fetch the messages or update the specific message in the state
      // For now, we'll let the AdminChatView component handle the re-fetch after successful update.
    } catch (error) {
      console.error('更新管理员消息可见性失败:', error);
      throw error;
    }
  },
  async deleteAdminChatMessage({ commit }, messageId) {
    try {
      await API_PRO.adminDeleteChatMessage(messageId);
      // 不直接在 store 中移除消息，而是让组件重新加载列表以反映变化
    } catch (error) {
      console.error('物理删除消息失败:', error);
      throw error;
    }
  },
}

const getters = {
  // 管理员模块的 getters (从 state 计算派生数据)
  getUsers: state => state.users,
  getAdminProducts: state => state.products,
  getAdminReturnRequests: state => state.returnRequests,
  getAdminReports: state => state.reports,
  // isAdminLoading: state => state.adminLoading,
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
} 