<script setup>
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Check, CircleClose, Loading } from '@element-plus/icons-vue';
import api from '@/API_PRO.js';
import { useStore } from 'vuex';

const router = useRouter();
const store = useStore();

const formRef = ref(null); // Reference to the form component
const form = reactive({
  email: '',
  otp: '',
});

const verificationStep = ref('request_otp'); // 'request_otp', 'verify_otp', 'success', 'error'
const errorMessage = ref('');

const isSendingOtp = ref(false);
const isVerifyingOtp = ref(false);

const countdown = ref(60); // OTP countdown in seconds
const isCounting = ref(false);
let countdownTimer = null;

const rules = reactive({
  email: [
    { required: true, message: '请输入校园邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' },
    { pattern: /[^@]+@bjtu\.edu\.cn$/, message: '只允许使用北京交通大学邮箱地址 (@bjtu.edu.cn)', trigger: 'blur' },
  ],
  otp: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { min: 6, max: 6, message: '验证码必须是6位数字', trigger: 'blur' },
    { pattern: /^[0-9]{6}$/, message: '验证码必须是6位数字', trigger: 'blur' },
  ],
});

const startCountdown = () => {
  isCounting.value = true;
  countdown.value = 60; // Reset countdown
  countdownTimer = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--;
    } else {
      clearInterval(countdownTimer);
      isCounting.value = false;
    }
  }, 1000);
};

const requestOtp = async () => {
  if (!formRef.value) return;

  await formRef.value.validateField('email', async (valid) => {
    if (valid) {
      isSendingOtp.value = true;
      try {
        await api.requestStudentVerificationOtp({ email: form.email + '@bjtu.edu.cn' });
        ElMessage.success('验证码已发送到您的邮箱，请查收！');
        verificationStep.value = 'verify_otp';
        startCountdown();
      } catch (error) {
        console.error('请求验证码失败:', error);
        errorMessage.value = error.response?.data?.detail || '请求验证码失败，请稍后重试。';
        verificationStep.value = 'error';
        ElMessage.error(errorMessage.value);
      } finally {
        isSendingOtp.value = false;
      }
    }
  });
};

const verifyOtp = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (valid) {
      isVerifyingOtp.value = true;
      try {
        const response = await api.verifyStudentVerificationOtp({ email: form.email + '@bjtu.edu.cn', otp: form.otp });
        if (response.is_verified) {
          ElMessage.success('邮箱验证成功！');
          verificationStep.value = 'success';
          // Re-fetch user info to update is_verified status in store
          await store.dispatch('user/fetchCurrentUserProfile');
          // 重定向到用户主页或之前尝试访问的页面
          router.push(router.currentRoute.value.query.redirect || '/');
        } else {
          errorMessage.value = response.message || '邮箱验证失败：未知错误。';
          verificationStep.value = 'error';
          ElMessage.error(errorMessage.value);
        }
      } catch (error) {
        console.error('验证码验证失败:', error);
        errorMessage.value = error.response?.data?.detail || '验证码验证失败，请稍后重试。';
        verificationStep.value = 'error';
        ElMessage.error(errorMessage.value);
      } finally {
        isVerifyingOtp.value = false;
      }
    }
  });
};

const resetToRequest = () => {
  verificationStep.value = 'request_otp';
  form.otp = ''; // Clear OTP field
  errorMessage.value = '';
  clearInterval(countdownTimer);
  isCounting.value = false;
  countdown.value = 60;
};

const goToProfile = () => {
  router.push('/profile');
};

// No longer needed since we are not using URL tokens
// onMounted(async () => {
//   const token = route.query.token;
//   if (token) {
//     // If a token is in the URL, assume it's an old magic link and throw an error
//     errorMessage.value = '此验证链接已过期或无效，请使用最新的 OTP 验证流程。\n请前往个人中心重新请求学生身份验证OTP。'
//     verificationStep.value = 'error';
//     ElMessage.error(errorMessage.value);
//   }
// });

</script>

<template>
  <div class="verification-container">
    <el-card class="verification-card">
      <h2>学生邮箱验证</h2>
      
      <div v-if="verificationStep === 'request_otp'">
        <p>请输入您的校园邮箱，我们将发送验证码。</p>
        <el-form :model="form" :rules="rules" ref="formRef" @submit.prevent="requestOtp">
          <el-form-item prop="email">
            <el-input v-model="form.email" placeholder="请输入校园邮箱">
              <template #append>@bjtu.edu.cn</template>
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="requestOtp" :loading="isSendingOtp" :disabled="isCounting">
              {{ isCounting ? `${countdown}秒后重新发送` : '获取验证码' }}
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <div v-else-if="verificationStep === 'verify_otp'">
        <p style="margin-bottom: 20px;">验证码已发送至 <strong>{{ form.email }}</strong>。请检查您的邮箱。</p>
        <el-form :model="form" :rules="rules" ref="formRef" @submit.prevent="verifyOtp">
          <el-form-item prop="otp">
            <el-input v-model="form.otp" placeholder="请输入6位验证码"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="verifyOtp" :loading="isVerifyingOtp">验证邮箱</el-button>
            <el-button @click="resetToRequest" :disabled="isCounting">重新获取邮箱</el-button>
          </el-form-item>
        </el-form>
      </div>

      <div v-else-if="verificationStep === 'success'">
        <div class="icon-container">
          <el-icon class="success-icon"><Check /></el-icon>
        </div>
        <h3>邮箱验证成功！</h3>
        <p>您的学生身份已成功验证。</p>
        <el-button type="primary" @click="goToProfile" class="profile-button">前往个人中心</el-button>
      </div>

      <div v-else-if="verificationStep === 'error'">
        <div class="icon-container">
          <el-icon class="error-icon"><CircleClose /></el-icon>
        </div>
        <h3>邮箱验证失败</h3>
        <p>{{ errorMessage }}</p>
        <el-button type="primary" @click="resetToRequest" class="retry-button">重新验证</el-button>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.verification-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #CAD9F1; /* Light blue background */
  padding: 20px;
  box-sizing: border-box;
}

.verification-card {
  width: 100%;
  max-width: 400px; /* Adjust card width as needed */
  text-align: center;
  padding: 30px 20px; /* Add padding inside card */
  border-radius: 10px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.icon-container {
    font-size: 60px; /* Size of the icon */
    margin-bottom: 20px; /* Space below icon */
}

.success-icon {
  color: #67C23A; /* Success green color */
}

.error-icon {
    color: #F56C6C; /* Error red color */
}

.is-loading {
    color: #409EFF; /* Primary blue for loading */
    animation: rotating 2s linear infinite; /* Simple rotation animation */
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.verification-card h2 {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 10px;
}

.verification-card p {
  font-size: 16px;
  color: #606266;
  margin-bottom: 30px; /* Space below message */
}

.login-button,
.profile-button {
    width: 100%; /* Make button full width */
    margin-top: 10px; /* Space between buttons if both are shown */
}
</style> 