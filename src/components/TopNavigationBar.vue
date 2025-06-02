<script setup>
import { onMounted, ref, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Search, ChatLineRound, Bell, Plus, UserFilled, Setting, Goods, List, Star, Lock, Switch, HomeFilled, Box, ArrowDown, Expand, Fold, User } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import api from '@/API_PRO.js';
import BackendConfig from "../../backend.config"; // Import BackendConfig
import WebSocketService from "@/socket_client/socket.js";
import { useStore } from 'vuex';

// 组件全局变量定义
const router = useRouter();
const route = useRoute();
const store = useStore();
const MODE = process.env.NODE_ENV;
let username = ref('');
let avatarUrl = ref(null);
let isAdmin = ref(false);
let avatar_char = computed(() => {
  return (username.value && typeof username.value === 'string') ? username.value.slice(0, 2).toUpperCase() : '??';
});

const searchQuery = ref('');

const isLoggedIn = ref(localStorage.getItem('token') !== null); // 根据 token 初始判断登录状态

// 在组件挂载时也检查一次登录状态和用户信息
onMounted(() => {
    // console.log("TopNav: Component mounted, initial fetch user info.");
    fetchUserInfo();
});

// 获取用户信息的函数
const fetchUserInfo = async () => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const response = await api.getUserProfile();
      // 使用中文键名检查用户数据字段
      if (response && (response.用户ID || response.用户名)) {
        const userInfo = response; // API 直接返回用户信息对象
        username.value = userInfo.用户名;
        // 使用中文键名 '头像URL'
        avatarUrl.value = userInfo.头像URL ? 
          BackendConfig.RESTFUL_API_URL.replace(/\/api$/, '') + (userInfo.头像URL.startsWith('/') ? userInfo.头像URL : '/' + userInfo.头像URL) : null;
        // 使用中文键名 '是否管理员'
        isAdmin.value = userInfo.是否管理员 || false;
        isLoggedIn.value = true;
        localStorage.setItem('username', userInfo.用户名);
        localStorage.setItem('userAvatar', avatarUrl.value || ''); // Store full or empty string
        localStorage.setItem('isAdmin', isAdmin.value.toString()); // Store boolean as string
        localStorage.setItem('userId', userInfo.用户ID); // Store userId

        // 将完整的 userInfo 对象（已经是中文键名）存入 Vuex
        store.dispatch('user/setUserInfo', userInfo);

        // 初始化 WebSocket
        // 使用中文键名 '用户ID'
        if (userInfo.用户ID && (!WebSocketService.userId || WebSocketService.userId === 'undefined')) {
          WebSocketService.init(userInfo.用户ID);
        // 使用中文键名 '用户ID'
        } else if (userInfo.用户ID && WebSocketService.userId !== userInfo.用户ID) {
          WebSocketService.close();
          WebSocketService.init(userInfo.用户ID);
        }
      } else {
        console.warn("User info from API is missing ID or username:", response);
        // 清理本地存储和状态
        // logout(); // 调用 logout 可能会导致循环或意外行为，直接清理
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('userAvatar');
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('userId');
        store.dispatch('user/logoutUser');
        isLoggedIn.value = false;
        username.value = '';
        avatarUrl.value = null;
        isAdmin.value = false;
      }
    } catch (error) {
      console.error("Failed to fetch user info:", error);
      // Don't logout on fetch failure, token might still be valid for other things
      // or it's a temporary network issue.
      // logout(); // Avoid aggressive logout
    }
  } else {
    isLoggedIn.value = false; // Ensure loggedIn state is false if no token
  }
};

// 重置登录状态的辅助函数
const resetLoginState = (isExplicitLogout = false) => { // 增加 isExplicitLogout 参数，默认为 false
    isLoggedIn.value = false;
    username.value = '';
    avatarUrl.value = null;
    isAdmin.value = false;
    localStorage.removeItem('token');
    localStorage.removeItem('refresh');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    localStorage.removeItem('is_staff');
    localStorage.removeItem('is_verified');
    WebSocketService.close();
    store.dispatch('user/logout', { inStoreLogout: isExplicitLogout }); // 根据 isExplicitLogout 调用
};

// 登录成功的处理函数 (由 LoginView 调用)
const handleLoginSuccess = () => {
  fetchUserInfo();
};

// 登出处理函数
const handleLogout = () => {
  resetLoginState(true); // 用户主动登出，传递 true
  // router.push('/login'); // 由 Vuex action 处理导航
};

// 路由跳转函数
const navigateTo = (path) => {
  router.push(path);
};

// 菜单选择事件 (主要用于处理下拉菜单)
const handleCommand = (command) => {
  switch (command) {
    case 'profile':
      navigateTo('/profile');
      break;
    case 'change-password':
      ElMessage.info("修改密码功能待实现");
      break;
    case 'admin':
      navigateTo('/admin');
      break;
    case 'logout':
      handleLogout();
      break;
  }
};

// 监听路由变化，在进入非公共路由时检查并获取用户信息
watch(
  () => route.path,
  (newPath) => {
    const publicPaths = ['/login', '/register', '/verify-email', '/admin/login']; // 包含管理员登录页
    if (!publicPaths.includes(newPath)) {
      // console.log("TopNav: Route changed to non-public path, fetching user info.");
      fetchUserInfo();
    } else {
      // console.log("TopNav: Route changed to public path, resetting login state if necessary.");
      // 如果当前在公共页面，确保前端显示未登录状态（如果实际未登录）
      // 但是不清除 token，因为路由守卫会在需要时处理重定向和 token 检查
      // 只需同步一下 isLoggedIn 状态即可，fetchUserInfo 会在需要时清除 token
       if (!localStorage.getItem('token')) {
           isLoggedIn.value = false;
           username.value = '';
           avatarUrl.value = null;
           isAdmin.value = false;
       }
    }
  },
  { immediate: true } // 立即执行一次
);

// TODO: 实现未读消息和通知数量的获取和显示
const unreadMessageCount = ref(0);
const unreadNotificationCount = ref(0);
</script>

<template>
  <el-menu
      :default-active="route.path"
      :ellipsis="false"
      class="top-navigation-bar"
      mode="horizontal"
      router
  >
    <div class="navbar-left">
       <img src="/src/assets/思源淘.png" alt="思源淘 Logo" class="logo-img">
       <span class="site-name">思源淘</span>
    </div>

    <div class="navbar-right">
      <template v-if="!isLoggedIn">
         <el-button text @click="navigateTo('/login')" class="nav-link-button">登录</el-button>
         <el-button type="primary" @click="navigateTo('/register')" class="nav-register-button">注册</el-button>
      </template>

      <template v-else>
         <!-- 将发布商品按钮改为图标+文字 -->
         <!-- <div class="nav-item-with-text" @click="navigateTo('/publish')">
           <el-icon class="nav-icon"><Box /></el-icon>
           <span class="nav-text">发布</span>
         </div> -->

        <!-- 移除个人中心和我的发布图标 -->
        <!-- <el-icon class="nav-icon" @click="navigateTo('/profile')"><User /></el-icon> -->
        <!-- <el-icon class="nav-icon" @click="navigateTo('/profile/my-products')"><Goods /></el-icon> -->

        <div class="nav-item-with-text" @click="navigateTo('/message')">
          <el-badge :value="unreadMessageCount" :hidden="unreadMessageCount === 0" class="message-badge">
             <el-icon class="nav-icon"><ChatLineRound /></el-icon>
          </el-badge>
          <span class="nav-text">消息</span>
        </div>

        <div class="nav-item-with-text" @click="navigateTo('/notifications')">
          <el-badge :value="unreadNotificationCount" :hidden="unreadNotificationCount === 0" class="notification-badge">
             <el-icon class="nav-icon"><Bell /></el-icon>
          </el-badge>
          <span class="nav-text">通知</span>
        </div>

        <el-dropdown trigger="click" @command="handleCommand">
          <span class="el-dropdown-link">
            <el-avatar v-if="!avatarUrl" :size="32" class="user-avatar">{{ avatar_char }}</el-avatar>
            <el-avatar v-else :size="32" :src="avatarUrl" class="user-avatar"></el-avatar>
            <span class="username">{{ username }}</span>
            <el-icon class="el-icon--right"><arrow-down /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <!-- 保留个人中心 -->
              <el-dropdown-item command="profile"><el-icon><User /></el-icon>个人中心</el-dropdown-item>
              <!-- 以下扁平化路径的菜单项已移至侧边栏，从顶部下拉菜单中移除 -->
              <!-- <el-dropdown-item command="my-products"><el-icon><Goods /></el-icon>我的发布</el-dropdown-item> -->
              <!-- <el-dropdown-item command="my-orders"><el-icon><List /></el-icon>我的订单</el-dropdown-item> -->
              <!-- <el-dropdown-item command="my-favorites"><el-icon><Star /></el-icon>我的收藏</el-dropdown-item> -->
              <!-- <el-dropdown-item command="my-messages"><el-icon><ChatLineRound /></el-icon>我的消息</el-dropdown-item> -->
              <el-dropdown-item command="change-password"><el-icon><Lock /></el-icon>修改密码</el-dropdown-item>
              <el-dropdown-item v-if="isAdmin" command="admin" divided><el-icon><Setting /></el-icon>管理后台</el-dropdown-item>
              <el-dropdown-item command="logout" divided><el-icon><Switch /></el-icon>退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>
    </div>
  </el-menu>
</template>

<style scoped>
.top-navigation-bar {
  height: 60px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  background-color: #ffffff;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.04);
  position: fixed;
  width: 100%;
  top: 0;
  left: 0;
  z-index: 1000;
}

.navbar-left,
.navbar-center,
.navbar-right {
  display: flex;
  align-items: center;
}

.navbar-left {
  flex-shrink: 0;
  margin-right: 30px;
  /* cursor: pointer; */ /* Remove cursor pointer */
}

.logo-img {
  height: 40px;
  margin-right: 10px;
}

.site-name {
  font-size: 20px;
  font-weight: bold;
  color: #357ABD;
}

.navbar-center {
  flex-grow: 1;
  max-width: 600px;
  margin: 0 30px;
}

.search-input {
  margin-right: 10px;
}

.search-button {
    background-color: #F5A623;
    border-color: #F5A623;
}

.search-button:hover {
    background-color: #E0951C;
    border-color: #E0951C;
}

.navbar-right {
  flex-shrink: 0;
  margin-left: auto;
}

.nav-link-button {
    color: #4A90E2;
    margin-right: 15px;
    font-size: 15px;
}

.nav-link-button:hover {
    color: #357ABD;
}

.nav-register-button {
    background-color: #4A90E2;
    border-color: #4A90E2;
    font-size: 15px;
}

.nav-register-button:hover {
    background-color: #357ABD;
    border-color: #357ABD;
}

.publish-button {
    /* Remove button specific styles */
    /* background-color: #67C23A;
    border-color: #67C23A;
    margin-right: 20px;
     font-size: 15px; */
    /* display: none; */ /* Hide the original button element */
}

/* 移除发布商品图标+文字的样式 */
.nav-item-with-text:has(.el-icon-box) {
  display: none;
}

.nav-icon {
  font-size: 24px;
  color: #606266;
  /* margin: 0 15px; */ /* Adjust margin */
  cursor: pointer;
  transition: color 0.3s ease;
}

.nav-icon:hover {
    color: #357ABD;
}

.message-badge,
.notification-badge {
  /* margin: 0 15px; */ /* Adjust margin */
  margin-right: 5px; /* Add some space between icon badge and text */
}

.nav-item-with-text {
  display: flex;
  flex-direction: row; /* Stack icon and text */
  align-items: center; /* Center horizontally */
  margin: 0 15px;
  cursor: pointer;
}

.nav-text {
  font-size: 12px; /* Smaller text size */
  color: #606266; /* Match icon color */
  /* margin-top: 2px; */ /* Space between icon and text */
}

.user-avatar {
  margin-right: 8px;
  background-color: #4A90E2;
  color: #fff;
}

.el-dropdown-link {
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-left: 15px;
}

.username {
  font-size: 15px;
  color: #303133;
  margin-right: 5px;
}

.top-navigation-bar.el-menu--horizontal > .el-menu-item.is-active {
    border-bottom: 2px solid #4A90E2;
    color: #4A90E2;
}

.top-navigation-bar.el-menu--horizontal > .el-menu-item:not(.is-disabled):hover,
.top-navigation-bar.el-menu--horizontal > .el-menu-item:not(.is-disabled):focus {
    background-color: #F8F9FA;
    color: #357ABD;
}

.top-navigation-bar .el-menu-item,
.top-navigation-bar .el-sub-menu {
    display: none;
}

.top-navigation-bar .navbar-left {
    display: flex;
}

.top-navigation-bar .navbar-center {
    display: flex;
}

.top-navigation-bar .navbar-right {
    display: flex;
}

</style>
