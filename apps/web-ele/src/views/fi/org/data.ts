import type { Column } from 'element-plus';

import type { VbenFormSchema } from '#/adapter/form';

import { $t } from '@vben/locales';

export function getBelongedOrgOptions() {
  return [
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
  ];
}

export function getSectorOptions() {
  return [
    { label: '新质基建', value: '新质基建' },
    { label: '城市与房地产开发', value: '城市与房地产开发' },
    { label: '产业、金融与服务—其他', value: '产业、金融与服务—其他' },
  ];
}

export function useSearchFormSchema(): VbenFormSchema[] {
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
        options: getBelongedOrgOptions(),
        clearable: true,
      },
    },
    {
      component: 'Select',
      fieldName: 'sector',
      label: $t('fi.org.sector'),
      componentProps: {
        placeholder: $t('fi.org.sectorSearchPlaceholder'),
        options: getSectorOptions(),
        clearable: true,
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
      component: 'Select',
      fieldName: 'belonged_org',
      label: $t('fi.org.belongedOrg'),
      componentProps: {
        placeholder: $t('fi.org.belongedOrgPlaceholder'),
        options: getBelongedOrgOptions(),
        clearable: true,
      },
    },
    {
      component: 'Select',
      fieldName: 'sector',
      label: $t('fi.org.sector'),
      componentProps: {
        placeholder: $t('fi.org.sectorPlaceholder'),
        options: getSectorOptions(),
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

export function useTableColumns(): Column[] {
  return [
    {
      key: 'org_code',
      dataKey: 'org_code',
      title: $t('fi.org.orgCode'),
      width: 200,
    },
    {
      key: 'org_name',
      dataKey: 'org_name',
      title: $t('fi.org.orgName'),
      minWidth: 400,
      flex: 1,
      width: 400,
    },
    {
      key: 'belonged_org',
      dataKey: 'belonged_org',
      title: $t('fi.org.belongedOrg'),
      width: 100,
    },
    {
      key: 'sector',
      dataKey: 'sector',
      title: $t('fi.org.sector'),
      width: 100,
    },
    {
      key: 'status',
      title: $t('fi.org.status'),
      width: 70,
      align: 'center',
      slots: { default: 'cell-status' },
    },
    {
      key: 'effective_date',
      dataKey: 'effective_date',
      title: $t('fi.org.effectiveDate'),
      width: 100,
    },
    {
      key: 'expire_date',
      dataKey: 'expire_date',
      title: $t('fi.org.expireDate'),
      width: 100,
    },
    {
      key: 'updated_at',
      dataKey: 'updated_at',
      title: $t('fi.org.updatedAt'),
      width: 160,
    },
    {
      key: 'actions',
      title: $t('common.operation'),
      width: 180,
      align: 'center',
      fixed: 'right',
      slots: { default: 'cell-actions' },
    },
  ];
}
