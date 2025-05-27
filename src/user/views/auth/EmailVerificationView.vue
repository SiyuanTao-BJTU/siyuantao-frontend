<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Check, CircleClose } from '@element-plus/icons-vue';
import axios from 'axios'; // Use axios directly
import { ElMessage } from 'element-plus';

const router = useRouter();
const route = useRoute();

const verificationStatus = ref('verifying'); // 'verifying', 'success', 'error'
const statusMessage = ref('正在验证您的邮箱...');

onMounted(async () => {
  const token = route.query.token;
  if (!token) {
    verificationStatus.value = 'error';
    statusMessage.value = '验证令牌缺失。';
    ElMessage.error('验证令牌缺失。');
    return;
  }

  try {
    const response = await axios.post('/api/v1/auth/verify-email', { token: token });
    // Assuming backend returns a success status or message upon successful verification
    if (response.status === 200) { // Or check a specific field in response.data
      verificationStatus.value = 'success';
      statusMessage.value = '邮箱验证成功！'; // This message will appear for both regular and student verification
      ElMessage.success('邮箱验证成功！');
      // Optionally redirect after a delay or show a button to go to profile/dashboard
      setTimeout(() => {
        router.push('/profile'); // Redirect to profile or dashboard after success
      }, 3000);
    } else {
        verificationStatus.value = 'error';
        statusMessage.value = response.data.message || '邮箱验证失败。';
        ElMessage.error(statusMessage.value);
    }
  } catch (error) {
    console.error('Email verification failed:', error);
    verificationStatus.value = 'error';
    statusMessage.value = error.response?.data?.detail || '邮箱验证过程中发生错误。';
    ElMessage.error(statusMessage.value);
  }
});

const goToLogin = () => {
  router.push('/login');
};
</script>

<template>
  <div class="verification-container">
    <el-card class="verification-card">
      <div class="icon-container">
        <el-icon v-if="verificationStatus === 'verifying'" class="is-loading"><Loading /></el-icon> <!-- Assuming Loading icon exists or use a spinner -->
        <el-icon v-else-if="verificationStatus === 'success'" class="success-icon"><Check /></el-icon>
        <el-icon v-else-if="verificationStatus === 'error'" class="error-icon"><CircleClose /></el-icon>
      </div>
      <h2>邮箱验证</h2>
      <p>{{ statusMessage }}</p>
      <el-button v-if="verificationStatus !== 'verifying'" type="primary" @click="goToLogin" class="login-button">返回登录</el-button>
       <el-button v-if="verificationStatus === 'success'" type="success" @click="() => router.push('/profile')" class="profile-button">前往个人中心</el-button>
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