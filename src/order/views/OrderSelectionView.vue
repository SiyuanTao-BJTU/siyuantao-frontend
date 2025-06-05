<template>
  <div class="order-selection-view">
    <h1>我的订单</h1>
    <p>请选择您要查看的订单类型：</p>
    <div class="selection-buttons">
      <button :class="{ selected: selectedOrderType === 'buyer' }" @click="goToBuyerOrders">我买的</button>
      <button :class="{ selected: selectedOrderType === 'seller' }" @click="goToSellerOrders">我卖的</button>
    </div>
    <!-- 添加 router-view 来渲染子路由组件 -->
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'OrderSelectionView',
  data() {
    return {
      selectedOrderType: null // 新增数据属性，用于跟踪选中的订单类型
    };
  },
  methods: {
    goToBuyerOrders() {
      this.selectedOrderType = 'buyer'; // 点击时更新选中的订单类型
      this.$router.push({ name: 'BuyerOrders' });
    },
    goToSellerOrders() {
      this.selectedOrderType = 'seller'; // 点击时更新选中的订单类型
      this.$router.push({ name: 'SellerOrders' });
    }
  }
};
</script>

<style scoped>
.order-selection-view {
  padding: 20px;
  text-align: center;
}

h1 {
  color: #333;
  margin-bottom: 20px;
}

p {
  font-size: 18px;
  margin-bottom: 30px;
}

.selection-buttons button {
  padding: 15px 30px;
  margin: 0 15px;
  font-size: 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  background-color: #007bff;
  color: white;
  transition: background-color 0.3s ease, border 0.3s ease; /* 添加 border 过渡效果 */
}

.selection-buttons button:hover {
  background-color: #0056b3;
}

/* 新增 .selected 类的样式，用于显示选中状态 */
.selection-buttons button.selected {
  border: 2px solid #ffc107; /* 例如，添加一个黄色边框作为光标显示 */
  background-color: #0056b3; /* 选中时也可以改变背景色 */
}
</style>