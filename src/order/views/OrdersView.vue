<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { ElMessage, ElMessageBox } from 'element-plus';
import OrderDetailDialog from './OrderDetailDialog.vue';
import CreateEvaluationDialog from './CreateEvaluationDialog.vue';
import api from '@/API_PRO.js'; // 确保路径正确

const store = useStore();
const currentUser = computed(() => store.getters['user/getUserInfo']);
const currentUserId = computed(() => currentUser.value?.user_id);
const isBuyer = computed(() => currentUser.value?.role === 'buyer');
const isSeller = computed(() => currentUser.value?.role === 'seller');
const isAdmin = computed(() => currentUser.value?.role === 'admin');

const orderList = ref([]);
const loading = ref(false);
const error = ref(null);
const selectedStatus = ref('');
const pageNumber = ref(1);
const pageSize = ref(10);
const total = ref(0);

const showOrderDetailDialog = ref(false);
const currentOrder = ref(null);

const showCreateEvaluationDialog = ref(false);
const orderToEvaluate = ref(null);

const orderStatusOptions = ref([
    { value: '', label: '全部' },
    { value: 'pending', label: '待付款' },
    { value: 'unpaid', label: '待付款' }, // 可能的别名
    { value: 'processing', label: '待发货' },
    { value: 'shipping', label: '待收货' },
    { value: 'delivered', label: '已完成' },
    { value: 'completed', label: '已完成' }, // 可能的别名
    { value: 'cancelled', label: '已取消' },
    { value: 'rejected', label: '已拒绝' },
]);

const fetchOrders = async () => {
    loading.value = true;
    error.value = null;
    try {
        const response = await api.getMyOrders({
            status: selectedStatus.value || undefined,
            page_number: pageNumber.value,
            page_size: pageSize.value,
        });
        orderList.value = response; // 假设 API 直接返回订单数组，你需要根据实际响应结构调整
        total.value = response.length; // 假设返回的是数组，实际后端应该返回总数
    } catch (err) {
        console.error('获取订单列表失败:', err);
        error.value = '加载订单列表失败，请稍后重试。';
        ElMessage.error(error.value);
    } finally {
        loading.value = false;
    }
};

const handleStatusChange = () => {
    pageNumber.value = 1;
    fetchOrders();
};

const handlePageChange = (newPage) => {
    pageNumber.value = newPage;
    fetchOrders();
};

const openOrderDetail = (order) => {
    currentOrder.value = order;
    showOrderDetailDialog.value = true;
};

const closeOrderDetailDialog = () => {
    showOrderDetailDialog.value = false;
    currentOrder.value = null;
};

const openEvaluationDialog = (order) => {
    orderToEvaluate.value = order;
    showCreateEvaluationDialog.value = true;
};

const closeEvaluationDialog = () => {
    showCreateEvaluationDialog.value = false;
    orderToEvaluate.value = null;
    // 评价成功后可以刷新订单列表
    fetchOrders();
};

const handleCancelOrder = async (order) => {
    ElMessageBox.confirm('确定要取消该订单吗?', '取消订单', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
    }).then(async () => {
        try {
            await api.cancelOrder(order.order_id, {}); // 可以传递取消原因
            ElMessage.success('订单已取消');
            fetchOrders();
        } catch (err) {
            console.error('取消订单失败:', err);
            ElMessage.error('取消订单失败，请稍后重试。');
        }
    }).catch(() => {
        ElMessage.info('已取消操作');
    });
};

const handleConfirmOrder = async (order) => {
    ElMessageBox.confirm('确定要确认该订单吗?', '确认订单', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info',
    }).then(async () => {
        try {
            await api.confirmOrder(order.order_id);
            ElMessage.success('订单已确认');
            fetchOrders();
        } catch (err) {
            console.error('确认订单失败:', err);
            ElMessage.error('确认订单失败，请稍后重试。');
        }
    }).catch(() => {
        ElMessage.info('已取消操作');
    });
};

const handleCompleteOrder = async (order) => {
    ElMessageBox.confirm('确定标记该订单为已完成吗?', '完成订单', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'success',
    }).then(async () => {
        try {
            await api.completeOrder(order.order_id);
            ElMessage.success('订单已完成');
            fetchOrders();
        } catch (err) {
            console.error('完成订单失败:', err);
            ElMessage.error('完成订单失败，请稍后重试。');
        }
    }).catch(() => {
        ElMessage.info('已取消操作');
    });
};

const handleRejectOrder = async (order) => {
    ElMessageBox.prompt('请输入拒绝原因', '拒绝订单', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /.+/,
        inputErrorMessage: '拒绝原因不能为空',
        type: 'warning',
    }).then(async ({ value }) => {
        try {
            await api.rejectOrder(order.order_id, { rejection_reason_data: { reason: value } }); // 根据API调整rejection_reason_data结构
            ElMessage.success('订单已拒绝');
            fetchOrders();
        } catch (err) {
            console.error('拒绝订单失败:', err);
            ElMessage.error('拒绝订单失败，请稍后重试。' + (err.response?.data?.detail || err.message));
        }
    }).catch(() => {
        ElMessage.info('已取消操作');
    });
};

const handleDeleteOrder = async (order) => {
    ElMessageBox.confirm('确定要删除该订单吗? 此操作不可逆！', '删除订单', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error',
    }).then(async () => {
        try {
            await api.deleteOrder(order.order_id);
            ElMessage.success('订单已删除');
            fetchOrders();
        } catch (err) {
            console.error('删除订单失败:', err);
            ElMessage.error('删除订单失败，请稍后重试。' + (err.response?.data?.detail || err.message));
        }
    }).catch(() => {
        ElMessage.info('已取消操作');
    });
};

onMounted(() => {
    fetchOrders();
});
</script>

<template>
    <div class="orders-view">
        <h1>我的订单</h1>

        <el-select v-model="selectedStatus" placeholder="选择订单状态" @change="handleStatusChange" style="margin-bottom: 20px;">
            <el-option v-for="item in orderStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>

        <el-table :data="orderList" v-loading="loading" stripe style="width: 100%">
            <el-table-column prop="order_id" label="订单号" width="180" />
            <el-table-column prop="product_id" label="商品ID" width="180" />
            <el-table-column label="商品名称">
                <template #default="scope">
                    {{ scope.row.product_name || '未知商品' }}
                </template>
            </el-table-column>
            <el-table-column prop="quantity" label="数量" width="80" />
            <el-table-column prop="trade_time" label="交易时间" width="160">
                <template #default="scope">
                    {{ new Date(scope.row.trade_time).toLocaleString() }}
                </template>
            </el-table-column>
            <el-table-column prop="trade_location" label="交易地点" width="150" />
            <el-table-column prop="created_at" label="下单时间" width="150" />
            <el-table-column label="状态" width="120">
                <template #default="scope">
                    <el-tag :type="
                        scope.row.status === 'completed' || scope.row.status === 'delivered' ? 'success' :
                        scope.row.status === 'cancelled' || scope.row.status === 'rejected' ? 'danger' :
                        scope.row.status === 'pending' || scope.row.status === 'unpaid' ? 'warning' :
                        'info'
                    ">{{ scope.row.status }}</el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="created_at" label="下单时间" width="150" />
            <el-table-column label="操作">
                <template #default="scope">
                    <el-button type="primary" size="small" @click="openOrderDetail(scope.row)">查看详情</el-button>
                    <template v-if="isBuyer">
                        <el-button v-if="scope.row.status === 'pending' || scope.row.status === 'unpaid'" type="warning" size="small" @click="handleCancelOrder(scope.row)">取消订单</el-button>
                        <el-button v-if="(scope.row.status === 'completed' || scope.row.status === 'delivered') && !scope.row.has_evaluated" type="success" size="small" @click="openEvaluationDialog(scope.row)">评价</el-button>
                    </template>
                    <template v-if="isSeller">
                        <el-button v-if="scope.row.status === 'pending'" type="success" size="small" @click="handleConfirmOrder(scope.row)">确认订单</el-button>
                        <el-button v-if="scope.row.status === 'processing' || scope.row.status === 'shipping'" type="primary" size="small" @click="handleCompleteOrder(scope.row)">标记完成</el-button>
                        <el-button v-if="scope.row.status === 'pending'" type="danger" size="small" @click="handleRejectOrder(scope.row)">拒绝订单</el-button>
                    </template>
                    <el-button v-if="isAdmin" type="danger" size="small" @click="handleDeleteOrder(scope.row)">删除</el-button>
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

        <OrderDetailDialog
            v-if="showOrderDetailDialog"
            :order="currentOrder"
            :visible="showOrderDetailDialog"
            @close="closeOrderDetailDialog"
        />

        <CreateEvaluationDialog
            v-if="showCreateEvaluationDialog"
            :order="orderToEvaluate"
            :visible="showCreateEvaluationDialog"
            @close="closeEvaluationDialog"
        />
    </div>
</template>

<style scoped>
.orders-view {
    padding: 20px;
}

h1 {
    margin-bottom: 20px;
}
</style>