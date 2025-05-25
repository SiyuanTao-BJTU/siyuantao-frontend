<script setup>
import { ref } from "vue";
import StateIcon from "@/user/components/StateIcon.vue";
import {Warning} from "@element-plus/icons-vue";
import TableInfo from "@/user/components/TableInfo.vue";

// 组件全局变量定义
const time_options = [
  {
    value: "1",
    label: "最近三个月"
  },
  {
    value: "2",
    label: "最近六个月"
  },
  {
    value: "3",
    label: "最近一年"
  },
  {
    value: "4",
    label: "全部"
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
      <h2>出售信息</h2>
    </div>
    <div class="sale-info-functional-block">
      <el-select
        v-model="select_time"
        placeholder="全部"
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
      title="状态说明"
      v-model=dialogVisible
      width="30%"
      draggable
      @close="stateViewOff"
      @closed="stateViewOff"
    >
      <h2>未开始/已撤回（Initial/Withdrawn）</h2>
      <p>商品已发布但尚未被购买，或卖家/买家已撤销。只有卖家可见。</p>
      <h2>待卖家确认（PendingConfirmation - Seller View）</h2>
      <p>有买家已下单购买，等待卖家同意交易。只有卖家可见，可以同意或拒绝。</p>
      <h2>待买家确认（PendingConfirmation - Buyer View）</h2>
      <p>买家已下单，等待卖家确认。只有买家可见，可以撤销购买。</p>
      <h2>待发货/待取货（PendingDelivery）</h2>
      <p>交易已确认，卖家需要发货或准备取货。买卖双方都可见。卖家可以标记为"已发货"。</p>
      <h2>已取消（Cancelled）</h2>
      <p>交易已被取消，可能由买家撤销购买、卖家拒绝交易或在其他环节被取消。</p>
      <h2>已完成（Completed）</h2>
      <p>买家已确认收货，交易成功完成。买卖双方都可见。买家可以评价。</p>
      <h2>待收货/配送中（PendingReceipt/Delivering）</h2>
      <p>卖家已标记发货，等待买家确认收货。买卖双方都可见。买家可以确认收货或报告未收到。</p>
      <h2>纠纷中（Dispute）</h2>
      <p>买家报告未收到货，交易进入纠纷处理阶段。需要管理员介入。</p>
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

.info-block {
  display: flex;
  /* background-color: #a1c9ee; */
  background-color: #e0e0e0; /* 使用一个更中性的浅灰色背景 */
  border-radius: 5px;
  flex-direction: column;
  width: 100%;
}
</style>