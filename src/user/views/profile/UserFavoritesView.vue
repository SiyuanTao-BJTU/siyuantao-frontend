<script setup>
import { onMounted, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';

// Assuming api.js exists and has getUserFavorites and removeFavorite methods
// import api from '@/API_PRO.js';

// Assuming PurchaseGoodsCard or a similar component exists for displaying products
import PurchaseGoodsCard from '@/product/components/PurchaseGoodsCard.vue'; 

const router = useRouter();

const userFavorites = ref([]); // Array to hold user's favorite products
const isLoading = ref(false); // Loading state

// Fetch user's favorite products
const fetchUserFavorites = async () => {
  isLoading.value = true;
  try {
    // TODO: Call API to fetch user's favorites
    // const response = await api.getUserFavorites();
    // if (response && response.data && response.code === 0) {
    //   userFavorites.value = response.data;
    // } else {
    //   console.warn('Fetch user favorites API response format incorrect or code not 0:', response);
    //   ElMessage.error(t('userFavorites.fetch_failed_format')); // Add to i18n
    //   userFavorites.value = [];
    // }

    // Dummy data for UI testing
    userFavorites.value = [
      { id: 'fav1', product: { id: 'prod1', name: "示例商品 1", description: "这是一个示例商品描述", price: 120, img: ['https://via.placeholder.com/150?text=Fav+Item+1'] } },
      { id: 'fav2', product: { id: 'prod2', name: "示例商品 2", description: "这是另一个示例商品描述", price: 300, img: ['https://via.placeholder.com/150?text=Fav+Item+2'] } },
    ];

  } catch (error) {
    console.error('Fetch user favorites failed:', error);
    ElMessage.error('获取收藏列表失败'); // Add to i18n
    userFavorites.value = [];
  } finally {
    isLoading.value = false;
  }
};

// Handle remove favorite button click
const handleRemoveFavorite = async (favoriteId) => {
  console.log('Remove favorite:', favoriteId);
  // TODO: Implement confirmation dialog if needed
  // try {
  //   // const response = await api.removeFavorite(favoriteId);
  //   // if (response && response.code === 0) {
  //   //   ElMessage.success(t('userFavorites.remove_success')); // Add to i18n
  //   //   fetchUserFavorites(); // Refresh list
  //   // } else {
  //   //   ElMessage.error(t('userFavorites.remove_failed')); // Add to i18n
  //   // }

  // Dummy remove logic
   ElMessage.success(`移除收藏项 ${favoriteId} 成功`); // Dummy success
   userFavorites.value = userFavorites.value.filter(fav => fav.id !== favoriteId); // Remove from dummy list

  // } catch (error) {
  //   console.error('Remove favorite failed:', error);
  //   ElMessage.error('移除收藏失败'); // Add to i18n
  // }
};

onMounted(() => {
  fetchUserFavorites(); // Fetch favorites when the component is mounted
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
            <!-- TODO: Add a button to go to home page to browse products -->
             <el-button type="primary" @click="router.push('/home')">去首页逛逛</el-button> <!-- Add to i18n -->
          </div>

          <div v-else class="favorite-grid">
            <!-- Loop through userFavorites and display each product -->
            <el-card
              v-for="favorite in userFavorites"
              :key="favorite.id"
              class="favorite-item"
              shadow="hover"
            >
              <!-- Assuming favorite.product contains the product details -->
               <PurchaseGoodsCard
                 :img="favorite.product.img"
                 :itemName="favorite.product.name"
                 :price="favorite.product.price"
                 :description="favorite.product.description"
                 :itemID="favorite.product.id"
               />
               <div class="favorite-actions">
                 <el-button size="small" type="danger" @click="handleRemoveFavorite(favorite.id)">移除</el-button>
               </div>
            </el-card>
          </div>
        </div>
      </el-card>
    </div>
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
}

</style>
 