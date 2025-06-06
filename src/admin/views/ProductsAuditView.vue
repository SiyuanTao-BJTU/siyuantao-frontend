<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search, Download, Refresh, Bell, Picture, Clock, Check, Close, ShoppingCartFull, Download as DownloadIcon, Box, View, Edit, Operation, Delete, Upload } from '@element-plus/icons-vue';
import api from '@/API_PRO.js';
import UserDetailDialog from '@/user/components/UserDetailDialog.vue'; // 导入用户详情对话框组件
import ProductDetailDialog from '@/product/components/ProductDetail.vue'; // 导入商品详情对话框组件
import FormatObject from '@/utils/format.js'; // 导入格式化工具

const store = useStore();
const isAdmin = computed(() => store.getters['user/userRole'] === 'admin' || store.getters['user/userRole'] === 'super_admin');

const tableData = ref([]);
const loading = ref(false);
const total = ref(0);
const pageNumber = ref(1);
const pageSize = ref(10);
const searchKeyword = ref('');
const statusFilter = ref('_FETCH_ALL_PRODUCTS_'); // 默认显示所有商品
const categoryFilter = ref('');
const dateRange = ref([]); // [startDate, endDate]
const selectedProducts = ref([]);

// 统计数据
const stats = ref({
  pending: 0,
  approved: 0,
  rejected: 0,
  withdrawn: 0,
  sold: 0,
  total: 0
});

// 新增：用户详情对话框相关状态
const showUserDetailDialog = ref(false);
const selectedUserIdForDetail = ref(null);

// 新增：商品详情对话框相关状态
const showProductDetailDialog = ref(false);
const selectedProductForDetail = ref(null);

const pendingCount = computed(() => stats.value.pending);

// 全选/反选相关状态
const allChecked = computed({
  get: () => selectedProducts.value.length === tableData.value.length && tableData.value.length > 0,
  set: (val) => {
    if (val) {
      selectedProducts.value = [...tableData.value];
    } else {
      selectedProducts.value = [];
    }
  }
});
const indeterminate = computed(() => selectedProducts.value.length > 0 && selectedProducts.value.length < tableData.value.length);

const fetchProducts = async () => {
  if (!isAdmin.value) {
    ElMessage.error('您没有权限查看此页面。');
    loading.value = false;
    return;
  }

  loading.value = true;
  try {
    const params = {
      keyword: searchKeyword.value || undefined,
      category_name: categoryFilter.value || undefined,
      status: statusFilter.value || undefined,
      min_post_time: dateRange.value && dateRange.value.length > 0 ? dateRange.value[0] + 'T00:00:00Z' : undefined,
      max_post_time: dateRange.value && dateRange.value.length > 0 ? dateRange.value[1] + 'T23:59:59Z' : undefined,
      page_number: pageNumber.value,
      page_size: pageSize.value,
      order_by: 'PostTime',
      sort_order: 'desc'
    };

    const response = await api.getProductList(params);
    console.log("Raw API response for products:", response); // 添加原始响应日志
    // 确保 response 是一个数组，并且处理 total 字段
    if (Array.isArray(response)) {
      tableData.value = response.map(product => ({
        id: product.商品ID,
        title: product.商品名称,
        description: product.描述,
        price: Number(product.价格) || 0, // 使用 Number() 转换，并确保默认值为 0
        quantity: product.数量,
        category: product.分类名称,
        condition: product.成色 === null ? '未提供' : product.成色,
        images: product.主图URL ? [FormatObject.formattedImgUrl(product.主图URL)] : [],
        auditStatus: product.商品状态,
        auditReason: product.审核拒绝原因 || '',
        createdAt: product.发布时间,
        user: {
          id: product.卖家ID ? String(product.卖家ID) : null, // 明确转换为字符串或 null
          username: product.卖家用户名,
          avatar: product.卖家头像URL // Assuming this field exists from backend
        }
      }));
      console.log("Mapped tableData after processing:", tableData.value); // 添加映射后数据日志
      
      // 获取并更新统计数据 (先获取，再使用)
      const statsResponse = await api.getProductStats(); // 调用新的统计API
      if (statsResponse) {
        stats.value = {
          pending: statsResponse.PendingReview || 0,
          approved: statsResponse.Active || 0,
          rejected: statsResponse.Rejected || 0,
          withdrawn: statsResponse.Withdrawn || 0,
          sold: statsResponse.Sold || 0,
          total: statsResponse.Total || 0 // 保留后端返回的总数，但前端显示总数将重新计算
        };
        
        // 更新分页总数
        total.value = statsResponse.PendingReview + statsResponse.Active + statsResponse.Rejected + statsResponse.Withdrawn + statsResponse.Sold; // 使用细分状态之和作为总数

      } else {
        console.warn('获取商品统计数据失败。');
      }

    } else {
      // 如果 response 不是数组，可能是 API 返回了错误格式的数据
      console.error('API 返回的商品列表格式不正确:', response);
      tableData.value = [];
      total.value = 0;
      ElMessage.error('获取商品列表失败：API 返回数据格式错误。');
    }

  } catch (err) {
    console.error('获取商品列表失败:', err);
    ElMessage.error('加载商品数据失败，请稍后重试。' + (err.response?.data?.detail || err.message));
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  pageNumber.value = 1;
  fetchProducts();
};

const handleFilter = () => {
  pageNumber.value = 1;
  fetchProducts();
};

const getCategoryName = (categoryKey) => {
  const category = productCategories.value.find(c => c.value === categoryKey);
  return category ? category.label : categoryKey || '未知分类';
};

const getCategoryTagType = (categoryKey) => {
  // 简单映射，可根据实际需求扩展
  const typeMap = {
    '电子产品': 'info', // 修改为 'info'，避免空字符串
    '书籍文具': 'success',
    '生活用品': 'info',
    '服装配饰': 'warning',
    '运动户外': 'danger',
    '服装鞋包': 'primary',
    '文体用品': 'success',
    '乐器': 'info',
    '家居日用': 'warning',
    '影音娱乐': 'danger',
    '游戏周边': 'primary',
    '其他': 'info'
  };
  return typeMap[categoryKey] || 'info'; // 默认返回 'info'
};

const getStatusText = (status) => {
  const statusMap = {
    'PendingReview': '待审核',
    'Active': '已上架',
    'Rejected': '已拒绝',
    'Withdrawn': '已下架',
    'Sold': '已售罄'
  };
  return statusMap[status] || '未知';
};

const getStatusTagType = (status) => {
  const typeMap = {
    'PendingReview': 'warning',
    'Active': 'success',
    'Rejected': 'danger',
    'Withdrawn': 'info',
    'Sold': 'info'
  };
  return typeMap[status] || 'info'; // 默认返回 'info'
};

const getStatusIcon = (status) => {
  const iconMap = {
    'PendingReview': Clock,
    'Active': Check,
    'Rejected': Close,
    'Withdrawn': DownloadIcon, // Using Download for withdrawn
    'Sold': ShoppingCartFull
  };
  return iconMap[status];
};

const formatDate = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleDateString();
};

const formatTime = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleTimeString();
};

const formatDateTime = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleString();
};

const handleSelectionChange = (val) => {
  selectedProducts.value = val.map(product => ({
    id: product.id,
    auditStatus: product.auditStatus
  }));
};

// 批量全选/取消全选
const handleCheckAll = (val) => {
  allChecked.value = val;
};

const handleStatCardClick = (status) => {
  statusFilter.value = status === 'pending' ? 'PendingReview' :
                       status === 'approved' ? 'Active' :
                       status === 'rejected' ? 'Rejected' :
                       status === 'withdrawn' ? 'Withdrawn' :
                       status === 'sold' ? 'Sold' :
                       '_FETCH_ALL_PRODUCTS_'; // 点击总数时，传递特殊值以获取所有商品
  pageNumber.value = 1;
  fetchProducts();
};

const handleProductDetail = (productId) => {
  if (productId) {
    selectedProductForDetail.value = productId; // 直接传递商品ID
    showProductDetailDialog.value = true;
  } else {
    ElMessage.warning('商品ID未找到。');
  }
};

// 新增：关闭商品详情对话框
const closeProductDetailDialog = () => {
  selectedProductForDetail.value = null;
  showProductDetailDialog.value = false;
};

const handleAudit = async (productId, status, reason = null) => {
  try {
    if (status === 'Rejected' && !reason) {
      const { value } = await ElMessageBox.prompt('请输入拒绝理由', '拒绝商品', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /\S/,
        inputErrorMessage: '拒绝理由不能为空',
      });
      reason = value;
    }

    if (status === 'Active') {
      await api.activateProduct(productId);
      ElMessage.success('商品已成功上架');
    } else if (status === 'Rejected') {
      await api.rejectProduct(productId, { reason: reason });
      ElMessage.success('商品已成功拒绝');
    } else if (status === 'Withdrawn') { // Handle withdraw for admin
      await api.withdrawProduct(productId);
      ElMessage.success('商品已成功下架');
    } else if (status === 'Deleted') { // Handle delete for admin
      await api.deleteProduct(productId);
      ElMessage.success('商品已成功删除');
    }
    fetchProducts();
  } catch (err) {
    if (err !== 'cancel') { // User cancelled prompt
      console.error('审核操作失败:', err);
      ElMessage.error('操作失败，请稍后重试。' + (err.response?.data?.detail || err.message));
    }
  }
};

const handleBatchAudit = async () => {
  if (selectedProducts.value.length === 0) {
    ElMessage.warning('请选择要批量审核的商品。');
    return;
  }

  const pendingProductIds = selectedProducts.value
                                .filter(p => p.auditStatus === 'PendingReview')
                                .map(p => p.id);

  if (pendingProductIds.length === 0) {
    ElMessage.warning('没有选中的待审核商品。');
    return;
  }

  ElMessageBox.confirm(`确定要批量通过选中的 ${pendingProductIds.length} 个待审核商品吗?`, '批量审核', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      const response = await api.batchActivateProducts({ product_ids: pendingProductIds });
      ElMessage.success(response.message || `成功激活 ${response.activated_count} 个商品`);
      fetchProducts();
    } catch (err) {
      console.error('批量审核失败:', err);
      ElMessage.error('批量审核失败，请稍后重试。' + (err.response?.data?.detail || err.message));
    }
  }).catch(() => {
    ElMessage.info('已取消批量审核操作');
  });
};

const handleBatchDelete = async () => {
  if (selectedProducts.value.length === 0) {
    ElMessage.warning('请选择要批量删除的商品。');
    return;
  }

  const productIdsToDelete = selectedProducts.value.map(p => p.id);

  ElMessageBox.confirm(`确定要批量删除选中的 ${productIdsToDelete.length} 个商品吗? 此操作不可逆！`, '批量删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'error',
  }).then(async () => {
    try {
      // 假设有一个批量删除的 API，如果没有，需要循环调用 deleteProduct
      // await api.batchDeleteProducts({ product_ids: productIdsToDelete }); // 如果有批量删除API
      // 或者循环删除
      for (const productId of productIdsToDelete) {
        await api.deleteProduct(productId);
      }
      ElMessage.success(`成功删除 ${productIdsToDelete.length} 个商品。`);
      fetchProducts();
      selectedProducts.value = []; // 清空选中
    } catch (err) {
      console.error('批量删除失败:', err);
      ElMessage.error('批量删除失败，请稍后重试。' + (err.response?.data?.detail || err.message));
    }
  }).catch(() => {
    ElMessage.info('已取消批量删除操作');
  });
};

const refreshData = () => {
  pageNumber.value = 1;
  searchKeyword.value = '';
  statusFilter.value = '_FETCH_ALL_PRODUCTS_';
  categoryFilter.value = '';
  dateRange.value = [];
  fetchProducts();
};

// 导出数据
const exportData = () => {
  ElMessage.info('导出功能开发中...');
  // 可以调用后端API生成CSV或Excel文件
};

// 分页改变
const handlePageChange = (newPage) => {
  pageNumber.value = newPage;
  fetchProducts();
};

const handleSizeChange = (newSize) => {
  pageSize.value = newSize;
  pageNumber.value = 1; // Reset to first page when page size changes
  fetchProducts();
};

// 获取商品分类列表
const productCategories = computed(() => store.getters['product/getProductCategories']);

// 新增：处理查看用户详情逻辑
const handleViewUserDetail = (userId) => {
  if (!userId) { // 添加保护，防止 userId 为 null
    ElMessage.warning('无法获取用户ID。');
    return;
  }
  selectedUserIdForDetail.value = userId;
  showUserDetailDialog.value = true;
};

// 新增：关闭用户详情对话框时清空选择的用户
const closeUserDetailDialog = () => {
  selectedUserIdForDetail.value = null;
  showUserDetailDialog.value = false;
};

onMounted(() => {
  fetchProducts();
  store.dispatch('product/fetchProductCategories'); // 在组件挂载时加载商品分类
});
</script>

<template>
  <div class="products-audit-container">
    <div class="page-header">
      <div class="title-section">
        <h1 class="page-title">商品审核管理</h1>
        <p class="page-subtitle">管理所有待审核、已上架、已拒绝和已下架的商品。</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" :icon="Refresh" @click="refreshData">刷新数据</el-button>
        <el-button type="success" :icon="Download" @click="exportData">导出数据</el-button>
        <el-button type="warning" :icon="Check" @click="handleBatchAudit" :disabled="selectedProducts.length === 0">批量通过</el-button>
      </div>
    </div>

    <div class="stats-cards">
      <el-card class="stat-card total" shadow="hover" @click="handleStatCardClick('')">
        <el-icon class="stat-icon"><Operation /></el-icon>
        <div class="stat-info">
          <div class="stat-number">{{ total }}</div>
          <div class="stat-label">总商品数</div>
        </div>
      </el-card>
      <el-card class="stat-card pending" shadow="hover" @click="handleStatCardClick('pending')">
        <el-icon class="stat-icon"><Clock /></el-icon>
        <div class="stat-info">
          <div class="stat-number">{{ stats.pending }}</div>
          <div class="stat-label">待审核</div>
        </div>
      </el-card>
      <el-card class="stat-card approved" shadow="hover" @click="handleStatCardClick('approved')">
        <el-icon class="stat-icon"><Check /></el-icon>
        <div class="stat-info">
          <div class="stat-number">{{ stats.approved }}</div>
          <div class="stat-label">已上架</div>
        </div>
      </el-card>
      <el-card class="stat-card rejected" shadow="hover" @click="handleStatCardClick('rejected')">
        <el-icon class="stat-icon"><Close /></el-icon>
        <div class="stat-info">
          <div class="stat-number">{{ stats.rejected }}</div>
          <div class="stat-label">已拒绝</div>
        </div>
      </el-card>
      <el-card class="stat-card withdrawn" shadow="hover" @click="handleStatCardClick('withdrawn')">
        <el-icon class="stat-icon"><DownloadIcon /></el-icon>
        <div class="stat-info">
          <div class="stat-number">{{ stats.withdrawn }}</div>
          <div class="stat-label">已下架</div>
        </div>
      </el-card>
      <el-card class="stat-card sold" shadow="hover" @click="handleStatCardClick('sold')">
        <el-icon class="stat-icon"><ShoppingCartFull /></el-icon>
        <div class="stat-info">
          <div class="stat-number">{{ stats.sold }}</div>
          <div class="stat-label">已售罄</div>
        </div>
      </el-card>
    </div>

    <el-card class="filter-card" shadow="never">
      <div class="filter-content">
        <div class="filter-row">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索商品名称或描述"
            :prefix-icon="Search"
            clearable
            class="search-input"
            @change="handleSearch"
          />
          <el-select
            v-model="categoryFilter"
            placeholder="选择分类"
            clearable
            class="filter-select"
            @change="handleFilter"
          >
            <el-option
              v-for="category in productCategories"
              :key="category.value"
              :label="category.label"
              :value="category.value"
            />
          </el-select>
          <el-select
            v-model="statusFilter"
            placeholder="选择状态"
            clearable
            class="filter-select"
            @change="handleFilter"
          >
            <el-option label="全部" value="_FETCH_ALL_PRODUCTS_" />
            <el-option label="待审核" value="PendingReview" />
            <el-option label="已上架" value="Active" />
            <el-option label="已拒绝" value="Rejected" />
            <el-option label="已下架" value="Withdrawn" />
            <el-option label="已售罄" value="Sold" />
          </el-select>
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            class="date-picker"
            @change="handleFilter"
          />
        </div>
      </div>
    </el-card>

    <el-card class="table-card" shadow="never">
      <div class="table-header">
        <h3 class="table-title">商品列表</h3>
        <span class="table-count">共 {{ total }} 件商品</span>
        <div class="table-actions">
          <el-checkbox v-model="allChecked" :indeterminate="indeterminate" @change="handleCheckAll">全选</el-checkbox>
          <el-button type="danger" :icon="Delete" :disabled="selectedProducts.length === 0" @click="handleBatchDelete">批量删除</el-button>
        </div>
      </div>
      <el-table
        :data="tableData"
        v-loading="loading"
        stripe
        style="width: 100%"
        @selection-change="handleSelectionChange"
        row-key="id"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column label="商品信息" min-width="250">
          <template #default="scope">
            <div class="product-info">
              <div class="product-images">
                <img
                  v-if="scope.row.images && scope.row.images.length > 0"
                  :src="scope.row.images[0]"
                  alt="商品图片"
                  class="product-image"
                />
                <div v-else class="no-image"><el-icon><Picture /></el-icon></div>
              </div>
              <div class="product-details">
                <p class="product-title">{{ scope.row.title }}</p>
                <p class="product-description">{{ scope.row.description }}</p>
                <div class="product-meta">
                  <span class="product-price">￥{{ scope.row.price.toFixed(2) }}</span>
                  <el-tag :type="getCategoryTagType(scope.row.category)" size="small">{{ getCategoryName(scope.row.category) }}</el-tag>
                  <el-tag type="info" size="small">成色: {{ scope.row.condition }}</el-tag>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="发布者" width="120">
          <template #default="scope">
            <div class="user-info">
              <el-avatar :size="32" :src="scope.row.user.avatar">{{ scope.row.user.username?.[0] }}</el-avatar>
              <div class="user-details">
                <span class="username" @click="handleViewUserDetail(scope.row.user.id)">{{ scope.row.user.username }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="数量" prop="quantity" width="80" />
        <el-table-column label="状态" width="120">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.auditStatus)" size="small">
              <el-icon><component :is="getStatusIcon(scope.row.auditStatus)" /></el-icon>
              {{ getStatusText(scope.row.auditStatus) }}
            </el-tag>
            <p v-if="scope.row.auditReason" class="audit-reason" :title="scope.row.auditReason">原因: {{ scope.row.auditReason }}</p>
          </template>
        </el-table-column>
        <el-table-column label="发布时间" width="150">
          <template #default="scope">
            <div class="time-info">
              <span class="date">{{ formatDate(scope.row.createdAt) }}</span>
              <span class="time">{{ formatTime(scope.row.createdAt) }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="auto" fixed="right">
          <template #default="scope">
            <div class="action-buttons-wrapper">
              <el-button size="small" :icon="View" @click="handleProductDetail(scope.row.id)" plain>详情</el-button>
              <el-button
                v-if="scope.row.auditStatus === 'PendingReview'"
                size="small"
                type="success"
                :icon="Check"
                @click="handleAudit(scope.row.id, 'Active')"
                plain
              >通过</el-button>
              <el-button
                v-if="scope.row.auditStatus === 'PendingReview'"
                size="small"
                type="danger"
                :icon="Close"
                @click="handleAudit(scope.row.id, 'Rejected')"
                plain
              >拒绝</el-button>
               <el-button
                v-if="scope.row.auditStatus === 'Active' || scope.row.auditStatus === 'Sold'"
                size="small"
                type="warning"
                :icon="DownloadIcon"
                @click="handleAudit(scope.row.id, 'Withdrawn')"
                plain
              >下架</el-button>
               <el-button
                v-if="scope.row.auditStatus === 'Withdrawn'"
                size="small"
                type="primary"
                :icon="Upload"
                @click="handleAudit(scope.row.id, 'Active')"
                plain
              >上架</el-button>
              <el-button
                size="small"
                type="danger"
                :icon="Delete"
                @click="handleAudit(scope.row.id, 'Deleted')"
                plain
              >删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
          v-model:currentPage="pageNumber"
          :page-size="pageSize"
          :pager-count="5"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
          background
          class="pagination-container"
      />
    </el-card>

  </div>

  <!-- 用户详情对话框 -->
  <UserDetailDialog
    v-model:visible="showUserDetailDialog"
    :user-id="selectedUserIdForDetail"
    @close="closeUserDetailDialog"
  />

  <!-- 商品详情对话框 -->
  <ProductDetailDialog
    v-model:dialogVisible="showProductDetailDialog"
    :product-id="selectedProductForDetail"
    @close="closeProductDetailDialog"
  />
</template>

<style scoped>
.products-audit-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px); /* Adjust based on your layout's header height */
}

.page-header {
  margin-bottom: 20px;
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.page-header h1 {
  font-size: 28px;
  color: #333;
  margin: 0 0 10px 0;
}

.title-section {
  display: flex;
  flex-direction: column;
}

.title-section .page-title {
  font-size: 24px;
  color: #303133;
  margin: 0 0 5px 0;
}

.title-section .page-subtitle {
  font-size: 14px;
  color: #909399;
  margin-top: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 18px 0 rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 36px;
  margin-right: 15px;
  color: #409eff; /* Default blue */
}

.stat-card.pending .stat-icon { color: #E6A23C; } /* Warning yellow */
.stat-card.approved .stat-icon { color: #67C23A; } /* Success green */
.stat-card.rejected .stat-icon { color: #F56C6C; } /* Danger red */
.stat-card.withdrawn .stat-icon { color: #909399; } /* Gray */
.stat-card.sold .stat-icon { color: #909399; } /* Gray */
.stat-card.total .stat-icon { color: #409EFF; } /* Primary blue */

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 5px;
}

.filter-card {
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.filter-content {
  padding: 10px;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  align-items: center;
}

.search-input {
  width: 300px;
}

.filter-select {
  width: 150px;
}

.date-picker {
  width: 280px;
}

.table-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #ebeef5;
}

.table-title h3 {
  margin: 0;
  font-size: 18px;
  color: #303133;
  display: inline-block;
  margin-right: 10px;
}

.table-count {
  font-size: 14px;
  color: #909399;
}

.table-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.badge-item {
  margin-right: 10px;
}

.products-table {
  width: 100%;
}

.product-info {
  display: flex;
  align-items: center;
}

.product-images {
  flex-shrink: 0;
  margin-right: 15px;
}

.product-image {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  border: 1px solid #ebeef5;
}

.no-image {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f2f5;
  color: #c0c4cc;
  border-radius: 4px;
  border: 1px dashed #dcdfe6;
  font-size: 24px;
}

.product-details {
  flex-grow: 1;
  overflow: hidden;
}

.product-title {
  font-size: 16px;
  font-weight: bold;
  margin: 0 0 5px 0;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-description {
  font-size: 13px;
  color: #909399;
  margin: 0 0 8px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
}

.product-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
}

.product-price {
  font-weight: bold;
  color: #F56C6C;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-info .username {
  cursor: pointer;
  color: #409eff;
  font-weight: 500;
}

.user-info .username:hover {
  text-decoration: underline;
}

.time-info {
  display: flex;
  flex-direction: column;
  font-size: 13px;
  color: #606266;
}

.time-info .date {
  font-weight: 500;
}

.time-info .time {
  color: #909399;
}

.audit-reason {
  font-size: 12px;
  color: #F56C6C;
  margin-top: 5px;
  max-width: 100px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.action-buttons-wrapper .el-button {
  margin: 5px;
}

.pagination-container {
  margin-top: 20px;
  justify-content: flex-end;
  display: flex;
}
</style>