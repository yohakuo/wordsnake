import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export", // 必须改为 export 才能部署到 GitHub Pages
  images: {
    unoptimized: true, // GitHub Pages 不支持 Next.js 图片优化，必须开启
  },
  // 如果你的仓库名字比如叫 'snake-game'，需要打开下面的注释并修改名字
  // basePath: '/snake-game',
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
