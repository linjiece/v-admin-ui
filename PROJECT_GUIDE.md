# V-Admin-UI 项目指南

## 目录

- [项目简介](#项目简介)
- [环境配置](#环境配置)
- [项目结构](#项目结构)
- [开发指南](#开发指南)
- [测试指南](#测试指南)
- [部署指南](#部署指南)
- [常用命令](#常用命令)
- [开发规范](#开发规范)

---

## 项目简介

本项目是基于 [Vue Vben Admin](https://github.com/vbenjs/vue-vben-admin) 的中后台管理系统前端模板，采用 Vue 3、Vite、TypeScript、Element Plus 等主流技术开发。

### 技术栈

| 分类 | 技术 |
|------|------|
| 框架 | Vue 3 + Composition API |
| 构建工具 | Vite |
| 语言 | TypeScript |
| UI 组件库 | Element Plus |
| 状态管理 | Pinia |
| 路由 | Vue Router |
| 样式 | Tailwind CSS |
| 包管理 | pnpm |
| Monorepo | Turborepo |

---

## 环境配置

### 前置要求

- **Node.js**: >= 20.12.0
- **pnpm**: >= 10.0.0
- **Docker** (可选，用于容器化部署)

### 安装步骤

```bash
# 1. 克隆项目
git clone <repository-url>
cd v-admin-ui

# 2. 安装 pnpm (如果未安装)
npm install -g pnpm

# 3. 安装依赖
pnpm install

# 4. 安装完成后会自动执行 postinstall 脚本
```

### 环境变量配置

项目根目录和各应用目录下都有 `.env` 文件用于配置不同环境变量。

**主要环境变量说明 (apps/web-ele/.env.development)**:

```env
# 端口号
VITE_PORT=5777

# 基础路径
VITE_BASE=/

# 应用标题
VITE_APP_TITLE=HNGX

# API 接口地址
VITE_GLOB_API_URL=http://10.109.205.194:8000

# 是否开启 Nitro Mock 服务
VITE_NITRO_MOCK=false

# 是否打开 devtools
VITE_DEVTOOLS=true

# 是否注入全局 loading
VITE_INJECT_APP_LOADING=true
```

**生产环境变量 (apps/web-ele/.env.production)**:

```env
VITE_BASE=/
VITE_GLOB_API_URL=http://v-app:8000
VITE_COMPRESS=none
VITE_PWA=false
VITE_INJECT_APP_LOADING=true
VITE_ARCHIVER=true
```

---

## 项目结构

```
v-admin-ui/
├── apps/                          # 应用程序
│   └── web-ele/                   # Web 应用 (Element Plus 版本)
│       ├── src/
│       │   ├── adapter/          # 适配器配置
│       │   ├── api/              # API 接口定义
│       │   │   ├── core/         # 核心业务 API
│       │   │   ├── fi/           # FI 业务 API
│       │   │   └── request.ts    # 请求封装
│       │   ├── components/       # 业务组件
│       │   ├── layouts/          # 布局组件
│       │   ├── locales/          # 国际化配置
│       │   │   └── langs/
│       │   │       ├── zh-CN/    # 中文语言包
│       │   │       └── en-US/    # 英文语言包
│       │   ├── router/           # 路由配置
│       │   ├── store/            # 状态管理
│       │   ├── utils/            # 工具函数
│       │   ├── views/            # 页面视图
│       │   │   ├── _core/        # 核心业务页面
│       │   │   ├── dashboard/   # 仪表盘页面
│       │   │   ├── demos/        # 示例页面
│       │   │   └── fi/           # FI 业务页面
│       │   ├── app.vue           # 根组件
│       │   ├── bootstrap.ts      # 应用初始化
│       │   └── main.ts           # 应用入口
│       └── package.json
│
├── packages/                      # 共享包
│   └── @core/
│       ├── base/                  # 基础模块
│       │   ├── design/           # 设计样式
│       │   ├── icons/            # 图标
│       │   └── shared/           # 共享工具
│       ├── composables/          # 组合式函数
│       ├── preferences/          # 偏好设置
│       └── ui-kit/               # UI 组件库
│           ├── form-ui/          # 表单组件
│           ├── layout-ui/        # 布局组件
│           ├── menu-ui/          # 菜单组件
│           ├── popup-ui/         # 弹窗组件
│           └── shadcn-ui/        # shadcn 风格组件
│
├── internal/                       # 内部工具配置
│   ├── lint-configs/              # ESLint、Prettier 等配置
│   ├── node-utils/               # Node 工具库
│   ├── tailwind-config/          # Tailwind 配置
│   ├── tsconfig/                 # TypeScript 配置
│   └── vite-config/              # Vite 配置
│
├── docs/                          # 项目文档
├── scripts/                       # 部署脚本
├── docker-compose.yml             # Docker Compose 配置
├── Dockerfile.simple              # 简化版 Dockerfile
├── package.json                   # 根目录 package.json
└── pnpm-workspace.yaml           # pnpm 工作区配置
```

---

## 开发指南

### 启动开发服务器

```bash
# 启动 Web 应用开发服务器
pnpm dev

# 或指定应用
pnpm dev:play
```

开发服务器默认运行在 `http://localhost:5777`

### 目录规范

#### 1. 页面文件组织

页面组件放在 `apps/web-ele/src/views/` 目录下：

```
views/
├── _core/                 # 核心业务模块
│   ├── user/
│   │   ├── index.vue     # 页面入口
│   │   ├── data.ts       # 页面数据/状态
│   │   └── modules/      # 子组件
│   └── about/
├── dashboard/            # 仪表盘
└── fi/                   # FI 业务模块
```

#### 2. API 接口组织

API 接口放在 `apps/web-ele/src/api/` 目录下：

```typescript
// apps/web-ele/src/api/core/user.ts
import { request } from '../request';

export function getUserList(params: any) {
  return request.get('/users', { params });
}

export function createUser(data: any) {
  return request.post('/users', data);
}
```

#### 3. 组件开发

业务组件放在 `apps/web-ele/src/components/` 目录下：

```
components/
├── table/                # 封装表格组件
│   ├── src/
│   │   ├── Mytable.vue
│   │   ├── api.ts
│   │   ├── types.ts
│   │   └── use-table.ts
│   └── index.ts
└── dialog/               # 封装对话框组件
```

### 路由配置

路由文件位于 `apps/web-ele/src/router/`：

```typescript
// router/routes/modules/fi-task.ts
import type { RouteRecordRaw } from 'vue-router';

const fiTaskRoutes: RouteRecordRaw[] = [
  {
    path: '/fi/task',
    name: 'FiTask',
    component: () => import('@/views/fi/task/detail.vue'),
    meta: {
      title: '任务管理',
    },
  },
];

export default fiTaskRoutes;
```

### 状态管理

使用 Pinia 进行状态管理，Store 文件位于 `apps/web-ele/src/store/`：

```typescript
// apps/web-ele/src/store/auth.ts
import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: '',
    userInfo: null,
  }),
  actions: {
    setToken(token: string) {
      this.token = token;
    },
  },
});
```

### 国际化

语言包位于 `apps/web-ele/src/locales/langs/`：

```json
// zh-CN/user.json
{
  "list": "用户列表",
  "add": "新增用户",
  "edit": "编辑用户",
  "delete": "删除用户"
}
```

使用方式：

```vue
<script setup lang="ts">
import { useLocale } from '@/locales';

const { t } = useLocale();
</script>

<template>
  <span>{{ t('user.list') }}</span>
</template>
```

---

## 测试指南

### 单元测试

项目使用 Vitest 进行单元测试。

```bash
# 运行所有单元测试
pnpm test:unit

# 监听模式运行测试
pnpm test:unit --watch

# 生成覆盖率报告
pnpm test:unit --coverage
```

测试文件命名规范：`*.test.ts` 或 `*.spec.ts`

### 端到端测试 (E2E)

项目使用 Playwright 进行 E2E 测试。

```bash
# 运行 E2E 测试
pnpm test:e2e

# 交互模式运行
pnpm test:e2e --ui
```

### 代码检查

```bash
# 类型检查
pnpm check:type

# ESLint 检查
pnpm lint

# 格式化代码
pnpm format

# 完整检查 (包含循环依赖、依赖检查、类型检查、拼写检查)
pnpm check
```

---

## 部署指南

### 方式一：Docker 部署

#### 开发环境部署

```bash
# 使用部署脚本
./deploy.sh development

# 或手动执行
docker compose up -d
```

应用将运行在 `http://localhost:8080`

#### 生产环境部署

```bash
# 生产环境部署
./deploy.sh production --build

# 带 SSL 证书的生产环境
./deploy.sh production --build
```

#### SSL 证书配置

1. **自签名证书**（测试用）:
   ```bash
   # 部署脚本会自动生成
   ```

2. **Let's Encrypt 证书**:
   ```bash
   # 获取证书后复制到 ssl 目录
   cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ./ssl/cert.pem
   cp /etc/letsencrypt/live/your-domain.com/privkey.pem ./ssl/key.pem
   ```

### 方式二：手动构建部署

#### 1. 构建生产版本

```bash
# 安装依赖
pnpm install

# 构建
pnpm build:ele
```

构建产物位于 `apps/web-ele/dist/`

#### 2. 使用 Nginx 部署

```nginx
server {
    listen 8080;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://your-backend-api:8000;
    }
}
```

### 方式三：Docker Compose 生产配置

编辑 `docker-compose.prod.yml` 进行自定义配置：

```yaml
services:
  web-ele:
    build:
      context: .
      dockerfile: Dockerfile.simple
    ports:
      - "8080:8080"
    environment:
      - TZ=Asia/Shanghai
```

---

## 常用命令

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动开发服务器 |
| `pnpm build:ele` | 构建生产版本 |
| `pnpm build:analyze` | 构建并分析 bundle |
| `pnpm test:unit` | 运行单元测试 |
| `pnpm test:e2e` | 运行 E2E 测试 |
| `pnpm lint` | ESLint 检查 |
| `pnpm format` | 代码格式化 |
| `pnpm check:type` | TypeScript 类型检查 |
| `pnpm check` | 完整检查 |
| `pnpm changeset` | 管理版本变更 |
| `pnpm update:deps` | 更新依赖 |

---

## 开发规范

### Git 提交规范

项目使用 Commitlint 和 Changesets 管理提交：

```bash
# 交互式提交
pnpm commit

# 提交格式
<type>(<scope>): <subject>

# type 类型:
# - feat: 新功能
# - fix: 修复 bug
# - docs: 文档变更
# - style: 代码格式
# - refactor: 重构
# - perf: 性能优化
# - test: 测试
# - chore: 构建/工具
```

### 代码风格

- 使用 TypeScript 进行开发
- Vue 组件使用 `<script setup lang="ts">` 语法
- 样式优先使用 Tailwind CSS
- 使用 ESLint + Prettier 进行代码规范

### 分支管理

- `main`: 主分支
- `feature/*`: 功能分支
- `fix/*`: 修复分支
- `hotfix/*`: 紧急修复分支

### 工作流程

1. 从 `main` 创建功能分支
2. 开发并编写测试
3. 提交代码（使用 `pnpm commit`）
4. 创建 Pull Request
5. 代码审查后合并到 `main`

---

## 常见问题

### 1. 安装依赖失败

```bash
# 清理并重新安装
pnpm clean
pnpm install
```

### 2. 构建失败，内存不足

```bash
# 设置 Node.js 内存限制
export NODE_OPTIONS=--max-old-space-size=8192
pnpm build
```

### 3. Docker 构建失败

```bash
# 清理 Docker 缓存
docker builder prune

# 重新构建
./deploy.sh development --build
```

---

## 更多资源

- [Vue Vben Admin 官方文档](https://vben.pro/)
- [Vue 3 官方文档](https://vuejs.org/)
- [Element Plus 官方文档](https://element-plus.org/)
- [Vite 官方文档](https://vitejs.dev/)
- [Tailwind CSS 官方文档](https://tailwindcss.com/)

---

*文档最后更新: 2026-04-06*
