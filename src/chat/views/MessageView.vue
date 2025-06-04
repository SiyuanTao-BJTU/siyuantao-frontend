<template>
  <div class="chat-container">
    <div class="chat-layout-wrapper">
      <!-- Left Column: Conversation List -->
      <div class="conversation-list-col">
        <el-card class="conversation-card">
          <template #header>
            <div class="card-header">
              <span>我的消息</span>
              <el-icon><ChatDotRound /></el-icon>
            </div>
          </template>
          <div class="conversation-list-content">
            <div v-if="conversations.length === 0" class="no-conversation-placeholder">
              <p class="text-center text--disabled">暂无聊天会话</p>
            </div>
            <div v-else class="conversation-list-group">
              <div
                v-for="(session, index) in conversations"
                :key="session.session_id"
                class="conversation-list-item"
                :class="{ 'selected-conversation': selectedConversation && selectedConversation.session_id === session.session_id }"
                @click="selectConversation(session)"
              >
                <div class="conversation-list-item-avatar">
                  <el-avatar :size="48" :src="session.other_avatar_url || 'https://via.placeholder.com/48'"></el-avatar>
                </div>
                <div class="conversation-list-item-content">
                  <div class="conversation-list-item-title">
                      <el-link type="primary" @click.stop="viewUserProfile(session.other_user_id)">{{ session.other_username }}</el-link>
                  </div>
                  <div class="conversation-list-item-subtitle text-truncate">
                      <img v-if="session.product_image_url" :src="session.product_image_url" class="product-thumbnail" alt="商品图片">
                      {{ session.product_name }}
                  </div>
                  <div class="conversation-list-item-subtitle text-truncate">{{ session.last_message_content || '暂无消息' }}</div>
                </div>
                <div class="conversation-list-item-action">
                  <el-badge
                    v-if="session.unread_count > 0"
                    :value="session.unread_count > 99 ? '99+' : session.unread_count"
                    type="danger"
                  ></el-badge>
                  <el-button link :icon="DeleteIcon" @click.stop="confirmHideConversation(session)"></el-button>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- Right Column: Chat Messages -->
      <div class="chat-messages-col">
        <el-card class="chat-card d-flex flex-column">
          <template #header>
            <div v-if="selectedConversation" class="card-header chat-header">
              <el-avatar :size="36" :src="selectedConversation.other_avatar_url || 'https://via.placeholder.com/36'" class="mr-3"></el-avatar>
              <span class="font-weight-medium">
                  <el-link type="primary" @click="viewUserProfile(selectedConversation.other_user_id)">{{ selectedConversation.other_username }}</el-link>
              </span>
              <el-tag
                size="small"
                type="primary"
                class="ml-3"
                @click="goToProductDetail(selectedConversation.product_id)"
                v-if="selectedConversation.product_name"
              >
                {{ selectedConversation.product_name }}
                <el-icon><Link /></el-icon>
              </el-tag>
              <div style="flex-grow: 1;"></div>
              <el-button link :icon="UserIcon" @click="viewUserProfile(selectedConversation.other_user_id)"></el-button>
            </div>
            <div v-else class="card-header chat-header">
              请选择一个会话开始聊天
            </div>
          </template>

          <div class="chat-messages-content" ref="chatMessagesContainer">
            <div v-if="selectedConversation" class="d-flex flex-column">
              <div
                v-for="message in currentChatMessages"
                :key="message.消息ID"
                :class="['d-flex mb-4', message.发送者ID === currentUser.用户ID ? 'justify-end' : 'justify-start']"
              >
                <div v-if="message.发送者ID !== currentUser.用户ID" class="message-avatar mr-3">
                  <el-avatar style="width: 36px; height: 36px;" :src="selectedConversation.other_avatar_url || 'https://via.placeholder.com/36'"></el-avatar>
                </div>
                <div
                  :class="['message-bubble', message.发送者ID === currentUser.用户ID ? 'sent' : 'received']"
                >
                  <div class="message-content pa-3">
                    <div class="message-text">{{ message.消息内容 }}</div>
                    <div class="message-time text-right text-caption text--disabled mt-1">
                      {{ formatDateTime(message.发送时间) }}
                    </div>
                  </div>
                </div>
                <div v-if="message.发送者ID === currentUser.用户ID" class="message-avatar ml-3">
                  <el-avatar style="width: 36px; height: 36px;" :src="currentUser.avatar_url || 'https://via.placeholder.com/36'"></el-avatar>
                </div>
              </div>
            </div>
            <div v-else class="d-flex align-center justify-center fill-height text--disabled">
              <p>从左侧选择一个会话或通过商品详情页的"联系卖家"按钮发起新会话。</p>
            </div>
          </div>

          <div v-if="selectedConversation" class="chat-input-area">
            <el-input
              v-model="newMessageContent"
              placeholder="输入消息..."
              clearable
              class="message-input"
              @keypress.enter="sendMessage"
            ></el-input>
            <el-dropdown trigger="click" class="ml-2">
              <el-button type="info" :icon="ChatDotRoundIcon" circle></el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item v-for="(phrase, index) in commonPhrases" :key="index" @click="selectCommonPhrase(phrase)">
                    {{ phrase }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-button type="primary" class="ml-2" @click="sendMessage" :disabled="!newMessageContent.trim()">
              发送
              <el-icon class="el-icon--right"><Promotion /></el-icon>
            </el-button>
          </div>
        </el-card>
      </div>
    </div>

    <!-- User Detail Dialog -->
    <user-detail-dialog v-model:visible="userDetailDialog" :user-id="selectedUserId" @close="userDetailDialog = false"></user-detail-dialog>

    <!-- Confirm Hide Conversation Dialog -->
    <el-dialog v-model="confirmHideDialog" title="隐藏聊天会话" width="500px">
      <span>您确定要隐藏此聊天会话吗？隐藏后，此会话将不再显示在您的会话列表中，但消息记录不会被删除。</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="confirmHideDialog = false">取消</el-button>
          <el-button type="danger" @click="hideConversation">隐藏</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex';
import UserDetailDialog from '@/user/components/UserDetailDialog.vue';
import { ChatDotRound, Link, Promotion, Delete, User } from '@element-plus/icons-vue'; // Import Element Plus icons
import { markRaw } from 'vue'; // Import markRaw

export default {
  name: 'MessageView',
  components: {
    UserDetailDialog,
    ChatDotRound, // Register Element Plus icons
    Link,
    Promotion,
  },
  data() {
    return {
      selectedConversation: null,
      selectedConversationIndex: -1,
      newMessageContent: '',
      userDetailDialog: false,
      selectedUserId: null,
      confirmHideDialog: false,
      conversationToHide: null,
      DeleteIcon: markRaw(Delete), // Expose imported Delete icon to template, marked as raw
      UserIcon: markRaw(User),     // Expose imported User icon to template, marked as raw
      ChatDotRoundIcon: markRaw(ChatDotRound), // Mark ChatDotRound for raw usage
      LinkIcon: markRaw(Link), // Mark Link for raw usage
      PromotionIcon: markRaw(Promotion), // Mark Promotion for raw usage
    };
  },
  computed: {
    ...mapState('chat', ['conversations', 'currentChatMessages', 'commonPhrases']),
    ...mapGetters('user', ['currentUser']),
  },
  watch: {
    '$route.query': {
      immediate: true,
      async handler(newQuery) {
        const { otherUserId, productId } = newQuery;
        if (otherUserId && productId) {
          await this.loadConversations();
          const existingSession = this.conversations.find(
            (s) => s.other_user_id === otherUserId && s.product_id === productId
          );
          if (existingSession) {
            this.selectConversation(existingSession);
          } else {
            const otherUserProfile = await this.fetchUserPublicProfile(otherUserId);
            const productDetails = await this.$store.dispatch('product/fetchProductDetail', productId);

            const tempSession = {
              session_id: productId,
              other_user_id: otherUserId,
              product_id: productId,
              other_username: otherUserProfile?.username || '未知用户',
              other_avatar_url: otherUserProfile?.avatar_url || null,
              product_name: productDetails?.商品名称 || '未知商品',
              product_image_url: productDetails?.主图URL || null,
              last_message_content: '',
              last_message_time: new Date().toISOString(),
              unread_count: 0,
            };
            this.conversations.unshift(tempSession);
            this.selectedConversation = tempSession;
            this.selectedConversationIndex = 0;

            this.$nextTick(() => {
              this.scrollToBottom();
            });
          }
        } else {
          await this.loadConversations();
          if (this.conversations.length > 0) {
            this.selectConversation(this.conversations[0]);
          }
        }
      },
    },
  },
  async created() {
    // initial load is handled by watch on $route.query
  },
  methods: {
    ...mapActions('chat', ['fetchConversations', 'fetchChatMessages', 'sendMessage', 'hideConversation']),
    ...mapActions('user', ['fetchCurrentUserProfile', 'fetchUserPublicProfile']),

    async loadConversations() {
      try {
        await this.fetchConversations();
        this.conversations.forEach(async (session) => {
            if (session.product_id && !session.product_image_url) {
                const productDetails = await this.$store.dispatch('product/fetchProductDetail', session.product_id);
                if (productDetails && productDetails.主图URL) {
                    session.product_image_url = productDetails.主图URL;
                }
            }
        });
      } catch (error) {
        console.error('加载聊天会话失败:', error);
        this.$message.error('加载聊天会话失败!');
      }
    },

    async selectConversation(session) {
      this.selectedConversation = session;
      this.selectedConversationIndex = this.conversations.findIndex(
        (s) => s.session_id === session.session_id
      );

      try {
        await this.fetchChatMessages({
          otherUserId: session.other_user_id,
          productId: session.product_id,
        });
        await this.loadConversations();

        this.$nextTick(() => {
          this.scrollToBottom();
        });
      } catch (error) {
        console.error('获取消息记录失败:', error);
        this.$message.error('获取消息记录失败!');
      }
    },
    async sendMessage() {
      if (!this.newMessageContent.trim() || !this.selectedConversation) return;

      const messageData = {
        receiver_id: this.selectedConversation.other_user_id,
        product_id: this.selectedConversation.product_id,
        content: this.newMessageContent.trim(),
      };

      try {
        await this.$store.dispatch('chat/sendMessage', messageData);
        this.newMessageContent = '';
        await this.fetchChatMessages({
          otherUserId: this.selectedConversation.other_user_id,
          productId: this.selectedConversation.product_id,
        });
        await this.loadConversations();

        this.$nextTick(() => {
          this.scrollToBottom();
        });
      } catch (error) {
        console.error('发送消息失败:', error);
        this.$message.error('发送消息失败!');
      }
    },
    formatDateTime(dateTimeString) {
      if (!dateTimeString) return '';
      const date = new Date(dateTimeString);
      return date.toLocaleString();
    },
    scrollToBottom() {
      const container = this.$refs.chatMessagesContainer;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    },
    goToProductDetail(productId) {
      this.$router.push({ name: 'ProductDetail', params: { id: productId } });
    },
    viewUserProfile(userId) {
      this.selectedUserId = userId;
      this.userDetailDialog = true;
    },
    confirmHideConversation(session) {
      this.conversationToHide = session;
      this.confirmHideDialog = true;
    },
    async hideConversation() {
      if (this.conversationToHide) {
        try {
          await this.hideConversation({
            otherUserId: this.conversationToHide.other_user_id,
            productId: this.conversationToHide.product_id,
          });
          this.$message.success('会话已隐藏!');
          this.confirmHideDialog = false;
          this.conversationToHide = null;
          if (this.selectedConversation &&
              this.selectedConversation.other_user_id === this.conversationToHide.other_user_id &&
              this.selectedConversation.product_id === this.conversationToHide.product_id) {
            this.selectedConversation = null;
            this.selectedConversationIndex = -1;
          }
          await this.loadConversations();
        } catch (error) {
          console.error('隐藏会话失败:', error);
          this.$message.error('隐藏会话失败!');
        }
      }
    },
    selectCommonPhrase(phrase) {
      this.newMessageContent = phrase;
    },
  },
  mounted() {
    this.scrollToBottom();
    this.fetchCurrentUserProfile();
  },
};
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 20px;
  background-color: #f0f2f5;
  box-sizing: border-box;
}

.chat-layout-wrapper {
  display: flex;
  flex-grow: 1;
  gap: 20px;
}

.conversation-list-col {
  flex-basis: 280px;
  flex-grow: 0;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
}

.chat-messages-col {
  flex-basis: 0;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.conversation-card,
.chat-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  border-bottom: 1px solid #ebeef5;
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.card-header .el-icon {
  font-size: 24px;
  color: #409eff;
}

.chat-header .el-avatar {
  margin-right: 12px;
}

.chat-header .el-tag {
  margin-left: 12px;
  cursor: pointer;
}

.chat-header .el-tag .el-icon {
  font-size: 14px;
  margin-left: 5px;
}

.conversation-list-content {
  flex-grow: 1;
  overflow-y: auto;
  padding: 10px 0;
}

.conversation-list-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  cursor: pointer;
  border-bottom: 1px solid #f0f2f5;
  transition: background-color 0.2s ease;
}

.conversation-list-item:hover {
  background-color: #f5f7fa;
}

.conversation-list-item.selected-conversation {
  background-color: #e6f7ff;
  border-left: 4px solid #409eff;
}

.conversation-list-item-avatar {
  margin-right: 15px;
}

.conversation-list-item-content {
  flex-grow: 1;
  overflow: hidden;
}

.conversation-list-item-title {
  font-weight: 500;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}

.conversation-list-item-subtitle {
  font-size: 13px;
  color: #909399;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  gap: 5px;
}

.product-thumbnail {
    width: 32px;
    height: 32px;
    object-fit: cover;
    border-radius: 4px;
    flex-shrink: 0;
}

.conversation-list-item-action {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 15px;
}

.el-badge {
  margin-right: 8px;
}

.chat-messages-content {
  flex-grow: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: #fbfbfb;
}

.message-bubble {
  max-width: 70%;
  border-radius: 10px;
  padding: 10px 15px;
  line-height: 1.5;
  word-wrap: break-word;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.message-bubble.sent {
  background-color: #e1f5fe;
  align-self: flex-end;
}

.message-bubble.received {
  background-color: #ffffff;
  align-self: flex-start;
}

.message-text {
  color: #303133;
}

.message-time {
  font-size: 11px;
  color: #909399;
  margin-top: 5px;
}

.message-avatar {
  flex-shrink: 0;
}

.chat-input-area {
  display: flex;
  padding: 15px 20px;
  border-top: 1px solid #ebeef5;
  background-color: #ffffff;
}

.message-input {
  flex-grow: 1;
  margin-right: 10px;
}

.no-conversation-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #909399;
  font-size: 16px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>