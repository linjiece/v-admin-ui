import { requestClient } from '#/api/request';

export interface OrgInfo {
  companyCode: string;
  orgCode: string;
  orgId: string;
  orgName: string;
  acctLedgerCode: string;
  acctLedgerName: string;
}

export interface PlanInfo {
  taskId: string;
  companyName: string;
  orgCode: string;
  orgName: string;
  acctLedgerCode: string;
  acctLedgerName: string;
  status: 'confirmed' | 'pending';
}

/**
 * 行政组织信息查询
 */
export async function fetchOrgApi(orgCode: string) {
  return requestClient.get<OrgInfo>(`/api/fi/org/${orgCode}`);
}

/**
 * 待纳入账套组织信息导入
 */
export async function importOrgApi(data: OrgInfo) {
  return requestClient.post<OrgInfo>('/api/fi/org', data);
}

export async function fetchPendingPlanApi() {
  return requestClient.get<OrgInfo[]>('/api/fi/org/plan/pending');
}

export async function delPendingPlanApi(taskId: string) {
  return requestClient.delete(`/api/fi/org/plan/pending/${taskId}`);
}
export async function confirmPendingPlanApi(taskId: string) {
  return requestClient.post(`/api/fi/org/plan/pending/${taskId}/confirm`);
}
