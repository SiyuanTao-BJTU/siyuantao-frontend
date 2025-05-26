import axios from 'axios';
import { ElMessage } from 'element-plus';
import router from '@/router'
import i18n from "@/vue_i18n/index.js";
import BackendConfig from "../../backend.config";

// 创建 Axios 实例
const axiosClient = axios.create({
  baseURL: process.env.NODE_ENV ===' desktop' ? BackendConfig.RESTFUL_API_URL : '/api', // API 基础路径
  timeout: 10000, // 设置请求超时时间
  withCredentials: true, // 开启跨域凭证
});

// 请求拦截器
axiosClient.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      const authExcludedRoutes = ['/login', '/register', '/verify-email']; // 不需要 token 的路径，添加邮箱验证页

      // 如果请求路径不在 authExcludedRoutes 中，并且存在 token，则添加 Authorization 头
      if (token && !authExcludedRoutes.some(route => config.url.includes(route))) { // 使用 includes 进行更灵活的匹配
         const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
         config.headers['Authorization'] = authHeader;
      }

      return config; // 返回配置好的请求对象
    },
    (error) => {
      return Promise.reject(error); // 处理拦截器中的错误
    }
);


// 响应拦截器
axiosClient.interceptors.response.use(
    (response) => response, // 正常响应
    (error) => {
      if (error.response) {
        const { status } = error.response;
        if (status === 401) {
          // 401 表示未授权，可能是 token 无效或过期
          console.error("Axios Interceptor: 401 Unauthorized", error.response);
          // 避免在已经位于登录页时重复跳转和提示
          if (router.currentRoute.value.path !== '/login') {
              ElMessage.error(i18n.global.t('axios_client.token_expiration'));
              localStorage.removeItem('token');
              localStorage.removeItem('refresh')
              localStorage.removeItem('username'); // 清除可能的残留用户信息
              localStorage.removeItem('userId');
              // 可以考虑在此处关闭 WebSocket 连接 if needed
              router.push('/login'); // 跳转到登录页面
          }
        } else if (status === 502) {
             console.error("Axios Interceptor: 502 Bad Gateway", error.response);
             // 502 错误通常是后端问题，可以给出友好提示
             // ElMessage.error('服务器响应异常，请稍后再试'); // 避免频繁提示
        } else {
          console.error("Axios Interceptor: Request failed with status", status, error.response);
          if (error.response.data && error.response.data.detail) {
            let detail = error.response.data.detail;
            if (typeof detail === 'string') {
              if (detail.includes("User") && detail.includes("phone_number") && detail.includes("already exists")) {
                ElMessage.error(i18n.global.t('axios_client.phone_number_exists'));
              } else if (detail.includes("User") && detail.includes("username") && detail.includes("already exists")) {
                ElMessage.error(i18n.global.t('axios_client.username_exists'));
              } else {
                ElMessage.error(detail);
              }
            } else if (Array.isArray(detail) && detail[0] && detail[0].msg) {
              // 处理 FastAPI HTTPValidationError
              ElMessage.error(detail[0].msg);
            } else {
              ElMessage.error(i18n.global.t('axios_client.request_failed'));
            }
          } else {
            ElMessage.error(i18n.global.t('axios_client.request_failed'));
          }
        }
      } else {
        console.error("Axios Interceptor: Network exception or other error", error);
        // ElMessage.error(i18n.global.t('axios_client.network_exception'));
      }
      return Promise.reject(error);
    }
);

export default axiosClient;
