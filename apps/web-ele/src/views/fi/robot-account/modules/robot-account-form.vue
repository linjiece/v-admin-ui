<script setup lang="ts">
import type {
  createRobotAccountApi,
  RobotAccount,
  updateRobotAccountApi,
} from '#/api/fi/robot';

import { ref } from 'vue';

import { useAccess } from '@vben/access';

import { ElButton, ElMessage } from 'element-plus';

import { useVbenForm } from '#/adapter/form';
import { MyDrawer } from '#/components/drawer';

import { getFormSchema } from '../data';

defineOptions({ name: 'RobotAccountForm' });

const emit = defineEmits<{
  success: [];
}>();

const { hasAccessByCodes } = useAccess();
const isEditing = ref(false);
const visible = ref(false);
const currentId = ref<null | string>(null);

const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
  },
  schema: getFormSchema(),
  async beforeOpen() {
    const values = await formApi.getValues();
    isEditing.value = !!values.account;
  },
  async handleSubmit(values) {
    try {
      if (isEditing.value && currentId.value) {
        await updateRobotAccountApi(currentId.value, values);
        ElMessage.success('更新成功');
      } else {
        await createRobotAccountApi(values);
        ElMessage.success('创建成功');
      }
      visible.value = false;
      emit('success');
    } catch {
      ElMessage.error(isEditing.value ? '更新失败' : '创建失败');
    }
  },
});

async function open(row?: RobotAccount) {
  visible.value = true;
  if (row) {
    currentId.value = row.id;
    await nextTick();
    await formApi.setValues(row);
  } else {
    currentId.value = null;
    await nextTick();
    await formApi.resetForm();
  }
}

function close() {
  visible.value = false;
  currentId.value = null;
}

defineExpose({ open, close });
</script>

<template>
  <MyDrawer
    v-model:open="visible"
    :title="isEditing ? '编辑机器人账号' : '新建机器人账号'"
    :width="500"
    @close="close"
  >
    <Form />
    <template #footer>
      <ElButton @click="close">取消</ElButton>
      <ElButton
        v-if="hasAccessByCodes(['robot:create', 'robot:edit'])"
        type="primary"
        @click="formApi.handleSubmit"
      >
        确定
      </ElButton>
    </template>
  </MyDrawer>
</template>
