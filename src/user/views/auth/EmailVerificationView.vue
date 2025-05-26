<script setup>
import { useRouter, useRoute } from 'vue-router';
import { Check } from '@element-plus/icons-vue'; // Assuming Element Plus icons are available
// import api from '@/API_PRO.js'; // Uncomment when backend API is ready
// import { ElMessage } from 'element-plus'; // Uncomment when showing API results

const router = useRouter();
const route = useRoute();

// TODO: Implement logic to get token from route and call backend API
// onMounted(() => {
//   const token = route.query.token; // Assuming token is a query parameter like /email-verification?token=...
//   if (token) {
//     // Call your backend API to verify the email
//     api.verifyEmail(token)
//       .then(response => {
//         // Handle success, maybe show a success message from the backend response
//         ElMessage.success('邮箱验证成功'); // Add to i18n
//       })
//       .catch(error => {
//         // Handle failure, show an error message
//         console.error('Email verification failed:', error);
//         ElMessage.error('邮箱验证失败'); // Add to i18n
//       });
//   } else {
//     // Handle case where token is missing
//     ElMessage.error('邮箱验证令牌缺失'); // Add to i18n
//   }
// });

const goToLogin = () => {
  router.push('/login');
};
</script>

<template>
  <div class="verification-container">
    <el-card class="verification-card">
      <div class="wait-icon">
        <el-icon><Check /></el-icon>
      </div>
      <h2>邮箱验证</h2>
      <p>我们还在开发，请耐心等待。请点击下方按钮返回平台。</p>
      <el-button type="primary" @click="goToLogin" class="login-button">返回平台</el-button>
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

.success-icon {
  font-size: 60px; /* Size of the icon */
  color: #67C23A; /* Success green color */
  margin-bottom: 20px; /* Space below icon */
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

.login-button {
    width: 100%; /* Make button full width */
}
</style> 