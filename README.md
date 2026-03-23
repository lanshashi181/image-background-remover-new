# 🖼️ 图片背景移除工具

基于 Next.js + Tailwind CSS 的图片背景移除 Web 应用，使用 Remove.bg API 实现智能抠图。

## ✨ 功能特性

- **拖拽上传** - 支持拖拽或点击上传图片
- **智能抠图** - 调用 Remove.bg API 自动移除背景
- **实时预览** - 对比原图和处理结果
- **一键下载** - 下载 PNG 格式的透明背景图片
- **响应式设计** - 适配桌面和移动设备

## 🚀 快速开始

### 1. 获取 API Key

访问 [Remove.bg](https://www.remove.bg/api) 注册账号并获取 API Key（免费版每月 50 张）

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

```bash
cp .env.local.example .env.local
```

编辑 `.env.local`，填入你的 API Key：

```
REMOVE_BG_API_KEY=your_api_key_here
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## 📦 部署

### Vercel（推荐）

```bash
npm install -g vercel
vercel
```

记得在 Vercel 控制台设置环境变量 `REMOVE_BG_API_KEY`

### Docker

```bash
docker build -t image-bg-remover .
docker run -p 3000:3000 -e REMOVE_BG_API_KEY=your_key image-bg-remover
```

## 🔧 技术栈

- **框架**: Next.js 15 (App Router)
- **样式**: Tailwind CSS
- **语言**: TypeScript
- **API**: Remove.bg

## 📝 支持格式

- JPG / JPEG
- PNG
- WebP

最大文件大小: 25MB

## 📄 许可证

MIT License