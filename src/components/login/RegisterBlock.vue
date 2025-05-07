<script setup>
import { reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import { ElMessage } from "element-plus";
import { View, Hide } from '@element-plus/icons-vue';

import api from '@/API_PRO.js'; // 导入新的 API 服务

import PatternCheck from "@/utils/pattern.js";

// 组件向父组件传递事件定义
const emit = defineEmits(["registerSuccess"]);

// 组件全局变量定义
const { t } = useI18n(); // 解构出t函数，t函数用于获取当前语言环境下的文本
const form = reactive({
  username:"",
  password:"",
  verifyPassword:""
}) // 创建响应式对象，作为登录和注册时的表单数据
const passwordVisible_first = ref(false); // 控制输入密码是否可见的状态
const passwordVisible_second = ref(false); // 控制确认密码是否可见的状态

// 组件全局函数定义
const handleRegisterClick = () => {
  /**
   * 处理注册按钮点击事件
   */
  if(form.username === "" || form.password === "" || form.verifyPassword === ""){
    // 如果用户名或密码为空，则提示用户输入账号密码
    ElMessage.error(t("login.input_empty"))
    return;
  }
  else if (form.password !== form.verifyPassword){
    // 如果两次输入的密码不一致，则提示用户两次输入的密码不一致
    ElMessage.error(t("login.password_not_match"))
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

  // 发送注册请求
  const userData = {
    username: form.username,
    password: form.password,
    confirm_password: form.verifyPassword
    // email, first_name, etc., are optional according to API_PRO.js
  };
  api.userRegister(userData)
    .then(data => {
      // Assuming API_PRO.js returns data directly (or a wrapped response that apiRequest unwraps to data)
      // And that this data might contain a code field for specific outcomes.
      // The apiRequest in API_PRO.js throws an error for non-2xx HTTP status codes.
      // So, if we reach .then(), it means HTTP status was 2xx.
      // We need to check the `code` inside the response body if the backend uses it.

      // If API_PRO's apiRequest already handles response.data and status codes for errors,
      // a successful .then() means the operation (like user creation) was successful.
      // If the backend returns specific codes within a 2xx response (e.g., for user exists),
      // those need to be handled here based on the structure of `data`.

      // Let's assume for now that a successful promise means registration was successful
      // and specific business logic errors (like user_exist) would be thrown as errors by apiRequest
      // or need to be checked in `data` if API_PRO doesn't do that.
      
      // If your API_PRO is set up to return the raw `response.data` which might include `code`:
      // if (data.code === 101) { 
      //   ElMessage.error(t("login.user_exist"));
      // } else if (data.code === 102) {
      //   ElMessage.error(t("login.register_failed"));
      // } else if (data.code === 0) {
      //   ElMessage.success(t("login.register_success"));
      //   emit("registerSuccess");
      // } else {
      //    ElMessage.error(t("login.register_failed_unknown")); // For unexpected codes
      // }

      // Simplified: Assuming a non-error response from api.userRegister means success
      ElMessage.success(t("login.register_success"));
      emit("registerSuccess");

    })
    .catch(error => {
      console.error("Register failed:", error);
      // Handle specific errors based on what API_PRO throws or what's in error.response.data
      // For example, if API_PRO throws an error with a message for "user_exist"
      if (error.message && error.message.toLowerCase().includes('user already exists')) { // Example check
          ElMessage.error(t("login.user_exist"));
      } else if (error.response && error.response.data && error.response.data.username) {
          // Example: Django Rest Framework validation error for username
          ElMessage.error(t("login.user_exist")); 
      } else if (error.response && error.response.data && error.response.data.password) {
          // Example: Django Rest Framework validation error for password
          ElMessage.error(t("login.password_format_error")); // Add this to i18n
      }
      else {
        ElMessage.error(t("login.register_failed"));
      }
    });
}

const resetForm = () => {
  /**
   * 重置表单数据
   */
  form.username = ""
  form.password = ""
  form.verifyPassword = ""
}
// 切换密码可见性
const togglePasswordVisibilityFirst = () => {
  passwordVisible_first.value = !passwordVisible_first.value;
}

const togglePasswordVisibilitySecond = () => {
  passwordVisible_second.value = !passwordVisible_second.value;
}

</script>

<template>
  <el-card style="max-width: 300px">
    <el-form :model="form" label-width="auto">
      <el-form-item :label="t('login.username_input')">
        <el-input v-model="form.username"/>
      </el-form-item>
      <el-form-item :label="t('login.password_input')">
        <el-input
            v-model="form.password"
            :type="passwordVisible_first ? 'text' : 'password'"
            autocomplete="off"
        >
          <!-- 密码输入框右侧的眼睛图标 -->
          <template #suffix>
            <el-icon @click="togglePasswordVisibilityFirst">
              <component :is="passwordVisible_first ? Hide : View" />
            </el-icon>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item :label="t('login.reenter_password_input')">
        <el-input
            v-model="form.verifyPassword"
            :type="passwordVisible_second ? 'text' : 'password'"
            autocomplete="off"
        >
          <!-- 密码输入框右侧的眼睛图标 -->
          <template #suffix>
            <el-icon @click="togglePasswordVisibilitySecond">
              <component :is="passwordVisible_second ? Hide : View" />
            </el-icon>
          </template>
        </el-input>
      </el-form-item>
    </el-form>
    <div class="register-button">
      <el-button type="primary" @click="handleRegisterClick">{{t('login.register_button')}}</el-button>
      <el-button type="primary" @click="resetForm">{{t('login.reset_button')}}</el-button>
    </div>
  </el-card>
</template>

<style scoped>
.register-button {
  display: flex;
  justify-content: center;
}
</style>
