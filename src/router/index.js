import { createRouter, createWebHistory } from 'vue-router'
import store from '@/store'; // 直接导入 store 实例
import { ElMessage } from 'element-plus'; // 确保 ElMessage 被导入
import NProgress from 'nprogress'; // 导入 NProgress
import 'nprogress/nprogress.css'; // 导入 NProgress 样式

// 静态导入 ProfileView，暂时解决动态加载问题
import ProfileView from '@/user/views/profile/ProfileView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // 将根路径 / 重定向到 /products，作为商品浏览主入口
    {
      path: '/',
      redirect: to => {
        const isAuthenticated = localStorage.getItem("token");
        if (isAuthenticated) {
          return '/products'; // If authenticated, go to products page
        } else {
          return '/login'; // If not authenticated, go to login page
        }
      },
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
      component: () => import('@/views/ItemInfoView.vue'),
      meta: { requiresAuth: true }
    },
    { // 交易记录页面 (保留原路径，如果需要也可以扁平化)
      path: '/transactions',
      name: 'Transactions',
      component: { template: '<div>交易记录页面</div>' },
      meta: { requiresAuth: true }
    },
    { // 扁平化个人中心子功能路由
      path: '/my-products',
      name: 'my-products',
      component: () => import('@/user/views/profile/UserProductsView.vue'),
      meta: { requiresAuth: true }
    },
    { // 我的订单页面 (原 /profile/my-orders)
      path: '/orders',
      name: 'my-orders',
      component: { template: '<div>我的订单页面 (占位符)</div>' },
      meta: { requiresAuth: true }
    },
    { // 我的收藏页面 (原 /profile/my-favorites)
      path: '/favorites',
      name: 'my-favorites',
      component: () => import('@/product/views/UserFavoritesView.vue'),
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
      component: ProfileView,
      meta: { requiresAuth: true }
    },
    { // 其他用户信息界面 (通过搜索等方式查看，路径不变)
      path: '/profile/:username',
      name: 'profileSearch',
      component: { template: '<div>用户资料搜索页面 (占位符)</div>' },
      meta: { requiresAuth: true }
    },
    { // 学生认证页面 (通过个人中心进入)
      path: '/profile/student-auth',
      name: 'StudentAuth',
      component: () => import('@/user/views/auth/EmailVerificationView.vue'),
      meta: { requiresAuth: true, title: '学生认证', hideNavbar: true }
    },
    { // 偏好设置页面 (保留原路径)
      path: '/settings',
      name: 'settings',
      component: { template: '<div>偏好设置页面 (占位符)</div>' },
      meta: { requiresAuth: true }
    },
    { // 发布商品页面 (保留原路径)
      path: '/publish',
      name: 'publish',
      component: () => import('@/product/views/ProductPostView.vue'),
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
      path: '/verify-email',
      name: 'verify-email',
      component: () => import('@/user/views/auth/EmailVerificationView.vue'),
      meta: { hideNavbar: true }
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
    }
  ]
})

// 路由导航守卫
router.beforeEach(async (to, from, next) => {
  NProgress.start(); // 启动顶部进度条

  // 在从非管理员页面进入管理员页面时保存用户端路径
  if (to.path.startsWith('/admin') && !from.path.startsWith('/admin')) {
    localStorage.setItem('previousUserPath', from.fullPath);
  }

  // 直接通过导入的 store 访问状态和 getters
  const isAuthenticated = store.getters['user/isAuthenticated'];
  const token = localStorage.getItem('token');

  // 尝试获取用户信息，如果 token 存在但 store 中没有用户信息
  if (token && !store.state.user.userInfo) {
    try {
      // 直接通过导入的 store 调用 dispatch
      await store.dispatch('user/fetchUserInfo');
    } catch (error) {
      console.warn('路由守卫: fetchUserInfo 失败', error);
      // 如果获取用户信息失败，清除本地 token 和 user info，视为未认证
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('username');
      localStorage.removeItem('is_staff');
      localStorage.removeItem('is_verified');
      // 如果当前路由需要认证，重定向到登录页
      if (to.meta.requiresAuth) {
         ElMessage.warning('用户信息获取失败或登录已过期，请重新登录');
         next({ name: 'login', query: { redirect: to.fullPath } });
         NProgress.done(); // 结束进度条
         return; // 阻止继续执行
      }
    }
  }

  // 检查路由是否需要认证
  // 重新获取 isAuthenticated 状态，以防 fetchUserInfo 清除了 token
  const currentIsAuthenticated = store.getters['user/isAuthenticated'];
  const isAdmin = store.getters['user/getUserInfo']?.is_staff || localStorage.getItem('is_staff') === 'true';

  if (to.meta.requiresAuth) {
    if (currentIsAuthenticated) {
      // 用户已认证，检查是否需要管理员权限
      if (to.meta.requiresAdmin) {
        if (isAdmin) {
          next();
        } else {
          ElMessage.warning('您没有访问此页面的权限');
          next({ name: 'ProductList' }); // 重定向到商品列表页
        }
      } else {
        next();
      }
    } else {
      // 用户未认证，重定向到登录页
      ElMessage.warning('请先登录以访问此页面');
      next({ name: 'login', query: { redirect: to.fullPath } });
    }
  } else {
    // 公开路由，直接访问
    // 如果已登录且尝试访问登录或注册页，重定向到首页 (商品列表页)
    if ((to.name === 'login' || to.name === 'register' || to.name === 'verify-email') && currentIsAuthenticated) {
      next({ name: 'ProductList' });
    } else {
      next();
    }
  }
});

router.afterEach(() => {
  NProgress.done(); // 结束顶部进度条
});

export default router
