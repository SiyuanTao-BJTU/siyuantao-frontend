<script setup>
import {ref, onMounted, computed} from 'vue';
import router from "@/router/index.js";
import { useI18n } from "vue-i18n";
import axios from '../axios_client/index.js';
import {ElMessage} from "element-plus";
import {RefreshRight} from "@element-plus/icons-vue";
import AddItemDialog from "@/components/sell/AddItemDialog.vue";
import ItemInfoBlock from "@/components/iteminfo/ItemInfoBlock.vue";
import FormatObject from "@/utils/format.js";

// 组件基本变量定义
let isItemSelected = ref(false);
let selectedItemId = ref("");
let isItemAddDialogVisible = ref(false);
let username = ref(localStorage.getItem('username'));
let avatar_char = computed(() => localStorage.getItem("username").slice(0, 2).toUpperCase());
let itemList = ref([]);
let { t } = useI18n();
let componentKey = ref(0);

// 组件基本函数定义
const handleOtherAvatarClick = (username) => {
  router.push(`/profile/${username}`)
}

const openSellComponent = (item) => {
  isItemSelected.value = true;
  selectedItemId.value = item.id;
  componentKey.value += 1;
}

const dialogClose = () => {
  isItemAddDialogVisible.value = false;
  componentKey.value += 1
}

const dialogSuccess = () => {
  isItemAddDialogVisible.value = false;
  window.location.reload();
  componentKey.value += 1
}

const dialogOpen = () => {
  isItemAddDialogVisible.value = true;
  componentKey.value += 1
}

const fetch_room_list = () => {
  axios.get('/item/list').then(res => {
    if (res.status === 200) {
      if (res.data.code === 0) {
        itemList.value = res.data.data;
      } else if (res.data.code === 101){
        console.log("商品列表为空");
        itemList.value = [];
      }
    } else {
      ElMessage.error(t('sell.api_failure'));
      itemList.value = [];
    }
  }).catch(err => {
    ElMessage.error(t('sell.api_failure'));
    itemList.value = [];
  })
  componentKey.value += 1;
}

onMounted(() => {
  fetch_room_list();
})
</script>

<template>
  <div class="basic-container">
    <div class="center-container">
      <div class="whole-sell-container">
        <div class="left-container">
          <div class="info-block">
            <div class="avatar-info">
              <el-avatar :size="80" shape="square" class="avatar" @click="handleOtherAvatarClick(username)">{{avatar_char}}</el-avatar>
              <h3>{{username}}</h3>
            </div>
          </div>
          <div class="sell-item-list-block">
            <div class="item-list-top-bar">
              <p>{{t('sell.sell_item_top_bar')}}</p>
              <div class="gap" />
              <el-icon @click="fetch_room_list"><RefreshRight /></el-icon>
            </div>
            <div class="item-list">
              <el-scrollbar height="600px" class="item-list-scrollbar">
                <div v-if="itemList.length === 0" class="select-notice">
                  <el-empty :description="t('sell.no_item_hint')"></el-empty>
                </div>
                <div v-else>
                  <div v-for="item in itemList" :key="item.id" class="single-card-container">
                    <el-card @click="openSellComponent(item)">
                      <div class="card-info">
                        <img class="img-block" :src="FormatObject.formattedImgUrl(item.img[0])" :alt="item.name"/>
                        <div class="card-info-block">
                          <p id="card-info-name">{{item.name}}</p>
                          <p id="card-info-description">{{item.description}}</p>
                          <p id="card-info-price">￥{{item.price}}</p>
                        </div>
                      </div>
                    </el-card>
                  </div>
                </div>
              </el-scrollbar>
            </div>
            <div class="add-item-button-block">
              <button class="add-item-button" @click="isItemAddDialogVisible = true">+</button>
            </div>
          </div>
        </div>
        <div class="gap-block"></div>
        <div class="right-container-selected" v-if="isItemSelected">
          <ItemInfoBlock
            :itemID="selectedItemId"
            :key="componentKey"
          />
        </div>
        <div class="right-container-unselected" v-else>
          <el-empty :description="t('sell.select_item_hint')"></el-empty>
        </div>
        <AddItemDialog
          :is-dialog-visiable="isItemAddDialogVisible"
          :is-put-request="false"
          :key="componentKey"
          @update-cancel="dialogClose"
          @update-success="dialogSuccess"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.basic-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 1100px;
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

.whole-sell-container {
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
  height: 100%;
  flex-direction: column;
  background-color: #ffffff;
  border-radius: 5px;
  box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.1);
}

.right-container-unselected {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #ffffff;
  border-radius: 5px;
  box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.1);
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

h3 {
  font-size: 20px;
  font-weight: bold;
  margin-left: 5px;
}

.item-list-top-bar {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  background-color: #e8e8e8;
  border-radius: 5px;
}

.item-list-top-bar p {
  font-size: 15px;
  font-weight: bold;
  margin-left: 10px;
}

.item-list-top-bar .gap {
  flex: 1;
}

.item-list-top-bar .el-icon {
  margin-right: 10px;
}

.item-list {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  margin-top: 10px;
}

.item-list-scrollbar {
  margin-left: 5%;
  margin-right: 5%;
  height: 600px;
  width: 90%;
}

.select-notice {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  text-align: center;
}

.card-info {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}

.img-block {
  min-width: 75px;
  max-width: 75px;
  min-height: 75px;
  max-height: 75px;
}

.card-info-block {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  margin-left: 10px;
}

#card-info-name {
  font-size: 18px;
  font-weight: bold;
  overflow: hidden;
}

#card-info-description {
  font-size: 15px;
  overflow: hidden;
}

#card-info-price {
  font-size: 15px;
  font-weight: bold;
  color: #ff4f24;
}

.add-item-button-block {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
  border-top: 2px solid #ccc;
  padding-top: 10px;
}

.add-item-button {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #409eff;
  color: white;
  font-size: 30px;
  border: none; /* 去掉边框 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: background-color 0.3s;
}

.single-card-container {
  margin-top: 10px;
}
</style>
