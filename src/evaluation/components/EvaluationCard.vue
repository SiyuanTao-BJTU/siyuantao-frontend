<script setup>
import { defineProps, defineEmits, computed } from 'vue';
// 如果需要处理图片URL，可以导入FormatObject
// import FormatObject from '@/utils/format.js'; 

const props = defineProps({
  evaluation: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['view-details']);

const handleViewDetails = () => {
  emit('view-details', props.evaluation);
};

const formatTime = (isoString) => {
    if (!isoString) return 'N/A';
    try {
        return new Date(isoString).toLocaleString();
    } catch (e) {
        console.error('Error formatting date:', e);
        return isoString; // Fallback to original string if error
    }
};

// 假设商品图片可以从评价数据中获取，或者通过商品ID查询。这里简单地留空。
const productImage = computed(() => {
    // if (props.evaluation.商品主图URL) {
    //     return FormatObject.formattedImgUrl(props.evaluation.商品主图URL);
    // }
    return ''; // 默认无图
});
</script>

<template>
  <el-card class="evaluation-card" shadow="hover">
    <div class="evaluation-content">
      <div class="product-info-section">
        <img v-if="productImage" :src="productImage" class="product-image" :alt="evaluation.商品名称" />
        <div v-else class="product-image-placeholder">商品图片</div>
        <div class="product-details">
          <h3 class="product-name" :title="evaluation.商品名称">{{ evaluation.商品名称 || '未知商品' }}</h3>
          <p class="order-id">订单ID: {{ evaluation.订单ID }}</p>
        </div>
      </div>
      <el-divider class="card-divider"/>
      <div class="evaluation-details">
        <div class="detail-row">
          <span class="label">买家:</span>
          <span class="value">{{ evaluation.买家用户名 }}</span>
        </div>
        <div class="detail-row">
          <span class="label">卖家:</span>
          <span class="value">{{ evaluation.卖家用户名 }}</span>
        </div>
        <div class="detail-row">
          <span class="label">评分:</span>
          <el-rate v-model="evaluation.评分" disabled show-score text-color="#ff9900" class="rating-display"/>
        </div>
        <div class="detail-row comment-row">
          <span class="label">内容:</span>
          <p class="value comment-text">{{ evaluation.评价内容 || '无' }}</p>
        </div>
        <div class="detail-row">
          <span class="label">时间:</span>
          <span class="value">{{ formatTime(evaluation.创建时间) }}</span>
        </div>
      </div>
    </div>
    <template #footer>
      <div class="card-footer">
        <el-button type="primary" size="small" @click="handleViewDetails">查看详情</el-button>
      </div>
    </template>
  </el-card>
</template>

<style scoped>
.evaluation-card {
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

.evaluation-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.evaluation-content {
  padding: 15px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.product-info-section {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.product-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 15px;
  flex-shrink: 0;
}

.product-image-placeholder {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
  color: #999;
  border-radius: 4px;
  margin-right: 15px;
  flex-shrink: 0;
  font-size: 12px;
}

.product-details {
  flex-grow: 1;
  overflow: hidden;
}

.product-name {
  font-size: 16px;
  font-weight: bold;
  margin: 0 0 5px 0;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.order-id {
    font-size: 12px;
    color: #909399;
    margin: 0;
}

.card-divider {
    margin: 10px 0;
}

.evaluation-details {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  font-size: 14px;
}

.detail-row {
  display: flex;
  margin-bottom: 8px;
  align-items: flex-start; /* Align label and value at the top for multi-line content */
}

.label {
  color: #909399;
  margin-right: 8px;
  min-width: 40px; /* Adjust as needed for label alignment */
}

.value {
  color: #303133;
  font-weight: 500;
  flex-grow: 1;
}

.comment-row .value {
  white-space: pre-wrap; /* Preserve whitespace and allow line breaks */
  word-break: break-word; /* Break long words */
}

.comment-text {
    max-height: 60px; /* Limit comment height */
    overflow-y: auto; /* Add scroll for long comments */
}

.rating-display {
    display: inline-flex; /* Keep el-rate inline */
    vertical-align: middle;
}

.card-footer {
  text-align: right;
  padding-top: 10px;
  border-top: 1px solid #ebeef5; /* Add a border to separate from content */
}
</style> 