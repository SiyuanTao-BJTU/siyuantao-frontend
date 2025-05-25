<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElForm, ElUpload } from 'element-plus'; // Import ElForm and ElUpload for type hinting
import { Plus } from '@element-plus/icons-vue'; // Import Plus icon

// Assuming api.js exists and has a submitStudentAuth method
// import api from '@/API_PRO.js';

const router = useRouter();

const authForm = reactive({
  studentId: '',
  realName: '',
  department: '',
  major: '',
  // authFile: null // For the uploaded file object(s)
});

// Basic validation rules
const rules = { // TODO: Integrate with form_validation.js and add more specific rules
  studentId: [
    { required: true, message: '请输入学号', trigger: 'blur' },
    // { pattern: /\d+/, message: t('studentAuth.student_id_invalid'), trigger: 'blur' }, // Example pattern
  ],
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' },
  ],
  department: [
    { required: true, message: '请输入院系', trigger: 'blur' },
  ],
  major: [
    { required: true, message: '请输入专业', trigger: 'blur' },
  ],
  // authFile: [{ required: true, message: t('studentAuth.auth_file_required'), trigger: 'change' }], // Add file required validation
};

const authFormRef = ref<typeof ElForm | null>(null); // Ref for the form

// Handle file upload changes (you might need more complex logic depending on how many files are allowed)
const handleFileChange = (file, fileList) => {
  // TODO: Handle file selection
  console.log('File selected:', file, fileList);
  // authForm.authFile = fileList; // Store the file list
};

const beforeFileUpload = (rawFile) => {
  // TODO: Add file type and size validation
  // if (!['image/jpeg', 'image/png', 'application/pdf'].includes(rawFile.type)) {
  //   ElMessage.error('Authentication file must be JPG, PNG, or PDF format!');
  //   return false;
  // }
  // if (rawFile.size / 1024 / 1024 > 5) { // Example: max 5MB
  //   ElMessage.error('Authentication file size can not exceed 5MB!');
  //   return false;
  // }
  console.log('Before file upload:', rawFile);
  return true; // Allow upload for now
};

const submitAuthentication = async () => {
  if (!authFormRef.value) return;

  await authFormRef.value.validate(async (valid) => {
    if (valid) {
      console.log('Form is valid, submitting student authentication...');
      // TODO: Call API to submit authentication data and file(s)
      // Example using a dummy success:
      // try {
      //   const authData = { 
      //      student_id: authForm.studentId,
      //      real_name: authForm.realName,
      //      department: authForm.department,
      //      major: authForm.major,
      //      // Include file(s) in the request payload (e.g., using FormData)
      //   };
      //   // await api.submitStudentAuth(authData);
      //   ElMessage.success(t('studentAuth.submit_success'));
      //   router.push('/profile'); // Navigate back after submission
      // } catch (error) {
      //   console.error('Submit authentication failed:', error);
      //   // Error message handled by API wrapper ideally
      //   // ElMessage.error(t('studentAuth.submit_failure'));
      // }

      // Dummy success for UI testing
      ElMessage.success('学生认证信息提交成功');
      router.push('/profile'); // Navigate back after dummy submission

    } else {
      console.log('Form validation failed');
      ElMessage.error('表单验证失败，请检查输入');
      return false;
    }
  });
};

const cancelSubmission = () => {
  // TODO: Implement cancel logic - maybe confirm with user if changes are unsaved
  router.push('/profile'); // Navigate back without submitting
};

</script>

<template>
  <div class="basic-container">
    <div class="center-container">
      <el-card class="auth-card">
        <h2>学生认证</h2>
        <el-form
            :model="authForm"
            :rules="rules"
            ref="authFormRef"
            label-width="auto"
            class="auth-form"
        >
          <el-form-item label="学号" prop="studentId">
            <el-input v-model="authForm.studentId" placeholder="请输入您的学号"/>
          </el-form-item>
           <el-form-item label="真实姓名" prop="realName">
            <el-input v-model="authForm.realName" placeholder="请输入您的真实姓名"/>
          </el-form-item>
           <el-form-item label="院系" prop="department">
            <el-input v-model="authForm.department" placeholder="请输入您的院系"/>
          </el-form-item>
           <el-form-item label="专业" prop="major">
            <el-input v-model="authForm.major" placeholder="请输入您的专业"/>
          </el-form-item>
          
          <el-form-item label="认证文件" prop="authFile"> <!-- prop needs to match the data key if using file validation -->
            <!-- TODO: Implement robust File Upload Component for multiple files if needed -->
            <el-upload
              action="YOUR_UPLOAD_ACTION_URL" 
              :on-change="handleFileChange" 
              :before-upload="beforeFileUpload"
               :auto-upload="false" 
              limit="1" 
              accept=".jpg,.jpeg,.png,.pdf" 
            >
              <el-button type="primary"><el-icon><Plus /></el-icon>选择文件</el-button>
            </el-upload>
             <!-- TODO: Add a hint text for file requirements -->
          </el-form-item>

          <el-form-item>
            <div class="button-group">
              <el-button type="primary" @click="submitAuthentication">提交认证</el-button>
              <el-button @click="cancelSubmission">取消</el-button>
            </div>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.basic-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #CAD9F1; /* Light blue background */
  padding: 20px;
  box-sizing: border-box;
}

.center-container{
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 700px; /* Adjust width for the form card */
}

.auth-card {
  width: 100%;
  padding: 30px; /* Padding inside the card */
  border-radius: 10px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.auth-card h2 {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 30px;
  text-align: center;
}

.auth-form .el-form-item {
  margin-bottom: 20px; /* Space between form items */
}

.button-group {
  display: flex;
  justify-content: flex-end; /* Align buttons to the right */
  width: 100%;
}

.button-group .el-button {
  margin-left: 20px; /* Space between buttons */
  min-width: 100px; /* Minimum button width */
}
</style> 