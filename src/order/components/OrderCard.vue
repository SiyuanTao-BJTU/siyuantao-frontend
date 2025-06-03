<template>
    <el-card class="order-card" shadow="hover" @click="emit('view-detail', order)">
      <div class="card-header">
        <div class="order-info">
          <span class="order-id">订单号: {{ order.订单ID.substring(0, 8) }}...</span>
          <el-tag :type="statusTagType" size="small">{{ displayStatus }}</el-tag>
        </div>
        <div class="product-info">
          <h3 class="product-name">{{ order.商品名称 || '未知商品' }}</h3>
          <p class="quantity">数量: {{ order.数量 }}</p>
        </div>
      </div>
  
      <div class="card-content">
        <div class="trade-details">
          <p><el-icon><Calendar /></el-icon> 交易时间: {{ new Date(order.交易时间).toLocaleString() }}</p>
          <p><el-icon><Location /></el-icon> 交易地点: {{ order.交易地点 }}</p>
          <p v-if="order.买家用户名"><el-icon><User /></el-icon> 买家: {{ order.买家用户名 }}</p>
          <p v-if="order.卖家用户名"><el-icon><User /></el-icon> 卖家: {{ order.卖家用户名 }}</p>
        </div>
      </div>
  
      <div class="card-actions">
        <!-- 操作按钮，根据订单状态和角色显示 -->
        <slot name="actions" :order="order"></slot>
        <el-button type="text" class="view-detail-btn">查看详情</el-button>
      </div>
    </el-card>
  </template>
  
  <script setup>
  import { computed } from 'vue';
  import { Calendar, Location, User } from '@element-plus/icons-vue'; // 导入所需图标
  
  const props = defineProps({
    order: {
      type: Object,
      required: true,
    },
  });
  
  const emit = defineEmits(['view-detail']);
  
  const statusMap = {
    'PendingSellerConfirmation': '待卖家确认',
    'ConfirmedBySeller': '卖家已确认',
    'Completed': '已完成',
    'Cancelled': '已取消',
    'Rejected': '已拒绝',
    // 可以根据需要添加更多状态
  };
  
  const displayStatus = computed(() => {
    return statusMap[props.order.订单状态] || props.order.订单状态; // 如果没有映射，则显示原始状态
  });
  
  const statusTagType = computed(() => {
    switch (props.order.订单状态) {
      case 'Completed': return 'success';
      case 'Cancelled': return 'danger';
      case 'Rejected': return 'danger';
      case 'PendingSellerConfirmation': return 'warning';
      case 'ConfirmedBySeller': return ''; // Default tag type for confirmed
      default: return 'info';
    }
  });
  </script>
  
  <style scoped>
  .order-card {
    margin-bottom: 20px;
    cursor: pointer;
    transition: all 0.3s ease; /* Smooth transition for hover effect */
  }
  
  .order-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); /* More pronounced shadow on hover */
  }
  
  .card-header {
    display: flex;
    flex-direction: column;
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 1px solid #ebeef5; /* Light separator */
  }
  
  .order-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }
  
  .order-id {
    font-size: 0.9em;
    color: #909399;
  }
  
  .product-info {
    margin-top: 5px;
  }
  
  .product-name {
    font-size: 1.1em;
    font-weight: bold;
    color: #303133;
    margin: 0;
  }
  
  .quantity {
    font-size: 0.9em;
    color: #606266;
    margin-top: 5px;
  }
  
  .card-content {
    margin-bottom: 15px;
  }
  
  .trade-details p {
    margin: 5px 0;
    font-size: 0.9em;
    color: #606266;
    display: flex;
    align-items: center;
  }
  
  .trade-details .el-icon {
    margin-right: 8px;
    color: #409eff; /* Primary color for icons */
  }
  
  .card-actions {
    display: flex;
    justify-content: flex-end; /* Align buttons to the right */
    gap: 10px;
    padding-top: 10px;
    border-top: 1px solid #ebeef5; /* Light separator */
  }
  
  .view-detail-btn {
    color: #409eff; /* Element-Plus primary color */
    font-weight: bold;
  }
  
  .view-detail-btn:hover {
    text-decoration: underline;
  }
  </style>
  