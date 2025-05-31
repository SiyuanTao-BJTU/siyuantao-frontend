<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/API_PRO.js';
import { ElMessage } from 'element-plus';

const route = useRoute();
const router = useRouter();
const productId = route.params.id;
const productDetail = ref(null);
const isLoading = ref(true);
const error = ref(false);
const isFavorite = ref(false);
const canBuy = ref(true); // 根据实际情况判断

const fetchProductDetail = async () => {
  try {
    const response = await api.getProductDetail(productId);
    productDetail.value = response.data;
    // 检查是否已收藏
    const favoritesResponse = await api.getUserFavorites();
    isFavorite.value = favoritesResponse.data.some(favorite => favorite.product.id === productId);
  } catch (err) {
    error.value = true;
    ElMessage.error('加载商品详情失败');
  } finally {
    isLoading.value = false;
  }
};
const toggleFavorite = async () => {
  try {
    await api.toggleFavorite(productId);
    isFavorite.value = !isFavorite.value;
    ElMessage.success(isFavorite.value ? '收藏成功' : '取消收藏成功');
  } catch (err) {
    ElMessage.error('操作失败，请稍后重试');
  }
};

const handleBuy = () => {
  // 跳转到订单确认或聊天页面
  router.push('/order/confirmation');
};

const handleContactSeller = () => {
  // 跳转到聊天页面
  router.push('/chat/room');
};

onMounted(() => {
  fetchProductDetail();
});
</script>

<template>
  <div v-loading="isLoading" element-loading-text="加载中...">
    <div v-if="error" class="error-state">
      <el-empty description="加载商品详情失败，请稍后重试"/>
    </div>
    <div v-else-if="productDetail">
      <!-- 商品图片轮播组件 -->
      <el-carousel indicator-position="outside">
        <el-carousel-item v-for="(image, index) in productDetail.img" :key="index">
          <img :src="image" alt="商品图片">
        </el-carousel-item>
      </el-carousel>
      <!-- 详细商品信息 -->
      <div class="product-info">
        <h2>{{ productDetail.name }}</h2>
        <p>描述: {{ productDetail.description }}</p>
        <p>价格: ￥{{ productDetail.price }}</p>
        <p>数量: {{ productDetail.count }}</p>
        <p>分类: {{ productDetail.category }}</p>
        <p>新旧程度: {{ productDetail.condition }}</p>
      </div>
      <!-- 发布者信息 -->
      <div class="publisher-info">
        <p>发布者: {{ productDetail.user.username }}</p>
        <p>联系方式: {{ productDetail.user.profile.contact }}</p>
      </div>
      <!-- 收藏/取消收藏按钮 -->
      <el-button :type="isFavorite ? 'danger' : 'primary'" @click="toggleFavorite">
        {{ isFavorite ? '取消收藏' : '收藏' }}
      </el-button>
      <!-- 立即购买按钮 -->
      <el-button :disabled="!canBuy" @click="handleBuy">立即购买</el-button>
      <!-- 联系卖家按钮 -->
      <el-button @click="handleContactSeller">联系卖家</el-button>
    </div>
    <div v-else class="empty-state">
      <el-empty description="暂无商品详情信息"/>
    </div>
  </div>
</template>

<style scoped>
/* 样式可根据需求调整 */
.product-info,
.publisher-info {
  margin-top: 20px;
}
</style>