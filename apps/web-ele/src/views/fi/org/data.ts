import type { VxeTableGridOptions } from '@vben/plugins/vxe-table';

import type { VbenFormSchema } from '#/adapter/form';
import type { FiOrgResponse } from '#/api/fi/org';

import { $t } from '@vben/locales';

export function useSearchFormSchema() {
  return [
    {
      component: 'Input',
      fieldName: 'org_code',
      label: $t('fi.org.orgCode'),
      componentProps: {
        placeholder: $t('fi.org.orgCodePlaceholder'),
        clearable: true,
      },
    },
    {
      component: 'Input',
      fieldName: 'org_name',
      label: $t('fi.org.orgName'),
      componentProps: {
        placeholder: $t('fi.org.orgNamePlaceholder'),
        clearable: true,
      },
    },
    {
      component: 'Select',
      fieldName: 'belonged_org',
      label: $t('fi.org.belongedOrg'),
      componentProps: {
        placeholder: $t('fi.org.belongedOrgSearchPlaceholder'),
        clearable: true,
        options: [
          { label: '四航局', value: '四航局' },
          { label: '广航局', value: '广航局' },
          { label: '华南建设公司', value: '华南建设公司' },
          { label: '中交城投', value: '中交城投' },
          { label: '中交海投', value: '中交海投' },
          { label: '轨道交通事业部', value: '轨道交通事业部' },
          { label: '二航局', value: '二航局' },
          { label: '三航局', value: '三航局' },
          { label: '中交疏浚', value: '中交疏浚' },
          { label: '上航局', value: '上航局' },
          { label: '一公局', value: '一公局' },
          { label: '二公局', value: '二公局' },
          { label: '三公局', value: '三公局' },
          { label: '中交建筑', value: '中交建筑' },
          { label: '中交长江建设', value: '中交长江建设' },
          { label: '中咨集团', value: '中咨集团' },
          { label: '中交投资', value: '中交投资' },
          { label: '中国城乡', value: '中国城乡' },
          { label: '华南共享', value: '华南共享' },
        ],
      },
    },
    {
      component: 'Select',
      fieldName: 'sector',
      label: $t('fi.org.sector'),
      componentProps: {
        placeholder: $t('fi.org.sectorSearchPlaceholder'),
        clearable: true,
        options: [
          { label: '新质基建', value: '新质基建' },
          { label: '城市与房地产开发', value: '城市与房地产开发' },
          { label: '产业、金融与服务—其他', value: '产业、金融与服务—其他' },
        ],
      },
    },
  ];
}

export function useEditFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'org_name',
      label: $t('fi.org.orgName'),
      componentProps: {
        placeholder: $t('fi.org.orgNamePlaceholder'),
        clearable: true,
      },
    },
    {
      component: 'Input',
      fieldName: 'belonged_org',
      label: $t('fi.org.belongedOrg'),
      componentProps: {
        placeholder: $t('fi.org.belongedOrgPlaceholder'),
        clearable: true,
      },
    },
    {
      component: 'Input',
      fieldName: 'sector',
      label: $t('fi.org.sector'),
      componentProps: {
        placeholder: $t('fi.org.sectorPlaceholder'),
        clearable: true,
      },
    },
    {
      component: 'DatePicker',
      fieldName: 'expire_date',
      label: $t('fi.org.expireDate'),
      componentProps: {
        type: 'date',
        placeholder: $t('fi.org.expireDatePlaceholder'),
        clearable: true,
        valueFormat: 'YYYY-MM-DD',
      },
    },
  ];
}

export function useTableColumns(): VxeTableGridOptions<FiOrgResponse>['columns'] {
  return [
    {
      type: 'seq',
      width: 60,
      title: $t('common.seq'),
    },
    {
      field: 'org_code',
      title: $t('fi.org.orgCode'),
      minWidth: 150,
    },
    {
      field: 'org_name',
      title: $t('fi.org.orgName'),
      minWidth: 180,
    },
    {
      field: 'belonged_org',
      title: $t('fi.org.belongedOrg'),
      minWidth: 150,
    },
    {
      field: 'sector',
      title: $t('fi.org.sector'),
      minWidth: 120,
    },
    {
      field: 'status',
      title: $t('fi.org.status'),
      minWidth: 80,
      slots: { default: 'status' },
    },
    {
      field: 'effective_date',
      title: $t('fi.org.effectiveDate'),
      minWidth: 120,
    },
    {
      field: 'expire_date',
      title: $t('fi.org.expireDate'),
      minWidth: 120,
    },
    {
      field: 'updated_at',
      title: $t('fi.org.updatedAt'),
      minWidth: 180,
    },
    {
      field: 'operation',
      title: $t('common.operation'),
      width: 100,
      fixed: 'right',
      slots: { default: 'operation' },
    },
  ];
}
