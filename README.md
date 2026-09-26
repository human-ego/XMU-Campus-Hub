# 厦大校园 Hub

“厦大校园 Hub”是一个面向厦门大学学生的校园服务聚合入口。它不复制或替代学校已有系统，而是把分散在不同网站和微信小程序中的常用服务整理在一个清晰、现代、易用的首页中。

## 第一版功能

- 按“学习、校园、资源、生活”浏览服务
- 实时搜索服务名称、描述和关键词
- 记录网站服务的本地使用次数
- 根据使用次数展示常用服务
- 在新标签页打开学校网站
- 展示微信小程序名称和打开说明
- 适配手机和桌面浏览器
- 预留深色模式和小程序跳转数据结构

## 技术栈

- React
- TypeScript
- Vite
- Tailwind CSS
- Lucide React

## 本地运行

需要 Node.js 20.19 或更高版本。本项目开发时使用 Node.js 24。

```bash
npm install
npm run dev
```

默认开发地址由 Vite 输出，通常是 `http://localhost:5173`。

## 类型检查

```bash
npm run typecheck
```

## 生产构建

```bash
npm run build
```

构建结果输出到 `dist/`。可以使用以下命令预览构建结果：

```bash
npm run preview
```

## 服务数据

所有服务入口集中在：

```text
src/data/services.ts
```

分类定义集中在：

```text
src/data/categories.ts
```

新增服务时只需要在数据文件中添加一条记录，不需要修改卡片组件。网站服务使用 `type: "website"`，微信小程序服务使用 `type: "miniprogram"`。

## 隐私说明

服务使用次数只保存在当前浏览器的 `localStorage` 中。项目不包含登录、账号系统、后端、Cookie、Token 或学生个人信息。

## 免责声明

本项目是独立的校园服务导航工具，与厦门大学官方机构无隶属或背书关系。具体服务内容、登录方式和可用性以对应学校部门或小程序提供方为准。
