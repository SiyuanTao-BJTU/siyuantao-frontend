<script setup>
import { defineProps } from 'vue';
import FormatObject from '@/utils/format.js';

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
});

const formatImgUrl = (img) => {
  return FormatObject.formattedImgUrl(img);
};
</script>

<template>
  <el-card class="product-card" shadow="hover">
    <div class="product-content">
      <img :src="formatImgUrl(product.img[0])" class="product-image" :alt="product.name" />
      <div class="product-details">
        <h3 class="product-title">{{ product.name }}</h3>
        <p class="product-description">{{ product.description }}</p>
        <p class="product-price">￥{{ product.price }}</p>
        <div class="product-meta">
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
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.product-content {
  display: flex;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 15px;
}

.product-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 15px;
  flex-shrink: 0;
}

.product-details {
  flex-grow: 1;
  overflow: hidden;
}

.product-title {
  font-size: 18px;
  font-weight: bold;
  margin: 0 0 5px 0;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-description {
  font-size: 14px;
  color: #606266;
  margin-bottom: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-price {
  font-size: 16px;
  font-weight: bold;
  color: #ff4f24;
  margin-bottom: 5px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
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