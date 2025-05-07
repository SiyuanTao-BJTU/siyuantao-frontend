<script setup>
import { ref, reactive, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import api from '@/API_PRO.js';
import { ElMessage } from 'element-plus';

const props = defineProps({
  isVisible: Boolean,
  existingAuthData: Object, // To pre-fill if updating or re-submitting
});

const emits = defineEmits(['close', 'authSubmitted']);

const { t } = useI18n();
const formDialogVisible = ref(false);

const authForm = reactive({
  student_id: '',
  verified_real_name: '',
  verified_department: '',
  verified_class: '',
  verified_dormitory: '',
});

const formRules = reactive({
  student_id: [{ required: true, message: () => t('navigator.profile.auth_student_id_required'), trigger: 'blur' }],
  verified_real_name: [{ required: true, message: () => t('navigator.profile.auth_real_name_required'), trigger: 'blur' }],
  verified_department: [{ required: true, message: () => t('navigator.profile.auth_department_required'), trigger: 'blur' }],
});

const formRef = ref(null);

watch(() => props.isVisible, (newVal) => {
  formDialogVisible.value = newVal;
  if (newVal && props.existingAuthData) {
    // Pre-fill form if data exists (e.g., for re-submission)
    authForm.student_id = props.existingAuthData.student_id || '';
    authForm.verified_real_name = props.existingAuthData.verified_real_name || '';
    authForm.verified_department = props.existingAuthData.verified_department || '';
    authForm.verified_class = props.existingAuthData.verified_class || '';
    authForm.verified_dormitory = props.existingAuthData.verified_dormitory || '';
  } else if (newVal) {
    // Reset form for new submission
    formRef.value?.resetFields();
    authForm.student_id = '';
    authForm.verified_real_name = '';
    authForm.verified_department = '';
    authForm.verified_class = '';
    authForm.verified_dormitory = '';
  }
});

const handleCloseDialog = () => {
  formRef.value?.resetFields();
  emits('close');
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const payload = { ...authForm };
        // Remove optional fields if they are empty strings, as backend might expect null or them to be absent
        if (!payload.verified_class) delete payload.verified_class;
        if (!payload.verified_dormitory) delete payload.verified_dormitory;
        
        const response = await api.submitStudentAuth(payload);
        if (response.code === 0 || response.code === 200 || response.code === 201) {
          ElMessage.success(t('navigator.profile.auth_submit_success'));
          emits('authSubmitted'); // Notify parent to refresh data
          handleCloseDialog();
        } else {
          ElMessage.error(response.message || t('navigator.profile.auth_submit_failed'));
        }
      } catch (error) {
        console.error("Student auth submission error:", error);
        ElMessage.error(t('navigator.profile.auth_submit_failed'));
      }
    }
  });
};
</script>

<template>
  <el-dialog
    v-model="formDialogVisible"
    :title="t('navigator.profile.student_auth_dialog_title')"
    width="500px"
    @close="handleCloseDialog"
    :close-on-click-modal="false"
  >
    <el-form :model="authForm" :rules="formRules" ref="formRef" label-position="top">
      <el-form-item :label="t('navigator.profile.auth_student_id_label')" prop="student_id">
        <el-input v-model="authForm.student_id" :placeholder="t('navigator.profile.auth_student_id_prompt')" />
      </el-form-item>
      <el-form-item :label="t('navigator.profile.auth_real_name_label')" prop="verified_real_name">
        <el-input v-model="authForm.verified_real_name" :placeholder="t('navigator.profile.auth_real_name_prompt')" />
      </el-form-item>
      <el-form-item :label="t('navigator.profile.auth_department_label')" prop="verified_department">
        <el-input v-model="authForm.verified_department" :placeholder="t('navigator.profile.auth_department_prompt')" />
      </el-form-item>
      <el-form-item :label="t('navigator.profile.auth_class_label') + ' (' + t('navigator.profile.optional_field') + ')'" prop="verified_class">
        <el-input v-model="authForm.verified_class" :placeholder="t('navigator.profile.auth_class_prompt')" />
      </el-form-item>
      <el-form-item :label="t('navigator.profile.auth_dormitory_label') + ' (' + t('navigator.profile.optional_field') + ')'" prop="verified_dormitory">
        <el-input v-model="authForm.verified_dormitory" :placeholder="t('navigator.profile.auth_dormitory_prompt')" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCloseDialog">{{ t('navigator.profile.cancel_button') }}</el-button>
        <el-button type="primary" @click="handleSubmit">
          {{ t('navigator.profile.submit_button') }}
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style scoped>
.dialog-footer {
  text-align: right;
}
</style> 