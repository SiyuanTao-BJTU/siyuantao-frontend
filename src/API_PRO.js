import axiosClient from './axios_client/index.js'; // 导入 axiosClient

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

  // ---- Vue 项目中使用 axios ----
  try { // UNCOMMENTED
    const response = await axiosClient(config); // MODIFIED: use axiosClient
    return response.data; // 通常返回 response.data
  } catch (error) { // UNCOMMENTED
    throw error; // 重新抛出错误，让调用组件或 axiosClient 拦截器处理
  }
};

// ========================================================================
// Auth Module (Tag: Auth)
// ========================================================================

const userRegister = (userData) => {
  return apiRequest('POST', '/api/v1/auth/register', userData);
};

const userLogin = (credentials) => {
  const formData = new URLSearchParams();
  for (const key in credentials) {
    formData.append(key, credentials[key]);
  }
  return apiRequest('POST', '/api/v1/auth/login', formData, null, 'application/x-www-form-urlencoded');
};

const requestStudentVerificationOtp = (requestData) => { // Corresponds to request_verification_email_api_api_v1_auth_request_verification_email_post
  return apiRequest('POST', '/api/v1/auth/request-verification-email', requestData);
};

const verifyStudentVerificationOtp = (requestData) => { // Corresponds to verify_email_otp_api_api_v1_auth_verify_email_otp_post
  return apiRequest('POST', '/api/v1/auth/verify-email-otp', requestData);
};

// Based on openapi /api/v1/auth/request-password-reset (assuming this one is the preferred OTP one)
const requestOtpForPasswordReset = (requestData) => { // Corresponds to request_otp_password_reset_api_api_v1_auth_request_otp_password_reset_post
  return apiRequest('POST', '/api/v1/auth/request-otp-password-reset', requestData);
};

const verifyOtpAndResetPassword = (requestData) => { // Corresponds to verify_otp_and_reset_password_api_api_v1_auth_verify_otp_and_reset_password_post
  return apiRequest('POST', '/api/v1/auth/verify-otp-and-reset-password', requestData);
};

const requestLoginOtp = (requestData) => { // Corresponds to request_login_otp_api_api_v1_auth_request_login_otp_post
  return apiRequest('POST', '/api/v1/auth/request-login-otp', requestData);
};

const verifyLoginOtp = (requestData) => { // Corresponds to verify_login_otp_api_api_v1_auth_verify_login_otp_post
  return apiRequest('POST', '/api/v1/auth/verify-login-otp', requestData);
};

// Note: openapi.json does not explicitly list a refresh token endpoint under /auth.
// OAuth2 typically handles token refresh via the tokenUrl (/api/v1/auth/login) with grant_type=refresh_token
// Or has a dedicated endpoint. This is a placeholder if a dedicated one exists.
const userRefreshToken = (refreshTokenData) => { // refreshTokenData should be { refresh_token: "your_actual_refresh_token" }
  return apiRequest('POST', '/api/v1/auth/refresh-token', refreshTokenData); // Hypothetical path, adjust if needed
};


// ========================================================================
// Users Module (Tag: Users)
// ========================================================================

const getUserProfile = () => { // read_users_me_api_v1_users_me_get
  return apiRequest('GET', '/api/v1/users/me');
};

const updateUserProfile = (profileData) => { // update_current_user_profile_api_v1_users_me_put
  return apiRequest('PUT', '/api/v1/users/me', profileData);
};

const userModifyPassword = (passwordData) => { // update_current_user_password_api_v1_users_me_password_put
                                            // Expects { old_password, new_password }
  return apiRequest('PUT', '/api/v1/users/me/password', passwordData);
};

const uploadUserAvatar = (formData) => { // upload_my_avatar_api_v1_users_me_avatar_put
  return apiRequest('PUT', '/api/v1/users/me/avatar', formData, null, 'multipart/form-data');
};

const getUserProfileById = (userId) => { // get_user_profile_by_id_api_v1_users__user_id__get
  return apiRequest('GET', `/api/v1/users/${userId}`);
};

const updateUserProfileById = (userId, profileData) => { // update_user_profile_by_id_api_v1_users__user_id__put
    return apiRequest('PUT', `/api/v1/users/${userId}`, profileData);
};

const deleteUser = (userId) => { // delete_user_by_id_api_v1_users__user_id__delete
  return apiRequest('DELETE', `/api/v1/users/${userId}`);
};

const getAllUsersApi = () => { // get_all_users_api_api_v1_users__get
  return apiRequest('GET', '/api/v1/users/');
};

const updateUserStatus = (userId, statusData) => { // change_user_status_by_id_api_v1_users__user_id__status_put
                                                 // Expects { status: "Active" | "Disabled" }
  return apiRequest('PUT', `/api/v1/users/${userId}/status`, statusData);
};

const toggleUserStaffStatus = (userId) => { // toggle_user_staff_status_api_v1_users__user_id__toggle_staff_put
  return apiRequest('PUT', `/api/v1/users/${userId}/toggle_staff`);
};

const adjustUserCredit = (userId, creditAdjustmentData) => { // adjust_user_credit_by_id_api_v1_users__user_id__credit_put
                                                            // Expects { credit_adjustment: number, reason: string }
  return apiRequest('PUT', `/api/v1/users/${userId}/credit`, creditAdjustmentData);
};

// ========================================================================
// Products Module (Tag: Products)
// ========================================================================

const getProductList = (filters) => { // get_product_list_api_v1_products__get
  return apiRequest('GET', '/api/v1/products/', null, filters);
};

const createProduct = (productData) => { // create_product_api_v1_products_post
  // Assuming productData is JSON by default. If it can be FormData,
  // the caller should pass the correct contentType or a flag.
  // For simplicity, here we assume JSON unless contentType is overridden.
  // The previous 'isFormData' flag can be handled by passing contentType directly.
  return apiRequest('POST', '/api/v1/products', productData);
};

const getProductDetail = (productId) => { // get_product_detail_api_v1_products__product_id__get
  return apiRequest('GET', `/api/v1/products/${productId}`);
};

const updateProduct = (productId, productData) => { // update_product_api_v1_products__product_id__put
  return apiRequest('PUT', `/api/v1/products/${productId}`, productData);
};

const deleteProduct = (productId) => { // delete_product_api_v1_products__product_id__delete
  return apiRequest('DELETE', `/api/v1/products/${productId}`);
};

const getUserFavorites = () => { // get_user_favorites_api_v1_products_favorites_get
  return apiRequest('GET', '/api/v1/products/favorites');
};

const addFavorite = (productId) => { // add_favorite_api_v1_products__product_id__favorite_post
  return apiRequest('POST', `/api/v1/products/${productId}/favorite`);
};

const removeFavorite = (productId) => { // remove_favorite_api_v1_products__product_id__favorite_delete
  return apiRequest('DELETE', `/api/v1/products/${productId}/favorite`);
};

const batchActivateProducts = (requestData) => { // batch_activate_products_api_v1_products_batch_activate_post
                                                // Expects { product_ids: [...] }
  return apiRequest('POST', '/api/v1/products/batch/activate', requestData);
};

const batchRejectProducts = (requestData) => { // batch_reject_products_api_v1_products_batch_reject_post
                                              // Expects { product_ids: [...], reason?: "..." }
  return apiRequest('POST', '/api/v1/products/batch/reject', requestData);
};

const activateProduct = (productId) => { // activate_product_api_v1_products__product_id__status_activate_put
  return apiRequest('PUT', `/api/v1/products/${productId}/status/activate`);
};

const rejectProduct = (productId, reasonData) => { // reject_product_api_v1_products__product_id__status_reject_put
                                                  // Expects { reason: "..." }
  return apiRequest('PUT', `/api/v1/products/${productId}/status/reject`, reasonData);
};

const withdrawProduct = (productId) => { // withdraw_product_api_v1_products__product_id__status_withdraw_put
  return apiRequest('PUT', `/api/v1/products/${productId}/status/withdraw`);
};

// Deprecated/Uncertain based on openapi.json:
// const addProductComment = (productId, commentData) => {
//   return apiRequest('POST', `/api/v1/products/${productId}/comments`, commentData); // Path in openapi is under /evaluations
// };
// const getProductComments = (productId) => {
//   return apiRequest('GET', `/api/v1/products/${productId}/comments`); // Path in openapi is under /evaluations
// };


// ========================================================================
// Orders Module (Tag: Orders)
// ========================================================================

const createOrder = (orderData) => { // create_new_order_api_v1_orders__post
  return apiRequest('POST', '/api/v1/orders/', orderData);
};

const getMyOrders = (params) => { // get_my_orders_api_v1_orders_mine_get
                                  // params: { status?, page_number?, page_size? }
  return apiRequest('GET', '/api/v1/orders/mine', null, params);
};

const getOrderById = (orderId) => { // get_order_by_id_route_api_v1_orders__order_id__get
  return apiRequest('GET', `/api/v1/orders/${orderId}`);
};

const updateOrderStatus = (orderId, statusData) => { // update_order_status_route_api_v1_orders__order_id__status_put
                                                    // Expects { status: "new_status", cancel_reason?: "..." }
  return apiRequest('PUT', `/api/v1/orders/${orderId}/status`, statusData);
};

const deleteOrder = (orderId) => { // delete_order_route_api_v1_orders__order_id__delete
  return apiRequest('DELETE', `/api/v1/orders/${orderId}`);
};

const cancelOrder = (orderId, reasonData) => { // cancel_order_route_api_v1_orders__order_id__cancel_post
                                                // Expects { reason: "..." } or {} if reason is optional
  return apiRequest('POST', `/api/v1/orders/${orderId}/cancel`, reasonData);
};

const confirmOrder = (orderId) => { // confirm_order_route_api_v1_orders__order_id__confirm_put
  return apiRequest('PUT', `/api/v1/orders/${orderId}/confirm`);
};

const completeOrder = (orderId) => { // complete_order_route_api_v1_orders__order_id__complete_put
  return apiRequest('PUT', `/api/v1/orders/${orderId}/complete`);
};

const rejectOrder = (orderId, rejectionData) => { // reject_order_route_api_v1_orders__order_id__reject_put
                                                  // Expects { rejection_reason_data: {} } or specific reason fields
  return apiRequest('PUT', `/api/v1/orders/${orderId}/reject`, rejectionData);
};

const getAdminOrders = (params) => { // get_all_orders_for_admin_route_api_v1_admin_orders__get
  return apiRequest('GET', '/api/v1/orders/admin', null, params);
};

// const deleteAdminOrder = (orderId) => { // delete_order_route_api_v1_admin_orders__order_id__delete
//   return apiRequest('DELETE', `/api/v1/admin/orders/${orderId}`);
// };


// ========================================================================
// Evaluations Module (Tag: Evaluations)
// ========================================================================

const createEvaluation = (evaluationData) => { // create_new_evaluation_api_v1_evaluations__post
  return apiRequest('POST', '/api/v1/evaluations/', evaluationData);
};

const getEvaluationById = (evaluationId) => { // get_evaluation_by_id_route_api_v1_evaluations__evaluation_id__get
  return apiRequest('GET', `/api/v1/evaluations/${evaluationId}`);
};

const getEvaluationsByProductId = (productId) => { // get_evaluations_by_product_id_route_api_v1_evaluations_product__product_id__get
  return apiRequest('GET', `/api/v1/evaluations/product/${productId}`);
};

const getEvaluationsByBuyerId = (buyerId) => { // get_evaluations_by_buyer_id_route_api_v1_evaluations_buyer__buyer_id__get
  return apiRequest('GET', `/api/v1/evaluations/buyer/${buyerId}`);
};

const getAdminEvaluations = (params) => { // 新增：获取所有评价 (管理员视图)
  return apiRequest('GET', '/api/v1/evaluations/admin', null, params);
};

const deleteAdminEvaluation = (evaluationId) => { // 新增：管理员删除评价
  return apiRequest('DELETE', `/api/v1/evaluations/admin/${evaluationId}`);
};


// ========================================================================
// Upload Module (Tag: Upload - based on path /api/v1/upload/image)
// ========================================================================

const uploadImage = (formData) => { // upload_image_api_v1_upload_image_post
  return apiRequest('POST', '/api/v1/upload/image', formData, null, 'multipart/form-data');
};


const getChatWebSocketUrl = (userId) => {
  let wsBaseUrl = axiosClient.defaults.baseURL;
  if (wsBaseUrl.startsWith('http')) {
      if (wsBaseUrl.endsWith('/api')) {
          wsBaseUrl = wsBaseUrl.substring(0, wsBaseUrl.length - '/api'.length);
      }
      wsBaseUrl = wsBaseUrl.replace(/^http/, 'ws');
  } else if (wsBaseUrl.startsWith('/')) {
      const origin = window.location.origin.replace(/^http/, 'ws');
       if (wsBaseUrl.endsWith('/api') && wsBaseUrl.length === '/api'.length) { // check if it's exactly '/api'
           wsBaseUrl = origin;
       } else {
           wsBaseUrl = origin + (wsBaseUrl.startsWith('/') ? wsBaseUrl : '/' + wsBaseUrl);
       }
  }
  // Ensure the final path is for WebSocket connection, typically /ws/...
  // This path should match your backend WebSocket ASGI routing.
  return `${wsBaseUrl}/ws/chat/${userId}/`; 
};

// Admin Dashboard Mock APIs (No corresponding entries in openapi.json)
const getNewUsersToday = () => Promise.resolve(10);
const getProductsPendingReviewCount = () => Promise.resolve(5);
const getPendingReturnsCount = () => Promise.resolve(3);
const getLatestReportsCount = () => Promise.resolve(2);

// ========================================================================
// Exports
// ========================================================================
export default {
  // Auth
  userRegister,
  userLogin,
  requestStudentVerificationOtp,
  verifyStudentVerificationOtp,
  requestOtpForPasswordReset,
  verifyOtpAndResetPassword,
  requestLoginOtp,
  verifyLoginOtp,
  userRefreshToken, 

  // Users
  getUserProfile,
  updateUserProfile,
  userModifyPassword,
  uploadUserAvatar,
  getUserProfileById,
  updateUserProfileById, 
  deleteUser,
  getAllUsersApi,
  updateUserStatus,
  toggleUserStaffStatus,
  adjustUserCredit,

  // Products
  getProductList,
  createProduct,
  getProductDetail,
  updateProduct,
  deleteProduct,
  getUserFavorites,    
  addFavorite,          
  removeFavorite,       
  batchActivateProducts,
  batchRejectProducts,  
  activateProduct,      
  rejectProduct,        
  withdrawProduct,      

  // Orders
  createOrder,                  
  getMyOrders,                  
  getOrderById,                 
  updateOrderStatus,            
  deleteOrder,                  
  cancelOrder,                  
  confirmOrder,                 
  completeOrder,                
  rejectOrder,                  
  getAdminOrders,


  // Evaluations
  createEvaluation,             
  getEvaluationById,            
  getEvaluationsByProductId,    
  getEvaluationsByBuyerId,      
  getAdminEvaluations,
  deleteAdminEvaluation, 

  // Upload
  uploadImage, 

  // Chat (WebSocket helper)
  getChatWebSocketUrl,

  // Admin Dashboard Mock APIs（TODO: Remove if not needed）
  getNewUsersToday,
  getProductsPendingReviewCount,
  getPendingReturnsCount,
  getLatestReportsCount,
}; 