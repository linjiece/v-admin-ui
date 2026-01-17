<script lang="ts" setup>
import type { VbenFormProps } from '#/adapter/form';
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { IconifyIcon } from '@vben/icons';

import { ElButton as Button, ElMessage as message } from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getRoleUsersApi, removeRoleUsersApi } from '#/api/core/role';
import { TableAction } from '#/components/table-action';

import AddUser from './add-user-modal.vue';

const record = ref();
const hasTopTableDropDownActions = ref(false);
const addUserRef = ref();
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
    { field: 'username', title: '4A账号' },
    { field: 'name', title: '姓名' },
    {
      width: 160,
      title: '操作',
      align: 'center',
      slots: { default: 'ACTION' },
      fixed: 'right',
    },
  ],
  toolbarConfig: {
    refresh: true, // 刷新
    print: false, // 打印
    export: false, // 导出
    // custom: true, // 自定义列
    zoom: true, // 最大化最小化
    slots: {
      buttons: 'toolbar-buttons',
    },
    custom: {
      // 自定义列-图标
      icon: 'vxe-icon-menu',
    },
  },
  border: false,
  height: 'auto',
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues) => {
        return await getRoleUsersApi(record.value.id, {
          page: page.currentPage,
          pageSize: page.pageSize,
          username: formValues.username,
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

const [Drawer, DrawerApi] = useVbenDrawer({
  footer: false,
  onOpenChange(isOpen) {
    record.value = isOpen ? DrawerApi.getData()?.record : {};
  },
});
// 添加成员
const handleAdd = () => {
  addUserRef.value.setData({
    record: record.value,
    gridApi,
  });
  addUserRef.value.open();
};
// 删除用户角色关系
const handleRemoveUserRole = async (row: any) => {
  const ids = row
    ? [row.id]
    : gridApi.grid.getCheckboxRecords().map((item) => item.id);
  if (ids.length === 0) {
    message.info('请选择至少一条数据');
    return;
  }

  try {
    await removeRoleUsersApi(record.value.id, { user_ids: ids });
    message.success('删除成功');
    gridApi.reload();
  } catch {
    /* 网络/业务错误已由拦截器弹窗，这里可不处理 */
  }
};

defineExpose(DrawerApi);
</script>
<template>
  <div>
    <Drawer class="w-[60%]" title="成员管理">
      <Grid>
        <template #toolbar-buttons>
          <TableAction
            :actions="[
              {
                label: '添加用户',
                type: 'primary',
                icon: 'ep:plus',
                auth: ['admin', 'sys:rbac:saveUserRole'],
                onClick: handleAdd.bind(null),
              },
            ]"
            :drop-down-actions="[
              {
                label: '移除用户',
                icon: 'ep:delete',
                ifShow: hasTopTableDropDownActions,
                auth: ['admin', 'sys:rbac:removeUserRole'],
                popConfirm: {
                  title: '确定移除用户吗？',
                  confirm: handleRemoveUserRole.bind(null, false),
                },
              },
            ]"
          >
            <template #more>
              <Button style="margin-left: 8px">
                批量操作
                <IconifyIcon icon="ep:arrow-down" />
              </Button>
            </template>
          </TableAction>
        </template>
        <template #ACTION="{ row }">
          <TableAction
            :actions="[
              {
                label: '移除用户',
                type: 'primary',
                link: true,
                icon: 'ep:delete',
                size: 'small',
                auth: ['admin', 'sys:rbac:removeUserRole'],
                popConfirm: {
                  title: '确定移除用户吗？',
                  confirm: handleRemoveUserRole.bind(null, row),
                },
              },
            ]"
          />
        </template>
        <template #toolbar-tools></template>
      </Grid>
    </Drawer>
    <AddUser ref="addUserRef" />
  </div>
</template>
