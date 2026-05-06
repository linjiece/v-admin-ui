<script lang="ts" setup>
import type { FiOrgResponse } from '#/api/fi/org';

import { ref } from 'vue';

import { Page } from '@vben/common-ui';
import { Download, Edit, Trash2 } from '@vben/icons';
import { $t } from '@vben/locales';

import { ElButton, ElMessage, ElMessageBox, ElTag } from 'element-plus';

import { exportFiOrgApi, fetchFiOrgListApi } from '#/api/fi/org';
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

const sortState = ref<{ orderBy?: string; orderDir?: string }>({});

function handleSortChange({ prop, order }: { order: string; prop: string }) {
  sortState.value =
    order && prop
      ? {
          orderBy: prop,
          orderDir: order === 'ascending' ? 'asc' : 'desc',
        }
      : {};
  refreshGrid();
}

const fetchOrgList = async (params: any) => {
  const res = await fetchFiOrgListApi({
    page: params.page.currentPage,
    pageSize: params.page.pageSize,
    org_code: params.form?.org_code,
    org_name: params.form?.org_name,
    belonged_org: params.form?.belonged_org,
    sector: params.form?.sector,
    ...sortState.value,
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

async function handleExport() {
  try {
    const formValues = (await gridApi.formApi.getValues?.()) || {};
    const blob = await exportFiOrgApi({
      org_code: formValues.org_code,
      org_name: formValues.org_name,
      belonged_org: formValues.belonged_org,
      sector: formValues.sector,
      ...sortState.value,
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `org-list-${Date.now()}.xlsx`;
    document.body.append(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    ElMessage.success($t('ui.actionMessage.exportSuccess'));
  } catch {
    ElMessage.error($t('ui.actionMessage.exportError'));
  }
}
</script>

<template>
  <Page auto-content-height>
    <OrgForm ref="orgFormRef" @success="refreshGrid" />

    <Grid @sort-change="handleSortChange">
      <template #toolbar-tools>
        <ElButton
          circle
          :icon="Download"
          @click="handleExport"
          :title="$t('common.export')"
        />
      </template>

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
