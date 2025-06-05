<template>
  <el-dialog
    :model-value="visible"
    title="用户详情"
    width="600px"
    :before-close="closeDialog"
    destroy-on-close
    class="user-detail-dialog"
  >
    <div v-loading="isLoading" element-loading-text="加载中..." class="dialog-content-wrapper">
      <div v-if="error" class="error-state">
        <el-empty description="加载用户详情失败，请稍后重试"/>
      </div>
      <div v-else-if="userDetail" class="user-detail-display">
        <div class="user-avatar-section">
          <el-avatar :size="64" :src="userDetail.avatar">{{ userDetail.username?.[0] }}</el-avatar>
          <h3 class="username-display">{{ userDetail.username }}</h3>
        </div>
        <el-descriptions :column="2" border class="user-info-descriptions">
          <el-descriptions-item label="用户ID" v-if="isAdmin">{{ userDetail.id }}</el-descriptions-item>
          <el-descriptions-item label="用户名" v-if="!isAdmin">{{ userDetail.username }}</el-descriptions-item>
          <el-descriptions-item label="信用分">{{ userDetail.credit }}</el-descriptions-item>
          <el-descriptions-item label="邮箱" v-if="isAdmin">{{ userDetail.email || '未填写' }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ userDetail.phoneNumber || '未填写' }}</el-descriptions-item>
          <el-descriptions-item label="账户状态" v-if="isAdmin">
            <el-tag :type="userDetail.status === 'Active' ? 'success' : 'info'">{{ userDetail.status === 'Active' ? '正常' : '禁用' }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="是否管理员" v-if="isAdmin">{{ userDetail.isStaff ? '是' : '否' }}</el-descriptions-item>
          <el-descriptions-item label="是否超级管理员" v-if="isAdmin">{{ userDetail.isSuperAdmin ? '是' : '否' }}</el-descriptions-item>
          <el-descriptions-item label="是否已认证" v-if="isAdmin">{{ userDetail.isVerified ? '是' : '否' }}</el-descriptions-item>
          <el-descriptions-item label="专业" :span="isAdmin ? 2 : 1">{{ userDetail.major || '未填写' }}</el-descriptions-item>
          <el-descriptions-item label="个人简介" :span="2">{{ userDetail.bio || '未填写' }}</el-descriptions-item>
          <el-descriptions-item label="注册时间" v-if="isAdmin" :span="2">{{ new Date(userDetail.joinTime).toLocaleString() }}</el-descriptions-item>
          <el-descriptions-item label="最后登录时间" v-if="isAdmin" :span="2">{{ userDetail.lastLoginTime ? new Date(userDetail.lastLoginTime).toLocaleString() : 'N/A' }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <div v-else class="empty-state">
        <el-empty description="暂无用户详情信息"/>
      </div>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="closeDialog">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, onMounted, watch, defineProps, defineEmits, computed } from 'vue';
import { useStore } from 'vuex';
import api from '@/API_PRO.js';
import { ElMessage } from 'element-plus';
import FormatObject from '@/utils/format.js';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  userId: {
    type: [String, null],
    default: null,
  },
});

const emits = defineEmits(['update:visible', 'close']);

const store = useStore();
const userDetail = ref(null);
const isLoading = ref(true);
const error = ref(null);

// 判断当前用户是否是管理员
const isAdmin = computed(() => store.getters['user/userRole'] === 'admin' || store.getters['user/userRole'] === 'super_admin');

watch(() => props.visible, async (newVal) => {
  if (newVal && props.userId) {
    isLoading.value = true;
    error.value = null;
    userDetail.value = null; // 清空之前的数据
    try {
      let profileData;
      if (isAdmin.value) {
        // 如果是管理员，调用获取完整用户资料的API
        profileData = await api.getUserProfileById(props.userId);
        // 将后端返回的中文键名映射到更易于前端访问的结构
        userDetail.value = {
          id: profileData['用户ID'],
          username: profileData['用户名'],
          email: profileData['邮箱'],
          phoneNumber: profileData['手机号码'],
          status: profileData['账户状态'],
          credit: profileData['信用分'],
          isStaff: profileData['是否管理员'],
          isSuperAdmin: profileData['是否超级管理员'],
          isVerified: profileData['是否已认证'],
          major: profileData['专业'],
          avatar: FormatObject.formattedImgUrl(profileData['头像URL']),
          bio: profileData['个人简介'],
          joinTime: profileData['注册时间'],
          lastLoginTime: profileData['最后登录时间'],
        };
      } else {
        // 非管理员，调用获取公开用户资料的action
        profileData = await store.dispatch('user/fetchUserPublicProfile', props.userId);
        // 公开资料的字段可能与完整资料不同，这里直接使用返回的公开字段
        userDetail.value = {
          id: props.userId, // 公开资料API可能不返回ID，这里沿用传入的userId
          username: profileData['用户名'],
          credit: profileData['信用分'],
          avatar: FormatObject.formattedImgUrl(profileData['头像URL']),
          bio: profileData['个人简介'],
          phoneNumber: profileData['手机号码'],
        };
      }
    } catch (err) {
      console.error('加载用户详情失败:', err);
      error.value = '加载用户详情失败。';
      ElMessage.error('加载用户详情失败：' + (err.response?.data?.detail || err.message || '未知错误'));
    } finally {
      isLoading.value = false;
    }
  }
}, { immediate: true });

const closeDialog = () => {
  emits('update:visible', false);
  emits('close');
  userDetail.value = null; // 清空详情，以便下次打开重新加载
};
</script>

<style scoped>
.user-detail-dialog :deep(.el-dialog__header) {
  padding: 20px 24px;
  border-bottom: 1px solid #ebeef5;
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.user-detail-dialog :deep(.el-dialog__body) {
  padding-top: 10px;
  padding-bottom: 10px;
}

.dialog-content-wrapper {
  min-height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.user-detail-display {
  width: 100%;
  padding: 10px;
}

.user-avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.username-display {
  font-size: 20px;
  font-weight: bold;
  color: #303133;
  margin-top: 10px;
}

.user-info-descriptions {
  margin-top: 20px;
}

.error-state, .empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.dialog-footer {
  text-align: right;
}
</style> 