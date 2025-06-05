# 前端部署故障排除指南 (Deployment Troubleshooting Guide)

---

## 1. 混合内容 (Mixed Content) 错误

### 什么是混合内容错误？

当一个通过 **HTTPS (安全)** 协议加载的网页，尝试加载任何 **HTTP (不安全)** 协议的资源时，浏览器会将其视为一个安全隐患，并**阻止**这些不安全的请求。

**典型错误信息 (在浏览器开发者工具的控制台中可见)：**
```
Mixed Content: The page at 'https://your-frontend.com' was loaded over HTTPS, but requested an insecure XMLHttpRequest endpoint 'http://your-backend.com/api/...'. This request has been blocked; the content must be served over HTTPS.
```

**为什么会发生？**

您的前端应用 (例如 `https://www.siyuantao.xyz`) 部署在 Vercel 上，Vercel 会自动为自定义域名配置 HTTPS，确保您的网站是安全的。然而，如果您的后端 API (例如 `http://1.92.122.228:8000`) 仍然通过 HTTP 协议提供服务，那么当 HTTPS 的前端尝试向 HTTP 的后端发起请求时，浏览器就会触发混合内容警告并阻止该请求，以防止潜在的中间人攻击或数据泄露。

### 解决方案：为后端 API 配置 HTTPS

解决混合内容错误的唯一正确方法是确保您的后端 API 也通过 **HTTPS** 提供服务。

**推荐的实现方式 (在您的云服务器上)：**

1.  **为后端 API 配置域名 (推荐使用子域名，例如 `api.siyuantao.xyz`)**：
    *   在您的域名注册商（如阿里云、腾讯云等）处，为后端 API 分配一个子域名（例如 `api.siyuantao.xyz`）。
    *   为该子域名添加一条 `A` 记录，指向您云服务器的公网 IP 地址 (`1.92.122.228`)。
    *   **更新前端 Vercel 项目的环境变量 `VITE_APP_API_BASE_URL`**，将其值从 `http://1.92.122.228:8000` 修改为 `https://api.siyuantao.xyz`。

2.  **在云服务器上安装和配置 Nginx 作为反向代理**：
    *   Nginx 是一个高性能的 Web 服务器，它可以作为反向代理，将外部的 HTTPS 请求转发到您本地运行的 FastAPI 应用（例如，通过 Gunicorn 运行在 `http://127.0.0.1:8000`）。
    *   **安装 Nginx**：
        ```bash
        sudo apt update
        sudo apt install nginx
        ```
    *   **配置 Nginx 网站文件** (例如 `/etc/nginx/sites-available/siyuantao_backend.conf`，并软链接到 `sites-enabled`)：
        ```nginx
        server {
            listen 80;
            server_name api.siyuantao.xyz; # 替换为你的后端域名

            location / {
                proxy_pass http://127.0.0.1:8000; # 转发到后端 Gunicorn 运行的端口
                proxy_set_header Host $host;
                proxy_set_header X-Real-IP $remote_addr;
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                proxy_set_header X-Forwarded-Proto $scheme;
            }
        }
        ```
    *   **激活配置并重启 Nginx**：
        ```bash
        sudo ln -s /etc/nginx/sites-available/siyuantao_backend.conf /etc/nginx/sites-enabled/
        sudo nginx -t # 测试配置语法
        sudo systemctl restart nginx
        ```

3.  **使用 Certbot (Let's Encrypt) 自动化配置 SSL 证书**：
    *   Certbot 是一个免费的工具，可以自动从 Let's Encrypt 获取 SSL 证书，并配置 Nginx 使用这些证书。它还会设置证书的自动续期。
    *   **安装 Certbot**：
        ```bash
        sudo snap install core
        sudo snap refresh core
        sudo snap install --classic certbot
        sudo ln -s /snap/bin/certbot /usr/bin/certbot # 创建软链接方便使用
        ```
    *   **获取证书并自动配置 Nginx**：
        ```bash
        sudo certbot --nginx -d api.siyuantao.xyz # 替换为你的后端域名
        ```
        Certbot 会引导您完成配置过程，包括设置 HTTP 到 HTTPS 的自动重定向。

4.  **开放云服务器防火墙端口**：
    *   确保您的云服务器防火墙（如 UFW 或云服务商的安全组）开放了 `80` (HTTP) 和 `443` (HTTPS) 端口。

---

## 2. CORS (跨域资源共享 - Cross-Origin Resource Sharing) 问题

### 什么是 CORS？

CORS 是一种浏览器安全机制，旨在限制网页（通常是通过 JavaScript 发起的请求）向不同源（Origin）的服务器发起 HTTP 请求。

**"不同源"的定义：**
如果两个 URL 的 **协议、域名、端口** 中任意一个不同，它们就被视为不同源。

*   **您的前端源 (示例)**：`https://www.siyuantao.xyz`
*   **您的后端源 (示例)**：`https://api.siyuantao.xyz`

在解决了混合内容问题并使后端也支持 HTTPS 后，您的前端和后端将都是 HTTPS 协议。但是，如果它们的域名（`www.siyuantao.xyz` 和 `api.siyuantao.xyz`）不同，那么仍然属于不同源。

### 为什么会发生 CORS 错误？

当浏览器检测到跨域请求时，它会发送一个特殊的 HTTP 请求头（`Origin`）到后端服务器。后端服务器需要返回一个 `Access-Control-Allow-Origin` 响应头，明确告诉浏览器允许哪些源来访问。如果后端没有返回正确的 `Access-Control-Allow-Origin` 头，或者返回的值不匹配前端的源，浏览器就会阻止该请求，抛出 CORS 错误。

**典型错误信息 (在浏览器开发者工具的控制台中可见)：**
```
Access to XMLHttpRequest at 'https://api.siyuantao.xyz/api/v1/auth/login' from origin 'https://www.siyuantao.xyz' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

### 解决方案：在后端配置允许的来源

您的后端 FastAPI 应用已经集成了 `CORSMiddleware`，它通过 `FRONTEND_DOMAIN` 环境变量来配置允许的来源。

在 `backend/app/main.py` 中：
```python
frontend_urls_str = os.getenv("FRONTEND_DOMAIN", "http://localhost:3301")
allowed_origins_list = [url.strip() for url in frontend_urls_str.split(',')]
# ...
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins_list, # 使用从环境变量加载的列表
    # ...
)
```

**您需要做的是：**

1.  **确保在您的云服务器上，后端应用的运行环境中设置了 `FRONTEND_DOMAIN` 环境变量。**
    *   这通常在启动 Gunicorn 的 `systemd` 服务文件（例如 `/etc/systemd/system/gunicorn_siyuantao.service`）中配置，在 `[Service]` 部分添加 `Environment="FRONTEND_DOMAIN=https://www.siyuantao.xyz,https://siyuantao.xyz"`（根据您希望允许的域名进行调整，可以包含多个，用逗号分隔）。
    *   或者，如果您使用 `.env` 文件来加载环境变量，请确保在后端项目的根目录下有一个 `.env` 文件，其中包含 `FRONTEND_DOMAIN="https://www.siyuantao.xyz,https://siyuantao.xyz"`。
2.  **确保 `FRONTEND_DOMAIN` 的值包含了您的前端部署的完整 HTTPS 域名。**
    *   如果您的前端主域名是 `https://www.siyuantao.xyz`，并且 `siyuantao.xyz` 会重定向到它，那么 `FRONTEND_DOMAIN` 至少应该包含 `https://www.siyuantao.xyz`。为了保险起见，可以同时包含根域名和 `www` 域名，例如：`https://www.siyuantao.xyz,https://siyuantao.xyz`。

**重要提示：** CORS 错误只会在混合内容错误解决之后才会出现。所以，首要任务是让后端也支持 HTTPS。

---

## 3. 针对答辩的临时策略

考虑到您答辩时间的紧迫性，虽然将后端配置为 HTTPS 是最终且正确的解决方案，如果时间真的不允许：

**建议您在答辩时，清晰地向评委说明当前遇到的"混合内容错误"以及其解决方案：**

1.  **展示问题**：通过浏览器开发者工具，展示 `https://www.siyuantao.xyz` 页面上因"混合内容"而阻止的 API 请求。
2.  **解释原因**：说明前端已通过 HTTPS 部署，但后端目前仍为 HTTP，导致浏览器出于安全原因拦截了请求。
3.  **阐述解决方案**：明确指出正确的、业界标准的解决方案是为后端也配置 HTTPS（例如通过 Nginx + Certbot），并强调这是部署到生产环境后的关键安全步骤和优化方向。
4.  **展示您对 CORS 的理解**：您可以进一步说明，解决了混合内容问题后，下一步需要确保后端 CORS 配置包含了前端部署的完整 HTTPS 域名，以避免"跨域问题"。

这种方式可以充分展现您对项目部署、网络安全和常见故障排除的深入理解，这在毕业设计答辩中是非常重要的加分项。

--- 