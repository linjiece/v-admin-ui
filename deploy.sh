#!/bin/bash

# VBEN Admin Docker 部署脚本
set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 默认配置
ENVIRONMENT=${1:-development}
COMPOSE_FILE="docker-compose.yml"
SSL_DIR="./ssl"
LOGS_DIR="./logs"

# 帮助信息
show_help() {
    echo -e "${BLUE}VBEN Admin Docker 部署脚本${NC}"
    echo -e "${YELLOW}用法:${NC} $0 [环境] [选项]"
    echo -e "${YELLOW}环境:${NC}"
    echo "  development  - 开发环境 (默认)"
    echo "  production   - 生产环境"
    echo -e "${YELLOW}选项:${NC}"
    echo "  --help, -h   - 显示帮助信息"
    echo "  --build, -b  - 强制重新构建镜像"
    echo "  --clean, -c  - 清理所有容器和卷"
    echo ""
    echo -e "${YELLOW}示例:${NC}"
    echo "  $0 production --build"
    echo "  $0 development"
    exit 0
}

# 解析参数
FORCE_BUILD=false
CLEAN=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --help|-h)
            show_help
            ;;
        --build|-b)
            FORCE_BUILD=true
            shift
            ;;
        --clean|-c)
            CLEAN=true
            shift
            ;;
        *)
            shift
            ;;
    esac
done

# 检查Docker和Docker Compose
check_dependencies() {
    echo -e "${BLUE}检查依赖...${NC}"
    
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}错误: Docker 未安装${NC}"
        exit 1
    fi
    
    if docker compose version &> /dev/null; then
        DOCKER_COMPOSE_CMD="docker compose"
        echo -e "${GREEN}✓ 使用 Docker Compose 插件${NC}"
    else
        DOCKER_COMPOSE_CMD="docker-compose"
        echo -e "${GREEN}✓ 使用 Docker Compose 独立版本${NC}"
    fi
    
    echo -e "${GREEN}✓ 依赖检查通过${NC}"
}

# 创建必要的目录
create_directories() {
    echo -e "${BLUE}创建必要的目录...${NC}"
    
    mkdir -p "$LOGS_DIR"
    mkdir -p "$LOGS_DIR/nginx"
    
    if [ "$ENVIRONMENT" = "production" ]; then
        mkdir -p "$SSL_DIR"
        mkdir -p "$LOGS_DIR/proxy"
        
        # 检查SSL证书
        if [ ! -f "$SSL_DIR/cert.pem" ] || [ ! -f "$SSL_DIR/key.pem" ]; then
            echo -e "${YELLOW}警告: SSL 证书未找到，将使用自签名证书${NC}"
            echo -e "${BLUE}生成自签名SSL证书...${NC}"
            
            openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
                -keyout "$SSL_DIR/key.pem" \
                -out "$SSL_DIR/cert.pem" \
                -subj "/C=CN/ST=Beijing/L=Beijing/O=VBEN/CN=localhost"
        fi
    fi
    
    echo -e "${GREEN}✓ 目录创建完成${NC}"
}

# 选择Docker Compose文件
select_compose_file() {
    if [ "$ENVIRONMENT" = "production" ]; then
        COMPOSE_FILE="docker-compose.prod.yml"
        echo -e "${BLUE}使用生产环境配置${NC}"
    else
        COMPOSE_FILE="docker-compose.yml"
        echo -e "${BLUE}使用开发环境配置${NC}"
    fi
    
    if [ ! -f "$COMPOSE_FILE" ]; then
        echo -e "${RED}错误: Docker Compose 文件 $COMPOSE_FILE 不存在${NC}"
        exit 1
    fi
}

# 清理操作
clean_containers() {
    if [ "$CLEAN" = true ]; then
        echo -e "${BLUE}清理容器和卷...${NC}"
        $DOCKER_COMPOSE_CMD -f "$COMPOSE_FILE" down -v --remove-orphans
        docker system prune -f
        echo -e "${GREEN}✓ 清理完成${NC}"
    fi
}

# 构建和部署
deploy() {
    echo -e "${BLUE}开始部署 VBEN Admin...${NC}"
    
    # 构建选项
    BUILD_OPTS=""
    if [ "$FORCE_BUILD" = true ]; then
        BUILD_OPTS="--build --no-cache"
        echo -e "${YELLOW}强制重新构建镜像${NC}"
    fi
    
    # 拉取最新镜像
    echo -e "${BLUE}拉取基础镜像...${NC}"
    $DOCKER_COMPOSE_CMD -f "$COMPOSE_FILE" pull
    
    # 构建和启动服务
    echo -e "${BLUE}构建和启动服务...${NC}"
    $DOCKER_COMPOSE_CMD -f "$COMPOSE_FILE" up -d $BUILD_OPTS
    
    # 等待服务启动
    echo -e "${BLUE}等待服务启动...${NC}"
    sleep 10
    
    # 检查服务状态
    echo -e "${BLUE}检查服务状态...${NC}"
    if $DOCKER_COMPOSE_CMD -f "$COMPOSE_FILE" ps | grep -q "Up"; then
        echo -e "${GREEN}✓ 服务启动成功${NC}"
        
        # 显示访问信息
        echo -e "${BLUE}访问信息:${NC}"
        if [ "$ENVIRONMENT" = "production" ]; then
            echo -e "${GREEN}Web 应用: https://localhost${NC}"
            echo -e "${GREEN}Nginx 代理: https://localhost${NC}"
        else
            echo -e "${GREEN}Web 应用: http://localhost:8080${NC}"
        fi
        
        # 显示日志命令
        echo -e "${BLUE}查看日志:${NC}"
        echo -e "${YELLOW}$DOCKER_COMPOSE_CMD -f $COMPOSE_FILE logs -f${NC}"
        
    else
        echo -e "${RED}✗ 服务启动失败${NC}"
        echo -e "${YELLOW}查看错误日志:${NC}"
        echo -e "${YELLOW}$DOCKER_COMPOSE_CMD -f $COMPOSE_FILE logs${NC}"
        exit 1
    fi
}

# 显示状态
show_status() {
    echo -e "${BLUE}服务状态:${NC}"
    $DOCKER_COMPOSE_CMD -f "$COMPOSE_FILE" ps
}

# 主函数
main() {
    echo -e "${BLUE}=== VBEN Admin Docker 部署脚本 ===${NC}"
    echo -e "${YELLOW}环境: $ENVIRONMENT${NC}"
    echo ""
    
    check_dependencies
    create_directories
    select_compose_file
    clean_containers
    deploy
    show_status
    
    echo -e "${GREEN}✓ 部署完成!${NC}"
}

# 执行主函数
main
