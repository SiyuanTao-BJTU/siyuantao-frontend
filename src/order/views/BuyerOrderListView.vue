<template>
  <div class="buyer-order-list-view">
    <h1>我的订单</h1>

    <div v-if="!selectedOrderId">
      <!-- 订单筛选和列表显示 -->
      <div class="filters">
        <button :class="{ active: activeFilter === 'all' }" @click="filterOrders('all')">全部</button>
        <button :class="{ active: activeFilter === 'pending_payment' }" @click="filterOrders('pending_payment')">待付款</button>
        <button :class="{ active: activeFilter === 'pending_shipment' }" @click="filterOrders('pending_shipment')">待发货</button>
        <button :class="{ active: activeFilter === 'pending_receipt' }" @click="filterOrders('pending_receipt')">待收货</button>
        <button :class="{ active: activeFilter === 'completed' }" @click="filterOrders('completed')">已完成</button>
        <button :class="{ active: activeFilter === 'cancelled' }" @click="filterOrders('cancelled')">已取消</button>
        <button :class="{ active: activeFilter === 'returning' }" @click="filterOrders('returning')">退货中</button>
      </div>
      <TableInfo :orders="filteredOrders" @order-clicked="handleOrderClick" :is-sell="false" />
    </div>
    <div v-else>
      <!-- 订单详情显示 -->
      <OrderDetail :order-id="selectedOrderId" @back-to-list="showOrderList" />
    </div>
  </div>
</template>

<script>
import TableInfo from '@/order/components/TableInfo.vue';
import OrderDetail from '@/order/components/OrderDetail.vue';

export default {
  name: 'BuyerOrderListView',
  components: {
    TableInfo,
    OrderDetail
  },
  data() {
    return {
      allOrders: [], // 存储所有订单数据
      selectedOrderId: null, // 存储当前选中的订单ID，用于显示详情
      currentFilter: 'all', // 当前筛选状态
      activeFilter: 'all' // 当前激活的筛选按钮
    };
  },
  created() {
    this.fetchOrders();
  },
  computed: {
    filteredOrders() {
      if (this.currentFilter === 'all') {
        return this.allOrders;
      } else {
        // 确保这里的 status 值与模拟数据中的 status 值一致
        return this.allOrders.filter(order => order.status === this.currentFilter);
      }
    }
  },
  methods: {
    fetchOrders() {
      // 模拟 API 调用获取订单列表
      console.log(`Fetching orders with filter: ${this.currentFilter}`);
      // 实际项目中，这里会调用后端 API
      // 假设这是从后端获取的原始数据，注意 status 字段的值与筛选按钮的参数一致
      this.allOrders = [
        { id: '1', product: '商品A', quantity: 1, total: 100, seller: '卖家X', status: 'pending_payment' },
        { id: '2', product: '商品B', quantity: 2, total: 200, seller: '卖家Y', status: 'pending_shipment' },
        { id: '3', product: '商品C', quantity: 1, total: 50, seller: '卖家Z', status: 'completed' },
        { id: '4', product: '商品D', quantity: 1, total: 150, seller: '卖家A', status: 'pending_payment' },
        { id: '5', product: '商品E', quantity: 2, total: 250, seller: '卖家B', status: 'completed' },
        { id: '6', product: '商品F', quantity: 1, total: 300, seller: '卖家C', status: 'cancelled' },
        { id: '7', product: '商品G', quantity: 1, total: 120, seller: '卖家D', status: 'pending_receipt' },
        { id: '8', product: '商品H', quantity: 2, total: 180, seller: '卖家E', status: 'returning' },
      ];
    },
    filterOrders(status) {
      this.currentFilter = status;
      this.activeFilter = status; // 更新激活状态
      // 注意：这里不需要再次调用 fetchOrders，因为 filteredOrders 是一个计算属性，
      // 当 currentFilter 改变时，它会自动重新计算并更新 TableInfo 组件。
    },
    handleOrderClick(orderId) {
      this.selectedOrderId = orderId;
    },
    showOrderList() {
      this.selectedOrderId = null;
    }
  }
};
</script>

<style scoped>
.buyer-order-list-view {
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