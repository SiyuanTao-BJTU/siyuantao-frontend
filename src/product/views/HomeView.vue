<script setup>
import { onMounted, ref, watch } from "vue";
import {Refresh, Search} from "@element-plus/icons-vue";
import api from '@/API_PRO.js'; // 导入新的 API 服务
import {ElMessage} from "element-plus";
import PurchaseGoodsCard from "@/product/components/PurchaseGoodsCard.vue";

// 组件基本变量设置
const colors = ['#ffffff', '#ffffff'] // 色块的颜色
const cardCount = 20; // 每页显示的卡片数量
const cardList = ref([]); // 商品卡片列表
const searchQuery = ref(''); // 搜索框内容
const componentKey = ref(0); // 用于强制刷新组件
const categoryFilter = ref('');
const priceMin = ref(null); // 初始化为 null 或 undefined
const priceMax = ref(null); // 初始化为 null 或 undefined
// const conditionFilter = ref(''); // 移除 conditionFilter，因为API不支持
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

// 顶部推荐商品 (如果API返回不足3个，会用空对象填充)
const top_item_1 = ref({});
const top_item_2 = ref({});
const top_item_3 = ref({});

const handleSearch = () => {
  // searchQuery 为空时，也应该允许搜索（即获取所有或基于其他筛选条件的商品）
  // if (searchQuery.value === "") {
  //   ElMessage.warning('搜索内容不能为空');
  //   return;
  // }
  fetchProductData();
};

// 统一的数据获取函数
const fetchProductData = () => {
  const filters = {
    keyword: searchQuery.value || undefined,
    category_name: categoryFilter.value || undefined,
    min_price: priceMin.value ? parseFloat(priceMin.value) : undefined,
    max_price: priceMax.value ? parseFloat(priceMax.value) : undefined,
    // condition: conditionFilter.value || undefined, // API不支持condition
    page_number: currentPage.value,
    page_size: pageSize.value
  };
  api.getProductList(filters)
    .then(data => {
      // 后端返回的数据直接是列表，没有 list 和 total 嵌套
      if (data && Array.isArray(data)) {
        cardList.value = data.map(item => ({
          id: item.商品ID,
          name: item.商品名称,
          description: item.商品描述,
          price: parseFloat(item.价格),
          // 确保 img 是一个数组，即使只有一个主图URL
          img: item.主图URL ? [item.主图URL] : [], 
          // 如果需要显示发布者等其他信息，也在这里映射
          // user: { username: item.发布者用户名, ... }
        }));
        // total 的计算方式：如果后端在每个商品项中返回了 总商品数，
        // 且这个数在分页查询下代表的是符合当前筛选条件的总数，则可以使用它。
        // 否则，如果API本身不直接返回分页后的总数，前端可能需要另一接口或接受当前返回列表长度作为当前页数量
        // 假设后端 getProductList 返回的每个 item 包含 总商品数，且它是过滤后的总数
        total.value = data.length > 0 ? data[0].总商品数 : 0; 
        
        if (cardList.value.length === 0) {
          ElMessage.info('未找到相关商品');
        }

        // 更新顶部推荐商品（如果逻辑需要基于当前筛选结果）
        // 这个逻辑可能需要调整，首页推荐通常是独立的
        top_item_1.value = cardList.value[0] || {}; 
        top_item_2.value = cardList.value[1] || {};
        top_item_3.value = cardList.value[2] || {};

      } else {
        ElMessage.info('暂无商品数据');
        cardList.value = [];
        total.value = 0;
        top_item_1.value = {}; top_item_2.value = {}; top_item_3.value = {};
      }
    })
    .catch(error => {
      console.error("API getProductList failure:", error);
      ElMessage.error('获取商品列表失败: ' + (error.response?.data?.detail || error.message));
      cardList.value = []; 
      total.value = 0;
      top_item_1.value = {}; top_item_2.value = {}; top_item_3.value = {};
    });
  componentKey.value += 1;
}

const recommendCall = () => {
  // 首页推荐通常有自己的逻辑或调用特定API，或者就是默认的 getProductList 无特殊过滤
  searchQuery.value = ''; // 清空搜索词
  categoryFilter.value = ''; // 清空分类
  priceMin.value = null;
  priceMax.value = null;
  currentPage.value = 1; // 重置到第一页
  fetchProductData(); 
};

const handleTagClick = (tag) => {
  searchQuery.value = tag;
  // Ensure handleSearch calls getProductList with the correct search filter format
  handleSearch(); // handleSearch already uses { search: searchQuery.value }
};

const handleFilter = () => {
  handleSearch();
}

const handleSizeChange = (newSize) => {
  pageSize.value = newSize;
  handleSearch();
}

const handleCurrentChange = (newPage) => {
  currentPage.value = newPage;
  handleSearch();
}

onMounted(() => {
  recommendCall()
});
</script>


<template>
  <div class="basic-container">
    <div class="center-container">
      <!-- 顶部搜索栏 -->
      <el-input class="searching-bar"
          v-model="searchQuery"
          placeholder="请输入搜索内容"
      >
        <template #append>
          <el-button @click="handleSearch">
            <el-icon><Search /></el-icon>
          </el-button>
        </template>
      </el-input>

      <!-- 筛选区域 -->
      <el-card class="filter-card" shadow="never">
        <div class="filter-content">
          <div class="filter-row">
            <el-select
              v-model="categoryFilter"
              placeholder="商品分类"
              clearable
              @change="handleFilter"
              class="filter-select"
            >
              <el-option label="电子产品" value="electronics" />
              <el-option label="书籍文具" value="books" />
              <el-option label="生活用品" value="daily" />
              <el-option label="服装配饰" value="clothing" />
              <el-option label="其他" value="others" />
            </el-select>
            <el-input
              v-model="priceMin"
              placeholder="最低价格"
              clearable
              @input="handleFilter"
              class="price-input"
            />
            <el-input
              v-model="priceMax"
              placeholder="最高价格"
              clearable
              @input="handleFilter"
              class="price-input"
            />
            <!-- <el-select
              v-model="conditionFilter"
              placeholder="新旧程度"
              clearable
              @change="handleFilter"
              class="filter-select"
            >
              <el-option label="全新" value="new" />
              <el-option label="九成新" value="90%" />
              <el-option label="八成新" value="80%" />
              <el-option label="七成新" value="70%" />
              <el-option label="六成新及以下" value="60% and below" />
            </el-select> -->
          </div>
        </div>
      </el-card>

      <!-- 商品列表区域 -->
      <div class="item-info-block" v-if="cardList.length !== 0">
        <div class="button-block">
          <div class="title-font">商品列表</div>
          <el-button @click="recommendCall" type="primary">
            <el-icon><Refresh /></el-icon>
             刷新
          </el-button>
        </div>
        <div class="block-for-content">
          <div v-for="(card, index) in cardList" :key="card.id || index" class="card">
            <PurchaseGoodsCard
                :img="card.img"
                :itemName="card.name"
                :price="card.price"
                :description="card.description"
                :itemID="card.id"
                :key="card.id || componentKey"
            />
          </div>
        </div>
        <!-- 分页 -->
        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
      <div v-else class="empty-block">
        <el-empty description="暂无商品可显示"/>
        <el-button @click="recommendCall" type="primary" style="margin-bottom: 20px">
          <el-icon><Refresh /></el-icon>
          刷新
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
  background-color: transparent; /* Use parent background (likely #f5f7fa) */
  padding-top: 20px; /* Reduce padding for fixed navigation bar */
  min-height: 100vh; /* Ensure it takes full height */
  box-sizing: border-box;
  padding-bottom: 20px; /* Add padding at the bottom */
}

.center-container{
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  width: 100%;
  max-width: 1400px; /* Increase max-width for wider screens */
  min-width: 768px; /* Adjust min-width for better responsiveness on smaller screens */
  margin-top: 0; /* Adjust margin-top */
  padding: 0 20px; /* Add horizontal padding */
  box-sizing: border-box;
}

.searching-bar {
  background-color: #ffffff; /* 白色背景 */
  padding: 0; /* Remove padding here */
  text-align: center;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.08); /* 柔和阴影 */
  width: 100%;
  z-index: 1; /* Lower z-index than navbar */
  height: 50px; /* Adjust height */
  margin-bottom: 20px; /* Space below search bar */
   border-radius: 8px; /* Rounded corners */
   overflow: hidden; /* Ensure no overflow from inner elements */
}

.searching-bar :deep(.el-input__wrapper) {
    padding: 0 15px; /* Add inner padding */
    box-shadow: none !important; /* Remove default shadow */
    background-color: transparent !important; /* Transparent background */
}

.searching-bar :deep(.el-input-group__append) {
    background-color: #4A90E2; /* 强调蓝色背景 */
    color: #fff; /* 白色文字 */
    padding: 0 15px; /* Adjust padding */
}

.searching-bar :deep(.el-button) {
     color: #fff; /* 白色图标 */
}

/* New flex container for categories and featured items */
.homepage-content-block {
    display: flex;
    flex-direction: row;
    width: 100%;
    background-color: #fff; /* 白色背景 */
    border-radius: 12px;
    box-shadow: 0px 2px 12px rgba(0, 0, 0, 0.08); /* 更柔和的阴影 */
    padding: 20px; /* Inner padding */
    box-sizing: border-box;
    gap: 20px; /* Space between left and right blocks */
    margin-bottom: 20px; /* Space below this block */
}

/* Left Category Navigation */
.category-navigation {
    width: 20%; /* Adjust width as needed */
    display: flex;
    flex-direction: column;
    gap: 10px; /* Space between category items */
    padding-right: 20px; /* Add padding to the right */
    border-right: 1px solid #ebeef5; /* Add a subtle separator */
}

.category-item {
    display: flex;
    align-items: center;
    padding: 10px 15px; /* Adjust padding */
    border-radius: 8px; /* Rounded corners */
    cursor: pointer;
    transition: background-color 0.3s ease;
    font-size: 15px; /* Adjust font size */
}

.category-item:hover {
    background-color: #eef1f6; /* 浅灰色悬停背景 */
}

.category-item.active {
    background-color: #4A90E2; /* Highlight color for active category */
    color: #fff; /* White text */
}

.category-item.active span {
     color: #fff; /* White text for span in active item */
}

.category-icon {
    width: 20px; /* Adjust icon size */
    height: 20px; /* Adjust icon size */
    margin-right: 10px; /* Space between icon and text */
}

.category-item span {
    font-weight: 500; /* Slightly less bold */
     color: #303133; /* Dark text for default items */
}


/* Right Featured Items Block */
.featured-items-block {
    flex-grow: 1; /* Takes remaining space */
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); /* Responsive grid for cards, adjust minmax */
    gap: 15px; /* Space between featured cards */
}

.featured-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: #eef1f6; /* Card background */
    border-radius: 8px; /* Rounded corners */
    padding: 15px; /* Inner padding */
    box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.08); /* 更柔和的阴影 */
    cursor: pointer;
    transition: transform 0.3s ease, box-shadow 0.3s ease; /* Add box-shadow transition */
}

.featured-card:hover {
     transform: translateY(-5px); /* Lift card on hover */
     box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12); /* Enhanced shadow on hover */
}

.featured-item-image {
    width: 100%; /* Image takes full width of card */
    height: 120px; /* Fixed image height, adjust as needed */
    object-fit: cover; /* Ensure image covers area */
    border-radius: 4px; /* Rounded corners for image */
    margin-bottom: 10px; /* Space below image */
}

.featured-item-info {
    text-align: center;
    width: 100%; /* Ensure info block takes full width */
}

.featured-item-info h4 {
    font-size: 16px; /* Adjust font size */
    font-weight: bold; /* Bold font */
    margin: 0 0 5px 0; /* Adjust margin */
    color: #303133; /* Dark text */
    overflow: hidden; /* Hide overflow text */
    text-overflow: ellipsis; /* Add ellipsis for overflow */
    white-space: nowrap; /* Prevent wrapping */
}

.featured-item-info .price {
    font-size: 15px; /* Adjust font size */
    font-weight: bold; /* Bold font */
    color: #ff4f24; /* Orange price color */
}


/* Existing Item List styles (adjust as needed) */
.item-info-block {
  display: flex;
  flex-direction: column; /* Stack title/button and content */
  width: 100%;
  background-color: #fff; /* 白色背景 */
  box-shadow: 0px 2px 12px rgba(0, 0, 0, 0.08); /* 柔和阴影 */
  border-radius: 12px; /* Rounded corners */
  padding: 20px; /* Inner padding */
  box-sizing: border-box;
   margin-top: 20px; /* Add space above item list */
}

.button-block {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px; /* Space below title/button */
}

.title-font {
  font-size: 20px; /* Adjust font size for module title */
  font-weight: bold; /* Bold font */
  color: #303133; /* Dark text */
}

/* Adjust grid for product cards if needed */
.block-for-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); /* Responsive grid */
  gap: 20px; /* Space between cards */
}

.card {
  background-color: #ffffff; /* 白色背景 */
  border-radius: 8px; /* Rounded corners */
  padding: 15px; /* Inner padding */
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.06); /* 更柔和的阴影 */
  box-sizing: border-box;
  width: 100%;
  transition: transform 0.3s ease, box-shadow 0.3s ease; /* Add transition */
}

.card:hover {
    transform: translateY(-5px); /* Lift card on hover */
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1); /* Enhanced shadow on hover */
}

/* Adjustments for the PurchaseGoodsCard content inside the card */
.card :deep(.purchase-goods-card-container) {
    padding: 0; /* Remove padding from the inner component if it has any */
    box-shadow: none; /* Remove shadow from inner component */
}

/* Style adjustments for elements within PurchaseGoodsCard if necessary */
/* Example: Adjusting title/price font size or color within the card */
.card :deep(.item-name) {
    font-size: 16px; /* Adjust item name font size */
    font-weight: bold; /* Bold */
    color: #303133; /* Dark text */
}

.card :deep(.item-price) {
    font-size: 15px; /* Adjust price font size */
    font-weight: bold; /* Bold */
    color: #ff4f24; /* Orange price color */
}

.card :deep(.item-description) {
    font-size: 13px; /* Adjust description font size */
    color: #606266; /* Medium grey text */
}

.empty-block {
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  height: auto;
  align-items: center;
  background-color:  #fff; /* 白色背景 */
  border-radius: 8px;
  padding: 30px; /* Increase padding */
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.08); /* 柔和阴影 */
   margin-top: 20px; /* Add space above empty block */
}

/* Remove or adjust unused styles */
.tag-container, .block-container {
    /* Remove or adjust styles as they are replaced by category-navigation and featured-items-block */
    /* display: none; */ /* Hide old elements */
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .homepage-content-block {
    flex-direction: column; /* Stack category and featured items vertically */
  }
  .category-navigation {
    width: 100%; /* Full width categories */
    flex-direction: row; /* Display categories horizontally in smaller screens */
    overflow-x: auto; /* Add horizontal scroll if needed */
    border-right: none; /* Remove vertical border */
    border-bottom: 1px solid #ebeef5; /* Add bottom border */
    padding-right: 0; /* Remove right padding */
    padding-bottom: 15px; /* Add bottom padding */
    margin-bottom: 15px; /* Add space below categories */
  }
  .category-item {
    flex-shrink: 0; /* Prevent items from shrinking */
  }

  .featured-items-block {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); /* Adjust grid for smaller cards */
  }
}
</style>

