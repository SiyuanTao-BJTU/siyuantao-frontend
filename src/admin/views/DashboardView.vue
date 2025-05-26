<template>
  <div class="admin-dashboard-container">
    <h1>管理员仪表盘概览</h1>
    <p>这里将显示后台关键数据的概览和统计信息。</p>
    <div class="dashboard-widgets">
      <el-card class="widget" shadow="hover" @click="handleCardClick('/admin/users')">
        <h3>用户总数</h3>
        <p>{{ totalUsers !== null ? totalUsers : '加载中...' }}</p>
      </el-card>
      <el-card class="widget" shadow="hover" @click="handleCardClick('/admin/users')">
        <h3>今日新增用户</h3>
        <p>{{ newUsersToday !== null ? newUsersToday : '加载中...' }}</p>
      </el-card>
      <el-card class="widget">
        <h3>商品总数</h3>
        <p>加载中...</p>
      </el-card>
      <el-card class="widget">
        <h3>待审核商品</h3>
        <p>{{ productsPendingReview !== null ? productsPendingReview : '加载中...' }}</p>
      </el-card>
      <el-card class="widget">
        <h3>待处理退货</h3>
        <p>{{ pendingReturns !== null ? pendingReturns : '加载中...' }}</p>
      </el-card>
      <el-card class="widget">
        <h3>最新举报</h3>
        <p>{{ latestReports !== null ? latestReports : '加载中...' }}</p>
      </el-card>
      <!-- 更多统计卡片 -->
    </div>

    <!-- 用户管理列表 -->
    <el-card class="latest-list-card">
      <div class="list-header">
        <h2>用户管理</h2>
        <el-link type="primary" @click="handleCardClick('/admin/users')">查看全部用户</el-link>
      </div>
      <div class="list-content">
        <!-- TODO: 添加最新用户列表 (例如，最近注册的几位用户) -->
        <el-table :data="latestUsers" style="width: 100%">
          <el-table-column prop="username" label="用户名"></el-table-column>
          <el-table-column prop="email" label="邮箱"></el-table-column>
          <el-table-column prop="join_time" label="注册时间"></el-table-column>
          <!-- 更多用户字段 -->
        </el-table>
        <el-empty v-if="!latestUsers || latestUsers.length === 0" description="暂无最新用户数据"></el-empty>
      </div>
    </el-card>

    <!-- TODO: 添加商品审核、退货申请管理、举报管理的列表 -->

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/API_PRO.js';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router'; // 导入 useRouter

const router = useRouter(); // 获取 router 实例

const totalUsers = ref(null);
const newUsersToday = ref(null); // 今日新增用户
const productsPendingReview = ref(null); // 待审核商品
const pendingReturns = ref(null); // 待处理退货
const latestReports = ref(null); // 最新举报

const latestUsers = ref([]); // 最新用户列表

// 处理卡片点击导航
const handleCardClick = (path) => {
  router.push(path);
};

onMounted(() => {
  console.log('Admin Dashboard View Mounted');
  fetchDashboardData();
  fetchLatestData(); // 调用获取最新列表数据的方法
});

async function fetchDashboardData() {
  try {
    // 获取用户总数
    const usersResponse = await api.getAllUsersApi();
    console.log("Fetched users for dashboard:", usersResponse);
    if (usersResponse && Array.isArray(usersResponse)) {
      totalUsers.value = usersResponse.length;
    } else {
        console.error("Invalid response format for getAllUsersApi:", usersResponse);
        totalUsers.value = 0;
        ElMessage.error("获取用户总数失败");
    }

    // 获取今日新增用户 (使用占位符API)
    const newUsersTodayResponse = await api.getNewUsersToday();
    newUsersToday.value = newUsersTodayResponse;

    // 获取待审核商品数量 (使用占位符API)
    const productsPendingReviewResponse = await api.getProductsPendingReviewCount();
    productsPendingReview.value = productsPendingReviewResponse;

    // 获取待处理退货数量 (使用占位符API)
    const pendingReturnsResponse = await api.getPendingReturnsCount();
    pendingReturns.value = pendingReturnsResponse;

    // 获取最新举报数量 (使用占位符API)
    const latestReportsResponse = await api.getLatestReportsCount();
    latestReports.value = latestReportsResponse;

  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    // ElMessage.error('获取仪表盘数据失败'); // 避免重复提示错误
    totalUsers.value = 0; 
    newUsersToday.value = 0; 
    productsPendingReview.value = 0; 
    pendingReturns.value = 0; 
    latestReports.value = 0; 
  }
}

async function fetchLatestData() {
    try {
        // 获取最新用户列表 (例如，获取全部用户，并取最近的几条) - 需要后端支持排序或单独API
        const usersResponse = await api.getAllUsersApi();
        if (usersResponse && Array.isArray(usersResponse)) {
            // 假设后端返回的用户列表已按注册时间排序，或者我们在这里手动排序
            // 手动排序（按注册时间降序）
             const sortedUsers = usersResponse.sort((a, b) => new Date(b.join_time) - new Date(a.join_time));
            // 取最近的 5 条数据作为最新用户
            latestUsers.value = sortedUsers.slice(0, 5);
        } else {
             console.warn("Invalid response format for getAllUsersApi for latest users:", usersResponse);
             latestUsers.value = [];
        }

        // TODO: 获取最新商品审核列表、最新退货申请列表、最新举报列表

    } catch (error) {
        console.error('Failed to fetch latest data:', error);
        // ElMessage.error('获取最新数据失败');
        latestUsers.value = [];
        // TODO: 设置其他列表为空或加载失败状态
    }
}
</script>

<style scoped>
.admin-dashboard-container {
  padding: 20px;
}

h1 {
  font-size: 24px;
  margin-bottom: 20px;
}

.dashboard-widgets {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px; /* Add space below widgets */
}

.widget {
  /* Basic styling for widget cards */
  cursor: pointer; /* Add cursor pointer to indicate clickable */
}

.widget h3 {
  margin-bottom: 10px;
  font-size: 18px;
}

.latest-list-card {
    margin-bottom: 20px; /* Space below each list card */
}

.list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px; /* Space below header */
     padding-bottom: 10px; /* Add padding below header */
    border-bottom: 1px solid #ebeef5; /* Add a subtle separator */
}

.list-header h2 {
    font-size: 20px; /* Adjust title font size */
    margin: 0;
}

.list-content {
    /* Styles for the list/table area */
}

/* Adjust default table styles if needed */
</style> 