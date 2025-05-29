import api from "@/API_PRO.js"; // 导入 API
import { ElMessage } from "element-plus"; // 导入 ElMessage 用于提示
import router from '@/router/index.js'; // 导入 router 实例

const state = () => ({
  // 用户模块的状态
  isLoggedIn: false,
  userInfo: null, // 当前登录用户的基本信息
  authLoading: false, // 认证相关操作的加载状态
  notifications: [], // 系统通知列表
  unreadNotificationCount: 0, // 未读通知数量
  // 可能需要的其他状态：
  // userProfile: null, // 查看其他用户资料时使用
})

const mutations = {
  // 用户模块的 mutations
  SET_LOGIN_STATUS(state, status) {
    state.isLoggedIn = status;
  },
  SET_USER_INFO(state, userInfo) {
    state.userInfo = userInfo;
  },
  SET_NOTIFICATIONS(state, notifications) {
    state.notifications = notifications;
  },
  MARK_NOTIFICATION_AS_READ(state, notificationId) {
    const notification = state.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
    }
  },
  UPDATE_UNREAD_COUNT(state, count) {
    state.unreadNotificationCount = count;
  },
  // 可能需要的其他 mutations：
  // SET_USER_PROFILE(state, userProfile) { state.userProfile = userProfile; },
  // ADD_NOTIFICATION(state, notification) { state.notifications.unshift(notification); },
  // REMOVE_NOTIFICATION(state, notificationId) { state.notifications = state.notifications.filter(n => n.id !== notificationId); },
}

const actions = {
  // 用户模块的 actions (异步操作，通常涉及 API 调用)
  // 对应 TODO: 2.用户模块
  async login({ commit, dispatch }, credentials) {
    try {
      // 调用登录 API
      // openapi 中登录接口是 /api/v1/auth/login POST
      const loginData = await api.userLogin(credentials);
      // 假设 loginData 包含 access_token 和 token_type
      // 根据实际 API 响应调整字段名。如果 API 直接返回用户信息，可以在这里处理
      const token = loginData.access_token; // 根据实际 API 响应调整字段名

      if (token) {
        // 存储 token
        localStorage.setItem("token", token);

        // 如果登录接口直接返回了用户信息，可以在这里先更新 state
        // 例如：if (loginData.user) { commit("SET_USER_INFO", loginData.user); }

        // 调用 fetchUserInfo 获取完整的用户资料并等待其完成
        await dispatch("fetchUserInfo");

        // 在 fetchUserInfo 成功后，用户信息应该已经被设置到 state 中了
        // 从 state.userInfo 中获取 userId 并存储到 localStorage
        // 尝试使用 id 或 user_id 作为用户 ID
        const userInfo = this.state.user.userInfo;
        const userId = userInfo ? (userInfo.id || userInfo.user_id) : null;

        if (userId) {
          localStorage.setItem("userId", userId);
        } else {
          console.warn("Login action: fetchUserInfo did not return valid user info with id or user_id.");
        }

        // 更新登录状态 (确保在获取用户信息后更新状态)
        commit("SET_LOGIN_STATUS", true);

        ElMessage.success("登录成功");
        return loginData; // 返回登录成功的数据
      } else {
        throw new Error("获取 token 失败或登录未成功");
      }
    } catch (error) {
      console.error("登录失败:", error);
      // 假设 API 错误处理层已经处理了 ElMessage 提示，如果没有，可以在这里添加
      // ElMessage.error(error.message || "登录失败，请稍后重试");
      commit("SET_LOGIN_STATUS", false);
      commit("SET_USER_INFO", null); // 清除用户信息
      localStorage.removeItem("token");
      localStorage.removeItem("userId"); // 清除 userId
      throw error; // 抛出错误以便组件捕获
    }
  },

  async register({ commit }, userData) {
    try {
      // 调用注册 API
      // openapi 中注册接口是 /api/v1/auth/register POST
      const response = await api.userRegister(userData); // 假设 api.userRegister 对应此接口

      // 注册成功，可以根据后端响应进行处理，例如提示用户
      ElMessage.success("注册成功，请登录");
      // 注册成功后通常不需要立即设置登录状态，等待用户手动登录

      return response; // 返回注册成功的数据
    } catch (error) {
      console.error("注册失败:", error);
      // 假设 API 错误处理层已经处理了 ElMessage 提示
      // ElMessage.error(error.message || "注册失败，请稍后重试");
      throw error; // 抛出错误以便组件捕获
    }
  },

  async logout({ commit }, { inStoreLogout = true } = {}) {
    // 清除用户信息和登录状态
    commit("SET_LOGIN_STATUS", false);
    commit("SET_USER_INFO", null);
    localStorage.removeItem("token");
    // localStorage.removeItem("refresh_token");
    if (inStoreLogout) {
      ElMessage.success("已退出登录");
    }
    router.push("/login"); // 现在 router 已定义
  },

  async fetchUserInfo({ commit, state }) {
    // 如果已经有用户信息或者 authLoading 为 true，避免重复请求
    if (state.userInfo && state.isLoggedIn) return state.userInfo;
    // if (state.authLoading) return;

    const token = localStorage.getItem("token");
    if (!token) {
      commit("SET_LOGIN_STATUS", false);
      commit("SET_USER_INFO", null);
      return null;
    }

    try {
      // commit("SET_ADMIN_LOADING", true); // 如果有 loading 状态
      // 调用获取用户信息 API
      // openapi 中获取当前用户信息接口是 /api/v1/users/me GET
      const userInfo = await api.getUserProfile(); // 假设 api.getUserProfile 对应此接口

      commit("SET_USER_INFO", userInfo);
      commit("SET_LOGIN_STATUS", true); // 确认登录状态
      return userInfo;

    } catch (error) {
      console.error("获取用户信息失败:", error);
      // Token 可能无效或过期，清除登录状态
      commit("SET_LOGIN_STATUS", false);
      commit("SET_USER_INFO", null);
      localStorage.removeItem("token");
      // localStorage.removeItem("refresh_token");
      // ElMessage.error("用户信息获取失败或登录已过期，请重新登录");
      throw error; // 抛出错误
    } finally {
      // commit("SET_ADMIN_LOADING", false); // 如果有 loading 状态
    }
  },

  async updateProfile({ commit }, profileData) { /* ... */ }, // 更新用户个人资料
  async changePassword({ commit }, passwordData) { /* ... */ }, // 修改用户密码
  async requestVerificationEmail({ commit }, email) { /* ... */ }, // 请求发送邮箱验证邮件
  async verifyEmail({ commit }, token) { /* ... */ }, // 验证邮箱
  async fetchNotifications({ commit }) { /* ... */ }, // 获取系统通知列表
  async markNotificationAsRead({ commit }, notificationId) { /* ... */ }, // 标记通知为已读
  async deleteNotification({ commit }, notificationId) { /* ... */ }, // 删除通知
  // async fetchUserProfile({ commit }, userId) { /* 获取其他用户资料 */ },
}

const getters = {
  // 用户模块的 getters (从 state 计算派生数据)
  isAuthenticated: state => !!state.token, // Check if token exists
  // New getter to check if the user is a regular admin (based on is_staff)
  isAdmin: (state) => state.userInfo?.is_staff === true,
  // New getter to check if the user is the super admin (based on email)
  isSuperAdmin: (state) => state.userInfo?.email === '23301132@bjtu.edu.cn',
  // You might want a combined role getter for menu filtering
  userRole: (state, getters) => {
    if (getters.isSuperAdmin) {
      return 'super_admin';
    } else if (getters.isAdmin) {
      return 'admin';
    } else {
      return 'user'; // Or null, depending on your needs for non-admin users
    }
  },
  getUserInfo: state => state.userInfo,
  getNotifications: state => state.notifications,
  getUnreadNotificationCount: state => state.unreadNotificationCount,
  // 可能需要的其他 getters：
  // getUserProfile: state => state.userProfile,
}

export default {
  namespaced: true, // 添加命名空间
  state,
  mutations,
  actions,
  getters,
} 