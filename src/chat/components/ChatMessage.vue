<script setup>
import { defineProps, onMounted, onUnmounted, ref } from 'vue';
import WebSocketService from "@/socket_client/socket.js";
import { useI18n } from "vue-i18n";
import router from "@/router/index.js";

// 组件全局属性事件定义
const props = defineProps({
  item_id: String,
  room_id: String,
  username: String,
  key: Number,
});

// 组件全局变量定义
let chatMessage = ref([]);
let { t } = useI18n();

// 组件全局函数定义
const handleChatMessage = (data) => {
  console.log(data);
  if (data.history_messages) {
    if (data.history_messages.length > 0) {
      chatMessage.value = data.history_messages;
    }
    else {
      chatMessage.value.push({
        sender: t("chatroom.system"),
        content: t("chatroom.no_chat_room_message")
      })
    }
  }
};

const handleReceiveMessage = (data) => {
  if (data.data) {
    if (data.data.room_id === props.room_id) {
      let temp_message_obj = {
        sender: data.data.sender,
        content: data.data.content,
      }
      chatMessage.value.push(temp_message_obj);
    }
  }
};

const handleOtherAvatarClick = (username) => {
  router.push(`/profile/${username}`)
}

onMounted(() => {
  WebSocketService.fetchMessage(props.room_id);
  WebSocketService.on("FetchMessage", handleChatMessage);
  WebSocketService.on("ReceiveMessage", handleReceiveMessage);
})

onUnmounted(() => {
  WebSocketService.off("FetchMessage", handleChatMessage);
  WebSocketService.off("ReceiveMessage", handleReceiveMessage);
})
</script>

<template>
  <el-scrollbar height="500px">
    <el-main style="overflow-y: auto; padding: 20px;">
      <div v-for="(message, index) in chatMessage" :key="index" :class="['message', message.sender === props.username ? 'myself' : 'itself']">
        <el-avatar :size="40" class="message-avatar" @click="handleOtherAvatarClick(message.sender)">
          {{ message.sender.slice(0, 2).toUpperCase() }}
        </el-avatar>
        <div class="message-box">
          <div class="sender">{{ message.sender }}</div>
          <div class="content">{{ message.content }}</div>
        </div>
      </div>
    </el-main>
  </el-scrollbar>
</template>

<style scoped>
.message {
  display: flex;
  margin-bottom: 15px;
  padding: 10px;
  align-items: flex-start;
}

.myself {
  flex-direction: row-reverse;
}

.itself {
  flex-direction: row;
}

.message-avatar {
  margin-right: 10px;
  margin-left: 10px;
  font-size: 20px;
  background-color: #79b7f8;
  color: #ffffff;
}

.message-box {
  display: flex;
  flex-direction: column;
  max-width: 60%;
  padding: 10px;
  border-radius: 15px;
  background-color: #fff;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.myself .message-box {
  background-color: #ffffff;
  border-radius: 15px 15px 0 15px;
}

.itself .message-box {
  background-color: #d8e9f6;
  border-radius: 15px 15px 15px 0;
}

.sender {
  font-size: 12px;
  color: #888;
  margin-bottom: 5px;
}

.content {
  font-size: 14px;
  word-wrap: break-word;
}
</style>
