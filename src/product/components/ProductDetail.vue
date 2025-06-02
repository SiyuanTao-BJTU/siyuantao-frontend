<script setup>
import { ref, onMounted, watch, defineProps, defineEmits, computed } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/API_PRO.js';
import { ElMessage, ElMessageBox } from 'element-plus';
import FormatObject from '@/utils/format.js'; // 假设有这个工具类处理图片URL
import { useStore } from 'vuex'; // 从 vuex 导入 useStore

const props = defineProps({
  productId: {
    type: String,
    required: true,
  },
  dialogVisible: {
    type: Boolean,
    default: false,
  }
});

const emit = defineEmits(['update:dialogVisible', 'close']);

const router = useRouter();
const productDetail = ref(null);
const isLoading = ref(true);
const error = ref(false);
const isFavorite = ref(false);
const isTogglingFavorite = ref(false);

const store = useStore(); // 获取 Vuex store 实例
const currentUser = computed(() => store.getters['user/getUserInfo']); // 从 Vuex store 获取用户信息

// 新增计算属性，安全地获取 user_id
const currentUserId = computed(() => currentUser.value?.user_id);

const fetchProductDetail = async (id) => {
  if (!id) return;
  isLoading.value = true;
  error.value = false;
  isFavorite.value = false;
  isTogglingFavorite.value = false;
  try {
    const response = await api.getProductDetail(id);
    // 假设 API 返回的数据结构是 {"商品ID": ..., "商品名称": ..., ...}
    // 需要映射到 productDetail.value
    if (response) { // 直接使用API返回的数据
      productDetail.value = {
        id: response.商品ID,
        name: response.商品名称,
        description: response.商品描述,
        price: response.价格,
        quantity: response.库存,
        category: response.商品类别, // 保持原始值，显示时转换
        condition: response.商品成色 || '未提供',
        images: response.ImageURLs // 假设后端返回 ImageURLs 字段，是逗号分隔的字符串或数组
          ? (Array.isArray(response.ImageURLs)
              ? response.ImageURLs.map(url => url.startsWith('http') ? url : FormatObject.formattedImgUrl(url))
              : response.ImageURLs.split(',').map(url => url.trim().startsWith('http') ? url.trim() : FormatObject.formattedImgUrl(url.trim()))
            )
          : [],
        status: response.商品状态,
        postTime: response.发布时间,
        user: {
          id: response.发布者用户ID || null,
          username: response.发布者用户名 || '未知用户',
          // 这里可能需要调用另一个API获取更详细的卖家信息，或者后端在getProductDetail中提供
          // phone_number: response.发布者联系方式, // 假设有此字段
          // avatar_url: response.发布者头像, // 假设有此字段
        }
      };

      // 检查是否已收藏 (仅在用户登录后)
      if (currentUserId.value) { // 使用 currentUserId.value
        try {
          const favoritesResponse = await api.getUserFavorites();
          if (favoritesResponse && Array.isArray(favoritesResponse)) {
             isFavorite.value = favoritesResponse.some(fav => fav.商品ID === id);
          }
        } catch (favError) {
          console.warn('获取用户收藏列表失败:', favError);
          // 不阻断主要逻辑
        }
      } else {
        isFavorite.value = false; // 用户未登录，肯定未收藏
      }
    } else {
      error.value = true;
      ElMessage.error('未找到商品详情');
    }
  } catch (err) {
    console.error('加载商品详情失败:', err);
    error.value = true;
    ElMessage.error('加载商品详情失败: ' + (err.response?.data?.detail || err.message));
  } finally {
    isLoading.value = false;
  }
};

const toggleFavorite = async () => {
  if (!currentUserId.value) { // 使用 currentUserId.value
    ElMessage.warning('请先登录后再操作');
    router.push('/login');
    return;
  }
  if (!productDetail.value || isTogglingFavorite.value) return;

  isTogglingFavorite.value = true;
  try {
    if (isFavorite.value) {
      await api.removeFavorite(productDetail.value.id);
      ElMessage.success('取消收藏成功');
    } else {
      await api.addFavorite(productDetail.value.id);
      ElMessage.success('收藏成功');
    }
    isFavorite.value = !isFavorite.value;
  } catch (err) {
    ElMessage.error('操作失败，请稍后重试: ' + (err.response?.data?.detail || err.message));
  } finally {
    isTogglingFavorite.value = false;
  }
};

const handleBuy = () => {
  if (!currentUserId.value) { // 使用 currentUserId.value
    ElMessage.warning('请先登录后再操作');
    router.push('/login');
    return;
  }
  if (!productDetail.value) return;
  // 实际购买逻辑，例如跳转到订单确认页或创建订单
  ElMessageBox.confirm(`确定要购买 "${productDetail.value.name}" 吗?`, '确认购买', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info',
  }).then(() => {
    // 示例：跳转到订单创建，并传递商品ID和数量
    // router.push({ name: 'CreateOrder', query: { productId: productDetail.value.id, quantity: 1 } });
    ElMessage.info('购买功能开发中...');
  }).catch(() => {
    // ElMessage.info('已取消购买');
  });
};

const handleContactSeller = () => {
  if (!currentUserId.value) { // 使用 currentUserId.value
    ElMessage.warning('请先登录后再操作');
    router.push('/login');
    return;
  }
  if (!productDetail.value || !productDetail.value?.user || !productDetail.value.user?.id) { // 使用可选链操作符安全访问 user 和 user.id
      ElMessage.error('无法获取卖家信息');
      return;
  }
  // 跳转到聊天页面，并带上卖家ID
  // router.push({ name: 'ChatRoom', params: { userId: productDetail.value.user.id } });
  ElMessage.info('联系卖家功能开发中，目标用户ID: ' + productDetail.value.user?.id);
};

const closeDialog = () => {
  emit('update:dialogVisible', false);
  emit('close');
  productDetail.value = null; // 清空详情，以便下次打开重新加载
  // router.push('/products'); // 或者根据实际情况决定关闭后的导航
};

// Helper to get category name (可以移到 utils)
const getCategoryName = (categoryKey) => {
  const map = {
    'electronics': '电子产品',
    'books': '书籍文具',
    'daily': '生活用品',
    'clothing': '服装配饰',
    'others': '其他'
  };
  return map[categoryKey] || categoryKey || '未知分类';
};

// Watch for productId changes to reload data if the dialog is reused for different products
watch(() => props.productId, (newId) => {
  if (newId && props.dialogVisible) {
    fetchProductDetail(newId);
  }
});

// Fetch data when dialog becomes visible and productId is set
watch(() => props.dialogVisible, (isVisible) => {
  if (isVisible && props.productId) {
    fetchProductDetail(props.productId);
  }
});

// Initial fetch if dialog is meant to be visible брак and productId is available
onMounted(() => {
  if (props.dialogVisible && props.productId) {
    fetchProductDetail(props.productId);
  }
});

const canBuy = computed(() => {
  return productDetail.value && 
         productDetail.value.quantity > 0 && 
         productDetail.value.status === 'Active' &&
         (!productDetail.value?.user || currentUserId.value === productDetail.value?.user?.id); // 确保所有对 user 的访问都安全
});

// 新增计算属性，用于收藏按钮的禁用逻辑
const isFavoriteButtonDisabled = computed(() => {
  if (!productDetail.value) return true; // 如果商品详情为空，则禁用
  if (!currentUserId.value) return true; // 如果当前用户未登录，则禁用
  return (productDetail.value.user?.id && currentUserId.value === productDetail.value.user.id) || isTogglingFavorite.value; // 不能收藏自己的商品，或正在收藏中
});

// 新增计算属性，用于联系卖家按钮的禁用逻辑
const isContactSellerDisabled = computed(() => {
  if (!productDetail.value) return true; // 如果商品详情为空，则禁用
  if (!currentUserId.value) return true; // 如果当前用户未登录，则禁用
  return !productDetail.value.user?.id || currentUserId.value === productDetail.value.user.id; // 不能联系自己，或卖家信息缺失
});

</script>

<template>
  <el-dialog
    :model-value="dialogVisible"
    title="商品详情"
    width="70%"
    :before-close="closeDialog"
    @update:model-value="$emit('update:dialogVisible', $event)"
    top="5vh"
    class="product-detail-dialog-component"
  >
    <div v-loading="isLoading" element-loading-text="加载中..." class="dialog-content-wrapper">
      <div v-if="error" class="error-state">
        <el-empty description="加载商品详情失败，请稍后重试"/>
      </div>
      <div v-else-if="productDetail" class="product-content-grid">
        <!-- 左侧：图片轮播 -->
        <div class="product-images-section">
          <el-carousel v-if="productDetail.images && productDetail.images.length > 0" indicator-position="outside" height="400px">
            <el-carousel-item v-for="(image, index) in productDetail.images" :key="index">
              <el-image :src="image" alt="商品图片" fit="contain" style="width: 100%; height: 100%;"/>
            </el-carousel-item>
          </el-carousel>
          <el-empty v-else description="暂无图片" class="no-image-placeholder"/>
        </div>

        <!-- 右侧：详细信息 -->
        <div class="product-info-section">
          <h2 class="product-name">{{ productDetail.name }}</h2>
          <p class="product-description">{{ productDetail.description }}</p>
          
          <div class="product-meta-grid">
            <div class="meta-item">
              <span class="meta-label">价格:</span>
              <span class="meta-value price">¥{{ productDetail.price?.toFixed(2) }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">库存:</span>
              <span class="meta-value">{{ productDetail.quantity }} 件</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">分类:</span>
              <span class="meta-value">{{ getCategoryName(productDetail.category) }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">成色:</span>
              <span class="meta-value">{{ productDetail.condition }}</span>
            </div>
             <div class="meta-item">
              <span class="meta-label">状态:</span>
              <el-tag :type="productDetail.status === 'Active' ? 'success' : (productDetail.status === 'Sold' ? 'info' : 'warning')" size="small">
                {{ productDetail.status === 'PendingReview' ? '待审核' : productDetail.status === 'Active' ? '在售' : productDetail.status === 'Withdrawn' ? '已下架' : productDetail.status === 'Sold' ? '已售罄' : productDetail.status === 'Rejected' ? '已拒绝' : '未知' }}
              </el-tag>
            </div>
            <div class="meta-item full-width">
              <span class="meta-label">发布时间:</span>
              <span class="meta-value">{{ new Date(productDetail.postTime).toLocaleString() }}</span>
            </div>
          </div>

          <el-divider />

          <div class="publisher-info">
            <h4>卖家信息</h4>
            <div class="meta-item">
                <span class="meta-label">卖家:</span>
                <span class="meta-value">{{ productDetail.user?.username || '未知用户' }}</span>
            </div>
            <!-- <p>联系方式: {{ productDetail.user?.phone_number || '未提供' }}</p> -->
          </div>

          <el-divider />

          <div class="action-buttons">
            <el-button 
                :type="isFavorite ? 'warning' : 'default'" 
                @click="toggleFavorite" 
                :icon="isFavorite ? 'StarFilled' : 'Star'"
                plain
                :loading="isTogglingFavorite"
                :disabled="isFavoriteButtonDisabled"
            >
              {{ isFavorite ? '已收藏' : '收藏' }}
            </el-button>
            <el-button 
                type="primary" 
                @click="handleBuy" 
                :disabled="!canBuy"
                icon="ShoppingCart"
            >
              立即购买
            </el-button>
            <el-button 
                @click="handleContactSeller" 
                icon="ChatDotRound"
                :disabled="isContactSellerDisabled"
            >
              联系卖家
            </el-button>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">
        <el-empty description="暂无商品详情信息"/>
      </div>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="closeDialog">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.product-detail-dialog-component .el-dialog__body {
  padding-top: 10px;
  padding-bottom: 10px;
}

.dialog-content-wrapper {
  min-height: 300px; /* Prevents excessive shrinking when loading */
}

.product-content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr; /* Two equal columns */
  gap: 24px;
}

.product-images-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 16px;
  min-height: 400px;
}

.product-images-section .el-carousel {
  width: 100%;
}

.no-image-placeholder .el-empty__description {
  margin-top: 8px;
}

.product-info-section {
  padding: 8px;
  display: flex;
  flex-direction: column;
}

.product-name {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 12px;
  color: #303133;
}

.product-description {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  margin-bottom: 16px;
  max-height: 100px; /* Limit description height */
  overflow-y: auto; /* Add scroll for long descriptions */
}

.product-meta-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.meta-item.full-width {
  grid-column: 1 / -1; /* Span full width if needed */
}

.meta-label {
  color: #909399;
  margin-right: 8px;
  min-width: 60px; /* Ensure labels align nicely */
}

.meta-value {
  color: #303133;
  font-weight: 500;
}

.meta-value.price {
  color: #F56C6C;
  font-size: 18px;
  font-weight: bold;
}

.publisher-info h4 {
  font-size: 16px;
  margin-bottom: 10px;
  color: #303133;
}

.action-buttons {
  margin-top: 24px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap; /* Allow buttons to wrap on smaller screens */
}

.action-buttons .el-button {
  flex-grow: 1; /* Allow buttons to grow and fill space if needed */
}

.error-state, .empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.dialog-footer {
  text-align: right;
}
</style>