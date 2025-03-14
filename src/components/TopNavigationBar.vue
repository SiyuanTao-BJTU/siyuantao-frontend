<script setup>
import { onMounted, ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter, useRoute } from 'vue-router';
import {ChatLineRound, Download, House, Phone, Sell, Switch, User} from "@element-plus/icons-vue";
import {ElMessage} from "element-plus";
import axios from '../axios_client/index.js';
import WebSocketService from "@/socket_client/socket.js";

// 组件全局变量定义
const { t, locale } = useI18n();
const router = useRouter();
const route = useRoute();
const MODE = process.env.NODE_ENV;
let username = ref('');
let avatar_char = computed(() => username.value.slice(0, 2).toUpperCase());

// 获取用户名的函数
const fetchUsernameAndId = async () => {
  try {
    axios.get('/user/info').then((res) => {
      if (res.status === 200) {
        if (res.data.code === 0){
          username.value = res.data.data.username;
          localStorage.setItem('username', res.data.data.username);
          localStorage.setItem('userId', res.data.data.id);
        }
        else{
          console.warn(res.data);
          ElMessage.error(t('navigator.username_error'));
          username.value = '??';
        }
      } else {
        console.warn(res.data);
        ElMessage.error(t('navigator.username_error'));
        username.value = '??';
      }
    }).catch((error) => {
      console.error(error);
      ElMessage.error(t('navigator.username_error'));
      username.value = '??';
    });
  }
  catch (error) {
    console.error(error);
    ElMessage.error(t('navigator.username_error'));
    username.value = '??';
  }
};

// 监听 token 的变化以更新用户名
const handleStorageChange = (event) => {
  if (event.key === 'token') {
    if (event.oldValue !== event.newValue) {
      fetchUsernameAndId(); // token 变更时请求最新用户名
    }
  }
};

const checkFileAvailable = async (fileURL) => {
  try {
    const res = await fetch(fileURL, {
      method: 'HEAD'
    });
    if (res.ok) {
      window.location.href = fileURL;
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error(error);
    return false;
  }
}

// 菜单选择事件
const handleSelect = (key, keyPath) => {
  const routes = {
    '1': '/home',
    '2': '/sell',
    '3': '/message',
    '4': '/profile',
  };
  if (routes[key]) {
    router.push(routes[key]);
  } else if (keyPath[1] === '6-1') {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    WebSocketService.close();
    router.push('/login');
  } else if (keyPath[1] === '6-2') {
    router.push('/profile');
  }
  else if (key[0] === "7") {
    const fileURL = "/app/Goods Exchange Setup 0.0.0.exe";
    if (!checkFileAvailable(fileURL)) {
      ElMessage.warning(t("profile.download_error"));
    }
  }
  else if (key[0] === "8") {
    const emailURL = "hongyu.yan@163.com";
    window.location.href = `mailto:${emailURL}`;
  }
};

// 语言切换
const change_language = () => {
  locale.value = locale.value === 'en' ? 'zh' : 'en';
};

// 组件挂载和卸载
onMounted(() => {
  if (localStorage.getItem('token')) {
    fetchUsernameAndId(); // 初始挂载时请求用户名
  } else {
    username.value = '??';
  }
});

// 监听路由变化
watch(
    () => route.path,
    (newPath) => {
      if (newPath === '/login') {
        // 如果用户回到 login 路由，重置 username
        username.value = '??';
      } else if (newPath === '/home' && localStorage.getItem('token')) {
        // 如果用户从 login 路由到 home 路由，发起请求获取 username
        fetchUsernameAndId();
      }
    }
);
</script>

<template>
  <el-menu
      default-active="activeIndex"
      :ellipsis=false
      class="navigation-bar"
      mode="horizontal"
      background-color="#545c64"
      text-color="#fff"
      active-text-color="#ffd04b"
      @select="handleSelect"
  >
    <el-menu-item index="0" disabled>
      <!--<span class="logo_word">GoodsExchange</span> -->
      <img src="/src/assets/icon_deep.png" alt="logo" class="logo-img">
    </el-menu-item>
    <el-menu-item index="1">
      <el-icon><House /></el-icon>
      <span>{{ t("navigator.home_page") }}</span>
    </el-menu-item>
    <el-menu-item index="2">
      <el-icon><Sell /></el-icon>
      <span>{{ t("navigator.sell_page") }}</span>
    </el-menu-item>
    <el-menu-item index="3">
      <el-icon><ChatLineRound /></el-icon>
      <span>{{ t("navigator.chat_page") }}</span>
    </el-menu-item>
    <el-menu-item index="4">
      <el-icon><User /></el-icon>
      <span>{{ t("navigator.personal_page") }}</span>
    </el-menu-item>
    <el-menu-item index="5" @click="change_language">
      <el-icon><Switch /></el-icon>
      <span>{{ t("navigator.change_language") }}</span>
    </el-menu-item>
    <el-menu-item index="8">
      <el-icon><Phone /></el-icon>
      <span>hongyu.yan@163.com</span>
    </el-menu-item>
    <el-menu-item index="7" v-if="MODE !== 'desktop'">
      <el-icon><Download /></el-icon>
      <span>{{t("navigator.download_desktop_app")}}</span>
    </el-menu-item>
    <el-sub-menu index="6">
      <template #title>
        <el-avatar>{{ avatar_char }}</el-avatar>
      </template>
      <el-menu-item index="6-1">{{ t("navigator.logout") }}</el-menu-item>
      <el-menu-item index="6-2">{{ t("navigator.personal_info") }}</el-menu-item>
    </el-sub-menu>
  </el-menu>
</template>

<style>
.el-menu--horizontal > .el-menu-item:nth-child(5) {
  margin-right: auto;
}

.el-menu-item.is-disabled {
  color: white !important;
  opacity: 1 !important;
}

.logo_word {
  font-size: 20px;
  font-weight: bold;
}

.logo-img {
  width: 150px;
  height: 50px;
}
</style>
