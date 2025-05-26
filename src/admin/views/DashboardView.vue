<template>
  <div class="dashboard-container">
    <!-- 欢迎区域 -->
    <div class="welcome-section">
      <div class="welcome-content">
        <h1 class="welcome-title">欢迎回来，{{ adminName }}</h1>
        <p class="welcome-subtitle">{{ currentTimeText }} · 今天是美好的一天</p>
      </div>
      <div class="weather-widget">
        <div class="weather-icon">☀️</div>
        <div class="weather-info">
          <span class="temperature">22°C</span>
          <span class="weather-desc">晴朗</span>
        </div>
      </div>
    </div>

    <!-- 核心指标卡片 -->
    <div class="metrics-grid">
      <div class="metric-card primary" @click="navigateTo('/admin/users')">
        <div class="metric-header">
          <div class="metric-icon">
            <el-icon size="24"><User /></el-icon>
          </div>
          <div class="metric-trend up">
            <el-icon size="12"><ArrowUp /></el-icon>
            <span>+12%</span>
          </div>
        </div>
        <div class="metric-content">
          <h3 class="metric-value">{{ stats.totalUsers || '--' }}</h3>
          <p class="metric-label">注册用户</p>
          <div class="metric-detail">
            <span>今日新增 {{ stats.newUsersToday || 0 }}</span>
          </div>
        </div>
      </div>

      <div class="metric-card success" @click="navigateTo('/admin/products-audit')">
        <div class="metric-header">
          <div class="metric-icon">
            <el-icon size="24"><Box /></el-icon>
          </div>
          <div class="metric-trend up">
            <el-icon size="12"><ArrowUp /></el-icon>
            <span>+8%</span>
          </div>
        </div>
        <div class="metric-content">
          <h3 class="metric-value">{{ stats.totalProducts || '--' }}</h3>
          <p class="metric-label">商品总数</p>
          <div class="metric-detail">
            <span>待审核 {{ stats.pendingProducts || 0 }}</span>
          </div>
        </div>
      </div>

      <div class="metric-card warning" @click="navigateTo('/admin/returns')">
        <div class="metric-header">
          <div class="metric-icon">
            <el-icon size="24"><RefreshLeft /></el-icon>
          </div>
          <div class="metric-trend down">
            <el-icon size="12"><ArrowDown /></el-icon>
            <span>-3%</span>
          </div>
        </div>
        <div class="metric-content">
          <h3 class="metric-value">{{ stats.pendingReturns || '--' }}</h3>
          <p class="metric-label">退货申请</p>
          <div class="metric-detail">
            <span>待处理</span>
          </div>
        </div>
      </div>

      <div class="metric-card danger" @click="navigateTo('/admin/reports')">
        <div class="metric-header">
          <div class="metric-icon">
            <el-icon size="24"><Warning /></el-icon>
          </div>
          <div class="metric-trend neutral">
            <span>--</span>
          </div>
        </div>
        <div class="metric-content">
          <h3 class="metric-value">{{ stats.activeReports || '--' }}</h3>
          <p class="metric-label">举报处理</p>
          <div class="metric-detail">
            <span>待处理</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 图表和列表区域 -->
    <div class="dashboard-content">
      <!-- 左侧：数据图表 -->
      <div class="charts-section">
        <el-card class="chart-card" shadow="never">
          <template #header>
            <div class="card-header">
              <h3>用户增长趋势</h3>
              <el-select v-model="chartPeriod" size="small">
                <el-option label="最近7天" value="7d"></el-option>
                <el-option label="最近30天" value="30d"></el-option>
                <el-option label="最近90天" value="90d"></el-option>
              </el-select>
            </div>
          </template>
          <div class="chart-container">
            <div ref="userChart" class="chart"></div>
          </div>
        </el-card>

        <el-card class="chart-card" shadow="never">
          <template #header>
            <div class="card-header">
              <h3>商品分类分布</h3>
            </div>
          </template>
          <div class="chart-container">
            <div ref="categoryChart" class="chart"></div>
          </div>
        </el-card>
      </div>

      <!-- 右侧：快速操作和列表 -->
      <div class="sidebar-section">
        <!-- 快速操作 -->
        <el-card class="quick-actions-card" shadow="never">
          <template #header>
            <h3>快速操作</h3>
          </template>
          <div class="quick-actions">
            <div class="action-item" @click="navigateTo('/admin/users')">
              <el-icon><User /></el-icon>
              <span>用户管理</span>
            </div>
            <div class="action-item" @click="navigateTo('/admin/products-audit')">
              <el-icon><Box /></el-icon>
              <span>商品审核</span>
            </div>
            <div class="action-item" @click="navigateTo('/admin/notifications')">
              <el-icon><Bell /></el-icon>
              <span>发送通知</span>
            </div>
            <div class="action-item" @click="navigateTo('/admin/reports')">
              <el-icon><Warning /></el-icon>
              <span>处理举报</span>
            </div>
          </div>
        </el-card>

        <!-- 最新活动 -->
        <el-card class="activity-card" shadow="never">
          <template #header>
            <div class="card-header">
              <h3>最新活动</h3>
              <el-link type="primary" :underline="false">查看全部</el-link>
            </div>
          </template>
          <div class="activity-list">
            <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
              <div class="activity-avatar">
                <el-avatar :size="32" :src="activity.avatar">{{ activity.username?.[0] }}</el-avatar>
              </div>
              <div class="activity-content">
                <p class="activity-text">
                  <strong>{{ activity.username }}</strong> {{ activity.action }}
                </p>
                <span class="activity-time">{{ formatTime(activity.time) }}</span>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 待办事项 -->
        <el-card class="todo-card" shadow="never">
          <template #header>
            <h3>待办事项</h3>
          </template>
          <div class="todo-list">
            <div class="todo-item urgent">
              <el-icon><Warning /></el-icon>
              <span>{{ stats.pendingProducts || 0 }} 个商品待审核</span>
              <el-button size="small" type="primary" text @click="navigateTo('/admin/products-audit')">处理</el-button>
            </div>
            <div class="todo-item">
              <el-icon><RefreshLeft /></el-icon>
              <span>{{ stats.pendingReturns || 0 }} 个退货申请</span>
              <el-button size="small" type="primary" text @click="navigateTo('/admin/returns')">查看</el-button>
            </div>
            <div class="todo-item">
              <el-icon><Bell /></el-icon>
              <span>{{ stats.activeReports || 0 }} 个举报待处理</span>
              <el-button size="small" type="primary" text @click="navigateTo('/admin/reports')">处理</el-button>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'
import { User, Box, RefreshLeft, Warning, Bell, ArrowUp, ArrowDown } from '@element-plus/icons-vue'

const router = useRouter()
const store = useStore()

// 响应式数据
const chartPeriod = ref('7d')
const userChart = ref(null)
const categoryChart = ref(null)

// 统计数据
const stats = ref({
  totalUsers: 0,
  newUsersToday: 0,
  totalProducts: 0,
  pendingProducts: 0,
  pendingReturns: 0,
  activeReports: 0
})

// 最新活动数据
const recentActivities = ref([
  {
    id: 1,
    username: 'zhangsan',
    action: '发布了新商品《二手MacBook Air》',
    time: new Date(Date.now() - 10 * 60 * 1000),
    avatar: null
  },
  {
    id: 2,
    username: 'lisi',
    action: '申请退货',
    time: new Date(Date.now() - 30 * 60 * 1000),
    avatar: null
  },
  {
    id: 3,
    username: 'wangwu',
    action: '注册了账号',
    time: new Date(Date.now() - 60 * 60 * 1000),
    avatar: null
  }
])

// 计算属性
const adminName = computed(() => {
  return store.state.user?.userInfo?.username || '管理员'
})

const currentTimeText = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) return '夜深了'
  if (hour < 12) return '早上好'
  if (hour < 18) return '下午好'
  return '晚上好'
})

// 方法
const navigateTo = (path) => {
  router.push(path)
}

const formatTime = (time) => {
  const now = new Date()
  const diff = now - time
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  return `${days}天前`
}

// 获取仪表盘数据
const fetchDashboardData = async () => {
  try {
    // 这里调用实际的API
    // const response = await api.getDashboardStats()

    // 模拟数据
    stats.value = {
      totalUsers: 1248,
      newUsersToday: 12,
      totalProducts: 856,
      pendingProducts: 23,
      pendingReturns: 7,
      activeReports: 3
    }
  } catch (error) {
    console.error('获取仪表盘数据失败:', error)
    ElMessage.error('获取数据失败')
  }
}

// 初始化图表
const initCharts = async () => {
  await nextTick()

  // 这里可以使用 ECharts 或其他图表库
  // 模拟图表初始化
  if (userChart.value) {
    userChart.value.innerHTML = '<div style="height: 200px; display: flex; align-items: center; justify-content: center; color: #999;">用户增长图表</div>'
  }

  if (categoryChart.value) {
    categoryChart.value.innerHTML = '<div style="height: 200px; display: flex; align-items: center; justify-content: center; color: #999;">分类分布图表</div>'
  }
}

onMounted(() => {
  fetchDashboardData()
  initCharts()
})
</script>

<style scoped>
.dashboard-container {
  padding: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: calc(100vh - 60px);
}

/* 欢迎区域 */
.welcome-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding: 32px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.welcome-content h1 {
  font-size: 32px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0 0 8px 0;
}

.welcome-subtitle {
  font-size: 16px;
  color: #64748b;
  margin: 0;
}

.weather-widget {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 16px;
  backdrop-filter: blur(10px);
}

.weather-icon {
  font-size: 32px;
}

.weather-info {
  display: flex;
  flex-direction: column;
}

.temperature {
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
}

.weather-desc {
  font-size: 14px;
  color: #64748b;
}

/* 指标卡片网格 */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.metric-card {
  padding: 24px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.metric-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.15);
}

.metric-card.primary { border-left: 4px solid #3b82f6; }
.metric-card.success { border-left: 4px solid #10b981; }
.metric-card.warning { border-left: 4px solid #f59e0b; }
.metric-card.danger { border-left: 4px solid #ef4444; }

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.metric-icon {
  padding: 12px;
  border-radius: 12px;
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.primary .metric-icon { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
.success .metric-icon { background: rgba(16, 185, 129, 0.1); color: #10b981; }
.warning .metric-icon { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
.danger .metric-icon { background: rgba(239, 68, 68, 0.1); color: #ef4444; }

.metric-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 12px;
}

.metric-trend.up { background: rgba(16, 185, 129, 0.1); color: #10b981; }
.metric-trend.down { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
.metric-trend.neutral { color: #64748b; }

.metric-value {
  font-size: 32px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 4px 0;
}

.metric-label {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 8px 0;
}

.metric-detail {
  font-size: 12px;
  color: #94a3b8;
}

/* 主要内容区域 */
.dashboard-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
}

.charts-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.sidebar-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 卡片样式 */
:deep(.el-card) {
  border: none;
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

:deep(.el-card__header) {
  padding: 20px 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

:deep(.el-card__body) {
  padding: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.chart-container {
  height: 240px;
}

.chart {
  width: 100%;
  height: 100%;
}

/* 快速操作 */
.quick-actions-card .el-card__body {
    padding-top: 0;
}

.quick-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px;
  background: rgba(59, 130, 246, 0.05);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
}

.action-item:hover {
  background: rgba(59, 130, 246, 0.1);
  transform: translateY(-2px);
}

.action-item span {
  font-size: 14px;
  font-weight: 500;
  color: #475569;
}

/* 活动列表 */
.activity-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.activity-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.activity-avatar {
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
}

.activity-text {
  margin: 0 0 4px 0;
  font-size: 14px;
  color: #374151;
  line-height: 1.5;
}

.activity-time {
  font-size: 12px;
  color: #9ca3af;
}

/* 待办事项 */
.todo-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 12px;
  font-size: 14px;
}

.todo-item.urgent {
  background: rgba(239, 68, 68, 0.05);
  border-left: 3px solid #ef4444;
}

.todo-item span {
  flex: 1;
  color: #374151;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .dashboard-content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 16px;
  }

  .welcome-section {
    flex-direction: column;
    gap: 20px;
    padding: 24px;
  }

  .metrics-grid {
    grid-template-columns: 1fr;
  }

  .quick-actions {
    grid-template-columns: 1fr;
  }
}
</style> 