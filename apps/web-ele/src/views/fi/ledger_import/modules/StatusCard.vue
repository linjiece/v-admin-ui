<script setup lang="ts">
import { computed } from 'vue';

import {
  CircleCheck,
  CircleClose,
  Clock,
  Connection,
  Delete,
  Edit,
  Loading,
  MoreFilled,
  Timer,
  Warning,
} from '@element-plus/icons-vue';
import { ElButton, ElIcon, ElTag } from 'element-plus';

export type StatusType =
  | 'disabled'
  | 'draft'
  | 'error'
  | 'failed'
  | 'pending'
  | 'published'
  | 'running'
  | 'success'
  | 'warning';

interface Props {
  title: string;
  subtitle: string;
  description?: string;
  status?: StatusType;
  type?: string;
  category?: string;
  time?: string;
  isHovered?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  description: '',
  status: 'draft',
  type: '',
  category: '主应用',
  time: '',
  isHovered: false,
});

const emit = defineEmits<{
  click: [];
  delete: [];
  edit: [];
  more: [];
}>();

// 状态配置映射
const statusConfig: Record<
  StatusType,
  {
    bgColor: string;
    borderColor: string;
    color: string;
    icon: any;
    text: string;
    type: 'danger' | 'info' | 'primary' | 'success' | 'warning';
  }
> = {
  // 成功状态 - 绿色
  success: {
    text: '成功',
    type: 'success',
    color: '#67c23a',
    bgColor: '#f0f9eb',
    borderColor: '#67c23a',
    icon: CircleCheck,
  },
  published: {
    text: '已发布',
    type: 'success',
    color: '#67c23a',
    bgColor: '#f0f9eb',
    borderColor: '#67c23a',
    icon: CircleCheck,
  },

  // 失败/错误状态 - 红色
  failed: {
    text: '失败',
    type: 'danger',
    color: '#f56c6c',
    bgColor: '#fef0f0',
    borderColor: '#f56c6c',
    icon: CircleClose,
  },
  error: {
    text: '错误',
    type: 'danger',
    color: '#f56c6c',
    bgColor: '#fef0f0',
    borderColor: '#f56c6c',
    icon: CircleClose,
  },
  disabled: {
    text: '已停用',
    type: 'danger',
    color: '#f56c6c',
    bgColor: '#fef0f0',
    borderColor: '#f56c6c',
    icon: CircleClose,
  },

  // 进行中/运行中状态 - 黄色/橙色
  running: {
    text: '运行中',
    type: 'warning',
    color: '#e6a23c',
    bgColor: '#fdf6ec',
    borderColor: '#e6a23c',
    icon: Loading,
  },
  warning: {
    text: '警告',
    type: 'warning',
    color: '#e6a23c',
    bgColor: '#fdf6ec',
    borderColor: '#e6a23c',
    icon: Warning,
  },

  // 待处理状态 - 蓝色
  pending: {
    text: '待处理',
    type: 'primary',
    color: '#409eff',
    bgColor: '#ecf5ff',
    borderColor: '#409eff',
    icon: Timer,
  },

  // 草稿状态 - 灰色
  draft: {
    text: '草稿',
    type: 'info',
    color: '#909399',
    bgColor: '#f4f4f5',
    borderColor: '#909399',
    icon: Connection,
  },
};

const currentStatus = computed(
  () => statusConfig[props.status] || statusConfig.draft,
);

const statusText = computed(() => currentStatus.value.text);
const statusType = computed(() => currentStatus.value.type);
const statusColor = computed(() => currentStatus.value.color);
const statusIcon = computed(() => currentStatus.value.icon);

// 图标背景样式
const iconStyle = computed(() => ({
  background: `linear-gradient(135deg, ${currentStatus.value.bgColor} 0%, ${currentStatus.value.color}20 100%)`,
}));

// 卡片悬停边框样式
const cardStyle = computed(() => ({
  '--hover-border-color': currentStatus.value.borderColor,
  '--hover-shadow-color': `${currentStatus.value.color}30`,
}));

const handleCardClick = () => {
  emit('click');
  emit('edit');
};
const handleEdit = () => emit('edit');
const handleDelete = () => emit('delete');
const handleMore = () => emit('more');
</script>

<template>
  <div
    class="app-card"
    :class="[`is-${status}`, { 'is-hover': isHovered }]"
    :style="cardStyle"
    @click="handleCardClick"
  >
    <!-- 头部 -->
    <div class="app-card__header">
      <div class="app-card__icon" :style="iconStyle">
        <slot name="icon">
          <ElIcon :size="24" :color="statusColor">
            <component :is="statusIcon" />
          </ElIcon>
        </slot>
      </div>
      <div class="app-card__title-wrap">
        <div class="app-card__title">{{ title }}</div>
        <div class="app-card__subtitle">{{ subtitle }}</div>
      </div>
      <div class="app-card__actions">
        <slot name="actions">
          <ElButton type="primary" text :icon="Edit" @click.stop="handleEdit" />
          <ElButton
            type="danger"
            text
            :icon="Delete"
            @click.stop="handleDelete"
          />
          <ElButton
            type="info"
            text
            :icon="MoreFilled"
            @click.stop="handleMore"
          />
        </slot>
      </div>
    </div>

    <!-- 内容 -->
    <div class="app-card__body">
      <slot name="description">
        <p class="app-card__desc">{{ description || '暂无描述' }}</p>
      </slot>
    </div>

    <!-- 底部 -->
    <div class="app-card__footer">
      <div class="app-card__tags">
        <ElTag :type="statusType" size="small" effect="light">
          {{ statusText }}
        </ElTag>
        <ElTag v-if="type" type="info" size="small" effect="plain">
          {{ type }}
        </ElTag>
      </div>
      <span class="app-card__category">{{ category }}</span>
    </div>

    <!-- 时间 -->
    <div class="app-card__time">
      <ElIcon size="12"><Clock /></ElIcon>
      <span>{{ time }}</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.app-card {
  padding: 16px;
  cursor: pointer;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgb(0 0 0 / 6%);
  transition: all 0.3s ease;

  &:hover,
  &.is-hover {
    border-color: var(--hover-border-color, #409eff);
    box-shadow: 0 4px 12px var(--hover-shadow-color, rgb(64 158 255 / 20%));
    transform: translateY(-2px);

    .app-card__actions {
      visibility: visible;
      opacity: 1;
    }
  }

  &__header {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    margin-bottom: 12px;
  }

  &__icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 8px;
    transition: all 0.3s ease;
  }

  &__title-wrap {
    flex: 1;
    min-width: 0;
  }

  &__title {
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 16px;
    font-weight: 600;
    line-height: 1.4;
    color: #303133;
    white-space: nowrap;
  }

  &__subtitle {
    margin-top: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    font-family: monospace;
    font-size: 12px;
    color: #909399;
    white-space: nowrap;
  }

  &__actions {
    display: flex;
    visibility: hidden;
    gap: 4px;
    margin-left: auto;
    opacity: 0;
    transition: all 0.3s ease;

    :deep(.el-button) {
      width: 28px;
      height: 28px;
      padding: 4px;
    }
  }

  &__body {
    margin-bottom: 12px;
  }

  &__desc {
    display: -webkit-box;
    min-height: 40px;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    -webkit-line-clamp: 2;
    font-size: 13px;
    line-height: 1.5;
    color: #909399;
    -webkit-box-orient: vertical;
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  &__tags {
    display: flex;
    gap: 8px;
  }

  &__category {
    font-size: 12px;
    color: #606266;
  }

  &__time {
    display: flex;
    gap: 6px;
    align-items: center;
    padding-top: 8px;
    font-size: 12px;
    color: #c0c4cc;
    border-top: 1px solid #ebeef5;

    .el-icon {
      color: #c0c4cc;
    }
  }

  // 运行中状态的旋转动画
  &.is-running,
  &.is-pending {
    .app-card__icon {
      :deep(.el-icon) {
        animation: rotate 2s linear infinite;
      }
    }
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
