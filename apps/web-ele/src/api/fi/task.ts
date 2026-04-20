import { requestClient } from '#/api/request';

// ==================== Enums ====================
// 在TaskStatus枚举中添加INIT状态，与前端状态保持一致
export enum TaskStatus {
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
  INIT = 'INIT', // 初始化状态
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  SUCCESS = 'SUCCESS',
}

// ==================== Step Interfaces ====================
export interface TaskStepCreate {
  step_code: string; // 节点ID
  step_name: string; // 节点名称
  step_layer: number; // 所属层级
  prev_steps: string[]; // 前置步骤ID列表
  next_steps?: string[]; // 下游步骤ID列表
  executor_bean: string; // 执行器Bean名
  executor_param?: Record<string, any>; // 执行参数
  max_retry: number; // 最大重试次数
}

export interface TaskStepUpdate {
  step_name?: string;
  executor_param?: Record<string, any>;
  max_retry?: number;
}

export interface TaskStepResponse {
  task_id: string;
  step_code: string;
  step_name: string;
  step_layer: number;
  prev_steps: string[];
  next_steps?: string[];
  executor_bean: string;
  executor_param?: Record<string, any>;
  status: string;
  retry_times: number;
  max_retry: number;
  error_log?: Record<string, any>;
  started_at?: string;
  completed_at?: string;
  total_duration?: number;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface TaskStepExecuteRequest {
  context?: Record<string, any>; // 执行上下文
}

// ==================== Task Interfaces ====================
export interface TaskCreate {
  task_id?: string; // 任务ID(不传则自动生成)
  task_type: string; // 任务类型
  task_name: string;
  biz_id: string; // 业务ID
  biz_info: Record<string, any>; // 业务信息
  executed_by?: string;
  scheduled_at?: string;
}

export interface LedgerImportTaskCreate extends TaskCreate {
  org_id: string;
  org_code: string;
  org_name: string;
  acct_ledger_code: string;
  acct_ledger_name: string;
}

export interface TaskUpdate {
  task_name?: string;
  scheduled_at?: string;
  executed_by?: string;
}

export interface TaskQuery {
  status?: string;
  biz_id?: string;
  executed_by?: string;
  page?: number;
  page_size?: number;
}

export interface TaskResponse {
  id: number;
  task_id: string;
  task_type: string;
  task_name: string;
  biz_id: string;
  biz_info: Record<string, any>;
  status: string;
  total_steps: number;
  success_steps: number;
  error_message?: string;
  executed_by?: string;
  scheduled_at?: string;
  started_at?: string;
  completed_at?: string;
  total_duration?: number;
  created_at: string;
  updated_at: string;
  steps?: TaskStepResponse[];
}

export interface TaskListResponse {
  total: number;
  items: TaskResponse[];
  page: number;
  page_size: number;
}

export interface TaskExecuteResponse {
  task_id: string;
  status: string;
  message: string;
  started_steps: string[];
}

export interface TaskCancelResponse {
  task_id: string;
  status: string;
  cancelled_steps: number;
}

export interface TaskRetryResponse {
  task_id: string;
  status: string;
  retried_steps: string[];
}

// ==================== DAG Interfaces ====================
export interface DAGNode {
  step_code: string;
  step_name: string;
  layer: number;
  status: string;
  prev: string[];
  next: string[];
}

export interface TaskDAGResponse {
  task_id: string;
  nodes: DAGNode[];
  edges: Array<{ from: string; to: string }>;
}

// ==================== API Functions ====================
export async function getInitialTasks(): Promise<TaskResponse[]> {
  return requestClient.get<TaskResponse[]>('/api/fi/task?status=init');
}

export async function getTasks(status: string): Promise<TaskResponse[]> {
  return requestClient.get<TaskResponse[]>(`/api/fi/task?status=${status}`);
}

export async function getTaskList(
  query?: TaskQuery,
): Promise<TaskListResponse> {
  return requestClient.get<TaskListResponse>('/api/fi/task', { params: query });
}

export async function getTask(taskId: string): Promise<TaskResponse> {
  return requestClient.get<TaskResponse>(`/api/fi/task/${taskId}`);
}

export async function confirmTask(taskId: string): Promise<TaskResponse> {
  return requestClient.get<TaskResponse>(`/api/fi/task/${taskId}/confirm`);
}

export async function createTask(data: TaskCreate): Promise<TaskResponse> {
  return requestClient.post<TaskResponse>('/api/fi/task/create', data);
}

export async function updateTask(
  taskId: string,
  data: TaskUpdate,
): Promise<TaskResponse> {
  return requestClient.put<TaskResponse>(`/api/fi/task/${taskId}`, data);
}

export async function deleteTask(taskId: string): Promise<void> {
  return requestClient.delete(`/api/fi/task/${taskId}`);
}

export async function executeTask(
  taskId: string,
  data?: TaskStepExecuteRequest,
): Promise<TaskExecuteResponse> {
  return requestClient.post<TaskExecuteResponse>(
    `/api/fi/task/${taskId}/execute`,
    data,
  );
}

export async function cancelTask(taskId: string): Promise<TaskCancelResponse> {
  return requestClient.post<TaskCancelResponse>(
    `/api/fi/task/${taskId}/cancel`,
  );
}

export async function retryTask(taskId: string): Promise<TaskRetryResponse> {
  return requestClient.post<TaskRetryResponse>(`/api/fi/task/${taskId}/retry`);
}

export async function getTaskDAG(taskId: string): Promise<TaskDAGResponse> {
  return requestClient.get<TaskDAGResponse>(`/api/fi/task/${taskId}/dag`);
}

export async function getTaskSteps(
  taskId: string,
): Promise<TaskStepResponse[]> {
  return requestClient.get<TaskStepResponse[]>(`/api/fi/task/${taskId}/steps`);
}

export async function updateTaskStep(
  taskId: string,
  stepCode: string,
  data: TaskStepUpdate,
): Promise<TaskStepResponse> {
  return requestClient.put<TaskStepResponse>(
    `/api/fi/task/${taskId}/step/${stepCode}`,
    data,
  );
}

export async function executeTaskStep(
  taskId: string,
  stepCode: string,
  data?: TaskStepExecuteRequest,
): Promise<TaskStepResponse> {
  return requestClient.post<TaskStepResponse>(
    `/api/fi/task/${taskId}/step/${stepCode}/execute`,
    data,
  );
}

export interface TaskLogResponse {
  logs: Array<{
    type: string;
    message: string;
    timestamp: string;
    data?: Record<string, any>;
  }>;
}

export async function getTaskLogs(taskId: string): Promise<TaskLogResponse> {
  return requestClient.get<TaskLogResponse>(`/api/fi/task/${taskId}/logs`);
}
