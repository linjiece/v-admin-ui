<script setup lang="ts">
import type { RobotAccount } from '#/api/fi/robot';

import { ref } from 'vue';

import { useAccess } from '@vben/access';
import { Page } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { ElButton, ElTag } from 'element-plus';

import { getRobotAccountListApi } from '#/api/fi/robot';
import { useMyTable } from '#/components/table';

import {
  getStatusOptions,
  useMyTableColumns,
  useSearchFormSchema,
} from './data';
import AccessAuthorize from './modules/access-authorize.vue';
import FunctionAuthorize from './modules/function-authorize.vue';
import RobotAccountForm from './modules/robot-account-form.vue';

defineOptions({ name: 'RobotAccount' });

const { hasAccessByCodes } = useAccess();

const robotFormRef = ref<InstanceType<typeof RobotAccountForm>>();
const authorizeRef = ref();
const accessRef = ref();

const statusOptions = getStatusOptions();

type TagType = 'danger' | 'info' | 'primary' | 'success' | 'warning';

function getTagType(value: any, options: any[]): TagType {
  const option = options.find((o) => o.value === value);
  return (option?.type as TagType) || 'info';
}

function getTagLabel(value: any, options: any[]): string {
  const option = options.find((o) => o.value === value);
  return option?.label || String(value);
}

function onEdit(row: RobotAccount) {
  robotFormRef.value?.open(row);
}

function onCreate() {
  robotFormRef.value?.open();
}

function onFunctionAuthorize(row: RobotAccount) {
  authorizeRef.value?.open(row);
}

function onAccessAuthorize(row: RobotAccount) {
  accessRef.value?.open(row);
}

const fetchRobotAccountList = async (params: any) => {
  const res = await getRobotAccountListApi({
    page: params.page.currentPage,
    pageSize: params.page.pageSize,
    account: params.form?.account,
    name: params.form?.name,
    status: params.form?.status,
  });
  return {
    items: res.items,
    total: res.total,
  };
};

const [Grid, gridApi] = useMyTable({
  gridOptions: {
    columns: useMyTableColumns(),
    border: true,
    stripe: true,
    showSelection: true,
    showIndex: true,
    proxyConfig: {
      autoLoad: true,
      ajax: {
        query: fetchRobotAccountList,
      },
    },
    pagerConfig: {
      enabled: true,
      pageSize: 20,
    },
    toolbarConfig: {
      search: true,
      refresh: true,
      zoom: true,
      custom: true,
    },
  },
  formOptions: {
    schema: useSearchFormSchema(),
    showCollapseButton: false,
    submitOnChange: false,
  },
});

function refreshGrid() {
  gridApi.reload();
}
</script>

<template>
  <Page auto-content-height>
    <RobotAccountForm ref="robotFormRef" @success="refreshGrid" />
    <FunctionAuthorize ref="authorizeRef" />
    <AccessAuthorize ref="accessRef" />

    <Grid>
      <template #toolbar-actions>
        <ElButton
          v-if="hasAccessByCodes(['robot:create'])"
          type="primary"
          @click="onCreate"
        >
          {{ $t('ui.actionTitle.create', ['机器人账号']) }}
        </ElButton>
      </template>

      <template #cell-status="{ row }">
        <ElTag :type="getTagType(row.status, statusOptions)" size="small">
          {{ getTagLabel(row.status, statusOptions) }}
        </ElTag>
      </template>

      <template #cell-current_job="{ row }">
        <span v-if="row.current_job">{{ row.current_job }}</span>
        <span v-else>-</span>
      </template>

      <template #cell-last_active_time="{ row }">
        <span v-if="row.last_active_time">{{ row.last_active_time }}</span>
        <span v-else>-</span>
      </template>

      <template #cell-actions="{ row }">
        <ElButton
          v-if="hasAccessByCodes(['robot:authorize'])"
          link
          type="primary"
          @click="onFunctionAuthorize(row)"
        >
          功能授权
        </ElButton>
        <ElButton
          v-if="hasAccessByCodes(['robot:access'])"
          link
          type="primary"
          @click="onAccessAuthorize(row)"
        >
          访问
        </ElButton>
      </template>
    </Grid>
  </Page>
</template>
