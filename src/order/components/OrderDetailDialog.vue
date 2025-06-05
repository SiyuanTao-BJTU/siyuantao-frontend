<script setup>
import { ref, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import api from '@/API_PRO.js'; // 确保路径正确
import { useStore } from 'vuex'; // 导入 useStore
import { useRouter } from 'vue-router'; // 导入 useRouter
import UserDetailDialog from '@/user/components/UserDetailDialog.vue'; // 导入用户详情对话框组件

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
const router = useRouter(); // 获取 router 实例
const currentUser = computed(() => store.getters['user/getUserInfo']);
const currentUserId = computed(() => currentUser.value?.用户ID);

const isBuyer = computed(() => props.order?.买家ID === currentUserId.value);
const isSeller = computed(() => props.order?.卖家ID === currentUserId.value);

// 新增：用户详情对话框相关状态
const showUserDetailDialog = ref(false);
const selectedUserIdForDetail = ref(null);

// 添加状态映射
const statusMap = {
    'PendingSellerConfirmation': '待卖家确认',
    'ConfirmedBySeller': '卖家已确认',
    'Completed': '已完成',
    'Cancelled': '已取消',
    'Rejected': '已拒绝',
    // 可以根据需要添加更多状态
};

const displayStatus = computed(() => {
    return statusMap[props.order.订单状态] || props.order.订单状态; // 如果没有映射，则显示原始状态
});

const closeDialog = () => {
    emit('close');
};

const handleCancelOrder = async () => {
    ElMessageBox.prompt('请输入取消订单的原因', '取消订单', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /.+/,
        inputErrorMessage: '取消原因不能为空',
        type: 'warning',
    }).then(async ({ value }) => {
        try {
            await api.cancelOrder(props.order.订单ID, { cancel_reason: value });
            ElMessage.success('订单已取消');
            emit('close');
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
            await api.confirmOrder(props.order.订单ID);
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
            await api.completeOrder(props.order.订单ID);
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
    ElMessageBox.confirm('确定要拒绝该订单吗?', '拒绝订单', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
    }).then(async () => {
        try {
            await api.rejectOrder(props.order.订单ID);
            ElMessage.success('订单已拒绝');
            emit('close');
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
    if (!props.order?.买家ID || !props.order?.商品ID) {
        ElMessage.error('无法获取买家或商品信息');
        return;
    }
    router.push({
        name: 'messages',
        query: {
            otherUserId: props.order.买家ID,
            productId: props.order.商品ID,
        },
    });
};

const handleContactSeller = () => {
    if (!props.order?.卖家ID || !props.order?.商品ID) {
        ElMessage.error('无法获取卖家或商品信息');
        return;
    }
    router.push({
        name: 'messages',
        query: {
            otherUserId: props.order.卖家ID,
            productId: props.order.商品ID,
        },
    });
};

// 新增：处理查看用户详情逻辑
const handleViewUserDetail = (userId) => {
  selectedUserIdForDetail.value = userId;
  showUserDetailDialog.value = true;
};

// 新增：关闭用户详情对话框时清空选择的用户
const closeUserDetailDialog = () => {
  selectedUserIdForDetail.value = null;
  showUserDetailDialog.value = false;
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
                <el-descriptions-item label="订单号">{{ order.订单ID }}</el-descriptions-item>
                <el-descriptions-item label="商品ID">{{ order.商品ID }}</el-descriptions-item>
                <el-descriptions-item label="商品名称">{{ order.商品名称 || '未知商品' }}</el-descriptions-item>
                <el-descriptions-item label="数量">{{ order.数量 }}</el-descriptions-item>
                <el-descriptions-item label="交易时间">
                    {{ new Date(order.交易时间).toLocaleString() }}
                </el-descriptions-item>
                <el-descriptions-item label="交易地点">{{ order.交易地点 }}</el-descriptions-item>
                <el-descriptions-item label="状态">
                    <el-tag :type="
                        order.订单状态 === 'completed' || order.订单状态 === 'delivered' ? 'success' :
                        order.订单状态 === 'cancelled' || order.订单状态 === 'rejected' ? 'danger' :
                        order.订单状态 === 'pending' || order.订单状态 === 'unpaid' ? 'warning' :
                        'info'
                    ">{{ displayStatus }}</el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="下单时间">{{ new Date(order.创建时间).toLocaleString() }}</el-descriptions-item>
                <el-descriptions-item label="买家">
                    <span @click="handleViewUserDetail(order.买家ID)" style="cursor: pointer; color: #409eff;">{{ order.买家用户名 || '未知买家' }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="卖家">
                    <span @click="handleViewUserDetail(order.卖家ID)" style="cursor: pointer; color: #409eff;">{{ order.卖家用户名 || '未知卖家' }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="完成时间" v-if="order.完成时间">{{ new Date(order.完成时间).toLocaleString() }}</el-descriptions-item>
                <el-descriptions-item label="取消时间" v-if="order.取消时间">{{ new Date(order.取消时间).toLocaleString() }}</el-descriptions-item>
                <el-descriptions-item label="取消原因" v-if="order.取消原因">{{ order.取消原因 }}</el-descriptions-item>
                <el-descriptions-item label="物流信息" v-if="order.shipping_info">{{ order.shipping_info }}</el-descriptions-item>
                </el-descriptions>

            <div style="margin-top: 20px;">
                <h3>操作</h3>
                <el-button v-if="isBuyer" type="warning" @click="handleCancelOrder" :disabled="order.订单状态 !== 'PendingSellerConfirmation' && order.订单状态 !== 'ConfirmedBySeller'">取消订单</el-button>
                <el-button v-if="isSeller" type="success" @click="handleConfirmOrder" :disabled="order.订单状态 !== 'PendingSellerConfirmation'">确认订单</el-button>
                <el-button v-if="isBuyer" type="primary" @click="handleCompleteOrder" :disabled="order.订单状态 !== 'ConfirmedBySeller'">标记完成</el-button>
                <el-button v-if="isSeller" type="danger" @click="handleRejectOrder" :disabled="order.订单状态 !== 'PendingSellerConfirmation'">拒绝订单</el-button>
                <el-button v-if="isBuyer && order.卖家ID" @click="handleContactSeller">联系卖家</el-button>
                <el-button v-if="isSeller && order.买家ID" @click="handleContactBuyer">联系买家</el-button>
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

    <!-- 用户详情对话框 -->
    <UserDetailDialog
        v-model:visible="showUserDetailDialog"
        :user-id="selectedUserIdForDetail"
        @close="closeUserDetailDialog"
    />
</template>

<style scoped>
.dialog-footer {
    text-align: right;
}
</style>