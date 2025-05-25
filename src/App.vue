<script setup>
import { ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import TopNavigationBar from '@/components/TopNavigationBar.vue';
import { HomeFilled, Files, Menu, ShoppingBag, Money, Setting, Upload, Back,
  Expand, Fold, ChatLineRound, Star, List, UserFilled, Box } from "@element-plus/icons-vue";

const route = useRoute();
const activeMenu = computed(() => route.path);

// 前台侧边导航菜单数据源 - 按照新的职责排序和包含内容
const commonNavMenus = [
  { path: '/products', title: '首页', icon: ShoppingBag }, // 主商品浏览入口
  { path: '/publish', title: '发布商品', icon: Box }, // 核心高频操作
  { path: '/messages', title: '我的消息', icon: ChatLineRound }, // 个人管理模块
  { path: '/orders', title: '我的订单', icon: List }, // 个人管理模块
  { path: '/favorites', title: '我的收藏', icon: Star }, // 个人管理模块
  { path: '/my-products', title: '我的发布', icon: Upload }, // 个人管理模块
  { path: '/transactions', title: '交易记录', icon: Money }, // 个人管理模块
  { path: '/profile', title: '个人中心', icon: UserFilled }, // 辅助功能
  { path: '/settings', title: '偏好设置', icon: Setting }, // 辅助功能
  { path: '/logout', title: '登出', icon: Back }, // 辅助功能
];

// 可选：侧边栏折叠功能 (如果你需要)
const isSidebarCollapsed = ref(false);
const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
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
          <el-aside width="200px" class="common-aside">
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
              </div>

              <template v-for="menuItem in commonNavMenus" :key="menuItem.path">
                <el-menu-item :index="menuItem.path">
                  <el-icon><component :is="menuItem.icon" /></el-icon>
                  <span>{{ menuItem.title }}</span>
                </el-menu-item>
              </template>
            </el-menu>
          </el-aside>

          <el-main class="common-main-content">
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

/* 整个布局容器 */
.common-layout-container {
  min-height: 100vh;
}

/* 顶部 Header 样式 */
.common-header {
  height: 60px;
  padding: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
  background-color: #ffffff;
  border-right: 1px solid #e6e6e6;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
  padding-top: 20px;
  overflow-x: hidden;
}

.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 200px;
  min-height: 400px;
}

.el-menu-vertical-demo {
  border-right: none;
}

.el-menu-item {
  height: 50px;
  line-height: 50px;
  font-size: 16px;
  padding-left: 20px !important;
}

.el-menu-item.is-active {
  /* 调整选中项背景色和文字颜色，与强调蓝色更协调 */
  background-color: #E6F0FF !important; /* 浅蓝色背景 */
  color: #4A90E2 !important; /* 强调蓝色文字 */
  border-right: 3px solid #4A90E2; /* 强调蓝色边框 */
}

.el-menu-item:hover {
  background-color: #F5F5F5 !important;
  color: #4A90E2 !important;
}

.el-menu-item .el-icon {
  margin-right: 10px;
  font-size: 20px;
  color: #606266; /* 默认图标颜色 */
}

.el-menu-item.is-active .el-icon {
  color: #4A90E2; /* 选中时图标颜色为强调蓝色 */
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

/* Main 内容区域样式 */
.common-main-content {
  background-color: #f5f7fa; /* 浅灰色背景 */
  padding: 20px;
  overflow-y: auto;
  width: 100%;
  box-sizing: border-box;
}
</style>
