<script setup>
import { ref, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import api from '@/API_PRO.js'; // 确保路径正确
import { useStore } from 'vuex'; // 导入 useStore

const props = defineProps({
    order: {
        type: Object,
        default: null,
    },
    visible: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(['close']);

const store = useStore(); // 获取 Vuex store 实例
const currentUser = computed(() => store.getters['user/getUserInfo']);
const currentUserId = computed(() => currentUser.value?.user_id);

const isBuyer = computed(() => props.order?.buyer_id === currentUserId.value); // 使用 currentUserId.value
const isSeller = computed(() => props.order?.seller_id === currentUserId.value); // 使用 currentUserId.value

const closeDialog = () => {
    emit('close');
};

const handleCancelOrder = async () => {
    ElMessageBox.confirm('确定要取消该订单吗?', '取消订单', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
    }).then(async () => {
        try {
            await api.cancelOrder(props.order.order_id, {}); // 可以传递取消原因
            ElMessage.success('订单已取消');
            emit('close');
            // 可以通知父组件刷新订单列表
        } catch (err) {
            console.error('取消订单失败:', err);
            ElMessage.error('取消订单失败，请稍后重试。');
        }
    }).catch(() => {
        ElMessage.info('已取消操作');
    });
};

const handleConfirmOrder = async () => {
    ElMessageBox.confirm('确定要确认该订单吗?', '确认订单', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info',
    }).then(async () => {
        try {
            await api.confirmOrder(props.order.order_id);
            ElMessage.success('订单已确认');
            emit('close');
            // 可以通知父组件刷新订单列表
        } catch (err) {
            console.error('确认订单失败:', err);
            ElMessage.error('确认订单失败，请稍后重试。');
        }
    }).catch(() => {
        ElMessage.info('已取消操作');
    });
};

const handleCompleteOrder = async () => {
    ElMessageBox.confirm('确定标记该订单为已完成吗?', '完成订单', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'success',
    }).then(async () => {
        try {
            await api.completeOrder(props.order.order_id);
            ElMessage.success('订单已完成');
            emit('close');
            // 可以通知父组件刷新订单列表
        } catch (err) {
            console.error('完成订单失败:', err);
            ElMessage.error('完成订单失败，请稍后重试。');
        }
    }).catch(() => {
        ElMessage.info('已取消操作');
    });
};

const handleRejectOrder = async () => {
    ElMessageBox.prompt('请输入拒绝原因', '拒绝订单', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /.+/,
        inputErrorMessage: '拒绝原因不能为空',
        type: 'warning',
    }).then(async ({ value }) => {
        try {
            await api.rejectOrder(props.order.order_id, { rejection_reason_data: { reason: value } }); // 根据API调整rejection_reason_data结构
            ElMessage.success('订单已拒绝');
            emit('close');
            // 可以通知父组件刷新订单列表
        } catch (err) {
            console.error('拒绝订单失败:', err);
            ElMessage.error('拒绝订单失败，请稍后重试。' + (err.response?.data?.detail || err.message));
        }
    }).catch(() => {
        ElMessage.info('已取消操作');
    });
};

// 联系买家/卖家逻辑需要根据你的具体实现来确定
const handleContactBuyer = () => {
    ElMessage.info('联系买家功能开发中...');
};

const handleContactSeller = () => {
    ElMessage.info('联系卖家功能开发中...');
};
</script>

<template>
    <el-dialog
        title="订单详情"
        :model-value="visible"
        width="60%"
        @close="closeDialog"
    >
        <template v-if="order">
            <el-descriptions :column="2" border>
                <el-descriptions-item label="订单号">{{ order.order_id }}</el-descriptions-item>
                <el-descriptions-item label="商品ID">{{ order.product_id }}</el-descriptions-item>
                <el-descriptions-item label="商品名称">{{ order.product_name || '未知商品' }}</el-descriptions-item>
                <el-descriptions-item label="数量">{{ order.quantity }}</el-descriptions-item>
                <el-descriptions-item label="交易时间">
                    {{ new Date(order.trade_time).toLocaleString() }}
                </el-descriptions-item>
                <el-descriptions-item label="交易地点">{{ order.trade_location }}</el-descriptions-item>
                <el-descriptions-item label="状态">
                    <el-tag :type="
                        order.status === 'completed' || order.status === 'delivered' ? 'success' :
                        order.status === 'cancelled' || order.status === 'rejected' ? 'danger' :
                        order.status === 'pending' || order.status === 'unpaid' ? 'warning' :
                        'info'
                    ">{{ order.status }}</el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="下单时间">{{ order.created_at }}</el-descriptions-item>
                <el-descriptions-item label="买家ID">{{ order.buyer_id }}</el-descriptions-item>
                <el-descriptions-item label="卖家ID">{{ order.seller_id }}</el-descriptions-item>
                <el-descriptions-item label="完成时间" v-if="order.complete_time">{{ order.complete_time }}</el-descriptions-item>
                <el-descriptions-item label="取消时间" v-if="order.cancel_time">{{ order.cancel_time }}</el-descriptions-item>
                <el-descriptions-item label="取消原因" v-if="order.cancel_reason">{{ order.cancel_reason }}</el-descriptions-item>
                <el-descriptions-item label="物流信息" v-if="order.shipping_info">{{ order.shipping_info }}</el-descriptions-item>
                </el-descriptions>

            <div style="margin-top: 20px;">
                <h3>操作</h3>
                <el-button v-if="isBuyer" type="warning" @click="handleCancelOrder" :disabled="order.status !== 'pending' && order.status !== 'unpaid'">取消订单</el-button>
                <el-button v-if="isSeller" type="success" @click="handleConfirmOrder" :disabled="order.status !== 'pending'">确认订单</el-button>
                <el-button v-if="isSeller" type="primary" @click="handleCompleteOrder" :disabled="order.status !== 'processing' && order.status !== 'shipping'">标记完成</el-button>
                <el-button v-if="isSeller" type="danger" @click="handleRejectOrder" :disabled="order.status !== 'pending'">拒绝订单</el-button>
                <el-button v-if="isBuyer && order.seller_id" @click="handleContactSeller">联系卖家</el-button>
                <el-button v-if="isSeller && order.buyer_id" @click="handleContactBuyer">联系买家</el-button>
                </div>
        </template>
        <template v-else>
            <p>加载订单详情中...</p>
        </template>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="closeDialog">关闭</el-button>
            </span>
        </template>
    </el-dialog>
</template>

<style scoped>
.dialog-footer {
    text-align: right;
}
</style>