<script setup>
import {ref, defineProps, onMounted, reactive, computed} from "vue";
import {useI18n} from "vue-i18n";
import router from "@/router/index.js";
import api from '@/API_PRO.js';
import FormatObject from "@/utils/format.js";
import StateIcon from "@/components/profile/StateIcon.vue";
import { Picture, Loading } from "@element-plus/icons-vue";
import {ElMessage} from "element-plus";

// 组件全局属性事件定义
const props = defineProps({
  isSell: Boolean
})

// 组件全局变量定义
const backend_tableData = ref([]);
const { t } = useI18n();
let tableData = ref([]);
let viewerVisible = ref(false);
let picture_list_data = ref([]);
let commentDialogVisible = ref(false);
const commentForm = reactive({
  trade_id: 0,
  content: "",
  rating: 0,
})

const currentUserId = ref(null);

// Helper function to determine frontend state based on API status and user role
const getFrontendNumericState = (apiTransaction, localCurrentUserId, isSellViewProp) => {
  const apiStatus = apiTransaction.status;
  console.log("getFrontendNumericState - INPUTS - api_status:", apiStatus, "localCurrentUserId:", localCurrentUserId, "isSellViewProp:", isSellViewProp);
  const isCurrentUserSeller = isSellViewProp;
  const isCurrentUserBuyer = !isSellViewProp;

  if (apiStatus === "PendingConfirmation") {
    if (isCurrentUserSeller) return 2; 
    if (isCurrentUserBuyer) return 1;
  }
  if (apiStatus === "PendingDelivery") {
    if (isCurrentUserSeller) return 3; 
    if (isCurrentUserBuyer) return 3;
  }
  if (apiStatus === "PendingReceipt") {
    if (isCurrentUserSeller) return 6;
    if (isCurrentUserBuyer) return 6;   
  }
  if (apiStatus === "Completed") {
    return 5;
  }
  if (apiStatus === "Cancelled") {
    return 4;
  }
  if (apiStatus === "Dispute") {
    return 7;
  }
  console.log("getFrontendNumericState - OUTPUT - Returning -1 for unmapped status:", apiStatus);
  return -1;
};

// Function to convert raw API record to the format needed by the table
const convertApiRecordToTableRecord = (apiRecord, localCurrentUserId, isSellViewProp) => {
  console.log("convertApiRecordToTableRecord - INPUT - apiRecord:", JSON.parse(JSON.stringify(apiRecord)));
  const numericState = getFrontendNumericState(apiRecord, localCurrentUserId, isSellViewProp);
  console.log("convertApiRecordToTableRecord - calculated numericState:", numericState);

  let mainImage = null;
  let allImages = [];

  if (apiRecord.product && apiRecord.product.images && apiRecord.product.images.length > 0) {
    const primaryImageObject = apiRecord.product.images.find(img => img.is_primary);
    if (primaryImageObject) {
      mainImage = primaryImageObject.image_path;
    } else {
      mainImage = apiRecord.product.images[0].image_path; // Fallback to the first image if no primary is set
    }
    allImages = apiRecord.product.images.map(img => img.image_path);
  }

  const recordForTable = {
    id: apiRecord.id,
    name: apiRecord.product ? apiRecord.product.name : 'N/A',
    picture: mainImage,
    price: apiRecord.product ? apiRecord.product.price : 'N/A',
    buyer: apiRecord.buyer ? apiRecord.buyer.username : 'N/A',
    seller: apiRecord.seller ? apiRecord.seller.username : 'N/A',
    state: numericState,
    picture_list: allImages,
    quantity: apiRecord.quantity,
    condition: apiRecord.product ? apiRecord.product.condition : 'N/A',
    create_time: apiRecord.create_time,
    api_status: apiRecord.status 
  };
  console.log("convertApiRecordToTableRecord - OUTPUT - recordForTable:", JSON.parse(JSON.stringify(recordForTable)));
  return recordForTable;
};

// 组件全局函数定义
const handleGoSell = () => {
  router.push('/sell')
}

const handleGoBuy = () => {
  router.push('/home')
}

function sellInfoAxios() {
  api.getUserSoldRecords()
    .then(response => {
      console.log("sellInfoAxios - API Response:", JSON.parse(JSON.stringify(response)));
      if (response && response.data && response.code === 0) {
        backend_tableData.value = response.data;
        console.log("sellInfoAxios - backend_tableData (raw from format.js):", JSON.parse(JSON.stringify(backend_tableData.value)));
        if (backend_tableData.value.length > 0) {
            console.log("sellInfoAxios - First raw record for conversion:", JSON.parse(JSON.stringify(backend_tableData.value[0])));
            console.log("sellInfoAxios - currentUserId for conversion:", currentUserId.value);
        }
        tableData.value = backend_tableData.value.map(record =>
          convertApiRecordToTableRecord(record, currentUserId.value, true)
        );
        console.log("sellInfoAxios - final tableData:", JSON.parse(JSON.stringify(tableData.value)));
      } else {
        backend_tableData.value = [];
        tableData.value = [];
        console.warn('获取销售记录API响应格式不正确或code不为0 TableInfo:', response);
        ElMessage.error(t("saleInfo.fetch_records_failed_format"));
      }
    })
    .catch(error => {
      backend_tableData.value = [];
      tableData.value = [];
      console.warn('获取销售记录失败 TableInfo:', error);
      ElMessage.error(t("saleInfo.fetch_records_failed"));
    });
}

function purchaseInfoAxios() {
  api.getUserBoughtRecords()
    .then(response => {
      console.log("purchaseInfoAxios - API Response:", JSON.parse(JSON.stringify(response)));
      if (response && response.data && response.code === 0) {
        backend_tableData.value = response.data;
        console.log("purchaseInfoAxios - backend_tableData (raw from format.js):", JSON.parse(JSON.stringify(backend_tableData.value)));
         if (backend_tableData.value.length > 0) {
            console.log("purchaseInfoAxios - First raw record for conversion:", JSON.parse(JSON.stringify(backend_tableData.value[0])));
            console.log("purchaseInfoAxios - currentUserId for conversion:", currentUserId.value);
        }
        tableData.value = backend_tableData.value.map(record =>
          convertApiRecordToTableRecord(record, currentUserId.value, false)
        );
        console.log("purchaseInfoAxios - final tableData:", JSON.parse(JSON.stringify(tableData.value)));
      } else {
        backend_tableData.value = [];
        tableData.value = [];
        console.warn('获取购买记录API响应格式不正确或code不为0 TableInfo:', response);
        ElMessage.error(t("saleInfo.fetch_records_failed_format"));
      }
    })
    .catch(error => {
      backend_tableData.value = [];
      tableData.value = [];
      console.warn('获取购买记录失败 TableInfo:', error);
      ElMessage.error(t("saleInfo.fetch_records_failed"));
    });
}

function tableInfoRefresh() {
  if (props.isSell) {
    sellInfoAxios()
  }
  else {
    purchaseInfoAxios()
  }
}

const event_change_reject = (trade_id) => {
  api.updateTransactionStatus(trade_id, { status: "Cancelled" })
    .then(() => {
        ElMessage.success(t("saleInfo.transaction_rejected_success")); 
        tableInfoRefresh();
    })
    .catch(error => {
        console.warn('拒绝交易失败', error);
        ElMessage.error(t("saleInfo.transaction_rejected_fail")); 
    });
}

const event_change_purchase = (trade_id) => {
  console.log('Attempting to withdraw/cancel (formerly purchase) for trade_id:', trade_id);
  api.updateTransactionStatus(trade_id, { status: "Cancelled" })
    .then(() => {
        ElMessage.success(t("saleInfo.transaction_withdrawn_success"));
        tableInfoRefresh();
    })
    .catch(error => {
        console.warn('撤销购买(原购买按钮)失败', error);
        ElMessage.error(t("saleInfo.transaction_withdrawn_fail"));
    });
}

const event_change_withdrawn = (trade_id) => {
  api.updateTransactionStatus(trade_id, { status: "Cancelled" })
    .then(() => {
        ElMessage.success(t("saleInfo.transaction_withdrawn_success"));
        tableInfoRefresh();
    })
    .catch(error => {
        console.warn('撤销交易失败', error);
        ElMessage.error(t("saleInfo.transaction_withdrawn_fail"));
    });
}

const event_change_shipped = (trade_id) => {
  api.updateTransactionStatus(trade_id, { status: "PendingReceipt" })
    .then(() => {
        ElMessage.success(t("saleInfo.transaction_shipped_success"));
        tableInfoRefresh();
    })
    .catch(error => {
        console.warn('确认发货失败', error);
        ElMessage.error(t("saleInfo.transaction_shipped_fail"));
    });
}

const event_change_agree = (trade_id) => {
  api.updateTransactionStatus(trade_id, { status: "PendingDelivery" })
    .then(() => {
        ElMessage.success(t("saleInfo.transaction_agreed_success"));
        tableInfoRefresh();
    })
    .catch(error => {
        console.warn('同意交易失败', error);
        ElMessage.error(t("saleInfo.transaction_agreed_fail"));
    });
}

const event_change_not_received = (trade_id) => {
  api.updateTransactionStatus(trade_id, { status: "Dispute" })
    .then(() => {
        ElMessage.info(t("saleInfo.transaction_not_received_reported"));
        tableInfoRefresh();
    })
    .catch(error => {
        console.warn('报告未收到货失败', error);
        ElMessage.error(t("saleInfo.transaction_report_failed"));
    });
}

const event_change_completed = (trade_id) => {
  api.updateTransactionStatus(trade_id, { status: "Completed" })
    .then(() => {
        ElMessage.success(t("saleInfo.transaction_completed_success"));
        tableInfoRefresh();
    })
    .catch(error => {
        console.warn('确认收货失败', error);
        ElMessage.error(t("saleInfo.transaction_completed_fail"));
    });
}

const create_comment = (trade_id) => {
  commentForm.trade_id = trade_id
  commentDialogVisible.value = true
}

const resetCommentForm = () => {
  commentForm.trade_id = 0
  commentForm.content = ""
  commentForm.rating = 0
  commentDialogVisible.value = false
}

const submitComment = () => {
  if (commentForm.content === "" || commentForm.rating === 0 || commentForm.trade_id === 0) {
    ElMessage.error(t("saleInfo.empty_comment"))
    return
  }
  const commentData = {
    content: commentForm.content,
  };
  if (commentForm.rating > 0) {
    commentData.rating = commentForm.rating;
  }

  api.addTransactionComment(commentForm.trade_id, commentData)
    .then(() => {
        ElMessage.success(t("saleInfo.comment_success"));
        resetCommentForm();
        tableInfoRefresh();
    })
    .catch(error => {
        ElMessage.error(t("saleInfo.comment_fail"));
        console.warn('Comment submission failed', error);
    });
}

const imageViewerVisible = (data_index) => {
  picture_list_data.value = tableData.value[data_index].picture_list;
  viewerVisible.value = true;
}

onMounted(() => {
  const storedUserId = localStorage.getItem("userId");
  console.log("TableInfo onMounted - storedUserId from localStorage:", storedUserId);
  if (storedUserId) {
    currentUserId.value = parseInt(storedUserId, 10);
  }
  console.log("TableInfo onMounted - currentUserId.value:", currentUserId.value);
  tableInfoRefresh();
})

// Placeholder for date formatting, replace with your preferred method (e.g., date-fns, dayjs, or a simple custom one)
const formatDisplayTime = (dateTimeString) => {
  if (!dateTimeString) return '';
  try {
    return new Date(dateTimeString).toLocaleString();
  } catch (e) {
    return dateTimeString; // Fallback to original string if parsing fails
  }
};
</script>

<template>
  <div class="tableInfo-pictureViewer">
    <el-scrollbar height="650">
      <el-table :data="tableData" stripe border style="width: 100%;" scrollbar-always-on empty-text="暂无记录">
        <el-table-column fixed prop="name" :label="t('saleInfo.name_col_table')" min-width="100" sortable />
        <el-table-column prop="picture" :label="t('saleInfo.picture_col_table')" width="100" >
          <template #default="scope">
            <div class="image-preview" v-if="scope.row.picture">
              <el-image
                  style="width: 150px; height: 100px"
                  :src="scope.row.picture" 
                  :preview-src-list="scope.row.picture_list || [scope.row.picture]" 
                  :initial-index="0"
                  fit="cover"
                  :preview-teleported="true"
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
            <div v-else class="image-slot">
              <el-icon><Picture /></el-icon>
              <div>{{t("saleInfo.no_picture_available")}}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="price" :label="t('saleInfo.price_col_table')" width="80" sortable/>
        <el-table-column v-if="!props.isSell" prop="seller" :label="t('saleInfo.seller_col_table')" width="80" sortable/>
        <el-table-column v-if="props.isSell" prop="buyer" :label="t('saleInfo.buyer_col_table')" width="80" sortable/>
        <el-table-column prop="condition" :label="t('saleInfo.condition_col_table')" width="80" sortable />
        <el-table-column prop="quantity" :label="t('saleInfo.quantity_col_table')" width="80" sortable />
        <el-table-column prop="create_time" :label="t('saleInfo.create_time_col_table')" width="105" sortable >
           <template #default="scope">
            {{ formatDisplayTime(scope.row.create_time) }} 
          </template>
        </el-table-column>
        <el-table-column prop="id" :label="t('saleInfo.id_col_table')" width="100" sortable>
            <template #default="scope">
                {{ FormatObject.formattedUUID(scope.row.id) }}
            </template>
        </el-table-column>
        <el-table-column fixed="right" prop="state" :label="t('saleInfo.state_col_table')" width="100" >
          <template #default="scope">
            <StateIcon :state="scope.row.state" />
          </template>
        </el-table-column>
        <el-table-column fixed="right" prop="operation" :label="t('saleInfo.operation_col_table')" min-width="100" >
          <!-- Operations buttons here, their v-if conditions will use scope.row.state -->
          <!-- This part remains the same as your existing logic for buttons -->
            <template #default="scope">
                <template v-if="scope.row.state === 0"> <!-- Initial/Withdrawn -->
                    <div>{{t("saleInfo.event_operation_None")}}</div>
                </template>
                <template v-if="(scope.row.state === 1) && (!props.isSell)"> <!-- Buyer, PendingConfirmation -->
                    <el-button @click="event_change_withdrawn(scope.row.id)" type="warning" size="small">{{t("saleInfo.event_operation_withdraw_purchase")}}</el-button>
                </template>
                <template v-if="(scope.row.state === 2) && (props.isSell)"> <!-- Seller, PendingConfirmation -->
                    <el-button @click="event_change_agree(scope.row.id)" type="success" size="small">{{t("saleInfo.event_operation_agree")}}</el-button>
                    <el-button @click="event_change_reject(scope.row.id)" type="danger" size="small">{{t("saleInfo.event_operation_reject")}}</el-button>
                </template>
                 <template v-if="(scope.row.state === 2) && (!props.isSell)"> <!-- Buyer, PendingConfirmation (Seller is processing) -->
                    <el-button @click="event_change_withdrawn(scope.row.id)" type="warning" size="small">{{t("saleInfo.event_operation_withdraw_purchase")}}</el-button>
                </template>
                <template v-if="(scope.row.state === 3) && (props.isSell)"> <!-- Seller, PendingDelivery -->
                    <el-button @click="event_change_shipped(scope.row.id)" type="primary" size="small">{{t("saleInfo.event_operation_shipped")}}</el-button>
                </template>
                <template v-if="(scope.row.state === 3) && (!props.isSell)"> <!-- Buyer, PendingDelivery -->
                     <div>{{t("saleInfo.status_pending_delivery_buyer") }}</div> <!-- e.g., 等待卖家发货 -->
                </template>
                <template v-if="scope.row.state === 4"> <!-- Cancelled -->
                    <div>{{t("saleInfo.status_cancelled") }}</div> <!-- e.g., 交易已取消 -->
                </template>
                <template v-if="(scope.row.state === 5) && (!props.isSell)"> <!-- Buyer, Completed -->
                    <el-button @click="create_comment(scope.row.id)" type="success" size="small">{{t("saleInfo.transaction_evaluation")}}</el-button>
                </template>
                <template v-if="(scope.row.state === 5) && (props.isSell)"> <!-- Seller, Completed -->
                     <div>{{t("saleInfo.status_completed_seller") }}</div> <!-- e.g., 交易已完成 -->
                </template>
                <template v-if="(scope.row.state === 6) && (!props.isSell)"> <!-- Buyer, PendingReceipt/Delivering -->
                    <el-button @click="event_change_completed(scope.row.id)" type="success" size="small">{{t("saleInfo.event_operation_received")}}</el-button>
                    <el-button @click="event_change_not_received(scope.row.id)" type="danger" size="small">{{t("saleInfo.event_operation_not_received")}}</el-button>
                </template>
                <template v-if="(scope.row.state === 6) && (props.isSell)"> <!-- Seller, PendingReceipt/Delivering -->
                     <div>{{t("saleInfo.status_delivering_seller") }}</div> <!-- e.g., 等待买家收货 -->
                </template>
                <template v-if="scope.row.state === 7"> <!-- Dispute -->
                     <div>{{t("saleInfo.status_dispute") }}</div> <!-- e.g., 交易纠纷中 -->
                </template>
                 <template v-if="scope.row.state === -1"> <!-- Unknown/Unmapped -->
                     <div>{{t("saleInfo.status_unknown_error") }}</div> <!-- e.g., 状态异常 -->
                </template>
            </template>
        </el-table-column>
        <template v-slot:empty>
          <div style="text-align: center; padding: 20px; color: #999;">
            <p>{{t('saleInfo.table_info_empty')}}</p>
          </div>
          <div class="empty-navigator">
            <el-button type="primary" @click="handleGoSell">{{t('saleInfo.navigator_to_sell')}}</el-button>
            <el-button type="primary" @click="handleGoBuy">{{t('saleInfo.navigator_to_buy')}}</el-button>
          </div>
        </template>
      </el-table>
      <div class="room-list-end" v-if="tableData.length !== 0">
        <div>{{t("chatroom.end_of_room_list_1")}}</div>
        <div>{{t("chatroom.end_of_room_list_2")}}</div>
        <div class="empty-navigator">
          <el-button type="primary" @click="handleGoSell">{{t('chatroom.navigator_to_sell')}}</el-button>
          <el-button type="primary" @click="handleGoBuy">{{t('chatroom.navigator_to_buy')}}</el-button>
        </div>
      </div>
    </el-scrollbar>
    <el-image-viewer
        v-if="viewerVisible"
        :close-on-press-escape="true"
        :initial-index="0"
        :infinite="true"
        :z-index="2000"
        :url-list="FormatObject.formattedImgUrlList(picture_list_data)"
        @close="viewerVisible = false" />
    <el-dialog
        v-model="commentDialogVisible"
        :title="t('saleInfo.title_give_comment')"
        width="30%"
        draggable
        @close="resetCommentForm"
        @closed="resetCommentForm"
    >
      <el-form :model="commentForm">
        <el-form-item :label="t('saleInfo.comment_body')" prop="content">
          <el-input
              type="textarea"
              v-model="commentForm.content"
              :placeholder="t('saleInfo.comment_placeholder')"
          ></el-input>
        </el-form-item>
        <el-form-item :label="t('saleInfo.rating_body')" prop="rating">
          <el-rate v-model="commentForm.rating"></el-rate>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="commentDialogVisible = false">{{t("saleInfo.cancel_comment")}}</el-button>
        <el-button type="success" @click="submitComment">{{t("saleInfo.submit_comment")}}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.empty-navigator {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  margin-top: 10px;
}

.room-list-end::before {
  content: "";
  display: block;
  width: 100%;
  height: 1px;
  background-color: #969494;
  margin-top: 20px;
}

.room-list-end {
  margin-top: 20px;
  display: flex;
  text-align: center;
  flex-direction: column;
  justify-content: center;
}
</style>
