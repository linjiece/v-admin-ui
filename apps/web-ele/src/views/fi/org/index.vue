<script lang="ts" setup>
import type { FiOrgResponse } from '#/api/fi/org';

import { ref } from 'vue';

import { Page } from '@vben/common-ui';
import { Edit, Trash2 } from '@vben/icons';
import { $t } from '@vben/locales';

import { ElButton, ElMessage, ElMessageBox, ElTag } from 'element-plus';

import { fetchFiOrgListApi } from '#/api/fi/org';
import { useMyTable } from '#/components/table';

import {
  getBelongedOrgOptions,
  getSectorOptions,
  useSearchFormSchema,
  useTableColumns,
} from './data';
import OrgForm from './modules/org-form-modal.vue';

defineOptions({ name: 'FiOrg' });

const orgFormRef = ref<InstanceType<typeof OrgForm>>();

const belongedOrgOptions = getBelongedOrgOptions();
const sectorOptions = getSectorOptions();

type TagType = 'danger' | 'info' | 'primary' | 'success' | 'warning';

function getStatusTagType(value: boolean): TagType {
  return value ? 'success' : 'danger';
}

function getStatusTagLabel(value: boolean): string {
  return value ? $t('common.enabled') : $t('common.disabled');
}

function onEdit(row: FiOrgResponse) {
  orgFormRef.value?.open(row);
}

function onDelete(row: FiOrgResponse) {
  ElMessageBox.confirm(
    $t('ui.actionMessage.deleteConfirm', [row.org_name]),
    $t('common.delete'),
    {
      confirmButtonText: $t('common.confirm'),
      cancelButtonText: $t('common.cancel'),
      type: 'warning',
    },
  )
    .then(async () => {
      try {
        ElMessage.success($t('ui.actionMessage.deleteSuccess', [row.org_name]));
        refreshGrid();
      } catch {
        ElMessage.error($t('ui.actionMessage.deleteError'));
      }
    })
    .catch(() => {});
}

const fetchOrgList = async (params: any) => {
  const res = await fetchFiOrgListApi({
    page: params.page.currentPage,
    pageSize: params.page.pageSize,
    org_code: params.form?.org_code,
    org_name: params.form?.org_name,
    belonged_org: params.form?.belonged_org,
    sector: params.form?.sector,
  });
  return {
    items: res.items,
    total: res.total,
  };
};

const [Grid, gridApi] = useMyTable({
  gridOptions: {
    columns: useTableColumns(),
    border: true,
    stripe: true,
    showSelection: false,
    showIndex: true,
    proxyConfig: {
      autoLoad: true,
      ajax: {
        query: fetchOrgList,
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
    <OrgForm ref="orgFormRef" @success="refreshGrid" />

    <Grid>
      <template #cell-status="{ row }">
        <ElTag :type="getStatusTagType(row.status)" size="small">
          {{ getStatusTagLabel(row.status) }}
        </ElTag>
      </template>

      <template #cell-actions="{ row }">
        <ElButton link type="primary" :icon="Edit" @click="onEdit(row)">
          {{ $t('common.edit') }}
        </ElButton>
        <ElButton link type="danger" :icon="Trash2" @click="onDelete(row)">
          {{ $t('common.delete') }}
        </ElButton>
      </template>
    </Grid>
  </Page>
</template>
