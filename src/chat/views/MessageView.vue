<script setup>
import { onMounted, ref, computed, onUnmounted } from "vue";
import { RefreshRight } from "@element-plus/icons-vue";
import WebSocketService from "@/socket_client/socket.js";
import FormatObject from "@/utils/format.js";
import api from '@/API_PRO.js';
import ChatMessage from "@/chat/components/ChatMessage.vue";
import InputBlock from "@/chat/components/InputBlock.vue";
import ItemInfoBar from "@/chat/components/ItemInfoBar.vue";
import router from "@/router/index.js";

// 组件全局变量定义
let avatar_char = computed(() => localStorage.getItem("username").slice(0, 2).toUpperCase());
let username = ref(localStorage.getItem("username"));
let isRoomSelected = ref(false);
let roomList = ref([]);
let top_title_contact_name = ref("");
let selected_room_item_id = ref("");
let selected_room_id = ref("");
let componentKey = ref(0); // 用于强制刷新子组件
let item_info = ref({
  name: "",
  img: [],
  id: "",
  price: Number,
});

// 组件全局函数定义
const handleChatroomList = (data) => {
  if (data.chatroomlist) {
    roomList.value = FormatObject.formattedChatroomList(data.chatroomlist);
  }
};

onMounted(() => {
  WebSocketService.fetchAllChatrooms();
  WebSocketService.on("FetchChatroomlist", handleChatroomList);
});

onUnmounted(() => {
  WebSocketService.off("FetchChatroomlist", handleChatroomList);
});

const fetch_room_list = () => {
  WebSocketService.fetchAllChatrooms();
};

const select_contact = (room) => {
  isRoomSelected.value = true;
  top_title_contact_name.value = room.contact;
  selected_room_item_id.value = room.item_id;
  selected_room_id.value = room.room_id;
  api.getProductDetail(room.item_id)
    .then(data => {
      item_info.value.id = data.id;
      item_info.value.name = data.name;
      item_info.value.price = data.price;
      item_info.value.img = data.images;
    })
    .catch(error => {
      console.warn('获取商品详情失败', error);
      item_info.value = { name: "", img: [], id: "", price: 0 };
    });
  componentKey.value += 1;
};

const handleGoSell = () => {
  router.push('/sell')
}

const handleGoBuy = () => {
  router.push('/home')
}

const handleOtherAvatarClick = (username) => {
  router.push(`/profile/${username}`)
}
</script>

<template>
  <div class="basic-container">
    <div class="center-container">
      <div class="whole-chatroom-container">
        <div class="left-container">
          <div class="info-block">
            <div class="avatar-info">
              <el-avatar :size="80" shape="square" class="avatar" @click="handleOtherAvatarClick(username)">{{avatar_char}}</el-avatar>
              <h3>{{username}}</h3>
            </div>
          </div>
          <div class="chat-room-list-block">
            <div class="room-list-top-bar">
              <p>聊天室列表</p>
              <div class="gap" />
              <el-icon @click="fetch_room_list"><RefreshRight /></el-icon>
            </div>
            <div class="room-list">
              <el-scrollbar height="600px" class="room-list-scrollbar">
                <div v-if="roomList.length === 0" class="select-notice">
                  <el-empty description="暂无聊天室"></el-empty>
                  <div class="empty-navigator">
                    <el-button type="primary" @click="handleGoSell">去出售</el-button>
                    <el-button type="primary" @click="handleGoBuy">去购买</el-button>
                  </div>
                </div>
                <div v-else>
                  <div v-for="room in roomList" :key="room.room_id">
                    <el-card @click="select_contact(room)" shadow="hover" class="room-card">
                      <div class="card-info-person">
                        <el-avatar :size="40" shape="square" class="small_avatar" @click="handleOtherAvatarClick(room.contact)">{{room.contact.slice(0, 2).toUpperCase()}}</el-avatar>
                        <p>{{room.contact}}</p>
                      </div>
                      <p class="room-id-text"><b>RoomID: </b>{{FormatObject.formattedUUID(room.room_id)}}</p>
                    </el-card>
                  </div>
                </div>
              </el-scrollbar>
              <div class="room-list-end" v-if="roomList.length !== 0">
                <div>已经是最后一个聊天室了</div>
                <div>去其他地方逛逛吧</div>
                <div class="empty-navigator">
                  <el-button type="primary" @click="handleGoSell">去出售</el-button>
                  <el-button type="primary" @click="handleGoBuy">去购买</el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="gap-block"></div>
        <div class="right-container-selected" v-if="isRoomSelected">
          <div class="communicator-info-block">
            <div class="top-info-contact">
              <el-avatar :size="80" shape="square" class="top_contact_avatar" @click=handleOtherAvatarClick(top_title_contact_name)>{{top_title_contact_name.slice(0, 2).toUpperCase()}}</el-avatar>
              <p>{{top_title_contact_name}}</p>
            </div>
          </div>
          <div class="detail-container">
            <div class="chat-container">
              <div class="chat-message-block">
                <ChatMessage
                    :key="componentKey"
                    :item_id="selected_room_item_id"
                    :room_id="selected_room_id"
                    :username="username"
                />
              </div>
              <div class="input-container">
                <InputBlock
                    :key="componentKey"
                    :isChatroom="true"
                    :item_id="selected_room_item_id"
                    :room_id="selected_room_id"
                />
              </div>
            </div>
            <div class="item-picture-container">
              <ItemInfoBar
                  :key="componentKey"
                  :item_info="item_info"
              />
            </div>
          </div>
        </div>
        <div class="right-container-unselected" v-else>
          <div v-if="roomList.length === 0" class="select-notice">
            <el-empty description="暂无可用聊天室"/>
            <div class="empty-navigator">
              <el-button type="primary" @click="handleGoSell">去出售</el-button>
              <el-button type="primary" @click="handleGoBuy">去购买</el-button>
            </div>
          </div>
          <div v-else class="select-notice">
            <el-empty description="请选择一个聊天室"/>
            <div class="empty-navigator">
              <el-button type="primary" @click="handleGoSell">去出售</el-button>
              <el-button type="primary" @click="handleGoBuy">去购买</el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.basic-container {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #CAD9F1;
  padding-top: 50px;
  min-height: 100vh;
  box-sizing: border-box;
  padding-bottom: 20px;
}

.center-container{
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  height: 100%;
  max-width: 1200px;
  min-width: 1000px;
  margin-top: 20px;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}

.whole-chatroom-container {
  width: 100%;
  height: 800px;
  display: grid;
  grid-template-columns: 30% 1fr 69%;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.gap-block {
  background-color: transparent;
}

.left-container {
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  box-shadow: none;
}

.right-container-selected {
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  box-shadow: none;
}

.el-card {
  margin-top: 10px;
  margin-left: 10px;
  margin-right: 10px;
  border: none;
  box-shadow: none;
}

.room-card {
  margin: 0 10px 10px 10px;
  border-radius: 8px;
  background-color: #f8f8f8;
  transition: background-color 0.3s ease;
}

.room-card:hover {
  background-color: #eeeeee;
}

.room-card :deep(.el-card__body) {
  padding: 15px;
}

.right-container-unselected {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
  box-shadow: none;
}

.select-notice {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  text-align: center;
  align-items: center;
}

.select-notice h1{
  font-size: 30px;
  font-weight: bold;
}

.empty-navigator {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  gap: 15px;
}

.info-block {
  display: flex;
  background-color: #a1c9ee;
  border-radius: 5px;
  flex-direction: column;
  width: 100%;
  padding: 15px;
  box-sizing: border-box;
}

.avatar-info {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  margin: 0;
}

.avatar {
  font-size: 40px;
  background-color: #9c9ea1;
  color: #ffffff;
  margin-right: 10px;
}

.small_avatar {
  font-size: 20px;
  background-color: #79b7f8;
  color: #ffffff;
  margin-right: 10px;
}

.top_contact_avatar {
  font-size: 40px;
  background-color: #79b7f8;
  color: #ffffff;
  margin-right: 15px;
}

h3 {
  font-size: 20px;
  font-weight: bold;
  margin: 0;
  color: #303133;
}

.room-list-top-bar {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  background-color: #e8e8e8;
  border-radius: 5px;
  padding: 10px;
  margin-bottom: 10px;
}

.room-list-top-bar p {
  font-size: 16px;
  font-weight: bold;
  margin: 0;
  color: #303133;
}

.room-list-top-bar .gap {
}

.room-list-top-bar .el-icon {
  margin-right: 0;
  cursor: pointer;
  color: #606266;
}

.room-list {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  margin-top: 0;
}

.room-list-scrollbar {
  margin-left: 0;
  margin-right: 0;
  height: 600px;
  width: 100%;
}

.card-info-person {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 5px;
}

.card-info-person p {
  font-size: 15px;
  margin-left: 10px;
  color: #303133;
  font-weight: bold;
}

.room-id-text {
  font-size: 13px;
  color: #909399;
  margin-top: 0;
}

.communicator-info-block {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  background-color: #e8e8e8;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  width: 100%;
  border-bottom: 1px solid #d0d0d0;
  padding: 15px;
  box-sizing: border-box;
}

.top-info-contact {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  margin: 0;
}

.top-info-contact p {
  font-size: 20px;
  font-weight: bold;
  margin-left: 10px;
  color: #303133;
}

.detail-container {
  display: grid;
  grid-template-columns: 70% 30%;
  height: calc(100% - 70px);
}

.chat-container {
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-message-block {
  height: calc(100% - 180px);
  width: 100%;
  overflow-y: auto;
  padding: 15px;
  box-sizing: border-box;
}

.input-container {
  height: 180px;
  width: 100%;
  flex-shrink: 0;
  padding: 0 15px 15px 15px;
  box-sizing: border-box;
}

.item-picture-container {
  height: 100%;
  width: 100%;
  padding: 15px;
  box-sizing: border-box;
  overflow-y: auto;
}

.room-list-end::before {
  content: "";
  display: block;
  width: 100%;
  height: 1px;
  background-color: #969494;
  margin-top: 20px;
}

.room-list-end {
  margin-top: 20px;
  display: flex;
  text-align: center;
  flex-direction: column;
  justify-content: center;
}

p b {
  font-weight: bold;
}

.right-container-unselected .select-notice .el-empty {
  padding: 0;
}
</style>
