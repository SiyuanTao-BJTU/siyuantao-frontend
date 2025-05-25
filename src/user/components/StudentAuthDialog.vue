<script setup>
import { ref, reactive, watch } from 'vue';
import api from '@/API_PRO.js';
import { ElMessage } from 'element-plus';

const props = defineProps({
  isVisible: Boolean,
  existingAuthData: Object, // To pre-fill if updating or re-submitting
});

const emits = defineEmits(['close', 'authSubmitted']);

const formDialogVisible = ref(false);

const authForm = reactive({
  student_id: '',
  verified_real_name: '',
  verified_department: '',
  verified_class: '',
  verified_dormitory: '',
});

const formRules = reactive({
  student_id: [{ required: true, message: () => "请输入学号", trigger: 'blur' }],
  verified_real_name: [{ required: true, message: () => "请输入真实姓名", trigger: 'blur' }],
  verified_department: [{ required: true, message: () => "请输入院系", trigger: 'blur' }],
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
          ElMessage.success('学生认证信息提交成功');
          emits('authSubmitted'); // Notify parent to refresh data
          handleCloseDialog();
        } else {
          ElMessage.error(response.message || '学生认证信息提交失败');
        }
      } catch (error) {
        console.error("Student auth submission error:", error);
        ElMessage.error('学生认证信息提交失败');
      }
    }
  });
};
</script>

<template>
  <el-dialog
    v-model="formDialogVisible"
    title="学生认证"
    width="500px"
    @close="handleCloseDialog"
    :close-on-click-modal="false"
  >
    <el-form :model="authForm" :rules="formRules" ref="formRef" label-position="top">
      <el-form-item label="学号" prop="student_id">
        <el-input v-model="authForm.student_id" placeholder="请输入您的学号" />
      </el-form-item>
      <el-form-item label="真实姓名" prop="verified_real_name">
        <el-input v-model="authForm.verified_real_name" placeholder="请输入您的真实姓名" />
      </el-form-item>
      <el-form-item label="院系" prop="verified_department">
        <el-input v-model="authForm.verified_department" placeholder="请输入您的院系" />
      </el-form-item>
      <el-form-item :label="'班级 (' + '可选' + ')'" prop="verified_class">
        <el-input v-model="authForm.verified_class" placeholder="请输入您的班级" />
      </el-form-item>
      <el-form-item :label="'宿舍 (' + '可选' + ')'" prop="verified_dormitory">
        <el-input v-model="authForm.verified_dormitory" placeholder="请输入您的宿舍" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCloseDialog">取消</el-button>
        <el-button type="primary" @click="handleSubmit">
          提交
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