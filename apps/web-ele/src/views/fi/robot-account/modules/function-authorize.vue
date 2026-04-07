<script setup lang="ts">
import type { RobotAccount } from '#/api/fi/robot';

import { ref } from 'vue';

import { MyDrawer } from '#/components/drawer';

import { ElDescriptions, ElDescriptionsItem, ElMessage } from 'element-plus';

defineOptions({ name: 'FunctionAuthorize' });

const visible = ref(false);
const currentRow = ref<RobotAccount | null>(null);

function open(row: RobotAccount) {
  currentRow.value = row;
  visible.value = true;
}

function close() {
  visible.value = false;
  currentRow.value = null;
}

defineExpose({ open, close });
</script>

<template>
  <MyDrawer
    v-model="visible"
    title="功能授权"
    :width="600"
    class="function-authorize-drawer"
  >
    <template v-if="currentRow">
      <ElDescriptions :column="1" border>
        <ElDescriptionsItem label="账号">
          {{ currentRow.account }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="名称">
          {{ currentRow.name }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="状态">
          {{ currentRow.status === 1 ? '启用' : '禁用' }}
        </ElDescriptionsItem>
      </ElDescriptions>
    </template>
  </MyDrawer>
</template>
