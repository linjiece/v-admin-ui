<script setup lang="ts">
import type { WebSocketApi } from '#/api/core/websocket';

import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import {
  ArrowLeft,
  Check,
  CheckCircle,
  ChevronRight,
  Circle,
  FileText,
  Loader,
  Terminal,
  X,
} from '@vben/icons';

import { ElBadge, ElButton, ElCard, ElMessage } from 'element-plus';

import { createLedgerImportWebSocket } from '#/api/core/websocket';
import { confirmTask, getTask, getTaskDAG } from '#/api/fi/task';

interface TaskDAGNode {
  step_code: string;
  step_name: string;
  layer: number;
  status: string;
  prev: string[];
  next: string[];
}
interface LogEntry {
  time: string;
  level: 'ERROR' | 'INFO' | 'SUCCESS' | 'WARN';
  message: string;
  executor: string;
}

interface RawLogMessage {
  type: string;
  message: string;
  timestamp: string;
  data?: Record<string, any>;
}

const route = useRoute();
const router = useRouter();

const taskId = String(route.params.taskId ?? '');

const dagNodes = ref<TaskDAGNode[]>([]);
const logRows = ref<LogEntry[]>([]);
const wsStatus = ref<'CLOSED' | 'CLOSING' | 'CONNECTING' | 'OPEN'>('CLOSED');
const isExecuting = ref(false);
const isLoading = ref(false);
const taskName = ref('');
const taskStatus = ref<string>('INIT');
const logContainer = ref<HTMLElement>();

const canConfirm = computed(() => taskStatus.value === 'INIT');
const canExecute = computed(() => taskStatus.value === 'PENDING');
const isRunning = computed(
  () => taskStatus.value === 'RUNNING' || isExecuting.value,
);

let wsManager: null | ReturnType<typeof createLedgerImportWebSocket> = null;
let pollingTimer: null | ReturnType<typeof setInterval> = null;
let pollingTimeout: null | ReturnType<typeof setTimeout> = null;
const POLLING_INTERVAL = 10_000;
const POLLING_TIMEOUT = 600_000;

const orderedNodes = computed(() => {
  return [...dagNodes.value].toSorted(
    (a, b) => a.layer - b.layer || a.step_code.localeCompare(b.step_code),
  );
});

function formatTimestamp(isoString: string): string {
  try {
    const date = new Date(isoString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const ms = String(date.getMilliseconds()).padStart(3, '0');
    return `${hours}:${minutes}:${seconds}.${ms}`;
  } catch {
    return isoString;
  }
}

function formatTime(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const ms = String(now.getMilliseconds()).padStart(3, '0');
  return `${hours}:${minutes}:${seconds}.${ms}`;
}

function appendLog(log: {
  executor?: string;
  level: LogEntry['level'];
  message: string;
  time: string;
}) {
  logRows.value.push({
    time: log.time,
    level: log.level,
    message: log.message,
    executor: log.executor ?? 'default',
  });
  if (logRows.value.length > 1000) {
    logRows.value.splice(0, logRows.value.length - 1000);
  }
  setTimeout(() => {
    const logArea = document.querySelector('#task-log-output');
    if (logArea) {
      logArea.scrollTop = logArea.scrollHeight;
    }
  });
}

function updateNodeStatus(executor: string, level: LogEntry['level']) {
  if (executor === 'default') {
    return;
  }
  const node = dagNodes.value.find((n) => n.step_code === executor);
  if (!node) {
    return;
  }
  switch (level) {
    case 'ERROR': {
      node.status = 'FAILED';

      break;
    }
    case 'INFO': {
      node.status = 'RUNNING';

      break;
    }
    case 'SUCCESS': {
      node.status = 'SUCCESS';

      break;
    }
    // No default
  }
}

function parseAndAppendLog(raw: RawLogMessage) {
  const time = formatTimestamp(raw.timestamp);
  let level: LogEntry['level'] = 'INFO';
  let message = raw.message;
  let executor = 'default';

  if (raw.type === 'logs' && raw.data) {
    const parsed = raw.data;
    level =
      ((parsed.level as string)?.toUpperCase() as LogEntry['level']) || 'INFO';
    message = parsed.message ?? raw.message;
    executor = parsed.script_id ?? 'default';
  }

  updateNodeStatus(executor, level);
  appendLog({ time, level, message, executor });
}

async function loadTaskInfo() {
  isLoading.value = true;
  try {
    const task = await getTask(taskId);
    taskName.value = task.task_name || `任务 ${taskId}`;
    taskStatus.value = task.status;
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

async function pollTaskStatus() {
  try {
    const task = await getTask(taskId);
    const dag = await getTaskDAG(taskId);

    taskStatus.value = task.status;
    dagNodes.value = dag.nodes.map((node) => ({
      step_code: node.step_code,
      step_name: node.step_name,
      layer: node.layer,
      status: node.status,
      prev: node.prev || [],
      next: node.next || [],
    }));

    if (task.status === 'SUCCESS' || task.status === 'FAILED') {
      stopPolling('Task completed');
    }
  } catch (error) {
    console.error('轮询任务状态失败', error);
  }
}

function startPolling() {
  clearPollingTimers();
  pollingTimeout = setTimeout(() => {
    stopPolling('Polling timeout');
  }, POLLING_TIMEOUT);
  pollingTimer = setInterval(pollTaskStatus, POLLING_INTERVAL);
  pollTaskStatus();
}

function clearPollingTimers() {
  if (pollingTimer) {
    clearInterval(pollingTimer);
    pollingTimer = null;
  }
  if (pollingTimeout) {
    clearTimeout(pollingTimeout);
    pollingTimeout = null;
  }
}

function stopPolling(reason?: string) {
  clearPollingTimers();
  isExecuting.value = false;
  if (wsManager && wsManager.isConnected) {
    wsManager.send({ type: 'stop' });
  }
  if (reason) {
    appendLog({
      time: formatTime(),
      level: 'INFO',
      message: `轮询结束: ${reason}`,
      executor: 'default',
    });
  }
}

function goBack() {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push('/ops/ledger_import');
  }
}

async function confirmWorkflow(taskId: string) {
  try {
    const task = await confirmTask(taskId);
    taskStatus.value = task.status;
    ElMessage.success('已确认工作流信息');
  } catch (error) {
    console.error('确认工作流失败', error);
    ElMessage.error('确认工作流失败，请重试');
  }
}

function createTaskLogSocket() {
  if (wsManager && wsManager.isConnected) {
    return;
  }

  wsStatus.value = 'CONNECTING';
  wsManager = createLedgerImportWebSocket(taskId, {
    onOpen: () => {
      wsStatus.value = 'OPEN';
      appendLog({
        time: formatTime(),
        level: 'INFO',
        message: '已连接到任务日志 WebSocket',
        executor: 'default',
      });
    },
    onMessage: (message: WebSocketApi.WebSocketMessage) => {
      try {
        let parsedMsg: Record<string, any>;
        parsedMsg =
          typeof message === 'string' ? JSON.parse(message) : (message as any);
        const raw: RawLogMessage = {
          type: parsedMsg.type ?? 'logs',
          message: parsedMsg.message ?? '',
          timestamp: parsedMsg.timestamp ?? new Date().toISOString(),
          data: parsedMsg.data,
        };
        parseAndAppendLog(raw);
      } catch {
        parseAndAppendLog({
          type: 'logs',
          message: String(message),
          timestamp: new Date().toISOString(),
        });
      }
    },
    onError: (event) => {
      appendLog({
        time: formatTime(),
        level: 'ERROR',
        message: `WebSocket 错误: ${event?.type ?? ''}`,
        executor: 'default',
      });
      isExecuting.value = false;
      closeWebSocket();
    },
    onClose: () => {
      appendLog({
        time: formatTime(),
        level: 'INFO',
        message: 'WebSocket 已关闭',
        executor: 'default',
      });
      isExecuting.value = false;
      closeWebSocket();
    },
    onReconnect: (attempt) => {
      appendLog({
        time: formatTime(),
        level: 'INFO',
        message: `WebSocket 重连中，第 ${attempt} 次`,
        executor: 'default',
      });
      wsStatus.value = 'CONNECTING';
    },
  });

  wsManager.connect().catch((error) => {
    wsStatus.value = 'CLOSED';
    appendLog({
      time: formatTime(),
      level: 'ERROR',
      message: `WebSocket 连接失败：${error?.message ?? error}`,
      executor: 'default',
    });
  });
}

async function startExecution() {
  if (isExecuting.value) {
    return;
  }

  isExecuting.value = true;

  try {
    if (!wsManager || !wsManager.isConnected) {
      createTaskLogSocket();
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('WebSocket 连接超时'));
        }, 10_000);

        const originalOnOpen = wsManager?.callbacks.onOpen;
        wsManager!.callbacks.onOpen = (event) => {
          originalOnOpen?.(event);
          clearTimeout(timeout);
          resolve();
        };
      });
    }

    wsManager.send({ type: 'start' });
    startPolling();
  } catch (error) {
    console.error('执行失败', error);
    appendLog({
      time: formatTime(),
      level: 'ERROR',
      message: `执行失败: ${error?.message ?? error}`,
      executor: 'default',
    });
    ElMessage.error('执行失败，请重试');
    isExecuting.value = false;
  }
}

function closeWebSocket() {
  stopPolling();
  if (wsManager) {
    wsManager.close();
    wsManager = null;
  }
  wsStatus.value = 'CLOSED';
}

async function loadHistoricalLogs() {
  try {
    const response = await getTaskLogs(taskId);
    if (response.logs && response.logs.length > 0) {
      for (const raw of response.logs) {
        parseAndAppendLog(raw as RawLogMessage);
      }
    }
  } catch (error) {
    console.error('加载历史日志失败', error);
  }
}

onMounted(async () => {
  if (!taskId) {
    ElMessage.error('任务ID未提供');
    return;
  }

  await loadTaskInfo();
  await loadDAG();

  if (taskStatus.value === 'SUCCESS' || taskStatus.value === 'FAILED') {
    await loadHistoricalLogs();
  }
});

onUnmounted(() => {
  closeWebSocket();
});
</script>

<template>
  <div class="flex min-h-screen flex-col bg-gray-50/50">
    <header
      class="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200/80 bg-white/80 px-6 py-4 backdrop-blur-sm"
    >
      <div class="flex items-center gap-3">
        <ElButton
          variant="text"
          class="!text-gray-600 hover:!bg-gray-100"
          @click="goBack"
        >
          <ArrowLeft class="h-4 w-4" />
        </ElButton>
        <div class="flex flex-col">
          <span class="font-medium text-gray-900">{{ taskName }}</span>
          <span class="text-xs text-gray-400">任务ID: {{ taskId }}</span>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <ElButton
          :disabled="!canConfirm"
          class="border-gray-300"
          @click="confirmWorkflow(taskId)"
        >
          <CheckCircle class="h-4 w-4" />
          确认
        </ElButton>
        <ElButton
          v-if="!isRunning"
          :disabled="!canExecute"
          type="primary"
          class="!bg-gray-900 hover:!bg-gray-800"
          @click="startExecution"
        >
          <Terminal class="h-4 w-4" />
          执行工作流
        </ElButton>
        <ElButton v-else type="info" disabled>
          <Loader class="h-4 w-4 animate-spin" />
          执行中...
        </ElButton>
      </div>
    </header>

    <main class="flex flex-1 gap-6 overflow-hidden p-6">
      <div class="flex min-w-0 flex-1 flex-col gap-6">
        <ElCard class="border-0 bg-white shadow-sm">
          <template #header>
            <div class="flex items-center gap-2">
              <FileText class="h-4 w-4 text-gray-400" />
              <span class="text-sm font-medium text-gray-700">工作流节点</span>
            </div>
          </template>
          <div class="flex items-center justify-center gap-2 py-3">
            <template
              v-for="(node, index) in orderedNodes"
              :key="node.step_code"
            >
              <div class="flex flex-col items-center gap-2">
                <div
                  class="flex h-12 w-12 items-center justify-center rounded-xl border-2 bg-white shadow-sm transition-all duration-300"
                  :class="[
                    node.status === 'SUCCESS' && 'border-green-400 bg-green-50',
                    node.status === 'RUNNING' &&
                      'animate-pulse border-blue-400 bg-blue-50',
                    node.status === 'FAILED' && 'border-red-400 bg-red-50',
                    node.status === 'PENDING' && 'border-gray-200',
                  ]"
                >
                  <Check
                    v-if="node.status === 'SUCCESS'"
                    class="h-5 w-5 text-green-500"
                  />
                  <Loader
                    v-else-if="node.status === 'RUNNING'"
                    class="h-5 w-5 animate-spin text-blue-500"
                  />
                  <X
                    v-else-if="node.status === 'FAILED'"
                    class="h-5 w-5 text-red-500"
                  />
                  <Circle v-else class="h-5 w-5 text-gray-300" />
                </div>
                <span
                  class="text-xs font-medium"
                  :class="[
                    node.status === 'SUCCESS' && 'text-green-600',
                    node.status === 'RUNNING' && 'text-blue-600',
                    node.status === 'FAILED' && 'text-red-600',
                    node.status === 'PENDING' && 'text-gray-400',
                  ]"
                >
                  {{ node.step_name }}
                </span>
              </div>
              <div
                v-if="index < orderedNodes.length - 1"
                class="mb-6 flex items-center"
              >
                <div
                  class="h-0.5 w-8 transition-colors duration-300"
                  :class="
                    node.status === 'SUCCESS' ? 'bg-green-400' : 'bg-gray-200'
                  "
                ></div>
                <ChevronRight
                  class="h-3 w-3"
                  :class="
                    node.status === 'SUCCESS'
                      ? 'text-green-400'
                      : 'text-gray-300'
                  "
                />
              </div>
            </template>
          </div>
        </ElCard>

        <ElCard
          class="flex h-96 flex-col overflow-hidden border-0 bg-white shadow-sm"
        >
          <template #header>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <Terminal class="h-4 w-4 text-gray-400" />
                <span class="text-sm font-medium text-gray-700">执行日志</span>
                <ElBadge
                  v-if="isExecuting"
                  is-dot
                  type="primary"
                  class="ml-1"
                />
              </div>
              <div class="flex items-center gap-2">
                <span
                  class="text-xs"
                  :class="[
                    wsStatus === 'OPEN' && 'text-green-500',
                    wsStatus === 'CONNECTING' && 'text-yellow-500',
                    wsStatus === 'CLOSED' && 'text-gray-400',
                  ]"
                >
                  {{
                    wsStatus === 'OPEN'
                      ? '已连接'
                      : wsStatus === 'CONNECTING'
                        ? '连接中...'
                        : '未连接'
                  }}
                </span>
              </div>
            </div>
          </template>
          <div
            id="task-log-output"
            ref="logContainer"
            class="flex-1 space-y-1 overflow-y-auto bg-gray-50/50 p-4 font-mono text-xs"
          >
            <div
              v-for="(log, index) in logRows"
              :key="index"
              class="flex items-start gap-3 rounded px-2 py-1.5 transition-colors hover:bg-white/80"
            >
              <span class="whitespace-nowrap text-gray-400">
                {{ log.time }}
              </span>
              <span
                class="inline-block w-12 shrink-0 select-none rounded bg-blue-100 px-1.5 py-0.5 text-center text-xs font-medium"
                :class="[
                  log.level === 'ERROR' && 'bg-red-100 text-red-600',
                  log.level === 'WARN' && 'bg-yellow-100 text-yellow-600',
                  log.level === 'SUCCESS' && 'bg-green-100 text-green-600',
                  log.level === 'INFO' && 'bg-blue-100 text-blue-600',
                ]"
              >
                {{ log.level }}
              </span>
              <span
                class="inline-block w-20 shrink-0 select-none truncate rounded bg-purple-100 px-1.5 py-0.5 text-center text-xs font-medium text-purple-600"
                :title="log.executor"
              >
                {{ log.executor }}
              </span>
              <span class="flex-1 break-all text-gray-600">
                {{ log.message }}
              </span>
            </div>
            <div
              v-if="logRows.length === 0"
              class="flex h-full flex-col items-center justify-center text-gray-400"
            >
              <FileText class="mb-3 h-10 w-10 opacity-20" />
              <p class="text-sm">暂无日志输出</p>
            </div>
          </div>
        </ElCard>
      </div>
    </main>
  </div>
</template>
