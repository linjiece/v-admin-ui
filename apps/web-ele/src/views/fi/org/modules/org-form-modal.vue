<script lang="ts" setup>
import type { FiOrgResponse, FiOrgUpdateParams } from '#/api/fi/org';

import { computed, ref } from 'vue';

import { $t } from '@vben/locales';

import { ElButton, ElMessage } from 'element-plus';

import { useVbenForm } from '#/adapter/form';
import { updateFiOrgApi } from '#/api/fi/org';
import { MyDrawer } from '#/components/drawer';

import { useEditFormSchema } from '../data';

defineOptions({ name: 'FiOrgFormModal' });

const emit = defineEmits<{
  success: [];
}>();

const visible = ref(false);
const currentRecord = ref<FiOrgResponse>();
const confirmLoading = ref(false);

const getTitle = computed(() => {
  return currentRecord.value?.id
    ? $t('ui.actionTitle.edit', [$t('fi.org.title')])
    : $t('ui.actionTitle.create', [$t('fi.org.title')]);
});

const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
  },
  schema: useEditFormSchema(),
});

async function open(record?: FiOrgResponse) {
  visible.value = true;
  if (record) {
    currentRecord.value = record;
    await formApi.setValues({
      org_code: record.org_code,
      org_name: record.org_name,
      belonged_org: record.belonged_org,
      sector: record.sector,
      status: record.status ? $t('common.enabled') : $t('common.disabled'),
      effective_date: record.effective_date,
      expire_date: record.expire_date,
      updated_at: record.updated_at,
    });
  } else {
    currentRecord.value = undefined;
    await formApi.resetForm();
  }
}

async function onSubmit() {
  const { valid } = await formApi.validate();
  if (!valid) return;
  if (!currentRecord.value?.id) return;
  confirmLoading.value = true;
  try {
    const values = await formApi.getValues();
    const params: FiOrgUpdateParams = {
      org_name: values.org_name,
      belonged_org: values.belonged_org,
      sector: values.sector,
      expire_date: values.expire_date,
    };
    await updateFiOrgApi(currentRecord.value.id, params);
    ElMessage.success($t('common.updateSuccess'));
    visible.value = false;
    emit('success');
  } catch {
    ElMessage.error($t('common.updateError'));
  } finally {
    confirmLoading.value = false;
  }
}

function close() {
  visible.value = false;
  currentRecord.value = undefined;
}

defineExpose({ open, close });
</script>

<template>
  <MyDrawer
    v-model="visible"
    :title="getTitle"
    :width="500"
    :destroy-on-close="false"
    @close="close"
  >
    <Form />
    <template #footer>
      <ElButton @click="close">{{ $t('common.cancel') }}</ElButton>
      <ElButton type="primary" :loading="confirmLoading" @click="onSubmit">
        {{ $t('common.confirm') }}
      </ElButton>
    </template>
  </MyDrawer>
</template>
