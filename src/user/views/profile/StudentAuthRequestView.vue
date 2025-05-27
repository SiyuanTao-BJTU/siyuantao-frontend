<template>
  <div class="student-auth-request-container">
    <h1>学生身份认证</h1>
    <p>请输入您的校园邮箱，我们将发送一封验证邮件给您。</p>
    <el-form :model="form" @submit.prevent="requestVerification">
      <el-form-item label="校园邮箱">
        <el-input v-model="form.email" placeholder="请输入校园邮箱"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="requestVerification">发送验证邮件</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { ref } from 'vue';
import axiosClient from '@/axios_client/index.js';
import { ElMessage } from 'element-plus';

export default {
  name: 'StudentAuthRequestView',
  setup() {
    const form = ref({
      email: '',
    });

    const requestVerification = async () => {
      try {
        await axiosClient.post('/v1/users/me/request-student-verification-email', { email: form.value.email });
        ElMessage.success('验证邮件已发送，请检查您的邮箱。');
      } catch (error) {
        console.error('请求验证邮件失败:', error);
        const errorMessage = error.response?.data?.detail || '请求验证邮件失败，请稍后重试。';
        ElMessage.error(errorMessage);
      }
    };

    return {
      form,
      requestVerification,
    };
  },
};
</script>

<style scoped>
.student-auth-request-container {
  max-width: 500px;
  margin: 50px auto;
  padding: 20px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
h1 {
  text-align: center;
  margin-bottom: 20px;
}
</style> 