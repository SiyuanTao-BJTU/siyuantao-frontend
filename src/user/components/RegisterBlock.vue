<script setup>
import { reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import { View, Hide } from '@element-plus/icons-vue';
import { useStore } from 'vuex'; // 导入 useStore

// Assuming pattern.js exists and has necessary validation
import PatternCheck from "@/utils/pattern.js";
// Assuming API_PRO.js exists and has register method
// import api from '@/API_PRO.js';

// 获取 store 实例 - 移动到顶层
const store = useStore(); // <-- 这一行被移动到这里

// 组件全局属性事件定义
const emits = defineEmits(['registerSuccess']) // Emit event on successful registration

// 组件全局变量定义
const form = reactive({
  username: "",
  password: "",
  confirmPassword: "",
  major: "",
  phoneNumber: "", // 手机号字段
  verificationCode: "" // Added verification code field
});
const passwordVisible = ref(false);
const confirmPasswordVisible = ref(false);

// Validation rules
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度应为 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度应不少于 6 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: (rule, value, callback) => {
      if (value !== form.password) {
        callback(new Error('两次输入的密码不一致'));
      } else {
        callback();
      }
    }, trigger: 'blur' }
  ],
  major: [
    // 根据需求可以调整是否必填
  ],
  phoneNumber: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { validator: (rule, value, callback) => {
      const phone_res = PatternCheck.phone_check(value);
      if (!phone_res.valid) {
        callback(new Error(phone_res.error));
      } else {
        callback();
      }
    }, trigger: 'blur' }
  ],
  // verificationCode: [
  //   { required: true, message: '请输入验证码', trigger: 'blur' },
  //   { len: 6, message: '验证码长度应为 6 位', trigger: 'blur' }
  // ]
};

const registerFormRef = ref(null); // Ref for the form element

// Added function to request SMS code
const requestSmsCode = async () => {
  // TODO: Implement logic to call backend API to send SMS code
  if (!form.phoneNumber) {
    ElMessage.warning("请输入手机号码");
    return;
  }
  const phone_res = PatternCheck.phone_check(form.phoneNumber);
  if (!phone_res.valid) {
    ElMessage.error(phone_res.error);
    return;
  }

  console.log("Requesting SMS code for phone number:", form.phoneNumber);
  ElMessage.info("发送验证码功能待实现");
  // try {
  //   await api.requestSmsCode({ phone_number: form.phoneNumber }); // Assuming such an API exists
  //   ElMessage.success("验证码已发送，请查收短信。");
  // } catch (error) {
  //   console.error("请求验证码失败:", error);
  //   ElMessage.error(error.response?.data?.detail || "请求验证码失败");
  // }
};

// 组件全局函数定义
const handleRegisterClick = async () => {
  /**
   * 处理注册按钮点击事件
   */
  if (!registerFormRef.value) return;

  await registerFormRef.value.validate(async (valid) => {
    if (valid) {
      // Form is valid, proceed with registration
      console.log("Form is valid, attempting registration");

      try {
        // 调用 Vuex 的 register action
        await store.dispatch('user/register', {
          username: form.username,
          password: form.password,
          major: form.major || null, // 确保空字符串转换为 null
          phone_number: form.phoneNumber, // 发送手机号字段，现在是必填且已验证
          verification_code: form.verificationCode || null // Include verification code, if empty then null
        });

        // 注册成功由 store 中的 ElMessage 提示，这里只需处理成功后的逻辑
        emits('registerSuccess'); // 通知父组件
        resetForm(); // 重置表单

      } catch (error) {
        // 注册失败由 store 中的 ElMessage 提示，这里只需处理失败后的逻辑（如果需要）
        console.error("Registration failed in component:", error);
      }

    } else {
      console.log('Form validation failed');
      // ElMessage.error('表单验证失败，请检查输入'); // Removed general error as specific field errors will show
      return false;
    }
  });
};

const resetForm = () => {
  /**
   * 重置表单数据
   */
  if (registerFormRef.value) {
    registerFormRef.value.resetFields();
  }
  form.username = "";
  form.password = "";
  form.confirmPassword = "";
  form.major = "";
  form.phoneNumber = ""; // 重置手机号字段
  form.verificationCode = ""; // Reset verification code field
};

// 切换密码可见性
const togglePasswordVisibility = () => {
  passwordVisible.value = !passwordVisible.value;
}

const toggleConfirmPasswordVisibility = () => {
  confirmPasswordVisible.value = !confirmPasswordVisible.value;
}

</script>

<template>
  <el-form
      :model="form"
      :rules="rules"
      ref="registerFormRef"
      label-width="auto"
      class="register-form"
  >
    <el-form-item label="用户名" prop="username">
      <el-input v-model="form.username" placeholder="请输入用户名"/>
    </el-form-item>
    <el-form-item label="密码" prop="password">
      <el-input
          v-model="form.password"
          :type="passwordVisible ? 'text' : 'password'"
          placeholder="请输入密码"
          autocomplete="off"
      >
        <template #suffix>
          <el-icon @click="togglePasswordVisibility">
            <component :is="passwordVisible ? Hide : View" />
          </el-icon>
        </template>
      </el-input>
    </el-form-item>
    <el-form-item label="确认密码" prop="confirmPassword">
      <el-input
          v-model="form.confirmPassword"
          :type="confirmPasswordVisible ? 'text' : 'password'"
          placeholder="请再次输入密码"
          autocomplete="off"
           @keyup.enter="handleRegisterClick"
      >
         <template #suffix>
          <el-icon @click="toggleConfirmPasswordVisibility">
            <component :is="confirmPasswordVisible ? Hide : View" />
          </el-icon>
        </template>
      </el-input>
    </el-form-item>
    <el-form-item label="手机号" prop="phoneNumber">
      <el-input v-model="form.phoneNumber" placeholder="请输入手机号">
        <!-- <template #append>
          <el-button @click="requestSmsCode">发送验证码</el-button>
        </template> -->
      </el-input>
    </el-form-item>
    <!-- <el-form-item label="验证码" prop="verificationCode">
      <el-input v-model="form.verificationCode" placeholder="请输入短信验证码"/>
    </el-form-item> -->
    <el-form-item label="专业" prop="major">
      <el-input v-model="form.major" placeholder="请输入专业 (选填)"/>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="handleRegisterClick" class="register-button">注册</el-button>
    </el-form-item>
  </el-form>
</template>

<style scoped>
.register-form {
  width: 100%; /* Ensure form takes full width of its container */
}

.register-form .el-form-item {
    margin-bottom: 20px; /* Add space between form items */
}

.register-button {
  width: 100%; /* Full width button */
  background-color: #4A90E2; /* 主色调蓝色 */
  border-color: #4A90E2; /* 主色调蓝色 */
}

.register-button:hover {
    background-color: #6FA8DC; /* 鼠标悬停时稍浅的蓝色 */
    border-color: #6FA8DC; /* 鼠标悬停时稍浅的蓝色 */
}

/* Adjust Element Plus default styles for labels and inputs within this component */
/* These might be better globalized if applied consistently */
:deep(.el-form-item__label) {
    color: #333 !important; /* 深灰色文字 */
    font-weight: bold;
}

:deep(.el-input__inner) {
    background-color: #f5f5f5; /* 浅灰色背景 */
    border: 1px solid #dcdfe6; /* Element Plus 默认边框颜色 */
    box-shadow: none; /* 移除阴影 */
    color: #606266; /* Element Plus 默认输入文字颜色 */
    text-shadow: none !important; /* 确保移除文本阴影 */
    filter: none !important; /* 移除可能的滤镜效果 */
}

:deep(.el-input__inner::placeholder) {
  color: #a8a8a8; /* 占位符颜色 */
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

:deep(.el-button--primary) {
    background-color: #4A90E2 !important;
    border-color: #4A90E2 !important;
}

:deep(.el-button--primary:hover) {
    background-color: #6FA8DC !important;
    border-color: #6FA8DC !important;
}
</style>
