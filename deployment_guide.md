# 🐍 贪吃蛇猜单词项目发布与测试指南



## 使用 GitHub Pages 部署 
这是你询问的方案，适合纯静态的小游戏，完全免费。

### 核心步骤
1.  **修改配置 (已由助手自动完成)**:
    *   `next.config.ts` 已修改为 `output: "export"`。
    *   **重要**: 如果你的仓库名不是 `你的用户名.github.io` (而是比如 `wordsnake`)，你需要打开 `next.config.ts`，取消 `basePath` 的注释并修改为你的仓库名 (例如 `/wordsnake`)。
    *   已自动删除了不兼容的 API 路由。

2.  **添加自动部署流程 (已由助手自动完成)**:
    *   已创建 `.github/workflows/deploy.yml` 文件。只要你推送到 GitHub，它就会自动构建。

3.  **在 GitHub 上启用 Pages**:
    *   将代码推送到 GitHub 仓库。
    *   进入仓库 **Settings** (设置) -> **Pages**。
    *   在 **Build and deployment** 下的 **Source** 选择 **GitHub Actions** (注意：不要选 Deploy from a branch)。
    *   一旦设置完成，GitHub Actions 会自动运行（可能需要几分钟），完成后你的游戏就会上线。

4.  **关于中国用户访问**:
    *   GitHub Pages 在中国大陆**可以访问**，但速度可能不稳定。
    *   如果发现朋友打不开，可以尝试下面介绍的 "Cloudflare Pages" 方案，它通常在国内更快且也很容易配置。

---

## 使用 Vercel 部署 (推荐 - 最稳定)
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

## 🇨🇳 中国大陆用户访问指南 (解决 Vercel 无法访问问题)

由于网络环境原因，Vercel 默认提供的 `*.vercel.app` 域名在中国大陆通常会被阻断或访问极其缓慢。以下是几种解决方案：

### 方案一：绑定自定义域名 (最推荐，如果有域名)
如果你拥有自己的域名（例如 `mygame.com`），直接在 Vercel 后台绑定它。
1. 进入 Vercel 项目 -> **Settings** -> **Domains**。
2. 输入你的域名并添加。
3. 按照提示在你的域名注册商（阿里云、腾讯云等）处添加 CNAME 记录指向 `cname.vercel-dns.com`。
*这是最简单的解决方法，自定义域名通常可以正常访问。*

### 方案二：使用 Cloudflare Pages (免费且相对稳定)
Cloudflare 的网络在中国大陆的访问情况通常优于 Vercel 的默认域名。

1.  **准备代码**: 确保你的代码已推送到 GitHub。
2.  **注册/登录**: 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/) 并注册。
3.  **创建应用**:
    *   点击左侧菜单 "Workers & Pages"。
    *   点击 "Create Application" -> "Pages" -> "Connect to Git"。
    *   选择你的仓库 `wordsnake`。
4.  **配置构建**:
    *   **Framework preset**: 选择 `Next.js`。
    *   **Build command**: `npx @cloudflare/next-on-pages@1` (推荐) 或 `npm run build`。
    *   **Environment Variables** (环境变量):
        *   添加 `NODE_VERSION`，值为 `18` (或更高)。
        *   如果构建报错提示 Prisma 缺少数据库 URL，可以添加一个假的 `DATABASE_URL`，例如 `postgresql://user:password@localhost:5432/db` (因为这是一个纯前端游戏，只有构建时不需要真实连接)。
5.  **部署**: 点击 "Save and Deploy"。
6.  **访问**: 部署成功后，Cloudflare 会提供一个 `*.pages.dev` 的域名。

### 方案三：使用 Zeabur (对中国用户友好)
Zeabur 是一个对中国开发者/用户非常友好的部署平台，服务器位于香港/新加坡等地，速度快且可以直接访问。

1.  访问 [Zeabur](https://zeabur.com/) 并使用 GitHub 登录。
2.  点击 "Create Project" (创建项目)。
3.  选择 "Deploy New Service" (部署新服务) -> "Git"。
4.  选择你的仓库 `wordsnake`。
5.  Zeabur 会自动识别 Next.js 项目并开始构建。
6.  部署完成后，在 "Networking" (网络) 选项卡中生成一个免费域名 (例如 `*.zeabur.app`)。
*通常这个域名在中国大陆可以直接访问。*

### 方案四：Netlify (备选)
Netlify 的 `*.netlify.app` 域名有时比 Vercel 好用，但也不保证 100% 稳定。
部署流程与 Vercel 类似：拖入文件夹或连接 GitHub 即可。
