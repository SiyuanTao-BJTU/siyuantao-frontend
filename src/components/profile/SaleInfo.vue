<script setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import StateIcon from "@/components/profile/StateIcon.vue";
import {Warning} from "@element-plus/icons-vue";
import TableInfo from "@/components/profile/TableInfo.vue";

// 组件全局变量定义
const { t } = useI18n();
const time_options = [
  {
    value: "1",
    label: t("saleInfo.latest_three_month")
  },
  {
    value: "2",
    label: t("saleInfo.latest_six_month")
  },
  {
    value: "3",
    label: t("saleInfo.latest_one_year")
  },
  {
    value: "4",
    label: t("saleInfo.all")
  }
]
let select_time = ref("4")
let dialogVisible = ref(false)


// 组件全局函数定义
const stateViewOn = () => {
  dialogVisible.value = true
}

const stateViewOff = () => {
  dialogVisible.value = false
}
</script>

<template>
  <div class="sell-info-container">
    <div class="sell-data-title">
      <h2>{{ t("profile.sell_info_title") }}</h2>
    </div>
    <div class="sale-info-functional-block">
      <el-select
        v-model="select_time"
        :placeholder="t('saleInfo.all')"
      >
        <el-option
            v-for="item in time_options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
        />
      </el-select>
      <div class="info-intro-icon" @click="stateViewOn">
        <el-icon ><Warning /></el-icon>
      </div>
    </div>
    <div class="annotation-icon-block">
      <StateIcon :state="0" class="icon"/>
      <StateIcon :state="1" class="icon"/>
      <StateIcon :state="2" class="icon"/>
      <StateIcon :state="3" class="icon"/>
      <StateIcon :state="4" class="icon"/>
      <StateIcon :state="5" class="icon"/>
      <StateIcon :state="6" class="icon"/>
    </div>
    <div class="divided-line"></div>
    <div class="table-block">
      <TableInfo :is-sell="true" />
    </div>
    <el-dialog
      :title="t('saleInfo.state_intro_title')"
      v-model=dialogVisible
      width="30%"
      draggable
      @close="stateViewOff"
      @closed="stateViewOff"
    >
      <h2>{{t("saleInfo.init")}}</h2>
      <p>{{t("saleInfo.init_intro")}}</p>
      <h2>{{t("saleInfo.withdrawn")}}</h2>
      <p>{{t("saleInfo.withdrawn_intro")}}</p>
      <h2>{{t("saleInfo.purchase")}}</h2>
      <p>{{t("saleInfo.purchase_intro")}}</p>
      <h2>{{t("saleInfo.sold")}}</h2>
      <p>{{t("saleInfo.sold_intro")}}</p>
      <h2>{{t("saleInfo.declined")}}</h2>
      <p>{{t("saleInfo.declined_intro")}}</p>
      <h2>{{t("saleInfo.completed")}}</h2>
      <p>{{t("saleInfo.completed_intro")}}</p>
      <h2>{{t("saleInfo.shipped")}}</h2>
      <p>{{t("saleInfo.shipped_intro")}}</p>
    </el-dialog>
  </div>
</template>

<style scoped>
.table-block {
  margin-left: 1%;
  margin-right: 1%;
  width: 98%;
  margin-top: 20px;
}

.divided-line {
  width: 100%;
  margin-top: 10px;
  border-top: 1px solid #ebeef5;
}

h2 {
  font-size: 16px;
  font-weight: 650;
  margin-top: 10px;
  margin-bottom: 10px;
}

.annotation-icon-block {
  margin-left: 5%;
  margin-right: 5%;
  width: 90%;
  margin-top: 10px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
}

.icon {
  margin-right: 10px;
}

.info-intro-icon {
  margin-left: 10px;
}

.el-select {
  width: 300px;
}

.sale-info-functional-block {
  width: 90%;
  margin-left: 5%;
  margin-right: 5%;
  margin-top: 20px;
  display: flex;
  flex-direction: row;
}

.sell-info-container {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.sell-data-title {
  width: 100%;
  display: flex;
  justify-content: center;
}

.sell-data-title h2 {
  font-size: 28px;
  font-weight: 800;
  margin-top: 20px;
  margin-bottom: 20px;
}
</style>