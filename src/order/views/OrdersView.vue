<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { ElMessage, ElMessageBox } from 'element-plus';
import OrderDetailDialog from '../components/OrderDetailDialog.vue';
import CreateEvaluationDialog from '../../evaluation/components/CreateEvaluationDialog.vue';
import OrderCard from '../components/OrderCard.vue'; 
import api from '@/API_PRO.js'; // 确保路径正确

const store = useStore();
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

// 新增：用于切换买家/卖家订单视图的标签页
const activeTab = ref('buyer'); // 默认为买家订单

const orderStatusOptions = ref([
    { value: '', label: '全部' },
    { value: 'PendingSellerConfirmation', label: '待卖家确认' },
    { value: 'ConfirmedBySeller', label: '卖家已确认' },
    { value: 'Completed', label: '已完成' },
    { value: 'Cancelled', label: '已取消' },
    { value: 'Rejected', label: '已拒绝' }, // 添加 Rejected 状态
]);

const fetchOrders = async () => {
    loading.value = true;
    error.value = null;
    try {
        const params = {
            status: selectedStatus.value || undefined,
            page_number: pageNumber.value,
            page_size: pageSize.value,
            is_seller: activeTab.value === 'seller', // 根据 activeTab 传递 is_seller
        };
        const response = await api.getMyOrders(params);
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

// 新增：处理 Tab 切换事件
const handleTabChange = (tabName) => {
    activeTab.value = tabName;
    pageNumber.value = 1; // 切换 Tab 时重置页码
    fetchOrders(); // 重新获取订单
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
            await api.rejectOrder(order.订单ID, { rejection_reason: value }); // 修改为 rejection_reason
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
    // 根据用户角色初始化 activeTab
    if (isSeller.value && !isBuyer.value) { // 如果是卖家且不是买家
        activeTab.value = 'seller';
    } else { // 默认为买家视图，或者同时是买家卖家时也默认买家视图
        activeTab.value = 'buyer';
    }
    fetchOrders();
});
</script>

<template>
    <div class="orders-view">
        <h1>我的订单</h1>

        <el-tabs v-model="activeTab" @tab-change="handleTabChange" class="order-tabs">
            <el-tab-pane label="我买到的" name="buyer">
        <el-select v-model="selectedStatus" placeholder="选择订单状态" @change="handleStatusChange" style="margin-bottom: 20px;">
            <el-option v-for="item in orderStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>

        <div class="order-card-list" v-loading="loading">
            <OrderCard
                v-for="order in orderList"
                :key="order.订单ID"
                :order="order"
                @view-detail="openOrderDetail(order)"
            >
                <template #actions="{ order: cardOrder }">
                    <el-button v-if="activeTab === 'buyer'">
                        <el-button v-if="cardOrder.订单状态 === 'PendingSellerConfirmation' || cardOrder.订单状态 === 'ConfirmedBySeller'" type="warning" size="small" @click.stop="handleCancelOrder(cardOrder)">取消订单</el-button>
                        <el-button v-if="cardOrder.订单状态 === 'Completed' && !cardOrder.是否已评价" type="success" size="small" @click.stop="openEvaluationDialog(cardOrder)">评价</el-button>
                        <el-button v-if="cardOrder.订单状态 === 'ConfirmedBySeller'" type="primary" size="small" @click.stop="handleCompleteOrder(cardOrder)">确认收货</el-button>
                    </el-button>
                    <el-button v-if="isAdmin" type="danger" size="small" @click.stop="handleDeleteOrder(cardOrder)">删除</el-button>
                </template>
            </OrderCard>
            <p v-if="!loading && orderList.length === 0" class="no-orders-message">暂无订单</p>
        </div>
    </el-tab-pane>

    <el-tab-pane label="我卖出的" name="seller">
                <el-select v-model="selectedStatus" placeholder="选择订单状态" @change="handleStatusChange" style="margin-bottom: 20px;">
                    <el-option v-for="item in orderStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>

                <div class="order-card-list" v-loading="loading">
                    <OrderCard
                        v-for="order in orderList"
                        :key="order.订单ID"
                        :order="order"
                        @view-detail="openOrderDetail(order)"
                    >
                        <template #actions="{ order: cardOrder }">
                            <el-button v-if="activeTab === 'seller'">
                                <el-button v-if="cardOrder.订单状态 === 'PendingSellerConfirmation'" type="success" size="small" @click.stop="handleConfirmOrder(cardOrder)">确认订单</el-button>
                                <el-button v-if="cardOrder.订单状态 === 'PendingSellerConfirmation'" type="danger" size="small" @click.stop="handleRejectOrder(cardOrder)">拒绝订单</el-button>
                            </el-button>
                            <el-button v-if="isAdmin" type="danger" size="small" @click.stop="handleDeleteOrder(cardOrder)">删除</el-button>
                        </template>
                    </OrderCard>
                    <p v-if="!loading && orderList.length === 0" class="no-orders-message">暂无订单</p>
                </div>
            </el-tab-pane>
        </el-tabs>

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

.order-tabs {
    margin-bottom: 20px;
}

.order-card-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
}

.no-orders-message {
    text-align: center;
    color: #909399;
    padding: 20px;
}
</style>
