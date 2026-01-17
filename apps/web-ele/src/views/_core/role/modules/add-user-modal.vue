<script lang="ts" setup>
import type { VbenFormProps } from '#/adapter/form';
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { ElMessage as message } from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { addRoleUsersApi } from '#/api/core/role';
import { getUserListApi } from '#/api/core/user';

const record = ref();
const hasTopTableDropDownActions = ref(false);
const parentGridApi = ref();
const formOptions: VbenFormProps = {
  collapsed: true,
  commonConfig: {
    labelWidth: 60,
  },
  schema: [
    {
      component: 'Input',
      fieldName: 'username',
      label: '4A账号',
      componentProps: {
        placeholder: '请输入4A账号',
        allowClear: true,
      },
    },
    {
      component: 'Input',
      fieldName: 'name',
      label: '姓名',
      componentProps: {
        placeholder: '请输入姓名',
        allowClear: true,
      },
    },
  ],
};
const gridOptions: VxeGridProps<any> = {
  columns: [
    { type: 'checkbox', width: 60 },
    { field: 'username', title: '用户名' },
    { field: 'name', title: '姓名' },
  ],
  toolbarConfig: {
    refresh: true, // 刷新
    print: false, // 打印
    export: false, // 导出
    // custom: true, // 自定义列
    zoom: true, // 最大化最小化
    slots: {},
    custom: {
      // 自定义列-图标
      icon: 'vxe-icon-menu',
    },
  },
  border: false,
  height: '500',
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues) => {
        return await getUserListApi({
          page: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        });
      },
    },
  },
};
const gridEvents: VxeGridListeners<any> = {
  checkboxChange() {
    const records = gridApi.grid.getCheckboxRecords();
    hasTopTableDropDownActions.value = records.length > 0;
  },
  checkboxAll() {
    const records = gridApi.grid.getCheckboxRecords();
    hasTopTableDropDownActions.value = records.length > 0;
  },
};
const [Grid, gridApi] = useVbenVxeGrid({
  formOptions,
  gridOptions,
  gridEvents,
});

const [Modal, ModalApi] = useVbenModal({
  onOpenChange(isOpen) {
    record.value = isOpen ? ModalApi.getData()?.record || {} : {};
    parentGridApi.value = isOpen ? ModalApi.getData()?.gridApi : null;
  },
  onConfirm() {
    const checkedKeys = gridApi.grid
      .getCheckboxRecords()
      .map((item) => item.id);
    addRoleUsersApi(record.value.id, { user_ids: checkedKeys }).then(() => {
      message.success('添加成功');
      gridApi.reload();
      parentGridApi.value.reload();
    });
  },
});
defineExpose(ModalApi);
</script>
<template>
  <div>
    <Modal class="w-[60%]" title="添加用户">
      <Grid>
        <template #toolbar-tools></template>
      </Grid>
    </Modal>
  </div>
</template>
