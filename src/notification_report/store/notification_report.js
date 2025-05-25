const state = () => ({
  // 通知和举报模块的状态
  notifications: [],
  reports: [], // 管理员查看的举报列表
})

const mutations = {
  // 通知和举报模块的 mutations
  SET_NOTIFICATIONS(state, notifications) {
    state.notifications = notifications;
  },
  SET_REPORTS(state, reports) {
    state.reports = reports;
  },
}

const actions = {
  // 通知和举报模块的 actions
}

const getters = {
  // 通知和举报模块的 getters
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
} 