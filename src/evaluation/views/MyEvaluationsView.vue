<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import api from '@/API_PRO.js';
import EvaluationCard from '@/evaluation/components/EvaluationCard.vue';
import EvaluationDetailDialog from '@/evaluation/components/EvaluationDetailDialog.vue';

const activeTab = ref('made'); // 默认激活的 Tab
const myEvaluationsMade = ref([]); // 我发出的评价
const myEvaluationsReceived = ref([]); // 我收到的评价
const loading = ref(false);
const error = ref(null);

// 评价详情对话框相关状态
const showDetailDialog = ref(false);
const selectedEvaluation = ref(null);

const fetchMyEvaluations = async () => {
    loading.value = true;
    error.value = null;
    try {
        // 获取我发出的评价 (作为买家)
        const madeResponse = await api.getMyEvaluations();
        myEvaluationsMade.value = madeResponse;

        // 获取我收到的评价 (作为卖家)
        const receivedResponse = await api.getMyEvaluationsReceived();
        myEvaluationsReceived.value = receivedResponse;

        if (myEvaluationsMade.value.length === 0 && myEvaluationsReceived.value.length === 0) {
            ElMessage.info('您还没有发布或收到任何评价。');
        }
    } catch (err) {
        console.error('获取我的评价失败:', err);
        error.value = '加载我的评价失败，请稍后重试。' + (err.response?.data?.detail || err.message);
        ElMessage.error(error.value);
    } finally {
        loading.value = false;
    }
};

const handleViewDetails = (evaluation) => {
    selectedEvaluation.value = evaluation;
    showDetailDialog.value = true;
};

const closeDetailDialog = () => {
    selectedEvaluation.value = null;
    showDetailDialog.value = false;
};

onMounted(() => {
    fetchMyEvaluations();
});
</script>

<template>
    <div class="my-evaluations-view">
        <h1>我的评价</h1>

        <el-tabs v-model="activeTab" class="evaluation-tabs">
            <el-tab-pane label="我发出的评价" name="made">
                <div v-if="loading" class="loading-state">
                    <el-skeleton animated :rows="5" />
                </div>
                <div v-else-if="error" class="error-state">
                    <el-empty description="加载我发出的评价失败" />
                </div>
                <div v-else-if="myEvaluationsMade.length === 0" class="empty-state">
                    <el-empty description="您还没有发出任何评价" />
                </div>
                <div v-else class="evaluations-grid">
                    <EvaluationCard
                        v-for="evaluation in myEvaluationsMade"
                        :key="evaluation.评价ID"
                        :evaluation="evaluation"
                        @view-details="handleViewDetails"
                    />
                </div>
            </el-tab-pane>
            <el-tab-pane label="我收到的评价" name="received">
                <div v-if="loading" class="loading-state">
                    <el-skeleton animated :rows="5" />
                </div>
                <div v-else-if="error" class="error-state">
                    <el-empty description="加载我收到的评价失败" />
                </div>
                <div v-else-if="myEvaluationsReceived.length === 0" class="empty-state">
                    <el-empty description="您还没有收到任何评价" />
                </div>
                <div v-else class="evaluations-grid">
                    <EvaluationCard
                        v-for="evaluation in myEvaluationsReceived"
                        :key="evaluation.评价ID"
                        :evaluation="evaluation"
                        @view-details="handleViewDetails"
                    />
                </div>
            </el-tab-pane>
        </el-tabs>

        <!-- 评价详情对话框 -->
        <EvaluationDetailDialog
            :visible="showDetailDialog"
            :evaluation="selectedEvaluation"
            @close="closeDetailDialog"
            @update:visible="showDetailDialog = $event"
        />
    </div>
</template>

<style scoped>
.my-evaluations-view {
    padding: 20px;
}

h1 {
    margin-bottom: 20px;
    color: #303133;
}

.evaluation-tabs {
    margin-top: 20px;
}

.loading-state, .error-state, .empty-state {
    min-height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.evaluations-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
}
</style> 