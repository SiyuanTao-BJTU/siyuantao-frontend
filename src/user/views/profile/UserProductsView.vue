<script setup>
import { onMounted, ref, computed } from 'vue';
import { ElMessage, ElEmpty, ElCard, ElButton, ElLoading } from 'element-plus';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

import PurchaseGoodsCard from '@/product/components/PurchaseGoodsCard.vue';
import api from '@/API_PRO.js'; // 导入 API

const router = useRouter();
const store = useStore();

const userProducts = ref([]); // Array to hold user's published products
const isLoading = ref(false); // Loading state

// 获取当前登录用户的 user_id
const currentUserId = computed(() => store.getters['user/getUserInfo']?.user_id);

// 获取用户发布的商品
const fetchUserProducts = async () => {
  if (!currentUserId.value) {
    ElMessage.warning('请先登录以查看您的发布。');
    // 可以选择重定向到登录页
    // router.push('/login');
    return;
  }

  isLoading.value = true;
  try {
    // 假设 getProductList API 支持通过 seller_id 过滤
    const response = await api.getProductList({ seller_id: currentUserId.value });
    
    // 检查 response 是否有 'data' 字段，或者直接是商品列表
    if (response && Array.isArray(response.data)) {
      userProducts.value = response.data;
      ElMessage.success('成功获取您的发布商品列表');
    } else if (response && Array.isArray(response)) { // 如果 API 直接返回数组
      userProducts.value = response;
      ElMessage.success('成功获取您的发布商品列表');
    } else {
      console.warn('Fetch user products API response format incorrect:', response);
      userProducts.value = [];
      ElMessage.error('获取发布列表失败：数据格式不正确');
    }

  } catch (error) {
    console.error('Fetch user products failed:', error);
    userProducts.value = [];
    ElMessage.error('获取您的发布商品列表失败');
  } finally {
    isLoading.value = false;
  }
};

// 处理商品下架
const handleWithdrawProduct = async (productId) => {
  console.log('Withdraw product:', productId);
  try {
    await api.withdrawProduct(productId);
    ElMessage.success('商品已成功下架');
    fetchUserProducts(); // Refresh list after withdrawal
  } catch (error) {
    console.error('Withdraw product failed:', error);
    ElMessage.error('下架商品失败');
  }
};

// 处理编辑商品 (跳转到发布商品页面，并带上商品ID进行编辑)
const handleEditProduct = (productId) => {
  router.push({ name: 'publish', query: { productId: productId } });
};


onMounted(() => {
  fetchUserProducts(); // Fetch products when the component is mounted
});

</script>

<template>
  <div class="basic-container">
    <div class="center-container">
      <el-card class="user-products-card">
        <h2>我的发布</h2>

        <div v-loading="isLoading" class="product-list-wrapper">
          <div v-if="userProducts.length === 0 && !isLoading" class="empty-state">
            <el-empty description="暂无已发布商品"/>
            <el-button type="primary" @click="router.push('/publish')">去发布商品</el-button>
          </div>

          <div v-else class="products-grid">
            <el-card
              v-for="product in userProducts"
              :key="product.product_id"
              class="product-item"
              shadow="hover"
            >
              <PurchaseGoodsCard
                :img="product.image_urls"
                :itemName="product.product_name"
                :price="product.price"
                :description="product.description"
                :itemID="product.product_id"
              />
              <div class="product-actions">
                <el-button size="small" @click="handleEditProduct(product.product_id)">编辑</el-button>
                <el-button size="small" type="danger" @click="handleWithdrawProduct(product.product_id)">下架</el-button>
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
  align-items: flex-start;
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 50px 20px;
  box-sizing: border-box;
}

.center-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 1000px;
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  padding: 30px;
  box-sizing: border-box;
}

.user-products-card {
    width: 100%;
    border: none;
    box-shadow: none;
}

.user-products-card h2 {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 20px;
  text-align: center;
}

.product-list-wrapper {
    width: 100%;
}

.empty-state {
    text-align: center;
    padding: 50px 0;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.product-item {
  border-radius: 8px;
  overflow: hidden;
  background-color: #ffffff;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: none;
}

.product-item:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

/* Adjustments for the PurchaseGoodsCard content inside the card */
.product-item :deep(.purchase-goods-card-container) {
    padding: 15px;
    box-shadow: none;
    border: none;
}

.product-actions {
  display: flex;
  justify-content: flex-end;
  padding: 0 15px 15px 15px;
  gap: 10px;
   border-top: 1px solid #ebeef5;
   margin-top: -1px;
   padding-top: 15px;
}

.product-item .el-card__body {
    padding: 0;
}
</style> 