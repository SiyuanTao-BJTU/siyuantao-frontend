<template>
  <el-dialog
    v-model="dialogVisible"
    title="学生身份认证"
    width="500px"
    :before-close="handleClose"
    destroy-on-close
  >
    <div v-if="currentStep === 'request_email'">
      <p>请输入您的校园邮箱，我们将发送一封验证邮件给您。</p>
      <el-form :model="form" @submit.prevent="requestVerification">
        <el-form-item label="校园邮箱">
          <el-input v-model="form.email" placeholder="请输入校园邮箱">
            <template #append>@bjtu.edu.cn</template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="requestVerification" :loading="loading">发送验证邮件</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div v-else-if="currentStep === 'enter_otp'">
      <p>验证码已发送至 <strong>{{ form.email }}@bjtu.edu.cn</strong>，请在下方输入验证码。</p>
      <el-form :model="form" @submit.prevent="verifyOtp">
        <el-form-item label="验证码">
          <el-input v-model="form.otp" placeholder="请输入6位验证码" maxlength="6"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="success" @click="verifyOtp" :loading="loading">验证</el-button>
          <el-button type="info" @click="currentStep = 'request_email'; form.otp = '';">重新发送</el-button>
        </el-form-item>
      </el-form>
    </div>
  </el-dialog>
</template>

<script>
import { ref, watch } from 'vue';
import api from '@/API_PRO.js';
import { ElMessage } from 'element-plus';

export default {
  name: 'StudentAuthDialog',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:visible', 'success', 'close'],
  setup(props, { emit }) {
    const dialogVisible = ref(props.visible);
    const currentStep = ref('request_email'); // 'request_email' or 'enter_otp'
    const form = ref({
      email: '',
      otp: '', // 新增 OTP 字段
    });
    const loading = ref(false);

    watch(() => props.visible, (newVal) => {
      dialogVisible.value = newVal;
      if (newVal) {
        // Reset form and step when dialog becomes visible
        form.value.email = '';
        form.value.otp = '';
        currentStep.value = 'request_email';
      }
    });

    const handleClose = () => {
      dialogVisible.value = false;
      emit('update:visible', false);
      emit('close');
      // Reset internal state when dialog is closed
      form.value.email = '';
      form.value.otp = '';
      currentStep.value = 'request_email';
    };

    const requestVerification = async () => {
      loading.value = true;
      try {
        const fullEmail = form.value.email + '@bjtu.edu.cn';
        await api.requestStudentVerificationOtp({ email: fullEmail });
        ElMessage.success('验证码已发送，请检查您的邮箱。' + ' 如果未收到，请检查垃圾邮件或稍后重试。');
        currentStep.value = 'enter_otp'; // Move to OTP input step
      } catch (error) {
        console.error('请求验证码失败:', error);
        const errorMessage = error.response?.data?.detail || '请求验证码失败，请稍后重试。';
        ElMessage.error(errorMessage);
      } finally {
        loading.value = false;
      }
    };

    const verifyOtp = async () => {
      loading.value = true;
      try {
        const fullEmail = form.value.email + '@bjtu.edu.cn';
        await api.verifyStudentVerificationOtp({
          email: fullEmail,
          otp: form.value.otp,
        });
        ElMessage.success('学生身份认证成功！');
        emit('success'); // Emit success event
        handleClose(); // Close dialog on success
      } catch (error) {
        console.error('验证码验证失败:', error);
        const errorMessage = error.response?.data?.detail || '验证码验证失败，请检查验证码是否正确或已过期。';
        ElMessage.error(errorMessage);
      } finally {
        loading.value = false;
      }
    };

    return {
      dialogVisible,
      currentStep,
      form,
      loading,
      requestVerification,
      verifyOtp,
      handleClose,
    };
  },
};
</script>

<style scoped>
/* Scoped styles specific to the dialog */
/* Remove or adjust old styles that might interfere with el-dialog defaults */
.student-auth-request-container { /* This class is from the old view, may not be needed */
  max-width: 500px;
  margin: 0 auto; /* Adjust for dialog content */
  padding: 20px;
  /* Remove border, box-shadow if el-dialog provides its own styling */
}
h1 { /* This H1 is now the dialog title, so no longer needed here */
  text-align: center;
  margin-bottom: 20px;
}
</style> 