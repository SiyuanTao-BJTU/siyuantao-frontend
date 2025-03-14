<script setup>
import { onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import {Refresh, Search} from "@element-plus/icons-vue";
import axios from '../axios_client/index.js';
import {ElMessage} from "element-plus";
import PurchaseGoodsCard from "@/components/home/PurchaseGoodsCard.vue";

// 组件基本变量设置
const { t, locale } = useI18n();
const colors = ['#ffffff', '#ffffff'] // 色块的颜色
const cardCount = 20; // 每页显示的卡片数量
const tags = ref([t("home.tag1"),
  t("home.tag2"), t("home.tag3"),
  t("home.tag4"), t("home.tag5"),
  t("home.tag5"), t("home.tag6"),
  t("home.tag7"), t("home.tag8"),
  t("home.tag9"), t("home.tag10"),
  t("home.tag11"),t("home.tag12"),
  t("home.tag13"),t("home.tag14"),
  t("home.tag15"),t("home.tag16"),
  t("home.tag17"),t("home.tag18"),
  t("home.tag19"),t("home.tag20")]);
const language_flag = ref("en"); // 语言标志
let searchQuery = ref("");
let componentKey = ref(0);
let cardList = ref([]);
let top_item_1 = ref({});
let top_item_2 = ref({});
let top_item_3 = ref({});

// 组件基本函数设置
watch(
    () => locale.value,
    (newVal) => {
      if (newVal === "zh") {
        language_flag.value = "zh";
        tags.value = [t("home.tag1"),t("home.tag2"),
          t("home.tag3"), t("home.tag4"),
          t("home.tag5"), t("home.tag6"),
          t("home.tag7"), t("home.tag8"),
          t("home.tag9"), t("home.tag10"),
          t("home.tag11"),t("home.tag12"),
          t("home.tag13"),t("home.tag14"),
          t("home.tag15"),t("home.tag16"),
          t("home.tag17"),t("home.tag18"),
          t("home.tag19"),t("home.tag20")];
      } else {
        language_flag.value = "en";
        tags.value = [t("home.tag1"),t("home.tag2"),
          t("home.tag3"), t("home.tag4"),
          t("home.tag5"), t("home.tag6"),
          t("home.tag7"), t("home.tag8"),
          t("home.tag9"), t("home.tag10"),
          t("home.tag11"),t("home.tag12"),
          t("home.tag13"),t("home.tag14"),
          t("home.tag15"),t("home.tag16"),
          t("home.tag17"),t("home.tag18"),
          t("home.tag19"),t("home.tag20")]
      }
    }
)

const handleSearch = () => {
  if (searchQuery.value === "") {
    ElMessage.warning(t('home.search_empty'));
    return;
  }
  axios.post("/search", {
    key: searchQuery.value
  }).then(res => {
    if (res.status === 200) {
      if (res.data.code === 0) {
        cardList.value = res.data.data;
      }
      else if (res.data.code === 103) {
        ElMessage.info(t('home.search_get_none'));
        cardList.value = [];
      }
      else {
        ElMessage.error(t('home.search_api_failure'));
      }
    }
    else {
      ElMessage.error(t('home.search_api_failure'));
    }
  })
  componentKey.value += 1;
};

const recommendCall = () => {
  axios.get('/recommend').then(res => {
    if (res.status === 200) {
      if (res.data.code === 0) {
        cardList.value = res.data.data;
      }
      else {
        ElMessage.error(t('home.recommend_api_failure'));
        cardList.value = [];
      }
    }
    else {
      ElMessage.error(t('home.recommend_api_failure'));
      cardList.value = [];
    }
  })
  componentKey.value += 1;
  top_item_1.value = cardList.value[0];
  top_item_2.value = cardList.value[1];
  top_item_3.value = cardList.value[2];
  searchQuery.value = "";
};

const handleTagClick = (tag) => {
  searchQuery.value = tag;
  handleSearch();
};

onMounted(() => {
  recommendCall()
});
</script>

<template>
  <div class="basic-container">
    <div class="center-container">
      <el-input class="searching-bar"
          v-model="searchQuery"
          :placeholder="t('')"
      >
        <template #append>
          <el-button @click="handleSearch">
            <el-icon><Search /></el-icon>
          </el-button>
        </template>
      </el-input>
      <div class="block-for-tags">
        <div class="tag-container">
          <div
              v-for="tag in tags"
              :key="tag"
              class="tag"
              @click="handleTagClick(tag)"
          >
            {{ tag }}
          </div>
        </div>
        <div class="block-container">
          <img src="@/assets/icon_light.png" class="grid-item" alt="GoodsExchange_1"/>
          <div
              class="grid-item"
              :style="{ backgroundColor: colors[0] }"
          >
            <h4></h4>
          </div>
          <div
              class="grid-item"
              :style="{ backgroundColor: colors[1] }"
          >

          </div>
          <img src="@/assets/icon_deep.png" class="grid-item" alt="GoodsExchange_2"/>
        </div>
      </div>
      <div class="item-info-block" v-if="cardList.length !== 0">
        <div class="button-block">
          <div class="title-font">{{t('home.item_list_title')}}</div>
          <el-button @click="recommendCall" type="primary">
            <el-icon><Refresh /></el-icon>
             {{ t('home.refresh') }}
          </el-button>
        </div>
        <div class="block-for-content">
          <div v-for="(card, index) in cardList" :key="card" class="card">
            <PurchaseGoodsCard
                :img="card.img"
                :itemName="card.name"
                :price="card.price"
                :description="card.description"
                :itemID="card.id"
                :key="componentKey"
            />
          </div>
        </div>
      </div>
      <div v-else class="empty-block">
        <el-empty :description="t('home.empty_hint')"/>
        <el-button @click="recommendCall" type="primary" style="margin-bottom: 20px">
          <el-icon><Refresh /></el-icon>
          {{ t('home.bad_request_refresh') }}
        </el-button>
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

.searching-bar {
  background-color: #f8f8f8;
  padding: 6px;
  text-align: center;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
  z-index: 10;
  height: 60px;
}

.grid-item {
  display: flex;
  height: 90%;
  width: 90%;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  padding: 10px;
  text-align: center;
  border-radius: 8px;
  box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1);
}

.block-for-tags {
  background-color: #fff;
  padding: 10px;
  box-sizing: border-box; /* 确保边框和内边距包含在宽度内 */
  width: 100%;
  margin: 20px 0;
  border-radius: 12px;
  display: flex;
  flex-direction: row;
  height: 400px;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.tag-container {
  margin-top: 20px;
  margin-bottom: 20px;
  background-color: #fff;
  padding: 10px;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  width: 40%;
  align-self:flex-start;
  height: 95%;
}

.tag {
  background-color: #eef1f6;
  padding: 8px 16px;
  border-radius: 16px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  transition: all 0.3s ease;
  height: 35px
}

.button-block {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  margin-left: 20px;
  margin-right: 20px;
  width: 100%;
}

.el-button {
  width: 20%;
}

.title-font {
  font-size: 24px;
  font-weight: 700;
}

.block-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* 2列，每列宽度均分 */
  grid-template-rows: repeat(2, 1fr);    /* 2行，每行高度均分 */
  gap: 10px;
  margin-top: 20px;
  margin-bottom: 20px;
  background-color: #fff;
  padding: 10px;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  width: 60%;
  align-self:flex-start;
  height: 95%;
}

.item-info-block {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 20px;
  width: 100%;
  background-color: #fff;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
}

.block-for-content {
  background-color: #fff;
  padding: 20px;
  box-sizing: border-box; /* 包含边框和内边距 */
  width: 100%;
  border-radius: 12px;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* 每行四个 */
  gap: 25px;
}

.card {
  background-color: #eef1f6;
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  box-sizing: border-box; /* 确保宽度计算包含内边距 */
  width: 100%;
}

.empty-block {
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  height: auto;
  align-items: center;
  background-color:  #fff;
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
}
</style>

