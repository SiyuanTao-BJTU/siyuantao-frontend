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
      const authExcludedRoutes = ['/login', '/register']; // 不需要 token 的路径

      // 如果请求路径不在 authExcludedRoutes 中，并且存在 token，则添加 Authorization 头
      if (!authExcludedRoutes.includes(config.url) && token) {
        config.headers['Authorization'] = `Bearer ${token}`;
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
          ElMessage.error(i18n.global.t('axios_client.token_expiration'));
          localStorage.removeItem('token');
          localStorage.removeItem('refresh')
          router.push('/login'); // 跳转到登录页面
        } else {
          ElMessage.error(i18n.global.t('axios_client.request_failed'));
        }
      } else {
        ElMessage.error(i18n.global.t('axios_client.network_exception'));
      }
      return Promise.reject(error);
    }
);

export default axiosClient;
