<template>
  <div class="permission-management-container">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="page-title">权限管理</h1>
          <p class="page-subtitle">管理平台管理员权限</p>
        </div>
        <div class="header-actions">
          <el-button type="primary" :icon="Refresh" @click="fetchUsers" :loading="loading">
            刷新数据
          </el-button>
          <!-- Add other actions like adding a new admin if needed later -->
        </div>
      </div>
    </div>

    <!-- User List Table -->
    <el-card class="table-card" shadow="never">
      <div class="table-header">
        <h3>用户列表</h3>
        <div class="table-actions">
          <span class="result-count">共 {{ users.length }} 条记录</span>
        </div>
      </div>

      <el-table
        :data="users"
        v-loading="loading"
        stripe
        class="users-table"
      >
        <el-table-column label="用户信息" min-width="250">
           <template #default="{ row }">
            <div class="user-info">
              <el-avatar
                :size="40"
                :src="row.avatar_url ? BackendConfig.RESTFUL_API_URL.replace(/\/api$/, '') + row.avatar_url : ''"
                class="user-avatar"
              >
                {{ row.username.charAt(0).toUpperCase() }}
              </el-avatar>
              <div class="user-details">
                <div class="user-name">
                  {{ row.username }}
              </div>
                <div class="user-email">{{ row.email }}</div>
                <div class="user-phone" v-if="row.phone_number">{{ row.phone_number }}</div>
              </div>
              </div>
           </template>
        </el-table-column>

        <el-table-column label="管理员身份" width="150">
          <template #default="{ row }">
            <el-tag
              :type="row.is_staff ? 'success' : 'info'"
            >
              {{ row.is_staff ? '是' : '否' }}
            </el-tag>
                </template>
        </el-table-column>

        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <!-- Prevent changing super admin's status -->
            <el-button
              type="primary"
              size="small"
              @click="toggleAdminStatus(row)"
              :disabled="isSuperAdminUser(row)"
            >
              {{ row.is_staff ? '撤销管理员' : '设为管理员' }}
            </el-button>
          </template>
        </el-table-column>

      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Refresh, User } from '@element-plus/icons-vue';
import api from '@/API_PRO.js'; // Adjust import path as needed
import store from '@/store/index.js'; // Import the store
import BackendConfig from "../../../backend.config"

const loading = ref(false);
const users = ref([]);

// Computed property to get super admin status from store
const isSuperAdmin = computed(() => store.getters['user/isSuperAdmin']);
// Hardcode super admin email for now - ideally this would come from config or backend
const superAdminEmail = computed(() => '23301132@bjtu.edu.cn'); 

// Helper function to check if a user is the super admin
const isSuperAdminUser = (user) => {
  // Compare user's email with the super admin email
  return user.email === superAdminEmail.value;
};

const fetchUsers = async () => {
  loading.value = true;
  try {
    // Call the API to get all users (requires admin privileges)
    const response = await api.getAllUsersApi(); // Corresponds to GET /api/v1/users/
    users.value = response || []; // Ensure users.value is always an array
    console.log('Fetched users:', users.value);
    ElMessage.success('用户列表加载成功');
  } catch (error) {
    console.error('获取用户列表失败:', error);
    ElMessage.error('获取用户列表失败');
  } finally {
     loading.value = false;
  }
};

const toggleAdminStatus = async (user) => {
  const newStatus = !user.is_staff;
  const action = newStatus ? '设为管理员' : '撤销管理员';

  try {
    await ElMessageBox.confirm(
      `确定要将用户 "${user.username}" ${action} 吗?`,
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );

    // --- Call the new backend endpoint for toggling staff status ---
    // Assuming api.toggleUserStaffStatus corresponds to PUT /api/v1/users/{user_id}/toggle_staff

    console.log(`Attempting to call toggleUserStaffStatus API for user ${user.username} (ID: ${user.user_id}) to set staff status to ${newStatus}`);
    await api.toggleUserStaffStatus(user.user_id);

    // If the API call succeeds, perform optimistic update and refresh data
    // user.is_staff = newStatus; // Removed optimistic update

    ElMessage.success(`${action}操作成功！`);
    // Refresh data to ensure consistency
    fetchUsers(); 

  } catch (error) {
    if (error !== 'cancel') {
      console.error(`${action}失败:`, error);
      
      // Check for common authorization error responses (401 Unauthorized, 403 Forbidden)
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          ElMessage.error(`操作失败: 无权进行此操作。只有超级管理员可以更改管理员权限。`);
        } else {
          ElMessage.error(`${action}失败: ${error.message || '未知错误'}`);
      }
    }
  }
};

onMounted(() => {
  fetchUsers(); // Load users on component mount
});
</script>

<style scoped>
@import '../styles/admin-common.css';

.permission-management-container {
  padding: 24px;
  background: #F8F9FA; /* Match AdminLayout background */
  min-height: calc(100vh - 60px);
}

/* Reuse styles from admin-common.css */
.page-header,
.header-content,
.title-section,
.page-title,
.page-subtitle,
.header-actions,
.table-card,
.table-header,
.table-title h3,
.result-count,
.users-table,
.user-info,
.user-avatar,
.user-details,
.user-name,
.user-email,
.user-phone {
  /* Styles are inherited from admin-common.css */
}

/* Specific styles for permission management table */
.users-table :deep(.el-table__header th) {
  background-color: #f8f8f8 !important;
  color: #606266;
   font-weight: bold;
}

.users-table :deep(.el-table__cell) {
  padding: 12px 0;
}

.action-buttons .el-button {
  padding: 4px 8px;
  font-size: 12px;
}
</style> 