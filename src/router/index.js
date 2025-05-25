import { createRouter, createWebHistory } from 'vue-router'
// import store from '@/store'; // 不在路由文件中直接导入 store，而是在 main.js 中挂载后使用
import { ElMessage } from 'element-plus'; // 确保 ElMessage 被导入
import NProgress from 'nprogress'; // 导入 NProgress
import 'nprogress/nprogress.css'; // 导入 NProgress 样式

// 静态导入 ProfileView，暂时解决动态加载问题
import ProfileView from '@/user/views/profile/ProfileView.vue';
// import LoginView from '@/user/views/auth/LoginView.vue';
// import EmailVerificationView from '@/user/views/auth/EmailVerificationView.vue';
// import HomeView from '@/product/views/HomeView.vue';
// import ItemInfoView from '@/views/ItemInfoView.vue';
// import UserProductsView from '@/user/views/profile/UserProductsView.vue';
// import UserFavoritesView from '@/product/views/UserFavoritesView.vue';
// import MessageView from '@/chat/views/MessageView.vue';
// import ProductPostView from '@/product/views/ProductPostView.vue';

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
      component: { template: '<div>管理员布局 (占位符)</div>' },
      redirect: '/admin/dashboard',
      meta: { requiresAdminLayout: true, requiresAuth: true, requiresAdmin: true },
      children: [
        {
          path: 'dashboard',
          name: 'AdminDashboard',
          component: { template: '<div>仪表盘概览 (占位符)</div>' },
          meta: { title: '仪表盘概览', requiresAuth: true, requiresAdmin: true }
        },
        {
          path: 'users',
          name: 'AdminUserManagement',
          component: { template: '<div>用户管理 (占位符)</div>' },
          meta: { title: '用户管理', requiresAuth: true, requiresAdmin: true }
        },
        {
          path: 'products-audit',
          name: 'AdminProductAudit',
          component: { template: '<div>商品审核 (占位符)</div>' },
          meta: { title: '商品审核', requiresAuth: true, requiresAdmin: true }
        },
        {
          path: 'returns',
          name: 'AdminReturnManagement',
          component: { template: '<div>退货申请管理 (占位符)</div>' },
          meta: { title: '退货申请管理', requiresAuth: true, requiresAdmin: true }
        },
        {
          path: 'reports',
          name: 'AdminReportManagement',
          component: { template: '<div>举报管理 (占位符)</div>' },
          meta: { title: '举报管理', requiresAuth: true, requiresAdmin: true }
        },
        {
          path: 'notifications',
          name: 'AdminNotificationSend',
          component: { template: '<div>系统通知发送 (占位符)</div>' },
          meta: { title: '系统通知发送', requiresAuth: true, requiresAdmin: true }
        },
        {
          path: 'permissions',
          name: 'AdminPermissionManagement',
          component: { template: '<div>权限管理 (占位符)</div>' },
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

  // 在这里可以安全地访问 store，因为 main.js 会先创建 store 再挂载 router
  const isAuthenticated = router.app.config.globalProperties.$store.getters['user/isAuthenticated'];
  const token = localStorage.getItem('token');

  // 尝试获取用户信息，如果 token 存在但 store 中没有用户信息
  if (token && !router.app.config.globalProperties.$store.state.user.userInfo) {
    try {
      await router.app.config.globalProperties.$store.dispatch('user/fetchUserInfo');
    } catch (error) {
      console.warn('路由守卫: fetchUserInfo 失败', error);
    }
  }

  // 检查路由是否需要认证
  if (to.meta.requiresAuth) {
    if (isAuthenticated) {
      // 用户已认证，检查是否需要管理员权限
      if (to.meta.requiresAdmin) {
        // 使用 router.app.config.globalProperties.$store 来访问 store 实例和 getters
        const userInfo = router.app.config.globalProperties.$store.getters['user/getUserInfo'];
        if (userInfo && userInfo.is_staff) {
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
    if ((to.name === 'login' || to.name === 'register' || to.name === 'verify-email') && isAuthenticated) {
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
