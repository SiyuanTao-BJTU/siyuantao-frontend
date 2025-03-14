<script setup>
import { onMounted, ref, computed, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import { RefreshRight } from "@element-plus/icons-vue";
import WebSocketService from "@/socket_client/socket.js";
import FormatObject from "@/utils/format.js";
import axios from "@/axios_client/index.js";
import ChatMessage from "@/components/chatroom/ChatMessage.vue";
import InputBlock from "@/components/chatroom/InputBlock.vue";
import ItemInfoBlock from "@/components/chatroom/ItemInfoBar.vue";
import router from "@/router/index.js";

// 组件全局变量定义
const { t } = useI18n();
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
  axios.get('/item', {
    params: {
      id: room.item_id
    }
  }).then((res) => {
    if (res.status === 200) {
      if (res.data.code === 0) {
        item_info.value.id = res.data.data.id;
        item_info.value.name = res.data.data.name;
        item_info.value.price = res.data.data.price;
        item_info.value.img = res.data.data.img;
      }
      else {
        console.warn('获取购买记录失败')
      }
    }
    else {
      console.warn('获取购买记录失败')
    }
  }).catch(res => {
    console.warn('获取购买记录失败')
    console.warn(res)
  })
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
              <p>{{t('chatroom.chat_room_top_bar')}}</p>
              <div class="gap" />
              <el-icon @click="fetch_room_list"><RefreshRight /></el-icon>
            </div>
            <div class="room-list">
              <el-scrollbar height="600px" class="room-list-scrollbar">
                <div v-if="roomList.length === 0" class="select-notice">
                  <el-empty :description="t('chatroom.no_chatroom')"></el-empty>
                  <div class="empty-navigator">
                    <el-button type="primary" @click="handleGoSell">{{t('chatroom.navigator_to_sell')}}</el-button>
                    <el-button type="primary" @click="handleGoBuy">{{t('chatroom.navigator_to_buy')}}</el-button>
                  </div>
                </div>
                <div v-else>
                  <div v-for="room in roomList" :key="room.room_id">
                    <el-card @click="select_contact(room)">
                      <div class="card-info-person">
                        <el-avatar :size="40" shape="square" class="small_avatar" @click="handleOtherAvatarClick(room.contact)">{{room.contact.slice(0, 2).toUpperCase()}}</el-avatar>
                        <p>{{room.contact}}</p>
                      </div>
                      <p><b>RoomID: </b>{{FormatObject.formattedUUID(room.room_id)}}</p>
                    </el-card>
                  </div>
                </div>
              </el-scrollbar>
              <div class="room-list-end">
                <div v-if="roomList.length !== 0">
                  <div>{{t("chatroom.end_of_room_list_1")}}</div>
                  <div>{{t("chatroom.end_of_room_list_2")}}</div>
                  <div class="empty-navigator">
                    <el-button type="primary" @click="handleGoSell">{{t('chatroom.navigator_to_sell')}}</el-button>
                    <el-button type="primary" @click="handleGoBuy">{{t('chatroom.navigator_to_buy')}}</el-button>
                  </div>
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
              <ItemInfoBlock
                  :key="componentKey"
                  :item_info="item_info"
              />
            </div>
          </div>
        </div>
        <div class="right-container-unselected" v-else>
          <div v-if="roomList.length === 0" class="select-notice">
            <el-empty :description="t('chatroom.no_classrooms_available')"/>
            <div class="empty-navigator">
              <el-button type="primary" @click="handleGoSell">{{t('chatroom.navigator_to_sell')}}</el-button>
              <el-button type="primary" @click="handleGoBuy">{{t('chatroom.navigator_to_buy')}}</el-button>
            </div>
          </div>
          <div v-else class="select-notice">
            <el-empty :description="t('chatroom.select_chatroom')"/>
            <div class="empty-navigator">
              <el-button type="primary" @click="handleGoSell">{{t('chatroom.navigator_to_sell')}}</el-button>
              <el-button type="primary" @click="handleGoBuy">{{t('chatroom.navigator_to_buy')}}</el-button>
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
}

.center-container{
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  height: 100%;
  max-width: 1200px;
  min-width: 1200px;
  margin-top: 50px;
}

.whole-chatroom-container {
  width: 100%;
  height: 900px;
  display: grid;
  grid-template-columns: 28% 2% 70%;
  border-radius: 5px;
}

.left-container {
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  border-radius: 5px;
  box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.1);
}

.right-container-selected {
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  border-radius: 5px;
  box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.1);
}

.el-card {
  margin-top: 10px;
  margin-left: 10px;
  margin-right: 10px;
}

.right-container-unselected {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #ffffff;
  border-radius: 5px;
  box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.1);
}

.select-notice {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  text-align: center;
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
}

.info-block {
  display: flex;
  background-color: #a1c9ee;
  border-radius: 5px;
  flex-direction: column;
  width: 100%;
}

.avatar-info {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  margin-left: 15px;
  margin-bottom: 10px;
  margin-top: 10px;
}

.avatar {
  font-size: 40px;
  background-color: #9c9ea1;
  color: #ffffff;
}

.small_avatar {
  font-size: 20px;
  background-color: #79b7f8;
  color: #ffffff;
}

.top_contact_avatar {
  font-size: 40px;
  background-color: #79b7f8;
  color: #ffffff;
}

h3 {
  font-size: 20px;
  font-weight: bold;
  margin-left: 5px;
}

.room-list-top-bar {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  background-color: #e8e8e8;
  border-radius: 5px;
}

.room-list-top-bar p {
  font-size: 15px;
  font-weight: bold;
  margin-left: 10px;
}

.room-list-top-bar .gap {
  flex: 1;
}

.room-list-top-bar .el-icon {
  margin-right: 10px;
}

.room-list {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  margin-top: 10px;
}

.room-list-scrollbar {
  margin-left: 5%;
  margin-right: 5%;
  height: 600px;
  width: 90%;
}

.card-info-person {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}

.card-info-person p {
  font-size: 15px;
  margin-left: 10px;
}

.communicator-info-block {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  background-color: #e8e8e8;
  border-radius: 5px;
  width: 100%;
  border-bottom: 1px solid #000000;
}

.top-info-contact {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  margin-left: 15px;
  margin-bottom: 10px;
  margin-top: 10px;
}

.top-info-contact p {
  font-size: 20px;
  font-weight: bold;
  margin-left: 10px;
}

.detail-container {
  display: grid;
  grid-template-columns: 70% 30%;
  height: 800px;
}

.chat-container {
  border-right: 1px solid #000000;
}

.chat-message-block {
  height: 500px;
  width: 100%;
  border-bottom: 1px solid #000000;
}

.input-container {
  height: 300px;
  width: 100%;
}

.item-picture-container {
  height: 800px;
  width: 100%;
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
  margin-left: 5%;
  margin-right: 5%;
  width: 90%;
  display: flex;
  text-align: center;
  flex-direction: column;
  justify-content: center;
}

p b {
  font-weight: bold;
  margin-top: 10px;
}
</style>
