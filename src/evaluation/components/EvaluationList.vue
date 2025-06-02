<template>
  <div class="evaluation-list">
    <h3>用户评价</h3>
    <div v-if="evaluations.length > 0">
      <div v-for="evaluation in evaluations" :key="evaluation.id" class="evaluation-item">
        <p class="user-info">评价者: {{ evaluation.reviewerName }}</p>
        <p class="rating">评分: {{ '⭐'.repeat(evaluation.rating) }}</p>
        <p class="comment">{{ evaluation.comment }}</p>
        <p class="date">{{ evaluation.date }}</p>
      </div>
      <button v-if="hasMore" @click="loadMore">加载更多</button>
    </div>
    <div v-else>
      <p>暂无评价。</p>
    </div>
  </div>
</template>

<script>
// 假设您已经封装了 API 客户端
// import apiClient from '@/axios_client';

export default {
  name: 'EvaluationList',
  props: {
    // 可以根据需要传入 productId 或 userId 来获取对应的评价列表
    productId: { 
      type: [String, Number],
      default: null
    },
    userId: {
      type: [String, Number],
      default: null
    }
  },
  data() {
    return {
      evaluations: [],
      currentPage: 1,
      pageSize: 5, // 每页加载的评价数量
      hasMore: true, // 是否还有更多评价
      loading: false
    };
  },
  created() {
    this.fetchEvaluations();
  },
  methods: {
    async fetchEvaluations() {
      if (this.loading) return;
      this.loading = true;

      try {
        // TODO: 根据 productId 或 userId 调用后端 API 获取评价列表
        // 示例 API 调用（需要根据实际后端接口调整）
        // let url = '/api/evaluations';
        // if (this.productId) {
        //   url += `/product/${this.productId}`;
        // } else if (this.userId) {
        //   url += `/user/${this.userId}`;
        // }
        // const response = await apiClient.get(url, {
        //   params: {
        //     page: this.currentPage,
        //     pageSize: this.pageSize
        //   }
        // });
        // const newEvaluations = response.data.evaluations;
        // this.hasMore = response.data.hasMore;

        // 模拟数据
        const mockEvaluations = [
          { id: 1, reviewerName: '用户A', rating: 5, comment: '商品质量很好，卖家服务态度也很好！', date: '2023-01-01' },
          { id: 2, reviewerName: '用户B', rating: 4, comment: '发货速度快，商品符合描述。', date: '2023-01-05' },
          { id: 3, reviewerName: '用户C', rating: 5, comment: '非常满意的一次购物体验！', date: '2023-01-10' },
          { id: 4, reviewerName: '用户D', rating: 3, comment: '一般般吧，没有想象中好。', date: '2023-01-15' },
          { id: 5, reviewerName: '用户E', rating: 5, comment: '强烈推荐！', date: '2023-01-20' },
        ];

        // 模拟分页逻辑
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        const newEvaluations = mockEvaluations.slice(startIndex, endIndex);
        this.hasMore = endIndex < mockEvaluations.length;

        this.evaluations = [...this.evaluations, ...newEvaluations];

      } catch (error) {
        console.error('获取评价列表失败:', error);
        alert('获取评价列表失败，请稍后再试。');
      } finally {
        this.loading = false;
      }
    },
    loadMore() {
      this.currentPage++;
      this.fetchEvaluations();
    }
  }
};
</script>

<style scoped>
.evaluation-list {
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
  margin-top: 20px;
  background-color: #f9f9f9;
}

.evaluation-list h3 {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
}

.evaluation-item {
  border-bottom: 1px solid #ddd;
  padding: 15px 0;
  text-align: left;
}

.evaluation-item:last-child {
  border-bottom: none;
}

.evaluation-item p {
  margin-bottom: 5px;
}

.evaluation-item .user-info {
  font-weight: bold;
  color: #555;
}

.evaluation-item .rating {
  color: #ffc107; /* 星星颜色 */
  font-size: 1.2em;
}

.evaluation-item .comment {
  margin-top: 10px;
  color: #333;
  line-height: 1.5;
}

.evaluation-item .date {
  font-size: 0.85em;
  color: #888;
  text-align: right;
  margin-top: 10px;
}

.evaluation-list button {
  display: block;
  width: 120px;
  padding: 8px;
  margin: 20px auto 0;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.evaluation-list button:hover {
  background-color: #0056b3;
}
</style>