<script setup>
import { reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import { ElMessage } from "element-plus";
import { View, Hide } from '@element-plus/icons-vue';

import router from "@/router/index.js";

import PatternCheck from "@/utils/pattern.js";
import WebSocketService from "@/socket_client/socket.js";
import api from '@/API_PRO.js'; // 导入新的 API 服务

// 组件全局变量定义
const { t } = useI18n(); // 解构出t函数，t函数用于获取当前语言环境下的文本
const form = reactive({
  username:"",
  password:"",
}) // 创建响应式对象，作为登录和注册时的表单数据
const passwordVisible = ref(false); // 控制密码是否可见的状态

// 组件全局函数定义
const handleLoginClick = () => {
  /**
   * 处理登录按钮点击事件
   */
  if(form.username === "" || form.password === ""){
    // 如果用户名或密码为空，则提示用户请输入账号密码
    ElMessage.error(t("login.input_empty"))
    return;
  }

  // 检查输入的用户名和密码是否合法
  let username_res = PatternCheck.username_check(form.username)
  let password_res = PatternCheck.password_check(form.password)

  if (!username_res.valid){
    ElMessage.error(t(username_res.error))
    return;
  }
  if (!password_res.valid){
    ElMessage.error(t(password_res.error))
    return;
  }

  // 发送登录请求
  api.userLogin({ username: form.username, password: form.password })
    .then(loginData => {
      // Assuming loginData contains access and refresh tokens
      ElMessage.success(t("login.login_success"));
      localStorage.setItem("token", loginData.access);
      localStorage.setItem("refresh", loginData.refresh);

      // 获取用户信息
      return api.getUserProfile(); // Chain the promise
    })
    .then(userInfo => {
      // Assuming userInfo contains id and username
      localStorage.setItem('username', userInfo.username);
      localStorage.setItem('userId', userInfo.id);
      WebSocketService.init(localStorage.getItem('userId'));
      router.push("/home");
    })
    .catch(error => {
      console.error("Login or get user info failed:", error);
      ElMessage.error(t("login.login_failed")); // Or a more specific error
    });
}

// 切换密码可见性
const togglePasswordVisibility = () => {
  passwordVisible.value = !passwordVisible.value;
}

const resetForm = () => {
  /**
   * 重置表单数据
   */
  form.username = ""
  form.password = ""
}
</script>

<template>
  <el-card style="max-width: 300px">
    <el-form
        :model="form"
        label-width="auto"
    >
      <el-form-item :label="t('login.username_input')">
        <el-input v-model="form.username"/>
      </el-form-item>
      <el-form-item :label="t('login.password_input')">
        <el-input
            v-model="form.password"
            :type="passwordVisible ? 'text' : 'password'"
            autocomplete="off"
        >
          <!-- 密码输入框右侧的眼睛图标 -->
          <template #suffix>
            <el-icon @click="togglePasswordVisibility">
              <component :is="passwordVisible ? Hide : View" />
            </el-icon>
          </template>
        </el-input>
      </el-form-item>
    </el-form>
    <div class="login-button">
      <el-button type="primary" @click="handleLoginClick">{{t('login.login_button')}}</el-button>
      <el-button type="primary" @click="resetForm">{{t('login.reset_button')}}</el-button>
    </div>
  </el-card>
</template>

<style scoped>
.login-button {
  display: flex;
  justify-content: center;
}
</style>