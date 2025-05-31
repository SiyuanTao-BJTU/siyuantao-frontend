<script setup>
import { reactive, ref } from 'vue';
import { ElMessage, ElDialog, ElForm } from 'element-plus';
import { View, Hide } from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex'; // 导入 useStore hook
import WebSocketService from '../../utils/websocket'; // WebSocket 服务
import PatternCheck from '../../utils/pattern.js'; // 检查用户名和密码格式
import api from '@/API_PRO.js'; // Import api for forgot password API call

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

// New: Forgot password dialog state and form
const forgotPasswordDialogVisible = ref(false);
const resetPasswordStep = ref('inputEmail'); // 'inputEmail', 'inputOtpAndNewPassword'
const resetEmail = ref(''); // To store email after step 1 success

const forgotPasswordForm = reactive({
  email: '',
  otp: '',
  newPassword: '',
  confirmNewPassword: '',
});
const forgotPasswordFormRef = ref(null); // Ref for the forgot password form

// New: Forgot password form rules
const forgotPasswordRules = reactive({
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' },
  ],
  otp: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码必须是6位数字', trigger: 'blur' },
    { pattern: /^[0-9]{6}$/, message: '验证码必须是6位数字', trigger: 'blur' },
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' },
  ],
  confirmNewPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { validator: (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请再次输入新密码'));
        } else if (value !== forgotPasswordForm.newPassword) {
          callback(new Error('两次输入的密码不一致!'));
        } else {
          callback();
        }
    }, trigger: 'blur' },
  ],
});

// New: OTP Login related states and forms
const activeLoginTab = ref('passwordLogin'); // 'passwordLogin' or 'otpLogin'

const otpLoginForm = reactive({
  identifier: '',
  otp: '',
});
const otpLoginFormRef = ref(null); // Ref for the OTP login form

const isSendingLoginOtp = ref(false);
const isCountingLoginOtp = ref(false);
const loginOtpCountdown = ref(60); // 60 seconds countdown
let loginOtpTimer = null;
const loginIdentifier = ref(''); // To store identifier after requesting OTP

const otpLoginRules = reactive({
  identifier: [
    { required: true, message: '请输入用户名或邮箱', trigger: 'blur' },
    // You might want more specific validation (e.g., email format check if it's an email)
  ],
  otp: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码必须是6位数字', trigger: 'blur' },
    { pattern: /^[0-9]{6}$/, message: '验证码必须是6位数字', trigger: 'blur' },
  ],
});

// New: Handle requesting login OTP
const handleRequestLoginOtp = async () => {
  if (!otpLoginFormRef.value) return;

  await otpLoginFormRef.value.validateField('identifier', async (valid) => {
    if (valid) {
      isSendingLoginOtp.value = true;
      try {
        const response = await api.requestLoginOtp({ identifier: otpLoginForm.identifier });
        ElMessage.success(response.message || '登录验证码已发送，请检查您的邮箱。');
        loginIdentifier.value = otpLoginForm.identifier; // Store identifier for verification
        startLoginOtpCountdown();
      } catch (error) {
        console.error('Request login OTP failed:', error);
        const errorMessage = error.response?.data?.detail || '请求发送验证码失败，请稍后重试。';
        ElMessage.error(errorMessage);
      } finally {
        isSendingLoginOtp.value = false;
      }
    } else {
      console.log('Login OTP form identifier validation failed');
    }
  });
};

// New: Start OTP countdown
const startLoginOtpCountdown = () => {
  isCountingLoginOtp.value = true;
  loginOtpCountdown.value = 60;
  loginOtpTimer = setInterval(() => {
    if (loginOtpCountdown.value > 0) {
      loginOtpCountdown.value--;
    } else {
      clearInterval(loginOtpTimer);
      isCountingLoginOtp.value = false;
      loginOtpTimer = null;
    }
  }, 1000);
};

// New: Handle verifying login OTP and login
const handleVerifyLoginOtp = async () => {
  if (!otpLoginFormRef.value) return;

  await otpLoginFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const response = await api.verifyLoginOtp({
          identifier: loginIdentifier.value, // Use the stored identifier
          otp: otpLoginForm.otp,
        });
        
        // Assuming verifyLoginOtp returns { access_token, token_type } directly on success
        const token = response.access_token;

        if (token) {
          localStorage.setItem("token", token);

          // Dispatch login action to fetch user info and set login status
          await store.dispatch('user/fetchUserInfo');
          
          const userId = localStorage.getItem('userId');
          if (userId) {
            WebSocketService.init(userId);
          } else {
            console.warn("Login successful but userId not found in localStorage, WebSocket not initialized.");
          }

          ElMessage.success("登录成功");
          router.push("/products");
        } else {
          throw new Error("获取 Token 失败或登录未成功");
        }

      } catch (error) {
        console.error('Verify login OTP failed:', error);
        const errorMessage = error.response?.data?.detail || '验证码登录失败，请检查验证码或稍后重试。';
        ElMessage.error(errorMessage);
      }
    } else {
      console.log('Verify login OTP form validation failed');
    }
  });
};

// 检查输入的用户名和密码是否合法
const handleLoginClick = async () => {
  /**
   * 处理登录按钮点击事件 (传统密码登录)
   */
  if (activeLoginTab.value !== 'passwordLogin') return; // Only process if password login tab is active

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
  /**
   * 打开忘记密码对话框并重置为第一步
   */
  resetPasswordStep.value = 'inputEmail';
  forgotPasswordDialogVisible.value = true;
  // 确保在显示对话框后重置表单，以便清空验证状态
  if (forgotPasswordFormRef.value) {
    forgotPasswordFormRef.value.resetFields();
  }
};

// New: Handle sending reset email (now requests OTP)
const handleSendResetEmail = async () => {
  if (!forgotPasswordFormRef.value) return;

  await forgotPasswordFormRef.value.validateField('email', async (valid) => { // Only validate email field
    if (valid) {
      try {
        // Call the backend API to request an OTP for password reset
        const response = await api.requestOtpForPasswordReset({ email: forgotPasswordForm.email });
        ElMessage.success(response.message || '验证码已发送，请检查您的邮箱。');
        resetEmail.value = forgotPasswordForm.email; // Store email for next step
        forgotPasswordForm.otp = ''; // Clear OTP field
        forgotPasswordForm.newPassword = ''; // Clear new password field
        forgotPasswordForm.confirmNewPassword = ''; // Clear confirm new password field
        forgotPasswordFormRef.value.clearValidate(); // Clear all validations
        resetPasswordStep.value = 'inputOtpAndNewPassword'; // Move to next step
      } catch (error) {
        console.error('Request OTP failed:', error);
        const errorMessage = error.response?.data?.detail || '请求发送验证码失败，请稍后重试。';
        ElMessage.error(errorMessage);
      }
    } else {
      console.log('Forgot password form email validation failed');
      return false;
    }
  });
};

// New: Handle verifying OTP and resetting password
const handleVerifyOtpAndResetPassword = async () => {
  if (!forgotPasswordFormRef.value) return;

  await forgotPasswordFormRef.value.validate(async (valid) => { // Validate all fields for this step
    if (valid) {
      try {
        // Call the backend API to verify OTP and reset password
        await api.verifyOtpAndResetPassword({
          email: resetEmail.value, // Use the stored email
          otp: forgotPasswordForm.otp,
          new_password: forgotPasswordForm.newPassword,
        });
        ElMessage.success('密码重置成功！');
        forgotPasswordDialogVisible.value = false; // Close the dialog on success
        resetPasswordStep.value = 'inputEmail'; // Reset step
        forgotPasswordForm.email = ''; // Clear all form fields
        forgotPasswordForm.otp = '';
        forgotPasswordForm.newPassword = '';
        forgotPasswordForm.confirmNewPassword = '';
        if (forgotPasswordFormRef.value) {
            forgotPasswordFormRef.value.resetFields(); // Reset validation status
        }
      } catch (error) {
        console.error('Verify OTP and reset password failed:', error);
        const errorMessage = error.response?.data?.detail || '密码重置失败，请检查验证码或稍后重试。';
        ElMessage.error(errorMessage);
      }
    } else {
      console.log('Verify OTP and reset password form validation failed');
      return false;
    }
  });
};

// New: Handle closing forgot password dialog
const handleCloseForgotPasswordDialog = () => {
  forgotPasswordDialogVisible.value = false;
  resetPasswordStep.value = 'inputEmail'; // Reset step to initial
  forgotPasswordForm.email = ''; // Reset form fields
  forgotPasswordForm.otp = '';
  forgotPasswordForm.newPassword = '';
  forgotPasswordForm.confirmNewPassword = '';
  resetEmail.value = ''; // Clear stored email
  if (forgotPasswordFormRef.value) {
    forgotPasswordFormRef.value.resetFields(); // Reset validation status and clear errors
  }
};
</script>

<template>
  <el-tabs v-model="activeLoginTab" class="login-tabs">
    <el-tab-pane label="密码登录" name="passwordLogin">
      <el-form
          :model="form"
          label-width="auto"
          class="login-form"
      >
        <el-form-item label="用户名">
          <el-input v-model="form.username" placeholder="请输入用户名或邮箱"/>
        </el-form-item>
        <el-form-item label="密码">
          <el-input
              v-model="form.password"
              :type="passwordVisible ? 'text' : 'password'"
              placeholder="请输入密码"
              autocomplete="off"
              @keyup.enter="handleLoginClick"
          >
            <template #append>
              <el-button @click="togglePasswordVisibility">
                <el-icon><component :is="passwordVisible ? Hide : View" /></el-icon>
              </el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="form.rememberMe">记住我</el-checkbox>
          <el-link type="primary" :underline="false" @click="handleForgotPassword" class="forgot-password-link">忘记密码?</el-link>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleLoginClick" class="login-button">登录</el-button>
        </el-form-item>
      </el-form>
    </el-tab-pane>
    <el-tab-pane label="验证码登录" name="otpLogin">
      <el-form
          :model="otpLoginForm"
          :rules="otpLoginRules"
          ref="otpLoginFormRef"
          label-width="auto"
          class="otp-login-form"
      >
        <el-form-item label="用户名/邮箱" prop="identifier">
          <el-input v-model="otpLoginForm.identifier" placeholder="请输入用户名或邮箱"/>
        </el-form-item>
        <el-form-item label="验证码" prop="otp">
          <el-input v-model="otpLoginForm.otp" placeholder="请输入6位验证码">
            <template #append>
              <el-button
                  type="primary"
                  :loading="isSendingLoginOtp"
                  :disabled="isCountingLoginOtp"
                  @click="handleRequestLoginOtp"
              >
                {{ isCountingLoginOtp ? `${loginOtpCountdown}秒后重发` : '获取验证码' }}
              </el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleVerifyLoginOtp" class="login-button">登录</el-button>
        </el-form-item>
      </el-form>
    </el-tab-pane>
  </el-tabs>
  <el-dialog
      v-model="forgotPasswordDialogVisible"
      title="忘记密码"
      width="400px"
      @close="handleCloseForgotPasswordDialog"
      @closed="handleCloseForgotPasswordDialog" >
      <el-form
          :model="forgotPasswordForm"
          :rules="forgotPasswordRules"
          ref="forgotPasswordFormRef"
          label-width="auto"
          class="forgot-password-form">
        <div v-if="resetPasswordStep === 'inputEmail'">
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="forgotPasswordForm.email" placeholder="请输入您的注册邮箱"/>
          </el-form-item>
        </div>
        <div v-else-if="resetPasswordStep === 'inputOtpAndNewPassword'">
          <p style="margin-bottom: 20px; font-size: 14px; color: #606266;">验证码已发送至 <strong>{{ resetEmail }}</strong>。请检查您的邮箱。</p>
          <el-form-item label="验证码" prop="otp">
            <el-input v-model="forgotPasswordForm.otp" placeholder="请输入6位验证码"/>
          </el-form-item>
          <el-form-item label="新密码" prop="newPassword">
            <el-input type="password" v-model="forgotPasswordForm.newPassword" placeholder="请输入新密码" show-password/>
          </el-form-item>
          <el-form-item label="确认新密码" prop="confirmNewPassword">
            <el-input type="password" v-model="forgotPasswordForm.confirmNewPassword" placeholder="请再次输入新密码" show-password/>
          </el-form-item>
        </div>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleCloseForgotPasswordDialog">取消</el-button>
          <el-button
              type="primary"
              v-if="resetPasswordStep === 'inputEmail'"
              @click="handleSendResetEmail"
          >发送验证码</el-button>
          <el-button
              type="primary"
              v-else-if="resetPasswordStep === 'inputOtpAndNewPassword'"
              @click="handleVerifyOtpAndResetPassword"
          >重置密码</el-button>
        </span>
      </template>
    </el-dialog>
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
    align-items: center; /* Align items vertically in the middle */
    margin-bottom: 20px; /* Space before button */
}

.remember-forgot .el-form-item__content {
    display: flex;
    justify-content: space-between;
    width: 100%;
    align-items: center; /* Ensure items are aligned vertically within content */
}

.forgot-password-link {
  margin-left: auto; /* Push the link to the right */
}

.remember-me-checkbox {
  /* Removed margin-right: 250px; as justify-content handles spacing */
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