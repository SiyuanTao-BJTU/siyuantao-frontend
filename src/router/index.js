import { createRouter, createWebHistory } from 'vue-router'

// 假设您的 Vuex store 实例
import store from '@/store'; // 请根据您的实际情况导入 store

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // 将根路径 / 重定向到 /products，作为商品浏览主入口
    {
      path: '/',
      redirect: to => {
        const isAuthenticated = localStorage.getItem("token");
        // const isLoggedIn = store.getters['user/isAuthenticated']; // Use localStorage for simplicity in redirect function
        if (isAuthenticated) {
          return '/products'; // If authenticated, go to products page
        } else {
          return '/login'; // If not authenticated, go to login page
        }
      },
      // meta: { requiresAuth: true } // Removed requiresAuth from root redirect as it's handled by the redirect function
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
  // Check if the route requires authentication
  if (to.meta.requiresAuth) {
    // Check if user is logged in by checking for token
    const isAuthenticated = localStorage.getItem("token");
    const isLoggedIn = store.getters['user/isAuthenticated']; // Also check store state

    // If not authenticated and not logged in via store state
    if (!isAuthenticated && !isLoggedIn) {
      // Redirect to login page
      ElMessage.error('请先登录才能访问此页面'); // Provide feedback
      return next('/login');
    }

    // If token exists but store state is not logged in, try to fetch user info
    if (isAuthenticated && !isLoggedIn) {
       try {
            await store.dispatch('user/fetchUserInfo');
            // After fetching, re-check if user is now logged in and has user info
            const updatedIsLoggedIn = store.getters['user/isAuthenticated'];
            const userInfo = store.state.user.userInfo;

            if (!updatedIsLoggedIn || !userInfo) {
                // Still not logged in after fetching, token might be invalid
                localStorage.removeItem('token');
                localStorage.removeItem('userId');
                localStorage.removeItem('username');
                ElMessage.error('登录已过期，请重新登录');
                return next('/login');
            }

            // Successfully logged in, proceed with permission checks
            const isAdmin = userInfo.is_staff === true;
            const isSuperAdmin = userInfo.is_superuser === true;

            if (to.meta.requiresAdmin && !isAdmin) {
                ElMessage.error('您没有权限访问此管理员页面');
                return next(from.fullPath || '/');
            }
            if (to.meta.requiresSuperAdmin && !isSuperAdmin) {
                ElMessage.error('您没有超级管理员权限访问此页面');
                return next(from.fullPath || '/admin/dashboard');
            }

            // User is authenticated and has required roles, proceed
            next();

        } catch (error) {
            console.error("Failed to fetch user info in router guard:", error);
            // Error fetching user info, assume token is invalid
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            localStorage.removeItem('username');
            ElMessage.error('获取用户信息失败或登录已过期，请重新登录');
            return next('/login');
        }
    } else {
       // User is already logged in (token exists and store state confirms)
       const userInfo = store.state.user.userInfo; // Get user info from store
       const isAdmin = userInfo?.is_staff === true;
       const isSuperAdmin = userInfo?.is_superuser === true;

       if (to.meta.requiresAdmin && !isAdmin) {
            ElMessage.error('您没有权限访问此管理员页面');
            return next(from.fullPath || '/');
        }
        if (to.meta.requiresSuperAdmin && !isSuperAdmin) {
            ElMessage.error('您没有超级管理员权限访问此页面');
            return next(from.fullPath || '/admin/dashboard');
        }

       // User is authenticated and has required roles, proceed
       next();
    }


  } else {
    // The route does NOT require authentication (it's a public page)
    const isAuthenticated = localStorage.getItem("token");
    const isLoggedIn = store.getters['user/isAuthenticated'];

    // If user is already logged in and trying to access login, register, or verify email page
    if ((isAuthenticated || isLoggedIn) && (to.path === '/login' || to.path === '/register' || to.path === '/verify-email')) {
        console.log("Already logged in, redirecting from auth page.");
        return next('/products'); // Redirect to home/products page
    }

    // If user is already logged in as admin and trying to access admin login
     if ((isAuthenticated || isLoggedIn) && to.path === '/admin/login') {
        const userInfo = store.state.user.userInfo;
        const isAdmin = userInfo?.is_staff === true;
        if (isAdmin) {
             console.log("Already logged in as admin, redirecting from admin login.");
             return next('/admin/dashboard'); // Redirect to admin dashboard
        }
     }

    // Otherwise, allow access to public page
    next();
  }
});

export default router
