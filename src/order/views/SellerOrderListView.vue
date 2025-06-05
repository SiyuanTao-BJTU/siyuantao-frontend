<template>
  <div class="seller-order-list-view">
    <h1>我的卖出订单</h1>

    <div v-if="!selectedOrderId">
      <!-- 订单筛选和列表显示 -->
      <div class="filters">
        <!-- 筛选器占位符 -->
        <button :class="{ active: activeFilter === 'all' }" @click="filterOrders('all')">全部</button>
        <button :class="{ active: activeFilter === 'pending_payment' }" @click="filterOrders('pending_payment')">待付款</button>
        <button :class="{ active: activeFilter === 'pending_shipment' }" @click="filterOrders('pending_shipment')">待发货</button>
        <button :class="{ active: activeFilter === 'pending_receipt' }" @click="filterOrders('pending_receipt')">待收货</button>
        <button :class="{ active: activeFilter === 'completed' }" @click="filterOrders('completed')">已完成</button>
        <button :class="{ active: activeFilter === 'cancelled' }" @click="filterOrders('cancelled')">已取消</button>
        <button :class="{ active: activeFilter === 'returning' }" @click="filterOrders('returning')">退货中</button>
      </div>
      <!-- 注意这里 TableInfo 的 is-sell 属性设置为 true -->
      <TableInfo :orders="filteredOrders" @order-clicked="handleOrderClick" :is-sell="true" />
    </div>
    <div v-else>
      <!-- 订单详情显示 -->
      <OrderDetail :order-id="selectedOrderId" @back-to-list="showOrderList" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import TableInfo from '@/order/components/TableInfo.vue';
import OrderDetail from '@/order/components/OrderDetail.vue';

const allOrders = ref([]); // 存储所有卖家订单列表数据
const selectedOrderId = ref(null); // 存储当前选中的订单ID，用于显示详情
const activeFilter = ref('all'); // 当前筛选状态

const filteredOrders = computed(() => {
  if (activeFilter.value === 'all') {
    return allOrders.value;
  } else {
    return allOrders.value.filter(order => order.status === activeFilter.value);
  }
});

const fetchOrders = () => {
  // 模拟 API 调用获取卖家订单列表
  console.log(`Fetching seller orders with filter: ${activeFilter.value}`);
  // 实际项目中，这里会调用后端 API 获取卖家订单
  allOrders.value = [
    { id: '101', product: '商品X', quantity: 1, total: 150, buyer: '买家A', status: 'pending_shipment' }, // 待发货
    { id: '102', product: '商品Y', quantity: 3, total: 300, buyer: '买家B', status: 'completed' }, // 已完成
    { id: '103', product: '商品Z', quantity: 1, total: 80, buyer: '买家C', status: 'pending_payment' }, // 待付款
    { id: '104', product: '商品A', quantity: 2, total: 200, buyer: '买家D', status: 'pending_receipt' }, // 待收货
    { id: '105', product: '商品B', quantity: 1, total: 50, buyer: '买家E', status: 'cancelled' }, // 已取消
    { id: '106', product: '商品C', quantity: 1, total: 120, buyer: '买家F', status: 'returning' }, // 退货中
  ];
};

const filterOrders = (status) => {
  activeFilter.value = status;
  // fetchOrders(); // 如果是真实API，这里可能需要重新调用API，但对于模拟数据，直接通过computed属性筛选即可
};

const handleOrderClick = (orderId) => {
  selectedOrderId.value = orderId;
};

const showOrderList = () => {
  selectedOrderId.value = null;
};

onMounted(() => {
  fetchOrders();
});
</script>

<style scoped>
.seller-order-list-view {
  padding: 20px;
}

h1 {
  color: #333;
  margin-bottom: 20px;
}

.filters button {
  margin-right: 10px;
  padding: 8px 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #f0f0f0;
  cursor: pointer;
}

.filters button:hover {
  background-color: #e0e0e0;
}

.filters button.active {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}
</style>