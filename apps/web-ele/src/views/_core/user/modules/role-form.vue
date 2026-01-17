<script setup lang="ts">
import { ref, watchEffect } from 'vue';

import {
  VbenCheckbox,
  VbenCheckboxGroup,
  VbenDrawer,
  VbenSpace,
} from '@vben/components';

import { getRoleListApi } from '#/api/core/role';

interface Role {
  id: number | string;
  name: string;
}
const emit = defineEmits<{ (e: 'success', ids: (number | string)[]): void }>();

const roleList = ref<Role[]>([]);
const checkedIds = ref<(number | string)[]>([]);

/* 打开抽屉时自动拉数据 */
watchEffect(async () => {
  roleList.value = await getRoleListApi();
});

function handleOk() {
  emit('success', checkedIds.value);
}
</script>

<template>
  <VbenDrawer v-bind="$attrs" title="选择角色" @ok="handleOk">
    <VbenCheckboxGroup v-model="checkedIds">
      <VbenSpace direction="vertical">
        <VbenCheckbox v-for="item in roleList" :key="item.id" :value="item.id">
          {{ item.name }}
        </VbenCheckbox>
      </VbenSpace>
    </VbenCheckboxGroup>
  </VbenDrawer>
</template>
