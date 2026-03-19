<script setup lang="ts">
import type { WebSocketApi } from '#/api/core/websocket';

import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Page } from '@vben/common-ui';
import {
  ArrowLeft,
  ArrowRightToLine,
  Check,
  ElRefresh,
  Play,
} from '@vben/icons';

import { ElButton, ElCard, ElMessage, ElTag } from 'element-plus';

import { createWebSocket } from '#/api/core/websocket';
import { executeTask, getTask, getTaskDAG } from '#/api/fi/task';

interface TaskDAGNode {
  step_code: string;
  step_name: string;
  layer: number;
  status: string;
  prev: string[];
  next: string[];
}

const route = useRoute();
const router = useRouter();

const taskId = String(route.params.taskId ?? '');

const dagNodes = ref<TaskDAGNode[]>([]);
const logRows = ref<string[]>([]);
const wsStatus = ref<'CLOSED' | 'CLOSING' | 'CONNECTING' | 'OPEN'>('CLOSED');
const isExecuting = ref(false);
const isLoading = ref(false);
const taskName = ref('');

let wsManager: null | ReturnType<typeof createWebSocket> = null;

const orderedNodes = computed(() => {
  return [...dagNodes.value].sort(
    (a, b) => a.layer - b.layer || a.step_code.localeCompare(b.step_code),
  );
});

function appendLog(message: string) {
  const formatted = `${new Date().toLocaleTimeString()} - ${message}`;
  logRows.value.push(formatted);
  // 最多保留1000行
  if (logRows.value.length > 1000) {
    logRows.value.splice(0, logRows.value.length - 1000);
  }
  // 下拉到最新
  setTimeout(() => {
    const logArea = document.querySelector('#task-log-output');
    if (logArea) {
      logArea.scrollTop = logArea.scrollHeight;
    }
  });
}

async function loadTaskInfo() {
  isLoading.value = true;
  try {
    const task = await getTask(taskId);
    taskName.value = task.task_name || `任务 ${taskId}`;
  } catch (error) {
    console.warn('无法获取任务信息', error);
    taskName.value = `任务 ${taskId}`;
  } finally {
    isLoading.value = false;
  }
}

async function loadDAG() {
  try {
    const dag = await getTaskDAG(taskId);
    dagNodes.value = dag.nodes.map((node) => ({
      step_code: node.step_code,
      step_name: node.step_name,
      layer: node.layer,
      status: node.status,
      prev: node.prev || [],
      next: node.next || [],
    }));
  } catch (error) {
    console.error('工作流节点加载失败', error);
    ElMessage.error('工作流节点加载失败，请稍后重试');
  }
}

function statusColor(status: string) {
  const mapping: Record<string, string> = {
    SUCCESS: 'success',
    RUNNING: 'warning',
    PENDING: 'info',
    FAILED: 'danger',
    CANCELLED: 'info',
  };
  return mapping[status.toUpperCase()] ?? 'info';
}

function goBack() {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push('/fi');
  }
}

function confirmTask() {
  ElMessage.success('已确认工作流信息');
}

function createTaskLogSocket() {
  if (wsManager && wsManager.isConnected) {
    return;
  }

  wsStatus.value = 'CONNECTING';
  wsManager = createWebSocket(
    `/ws/fi/task/${encodeURIComponent(taskId)}/logs`,
    {
      onOpen: () => {
        wsStatus.value = 'OPEN';
        appendLog('已连接到任务日志 WebSocket');
      },
      onMessage: (message: WebSocketApi.WebSocketMessage) => {
        const content =
          message.content ?? message.data ?? JSON.stringify(message);
        appendLog(String(content));
      },
      onError: (event) => {
        appendLog(`WebSocket 错误: ${event?.type ?? ''}`);
        wsStatus.value = 'CLOSED';
      },
      onClose: () => {
        appendLog('WebSocket 已关闭');
        wsStatus.value = 'CLOSED';
      },
      onReconnect: (attempt) => {
        appendLog(`WebSocket 重连中，第 ${attempt} 次`);
        wsStatus.value = 'CONNECTING';
      },
    },
  );

  wsManager.connect().catch((error) => {
    wsStatus.value = 'CLOSED';
    appendLog(`WebSocket 连接失败：${error?.message ?? error}`);
  });
}

async function startExecution() {
  if (isExecuting.value) {
    return;
  }

  isExecuting.value = true;
  appendLog('开始执行工作流...');

  try {
    createTaskLogSocket();
    const resp = await executeTask(taskId);
    appendLog(`执行接口响应: ${JSON.stringify(resp)}`);
  } catch (error) {
    console.error('执行失败', error);
    appendLog(`执行失败: ${error?.message ?? error}`);
    ElMessage.error('执行失败，请重试');
  } finally {
    isExecuting.value = false;
  }
}

function closeWebSocket() {
  if (wsManager) {
    wsManager.close();
    wsManager = null;
  }
  wsStatus.value = 'CLOSED';
}

function refreshLogs() {
  appendLog('手动刷新日志');
}

onMounted(() => {
  if (!taskId) {
    ElMessage.error('任务ID未提供');
    return;
  }

  loadTaskInfo();
  loadDAG();
});

onUnmounted(() => {
  closeWebSocket();
});
</script>

<template>
  <Page>
    <ElCard shadow="never" class="task-panel">
      <div class="header-actions">
        <ElButton type="primary" text icon="" @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回父级菜单
        </ElButton>

        <div class="header-right-actions">
          <span class="status-chip">{{ taskName }}</span>
          <ElButton type="success" icon="" @click="confirmTask">
            <el-icon><Check /></el-icon>
            确认
          </ElButton>
        </div>
      </div>

      <div class="workflow-section">
        <div class="workflow-title">工作流节点</div>
        <div class="workflow-bar">
          <div
            v-for="(node, index) in orderedNodes"
            :key="node.step_code"
            class="workflow-node"
          >
            <div class="workflow-node-body">
              <div class="node-name">{{ node.step_name }}</div>
              <ElTag :type="statusColor(node.status)">
                {{ node.status }}
              </ElTag>
            </div>
            <div v-if="index < orderedNodes.length - 1" class="arrow-icon">
              <el-icon><ArrowRightToLine /></el-icon>
            </div>
          </div>
        </div>
      </div>

      <div class="log-section">
        <div class="log-header">
          <span>日志输出</span>
          <ElButton type="text" size="small" icon="" @click="refreshLogs">
            <el-icon><ElRefresh /></el-icon>
            刷新
          </ElButton>
          <ElTag size="small" type="success">WS {{ wsStatus }}</ElTag>
        </div>
        <pre id="task-log-output" class="log-content">{{
          logRows.join('\n') || '暂无日志'
        }}</pre>
      </div>

      <div class="footer-actions">
        <div class="run-status">
          <ElTag type="info" size="small">
            执行状态: {{ isExecuting ? '执行中' : '空闲' }}
          </ElTag>
        </div>
        <ElButton
          type="primary"
          icon=""
          @click="startExecution"
          :disabled="isExecuting"
        >
          <el-icon><Play /></el-icon>
          执行
        </ElButton>
      </div>
    </ElCard>
  </Page>
</template>

<style scoped>
.task-panel {
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-height: 75vh;
}

.header-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-right-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.status-chip {
  margin-right: 12px;
  font-weight: 600;
}

.workflow-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.workflow-title {
  font-weight: 600;
}

.workflow-bar {
  display: flex;
  align-items: center;
  padding: 10px;
  overflow-x: auto;
  background-color: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
}

.workflow-node {
  display: flex;
  gap: 12px;
  align-items: center;
}

.workflow-node-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 120px;
  padding: 10px;
  text-align: center;
  background: var(--el-color-white);
  border: 1px solid #dcdfe6;
  border-radius: 6px;
}

.node-name {
  margin-bottom: 6px;
  font-weight: bold;
}

.arrow-icon {
  display: flex;
  align-items: center;
  padding: 0 4px;
}

.log-section {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 8px;
  min-height: 350px;
}

.log-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: bold;
}

.log-content {
  flex: 1;
  min-height: 300px;
  padding: 12px;
  margin: 0;
  overflow-y: auto;
  color: #e5e5e5;
  word-break: break-word;
  white-space: pre-wrap;
  background: #121212;
  border-radius: 6px;
}

.footer-actions {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: flex-end;
}

.run-status {
  display: flex;
  align-items: center;
}
</style>
