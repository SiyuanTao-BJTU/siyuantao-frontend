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
 * @param {string} contentType - 可选，手动指定 Content-Type 头部
 * @returns {Promise<any>} - API 响应数据
 */
const apiRequest = async (method, path, data = null, params = null, contentType = 'application/json') => {
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
    url: path, // Use path directly, assuming axiosClient has baseURL set correctly
    headers: {}, // Initialize headers, interceptor will add Content-Type if needed
  };

  // Set Content-Type based on parameters, prioritize explicit contentType
  if (contentType) {
    config.headers['Content-Type'] = contentType;
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
 * @path /api/v1/auth/login
 * @param {object} credentials - { username, password }
 */
const userLogin = (credentials) => {
  // 将 credentials 对象转换为 form-urlencoded 格式
  const formData = new URLSearchParams();
  for (const key in credentials) {
    formData.append(key, credentials[key]);
  }
  // 指定 Content-Type 为 application/x-www-form-urlencoded
  return apiRequest('POST', '/v1/auth/login', formData, null, 'application/x-www-form-urlencoded');
};

/**
 * @summary 刷新 Access Token
 * @method POST
 * @path /api/v1/auth/refresh (assuming /user/refresh/ maps to this in openapi)
 * @param {object} refreshToken - { refresh: "your_refresh_token" }
 */
const userRefreshToken = (refreshToken) => {
  // Assuming /user/refresh/ in previous version maps to /api/v1/auth/refresh
  return apiRequest('POST', '/v1/auth/refresh', refreshToken);
};

/**
 * @summary 用户注册
 * @method POST
 * @path /api/v1/auth/register
 * @param {object} userData - 包含用户名、密码、邮箱等注册信息
 *                          (参考 RegisterSerializer: { username, password, confirm_password, email?, first_name?, ...})
 */
const userRegister = (userData) => {
  return apiRequest('POST', '/v1/auth/register', userData);
};

/**
 * @summary 修改当前用户密码 (需要认证)
 * @method POST
 * @path /api/v1/users/me/password (assuming /user/password/ maps to this in openapi)
 * @param {object} passwordData - { origin_password, new_password }
 * @note openapi.json shows /api/v1/users/me/password PUT, takes {old_password, new_password}
 * This function is POST in comments, and takes {origin_password, new_password, confirm_new_password}
 * Adjusting path to PUT and data structure to match openapi.json
 */
const userModifyPassword = (passwordData) => {
  // Adjusting method to PUT and data structure to match openapi.json /api/v1/users/me/password
  // openapi expects { old_password, new_password }
  return apiRequest('PUT', '/v1/users/me/password', { old_password: passwordData.old_password, new_password: passwordData.new_password });
};

/**
 * @summary 获取用户信息 (需要认证)
 * @method GET
 * @path /api/v1/users/me
 * @param {string} [userId] - 可选，查询指定用户的ID（管理员接口）
 * @note 根据 openapi.json，/api/v1/users/me 是获取当前用户。
 * 如果需要根据ID获取用户，应使用 /api/v1/users/{user_id} (管理员接口)。
 * 调整函数以匹配 /api/v1/users/me 获取当前用户，如果需要根据ID获取用户，可以新增函数。
 */
const getUserProfile = () => {
  // Matches openapi.json /api/v1/users/me for getting current user
  return apiRequest('GET', '/v1/users/me');
};

/**
 * @summary 管理员根据用户 ID 获取用户个人资料
 * @method GET
 * @path /api/v1/users/{user_id}
 * @param {string} userId - 用户的UUID
 * @note openapi.json lists /api/v1/users/{user_id} for GET.
 */
const getUserProfileById = (userId) => {
  return apiRequest('GET', `/v1/users/${userId}`);
};

/**
 * @summary 修改当前用户个人信息 (需要认证)
 * @method PUT
 * @path /api/v1/users/me (assuming /user/profile/ maps to this in openapi)
 * @param {object} profileData - 要更新的用户信息 (参考 openapi UserProfileUpdateSchema)
 */
const updateUserProfile = (profileData) => {
  return apiRequest('PUT', '/v1/users/me', profileData);
};

/**
 * @summary 获取指定用户作为卖家的交易收到的评论 (需要认证)
 * @method GET
 * @path /api/v1/users/{user_id}/comments (assuming /user/comments/ maps to this in openapi)
 * @param {string} userId - 目标用户的ID (UUID)
 * @note openapi.json does not explicitly list this path under /api/v1/users/. It lists /api/v1/items/{item_id}/comments and /api/v1/trades/{trade_id}/comments. It's possible this path is incorrect or outdated based on openapi. If it's intended to get comments *about* a user as a seller, a different API path might be needed. Sticking to the comment's intent but adjusting path to /v1/users/{userId}/comments based on common patterns, though it's not in the provided openapi.
 */
const getUserTradeComments = (userId) => {
  // Path adjusted to include /v1/ and use userId in path. Note: This specific path is not in provided openapi.json.
  return apiRequest('GET', `/v1/users/${userId}/comments/`);
};

/**
 * @summary 获取当前用户的购买记录 (需要认证)
 * @method GET
 * @path /api/v1/users/me/bought (assuming /user/records/bought/ maps to this)
 */
const getUserBoughtRecords = () => {
  // Path adjusted to /v1/users/me/bought based on common patterns, not explicitly in provided openapi.
  return apiRequest('GET', '/v1/users/me/bought');
};

/**
 * @summary 获取当前用户的销售记录 (需要认证)
 * @method GET
 * @path /api/v1/users/me/sold (assuming /user/records/sold/ maps to this)
 */
const getUserSoldRecords = () => {
  // Path adjusted to /v1/users/me/sold based on common patterns, not explicitly in provided openapi.
  return apiRequest('GET', '/v1/users/me/sold');
};

/**
 * @summary 获取所有用户列表 (管理员接口)
 * @method GET
 * @path /api/v1/users/
 */
const getAllUsersApi = () => {
  return apiRequest('GET', '/v1/users/');
};

/**
 * @summary 管理员根据用户 ID 更改用户状态（禁用/启用）
 * @method PUT
 * @path /api/v1/users/{user_id}/status
 * @param {string} userId - 用户的UUID
 * @param {object} statusData - { status: "Active" | "Disabled" }
 */
const updateUserStatus = (userId, statusData) => {
  return apiRequest('PUT', `/v1/users/${userId}/status`, statusData);
};

/**
 * @summary 管理员根据用户 ID 调整用户信用分
 * @method PUT
 * @path /api/v1/users/{user_id}/credit
 * @param {string} userId - 用户的UUID
 * @param {object} creditAdjustmentData - { credit_adjustment: number, reason: string }
 */
const adjustUserCredit = (userId, creditAdjustmentData) => {
  return apiRequest('PUT', `/v1/users/${userId}/credit`, creditAdjustmentData);
};

/**
 * @summary 管理员根据用户 ID 删除用户
 * @method DELETE
 * @path /api/v1/users/{user_id}
 * @param {string} userId - 用户的UUID
 */
const deleteUser = (userId) => {
  return apiRequest('DELETE', `/v1/users/${userId}`);
};

/**
 * @summary 管理员根据用户 ID 切换用户管理员状态
 * @method PUT
 * @path /api/v1/users/{user_id}/toggle_staff
 * @param {string} userId - 用户的UUID
 * @returns {Promise<any>} - API 响应数据 (此接口通常返回 204 No Content)
 */
const toggleUserStaffStatus = (userId) => {
  // This endpoint does not require a request body
  return apiRequest('PUT', `/v1/users/${userId}/toggle_staff`);
};

// ========================================================================
// Product Management (来自 itemTrade/urls/item.py)
// ========================================================================

/**
 * @summary 获取商品列表
 * @method GET
 * @path /api/v1/products/
 * @param {object} [filters] - 可选的过滤参数 { category_id, search, owner_id, status }
 * @note openapi.json lists /api/v1/products/. Adjusting path.
 */
const getProductList = (filters) => {
  // Path adjusted to /v1/products/ based on openapi.json
  return apiRequest('GET', '/v1/products', null, filters);
};

/**
 * @summary 创建新商品 (需要认证)
 * @method POST
 * @path /api/v1/products/
 * @param {FormData|object} productData - 商品数据 (参考 ProductSerializer)
 * @note 若包含图片上传，请确保 isFormData = true，并正确构造 FormData
 */
const createProduct = (productData, isFormData = false) => {
  // Path adjusted to /v1/products/ based on error message indicating this path
  return apiRequest('POST', '/v1/products', productData, null, isFormData);
};

/**
 * @summary 获取单个商品详情
 * @method GET
 * @path /api/v1/products/{product_id}
 * @param {string} productId - 商品的UUID
 */
const getProductDetail = (productId) => {
  // Path adjusted to /v1/products/{productId}
  return apiRequest('GET', `/v1/products/${productId}`);
};

/**
 * @summary 修改商品信息 (需要认证，所有者或管理员)
 * @method PUT
 * @path /api/v1/products/{product_id}
 * @param {string} productId - 商品的UUID
 * @param {FormData|object} productData - 更新的商品数据 (参考 ProductSerializer, 支持部分更新)
 * @note 若包含图片上传/修改，请确保 isFormData = true，并正确构造 FormData
 */
const updateProduct = (productId, productData, isFormData = false) => {
  // Path adjusted to /v1/products/{productId}
  return apiRequest('PUT', `/v1/products/${productId}`, productData, null, isFormData);
};

/**
 * @summary 删除商品 (需要认证，所有者或管理员)
 * @method DELETE
 * @path /api/v1/products/{product_id}
 * @param {string} productId - 商品的UUID
 */
const deleteProduct = (productId) => {
  // Path adjusted to /v1/products/{productId}/
  return apiRequest('DELETE', `/v1/products/${productId}/`);
};

/**
 * @summary 为商品添加评论 (需要认证)
 * @method POST
 * @path /api/v1/products/{product_id}/comments
 * @param {string} productId - 商品的UUID
 * @param {object} commentData - { content, rating }
 */
const addProductComment = (productId, commentData) => {
  // Path adjusted to /v1/products/{productId}/comments/
  return apiRequest('POST', `/v1/products/${productId}/comments/`, commentData);
};

/**
 * @summary 获取某商品的所有评论
 * @method GET
 * @path /api/v1/products/{product_id}/comments
 * @param {string} productId - 商品的UUID
 */
const getProductComments = (productId) => {
  // Path adjusted to /v1/products/{productId}/comments/
  return apiRequest('GET', `/v1/products/${productId}/comments/`);
};

// ========================================================================
// Transaction Management (来自 itemTrade/urls/trade.py)
// ========================================================================

/**
 * @summary 创建新交易 (需要认证)
 * @method POST
 * @path /api/v1/trades/ (assuming /trade/transactions/ maps to this)
 * @param {object} transactionData - { product (pk), quantity, location?, meet_time? }
 * @note openapi.json lists /api/v1/trades/. Adjusting path.
 */
const createTransaction = (transactionData) => {
  // Path adjusted to /v1/trades/ based on openapi.json /api/v1/trades/
  return apiRequest('POST', '/v1/trades/', transactionData);
};

/**
 * @summary 获取单个交易详情 (需要认证，买家或卖家)
 * @method GET
 * @path /api/v1/trades/{trade_id} (assuming /trade/transactions/{transactionId}/ maps to this)
 * @param {string} transactionId - 交易的UUID
 * @note openapi.json lists /api/v1/trades/{trade_id}. Adjusting path.
 */
const getTransactionDetail = (transactionId) => {
  // Path adjusted to /v1/trades/{transactionId} based on openapi.json /api/v1/trades/{trade_id}
  return apiRequest('GET', `/v1/trades/${transactionId}`);
};

/**
 * @summary 更新交易状态 (需要认证，买家或卖家)
 * @method PUT
 * @path /api/v1/trades/{trade_id} (assuming /trade/transactions/{transactionId}/ maps to this)
 * @param {string} transactionId - 交易的UUID
 * @param {object} statusData - { status: "new_status_value" } (参考 TransactionUpdateSerializer 和模型状态)
 * @note openapi.json lists /api/v1/trades/{trade_id} for PUT. Adjusting path.
 */
const updateTransactionStatus = (transactionId, statusData) => {
  // Path adjusted to /v1/trades/{transactionId} based on openapi.json /api/v1/trades/{trade_id}
  return apiRequest('PUT', `/v1/trades/${transactionId}`, statusData);
};

/**
 * @summary 为交易添加评论 (需要认证，买家或卖家)
 * @method POST
 * @path /api/v1/trades/{trade_id}/comments (assuming /trade/transactions/{transactionId}/comments/ maps to this)
 * @param {string} transactionId - 交易的UUID
 * @param {object} commentData - { content, rating }
 * @note openapi.json lists /api/v1/trades/{trade_id}/comments. Adjusting path.
 */
const addTransactionComment = (transactionId, commentData) => {
  // Path adjusted to /v1/trades/{transactionId}/comments based on openapi.json /api/v1/trades/{trade_id}/comments
  return apiRequest('POST', `/v1/trades/${transactionId}/comments`, commentData);
};

/**
 * @summary 获取与当前用户相关的聊天室列表 (基于交易) (需要认证)
 * @method GET
 * @path /api/v1/trades/chatrooms (assuming /trade/chatrooms/ maps to this)
 * @note openapi.json does not explicitly list /api/v1/trades/chatrooms. Sticking to previous path structure but adding /v1.
 */
const getChatRoomList = () => {
  // Path adjusted to /v1/trades/chatrooms based on previous structure, not explicitly in provided openapi.
  return apiRequest('GET', '/v1/trades/chatrooms');
};

// ========================================================================
// Chat Messages (来自 itemTrade/urls/chat.py)
// HTTP API for messages. WebSocket handling is separate.
// ========================================================================

/**
 * @summary 获取某交易（聊天室）的聊天记录 (需要认证，买家或卖家)
 * @method GET
 * @path /api/v1/chats/{trade_id}/messages (assuming /chat/transactions/{transactionId}/messages/ maps to this)
 * @param {string} transactionId - 交易的UUID (即聊天室ID)
 * @note openapi.json does not explicitly list this path under /api/v1/chats/. It lists paths under /api/v1/trades/. Assuming chat messages are under trades.
 */
const getTransactionMessages = (transactionId) => {
  // Path adjusted based on common patterns /v1/trades/{transactionId}/messages. Note: This is an assumption based on trade/chat relation, not explicitly in provided openapi.json.
  return apiRequest('GET', `/v1/trades/${transactionId}/messages`);
};

/**
 * @summary 在某交易（聊天室）中发送消息 (需要认证，买家或卖家)
 * @method POST
 * @path /api/v1/chats/{trade_id}/messages (assuming /chat/transactions/{transactionId}/messages/ maps to this)
 * @param {string} transactionId - 交易的UUID (即聊天室ID)
 * @param {object} messageData - { content }
 * @note Similar assumption as getTransactionMessages regarding path under trades.
 */
const sendTransactionMessage = (transactionId, messageData) => {
  // Path adjusted based on common patterns /v1/trades/{transactionId}/messages. Note: This is an assumption based on trade/chat relation, not explicitly in provided openapi.json.
  return apiRequest('post', `/v1/trades/${transactionId}/messages`, messageData);
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
  
  // If baseURL is an absolute URL like 'http://domain:port/api',
  // we need to strip the /api part and change http(s) to ws(s).
  // If it's a relative path like '/api', we use window.location.origin.
  
  if (wsBaseUrl.startsWith('http')) {
      // Absolute URL
      if (wsBaseUrl.endsWith('/api')) {
          wsBaseUrl = wsBaseUrl.substring(0, wsBaseUrl.length - '/api'.length);
      }
      wsBaseUrl = wsBaseUrl.replace(/^http/, 'ws');
  } else if (wsBaseUrl.startsWith('/')) {
      // Relative path, assume same origin
      const origin = window.location.origin.replace(/^http/, 'ws');
       if (wsBaseUrl.endsWith('/api')) {
          // If the relative path is just /api, use origin directly
           wsBaseUrl = origin;
       } else {
           // For other relative paths, combine origin and the relative path
           wsBaseUrl = origin + wsBaseUrl;
       }
  }
  
  // The final ws address should be ws(s)://your_domain/ws/chat/<userid>/
  // Note: The path /ws/chat is hardcoded here based on backend.config.js comment.
  return `${wsBaseUrl}/ws/chat/${userId}/`; 
};

// 新增：提交或更新学生认证信息
/**
 * @summary 提交或更新学生认证信息
 * @method POST
 * @path /api/v1/user/student-auth (assuming /user/student-auth/ maps to this)
 * @param {object} authData - 包含学生认证信息
 * @note openapi.json does not explicitly list this path. Sticking to previous path structure but adding /v1.
 */
const submitStudentAuth = (authData) => {
  // Path adjusted to /v1/user/student-auth/ based on previous structure, not explicitly in provided openapi.
  return apiRequest('post', '/v1/user/student-auth/', authData);
};

// 新增：统一图片上传
/**
 * @summary 统一图片上传
 * @method POST
 * @path /api/v1/images/upload (assuming /images/upload/ maps to this)
 * @param {FormData} imageData - 包含 file, upload_type, related_id (可选), is_primary (可选)
 * @note openapi.json does not explicitly list this path. Sticking to previous path structure but adding /v1.
 */
const imagesUploadCreate = (imageData) => {
  // apiRequest 第五个参数 isFormData 设为 true
  // Path adjusted to /v1/images/upload/ based on previous structure, not explicitly in provided openapi.
  return apiRequest('POST', '/v1/images/upload/', imageData, null, true);
};

// 新增：管理员后台仪表盘统计 (占位符，待后端接口实现)
const getNewUsersToday = () => Promise.resolve(10); // 模拟数据
const getProductsPendingReviewCount = () => Promise.resolve(5); // 模拟数据
const getPendingReturnsCount = () => Promise.resolve(3); // 模拟数据
const getLatestReportsCount = () => Promise.resolve(2); // 模拟数据

// 新增：上传用户头像
/**
 * @summary 上传用户头像
 * @method PUT
 * @path /api/v1/users/me/avatar
 * @param {FormData} formData - 包含头像文件 (file) 的 FormData 对象
 * @note openapi.json lists /api/v1/users/me/avatar PUT.
 */
const uploadUserAvatar = (formData) => {
  // 这里的 formData 已经是 ProfileEdit.vue 中创建并附加了文件的 FormData 对象
  return apiRequest('PUT', '/v1/users/me/avatar', formData, null, 'multipart/form-data');
};

const requestPasswordReset = (requestData) => apiRequest('POST', '/v1/auth/request-otp-password-reset', requestData);

const verifyPasswordResetToken = (requestData) => apiRequest('POST', '/v1/auth/verify-otp-and-reset-password', requestData);

const requestOtpForPasswordReset = (requestData) => apiRequest('POST', '/v1/auth/request-otp-password-reset', requestData);

const verifyOtpAndResetPassword = (requestData) => apiRequest('POST', '/v1/auth/verify-otp-and-reset-password', requestData);

const requestStudentVerificationOtp = (requestData) => apiRequest('POST', '/v1/auth/request-verification-email', requestData);

const verifyStudentVerificationOtp = (requestData) => apiRequest('POST', '/v1/auth/verify-email-otp', requestData);

const requestLoginOtp = (requestData) => apiRequest('POST', '/v1/auth/request-login-otp', requestData);

const verifyLoginOtp = (requestData) => apiRequest('POST', '/v1/auth/verify-login-otp', requestData);

/**
 * @summary 通用图片上传接口
 * @method POST
 * @path /api/v1/upload/image
 * @param {FormData} formData - 包含图片的 FormData 对象，字段名为 'file'
 */
const uploadImage = (formData) => {
  return apiRequest('POST', '/v1/upload/image', formData, null, 'multipart/form-data');
};

// 导出所有 API 函数
export default {
  // User
  userLogin,
  userRefreshToken,
  userRegister,
  userModifyPassword,
  getUserProfile,
  getUserProfileById,
  updateUserProfile,
  getUserTradeComments,
  getUserBoughtRecords,
  getUserSoldRecords,
  getAllUsersApi,
  updateUserStatus,
  adjustUserCredit,
  deleteUser,
  toggleUserStaffStatus,
  uploadUserAvatar,
  requestPasswordReset, // Keep this for compatibility/old forms if they exist, but its body now calls OTP
  verifyPasswordResetToken, // Keep this for compatibility/old forms, its body now calls OTP
  requestOtpForPasswordReset, // Explicit new function
  verifyOtpAndResetPassword, // Explicit new function
  requestStudentVerificationOtp,
  verifyStudentVerificationOtp,
  requestLoginOtp, // New function for passwordless login OTP
  verifyLoginOtp, // New function for passwordless login

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

  // 新增：管理员后台仪表盘统计 (占位符，待后端接口实现)
  getNewUsersToday,
  getProductsPendingReviewCount,
  getPendingReturnsCount,
  getLatestReportsCount,

  // New Image Upload
  uploadImage,
}; 