<script setup>
import { useRouter} from "vue-router";
import FormatObject from "@/utils/format.js";

// 组件事件属性设置
const props = defineProps({
  img: String,
  itemName: String,
  price: Number,
  description: String,
  itemID: String
});

// 组件基本变量设置
const router = useRouter();

// 组件基本函数设置
const goItemPage = () => {
  router.push(`/item/${props.itemID}`)
};
</script>

<template>
  <el-card class="clickable-card" @click="goItemPage">
    <img
      :src="FormatObject.formattedImgUrl(decodeURIComponent(img?img.length>0?img[0]:null:null))"
      :alt="props.itemName"/>
    <div class="price">
      <p>￥{{props.price}}</p>
    </div>
    <div class="description">
      <p class="item-name">{{props.itemName}}</p>
      <p class="item-description">{{props.description}}</p>
    </div>
  </el-card>
</template>

<style scoped>
.clickable-card {
  cursor: pointer;
  max-width: 250px;
  min-width: 250px
}

.clickable-card:hover {
  transform: scale(1.05); /* 鼠标悬停时放大 */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2); /* 悬停时加深阴影 */
}

.el-card {
  margin: 0 auto; /* 水平居中 */
  text-align: center; /* 内容居中 */
}

.description {
  text-align: left;
  overflow: hidden;
}

.center-container{
  max-width: 1200px;
  min-width: 1200px;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #CAD9F1;
}

.price{
  padding-bottom: 30px;
  padding-top: 30px;
  text-align: left;
  font-size: 24px;
  height: 24px;
  line-height: 24px;
  color: #ff4f24;
}

.price p {
  font-weight: 700;
}

img {
  min-width: 200px;
  max-width: 200px;
  min-height: 200px;
  max-height: 200px;
}

.item-name, .item-description {
  white-space: nowrap;    /* 不换行 */
  overflow: hidden;     /* 隐藏超出部分 */
  text-overflow: ellipsis; /* 溢出部分显示省略号 */
}

.item-name {
  font-weight: bold;
}
</style>