<script setup>
  import {onMounted, ref, reactive, computed} from "vue";
  import { useI18n } from "vue-i18n";
  import {Back, EditPen, Plus} from "@element-plus/icons-vue";
  import api from '@/API_PRO.js'; // 导入新的 API 服务
  import { ElMessage, ElDescriptions, ElDescriptionsItem, ElTag, ElUpload } from "element-plus";
  import PatternCheck from "@/utils/pattern.js";
  import router from "@/router/index.js";
  import StudentAuthDialog from './StudentAuthDialog.vue'; // Import the new dialog

  // 组件事件与属性定义
  const props = defineProps({
    database_id: [String, Number],
    username: String,
    email: String,
    contact: [String, Number],
    bio: String,
    avatarUrl: String,
    studentProfileData: Object,
    componentKey: Number,
    isSearching: Boolean,
    credit_score: [Number, null]
  });

  const emits = defineEmits([
    "updateSuccess",
  ])

  // 组件全局变量定义
  const { t } = useI18n(); // 解构出t函数，t函数用于获取当前语言环境下的文本
  let isEdit = ref(false); // 是否进入个人信息编辑状态
  let type_radio = ref("Calendar")
  let comment_info = ref([]); // 评论信息
  let studentAuthDialogVisible = ref(false); // Control visibility of the new dialog

  const origin_form = reactive({
    username: "",
    email: "",
    contact: "",
    bio: "",
    avatarUrl: "",
    credit_score: null
  })

  const modify_form = reactive({
    username: "",
    email: "",
    contact: "",
    bio: "",
    avatarUrl: ""
  })

  const calendar = ref("null")
  const selectDate = (val) => {
    if (!calendar.value) return
    calendar.value.selectDate(val)
  }
  let origin_avatar_char = computed(() => (origin_form.username || "").slice(0, 2).toUpperCase());
  let modify_avatar_char = computed(() => (modify_form.username || "").slice(0, 2).toUpperCase());

  // Avatar Upload related
  const imageUrl = ref('') // For previewing uploaded image

  // Computed property for el-rate v-model (0-5 scale)
  const creditRate = computed(() => {
    if (origin_form.credit_score === null || origin_form.credit_score === undefined) {
      return 0;
    }
    // Convert 0-100 scale to 0-5 scale
    return Math.max(0, Math.min(5, origin_form.credit_score / 20));
  });

  // Optional: Computed property for text displayed next to stars
  const creditRateText = computed(() => {
    const score = origin_form.credit_score;
    if (score === null || score === undefined) return t('profile.credit_score_unavailable');
    // You can customize these texts or use el-rate's default behavior
    if (score >= 90) return `${t('profile.credit_status_excellent')} (${score})`; 
    if (score >= 80) return `${t('profile.credit_status_good')} (${score})`;
    if (score >= 70) return `${t('profile.credit_status_fair')}) (${score})`; // Added Fair for more granularity with 5 stars
    if (score >= 60) return `${t('profile.credit_status_average')} (${score})`;
    return `${t('profile.credit_status_low')} (${score})`;
  });

  const handleAvatarSuccess = (
    response, // This should be the 'data' part of the backend response, i.e., the UploadedImage object
    uploadFile
  ) => {
    if (response && response.url) {
      modify_form.avatarUrl = response.url;
      if (uploadFile.raw) { 
        imageUrl.value = URL.createObjectURL(uploadFile.raw); 
      }
      ElMessage.success(t('profile.avatar_upload_success'));
    } else {
      // This case might be less common if customAvatarUpload handles API errors pobreza
      ElMessage.error(t('profile.avatar_upload_fail_response')); 
    }
  }

  const beforeAvatarUpload = (rawFile) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(rawFile.type)) {
      ElMessage.error(t('profile.avatar_type_error')) // Add this to i18n: 'Avatar picture must be JPG/PNG/GIF format!'
      return false
    }
    if (rawFile.size / 1024 / 1024 > 2) {
      ElMessage.error(t('profile.avatar_size_error')) // Add this to i18n: 'Avatar picture size can not exceed 2MB!'
      return false
    }
    return true
  }

  // Custom HTTP request for avatar upload
  const customAvatarUpload = async (options) => {
    const { file, onSuccess, onError } = options;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_type', 'avatar');

    try {
      const response = await api.imagesUploadCreate(formData); // Use the actual API client method
      
      // Assuming api.imagesUploadCreate returns a wrapped response like: 
      // { code: 0, message: '...', data: UploadedImageObject }
      if (response && response.data && response.data.url) { // Check for the nested data object and its url
         if (onSuccess) {
            onSuccess(response.data, file); // Pass the UploadedImage object (response.data) to handleAvatarSuccess
        }
      } else {
        // Handle cases where response or response.data is not as expected, or no URL
        const errorMessage = (response && response.message) ? response.message : t('profile.avatar_upload_fail_response');
        ElMessage.error(errorMessage);
        if (onError) onError(new Error(errorMessage));
      }

    } catch (error) {
      console.error("Avatar upload API request failed:", error);
      // Handle specific HTTP error codes if possible from the error object
      // e.g., if (error.response && error.response.status === 413) { ElMessage.error(t('profile.avatar_size_error_from_server')); }
      let errorMessage = t('profile.avatar_upload_api_error');
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message; // Use backend error message if available
      } else if (error.message) {
        errorMessage = error.message;
      }
      ElMessage.error(errorMessage);
      if (onError) {
        onError(error); 
      }
    }
  };

// 组件全局函数定义
  function clearModifyInfo() {
    modify_form.username = origin_form.username;
    modify_form.email = origin_form.email;
    modify_form.contact = origin_form.contact;
    modify_form.bio = origin_form.bio;
    modify_form.avatarUrl = origin_form.avatarUrl;
  }

  const handleEdit = () => {
    isEdit.value = true
  }

  const handleSave = () => {
    let username_res = PatternCheck.username_check(modify_form.username)
    if (!username_res.valid){
      ElMessage.error(t(username_res.error))
      return;
    }

    const payload = {
      username: modify_form.username,
      email: modify_form.email || null,
      contact_info: modify_form.contact || null,
      bio: modify_form.bio || null,
      avatar_url: modify_form.avatarUrl || null,
    };

    api.updateUserProfile(payload)
      .then(updatedUserResponse => {
        const user = updatedUserResponse.data || updatedUserResponse;
          origin_form.username = user.username;
          origin_form.email = user.email || "";
          origin_form.contact = user.contact_info || "";
          origin_form.bio = user.bio || "";
          origin_form.avatarUrl = user.avatar_url || "";
          origin_form.credit_score = user.credit_score !== undefined ? user.credit_score : null;

          localStorage.setItem("username", user.username);
          emits("updateSuccess", user); 
          ElMessage.success(t("profile.update_success"));
          isEdit.value = false;
          clearModifyInfo();
      })
      .catch(error => {
        console.warn("更新用户信息失败 PersonalData:", error);
        ElMessage.error(t("profile.update_fail"));
      });
  }

  const handleCancel = () => {
    isEdit.value = false
    clearModifyInfo()
  }

  function getAvatar (owner) {
    return owner ? owner.slice(0, 2).toUpperCase() : "NA";
  }

  // 格式化时间
  function formatTime (time) {
    const date = new Date(time);
    return date.toLocaleString();
  }

  const handleOtherAvatarClick = (username) => {
    router.push(`/profile/${username}`)
  }

  const handleBack = () => {
    window.history.back();
  }

  function getAuthStatusType(statusValueFromBackend) {
    if (!statusValueFromBackend) return 'info';
    const lowerStatus = String(statusValueFromBackend).toLowerCase();

    if (lowerStatus.includes('pending')) return 'warning';
    if (lowerStatus.includes('verified')) return 'success';
    if (lowerStatus.includes('rejected')) return 'danger';
    return 'info'; // Default for unsubmitted or unknown
  }

  function formatAuthStatus(statusValueFromBackend) {
    if (!statusValueFromBackend) return t('profile.auth_status_unsubmitted');
    
    const lowerStatus = String(statusValueFromBackend).toLowerCase();
    let i18nKeySuffix = 'unknown';

    if (lowerStatus.includes('pending')) {
      i18nKeySuffix = 'pending';
    } else if (lowerStatus.includes('verified')) {
      i18nKeySuffix = 'verified';
    } else if (lowerStatus.includes('rejected')) {
      i18nKeySuffix = 'rejected';
    } else if (lowerStatus.includes('unsubmitted')) {
      i18nKeySuffix = 'unsubmitted';
    }
    // Ensure 'unknown' is also a valid key in your i18n files or handle default
    return t(`profile.auth_status_${i18nKeySuffix}`);
  }

  const handleApplyForAuth = () => {
    studentAuthDialogVisible.value = true;
  };

  const handleAuthSubmitted = () => {
    ElMessage.info(t('profile.auth_data_refresh_notice'));
    emits('updateSuccess'); 
  };
  
  const showApplyAuthButton = computed(() => {
    if (props.isSearching) return false;
    if (!props.studentProfileData || !props.studentProfileData.student_auth_status) return true; // No data or no status
    return ['REJECTED', 'UNSUBMITTED'].includes(props.studentProfileData.student_auth_status);
  });

  onMounted(() => {
    console.log("PersonalData onMounted - props received:", JSON.parse(JSON.stringify(props)));

    origin_form.username = props.username || "";
    origin_form.email = props.email || "";
    origin_form.contact = props.contact || "";
    origin_form.bio = props.bio || "";
    origin_form.avatarUrl = props.avatarUrl || "";
    origin_form.credit_score = props.credit_score !== undefined ? props.credit_score : null;

    console.log("PersonalData onMounted - origin_form initialized:", JSON.parse(JSON.stringify(origin_form)));

    clearModifyInfo();
    console.log("PersonalData onMounted - modify_form after clearModifyInfo:", JSON.parse(JSON.stringify(modify_form)));

    if (props.database_id && props.database_id !== 'null' && props.database_id !== null && !props.isSearching){
      api.getUserTradeComments(props.database_id)
        .then(data => {
          comment_info.value = data.data || data;
        })
        .catch(error => {
          console.warn("获取评论失败 PersonalData:", error);
        });
    }
  })
</script>

<template>
  <div class="personal-data-container">
    <div class="personal-data-title">
      <el-button v-if="isSearching" @click="handleBack" class="back-button" :icon="Back" circle></el-button>
      <h2 v-if="!isSearching">{{ t("profile.title") }}</h2>
      <h2 v-else>{{t("profile.personal_data_title_searching")}}{{ username ? ` - ${username}` : ''}}</h2>
    </div>
    <div class="profile-data-functional-block">
      <div v-if="isEdit">
        <el-button type="primary" @click="handleSave">{{ t("profile.save_button") }}</el-button>
        <el-button @click="handleCancel">{{ t("profile.cancel_button") }}</el-button>
      </div>
      <div v-else>
        <el-button type="primary" @click="handleEdit" v-if="!isSearching">
          <el-icon><EditPen /></el-icon>
           {{ t("profile.edit_button") }}
        </el-button>
      </div>
    </div>

    <el-form
        v-if="isEdit"
        label-position="top"
        class="profile-form"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item :label="t('profile.username')">
            <el-input v-model="modify_form.username" :placeholder="t('profile.username_prompt')"/>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('profile.email')">
            <el-input v-model="modify_form.email" :placeholder="t('profile.email_prompt')"/>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item :label="t('profile.contact')">
            <el-input v-model="modify_form.contact" :placeholder="t('profile.contact_prompt')"/>
          </el-form-item>
        </el-col>
         <el-col :span="12">
            <el-form-item :label="t('profile.avatar_url')">
              <el-upload
                class="avatar-uploader"
                action="#" 
                :show-file-list="false"
                :on-success="handleAvatarSuccess"
                :before-upload="beforeAvatarUpload"
                :http-request="customAvatarUpload" 
              >
                <img v-if="modify_form.avatarUrl" :src="modify_form.avatarUrl" class="avatar-preview" />
                <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
              </el-upload>
              <el-input v-model="modify_form.avatarUrl" :placeholder="t('profile.avatar_url_fallback_prompt')" style="margin-top: 10px;"/> 
              <!-- Fallback input for URL, maybe hide if uploader is preferred -->
            </el-form-item>
        </el-col>
      </el-row>
      <el-form-item :label="t('profile.bio')">
        <el-input type="textarea" v-model="modify_form.bio" :rows="3" :placeholder="t('profile.bio_prompt')"/>
      </el-form-item>
    </el-form>

    <el-descriptions v-else :column="2" border class="profile-descriptions">
        <template #title>
            <div style="display: flex; align-items: center;">
                 <el-avatar v-if="!origin_form.avatarUrl" :size="50" class="profile-avatar-desc">{{origin_avatar_char}}</el-avatar>
                 <el-avatar v-else :src="origin_form.avatarUrl" :size="50" class="profile-avatar-desc"/>
                 <span style="margin-left: 10px; font-size: 1.2em;">{{ origin_form.username }}</span>
            </div>
        </template>

        <el-descriptions-item :label="t('profile.username')">{{ origin_form.username || t('profile.detail_none_shown') }}</el-descriptions-item>
        <el-descriptions-item :label="t('profile.email')">{{ origin_form.email || t('profile.detail_none_shown') }}</el-descriptions-item>
        <el-descriptions-item :label="t('profile.contact')">{{ origin_form.contact || t('profile.detail_none_shown') }}</el-descriptions-item>
        <el-descriptions-item :label="t('profile.credit_score')" :span="origin_form.bio ? 1 : 2">
          <div style="display: flex; align-items: center; margin-top: 5px;">
            <el-rate
              v-model="creditRate"
              disabled
              show-score
              score-template="{value} 星" 
              :texts="[t('profile.credit_status_low'), t('profile.credit_status_average'), t('profile.credit_status_fair'), t('profile.credit_status_good'), t('profile.credit_status_excellent')]"
              disabled-void-color="#CACACA"
            />
            <span v-if="origin_form.credit_score !== null" style="margin-left: 10px; font-size: 0.9em; color: #606266;">({{ origin_form.credit_score }} / 100)</span>
          </div>
        </el-descriptions-item>
        <el-descriptions-item :label="t('profile.bio')" :span="2" v-if="origin_form.bio">{{ origin_form.bio || t('profile.detail_none_shown') }}</el-descriptions-item>
    </el-descriptions>
    
    <!-- Student Authentication Section -->
    <div v-if="!isSearching" class="student-auth-section">
        <el-divider />
        <h3>{{ t('profile.student_auth_section_title') }}</h3>
        <el-descriptions v-if="studentProfileData && studentProfileData.student_auth_status && studentProfileData.student_auth_status !== 'UNSUBMITTED'" :column="1" border class="student-auth-descriptions">
            <el-descriptions-item :label="t('profile.verified_name')">{{ studentProfileData.verified_real_name || t('profile.detail_none_shown') }}</el-descriptions-item>
            <el-descriptions-item :label="t('profile.verified_student_id')">{{ studentProfileData.student_id || t('profile.detail_none_shown') }}</el-descriptions-item>
            <el-descriptions-item :label="t('profile.verified_department')">{{ studentProfileData.verified_department || t('profile.detail_none_shown') }}</el-descriptions-item>
            <el-descriptions-item :label="t('profile.verified_dormitory')">{{ studentProfileData.verified_dormitory || t('profile.detail_none_shown') }}</el-descriptions-item>
            <el-descriptions-item :label="t('profile.student_auth_status')">
              <el-tag :type="getAuthStatusType(studentProfileData.student_auth_status)">
                {{ formatAuthStatus(studentProfileData.student_auth_status) }}
              </el-tag>
            </el-descriptions-item>
        </el-descriptions>
        <div v-else-if="!studentProfileData || !studentProfileData.student_auth_status || studentProfileData.student_auth_status === 'UNSUBMITTED'" class="no-auth-data">
             <p>{{ t('profile.auth_status_unsubmitted') }}.</p>
        </div>

        <div v-if="showApplyAuthButton" class="apply-auth-button-container">
            <el-button type="success" @click="handleApplyForAuth">
              {{ t('profile.apply_for_auth_button') }}
            </el-button>
        </div>
    </div>

    <StudentAuthDialog
        :is-visible="studentAuthDialogVisible"
        :existing-auth-data="studentProfileData"
        @close="studentAuthDialogVisible = false"
        @authSubmitted="handleAuthSubmitted"
    />

    <div class="comments-calendar-section">
      <el-radio-group v-model="type_radio" size="default" class="radio-group">
        <el-radio-button label="Calendar" />
        <el-radio-button label="Comments" />
      </el-radio-group>

      <div v-if="type_radio === 'Calendar'" class="calendar-area">
        <h3>{{t("profile.calendar_area")}}</h3>
        <el-calendar ref="calendar" />
      </div>

      <div v-if="type_radio === 'Comments'" class="comments-area">
        <h3>{{t("profile.comments_area")}}</h3>
        <div v-if="comment_info.length > 0" class="comment-list">
          <div v-for="comment in comment_info" :key="comment.id" class="comment-item">
            <div class="comment-header">
              <el-avatar class="comment-avatar" :size="25" @click="handleOtherAvatarClick(comment.commenter_username)">
                {{ getAvatar(comment.commenter_username) }}
              </el-avatar>
              <span class="comment-username" @click="handleOtherAvatarClick(comment.commenter_username)">{{ comment.commenter_username }}</span>
              <span class="comment-time">{{ formatTime(comment.created_at) }}</span>
            </div>
            <div class="comment-body">
              <p>{{ comment.content }}</p>
            </div>
          </div>
        </div>
        <div v-else class="no-comments">
          <p>{{t("profile.no_comment")}}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.personal-data-container {
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.personal-data-title {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.personal-data-title h2 {
  margin: 0;
  font-size: 1.8em;
  color: #303133;
}

.back-button {
  margin-right: 15px;
}

.profile-data-functional-block {
  margin-bottom: 25px;
  text-align: right; /* Aligns edit/save/cancel buttons to the right */
}

.profile-form .el-form-item {
  margin-bottom: 18px;
}

.profile-descriptions {
  margin-top: 10px; /* Add some space above the descriptions */
}

.profile-avatar-desc {
  margin-right: 10px;
  border: 2px solid #eee;
}

.student-auth-section {
  margin-top: 30px;
  padding-top: 20px;
  /* border-top: 1px solid #ebeef5; */ /* Replaced by el-divider */
}

.student-auth-section h3 {
  font-size: 1.5em;
  color: #303133;
  margin-bottom: 15px;
}

.student-auth-descriptions {
  margin-bottom: 20px;
}

.no-auth-data p {
    color: #909399;
    font-style: italic;
}

.apply-auth-button-container {
  margin-top: 15px;
  text-align: left; /* Or center, depending on desired alignment */
}

.comments-calendar-section {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.radio-group {
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
}

.calendar-area h3, .comments-area h3 {
  font-size: 1.3em;
  color: #409EFF;
  margin-bottom: 15px;
  text-align: center;
}

.comment-list {
  max-height: 400px;
  overflow-y: auto;
}

.comment-item {
  border: 1px solid #EBEEF5;
  border-radius: 4px;
  padding: 10px 15px;
  margin-bottom: 10px;
  background-color: #FAFAFA;
}

.comment-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.comment-avatar {
  margin-right: 8px;
  cursor: pointer;
}

.comment-username {
  font-weight: bold;
  color: #303133;
  cursor: pointer;
  margin-right: 10px;
}

.comment-time {
  font-size: 0.85em;
  color: #909399;
}

.comment-body p {
  margin: 0;
  color: #606266;
  word-wrap: break-word;
}

.no-comments p {
  text-align: center;
  color: #909399;
  padding: 20px;
}

/* Responsive adjustments for smaller screens if needed */
@media (max-width: 768px) {
  .el-col {
    width: 100% !important; /* Element Plus uses !important, so we might need it too */
    flex: 0 0 100% !important;
    max-width: 100% !important;
  }
  .profile-data-title h2 {
    font-size: 1.5em;
  }
  .student-auth-section h3 {
    font-size: 1.3em;
  }
}

.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
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
  width: 120px; /* Adjust size as needed */
  height: 120px; /* Adjust size as needed */
  text-align: center;
}

.avatar-preview {
  width: 120px; /* Adjust size as needed */
  height: 120px; /* Adjust size as needed */
  display: block;
  object-fit: cover; /* Ensures the image covers the area without distortion */
}
</style>
