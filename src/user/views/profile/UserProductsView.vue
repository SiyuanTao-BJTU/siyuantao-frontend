<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import api from '@/API_PRO.js';

const router = useRouter();

const userProducts = ref([]);
const isLoading = ref(false);

const fetchUserProducts = async () => {
  isLoading.value = true;
  try {
    const response = await api.getUserProducts();
    if (response?.data && response.code === 0) {
      userProducts.value = response.data;
    } else {
      console.warn('Fetch user products API response format incorrect or code not 0:', response);
      ElMessage.error('获取商品列表失败，API响应格式错误');
      userProducts.value = [];
    }
  } catch (error) {
    console.error('Fetch user products failed:', error);
    ElMessage.error('获取商品列表失败');
    userProducts.value = [];
  } finally {
    isLoading.value = false;
  }
};

const handleEditProduct = (productId) => {
  router.push(`/product/edit/${productId}`);
};

const handleDeleteProduct = async (productId) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除此商品吗？',
      '删除商品',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    const response = await api.deleteProduct(productId);
    if (response?.code === 0) {
      ElMessage.success('商品删除成功');
      fetchUserProducts();
    } else {
      ElMessage.error('商品删除失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Delete product failed:', error);
      ElMessage.error('商品删除失败');
    }
  }
};

const handleToggleStatus = async (product) => {
  try {
    const newStatus = product.status === 'published' ? 'draft' : 'published';
    
    let newStatusText = '';
    if (newStatus === 'published') newStatusText = '上架';
    else if (newStatus === 'draft') newStatusText = '下架';

    await ElMessageBox.confirm(
      `确定要将商品状态更改为 ${newStatusText} 吗？`,
      '更改商品状态',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );

    // Dummy success for now
    ElMessage.success(`商品状态更新成功为 ${newStatusText}`);
    product.status = newStatus;

  } catch (error) {
    if (error !== 'cancel') {
      console.error('Update product status failed:', error);
      ElMessage.error('商品状态更新失败');
    }
  }
};

const getStatusText = (status) => {
  if (status === 'published') return '上架';
  if (status === 'draft') return '下架';
  return status; // Fallback
};

onMounted(() => {
  fetchUserProducts();
});
</script>

<template>
  <div class="basic-container">
    <div class="center-container">
      <el-card class="products-card">
        <h2>我的发布</h2>

        <div v-loading="isLoading" class="product-list">
          <div v-if="userProducts.length === 0 && !isLoading" class="empty-state">
            <el-empty description="暂无发布的商品"/>
            <el-button type="primary" @click="router.push('/publish')">
              去发布商品
            </el-button>
          </div>

          <div v-else class="product-grid">
            <el-card
              v-for="product in userProducts"
              :key="product.id"
              class="product-item"
              shadow="hover"
            >
              <div class="product-content">
                <img :src="product.imageUrl" class="product-image" :alt="product.name"/>
                <div class="product-details">
                  <h3>{{ product.name }}</h3>
                  <p class="product-description">{{ product.description }}</p>
                  <p class="product-price">￥{{ product.price }}</p>
                  <p class="product-status">
                    状态: {{ getStatusText(product.status) }}
                  </p>
                </div>
              </div>
              <div class="product-actions">
                <el-button size="small" @click="handleEditProduct(product.id)">
                  编辑
                </el-button>
                <el-button size="small" type="danger" @click="handleDeleteProduct(product.id)">
                  删除
                </el-button>
                <el-button 
                  size="small" 
                  :type="product.status === 'published' ? 'warning' : 'success'"
                  @click="handleToggleStatus(product)"
                >
                  {{ product.status === 'published' ? '下架' : '上架' }}
                </el-button>
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
  background-color: #CAD9F1; /* Light blue background */
  padding: 50px 20px; /* Add padding top and bottom */
  box-sizing: border-box;
}

.center-container {
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

.products-card {
  width: 100%;
  border: none; /* Remove default card border */
  box-shadow: none; /* Remove default card shadow */
}

.products-card h2 {
  font-size: 24px;
  font-weight: bold;
  color: #303133; /* Dark text */
  margin-bottom: 20px;
  text-align: center;
}

.product-list {
  width: 100%;
}

.empty-state {
  text-align: center;
  padding: 50px 0;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); /* Adjust grid item size */
  gap: 20px; /* Adjust space between items */
}

.product-item {
  border-radius: 8px;
  overflow: hidden; /* Hide anything outside the card */
  background-color: #ffffff; /* White background for item card */
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.08); /* Soft shadow */
  transition: transform 0.3s ease, box-shadow 0.3s ease; /* Add transition */
  border: none; /* Remove default border */
}

.product-item:hover {
    transform: translateY(-5px); /* Lift card on hover */
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12); /* Enhanced shadow on hover */
}

.product-content {
  display: flex;
  align-items: center; /* Vertically align items */
  padding: 15px; /* Add padding inside the content area */
  border-bottom: 1px solid #ebeef5; /* Add a subtle separator */
  margin-bottom: 15px; /* Space below content before actions */
}

.product-image {
  width: 100px; /* Fixed image width */
  height: 100px; /* Fixed image height */
  object-fit: cover; /* Ensure image covers area */
  border-radius: 4px; /* Rounded corners for image */
  margin-right: 15px; /* Space between image and details */
  flex-shrink: 0; /* Prevent image from shrinking */
}

.product-details {
  flex-grow: 1; /* Details take remaining space */
  overflow: hidden; /* Hide overflow text */
}

.product-details h3 {
  font-size: 18px; /* Adjust font size */
  font-weight: bold; /* Bold font */
  margin: 0 0 5px 0; /* Adjust margin */
  color: #303133; /* Dark text */
  overflow: hidden; /* Hide overflow text */
  text-overflow: ellipsis; /* Add ellipsis */
  white-space: nowrap; /* Prevent wrapping */
}

.product-description {
  font-size: 14px; /* Adjust font size */
  color: #606266; /* Medium grey text */
  margin-bottom: 5px; /* Space below description */
  overflow: hidden; /* Hide overflow text */
  text-overflow: ellipsis; /* Add ellipsis */
  white-space: nowrap; /* Prevent wrapping */
}

.product-price {
  font-size: 16px; /* Adjust font size */
  font-weight: bold; /* Bold font */
  color: #ff4f24; /* Orange price color */
  margin-bottom: 5px; /* Space below price */
}

.product-status {
  font-size: 14px; /* Adjust font size */
  color: #909399; /* Light grey text */
}

.product-actions {
  display: flex;
  justify-content: flex-end; /* Align buttons to the right */
  padding: 0 15px 15px 15px; /* Add padding around action buttons */
  gap: 10px; /* Space between buttons */
}

/* Adjust default padding of el-card body for product-item */
.product-item :deep(.el-card__body) {
    padding: 0; /* Remove default padding */
}

</style>