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
                :src="row['头像URL'] ? BackendConfig.RESTFUL_API_URL.replace(/\/api$/, '') + row['头像URL'] : ''"
                class="user-avatar"
              >
                {{ row['用户名'] ? row['用户名'].slice(0, 2).toUpperCase() : '??' }}
              </el-avatar>
              <div class="user-details">
                <div class="user-name">
                  {{ row['用户名'] }}
                  <el-tag v-if="row['是否管理员']" type="warning" size="small" class="admin-tag">管理员</el-tag>
                </div>
                <div class="user-email">{{ row['邮箱'] || 'N/A' }}</div>
                <div class="user-phone" v-if="row['手机号码']">{{ row['手机号码'] }}</div>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="专业" prop="major" width="120">
          <template #default="{ row }">
            <span class="major-text">{{ row['专业'] || '未填写' }}</span>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag
              :type="getStatusType(row['账户状态'])"
              class="status-tag"
            >
              {{ getStatusText(row['账户状态']) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="认证状态" width="100">
          <template #default="{ row }">
            <div class="verification-status">
              <el-icon v-if="row['是否已认证']" class="verified-icon"><CircleCheck /></el-icon>
              <el-icon v-else class="unverified-icon"><CircleClose /></el-icon>
              <span>{{ row['是否已认证'] ? '已认证' : '未认证' }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="信用分" width="120" sortable>
          <template #default="{ row }">
            <el-tag :color="getCreditColor(row['信用分'])" effect="dark">
              {{ row['信用分'] }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="注册时间" width="160">
          <template #default="{ row }">
            <div class="join-time">
              <div>{{ formatDate(row['注册时间']) }}</div>
              <div class="time-ago">{{ getTimeAgo(row['注册时间']) }}</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-space>
              <el-button
                type="primary"
                size="small"
                @click="handleEditProfile(row)"
                link
              >
                编辑资料
              </el-button>
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
                    <el-dropdown-item command="credit">调整信用分</el-dropdown-item>
                    <el-dropdown-item
                      :command="row['账户状态'] === 'Active' ? 'disable' : 'enable'"
                    >
                      {{ row['账户状态'] === 'Active' ? '禁用用户' : '启用用户' }}
                    </el-dropdown-item>
                    <el-dropdown-item
                      command="delete"
                      divided
                      :disabled="!isSuperAdmin || row['用户ID'] === currentUser?.['用户ID']"
                    >
                      删除用户
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </el-space>
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
      v-model="userDetailDialogVisible"
      title="用户详情"
      width="600px"
      destroy-on-close
      @close="() => { selectedUserDetail = null; userDetailError = null; }"
    >
      <div v-loading="loadingUserDetail">
        <div v-if="selectedUserDetail">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="用户ID">{{ selectedUserDetail['用户ID'] }}</el-descriptions-item>
            <el-descriptions-item label="用户名">{{ selectedUserDetail['用户名'] }}</el-descriptions-item>
            <el-descriptions-item label="邮箱">{{ selectedUserDetail['邮箱'] || '未填写' }}</el-descriptions-item>
            <el-descriptions-item label="手机号">{{ selectedUserDetail['手机号码'] || '未填写' }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="getStatusType(selectedUserDetail['账户状态'])">{{ getStatusText(selectedUserDetail['账户状态']) }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="信用分">{{ selectedUserDetail['信用分'] }}</el-descriptions-item>
            <el-descriptions-item label="管理员">{{ selectedUserDetail['是否管理员'] ? '是' : '否' }}</el-descriptions-item>
            <el-descriptions-item label="超级管理员">{{ selectedUserDetail['是否超级管理员'] ? '是' : '否' }}</el-descriptions-item>
            <el-descriptions-item label="已认证">{{ selectedUserDetail['是否已认证'] ? '是' : '否' }}</el-descriptions-item>
            <el-descriptions-item label="专业" :span="2">{{ selectedUserDetail['专业'] || '未填写' }}</el-descriptions-item>
            <el-descriptions-item label="个人简介" :span="2">{{ selectedUserDetail['个人简介'] || '未填写' }}</el-descriptions-item>
            <el-descriptions-item label="注册时间" :span="2">{{ formatDate(selectedUserDetail['注册时间']) }} ({{ getTimeAgo(selectedUserDetail['注册时间']) }})</el-descriptions-item>
          </el-descriptions>
        </div>
        <div v-else-if="userDetailError">
          <p class="error-message">{{ userDetailError }}</p>
        </div>
        <div v-else style="text-align: center; padding: 20px;">请选择用户查看详情。</div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="userDetailDialogVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 编辑资料对话框 -->
    <ProfileEdit
      :isProfileEditDialogVisible="isProfileEditDialogVisible"
      :userInfo="selectedUser" 
      @updateCancel="isProfileEditDialogVisible = false; selectedUser = null"
      @updateSuccess="handleProfileEditSuccess"
    />

    <!-- 调整信用分对话框 -->
    <el-dialog
      v-model="adjustCreditDialogVisible"
      title="调整用户信用分"
      width="400px"
      @close="cancelCreditAdjustment"
    >
      <el-form
        :model="creditAdjustmentForm"
        :rules="creditRules"
        ref="creditFormRef"
        label-width="auto"
        class="credit-adjustment-form"
      >
        <el-form-item label="调整值" prop="credit_adjustment">
          <el-input-number v-model="creditAdjustmentForm.credit_adjustment" :min="-1000" :max="1000" controls-position="right" />
        </el-form-item>
        <el-form-item label="原因" prop="reason">
          <el-input v-model="creditAdjustmentForm.reason" type="textarea" :rows="3" placeholder="请输入调整信用分的原因" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancelCreditAdjustment">取消</el-button>
          <el-button type="primary" @click="saveCreditAdjustment">保存</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 禁用/启用用户确认对话框 -->
    <el-dialog
      :title="currentChangeStatusAction === 'disable' ? '禁用用户' : '启用用户'"
      v-model="isConfirmChangeStatusDialogVisible"
      width="30%"
      center
    >
      <span>确认要{{ currentChangeStatusAction === 'disable' ? '禁用' : '启用' }}用户 <strong>{{ selectedUser ? selectedUser['用户名'] : '' }}</strong> 吗？</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="isConfirmChangeStatusDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmChangeStatus">确认</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 删除用户确认对话框 -->
    <el-dialog
      title="删除用户"
      v-model="isConfirmDeleteDialogVisible"
      width="30%"
      center
    >
      <span>确认要软删除用户 <strong>{{ selectedUser ? selectedUser['用户名'] : '' }}</strong> 吗？该操作将修改用户的邮箱为占位符，并禁用账户，但保留其历史记录。原邮箱可以重新注册。</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="isConfirmDeleteDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="confirmDeleteUser">确认删除</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, reactive, nextTick } from 'vue'
import { useStore } from 'vuex'
import { ElMessage, ElMessageBox, ElSpace, ElForm, ElDialog, ElDescriptions, ElDescriptionsItem, ElLoading } from 'element-plus'
import {
  User, Search, Refresh, Download, CircleCheck, CircleClose,
  Select, ArrowDown
} from '@element-plus/icons-vue'
import ProfileEdit from '@/user/components/ProfileEdit.vue'
import FormatObject from '@/utils/format.js'
import api from '@/API_PRO.js'
import BackendConfig from "../../../backend.config"
import { formatDistanceToNow, parseISO } from 'date-fns'
import { zhCN } from 'date-fns/locale'

const store = useStore()

const loading = ref(false)
const searchQuery = ref('')
const statusFilter = ref('')
const verificationFilter = ref('')
const typeFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const selectedUsers = ref([])

const userDetailDialogVisible = ref(false)
const isProfileEditDialogVisible = ref(false)
const adjustCreditDialogVisible = ref(false)
const selectedUser = ref(null)
const selectedUserDetail = ref(null)
const isConfirmChangeStatusDialogVisible = ref(false)
const currentChangeStatusAction = ref('')
const isConfirmDeleteDialogVisible = ref(false)

const currentUser = computed(() => store.getters['user/currentUser'] || {})
const isSuperAdmin = computed(() => store.getters['user/isSuperAdmin'])

const creditAdjustmentForm = reactive({
  credit_adjustment: 0,
  reason: '',
})

const creditRules = {
  credit_adjustment: [
    { required: true, message: '请输入信用分调整值', trigger: 'blur' },
    { type: 'number', message: '信用分调整值必须是数字', trigger: 'blur' },
    { validator: (rule, value, callback) => {
        if (!Number.isInteger(value)) {
            callback(new Error('信用分调整值必须是整数'));
        } else if (value < -1000 || value > 1000) {
            callback(new Error('信用分调整值范围为 -1000 到 1000'));
        } else {
            callback();
        }
    }, trigger: 'blur' }
  ],
  reason: [
    { required: true, message: '请输入调整原因', trigger: 'blur' },
    { max: 200, message: '原因长度不能超过 200 个字符', trigger: 'blur' }
  ],
}

const creditFormRef = ref(null)

const users = ref([])

const userStats = computed(() => ({
  total: users.value.length,
  active: users.value.filter(u => u['账户状态'] === 'Active').length,
  disabled: users.value.filter(u => u['账户状态'] === 'Disabled').length,
  verified: users.value.filter(u => u['是否已认证']).length
}))

const filteredUsers = computed(() => {
  let filtered = users.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(user =>
      user['用户名']?.toLowerCase().includes(query) ||
      user['邮箱']?.toLowerCase().includes(query) ||
      (user['手机号码'] && user['手机号码'].includes(query))
    )
  }

  if (statusFilter.value) {
    filtered = filtered.filter(user => user['账户状态'] === statusFilter.value)
  }

  if (verificationFilter.value !== '') {
    const isVerified = verificationFilter.value === 'true'
    filtered = filtered.filter(user => user['是否已认证'] === isVerified)
  }

  if (typeFilter.value) {
    if (typeFilter.value === 'admin') {
      filtered = filtered.filter(user => user['是否管理员'])
    } else if (typeFilter.value === 'user') {
      filtered = filtered.filter(user => !user['是否管理员'])
    }
  }

  return filtered
})

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredUsers.value.slice(start, end)
})

const refreshUsers = async () => {
  loading.value = true
  try {
    const response = await api.getAllUsersApi()
    users.value = response
    ElMessage.success('用户数据已刷新')
  } catch (error) {
    console.error('刷新用户数据失败:', error)
    ElMessage.error('刷新用户数据失败')
  } finally {
    loading.value = false
  }
}

const exportUsers = () => {
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

const viewUserDetail = async (user) => {
  selectedUserDetail.value = null
  userDetailDialogVisible.value = true
  try {
    const detail = await api.getUserProfileById(user['用户ID'])
    selectedUserDetail.value = detail
  } catch (error) {
    console.error('获取用户详情失败:', error)
    ElMessage.error('获取用户详情失败')
    userDetailDialogVisible.value = false
  }
}

const handleEditProfile = (user) => {
  selectedUser.value = { ...user }
  isProfileEditDialogVisible.value = true
}

const handleProfileEditSuccess = () => {
  isProfileEditDialogVisible.value = false
  selectedUser.value = null
  refreshUsers()
  ElMessage.success('用户资料更新成功！')
}

const openAdjustCreditDialog = (user) => {
  selectedUser.value = user; // Use selectedUser here for consistency
  creditAdjustmentForm.credit_adjustment = 0;
  creditAdjustmentForm.reason = '';
  adjustCreditDialogVisible.value = true;
  nextTick(() => {
    if (creditFormRef.value) {
      creditFormRef.value.resetFields();
    }
  });
};

const saveCreditAdjustment = async () => {
  if (!creditFormRef.value) return;

  await creditFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await api.adjustUserCredit(
          selectedUser.value['用户ID'], // Use selectedUser
          {
            credit_adjustment: creditAdjustmentForm.credit_adjustment,
            reason: creditAdjustmentForm.reason,
          }
        );
        ElMessage.success('信用分调整成功');
        adjustCreditDialogVisible.value = false;
        refreshUsers();
      } catch (error) {
        console.error('调整信用分失败:', error);
        const errorMessage = error.response?.data?.detail || '调整信用分失败，请稍后重试';
        ElMessage.error(errorMessage);
      }
    }
  });
};

const cancelCreditAdjustment = () => {
  adjustCreditDialogVisible.value = false;
  selectedUser.value = null;
  if (creditFormRef.value) {
    creditFormRef.value.resetFields();
  }
};

const handleUserAction = (command, row) => {
  selectedUser.value = { ...row }
  switch (command) {
    case 'edit':
      handleEditProfile(row)
      break
    case 'credit':
      openAdjustCreditDialog(row)
      break
    case 'disable':
    case 'enable':
      currentChangeStatusAction.value = command
      isConfirmChangeStatusDialogVisible.value = true
      break
    case 'delete':
      if (!isSuperAdmin.value) {
        ElMessage.error('您没有权限删除用户。')
        return
      }
      if (row['用户ID'] === currentUser.value?.['用户ID']) {
        ElMessage.warning('您不能删除您自己的账户。')
        return
      }
      isConfirmDeleteDialogVisible.value = true
      break
    default:
      console.warn(`Unknown command: ${command}`);
  }
}

const confirmChangeStatus = async () => {
  if (!selectedUser.value) return
  loading.value = true
  try {
    const newStatus = currentChangeStatusAction.value === 'disable' ? 'Disabled' : 'Active'
    await api.updateUserStatus(selectedUser.value['用户ID'], { status: newStatus })
    ElMessage.success(`用户已${currentChangeStatusAction.value === 'disable' ? '禁用' : '启用'}`)
    isConfirmChangeStatusDialogVisible.value = false
    selectedUser.value = null
    refreshUsers()
  } catch (error) {
    console.error('更改用户状态失败:', error)
    ElMessage.error(`更改用户 ${selectedUser.value['用户名']} 状态失败: ${error.response?.data?.detail || error.message}`)
  } finally {
    loading.value = false
  }
}

const confirmDeleteUser = async () => {
  if (!selectedUser.value) return
  loading.value = true
  try {
    await api.deleteUser(selectedUser.value['用户ID'])
    ElMessage.success('用户已删除')
    isConfirmDeleteDialogVisible.value = false
    selectedUser.value = null
    refreshUsers()
  } catch (error) {
    console.error('删除用户失败:', error)
    ElMessage.error('删除用户失败')
  } finally {
    loading.value = false
  }
}

const getStatusType = (status) => {
  return status === 'Active' ? 'success' : 'danger'
}

const getStatusText = (status) => {
  return status === 'Active' ? '活跃' : '禁用/已删除'
}

const getCreditColor = (credit) => {
  if (credit >= 80) return '#67c23a'
  if (credit >= 60) return '#e6a23c'
  return '#f56c6c'
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
  return new Date(dateString).toLocaleDateString('zh-CN', options)
}

const getTimeAgo = (dateString) => {
  if (!dateString) return 'N/A'
    const now = new Date()
  const past = new Date(dateString)
  const seconds = Math.floor((now - past) / 1000)

  if (seconds < 60) return `${seconds} 秒前`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} 分钟前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} 小时前`
    const days = Math.floor(hours / 24)
  if (days < 30) return `${days} 天前`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months} 月前`
  const years = Math.floor(months / 12)
  return `${years} 年前`
}

onMounted(() => {
  refreshUsers()
})
</script>

<style scoped>
.users-management-container {
  padding: 20px;
  background-color: #f0f2f5;
  min-height: calc(100vh - 60px);
}

.page-header {
  background-color: #ffffff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-section .page-title {
  font-size: 24px;
  color: #303133;
  margin-bottom: 5px;
}

.title-section .page-subtitle {
  font-size: 14px;
  color: #909399;
}

.header-actions .el-button {
  margin-left: 10px;
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  background-color: #ffffff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
}

.stat-icon {
  font-size: 36px;
  margin-right: 15px;
  padding: 10px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.stat-icon.total {
  background-color: #ecf5ff;
  color: #409eff;
}

.stat-icon.active {
  background-color: #f0f9eb;
  color: #67c23a;
}

.stat-icon.disabled {
  background-color: #fef0f0;
  color: #f56c6c;
}

.stat-icon.verified {
  background-color: #fdf6ec;
  color: #e6a23c;
}

.stat-content .stat-number {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.stat-content .stat-label {
  font-size: 14px;
  color: #909399;
}

.filter-card {
  margin-bottom: 20px;
}

.filter-section {
  display: flex;
  flex-direction: column;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 15px;
}

.filter-item {
  display: flex;
  flex-direction: column;
  flex-basis: 200px;
}

.filter-item label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 5px;
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.table-card {
  margin-bottom: 20px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.table-header h3 {
  font-size: 18px;
  color: #303133;
}

.result-count {
  font-size: 14px;
  color: #909399;
}

.users-table .user-info {
  display: flex;
  align-items: center;
}

.users-table .user-avatar {
  margin-right: 10px;
}

.users-table .user-details {
  display: flex;
  flex-direction: column;
}

.users-table .user-name {
  font-weight: bold;
  color: #303133;
  display: flex;
  align-items: center;
}

.users-table .admin-tag {
  margin-left: 8px;
  transform: scale(0.8);
  transform-origin: left center;
}

.users-table .user-email,
.users-table .user-phone {
  font-size: 12px;
  color: #909399;
}

.users-table .major-text {
  color: #606266;
}

.users-table .status-tag {
  min-width: 60px;
  text-align: center;
}

.users-table .verification-status {
  display: flex;
  align-items: center;
  color: #606266;
  font-size: 13px;
}

.users-table .verification-status .el-icon {
  margin-right: 5px;
}

.users-table .verified-icon {
  color: #67c23a;
}

.users-table .unverified-icon {
  color: #909399;
}

.users-table .credit-score {
  display: flex;
  align-items: center;
}

.users-table .credit-progress {
  flex-grow: 1;
  margin-right: 8px;
}

.users-table .credit-number {
  font-weight: bold;
  color: #303133;
}

.users-table .join-time {
  font-size: 13px;
  color: #606266;
}

.users-table .time-ago {
  font-size: 12px;
  color: #909399;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 5px;
}

.action-buttons .el-button {
  padding: 0 5px;
  height: auto;
}

.el-dropdown {
  vertical-align: middle;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.detail-content .detail-row {
  display: flex;
  margin-bottom: 10px;
}

.detail-content .detail-label {
  font-weight: bold;
  color: #303133;
  width: 100px;
  flex-shrink: 0;
}

.detail-content .detail-value {
  color: #606266;
  flex-grow: 1;
}

.dialog-footer {
  text-align: right;
}

.dialog-footer .el-button {
  margin-left: 10px;
}

.credit-adjustment-form .el-form-item {
  margin-bottom: 20px;
}

.credit-adjustment-form .el-input-number {
  width: 100%;
}

.credit-adjustment-form .el-input__inner {
  text-align: left !important;
}
</style> 