<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { ElMessage, ElMessageBox } from 'element-plus';
import OrderDetailDialog from '../components/OrderDetailDialog.vue';
import CreateEvaluationDialog from '../../evaluation/components/CreateEvaluationDialog.vue';
import api from '@/API_PRO.js'; // 确保路径正确

const store = useStore();
const currentUser = computed(() => store.getters['user/getUserInfo']);
const currentUserId = computed(() => currentUser.value?.用户ID);
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
    { value: 'PendingSellerConfirmation', label: '待卖家确认' },
    { value: 'ConfirmedBySeller', label: '卖家已确认' },
    { value: 'Completed', label: '已完成' },
    { value: 'Cancelled', label: '已取消' },
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
        orderList.value = response; 
        // 假设API返回的数据中包含 total 字段用于分页
        total.value = response.total || response.length;
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
    fetchOrders(); // 关闭详情后刷新列表
};

const openEvaluationDialog = (order) => {
    orderToEvaluate.value = order;
    showCreateEvaluationDialog.value = true;
};

const closeEvaluationDialog = () => {
    showCreateEvaluationDialog.value = false;
    orderToEvaluate.value = null;
    fetchOrders();
};

const handleCancelOrder = async (order) => {
    ElMessageBox.confirm('确定要取消该订单吗?', '取消订单', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
    }).then(async () => {
        try {
            await api.cancelOrder(order.订单ID, { cancel_reason: '用户取消' }); // 更新为中文键名，并添加取消原因
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
            await api.confirmOrder(order.订单ID); // 更新为中文键名
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
            await api.completeOrder(order.订单ID); // 更新为中文键名
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
            await api.rejectOrder(order.订单ID, { reason: value }); // 更新为中文键名和参数结构
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
            await api.deleteOrder(order.订单ID); // 更新为中文键名
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
            <el-table-column prop="订单ID" label="订单号" width="280" />
            <el-table-column prop="商品ID" label="商品ID" width="280" />
            <el-table-column label="商品名称">
                <template #default="scope">
                    {{ scope.row.商品名称 || '未知商品' }}
                </template>
            </el-table-column>
            <el-table-column prop="数量" label="数量" width="80" />
            <el-table-column prop="交易时间" label="交易时间" width="180">
                <template #default="scope">
                    {{ new Date(scope.row.交易时间).toLocaleString() }}
                </template>
            </el-table-column>
            <el-table-column prop="交易地点" label="交易地点" width="150" />
            <el-table-column label="下单时间" width="180">
                <template #default="scope">
                     {{ new Date(scope.row.创建时间).toLocaleString() }}
                </template>
            </el-table-column>
            <el-table-column label="状态" width="120">
                <template #default="scope">
                    <el-tag :type="
                        scope.row.订单状态 === 'Completed' ? 'success' :
                        scope.row.订单状态 === 'Cancelled' || scope.row.订单状态 === 'Rejected' ? 'danger' :
                        scope.row.订单状态 === 'PendingSellerConfirmation' || scope.row.订单状态 === 'ConfirmedBySeller' ? 'warning' :
                        'info'
                    ">{{ scope.row.订单状态 }}</el-tag>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="280">
                <template #default="scope">
                    <el-button type="primary" size="small" @click="openOrderDetail(scope.row)">查看详情</el-button>
                    <template v-if="isBuyer">
                        <el-button v-if="scope.row.订单状态 === 'PendingSellerConfirmation' || scope.row.订单状态 === 'ConfirmedBySeller'" type="warning" size="small" @click="handleCancelOrder(scope.row)">取消订单</el-button>
                        <el-button v-if="scope.row.订单状态 === 'Completed' && !scope.row.has_evaluated" type="success" size="small" @click="openEvaluationDialog(scope.row)">评价</el-button>
                        <el-button v-if="scope.row.订单状态 === 'ConfirmedBySeller'" type="primary" size="small" @click="handleCompleteOrder(scope.row)">确认收货</el-button>
                    </template>
                    <template v-if="isSeller">
                        <el-button v-if="scope.row.订单状态 === 'PendingSellerConfirmation'" type="success" size="small" @click="handleConfirmOrder(scope.row)">确认订单</el-button>
                        <el-button v-if="scope.row.订单状态 === 'PendingSellerConfirmation'" type="danger" size="small" @click="handleRejectOrder(scope.row)">拒绝订单</el-button>
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