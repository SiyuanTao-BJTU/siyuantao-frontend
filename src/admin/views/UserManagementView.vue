<template>
  <div class="users-management-container">
    <!-- 页面标题和操作栏 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="page-title">用户管理</h1>
          <p class="page-subtitle">管理平台用户信息、状态和权限</p>
        </div>
        <div class="header-actions">
          <el-button type="primary" :icon="Refresh" @click="refreshUsers" :loading="loading">
            刷新数据
          </el-button>
          <el-button type="success" :icon="Download" @click="exportUsers">
            导出用户
          </el-button>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-section">
      <div class="stat-card">
        <div class="stat-icon total">
          <el-icon><User /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ userStats.total }}</div>
          <div class="stat-label">总用户数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon active">
          <el-icon><CircleCheck /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ userStats.active }}</div>
          <div class="stat-label">活跃用户</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon disabled">
          <el-icon><CircleClose /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ userStats.disabled }}</div>
          <div class="stat-label">禁用用户</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon verified">
          <el-icon><Select /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ userStats.verified }}</div>
          <div class="stat-label">已认证用户</div>
        </div>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <el-card class="filter-card" shadow="never">
      <div class="filter-section">
        <div class="filter-row">
          <div class="filter-item">
            <label>搜索用户</label>
            <el-input
              v-model="searchQuery"
              placeholder="搜索用户名、邮箱或手机号"
              :prefix-icon="Search"
              clearable
              @input="handleSearch"
              class="search-input"
            />
          </div>
          <div class="filter-item">
            <label>用户状态</label>
            <el-select v-model="statusFilter" placeholder="选择状态" clearable @change="handleFilter">
              <el-option label="全部" value="" />
              <el-option label="活跃" value="Active" />
              <el-option label="禁用" value="Disabled" />
            </el-select>
          </div>
          <div class="filter-item">
            <label>认证状态</label>
            <el-select v-model="verificationFilter" placeholder="选择认证状态" clearable @change="handleFilter">
              <el-option label="全部" value="" />
              <el-option label="已认证" value="true" />
              <el-option label="未认证" value="false" />
            </el-select>
          </div>
          <div class="filter-item">
            <label>用户类型</label>
            <el-select v-model="typeFilter" placeholder="选择用户类型" clearable @change="handleFilter">
              <el-option label="全部" value="" />
              <el-option label="普通用户" value="user" />
              <el-option label="管理员" value="admin" />
            </el-select>
          </div>
        </div>
        <div class="filter-actions">
          <el-button @click="resetFilters">重置筛选</el-button>
          <el-button type="primary" @click="applyFilters">应用筛选</el-button>
        </div>
      </div>
    </el-card>

    <!-- 用户列表 -->
    <el-card class="table-card" shadow="never">
      <div class="table-header">
        <h3>用户列表</h3>
        <div class="table-actions">
          <span class="result-count">共 {{ filteredUsers.length }} 条记录</span>
        </div>
      </div>

      <el-table
        :data="paginatedUsers"
        v-loading="loading"
        stripe
        class="users-table"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        
        <el-table-column label="用户信息" min-width="250">
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar
                :size="40"
                :src="row.avatar_url"
                class="user-avatar"
              >
                {{ row.username.charAt(0).toUpperCase() }}
              </el-avatar>
              <div class="user-details">
                <div class="user-name">
                  {{ row.username }}
                  <el-tag v-if="row.is_staff" type="warning" size="small">管理员</el-tag>
                </div>
                <div class="user-email">{{ row.email }}</div>
                <div class="user-phone" v-if="row.phone_number">{{ row.phone_number }}</div>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="专业" prop="major" width="120">
          <template #default="{ row }">
            <span class="major-text">{{ row.major || '未填写' }}</span>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag
              :type="getStatusType(row.status)"
              class="status-tag"
            >
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="认证状态" width="100">
          <template #default="{ row }">
            <div class="verification-status">
              <el-icon v-if="row.is_verified" class="verified-icon"><CircleCheck /></el-icon>
              <el-icon v-else class="unverified-icon"><CircleClose /></el-icon>
              <span>{{ row.is_verified ? '已认证' : '未认证' }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="信用分" width="120" sortable>
          <template #default="{ row }">
            <div class="credit-score">
              <el-progress
                :percentage="Math.min(row.credit, 100)"
                :color="getCreditColor(row.credit)"
                :stroke-width="8"
                text-inside
                class="credit-progress"
              />
              <span class="credit-number">{{ row.credit }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="注册时间" width="160">
          <template #default="{ row }">
            <div class="join-time">
              <div>{{ formatDate(row.join_time) }}</div>
              <div class="time-ago">{{ getTimeAgo(row.join_time) }}</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button
                type="primary"
                size="small"
                @click="viewUserDetail(row)"
                link
              >
                详情
              </el-button>
              <el-dropdown @command="(command) => handleUserAction(command, row)">
                <el-button type="primary" size="small" link>
                  更多<el-icon class="el-icon--right"><ArrowDown /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="edit">编辑资料</el-dropdown-item>
                    <el-dropdown-item command="credit">调整信用分</el-dropdown-item>
                    <el-dropdown-item
                      :command="row.status === 'Active' ? 'disable' : 'enable'"
                    >
                      {{ row.status === 'Active' ? '禁用用户' : '启用用户' }}
                    </el-dropdown-item>
                    <el-dropdown-item command="delete" divided>删除用户</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="filteredUsers.length"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 用户详情对话框 -->
    <el-dialog
      v-model="userDetailVisible"
      title="用户详情"
      width="800px"
      :close-on-click-modal="false"
    >
      <div v-if="selectedUser" class="user-detail-content">
        <div class="detail-header">
          <el-avatar :size="80" :src="selectedUser.avatar_url">
            {{ selectedUser.username.charAt(0).toUpperCase() }}
          </el-avatar>
          <div class="detail-info">
            <h3>{{ selectedUser.username }}</h3>
            <p>{{ selectedUser.email }}</p>
            <div class="detail-tags">
              <el-tag v-if="selectedUser.is_staff" type="warning">管理员</el-tag>
              <el-tag :type="getStatusType(selectedUser.status)">
                {{ getStatusText(selectedUser.status) }}
              </el-tag>
              <el-tag v-if="selectedUser.is_verified" type="success">已认证</el-tag>
            </div>
          </div>
        </div>
        
        <el-descriptions :column="2" border class="detail-descriptions">
          <el-descriptions-item label="用户ID">{{ selectedUser.user_id }}</el-descriptions-item>
          <el-descriptions-item label="专业">{{ selectedUser.major || '未填写' }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ selectedUser.phone_number || '未填写' }}</el-descriptions-item>
          <el-descriptions-item label="信用分">{{ selectedUser.credit }}</el-descriptions-item>
          <el-descriptions-item label="注册时间">{{ formatDateTime(selectedUser.join_time) }}</el-descriptions-item>
          <el-descriptions-item label="最后活跃">{{ getTimeAgo(selectedUser.join_time) }}</el-descriptions-item>
        </el-descriptions>

        <div v-if="selectedUser.bio" class="user-bio">
          <h4>个人简介</h4>
          <p>{{ selectedUser.bio }}</p>
        </div>
      </div>
      
      <template #footer>
        <el-button @click="userDetailVisible = false">关闭</el-button>
        <el-button type="primary" @click="editUser(selectedUser)">编辑用户</el-button>
      </template>
    </el-dialog>

    <!-- 信用分调整对话框 -->
    <el-dialog
      v-model="creditAdjustVisible"
      title="调整信用分"
      width="500px"
      :close-on-click-modal="false"
    >
      <div v-if="selectedUser" class="credit-adjust-content">
        <div class="current-credit">
          <span>当前信用分：</span>
          <el-tag type="info" size="large">{{ selectedUser.credit }}</el-tag>
        </div>
        
        <el-form :model="creditForm" :rules="creditRules" ref="creditFormRef" label-width="100px">
          <el-form-item label="调整类型" prop="type">
            <el-radio-group v-model="creditForm.type">
              <el-radio value="add">增加</el-radio>
              <el-radio value="subtract">减少</el-radio>
              <el-radio value="set">设置为</el-radio>
            </el-radio-group>
          </el-form-item>
          
          <el-form-item label="调整数值" prop="amount">
            <el-input-number
              v-model="creditForm.amount"
              :min="1"
              :max="creditForm.type === 'set' ? 1000 : 100"
              controls-position="right"
            />
            <span class="credit-hint">
              {{ creditForm.type === 'set' ? '将信用分设置为此值' : `${creditForm.type === 'add' ? '增加' : '减少'}此数值` }}
            </span>
          </el-form-item>
          
          <el-form-item label="调整原因" prop="reason">
            <el-input
              v-model="creditForm.reason"
              type="textarea"
              :rows="3"
              placeholder="请输入调整信用分的原因"
            />
          </el-form-item>
          
          <div class="preview-result">
            <span>调整后信用分：</span>
            <el-tag :type="getPreviewCreditType()" size="large">
              {{ getPreviewCredit() }}
            </el-tag>
          </div>
        </el-form>
      </div>
      
      <template #footer>
        <el-button @click="creditAdjustVisible = false">取消</el-button>
        <el-button type="primary" @click="submitCreditAdjustment">确认调整</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  User, Search, Refresh, Download, CircleCheck, CircleClose,
  Select, ArrowDown
} from '@element-plus/icons-vue'

import api from '@/API_PRO.js'; // 导入 API

// 响应式数据
const loading = ref(false)
const searchQuery = ref('')
const statusFilter = ref('')
const verificationFilter = ref('')
const typeFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const selectedUsers = ref([])

// 对话框状态
const userDetailVisible = ref(false)
const creditAdjustVisible = ref(false)
const selectedUser = ref(null)

// 信用分调整表单
const creditForm = ref({
  type: 'add',
  amount: 10,
  reason: ''
})

const creditRules = {
  amount: [
    { required: true, message: '请输入调整数值', trigger: 'blur' },
    { type: 'number', min: 1, message: '调整数值必须大于0', trigger: 'blur' }
  ],
  reason: [
    { required: true, message: '请输入调整原因', trigger: 'blur' },
    { min: 5, message: '原因不能少于5个字符', trigger: 'blur' }
  ]
}

const creditFormRef = ref(null)

// 用户数据 (从 API 获取)
const users = ref([]) // 初始化为空数组

// 计算属性
const userStats = computed(() => ({
  total: users.value.length,
  active: users.value.filter(u => u.status === 'Active').length,
  disabled: users.value.filter(u => u.status === 'Disabled').length,
  verified: users.value.filter(u => u.is_verified).length
}))

const filteredUsers = computed(() => {
  let filtered = users.value

  // 搜索筛选
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(user =>
      user.username.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      (user.phone_number && user.phone_number.includes(query))
    )
  }

  // 状态筛选
  if (statusFilter.value) {
    filtered = filtered.filter(user => user.status === statusFilter.value)
  }

  // 认证状态筛选
  if (verificationFilter.value !== '') {
    const isVerified = verificationFilter.value === 'true'
    filtered = filtered.filter(user => user.is_verified === isVerified)
  }

  // 用户类型筛选
  if (typeFilter.value) {
    if (typeFilter.value === 'admin') {
      filtered = filtered.filter(user => user.is_staff)
    } else if (typeFilter.value === 'user') {
      filtered = filtered.filter(user => !user.is_staff)
    }
  }

  return filtered
})

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredUsers.value.slice(start, end)
})

// 方法
const refreshUsers = async () => {
  loading.value = true
  try {
    // 调用实际的API获取用户列表
    const response = await api.getAllUsersApi();
    users.value = response;
    ElMessage.success('用户数据已刷新');
  } catch (error) {
    console.error('刷新用户数据失败:', error);
    ElMessage.error('刷新用户数据失败');
  } finally {
    loading.value = false;
  }
}

const exportUsers = () => {
  // 导出用户数据逻辑
  ElMessage.info('导出功能开发中...')
}

const handleSearch = () => {
  currentPage.value = 1
}

const handleFilter = () => {
  currentPage.value = 1
}

const resetFilters = () => {
  searchQuery.value = ''
  statusFilter.value = ''
  verificationFilter.value = ''
  typeFilter.value = ''
  currentPage.value = 1
}

const applyFilters = () => {
  currentPage.value = 1
  // No need to call API again here, computed properties handle filtering
  ElMessage.success('筛选条件已应用')
}

const handleSelectionChange = (selection) => {
  selectedUsers.value = selection
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleCurrentChange = (page) => {
  currentPage.value = page
}

const viewUserDetail = (user) => {
  selectedUser.value = user
  userDetailVisible.value = true
}

const editUser = (user) => {
  // 编辑用户逻辑
  ElMessage.info('编辑用户功能开发中...')
  userDetailVisible.value = false
}

const handleUserAction = async (command, user) => {
  selectedUser.value = user
  
  switch (command) {
    case 'edit':
      editUser(user)
      break
    case 'credit':
      creditAdjustVisible.value = true
      break
    case 'disable':
    case 'enable':
      await toggleUserStatus(user)
      break
    case 'delete':
      await deleteUser(user)
      break
  }
}

const toggleUserStatus = async (user) => {
  const action = user.status === 'Active' ? '禁用' : '启用'
  const newStatus = user.status === 'Active' ? 'Disabled' : 'Active'
  
  try {
    await ElMessageBox.confirm(
      `确定要${action}用户 "${user.username}" 吗？`,
      `${action}用户`,
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 调用实际的API更新用户状态
    await api.updateUserStatus(user.user_id, { status: newStatus });
    
    ElMessage.success(`用户已${action}`);
    refreshUsers(); // 刷新用户列表
  } catch (error) {
    if (error !== 'cancel') {
      console.error(`${action}用户失败:`, error);
      ElMessage.error(`${action}用户失败`);
    }
  }
}

const deleteUser = async (user) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户 "${user.username}" 吗？此操作不可撤销！`,
      '删除用户',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'error'
      }
    )

    // 调用实际的API删除用户
    await api.deleteUser(user.user_id);
    
    ElMessage.success('用户已删除');
    refreshUsers(); // 刷新用户列表

  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除用户失败:', error);
      ElMessage.error('删除用户失败');
    }
  }
}

const submitCreditAdjustment = async () => {
  try {
    await creditFormRef.value.validate()
    
    const { type, amount, reason } = creditForm.value
    let creditAdjustment = 0;

    // 计算 credit_adjustment
    if (type === 'add') {
        creditAdjustment = amount;
    } else if (type === 'subtract') {
        creditAdjustment = -amount;
    } else if (type === 'set') {
         // Calculate the difference to reach the 'set' amount
         if (selectedUser.value) {
            creditAdjustment = amount - selectedUser.value.credit;
         }
    }

    // 调用实际的API调整信用分
    await api.adjustUserCredit(selectedUser.value.user_id, {
      credit_adjustment: creditAdjustment,
      reason: reason
    });
    
    ElMessage.success('信用分调整成功');
    creditAdjustVisible.value = false;
    
    // 刷新用户列表
    refreshUsers();
    
    // 重置表单
    creditForm.value = {
      type: 'add',
      amount: 10,
      reason: ''
    };
  } catch (error) {
    if (error !== false) { // 不是表单验证错误
      console.error('调整信用分失败:', error);
      ElMessage.error('调整信用分失败');
    }
  }
}

// 辅助方法
const getStatusType = (status) => {
  return status === 'Active' ? 'success' : 'danger'
}

const getStatusText = (status) => {
  return status === 'Active' ? '活跃' : '禁用'
}

const getCreditColor = (credit) => {
  if (credit >= 80) return '#67c23a'
  if (credit >= 60) return '#e6a23c'
  return '#f56c6c'
}

const formatDate = (dateString) => {
  // Check if dateString is valid
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    // Check if the date is valid after parsing
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('zh-CN');
  } catch (e) {
    console.error("Error formatting date:", e);
    return 'Error';
  }
}

const formatDateTime = (dateString) => {
   // Check if dateString is valid
  if (!dateString) return 'N/A';
   try {
    const date = new Date(dateString);
    // Check if the date is valid after parsing
     if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleString('zh-CN');
   } catch (e) {
    console.error("Error formatting datetime:", e);
    return 'Error';
   }
}

const getTimeAgo = (dateString) => {
   // Check if dateString is valid
   if (!dateString) return 'N/A';
   try {
    const now = new Date()
    const date = new Date(dateString)
     if (isNaN(date.getTime())) return 'Invalid Date';
    const diff = now - date
    const seconds = Math.floor(diff / 1000);

    if (seconds < 60) return `${seconds}秒前`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}分钟前`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}小时前`;
    const days = Math.floor(hours / 24)
    
    if (days === 0) return '今天'
    if (days === 1) return '昨天'
    if (days < 30) return `${days}天前`
    if (days < 365) return `${Math.floor(days / 30)}个月前`
    return `${Math.floor(days / 365)}年前`
   } catch (e) {
    console.error("Error calculating time ago:", e);
    return 'Error';
   }

}

const getPreviewCredit = () => {
  if (!selectedUser.value) return 0
  
  const { type, amount } = creditForm.value
  let newCredit = selectedUser.value.credit
  
  switch (type) {
    case 'add':
      newCredit += amount || 0
      break
    case 'subtract':
      newCredit = Math.max(0, newCredit - (amount || 0))
      break
    case 'set':
      newCredit = amount || 0
      break
  }
  
  return Math.min(1000, Math.max(0, newCredit))
}

const getPreviewCreditType = () => {
  const credit = getPreviewCredit()
  if (credit >= 80) return 'success'
  if (credit >= 60) return 'warning'
  return 'danger'
}

onMounted(() => {
  // 初始化数据时调用 API 获取用户列表
  refreshUsers();
})

// Watch for filter changes and reset page (optional, handleFilter already does this)
// watch([searchQuery, statusFilter, verificationFilter, typeFilter], () => {
//   currentPage.value = 1;
// });
</script>

<style scoped>
/* 页面背景和内边距 */
.users-management-container {
  /* Use the overall light gray background from AdminLayout */
  background: #F8F9FA; /* Match AdminLayout background */
}

/* 页面头部 - Keep unique styling */
.page-header {
  margin-bottom: 24px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px; /* Keep unique larger radius */
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1); /* Keep unique larger shadow */
}

.title-section h1 {
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea, #764ba2); /* Keep unique gradient */
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 16px;
  color: #64748b;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

/* 统计卡片 - Keep unique styling */
.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 24px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px; /* Keep unique radius */
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1); /* Keep unique shadow */
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 16px;
  color: #fff;
}

.stat-icon.total {
  background: linear-gradient(45deg, #4A90E2, #81c784); /* Keep unique gradient */
}

.stat-icon.active {
  background: linear-gradient(45deg, #67c23a, #90ee90);
}

.stat-icon.disabled {
  background: linear-gradient(45deg, #f56c6c, #ff99a0);
}

.stat-icon.verified {
  background: linear-gradient(45deg, #e6a23c, #ffc107);
}

.stat-icon .el-icon {
  font-size: 28px;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #606266;
}

/* 筛选区域 */
.filter-card {
  margin-bottom: 24px;
  border-radius: 12px; /* Keep unique radius for filter card */
  background: rgba(255, 255, 255, 0.95); /* Keep unique background */
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08); /* Keep unique shadow */
}

.filter-card :deep(.el-card__body) {
  padding: 24px;
}

.filter-section {
  display: flex;
  flex-direction: column;
}

.filter-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.filter-item {
  display: flex;
  flex-direction: column;
}

.filter-item label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
  font-weight: bold;
}

.filter-item .el-input,
.filter-item .el-select {
  width: 100%;
}

.search-input :deep(.el-input__inner) {
  border-radius: 8px;
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 用户列表 */
.table-card {
  border-radius: 12px; /* Keep unique radius for table card */
  background: rgba(255, 255, 255, 0.95); /* Keep unique background */
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08); /* Keep unique shadow */
}

.table-card :deep(.el-card__body) {
  padding: 24px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.table-header h3 {
  font-size: 20px;
  color: #303133;
  margin: 0;
}

.table-actions .result-count {
  font-size: 14px;
  color: #909399;
}

.users-table {
  width: 100%;
}

.users-table :deep(.el-table__header th) {
  background-color: #f8f8f8 !important;
  color: #606266;
  font-weight: bold;
}

.users-table :deep(.el-table__cell) {
  padding: 12px 0;
}

/* 用户信息列样式 */
.user-info {
  display: flex;
  align-items: center;
}

.user-avatar {
  margin-right: 12px;
}

.user-details {
  justify-content: center;
}

.user-name {
  font-weight: bold;
  color: #303133;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-email,
.user-phone {
  font-size: 13px;
  color: #909399;
}

.major-text {
  color: #606266;
}

/* 状态标签样式 */
.status-tag {
  font-weight: bold;
}

/* 认证状态样式 */
.verification-status {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
}

.verified-icon {
  color: #67c23a;
}

.unverified-icon {
  color: #f56c6c;
}

/* 信用分样式 */
.credit-score {
  display: flex;
  align-items: center;
  gap: 8px;
}

.credit-progress {
  width: 80px;
}

.credit-number {
  font-weight: bold;
}

/* 注册时间样式 */
.join-time {
  font-size: 13px;
  color: #606266;
}

.time-ago {
  font-size: 12px;
  color: #909399;
}

/* 操作按钮样式 */
.action-buttons .el-button {
  padding: 0;
  height: auto;
}

/* 分页样式 */
.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 用户详情对话框样式 */
.user-detail-content {
  padding: 20px;
}

.detail-header {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
}

.detail-info {
  margin-left: 20px;
}

.detail-info h3 {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin: 0 0 8px 0;
}

.detail-info p {
  font-size: 16px;
  color: #606266;
  margin: 0 0 12px 0;
}

.detail-tags .el-tag {
  margin-right: 8px;
}

:deep(.detail-descriptions .el-descriptions__label) {
  font-weight: 600;
}

.user-bio h4 {
  font-size: 16px;
  color: #303133;
  margin: 0 0 8px 0;
}

.user-bio p {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
}

/* 信用分调整对话框样式 */
.credit-adjust-content {
  padding: 20px;
}

.current-credit {
  font-size: 16px;
  color: #606266;
  margin-bottom: 20px;
}

.credit-adjust-content .el-form-item {
  margin-bottom: 20px;
}

.credit-hint {
  font-size: 13px;
  color: #909399;
  margin-left: 10px;
}

.preview-result {
  margin-top: 20px;
  font-size: 16px;
  color: #606266;
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .user-info {
      flex-direction: column;
      align-items: flex-start;
  }

  .user-details {
      align-items: flex-start;
  }
}
</style> 