# 【思源淘】—— 交大学子专属二手交易平台 (前端)

---

## 开发快速通道 🚀

*   **本地开发环境设置**: 详细的 Node.js 安装、依赖安装与开发服务器启动步骤。
    ```bash
    # 克隆仓库
    git clone https://github.com/SiyuanTao-BJTU/siyuantao-frontend.git
    cd siyuantao-frontend
    
    # 安装依赖 (推荐使用 pnpm)
    pnpm install
    # 或 npm install
    
    # 启动开发服务器
    pnpm dev
    # 或 npm run dev
    ```
    更多详细设置请参考 [开发与部署指南](./docs/开发与部署指南.md) 中的"环境准备"和"开发指南"部分。
*   **任务看板**: [TODO.md](./TODO.md) - 查看当前开发任务和分工。
*   **前端文档**: [docs/](./docs/) - 所有前端开发相关文档。

---

## 项目简介

本项目【思源淘】是一个专为交大学子设计的二手物品交易平台前端应用。致力于提供一个界面美观、操作便捷、响应迅速的在线二手市场。前端应用通过与后端 API 交互，实现了用户管理、商品展示与操作、实时在线沟通等核心功能。用户可以通过本应用方便地浏览、搜索、发布二手物品，进行学生身份认证，管理个人账户信息，并与其他用户进行即时聊天交流，从而促进校园内的资源共享与流通。

主要功能包括：用户认证与管理、商品浏览与发布、订单交易流程、站内信实时聊天、系统通知、收藏夹管理、学生认证等。

---

## 技术栈与架构

前端使用 **Vue 3** 构建，基于 **Vite** 进行开发与构建。采用 **Vue Router** 进行路由管理，**Vuex** 进行状态管理，并通过封装的 **Axios** 与后端进行数据交互。实时通讯使用 **WebSocket**。UI 组件库使用 **Element Plus**。应用支持国际化 (**vue-i18n**)。桌面应用打包使用 **Electron**。

本项目采用组件化、模块化的开发思想，力求实现高内聚、低耦合的结构。UI 界面设计将与后端提供的 API 接口紧密配合，但前端具体的页面流程和组件组织方式以前端设计稿和开发约定为准。

更详细的技术栈说明请参考 [docs/技术栈说明.md](./docs/技术栈说明.md)。

---

## 项目结构

为了方便开发者快速理解项目，以下是前端项目的核心目录结构及其主要作用：

```
frontend/
├── src/                    # 源代码目录
│   ├── admin/             # 管理员后台 (开发者 A)
│   │   ├── components/
│   │   ├── store/
│   │   └── views/
│   ├── assets/            # 静态资源 (通用)
│   ├── axios_client/      # Axios 封装 (通用)
│   ├── chat/              # 消息与退货 (开发者 D)
│   │   ├── components/
│   │   ├── store/
│   │   └── views/
│   ├── components/        # 通用组件 (开发者 A)
│   ├── notification_report/ # 通知与举报 (开发者 E)
│   │   ├── components/
│   │   ├── store/
│   │   └── views/
│   ├── order/             # 交易模块 (开发者 C)
│   │   ├── components/
│   │   ├── store/
│   │   └── views/
│   ├── product/           # 商品模块 (开发者 B)
│   │   ├── components/
│   │   ├── store/
│   │   └── views/
│   ├── router/            # 路由配置 (通用)
│   ├── socket_client/     # WebSocket 封装 (开发者 D)
│   ├── store/             # Vuex 根 Store (通用)
│   │   └── modules/       # 模块 Store (按需移动)
│   ├── user/              # 用户模块 (开发者 A)
│   │   ├── components/
│   │   ├── store/
│   │   └── views/
│   ├── utils/             # 工具函数 (通用)
│   ├── API_PRO.js         # API 服务 (通用)
│   ├── App.vue            # 根组件 (通用)
│   ├── FormatObject.js    # 格式化工具 (通用)
│   └── main.js            # 入口文件 (通用)
├── public/                # 公共资源目录
├── electron/              # Electron 相关文件
├── dist/                # 构建输出目录
├── release/               # 桌面应用打包输出
├── docs/                 # 项目文档
├── .gitignore            # Git 忽略文件配置
├── vite.config.js         # Vite 配置
├── package.json           # 项目配置
├── index.html           # 入口 HTML
└── backend.config.js      # 后端服务接口配置
```

**核心目录说明：**

*   `src/`: 存放所有的前端应用源代码，按照功能和职责划分为不同的子目录。
*   `admin/`: 管理员后台模块，由开发者 A 负责。
*   `assets/`: 静态资源，通用。
*   `axios_client/`: Axios 封装，通用。
*   `chat/`: 消息与退货模块，由开发者 D 负责。
*   `components/`: 通用可复用组件，由开发者 A 负责。
*   `notification_report/`: 通知与举报模块，由开发者 E 负责。
*   `order/`: 交易模块，由开发者 C 负责。
*   `product/`: 商品模块，由开发者 B 负责。
*   `router/`: 路由配置，通用。
*   `socket_client/`: WebSocket 封装，由开发者 D 负责。
*   `store/`: Vuex 状态管理根目录，通用，模块 store 建议迁移至对应模块目录下。
*   `user/`: 用户模块，由开发者 A 负责。
*   `utils/`: 工具函数，通用。
*   其他位于 `src/` 根目录的文件（如 `API_PRO.js`, `App.vue`, `FormatObject.js`, `main.js`）属于基础架构部分，通用。
*   `public/`: 存放静态公共资源。
*   `electron/`: Electron 相关文件。
*   `dist/`: Web 应用打包输出目录。
*   `release/`: 桌面应用打包输出目录。
*   `docs/`: 存放详细的项目文档。

---

## 模块划分与开发指导

前端项目的模块划分旨在与后端服务的分工相对独立，同时确保前端内部的逻辑清晰和组件复用。我们将根据功能领域进行模块划分，例如：用户模块、商品模块、交易模块、消息模块等。

每个模块应包含其相关的页面组件 (`views`)、可复用组件 (`components`)、状态管理 (`store`)、API 调用逻辑等（模块内的 API 调用可以组织在各自模块下，例如 `frontend/src/user/api/user.js`）。模块内部应尽量减少对外部模块的直接依赖，通过集中的状态管理或事件总线进行通信。

详细的模块划分方案、各模块职责、以及与后端分组的协作方式，请查阅 [TODO.md](./TODO.md) 中的团队分工部分。

前端开发应遵循组件化原则，提高代码复用性；遵循状态管理的最佳实践，避免状态混乱；遵循接口调用规范，统一处理数据和错误。

---

## 相关文档

*   **任务看板**: [TODO.md](./TODO.md)
*   **开发与部署指南**: [docs/开发与部署指南.md](./docs/开发与部署指南.md)
*   **技术栈说明**: [docs/技术栈说明.md](./docs/技术栈说明.md)
*   **模块划分与职责**: [docs/模块划分与职责.md](./docs/模块划分与职责.md)
*   **API 接口调用规范**: [docs/API接口调用规范.md](./docs/API接口调用规范.md)
*   **前端测试指南**: [docs/测试指南.md](./docs/测试指南.md)

---

## 更多指南

*   [应用打包](#应用打包)
*   [后端服务配置](#后端服务配置)
*   [应用部署](#应用部署)
*   [测试](#测试)
*   [贡献代码](#贡献代码)
*   [许可证](#许可证)
