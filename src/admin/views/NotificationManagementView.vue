<template>
  <div class="notifications-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">
            <el-icon><Bell /></el-icon>
            系统通知管理
          </h1>
          <p class="page-subtitle">创建和管理系统通知，与用户保持有效沟通</p>
        </div>
        <div class="header-actions">
          <el-button type="primary" size="large" @click="showCreateDialog = true">
            <el-icon><Plus /></el-icon>
            发送新通知
          </el-button>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card primary">
        <div class="stat-icon">
          <el-icon size="24"><Message /></el-icon>
        </div>
        <div class="stat-content">
          <h3 class="stat-value">{{ stats.totalNotifications }}</h3>
          <p class="stat-label">总通知数</p>
          <span class="stat-change">本月 +{{ stats.thisMonthNotifications }}</span>
        </div>
      </div>

      <div class="stat-card success">
        <div class="stat-icon">
          <el-icon size="24"><Check /></el-icon>
        </div>
        <div class="stat-content">
          <h3 class="stat-value">{{ stats.readNotifications }}</h3>
          <p class="stat-label">已读通知</p>
          <span class="stat-change">{{ readRate }}% 阅读率</span>
        </div>
      </div>

      <div class="stat-card warning">
        <div class="stat-icon">
          <el-icon size="24"><View /></el-icon>
        </div>
        <div class="stat-content">
          <h3 class="stat-value">{{ stats.unreadNotifications }}</h3>
          <p class="stat-label">未读通知</p>
          <span class="stat-change">待用户查看</span>
        </div>
      </div>

      <div class="stat-card info">
        <div class="stat-icon">
          <el-icon size="24"><User /></el-icon>
        </div>
        <div class="stat-content">
          <h3 class="stat-value">{{ stats.activeUsers }}</h3>
          <p class="stat-label">活跃用户</p>
          <span class="stat-change">本周活跃</span>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 筛选和搜索 -->
      <el-card class="filter-card" shadow="never">
        <div class="filter-section">
          <div class="filter-left">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索通知标题或内容..."
              class="search-input"
              clearable
              @input="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
          <div class="filter-right">
            <el-select v-model="statusFilter" placeholder="通知状态" class="filter-select" @change="handleFilterChange">
              <el-option label="全部状态" value="all"></el-option>
              <el-option label="已读" value="read"></el-option>
              <el-option label="未读" value="unread"></el-option>
            </el-select>
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              class="date-picker"
              @change="handleDateFilter"
            />
            <el-button @click="resetFilters">重置</el-button>
          </div>
        </div>
      </el-card>

      <!-- 通知列表 -->
      <el-card class="table-card" shadow="never">
        <template #header>
          <div class="table-header">
            <h3>通知记录</h3>
            <div class="table-actions">
              <el-button size="small" @click="refreshData">
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
            </div>
          </div>
        </template>

        <el-table
          :data="paginatedNotifications"
          v-loading="loading"
          style="width: 100%"
          :row-class-name="getRowClassName"
        >
          <el-table-column type="selection" width="55" />
          
          <el-table-column prop="title" label="通知标题" min-width="200">
            <template #default="{ row }">
              <div class="notification-title">
                <el-tag :type="getNotificationTypeTag(row.type)" size="small">
                  {{ getNotificationType(row.type) }}
                </el-tag>
                <span class="title-text">{{ row.title }}</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="content" label="通知内容" min-width="300">
            <template #default="{ row }">
              <div class="notification-content">
                <p class="content-preview">{{ getContentPreview(row.content) }}</p>
                <el-button v-if="row.content.length > 100" type="primary" text size="small" @click="openContentDialog(row)">
                  查看全文
                </el-button>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="username" label="接收用户" width="120">
            <template #default="{ row }">
              <div class="user-info">
                <el-avatar :size="24" :src="row.userAvatar">{{ row.username?.[0] }}</el-avatar>
                <span class="username">{{ row.username }}</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="createTime" label="发送时间" width="160">
            <template #default="{ row }">
              <div class="time-info">
                <span class="time">{{ formatDateTime(row.createTime) }}</span>
                <span class="time-ago">{{ getTimeAgo(row.createTime) }}</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="isRead" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.isRead ? 'success' : 'warning'" size="small">
                {{ row.isRead ? '已读' : '未读' }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="120" fixed="right">
            <template #default="{ row }">
              <div class="action-buttons">
                <el-tooltip content="查看详情" placement="top">
                  <el-button size="small" type="primary" text @click="viewNotification(row)">
                    <el-icon><View /></el-icon>
                  </el-button>
                </el-tooltip>
                <el-tooltip content="删除" placement="top">
                  <el-button size="small" type="danger" text @click="deleteNotification(row)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </el-tooltip>
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
            :total="filteredNotifications.length"
            layout="total, sizes, prev, pager, next, jumper"
            background
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
    </div>

    <!-- 创建通知对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      title="发送系统通知"
      width="800px"
      :close-on-click-modal="false"
      class="create-dialog"
    >
      <el-form
        ref="createFormRef"
        :model="createForm"
        :rules="createRules"
        label-width="100px"
        class="create-form"
      >
        <el-form-item label="通知类型" prop="notificationType">
          <el-select v-model="createForm.notificationType" placeholder="选择通知类型" style="width: 100%">
            <el-option label="系统公告" value="system"></el-option>
            <el-option label="商品通知" value="product"></el-option>
            <el-option label="交易通知" value="transaction"></el-option>
            <el-option label="安全提醒" value="security"></el-option>
            <el-option label="活动通知" value="activity"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="接收对象" prop="recipients">
          <el-radio-group v-model="createForm.recipientType">
            <el-radio label="all">全体用户</el-radio>
            <el-radio label="specific">指定用户</el-radio>
            <el-radio label="filtered">筛选用户</el-radio>
          </el-radio-group>
          
          <div v-if="createForm.recipientType === 'specific'" class="recipient-selector">
            <el-select
              v-model="createForm.selectedUsers"
              multiple
              filterable
              remote
              reserve-keyword
              placeholder="搜索并选择用户"
              :remote-method="searchUsers"
              :loading="searchingUsers"
              style="width: 100%; margin-top: 10px;"
            >
              <el-option
                v-for="user in userOptions"
                :key="user.userId"
                :label="`${user.username} (${user.email})`"
                :value="user.userId"
              />
            </el-select>
          </div>

          <div v-if="createForm.recipientType === 'filtered'" class="filter-selector">
            <el-row :gutter="16" style="margin-top: 10px;">
              <el-col :span="12">
                <el-select v-model="createForm.filterCriteria.status" placeholder="用户状态" style="width: 100%;">
                  <el-option label="全部状态" value="all"></el-option>
                  <el-option label="活跃用户" value="active"></el-option>
                  <el-option label="新注册用户" value="new"></el-option>
                </el-select>
              </el-col>
              <el-col :span="12">
                <el-select v-model="createForm.filterCriteria.verified" placeholder="认证状态" style="width: 100%;">
                  <el-option label="全部用户" value="all"></el-option>
                  <el-option label="已认证用户" value="verified"></el-option>
                  <el-option label="未认证用户" value="unverified"></el-option>
                </el-select>
              </el-col>
            </el-row>
          </div>
        </el-form-item>

        <el-form-item label="通知标题" prop="title">
          <el-input
            v-model="createForm.title"
            placeholder="输入通知标题"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="通知内容" prop="content">
          <el-input
            v-model="createForm.content"
            type="textarea"
            placeholder="输入通知内容"
            :rows="6"
            maxlength="2000"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="预计接收人数">
          <el-tag type="info">{{ estimatedRecipients }} 人</el-tag>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showCreateDialog = false">取消</el-button>
          <el-button type="primary" @click="sendNotification" :loading="sending">
            {{ sending ? '发送中...' : '发送通知' }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 通知内容详情对话框 -->
    <el-dialog
      v-model="showContentDialog"
      :title="selectedNotification?.title"
      width="600px"
      class="content-dialog"
    >
      <div v-if="selectedNotification" class="notification-detail">
        <div class="detail-item">
          <label>通知类型：</label>
          <el-tag :type="getNotificationTypeTag(selectedNotification.type)" size="small">
            {{ getNotificationType(selectedNotification.type) }}
          </el-tag>
        </div>
        <div class="detail-item">
          <label>接收用户：</label>
          <span>{{ selectedNotification.username }}</span>
        </div>
        <div class="detail-item">
          <label>发送时间：</label>
          <span>{{ formatDateTime(selectedNotification.createTime) }}</span>
        </div>
        <div class="detail-item">
          <label>阅读状态：</label>
          <el-tag :type="selectedNotification.isRead ? 'success' : 'warning'" size="small">
            {{ selectedNotification.isRead ? '已读' : '未读' }}
          </el-tag>
        </div>
        <div class="detail-content">
          <label>通知内容：</label>
          <div class="content-text">{{ selectedNotification.content }}</div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Bell, Plus, Message, Check, View, User, Search, Refresh, Delete
} from '@element-plus/icons-vue'

// 响应式数据
const loading = ref(false)
const sending = ref(false)
const searchingUsers = ref(false)
const showCreateDialog = ref(false)
const showContentDialog = ref(false)
const selectedNotification = ref(null)

// 搜索和筛选
const searchKeyword = ref('')
const statusFilter = ref('all')
const dateRange = ref([])

// 分页
const currentPage = ref(1)
const pageSize = ref(20)
const totalNotifications = ref(0)

// 统计数据
const stats = ref({
  totalNotifications: 150, // Mock
  readNotifications: 100, // Mock
  unreadNotifications: 50,  // Mock
  activeUsers: 80, // Mock
  thisMonthNotifications: 30 // Mock
})

// 通知数据 (Mock Data)
const notifications = ref([
  { id: 1, type: 'system', title: '平台维护通知', content: '亲爱的用户，为提供更稳定的服务，平台将于明日凌晨进行维护，请您提前做好准备。', username: '全体用户', userAvatar: null, createTime: '2023-10-26T10:00:00Z', isRead: true },
  { id: 2, type: 'product', title: '您的商品《二手iPhone 13》审核通过', content: '恭喜您，您发布的商品《二手iPhone 13》已通过审核，现已上架。', username: 'zhangsan', userAvatar: null, createTime: '2023-10-25T14:30:00Z', isRead: false },
  { id: 3, type: 'transaction', title: '您有新的订单', content: '用户lisi购买了您的商品《闲置机械键盘》，请及时处理。', username: 'wangwu', userAvatar: null, createTime: '2023-10-25T11:15:00Z', isRead: true },
  { id: 4, type: 'security', title: '安全提醒：密码修改成功', content: '您的账户密码已于今日成功修改。如果不是您本人操作，请及时联系客服。', username: 'lisi', userAvatar: null, createTime: '2023-10-24T09:00:00Z', isRead: false },
  { id: 5, type: 'activity', title: '校园跳蚤市场活动即将开始！', content: '本周末将在学校体育馆举办线下跳蚤市场活动，欢迎大家参加！', username: '全体用户', userAvatar: null, createTime: '2023-10-23T18:00:00Z', isRead: true },
]);
const userOptions = ref([]) // For specific user selection

// 创建表单
const createFormRef = ref(null)
const createForm = ref({
  notificationType: '',
  recipientType: 'all', // 'all', 'specific', 'filtered'
  selectedUsers: [], // Array of user IDs for 'specific'
  filterCriteria: { // For 'filtered'
    status: 'all', // 'all', 'active', 'new'
    verified: 'all' // 'all', 'verified', 'unverified'
  },
  title: '',
  content: ''
})

const createRules = {
  notificationType: [
    { required: true, message: '请选择通知类型', trigger: 'change' }
  ],
  title: [
    { required: true, message: '请输入通知标题', trigger: 'blur' },
    { min: 1, max: 200, message: '标题长度为 1 到 200 个字符', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入通知内容', trigger: 'blur' },
    { min: 1, max: 2000, message: '内容长度为 1 到 2000 个字符', trigger: 'blur' }
  ]
  // Note: Adding rule for selectedUsers or filterCriteria based on recipientType could be complex
  // and might be handled with custom validation or logic.
}

// 计算属性
const readRate = computed(() => {
  if (stats.value.totalNotifications === 0) return 0
  return Math.round((stats.value.readNotifications / stats.value.totalNotifications) * 100)
})

const estimatedRecipients = computed(() => {
  // This would ideally fetch from backend based on recipientType and filters
  // For now, return mock data or simple logic
  if (createForm.value.recipientType === 'all') return stats.value.totalUsers || 1000; // Assume total users is high
  if (createForm.value.recipientType === 'specific') return createForm.value.selectedUsers.length;
  if (createForm.value.recipientType === 'filtered') {
    // Simple mock based on filter criteria
    let count = stats.value.totalUsers || 1000;
    if (createForm.value.filterCriteria.status === 'active') count = Math.round(count * 0.8);
    if (createForm.value.filterCriteria.status === 'new') count = Math.round(count * 0.1);
    if (createForm.value.filterCriteria.verified === 'verified') count = Math.round(count * 0.6);
    if (createForm.value.filterCriteria.verified === 'unverified') count = Math.round(count * 0.4);
    // Apply both filters - very rough estimate
     if (createForm.value.filterCriteria.status !== 'all' && createForm.value.filterCriteria.verified !== 'all') {
         count = Math.round(count * 0.5); // Apply a further reduction for combined filters
     }
    return Math.max(1, Math.min(count, stats.value.totalUsers || 1000)); // Ensure count is at least 1 and not more than total
  }
  return 0;
})

const filteredNotifications = computed(() => {
  let filtered = notifications.value

  // 搜索筛选
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(item =>
      item.title.toLowerCase().includes(keyword) ||
      item.content.toLowerCase().includes(keyword) ||
      item.username?.toLowerCase().includes(keyword)
    )
  }

  // 状态筛选
  if (statusFilter.value !== 'all') {
    const isReadStatus = statusFilter.value === 'read';
    filtered = filtered.filter(item => item.isRead === isReadStatus);
  }

  // 日期范围筛选
  if (dateRange.value && dateRange.value.length === 2) {
    const start = new Date(dateRange.value[0]);
    start.setHours(0, 0, 0, 0);
    const end = new Date(dateRange.value[1]);
     end.setHours(23, 59, 59, 999);

    filtered = filtered.filter(item => {
      const itemDate = new Date(item.createTime);
      return itemDate >= start && itemDate <= end;
    });
  }

  // Note: Pagination is applied to filtered data, not here directly.
  return filtered
})

const paginatedNotifications = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredNotifications.value.slice(start, end);
})


// 方法
const fetchNotifications = async () => {
  loading.value = true;
  try {
    // TODO: Replace with actual API call to fetch notifications
    // const response = await api.getNotifications({ ...filters, page: currentPage.value, size: pageSize.value });
    // notifications.value = response.data;
    // totalNotifications.value = response.total;
    
    // Using mock data and applying pagination manually for now
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
    
    // The filteredNotifications computed property handles filtering and searching.
    // We just need to update the total based on filtered data for pagination.
    totalNotifications.value = filteredNotifications.value.length;

  } catch (error) {
    console.error('获取通知列表失败:', error);
    ElMessage.error('获取通知列表失败');
  } finally {
    loading.value = false;
  }
}

const fetchStats = async () => {
    try {
        // TODO: Replace with actual API call to fetch notification stats
        // const response = await api.getNotificationStats();
        // stats.value = response;
        
        // Using mock data
        stats.value = {
            totalNotifications: notifications.value.length, // Use current mock data length
            readNotifications: notifications.value.filter(n => n.isRead).length,
            unreadNotifications: notifications.value.filter(n => !n.isRead).length,
            activeUsers: 80, // Keep mock
            thisMonthNotifications: 30 // Keep mock
        };
    } catch (error) {
        console.error('获取通知统计失败:', error);
        ElMessage.error('获取通知统计失败');
    }
}

const refreshData = () => {
  fetchNotifications();
  fetchStats();
  ElMessage.success('数据已刷新');
}

const handleSearch = () => {
  currentPage.value = 1; // Reset page on search
  fetchNotifications(); // Refetch or re-filter data
}

const handleFilterChange = () => {
  currentPage.value = 1; // Reset page on filter change
  fetchNotifications(); // Refetch or re-filter data
}

const handleDateFilter = () => {
   currentPage.value = 1; // Reset page on date filter change
   fetchNotifications(); // Refetch or re-filter data
}

const resetFilters = () => {
  searchKeyword.value = '';
  statusFilter.value = 'all';
  dateRange.value = [];
  currentPage.value = 1;
  fetchNotifications(); // Refetch with no filters
  ElMessage.info('筛选条件已重置');
}

const getRowClassName = ({ row, rowIndex }) => {
  // Example: Add a class for unread notifications
  return row.isRead ? '' : 'unread-row';
}

const getNotificationType = (type) => {
  const typeMap = {
    system: '系统公告',
    product: '商品通知',
    transaction: '交易通知',
    security: '安全提醒',
    activity: '活动通知'
  };
  return typeMap[type] || '其他';
}

const getNotificationTypeTag = (type) => {
   const typeMap = {
    system: 'info',
    product: 'primary',
    transaction: 'success',
    security: 'danger',
    activity: 'warning'
  };
  return typeMap[type] || '';
}

const getContentPreview = (content) => {
  return content.length > 100 ? content.substring(0, 100) + '...' : content;
}

const openContentDialog = (notification) => {
  selectedNotification.value = notification;
  showContentDialog.value = true;
}

const viewNotification = (notification) => {
  // Mark as read (client-side mock)
  notification.isRead = true;
  // TODO: Call API to mark as read
  // api.markNotificationAsRead(notification.id);
  selectedNotification.value = notification;
  showContentDialog.value = true;
  fetchStats(); // Update stats after marking as read
}

const deleteNotification = async (notification) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除这条通知吗？`,
      '删除通知',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    // TODO: Call API to delete notification
    // await api.deleteNotification(notification.id);

    // Remove from mock data
    notifications.value = notifications.value.filter(item => item.id !== notification.id);
    ElMessage.success('通知已删除');
    fetchNotifications(); // Refresh pagination/list
    fetchStats(); // Update stats

  } catch (error) {
     if (error !== 'cancel') {
      console.error('删除通知失败:', error);
      ElMessage.error('删除通知失败');
    }
  }
}

const searchUsers = async (query) => {
  if (query) {
    searchingUsers.value = true;
    try {
      // TODO: Replace with actual API call to search users for selection
      // const response = await api.searchUsers(query);
      // userOptions.value = response.data.map(user => ({ userId: user.id, username: user.username, email: user.email }));
      
      // Mock user search
      await new Promise(resolve => setTimeout(resolve, 300));
      userOptions.value = [
          { userId: 'user-1', username: 'zhangsan', email: 'zhangsan@test.com' },
          { userId: 'user-2', username: 'lisi', email: 'lisi@test.com' },
          { userId: 'user-3', username: 'wangwu', email: 'wangwu@test.com' },
      ].filter(user => user.username.includes(query) || user.email.includes(query));

    } catch (error) {
      console.error('搜索用户失败:', error);
      ElMessage.error('搜索用户失败');
    } finally {
      searchingUsers.value = false;
    }
  } else {
    userOptions.value = [];
  }
}

const handleSizeChange = (val) => {
  pageSize.value = val;
  currentPage.value = 1;
  fetchNotifications();
}

const handleCurrentChange = (val) => {
  currentPage.value = val;
  fetchNotifications();
}

const sendNotification = async () => {
  try {
    await createFormRef.value?.validate();
    sending.value = true;
    
    const notificationData = {
      type: createForm.value.notificationType,
      title: createForm.value.title,
      content: createForm.value.content,
      recipient_type: createForm.value.recipientType,
      recipient_ids: createForm.value.recipientType === 'specific' ? createForm.value.selectedUsers : undefined,
      filter_criteria: createForm.value.recipientType === 'filtered' ? createForm.value.filterCriteria : undefined,
    };

    // TODO: Replace with actual API call to send notification
    // await api.sendSystemNotification(notificationData);

    // Simulate sending and reset form
    await new Promise(resolve => setTimeout(resolve, 1000));
    ElMessage.success('通知发送成功');
    showCreateDialog.value = false;
    createFormRef.value?.resetFields();
    createForm.value.recipientType = 'all'; // Reset recipient type
    createForm.value.selectedUsers = [];
    createForm.value.filterCriteria = { status: 'all', verified: 'all' };

    fetchNotifications(); // Refresh list
    fetchStats(); // Update stats

  } catch (error) {
     if (error !== false) { // Avoid showing error for form validation failure
        console.error('发送通知失败:', error);
        ElMessage.error('发送通知失败');
     }
  } finally {
    sending.value = false;
  }
}

const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleString('zh-CN');
  } catch (e) {
    console.error("Error formatting datetime:", e);
    return 'Error';
  }
}

const getTimeAgo = (dateString) => {
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


// 生命周期钩子
onMounted(() => {
  fetchNotifications();
  fetchStats();
})

// Watchers for filter changes (optional, already handled by @change on inputs/selects)
// watch([searchKeyword, statusFilter, dateRange], () => {
//   currentPage.value = 1;
//   fetchNotifications();
// });

</script>

<style scoped>
.notifications-container {
  padding: 24px;
  /* Use the overall light gray background from AdminLayout */
  background: #F8F9FA; /* Match AdminLayout background */
  min-height: calc(100vh - 60px);
}

/* Page Header - Adjust to match UserManagementView */
.page-header {
  margin-bottom: 24px;
}

.header-content {
   display: flex;
   justify-content: space-between;
   align-items: center;
   padding: 32px; /* Match UserManagementView header padding */
   background: rgba(255, 255, 255, 0.95); /* Match UserManagementView header background */
   backdrop-filter: blur(10px); /* Keep backdrop-filter if desired */
   border-radius: 20px; /* Match UserManagementView header radius */
   box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1); /* Match UserManagementView header shadow */
}

.header-left {
   display: flex;
   flex-direction: column;
   justify-content: center;
}

.page-title {
   font-size: 28px; /* Match UserManagementView */
   font-weight: 700;
   background: linear-gradient(135deg, #667eea, #764ba2); /* Keep unique gradient */
   -webkit-background-clip: text;
   -webkit-text-fill-color: transparent;
   margin: 0 0 8px 0;
}

.page-subtitle {
   font-size: 16px; /* Match UserManagementView */
   color: #64748b; /* Match UserManagementView */
   margin: 0;
}

.header-actions {
   display: flex;
   gap: 12px;
}


/* Stats Grid - Adjust to match UserManagementView */
.stats-grid {
   display: grid;
   grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
   gap: 20px;
   margin-bottom: 24px;
}

.stat-card {
   display: flex;
   align-items: center;
   padding: 24px;
   background: rgba(255, 255, 255, 0.95); /* Match UserManagementView */
   backdrop-filter: blur(10px); /* Keep backdrop-filter if desired */
   border-radius: 12px; /* Match UserManagementView */
   box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1); /* Match UserManagementView */
}

.stat-icon {
   width: 48px;
   height: 48px;
   border-radius: 12px; /* Match UserManagementView */
   display: flex;
   justify-content: center;
   align-items: center;
   margin-right: 16px;
   color: #fff; /* White icon color */
}

/* Keep unique stat icon colors/gradients */
.stat-card.primary .stat-icon { background: linear-gradient(45deg, #3b82f6, #93c5fd); } /* Keep unique gradient */
.stat-card.success .stat-icon { background: linear-gradient(45deg, #10b981, #6ee7b7); }
.stat-card.warning .stat-icon { background: linear-gradient(45deg, #f59e0b, #ffcf96); }
.stat-card.info .stat-icon { background: linear-gradient(45deg, #64748b, #94a3b8); }

.stat-icon .el-icon {
   font-size: 28px; /* Match UserManagementView */
}

.stat-content h3 {
   font-size: 24px; /* Match UserManagementView */
   font-weight: bold; /* Match UserManagementView */
   color: #303133; /* Match UserManagementView */
   margin: 0 0 4px 0; /* Adjust margin */
}

.stat-content p {
   font-size: 14px; /* Match UserManagementView */
   color: #606266; /* Match UserManagementView */
   margin: 0;
}

.stat-change {
  font-size: 12px; /* Adjust font size */
  color: #909399; /* Adjust color */
}


/* Filter and Search Area - Adjust to match UserManagementView */
.main-content {
  /* Remove main-content specific styles if they conflict */
  /* background-color: #ffffff; */
  /* padding: 20px; */
  /* border-radius: 8px; */
  /* box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); */
}

.filter-card {
  margin-bottom: 24px; /* Match UserManagementView */
  border-radius: 12px; /* Match UserManagementView radius */
  background: #FFFFFF; /* White background for filter card */
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08); /* Match UserManagementView shadow */
}

.filter-card :deep(.el-card__body) {
  padding: 24px; /* Match UserManagementView padding */
}

.filter-section {
  display: flex; /* Use flexbox for layout */
  flex-direction: column; /* Stack filter rows vertically */
  gap: 20px; /* Space between filter rows */
}

.filter-left,
.filter-right {
   display: flex;
   align-items: center;
   gap: 12px; /* Consistent gap */
   /* Remove flex-wrap if not intended */
   /* flex-wrap: wrap; */
}

.filter-left > *, .filter-right > * {
    /* Ensure elements within flex containers dont stretch unnecessarily */
     flex-shrink: 0;
}

.search-input {
  flex-grow: 1; /* Allow search input to grow */
  min-width: 250px; /* Ensure minimum width */
}

.filter-select,
.date-picker {
  width: auto; /* Allow select/date picker to size based on content or flex */
  min-width: 150px; /* Ensure minimum width */
}

.filter-right {
  justify-content: flex-end; /* Align actions to the right */
  width: 100%; /* Take full width */
}


/* Notification List Table - Adjust to match UserManagementView Table Card */
.table-card {
  border-radius: 12px; /* Match UserManagementView radius */
  background: #FFFFFF; /* White background for table card */
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08); /* Match UserManagementView shadow */
}

.table-card :deep(.el-card__body) {
  padding: 24px; /* Match UserManagementView padding */
}

.table-header {
}

.table-header h3 {
  font-size: 18px; /* Match UserManagementView table header */
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.table-actions {
}

.el-table {
}

.el-table :deep(.el-table__header th) {
   background-color: #f8f8f8 !important; /* Match UserManagementView */
   color: #606266; /* Match UserManagementView */
   font-weight: bold; /* Match UserManagementView */
}

.el-table :deep(.el-table__cell) {
   padding: 12px 0; /* Match UserManagementView padding */
}

/* Specific column styles to match UserManagementView */
.notification-title {
   display: flex;
   align-items: center;
   gap: 8px;
}

.title-text {
   font-weight: bold;
   color: #303133;
}

.notification-content {
   display: flex;
   flex-direction: column;
}

.content-preview {
   font-size: 14px;
   color: #606266;
   line-height: 1.5;
   margin-bottom: 8px; /* Space below preview */
   display: -webkit-box; /* Limit lines */
   -webkit-line-clamp: 2;
   -webkit-box-orient: vertical;
   overflow: hidden;
   text-overflow: ellipsis;
}

.user-info {
   display: flex;
   align-items: center;
   gap: 8px;
}

.username {
   font-size: 14px;
   color: #303133;
}

.time-info {
   font-size: 13px;
   color: #606266;
   display: flex;
   flex-direction: column;
   gap: 4px;
}

.time,
.time-ago {
   white-space: nowrap;
}

.action-buttons .el-button {
   padding: 4px 8px; /* Adjust padding */
   font-size: 12px; /* Adjust font size */
}

/* Pagination Wrapper - Match UserManagementView */
.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}


/* Create Dialog - Keep specific styles but align padding/margins */
.create-dialog :deep(.el-dialog__body) {
   padding: 20px; /* Consistent dialog body padding */
}

.create-form .el-form-item {
   margin-bottom: 20px; /* Consistent spacing */
}

.recipient-selector {
   margin-top: 10px; /* Space below radio buttons */
}

.recipient-selector .el-select {
   width: 100%; /* Ensure select takes full width */
}

/* Content Dialog - Keep specific styles but align padding/margins */
.content-dialog :deep(.el-dialog__body) {
   padding: 20px; /* Consistent dialog body padding */
}

.content-dialog .notification-full-content {
   white-space: pre-wrap; /* Preserve whitespace and wrap text */
   word-break: break-word; /* Break long words */
   font-size: 14px;
   color: #606266;
   line-height: 1.6;
}


/* Removed unused styles from previous version */
/*
.notifications-container h1 {
  margin-bottom: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
}

.stat-card .stat-icon {
  font-size: 30px;
  margin-right: 15px;
  color: #409eff;
}

.stat-card h3 {
  font-size: 20px;
  margin: 0;
  font-weight: bold;
}

.stat-card p {
  font-size: 12px;
  color: #666;
  margin: 0;
}

.stat-card .stat-change {
  font-size: 11px;
  color: #999;
  margin-top: 4px;
}

.main-content {
  background-color: #ffffff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.filter-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.filter-left,
.filter-right {
  display: flex;
  gap: 10px;
  align-items: center;
}

.search-input {
  flex: 1;
  min-width: 200px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.table-header h3 {
  margin: 0;
}

.notification-title .el-tag {
  margin-right: 8px;
}

.notification-content .content-preview {
  margin-bottom: 5px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 5px;
}

.user-info .el-avatar {
  width: 24px;
  height: 24px;
  line-height: 24px;
  font-size: 10px;
}

.username {
  font-size: 13px;
}

.time-info span {
  display: block;
}

.action-buttons .el-button {
  padding: 5px 10px;
  font-size: 12px;
}

.create-dialog .el-form-item {
  margin-bottom: 15px;
}
*/
</style>
