<template>
  <div class="evaluation-form">
    <h2>提交评价</h2>
    <div class="rating">
      <label for="rating">评分：</label>
      <!-- 这里可以使用一个评分组件，或者简单的下拉选择/一组星形图标 -->
      <select id="rating" v-model="rating">
        <option value="1">1 星</option>
        <option value="2">2 星</option>
        <option value="3">3 星</option>
        <option value="4">4 星</option>
        <option value="5">5 星</option>
      </select>
    </div>
    <div class="comment">
      <label for="comment">评价内容：</label>
      <textarea id="comment" v-model="comment" rows="4" placeholder="请输入您的评价"></textarea>
    </div>
    <button @click="submitEvaluation">提交评价</button>
  </div>
</template>

<script>
// 假设您已经封装了 API 客户端，例如在 src/axios_client/index.js
// import apiClient from '@/axios_client';

export default {
  name: 'EvaluationForm',
  props: {
    orderId: { // 需要知道是哪个订单的评价
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      rating: 5, // 默认5星
      comment: ''
    };
  },
  methods: {
    async submitEvaluation() {
      // TODO: 前端表单验证，例如检查评价内容是否为空
      if (!this.comment.trim()) {
        alert('评价内容不能为空！');
        return;
      }

      const evaluationData = {
        order_id: this.orderId,
        rating: this.rating,
        comment: this.comment
      };

      try {
        // TODO: 调用后端 API 提交评价
        // const response = await apiClient.post('/api/evaluations', evaluationData);
        // console.log('评价提交成功:', response.data);

        // 模拟提交成功后的操作
        alert('评价提交成功！');
        this.$emit('evaluation-submitted'); // 触发事件通知父组件

        // TODO: 清空表单或关闭对话框
        this.comment = '';
        this.rating = 5;

      } catch (error) {
        // TODO: 处理提交失败，显示错误信息
        console.error('评价提交失败:', error);
        alert('评价提交失败，请稍后再试。');
      }
    }
  }
};
</script>

<style scoped>
.evaluation-form {
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  max-width: 500px;
  margin: 20px auto;
  background-color: #f9f9f9;
}

.evaluation-form h2 {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
}

.rating,
.comment {
  margin-bottom: 15px;
}

.rating label,
.comment label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.rating select,
.comment textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box; /* 确保内边距不会增加元素总宽度 */
}

.comment textarea {
  resize: vertical; /* 允许垂直方向调整大小 */
}

.evaluation-form button {
  display: block;
  width: 100%;
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.evaluation-form button:hover {
  background-color: #0056b3;
}
</style>