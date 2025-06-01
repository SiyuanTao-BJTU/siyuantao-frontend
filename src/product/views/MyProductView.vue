<script setup>
import {ref, onMounted, computed} from 'vue';
import router from "@/router/index.js";
import api from '@/API_PRO.js';
import {ElMessage} from "element-plus";
import {RefreshRight, Plus, Edit, Delete} from "@element-plus/icons-vue";
import ProductPostDialog from "@/product/components/ProductPostDialog.vue";
import ItemInfoBlock from "@/product/components/ItemInfoBlock.vue";
import FormatObject from "@/utils/format.js";

// 组件基本变量定义
let isItemSelected = ref(false);
let selectedItemId = ref("");
let isProductPostDialogVisible = ref(false);
let currentEditProductId = ref(null);
let username = ref(localStorage.getItem('username'));
let avatar_char = computed(() => localStorage.getItem("username").slice(0, 2).toUpperCase());
let itemList = ref([]);
let componentKey = ref(0);
let loading = ref(false);

// 组件基本函数定义
const handleOtherAvatarClick = (username) => {
  router.push(`/profile/${username}`)
}

const openSellComponent = (item) => {
  isItemSelected.value = true;
  selectedItemId.value = item.id;
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
    ElMessage.error('未找到用户ID');
    itemList.value = [];
    loading.value = false;
    return;
  }
  api.getProductList({ owner_id: userId })
    .then(data => {
      itemList.value = data.map(item => ({
        ...item,
        status: item.status || (item.is_active ? 'active' : 'inactive'),
        img: Array.isArray(item.img) ? 
          item.img.map(url => (BackendConfig.RESTFUL_API_URL.replace(/\/api\/?$/, '') + (url.startsWith('/') ? url : '/' + url))) : 
          (item.img ? [(BackendConfig.RESTFUL_API_URL.replace(/\/api\/?$/, '') + (item.img.startsWith('/') ? item.img : '/' + item.img))] : []),
      }));
      if (!data || data.length === 0) {
        console.log("当前用户发布的商品列表为空");
      }
    })
    .catch(error => {
      console.error("Fetch item list failure:", error);
      ElMessage.error('获取商品列表失败');
      itemList.value = [];
    })
    .finally(() => {
      loading.value = false;
    });
};

const handleToggleProductStatus = async (item) => {
  const newStatus = item.status === 'active' ? 'inactive' : 'active';
  const actionText = newStatus === 'active' ? '上架' : '下架';
  try {
    await ElMessageBox.confirm(
      `确定要${actionText}此商品吗？`,
      `${actionText}商品`,
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    const response = await api.updateProduct(item.id, { status: newStatus });
    
    if (response?.code === 0) {
      ElMessage.success(`商品已成功${actionText}`);
      item.status = newStatus;
    } else {
      ElMessage.error(`${actionText}商品失败`);
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error(`${actionText}商品失败:`, error);
      ElMessage.error(`${actionText}商品失败`);
    }
  }
};

const handleDeleteProduct = async (productId) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除此商品吗？此操作不可逆！',
      '删除商品',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      }
    );
    const response = await api.deleteProduct(productId);
    if (response?.code === 0) {
      ElMessage.success('商品已成功删除');
      fetchMyProducts();
    } else {
      ElMessage.error('删除商品失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除商品失败:', error);
      ElMessage.error('删除商品失败');
    }
  }
};

const getProductStatusTagType = (status) => {
  switch (status) {
    case 'active': return 'success';
    case 'inactive': return 'info';
    case 'sold': return 'warning';
    default: return 'info';
  }
};

const getProductStatusText = (status) => {
  switch (status) {
    case 'active': return '在售';
    case 'inactive': return '已下架';
    case 'sold': return '已售出';
    default: return '未知状态';
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
        <div v-if="itemList.length === 0" class="empty-products-state">
          <el-empty description="您还没有发布的商品"></el-empty>
          <el-button type="primary" @click="openNewProductDialog">
            去发布商品
          </el-button>
        </div>

        <el-row v-else :gutter="20" class="product-cards-grid">
          <el-col :span="24" :md="12" :lg="8" v-for="item in itemList" :key="item.id">
            <el-card class="product-item-card" shadow="hover">
              <template #header>
                <div class="product-card-header">
                  <img :src="FormatObject.formattedImgUrl(item.img[0])" :alt="item.name" class="product-image" @click="openSellComponent(item)"/>
                </div>
              </template>
              <div class="product-card-body">
                <h3 class="product-title-text" @click="openSellComponent(item)">{{ item.name }}</h3>
                <p class="product-description-text">{{ item.description }}</p>
                <div class="product-meta-info">
                  <span class="product-price-text">￥{{ item.price }}</span>
                  <el-tag :type="getProductStatusTagType(item.status)" size="small" effect="light" class="product-status-tag">
                    {{ getProductStatusText(item.status) }}
                  </el-tag>
                </div>
              </div>
              <div class="product-card-actions">
                <el-button type="primary" :icon="Edit" size="small" @click="openEditProductDialog(item.id)" class="edit-button">
                  编辑
                </el-button>
                <el-button type="danger" :icon="Delete" size="small" @click="handleDeleteProduct(item.id)" class="delete-button">
                  删除
                </el-button>
                <el-switch
                  v-model="item.status"
                  :active-value="'active'"
                  :inactive-value="'inactive'"
                  active-text="上架" inactive-text="下架"
                  @change="handleToggleProductStatus(item)"
                  class="status-toggle-switch"
                />
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <el-drawer
      v-model="isItemSelected"
      :with-header="false"
      direction="rtl"
      size="50%"
      class="item-info-drawer"
      destroy-on-close
    >
      <ItemInfoBlock
        v-if="isItemSelected"
        :itemID="selectedItemId"
        :key="componentKey + 'info'"
        @closeDrawer="isItemSelected = false"
      />
    </el-drawer>

    <ProductPostDialog
      :isDialogVisible="isProductPostDialogVisible"
      :isEditMode="!!currentEditProductId"
      :productId="currentEditProductId"
      @update:isDialogVisible="isProductPostDialogVisible = $event"
      @updateCancel="handleProductPostDialogClose"
      @updateSuccess="handleProductPostDialogSuccess"
      :key="componentKey + 'dialog'"
    />
  </div>
</template>

<style scoped>
.my-products-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: calc(100vh - 60px);
  background-color: #f5f7fa;
  padding: 20px;
  box-sizing: border-box;
}

.product-list-card {
  width: 100%;
  max-width: 1400px;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  border: none;
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 20px;
  margin-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
}

.card-title {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 15px;
}

.publish-button {
  background-color: #4A90E2;
  border-color: #4A90E2;
  color: #fff;
  font-size: 15px;
  padding: 10px 20px;
  border-radius: 8px;
  transition: background-color 0.3s;
}

.publish-button:hover {
  background-color: #357ABD;
  border-color: #357ABD;
}

.refresh-button {
  color: #4A90E2;
  border-color: #4A90E2;
  background-color: transparent;
  transition: color 0.3s, background-color 0.3s;
}

.refresh-button:hover {
  background-color: #E6F2FF;
  color: #357ABD;
}

.product-grid-wrapper {
  min-height: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.empty-products-state {
  width: 100%;
  text-align: center;
  padding: 50px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.product-cards-grid {
  width: 100%;
}

.product-item-card {
  margin-bottom: 20px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);
  border: none;
  transition: transform 0.3s, box-shadow 0.3s;
}

.product-item-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
}

.product-card-header {
  height: 180px;
  overflow: hidden;
  border-bottom: 1px solid #ebeef5;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.product-image:hover {
  transform: scale(1.05);
}

.product-card-body {
  padding: 15px;
}

.product-title-text {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
  margin: 0 0 8px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
}

.product-description-text {
  font-size: 13px;
  color: #909399;
  margin: 0 0 12px 0;
  height: 36px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.product-meta-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.product-price-text {
  font-size: 18px;
  font-weight: bold;
  color: #FF7043;
}

.product-status-tag {
  font-size: 12px;
}

.product-status-tag.active {
  background-color: #e6f7ff;
  color: #1890ff;
  border-color: #91d5ff;
}

.product-status-tag.inactive {
  background-color: #f0f2f5;
  color: #595959;
  border-color: #d9d9d9;
}

.product-status-tag.sold {
  background-color: #f6ffed;
  color: #52c41a;
  border-color: #b7eb8f;
}

.product-card-actions {
  padding: 15px;
  border-top: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.edit-button, .delete-button {
  flex: 1;
  border-radius: 8px;
}

.edit-button {
  border-color: #4A90E2;
  color: #4A90E2;
  background-color: transparent;
}

.edit-button:hover {
  background-color: #E6F2FF;
  border-color: #357ABD;
  color: #357ABD;
}

.delete-button {
  border-color: #F56C6C;
  color: #F56C6C;
  background-color: transparent;
}

.delete-button:hover {
  background-color: #FEF0F0;
  border-color: #F56C6C;
  color: #F56C6C;
}

.status-toggle-switch {
  margin-left: auto;
}

.item-info-drawer :deep(.el-drawer__body) {
  padding: 0;
}

@media (max-width: 768px) {
  .my-products-container {
    padding: 10px;
  }

  .card-title {
    font-size: 20px;
  }

  .header-actions {
    flex-direction: column;
    gap: 10px;
  }

  .publish-button,
  .refresh-button {
    width: 100%;
  }

  .product-item-card {
    margin-bottom: 15px;
  }

  .product-card-actions {
    flex-wrap: wrap;
  }

  .edit-button, .delete-button, .status-toggle-switch {
    flex: none;
    width: 100%;
  }

  .status-toggle-switch {
    margin-left: 0;
  }
}
</style>
