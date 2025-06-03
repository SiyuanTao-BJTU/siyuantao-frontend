import api from '@/API_PRO.js';

const state = () => ({
  // 商品模块的状态
  productList: [], // 商品列表
  productDetail: null, // 商品详情
  userFavorites: [], // 用户收藏列表
  loading: false, // 加载状态
  productCategories: [], // 新增：商品分类列表
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
  SET_PRODUCT_CATEGORIES(state, categories) { // 新增：设置商品分类列表的mutation
    state.productCategories = categories;
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
  async fetchProductList({ commit }, params) {
    commit('SET_LOADING', true);
    try {
      const response = await api.getProductList(params);
      commit('SET_PRODUCT_LIST', response.data);
    } catch (error) {
      console.error('Fetch product list failed:', error);
    } finally {
      commit('SET_LOADING', false);
    }
  },
  async fetchProductDetail({ commit }, productId) {
    commit('SET_LOADING', true);
    try {
      const response = await api.getProductDetail(productId);
      commit('SET_PRODUCT_DETAIL', response.data);
    } catch (error) {
      console.error('Fetch product detail failed:', error);
    } finally {
      commit('SET_LOADING', false);
    }
  },
  async createProduct({ commit }, productData) {
    commit('SET_LOADING', true);
    try {
      await api.createProduct(productData);
      // 可以在这里添加刷新商品列表的逻辑
    } catch (error) {
      console.error('Create product failed:', error);
    } finally {
      commit('SET_LOADING', false);
    }
  },
  async updateProduct({ commit }, productData) {
    commit('SET_LOADING', true);
    try {
      await api.updateProduct(productData.id, productData);
      // 可以在这里添加刷新商品列表的逻辑
    } catch (error) {
      console.error('Update product failed:', error);
    } finally {
      commit('SET_LOADING', false);
    }
  },
  async deleteProduct({ commit }, productId) {
    commit('SET_LOADING', true);
    try {
      await api.deleteProduct(productId);
      // 可以在这里添加刷新商品列表的逻辑
    } catch (error) {
      console.error('Delete product failed:', error);
    } finally {
      commit('SET_LOADING', false);
    }
  },
  async toggleFavorite({ commit }, productId) {
    commit('SET_LOADING', true);
    try {
      await api.toggleFavorite(productId);
      // 可以在这里添加刷新用户收藏列表的逻辑
    } catch (error) {
      console.error('Toggle favorite failed:', error);
    } finally {
      commit('SET_LOADING', false);
    }
  },
  async fetchUserFavorites({ commit }) {
    commit('SET_LOADING', true);
    try {
      const response = await api.getUserFavorites();
      commit('SET_USER_FAVORITES', response.data);
    } catch (error) {
      console.error('Fetch user favorites failed:', error);
    } finally {
      commit('SET_LOADING', false);
    }
  },
  // async fetchUserProducts({ commit }, userId) { /* 获取用户发布的商品列表 */ },
  // async activateProduct({ commit }, productId) { /* 管理员激活商品 */ },
  // async rejectProduct({ commit }, productId) { /* 管理员拒绝商品 */ },
  // async withdrawProduct({ commit }, productId) { /* 商品拥有者下架商品 */ },
  async fetchProductCategories({ commit }) { // 新增：获取商品分类列表的action
    // 暂时硬编码分类数据，后期可对接后端API
    const categories = [
      { label: '电子产品', value: '电子产品' },
      { label: '书籍文具', value: '书籍文具' },
      { label: '生活用品', value: '生活用品' },
      { label: '服装配饰', value: '服装配饰' },
      { label: '运动户外', value: '运动户外' },
      { label: '服装鞋包', value: '服装鞋包' },
      { label: '文体用品', value: '文体用品' },
      { label: '乐器', value: '乐器' },
      { label: '家居日用', value: '家居日用' },
      { label: '影音娱乐', value: '影音娱乐' },
      { label: '游戏周边', value: '游戏周边' },
      { label: '其他', value: '其他' },
    ];
    commit('SET_PRODUCT_CATEGORIES', categories);
  },
}

const getters = {
  // 商品模块的 getters (从 state 计算派生数据)
  getProductList: state => state.productList,
  getProductDetail: state => state.productDetail,
  getUserFavorites: state => state.userFavorites,
  isLoading: state => state.loading,
  getProductCategories: state => state.productCategories, // 新增：获取商品分类列表的getter
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
} 