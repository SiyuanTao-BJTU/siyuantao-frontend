<script setup>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import api from '@/API_PRO.js'; // 确保路径正确

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

const rating = ref(5);
const comment = ref('');
const submitting = ref(false);

const closeDialog = () => {
    emit('close');
};

const submitEvaluation = async () => {
    if (!props.order?.订单ID) {
        ElMessage.error('无法获取订单信息，无法评价。');
        return;
    }

    submitting.value = true;
    try {
        const response = await api.createEvaluation({
            order_id: props.order.订单ID,
            rating: rating.value,
            comment: comment.value,
        });
        ElMessage.success('评价成功');
        emit('close');
        // 可以通知父组件更新订单状态，标记为已评价
    } catch (err) {
        console.error('发布评价失败:', err);
        ElMessage.error('发布评价失败，请检查输入或稍后重试。');
    } finally {
        submitting.value = false;
    }
};
</script>

<template>
    <el-dialog
        title="发布评价"
        :model-value="visible"
        width="45%"
        @close="closeDialog"
        class="create-evaluation-dialog"
    >
        <div v-if="order" class="evaluation-form-container">
            <el-form label-width="90px">
                <el-form-item label="商品名称">
                    <span class="product-name-display">{{ order?.商品名称 || '未知商品' }}</span>
                </el-form-item>
                <el-form-item label="您的评分">
                    <el-rate v-model="rating" show-text :texts="['很差', '差', '一般', '好', '很好']" :max="5" />
                </el-form-item>
                <el-form-item label="评价内容">
                    <el-input 
                        v-model="comment" 
                        type="textarea" 
                        :rows="4" 
                        placeholder="请填写您的评价，帮助其他用户了解商品..." 
                        maxlength="200" 
                        show-word-limit 
                    />
                </el-form-item>
            </el-form>
        </div>
        <div v-else class="no-order-info-placeholder">
            <el-empty description="无法获取订单信息，无法评价。" />
        </div>

        <template #footer>
            <span class="dialog-footer">
                <el-button @click="closeDialog">取消</el-button>
                <el-button type="primary" @click="submitEvaluation" :loading="submitting" :disabled="!order?.订单ID || submitting">提交评价</el-button>
            </span>
        </template>
    </el-dialog>
</template>

<style scoped>
.create-evaluation-dialog {
    /* Optionally adjust dialog width or general styling */
}

.evaluation-form-container {
    padding: 20px; /* Add padding for better visual spacing */
}

.product-name-display {
    font-weight: bold;
    color: #303133;
    font-size: 16px;
}

.el-form-item {
    margin-bottom: 20px; /* Consistent spacing between form items */
}

.dialog-footer {
    text-align: right;
    padding-top: 10px; /* Add some space above buttons */
}
</style>