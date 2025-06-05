<script setup>
import { defineProps, defineEmits, ref } from 'vue';

const props = defineProps({
  isSell: {
    type: Boolean,
    default: false,
  },
  orders: { // 添加 orders prop
    type: Array,
    default: () => [],
  },
});

const emits = defineEmits(['order-clicked']);

// 模拟订单数据
const orders = ref([
  { id: '1001', orderNumber: 'ORD2023001', productName: '商品A', amount: 100, status: '待付款' },
  { id: '1002', orderNumber: 'ORD2023002', productName: '商品B', amount: 200, status: '已发货' },
  { id: '1003', orderNumber: 'ORD2023003', productName: '商品C', amount: 300, status: '已完成' },
]);

const handleRowClick = (row) => {
  emits('order-clicked', row.id);
};
</script>

<template>
  <el-table :data="props.orders" style="width: 100%" @row-click="handleRowClick">
    <el-table-column prop="orderNumber" label="订单号" width="180" />
    <el-table-column prop="productName" label="商品名称" />
    <el-table-column prop="amount" label="金额" width="100" />
    <el-table-column prop="status" label="状态" width="100" />
    <!-- 您可以根据 isSell 属性添加或修改列 -->
    <el-table-column v-if="props.isSell" label="买家信息" width="120">
      <!-- 卖家视图特有的内容 -->
    </el-table-column>
  </el-table>
</template>

<style scoped>
/* 样式可以根据需要添加 */
</style>