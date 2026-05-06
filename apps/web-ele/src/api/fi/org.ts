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

export interface FiOrgResponse {
  id: number;
  org_code: string;
  org_name: string;
  status: boolean;
  effective_date?: string;
  expire_date?: string;
  belonged_org?: string;
  sector?: string;
  created_at?: string;
  updated_at?: string;
}

export interface FiOrgListResponse {
  items: FiOrgResponse[];
  total: number;
}

export interface FiOrgQueryParams {
  page?: number;
  pageSize?: number;
  org_code?: string;
  org_name?: string;
  status?: boolean;
  belonged_org?: string;
  sector?: string;
  order_by?: string;
  order_dir?: string;
}

export async function fetchOrgApi(orgCode: string) {
  return requestClient.get<OrgInfo>(`/api/fi/org/${orgCode}`);
}

export async function fetchFiOrgListApi(params: FiOrgQueryParams) {
  return requestClient.get<FiOrgListResponse>('/api/fi/org/', { params });
}

export interface FiOrgUpdateParams {
  org_name?: string;
  belonged_org?: string;
  sector?: string;
  expire_date?: string;
}

export async function updateFiOrgApi(id: number, data: FiOrgUpdateParams) {
  return requestClient.put<FiOrgResponse>(`/api/fi/org/${id}`, data);
}

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

export async function exportFiOrgApi(params?: FiOrgQueryParams): Promise<Blob> {
  return requestClient.download('/api/fi/org/export/excel', {
    params,
  });
}
