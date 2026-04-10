<script lang="ts" setup>
import type { VbenFormProps } from '#/adapter/form';
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';
import type { FiOrgResponse } from '#/api/fi/org';

import { ref } from 'vue';

import { Page } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { ElButton, ElTag } from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { fetchFiOrgListApi } from '#/api/fi/org';

import { useSearchFormSchema, useTableColumns } from './data';
import OrgFormModal from './modules/org-form-modal.vue';

defineOptions({ name: 'FiOrg' });

const searchSchema = useSearchFormSchema();
const tableColumns = useTableColumns();

const loading = ref(false);
const orgFormModalRef = ref<InstanceType<typeof OrgFormModal>>();

const formOptions: VbenFormProps = {
  collapsed: true,
  commonConfig: {
    labelWidth: 100,
    componentProps: {
      class: 'w-full',
    },
  },
  schema: searchSchema,
};

const gridOptions: VxeGridProps<FiOrgResponse> = {
  columns: tableColumns,
  toolbarConfig: {
    refresh: true,
    print: false,
    export: false,
    zoom: true,
    slots: {
      buttons: 'toolbar-buttons',
    },
  },
  border: false,
  height: 'auto',
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues) => {
        loading.value = true;
        try {
          const params = {
            page: page.currentPage,
            pageSize: page.pageSize,
            org_code: formValues.org_code,
            org_name: formValues.org_name,
            belonged_org: formValues.belonged_org,
            sector: formValues.sector,
          };
          return await fetchFiOrgListApi(params);
        } finally {
          loading.value = false;
        }
      },
    },
  },
};

const gridEvents: VxeGridListeners<FiOrgResponse> = {};

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions,
  gridOptions,
  gridEvents,
});

function handleSearch() {
  gridApi.reload();
}

function handleReset() {
  gridApi.reset();
  gridApi.reload();
}

function handleEdit(row: FiOrgResponse) {
  orgFormModalRef.value?.open(row);
}

function handleSuccess() {
  gridApi.reload();
}
</script>

<template>
  <Page auto-content-height>
    <Grid :loading="loading" @search="handleSearch" @reset="handleReset">
      <template #toolbar-buttons>
        <div></div>
      </template>
      <template #status="{ row }">
        <ElTag :type="row.status ? 'success' : 'danger'">
          {{ row.status ? $t('common.enabled') : $t('common.disabled') }}
        </ElTag>
      </template>
      <template #operation="{ row }">
        <ElButton type="primary" link @click="handleEdit(row)">
          {{ $t('common.edit') }}
        </ElButton>
      </template>
    </Grid>
  </Page>
  <OrgFormModal ref="orgFormModalRef" @success="handleSuccess" />
</template>
