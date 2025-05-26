import './assets/main.css'

import { createApp } from 'vue'

import App from './App.vue'
import router from './router'
import store from './store'
import VueAxios from 'vue-axios'
import axios from './axios_client/index.js'
import ElementPlus from 'element-plus';
import { ElMessage } from 'element-plus';

import WebSocketService from "@/socket_client/socket.js";

const app = createApp(App)
app.use(VueAxios, axios)
app.use(ElementPlus);

// 路由守卫
router.beforeEach((to, from, next) => {
  const publicPaths = ['/login', '/register']; // 添加注册页到白名单
  const isAuthenticated = localStorage.getItem("token");

  // 如果没有token，并且当前目标页面不是登录页或注册页
  if (!isAuthenticated && !publicPaths.includes(to.path)) {
    // 只在需要重定向时显示提示
    if (from.path !== '/login' && from.path !== '/register') { // 避免从登录/注册页跳回登录页时重复提示
        ElMessage.error('请先登录');
    }
    next("/login");  // 重定向到登录页面
  } else {
    next();  // 否则继续访问目标页面
  }
});

app.use(router)
app.use(store)


// 初始化websocket
// 只有在登录状态下才尝试初始化 WebSocket
// WebSocket 初始化逻辑最好放在用户成功获取 userId 后，例如在 store 的 login action 或 fetchUserInfo action 成功后
if (localStorage.getItem('userId')) {
  WebSocketService.init(localStorage.getItem('userId'));
}

app.mount('#app')
