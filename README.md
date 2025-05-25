# SiYuanTao (交大二手物品交易平台 - 前端)
一个基于 Vue.js 构建的校园二手物品交易平台前端应用程序。

## 项目概述
本项目是"交大二手交易平台"的前端部分，致力于为在校学生提供一个界面美观、操作便捷、响应迅速的在线二手市场。前端应用通过与后端 API 交互，实现了用户管理、商品展示与操作、实时在线沟通等核心功能。用户可以通过本应用方便地浏览、搜索、发布二手物品，进行学生身份认证，管理个人账户信息，并与其他用户进行即时聊天交流，从而促进校园内的资源共享与流通。

## 主要功能
- **用户模块**:
  - **注册与登录**: 提供用户注册表单及登录界面，通过与后端服务进行交互，采用 JWT (JSON Web Token) 进行用户身份认证和会话管理。
  - **个人中心**: 用户可以查看和修改自己的基本个人信息（如昵称、头像等）。
  - **学生认证**: 提供学生认证信息（如学号、学生证照片）的提交入口，并展示认证状态（未认证、审核中、已认证、认证失败）。
- **商品模块**:
  - **商品浏览**: 以列表或卡片形式展示商品信息，支持按商品分类、新旧程度、价格区间等条件进行筛选，并提供关键词搜索功能。实现分页加载以优化体验。
  - **商品详情**: 展示商品的详细信息，包括多张高清图片、商品标题、描述、价格、发布者信息、发布时间、浏览次数、以及用户对该商品的评论列表。
  - **商品操作**: 
    - **发布商品**: 提供表单供用户填写商品信息（名称、描述、分类、价格、图片等）并发布。
    - **编辑商品**: 允许发布者修改已发布商品的各项信息。
    - **删除商品**: 允许发布者删除自己发布的商品。
    - **上架/下架**: 发布者可以控制商品的可见状态。
  - **图片处理**: 支持用户上传多张商品图片，前端进行预览、数量和大小限制，并与后端配合完成图片的存储和展示。
  - **收藏夹**: 用户可以将感兴趣的商品加入收藏夹，方便后续查看和购买。
- **交易模块**:
  - **创建订单**: 用户选择商品后，可与卖家沟通并生成交易订单，确认交易详情（如交易方式、地点）。
  - **订单管理**: 用户可以查看自己作为买家或卖家的订单列表及其当前状态（如待付款、待发货、待收货、已完成、已取消）。
  - **交易评价**: 交易完成后，买卖双方可以相互评价，评价内容将展示在用户信用和商品下方。
- **聊天模块**:
  - **实时通讯**: 基于 WebSocket 技术，实现用户间的点对点即时消息传递，提供聊天界面，支持文本消息、表情（可选）、图片（可选）发送与接收。
  - **消息列表与通知**: 展示最近的聊天会话列表，并对新消息进行提示。
- **系统模块**:
  - **消息通知**: 展示系统级别的重要通知，如系统维护、功能更新、违规提醒等。
  - **国际化支持**: 使用 `vue-i18n` 实现多语言界面，方便不同语言背景的用户使用（当前主要支持中文）。

## 技术栈
- **核心框架**: Vue.js (具体版本请参照项目根目录下的 `package.json` 文件，通常为 Vue 3.x)。
- **路由管理**: Vue Router (用于实现单页面应用的客户端路由切换)。
- **状态管理**: Vuex (用于管理应用的全局状态，如用户信息、登录状态、购物车数据等，相关代码位于 `src/store` 目录)。
- **HTTP客户端**: Axios (经过封装，位于 `src/axios_client` 目录，用于与后端 RESTful API 进行异步数据交互)。
- **实时通信客户端**: 基于浏览器原生的 WebSocket API 进行封装和管理 (相关代码位于 `src/socket_client` 目录)，用于实现聊天等即时通讯功能。
- **构建与开发工具**: Vite (下一代前端构建工具，提供极速的冷启动和热模块替换体验)。
- **UI组件库**: (Element UI)。
- **国际化方案**: vue-i18n (集成在项目中，用于支持多语言界面，配置文件位于 `src/vue-i18n` 目录)。
- **桌面应用打包方案**: Electron (用于将Web应用打包成跨平台的桌面应用程序，相关配置文件和脚本位于 `electron` 和 `release` 目录，以及 `.editDist.js` 脚本)。

## 项目文件结构说明
- `SiYuanTao/` (项目根目录)
  - `cache/`: Electron 打包工具下载过程中产生的缓存文件目录。
  - `dist/`: Web 应用打包输出目录。执行 `npm run build` 后生成的静态文件（HTML, CSS, JavaScript）会存放在这里，用于部署到Web服务器。
  - `electron/`: Electron 桌面应用构建相关的文件存放目录（例如 Electron 主进程脚本、预加载脚本等）。
  - `node_modules/`: 项目依赖的 Node.js 模块存放目录，由 `npm install` 或 `cnpm install` 自动生成和管理。
  - `public/`: 存放静态公共资源。此目录下的文件在打包时会被直接复制到输出目录（通常是 `dist/`）的根路径下。
    - `app/`: (可能用于存放) Electron 桌面应用打包后的安装程序或相关资源。
  - `src/`: 项目核心源代码目录。
    - `assets/`: 存放项目中用到的静态资源，如图片、字体、全局CSS样式文件等。这些资源会被 Webpack/Vite 处理和优化。
    - `axios_client/`: 封装 Axios 实例的目录，统一处理请求拦截、响应拦截、错误处理等。
    - `components/`: 存放可复用的 Vue 组件（如按钮、弹窗、列表项等）。
    - `router/`: Vue Router 的配置文件目录，定义应用的路由规则和页面映射。
    - `socket_client/`: 封装 WebSocket 服务的目录，处理 WebSocket 连接、消息收发、心跳维持等。
    - `store/`: Vuex Store 的配置文件目录，定义和管理应用的全局状态模块。
    - `utils/`: 存放项目中用到的工具函数模块（如日期格式化、数据校验、本地存储操作等）。
    - `views/`: 存放应用的页面级 Vue 组件，通常与路由配置一一对应。
    - `vue-i18n/`: 国际化配置文件目录，存放各种语言的翻译文本。
    - `App.vue`: Vue 应用的根组件。
    - `main.js`: Vue 应用的入口文件，负责初始化 Vue 实例、加载插件、挂载根组件等。
  - `release/`: Electron 桌面应用打包后的输出目录（通常存放可执行文件、安装包等）。
  - `.gitignore`: Git 版本控制的忽略配置文件，指定哪些文件或目录不应被提交到代码仓库。
  - `backend.config.js`: 后端服务接口地址的配置文件，方便在不同环境（开发、测试、生产）中切换后端 API 地址。
  - `index.html`: 单页面应用的 HTML 入口文件，Vite/Webpack 会将打包后的 JavaScript 和 CSS 注入到此文件。
  - `package.json`: Node.js 项目的配置文件，定义项目名称、版本、依赖项、执行脚本等。
  - `jsconfig.json` (或 `tsconfig.json` 如果使用 TypeScript): JavaScript (或 TypeScript) 语言服务的配置文件，用于改善代码编辑器的智能提示和类型检查。
  - `vite.config.js`: Vite 构建工具的配置文件。
  - `.editDist.js`: 项目自定义的用于 Electron 打包的辅助脚本 (具体用途和执行方式见下方"打包"部分)。

## 本地开发环境设置
1.  **克隆代码仓库**:
    首先，通过 Git 从 GitHub 克隆本项目的代码仓库到您的本地计算机。
    ```bash
    git clone https://github.com/SiyuanTao-BJTU/siyuantao-frontend.git
    cd SiYuanTao
    ```

2.  **安装项目依赖**:
    进入项目根目录后，使用 npm (Node Package Manager) 或 cnpm (淘宝 NPM 镜像) 安装项目所需的所有 Node.js 依赖包。
    ```bash
    npm install
    ```
    *如果您在中国大陆地区，`npm install` 可能会因为网络问题下载缓慢或失败。推荐配置 npm 使用国内镜像源，或者直接使用 `cnpm`：*
    ```bash
    # 安装 cnpm (如果尚未安装)
    npm install -g cnpm --registry=https://registry.npmmirror.com
    # 使用 cnpm 安装依赖
    cnpm install
    ```

3.  **运行开发服务器**:
    依赖安装完成后，执行以下命令启动 Vite 开发服务器：
    ```bash
    npm run dev
    ```
    该命令会编译项目并在本地启动一个开发用的 Web 服务器。启动成功后，终端通常会显示应用的访问地址，默认为 `http://localhost:5173` 或其他类似端口 (如果默认端口被占用，Vite会自动选择一个可用端口)。在浏览器中打开此地址即可查看和调试应用。

## 应用打包
本项目提供两种打包方式：打包为可独立部署的 Web 应用，或打包为 Windows 平台的桌面应用程序。

### 1. 打包为 Web 应用
您可以执行以下 npm 脚本来构建生产环境的 Web 应用包：
```bash
npm run build
```
命令执行成功后，Vite 会将优化和压缩后的静态资源文件输出到项目根目录下的 `/dist` 文件夹内。此文件夹包含了完整的、可部署的前端应用，您可以将其内容部署到任何支持静态文件托管的服务器上（如 Nginx, Apache, Vercel, Netlify, GitHub Pages 等）。

### 2. 打包为 Windows 桌面应用 (使用 Electron)
本项目采用 Electron 将 Web 应用封装为 Windows 桌面程序。由于标准的 Electron 打包命令（如 `electron-builder` 提供的命令，若在 `package.json` 中配置为 `npm run build:desktop`）可能未完全适配本项目的特定需求，因此项目中使用了一个自定义的辅助脚本 `.editDist.js` 来协助完成打包流程。

**大致打包步骤可能如下 (具体请参照该脚本内容或相关内部文档)：**
1.  首先，需要构建出 Web 应用的生产版本：
    ```bash
    npm run build
    ```
    这将确保 `/dist` 目录中是最新的 Web 内容。
2.  然后，执行自定义的打包脚本。这可能是通过直接运行 Node.js 脚本，或者通过一个封装了该逻辑的 npm 脚本来完成：
    ```bash
    node .editDist.js 
    # 或者，如果 package.json 中有类似脚本，例如：
    # npm run package:electron
    ```
    此脚本通常会调用 Electron 的打包工具（如 `electron-builder` 或 `electron-packager`），并可能进行一些构建前的配置修改或文件复制操作。

**Electron 相关资源下载问题 (尤其在中国大陆地区):**
在安装 Electron 依赖或执行 Electron 打包命令时，可能会遇到 Electron 二进制文件、驱动程序等资源下载缓慢或失败的问题。以下是一些建议的解决方法：
- **使用 `cnpm`**: 如果您在"安装项目依赖"步骤中已经配置并使用了 `cnpm install`，它通常也能较好地处理 Electron 相关的下载。
- **设置 Electron 国内镜像源**: 为 npm (或 yarn/cnpm) 配置 Electron 的国内镜像地址，可以显著提高下载速度和成功率。
  在终端执行：
  ```bash
  # 为 npm 设置 Electron 镜像
  npm config set electron_mirror https://npmmirror.com/mirrors/electron/
  
  # 如果使用 yarn (本项目主要基于 npm, 此处为通用建议)
  # yarn config set electron_mirror https://npmmirror.com/mirrors/electron/
  ```
- **手动下载缓存**: 如果自动下载仍然失败，打包工具在执行时通常会在控制台打印出所需资源的下载链接。您可以尝试手动从该链接下载对应的 `.zip` 压缩包，然后将其放置到项目说明中提及的 `cache/` 目录（或者 Electron 打包工具指定的缓存目录，如 `electron-builder` 的缓存目录通常位于用户目录下的 `.electron` 或 `AppData/Local/electron/Cache`）。

打包完成后，生成的桌面应用安装包或可执行文件通常会存放在 `/release` 目录或 `/public/app` 目录下 (具体路径取决于 Electron 打包工具的配置)。

## 后端服务配置
前端应用需要与后端 API 服务进行通信以获取数据和执行操作。后端服务的接口地址在前端项目中通过 `backend.config.js` 文件进行配置。您可以根据实际部署情况修改此文件中的 URL。

```javascript
// backend.config.js 示例内容
const BackendConfig = {
  // --- 线上部署服务器配置 ---
  // 请将以下地址替换为您的实际后端服务器部署地址
  BASIC_URL: 'http://your-production-backend-domain.com', // 例如: 'http://1.92.122.228' 或 'https://api.yourdomain.com'
  RESTFUL_API_URL: 'http://your-production-backend-domain.com/api', // 例如: 'http://1.92.122.228/api' 或 'https://api.yourdomain.com/api'
  WebSocket_URL: 'ws://your-production-backend-domain.com/ws/chat', // 例如: 'ws://1.92.122.228/ws/chat' 或 'wss://api.yourdomain.com/ws/chat'

  // --- 本地开发环境配置 (如需连接本地后端，请取消注释并修改) ---
  // BASIC_URL: 'http://127.0.0.1:8000', // 本地后端默认运行端口
  // RESTFUL_API_URL: 'http://127.0.0.1:8000/api',
  // WebSocket_URL: 'ws://127.0.0.1:8000/ws/chat'
};

export default BackendConfig;
```
**请确保**：
-   在部署到生产环境时，这些 URL 指向的是您后端服务实际的、可公开访问的地址。
-   在本地开发时，如果后端服务也在本地运行，可以将这些 URL 指向本地后端地址（如 `http://127.0.0.1:8000`）。
-   如果后端 API 或 WebSocket 服务使用了 HTTPS/WSS，请确保 URL 中的协议头正确 ( `https://` 和 `wss://` )。

## 应用部署
- **Web 应用部署**: 
  将 `npm run build` 命令生成的 `/dist` 目录下的所有静态文件，部署到任意支持静态文件托管的 Web 服务器上即可。常见的选择包括：
    -   Nginx 或 Apache 服务器。
    -   云平台提供的静态网站托管服务 (如 AWS S3 + CloudFront, Azure Blob Storage, Google Cloud Storage)。
    -   Serverless 平台 (如 Vercel, Netlify, GitHub Pages)。

- **Windows 桌面应用部署**: 
  将 Electron 打包后生成的安装程序（例如 `.exe` 安装包, `.msi` 包, 或解压即用的绿色版文件夹，通常位于 `/release` 或 `/public/app` 目录）分发给 Windows 用户安装使用。

## 测试
(此部分用于说明项目的测试策略和如何运行测试)

**当前状态**: (请根据实际情况填写，例如：自动化测试尚未配置 / 单元测试使用 Vitest 编写 / E2E 测试使用 Cypress)

**运行测试 (示例)**:
如果项目配置了测试脚本 (例如在 `package.json` 中定义了 `npm test`)，可以通过以下命令运行：
```bash
npm test
```

(如果项目包含单元测试、集成测试或端到端测试，请在此处详细说明测试框架、测试覆盖范围以及如何运行特定类型的测试。)

## 贡献代码
我们欢迎对本项目的贡献！如果您希望参与改进，请遵循以下步骤：

1.  **Fork 本仓库**: 点击项目 GitHub 页面右上角的 "Fork" 按钮，将本仓库复制到您自己的 GitHub 账户下。
2.  **Clone 您的 Fork**: 将您 Fork 后的仓库 Clone 到本地：
    ```bash
    git clone https://github.com/SiyuanTao-BJTU/siyuantao-frontend.git
    cd SiYuanTao
    ```
3.  **创建新分支**: 基于 `main` (或当前的开发主分支) 创建一个新的特性分支或修复分支：
    ```bash
    git checkout -b feature/your-new-feature-name 
    # 或者 
    git checkout -b fix/issue-describe
    ```
4.  **进行修改**: 在新分支上进行您的代码修改和功能开发。
5.  **提交更改**: 
    ```bash
    git add .
    git commit -m "feat: 添加了某个很棒的功能" 
    # 或者 
    git commit -m "fix: 修复了某个重要bug (Closes #123)" 
    # (请遵循项目的 commit message 规范，如果有的话)
    ```
6.  **推送分支**: 将您的本地分支推送到您 Fork 的远程仓库：
    ```bash
    git push origin feature/your-new-feature-name
    ```
7.  **创建 Pull Request (PR)**: 回到您在 GitHub 上的 Fork 仓库页面，点击 "New pull request" 或 "Compare & pull request" 按钮，选择您的特性分支，向原仓库的 `main` 分支发起 Pull Request。请在 PR 中清晰描述您的更改内容和目的。

(可选：如果项目有更详细的编码规范、分支策略或 PR 指南，请在此处补充或链接到相关文档。)

## 许可证 (License)
(请根据项目的实际情况指定许可证类型。常见的开源许可证如 MIT, Apache License 2.0, GNU GPLv3 等。如果项目未开源或有特定商业授权，请说明。)

**示例 (如果使用 MIT 许可证):**
本项目基于 [MIT License](LICENSE.md) 开源。

---
感谢您的关注与使用！