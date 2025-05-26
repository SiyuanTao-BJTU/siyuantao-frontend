<template>
  <div class="returns-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">退货申请管理</h1>
        <p class="page-subtitle">处理用户退货申请，维护平台交易秩序</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" :icon="Download" @click="exportReturns">
          导出数据
        </el-button>
        <el-button type="success" :icon="RefreshRight" @click="refreshData">
          刷新
        </el-button>
      </div>
    </div>

    <!-- 数据统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card pending">
        <div class="stat-icon">
          <el-icon size="24"><Clock /></el-icon>
        </div>
        <div class="stat-content">
          <h3>{{ stats.pending }}</h3>
          <p>待处理</p>
        </div>
      </div>
      <div class="stat-card approved">
        <div class="stat-icon">
          <el-icon size="24"><Select /></el-icon>
        </div>
        <div class="stat-content">
          <h3>{{ stats.approved }}</h3>
          <p>已同意</p>
        </div>
      </div>
      <div class="stat-card rejected">
        <div class="stat-icon">
          <el-icon size="24"><CloseBold /></el-icon>
        </div>
        <div class="stat-content">
          <h3>{{ stats.rejected }}</h3>
          <p>已拒绝</p>
        </div>
      </div>
      <div class="stat-card completed">
        <div class="stat-icon">
          <el-icon size="24"><CircleCheck /></el-icon>
        </div>
        <div class="stat-content">
          <h3>{{ stats.completed }}</h3>
          <p>已完成</p>
        </div>
      </div>
    </div>

    <!-- 筛选和搜索区域 -->
    <el-card class="filter-card" shadow="never">
      <div class="filter-row">
        <div class="filter-left">
          <el-input
            v-model="searchQuery"
            placeholder="搜索申请单号、用户名、商品名称..."
            :prefix-icon="Search"
            clearable
            style="width: 300px"
            @change="handleSearch"
          />
          <el-select v-model="statusFilter" placeholder="状态筛选" clearable style="width: 150px" @change="handleFilter">
            <el-option label="全部状态" value="" />
            <el-option label="待处理" value="pending" />
            <el-option label="已同意" value="approved" />
            <el-option label="已拒绝" value="rejected" />
            <el-option label="已完成" value="completed" />
          </el-select>
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            @change="handleFilter"
            style="width: 240px"
          />
        </div>
        <div class="filter-right">
          <el-button :icon="Filter" @click="toggleAdvancedFilter">
            高级筛选
          </el-button>
          <el-button :icon="RefreshLeft" @click="resetFilters">
            重置
          </el-button>
        </div>
      </div>

      <!-- 高级筛选面板 -->
      <div v-show="showAdvancedFilter" class="advanced-filter">
        <el-divider />
        <div class="advanced-filter-row">
          <el-select v-model="categoryFilter" placeholder="商品分类" clearable>
            <el-option label="全部分类" value="" />
            <el-option label="电子产品" value="electronics" />
            <el-option label="服装配饰" value="fashion" />
            <el-option label="书籍教材" value="books" />
            <el-option label="生活用品" value="daily" />
            <el-option label="其他" value="others" />
          </el-select>
          <el-select v-model="reasonFilter" placeholder="退货原因" clearable>
            <el-option label="全部原因" value="" />
            <el-option label="商品损坏" value="damaged" />
            <el-option label="描述不符" value="mismatch" />
            <el-option label="质量问题" value="quality" />
            <el-option label="不喜欢" value="dislike" />
            <el-option label="其他" value="others" />
          </el-select>
          <el-input-number
            v-model="minAmount"
            placeholder="最低金额"
            :min="0"
            :precision="2"
            controls-position="right"
          />
          <el-input-number
            v-model="maxAmount"
            placeholder="最高金额"
            :min="0"
            :precision="2"
            controls-position="right"
          />
        </div>
      </div>
    </el-card>

    <!-- 批量操作工具栏 -->
    <div v-show="selectedReturns.length > 0" class="batch-toolbar">
      <div class="batch-info">
        已选择 <span class="selected-count">{{ selectedReturns.length }}</span> 项
      </div>
      <div class="batch-actions">
        <el-button type="success" size="small" @click="batchApprove">
          批量同意
        </el-button>
        <el-button type="danger" size="small" @click="batchReject">
          批量拒绝
        </el-button>
        <el-button size="small" @click="clearSelection">
          取消选择
        </el-button>
      </div>
    </div>

    <!-- 数据表格 -->
    <el-card class="table-card" shadow="never">
      <el-table
        ref="returnsTable"
        v-loading="loading"
        :data="returnsList"
        @selection-change="handleSelectionChange"
        row-key="id"
        style="width: 100%"
      >
        <el-table-column type="selection" width="50" />
        
        <el-table-column prop="return_id" label="申请单号" width="140">
          <template #default="{ row }">
            <el-link type="primary" @click="viewDetail(row)">
              {{ row.return_id }}
            </el-link>
          </template>
        </el-table-column>

        <el-table-column label="商品信息" min-width="200">
          <template #default="{ row }">
            <div class="product-info">
              <el-image
                :src="row.product.image_url || '/placeholder-image.jpg'"
                fit="cover"
                class="product-image"
                :preview-src-list="[row.product.image_url]"
              />
              <div class="product-details">
                <div class="product-name">{{ row.product.name }}</div>
                <div class="product-price">¥{{ row.product.price }}</div>
                <el-tag size="small">{{ getCategoryName(row.product.category) }}</el-tag>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="用户信息" width="120">
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar :size="32" :src="row.user.avatar_url">
                {{ row.user.username?.[0] }}
              </el-avatar>
              <div class="user-name">{{ row.user.username }}</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="reason" label="退货原因" width="120">
          <template #default="{ row }">
            <el-tag :type="getReasonTagType(row.reason)">
              {{ getReasonText(row.reason) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="description" label="详细说明" min-width="150" show-overflow-tooltip />

        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="created_at" label="申请时间" width="140">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button size="small" @click="viewDetail(row)">
                详情
              </el-button>
              <el-button
                v-if="row.status === 'pending'"
                size="small"
                type="success"
                @click="approveReturn(row)"
              >
                同意
              </el-button>
              <el-button
                v-if="row.status === 'pending'"
                size="small"
                type="danger"
                @click="rejectReturn(row)"
              >
                拒绝
              </el-button>
              <el-button
                v-if="row.status === 'approved'"
                size="small"
                type="primary"
                @click="completeReturn(row)"
              >
                完成
              </el-button>
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
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="退货申请详情"
      width="800px"
      :before-close="handleDetailClose"
    >
      <div v-if="currentReturn" class="return-detail">
        <div class="detail-header">
          <div class="return-info">
            <h3>申请单号：{{ currentReturn.return_id }}</h3>
            <el-tag :type="getStatusTagType(currentReturn.status)" size="large">
              {{ getStatusText(currentReturn.status) }}
            </el-tag>
          </div>
          <div class="return-time">
            申请时间：{{ formatDate(currentReturn.created_at) }}
          </div>
        </div>

        <el-divider />

        <div class="detail-content">
          <div class="content-row">
            <div class="content-left">
              <h4>商品信息</h4>
              <div class="product-card">
                <el-image
                  :src="currentReturn.product.image_url || '/placeholder-image.jpg'"
                  fit="cover"
                  class="detail-product-image"
                />
                <div class="product-info-detail">
                  <h5>{{ currentReturn.product.name }}</h5>
                  <p>价格：¥{{ currentReturn.product.price }}</p>
                  <p>分类：{{ getCategoryName(currentReturn.product.category) }}</p>
                  <p>卖家：{{ currentReturn.product.seller_name }}</p>
                </div>
              </div>
            </div>
            <div class="content-right">
              <h4>用户信息</h4>
              <div class="user-card">
                <el-avatar :size="60" :src="currentReturn.user.avatar_url">
                  {{ currentReturn.user.username?.[0] }}
                </el-avatar>
                <div class="user-info-detail">
                  <h5>{{ currentReturn.user.username }}</h5>
                  <p>邮箱：{{ currentReturn.user.email }}</p>
                  <p>信用分：{{ currentReturn.user.credit }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="return-reason-section">
            <h4>退货原因</h4>
            <el-tag :type="getReasonTagType(currentReturn.reason)" size="large">
              {{ getReasonText(currentReturn.reason) }}
            </el-tag>
            <div class="reason-description">
              {{ currentReturn.description || '无详细说明' }}
            </div>
          </div>

          <div v-if="currentReturn.images && currentReturn.images.length > 0" class="return-images-section">
            <h4>相关图片</h4>
            <div class="images-grid">
              <el-image
                v-for="(image, index) in currentReturn.images"
                :key="index"
                :src="image"
                fit="cover"
                class="return-image"
                :preview-src-list="currentReturn.images"
                :initial-index="index"
              />
            </div>
          </div>

          <div v-if="currentReturn.admin_note" class="admin-note-section">
            <h4>管理员备注</h4>
            <div class="admin-note">{{ currentReturn.admin_note }}</div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
          <el-button
            v-if="currentReturn?.status === 'pending'"
            type="success"
            @click="approveReturn(currentReturn)"
          >
            同意退货
          </el-button>
          <el-button
            v-if="currentReturn?.status === 'pending'"
            type="danger"
            @click="rejectReturn(currentReturn)"
          >
            拒绝退货
          </el-button>
          <el-button
            v-if="currentReturn?.status === 'approved'"
            type="primary"
            @click="completeReturn(currentReturn)"
          >
            标记完成
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 处理对话框 -->
    <el-dialog
      v-model="processDialogVisible"
      :title="processTitle"
      width="500px"
    >
      <el-form :model="processForm" label-width="80px">
        <el-form-item label="备注">
          <el-input
            v-model="processForm.note"
            type="textarea"
            :rows="4"
            placeholder="请输入处理备注（可选）"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="processDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="confirmProcess"
            :loading="processing"
          >
            确认{{ processAction }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Download,
  RefreshRight,
  Clock,
  Select,
  CloseBold,
  CircleCheck,
  Search,
  Filter,
  RefreshLeft
} from '@element-plus/icons-vue'

// 响应式数据
const loading = ref(false)
const showAdvancedFilter = ref(false)
const detailDialogVisible = ref(false)
const processDialogVisible = ref(false)
const processing = ref(false)

// 搜索和筛选
const searchQuery = ref('')
const statusFilter = ref('')
const dateRange = ref([])
const categoryFilter = ref('')
const reasonFilter = ref('')
const minAmount = ref(null)
const maxAmount = ref(null)

// 表格数据
const returnsList = ref([])
const selectedReturns = ref([])
const currentReturn = ref(null)

// 分页
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

// 统计数据
const stats = ref({
  pending: 12,
  approved: 8,
  rejected: 3,
  completed: 24
})

// 处理表单
const processForm = reactive({
  note: ''
})

const processAction = ref('')
const processTitle = computed(() => `${processAction.value}退货申请`)

// 模拟数据
const mockReturns = [
  {
    id: '1',
    return_id: 'RT202412010001',
    product: {
      name: 'MacBook Air M2 13英寸',
      price: 8999.00,
      category: 'electronics',
      image_url: 'https://via.placeholder.com/60x60',
      seller_name: 'zhangsan'
    },
    user: {
      username: 'lisi',
      email: 'lisi@sjtu.edu.cn',
      avatar_url: null,
      credit: 95
    },
    reason: 'damaged',
    description: '收到商品时发现屏幕有划痕，与描述不符',
    status: 'pending',
    created_at: '2024-12-01T10:30:00Z',
    images: ['https://via.placeholder.com/300x200', 'https://via.placeholder.com/300x200']
  },
  {
    id: '2',
    return_id: 'RT202412010002',
    product: {
      name: 'iPhone 15 Pro 256GB',
      price: 6999.00,
      category: 'electronics',
      image_url: 'https://via.placeholder.com/60x60',
      seller_name: 'wangwu'
    },
    user: {
      username: 'zhaoliu',
      email: 'zhaoliu@sjtu.edu.cn',
      avatar_url: null,
      credit: 88
    },
    reason: 'quality',
    description: '电池续航明显不正常，怀疑是翻新机',
    status: 'approved',
    created_at: '2024-11-30T15:20:00Z',
    admin_note: '已同意退货，请买家尽快寄回商品'
  }
]

// 方法定义
const getCategoryName = (category) => {
  const categoryMap = {
    electronics: '电子产品',
    fashion: '服装配饰',
    books: '书籍教材',
    daily: '生活用品',
    others: '其他'
  }
  return categoryMap[category] || '未知分类'
}

const getReasonText = (reason) => {
  const reasonMap = {
    damaged: '商品损坏',
    mismatch: '描述不符',
    quality: '质量问题',
    dislike: '不喜欢',
    others: '其他'
  }
  return reasonMap[reason] || '未知原因'
}

const getReasonTagType = (reason) => {
  const typeMap = {
    damaged: 'danger',
    mismatch: 'warning',
    quality: 'danger',
    dislike: 'info',
    others: ''
  }
  return typeMap[reason] || ''
}

const getStatusText = (status) => {
  const statusMap = {
    pending: '待处理',
    approved: '已同意',
    rejected: '已拒绝',
    completed: '已完成'
  }
  return statusMap[status] || '未知状态'
}

const getStatusTagType = (status) => {
  const typeMap = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
    completed: 'info'
  }
  return typeMap[status] || ''
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

// 数据获取和操作
const fetchReturns = async () => {
  loading.value = true
  try {
    // 模拟API调用
    setTimeout(() => {
      returnsList.value = mockReturns
      total.value = mockReturns.length
      loading.value = false
    }, 500)
  } catch (error) {
    ElMessage.error('获取退货申请列表失败')
    loading.value = false
  }
}

const refreshData = () => {
  fetchReturns()
  ElMessage.success('数据已刷新')
}

const handleSearch = () => {
  // 实现搜索逻辑
  fetchReturns()
}

const handleFilter = () => {
  // 实现筛选逻辑
  fetchReturns()
}

const toggleAdvancedFilter = () => {
  showAdvancedFilter.value = !showAdvancedFilter.value
}

const resetFilters = () => {
  searchQuery.value = ''
  statusFilter.value = ''
  dateRange.value = []
  categoryFilter.value = ''
  reasonFilter.value = ''
  minAmount.value = null
  maxAmount.value = null
  fetchReturns()
}

const handleSelectionChange = (selection) => {
  selectedReturns.value = selection
}

const clearSelection = () => {
  selectedReturns.value = []
}

const viewDetail = (row) => {
  currentReturn.value = row
  detailDialogVisible.value = true
}

const handleDetailClose = () => {
  detailDialogVisible.value = false
  currentReturn.value = null
}

const approveReturn = (row) => {
  processAction.value = '同意'
  currentReturn.value = row
  processForm.note = ''
  processDialogVisible.value = true
}

const rejectReturn = (row) => {
  processAction.value = '拒绝'
  currentReturn.value = row
  processForm.note = ''
  processDialogVisible.value = true
}

const completeReturn = (row) => {
  processAction.value = '完成'
  currentReturn.value = row
  processForm.note = ''
  processDialogVisible.value = true
}

const confirmProcess = async () => {
  processing.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 更新状态
    if (processAction.value === '同意') {
      currentReturn.value.status = 'approved'
    } else if (processAction.value === '拒绝') {
      currentReturn.value.status = 'rejected'
    } else if (processAction.value === '完成') {
      currentReturn.value.status = 'completed'
    }
    
    if (processForm.note) {
      currentReturn.value.admin_note = processForm.note
    }
    
    ElMessage.success(`${processAction.value}退货申请成功`)
    processDialogVisible.value = false
    detailDialogVisible.value = false
    refreshData()
  } catch (error) {
    ElMessage.error(`${processAction.value}退货申请失败`)
  } finally {
    processing.value = false
  }
}

const batchApprove = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要批量同意选中的 ${selectedReturns.value.length} 个退货申请吗？`,
      '批量操作确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 模拟批量操作
    ElMessage.success('批量同意退货申请成功')
    clearSelection()
    refreshData()
  } catch {
    // 用户取消操作
  }
}

const batchReject = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要批量拒绝选中的 ${selectedReturns.value.length} 个退货申请吗？`,
      '批量操作确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 模拟批量操作
    ElMessage.success('批量拒绝退货申请成功')
    clearSelection()
    refreshData()
  } catch {
    // 用户取消操作
  }
}

const exportReturns = () => {
  ElMessage.success('导出功能开发中...')
}

const handleSizeChange = (val) => {
  pageSize.value = val
  fetchReturns()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchReturns()
}

// 生命周期
onMounted(() => {
  fetchReturns()
})
</script>

<style scoped>
/* 页面背景和内边距 - 保留特定背景 */
.returns-management {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); /* 保留特定背景 */
}

/* 页面头部 - 保留特定样式 */
.page-title {
  background: linear-gradient(135deg, #667eea, #764ba2); /* 保留特定颜色渐变 */
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* 统计卡片 - 保留特定颜色 */
.stat-card.pending .stat-icon {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.stat-card.approved .stat-icon {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.stat-card.rejected .stat-icon {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.stat-card.completed .stat-icon {
  background: rgba(99, 102, 241, 0.1);
  color: #6366f1;
}

/* 筛选卡片 - 保留特定样式 */
.filter-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.filter-left {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.filter-right {
  display: flex;
  gap: 8px;
}

.advanced-filter {
  margin-top: 16px;
}

.advanced-filter-row {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

/* 批量操作工具栏 - 保留特定样式 */
.batch-toolbar {
  background: rgba(59, 130, 246, 0.1); /* 保留特定背景 */
}

.batch-info {
  font-size: 14px;
  color: #333;
}

.selected-count {
  font-weight: bold;
  color: #3b82f6;
}

.batch-actions {
  display: flex;
  gap: 8px;
}

/* 商品信息列 - 保留特定样式 */
.product-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.product-image {
  width: 60px; /* 保留特定尺寸 */
  height: 60px; /* 保留特定尺寸 */
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
}

.product-details {
  flex: 1;
  min-width: 0;
}

.product-name {
  font-size: 15px; /* 保留特定字体大小 */
  font-weight: 500; /* 保留特定字体粗细 */
  color: #333;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-price {
  font-size: 14px; /* 保留特定字体大小 */
  color: #f56c6c;
}

/* 用户信息列 - 保留特定样式 */
.user-info {
  flex-direction: column; /* 保留特定布局方向 */
  align-items: center; /* 保留特定对齐方式 */
  gap: 6px; /* 保留特定间距 */
}

.user-name {
  font-size: 13px; /* 保留特定字体大小 */
  color: #555;
}

/* 详情对话框 - 保留特定样式 */
.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.return-info h3 {
  font-size: 20px; /* 保留特定字体大小 */
  color: #333;
  margin: 0 0 8px 0;
}

.return-time {
  font-size: 14px;
  color: #999;
}

.detail-content {
  margin-top: 20px;
}

.content-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.content-left, .content-right {
  padding: 15px;
  border-radius: 8px;
  background: #f9f9f9;
}

.content-left h4, .content-right h4 {
  margin-top: 0;
  margin-bottom: 12px;
  color: #555;
}

.product-card, .user-card {
  display: flex;
  align-items: center;
  gap: 12px;
}

.detail-product-image {
  width: 80px; /* 保留特定尺寸 */
  height: 80px; /* 保留特定尺寸 */
  border-radius: 8px;
  object-fit: cover;
}

.product-info-detail h5,
.user-info-detail h5 {
  font-size: 15px; /* 保留特定字体大小 */
  color: #333;
  margin: 0 0 4px 0;
}

.product-info-detail p,
.user-info-detail p {
  font-size: 13px; /* 保留特定字体大小 */
  color: #666;
  margin: 0 0 4px 0;
}

.return-reason-section,
.return-images-section,
.admin-note-section {
  margin-bottom: 20px;
}

.return-reason-section h4,
.return-images-section h4,
.admin-note-section h4 {
  margin-bottom: 12px;
  color: #555;
}

.reason-description,
.admin-note {
  font-size: 14px; /* 保留特定字体大小 */
  color: #666;
  line-height: 1.6;
  margin-top: 8px; /* 部分有 margin-top */
}

.images-grid {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.return-image {
  width: 100px; /* 保留特定尺寸 */
  height: 100px; /* 保留特定尺寸 */
  border-radius: 8px;
  object-fit: cover;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .user-info {
      flex-direction: row; /* 保留特定布局方向 */
      align-items: center; /* 保留特定对齐方式 */
  }

  .detail-header {
      flex-direction: column;
      align-items: flex-start;
  }

  .return-time {
      margin-top: 12px;
  }

  .content-row {
      grid-template-columns: 1fr;
  }

  .dialog-footer {
      text-align: center;
  }

  .dialog-footer button {
      margin: 4px;
  }
}
</style>