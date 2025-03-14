<script setup>
import {computed, defineProps, onMounted} from 'vue';
import { useI18n } from 'vue-i18n';

// 组件全局属性与事件定义
const props = defineProps(["state"])
const { t } = useI18n();

// 组件全局变量定义
const stateTitle = computed(()=>{
  if (props.state===0)
    return t("saleInfo.withdrawn")
else if (props.state===1)
    return t("saleInfo.init")
  else if (props.state===2)
    return t("saleInfo.purchase")
  else if (props.state===3)
    return t("saleInfo.sold")
  else if (props.state===4)
    return t("saleInfo.declined")
  else if (props.state===5)
    return t("saleInfo.completed")
  else if (props.state===6)
    return t("saleInfo.shipped")
})
</script>

<template>
  <div class="state-icon" :class="'state-'+state">
    <div class="point">
      <span></span>
    </div>
    <div>{{stateTitle}}</div>
  </div>
</template>

<style scoped>
.state-icon{
  border-radius: 10px;
  height: 25px;
  width: 100px;
  display: grid;

  grid-template-columns: 20% 80%;
}

.point{
  position: relative;
}

.point span{
  border-radius: 90px;
  height: 6px;
  width: 6px;
  position: absolute;
  top: calc(50% - 3px);
  left: calc(50% - 3px);
}

/* 状态 0 - 已撤回 灰色 */
.state-0 {
  background-color: #d3d3d3; /* 浅灰色背景 */
  color: #808080; /* 深灰色文字 */
}
.state-0 span {
  background-color: #808080; /* 深灰色小圆点 */
}

/* 状态 1 - 初始化 浅灰色 */
.state-1 {
  background-color: #f0f0f0; /* 浅灰色背景 */
  color: #a9a9a9; /* 灰色文字 */
}
.state-1 span {
  background-color: #a9a9a9; /* 灰色小圆点 */
}

/* 状态 2 - 购买中 蓝色 */
.state-2 {
  background-color: #cce5ff; /* 浅蓝色背景 */
  color: #007bff; /* 蓝色文字 */
}
.state-2 span {
  background-color: #007bff; /* 蓝色小圆点 */
}
/* 状态 3 - 已出售 黄色 */
.state-3 {
  background-color: #fff3cd; /* 浅黄色背景 */
  color: #ffc107; /* 黄色文字 */
}
.state-3 span {
  background-color: #ffc107; /* 黄色小圆点 */
}

/* 状态 4 - 已拒绝 红色 */
.state-4 {
  background-color: #f8d7da; /* 浅红色背景 */
  color: #dc3545; /* 红色文字 */
}
.state-4 span {
  background-color: #dc3545; /* 红色小圆点 */
}

/* 状态 5 - 已完成 绿色 */
.state-5 {
  background-color: #d4edda; /* 浅绿色背景 */
  color: #28a745; /* 深绿色文字 */
}
.state-5 span {
  background-color: #28a745; /* 深绿色小圆点 */
}

/* 状态 6 - 已出货 橙色 */
.state-6 {
  background-color: #ffe5b4; /* 浅橙色背景 */
  color: #fd7e14; /* 橙色文字 */
}
.state-6 span {
  background-color: #fd7e14; /* 橙色小圆点 */
}
</style>