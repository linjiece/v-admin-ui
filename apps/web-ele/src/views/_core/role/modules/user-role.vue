<script lang="ts" setup>
import type { VbenFormProps } from '#/adapter/form';
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { IconifyIcon } from '@vben/icons';
import { $t } from '@vben/locales';

import { ElButton as Button, ElMessage as message } from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getRoleUsersApi, removeRoleUsersApi } from '#/api/core/role';
import { TableAction } from '#/components/table-action';

import AddUser from './add-user-modal.vue';

const tAccount = $t('user.account');
const tAccountPlaceholder = $t('user.accountPlaceholder');
const tName = $t('user.name');
const tNamePlaceholder = $t('user.namePlaceholder');
const tOperate = $t('user.operation');

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
      label: tAccount,
      componentProps: {
        placeholder: tAccountPlaceholder,
        allowClear: true,
      },
    },
    {
      component: 'Input',
      fieldName: 'name',
      label: tName,
      componentProps: {
        placeholder: tNamePlaceholder,
        allowClear: true,
      },
    },
  ],
};
const gridOptions: VxeGridProps<any> = {
  columns: [
    { type: 'checkbox', width: 60 },
    { field: 'username', title: tAccount },
    { field: 'name', title: tName },
    {
      width: 160,
      title: tOperate,
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
    message.info($t('user.selectUserToDelete'));
    return;
  }

  try {
    await removeRoleUsersApi(record.value.id, { user_ids: ids });
    message.success($t('common.deleteSuccess'));
    gridApi.reload();
  } catch {
    /* 网络/业务错误已由拦截器弹窗，这里可不处理 */
  }
};

defineExpose(DrawerApi);
</script>
<template>
  <div>
    <Drawer class="w-[60%]" :title="$t('user.title')">
      <Grid>
        <template #toolbar-buttons>
          <TableAction
            :actions="[
              {
                label: $t('role.user.addUser'),
                type: 'primary',
                icon: 'ep:plus',
                auth: ['admin', 'role:create_users_by_role_id'],
                onClick: handleAdd.bind(null),
              },
            ]"
            :drop-down-actions="[
              {
                label: $t('role.user.removeUser'),
                icon: 'ep:delete',
                ifShow: hasTopTableDropDownActions,
                auth: ['admin', 'role:delete_users_by_role_id'],
                popConfirm: {
                  title: $t('role.user.removeUserConfirm'),
                  confirm: handleRemoveUserRole.bind(null, false),
                },
              },
            ]"
          >
            <template #more>
              <Button style="margin-left: 8px">
                $t('common.batchOperations')
                <IconifyIcon icon="ep:arrow-down" />
              </Button>
            </template>
          </TableAction>
        </template>
        <template #ACTION="{ row }">
          <TableAction
            :actions="[
              {
                label: $t('role.user.removeUser'),
                type: 'primary',
                link: true,
                icon: 'ep:delete',
                size: 'small',
                auth: ['admin', 'role:delete_users_by_role_id'],
                popConfirm: {
                  title: $t('role.user.removeUserConfirm'),
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
