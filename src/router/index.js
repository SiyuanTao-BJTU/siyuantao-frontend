import { createRouter, createWebHistory } from 'vue-router'
import store from '@/store'; // 直接导入 store 实例
import { ElMessage } from 'element-plus'; // 确保 ElMessage 被导入
import NProgress from 'nprogress'; // 导入 NProgress
import 'nprogress/nprogress.css'; // 导入 NProgress 样式

// 静态导入 ProfileView，暂时解决动态加载问题
import ProfileView from '@/user/views/profile/ProfileView.vue';
// 导入我的商品页面
import MyProductView from '@/product/views/MyProductView.vue';
// 导入学生认证请求页面
import StudentAuthRequestView from '@/user/views/profile/StudentAuthRequestView.vue';
// 导入通用的邮箱验证页面
import EmailVerificationView from '@/user/views/auth/EmailVerificationView.vue';

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
    { // 商品浏览主页，所有商品列表
      path: '/products',
      name: 'ProductList',
      component: () => import('@/product/views/HomeView.vue'),
      meta: { requiresAuth: true }
    },    
    { // 我的发布页面
      path: '/my-products',
      name: 'MyProductView',
      component: MyProductView,
      meta: { requiresAuth: true }
    },
    { // 交易记录页面 (保留原路径，如果需要也可以扁平化)
      path: '/transactions',
      name: 'Transactions',
      component: { template: '<div>交易记录页面</div>' },
      meta: { requiresAuth: true }
    },
    { // 我的订单页面
      path: '/orders',
      name: 'my-orders',
      component: { template: '<div>我的订单页面 (占位符)</div>' },
      meta: { requiresAuth: true }
    },
    { // 我的收藏页面 
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
    { // 学生认证请求页面 (通过个人中心进入)
      path: '/profile/student-auth',
      name: 'StudentAuthRequest',
      component: StudentAuthRequestView,
      meta: { requiresAuth: true, title: '学生认证请求' }
    },
    { // 偏好设置页面 (保留原路径)
      path: '/settings',
      name: 'settings',
      component: { template: '<div>偏好设置页面 (占位符)</div>' },
      meta: { requiresAuth: true }
    },
    // 独立页面，不显示导航栏 (hideNavbar: true)
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
    {
      path: '/request-student-auth',
      name: 'RequestStudentAuth',
      component: () => import('../user/views/profile/StudentAuthRequestView.vue'),
      meta: { requiresAuth: true }
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
  let currentIsAuthenticated = !!token; // Start by checking token presence

  // 如果 token 存在但 store 中没有用户信息，则尝试获取
  if (token && !userInfo) {
    try {
      // 使用 dispatch 并 await 确保获取用户信息完成后再继续
      userInfo = await store.dispatch('user/fetchUserInfo');
      // fetchUserInfo 成功后，userInfo 和 isLoggedIn 状态会在 store 中更新
      currentIsAuthenticated = store.getters['user/isAuthenticated']; // Re-evaluate after fetch
    } catch (error) {
      console.warn('路由守卫: fetchUserInfo 失败', error);
      await store.dispatch('user/logout', { inStoreLogout: false });
      currentIsAuthenticated = false;
      userInfo = null; 

      if (to.meta.requiresAuth) {
         NProgress.done();
         return; 
      }
    }
  }

  if (to.meta.requiresAuth) {
    if (currentIsAuthenticated) {
      if (to.meta.requiresVerified && !userInfo?.is_verified) {
          ElMessage.warning('请先完成邮箱验证以访问此页面');
          next({ name: 'StudentAuthRequest', query: { redirect: to.fullPath } });
      } else if (to.meta.requiresAdmin) {
           const isAdmin = userInfo?.is_staff || localStorage.getItem('is_staff') === 'true';
           if (isAdmin || store.getters['user/isSuperAdmin']) {
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
  } else if (to.name === 'login' && currentIsAuthenticated) {
    next({ name: 'ProductList' });
  } else {
    next();
  }
});

router.afterEach(() => {
  NProgress.done();
});

export default router;