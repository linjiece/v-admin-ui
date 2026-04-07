import { requestClient } from '#/api/request';

export interface RobotAccount {
  id: string;
  account: string;
  name: string;
  status: number;
  current_job?: string;
  last_active_time?: string;
  sys_create_datetime?: string;
  sys_update_datetime?: string;
}

export interface RobotAccountListParams {
  page?: number;
  pageSize?: number;
  account?: string;
  name?: string;
  status?: number;
}

export interface RobotAccountListResponse {
  items: RobotAccount[];
  total: number;
}

export async function getRobotAccountListApi(
  params: RobotAccountListParams,
): Promise<RobotAccountListResponse> {
  return requestClient.get('/api/robot/account', { params });
}

export async function getRobotAccountApi(id: string): Promise<RobotAccount> {
  return requestClient.get(`/api/robot/account/${id}`);
}

export async function createRobotAccountApi(
  data: Partial<RobotAccount>,
): Promise<RobotAccount> {
  return requestClient.post('/api/robot/account', data);
}

export async function updateRobotAccountApi(
  id: string,
  data: Partial<RobotAccount>,
): Promise<RobotAccount> {
  return requestClient.put(`/api/robot/account/${id}`, data);
}

export async function deleteRobotAccountApi(id: string): Promise<void> {
  return requestClient.delete(`/api/robot/account/${id}`);
}
