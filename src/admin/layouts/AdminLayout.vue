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
        <span class="admin-info">当前权限：{{ userRole === 'super_admin' ? '超级管理员' : '管理员' }}</span>
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
          @select="handleMenuItemClick"
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
import { Odometer, User, Box, RefreshLeft, Warning, Bell, Setting, ArrowDown, Expand, Fold, ArrowLeftBold, Document, Star, ChatDotRound } from '@element-plus/icons-vue';

export default defineComponent({
  name: 'AdminLayout',
  components: { // 注册图标组件
     Odometer, User, Box, RefreshLeft, Warning, Bell, Setting, ArrowDown, Expand, Fold, ArrowLeftBold, Document, Star, ChatDotRound
  },
  setup() {
    const store = useStore();
    const router = useRouter();
    const route = useRoute();

    // 从 Vuex 获取管理员信息和权限
    // 请根据你的 Vuex Store 结构调整这里的 getter
    // 假设用户信息在 store.state.user.userInfo，isAdmin 在 store.getters.isAdmin
    const adminUserName = computed(() => store.state.user.userInfo?.username || '管理员');
    const userRole = computed(() => store.getters['user/userRole']); // Get the user's role

    // 控制侧边栏选中状态
    // 使用 computed 属性动态计算当前激活的菜单项
    const activeMenu = computed(() => route.path);

    // 侧边栏菜单数据源
    // 添加 iconComponent 属性，值为导入的图标组件
    const adminMenus = [
      { path: '/admin/dashboard', title: '仪表盘概览', iconComponent: Odometer, roles: ['admin', 'super_admin'] },
      { path: '/admin/users', title: '用户管理', iconComponent: User, roles: ['admin', 'super_admin'] },
      { path: '/admin/products-audit', title: '商品管理', iconComponent: Box, roles: ['admin', 'super_admin'] },
      { path: '/admin/orders', title: '订单管理', iconComponent: Document, roles: ['admin', 'super_admin'] },  
      { path: '/admin/evaluations', title: '评价管理', iconComponent: Star, roles: ['admin', 'super_admin'] }, 
      { path: '/admin/chat', title: '聊天管理', iconComponent: ChatDotRound, roles: ['admin', 'super_admin'] },
      { path: '/admin/returns', title: '退货申请管理', iconComponent: RefreshLeft, roles: ['admin', 'super_admin'] },
      { path: '/admin/reports', title: '举报管理', iconComponent: Warning, roles: ['admin', 'super_admin'] },
      { path: '/admin/notifications', title: '通知管理', iconComponent: Bell, roles: ['admin', 'super_admin'] },
      { path: '/admin/permissions', title: '权限管理', iconComponent: Setting, roles: ['super_admin'] }, // 仅超级管理员可见
      { path: 'back-to-user', title: '前往平台', iconComponent: ArrowLeftBold, roles: ['admin', 'super_admin'] },
    ];

    // 根据权限过滤菜单项
    const filteredAdminMenus = computed(() => {
      // Use the userRole getter to determine the current user's role
      const currentUserRole = userRole.value; // Get the computed role
      return adminMenus.filter(item => item.roles.includes(currentUserRole));
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

    // 处理侧边栏菜单点击事件
    const handleMenuItemClick = (path) => {
      if (path === 'back-to-user') {
        const previousPath = localStorage.getItem('previousUserPath');
        if (previousPath && previousPath !== '/admin/login') { // 避免返回到管理员登录页
          router.push(previousPath);
        } else {
          router.push('/products'); // 默认返回商品列表页
        }
      } else {
        router.push(path);
      }
    };

    // 可选：侧边栏折叠功能
    const isCollapse = ref(false); // 初始为展开
    const toggleCollapse = () => {
      isCollapse.value = !isCollapse.value;
    };

    return {
      adminUserName,
      userRole, // Expose userRole for template
      activeMenu,
      filteredAdminMenus,
      handleCommand,
      handleMenuItemClick,
      isCollapse,
      toggleCollapse,
    };
  },
});
</script>

<style scoped>
.admin-layout-container {
  min-height: 100vh;
  /* Set the overall background color for the admin area */
  background-color: #F8F9FA; /* Light gray background */
}

.admin-header {
  background-color: #fff; /* White background */
  color: var(--el-text-color-primary);
  line-height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  /* Updated box-shadow for a more subtle effect */
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.04);
  padding: 0 20px; /* Adjust padding */
  height: 60px; /* Explicit height */
  position: fixed; /* Keep header fixed */
  width: 100%; /* Full width */
  top: 0;
  left: 0;
  z-index: 1000; /* Ensure it's above other content */
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px; /* Logo 和标题之间的间距 */
}

.admin-logo {
  height: 40px; /* 调整 Logo 大小 */
}

.admin-title {
  font-size: 20px;
  font-weight: bold;
  color: #333; /* 标题颜色 */
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px; /* 右侧元素之间的间距 */
}

.admin-info {
  font-size: 14px;
  color: #666;
}

.admin-user-name {
  cursor: pointer;
  color: var(--el-color-primary);
  display: flex;
  align-items: center;
}

.admin-content-wrapper {
  flex-grow: 1;
  /* Add margin-top to be below the fixed header */
  margin-top: 60px;
  display: flex; /* Use flexbox for aside and main content */
}

.admin-aside {
  background-color: #304156; /* Sidebar background color - keep dark for admin? or change based on plan? Plan says light gray. */
  /* Changing to light gray as per plan */
   background-color: #F8F9FA; /* Or #F5F7FA */
  color: #bfcbd9; /* Text color - will need adjustment for light background */
  /* Adjusting text/icon colors for light background */
   color: #303133; /* Dark text */
  transition: width 0.3s ease-in-out; /* Add width transition */
  box-shadow: 2px 0 6px rgba(0,0,0,0.05); /* Subtle shadow */
  position: fixed; /* Fixed position */
  top: 60px; /* Position below header */
  left: 0;
  bottom: 0; /* Extend to bottom */
  overflow-y: auto; /* Add scrolling if content exceeds height */
  z-index: 999; /* Below header */
}

.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 200px; /* Default width */
  min-height: 400px;
}

.el-menu-vertical-demo {
  border-right: none; /* Remove Element Plus default border */
  /* Ensure menu background is transparent if aside has background */
  background-color: transparent;
}

/* Adjust menu item styles for light background */
.el-menu-item {
   color: #303133 !important; /* Default item text */
}

.el-menu-item i { /* Targeting icons */
   color: #606266 !important; /* Default icon color */
}


.el-menu-item.is-active {
  background-color: #E6F2FF !important; /* Very light primary blue background */
  color: #357ABD !important; /* Slightly darker Primary Blue text */
}

.el-menu-item.is-active i { /* Targeting active icons */
   color: #357ABD !important; /* Active icon color */
}


.el-menu-item:hover {
  background-color: #F0F4F8 !important; /* Slightly darker light gray on hover */
  color: #357ABD !important;
}

.el-menu-item:hover i { /* Targeting hover icons */
   color: #357ABD !important;
}


.admin-main-content {
  background-color: #ffffff; /* White background for main content */
  padding: 24px; /* Consistent padding */
  flex-grow: 1; /* Allows content to take available space */
  overflow-y: auto; /* Add scrolling */
  /* Add margin-left to make space for the fixed sidebar */
  margin-left: 200px; /* Initial margin matching sidebar width */
  /* Add transition for margin-left */
  transition: margin-left 0.3s ease-in-out;
}

/* Style adjustment when sidebar is collapsed */
/* You will need JS to toggle a class on the parent container or body */
/* Example: .admin-layout-container.collapsed .admin-aside { width: 64px; } */
/* Example: .admin-layout-container.collapsed .admin-main-content { margin-left: 64px; } */

/* 可选：侧边栏折叠按钮样式 */
/*
.collapse-button {
  margin-left: 20px;
}
*/

</style>

<style>
/* 导入公共样式 - Ensure common card styles are handled */
/* @import '../styles/admin-common.css'; */ /* Keep existing imports */

/* Adding global card styles that apply within this layout scope */
/* These might ideally go into a global theme file or admin-common.css */
.el-card {
  background-color: #FFFFFF; /* White background */
  border-radius: 8px; /* Rounded corners */
  /* Subtle box-shadow */
  box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.04);
  border: none; /* Remove default border */
}

.el-card__body {
  padding: 20px; /* Generous internal padding */
}
</style> 