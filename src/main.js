import './assets/main.css'

import { createApp } from 'vue'

import App from './App.vue'
import router from './router'
import VueAxios from 'vue-axios'
import axios from './axios_client/index.js'
import i18n from './vue_i18n/index.js'
import ElementPlus from 'element-plus';
import { ElMessage } from 'element-plus';

import WebSocketService from "@/socket_client/socket.js";

const app = createApp(App)
app.use(VueAxios, axios)
app.use(i18n)
app.use(ElementPlus);

// 路由守卫
router.beforeEach((to, from, next) => {
  // 如果没有token，并且当前目标页面不是登录页
  if (!localStorage.getItem("token") && to.path !== "/login") {
    next("/login");  // 重定向到登录页面
    ElMessage.error(i18n.global.t('login.login_first'))
  } else {
    next();  // 否则继续访问目标页面
  }
});

// 初始化websocket
if (localStorage.getItem('userId')) {
  WebSocketService.init(localStorage.getItem('userId'));

}

app.use(router)

app.mount('#app')
