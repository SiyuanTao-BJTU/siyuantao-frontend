<script setup>
import { reactive, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElForm } from 'element-plus'; // Import ElForm for type hinting
import { Plus } from '@element-plus/icons-vue'; // Import Plus icon

// Assuming api.js exists and has an updateProfile method
// import api from '@/API_PRO.js'; 
// Assuming Vuex store exists and has user module with updateProfile action
// import { useStore } from 'vuex';

const router = useRouter();
// const store = useStore(); // Uncomment when integrating with Vuex

const profileForm = reactive({
  nickname: '',
  professional: '', // Corresponds to 'facauty' or 'verified_department' in backend data
  bio: '', // Corresponds to 'bio' in backend data
  phoneNumber: '', // Corresponds to 'contact_info' in backend data
  // avatar: null // For avatar file object or URL
  avatarUrl: null, // To display current avatar
});

// Basic validation rules (integrate with form_validation.js later)
const rules = {
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { max: 30, message: '昵称长度不能超过 30 个字符', trigger: 'blur' }
  ],
  // professional: [{ required: true, message: t('profileEdit.professional_required'), trigger: 'blur' }], // Decide if required
  // phoneNumber: [{ validator: (rule, value, callback) => { /* phone format validation */ }, trigger: 'blur' }], // Add phone format validation
};

const profileFormRef = ref<typeof ElForm | null>(null); // Ref for the form

// Fetch user data to prefill the form
onMounted(() => {
  // TODO: Fetch user data from Vuex store or API and prefill profileForm
  // Example fetching from Vuex (assuming userInfo is available):
  // const userInfo = store.getters['user/userInfo'];
  // if (userInfo) {
  //   profileForm.nickname = userInfo.username || ''; // Assuming nickname is username for now
  //   profileForm.professional = userInfo.facauty || userInfo.verified_department || '';
  //   profileForm.bio = userInfo.bio || '';
  //   profileForm.phoneNumber = userInfo.contact_info || '';
  //   profileForm.avatarUrl = userInfo.avatar_url || null;
  // }

  // Dummy data for UI testing
  profileForm.nickname = '李同学';
  profileForm.professional = '计算机科学与技术';
  profileForm.bio = '一个热爱编程的大学生';
  profileForm.phoneNumber = '13812345678';
  // profileForm.avatarUrl = 'some_dummy_avatar_url'; // Uncomment to test avatar preview
});

// Handle avatar upload success
const handleAvatarUploadSuccess = (response, file) => {
  // TODO: Process successful upload response
  console.log('Avatar upload success:', response, file);
  // Assuming the response contains the new avatar URL
  // profileForm.avatarUrl = response.data.url; // Update avatar preview
  ElMessage.success('头像上传成功'); // Add to i18n
};

// Before avatar upload check
const beforeAvatarUpload = (rawFile) => {
  // TODO: Add file type and size validation
  // if (rawFile.type !== 'image/jpeg') {
  //   ElMessage.error('Avatar picture must be JPG format!');
  //   return false;
  // }
  // if (rawFile.size / 1024 / 1024 > 2) {
  //   ElMessage.error('Avatar picture size can not exceed 2MB!');
  //   return false;
  // }
  console.log('Before avatar upload:', rawFile);
  return true; // Allow upload for now
};

const saveProfile = async () => {
  if (!profileFormRef.value) return;

  await profileFormRef.value.validate(async (valid) => {
    if (valid) {
      console.log('Form is valid, saving profile...');
      // TODO: Call Vuex action or API to update profile
      // Example using a dummy success:
      // try {
      //   // Construct data payload for API, including handling avatar upload if needed
      //   const updateData = { 
      //      username: profileForm.nickname, // Or a separate username field if nickname is different
      //      contact_info: profileForm.phoneNumber,
      //      bio: profileForm.bio,
      //      // Add other fields like professional
      //      // avatar_url: profileForm.avatarUrl // If API expects URL directly
      //      // or upload avatar file separately before calling updateProfile
      //   };
      //   // await store.dispatch('user/updateProfile', updateData);
      //   ElMessage.success(t('profileEdit.save_success'));
      //   router.push('/profile'); // Navigate back after saving
      // } catch (error) {
      //   console.error('Save profile failed:', error);
      //   ElMessage.error(t('profileEdit.save_failure')); // Error message handled by API wrapper ideally
      // }

      // Dummy success for UI testing
      ElMessage.success('资料更新成功');
      router.push('/profile'); // Navigate back after dummy save

    } else {
      console.log('Form validation failed');
      ElMessage.error('表单验证失败，请检查输入');
      return false;
    }
  });
};

const cancelEdit = () => {
  // TODO: Implement cancel logic - maybe confirm with user if changes are unsaved
  router.push('/profile'); // Navigate back without saving
};

</script>

<template>
  <div class="basic-container">
    <div class="center-container">
      <el-card class="edit-card">
        <h2>编辑个人资料</h2>
        <el-form
            :model="profileForm"
            :rules="rules"
            ref="profileFormRef"
            label-width="auto"
            class="profile-form"
        >
           <el-form-item :label="t('profileEdit.avatar')">
             <el-form-item label="头像">
               <el-upload
                  class="avatar-uploader"
                  action="YOUR_UPLOAD_URL"
                  :show-file-list="false"
                  :on-success="handleAvatarUploadSuccess" 
                  :before-upload="beforeAvatarUpload" 
               >
                 <!-- Display current avatar or placeholder -->
                 <img v-if="profileForm.avatarUrl" :src="profileForm.avatarUrl" class="avatar-preview"/>
                 <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
               </el-upload>
             </el-form-item>
           </el-form-item>
          <el-form-item :label="t('profileEdit.nickname')" prop="nickname">
          </el-form-item>
          <el-form-item label="昵称" prop="nickname">
             <el-input v-model="profileForm.nickname" :placeholder="t('profileEdit.nickname_placeholder')"/>
             <el-input v-model="profileForm.nickname" placeholder="请输入昵称"/>
           </el-form-item>
          <el-form-item :label="t('profileEdit.professional')" prop="professional">
          </el-form-item>
          <el-form-item label="专业" prop="professional">
             <el-input v-model="profileForm.professional" :placeholder="t('profileEdit.professional_placeholder')"/>
             <el-input v-model="profileForm.professional" placeholder="请输入专业"/>
           </el-form-item>
            <el-form-item :label="t('profileEdit.bio')" prop="bio">
            </el-form-item>
           <el-form-item label="个人简介" prop="bio">
              <el-input
                 v-model="profileForm.bio"
                 type="textarea"
                 :rows="3"
                 placeholder="请输入个人简介"
              />
           </el-form-item>
            <el-form-item :label="t('profileEdit.phoneNumber')" prop="phoneNumber">
            </el-form-item>
           <el-form-item label="手机号" prop="phoneNumber">
              <el-input v-model="profileForm.phoneNumber" :placeholder="t('profileEdit.phoneNumber_placeholder')"/>
              <el-input v-model="profileForm.phoneNumber" placeholder="请输入手机号"/>
           </el-form-item>

          <el-form-item>
            <div class="button-group">
              <el-button type="primary" @click="saveProfile">保存</el-button>
              <el-button @click="cancelEdit">取消</el-button>
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

.edit-card {
  width: 100%;
  padding: 30px; /* Padding inside the card */
  border-radius: 10px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.edit-card h2 {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 30px;
  text-align: center;
}

.profile-form .el-form-item {
  margin-bottom: 20px; /* Space between form items */
}

.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color-darker);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px; /* Avatar preview size */
  height: 100px; /* Avatar preview size */
  text-align: center;
}

.avatar-preview {
  width: 100px; /* Avatar preview size */
  height: 100px; /* Avatar preview size */
  display: block;
  object-fit: cover; /* Maintain aspect ratio */
  border-radius: 6px; /* Match container border radius */
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