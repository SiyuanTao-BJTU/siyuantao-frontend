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
          <!-- Actions moved to table header -->
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <div class="stat-card pending" @click="handleStatCardClick('pending')">
        <div class="stat-icon">
          <el-icon><Clock /></el-icon>
        </div>
        <div class="stat-content">
          <span class="stat-number">{{ stats.pending }}</span>
          <span class="stat-label">待审核</span>
        </div>
      </div>
      <div class="stat-card approved" @click="handleStatCardClick('approved')">
        <div class="stat-icon">
          <el-icon><Check /></el-icon>
        </div>
        <div class="stat-content">
          <span class="stat-number">{{ stats.approved }}</span>
          <span class="stat-label">已上架</span>
        </div>
      </div>
      <div class="stat-card rejected" @click="handleStatCardClick('rejected')">
        <div class="stat-icon">
          <el-icon><Close /></el-icon>
        </div>
        <div class="stat-content">
          <span class="stat-number">{{ stats.rejected }}</span>
          <span class="stat-label">已拒绝</span>
        </div>
      </div>
      <div class="stat-card withdrawn" @click="handleStatCardClick('withdrawn')">
        <div class="stat-icon">
          <el-icon><Download /></el-icon>
        </div>
        <div class="stat-content">
          <span class="stat-number">{{ stats.withdrawn }}</span>
          <span class="stat-label">已下架</span>
        </div>
      </div>
      <div class="stat-card sold" @click="handleStatCardClick('sold')">
        <div class="stat-icon">
          <el-icon><ShoppingCartFull /></el-icon>
        </div>
        <div class="stat-content">
          <span class="stat-number">{{ stats.sold }}</span>
          <span class="stat-label">已售罄</span>
        </div>
      </div>
      <div class="stat-card total" @click="handleStatCardClick(null)">
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
            placeholder="商品状态"
            clearable
            @change="handleFilter"
            class="filter-select"
          >
            <el-option label="待审核" value="pending" />
            <el-option label="已上架" value="approved" />
            <el-option label="已拒绝" value="rejected" />
            <el-option label="已下架" value="withdrawn" />
            <el-option label="已售罄" value="sold" />
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
            value-format="YYYY-MM-DD"
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
          <el-tooltip content="导出数据" placement="top">
            <el-button 
              size="small" 
              :icon="Download" 
              @click="exportData"
            >
              导出
            </el-button>
          </el-tooltip>
           <el-badge :value="pendingCount" class="badge-item" :hidden="pendingCount === 0 || selectedProducts.filter(p=>p.auditStatus === 'PendingReview').length === 0">
            <el-tooltip content="批量通过选中的待审核商品" placement="top">
              <el-button 
                type="primary" 
                size="small" 
                :icon="Bell" 
                @click="handleBatchAudit" 
                :disabled="selectedProducts.filter(p=>p.auditStatus === 'PendingReview').length === 0"
              >
                批量审核 ({{ selectedProducts.filter(p=>p.auditStatus === 'PendingReview').length }})
              </el-button>
            </el-tooltip>
          </el-badge>
          <el-tooltip content="刷新列表" placement="top">
            <el-button size="small" :icon="Refresh" @click="refreshData"></el-button>
          </el-tooltip>
        </div>
      </div>

      <el-table
        :data="tableData"
        v-loading="loading"
        @selection-change="handleSelectionChange"
        class="products-table"
        row-key="id"
        empty-text="暂无商品数据"
      >
        <el-table-column type="selection" width="55" :selectable="row => row.auditStatus === 'PendingReview'" />
        
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
                  hide-on-click-modal
                />
                <div v-else class="no-image">
                  <el-icon><Picture /></el-icon>
                </div>
              </div>
              <div class="product-details">
                <h4 class="product-title" :title="row.title">{{ row.title }}</h4>
                <p class="product-description" :title="row.description">{{ row.description }}</p>
                <div class="product-meta">
                  <el-tag :type="getCategoryTagType(row.category)" size="small" effect="light">
                    {{ getCategoryName(row.category) }}
                  </el-tag>
                  <span class="product-price">¥{{ row.price?.toFixed(2) }}</span>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="发布者" width="180">
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar :size="32" :src="row.user.avatar || undefined">
                {{ row.user.username?.[0]?.toUpperCase() }}
              </el-avatar>
              <div class="user-details">
                <span class="username" :title="row.user.username">{{ row.user.username }}</span>
                <span class="user-credit">信用: {{ row.user.credit }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="发布时间" width="170" sortable prop="createdAt">
          <template #default="{ row }">
            <div class="time-info" :title="formatDateTime(row.createdAt)">
              <span class="date">{{ formatDate(row.createdAt) }}</span>
              <span class="time">{{ formatTime(row.createdAt) }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <div class="status-column">
              <el-tag
                :type="getStatusTagType(row.auditStatus)"
                :icon="getStatusIcon(row.auditStatus)"
                size="small"
                effect="light"
              >
                {{ getStatusText(row.auditStatus) }}
              </el-tag>
              <div v-if="row.auditReason && row.auditStatus === 'Rejected'" class="audit-reason" :title="row.auditReason">
                {{ row.auditReason }}
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons-wrapper">
              <el-tooltip content="查看商品详情" placement="top">
                <el-button
                  type="primary"
                  size="small"
                  :icon="View"
                  circle
                  @click="viewProduct(row)"
                />
              </el-tooltip>
              
              <template v-if="row.auditStatus === 'PendingReview'">
                <el-tooltip content="通过审核" placement="top">
                  <el-button
                    type="success"
                    size="small"
                    :icon="Check"
                    circle
                    @click="approveProduct(row)"
                  />
                </el-tooltip>
                <el-tooltip content="拒绝审核" placement="top">
                  <el-button
                    type="danger"
                    size="small"
                    :icon="Close"
                    circle
                    @click="rejectProduct(row)"
                  />
                </el-tooltip>
              </template>
              
              <el-dropdown trigger="click" popper-class="action-dropdown">
                <el-button type="info" size="small" :icon="Operation" circle />
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item 
                      :icon="Edit" 
                      @click="editAuditStatus(row)"
                      :disabled="row.auditStatus === 'PendingReview' || row.auditStatus === 'Sold'" 
                    >
                      编辑详情
                    </el-dropdown-item>
                    <el-dropdown-item 
                      :icon="Download" 
                      @click="handleWithdrawProduct(row)" 
                      :disabled="!(row.auditStatus === 'Active')" 
                      divided
                    >
                      下架商品
                    </el-dropdown-item>
                    <el-dropdown-item 
                      :icon="Delete" 
                      @click="handleDeleteProduct(row)"
                      :disabled="row.auditStatus === 'Sold'" 
                      class="danger-action"
                    >
                      删除商品
                    </el-dropdown-item>
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
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          background
        />
      </div>
    </el-card>
    
    <!-- 新的商品详情对话框 -->
    <ProductDetail 
      v-if="selectedProductIdForDetail"
      :product-id="selectedProductIdForDetail"
      :dialog-visible="isProductDetailDialogVisible"
      @update:dialogVisible="isProductDetailDialogVisible = $event"
      @close="selectedProductIdForDetail = null" 
    />

    <!-- 审核拒绝原因弹窗 -->
    <el-dialog
      v-model="rejectDialogVisible"
      title="审核拒绝"
      width="500px"
      append-to-body
      destroy-on-close
      class="reject-dialog"
      :close-on-click-modal="false"
    >
      <el-form :model="rejectForm" label-width="100px" ref="rejectFormRef" @submit.prevent="confirmReject">
        <el-form-item label="拒绝原因" prop="reason" :rules="[{ required: true, message: '请选择拒绝原因', trigger: 'change' }]"
        >
          <el-select v-model="rejectForm.reason" placeholder="请选择拒绝原因" style="width:100%;">
            <el-option label="商品图片不清晰" value="图片不清晰" />
            <el-option label="商品描述不详细" value="描述不详细" />
            <el-option label="价格不合理" value="价格不合理" />
            <el-option label="违禁物品" value="违禁物品" />
            <el-option label="重复发布" value="重复发布" />
            <el-option label="其他（请在详细说明中注明）" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="详细说明" prop="detail">
          <el-input
            v-model="rejectForm.detail"
            type="textarea"
            :rows="4"
            placeholder="请输入详细的拒绝说明（选填，若选择'其他'原因则必填）"
            :validate-event="false"
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
      @updateSuccess="() => { fetchData(); isEditDialogVisible = false; }"
    />
    
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
      Search, Refresh, Bell, Download, View, Edit, Check, Close, Delete,
      Clock, Box, Picture, Operation, ShoppingCartFull
    } from '@element-plus/icons-vue'
import api from '@/API_PRO.js';
import FormatObject from '@/utils/format.js';
import ProductPostDialog from "@/product/components/ProductPostDialog.vue"; 
import ProductDetail from "@/product/components/ProductDetail.vue"; 


// 响应式数据
const loading = ref(false)
const tableData = ref([])
const selectedProducts = ref([]) // For batch operations
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)

// 编辑商品弹窗的状态
const isEditDialogVisible = ref(false); 
const selectedProductForEdit = ref(null); 
const isEditMode = ref(false); 

// 筛选条件
const searchKeyword = ref('')
const statusFilter = ref('pending')
const categoryFilter = ref('')
const dateRange = ref([])

// 统计数据
const stats = reactive({
  pending: 0,
  approved: 0,
  rejected: 0,
  withdrawn: 0,
  sold: 0,
  total: 0
})

// 新的商品详情弹窗状态
const isProductDetailDialogVisible = ref(false);
const selectedProductIdForDetail = ref(null);

// 审核拒绝相关
const rejectDialogVisible = ref(false)
const productToReject = ref(null); // Used specifically for the rejection process
const rejectFormRef = ref(null); // Ref for reject form

// 拒绝表单
const rejectForm = reactive({
  reason: '',
  detail: ''
})

// 计算属性
const pendingCount = computed(() => stats.pending)

// mapProductData 函数定义
const mapProductData = (item) => ({
  id: item.商品ID,
  title: item.商品名称,
  description: item.商品描述,
  price: parseFloat(item.价格),
  category: item.商品类别,
  auditStatus: item.商品状态, 
  condition: item.商品成色 || '', 
  images: item.主图URL 
    ? (Array.isArray(item.主图URL) 
        ? item.主图URL.map(url => url.startsWith('http') || url.startsWith('//') ? url : FormatObject.formattedImgUrl(url))
        : [item.主图URL.startsWith('http') || item.主图URL.startsWith('//') ? item.主图URL : FormatObject.formattedImgUrl(item.主图URL)])
    : [],
  auditReason: item.拒绝理由 || '',
  createdAt: item.发布时间,
  user: {
    username: item.发布者用户名,
    credit: item.发布者信用分 || 100, 
    avatar: item.发布者头像 || '', 
    phone: item.发布者联系方式 || '未提供', 
    joinTime: item.发布者注册时间 || item.发布时间, 
  }
});

// 方法
const fetchData = async () => {
  loading.value = true;
  try {
    // 1. 获取全量数据用于统计 (使用新的特殊状态值)
    const allProductsResponse = await api.getProductList({ status: '_FETCH_ALL_PRODUCTS_', page_size: 10000 }); 
    const mappedAllProducts = allProductsResponse.map(mapProductData);
    stats.pending = mappedAllProducts.filter(item => item.auditStatus === 'PendingReview').length;
    stats.approved = mappedAllProducts.filter(item => item.auditStatus === 'Active').length;
    stats.rejected = mappedAllProducts.filter(item => item.auditStatus === 'Rejected').length;
    stats.withdrawn = mappedAllProducts.filter(item => item.auditStatus === 'Withdrawn').length;
    stats.sold = mappedAllProducts.filter(item => item.auditStatus === 'Sold').length;
    stats.total = mappedAllProducts.length;

    // 2. 根据当前筛选条件（包括 statusFilter）准备参数获取表格数据
    let currentStatusParam = undefined;
    if (statusFilter.value === 'pending') currentStatusParam = 'PendingReview';
    else if (statusFilter.value === 'approved') currentStatusParam = 'Active';
    else if (statusFilter.value === 'rejected') currentStatusParam = 'Rejected';
    else if (statusFilter.value === 'withdrawn') currentStatusParam = 'Withdrawn';
    else if (statusFilter.value === 'sold') currentStatusParam = 'Sold';
    // 如果 statusFilter.value 为空字符串或 null/undefined (即点击"总商品"卡片)，则 currentStatusParam 保持 undefined (后端sp_GetProductList在status为null时获取所有激活商品，需要调整为获取全部，或前端在此时不传status)
    // 为了保持点击 "总商品" 卡片时显示所有商品，当 statusFilter.value 为 null 时，我们不传递 status 参数给后端，
    // 或者传递一个后端能识别为"所有状态"的特殊值（如果后端支持）。
    // 当前 sp_GetProductList 对于 status=null 会默认查询 Active，对于 _FETCH_ALL_PRODUCTS_ 会查询所有。
    // 所以，当 statusFilter.value 为 null (点击总览卡片) 时，我们应该让 currentStatusParam 为 _FETCH_ALL_PRODUCTS_
    if (statusFilter.value === null) {
        currentStatusParam = '_FETCH_ALL_PRODUCTS_';
    }

    const params = {
      page_number: currentPage.value,
      page_size: pageSize.value,
      category_name: categoryFilter.value || undefined,
      status: currentStatusParam, 
      keyword: searchKeyword.value || undefined,
      // start_date: dateRange.value?.[0] || undefined,
      // end_date: dateRange.value?.[1] || undefined,
    };

    // 3. 获取筛选后的数据用于表格和分页
    const filteredProductsResponse = await api.getProductList(params);
    
    tableData.value = filteredProductsResponse.map(mapProductData);

    // 4. 设置分页总数
    // 如果后端API能返回筛选后的总数，优先使用。否则根据当前筛选情况估算或使用全局总数。
    // 当前getProductList的返回结构中，每个商品对象都带有 `总商品数`，这通常是全局总数。
    // 因此，我们不能依赖它作为筛选后的总数。
    // 如果有状态筛选，我们用当前返回的列表长度作为 total，这只对单页数据准确，多页分页不准。
    // 最好的方式是后端API能够返回筛选后的总数。
    // 鉴于当前情况，为了让列表筛选有效，当有筛选条件时，total 应该反映筛选后的数量。
    // 但我们无法从后端直接获取，所以如果 statusFilter 有值，total 就是 tableData.value.length (当前页的)
    // 这会导致分页器仅对当前页正确。一种折中是，如果筛选了，就不显示分页或总数，或者一直用stats.total

    if (params.status && params.status !== '_FETCH_ALL_PRODUCTS_') {
      // 如果有具体的状态筛选，我们无法从当前API得知该状态下的总商品数，
      // 除非我们获取所有该状态的商品（不分页）然后计数，但这不高效。
      // 暂时将 total 设置为当前页返回的数量，这使得分页仅对第一页有意义。
      // 或者，更简单地，让 total 始终等于 stats.total (所有商品的总数)，分页器始终基于所有商品。
      // 用户通过点击统计卡片或筛选器来过滤列表内容。
      total.value = stats[statusFilter.value] || 0; // 使用对应状态的统计数量作为分页总数
    } else {
      total.value = stats.total; // 没有特定状态筛选（如查看全部或总商品）时，使用总商品数
    }

  } catch (error) {
    console.error('获取数据失败:', error);
    ElMessage.error('获取数据失败：' + (error.response?.data?.detail || error.message));
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  currentPage.value = 1; // Reset to first page on new search
  fetchData();
};

const handleFilter = () => {
  currentPage.value = 1; // Reset to first page on filter change
  fetchData();
};

// 新增：统计卡片点击处理
const handleStatCardClick = (statusValue) => {
  statusFilter.value = statusValue; // null 或 'pending', 'approved', 'rejected'
  currentPage.value = 1;
  fetchData();
};

const handleSelectionChange = (selection) => {
  selectedProducts.value = selection
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1; // Reset to first page on page size change
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
  selectedProductIdForDetail.value = product.id;
  isProductDetailDialogVisible.value = true;
}

const approveProduct = async (product) => {
  try {
    await ElMessageBox.confirm('确认通过该商品的审核？', '确认操作', {
      type: 'warning'
    });
    
    await api.activateProduct(product.id);
    
    ElMessage.success('审核通过成功');
    if (isProductDetailDialogVisible.value && selectedProductIdForDetail.value === product.id) {
      isProductDetailDialogVisible.value = false;
    }
    fetchData();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('审核通过失败:', error);
      ElMessage.error('审核通过失败：' + (error.response?.data?.detail || error.message));
    }
  }
};

const rejectProduct = (product) => {
  productToReject.value = product; 
  rejectForm.reason = '';
  rejectForm.detail = '';
  if (rejectFormRef.value) { // Clear previous validation
    rejectFormRef.value.clearValidate();
  }
  rejectDialogVisible.value = true;
};

const confirmReject = async () => {
  if (!rejectFormRef.value) return;
  rejectFormRef.value.validate(async (valid) => {
    if (valid) {
      if (!productToReject.value || !productToReject.value.id) {
          ElMessage.error('无法确定要拒绝的商品');
          return;
      }
      try {
        const reasonDetail = rejectForm.reason + (rejectForm.detail ? `: ${rejectForm.detail}` : '');
        await api.rejectProduct(productToReject.value.id, { reason: reasonDetail });
        
        ElMessage.success('审核拒绝成功');
        rejectDialogVisible.value = false;
        if (isProductDetailDialogVisible.value && selectedProductIdForDetail.value === productToReject.value.id) {
          isProductDetailDialogVisible.value = false;
        }
        productToReject.value = null; 
        fetchData();
      } catch (error) {
        console.error('审核拒绝失败:', error);
        ElMessage.error('审核拒绝失败：' + (error.response?.data?.detail || error.message));
      }
    } else {
      ElMessage.warning('请检查表单输入');
    }
  });
};

const handleBatchAudit = async () => {
  if (selectedProducts.value.length === 0) {
    ElMessage.warning('请先选择要批量审核的商品');
    return;
  }
  const pendingProducts = selectedProducts.value.filter(p => p.auditStatus === 'PendingReview');
  if (pendingProducts.length === 0) {
    ElMessage.warning('选中的商品均非待审核状态，无需批量审核。');
    return;
  }
  
  try {
    await ElMessageBox.confirm(
      `确认批量通过选中的 ${pendingProducts.length} 个待审核商品？`,
      '批量审核',
      {
        confirmButtonText: '确定通过',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    const productIdsToActivate = pendingProducts.map(p => p.id);
    await api.batchActivateProducts({ product_ids: productIdsToActivate }); 
    ElMessage.success(`批量审核通过 ${productIdsToActivate.length} 个商品成功`);
    fetchData();
    selectedProducts.value = []; // Clear selection
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

const handleWithdrawProduct = async (product) => {
  try {
    await ElMessageBox.confirm(`确定要下架商品 "${product.title}" 吗？`, '确认下架', {
      confirmButtonText: '确定下架',
      cancelButtonText: '取消',
      type: 'warning'
    });
    await api.withdrawProduct(product.id);
    ElMessage.success('商品下架成功');
    fetchData(); // 刷新列表和统计数据
  } catch (error) {
    if (error !== 'cancel') {
      console.error('下架商品失败:', error);
      ElMessage.error('下架商品失败：' + (error.response?.data?.detail || error.message));
    }
  }
};

const handleDeleteProduct = async (product) => {
  try {
    await ElMessageBox.confirm(`确定要删除商品 "${product.title}" 吗？此操作不可恢复。`, '确认删除', {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'danger' 
    });
    await api.deleteProduct(product.id);
    ElMessage.success('商品删除成功');
    fetchData(); 
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除商品失败:', error);
      ElMessage.error('删除商品失败：' + (error.response?.data?.detail || error.message));
    }
  }
};

const editAuditStatus = (product) => {
      console.log("Admin attempting to edit product:", product.id);
      selectedProductForEdit.value = product; 
      isEditDialogVisible.value = true; 
      isEditMode.value = true; 
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
  return categoryMap[category] || category || '未知'
}

const getCategoryTagType = (category) => {
  const typeMap = {
    electronics: 'success',
    books: 'primary', // Changed to primary for better distinction
    daily: 'warning',
    clothing: 'danger',
    others: 'info'
  }
  return typeMap[category] || 'info'
}

const getStatusText = (status) => {
  const statusMap = {
    'PendingReview': '待审核', 
    'Active': '已上架', 
    'Rejected': '已拒绝',
    'Withdrawn': '已下架',
    'Sold': '已售罄'
  };
  return statusMap[status] || status || '未知';
};

const getStatusTagType = (status) => {
  const typeMap = {
    'PendingReview': 'warning',
    'Active': 'success',
    'Rejected': 'danger',
    'Withdrawn': 'info',
    'Sold': 'info' 
  };
  return typeMap[status] || 'info';
};

const getStatusIcon = (status) => {
  const iconMap = {
    'PendingReview': Clock, 
    'Active': Check, 
    'Rejected': Close,
    'Withdrawn': Download, 
    'Sold': Box 
  }
  return iconMap[status] || undefined;
}

const formatDate = (date) => {
  if (!date) return 'N/A';
  try {
    return new Date(date).toLocaleDateString();
  } catch (e) { return '日期无效'; }
}

const formatTime = (date) => {
 if (!date) return '';
  try {
    return new Date(date).toLocaleTimeString();
  } catch (e) { return '时间无效'; }
}

const formatDateTime = (date) => {
  if (!date) return 'N/A';
  try {
    return new Date(date).toLocaleString();
  } catch (e) { return '日期时间无效'; }
}

// 生命周期
onMounted(() => {
  // 初始加载时，如果 stats.pending 为0，则 statusFilter 设为 undefined (显示所有)
  // 但 stats.pending 的计算在 fetchData 内部，所以这里不能直接用
  // fetchData 内部会处理 statusFilter 的默认行为
  fetchData();
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
  cursor: pointer; /* Add cursor pointer */
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out; /* Add transition */
}

.stat-card:hover {
  transform: translateY(-4px) scale(1.02); /* Lift and slightly scale on hover */
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15); /* Enhance shadow on hover */
}

.stat-card.pending { border-left: 4px solid #f59e0b; }
.stat-card.approved { border-left: 4px solid #10b981; }
.stat-card.rejected { border-left: 4px solid #ef4444; }
.stat-card.withdrawn { border-left: 4px solid #a0aec0; }
.stat-card.sold { border-left: 4px solid #718096; }
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
.withdrawn .stat-icon { background: linear-gradient(45deg, #a0aec0, #cbd5e0); }
.sold .stat-icon { background: linear-gradient(45deg, #718096, #a0aec0); }
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