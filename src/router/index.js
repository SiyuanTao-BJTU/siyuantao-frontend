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

  const token = localStorage.getItem('token');
  let userInfo = store.state.user.userInfo;
  let currentIsAuthenticated = store.getters['user/isAuthenticated']; // Get initial auth state

  // 尝试获取用户信息，如果 token 存在但 store 中没有用户信息
  if (token && !userInfo) {
    try {
      await store.dispatch('user/fetchUserInfo');
      // After fetching, update local userInfo and isAuthenticated state for subsequent checks in this guard
      userInfo = store.state.user.userInfo;
      currentIsAuthenticated = store.getters['user/isAuthenticated']; 
    } catch (error) {
      console.warn('路由守卫: fetchUserInfo 失败', error);
      // 清除本地 token 和 user info，视为未认证
      // logout action 应该处理 localStorage 和 store state 的清理以及重定向
      await store.dispatch('user/logout', { inStoreLogout: false }); 
      // 更新 currentIsAuthenticated 状态，因为已登出
      currentIsAuthenticated = false; 
      userInfo = null;

      // 如果目标路由需要认证，而此时获取用户信息失败并已登出，则重定向到登录
      // logout action 内部会处理重定向到登录页的逻辑，所以这里不需要显式 next({ name: 'login' })
      // 但是，我们需要确保 NProgress.done() 被调用，并且由于 logout action 可能会异步重定向，
      // 我们应该在这里调用 next(false) 或 next() 来结束当前导航，让 logout action 控制流程。
      // 然而，logout action 的重定向可能与这里的 next() 冲突。
      // 最好的做法是让 logout action 完成重定向，这里只结束当前导航。
      // 如果 logout action 保证会导航，这里调用 next() 或 next(false) 是安全的。
      // 如果 logout action 只是清除状态，则需要在这里 next({name: 'login'})。
      // 假设 logout 包含跳转逻辑, 那么这里调用 next() 允许它执行。
      // 但如果 to.meta.requiresAuth 为真，并且 fetchUserInfo 失败，我们确实不应该进入目标路由。
      // 考虑到 user.js 的 logout action 会执行 router.replace({ name: 'login' })，
      // 这里调用 next() 然后 return 是安全的，让 logout 的导航接管。
      if (to.meta.requiresAuth) {
         NProgress.done();
         // next({ name: 'login', query: { redirect: to.fullPath } }); // logout action handles this
         return; // Stop further processing in this guard, allow logout's navigation to take place
      }
    }
  }

  // 重新获取 isAdmin 状态，以防 fetchUserInfo 改变了它
  const isAdmin = userInfo?.is_staff || localStorage.getItem('is_staff') === 'true';

  if (to.meta.requiresAuth) {
    if (currentIsAuthenticated) {
      if (to.meta.requiresAdmin) {
        if (isAdmin) {
          next();
        } else {
          ElMessage.warning('您没有访问此页面的权限');
          next({ name: 'ProductList' }); 
        }
      } else {
        next();
      }
    } else {
      ElMessage.warning('请先登录以访问此页面');
      next({ name: 'login', query: { redirect: to.fullPath } });
    }
  } else {
    // 公开路由
    if ((to.name === 'login' || to.name === 'register' || to.name === 'verify-email') && currentIsAuthenticated) {
      next({ name: 'ProductList' });
    } else {
      next();
    }
  }
  // NProgress.done() 应该在 next() 调用之后，或者在所有 next() 分支后统一调用
  // 但是由于 next() 是异步的，最好在每个分支的末尾调用
});

router.afterEach(() => {
  NProgress.done(); // 在路由切换完成后结束进度条
});

export default router
