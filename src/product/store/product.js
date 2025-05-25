const state = () => ({
  // 商品模块的状态
  productList: [], // 商品列表
  productDetail: null, // 商品详情
  userFavorites: [], // 用户收藏列表
  loading: false, // 加载状态
})

const mutations = {
  // 商品模块的 mutations
  SET_PRODUCT_LIST(state, productList) {
    state.productList = productList;
  },
  SET_PRODUCT_DETAIL(state, productDetail) {
    state.productDetail = productDetail;
  },
  SET_USER_FAVORITES(state, userFavorites) {
    state.userFavorites = userFavorites;
  },
  SET_LOADING(state, loading) {
    state.loading = loading;
  },
  // 可能需要的其他 mutations：
  // ADD_PRODUCT(state, product) { /* 添加商品到列表 */ },
  // UPDATE_PRODUCT(state, product) { /* 更新列表中某个商品 */ },
  // REMOVE_PRODUCT(state, productId) { /* 从列表中移除商品 */ },
  // ADD_FAVORITE(state, product) { state.userFavorites.push(product); },
  // REMOVE_FAVORITE(state, productId) { state.userFavorites = state.userFavorites.filter(p => p.id !== productId); },
}

const actions = {
  // 商品模块的 actions (异步操作，通常涉及 API 调用)
  // 对应 TODO: 3. 商品模块
  async fetchProductList({ commit }, params) { /* 获取商品列表 */ },
  async fetchProductDetail({ commit }, productId) { /* 获取商品详情 */ },
  async createProduct({ commit }, productData) { /* 创建商品 */ },
  async updateProduct({ commit }, productData) { /* 更新商品 */ },
  async deleteProduct({ commit }, productId) { /* 删除商品 */ },
  async toggleFavorite({ commit }, productId) { /* 切换收藏状态 */ },
  async fetchUserFavorites({ commit }) { /* 获取用户收藏列表 */ },
  // async fetchUserProducts({ commit }, userId) { /* 获取用户发布的商品列表 */ },
  // async activateProduct({ commit }, productId) { /* 管理员激活商品 */ },
  // async rejectProduct({ commit }, productId) { /* 管理员拒绝商品 */ },
  // async withdrawProduct({ commit }, productId) { /* 商品拥有者下架商品 */ },
}

const getters = {
  // 商品模块的 getters (从 state 计算派生数据)
  getProductList: state => state.productList,
  getProductDetail: state => state.productDetail,
  getUserFavorites: state => state.userFavorites,
  isLoading: state => state.loading,
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
} 