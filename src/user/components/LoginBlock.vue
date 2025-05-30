<script setup>
import { reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { View, Hide } from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex'; // 导入 useStore hook
import WebSocketService from '../../utils/websocket'; // WebSocket 服务
import PatternCheck from '../../utils/pattern.js'; // 检查用户名和密码格式

// import { useI18n } from 'vue-i18n'; // 导入 useI18n

// 表单数据
const form = reactive({
  username: '',
  password: '',
  rememberMe: false,
});

// 密码可见性
const passwordVisible = ref(false);

// 路由实例
const router = useRouter();
// 获取 store 实例
const store = useStore();

// 检查输入的用户名和密码是否合法
const handleLoginClick = async () => {
  /**
   * 处理登录按钮点击事件
   */
  // Clear any existing redirect query parameter from the URL
  if (router.currentRoute.value.query.redirect) {
    router.replace({ query: {} });
  }

  if(form.username === "" || form.password === ""){
    // 如果用户名或密码为空，则提示用户请输入账号密码
    ElMessage.error("请输入账号密码")
    return;
  }

  // 检查输入的用户名和密码是否合法
  let username_res = PatternCheck.username_check(form.username)
  let password_res = PatternCheck.password_check(form.password)

  if (!username_res.valid){
    ElMessage.error(username_res.error)
    return;
  }
  if (!password_res.valid){
    ElMessage.error(password_res.error)
    return;
  }

  try {
    // 调用 Vuex 的 login action
    await store.dispatch('user/login', {
      username: form.username,
      password: form.password
    });

    // 登录成功，用户信息已由 store 中的 fetchUserInfo action 获取并设置
    // 这里只需处理页面跳转

    const userId = localStorage.getItem('userId');
    // 初始化 WebSocket
    if (userId) {
        WebSocketService.init(userId);
    } else {
        console.warn("Login successful but userId not found in localStorage, WebSocket not initialized.");
    }

    // 在跳转到主页前，确保 Vuex store 中的登录状态已更新
    // If the state is not updated, it might be a synchronization issue or an error in the login flow.
    // You might choose to stay on this page or provide a user message.
    // ElMessage.error("登录成功但状态异常，请尝试刷新页面。");

    // Always push to the products page after successful login, relying on route guard for auth check
    router.push("/products");

  } catch (error) {
    console.error("Login failed in component:", error);
  }
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
  form.rememberMe = false
}

const handleForgotPassword = () => {
  // TODO: Implement forgot password logic
  ElMessage.info("忘记密码功能待实现");
}
</script>

<template>
  <el-form
      :model="form"
      label-width="auto"
      class="login-form"
  >
    <el-form-item label="用户名">
      <el-input v-model="form.username" placeholder="请输入用户名"/>
    </el-form-item>
    <el-form-item label="密码">
      <el-input
          v-model="form.password"
          :type="passwordVisible ? 'text' : 'password'"
          placeholder="请输入密码"
          autocomplete="off"
          @keyup.enter="handleLoginClick"
      >
        <!-- 密码输入框右侧的眼睛图标 -->
        <template #suffix>
          <el-icon @click="togglePasswordVisibility">
            <component :is="passwordVisible ? Hide : View" />
          </el-icon>
        </template>
      </el-input>
    </el-form-item>
    <el-form-item class="remember-forgot">
       <div class="remember-me-checkbox"><el-checkbox v-model="form.rememberMe" label="记住我"></el-checkbox></div>
       <div class="forgot-password-link"><el-link type="primary" @click="handleForgotPassword">忘记密码?</el-link></div>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="handleLoginClick" class="login-button">登录</el-button>
    </el-form-item>
  </el-form>
</template>

<style scoped>
.login-form {
  width: 100%; /* Ensure form takes full width of its container */
}

.login-form .el-form-item {
    margin-bottom: 20px; /* Add space between form items */
}

.remember-forgot {
    display: flex;
    justify-content: space-between; /* Distribute items */
    width: 100%; /* Take full width */
    margin-bottom: 20px; /* Space before button */
}

.remember-forgot .el-form-item__content {
    display: flex;
    justify-content: space-between;
    width: 100%;
}

.remember-me-checkbox {
  margin-right: 250px; /* Add margin to the right of the checkbox */
}

.login-button {
  width: 100%; /* Full width button */
  background-color: #4A90E2; /* 主色调蓝色 */
  border-color: #4A90E2; /* 主色调蓝色 */
}

.login-button:hover {
    background-color: #6FA8DC; /* 鼠标悬停时稍浅的蓝色 */
    border-color: #6FA8DC; /* 鼠标悬停时稍浅的蓝色 */
}

/* Adjust Element Plus default styles */
:deep(.el-form-item__label) {
    color: #333 !important; /* 深灰色文字 */
    font-weight: bold;
}

:deep(.el-input__inner) {
    background-color: #f5f5f5; /* 浅灰色背景 */
    border: 1px solid #dcdfe6; /* Element Plus 默认边框颜色 */
    box-shadow: none !important; /* 确保移除盒阴影 */
    color: #606266; /* Element Plus 默认输入文字颜色 */
    text-shadow: none !important; /* 确保移除文本阴影 */
    filter: none !important; /* 移除可能的滤镜效果 */
}

:deep(.el-input__inner::placeholder) {
  color: #a8a8a8 !important; /* 占位符颜色，确保不透明 */
  text-shadow: none !important; /* 移除文本阴影 */
}

/* Add vendor prefixes for placeholder */
:deep(.el-input__inner::-webkit-input-placeholder) {
  text-shadow: none !important;
}

:deep(.el-input__inner::-moz-placeholder) {
  text-shadow: none !important;
}

:deep(.el-input__inner:-ms-input-placeholder) {
  text-shadow: none !important;
}

:deep(.el-input__inner::-ms-input-placeholder) {
  text-shadow: none !important;
}

:deep(.el-checkbox__label) {
    color: #606266; /* 深灰色文字 */
}

:deep(.el-link.el-link--primary) {
    color: #4A90E2; /* 主色调蓝色链接 */
    font-size: 14px;
}

:deep(.el-link.el-link--primary:hover) {
    text-decoration: underline; /* Underline on hover */
}

:deep(.el-button--primary) {
    background-color: #4A90E2 !important;
    border-color: #4A90E2 !important;
}

:deep(.el-button--primary:hover) {
    background-color: #6FA8DC !important;
    border-color: #6FA8DC !important;
}
</style>