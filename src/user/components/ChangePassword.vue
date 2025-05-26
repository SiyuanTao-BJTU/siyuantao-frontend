<script setup>
import { reactive, ref, watch, defineProps, defineEmits, nextTick } from 'vue';
import { ElMessage, ElForm } from 'element-plus';
import { View, Hide } from '@element-plus/icons-vue';
import api from '@/API_PRO.js';

// Assuming Vuex store exists and has user module with changePassword action
// import { useStore } from 'vuex';

// Component props and emits
const props = defineProps({
  isPasswordDialogVisible: Boolean,
});

const emits = defineEmits([
  'updateCancel',
  'updateSuccess',
]);

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmNewPassword: '',
});

const passwordDialogVisible = ref(props.isPasswordDialogVisible);
const oldPasswordVisible = ref(false);
const newPasswordVisible = ref(false);
const confirmNewPasswordVisible = ref(false);
const passwordFormRef = ref(null);

// Validation rules
const rules = {
  oldPassword: [
    { required: true, message: '请输入旧密码', trigger: 'blur' },
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '新密码长度应不少于 6 个字符', trigger: 'blur' },
  ],
  confirmNewPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { validator: (rule, value, callback) => {
      if (value !== passwordForm.newPassword) {
        callback(new Error('两次输入的新密码不一致'));
      } else {
        callback();
      }
    }, trigger: 'blur' },
  ],
};

watch(() => props.isPasswordDialogVisible, (newVal) => {
  passwordDialogVisible.value = newVal;
});

const handleClose = () => {
  resetForm();
  emits('updateCancel');
};

const resetForm = () => {
  if (passwordFormRef.value) {
    passwordFormRef.value.resetFields();
  }
  passwordForm.oldPassword = '';
  passwordForm.newPassword = '';
  passwordForm.confirmNewPassword = '';
};

const savePassword = async () => {
  console.log('ChangePassword.vue: savePassword method CALLED');
  await nextTick();
  if (!passwordFormRef.value) {
    console.error('ChangePassword.vue: passwordFormRef is NOT defined after nextTick!');
    return;
  }
  console.log('ChangePassword.vue: passwordFormRef is defined, calling validate...');

  await passwordFormRef.value.validate(async (valid, fields) => {
    console.log('ChangePassword.vue: Validate callback executed. Valid:', valid, 'Fields:', fields);
    if (valid) {
      console.log('ChangePassword.vue: Password form is valid, attempting to save password...');
      try {
        const passwordData = {
          old_password: passwordForm.oldPassword,
          new_password: passwordForm.newPassword,
        };
        console.log('ChangePassword.vue: Sending passwordData to API:', JSON.stringify(passwordData));
        // Call the API to change password
        const response = await api.userModifyPassword(passwordData);
        console.log('ChangePassword.vue: API userModifyPassword response:', response);

        ElMessage.success('密码修改成功');
        emits('updateSuccess');
        handleClose();
      } catch (error) {
        console.error('ChangePassword.vue: Change password API call failed:', error);
        // API wrapper should handle error messages, but adding a fallback here
        ElMessage.error('密码修改失败，详情请查看控制台');
      }
    } else {
      console.log('ChangePassword.vue: Password form validation failed');
      ElMessage.error('表单验证失败，请检查输入');
      return false;
    }
  });
};

const toggleOldPasswordVisibility = () => {
  oldPasswordVisible.value = !oldPasswordVisible.value;
};

const toggleNewPasswordVisibility = () => {
  newPasswordVisible.value = !newPasswordVisible.value;
};

const toggleConfirmNewPasswordVisibility = () => {
  confirmNewPasswordVisible.value = !confirmNewPasswordVisible.value;
};

</script>

<template>
  <el-dialog
      v-model="passwordDialogVisible"
      title="修改密码"
      width="400px"
      draggable
      @close="handleClose"
      @closed="handleClose"
  >
    <el-form
        :model="passwordForm"
        :rules="rules"
        ref="passwordFormRef"
        label-width="auto"
        class="password-form"
    >
      <el-form-item label="旧密码" prop="oldPassword">
        <el-input
            v-model="passwordForm.oldPassword"
            :type="oldPasswordVisible ? 'text' : 'password'"
            placeholder="请输入旧密码"
            autocomplete="off"
        >
           <template #suffix>
            <el-icon @click="toggleOldPasswordVisibility">
              <component :is="oldPasswordVisible ? Hide : View" />
            </el-icon>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item label="新密码" prop="newPassword">
        <el-input
            v-model="passwordForm.newPassword"
            :type="newPasswordVisible ? 'text' : 'password'"
            placeholder="请输入新密码"
            autocomplete="off"
        >
          <template #suffix>
            <el-icon @click="toggleNewPasswordVisibility">
              <component :is="newPasswordVisible ? Hide : View" />
            </el-icon>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item label="确认新密码" prop="confirmNewPassword">
        <el-input
            v-model="passwordForm.confirmNewPassword"
            :type="confirmNewPasswordVisible ? 'text' : 'password'"
            placeholder="请再次输入新密码"
            autocomplete="off"
            @keyup.enter="savePassword"
        >
          <template #suffix>
            <el-icon @click="toggleConfirmNewPasswordVisibility">
              <component :is="confirmNewPasswordVisible ? Hide : View" />
            </el-icon>
          </template>
        </el-input>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="savePassword">保存</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.password-form .el-form-item {
  margin-bottom: 20px;
}

.dialog-footer {
  text-align: right;
}

.dialog-footer .el-button {
  margin-left: 10px;
}
</style>
