<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { ElMessage, ElMessageBox } from 'element-plus';
import api from '@/API_PRO.js'; // 确保路径正确

const store = useStore();
const isAdmin = computed(() => store.getters['user/userRole'] === 'admin' || store.getters['user/userRole'] === 'super_admin');

const evaluationList = ref([]);
const loading = ref(false);
const error = ref(null);

const productIdFilter = ref('');
const sellerIdFilter = ref('');
const buyerIdFilter = ref('');
const minRatingFilter = ref(null);
const maxRatingFilter = ref(null);

const pageNumber = ref(1);
const pageSize = ref(10);
const total = ref(0);

const fetchEvaluations = async () => {
    if (!isAdmin.value) {
        error.value = '您没有权限查看此页面。';
        ElMessage.error(error.value);
        return;
    }

    loading.value = true;
    error.value = null;
    try {
        const params = {
            product_id: productIdFilter.value || undefined,
            seller_id: sellerIdFilter.value || undefined,
            buyer_id: buyerIdFilter.value || undefined,
            min_rating: minRatingFilter.value || undefined,
            max_rating: maxRatingFilter.value || undefined,
            page_number: pageNumber.value,
            page_size: pageSize.value,
        };
        const response = await api.getAdminEvaluations(params); // 调用新的管理员评价API
        evaluationList.value = response; 
        total.value = response.total || response.length; // 假设API返回的数据中包含 total 字段用于分页
    } catch (err) {
        console.error('获取所有评价列表失败:', err);
        error.value = '加载所有评价列表失败，请稍后重试。' + (err.response?.data?.detail || err.message);
        ElMessage.error(error.value);
    } finally {
        loading.value = false;
    }
};

const handleFilterChange = () => {
    pageNumber.value = 1;
    fetchEvaluations();
};

const handlePageChange = (newPage) => {
    pageNumber.value = newPage;
    fetchEvaluations();
};

const handleDeleteEvaluation = async (evaluationId) => {
    ElMessageBox.confirm('确定要删除该评价吗? 此操作不可逆！', '删除评价', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error',
    }).then(async () => {
        try {
            await api.deleteAdminEvaluation(evaluationId); // 调用管理员删除评价API
            ElMessage.success('评价已删除');
            fetchEvaluations();
        } catch (err) {
            console.error('删除评价失败:', err);
            ElMessage.error('删除评价失败，请稍后重试。' + (err.response?.data?.detail || err.message));
        }
    }).catch(() => {
        ElMessage.info('已取消操作');
    });
};

onMounted(() => {
    if (isAdmin.value) {
        fetchEvaluations();
    }
});
</script>

<template>
    <div class="admin-evaluations-view">
        <h1>所有评价管理</h1>

        <div class="filter-bar" style="margin-bottom: 20px;">
            <el-input v-model="productIdFilter" placeholder="商品ID" clearable style="width: 200px; margin-right: 10px;" @change="handleFilterChange" />
            <el-input v-model="sellerIdFilter" placeholder="卖家ID" clearable style="width: 200px; margin-right: 10px;" @change="handleFilterChange" />
            <el-input v-model="buyerIdFilter" placeholder="买家ID" clearable style="width: 200px; margin-right: 10px;" @change="handleFilterChange" />
            <el-input-number v-model="minRatingFilter" :min="1" :max="5" placeholder="最小评分" style="width: 120px; margin-right: 10px;" @change="handleFilterChange" />
            <el-input-number v-model="maxRatingFilter" :min="1" :max="5" placeholder="最大评分" style="width: 120px;" @change="handleFilterChange" />
        </div>

        <el-table :data="evaluationList" v-loading="loading" stripe style="width: 100%">
            <el-table-column prop="评价ID" label="评价ID" width="200" />
            <el-table-column prop="订单ID" label="订单ID" width="200" />
            <el-table-column prop="商品名称" label="商品名称" width="150" />
            <el-table-column prop="买家用户名" label="买家" width="100" />
            <el-table-column prop="卖家用户名" label="卖家" width="100" />
            <el-table-column prop="评分" label="评分" width="80">
                <template #default="scope">
                    <el-rate v-model="scope.row.评分" disabled show-score text-color="#ff9900" />
                </template>
            </el-table-column>
            <el-table-column prop="内容" label="评价内容" />
            <el-table-column label="评价时间" width="160">
                <template #default="scope">
                    {{ new Date(scope.row.创建时间).toLocaleString() }}
                </template>
            </el-table-column>
            <el-table-column label="操作" width="auto">
                <template #default="scope">
                    <el-button type="danger" size="small" @click="handleDeleteEvaluation(scope.row.评价ID)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <el-pagination
            v-model:currentPage="pageNumber"
            :page-size="pageSize"
            :pager-count="5"
            :total="total"
            layout="prev, pager, next"
            @current-change="handlePageChange"
            style="margin-top: 20px; justify-content: center; display: flex;"
        />
    </div>
</template>

<style scoped>
.admin-evaluations-view {
    padding: 20px;
}

h1 {
    margin-bottom: 20px;
}
.filter-bar .el-input-number {
    vertical-align: top; /* Align with input */
}
</style>
