<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { Refresh, Search } from "@element-plus/icons-vue";
import api from '@/API_PRO.js'; // 导入新的 API 服务
import { ElMessage } from "element-plus";
import ProductCard from "@/product/components/ProductCard.vue"; // 引入 ProductCard
import ProductDetail from "@/product/components/ProductDetail.vue"; // 1. 导入 ProductDetail 组件

const products = ref([]);
const isLoading = ref(true);
const error = ref(null);

// 筛选条件
const filters = ref({
  searchKeyword: '',
  category: '',
  condition: '', // '全新', '几乎全新', '轻微使用痕迹', '明显使用痕迹'
  priceRange: [0, 10000] // 假设价格范围
});

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

// 2. 添加控制 ProductDetail 对话框的 ref
const isDetailDialogVisible = ref(false);
const currentProductIdForDetail = ref(null);

const fetchProductData = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const params = {
      keyword: filters.value.searchKeyword || undefined,
      category_name: filters.value.category || undefined,
      // 后端目前不支持 condition 和 priceRange 筛选，所以不传递
      // condition: filters.value.condition || undefined, 
      // min_price: filters.value.priceRange[0],
      // max_price: filters.value.priceRange[1],
      page_number: 1, // 暂时获取第一页，后续可添加分页
      page_size: 100, // 获取较多数据以便前端筛选（如果后端筛选不全）
      // product_status: 'Active' // 确保只获取在售商品，如果API默认不是这样
    };
    const response = await api.getProductList(params);
    products.value = response; // API直接返回数组
  } catch (err) {
    console.error("获取商品列表失败:", err);
    error.value = "获取商品列表失败，请稍后重试。";
    ElMessage.error(error.value);
  } finally {
    isLoading.value = false;
  }
};

const filteredProducts = computed(() => {
  let tempProducts = products.value;

  // 前端筛选（如果后端筛选不完善或未提供所有选项）
  if (filters.value.condition) {
    // 后端已返回商品成色字段，但如果后端API不直接支持按成色筛选，则在此进行前端筛选
    // tempProducts = tempProducts.filter(p => p.商品成色 === filters.value.condition);
  }
  if (filters.value.priceRange) {
    // tempProducts = tempProducts.filter(p => {
    //   const price = parseFloat(p.价格);
    //   return price >= filters.value.priceRange[0] && price <= filters.value.priceRange[1];
    // });
  }
  return tempProducts;
});

const showProductDetail = (productId) => {
  console.log('Attempting to show product detail for ID:', productId);
  currentProductIdForDetail.value = productId;
  isDetailDialogVisible.value = true;
  console.log('isDetailDialogVisible:', isDetailDialogVisible.value, 'currentProductIdForDetail:', currentProductIdForDetail.value);
};

const resetFilters = () => {
  filters.value = {
    searchKeyword: '',
    category: '',
    condition: '',
    priceRange: [0, 10000]
  };
  fetchProductData(); // 重置后重新获取数据
};

onMounted(() => {
  fetchProductData();
});

// 监听筛选条件变化，重新获取数据
watch(filters, fetchProductData, { deep: true });

const handleSearch = () => {
  // searchQuery 为空时，也应该允许搜索（即获取所有或基于其他筛选条件的商品）
  // if (searchQuery.value === "") {
  //   ElMessage.warning('搜索内容不能为空');
  //   return;
  // }
  fetchProductData();
};

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
  currentPage.value = 1; // 筛选时重置到第一页
  handleSearch();
}

const handleSizeChange = (newSize) => {
  pageSize.value = newSize;
  currentPage.value = 1; // 改变每页数量时重置到第一页
  handleSearch();
}

const handleCurrentChange = (newPage) => {
  currentPage.value = newPage;
  handleSearch();
}
</script>

<template>
  <div class="basic-container">
    <div class="center-container">
      <!-- 统一的搜索和筛选区域 -->
      <el-card class="search-filter-card" shadow="never">
        <!-- 主搜索栏 -->
        <el-input class="searching-bar"
            v-model="filters.searchKeyword" 
            placeholder="请输入商品名称、描述等关键词"
            @keyup.enter="handleFilter" 
            clearable
        >
          <template #append>
            <el-button @click="handleFilter">
              <el-icon><Search /></el-icon>
            </el-button>
          </template>
        </el-input>

        <!-- 筛选条件行 -->
        <div class="filter-options-row">
          <el-select
            v-model="filters.category" 
            placeholder="商品分类"
            clearable
            @change="handleFilter"
            class="filter-select"
          >
            <el-option label="电子产品" value="电子产品" />
            <el-option label="书籍文具" value="书籍文具" />
            <el-option label="生活用品" value="生活用品" />
            <el-option label="服装配饰" value="服装配饰" />
            <el-option label="运动户外" value="运动户外" />
            <el-option label="服装鞋包" value="服装鞋包"></el-option>
            <el-option label="文体用品" value="文体用品"></el-option>
            <el-option label="乐器" value="乐器"></el-option>
            <el-option label="家居日用" value="家居日用"></el-option>
            <el-option label="影音娱乐" value="影音娱乐"></el-option>
            <el-option label="游戏周边" value="游戏周边"></el-option>
            <el-option label="其他" value="其他" />
          </el-select>
          
          <el-input
            v-model.number="filters.priceRange[0]" 
            type="number"
            placeholder="最低价格"
            clearable
            @input="handleFilter" 
            class="price-input"
          />
          <span class->-</span>
          <el-input
            v-model.number="filters.priceRange[1]" 
            type="number"
            placeholder="最高价格"
            clearable
            @input="handleFilter"
            class="price-input"
          />
          <el-button @click="resetFilters">重置筛选</el-button>
        </div>
      </el-card>

      <!-- 商品列表区域 -->
      <div class="item-info-block" v-if="filteredProducts.length > 0 || total > 0"> <!-- 修改判断条件，即使当前页为空但总数不为0也显示 -->
        <div class="button-block">
          <div class="title-font">商品列表</div>
          <el-button @click="recommendCall" type="primary">
            <el-icon><Refresh /></el-icon>
             刷新
          </el-button>
        </div>
        <div v-if="filteredProducts.length > 0" class="block-for-content">
          <div v-for="(card, index) in filteredProducts" :key="card.商品ID || index" class="card" @click="showProductDetail(card.商品ID)">
            <ProductCard
                :product="card"
            />
          </div>
        </div>
        <el-empty v-else description="当前页无商品，请尝试调整筛选条件或页码" />
        <!-- 分页 -->
        <div class="pagination-wrapper" v-if="total > 0">
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
        <el-empty description="暂无商品可显示，快去看看别的吧~"/>
        <el-button @click="recommendCall" type="primary" style="margin-bottom: 20px">
          <el-icon><Refresh /></el-icon>
          刷新看看
        </el-button>
      </div>
    </div>

    <!-- 5. 嵌入 ProductDetail 对话框 -->
    <ProductDetail
      v-if="currentProductIdForDetail" 
      :product-id="currentProductIdForDetail"
      :dialog-visible="isDetailDialogVisible"
      @update:dialogVisible="isDetailDialogVisible = $event"
      @close="currentProductIdForDetail = null" 
    />
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

/* 新的统一搜索筛选卡片样式 */
.search-filter-card {
  width: 100%;
  margin-bottom: 20px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.08);
  padding: 20px;
  box-sizing: border-box;
}

.searching-bar {
  /* background-color: #ffffff; */ /* No longer needed as parent card has bg */
  /* padding: 0; */
  /* text-align: center; */
  /* box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.08); */ /* Shadow now on parent card */
  width: 100%;
  /* z-index: 1; */
  height: 40px; /* Reduced height */
  margin-bottom: 15px; /* Space below search bar */
  /* border-radius: 8px; */ /* Radius now on parent card */
  /* overflow: hidden; */
}

.searching-bar :deep(.el-input__wrapper) {
    padding: 0 15px;
    box-shadow: none !important;
    /* background-color: transparent !important; */ /* Let it inherit for consistency */
    border-radius: 6px 0 0 6px; /* Match button */
}

.searching-bar :deep(.el-input-group__append) {
    background-color: #4A90E2;
    color: #fff;
    padding: 0 15px;
    border-radius: 0 6px 6px 0;
}

.searching-bar :deep(.el-button) {
     color: #fff;
}

.filter-options-row {
  display: flex;
  gap: 15px; /* Space between filter elements */
  align-items: center;
  flex-wrap: wrap; /* Allow wrapping on smaller screens */
}

.filter-select {
  width: 180px; /* Adjust width as needed */
}

.price-input {
  width: 120px; /* Adjust width as needed */
}

.filter-options-row > span {
  margin: 0 5px;
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
  cursor: pointer; /* Add cursor pointer to indicate clickable */
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

