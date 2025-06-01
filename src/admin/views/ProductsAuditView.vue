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
          <!-- Removed Batch Audit and Refresh from here -->
          <!-- <el-badge :value="pendingCount" class="badge-item">
            <el-button type="primary" :icon="Bell" @click="handleBatchAudit">
              批量审核 ({{ selectedProducts.length }})
            </el-button>
          </el-badge>
          <el-button :icon="Refresh" @click="refreshData">刷新</el-button> -->
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
          <!-- Moved Batch Audit and Refresh buttons here -->
           <el-badge :value="pendingCount" class="badge-item">
            <el-button type="primary" size="small" :icon="Bell" @click="handleBatchAudit">
              批量审核 ({{ selectedProducts.length }})
            </el-button>
          </el-badge>
          <el-button size="small" :icon="Refresh" @click="refreshData">刷新</el-button>
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
              <template v-if="row.auditStatus === 'PendingReview'">
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
          <template v-if="selectedProduct?.auditStatus === 'PendingReview'">
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

    <!-- 商品发布/编辑弹窗 (用于管理员修改) -->
    <ProductPostDialog 
      :isDialogVisible="isEditDialogVisible"
      :isEditMode="isEditMode"
      :productId="selectedProductForEdit ? selectedProductForEdit.id : null"
      @update:isDialogVisible="isEditDialogVisible = $event"
      @productPosted="fetchData"
    />
    
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
      Search, Refresh, Bell, Download, View, Edit, Check, Close,
      Clock, Box, Picture
    } from '@element-plus/icons-vue'
import api from '@/API_PRO.js';
import FormatObject from '@/utils/format.js';
import ProductPostDialog from "@/product/components/ProductPostDialog.vue"; // 确保导入


// 响应式数据
const loading = ref(false)
const tableData = ref([])
const selectedProducts = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)

// 新增用于编辑商品弹窗的状态
const isEditDialogVisible = ref(false); // 控制 ProductPostDialog 的显示
const selectedProductForEdit = ref(null); // 存储要编辑的商品数据
const isEditMode = ref(false); // 标记是否为编辑模式

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
  loading.value = true;
  try {
    const params = {
      page_number: currentPage.value,
      page_size: pageSize.value,
      category_name: categoryFilter.value || undefined,
      status: statusFilter.value === 'pending' ? 'PendingReview' : // 确保状态字符串匹配后端
              (statusFilter.value === 'approved' ? 'Active' :
              (statusFilter.value === 'rejected' ? 'Rejected' : undefined)),
      keyword: searchKeyword.value || undefined,
      // dateRange 暂时不处理，如果后端支持日期过滤再添加
    };

    // 获取所有商品，以便计算总数和各种状态的数量
    // 后续可以优化为后端直接返回统计数据
    const allProductsResponse = await api.getProductList({}); // 获取所有商品列表，不带status过滤
    const filteredProductsResponse = await api.getProductList(params);

    const mapProductData = (item) => ({
      id: item.商品ID,
      title: item.商品名称,
      description: item.商品描述,
      price: item.价格,
      category: item.商品类别,
      auditStatus: item.商品状态, // 将商品状态作为审核状态
      condition: item.商品成色 || '', 
      images: item.主图URL 
        ? (Array.isArray(item.主图URL) 
            ? item.主图URL.map(url => url.startsWith('http') || url.startsWith('//') ? url : FormatObject.formattedImgUrl(url))
            : [item.主图URL.startsWith('http') || item.主图URL.startsWith('//') ? item.主图URL : FormatObject.formattedImgUrl(item.主图URL)])
        : [],
      auditReason: '', // 后端目前未返回审核原因，暂时留空
      createdAt: item.发布时间,
      user: {
        username: item.发布者用户名,
        credit: 100, // 暂时硬编码，待后端提供
        avatar: '', // 暂时为空，待后端提供
        phone: '未提供', // 暂时未提供
        joinTime: item.发布时间, // 暂时使用商品发布时间
      }
    });

    tableData.value = filteredProductsResponse.map(mapProductData);
    total.value = filteredProductsResponse.length; // 这里的 total 应该是过滤后的总数

    // 更新统计数据 (基于所有商品)
    const mappedAllProducts = allProductsResponse.map(mapProductData);
    stats.pending = mappedAllProducts.filter(item => item.auditStatus === 'PendingReview').length;
    stats.approved = mappedAllProducts.filter(item => item.auditStatus === 'Active').length;
    stats.rejected = mappedAllProducts.filter(item => item.auditStatus === 'Rejected').length;
    stats.total = mappedAllProducts.length;

  } catch (error) {
    console.error('获取数据失败:', error);
    ElMessage.error('获取数据失败：' + (error.response?.data?.detail || error.message));
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  // 触发数据重新获取
  fetchData();
};

const handleFilter = () => {
  // 触发数据重新获取
  fetchData();
};

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
    });
    
    await api.activateProduct(product.id);
    
    ElMessage.success('审核通过成功');
    productDetailVisible.value = false;
    fetchData();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('审核通过失败:', error);
      ElMessage.error('审核通过失败：' + (error.response?.data?.detail || error.message));
    }
  }
};

const rejectProduct = (product) => {
  selectedProduct.value = product;
  rejectForm.reason = '';
  rejectForm.detail = '';
  rejectDialogVisible.value = true;
};

const confirmReject = async () => {
  if (!rejectForm.reason) {
    ElMessage.warning('请选择拒绝原因');
    return;
  }
  try {
    const reasonDetail = rejectForm.reason + (rejectForm.detail ? `: ${rejectForm.detail}` : '');
    await api.rejectProduct(selectedProduct.value.id, { reason: reasonDetail });
    
    ElMessage.success('审核拒绝成功');
    rejectDialogVisible.value = false;
    productDetailVisible.value = false;
    fetchData();
  } catch (error) {
    console.error('审核拒绝失败:', error);
    ElMessage.error('审核拒绝失败：' + (error.response?.data?.detail || error.message));
  }
};

const handleBatchAudit = async () => {
  if (selectedProducts.value.length === 0) {
    ElMessage.warning('请先选择要批量审核的商品');
    return;
  }
  try {
    await ElMessageBox.confirm(
      `确认批量通过选中的 ${selectedProducts.value.length} 个商品？`,
      '批量审核',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    const productIdsToActivate = selectedProducts.value.map(p => p.id);
    // 确保 API_PRO.js 中有 batchActivateProducts，并且后端接口是 /batch/activate
    await api.batchActivateProducts({ product_ids: productIdsToActivate }); 
    ElMessage.success('批量审核通过成功');
    fetchData();
  } catch (error) {
    if (error !== 'cancel') {
        console.error('批量审核失败:', error);
        ElMessage.error('批量审核失败：' + (error.response?.data?.detail || error.message));
    }
  }
};

const exportData = () => {
  ElMessage.info('导出功能开发中...')
}

const editAuditStatus = (product) => {
      console.log("Edit audit status for product:", product.id);
      ElMessage.info(`尝试编辑商品 ${product.title} 的审核状态`);
      
      selectedProductForEdit.value = product; // 用于传递给 ProductPostDialog 的商品数据
      isEditDialogVisible.value = true; // 控制 ProductPostDialog 的显示
      isEditMode.value = true; // 告知 ProductPostDialog 进入编辑模式
};

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
    others: 'info'
  }
  return typeMap[category] || 'info'
}

const getStatusText = (status) => {
  const statusMap = {
    'PendingReview': '待审核', // 修改
    'Active': '已通过', // 修改
    'Rejected': '已拒绝' // 修改
  };
  return statusMap[status] || status;
};

const getStatusTagType = (status) => {
  const typeMap = {
    'PendingReview': 'warning',
    'Active': 'success',
    'Rejected': 'danger'
  };
  return typeMap[status] || 'info';
};

const getStatusIcon = (status) => {
  const iconMap = {
    'PendingReview': Clock, // 修改
    'Active': Check, // 修改
    'Rejected': Close // 修改
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
/* 页面背景和内边距 */
.products-audit-container {
  padding: 24px;
  /* Use the overall light gray background from AdminLayout */
  background: #F8F9FA; /* Match AdminLayout background */
  min-height: calc(100vh - 60px);
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
  background: rgba(255, 255, 255, 0.95); /* Keep unique background */
  backdrop-filter: blur(10px);
  border-radius: 20px; /* Keep unique larger radius */
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1); /* Keep unique larger shadow */
}

.title-section h1 {
  font-size: 32px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea, #764ba2); /* Keep unique gradient */
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 16px;
  color: #606266;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

/* Stats Cards - Keep unique styling */
.stats-cards {
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
  border-radius: 12px; /* Keep unique radius */
  font-size: 24px;
  margin-right: 16px;
  color: #fff; /* White icon color */
}

.pending .stat-icon { background: linear-gradient(45deg, #f59e0b, #ffcf96); } /* Keep unique gradient */
.approved .stat-icon { background: linear-gradient(45deg, #10b981, #6ee7b7); }
.rejected .stat-icon { background: linear-gradient(45deg, #ef4444, #fca5a5); }
.total .stat-icon { background: linear-gradient(45deg, #3b82f6, #93c5fd); }


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


/* Filter and Search Area - Adjust to match UserManagementView */
.filter-card {
  margin-bottom: 24px;
  border-radius: 12px; /* Match UserManagementView radius */
  background: #FFFFFF; /* White background for filter card */
  /* Updated box-shadow to match UserManagementView filter card */
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  /* Remove backdrop-filter if not needed */
  /* backdrop-filter: blur(10px); */
}

.filter-card :deep(.el-card__body) {
  padding: 24px;
}

.filter-content {
  padding: 0;
}

.filter-row {
  display: grid; /* Use grid layout */
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); /* Responsive grid */
  gap: 20px; /* Consistent gap */
  margin-bottom: 20px; /* Space below filter items */
  align-items: center; /* Vertically align items */
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
.filter-item .el-select,
.filter-item .el-date-editor {
  width: 100%; /* Ensure inputs take full width of grid item */
}


.search-input :deep(.el-input__inner) {
  flex: 1;
  min-width: 300px;
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* Product List Table - Adjust to match UserManagementView */
.table-card {
  border-radius: 12px; /* Match UserManagementView radius */
  background: #FFFFFF; /* White background for table card */
   /* Updated box-shadow to match UserManagementView table card */
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
   /* Remove backdrop-filter if not needed */
   /* backdrop-filter: blur(10px); */
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

.products-table {
  /* ... existing styles ... */
}

.products-table :deep(.el-table__header th) {
  /* ... existing styles ... */
}

.products-table :deep(.el-table__cell) {
  /* ... existing styles ... */
}

/* Product Info Column */
.product-info {
   display: flex;
   gap: 16px;
   align-items: flex-start;
   /* Remove column and alignment for consistency */
   /* flex-direction: column; */
   /* align-items: flex-start; */
}

.product-images {
  flex-shrink: 0;
  /* Remove width and centering */
  /* width: 100%; */
  /* display: flex; */
  /* justify-content: center; */
}

.product-image {
  width: 80px; /* Revert to larger size */
  height: 80px; /* Revert to larger size */
  border-radius: 8px;
  object-fit: cover;
}

.no-image {
  width: 80px; /* Revert to larger size */
  height: 80px; /* Revert to larger size */
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
  /* Remove width */
  /* width: 100%; */
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
   /* Remove column and alignment */
   /* flex-direction: column; */
   /* align-items: flex-start; */
}

.user-details {
   /* Remove alignment */
   /* align-items: flex-start; */
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
   /* Remove alignment */
   /* align-items: flex-start; */
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
  padding: 12px 0; /* Match UserManagementView cell padding */
}

/* Removed redundant/conflicting responsive styles */
/*
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
*/
</style>