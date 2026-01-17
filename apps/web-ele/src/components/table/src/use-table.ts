import type { BaseFormComponentType } from '@vben/common-ui';

import type { ExtendedMyTableApi, MyTableProps } from './types';

import { defineComponent, h, onBeforeUnmount } from 'vue';

import { MyTableApi } from './api';
import MyTable from './MyTable.vue';
import { useStore } from './store';

export function useMyTable<
  T extends Record<string, any> = any,
  D extends BaseFormComponentType = BaseFormComponentType,
>(options: MyTableProps<T, D>) {
  const api = new MyTableApi(options);
  const extendedApi: ExtendedMyTableApi<T, D> = api as ExtendedMyTableApi<T, D>;
  extendedApi.useStore = (selector) => {
    return useStore(api.store, selector);
  };

  const Grid = defineComponent(
    (props: MyTableProps<T>, { attrs, slots }) => {
      onBeforeUnmount(() => {
        api.unmount();
      });
      api.setState({ ...props, ...attrs });
      return () => h(MyTable, { ...props, ...attrs, api: extendedApi }, slots);
    },
    {
      name: 'MyTable',
      inheritAttrs: false,
    },
  );

  return [Grid, extendedApi] as const;
}

export type UseMyTable = typeof useMyTable;
