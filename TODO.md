# 【思源淘】前端开发 TODO 列表

---

## Git 工作流集成约定

当你开始一个 TODO 任务时（例如：`[ ] TODO: 实现用户登录界面`），请创建一个对应的 Git 分支。分支名可以与任务关联，例如 `feature/A-user-login-ui` (其中 `A` 代表开发者，`user-login-ui` 描述任务)。这有助于将代码提交与任务关联，提高协作效率。

---

## 项目总览

本文档旨在提供【思源淘】前端项目的开发任务总览，按照功能模块和技术层面进行划分，并直接映射到后端团队的职责分工。请各位开发者负责自己对应模块的所有前端实现，并及时更新相关任务的状态。

## 团队分工 (与后端分工对应)

*   **开发者 A (对应后端用户模块):** 主要负责：用户模块 (登录注册、个人中心、学生认证)、**管理员后台前端**、基础架构部分。
*   **开发者 B (对应后端商品浏览与收藏模块):** 主要负责：商品浏览与搜索、商品详情、收藏夹功能、**商品发布与编辑、用户发布的商品管理（上架/下架/删除）**。
*   **开发者 C (对应后端商品操作与交易评价模块):** 主要负责：交易评价模块、**订单模块 (买家/卖家订单列表、订单详情、订单操作)**。
*   **开发者 D (对应后端实时通讯与退货模块):** 主要负责：站内信聊天模块、退货模块。
*   **开发者 E (对应后端通知、举报及通用基础设施模块):** 主要负责：系统通知、举报功能。

**注意:**
- 订单模块在后端 TODO 中未明确归属，根据交易流程，将其分配给负责商品操作和评价的开发者 C。
- 管理员后台前端由开发者 A 负责。
- 通用基础架构（API 客户端、路由、状态管理基础）建议主要由开发者 A 负责，其他开发者在新模块开发时贡献和完善。

## 约定

*   **状态标记:**
    *   `[√] DONE:`：任务已完成。
    *   `[ ] TODO:`：任务待完成。
    *   `[!] OPTIONAL:`：可选任务或未来优化项。
    *   `[#] PENDING:`: 任务暂停/等待依赖。
*   **UI 模式:** 主要功能实现为独立页面 (`views` 目录)，相关联的次要功能和操作实现为组件 (`components` 目录)，并通过对话框、抽屉或叠加层等形式在主页面上展示，支持点击外部关闭。
*   **更新频率:** 每日站会前更新个人负责的任务状态。
*   **Git Commit:** 提交代码时，在 commit message 中引用相关 TODO 项（例如：`feat(user): implement login form (TODO: #Frontend-User-1)`）。

---

## 1. 项目通用与基础架构 (主要由开发者 A 负责，其他开发者贡献)

**概述:** 搭建项目基础框架、配置通用工具、实现跨模块的通用功能和组件。

### 1.1 项目配置与工具

*   `[ ] TODO: (开发者 A)` 配置 `.env` 文件，区分开发、测试、生产环境。
*   `[ ] TODO: (开发者 A)` 配置 ESlint 和 Prettier，统一代码风格并进行代码检查。
*   `[ ] TODO: (开发者 A)` 配置 Git Hooks (husky + lint-staged)，在 commit 前自动格式化和检查代码。
*   `[ ] TODO: (开发者 A)` 配置 alias 别名，简化模块导入路径（如 `@/components`）。

### 1.2 API 服务封装

*   `[ ] TODO: (开发者 A)` Axios 客户端封装 (`frontend/src/axios_client/index.js`)：
    *   设置 `baseURL` (读取 `.env` 配置)。
    *   实现请求拦截器：
        *   添加 JWT Token 到请求头 (`Authorization: Bearer <token>`)。
        *   显示加载状态 (可选)。
    *   实现响应拦截器：
        *   统一处理后端返回的成功/失败响应格式。
        *   统一处理业务逻辑错误（如显示错误消息弹窗）。
        *   处理 Token 过期：自动刷新 Token 或重定向到登录页。
        *   隐藏加载状态 (可选)。
*   `[ ] TODO: (开发者 A)` 封装通用 API 调用方法 (`get`, `post`, `put`, `delete`)，处理请求参数和响应数据的类型。

### 1.3 WebSocket 客户端封装 (开发者 D)

*   `[ ] TODO: (开发者 D)` WebSocket 客户端封装 (`frontend/src/socket_client/index.js`)：
    *   连接管理（连接、断开、重连）。
    *   消息发送与接收。
    *   心跳机制。
    *   消息事件分发。

### 1.4 路由管理 (开发者 A)

*   `[ ] TODO: (开发者 A)` 配置 Vue Router 实例 (`frontend/src/router/index.js`)：
    *   定义基础路由（如首页、登录、404）。
    *   配置全局路由守卫 `beforeEach`：
        *   检查用户登录状态，未登录用户重定向到登录页（排除登录注册等白名单页面）。
        *   检查路由权限 (如果需要)。
    *   懒加载路由组件。

### 1.5 状态管理 (Vuex) (开发者 A 负责基础结构，各开发者负责自己模块 Store)

*   `[ ] TODO: (开发者 A)` 设计 Vuex Store 模块结构 (`frontend/src/store/modules/`)。
*   `[ ] TODO: (开发者 A)` 实现用户模块 Store (`frontend/src/store/modules/user.js`)：
    *   `state`: `isLoggedIn`, `userInfo`, `authLoading`, `notifications`, `unreadNotificationCount`。
    *   `mutations`: `SET_LOGIN_STATUS`, `SET_USER_INFO`, `SET_NOTIFICATIONS`, `MARK_NOTIFICATION_AS_READ`, `UPDATE_UNREAD_COUNT`。
    *   `actions`: `login`, `register`, `logout`, `fetchUserInfo`, `fetchNotifications`, `markNotificationAsRead`, `deleteNotification`。
*   `[ ] TODO:` 为其他功能模块创建和实现对应的 Vuex Store 模块 (见下方各模块 TODO)。

### 1.6 通用组件库 (开发者 A)

*   `[ ] TODO: (开发者 A)` 集成 Element Plus 或其他 UI 组件库。
*   `[ ] TODO: (开发者 A)` 封装常用的基础组件 (如果 Element Plus 不满足需求或需要定制)，例如：
    *   图标组件
    *   按钮组件
    *   对话框组件
    *   消息提示组件
    *   加载动画组件
    *   分页组件
    *   文件上传组件 (特别是图片上传)
*   `[ ] TODO: (开发者 A)` 统一表单验证规则和组件封装 (`frontend/src/utils/form_validation.js`)。

### 1.7 国际化 (可选)

*   `[ ] TODO:` 配置 `vue-i18n` 实例 (`frontend/src/locales/`) 初始化（如果需要多语言支持）。
*   `[ ] TODO:` 整理和维护语言文件。

---

## 2. 用户模块 (开发者 A)

**概述:** 用户认证、账户信息管理、学生认证、系统通知。

*   `[ ] TODO: (开发者 A)` 实现用户注册界面 (`frontend/src/user/views/auth/LoginView.vue`)：
    *   表单输入（用户名、密码、、手机号、专业）。
    *   前端表单验证。
    *   调用注册 API。
    *   处理注册成功/失败提示。
*   `[ ] TODO: (开发者 A)` 实现用户登录界面 (`frontend/src/user/views/auth/LoginView.vue`)：
    *   表单输入（用户名、密码）。
    *   前端表单验证。
    *   调用登录 API。
    *   保存 JWT Token 到本地存储。
    *   更新 Vuex 用户登录状态。
    *   登录成功后重定向到首页或其他目标页面。
    *   处理登录失败提示。
*   `[ ] TODO: (开发者 A)` 实现邮箱验证页面 (`frontend/src/user/views/auth/EmailVerificationView.vue`)：
    *   解析 URL 中的验证 Token。
    *   调用验证 API。
    *   显示验证结果（成功/失败）。
*   `[ ] TODO: (开发者 A)` 实现个人中心页面 (`frontend/src/user/views/profile/ProfileView.vue`)：
    *   显示用户基础信息 (从 Vuex `userInfo` 获取)。
    *   显示信用分、学生认证状态。
    *   提供编辑个人信息、修改密码、我的发布、我的订单、我的收藏、我的消息等的入口。
    *   调用 API 获取完整用户资料。
*   `[ ] TODO: (开发者 A)` 实现个人信息编辑组件 (`frontend/src/user/components/ProfileEdit.vue`)：
    *   作为对话框或抽屉在个人中心页面 (`ProfileView.vue`) 中展示。
*   `[ ] TODO: (开发者 A)` 实现修改密码组件 (`frontend/src/user/components/ChangePassword.vue`)：
    *   作为对话框在个人中心页面 (`ProfileView.vue`) 中展示。

---

## 3. 商品模块 (开发者 B)

**概述:** 商品的浏览、搜索、详情、发布、编辑、删除、上下架、收藏夹。

### 3.1 商品浏览、搜索与收藏 (开发者 B)

*   `[ ] TODO: (开发者 B)` 实现商品列表页面 (`frontend/src/product/views/HomeView.vue`)：
    *   布局：商品卡片展示、侧边/顶部筛选区域、搜索框。
    *   商品卡片组件 (`frontend/src/components/product/ProductCard.vue`)：显示商品图片、标题、价格、发布者、简要描述。
    *   调用 API 获取商品列表。
    *   实现搜索功能 (按关键词)。
    *   实现筛选功能 (按分类、价格区间、新旧程度等)。
    *   实现分页或无限滚动加载。
    *   实现加载状态和空状态展示。
*   `[ ] TODO: (开发者 B)` 实现商品详情组件 (`frontend/src/components/product/ProductDetail.vue`)：
    *   商品图片轮播组件。
    *   显示详细商品信息（标题、描述、价格、数量、分类、新旧程度）。
    *   显示发布者信息。
    *   收藏/取消收藏按钮，调用 API 并更新收藏状态。
    *   "立即购买"按钮（根据商品状态和用户身份判断是否可点击，点击跳转到订单确认或聊天）。
    *   "联系卖家"按钮（点击跳转到聊天页面）。
    *   显示加载状态和错误状态。
*   `[ ] TODO: (开发者 B)` 实现用户收藏夹页面 (`frontend/src/product/views/UserFavoritesView.vue`)：
    *   显示用户收藏的商品列表（可复用商品卡片组件）。
    *   提供取消收藏功能。
    *   调用 API 获取收藏列表。

### 3.2 商品发布与管理 (开发者 B)

*   `[ ] TODO: (开发者 B)` 实现商品发布/编辑页面 (`frontend/src/product/views/ProductPostView.vue`)：
    *   表单输入（标题、描述、分类、新旧程度、数量、价格）。
    *   图片上传组件：支持多图上传、预览、删除、数量限制、调用后端文件上传 API。
    *   前端表单验证。
    *   调用发布 API 或编辑 API。
    *   处理成功/失败提示和页面跳转。
*   `[ ] TODO: (开发者 B)` 实现用户发布的商品列表页面 (`frontend/src/product/views/MyProductView.vue`)：
    *   显示当前用户发布的商品列表。
    *   提供编辑、删除、上架/下架操作按钮。
    *   调用 API 获取列表。
    *   调用 API 执行操作。

---

## 4. 交易模块 (开发者 C - 订单, 开发者 C - 评价)

**概述:** 订单的创建、确认、完成、取消，订单列表和详情；交易评价的提交和展示。

### 4.1 订单管理 (开发者 C)

*   `[ ] TODO: (开发者 C)` 实现订单确认组件 (`frontend/src/order/components/OrderConfirmation.vue`)：
    *   作为对话框或单独页面（待定，取决于交互复杂度和信息量）展示。
*   `[ ] TODO: (开发者 C)` 实现买家订单列表页面 (`frontend/src/order/views/BuyerOrderListView.vue`)：
    *   显示作为买家的订单列表。
    *   支持按订单状态筛选 (待付款、待发货、待收货、已完成、已取消、退货中)。
    *   显示每个订单的关键信息（商品、数量、总价、卖家、状态）。
    *   提供查看详情、取消订单、确认收货、发起退货等操作入口。
    *   调用 API 获取列表。
*   `[ ] TODO: (开发者 C)` 实现卖家订单列表页面 (`frontend/src/order/views/SellerOrderListView.vue`)：
    *   显示作为卖家的订单列表。
    *   支持按订单状态筛选。
    *   显示每个订单的关键信息（商品、数量、总价、买家、状态）。
    *   提供查看详情、确认发货、联系买家、处理退货等操作入口。
    *   调用 API 获取列表。
*   `[ ] TODO: (开发者 C)` 实现订单详情组件 (`frontend/src/order/components/OrderDetail.vue`)：
    *   作为对话框或抽屉在买家/卖家订单列表页面中展示。
    *   显示订单所有详细信息。
    *   根据当前用户身份 (买家/卖家) 和订单状态，动态显示相关操作按钮 (如确认收货、取消订单、确认发货、联系对方、发起/处理退货、查看/提交评价)。
    *   调用 API 获取订单详情。
    *   集成评价表单组件 (如果订单状态允许评价)。

### 4.2 交易评价 (开发者 C)

*   `[ ] TODO: (开发者 C)` 评价表单组件 (`frontend/src/evaluation/components/EvaluationForm.vue`)：
    *   通常集成在订单详情或完成页面。
    *   星级评分输入。
    *   评价内容文本域。
    *   调用 API 提交评价。
    *   处理提交成功/失败。
*   `[ ] TODO: (开发者 C)` 评价列表展示组件 (`frontend/src/evaluation/components/EvaluationList.vue`)：
    *   通常集成在商品详情页或用户主页。
    *   显示评价内容、评分、评价者信息、时间。
    *   支持分页或无限滚动加载。
    *   调用 API 获取评价列表。

---

## 5. 消息与退货模块 (开发者 D)

**概述:** 站内信实时聊天、退货申请与处理。

### 5.1 站内信聊天 (开发者 D)

*   `[ ] TODO: (开发者 D)` 实现聊天会话列表页面 (`frontend/src/chat/views/ChatListView.vue`)：
    *   显示用户的所有聊天会话列表，按商品分组。
    *   显示每个会话的最新消息和未读数量。
    *   点击会话跳转到聊天室页面。
    *   调用 API 获取会话列表。
*   `[ ] TODO: (开发者 D)` 实现聊天室页面 (`frontend/src/chat/views/ChatRoomView.vue`)：
    *   显示指定会话的聊天消息记录。
    *   消息气泡展示 (区分发送者和接收者)。
    *   消息输入框和发送按钮。
    *   与 WebSocket 服务集成，实现实时消息发送和接收 (调用 WebSocket 客户端)。
    *   调用 API 获取历史消息。
    *   调用 API 发送消息。
    *   调用 API 标记消息已读。
    *   支持表情、图片等附加功能 (可选)。
    *   `[!] OPTIONAL:` 会话隐藏功能。

### 5.2 退货管理 (开发者 D)

*   `[ ] TODO: (开发者 D)` 发起退货请求组件 (`frontend/src/return/components/ReturnRequestForm.vue`)：
    *   作为对话框或抽屉在订单详情组件或页面中展示。
    *   选择退货原因。
*   `[ ] TODO: (开发者 D)` 实现买家退货申请列表页面 (`frontend/src/user/views/profile/BuyerReturnListView.vue`)：
    *   显示作为买家发起的退货请求列表。
    *   显示退货状态。
    *   提供查看详情、申请管理员介入等操作入口。
    *   调用 API 获取列表。
*   `[ ] TODO: (开发者 D)` 实现卖家待处理退货列表页面 (`frontend/src/user/views/profile/SellerReturnListView.vue`)：
    *   显示作为卖家收到的退货请求列表。
    *   显示退货状态。
    *   提供查看详情、处理退货 (同意/拒绝) 等操作入口。
    *   调用 API 获取列表。
*   `[ ] TODO: (开发者 D)` 退货请求详情组件 (`frontend/src/return/components/ReturnRequestDetail.vue`)：
    *   作为对话框或抽屉在买家/卖家退货列表页面中展示。
    *   显示退货请求的详细信息（订单信息、退货原因、申请时间、处理状态、处理意见）。
    *   根据当前用户身份和退货状态，动态显示相关操作按钮 (如卖家"同意/拒绝"、买家"申请介入"、管理员"介入处理")。
    *   调用 API 获取详情。

---

## 6. 通知与举报模块 (开发者 E)

**概述:** 系统通知、用户提交举报。

### 6.1 系统通知 (开发者 E)

*   `[ ] TODO: (开发者 E)` 实现系统通知列表页面 (`frontend/src/user/views/profile/NotificationsView.vue`)：
    *   显示通知列表。
    *   支持分页加载。
    *   显示通知标题、内容、时间、已读状态。
    *   调用 API 获取通知列表。
    *   调用 API 标记通知已读。
    *   在顶部导航栏显示未读通知数量。
    *   `[!] OPTIONAL:` 通知详情页。

### 6.2 用户举报 (开发者 E)

*   `[ ] TODO: (开发者 E)` 举报表单组件 (`frontend/src/report/components/ReportForm.vue`)：
    *   作为对话框或抽屉在相关页面中展示 (用户主页、商品详情页、订单详情页等)。
    *   选择举报对象类型 (用户、商品、订单)。
    *   输入举报内容。
    *   调用 API 提交举报。

---

## 7. 管理员后台前端 (开发者 A)

**概述:** 实现后端管理员功能的对应前端界面。

*   `[ ] TODO: (开发者 A)` 实现管理员登录界面。
*   `[ ] TODO: (开发者 A)` 实现管理员仪表盘/概览页。
*   `[ ] TODO: (开发者 A)` 实现用户管理页面：显示所有用户列表，支持搜索、禁用/启用用户、调整信用分。
*   `[ ] TODO: (开发者 A)` 实现商品审核页面：显示待审核商品列表，支持查看详情、激活/拒绝商品。
*   `[ ] TODO: (开发者 A)` 实现退货申请管理页面 (与开发者 D 协作或复用 D 的组件)。
*   `[ ] TODO: (开发者 A)` 实现举报管理页面 (与开发者 E 协作或复用 E 的组件)。
*   `[ ] TODO: (开发者 A)` 实现系统通知发送页面：管理员可以创建并发送系统通知。
*   `[ ] TODO: (开发者 A)` 实现管理员权限控制和路由守卫。

---

## 8. 高级功能与优化 (团队共同)

*   `[ ] TODO:` 搜索功能优化 (例如：联想搜索、热门搜索)。
*   `[ ] TODO:` 性能优化：组件懒加载、代码分割、图片优化。
*   `[ ] TODO:` SEO 优化 (如果需要 Web 应用的搜索引擎排名)。
*   `[ ] TODO:` 可访问性 (Accessibility) 优化。
*   `[ ] TODO:` 集成 Sentry 或其他错误监控系统。
*   `[ ] TODO:` 编写前端自动化测试（单元测试、组件测试、端到端测试）。
*   `[ ] TODO:` 配置前端 CI/CD 流水线。

---

### **如何使用这个 TODO 文档：**

1.  **团队认领:** 团队成员根据建议的分工或实际情况，在相应任务后添加自己的姓名/缩写，表示认领。
2.  **细化任务:** 认领者可以进一步细化任务的具体实现步骤或子任务。
3.  **每日更新:** 每位开发者在完成任务、开始新任务或遇到阻塞时，更新对应的 TODO 项状态（`[ ]` 到 `[√] DONE:`，或者 `[!] OPTIONAL:`，`[#] PENDING:`）。
4.  **定期评审:** 在每周的项目会议中，团队可以过一遍这个文档，了解整体进度，讨论阻塞点，并重新分配任务。
5.  **Git 版本控制:** 将这个 `TODO.md` 文件纳入 Git 版本控制，确保所有成员都在同一个最新版本上工作。每次更新后提交。
