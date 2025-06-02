<script setup>
import {ref, onMounted, computed, nextTick} from 'vue';
import router from "@/router/index.js";
import api from '@/API_PRO.js';
import {ElMessage, ElMessageBox} from "element-plus";
import {RefreshRight, Plus, Edit, Delete, View as ViewIcon} from "@element-plus/icons-vue";
import ProductPostDialog from "@/product/components/ProductPostDialog.vue";
import ProductDetail from "@/product/components/ProductDetail.vue";
import FormatObject from "@/utils/format.js";

// 组件基本变量定义
let isProductPostDialogVisible = ref(false);
let currentEditProductId = ref(null);
let username = ref(localStorage.getItem('username'));
let avatar_char = computed(() => localStorage.getItem("username").slice(0, 2).toUpperCase());
let itemList = ref([]);
let componentKey = ref(0);
let loading = ref(false);

// 3. 添加控制 ProductDetail 对话框的 ref
const isDetailDialogVisible = ref(false);
const currentProductIdForDetail = ref(null);

// 组件基本函数定义
const handleOtherAvatarClick = (username) => {
  router.push(`/profile/${username}`)
}

// 4. 修改 openSellComponent 为打开详情对话框
const openProductDetailDialogFromCard = (productId) => {
  if (productId) {
    currentProductIdForDetail.value = productId;
    isDetailDialogVisible.value = true;
  } else {
    ElMessage.error('无法获取商品ID以显示详情');
  }
}

const handleProductPostDialogClose = () => {
  isProductPostDialogVisible.value = false;
  currentEditProductId.value = null;
};

const handleProductPostDialogSuccess = () => {
  isProductPostDialogVisible.value = false;
  currentEditProductId.value = null;
  fetchMyProducts();
};

const openNewProductDialog = () => {
  isProductPostDialogVisible.value = true;
  currentEditProductId.value = null;
};

const openEditProductDialog = (productId) => {
  isProductPostDialogVisible.value = true;
  currentEditProductId.value = productId;
};

const fetchMyProducts = () => {
  loading.value = true;
  const userId = localStorage.getItem('userId');
  if (!userId) {
    ElMessage.error('未找到用户ID，无法加载您的商品。');
    itemList.value = [];
    loading.value = false;
    return;
  }
  api.getProductList({ owner_id: userId, page_size: 1000 }) // 获取该用户所有商品，暂不分页或设置较大分页
    .then(data => {
      if (!data || !Array.isArray(data)) {
        console.warn("API returned no data or invalid data format for my products:", data);
        itemList.value = [];
        return;
      }
      itemList.value = data.map(item => ({
        id: item.商品ID,
        name: item.商品名称,
        description: item.描述,
        quantity: item.数量,
        price: item.价格,
        post_time: item.发布时间,
        status: item.商品状态,
        img: item.主图URL 
          ? (Array.isArray(item.主图URL) 
              ? item.主图URL.map(url => url.startsWith('http') || url.startsWith('//') ? url : FormatObject.formattedImgUrl(url))
              : [item.主图URL.startsWith('http') || item.主图URL.startsWith('//') ? item.主图URL : FormatObject.formattedImgUrl(item.主图URL)])
          : ['/placeholder-image.png'], // 如果没有图片，提供一个占位图
        user: {
            username: item.卖家用户名,
            // credit: item.发布者信用分 || 100, // ProductResponseSchema 中无此字段，暂时注释
            // avatar: item.发布者头像 || '', // ProductResponseSchema 中无此字段，暂时注释
        },
        total_count: item.总商品数, 
        category: item.分类名称,
        condition: item.商品成色
      }));
      if (itemList.value.length === 0) {
        // ElMessage.info("您还没有发布的商品。"); // 页面已有空状态提示
      }
    })
    .catch(error => {
      console.error("Fetch my products failure:", error);
      ElMessage.error('获取我的商品列表失败: ' + (error.response?.data?.detail || error.message));
      itemList.value = [];
    })
    .finally(() => {
      loading.value = false;
    });
};

const handleToggleProductStatus = async (item) => {
  const originalStatus = item.status;
  if (originalStatus === 'Sold') {
    ElMessage.info('已售出的商品无法进行操作。');
    return;
  }
  if (originalStatus === 'PendingReview') {
    ElMessage.info('审核中的商品暂时无法操作，请等待审核结果。');
    return;
  }
  if (originalStatus === 'Rejected') {
    ElMessage.info('审核拒绝的商品无法直接上架，请编辑后重新提交或删除。');
    return;
  }

  let actionText = '';
  let newStatus = '';
  let confirmTitle = '';
  let confirmMessage = '';
  let successMessage = '';
  let failureMessage = '';
  let apiCall;

  if (originalStatus === 'Active') {
    actionText = '下架';
    newStatus = 'Withdrawn';
    confirmTitle = '确认下架';
    confirmMessage = `确定要下架商品 "${item.name}" 吗？`;
    successMessage = '商品已成功下架';
    failureMessage = '下架商品失败';
    apiCall = () => api.withdrawProduct(item.id);
  } else if (originalStatus === 'Withdrawn') {
    // 卖家不能直接从 Withdrawn 状态上架，需要编辑后重新提交审核
    // 但如果业务逻辑允许直接重新激活（跳过审核），可以启用此逻辑
    // actionText = '重新上架';
    // newStatus = 'Active'; // 或 PendingReview 如果需要重新审核
    // confirmTitle = '确认重新上架';
    // confirmMessage = `确定要重新上架商品 "${item.name}" 吗？`;
    // successMessage = '商品已成功重新上架';
    // failureMessage = '重新上架商品失败';
    // apiCall = () => api.activateProduct(item.id); // 假设有这样一个接口，或通过updateProduct设置status
    ElMessage.info('已下架的商品如需重新上架，请编辑商品信息后保存，系统将重新提交审核。');
    return;
  } else {
    ElMessage.warning(`商品状态 "${getProductStatusText(originalStatus)}" 不支持此操作。`);
    return;
  }

  try {
    await ElMessageBox.confirm(confirmMessage, confirmTitle, {
      confirmButtonText: `确定${actionText}`,
      cancelButtonText: '取消',
      type: 'warning',
    });

    await apiCall();
    ElMessage.success(successMessage);
    item.status = newStatus;
    // fetchMyProducts(); // 可以考虑仅更新当前项状态，或完全刷新
  } catch (error) {
    if (error !== 'cancel') {
      console.error(`${actionText}商品失败:`, error);
      ElMessage.error(`${failureMessage}: ` + (error.response?.data?.detail || error.message));
    }
    // 如果操作失败或用户取消，状态应回滚
    await nextTick(() => {
      item.status = originalStatus;
    });
  }
};

const handleDeleteProduct = async (productId, productName) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除商品 "${productName}" 吗？此操作不可逆！`,
      '删除商品',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'error'
      }
    );
    await api.deleteProduct(productId);
    ElMessage.success('商品已成功删除');
    fetchMyProducts(); 
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除商品失败:', error);
      ElMessage.error('删除商品失败: ' + (error.response?.data?.detail || error.message));
    }
  }
};

const getProductStatusTagType = (status) => {
  switch (status) {
    case 'Active': return 'success';
    case 'Withdrawn': return 'info';
    case 'Sold': return 'warning';
    case 'PendingReview': return 'primary';
    case 'Rejected': return 'danger';
    default: return 'info';
  }
};

const getProductStatusText = (status) => {
  switch (status) {
    case 'Active': return '在售';
    case 'Withdrawn': return '已下架';
    case 'Sold': return '已售出';
    case 'PendingReview': return '审核中';
    case 'Rejected': return '已拒绝';
    default: return `未知 (${status})`;
  }
};

onMounted(() => {
  fetchMyProducts();
})
</script>

<template>
  <div class="my-products-container">
    <el-card class="product-list-card" shadow="hover">
      <div class="card-header">
        <h2 class="card-title">我的发布</h2>
        <div class="header-actions">
          <el-button type="primary" :icon="Plus" @click="openNewProductDialog" class="publish-button">
            发布新商品
          </el-button>
          <el-button :icon="RefreshRight" @click="fetchMyProducts" circle class="refresh-button" />
        </div>
      </div>

      <div class="product-grid-wrapper" v-loading="loading">
        <div v-if="itemList.length === 0 && !loading" class="empty-products-state">
          <el-empty description="您还没有发布的商品"></el-empty>
          <el-button type="primary" @click="openNewProductDialog" class="action-button">
            去发布商品
          </el-button>
        </div>

        <el-row v-else :gutter="20" class="product-cards-grid">
          <el-col :span="24" :sm="12" :md="8" :lg="6" v-for="item in itemList" :key="item.id" class="product-col">
            <el-card class="product-item-card" shadow="hover">
              <div class="product-image-container" @click="openProductDetailDialogFromCard(item.id)"> 
                <img 
                  :src="(item.img && item.img.length > 0 && item.img[0]) ? item.img[0] : '/images/placeholder.png'" 
                  :alt="item.name" 
                  class="product-image"
                  />
              </div>
              <div class="product-card-body">
                <h3 class="product-title-text" @click="openProductDetailDialogFromCard(item.id)">{{ item.name }}</h3>
                <div class="product-meta-info">
                  <span class="product-price-text">￥{{ item.price }}</span>
                  <el-tag :type="getProductStatusTagType(item.status)" size="small" effect="light" class="product-status-tag">
                    {{ getProductStatusText(item.status) }}
                  </el-tag>
                </div>
              </div>
              <div class="product-card-actions">
                <el-tooltip content="查看详情" placement="top">
                  <el-button :icon="ViewIcon" size="small" @click="openProductDetailDialogFromCard(item.id)" circle />
                </el-tooltip>
                <el-tooltip content="编辑商品" placement="top">
                  <el-button 
                    type="primary" 
                    :icon="Edit" 
                    size="small" 
                    @click="openEditProductDialog(item.id)" 
                    circle 
                    :disabled="item.status === 'Sold'" />
                </el-tooltip>
                <el-tooltip content="删除商品" placement="top">
                  <el-button 
                    type="danger" 
                    :icon="Delete" 
                    size="small" 
                    @click="handleDeleteProduct(item.id, item.name)" 
                    circle 
                    :disabled="item.status === 'Sold'" />
                </el-tooltip>
                <el-tooltip :content="item.status === 'Active' ? '点击下架' : (item.status === 'Withdrawn' ? '编辑后可重新提交审核' : '操作无效')" placement="top">
                  <div> <!-- Tooltip需要一个单独的根元素来包裹disabled的el-switch -->
                    <el-switch
                      v-model="item.status"
                      active-value="Active"
                      inactive-value="Withdrawn"
                      size="small"
                      @change="handleToggleProductStatus(item)"
                      :disabled="item.status === 'Sold' || item.status === 'PendingReview' || item.status === 'Rejected' || item.status === 'Withdrawn'" 
                      style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949; margin-left: 8px;"
                    />
                  </div>
                </el-tooltip>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <!-- 商品发布/编辑对话框 -->
    <ProductPostDialog
        v-if="isProductPostDialogVisible"
        :isDialogVisible="isProductPostDialogVisible"
        :isEditMode="!!currentEditProductId" 
        :product-id="currentEditProductId"
        @update:isDialogVisible="isProductPostDialogVisible = $event"
        @updateSuccess="handleProductPostDialogSuccess"
        @updateCancel="handleProductPostDialogClose" 
    />

    <!-- 5. 嵌入 ProductDetail 对话框 -->
    <ProductDetail
      v-if="currentProductIdForDetail"
      :product-id="currentProductIdForDetail"
      :dialog-visible="isDetailDialogVisible"
      @update:dialogVisible="isDetailDialogVisible = $event"
      @close="currentProductIdForDetail = null; isDetailDialogVisible = false;" 
    />

  </div>
</template>

<style scoped>
.my-products-container {
  padding: 20px;
  background-color: #f9fafb; /* Slightly off-white background */
  min-height: calc(100vh - 60px); /* Adjust if navbar height is different */
}

.product-list-card {
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.05); /* Softer shadow */
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #e5e7eb; /* Lighter border */
}

.card-title {
  font-size: 22px;
  font-weight: 600;
  color: #1f2937; /* Darker gray for title */
  margin: 0;
}

.header-actions .publish-button {
  /* background-color: #3b82f6; */ /* Tailwind Blue 500 */
  /* border-color: #3b82f6; */
}
.header-actions .refresh-button {
  /* color: #3b82f6; */
  /* border-color: #d1d5db; */ /* Tailwind Gray 300 */
}

.product-grid-wrapper {
  padding: 24px;
  min-height: 300px; /* Ensure a minimum height when loading or empty */
}

.empty-products-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  text-align: center;
}
.empty-products-state .el-button {
  margin-top: 20px;
}

.product-cards-grid {
  /* el-row with gutter handles spacing */
}

.product-col {
  margin-bottom: 20px; /* Add space between rows of cards */
}

.product-item-card {
  border-radius: 10px;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  overflow: hidden; /* Clip content like image */
}

.product-item-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.1);
}

.product-image-container {
  width: 100%;
  aspect-ratio: 16 / 10; /* Maintain aspect ratio, adjust as needed */
  overflow: hidden;
  cursor: pointer;
  background-color: #f3f4f6; /* Placeholder background */
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover; /* Cover the area, might crop */
  transition: transform 0.3s ease;
}

.product-image-container:hover .product-image {
  transform: scale(1.05);
}


.product-card-body {
  padding: 16px;
}

.product-title-text {
  font-size: 17px;
  font-weight: 600;
  color: #111827; /* Tailwind Gray 900 */
  margin: 0 0 8px 0;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.product-title-text:hover {
  color: #2563eb; /* Tailwind Blue 600 */
}

.product-description-text {
  font-size: 13px;
  color: #6b7280; /* Tailwind Gray 500 */
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 38px; /* Approx 2 lines height */
}

.product-meta-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.product-price-text {
  font-size: 18px;
  font-weight: bold;
  color: #ef4444; /* Tailwind Red 500 */
}

.product-status-tag {
  /* font-weight: 500; */
}

.product-card-actions {
  padding: 0px 16px 16px; /* Add padding for actions */
  border-top: 1px solid #f3f4f6; /* Separator line */
  display: flex;
  justify-content: space-around; /* Distribute buttons evenly */
  align-items: center;
  gap: 8px;
}

.product-card-actions .el-button,
.product-card-actions .el-switch {
  flex-grow: 1; /* Allow buttons/switch to grow */
  /* min-width: 80px; */ /* Ensure a minimum width */
}

.product-card-actions .el-button.is-circle {
  flex-grow: 0; /* Circle buttons should not grow */
}


/* Adjust el-switch style if needed */
.product-card-actions .el-switch {
  /* Custom styling for switch, e.g., to align text better */
  /* --el-switch-on-color: #13ce66; */
  /* --el-switch-off-color: #ff4949; */
}


@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }
  .header-actions {
    margin-top: 10px;
    width: 100%;
    justify-content: space-between;
  }
  .product-cards-grid {
     /* el-col handles responsive span */
  }
  .product-card-actions {
    flex-wrap: wrap; /* Allow actions to wrap on small screens */
  }
}

</style>
