# VBEN Admin Docker 部署指南

本文档介绍如何使用 Docker 容器化部署 VBEN Admin 项目。

## 快速开始

### 1. 前置要求

- Docker Engine 20.10+
- Docker Compose 2.0+ (推荐使用 `docker compose` 插件格式)
- 至少 2GB 可用内存
- 10GB 可用磁盘空间

#### Docker Compose 版本说明

从 2021 年开始，Docker 推荐使用新的 `docker compose` 插件格式（空格分隔）替代传统的 `docker-compose` 命令：

```bash
# 推荐的新格式（Docker Compose v2+）
docker compose up -d

# 传统的格式（仍然支持）
docker-compose up -d
```

本项目已更新支持最新的 `docker compose` 格式，同时保持对传统格式的兼容性。deploy.sh 脚本会自动检测可用的 Docker Compose 版本并使用合适的命令。

### 2. 部署步骤

#### 开发环境部署

```bash
# 克隆项目
git clone https://github.com/vbenjs/vue-vben-admin.git
cd vue-vben-admin

# 运行部署脚本
./deploy.sh development
```

#### 生产环境部署

```bash
# 生产环境部署（包含SSL和反向代理）
./deploy.sh production --build
```

### 3. 访问应用

- **开发环境**: http://localhost:8080
- **生产环境**: https://localhost (需要配置SSL证书)

## 详细配置

### Docker Compose 配置

#### 开发环境 (`docker-compose.yml`)

- 单服务部署
- 端口映射: 8080
- 包含健康检查
- 自动重启策略

#### 生产环境 (`docker-compose.prod.yml`)

- 多服务部署（应用 + Nginx反向代理）
- SSL/TLS 支持
- 资源限制
- 安全加固
- 日志管理

### 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| TZ | 时区设置 | Asia/Shanghai |
| NODE_ENV | Node.js环境 | production |

### 卷挂载

- `./logs/nginx`: Nginx访问日志
- `./ssl`: SSL证书文件（生产环境）

### 端口映射

| 服务 | 容器端口 | 主机端口 | 说明 |
|------|----------|----------|------|
| web-ele | 8080 | 8080 | 应用服务 |
| nginx-proxy | 80 | 80 | HTTP代理 |
| nginx-proxy | 443 | 443 | HTTPS代理 |

## SSL证书配置

### 生产环境SSL

1. **使用自有证书**:
   ```bash
   # 将证书文件复制到ssl目录
   cp your-cert.pem ./ssl/cert.pem
   cp your-key.pem ./ssl/key.pem
   ```

2. **使用Let's Encrypt**:
   ```bash
   # 安装certbot
   sudo apt-get install certbot

   # 获取证书
   sudo certbot certonly --standalone -d your-domain.com

   # 复制证书到ssl目录
   sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ./ssl/cert.pem
   sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ./ssl/key.pem
   ```

3. **使用自签名证书**（测试用）:
   ```bash
   openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
     -keyout ./ssl/key.pem \
     -out ./ssl/cert.pem \
     -subj "/C=CN/ST=Beijing/L=Beijing/O=VBEN/CN=localhost"
   ```

## 部署脚本使用

### 基本用法

```bash
./deploy.sh [环境] [选项]
```

### 参数说明

- **环境**: `development` 或 `production`
- **选项**:
  - `--build, -b`: 强制重新构建镜像
  - `--clean, -c`: 清理所有容器和卷
  - `--help, -h`: 显示帮助信息

### 示例

```bash
# 开发环境部署
./deploy.sh development

# 生产环境部署并重新构建
./deploy.sh production --build

# 清理并重新部署
./deploy.sh development --clean --build
```

## 监控和维护

### 查看日志

```bash
# 查看所有服务日志（使用最新插件版本）
docker compose logs -f

# 或者使用传统版本
docker-compose logs -f

# 查看特定服务日志
docker compose logs -f web-ele

# 查看Nginx访问日志
tail -f logs/nginx/access.log
```

### 健康检查

```bash
# 检查服务状态
docker compose ps

# 健康检查curl
curl -f http://localhost:8080/health || echo "服务异常"
```

### 性能监控

```bash
# 查看容器资源使用
docker stats

# 查看容器详情
docker inspect v-app-ui
```

## 故障排除

### 常见问题

1. **端口占用**
   ```bash
   # 检查端口占用
   netstat -tulpn | grep :8080
   
   # 修改端口映射
   # 编辑 docker-compose.yml 中的 ports 部分
   ```

2. **构建失败**
   ```bash
   # 清理构建缓存
   docker system prune
   
   # 重新构建
   ./deploy.sh development --build
   ```

3. **内存不足**
   ```bash
   # 增加Docker内存限制
   # 编辑 docker-compose.prod.yml 中的 deploy.resources 部分
   ```

4. **SSL证书问题**
   ```bash
   # 检查证书有效期
   openssl x509 -in ssl/cert.pem -noout -dates
   
   # 重新生成证书
   ./deploy.sh production --build
   ```

### 调试模式

```bash
# 进入容器调试
docker exec -it v-app-ui /bin/sh

# 查看容器环境变量
docker exec v-app-ui env

# 测试网络连接
docker exec v-app-ui wget -O- http://localhost:8080
```

## 性能优化

### 构建优化

1. **使用多阶段构建**: Dockerfile已配置多阶段构建
2. **缓存优化**: 使用BuildKit缓存挂载
3. **镜像瘦身**: 使用slim基础镜像

### 运行时优化

1. **资源限制**: 生产环境配置CPU和内存限制
2. **健康检查**: 配置合理的健康检查参数
3. **日志轮转**: 配置日志文件轮转

### Nginx优化

1. **Gzip压缩**: 已启用文本资源压缩
2. **缓存策略**: 配置静态资源缓存
3. **连接优化**: 启用HTTP/2和keepalive

## 安全建议

### 容器安全

1. **使用非root用户**: 生产环境使用nginx用户
2. **只读文件系统**: 生产环境启用只读模式
3. **安全选项**: 启用no-new-privileges

### 网络安全

1. **SSL/TLS**: 生产环境强制HTTPS
2. **安全头**: 配置安全响应头
3. **CORS**: 合理配置跨域策略

### 访问控制

1. **防火墙**: 配置服务器防火墙规则
2. **反向代理**: 使用Nginx作为反向代理
3. **限流**: 配置请求频率限制

## 更新和升级

### 应用更新

```bash
# 拉取最新代码
git pull origin main

# 重新构建和部署
./deploy.sh production --build
```

### 基础镜像更新

```bash
# 拉取最新基础镜像
docker pull node:22-slim
docker pull nginx:stable-alpine

# 重新构建
./deploy.sh production --build
```

### 滚动更新

```bash
# 零停机更新
docker compose -f docker-compose.prod.yml up -d --no-deps --build web-ele
```

## 备份和恢复

### 数据备份

```bash
# 备份日志
tar -czf logs-backup-$(date +%Y%m%d).tar.gz logs/

# 备份SSL证书
tar -czf ssl-backup-$(date +%Y%m%d).tar.gz ssl/
```

### 配置备份

```bash
# 备份配置文件
tar -czf config-backup-$(date +%Y%m%d).tar.gz \
  docker-compose*.yml \
  nginx-proxy.conf \
  Dockerfile*
```

## 多环境部署

### 环境配置

| 环境 | 配置文件 | 域名 | SSL |
|------|----------|------|-----|
| 开发 | docker-compose.yml | localhost | 否 |
| 测试 | docker-compose.test.yml | test.example.com | 是 |
| 生产 | docker-compose.prod.yml | app.example.com | 是 |

### 环境变量管理

```bash
# 创建环境变量文件
cp .env.example .env.production

# 编辑环境变量
vim .env.production

# 使用环境变量部署
docker compose -f docker-compose.prod.yml --env-file .env.production up -d
```

## 相关命令

### Docker Compose命令

```bash
# 启动服务（使用最新插件版本）
docker compose up -d

# 或者使用传统版本
docker-compose up -d

# 停止服务
docker compose down

# 重启服务
docker compose restart

# 查看状态
docker compose ps

# 查看日志
docker compose logs -f

# 重新构建
docker compose build --no-cache

# 拉取镜像
docker compose pull
```

### 系统命令

```bash
# 查看系统资源
docker system df
docker system info

# 清理无用数据
docker system prune -a

# 查看容器日志
docker logs -f v-app-ui

# 进入容器
docker exec -it v-app-ui /bin/sh
```

## 获取更多帮助

- [Docker官方文档](https://docs.docker.com/)
- [Docker Compose官方文档](https://docs.docker.com/compose/)
- [VBEN Admin项目主页](https://github.com/vbenjs/vue-vben-admin)
- [Nginx官方文档](https://nginx.org/en/docs/)

---

如有问题，请提交 [Issue](https://github.com/vbenjs/vue-vben-admin/issues)。# VBEN Admin Docker 部署指南

本文档介绍如何使用 Docker 容器化部署 VBEN Admin 项目。

## 快速开始

### 1. 前置要求

- Docker Engine 20.10+
- Docker Compose 2.0+
- 至少 2GB 可用内存
- 10GB 可用磁盘空间

### 2. 部署步骤

#### 开发环境部署

```bash
# 克隆项目
git clone https://github.com/vbenjs/vue-vben-admin.git
cd vue-vben-admin

# 运行部署脚本
./deploy.sh development
```

#### 生产环境部署

```bash
# 生产环境部署（包含SSL和反向代理）
./deploy.sh production --build
```

### 3. 访问应用

- **开发环境**: http://localhost:8080
- **生产环境**: https://localhost (需要配置SSL证书)

## 详细配置

### Docker Compose 配置

#### 开发环境 (`docker-compose.yml`)

- 单服务部署
- 端口映射: 8080
- 包含健康检查
- 自动重启策略

#### 生产环境 (`docker-compose.prod.yml`)

- 多服务部署（应用 + Nginx反向代理）
- SSL/TLS 支持
- 资源限制
- 安全加固
- 日志管理

### 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| TZ | 时区设置 | Asia/Shanghai |
| NODE_ENV | Node.js环境 | production |

### 卷挂载

- `./logs/nginx`: Nginx访问日志
- `./ssl`: SSL证书文件（生产环境）

### 端口映射

| 服务 | 容器端口 | 主机端口 | 说明 |
|------|----------|----------|------|
| web-ele | 8080 | 8080 | 应用服务 |
| nginx-proxy | 80 | 80 | HTTP代理 |
| nginx-proxy | 443 | 443 | HTTPS代理 |

## SSL证书配置

### 生产环境SSL

1. **使用自有证书**:
   ```bash
   # 将证书文件复制到ssl目录
   cp your-cert.pem ./ssl/cert.pem
   cp your-key.pem ./ssl/key.pem
   ```

2. **使用Let's Encrypt**:
   ```bash
   # 安装certbot
   sudo apt-get install certbot

   # 获取证书
   sudo certbot certonly --standalone -d your-domain.com

   # 复制证书到ssl目录
   sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ./ssl/cert.pem
   sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ./ssl/key.pem
   ```

3. **使用自签名证书**（测试用）:
   ```bash
   openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
     -keyout ./ssl/key.pem \
     -out ./ssl/cert.pem \
     -subj "/C=CN/ST=Beijing/L=Beijing/O=VBEN/CN=localhost"
   ```

## 部署脚本使用

### 基本用法

```bash
./deploy.sh [环境] [选项]
```

### 参数说明

- **环境**: `development` 或 `production`
- **选项**:
  - `--build, -b`: 强制重新构建镜像
  - `--clean, -c`: 清理所有容器和卷
  - `--help, -h`: 显示帮助信息

### 示例

```bash
# 开发环境部署
./deploy.sh development

# 生产环境部署并重新构建
./deploy.sh production --build

# 清理并重新部署
./deploy.sh development --clean --build
```

## 监控和维护

### 查看日志

```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f web-ele

# 查看Nginx访问日志
tail -f logs/nginx/access.log
```

### 健康检查

```bash
# 检查服务状态
docker-compose ps

# 健康检查curl
curl -f http://localhost:8080/health || echo "服务异常"
```

### 性能监控

```bash
# 查看容器资源使用
docker stats

# 查看容器详情
docker inspect v-app-ui
```

## 故障排除

### 常见问题

1. **端口占用**
   ```bash
   # 检查端口占用
   netstat -tulpn | grep :8080
   
   # 修改端口映射
   # 编辑 docker-compose.yml 中的 ports 部分
   ```

2. **构建失败**
   ```bash
   # 清理构建缓存
   docker system prune
   
   # 重新构建
   ./deploy.sh development --build
   ```

3. **内存不足**
   ```bash
   # 增加Docker内存限制
   # 编辑 docker-compose.prod.yml 中的 deploy.resources 部分
   ```

4. **SSL证书问题**
   ```bash
   # 检查证书有效期
   openssl x509 -in ssl/cert.pem -noout -dates
   
   # 重新生成证书
   ./deploy.sh production --build
   ```

### 调试模式

```bash
# 进入容器调试
docker exec -it v-app-ui /bin/sh

# 查看容器环境变量
docker exec v-app-ui env

# 测试网络连接
docker exec v-app-ui wget -O- http://localhost:8080
```

## 性能优化

### 构建优化

1. **使用多阶段构建**: Dockerfile已配置多阶段构建
2. **缓存优化**: 使用BuildKit缓存挂载
3. **镜像瘦身**: 使用slim基础镜像

### 运行时优化

1. **资源限制**: 生产环境配置CPU和内存限制
2. **健康检查**: 配置合理的健康检查参数
3. **日志轮转**: 配置日志文件轮转

### Nginx优化

1. **Gzip压缩**: 已启用文本资源压缩
2. **缓存策略**: 配置静态资源缓存
3. **连接优化**: 启用HTTP/2和keepalive

## 安全建议

### 容器安全

1. **使用非root用户**: 生产环境使用nginx用户
2. **只读文件系统**: 生产环境启用只读模式
3. **安全选项**: 启用no-new-privileges

### 网络安全

1. **SSL/TLS**: 生产环境强制HTTPS
2. **安全头**: 配置安全响应头
3. **CORS**: 合理配置跨域策略

### 访问控制

1. **防火墙**: 配置服务器防火墙规则
2. **反向代理**: 使用Nginx作为反向代理
3. **限流**: 配置请求频率限制

## 更新和升级

### 应用更新

```bash
# 拉取最新代码
git pull origin main

# 重新构建和部署
./deploy.sh production --build
```

### 基础镜像更新

```bash
# 拉取最新基础镜像
docker pull node:22-slim
docker pull nginx:stable-alpine

# 重新构建
./deploy.sh production --build
```

### 滚动更新

```bash
# 零停机更新
docker-compose -f docker-compose.prod.yml up -d --no-deps --build web-ele
```

## 备份和恢复

### 数据备份

```bash
# 备份日志
tar -czf logs-backup-$(date +%Y%m%d).tar.gz logs/

# 备份SSL证书
tar -czf ssl-backup-$(date +%Y%m%d).tar.gz ssl/
```

### 配置备份

```bash
# 备份配置文件
tar -czf config-backup-$(date +%Y%m%d).tar.gz \
  docker-compose*.yml \
  nginx-proxy.conf \
  Dockerfile*
```

## 多环境部署

### 环境配置

| 环境 | 配置文件 | 域名 | SSL |
|------|----------|------|-----|
| 开发 | docker-compose.yml | localhost | 否 |
| 测试 | docker-compose.test.yml | test.example.com | 是 |
| 生产 | docker-compose.prod.yml | app.example.com | 是 |

### 环境变量管理

```bash
# 创建环境变量文件
cp .env.example .env.production

# 编辑环境变量
vim .env.production

# 使用环境变量部署
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d
```

## 相关命令

### Docker Compose命令

```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 查看状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 重新构建
docker-compose build --no-cache

# 拉取镜像
docker-compose pull
```

### 系统命令

```bash
# 查看系统资源
docker system df
docker system info

# 清理无用数据
docker system prune -a

# 查看容器日志
docker logs -f v-app-ui

# 进入容器
docker exec -it v-app-ui /bin/sh
```

## 获取更多帮助

- [Docker官方文档](https://docs.docker.com/)
- [Docker Compose官方文档](https://docs.docker.com/compose/)
- [VBEN Admin项目主页](https://github.com/vbenjs/vue-vben-admin)
- [Nginx官方文档](https://nginx.org/en/docs/)

---

如有问题，请提交 [Issue](https://github.com/vbenjs/vue-vben-admin/issues)。
