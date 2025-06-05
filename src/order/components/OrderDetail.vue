<template>
  <div class="order-detail-container">
    <h2>订单详情</h2>
    <button @click="goBack">返回列表</button>
    <!-- 订单详情内容将在这里展示 -->
    <div v-if="order">
      <p>订单ID: {{ order.id }}</p>
      <p>总价: {{ order.total }}</p>
      <p>状态: {{ order.status }}</p>
      <p>买家: {{ order.buyer }}</p>
      <p>卖家: {{ order.seller }}</p>
      <h3>商品列表:</h3>
      <ul>
        <li v-for="item in order.items" :key="item.id">
          {{ item.name }} - 数量: {{ item.quantity }} - 价格: {{ item.price }}
        </li>
      </ul>

      <!-- 根据订单状态和是否已评价来显示评价表单 -->
      <div v-if="showEvaluationForm">
        <h3>评价订单</h3>
        <EvaluationForm :orderId="order.id" @evaluation-submitted="handleEvaluationSubmitted" />
      </div>
    </div>
    <div v-else>
      <p>加载中...</p>
    </div>
  </div>
</template>

<script>
import EvaluationForm from '@/evaluation/components/EvaluationForm.vue'; // 导入评价表单组件

export default {
  name: 'OrderDetail',
  components: {
    EvaluationForm // 注册组件
  },
  props: {
    orderId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      order: null,
      showEvaluationForm: false // 新增数据属性，控制评价表单的显示
    };
  },
  created() {
    this.fetchOrderDetail();
  },
  methods: {
    fetchOrderDetail() {
      // 模拟 API 调用获取订单详情
      console.log(`Fetching details for order: ${this.orderId}`);
      // 实际项目中会调用后端 API
      // 例如: axios.get(`/api/orders/${this.orderId}`).then(response => {
      //   this.order = response.data;
      // });
      // 模拟数据
      // 假设订单状态为“已完成”且尚未评价时显示评价表单
      this.order = {
        id: this.orderId,
        items: [
          { id: 1, name: '模拟商品A', price: 100, quantity: 1 },
          { id: 2, name: '模拟商品B', price: 50, quantity: 2 }
        ],
        total: 150,
        status: '已完成', // 模拟订单状态为已完成
        buyer: '模拟买家',
        seller: '模拟卖家',
        hasEvaluated: false // 模拟是否已评价
      };

      // 根据订单状态和是否已评价来决定是否显示评价表单
      if (this.order.status === '已完成' && !this.order.hasEvaluated) {
        this.showEvaluationForm = true;
      } else {
        this.showEvaluationForm = false;
      }
    },
    goBack() {
      this.$emit('back-to-list');
    },
    handleEvaluationSubmitted() {
      // 评价提交成功后，隐藏评价表单
      this.showEvaluationForm = false;
      // 可以在这里刷新订单详情，或者显示一个“已评价”的提示
      alert('评价成功，感谢您的评价！');
      // 实际项目中可能需要重新获取订单详情以更新 hasEvaluated 状态
      // this.fetchOrderDetail();
    }
  }
};
</script>

<style scoped>
.order-detail-container {
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
  margin-top: 20px;
}
h2 {
  color: #333;
  margin-bottom: 15px;
}
p {
  margin-bottom: 8px;
}
button {
  padding: 8px 15px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 15px;
}
button:hover {
  background-color: #0056b3;
}
</style>