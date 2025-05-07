import axiosClient from './axios_client/index.js'; // 导入 axiosClient

// 假设项目中使用了 axios 作为 HTTP 客户端
// import axios from 'axios'; // 在实际 Vue 项目中取消注释，并确保已安装 axios

// 后端 API 的基础 URL - 请根据您的环境修改
// const BASE_URL = 'http://127.0.0.1:8000/api'; // 开发环境示例  // REMOVED

/**
 * 辅助函数，用于发起 API 请求
 * @param {string} method - HTTP 方法 (GET, POST, PUT, DELETE, etc.)
 * @param {string} path - API 路径 (例如 /user/login/)
 * @param {object|null} data - 请求体数据 (用于 POST, PUT)
 * @param {object|null} params - URL 查询参数 (用于 GET)
 * @param {boolean} isFormData - 指示请求体是否为 FormData (用于文件上传)
 * @returns {Promise<any>} - API 响应数据
 */
const apiRequest = async (method, path, data = null, params = null, isFormData = false) => {
  // const url = `${BASE_URL}${path}`; // REMOVED
  
  // ---- 实际项目中需要处理认证 Token ----
  // const token = localStorage.getItem('accessToken'); // 或从 Vuex/Pinia store 获取
  // const headers = {
  //   'Content-Type': isFormData ? 'multipart/form-data' : 'application/json',
  // };
  // if (token) {
  //   headers['Authorization'] = `Bearer ${token}`;
  // }
  // -------------------------------------
  
  // 为了生成文件，这里使用模拟的 headers // REMOVED
  // const headers = { // REMOVED
  //   'Content-Type': isFormData ? 'multipart/form-data' : 'application/json', // REMOVED
  //   // 'Authorization': `Bearer MOCK_TOKEN` // 模拟 Token // REMOVED
  // }; // REMOVED

  const config = {
    method,
    url: path, // MODIFIED: Use path directly, axiosClient has baseURL
    headers: {}, // Initialize headers, interceptor will add Content-Type if needed
  };

  if (isFormData) {
    config.headers['Content-Type'] = 'multipart/form-data';
  } else {
    // For other types, axios typically sets application/json by default if data is an object
    // but explicit for clarity or if specific non-json types are needed in future
    config.headers['Content-Type'] = 'application/json';
  }

  if (data) {
    config.data = data;
  }
  if (params) {
    config.params = params;
  }

  // console.log(`Simulating ${method} request to ${url}`); // REMOVED
  // console.log('Headers:', headers); // REMOVED
  // console.log('Data:', data); // REMOVED
  // console.log('Params:', params); // REMOVED

  // ---- 在实际 Vue 项目中使用 axios ----
  try { // UNCOMMENTED
    const response = await axiosClient(config); // MODIFIED: use axiosClient
    return response.data; // 通常返回 response.data
  } catch (error) { // UNCOMMENTED
    // console.error(`API Error ${method} ${path}:`, error.response || error.message); // Keep or remove based on preference
    // The existing axiosClient interceptor already handles general error messages (ElMessage)
    // and 401 redirection. So, specific error handling here might be redundant
    // unless additional, component-specific error processing is needed.
    // if (error.response && error.response.status === 401) {
    //   // 处理 Token 过期或无效，例如跳转登录页
    //   // window.location.href = '/login'; // Handled by axiosClient interceptor
    // }
    throw error; // 重新抛出错误，让调用组件或 axiosClient 拦截器处理
  }
  // ------------------------------------
  
  // 返回一个模拟的 Promise，方便前端代码结构 // REMOVED
  // return Promise.resolve({ // REMOVED
  //   code: 0, // 模拟成功响应 // REMOVED
  //   message: `Simulated ${method} to ${url} successful.`,  // REMOVED
  //   data: data || params || {} // REMOVED
  // }); // REMOVED
};

// ========================================================================
// User Authentication & Management (来自 itemTrade/urls/user.py)
// ========================================================================

/**
 * @summary 用户登录
 * @method POST
 * @path /user/login/
 * @param {object} credentials - { username, password }
 */
const userLogin = (credentials) => {
  return apiRequest('POST', '/user/login/', credentials);
};

/**
 * @summary 刷新 Access Token
 * @method POST
 * @path /user/refresh/
 * @param {object} refreshToken - { refresh: "your_refresh_token" }
 */
const userRefreshToken = (refreshToken) => {
  return apiRequest('POST', '/user/refresh/', refreshToken);
};

/**
 * @summary 用户注册
 * @method POST
 * @path /user/register/
 * @param {object} userData - 包含用户名、密码、邮箱等注册信息
 *                          (参考 RegisterSerializer: { username, password, confirm_password, email?, first_name?, ...})
 */
const userRegister = (userData) => {
  return apiRequest('POST', '/user/register/', userData);
};

/**
 * @summary 修改当前用户密码 (需要认证)
 * @method POST
 * @path /user/password/
 * @param {object} passwordData - { origin_password, new_password, confirm_new_password }
 */
const userModifyPassword = (passwordData) => {
  return apiRequest('POST', '/user/password/', passwordData);
};

/**
 * @summary 获取用户信息 (需要认证)
 * @method GET
 * @path /user/profile/
 * @param {string} [username] - 可选，查询指定用户的用户名，不提供则获取当前登录用户信息
 */
const getUserProfile = (username) => {
  const queryParams = username ? { username } : {};
  return apiRequest('GET', '/user/profile/', null, queryParams);
};

/**
 * @summary 修改当前用户个人信息 (需要认证)
 * @method PUT
 * @path /user/profile/
 * @param {object} profileData - 要更新的用户信息 (参考 CustomUserSerializer, 支持部分更新)
 */
const updateUserProfile = (profileData) => {
  return apiRequest('PUT', '/user/profile/', profileData);
};

/**
 * @summary 获取指定用户作为卖家的交易收到的评论 (需要认证)
 * @method GET
 * @path /user/comments/
 * @param {number} userId - 目标用户的ID
 */
const getUserTradeComments = (userId) => {
  return apiRequest('GET', '/user/comments/', null, { user_id: userId });
};

/**
 * @summary 获取当前用户的购买记录 (需要认证)
 * @method GET
 * @path /user/records/bought/
 */
const getUserBoughtRecords = () => {
  return apiRequest('GET', '/user/records/bought/');
};

/**
 * @summary 获取当前用户的销售记录 (需要认证)
 * @method GET
 * @path /user/records/sold/
 */
const getUserSoldRecords = () => {
  return apiRequest('GET', '/user/records/sold/');
};


// ========================================================================
// Product Management (来自 itemTrade/urls/item.py)
// ========================================================================

/**
 * @summary 获取商品列表
 * @method GET
 * @path /item/products/
 * @param {object} [filters] - 可选的过滤参数 { category_id, search, owner_id, status }
 */
const getProductList = (filters) => {
  return apiRequest('GET', '/item/products/', null, filters);
};

/**
 * @summary 创建新商品 (需要认证)
 * @method POST
 * @path /item/products/
 * @param {FormData|object} productData - 商品数据。
 *                                      如果包含图片上传，应为 FormData 实例。
 *                                      (参考 ProductSerializer: { name, price, quantity, category (pk), description?, condition? })
 *                                      后端会自动设置 owner。
 *                                      对于图片(images): 如果是 FormData, 应包含 image 文件；如果是 JSON，应为图片信息数组 (通常创建时直接传文件)。
 * @note 若包含图片上传，请确保 isFormData = true，并正确构造 FormData
 */
const createProduct = (productData, isFormData = false) => {
  // 如果 productData 中包含文件，应该用 FormData
  // 例如: const formData = new FormData();
  // formData.append('name', productData.name);
  // formData.append('images[0]image_path', fileObject); // 这种嵌套结构需要后端支持或扁平化
  // formData.append('image_file_field_name', fileObject); // 更常见
  return apiRequest('POST', '/item/products/', productData, null, isFormData);
};

/**
 * @summary 获取单个商品详情
 * @method GET
 * @path /item/products/{productId}/
 * @param {string} productId - 商品的UUID
 */
const getProductDetail = (productId) => {
  return apiRequest('GET', `/item/products/${productId}/`);
};

/**
 * @summary 修改商品信息 (需要认证，所有者或管理员)
 * @method PUT
 * @path /item/products/{productId}/
 * @param {string} productId - 商品的UUID
 * @param {FormData|object} productData - 更新的商品数据 (参考 ProductSerializer, 支持部分更新)
 * @note 若包含图片上传/修改，请确保 isFormData = true，并正确构造 FormData
 */
const updateProduct = (productId, productData, isFormData = false) => {
  return apiRequest('PUT', `/item/products/${productId}/`, productData, null, isFormData);
};

/**
 * @summary 删除商品 (需要认证，所有者或管理员)
 * @method DELETE
 * @path /item/products/{productId}/
 * @param {string} productId - 商品的UUID
 */
const deleteProduct = (productId) => {
  return apiRequest('DELETE', `/item/products/${productId}/`);
};

/**
 * @summary 为商品添加评论 (需要认证)
 * @method POST
 * @path /item/products/{productId}/comments/
 * @param {string} productId - 商品的UUID
 * @param {object} commentData - { content, rating }
 */
const addProductComment = (productId, commentData) => {
  return apiRequest('POST', `/item/products/${productId}/comments/`, commentData);
};

/**
 * @summary 获取某商品的所有评论
 * @method GET
 * @path /item/products/{productId}/comments/
 * @param {string} productId - 商品的UUID
 */
const getProductComments = (productId) => {
  return apiRequest('GET', `/item/products/${productId}/comments/`);
};

// ========================================================================
// Transaction Management (来自 itemTrade/urls/trade.py)
// ========================================================================

/**
 * @summary 创建新交易 (需要认证)
 * @method POST
 * @path /trade/transactions/
 * @param {object} transactionData - { product (pk), quantity, location?, meet_time? }
 */
const createTransaction = (transactionData) => {
  return apiRequest('POST', '/trade/transactions/', transactionData);
};

/**
 * @summary 获取单个交易详情 (需要认证，买家或卖家)
 * @method GET
 * @path /trade/transactions/{transactionId}/
 * @param {string} transactionId - 交易的UUID
 */
const getTransactionDetail = (transactionId) => {
  return apiRequest('GET', `/trade/transactions/${transactionId}/`);
};

/**
 * @summary 更新交易状态 (需要认证，买家或卖家)
 * @method PUT
 * @path /trade/transactions/{transactionId}/
 * @param {string} transactionId - 交易的UUID
 * @param {object} statusData - { status: "new_status_value" } (参考 TransactionUpdateSerializer 和模型状态)
 */
const updateTransactionStatus = (transactionId, statusData) => {
  return apiRequest('PUT', `/trade/transactions/${transactionId}/`, statusData);
};

/**
 * @summary 为交易添加评论 (需要认证，买家或卖家)
 * @method POST
 * @path /trade/transactions/{transactionId}/comments/
 * @param {string} transactionId - 交易的UUID
 * @param {object} commentData - { content, rating }
 */
const addTransactionComment = (transactionId, commentData) => {
  return apiRequest('POST', `/trade/transactions/${transactionId}/comments/`, commentData);
};

/**
 * @summary 获取与当前用户相关的聊天室列表 (基于交易) (需要认证)
 * @method GET
 * @path /trade/chatrooms/
 */
const getChatRoomList = () => {
  return apiRequest('GET', '/trade/chatrooms/');
};

// ========================================================================
// Chat Messages (来自 itemTrade/urls/chat.py)
// HTTP API for messages. WebSocket handling is separate.
// ========================================================================

/**
 * @summary 获取某交易（聊天室）的聊天记录 (需要认证，买家或卖家)
 * @method GET
 * @path /chat/transactions/{transactionId}/messages/
 * @param {string} transactionId - 交易的UUID (即聊天室ID)
 */
const getTransactionMessages = (transactionId) => {
  return apiRequest('GET', `/chat/transactions/${transactionId}/messages/`);
};

/**
 * @summary 在某交易（聊天室）中发送消息 (需要认证，买家或卖家)
 * @method POST
 * @path /chat/transactions/{transactionId}/messages/
 * @param {string} transactionId - 交易的UUID (即聊天室ID)
 * @param {object} messageData - { content }
 */
const sendTransactionMessage = (transactionId, messageData) => {
  return apiRequest('post', `/chat/transactions/${transactionId}/messages/`, messageData);
};

// ========================================================================
// WebSocket Chat (来自 itemTrade/chat/routing.py)
// ========================================================================

/**
 * @summary 获取 WebSocket 连接 URL
 * @param {string|number} userId - 当前登录用户的ID
 * @returns {string} WebSocket URL
 * @example
 * const wsUrl = getChatWebSocketUrl(currentUserId);
 * const socket = new WebSocket(wsUrl);
 * 
 * socket.onopen = () => { console.log('WebSocket Connected'); };
 * socket.onmessage = (event) => { 
 *   const data = JSON.parse(event.data);
 *   console.log('WebSocket Message:', data);
 *   // 根据 event.type 或 data.event 处理不同类型的消息
 * };
 * socket.onclose = () => { console.log('WebSocket Disconnected'); };
 * socket.onerror = (error) => { console.error('WebSocket Error:', error); };
 * 
 * // 发送消息示例 (根据后端 consumers.py 中的逻辑)
 * // socket.send(JSON.stringify({ event: 'sendmessage', tradeid: 'some_trade_uuid', content: 'Hello!' }));
 */
const getChatWebSocketUrl = (userId) => {
  // 确保 URL 与后端 Daphne 服务器的地址和路由配置一致
  // 如果 BASE_URL 包含 http:// or https://, WebSocket 通常用 ws:// or wss://
  
  // 使用 axiosClient 的 baseURL 来构造 WebSocket URL
  let wsBaseUrl = axiosClient.defaults.baseURL;
  if (wsBaseUrl.startsWith('http://')) {
    wsBaseUrl = wsBaseUrl.replace(/^http/, 'ws');
  } else if (wsBaseUrl.startsWith('https://')) {
    wsBaseUrl = wsBaseUrl.replace(/^https/, 'wss');
  }
  
  // 如果 axiosClient.defaults.baseURL 是 /api 这样的相对路径, 
  // 我们需要一个绝对路径的基础。这里假设部署在同一域名。
  // 如果 baseURL 是 '/api', 并且 window.location.origin 是 'http://localhost:3000'
  // 那么 wsBaseUrl 会变成 'ws://localhost:3000' (移除了 /api)
  if (wsBaseUrl.startsWith('/')) { // e.g., /api
      const origin = window.location.origin.replace(/^http/, 'ws'); // ws://localhost:port
      // 移除 baseURL 中的 /api 部分, 然后和 origin 组合
      // 这里需要判断 baseURL 是否就是 /api，或者更复杂的路径
      // 假设 /api 是 baseURL 的末尾
      if (axiosClient.defaults.baseURL.endsWith('/api')) {
          wsBaseUrl = origin; // 直接使用 origin，因为 /ws/chat... 会被追加
      } else {
          // 对于更复杂的相对路径，可能需要更精细的处理
          // 为了简单起见，如果不是 /api 结尾，我们尝试直接用 origin + baseURL
          // 但这可能不总是正确，取决于 baseURL 的具体形式
          wsBaseUrl = origin + wsBaseUrl;
      }
  } else if (wsBaseUrl.endsWith('/api')) { // 如果是绝对路径 'http://domain/api'
      wsBaseUrl = wsBaseUrl.substring(0, wsBaseUrl.length - '/api'.length);
  }
  
  // 最终的 ws 地址应为 ws(s)://your_domain/ws/chat/<userid>/
  return `${wsBaseUrl}/ws/chat/${userId}/`; 
};

// 新增：提交或更新学生认证信息
const submitStudentAuth = (authData) => {
  return apiRequest('post', '/user/student-auth/', authData);
};

// 新增：统一图片上传
/**
 * @summary 统一图片上传
 * @method POST
 * @path /images/upload/
 * @param {FormData} imageData - 包含 file, upload_type, related_id (可选), is_primary (可选)
 */
const imagesUploadCreate = (imageData) => {
  // apiRequest 第五个参数 isFormData 设为 true
  return apiRequest('POST', '/images/upload/', imageData, null, true);
};

// 导出所有 API 函数
export default {
  // User
  userLogin,
  userRefreshToken,
  userRegister,
  userModifyPassword,
  getUserProfile,
  updateUserProfile,
  getUserTradeComments,
  getUserBoughtRecords,
  getUserSoldRecords,

  // Product
  getProductList,
  createProduct,
  getProductDetail,
  updateProduct,
  deleteProduct,
  addProductComment,
  getProductComments,

  // Transaction
  createTransaction,
  getTransactionDetail,
  updateTransactionStatus,
  addTransactionComment,
  getChatRoomList,

  // Chat (HTTP part)
  getTransactionMessages,
  sendTransactionMessage,

  // Chat (WebSocket helper)
  getChatWebSocketUrl,

  // 新增：提交或更新学生认证信息
  submitStudentAuth,

  // 新增：统一图片上传
  imagesUploadCreate,
}; 