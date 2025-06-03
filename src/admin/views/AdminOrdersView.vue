<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { ElMessage, ElMessageBox } from 'element-plus';
import OrderDetailDialog from '@/order/components/OrderDetailDialog.vue'; // 确保路径正确
import api from '@/API_PRO.js'; // 确保路径正确

const store = useStore();
const isAdmin = computed(() => store.getters['user/userRole'] === 'admin' || store.getters['user/userRole'] === 'super_admin');

const orderList = ref([]);
const loading = ref(false);
const error = ref(null);
const selectedStatus = ref('');
const pageNumber = ref(1);
const pageSize = ref(10);
const total = ref(0);

const showOrderDetailDialog = ref(false);
const currentOrder = ref(null);

const orderStatusOptions = ref([
    { value: '', label: '全部' },
    { value: 'PendingSellerConfirmation', label: '待卖家确认' },
    { value: 'ConfirmedBySeller', label: '卖家已确认' },
    { value: 'Completed', label: '已完成' },
    { value: 'Cancelled', label: '已取消' },
    { value: 'Rejected', label: '已拒绝' },
]);

// 添加状态映射
const statusMap = {
    'PendingSellerConfirmation': '待卖家确认',
    'ConfirmedBySeller': '卖家已确认',
    'Completed': '已完成',
    'Cancelled': '已取消',
    'Rejected': '已拒绝',
};

const getDisplayStatus = (status) => {
    return statusMap[status] || status; // 如果没有映射，则显示原始状态
};

const fetchOrders = async () => {
    if (!isAdmin.value) {
        error.value = '您没有权限查看此页面。';
        ElMessage.error(error.value);
        return;
    }

    loading.value = true;
    error.value = null;
    try {
        const params = {
            status: selectedStatus.value || undefined,
            page_number: pageNumber.value,
            page_size: pageSize.value,
        };
        const response = await api.getAdminOrders(params); // 调用新的管理员API
        orderList.value = response; 
        total.value = response.total || response.length;
    } catch (err) {
        console.error('获取所有订单列表失败:', err);
        error.value = '加载所有订单列表失败，请稍后重试。';
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

const handleDeleteOrder = async (order) => {
    ElMessageBox.confirm('确定要删除该订单吗? 此操作不可逆！', '删除订单', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error',
    }).then(async () => {
        try {
            await api.deleteOrder(order.订单ID); // 管理员可以直接删除订单
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
    console.log('AdminOrdersView mounted. isAdmin:', isAdmin.value); // Debug log
    if (isAdmin.value) {
        fetchOrders();
    }
});
</script>

<template>
    <div class="admin-orders-view">
        <h1>所有订单管理</h1>

        <el-select v-model="selectedStatus" placeholder="选择订单状态" @change="handleStatusChange" style="margin-bottom: 20px;">
            <el-option v-for="item in orderStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>

        <el-table :data="orderList" v-loading="loading" stripe style="width: 100%">
            <el-table-column prop="订单ID" label="订单号" width="200" />
            <el-table-column label="商品名称" width="150">
                <template #default="scope">
                    {{ scope.row.商品名称 || '未知商品' }}
                </template>
            </el-table-column>
            <el-table-column prop="数量" label="数量" width="80" />
            <el-table-column prop="买家用户名" label="买家" width="100" />
            <el-table-column prop="卖家用户名" label="卖家" width="100" />
            <el-table-column label="交易时间" width="160">
                <template #default="scope">
                    {{ new Date(scope.row.交易时间).toLocaleString() }}
                </template>
            </el-table-column>
             <el-table-column label="下单时间" width="160">
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
                    ">{{ getDisplayStatus(scope.row.订单状态) }}</el-tag>
                </template>
            </el-table-column>
            <el-table-column label="是否已评价" width="100">
                <template #default="scope">
                    <el-tag :type="scope.row.是否已评价 ? 'success' : 'info'">
                        {{ scope.row.是否已评价 ? '是' : '否' }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="auto">
                <template #default="scope">
                    <el-button type="primary" size="small" @click="openOrderDetail(scope.row)">查看详情</el-button>
                    <el-button type="danger" size="small" @click="handleDeleteOrder(scope.row)">删除</el-button>
                    <!-- 管理员可以执行更多操作，例如强制完成/取消/拒绝等，这里暂时只保留删除 -->
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
    </div>
</template>

<style scoped>
.admin-orders-view {
    padding: 20px;
}

h1 {
    margin-bottom: 20px;
}
</style>
