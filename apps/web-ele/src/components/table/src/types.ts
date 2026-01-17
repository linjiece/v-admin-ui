import type { Column } from 'element-plus';

import type { Ref } from 'vue';

import type { BaseFormComponentType, VbenFormProps } from '@vben/common-ui';
import type { ClassType, DeepPartial } from '@vben/types';

import type { MyTableApi } from './api';

import { useVbenForm } from '@vben/common-ui';

export interface MyPaginationInfo {
  currentPage: number;
  pageSize: number;
  total: number;
}

export interface MyProxyConfig {
  enabled?: boolean;
  autoLoad?: boolean;
  ajax?: {
    query?: (params: {
      form: any;
      page: MyPaginationInfo;
      sort: any;
    }) => Promise<any>;
    queryAll?: (params: { form: any; sort: any }) => Promise<any>;
  };
}

export interface MyPagerConfig {
  enabled?: boolean;
  pageSize?: number;
  pageSizes?: number[];
  currentPage?: number;
  total?: number;
  layout?: string;
  background?: boolean;
}

export interface MyToolbarConfig {
  title?: string;
  search?: boolean; // 是否显示搜索切换按钮
  refresh?: boolean; // 是否显示刷新按钮
  zoom?: boolean; // 是否显示全屏按钮
  custom?: boolean; // 是否显示列设置
  tools?: any[]; // 自定义工具栏按钮
}

export interface MyTableGridOptions<T = any> {
  /** 列配置 */
  columns?: Column<T>[];
  /** 数据 */
  data?: T[];
  /** 代理配置 */
  proxyConfig?: MyProxyConfig;
  /** 分页配置 */
  pagerConfig?: MyPagerConfig;
  /** 工具栏配置 */
  toolbarConfig?: MyToolbarConfig;
  /** 高度 */
  height?: number | string;
  /** 其他 Element Plus Table V2 props */
  [key: string]: any;
}

export interface MyTableProps<
  T extends Record<string, any> = any,
  D extends BaseFormComponentType = BaseFormComponentType,
> {
  /**
   * 标题
   */
  tableTitle?: string;
  /**
   * 标题帮助
   */
  tableTitleHelp?: string;
  /**
   * 组件class
   */
  class?: ClassType;
  /**
   * My-table class
   */
  gridClass?: ClassType;
  /**
   * grid 配置
   */
  gridOptions?: DeepPartial<MyTableGridOptions<T>>;
  /**
   * grid 事件
   */
  gridEvents?: Record<string, (...args: any[]) => any>;
  /**
   * 表单配置
   */
  formOptions?: VbenFormProps<D>;
  /**
   * 显示搜索表单
   */
  showSearchForm?: boolean;
  /**
   * 搜索表单与表格主体之间的分隔条
   */
  separator?: boolean | { backgroundColor?: string; show?: boolean };
}

export type ExtendedMyTableApi<
  D extends Record<string, any> = any,
  F extends BaseFormComponentType = BaseFormComponentType,
> = MyTableApi<D> & {
  useStore: <T = NoInfer<MyTableProps<D, F>>>(
    selector?: (state: NoInfer<MyTableProps<any, any>>) => T,
  ) => Readonly<Ref<T>>;
};

export interface SetupMyTable {
  useVbenForm: typeof useVbenForm;
}
