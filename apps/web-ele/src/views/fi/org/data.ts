import type { VxeTableGridOptions } from '@vben/plugins/vxe-table';

import type { FiOrgResponse } from '#/api/fi/org';

import { $t } from '@vben/locales';

export function useSearchFormSchema() {
  return [
    {
      component: 'Input',
      fieldName: 'org_code',
      label: 'orgCode',
      componentProps: {
        placeholder: '请输入行政组织编码',
        clearable: true,
      },
    },
    {
      component: 'Input',
      fieldName: 'org_name',
      label: 'orgName',
      componentProps: {
        placeholder: '请输入行政组织名称',
        clearable: true,
      },
    },
    {
      component: 'Select',
      fieldName: 'status',
      label: 'status',
      componentProps: {
        placeholder: '请选择状态',
        clearable: true,
        options: [
          { label: '启用', value: true },
          { label: '禁用', value: false },
        ],
      },
    },
  ];
}

export function useTableColumns(): VxeTableGridOptions<FiOrgResponse>['columns'] {
  return [
    {
      type: 'seq',
      width: 60,
      title: 'seq',
    },
    {
      field: 'org_code',
      title: 'orgCode',
      minWidth: 150,
    },
    {
      field: 'org_name',
      title: 'orgName',
      minWidth: 180,
    },
    {
      field: 'belonged_org',
      title: 'belongedOrg',
      minWidth: 150,
    },
    {
      field: 'sector',
      title: 'sector',
      minWidth: 120,
    },
    {
      field: 'status',
      title: 'status',
      minWidth: 80,
      slots: { default: 'status' },
    },
    {
      field: 'effective_date',
      title: 'effectiveDate',
      minWidth: 120,
    },
    {
      field: 'expire_date',
      title: 'expireDate',
      minWidth: 120,
    },
    {
      field: 'created_at',
      title: 'createdAt',
      minWidth: 180,
    },
  ];
}