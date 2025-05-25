# 【思源淘】前端 API 接口调用规范

---

## 1. API 客户端封装

前端项目使用 Axios 进行 API 调用，并进行了统一封装，位于 `frontend/src/axios_client/index.js`。所有业务模块应通过这个封装后的客户端进行 API 请求。

主要封装内容包括：

*   **baseURL:** 统一设置后端 API 的基础 URL (从 `.env` 文件读取)。
*   **请求拦截器:**
    *   自动在请求头中附加 JWT Token (例如 `Authorization: Bearer <token>`)。
    *   可选：实现加载状态的显示。
*   **响应拦截器:**
    *   统一处理后端返回的 JSON 数据格式，提取实际业务数据。
    *   统一处理业务逻辑错误（例如：通过弹窗显示后端返回的错误消息）。
    *   处理认证失效（Token 过期）：自动刷新 Token 或重定向到登录页。
    *   处理 HTTP 状态码错误（例如：401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Internal Server Error）。
    *   可选：实现加载状态的隐藏。

## 2. API 接口定义

*   建议为每个主要业务模块创建独立的 API 服务文件，例如 `frontend/src/api/user.js`, `frontend/src/api/product.js` 等。
*   在服务文件中，使用封装好的 Axios 客户端定义该模块相关的 API 调用函数，例如：
    ```javascript
    import request from '../axios_client';
    
    export const login = (username, password) => {
      return request.post('/api/auth/login', { username, password });
    };
    
    export const fetchUserInfo = () => {
      return request.get('/api/user/info');
    };
    
    // 更多用户相关 API 函数...
    ```
*   API 函数应清晰命名，反映其功能。
*   API 函数应处理请求参数的封装和传递。

## 3. 调用规范

*   **统一入口:** 所有业务组件或 Vuex actions 应通过 `frontend/src/api/` 目录下定义的 API 服务函数进行数据请求，禁止直接在组件中调用 `axios` 实例。
*   **参数与返回值:** API 服务函数应负责将业务数据结构转换为后端期望的请求参数格式，并将后端返回的原始响应转换为前端易于使用的格式（例如，只返回实际数据部分，而不是完整的 Axios 响应对象）。
*   **错误处理:** 业务组件或 Vuex actions 在调用 API 服务函数时，应捕获可能的错误（通过 `try...catch` 或 `.catch()`），并根据业务需求进行处理（例如：显示错误消息、回滚状态）。通用错误处理（如认证失效、网络错误）已在响应拦截器中统一实现。
*   **Loading 状态:** 对于重要的 API 请求，应考虑在请求过程中显示加载状态，提升用户体验。这可以在组件内部管理，或者结合 Vuex 进行全局管理。
*   **Token 管理:** JWT Token 的存储、发送和刷新应由封装后的 Axios 客户端和相关的认证工具函数负责，业务代码不应直接操作 Token。

## 4. 后端 API 文档

*   请务必参考后端提供的 API 文档，了解每个接口的 URL、请求方法 (GET, POST, PUT, DELETE 等)、请求参数格式、响应数据格式以及可能的错误码。
*   前后端开发者在定义和修改 API 时应及时沟通，确保文档的准确性。

---

**相关文件:**

*   `frontend/src/axios_client/index.js`
*   `frontend/src/api/` (目录)
*   后端 API 文档 