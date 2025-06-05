import { createRouter, createWebHistory } from 'vue-router'
import store from '@/store'; // 直接导入 store 实例
import { ElMessage } from 'element-plus'; // 确保 ElMessage 被导入
import NProgress from 'nprogress'; // 导入 NProgress
import 'nprogress/nprogress.css'; // 导入 NProgress 样式

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // 将根路径 / 重定向到 /products，作为商品浏览主入口
    {
      path: '/',
      redirect: to => {
        const isAuthenticated = localStorage.getItem("token");
        const userRole = store.getters['user/userRole']; // Get role from store

        if (isAuthenticated) {
          const lastVisitedPath = localStorage.getItem('lastVisitedPath');
          if (lastVisitedPath && lastVisitedPath !== '/login' && !lastVisitedPath.startsWith('/login')) {
            return lastVisitedPath;
          }
          if (userRole === 'admin' || userRole === 'super_admin') {
            return '/admin/dashboard'; // If authenticated and admin, go to admin dashboard
          }
          return '/products'; // If authenticated but not admin, go to products page
        } else {
          return '/login'; // If not authenticated, go to login page
        }
      },
    },
    { // 商品浏览主页，所有商品列表
      path: '/products',
      name: 'ProductList',
      component: () => import('@/product/views/HomeView.vue'),
      meta: { requiresAuth: true }
    },    
    { // 我的发布页面
      path: '/my-products',
      name: 'MyProductView',
      component: () => import('@/product/views/MyProductView.vue'),
      meta: { requiresAuth: true }
    },
    { // 我的订单页面
      path: '/orders',
      name: 'my-orders',
      component: () => import('@/order/views/OrdersView.vue'),
      meta: { requiresAuth: true }
    },
    { // 我的收藏页面 
      path: '/favorites',
      name: 'my-favorites',
      component: () => import('@/product/views/UserFavoritesView.vue'),
      meta: { requiresAuth: true }
    },
    { // 我的评价页面
      path: '/my-evaluations',
      name: 'my-evaluations',
      component: () => import('@/evaluation/views/MyEvaluationsView.vue'),
      meta: { requiresAuth: true }
    },
    { // 我的消息页面 (原 /message)
      path: '/messages',
      name: 'messages',
      component: () => import('@/chat/views/MessageView.vue'),
      meta: { requiresAuth: true }
    },
    { // 个人中心概览页 (保留原路径)
      path: '/profile',
      name: 'profile',
      component: () => import('@/user/views/profile/ProfileView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/user/views/auth/LoginView.vue'),
      meta: { requiresAuth: false, title: '思源淘 - 登录/注册', hideNavbar: true }
    },
    {
      path: '/email-verification',
      name: 'email-verification',
      component: () => import('@/user/views/auth/EmailVerificationView.vue'),
      meta: { requiresAuth: false, title: '思源淘 - 邮箱验证' }
    },
    // 管理员后台布局 (requiresAdminLayout: true)
    {
      path: '/admin',
      component: () => import('@/admin/layouts/AdminLayout.vue'),
      redirect: '/admin/dashboard',
      meta: { requiresAdminLayout: true, requiresAuth: true, requiresAdmin: true },
      children: [
        {
          path: 'dashboard',
          name: 'AdminDashboard',
          component: () => import('@/admin/views/DashboardView.vue'),
          meta: { title: '仪表盘概览', requiresAuth: true, requiresAdmin: true }
        },
        {
          path: 'users',
          name: 'AdminUserManagement',
          component: () => import('@/admin/views/UserManagementView.vue'),
          meta: { title: '用户管理', requiresAuth: true, requiresAdmin: true }
        },
        {
          path: 'products-audit',
          name: 'AdminProductAudit',
          component: () => import('@/admin/views/ProductsAuditView.vue'),
          meta: { title: '商品审核', requiresAuth: true, requiresAdmin: true }
        },
        { 
          path: 'orders',
          name: 'AdminOrderManagement',
          component: () => import('@/admin/views/AdminOrdersView.vue'),
          meta: { title: '订单管理', requiresAuth: true, requiresAdmin: true }
        },
        { 
          path: 'evaluations',
          name: 'AdminEvaluationManagement',
          component: () => import('@/admin/views/AdminEvaluationsView.vue'),
          meta: { title: '评价管理', requiresAuth: true, requiresAdmin: true }
        },
        {
          path: 'chat',
          name: 'AdminChatManagement',
          component: () => import('@/admin/views/AdminChatView.vue'),
          meta: { title: '聊天管理', requiresAuth: true, requiresAdmin: true }
        },
        {
          path: 'returns',
          name: 'AdminReturnManagement',
          component: () => import ('@/admin/views/ReturnsManagementView.vue' ),
          meta: { title: '退货申请管理', requiresAuth: true, requiresAdmin: true }
        },
        {
          path: 'reports',
          name: 'AdminReportManagement',
          component: () => import('@/admin/views/ReportManagementView.vue'),
          meta: { title: '举报管理', requiresAuth: true, requiresAdmin: true }
        },
        {
          path: 'notifications',
          name: 'AdminNotificationSend',
          component: () => import('@/admin/views/NotificationManagementView.vue' ),
          meta: { title: '系统通知发送', requiresAuth: true, requiresAdmin: true }
        },
        {
          path: 'permissions',
          name: 'AdminPermissionManagement',
          component: () => import('@/admin/views/PermissionManagementView.vue'),
          meta: { requiresSuperAdmin: true, title: '权限管理', requiresAuth: true, requiresAdmin: true }
        },
      ]
    },
    // 404 Not Found 页面
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: { template: '<div>404 页面未找到 (占位符)</div>' }
    },
  ]
})

// 路由导航守卫
router.beforeEach(async (to, from, next) => {
  NProgress.start(); // 启动顶部进度条

  const token = localStorage.getItem('token');
  let userInfo = store.state.user.userInfo;
  let currentIsAuthenticated = !!token;

  // 如果 token 存在但 store 中没有用户信息，则尝试获取
  if (token && !userInfo) {
    try {
      userInfo = await store.dispatch('user/fetchCurrentUserProfile');
      currentIsAuthenticated = store.getters['user/isAuthenticated'];
    } catch (error) {
      console.warn('路由守卫: fetchUserInfo 失败', error);
      await store.dispatch('user/logout', { inStoreLogout: false });
      currentIsAuthenticated = false;
      userInfo = null; 

      if (to.meta.requiresAuth) {
         NProgress.done();
         ElMessage.error('会话已过期，请重新登录。');
         return next('/login');
      }
    }
  }

  // Requires authentication
  if (to.meta.requiresAuth && !currentIsAuthenticated) {
    ElMessage.warning('请先登录才能访问。');
    NProgress.done();
    return next('/login');
  }

  // Requires admin role
  if (to.meta.requiresAdmin) {
      if (!userInfo || (!userInfo.是否管理员 && !userInfo.是否超级管理员)) {
          ElMessage.error('您没有权限访问管理后台。');
          NProgress.done();
          return next('/products'); // Redirect to user home page
      }
  }

  // Requires super admin role
  if (to.meta.requiresSuperAdmin) {
      if (!userInfo || !userInfo.是否超级管理员) {
          ElMessage.error('您没有超级管理员权限访问此页面。');
          NProgress.done();
          return next('/admin/dashboard'); // Redirect to admin dashboard
      }
  }

  // Set document title
  if (to.meta.title) {
    document.title = to.meta.title + ' | 思源淘';
  } else {
    document.title = '思源淘';
  }

  next();
});

router.afterEach(() => {
  NProgress.done(); // 关闭顶部进度条
  // Clear 'wasInAdmin' if token is no longer present (e.g., after explicit logout)
  localStorage.removeItem('wasInAdmin'); // Ensure this is always removed if not explicitly handled elsewhere

  // Save last visited path if authenticated and not on a login page
  const token = localStorage.getItem('token');
  const currentPath = router.currentRoute.value.fullPath;
  if (token && currentPath !== '/login' && !currentPath.startsWith('/login')) {
    localStorage.setItem('lastVisitedPath', currentPath);
  }
});

export default router;