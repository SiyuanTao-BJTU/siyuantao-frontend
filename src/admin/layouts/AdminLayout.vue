<template>
  <el-container class="admin-layout-container">
    <el-header class="admin-header">
      <div class="header-left">
        <!-- 请确保 @/assets/logo.png 存在并是正确的 Logo 路径 -->
        <!-- <img src="@/assets/logo.png" alt="思源淘 Logo" class="admin-logo" /> -->
        <img src="/src/assets/思源淘.png" alt="思源淘 Logo" class="admin-logo" />
        <span class="admin-title">思源淘 管理后台</span>
      </div>
      <div class="header-right">
        <span class="admin-info">当前权限：{{ isAdmin ? '超级管理员' : '管理员' }}</span>
        <el-dropdown trigger="click" @command="handleCommand">
          <span class="el-dropdown-link admin-user-name">
            {{ adminUserName }}<el-icon class="el-icon--right"><arrow-down /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
         <!-- 可选：侧边栏折叠/展开按钮 -->
         <!-- <el-button @click="toggleCollapse" class="collapse-button">
           <el-icon v-if="isCollapse"><Expand /></el-icon>
           <el-icon v-else><Fold /></el-icon>
         </el-button> -->
      </div>
    </el-header>

    <el-container class="admin-content-wrapper">
      <el-aside :width="isCollapse ? '64px' : '200px'" class="admin-aside">
        <el-menu
          :default-active="activeMenu"
          class="el-menu-vertical-demo"
          router
          :collapse="isCollapse"
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#4A90E2"
        >
          <template v-for="menuItem in filteredAdminMenus" :key="menuItem.path">
            <!-- 考虑到菜单可能有多级，这里只实现二级菜单结构，如果需要多级，el-submenu 是必要的 -->
             <el-menu-item :index="menuItem.path">
              <el-icon><component :is="menuItem.iconComponent" /></el-icon>
              <span>{{ menuItem.title }}</span>
            </el-menu-item>
          </template>
        </el-menu>
      </el-aside>

      <el-main class="admin-main-content">
        <router-view /> 
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import { defineComponent, computed, ref } from 'vue'; // 引入 ref
import { useStore } from 'vuex'; // 假设使用 Vuex
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';

// 导入 Element Plus 图标组件
import { Odometer, User, Box, RefreshLeft, Warning, Bell, Setting, ArrowDown, Expand, Fold } from '@element-plus/icons-vue';

export default defineComponent({
  name: 'AdminLayout',
  components: { // 注册图标组件
     Odometer, User, Box, RefreshLeft, Warning, Bell, Setting, ArrowDown, Expand, Fold
  },
  setup() {
    const store = useStore();
    const router = useRouter();
    const route = useRoute();

    // 从 Vuex 获取管理员信息和权限
    // 请根据你的 Vuex Store 结构调整这里的 getter
    // 假设用户信息在 store.state.user.userInfo，isAdmin 在 store.getters.isAdmin
    const adminUserName = computed(() => store.state.user.userInfo?.username || '管理员');
    const isAdmin = computed(() => store.getters['user/isAdmin']); // 假设 isAdmin 是 user 模块的 getter

    // 控制侧边栏选中状态
    // 使用 computed 属性动态计算当前激活的菜单项
    const activeMenu = computed(() => route.path);

    // 侧边栏菜单数据源
    // 添加 iconComponent 属性，值为导入的图标组件
    const adminMenus = [
      { path: '/admin/dashboard', title: '仪表盘概览', iconComponent: Odometer, roles: ['admin', 'super_admin'] },
      { path: '/admin/users', title: '用户管理', iconComponent: User, roles: ['admin', 'super_admin'] },
      { path: '/admin/products-audit', title: '商品审核', iconComponent: Box, roles: ['admin', 'super_admin'] },
      { path: '/admin/returns', title: '退货申请管理', iconComponent: RefreshLeft, roles: ['admin', 'super_admin'] },
      { path: '/admin/reports', title: '举报管理', iconComponent: Warning, roles: ['admin', 'super_admin'] },
      { path: '/admin/notifications', title: '系统通知发送', iconComponent: Bell, roles: ['admin', 'super_admin'] },
      { path: '/admin/permissions', title: '权限管理', iconComponent: Setting, roles: ['super_admin'] }, // 仅超级管理员可见
    ];

    // 根据权限过滤菜单项
    const filteredAdminMenus = computed(() => {
      // 假设 isAdmin.value 为 true 表示超级管理员
      const userRole = isAdmin.value ? 'super_admin' : 'admin';
      return adminMenus.filter(item => item.roles.includes(userRole));
    });

    // 处理顶部下拉菜单命令
    const handleCommand = (command) => {
      if (command === 'logout') {
        // 调用 Vuex 的 logout action
        // 假设 logout action 存在于 user 模块
        store.dispatch('user/logout').then(() => {
             ElMessage.success('退出登录成功');
             router.push('/admin/login'); // 退出登录后跳转到管理员登录页
        }).catch(error => {
            console.error("Admin logout failed:", error);
            ElMessage.error('退出登录失败');
        });
      }
    };

    // 可选：侧边栏折叠功能
    const isCollapse = ref(false); // 初始为展开
    const toggleCollapse = () => {
      isCollapse.value = !isCollapse.value;
    };

    return {
      adminUserName,
      isAdmin,
      activeMenu,
      filteredAdminMenus,
      handleCommand,
      isCollapse,
      toggleCollapse,
    };
  },
});
</script>

<style scoped>
.admin-layout-container {
  height: 100vh;
  overflow: hidden; /* 确保子元素不会溢出 */
}

/* Header 样式 */
.admin-header {
  background-color: #ffffff; /* 白色背景 */
  color: #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e6e6e6; /* 底部细线 */
  height: 60px; /* 固定高度 */
  padding: 0 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08); /* 轻微阴影 */
  flex-shrink: 0; /* 防止被压缩 */
}

.header-left {
  display: flex;
  align-items: center;
}

.admin-logo {
  height: 32px; /* 调整 Logo 大小 */
  margin-right: 10px;
}

.admin-title {
  font-size: 20px;
  font-weight: bold;
  color: #4A90E2; /* 蓝色网站名称 */
}

.header-right {
  display: flex;
  align-items: center;
}

.admin-info {
  margin-right: 20px;
  font-size: 14px;
  color: #666;
}

.admin-user-name {
  cursor: pointer;
  color: #4A90E2; /* 蓝色用户名称 */
  font-weight: bold;
  display: flex; /* 使图标和文字对齐 */
  align-items: center;
}

/* Aside 侧边导航样式 */
.admin-content-wrapper {
  display: flex; /* 使用 flex 布局 */
  flex-direction: row; /* 子元素水平排列 */
  height: calc(100vh - 60px); /* 减去 header 的高度 */
}

.admin-aside {
  background-color: #304156; /* 深色侧边栏背景 */
  overflow-x: hidden; /* 防止溢出滚动条 */
   transition: width 0.3s ease; /* 添加宽度过渡动画 */
  flex-shrink: 0; /* 防止被压缩 */
}

.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 200px;
}

.el-menu-vertical-demo {
  border-right: none; /* 移除右侧边框 */
  height: 100%; /* 菜单高度充满侧边栏 */
}

.el-menu-item {
  color: #bfcbd9 !important; /* 默认文字颜色 */
}

.el-menu-item.is-active {
  background-color: #4A90E2 !important; /* 选中项背景色为蓝色 */
  color: #ffffff !important; /* 选中项文字为白色 */
}

.el-menu-item:hover {
  background-color: #4A90E250 !important; /* 悬停效果，稍透明的蓝色 */
}

/* Main 内容区域样式 */
.admin-main-content {
  background-color: #f0f2f5; /* 浅灰色内容背景 */
  padding: 20px;
  overflow-y: auto; /* 允许内容区域滚动 */
  flex-grow: 1; /* 填充剩余空间 */
}

.collapse-button {
   margin-left: 20px;
}
</style> 