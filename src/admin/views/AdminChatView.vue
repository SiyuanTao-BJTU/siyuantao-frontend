<template>
  <div class="admin-chat-view">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span><el-icon><ChatDotRound /></el-icon> 聊天消息管理</span>
        </div>
      </template>

      <div class="filter-controls mb-4">
        <el-input
          v-model="searchQuery"
          placeholder="按消息内容或用户ID搜索"
          clearable
          style="width: 300px; margin-right: 10px;"
          @clear="fetchMessages"
          @input="debounceSearch"
        ></el-input>
        <el-button type="primary" @click="fetchMessages">搜索</el-button>
      </div>

      <el-table
        :data="chatMessages"
        v-loading="loading"
        style="width: 100%"
        border
        fit
        highlight-current-row
        class="message-table"
      >
        <el-table-column label="消息ID" prop="消息ID" width="280"></el-table-column>
        <el-table-column label="发送者" width="180">
          <template #default="scope">
            <el-link type="primary" @click="viewUserProfile(scope.row.发送者ID)">{{ scope.row.发送者用户名 || '未知用户' }}</el-link>
            <el-tag size="small" v-if="scope.row.发送者ID === currentAdminId" type="info">我</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="接收者" width="180">
          <template #default="scope">
            <el-link type="primary" @click="viewUserProfile(scope.row.接收者ID)">{{ scope.row.接收者用户名 || '未知用户' }}</el-link>
          </template>
        </el-table-column>
        <el-table-column label="商品" width="200">
          <template #default="scope">
            <el-link type="info" @click="goToProductDetail(scope.row.商品ID)">{{ scope.row.商品名称 || '未知商品' }}</el-link>
          </template>
        </el-table-column>
        <el-table-column label="消息内容" prop="消息内容" min-width="300"></el-table-column>
        <el-table-column label="发送时间" prop="发送时间" width="180">
          <template #default="scope">
            {{ formatDateTime(scope.row.发送时间) }}
          </template>
        </el-table-column>
        <el-table-column label="发送者可见" prop="发送者可见" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.发送者可见 ? 'success' : 'danger'">{{ scope.row.发送者可见 ? '可见' : '隐藏' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="接收者可见" prop="接收者可见" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.接收者可见 ? 'success' : 'danger'">{{ scope.row.接收者可见 ? '可见' : '隐藏' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button link type="danger" @click="confirmHideMessage(scope.row)">隐藏</el-button>
            <el-button link type="success" @click="confirmShowMessage(scope.row)">显示</el-button>
            <el-button v-if="isSuperAdmin" link type="danger" @click="confirmDeleteMessage(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="pagination.currentPage"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pagination.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="pagination.total"
        background
        class="mt-4"
      ></el-pagination>
    </el-card>

    <!-- User Detail Dialog -->
    <user-detail-dialog v-model:visible="userDetailDialog" :user-id="selectedUserId" @close="userDetailDialog = false"></user-detail-dialog>

    <!-- Confirm Action Dialog -->
    <el-dialog
      v-model="confirmActionDialog"
      :title="actionDialogTitle"
      width="400px"
    >
      <span>{{ actionDialogContent }}</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="confirmActionDialog = false">取消</el-button>
          <el-button
            :type="actionDialogButtonType"
            @click="executeMessageAction"
          >
            {{ actionDialogButtonText }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { mapActions, mapState, mapGetters } from 'vuex';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ChatDotRound } from '@element-plus/icons-vue';
import UserDetailDialog from '@/user/components/UserDetailDialog.vue';

let debounceTimer = null;

export default {
  name: 'AdminChatView',
  components: {
    ChatDotRound,
    UserDetailDialog,
  },
  data() {
    return {
      chatMessages: [],
      loading: false,
      searchQuery: '',
      pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0,
      },
      userDetailDialog: false,
      selectedUserId: null,
      confirmActionDialog: false, // Unified dialog for all actions
      messageToProcess: null, // The message object for the current action
      currentAction: null, // 'hide', 'show', or 'delete'
    };
  },
  computed: {
    ...mapGetters('user', ['currentUser', 'isSuperAdmin']),
    currentAdminId() {
      return this.currentUser?.用户ID; // Assuming currentUser has '用户ID'
    },
    actionDialogTitle() {
      if (this.currentAction === 'hide') return '隐藏消息';
      if (this.currentAction === 'show') return '显示消息';
      if (this.currentAction === 'delete') return '删除消息';
      return '';
    },
    actionDialogContent() {
      if (this.currentAction === 'hide') return '您确定要隐藏此消息吗？';
      if (this.currentAction === 'show') return '您确定要显示此消息吗？';
      if (this.currentAction === 'delete') return '您确定要物理删除此消息吗？此操作不可逆！';
      return '';
    },
    actionDialogButtonType() {
      if (this.currentAction === 'hide' || this.currentAction === 'delete') return 'danger';
      if (this.currentAction === 'show') return 'success';
      return '';
    },
    actionDialogButtonText() {
      if (this.currentAction === 'hide') return '确定隐藏';
      if (this.currentAction === 'show') return '确定显示';
      if (this.currentAction === 'delete') return '确定删除';
      return '';
    },
  },
  created() {
    this.fetchMessages();
  },
  methods: {
    ...mapActions('admin', ['fetchAdminChatMessages', 'updateAdminMessageVisibility', 'deleteAdminChatMessage']),
    ...mapActions('user', ['fetchUserPublicProfile']),

    async fetchMessages() {
      this.loading = true;
      try {
        const params = {
          page_number: this.pagination.currentPage,
          page_size: this.pagination.pageSize,
          search_query: this.searchQuery,
        };
        const response = await this.fetchAdminChatMessages(params);
        
        // 假设 response 包含 messages 和 total_count 两个字段
        this.chatMessages = response.messages; // 将消息数组赋值给 chatMessages
        this.pagination.total = response.total_count; // 将总数赋值给 pagination.total

      } catch (error) {
        console.error('获取聊天消息失败:', error);
        ElMessage.error('获取聊天消息失败!');
      } finally {
        this.loading = false;
      }
    },
    debounceSearch() {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        this.pagination.currentPage = 1;
        this.fetchMessages();
      }, 500); // 500ms debounce time
    },
    formatDateTime(dateTimeString) {
      if (!dateTimeString) return '';
      const date = new Date(dateTimeString);
      return date.toLocaleString();
    },
    handleSizeChange(val) {
      this.pagination.pageSize = val;
      this.pagination.currentPage = 1; // Reset to first page when page size changes
      this.fetchMessages();
    },
    handleCurrentChange(val) {
      this.pagination.currentPage = val;
      this.fetchMessages();
    },
    viewUserProfile(userId) {
      this.selectedUserId = userId;
      this.userDetailDialog = true;
    },
    goToProductDetail(productId) {
      // This assumes you have a route named 'ProductDetail'
      this.$router.push({ name: 'ProductDetail', params: { id: productId } });
    },
    confirmHideMessage(message) {
      this.messageToProcess = message;
      this.currentAction = 'hide';
      this.confirmActionDialog = true;
    },
    confirmShowMessage(message) {
      this.messageToProcess = message;
      this.currentAction = 'show';
      this.confirmActionDialog = true;
    },
    confirmDeleteMessage(message) {
      this.messageToProcess = message;
      this.currentAction = 'delete';
      this.confirmActionDialog = true;
    },
    async executeMessageAction() {
      if (!this.messageToProcess) return;

      const message = this.messageToProcess;
      const action = this.currentAction;

      try {
        if (action === 'hide' || action === 'show') {
          const visible = action === 'show';
          await this.updateAdminMessageVisibility({
            messageId: message['消息ID'],
            senderVisible: visible,
            receiverVisible: visible,
          });
          ElMessage.success(`${visible ? '显示' : '隐藏'}消息成功！`);
        } else if (action === 'delete') {
          await this.deleteAdminChatMessage(message['消息ID']);
          ElMessage.success('消息物理删除成功！');
        }

        this.confirmActionDialog = false;
        this.messageToProcess = null; // Clear processed message
        this.currentAction = null; // Clear current action
        this.fetchMessages(); // Refresh message list
      } catch (error) {
        console.error(`${action === 'hide' ? '隐藏' : action === 'show' ? '显示' : '删除'}消息失败:`, error);
        ElMessage.error(`${action === 'hide' ? '隐藏' : action === 'show' ? '显示' : '删除'}消息失败: ` + (error.response?.data?.detail || error.message));
      }
    },
  },
};
</script>

<style scoped>
.admin-chat-view {
  padding: 20px;
  background-color: #f0f2f5;
  min-height: calc(100vh - 60px); /* Adjust based on your layout */
}

.box-card {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  align-items: center;
  font-size: 20px;
  font-weight: bold;
  color: #303133;
}

.card-header .el-icon {
  margin-right: 8px;
  font-size: 24px;
  color: #409eff;
}

.filter-controls {
  display: flex;
  align-items: center;
}

.message-table {
  margin-top: 20px;
}

.el-pagination {
  justify-content: flex-end;
}

.dialog-footer {
  text-align: right;
}
</style> 