<template>
  <div class="products-audit-container">
    <!-- 页面标题和操作栏 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="page-title">商品审核管理</h1>
          <p class="page-subtitle">审核用户发布的商品，确保平台商品质量</p>
        </div>
        <div class="header-actions">
          <el-badge :value="pendingCount" class="badge-item">
            <el-button type="primary" :icon="Bell" @click="handleBatchAudit">
              批量审核 ({{ selectedProducts.length }})
            </el-button>
          </el-badge>
          <el-button :icon="Refresh" @click="refreshData">刷新</el-button>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <div class="stat-card pending">
        <div class="stat-icon">
          <el-icon><Clock /></el-icon>
        </div>
        <div class="stat-content">
          <span class="stat-number">{{ stats.pending }}</span>
          <span class="stat-label">待审核</span>
        </div>
      </div>
      <div class="stat-card approved">
        <div class="stat-icon">
          <el-icon><Check /></el-icon>
        </div>
        <div class="stat-content">
          <span class="stat-number">{{ stats.approved }}</span>
          <span class="stat-label">已通过</span>
        </div>
      </div>
      <div class="stat-card rejected">
        <div class="stat-icon">
          <el-icon><Close /></el-icon>
        </div>
        <div class="stat-content">
          <span class="stat-number">{{ stats.rejected }}</span>
          <span class="stat-label">已拒绝</span>
        </div>
      </div>
      <div class="stat-card total">
        <div class="stat-icon">
          <el-icon><Box /></el-icon>
        </div>
        <div class="stat-content">
          <span class="stat-number">{{ stats.total }}</span>
          <span class="stat-label">总商品</span>
        </div>
      </div>
    </div>

    <!-- 筛选和搜索区域 -->
    <el-card class="filter-card" shadow="never">
      <div class="filter-content">
        <div class="filter-row">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索商品名称、用户名或商品ID"
            :prefix-icon="Search"
            clearable
            @input="handleSearch"
            class="search-input"
          />
          <el-select
            v-model="statusFilter"
            placeholder="审核状态"
            clearable
            @change="handleFilter"
            class="filter-select"
          >
            <el-option label="待审核" value="pending" />
            <el-option label="已通过" value="approved" />
            <el-option label="已拒绝" value="rejected" />
          </el-select>
          <el-select
            v-model="categoryFilter"
            placeholder="商品分类"
            clearable
            @change="handleFilter"
            class="filter-select"
          >
            <el-option label="电子产品" value="electronics" />
            <el-option label="书籍文具" value="books" />
            <el-option label="生活用品" value="daily" />
            <el-option label="服装配饰" value="clothing" />
            <el-option label="其他" value="others" />
          </el-select>
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            @change="handleFilter"
            class="date-picker"
          />
        </div>
      </div>
    </el-card>

    <!-- 商品列表 -->
    <el-card class="table-card" shadow="never">
      <div class="table-header">
        <div class="table-title">
          <h3>商品列表</h3>
          <span class="table-count">共 {{ total }} 条记录</span>
        </div>
        <div class="table-actions">
          <el-button 
            size="small" 
            :icon="Download" 
            @click="exportData"
          >
            导出
          </el-button>
        </div>
      </div>

      <el-table
        :data="tableData"
        v-loading="loading"
        @selection-change="handleSelectionChange"
        class="products-table"
        row-key="id"
      >
        <el-table-column type="selection" width="55" />
        
        <el-table-column label="商品信息" min-width="300">
          <template #default="{ row }">
            <div class="product-info">
              <div class="product-images">
                <el-image
                  v-if="row.images && row.images.length > 0"
                  :src="row.images[0]"
                  fit="cover"
                  class="product-image"
                  :preview-src-list="row.images"
                  preview-teleported
                />
                <div v-else class="no-image">
                  <el-icon><Picture /></el-icon>
                </div>
              </div>
              <div class="product-details">
                <h4 class="product-title">{{ row.title }}</h4>
                <p class="product-description">{{ row.description }}</p>
                <div class="product-meta">
                  <el-tag :type="getCategoryTagType(row.category)" size="small">
                    {{ getCategoryName(row.category) }}
                  </el-tag>
                  <span class="product-price">¥{{ row.price }}</span>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="发布者" width="150">
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar :size="32" :src="row.user.avatar">
                {{ row.user.username?.[0] }}
              </el-avatar>
              <div class="user-details">
                <span class="username">{{ row.user.username }}</span>
                <span class="user-credit">信用: {{ row.user.credit }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="发布时间" width="120">
          <template #default="{ row }">
            <div class="time-info">
              <span class="date">{{ formatDate(row.createdAt) }}</span>
              <span class="time">{{ formatTime(row.createdAt) }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="审核状态" width="120">
          <template #default="{ row }">
            <div class="status-column">
              <el-tag
                :type="getStatusTagType(row.auditStatus)"
                :icon="getStatusIcon(row.auditStatus)"
                size="small"
              >
                {{ getStatusText(row.auditStatus) }}
              </el-tag>
              <div v-if="row.auditReason" class="audit-reason">
                {{ row.auditReason }}
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button
                type="primary"
                size="small"
                :icon="View"
                @click="viewProduct(row)"
              >
                查看
              </el-button>
              <template v-if="row.auditStatus === 'pending'">
                <el-button
                  type="success"
                  size="small"
                  :icon="Check"
                  @click="approveProduct(row)"
                >
                  通过
                </el-button>
                <el-button
                  type="danger"
                  size="small"
                  :icon="Close"
                  @click="rejectProduct(row)"
                >
                  拒绝
                </el-button>
              </template>
              <el-button
                v-else
                type="warning"
                size="small"
                :icon="Edit"
                @click="editAuditStatus(row)"
              >
                修改
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

    <!-- 商品详情弹窗 -->
    <el-dialog
      v-model="productDetailVisible"
      title="商品详情"
      width="800px"
      class="product-detail-dialog"
    >
      <div v-if="selectedProduct" class="product-detail-content">
        <div class="detail-section">
          <h4>商品图片</h4>
          <div class="images-gallery">
            <el-image
              v-for="(img, index) in selectedProduct.images"
              :key="index"
              :src="img"
              fit="cover"
              class="gallery-image"
              :preview-src-list="selectedProduct.images"
              preview-teleported
            />
          </div>
        </div>
        
        <div class="detail-section">
          <h4>基本信息</h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="商品标题">{{ selectedProduct.title }}</el-descriptions-item>
            <el-descriptions-item label="商品价格">¥{{ selectedProduct.price }}</el-descriptions-item>
            <el-descriptions-item label="商品分类">{{ getCategoryName(selectedProduct.category) }}</el-descriptions-item>
            <el-descriptions-item label="商品状态">{{ selectedProduct.condition }}</el-descriptions-item>
            <el-descriptions-item label="发布时间">{{ formatDateTime(selectedProduct.createdAt) }}</el-descriptions-item>
            <el-descriptions-item label="审核状态">
              <el-tag :type="getStatusTagType(selectedProduct.auditStatus)">
                {{ getStatusText(selectedProduct.auditStatus) }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="detail-section">
          <h4>商品描述</h4>
          <div class="description-content">
            {{ selectedProduct.description }}
          </div>
        </div>

        <div class="detail-section">
          <h4>发布者信息</h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="用户名">{{ selectedProduct.user.username }}</el-descriptions-item>
            <el-descriptions-item label="信用分">{{ selectedProduct.user.credit }}</el-descriptions-item>
            <el-descriptions-item label="联系方式">{{ selectedProduct.user.phone || '未提供' }}</el-descriptions-item>
            <el-descriptions-item label="注册时间">{{ formatDateTime(selectedProduct.user.joinTime) }}</el-descriptions-item>
          </el-descriptions>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="productDetailVisible = false">关闭</el-button>
          <template v-if="selectedProduct?.auditStatus === 'pending'">
            <el-button type="success" @click="approveProduct(selectedProduct)">
              审核通过
            </el-button>
            <el-button type="danger" @click="rejectProduct(selectedProduct)">
              审核拒绝
            </el-button>
          </template>
        </div>
      </template>
    </el-dialog>

    <!-- 审核拒绝原因弹窗 -->
    <el-dialog
      v-model="rejectDialogVisible"
      title="审核拒绝"
      width="500px"
    >
      <el-form :model="rejectForm" label-width="100px">
        <el-form-item label="拒绝原因" required>
          <el-select v-model="rejectForm.reason" placeholder="请选择拒绝原因">
            <el-option label="商品图片不清晰" value="图片不清晰" />
            <el-option label="商品描述不详细" value="描述不详细" />
            <el-option label="价格不合理" value="价格不合理" />
            <el-option label="违禁物品" value="违禁物品" />
            <el-option label="重复发布" value="重复发布" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="详细说明">
          <el-input
            v-model="rejectForm.detail"
            type="textarea"
            :rows="4"
            placeholder="请输入详细的拒绝说明（可选）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="rejectDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="confirmReject">确认拒绝</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search, Refresh, Bell, Download, View, Edit, Check, Close,
  Clock, Box, Picture
} from '@element-plus/icons-vue'

// 响应式数据
const loading = ref(false)
const tableData = ref([])
const selectedProducts = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)

// 筛选条件
const searchKeyword = ref('')
const statusFilter = ref('')
const categoryFilter = ref('')
const dateRange = ref([])

// 统计数据
const stats = reactive({
  pending: 0,
  approved: 0,
  rejected: 0,
  total: 0
})

// 弹窗状态
const productDetailVisible = ref(false)
const rejectDialogVisible = ref(false)
const selectedProduct = ref(null)

// 拒绝表单
const rejectForm = reactive({
  reason: '',
  detail: ''
})

// 计算属性
const pendingCount = computed(() => stats.pending)

// 方法
const fetchData = async () => {
  loading.value = true
  try {
    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 模拟数据
    const mockData = [
      {
        id: '1',
        title: '全新MacBook Air M2 13寸',
        description: '全新未拆封的MacBook Air，M2芯片，8GB内存，256GB存储，银色。因为重复购买所以出售。',
        price: 8999,
        category: 'electronics',
        condition: '全新',
        images: [
          'https://picsum.photos/400/300?random=1',
          'https://picsum.photos/400/300?random=2'
        ],
        auditStatus: 'pending',
        auditReason: '',
        createdAt: new Date(2024, 0, 15),
        user: {
          username: 'techuser',
          avatar: null,
          credit: 95,
          phone: '138****1234',
          joinTime: new Date(2023, 5, 10)
        }
      },
      {
        id: '2',
        title: '计算机科学导论教材',
        description: '计算机科学与技术专业必修教材，9成新，无划线笔记。',
        price: 45,
        category: 'books',
        condition: '九成新',
        images: ['https://picsum.photos/400/300?random=3'],
        auditStatus: 'approved',
        auditReason: '',
        createdAt: new Date(2024, 0, 14),
        user: {
          username: 'bookworm',
          avatar: null,
          credit: 88,
          phone: '139****5678',
          joinTime: new Date(2023, 8, 20)
        }
      },
      {
        id: '3',
        title: '违禁物品测试',
        description: '这是一个测试违禁物品的描述',
        price: 100,
        category: 'others',
        condition: '全新',
        images: [],
        auditStatus: 'rejected',
        auditReason: '违禁物品',
        createdAt: new Date(2024, 0, 13),
        user: {
          username: 'testuser',
          avatar: null,
          credit: 60,
          phone: '137****9876',
          joinTime: new Date(2023, 10, 5)
        }
      }
    ]

    tableData.value = mockData
    total.value = mockData.length

    // 更新统计数据
    stats.pending = mockData.filter(item => item.auditStatus === 'pending').length
    stats.approved = mockData.filter(item => item.auditStatus === 'approved').length
    stats.rejected = mockData.filter(item => item.auditStatus === 'rejected').length
    stats.total = mockData.length

  } catch (error) {
    console.error('获取数据失败:', error)
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  // 实现搜索逻辑
  console.log('搜索:', searchKeyword.value)
}

const handleFilter = () => {
  // 实现筛选逻辑
  console.log('筛选条件:', {
    status: statusFilter.value,
    category: categoryFilter.value,
    dateRange: dateRange.value
  })
}

const handleSelectionChange = (selection) => {
  selectedProducts.value = selection
}

const handleSizeChange = (size) => {
  pageSize.value = size
  fetchData()
}

const handleCurrentChange = (page) => {
  currentPage.value = page
  fetchData()
}

const refreshData = () => {
  fetchData()
  ElMessage.success('数据已刷新')
}

const viewProduct = (product) => {
  selectedProduct.value = product
  productDetailVisible.value = true
}

const approveProduct = async (product) => {
  try {
    await ElMessageBox.confirm('确认通过该商品的审核？', '确认操作', {
      type: 'warning'
    })
    
    // 调用 API 审核通过
    console.log('审核通过:', product.id)
    
    // 更新本地数据
    product.auditStatus = 'approved'
    product.auditReason = ''
    
    ElMessage.success('审核通过成功')
    productDetailVisible.value = false
    
    // 重新获取统计数据
    fetchData()
  } catch (error) {
    // 用户取消操作
  }
}

const rejectProduct = (product) => {
  selectedProduct.value = product
  rejectForm.reason = ''
  rejectForm.detail = ''
  rejectDialogVisible.value = true
}

const confirmReject = async () => {
  if (!rejectForm.reason) {
    ElMessage.warning('请选择拒绝原因')
    return
  }

  try {
    // 调用 API 审核拒绝
    console.log('审核拒绝:', selectedProduct.value.id, rejectForm)
    
    // 更新本地数据
    selectedProduct.value.auditStatus = 'rejected'
    selectedProduct.value.auditReason = rejectForm.reason + (rejectForm.detail ? `: ${rejectForm.detail}` : '')
    
    ElMessage.success('审核拒绝成功')
    rejectDialogVisible.value = false
    productDetailVisible.value = false
    
    // 重新获取统计数据
    fetchData()
  } catch (error) {
    console.error('审核拒绝失败:', error)
    ElMessage.error('审核拒绝失败')
  }
}

const editAuditStatus = (product) => {
  // 修改审核状态
  console.log('修改审核状态:', product.id)
}

const handleBatchAudit = () => {
  if (selectedProducts.value.length === 0) {
    ElMessage.warning('请先选择要批量审核的商品')
    return
  }
  
  ElMessageBox.confirm(
    `确认批量通过选中的 ${selectedProducts.value.length} 个商品？`,
    '批量审核',
    {
      type: 'warning'
    }
  ).then(() => {
    selectedProducts.value.forEach(product => {
      product.auditStatus = 'approved'
      product.auditReason = ''
    })
    ElMessage.success('批量审核成功')
    fetchData()
  }).catch(() => {
    // 用户取消
  })
}

const exportData = () => {
  ElMessage.info('导出功能开发中...')
}

// 工具函数
const getCategoryName = (category) => {
  const categoryMap = {
    electronics: '电子产品',
    books: '书籍文具',
    daily: '生活用品',
    clothing: '服装配饰',
    others: '其他'
  }
  return categoryMap[category] || category
}

const getCategoryTagType = (category) => {
  const typeMap = {
    electronics: 'success',
    books: 'info',
    daily: 'warning',
    clothing: 'danger',
    others: ''
  }
  return typeMap[category] || ''
}

const getStatusText = (status) => {
  const statusMap = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已拒绝'
  }
  return statusMap[status] || status
}

const getStatusTagType = (status) => {
  const typeMap = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger'
  }
  return typeMap[status] || ''
}

const getStatusIcon = (status) => {
  const iconMap = {
    pending: Clock,
    approved: Check,
    rejected: Close
  }
  return iconMap[status]
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString()
}

const formatTime = (date) => {
  return new Date(date).toLocaleTimeString()
}

const formatDateTime = (date) => {
  return new Date(date).toLocaleString()
}

// 生命周期
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.products-audit-container {
  padding: 24px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: calc(100vh - 60px);
}

.title-section h1 {
  font-size: 32px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0 0 8px 0;
}

.stat-card.pending { border-left: 4px solid #f59e0b; }
.stat-card.approved { border-left: 4px solid #10b981; }
.stat-card.rejected { border-left: 4px solid #ef4444; }
.stat-card.total { border-left: 4px solid #3b82f6; }

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  font-size: 24px;
}

.pending .stat-icon { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
.approved .stat-icon { background: rgba(16, 185, 129, 0.1); color: #10b981; }
.rejected .stat-icon { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
.total .stat-icon { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }

.filter-content {
  padding: 8px 0;
}

.filter-row {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  min-width: 300px;
}

.filter-select {
  width: 140px;
}

.date-picker {
  width: 240px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.table-title h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.table-count {
  font-size: 14px;
  color: #64748b;
  margin-left: 12px;
}

.product-info {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.product-images {
  flex-shrink: 0;
}

.product-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  object-fit: cover;
}

.no-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  font-size: 24px;
}

.product-details {
  flex: 1;
  min-width: 0;
}

.product-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 4px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-description {
  font-size: 13px;
  color: #909399;
  margin: 0 0 8px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2; /* Limit to 2 lines */
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.product-price {
  font-size: 15px;
  font-weight: 600;
  color: #f56c6c;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.username {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.user-credit {
  font-size: 12px;
  color: #909399;
}

.time-info {
  font-size: 13px;
  color: #606266;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.date,
.time {
  white-space: nowrap;
}

.status-column {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}

.audit-reason {
  font-size: 12px;
  color: #f56c6c;
}

.action-buttons .el-button {
  padding: 4px 8px;
  font-size: 12px;
}

.detail-section {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
}

.detail-section:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.detail-section h4 {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 12px 0;
}

.images-gallery {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.gallery-image {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  object-fit: cover;
}

.description-content {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
}

:deep(.products-table .el-table__cell) {
  padding: 8px;
}

.product-info {
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.product-images {
  width: 100%;
  display: flex;
  justify-content: center;
}

.product-image {
  width: 60px;
  height: 60px;
}

.no-image {
  width: 60px;
  height: 60px;
}

.product-details {
  width: 100%;
}

.user-info {
  flex-direction: column;
  align-items: flex-start;
}

.user-details {
  align-items: flex-start;
}

.time-info {
  align-items: flex-start;
}
</style>