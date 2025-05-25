<script setup>
import {defineProps, ref} from 'vue'
import {Loading, Picture} from "@element-plus/icons-vue";
import FormatObject from "@/utils/format.js";

// 组件全局属性事件定义
const props = defineProps({
  item_info: Object,
  key: Number,
})
let current_img_index = ref(0); // 当前选中的图片
let viewerVisible = ref(false); // 图片大栏是否可见


// 组件全局函数定义
const imageViewerVisible = (data_index) => {
  viewerVisible.value = true
  current_img_index.value = data_index
}
</script>

<template>
  <div class="trade-info-title">商品信息</div>
  <div class="info-column">
    <p class="info-row"><b>商品名称：</b><span>{{props.item_info.name || 'N/A'}}</span></p>
    <p class="info-row"><b>商品价格：</b><span class="item-info-price">￥{{props.item_info.price || 'N/A'}}</span></p>
    <p class="info-row"><b>商品图片：</b></p>
  </div>
  <div class="item-picture-block">
    <el-scrollbar height="100%" class="item-picture-scrollbar">
      <div style="padding: 15px;"> <!-- Inner padding for the content -->
        <div v-if="props.item_info.img && props.item_info.img.length > 0">
          <div v-for="(img_url, index) in props.item_info.img" :key="index" class="single-item-img">
            <el-image
                style="width: 100%; height: 180px; border-radius: 4px;"
                :src="FormatObject.formattedImgUrl(img_url)"
                :zoom-rate="1.2"
                :max-scale="7"
                :min-scale="0.2"
                fit="cover"
                @click="imageViewerVisible(index)"
                class="item-image-preview"
            >
              <template #error>
                <div class="image-slot">
                  <el-icon><Picture /></el-icon>
                  <span>图片加载失败</span>
                </div>
              </template>
              <template #placeholder>
                <div class="image-slot">
                  <el-icon><Loading /></el-icon>
                  <span>加载中...</span>
                </div>
              </template>
            </el-image>
            <div class="nth-picture">{{'第' + (index + 1) + '张'}}</div>
          </div>
        </div>
         <div v-else class="image-slot image-slot-empty">
            <el-icon><Picture /></el-icon>
            <span>暂无图片</span>
         </div>
      </div>
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
  font-size: 20px; /* Adjust font size */
  font-weight: bold; /* Bold font */
  margin-left: 15px; /* Adjust margin */
  margin-top: 15px; /* Add top margin */
  margin-bottom: 10px; /* Space below title */
  color: #303133; /* Dark text */
  padding-bottom: 10px; /* Padding below title */
  border-bottom: 1px solid #ebeef5; /* Subtle separator */
}

.info-column {
  font-size: 15px; /* Adjust font size */
  color: #303133; /* Dark text for labels */
  margin-left: 15px; /* Adjust margin */
  margin-right: 15px; /* Adjust margin */
  margin-bottom: 15px; /* Space below info block */
}

.info-row {
    margin-bottom: 8px; /* Space between info rows */
}

.info-column p b{
  font-weight: bold !important; /* Ensure bold */
  color: #303133; /* Dark text for labels */
}

.info-column span {
    color: #606266; /* Medium grey text for values */
    font-weight: normal; /* Ensure values are not bold unless specified */
}

.item-info-price {
  font-weight: bold; /* Bold price */
  color: #ff4f24; /* Orange price color */
  font-size: 16px; /* Slightly larger font for price */
}

.item-picture-block {
  display: flex;
  flex-direction: column;
  flex-grow: 1; /* Allow block to grow */
  /* padding: 0 15px 15px 15px; */ /* Adjust padding in the inner div */
  box-sizing: border-box;
}

.item-picture-scrollbar {
    width: 100%; /* Take full width */
}

.single-item-img {
  justify-content: center;
  text-align: center;
  margin-bottom: 15px; /* Space between images */
}

.item-image-preview {
  cursor: pointer;
  /* max-width: 200px; */ /* Removed max/min width to allow 100% */
  /* min-width: 200px; */
  /* max-height: 150px; */ /* Removed max/min height, use fixed height */
  /* min-height: 150px; */
  display: block; /* Ensure image is a block element */
  margin: 0 auto 5px auto; /* Center image and add space below */
  border: 1px solid #ebeef5; /* Subtle border */
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08); /* Light shadow */
}

.nth-picture {
  font-size: 13px; /* Smaller font */
  color: #909399; /* Light grey text */
  text-align: center; /* Center text */
}

.image-slot {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%; /* Full height of container */
  background: #f5f7fa; /* Light background */
  color: #909399; /* Light grey icon/text */
  font-size: 14px; /* Adjust font size */
  border-radius: 4px; /* Match image border radius */
}

.image-slot-empty {
    min-height: 180px; /* Ensure empty slot has similar height to images */
}

.image-slot .el-icon {
     font-size: 24px; /* Larger icon */
     margin-bottom: 5px; /* Space below icon */
}

</style>