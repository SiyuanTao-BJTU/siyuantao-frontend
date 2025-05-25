<script setup>
import {ref, defineProps, onMounted, reactive, computed} from "vue";
import router from "@/router/index.js";
import api from '@/API_PRO.js';
import FormatObject from "@/utils/format.js";
import StateIcon from "@/user/components/StateIcon.vue";
import { Picture, Loading } from "@element-plus/icons-vue";
import {ElMessage} from "element-plus";

// 组件全局属性事件定义
const props = defineProps({
  isSell: Boolean
})

// 组件全局变量定义
const backend_tableData = ref([]);
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
        ElMessage.error("获取记录失败，API响应格式错误");
      }
    })
    .catch(error => {
      backend_tableData.value = [];
      tableData.value = [];
      console.warn('获取销售记录失败 TableInfo:', error);
      ElMessage.error("获取销售记录失败");
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
        ElMessage.error("获取记录失败，API响应格式错误");
      }
    })
    .catch(error => {
      backend_tableData.value = [];
      tableData.value = [];
      console.warn('获取购买记录失败 TableInfo:', error);
      ElMessage.error("获取购买记录失败");
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
        ElMessage.success("交易已拒绝"); 
        tableInfoRefresh();
    })
    .catch(error => {
        console.warn('拒绝交易失败', error);
        ElMessage.error("拒绝交易失败"); 
    });
}

const event_change_purchase = (trade_id) => {
  console.log('Attempting to withdraw/cancel (formerly purchase) for trade_id:', trade_id);
  api.updateTransactionStatus(trade_id, { status: "Cancelled" })
    .then(() => {
        ElMessage.success("交易已撤销");
        tableInfoRefresh();
    })
    .catch(error => {
        console.warn('撤销购买(原购买按钮)失败', error);
        ElMessage.error("撤销购买失败");
    });
}

const event_change_withdrawn = (trade_id) => {
  api.updateTransactionStatus(trade_id, { status: "Cancelled" })
    .then(() => {
        ElMessage.success("交易已撤销");
        tableInfoRefresh();
    })
    .catch(error => {
        console.warn('撤销交易失败', error);
        ElMessage.error("撤销交易失败");
    });
}

const event_change_shipped = (trade_id) => {
  api.updateTransactionStatus(trade_id, { status: "PendingReceipt" })
    .then(() => {
        ElMessage.success("已确认发货");
        tableInfoRefresh();
    })
    .catch(error => {
        console.warn('确认发货失败', error);
        ElMessage.error("确认发货失败");
    });
}

const event_change_agree = (trade_id) => {
  api.updateTransactionStatus(trade_id, { status: "PendingDelivery" })
    .then(() => {
        ElMessage.success("已同意交易");
        tableInfoRefresh();
    })
    .catch(error => {
        console.warn('同意交易失败', error);
        ElMessage.error("同意交易失败");
    });
}

const event_change_not_received = (trade_id) => {
  api.updateTransactionStatus(trade_id, { status: "Dispute" })
    .then(() => {
        ElMessage.info("已报告未收到货，请等待管理员处理");
        tableInfoRefresh();
    })
    .catch(error => {
        console.warn('报告未收到货失败', error);
        ElMessage.error("报告未收到货失败");
    });
}

const event_change_completed = (trade_id) => {
  api.updateTransactionStatus(trade_id, { status: "Completed" })
    .then(() => {
        ElMessage.success("已确认收货，交易完成");
        tableInfoRefresh();
    })
    .catch(error => {
        console.warn('确认收货失败', error);
        ElMessage.error("确认收货失败");
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
    ElMessage.error("请填写评论内容并选择评分");
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
        ElMessage.success("评论提交成功");
        resetCommentForm();
        tableInfoRefresh();
    })
    .catch(error => {
        ElMessage.error("评论提交失败");
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
      <el-table :data="tableData" stripe border style="width: 100%;" scrollbar-always-on empty-text="暂无记录" class="order-table">
        <el-table-column fixed prop="name" label="商品名称" min-width="120" sortable />
        <el-table-column prop="picture" label="图片" width="100" >
          <template #default="scope">
            <div class="image-preview" v-if="scope.row.picture">
              <el-image
                  style="width: 80px; height: 80px; border-radius: 4px;"
                  :src="scope.row.picture" 
                  :preview-src-list="scope.row.picture_list || [scope.row.picture]" 
                  :initial-index="0"
                  fit="cover"
                  :preview-teleported="true"
              >
                <template #error>
                  <div class="image-slot">
                    <el-icon><Picture /></el-icon>
                    <span>加载失败</span>
                  </div>
                </template>
                <template #placeholder>
                  <div class="image-slot">
                    <el-icon><Loading /></el-icon>
                    <span>加载中...</span>
                  </div>
                </template>
              </el-image>
            </div>
            <div v-else class="image-slot image-slot-empty">
              <el-icon><Picture /></el-icon>
              <span>暂无图片</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="price" label="价格" width="90" sortable>
           <template #default="scope">
            <span class="price-text">￥{{scope.row.price}}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="!props.isSell" prop="seller" label="卖家" width="90" sortable/>
        <el-table-column v-if="props.isSell" prop="buyer" label="买家" width="90" sortable/>
        <el-table-column prop="quantity" label="数量" width="70" sortable />
        <el-table-column prop="condition" label="新旧程度" width="90" sortable />
        <el-table-column prop="create_time" label="创建时间" width="110" sortable >
           <template #default="scope">
            {{ formatDisplayTime(scope.row.create_time) }} 
          </template>
        </el-table-column>
        <el-table-column prop="id" label="交易ID" width="100" sortable>
            <template #default="scope">
                <span class="trade-id">{{ FormatObject.formattedUUID(scope.row.id) }}</span>
            </template>
        </el-table-column>
        <el-table-column fixed="right" prop="state" label="状态" width="100" >
          <template #default="scope">
            <StateIcon :state="scope.row.state" />
          </template>
        </el-table-column>
        <el-table-column fixed="right" prop="operation" label="操作" min-width="130" >
            <template #default="scope">
                <template v-if="scope.row.state === 0"> <!-- Initial/Withdrawn -->
                    <div>无操作</div>
                </template>
                <template v-if="(scope.row.state === 1) && (!props.isSell)"> <!-- Buyer, PendingConfirmation -->
                    <el-button @click="event_change_withdrawn(scope.row.id)" type="warning" size="small">撤销购买</el-button>
                </template>
                <template v-if="(scope.row.state === 2) && (props.isSell)"> <!-- Seller, PendingConfirmation -->
                    <el-button @click="event_change_agree(scope.row.id)" type="success" size="small">同意</el-button>
                    <el-button @click="event_change_reject(scope.row.id)" type="danger" size="small">拒绝</el-button>
                </template>
                 <template v-if="(scope.row.state === 2) && (!props.isSell)"> <!-- Buyer, PendingConfirmation (Seller is processing) -->
                    <el-button @click="event_change_withdrawn(scope.row.id)" type="warning" size="small">撤销购买</el-button>
                </template>
                <template v-if="(scope.row.state === 3) && (props.isSell)"> <!-- Seller, PendingDelivery -->
                    <el-button @click="event_change_shipped(scope.row.id)" type="primary" size="small">确认发货</el-button>
                </template>
                <template v-if="(scope.row.state === 3) && (!props.isSell)"> <!-- Buyer, PendingDelivery -->
                     <div>等待卖家发货</div> <!-- e.g., 等待卖家发货 -->
                </template>
                <template v-if="scope.row.state === 4"> <!-- Cancelled -->
                    <div>交易已取消</div> <!-- e.g., 交易已取消 -->
                </template>
                <template v-if="(scope.row.state === 5) && (!props.isSell)"> <!-- Buyer, Completed -->
                    <el-button @click="create_comment(scope.row.id)" type="success" size="small">评价</el-button>
                </template>
                <template v-if="(scope.row.state === 5) && (props.isSell)"> <!-- Seller, Completed -->
                     <div>交易已完成</div> <!-- e.g., 交易已完成 -->
                </template>
                <template v-if="(scope.row.state === 6) && (!props.isSell)"> <!-- Buyer, PendingReceipt/Delivering -->
                    <el-button @click="event_change_completed(scope.row.id)" type="success" size="small">确认收货</el-button>
                    <el-button @click="event_change_not_received(scope.row.id)" type="danger" size="small">未收到</el-button>
                </template>
                <template v-if="(scope.row.state === 6) && (props.isSell)"> <!-- Seller, PendingReceipt/Delivering -->
                     <div>等待买家收货</div> <!-- e.g., 等待买家收货 -->
                </template>
                <template v-if="scope.row.state === 7"> <!-- Dispute -->
                     <div>交易纠纷中</div> <!-- e.g., 交易纠纷中 -->
                </template>
                 <template v-if="scope.row.state === -1"> <!-- Unknown/Unmapped -->
                     <div>状态异常</div> <!-- e.g., 状态异常 -->
                </template>
            </template>
        </el-table-column>
        <template v-slot:empty>
          <div class="empty-table-content">
             <el-empty description="暂无交易记录"/>
            <div class="empty-navigator">
              <el-button type="primary" @click="handleGoSell">去出售</el-button>
              <el-button type="primary" @click="handleGoBuy">去购买</el-button>
            </div>
          </div>
        </template>
      </el-table>
      <div class="room-list-end" v-if="tableData.length > 0"> <!-- This seems leftover from chat, review if needed here -->
        <div>已经是最后一个聊天室了</div>
        <div>去其他地方逛逛吧</div>
        <div class="empty-navigator">
          <el-button type="primary" @click="handleGoSell">去出售</el-button>
          <el-button type="primary" @click="handleGoBuy">去购买</el-button>
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
        title="发表评论"
        width="30%"
        draggable
        @close="resetCommentForm"
        @closed="resetCommentForm"
        class="comment-dialog"
    >
      <el-form :model="commentForm" label-width="auto">
        <el-form-item label="评论内容" prop="content">
          <el-input
              type="textarea"
              v-model="commentForm.content"
              placeholder="请输入您的评论"
              :rows="4"
          ></el-input>
        </el-form-item>
        <el-form-item label="评分" prop="rating">
          <el-rate v-model="commentForm.rating" show-score text-color="#ff9900" score-template="{value} 星"></el-rate>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="commentDialogVisible = false">取消</el-button>
          <el-button type="success" @click="submitComment">提交</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
/* Remove unnecessary empty-navigator style defined outside the template slot */
/* .empty-navigator { */
/*   display: flex; */
/*   flex-direction: row; */
/*   justify-content: center; */
/*   align-items: center; */
/*   margin-bottom: 20px; */
/*   margin-top: 10px; */
/* } */

.tableInfo-pictureViewer {
    /* Add padding or margin if needed to separate from parent container */
    padding: 10px; /* Example padding */
}

.order-table :deep(.el-table__header th) {
    background-color: #f5f7fa; /* Light grey background for headers */
    color: #303133; /* Darker text for headers */
    font-weight: bold; /* Bold headers */
}

.order-table :deep(.el-table__cell) {
    padding: 12px 0; /* Adjust cell padding */
    color: #606266; /* Medium grey text for cell content */
}

.order-table :deep(.el-table__empty-block) {
    display: flex; /* Use flexbox for empty state */
    justify-content: center; /* Center content horizontally */
    align-items: center; /* Center content vertically */
    min-height: 300px; /* Minimum height for empty state */
}

.empty-table-content {
    text-align: center; /* Center text within the empty state */
    display: flex; /* Enable flexbox for internal alignment */
    flex-direction: column; /* Stack items vertically */
    align-items: center; /* Center items horizontally */
}

.empty-table-content .el-empty {
    padding: 0; /* Remove default padding if necessary */
}

.empty-navigator {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin-top: 20px; /* Space above buttons */
  gap: 15px; /* Space between buttons */
}

.image-preview .el-image {
    border: 1px solid #ebeef5; /* Subtle border around images */
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05); /* Light shadow */
}

.image-slot {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: #f5f7fa; /* Light background for placeholder */
  color: #909399; /* Light grey icon/text color */
  font-size: 14px; /* Adjust font size */
}

.image-slot-empty .el-icon {
   font-size: 24px; /* Larger icon for empty slot */
   margin-bottom: 5px; /* Space below icon */
}

.price-text {
    font-weight: bold; /* Bold price */
    color: #ff4f24; /* Orange price color */
}

.trade-id {
    font-family: monospace; /* Monospace font for ID */
    font-size: 0.9em; /* Slightly smaller font size */
    color: #909399; /* Light grey color for ID */
}

/* Styles for the comment dialog */
.comment-dialog :deep(.el-dialog__header) {
    border-bottom: 1px solid #ebeef5; /* Separator below header */
    padding-bottom: 15px; /* Adjust padding */
}

.comment-dialog :deep(.el-dialog__title) {
    font-size: 18px; /* Adjust title font size */
    font-weight: bold; /* Bold title */
    color: #303133; /* Dark text */
}

.comment-dialog :deep(.el-dialog__body) {
    padding-top: 20px; /* Adjust padding */
    padding-bottom: 10px; /* Adjust padding */
}

.comment-dialog :deep(.el-dialog__footer) {
     border-top: 1px solid #ebeef5; /* Separator above footer */
     padding-top: 15px; /* Adjust padding */
}

.comment-dialog .el-form-item {
    margin-bottom: 15px; /* Space between form items */
}

.comment-dialog .el-rate {
    margin-top: 5px; /* Space above the rate */
}

/* This style seems leftover from chat, review if needed here */
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
