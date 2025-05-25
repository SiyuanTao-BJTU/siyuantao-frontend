import { createRouter, createWebHistory } from 'vue-router'

// 假设您的 Vuex store 实例
import store from '@/store'; // 请根据您的实际情况导入 store

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // 将根路径 / 重定向到 /products，作为商品浏览主入口
    {
      path: '/',
      redirect: '/products',
      meta: { requiresAuth: true }
    },
    { // 商品浏览主页，所有商品列表 (原 /products)
      path: '/products',
      name: 'ProductList',
      component: () => import('@/product/views/HomeView.vue'),
      meta: { requiresAuth: true }
    },
    { // 商品详情页
      path: '/item/:itemId',
      name: 'item-info',
      component: () => import('@/product/views/ItemInfoView.vue'),
      meta: { requiresAuth: true }
    },
    { // 交易记录页面 (保留原路径，如果需要也可以扁平化)
      path: '/transactions',
      name: 'Transactions',
      component: () => import('@/order/views/TransactionView.vue'),
      meta: { requiresAuth: true }
    },
    { // 扁平化个人中心子功能路由
      path: '/my-products',
      name: 'my-products',
      component: () => import('@/user/views/profile/SellView.vue'),
      meta: { requiresAuth: true }
    },
    { // 我的订单页面 (原 /profile/my-orders)
      path: '/orders',
      name: 'my-orders',
      component: () => import('@/user/views/profile/PurchaseInfo.vue'),
      meta: { requiresAuth: true }
    },
    { // 我的收藏页面 (原 /profile/my-favorites)
      path: '/favorites',
      name: 'my-favorites',
      component: () => import('@/user/views/profile/UserFavoritesView.vue'),
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
    { // 其他用户信息界面 (通过搜索等方式查看，路径不变)
      path: '/profile/:username',
      name: 'profileSearch',
      component: () => import('@/user/views/profile/ProfileSearchView.vue'),
      meta: { requiresAuth: true }
    },
    { // 偏好设置页面 (保留原路径)
      path: '/settings',
      name: 'settings',
      component: () => import('@/user/views/profile/SettingsDialog.vue'),
      meta: { requiresAuth: true }
    },
    { // 发布商品页面 (保留原路径)
      path: '/publish',
      name: 'publish',
      component: () => import('@/product/views/PublishProductView.vue'),
      meta: { requiresAuth: true }
    },
    // TODO: 修改密码页面可以在个人中心页面通过弹窗处理，无需单独路由
    // {
    //   path: '/profile/change-password',
    //   name: 'change-password',
    //   component: () => import('@/user/views/profile/ChangePasswordView.vue'),
    //   meta: { hideNavbar: true, requiresAuth: true }
    // },

    // 独立页面，不显示导航栏 (hideNavbar: true)
    {
      path: '/login',
      name: 'login',
      component: () => import('@/user/views/auth/LoginView.vue'),
      meta: { hideNavbar: true }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/user/views/auth/RegisterView.vue'),
      meta: { hideNavbar: true }
    },
    {
      path: '/verify-email',
      name: 'verify-email',
      component: () => import('@/user/views/auth/EmailVerificationView.vue'),
      meta: { hideNavbar: true }
    },
    {
      path: '/admin/login',
      name: 'admin-login',
      component: () => import('@/admin/views/AuthView.vue'),
      meta: { hideNavbar: true }
    },

    // 管理员后台布局 (requiresAdminLayout: true)
    {
      path: '/admin',
      component: () => import('@/admin/layouts/AdminLayout.vue'), // 使用 AdminLayout 作为布局组件
      redirect: '/admin/dashboard', // 默认跳转到仪表盘
      meta: { requiresAdminLayout: true, requiresAuth: true, requiresAdmin: true }, // 需要管理员布局、登录和管理员权限
      children: [
        {
          path: 'dashboard',
          name: 'AdminDashboard',
          component: () => import('@/admin/views/DashboardView.vue'),
          meta: { title: '仪表盘概览', requiresAuth: true, requiresAdmin: true } // 子路由也继承或覆盖 meta
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
          component: () => import('@/admin/views/ProductAuditView.vue'),
          meta: { title: '商品审核', requiresAuth: true, requiresAdmin: true }
        },
        {
          path: 'returns',
          name: 'AdminReturnManagement',
          component: () => import('@/admin/views/ReturnManagementView.vue'),
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
          component: () => import('@/admin/views/NotificationSendView.vue'),
          meta: { title: '系统通知发送', requiresAuth: true, requiresAdmin: true }
        },
        {
          path: 'permissions',
          name: 'AdminPermissionManagement',
          component: () => import('@/admin/views/PermissionManagementView.vue'),
          meta: { requiresSuperAdmin: true, title: '权限管理', requiresAuth: true, requiresAdmin: true } // 仅超级管理员可访问
        },
        // TODO: 添加其他管理员后台的子路由
      ]
    },

    // 404 Not Found 页面
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/views/NotFound.vue')
      // meta: { hideNavbar: true } // 404 页面是否隐藏导航栏根据需求定
    }
  ]
})

// 路由导航守卫
router.beforeEach(async (to, from, next) => {
  const isLoggedIn = store.getters['user/isAuthenticated'];
  const isAdmin = store.state.user.userInfo?.is_staff === true;

  // 尝试在每次路由跳转前获取用户信息，这也会更新登录状态
  // 避免在登录页、注册页、邮箱验证页、管理员登录页触发 fetchUserInfo
  const publicAuthPages = ['/login', '/register', '/verify-email', '/admin/login'];
  if (!publicAuthPages.includes(to.path)) {
     // 如果 store 中没有用户信息或者未登录，尝试获取
     if (!isLoggedIn || !store.state.user.userInfo) {
        try {
            await store.dispatch('user/fetchUserInfo');
            // 重新检查登录状态，fetchUserInfo 成功后 isLoggedIn 应该为 true
            if (store.getters['user/isAuthenticated']) {
               // 用户已登录，继续导航
               // 检查是否是需要管理员权限的页面，如果不是管理员则重定向
               if (to.meta.requiresAdmin && !store.state.user.userInfo?.is_staff) {
                   ElMessage.error('您没有权限访问此页面');
                   return next(from.fullPath || '/'); // 重定向回上一页或首页
               }
               // 如果是管理员，检查是否需要超级管理员权限
               if (to.meta.requiresSuperAdmin && !store.state.user.userInfo?.is_superuser) { // 假设超级管理员字段是 is_superuser
                   ElMessage.error('您没有超级管理员权限访问此页面');
                   return next(from.fullPath || '/admin/dashboard'); // 重定向回上一页或管理员首页
               }
               next();
            } else {
               // fetchUserInfo 未能成功登录（例如 token 无效），重定向到登录页
               localStorage.removeItem('token');
               localStorage.removeItem('userId');
               localStorage.removeItem('username');
               // 只有当目标页面需要认证时才重定向到登录页
               if (to.meta.requiresAuth) {
                  ElMessage.error('登录已过期，请重新登录');
                  return next('/login');
               } else {
                  next(); // 目标页面不需要认证，允许访问
               }
            }

        } catch (error) {
            console.error("Failed to fetch user info in router guard:", error);
            // 获取用户信息失败（网络错误或其他），清除登录状态并重定向
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            localStorage.removeItem('username');
            if (to.meta.requiresAuth) {
               ElMessage.error('获取用户信息失败或登录已过期，请重新登录');
               return next('/login');
            } else {
               next(); // 目标页面不需要认证，允许访问
            }
        }
     } else { // 用户信息已存在且已登录
         // 检查是否是需要管理员权限的页面，如果不是管理员则重定向
         if (to.meta.requiresAdmin && !isAdmin) {
             ElMessage.error('您没有权限访问此页面');
             return next(from.fullPath || '/'); // 重定向回上一页或首页
         }
          // 如果是管理员，检查是否需要超级管理员权限
         if (to.meta.requiresSuperAdmin && !store.state.user.userInfo?.is_superuser) { // 假设超级管理员字段是 is_superuser
             ElMessage.error('您没有超级管理员权限访问此页面');
             return next(from.fullPath || '/admin/dashboard'); // 重定向回上一页或管理员首页
         }
         next(); // 已登录且权限符合，继续导航
     }
  } else { // 当前是公共认证页面
     // 如果已经登录，并且尝试访问登录、注册、邮箱验证、管理员登录页，则重定向到首页或管理员后台
     if (isLoggedIn && (to.path === '/login' || to.path === '/register' || to.path === '/verify-email')) {
       return next('/home');
     }
     if (isAdmin && to.path === '/admin/login') {
       return next('/admin/dashboard');
     }
     next(); // 未登录或目标是允许访问的公共页面，继续导航
  }
});

export default router
