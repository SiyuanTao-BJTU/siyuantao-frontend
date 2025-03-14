<script setup>
import {defineProps, ref} from 'vue'
import { useI18n } from "vue-i18n";
import {Loading, Picture} from "@element-plus/icons-vue";
import FormatObject from "@/utils/format.js";

// 组件全局属性事件定义
const props = defineProps({
  item_info: Object,
  key: Number,
})
let current_img_index = ref(0); // 当前选中的图片
let viewerVisible = ref(false); // 图片大栏是否可见

// 组件全局变量定义
const { t } = useI18n()

// 组件全局函数定义
const imageViewerVisible = (data_index) => {
  viewerVisible.value = true
  current_img_index.value = data_index
}
</script>

<template>
  <div class="trade-info-title">{{t("chatroom.item_info_title")}}</div>
  <div class="info-column">
    <p><b>{{t("chatroom.item_name")}}</b>{{props.item_info.name}}</p>
    <p><b>{{t("chatroom.item_price")}}</b><span class="item-info-price">￥{{props.item_info.price}}</span></p>
    <p><b>{{t("chatroom.item_picture")}}</b></p>
  </div>
  <div class="item-picture-block">
    <el-scrollbar height="620px">
      <el-main style="overflow-y: auto; padding: 20px;">
        <div v-for="(img_url, index) in props.item_info.img" :key="index" class="single-item-img">
          <el-image
              style="width: 200px; height: 150px"
              :src="FormatObject.formattedImgUrl(img_url)"
              :zoom-rate="1.2"
              :max-scale="7"
              :min-scale="0.2"
              fit="cover"
              @click="imageViewerVisible(index)"
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
          <div class="nth-picture">{{t("chatroom.nth_picture") + (index + 1)}}</div>
        </div>
      </el-main>
    </el-scrollbar>
  </div>
  <el-image-viewer
      v-if="viewerVisible"
      :close-on-press-escape="true"
      :initial-index="current_img_index"
      :infinite="true"
      :z-index="2000"
      :url-list="FormatObject.formattedImgUrlList(props.item_info.img)"
      @close="viewerVisible = false" />
</template>

<style scoped>
.trade-info-title{
  font-size: 22px;
  font-weight: bold;
  margin-left: 5px;
}

.info-column {
  font-size: 16px;
  color: #333333;
  margin-left: 10px;
}

.info-column p b{
  font-weight: bold !important;
}

.item-picture-block {
  display: flex;
  flex-direction: column;
}

.single-item-img {
  justify-content: center;
  text-align: center;
}

.nth-picture {
  margin-bottom: 5px;
}

.el-image {
  cursor: pointer;
  max-width: 200px;
  min-width: 200px;
  max-height: 150px;
  min-height: 150px;
}

.item-info-price {
  font-weight: 700;
  color: #ff4f24;
}
</style>