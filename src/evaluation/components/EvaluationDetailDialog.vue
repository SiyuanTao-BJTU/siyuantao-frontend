<script setup>
import { ref, watch, defineProps, defineEmits } from 'vue';
import UserDetailDialog from '@/user/components/UserDetailDialog.vue'; // 导入用户详情对话框组件
import { ElMessage } from 'element-plus';

const props = defineProps({
    visible: {
        type: Boolean,
        default: false,
    },
    evaluation: {
        type: Object,
        default: null,
    },
});

const emit = defineEmits(['close', 'update:visible']);

const dialogVisibleInternal = ref(props.visible);

// 新增：用户详情对话框相关状态
const showUserDetailDialog = ref(false);
const selectedUserIdForDetail = ref(null);

watch(() => props.visible, (newVal) => {
    dialogVisibleInternal.value = newVal;
});

watch(dialogVisibleInternal, (newVal) => {
    emit('update:visible', newVal);
});

const handleClose = () => {
    dialogVisibleInternal.value = false;
    emit('close');
};

const formatTime = (isoString) => {
    if (!isoString) return 'N/A';
    try {
        return new Date(isoString).toLocaleString();
    } catch (e) {
        console.error('Error formatting date:', e);
        return isoString; // Fallback to original string if error
    }
};

// 新增：处理查看用户详情逻辑
const handleViewUserDetail = (userId) => {
  if (!userId) { // 检查 userId 是否有效
    ElMessage.warning('无法获取用户ID。');
    return;
  }
  selectedUserIdForDetail.value = String(userId); // 确保转换为字符串
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
        title="评价详情"
        v-model="dialogVisibleInternal"
        width="50%"
        :before-close="handleClose"
        class="evaluation-detail-dialog"
    >
        <div v-if="evaluation" class="detail-content">
            <el-descriptions :column="2" border>
                <el-descriptions-item label="评价ID">
                    <span class="detail-value">{{ evaluation.评价ID }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="订单ID">
                    <span class="detail-value">{{ evaluation.订单ID }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="商品ID">
                    <span class="detail-value">{{ evaluation.商品ID }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="商品名称">
                    <span class="detail-value">{{ evaluation.商品名称 }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="买家用户名">
                    <span class="detail-value" v-if="evaluation.买家ID" @click="handleViewUserDetail(evaluation.买家ID)" style="cursor: pointer; color: #409eff;">{{ evaluation.买家用户名 }}</span>
                    <span class="detail-value" v-else>{{ evaluation.买家用户名 }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="卖家用户名">
                    <span class="detail-value" v-if="evaluation.卖家ID" @click="handleViewUserDetail(evaluation.卖家ID)" style="cursor: pointer; color: #409eff;">{{ evaluation.卖家用户名 }}</span>
                    <span class="detail-value" v-else>{{ evaluation.卖家用户名 }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="评分">
                    <el-rate v-model="evaluation.评分" disabled text-color="#ff9900" :max="5" />
                </el-descriptions-item>
                <el-descriptions-item label="创建时间">
                    <span class="detail-value">{{ formatTime(evaluation.创建时间) }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="评价内容" :span="2">
                    <span class="detail-value">{{ evaluation.评价内容 || '无' }}</span>
                </el-descriptions-item>
            </el-descriptions>
        </div>
        <div v-else class="no-data-placeholder">
            <el-empty description="未选择评价或评价数据缺失" />
        </div>

        <template #footer>
            <span class="dialog-footer">
                <el-button @click="handleClose">关闭</el-button>
            </span>
        </template>
    </el-dialog>

    <!-- 用户详情对话框 -->
    <UserDetailDialog
        v-if="showUserDetailDialog"
        v-model:visible="showUserDetailDialog"
        :user-id="selectedUserIdForDetail"
        @close="closeUserDetailDialog"
    />
</template>

<style scoped>
.evaluation-detail-dialog .el-dialog__body {
    padding: 20px;
}

.detail-content {
    /* Additional styling for content if needed */
}

.detail-value {
    font-weight: 500;
    color: #303133;
    word-break: break-all; /* Ensure long IDs break correctly */
}

.el-descriptions {
    margin-top: 20px;
}

.no-data-placeholder {
    padding: 40px 0;
}
</style> 