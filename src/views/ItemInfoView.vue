<script setup>
import ItemInfoBlock from "@/components/iteminfo/ItemInfoBlock.vue";
import { useRoute } from "vue-router";
import { onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";

// 组件基本变量定义
const route = useRoute();
let { t } = useI18n();
let search_item_id = ref("")
let componentKey = ref(0);

// 组件基本函数定义
onMounted(() => {
  search_item_id.value = route.params.itemId;
  componentKey.value += 1;
})
</script>

<template>
  <div class="basic-container">
    <div class="center-container">
      <div class="whole-item-view">
        <div class="title">
          <h1>{{t("itemInfo.detail_info_title")}}</h1>
        </div>
        <ItemInfoBlock
            :itemID="search_item_id"
            :isItemInfoPage="true"
            :key="componentKey"
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
  background-color: #CAD9F1;
}

.center-container {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  height: 1200px;
  max-width: 1200px;
  min-width: 1200px;
  margin-top: 50px;
}

.whole-item-view {
  width: 100%;
  height: 1000px;
  border-radius: 5px;
  box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.1);
  background-color: #ffffff;
  justify-content: center;
}

.title {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

h1 {

  font-size: 25px;
  font-weight: 700;
  margin-top: 20px;
}
</style>