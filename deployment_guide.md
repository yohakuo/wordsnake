# 🐍 贪吃蛇猜单词项目发布与测试指南

这里有三种方法可以将你的项目发布给朋友测试，你可以根据具体情况选择最适合的一种。

## 方法一：使用 Vercel 部署 (推荐 - 最稳定)
这是最标准的方式，你的朋友可以通过一个永久链接随时访问游戏。

### 步骤
1.  **注册/登录 Vercel**: 访问 [vercel.com](https://vercel.com/) 并使用 GitHub 账号登录。
2.  **导入项目**:
    *   在 Vercel控制台点击 "Add New..." -> "Project".
    *   选择你的 `wordsnake` GitHub 仓库并点击 "Import".
3.  **配置**:
    *   **Framework Preset**: 选择 `Next.js`.
    *   **Root Directory**: 保持默认。
    *   点击 "Deploy"。
4.  **分享**: 部署完成后，Vercel 会给你一个类似 `wordsnake.vercel.app` 的域名，发送给朋友即可。

> **注意**: 如果构建失败，请检查构建日志。虽然项目中有 Prisma，但只要不依赖数据库连接，Next.js 的静态构建应该可以通过。如果遇到问题，请尝试在 `package.json` 的 `build` 命令中添加 `--no-lint` 或忽略 TypeScript 错误。

---

## 方法二：局域网共享 (最快 - 需在同一 WiFi 下)
如果你和朋友在一起（连接同一个 WiFi），这是最快的方法，无需任何部署。

### 步骤
1.  **获取本机 IP 地址**:
    *   按 `Win + R`，输入 `cmd` 打开命令行。
    *   输入 `ipconfig` 并回车。
    *   找到 "无线局域网适配器 WLAN" 下的 "IPv4 地址"，通常是像 `192.168.x.x` 这种格式。

2.  **启动开发服务器**:
    在你的 VS Code 终端中运行以下命令（允许局域网访问）：
    ```bash
    npm run dev -- -H 0.0.0.0
    ```
    *(或者直接使用 `npx next dev -H 0.0.0.0`)*

3.  **让朋友连接**:
    朋友的手机或电脑连接同一个 WiFi，然后在浏览器输入：
    `http://[你的IP地址]:3000`
    
    例如：`http://192.168.1.5:3000`

---

## 方法三：使用内网穿透 (远程测试 - 无需服务器)
如果朋友不在身边，且你不想配置 Vercel，可以使用工具将你本地的 `localhost:3000` 映射到一个临时公网网址。

**推荐工具**: [Ngrok](https://ngrok.com/), [Cloudflare Tunnel](https://developers.cloudflare.com/pages/how-to/preview-with-cloudflare-tunnel/), 或 [Localtunnel](https://github.com/localtunnel/localtunnel).

以 **Localtunnel** 为例 (最简单，无需注册):

1.  **启动本地服务**: 确保你的项目正在运行 (`npm run dev`)。
2.  **启动隧道**:
    打开一个新的终端窗口，运行：
    ```bash
    npx localtunnel --port 3000
    ```
3.  **分享链接**:
    终端会显示一个 `https://xxxx.loca.lt` 的链接，发给朋友即可访问。
    *(首次访问可能需要点击确认为安全链接)*
