<script setup>
import {ref, onMounted, computed} from 'vue';
import axios from '../../axios_client/index.js';
import {ElMessage} from "element-plus";
import {Back, ChatLineRound, Delete, EditPen, Loading, Message, Picture, ShoppingCart} from "@element-plus/icons-vue";
import { useI18n } from "vue-i18n";
import router from "@/router/index.js";
import AddItemDialog from "@/components/sell/AddItemDialog.vue";
import FormatObject from "@/utils/format.js";
import WebSocketService from "@/socket_client/socket";
import InputBlock from "@/components/chatroom/InputBlock.vue";

// 组件基本事件属性定义
const props = defineProps({
  itemID: String,
  isItemInfoPage: {
    type: Boolean,
    default: false
  }
})

// 组件基本变量定义
const { t } = useI18n();
const init_item_info = {
  name: "",
  description: "",
  count: 0,
  img: [],
  price: 0,
  id: "",
  user: {
    id: "",
    username: "",
    email: "",
    profile: {
      student_id: 0,
      student_class: "",
      contact: 0,
      facauty: "",
      dormitory: ""
    }
  },
  review: []
}
let isSeller = computed(() => itemInfo.value.user.username === localStorage.getItem('username'));
let itemInfo = ref(init_item_info);
let username = ref(localStorage.getItem('username'));
let isItemAddDialogVisible = ref(false);
let componentKey = ref(0);
let fill_image_style = ref("fill")

// 组件基本函数定义
const getAvatarChar = (username) => {
  console.log("username: ", username);
  return username.slice(0, 2).toUpperCase();
}

const handleOtherAvatarClick = (username) => {
  router.push(`/profile/${username}`)
}

const dialogClose = () => {
  isItemAddDialogVisible.value = false;
  componentKey.value += 1
}

const handleEdit = () => {
  isItemAddDialogVisible.value = true;
}

const handleDelete = () => {
  axios.delete('/item/', {
    params: {
      id: itemInfo.value.id
    }
  }).then(res => {
    if (res.status === 200) {
      if (res.data.code === 0) {
        ElMessage.success(t("itemInfo.delete_success"));
        window.location.reload();
      } else {
        ElMessage.error(t("itemInfo.delete_failure"));
      }
    } else {
      ElMessage.error(t("itemInfo.delete_failure"));
    }
  }).catch(err => {
    ElMessage.error(t("itemInfo.delete_failure"));
  })
  componentKey.value += 1;
}

const getItemInfo = () => {
  if (props.itemID === "") {
    console.log("itemID is empty for once");
    return;
  }
  axios.get('/item/', {
    params: {
      id: props.itemID
    }
  }).then(res => {
    if (res.status === 200) {
      if (res.data.code === 0) {
        itemInfo.value = res.data.data;
      } else {
        ElMessage.error(t("itemInfo.item_info_get_failure"));
      }
    } else {
      ElMessage.error(t("itemInfo.item_info_get_failure"));
    }
  }).catch(err => {
    ElMessage.error(t("itemInfo.item_info_get_failure"));
  })
  componentKey.value += 1;
}

const updateSuccessGetItemInfo = (responseData) => {
  console.log("updateSuccessGetItemInfo: ", responseData);
  getItemInfo()
  isItemAddDialogVisible.value = false;
  componentKey.value += 1;
  window.location.reload();
}

const handleWant = () => {
  axios.post('/trade/new', {
    item_id: itemInfo.value.id
  }).then(res => {
    if (res.status === 200) {
      if (res.data.code === 0) {
        ElMessage.success(t("itemInfo.want_success"));
        WebSocketService.sendNotice(itemInfo.value.user.id)
      } else {
        ElMessage.error(t("itemInfo.want_failure"));
      }
    } else {
      ElMessage.error(t("itemInfo.want_failure"));
    }
  }).catch(err => {
    ElMessage.error(t("itemInfo.want_failure"));
  })
}

const handleWantResponse = (data) => {

}

const handleBack = () => {
  window.history.back();
}

function getAvatar (owner) {
  return owner ? owner.slice(0, 2).toUpperCase() : "NA";
}

function formatTime (time) {
  const date = new Date(time);
  return date.toLocaleString();
}

onMounted(() => {
  getItemInfo()
  WebSocketService.on("SendNoticeResponse", handleWantResponse)
})
</script>

<template>
  <div class="whole-item-info-block">
    <div class="top-block">
      <div class="up-block">
        <div class="picture-block">
          <el-image
              :src="FormatObject.formattedImgUrl(itemInfo.img[0])"
              :zoom-rate="1.2"
              :max-scale="7"
              :min-scale="0.2"
              :preview-src-list="FormatObject.formattedImgUrlList(itemInfo.img)"
              :initial-index="0"
          >
            <template #error>
              <div class="image-slot">
                <el-icon><Picture /></el-icon>
                <div>{{t("saleInfo.picture_load_failed")}}</div>
              </div>
            </template>
            <template #placeholder>
              <div class="image-slot">
                <el-icon><Loading /></el-icon>
                <div>{{t("saleInfo.picture_on_loading")}}</div>
              </div>
            </template>
          </el-image>
        </div>
        <div class="empty-gap" />
        <div class="basic-info-block">
          <div id="item-name">{{itemInfo.name}}</div>
          <div id="item-description">{{itemInfo.description}}</div>
          <div id="shadow-block">
            <div id="left-header">
              <div id="item-owner-header" class="left-header-font">{{t("itemInfo.owner")}}</div>
              <div id="item-owner-email" class="left-header-font">{{t("itemInfo.email")}}</div>
              <div id="item-count-header" class="left-header-font">{{t("itemInfo.count")}}</div>
              <div id="item-price-header" class="left-header-font">{{t("itemInfo.price")}}</div>
            </div>
            <div id="right-info">
              <div id="item_owner">{{itemInfo.user.username}}</div>
              <div id="item-owner-email">{{itemInfo.user.email}}</div>
              <div id="item-count">{{itemInfo.count}}</div>
              <div id="item-price">￥{{itemInfo.price}}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="functional-block">
        <div v-if="isSeller" class="seller-functional-block">
          <el-button type="primary" @click="handleEdit">
            <el-icon><EditPen /></el-icon>
            {{t("itemInfo.edit")}}
          </el-button>
          <el-button type="danger" @click="handleDelete">
            <el-icon><Delete /></el-icon>
            {{t("itemInfo.delete")}}
          </el-button>
          <div v-if="props.isItemInfoPage">
            <el-button @click="handleBack">
              <el-icon><Back /></el-icon>
              {{t("itemInfo.back")}}
            </el-button>
          </div>
        </div>
        <div v-else class="buyer-functional-block">
          <el-button type="primary" @click="handleWant">
            <el-icon><ChatLineRound /></el-icon>
            {{t("itemInfo.want")}}
          </el-button>
          <el-button type="success" @click="handleWant">
            <el-icon><ShoppingCart /></el-icon>
            {{t("itemInfo.buy")}}
          </el-button>
          <div v-if="props.isItemInfoPage">
            <el-button @click="handleBack">
              <el-icon><Back /></el-icon>
              {{t("itemInfo.back")}}
            </el-button>
          </div>
        </div>
      </div>
    </div>
    <div class="bottom-block">
      <div class="message-input-block">
        <InputBlock
          :item_id="props.itemID"
          :key="componentKey"
          @updateSuccess="getItemInfo"
        />
      </div>
      <div class="comment-message-block">
        <el-scrollbar height="300">
          <div v-for="comment in itemInfo.review" :key="comment.id" class="single-comment">
            <div class="comment-item">
              <el-avatar
                  :size="35"
                  shape="square"
                  class="avatar_small"
                  @click="handleOtherAvatarClick(comment.owner)">
                {{getAvatar(comment.owner)}}
              </el-avatar>
              <div id="content">
                <div id="comment_header">
                  <div id="comment_owner">{{ comment.owner }}</div>
                  <div id="comment_time">{{ formatTime(comment.create_at) }}</div>
                </div>
                <div id="comment_body">{{ comment.body }}</div>
              </div>
            </div>
          </div>
        </el-scrollbar>
      </div>
    </div>
    <AddItemDialog
      :isDialogVisiable="isItemAddDialogVisible"
      :isPutRequest="true"
      :itemID="props.itemID"
      :key="componentKey"
      @updateCancel="isItemAddDialogVisible = false"
      @updateSuccess="updateSuccessGetItemInfo"
    />
  </div>
</template>

<style scoped>
.whole-item-info-block {
  width: 95%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  margin-top: 30px;
  margin-left: 2.5%;
  margin-right: 2.5%;
}

.up-block {
  display: grid;
  grid-template-columns: 40% 2% 58%;
  gap: 10px;

}

.picture-block {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
}

.el-image {
  max-width: 400px;
  max-height: 300px;
  min-width: 300px;
  min-height: 300px;
}

.top-block {
  background-color: #fcfafa;
  border-radius: 10px;
  box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.1);
}

.avatar {
  font-size: 40px;
  background-color: #9c9ea1;
  color: #ffffff;
}

.seller-functional-block {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
  margin-left: 10px;
  margin-bottom: 10px;
  gap: 20%;
}

.seller-functional-block .el-button {
  width: 200px;
}

.buyer-functional-block {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
  margin-left: 10px;
  margin-bottom: 10px;
  gap: 20%;
}

.buyer-functional-block .el-button {
  width: 200px;
}

.bottom-block {
  width: 100%;
  border-radius: 10px;
  box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.1);
  background-color: #fcfafa;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  margin-top: 20px;
}

.message-input-block {
  width: 100%;
  height: 150px;
}

.comment-message-block {
  width: 100%;
  height: calc(100% - 150px);
  margin-top: 20px;
}

.single-comment {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  margin-top: 10px;
  margin-left: 10px;
  margin-right: 10px;
  padding: 10px;
  background-color: #ffffff;
  border-radius: 10px;
}

.comment-item {
  display: flex;
  align-items: flex-start;
}

.avatar_small {
  font-size: 20px;
  background-color: #79b7f8;
  color: #ffffff;
}

#content {
  flex: 1;
}

#comment_header {
  margin-left: 5px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  font-size: 14px;
  color: #888;
}

#comment_body {
  margin-top: 5px;
  font-size: 16px;
}

#shadow-block {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  padding: 10px;
  background-color: #f0f0f0;
  border-radius: 10px;
  width: 80%;
  box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.1);
  margin-top: 20px;
}

#right-info {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  margin-left: 20px;
  gap: 10px;
}

#left-header {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 10px;
}

.left-header-font {
  font-weight: bold;
}

#item-name {
  font-size: 20px;
  font-weight: bold;
  margin-top: 10px;
  margin-left: 10px;
}

#item-price {
  font-size: 15px;
  font-weight: bold;
  color: #ff4f24;
}

#item-description {
  font-size: 20px;
  margin-top: 10px;
  margin-left: 10px;
}
</style>