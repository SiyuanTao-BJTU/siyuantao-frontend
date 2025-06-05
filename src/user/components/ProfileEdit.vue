<script setup>
import { reactive, ref, onMounted, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElForm, ElDialog } from 'element-plus'; // Import ElForm and ElDialog
import { Plus } from '@element-plus/icons-vue'; // Import Plus icon
import BackendConfig from "../../../backend.config"; // Import BackendConfig

// Assuming api.js exists and has an updateProfile method
import api from '@/API_PRO.js'; // Import api
// Assuming Vuex store exists and has user module with updateProfile action
// import { useStore } from 'vuex';

const router = useRouter();
// const store = useStore(); // Uncomment when integrating with Vuex

// Define props
const props = defineProps({
  isProfileEditDialogVisible: Boolean,
  userInfo: Object // Prop to receive user info from parent
});

// Define emits
const emits = defineEmits(['updateCancel', 'updateSuccess']);

// Local ref for dialog visibility, synced with prop
const localDialogVisible = ref(props.isProfileEditDialogVisible);

const profileForm = reactive({
  username: '', // Display username, not editable
  major: '', // Corresponds to 'major' in backend data (openapi.json)
  bio: '', // Corresponds to 'bio' in backend data
  phoneNumber: '', // Corresponds to 'phone_number' in backend data (openapi.json)
  // avatar: null // For avatar file object or URL
  avatarUrl: null, // To display current avatar
});

// Basic validation rules (integrate with form_validation.js later)
const rules = {
  // username is read-only
  major: [
    // { required: true, message: '请输入专业', trigger: 'blur' }, // Decide if major is required
    { max: 100, message: '专业长度不能超过 100 个字符', trigger: 'blur' }
  ],
  bio: [
    { max: 500, message: '个人简介长度不能超过 500 个字符', trigger: 'blur' }
  ],
  phoneNumber: [
    { required: true, message: '请输入手机号', trigger: 'blur' }, // Assuming phone number is required as per design
    // TODO: Add phone number format validation if needed
    { max: 20, message: '手机号长度不能超过 20 个字符', trigger: 'blur' }
  ],
};

const profileFormRef = ref(null); // Simplified ref definition

// Watch for prop changes to update localDialogVisible
watch(() => props.isProfileEditDialogVisible, (newValue) => {
  localDialogVisible.value = newValue;
  if (newValue && props.userInfo) {
    // Populate form with current user info when dialog opens
    profileForm.username = props.userInfo.用户名 || ''; // 使用中文键名
    profileForm.major = props.userInfo.专业 || ''; // 使用中文键名
    profileForm.bio = props.userInfo.个人简介 || ''; // 使用中文键名
    profileForm.phoneNumber = props.userInfo.手机号码 || ''; // 使用中文键名
    // Construct full avatar URL if avatarUrl is a relative path
    profileForm.avatarUrl = props.userInfo.头像URL ? 
      BackendConfig.RESTFUL_API_URL.replace(/\/api\/?$/, '') + (props.userInfo.头像URL.startsWith('/') ? props.userInfo.头像URL : '/' + props.userInfo.头像URL) : null;
  } else if (!newValue && profileFormRef.value) {
      // Optionally reset form when dialog closes
      profileFormRef.value.resetFields();
       // Also manually reset other fields not controlled by resetFields if necessary
       profileForm.username = '';
       profileForm.avatarUrl = null;
  }
});

// Custom upload handler for avatar
const handleAvatarHttpRequest = async (options) => {
  console.log('handleAvatarHttpRequest called. options.file:', options.file);
  console.log('options.file type:', typeof options.file);
  if (options.file) {
    console.log('options.file name:', options.file.name);
    console.log('options.file size:', options.file.size);
    console.log('options.file type (MIME):', options.file.type);
  }
  const formData = new FormData();
  formData.append('avatar_file', options.file);
  // Also log the FormData content (for debugging, might be complex for large files)
  for (let pair of formData.entries()) {
    console.log(pair[0]+ ', ' + pair[1]);
  }
  try {
    const response = await api.uploadUserAvatar(formData);
    options.onSuccess(response); // Call onSuccess with the response data
  } catch (error) {
    console.error('Avatar upload failed:', error);
    options.onError(error); // Call onError with the error
  }
};

// Handle avatar upload success
const handleAvatarUploadSuccess = (response) => {
  console.log('Avatar upload success:', response);
  // Update avatar preview with the URL from backend response, ensuring full path
  profileForm.avatarUrl = response.头像URL ? 
    BackendConfig.RESTFUL_API_URL.replace(/\/api$/, '') + response.头像URL : null; 
  ElMessage.success('头像上传成功');
  emits('updateSuccess'); // Trigger profile update in parent to refresh user info
};

// Before avatar upload check
const beforeAvatarUpload = (rawFile) => {
  const isJPG = rawFile.type === 'image/jpeg' || rawFile.type === 'image/png' || rawFile.type === 'image/gif';
  const isLt2M = rawFile.size / 1024 / 1024 < 2;

  if (!isJPG) {
    ElMessage.error('头像图片只能是 JPG/PNG/GIF 格式!');
  }
  if (!isLt2M) {
    ElMessage.error('头像图片大小不能超过 2MB!');
  }
  return isJPG && isLt2M;
};

const saveProfile = async () => {
  if (profileForm.username && profileForm.username.length < 3) {
    // 使用你的通知系统提示错误，例如：
    // this.$store.dispatch('showSnackbar', { message: '用户名长度不能少于3个字符', color: 'error' });
    alert('用户名长度不能少于3个字符'); // 简单示例
    return;
  }
  if (profileForm.username && profileForm.username.length > 128) {
    alert('用户名长度不能超过128个字符');
    return;
  }
  await nextTick(); // Wait for DOM updates
  if (!profileFormRef.value) {
    console.error('ProfileEdit.vue: profileFormRef is NOT defined after nextTick!');
    return;
  }

  await profileFormRef.value.validate(async (valid, fields) => {
    if (valid) {
      try {
        const updateData = { 
          username: profileForm.username, // Include username
          major: profileForm.major || null, 
          phone_number: profileForm.phoneNumber || null, 
          bio: profileForm.bio || null,
        }; // avatar_url is updated via separate API call
        
        // Call the API to update user profile
        const response = await api.updateUserProfile(updateData);

        ElMessage.success('资料更新成功');
        emits('updateSuccess'); // Emit success event
      } catch (error) {
        console.error('ProfileEdit.vue: Save profile API call failed:', error);
        // API wrapper should handle error messages, but adding a fallback here
        ElMessage.error('资料更新失败，详情请查看控制台'); 
      }

    } else {
      console.log('Form validation failed');
      ElMessage.error('表单验证失败，请检查输入');
      return false;
    }
  });
};

const cancelEdit = () => {
  // TODO: Implement cancel logic - maybe confirm with user if changes are unsaved
  emits('updateCancel'); // Emit cancel event
};

</script>

<template>
  <el-dialog
    v-model="localDialogVisible"
    title="编辑个人资料"
    width="500px"
    :before-close="cancelEdit" 
  >
    <el-form
      :model="profileForm"
      :rules="rules"
      ref="profileFormRef"
      label-width="auto"
      class="profile-form"
    >
      <!-- 头像上传 -->
      <el-form-item label="头像">
        <el-upload
          class="avatar-uploader"
          action=""
          :show-file-list="false"
          :http-request="handleAvatarHttpRequest" 
          :on-success="handleAvatarUploadSuccess"
          :before-upload="beforeAvatarUpload"
        >
          <!-- Display current avatar or placeholder -->
          <img v-if="profileForm.avatarUrl" :src="profileForm.avatarUrl" class="avatar-preview"/>
          <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
        </el-upload>
      </el-form-item>

      <!-- 用户名 (可编辑) -->
      <el-form-item label="用户名" prop="username">
        <el-input v-model="profileForm.username" />
      </el-form-item>

      <!-- 专业 -->
      <el-form-item label="专业" prop="major">
        <el-input v-model="profileForm.major" placeholder="请输入专业 (选填)"/>
      </el-form-item>

      <!-- 个人简介 -->
      <el-form-item label="个人简介" prop="bio">
        <el-input
          v-model="profileForm.bio"
          type="textarea"
          :rows="3"
          placeholder="请输入个人简介"
        />
      </el-form-item>

      <!-- 手机号 -->
      <el-form-item label="手机号" prop="phoneNumber">
        <el-input v-model="profileForm.phoneNumber" placeholder="请输入手机号"/>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="cancelEdit">取消</el-button>
        <el-button type="primary" @click="saveProfile">保存</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
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

.dialog-footer {
  display: flex;
  justify-content: flex-end; /* Align buttons to the right */
  width: 100%;
}

.dialog-footer .el-button {
  margin-left: 20px; /* Space between buttons */
  min-width: 100px; /* Minimum button width */
}
</style> 