<script setup>
import { onMounted, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRouter } from 'vue-router';

// Assuming api.js exists and has getUserFavorites and removeFavorite methods
import api from '@/API_PRO.js';
import FormatObject from '@/utils/format.js'; // 确保 FormatObject 已导入

// Assuming PurchaseGoodsCard or a similar component exists for displaying products
// import PurchaseGoodsCard from '@/product/components/PurchaseGoodsCard.vue'; 
import ProductCard from '@/product/components/ProductCard.vue'; // 导入 ProductCard
import ProductDetail from '@/product/components/ProductDetail.vue'; // 导入 ProductDetail 组件

const router = useRouter();

const userFavorites = ref([]); // Array to hold user's favorite products
const isLoading = ref(false); // Loading state

// ProductDetail 对话框相关
const selectedProductIdForDetail = ref(null);
const isProductDetailDialogVisible = ref(false);

// Fetch user's favorite products
const fetchUserFavorites = async () => {
  isLoading.value = true;
  try {
    const response = await api.getUserFavorites(); 
    if (response && Array.isArray(response)) { 
      userFavorites.value = response.map(fav => ({
        id: fav.商品ID, 
        // 将API返回的商品数据直接作为 product 对象，让 ProductCard 自己处理
        product: {
            id: fav.商品ID,
            name: fav.商品名称,
            description: fav.商品描述,
            price: parseFloat(fav.价格), // 确保价格是数字
            images: fav.主图URL ? (Array.isArray(fav.主图URL) ? fav.主图URL : [fav.主图URL.startsWith('http') || fav.主图URL.startsWith('//') ? fav.主图URL : FormatObject.formattedImgUrl(fav.主图URL)]) : [],
            // 根据 ProductCard 的 props，可以添加其他字段，例如 category, status, user
            category: fav.商品类别,
            status: fav.商品状态,
            user: { username: fav.发布者用户名 }
        }
      }));
    } else {
      ElMessage.error('获取收藏列表失败或数据格式不正确');
      userFavorites.value = [];
    }
  } catch (error) {
    console.error('Fetch user favorites failed:', error);
    ElMessage.error('获取收藏列表失败: ' + (error.response?.data?.detail || error.message));
    userFavorites.value = [];
  } finally {
    isLoading.value = false;
  }
};

// Handle remove favorite button click
const handleRemoveFavorite = async (productIdToRemove) => { 
  try {
    await ElMessageBox.confirm('确定要从收藏中移除该商品吗？', '确认移除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    await api.removeFavorite(productIdToRemove); 
    ElMessage.success('已成功从收藏中移除');
    fetchUserFavorites(); 
  } catch (error) {
    if (error !== 'cancel') { 
      console.error('Remove favorite failed:', error);
      ElMessage.error('移除收藏失败: ' + (error.response?.data?.detail || error.message));
    }
  }
};

// 打开商品详情对话框
const viewProductDetail = (productId) => {
  selectedProductIdForDetail.value = productId;
  isProductDetailDialogVisible.value = true;
};

onMounted(() => {
  fetchUserFavorites(); 
});

</script>

<template>
  <div class="basic-container">
    <div class="center-container">
      <el-card class="favorites-card">
        <h2>我的收藏</h2>

        <div v-loading="isLoading" class="favorite-list">
          <div v-if="userFavorites.length === 0 && !isLoading" class="empty-state">
            <el-empty description="暂无收藏商品"/>
            <el-button type="primary" @click="router.push('/home')">去首页逛逛</el-button>
          </div>

          <div v-else class="favorite-grid">
            <el-card
              v-for="favorite in userFavorites"
              :key="favorite.id"
              class="favorite-item"
              shadow="hover"
            >
              <div @click.stop="viewProductDetail(favorite.product.id)" class="product-card-wrapper">
                 <ProductCard
                   :product="favorite.product" 
                 />
              </div>
               <div class="favorite-actions">
                 <el-button size="small" type="danger" @click.stop="handleRemoveFavorite(favorite.id)">移除</el-button> 
                 <!-- 使用 .stop 防止点击移除按钮时触发父级 el-card 的 click 事件 -->
               </div>
            </el-card>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 商品详情对话框 -->
    <ProductDetail
      v-if="selectedProductIdForDetail"
      :product-id="selectedProductIdForDetail"
      :dialog-visible="isProductDetailDialogVisible"
      @update:dialogVisible="isProductDetailDialogVisible = $event"
      @close="selectedProductIdForDetail = null"
    />
  </div>
</template>

<style scoped>
.basic-container {
  display: flex;
  justify-content: center;
  align-items: flex-start; /* Align to top */
  min-height: 100vh; /* Ensure container takes at least full viewport height */
  /* background-color: #CAD9F1; Light blue background */
  background-color: #f5f7fa; /* 使用一个更中性的浅灰色背景 */
  padding: 50px 20px; /* Add padding top and bottom */
  box-sizing: border-box;
}

.center-container{
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 1000px; /* Adjust width for the products list */
  background-color: #ffffff; /* White background */
  border-radius: 10px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1); /* Stronger shadow for the main block */
  padding: 30px; /* Adjust padding */
  box-sizing: border-box;
}

.favorites-card {
    width: 100%;
    border: none; /* Remove default card border */
    box-shadow: none; /* Remove default card shadow */
}

.favorites-card h2 {
  font-size: 24px;
  font-weight: bold;
  color: #303133; /* Dark text */
  margin-bottom: 20px;
  text-align: center;
}

.favorite-list {
    width: 100%;
}

.empty-state {
    text-align: center;
    padding: 50px 0;
}

.favorite-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); /* Adjust grid item size */
  gap: 20px; /* Adjust space between cards */
}

.favorite-item {
  border-radius: 8px;
  overflow: hidden; /* Hide anything outside the card */
  background-color: #ffffff; /* White background for item card */
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.08); /* Soft shadow */
  transition: transform 0.3s ease, box-shadow 0.3s ease; /* Add transition */
  border: none; /* Remove default border */
}

.favorite-item:hover {
    transform: translateY(-5px); /* Lift card on hover */
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12); /* Enhanced shadow on hover */
}

/* Adjustments for the PurchaseGoodsCard content inside the card */
.favorite-item :deep(.purchase-goods-card-container) {
    padding: 15px; /* Add padding inside the card */
    box-shadow: none; /* Remove shadow from inner component */
    border: none; /* Remove border from inner component */
}

/* Style adjustments for elements within PurchaseGoodsCard if necessary */
.favorite-item :deep(.item-name) {
    font-size: 16px; /* Adjust item name font size */
    font-weight: bold; /* Bold */
    color: #303133; /* Dark text */
}

.favorite-item :deep(.item-price) {
    font-size: 15px; /* Adjust price font size */
    font-weight: bold; /* Bold */
    color: #ff4f24; /* Orange price color */
}

.favorite-item :deep(.item-description) {
    font-size: 13px; /* Adjust description font size */
    color: #606266; /* Medium grey text */
}

.favorite-actions {
  display: flex;
  justify-content: flex-end; /* Align buttons to the right */
  padding: 0 15px 15px 15px; /* Add padding around action buttons */
  gap: 10px; /* Space between buttons */
   border-top: 1px solid #ebeef5; /* Add separator above actions */
   margin-top: -1px; /* Adjust margin to align with border */
   padding-top: 15px; /* Add padding above actions */
}

.favorite-item .el-card__body {
    padding: 0; /* Remove default padding */
    display: flex; /* Enable flex for vertical layout */
    flex-direction: column; /* Stack card content and actions vertically */
    height: 100%; /* Ensure the card body takes full height of the item */
}

/* New style for the wrapper around ProductCard to handle click and fill space */
.product-card-wrapper {
    flex-grow: 1; /* Allow ProductCard to take available space */
    cursor: pointer;
}

/* Ensure ProductCard itself takes full height if needed */
.favorite-item :deep(.product-card-container) {
    height: 100%; 
    display: flex;
    flex-direction: column;
}

</style>
 