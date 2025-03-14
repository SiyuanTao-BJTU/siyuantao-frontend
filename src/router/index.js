import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import ProfileView from '../views/ProfileView.vue'
import SellView from "../views/SellView.vue";
import MessageView from "../views/MessageView.vue";
import ProfileSearchView from "@/views/ProfileSearchView.vue";
import ItemInfoView from "@/views/ItemInfoView.vue";

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    { // 首页界面，也是我要购买界面，同时为默认页面
      path: '/',
      name: 'homeDefault',
      component: HomeView
    },
    { // 首页界面，也是我要购买界面
      path: '/home',
      name: 'home',
      component: HomeView
    },
    { // 登录与注册界面
      path: '/login',
      name: 'login',
      // 组件惰性加载案例
      // component: () => import('../views/LoginView.vue')
      component: LoginView
    },
    { // 我的出售界面
      path: '/sell',
      name: 'sell',
      component: SellView
    },
    { // 个人信息界面
      path: '/profile',
      name: 'profile',
      component: ProfileView
    },
    { // 聊天室列表界面
      path: '/message',
      name: 'message',
      component: MessageView
    },
    { // 其他用户信息界面
      path: '/profile/:username',
      name: 'profileSearch',
      component: ProfileSearchView
    },
    {
      path: '/item/:itemId',
      name: 'item',
      component: ItemInfoView
    }
  ]
})

export default router
