<script setup>
  import {computed, onMounted, ref} from "vue";
  import api from '@/API_PRO.js'; // 导入新的 API 服务
  import {
    User,
    Lock,
    Edit,
    List,
    Goods,
    Star,
    Message, // Changed from ChatSquare for consistency if an icon named Message exists
    School,
    Setting,
    CreditCard, // For Credit Score
    CircleCheckFilled, // For Verified status
    CircleCloseFilled // For Unverified status
  } from "@element-plus/icons-vue";
  import ChangePassword from "@/user/components/ChangePassword.vue";
  import ProfileEdit from "@/user/components/ProfileEdit.vue"; // 导入 ProfileEdit 组件
  import WebSocketService from "@/socket_client/socket.js";
  import router from "@/router/index.js";
  import {ElMessage} from "element-plus";

  // 组件全局变量定义
  let username = ref("");
  let email = ref("");
  let student_id = ref("");
  let contact = ref("");
  let facauty = ref(""); // 院系
  let dormitory = ref("");
  let database_id = ref(null);
  let firstName = ref("");
  let lastName = ref("");
  let bio = ref("");
  let avatarUrl = ref("");
  let studentProfileData = ref(null); // New ref for student profile
  let userProfileResponseData = ref(null); // <-- 新增 ref 存储 API 响应的 data 部分
  let avatar_char = computed(() => username.value && typeof username.value === 'string' ? username.value.slice(0, 2).toUpperCase() : '??'); // Safe access
  let activeIndex = ref("1"); // 控制显示的内容，初始化为个人数据页面
  let componentKey = ref(0); // 用于强制刷新子组件
  let passwordDialogVisible = ref(false); // 控制修改密码对话框的显示
  let profileEditDialogVisible = ref(false); // 控制编辑个人信息对话框的显示

  const fetchUserProfile = () => {
    api.getUserProfile()
      .then(response => {
       if (response) {
          const userInfo = response;
          userProfileResponseData.value = userInfo;
          database_id.value = userInfo.id || userInfo.user_id;
          username.value = userInfo.username;
          email.value = userInfo.email || "";
          contact.value = userInfo.contact_info || "";
          firstName.value = userInfo.first_name || "";
          lastName.value = userInfo.last_name || "";
          bio.value = userInfo.bio || "";
          avatarUrl.value = userInfo.avatar_url || "";

          if (userInfo.student_profile) {
            student_id.value = userInfo.student_profile.student_id || "";
            facauty.value = userInfo.student_profile.verified_department || "";
            dormitory.value = userInfo.student_profile.verified_dormitory || "";
            studentProfileData.value = userInfo.student_profile;
          } else {
            student_id.value = "";
            facauty.value = "";
            dormitory.value = "";
            studentProfileData.value = null;
          }
          localStorage.setItem("username", userInfo.username);
          localStorage.setItem("userId", userInfo.id || userInfo.user_id);
          // 检查 is_staff 并存储
          if (userInfo.is_staff !== undefined) {
            localStorage.setItem("is_staff", userInfo.is_staff);
          }
          // 检查 is_verified 并存储
          if (userInfo.is_verified !== undefined) {
            localStorage.setItem("is_verified", userInfo.is_verified);
          }

          if ((userInfo.id || userInfo.user_id) && WebSocketService.userId === 'undefined') {
            WebSocketService.init(userInfo.id || userInfo.user_id);
          }
        } else {
          console.warn("获取用户信息API响应为空 ProfileView:", response);
          ElMessage.error('获取用户信息失败，API响应为空');
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          localStorage.removeItem('username');
          localStorage.removeItem('is_staff');
          localStorage.removeItem('is_verified');
          database_id.value = null;
          username.value = "";
          email.value = "";
          contact.value = "";
          firstName.value = "";
          lastName.value = "";
          bio.value = "";
          avatarUrl.value = "";
          studentProfileData.value = null;
          userProfileResponseData.value = null;
        }
      })
      .catch(error => {
        console.error("获取用户信息失败 ProfileView:", error);
        ElMessage.error('获取用户信息失败');
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        localStorage.removeItem('is_staff');
        localStorage.removeItem('is_verified');
        database_id.value = null;
        username.value = "";
        email.value = "";
        contact.value = "";
        firstName.value = "";
        lastName.value = "";
        bio.value = "";
        avatarUrl.value = "";
        studentProfileData.value = null;
        userProfileResponseData.value = null;
      })
      .finally(() => {
        componentKey.value += 1;
      });
  };

  onMounted(() => {
    fetchUserProfile(); // Call the new function on mount
  });

  // Computed property for student verification status display
  const studentVerificationStatus = computed(() => {
    // Check the is_verified field directly from userProfileResponseData
    if (userProfileResponseData.value && userProfileResponseData.value.is_verified) {
      return "已认证"; // Add to i18n
    } else if (userProfileResponseData.value && !userProfileResponseData.value.is_verified) {
        // If is_verified is false but student_profile exists, it might mean verification started but not completed.
        // For now, we'll just show "未认证". If more detailed statuses are needed, the backend needs to provide them.
        return "未认证"; // Add to i18n
    } else {
      return "未认证"; // Default to 未认证 if no user data or student_profile
    }
  });

  const handleCardClick = (routePath) => {
    router.push(routePath);
  };

  const handlePasswordCardClick = () => {
    passwordDialogVisible.value = true;
  };

  const handleProfileEditCardClick = () => {
    profileEditDialogVisible.value = true;
  };

  const handleStudentAuthCardClick = () => {
    router.push('/profile/student-auth'); // TODO: Add this route
  };

  const handleAdminCardClick = () => {
    router.push('/admin'); // TODO: Add this route and AdminLayout
  };
</script>

<template>
  <div class="basic-container">
    <div class="center-container">
      <div class="profile-container">
        <div class="user-info-block">
          <el-avatar v-if="!avatarUrl" :size="100" shape="circle" class="avatar">{{avatar_char}}</el-avatar>
          <el-avatar v-else :src="avatarUrl" :size="100" shape="circle" class="avatar" />
          <h3>{{username}}</h3>
          <p v-if="bio" class="user-bio">{{ bio }}</p>
          <p v-else class="user-bio-placeholder">这位用户很神秘，什么简介都没留下~</p>
          <div class="status-info">
            <el-tag type="primary" effect="light" class="status-tag">
              <el-icon><CreditCard /></el-icon>&nbsp;信用分: {{ userProfileResponseData ? userProfileResponseData.credit : 'N/A' }}
            </el-tag>
            <el-tag :type="userProfileResponseData && userProfileResponseData.is_verified ? 'success' : 'info'" effect="light" class="status-tag">
              <el-icon><component :is="userProfileResponseData && userProfileResponseData.is_verified ? CircleCheckFilled : CircleCloseFilled" /></el-icon>
              &nbsp;学生认证: {{ userProfileResponseData && userProfileResponseData.is_verified ? '已认证' : '未认证' }}
            </el-tag>
          </div>
        </div>

        <div class="functional-cards">
          <el-card class="functional-card" shadow="hover" @click="handleProfileEditCardClick">
            <el-icon><Edit /></el-icon>
            <span>编辑个人信息</span>
          </el-card>
           <el-card class="functional-card" shadow="hover" @click="handlePasswordCardClick">
            <el-icon><Lock /></el-icon>
            <span>修改密码</span>
          </el-card>
           <el-card class="functional-card" shadow="hover" @click="handleCardClick('/profile/my-products')">
            <el-icon><Goods /></el-icon>
            <span>我的商品</span>
          </el-card>
           <el-card class="functional-card" shadow="hover" @click="handleCardClick('/profile/my-orders')">
            <el-icon><List /></el-icon>
            <span>我的订单</span>
          </el-card>
           <el-card class="functional-card" shadow="hover" @click="handleCardClick('/profile/my-favorites')">
            <el-icon><Star /></el-icon>
            <span>我的收藏</span>
          </el-card>
           <el-card class="functional-card" shadow="hover" @click="handleCardClick('/messages')">
            <el-icon><Message /></el-icon>
            <span>我的消息</span>
          </el-card>
           <!-- 学生认证入口 (如果未认证) -->
           <el-card 
             v-if="userProfileResponseData && !userProfileResponseData.is_verified" 
             class="functional-card" 
             shadow="hover" 
             @click="handleCardClick('/request-student-auth')"
           >
             <el-icon><School /></el-icon>
             <span>学生身份认证</span>
           </el-card>
           <!-- 管理员后台入口 (如果是管理员) -->
           <el-card class="functional-card" shadow="hover" v-if="userProfileResponseData && userProfileResponseData.is_staff" @click="handleAdminCardClick">
             <el-icon><Setting /></el-icon>
             <span>管理员后台</span>
           </el-card>
        </div>
      </div>
    </div>
  </div>
  <ChangePassword
      :isPasswordDialogVisible="passwordDialogVisible"
      @updateCancel="passwordDialogVisible = false"
      @updateSuccess="passwordDialogVisible = false"
  />’
  <ProfileEdit
      :isProfileEditDialogVisible="profileEditDialogVisible"
      :userInfo="userProfileResponseData"
      @updateCancel="profileEditDialogVisible = false"
      @updateSuccess="() => { profileEditDialogVisible = false; fetchUserProfile(); }"
  />
</template>

<style scoped>
.basic-container {
  display: flex;
  justify-content: center;
  align-items: flex-start; /* Align to top */
  min-height: 100vh; /* Ensure container takes at least full viewport height */
  /* background-color: #CAD9F1; Light blue background */
  background-color: #f5f7fa; /* 使用一个更中性的浅灰色背景 */
  padding: 50px 20px; /* Add padding top and bottom */
  box-sizing: border-box;
}

.center-container{
  display: flex;
  flex-direction: column; /* Stack content vertically */
  align-items: center; /* Center content horizontally */
  width: 100%;
  max-width: 800px; /* Max width for the profile content */
  background-color: #ffffff; /* White background for the main profile block */
  border-radius: 10px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1); /* Stronger shadow for the main block */
  padding: 30px; /* Adjust padding */
  box-sizing: border-box;
}

.profile-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.user-info-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40px; /* Increase space below user info */
  padding-bottom: 20px; /* Add padding at the bottom */
  border-bottom: 1px solid #ebeef5; /* Add a subtle separator line */
  background-color: #ffffff; /* 使用白色背景 */
  border-radius: 8px; /* 添加一些圆角 */
  padding: 20px; /* 添加一些内边距 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); /* 添加一些阴影 */
}

.avatar {
  margin-bottom: 15px;
}

.user-info-block h3 {
  font-size: 28px; /* Larger username */
  font-weight: bold;
  color: #303133; /* Dark text */
  margin-bottom: 8px; /* Adjusted margin */
}

.user-bio {
  font-size: 14px;
  color: #606266;
  margin-bottom: 15px;
  text-align: center;
  max-width: 80%;
  line-height: 1.6;
}

.user-bio-placeholder {
  font-size: 14px;
  color: #909399; /* Lighter color for placeholder */
  margin-bottom: 15px;
  text-align: center;
  max-width: 80%;
  line-height: 1.6;
  font-style: italic;
}

.status-info {
    display: flex;
    align-items: center;
    color: #606266; /* Medium grey text */
    font-size: 15px;
    margin-top: 10px; /* Add space above status info */
}

.status-info .el-divider {
    border-left: 1px solid #dcdfe6; /* Match element plus divider color */
    height: 1em; /* Match font height */
    margin: 0 15px; /* Increase space around divider */
}

.status-tag {
  margin: 0 8px;
  padding: 8px 12px;
  font-size: 13px;
}

.functional-cards {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); /* Responsive grid */
  gap: 20px; /* Space between cards */
}

.functional-card {
  text-align: center;
  cursor: pointer;
  padding: 25px; /* Increase padding inside card */
  border-radius: 8px;
  transition: transform 0.3s ease, box-shadow 0.3s ease; /* Smooth hover effect with shadow transition */
  border: none; /* Remove default border */
}

.functional-card:hover {
  transform: translateY(-5px); /* Lift card on hover */
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15); /* Enhanced shadow on hover */
}

.functional-card .el-icon {
  font-size: 36px; /* Larger icons */
  color: #409eff; /* Element Plus primary blue color */
  margin-bottom: 10px; /* Space below icon */
}

.functional-card span {
  font-size: 16px;
  font-weight: bold;
  color: #303133; /* Dark text */
}

/* Remove unused styles from previous layout */
/* .bottom-container, .left-container, .right-container, .selector-container, .other-container, .personal-info, .info-block, .info-column { display: none; } */
</style>
