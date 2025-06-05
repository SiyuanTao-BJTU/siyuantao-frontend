<template>
  <div class="chat-container">
    <div class="chat-layout-wrapper" :class="{ 'collapsed': isConversationListCollapsed }">
      <!-- Left Column: Conversation List -->
      <div class="conversation-list-col">
        <el-card class="conversation-card">
          <template #header>
            <div class="card-header">
              <span>我的消息</span>
              <div>
                <el-button link :icon="isConversationListCollapsed ? ExpandIcon : FoldIcon" @click="toggleConversationList" style="margin-right: 8px;"></el-button>
                <el-icon><ChatDotRound /></el-icon>
              </div>
            </div>
          </template>
          <div class="conversation-list-content">
            <div v-if="conversations.length === 0" class="no-conversation-placeholder">
              <p class="text-center text--disabled">暂无聊天会话</p>
            </div>
            <div v-else class="conversation-list-group">
              <div
                v-for="(session, index) in conversations"
                :key="session.session_id || index" 
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
                      <span>{{ session.product_name }}</span>
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
                @click="openProductDetail(selectedConversation.product_id)"
                v-if="selectedConversation.product_name"
                style="cursor: pointer;"
              >
                {{ selectedConversation.product_name }}
                <el-icon><LinkIcon /></el-icon>
              </el-tag>
              <div style="flex-grow: 1;"></div>
              <el-button link :icon="UserIcon" @click="viewUserProfile(selectedConversation.other_user_id)"></el-button>
            </div>
            <div v-else class="card-header chat-header">
              请选择一个会话开始聊天
            </div>
          </template>

          <div class="chat-messages-content" ref="chatMessagesContainer">
            <div v-if="selectedConversation" class="messages-wrapper">
              <div
                v-for="message in currentChatMessages"
                :key="message.message_id" 
                :class="['message-item', message.sender_id === currentUser.user_id ? 'sent' : 'received']"
              >
                <!-- Avatar for received messages (other user on the left) -->
                <div v-if="message.sender_id !== currentUser.user_id" class="message-avatar">
                  <el-avatar style="width: 36px; height: 36px;" :src="selectedConversation.other_avatar_url || 'https://via.placeholder.com/36'"></el-avatar>
                </div>

                <!-- Message Bubble -->
                <div class="message-bubble">
                  <div class="message-content pa-3">
                    <div class="message-text">{{ message.content }}</div>
                    <div class="message-time text-right text-caption text--disabled mt-1">
                      {{ formatDateTime(message.send_time) }}
                    </div>
                  </div>
                </div>

                <!-- Avatar for sent messages (own user on the right) -->
                <div v-if="message.sender_id === currentUser.user_id" class="message-avatar">
                  <el-avatar style="width: 36px; height: 36px;" :src="currentUser.avatar_url || 'https://via.placeholder.com/36'"></el-avatar>
                </div>
              </div>
            </div>
            <div v-else class="no-messages-placeholder">
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
              <el-icon class="el-icon--right"><PromotionIcon /></el-icon>
            </el-button>
          </div>
        </el-card>
      </div>
    </div>

    <!-- User Detail Dialog -->
    <user-detail-dialog v-model:visible="userDetailDialog" :user-id="selectedUserId" @close="userDetailDialog = false"></user-detail-dialog>
    
    <!-- Product Detail Dialog -->
    <ProductDetail
      v-if="productDetailVisible"
      :product-id="selectedProductId"
      v-model:dialog-visible="productDetailVisible"
      @close="productDetailVisible = false"
    />

    <!-- Confirm Hide Conversation Dialog -->
    <el-dialog v-model="confirmHideDialog" title="隐藏聊天会话" width="500px">
      <span>您确定要隐藏此聊天会话吗？隐藏后，此会话将不再显示在您的会话列表中，但消息记录不会被删除。</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="confirmHideDialog = false">取消</el-button>
          <el-button type="danger" @click="executeHideConversation">隐藏</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex';
import UserDetailDialog from '@/user/components/UserDetailDialog.vue';
import ProductDetail from '@/product/components/ProductDetail.vue';
import { ChatDotRound, Link, Promotion, Delete, User, Fold, Expand } from '@element-plus/icons-vue';
import { markRaw } from 'vue';
import { ElMessage } from 'element-plus';

export default {
  name: 'MessageView',
  components: {
    UserDetailDialog,
    ProductDetail,
  },
  data() {
    return {
      selectedConversation: null,
      newMessageContent: '',
      userDetailDialog: false,
      selectedUserId: null,
      confirmHideDialog: false,
      conversationToHide: null,
      productDetailVisible: false,
      selectedProductId: null,
      isConversationListCollapsed: false,
      DeleteIcon: markRaw(Delete),
      UserIcon: markRaw(User),
      ChatDotRoundIcon: markRaw(ChatDotRound),
      LinkIcon: markRaw(Link),
      PromotionIcon: markRaw(Promotion),
      FoldIcon: markRaw(Fold),
      ExpandIcon: markRaw(Expand),
    };
  },
  computed: {
    ...mapState('chat', ['conversations', 'currentChatMessages', 'commonPhrases']),
    ...mapGetters('user', ['currentUser']),
    isChatViewActive() {
      return this.$route.name === 'messages';
    }
  },
  watch: {
    '$route.query': {
      immediate: true,
      async handler(newQuery, oldQuery) {
        if (!this.isChatViewActive) {
          this.selectedConversation = null;
          this.$store.commit('chat/SET_CURRENT_CHAT_MESSAGES', []);
          return;
        }

        const { otherUserId, productId } = newQuery;
        const queryActuallyChanged = JSON.stringify(newQuery) !== JSON.stringify(oldQuery);
        const justEnteredChatView = this.isChatViewActive && (!oldQuery || (oldQuery.otherUserId === undefined && oldQuery.productId === undefined));

        if (queryActuallyChanged || justEnteredChatView) {
            await this.initializeChatView(otherUserId, productId);
        }
      },
    },
    currentChatMessages() {
      if (this.isChatViewActive) {
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      }
    }
  },
  async mounted() {
    if (!this.currentUser && this.isChatViewActive) {
        try {
            await this.fetchCurrentUserProfile();
        } catch (error) {
            console.error("Failed to fetch current user profile in MessageView mounted:", error);
        }
    }
    if (this.isChatViewActive && !this.$route.query.otherUserId && !this.$route.query.productId) {
        await this.initializeChatView(null, null);
    }
  },
  methods: {
    ...mapActions('chat', ['fetchConversations', 'fetchChatMessages', 'sendMessage', 'hideConversation']),
    ...mapActions('user', ['fetchCurrentUserProfile', 'fetchUserPublicProfile']),

    async initializeChatView(otherUserId, productId) {
        if (!this.isChatViewActive) return;

        await this.loadConversations();

        if (otherUserId && productId) {
            const existingSession = this.conversations.find(
                (s) => s.other_user_id === otherUserId && s.product_id === productId
            );
            if (existingSession) {
                this.selectConversation(existingSession);
            } else {
                try {
                    const otherUserProfile = await this.fetchUserPublicProfile(otherUserId);
                    const productDetails = await this.$store.dispatch('product/fetchProductDetail', productId);
                    
                    const tempSession = {
                        session_id: `${otherUserId}-${productId}`,
                        other_user_id: otherUserId,
                        product_id: productId,
                        other_username: otherUserProfile?.username || otherUserProfile?.用户名 || '未知用户',
                        other_avatar_url: otherUserProfile?.avatar_url || otherUserProfile?.头像URL || null,
                        product_name: productDetails?.product_name || productDetails?.商品名称 || '未知商品',
                        product_image_url: productDetails?.main_image_url || productDetails?.主图URL || null,
                        last_message_content: '新会话，开始聊天吧！',
                        last_message_time: new Date().toISOString(),
                        unread_count: 0,
                    };
                    this.selectedConversation = tempSession;
                    this.$store.commit('chat/SET_CURRENT_CHAT_MESSAGES', []);
                    this.$nextTick(() => this.scrollToBottom());
                } catch (error) {
                    console.error("Error creating temporary session:", error);
                    ElMessage.error("发起新会话失败，请稍后重试。");
                }
            }
        } else if (this.conversations.length > 0) {
            this.selectConversation(this.conversations[0]);
        } else {
            this.selectedConversation = null;
            this.$store.commit('chat/SET_CURRENT_CHAT_MESSAGES', []);
        }
    },

    async loadConversations() {
      if (!this.isChatViewActive) return;
      try {
        await this.fetchConversations(); 
        for (const session of this.conversations) {
            if (session.product_id && !session.product_image_url) {
                try {
                    const productDetails = await this.$store.dispatch('product/fetchProductDetail', session.product_id);
                    session.product_image_url = productDetails?.main_image_url || productDetails?.主图URL || null;
                } catch (e) {
                    console.warn(`Failed to fetch product image for product ${session.product_id}`, e);
                }
            }
        }
      } catch (error) {
        console.error('加载聊天会话失败:', error);
      }
    },

    async selectConversation(session) {
      if (!session || !session.other_user_id || !session.product_id) {
        console.error("selectConversation called with invalid session:", session);
        ElMessage.error("无法选择此会话，数据不完整。");
        return;
      }
      this.selectedConversation = session;
      try {
        await this.fetchChatMessages({
          otherUserId: session.other_user_id,
          productId: session.product_id,
        });
        const convInList = this.conversations.find(c => c.session_id === session.session_id);
        if (convInList) {
            convInList.unread_count = 0;
        }
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      } catch (error) {
        console.error('获取消息记录失败:', error);
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
        const currentSessionId = this.selectedConversation.session_id;
        await this.loadConversations(); 
        const updatedSession = this.conversations.find(c => c.session_id === currentSessionId || 
                                                      (c.other_user_id === messageData.receiver_id && c.product_id === messageData.product_id));
        if (updatedSession) {
            this.selectedConversation = updatedSession;
            await this.fetchChatMessages({ 
                otherUserId: updatedSession.other_user_id, 
                productId: updatedSession.product_id 
            });
        }
      } catch (error) {
        console.error('发送消息失败:', error);
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
    openProductDetail(productId) {
      this.selectedProductId = productId;
      this.productDetailVisible = true;
    },
    viewUserProfile(userId) {
      this.selectedUserId = userId;
      this.userDetailDialog = true;
    },
    confirmHideConversation(session) {
      this.conversationToHide = session;
      this.confirmHideDialog = true;
    },
    async executeHideConversation() {
      if (this.conversationToHide) {
        try {
          await this.hideConversation({
            otherUserId: this.conversationToHide.other_user_id,
            productId: this.conversationToHide.product_id,
          });
          ElMessage.success('会话已隐藏!');
          this.confirmHideDialog = false;
          
          if (this.selectedConversation &&
              this.selectedConversation.session_id === this.conversationToHide.session_id) {
            this.selectedConversation = null;
            this.$store.commit('chat/SET_CURRENT_CHAT_MESSAGES', []);
          }
          await this.loadConversations(); 
          if (this.conversations.length > 0 && !this.selectedConversation) {
             this.selectConversation(this.conversations[0]);
          } else if (this.conversations.length === 0) {
             this.selectedConversation = null;
             this.$store.commit('chat/SET_CURRENT_CHAT_MESSAGES', []);
          }
          this.conversationToHide = null;
        } catch (error) {
          console.error('隐藏会话失败:', error);
        }
      }
    },
    selectCommonPhrase(phrase) {
      this.newMessageContent = phrase;
    },
    toggleConversationList() {
      this.isConversationListCollapsed = !this.isConversationListCollapsed;
    },
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
  transition: all 0.3s ease;
}

.conversation-list-col {
  flex-basis: 320px;
  flex-grow: 0;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  overflow: hidden;
}

.chat-layout-wrapper.collapsed .conversation-list-col {
  flex-basis: 0;
  margin-right: -20px; /* To cover the gap */
  opacity: 0;
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
  padding-left: 16px;
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

.messages-wrapper {
  display: flex;
  flex-direction: column;
}

.message-item {
  display: flex;
  align-items: flex-end;
  margin-bottom: 20px;
  max-width: 80%;
}

.message-item.sent {
  align-self: flex-end;
}

.message-item.received {
  align-self: flex-start;
}

.message-avatar {
    flex-shrink: 0;
    margin: 0 10px;
}

.message-bubble {
  max-width: 100%; /* max-width is on parent now */
  border-radius: 10px;
  padding: 10px 15px;
  line-height: 1.5;
  word-wrap: break-word;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.message-item.sent .message-bubble {
  background-color: #409eff; /* Primary color for sent messages */
  color: white;
}

.message-item.received .message-bubble {
  background-color: #f0f2f5; /* Lighter grey for received messages */
}

.message-text {
  color: inherit;
}

.message-time {
  font-size: 11px;
  color: #909399;
  margin-top: 5px;
  text-align: right;
}

.message-item.sent .message-time {
    color: #e0e0e0;
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

.no-messages-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #909399;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>