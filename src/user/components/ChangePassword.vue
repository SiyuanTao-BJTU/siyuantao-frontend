<script setup>
import { reactive, ref, watch, defineProps, defineEmits } from 'vue';
import { ElMessage, ElForm } from 'element-plus';
import { View, Hide } from '@element-plus/icons-vue';
import api from '@/API_PRO.js';

// Assuming Vuex store exists and has user module with changePassword action
// import { useStore } from 'vuex';

// Component props and emits
const props = defineProps({
  isPasswordDialogVisiable: Boolean,
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

const passwordDialogVisible = ref(props.isPasswordDialogVisiable);
const oldPasswordVisible = ref(false);
const newPasswordVisible = ref(false);
const confirmNewPasswordVisible = ref(false);
const passwordFormRef = ref<typeof ElForm | null>(null);

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

watch(() => props.isPasswordDialogVisiable, (newVal) => {
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
  if (!passwordFormRef.value) return;

  await passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      console.log('Password form is valid, saving password...');
      try {
        const passwordData = {
          old_password: passwordForm.oldPassword,
          new_password: passwordForm.newPassword,
        };
        // Call the API to change password
        await api.userModifyPassword(passwordData);

        ElMessage.success('密码修改成功');
        emits('updateSuccess');
        handleClose();
      } catch (error) {
        console.error('Change password failed:', error);
        // API wrapper should handle error messages, but adding a fallback here
        ElMessage.error('密码修改失败');
      }
    } else {
      console.log('Password form validation failed');
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
      <el-form-item :label="t('passwordDialog.old_password')" prop="oldPassword">
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
      <el-form-item :label="t('passwordDialog.new_password')" prop="newPassword">
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
      <el-form-item :label="t('passwordDialog.confirm_new_password')" prop="confirmNewPassword">
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
