<script setup>
import { defineProps, computed } from 'vue';
import FormatObject from '@/utils/format.js';

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
});

const firstImageUrl = computed(() => {
  if (props.product && props.product.images) {
    if (Array.isArray(props.product.images) && props.product.images.length > 0) {
      return FormatObject.formattedImgUrl(props.product.images[0]);
    } else if (typeof props.product.images === 'string' && props.product.images) {
      return FormatObject.formattedImgUrl(props.product.images);
    }
  }
  return '';
});

const formatImgUrl = (img) => {
  return FormatObject.formattedImgUrl(img);
};
</script>

<template>
  <el-card class="product-card" shadow="hover">
    <div class="product-content">
      <img v-if="firstImageUrl" :src="firstImageUrl" class="product-image" :alt="product.name" />
      <div v-else class="product-image-placeholder">无图</div>
      <div class="product-details">
        <h3 class="product-title" :title="product.name">{{ product.name }}</h3>
        <p class="product-description" :title="product.description">{{ product.description }}</p>
        <p class="product-price">￥{{ product.price }}</p>
        <div class="product-meta" v-if="product.user">
          <div class="user-info">
            <el-avatar :size="32" :src="product.user.avatar">
              {{ product.user.username?.[0] }}
            </el-avatar>
            <div class="user-details">
              <span class="username">{{ product.user.username }}</span>
              <span class="user-credit">信用: {{ product.user.credit }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </el-card>
</template>

<style scoped>
.product-card {
  border-radius: 8px;
  overflow: hidden;
  background-color: #ffffff;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: none;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.product-content {
  display: flex;
  align-items: stretch;
  padding: 15px;
  flex-grow: 1;
}

.product-image {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 15px;
  flex-shrink: 0;
}

.product-image-placeholder {
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
  color: #999;
  border-radius: 4px;
  margin-right: 15px;
  flex-shrink: 0;
}

.product-details {
  flex-grow: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 100px;
}

.product-title {
  font-size: 15px;
  font-weight: bold;
  margin: 0 0 6px 0;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  line-height: 1.4;
  max-height: calc(1.4em * 3);
}

.product-description {
  font-size: 13px;
  color: #606266;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.4;
  max-height: calc(1.4em * 2);
  flex-grow: 1;
}

.product-price {
  font-size: 18px;
  font-weight: bold;
  color: #ff4f24;
  margin-bottom: 10px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: auto;
}

.user-details {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
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
</style>