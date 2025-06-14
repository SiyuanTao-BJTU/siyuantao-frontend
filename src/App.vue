<script setup>
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import TopNavigationBar from '@/components/TopNavigationBar.vue';
import { HomeFilled, Files, Menu, ShoppingBag, Money, Setting, Upload, Back,
  Expand, Fold, ChatLineRound, Star, List, UserFilled, Box } from "@element-plus/icons-vue";
import { useStore } from 'vuex';

const route = useRoute();
const router = useRouter();
const store = useStore();
const activeMenu = computed(() => route.path);

// 前台侧边导航菜单数据源 - 按照新的职责排序和包含内容
const commonNavMenus = [
  { path: '/products', title: '首页', icon: ShoppingBag }, // 主商品浏览入口
  { path: '/my-products', title: '我的发布', icon: Upload }, // 商品模块
  { path: '/messages', title: '我的消息', icon: ChatLineRound }, // 消息模块
  { path: '/orders', title: '我的订单', icon: List }, // 订单模块
  { path: '/my-evaluations', title: '我的评价', icon: Files }, // 评价模块
  { path: '/favorites', title: '我的收藏', icon: Star }, // 收藏模块
  { path: '/profile', title: '个人中心', icon: UserFilled }, // 个人中心模块
  { path: '/settings', title: '偏好设置', icon: Setting }, // 辅助功能
];

// 可选：侧边栏折叠功能 (如果你需要)
const isSidebarCollapsed = ref(false);
const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
};

const handleLogout = () => {
  store.dispatch('user/logout');
};

// 监听路由变化，确保 activeMenu 正确更新
// watch(() => route.path, (newPath) => {
//   activeMenu.value = newPath;
// });

</script>

<template>
  <div id="app">
    <template v-if="$route.meta.hideNavbar">
      <router-view />
    </template>

    <template v-else-if="$route.meta.requiresAdminLayout">
      <router-view />
    </template>

    <template v-else>
      <el-container class="common-layout-container">
        <el-header class="common-header">
          <TopNavigationBar />
        </el-header>

        <el-container class="common-content-wrapper">
          <el-aside :width="isSidebarCollapsed ? '64px' : '200px'" class="common-aside">
            <el-menu
              :default-active="activeMenu"
              class="el-menu-vertical-demo"
              router
              background-color="#ffffff"
              text-color="#303133"
              active-text-color="#4A90E2"
              :collapse="isSidebarCollapsed"
            >
              <div class="sidebar-header">
                <el-icon @click="toggleSidebar" class="collapse-icon">
                  <component :is="isSidebarCollapsed ? Expand : Fold" />
                </el-icon>
              </div>

              <template v-for="menuItem in commonNavMenus" :key="menuItem.path">
                <el-menu-item :index="menuItem.path">
                  <el-icon><component :is="menuItem.icon" /></el-icon>
                  <span>{{ menuItem.title }}</span>
                </el-menu-item>
              </template>
              <el-menu-item index="/logout-action" @click="handleLogout">
                <el-icon><Back /></el-icon>
                <span>登出</span>
              </el-menu-item>
            </el-menu>
          </el-aside>

          <el-main class="common-main-content" :style="{ marginLeft: isSidebarCollapsed ? '64px' : '200px' }">
            <router-view />
          </el-main>
        </el-container>
      </el-container>
    </template>
  </div>
</template>

<style scoped>
#app {
  /* 设置更现代的字体栈 */
  font-family: 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50; /* 默认文字颜色，后续在组件中覆盖 */
}

/* Overall container */
.common-layout-container {
  min-height: 100vh;
  /* Use a very light gray background for the overall app */
  background-color: #F8F9FA; /* Or #F5F7FA */
}

/* 顶部 Header 样式 */
.common-header {
  height: 60px;
  padding: 0;
  /* Updated box-shadow for a more subtle effect */
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.04);
  z-index: 1000;
  background-color: #ffffff;
  position: fixed;
  width: 100%;
  top: 0;
  left: 0;
}

/* 左侧侧边栏和主内容区的容器 */
.common-content-wrapper {
  flex: 1;
  margin-top: 60px;
}

/* 左侧 Aside 侧边导航样式 */
.common-aside {
  /* Use a light gray background for the sidebar */
  background-color: #F8F9FA; /* Or #F5F7FA */
  border-right: 1px solid #e6e6e6; /* Keep a subtle border */
  /* Updated box-shadow for a more subtle effect */
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.03);
  padding-top: 20px;
  overflow-x: hidden;
  /* Ensure fixed positioning and full height from top 0 */
  position: fixed; /* Should be fixed to stay in place */
  top: 45px; /* Starts from the top edge */
  left: 0; /* Starts from the left edge */
  /* Adjust height to be viewport height minus header height */
  height: calc(100vh - 60px); /* Full viewport height */
  /* Add transition for width changes */
  transition: width 0.3s ease-in-out;
  z-index: 999; /* Below the fixed header */
}

.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 200px;
  min-height: 400px;
}

.el-menu-vertical-demo {
  border-right: none;
  /* Remove default Element Plus menu background if common-aside has one */
  background-color: transparent; /* Ensure menu background is transparent */
}

.el-menu-item {
  height: 50px;
  line-height: 50px;
  font-size: 16px;
  padding-left: 20px !important;
}

.el-menu-item.is-active {
  /* Adjust selected item background color and text color */
  background-color: #E6F2FF !important; /* Very light primary blue background */
  color: #357ABD !important; /* Slightly darker Primary Blue text */
  border-right: 3px solid #357ABD; /* Slightly darker Primary Blue border */
}

.el-menu-item:hover {
  background-color: #F0F4F8 !important; /* Slightly darker light gray on hover */
  color: #357ABD !important;
}

.el-menu-item .el-icon {
  margin-right: 10px;
  font-size: 20px;
  color: #606266; /* Default icon color */
}

.el-menu-item.is-active .el-icon {
  color: #357ABD; /* Selected icon color */
}

.sidebar-header {
  padding: 10px 20px;
  text-align: right;
}

.collapse-icon {
  font-size: 24px;
  cursor: pointer;
  color: #606266;
  margin-bottom: 10px;
}
.collapse-icon:hover {
  color: #4A90E2;
}

/* Main Content Area - wrapper for router-view */
.common-main-content {
  background-color: #ffffff; /* White background for content inside cards/views */
  padding: 24px; /* Consistent padding around content */
  overflow-y: auto;
  width: 100%;
  box-sizing: border-box;
  /* Add margin-left to make space for the fixed sidebar */
  margin-left: 200px; /* Initial margin matching sidebar width */
  /* Add transition for margin-left when sidebar collapses */
  transition: margin-left 0.3s ease-in-out;
  /* Adjust margin-top to be below the fixed header */
  margin-top: -30px;
}
</style>
