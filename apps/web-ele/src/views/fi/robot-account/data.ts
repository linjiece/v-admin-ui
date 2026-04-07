import type { Column } from 'element-plus';

import type { VbenFormSchema } from '#/adapter/form';

import { $t } from '@vben/locales';

import { z } from '#/adapter/form';

export function getStatusOptions() {
  return [
    { type: 'danger', label: '禁用', value: 0 },
    { type: 'success', label: '启用', value: 1 },
  ];
}

export function useSearchFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'account',
      label: '账号',
    },
    {
      component: 'Input',
      fieldName: 'name',
      label: '名称',
    },
    {
      component: 'Select',
      fieldName: 'status',
      label: '状态',
      componentProps: {
        placeholder: '请选择状态',
        options: getStatusOptions(),
        clearable: true,
      },
    },
  ];
}

export function getFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'account',
      label: '账号',
      rules: z
        .string()
        .min(1, '账号不能为空')
        .max(100, '账号最多100个字符'),
    },
    {
      component: 'Input',
      fieldName: 'name',
      label: '名称',
      rules: z
        .string()
        .min(1, '名称不能为空')
        .max(100, '名称最多100个字符'),
    },
    {
      component: 'RadioGroup',
      componentProps: {
        buttonStyle: 'solid',
        options: getStatusOptions(),
        isButton: true,
      },
      defaultValue: 1,
      fieldName: 'status',
      label: '状态',
    },
  ];
}

export function useMyTableColumns(): Column[] {
  return [
    {
      key: 'account',
      dataKey: 'account',
      title: '账号',
      width: 150,
    },
    {
      key: 'name',
      dataKey: 'name',
      title: '名称',
      width: 150,
    },
    {
      key: 'status',
      title: '状态',
      width: 100,
      align: 'center' as const,
      slots: { default: 'cell-status' },
    },
    {
      key: 'current_job',
      title: '当前作业',
      width: 180,
      slots: { default: 'cell-current_job' },
    },
    {
      key: 'last_active_time',
      title: '最后活跃时间',
      width: 180,
      slots: { default: 'cell-last_active_time' },
    },
    {
      key: 'actions',
      title: '操作',
      width: 180,
      fixed: true,
      align: 'center' as const,
      slots: { default: 'cell-actions' },
    },
  ];
}
