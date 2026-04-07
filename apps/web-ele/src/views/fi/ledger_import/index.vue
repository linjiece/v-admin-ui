<script setup lang="ts">
import type { StatusType } from './modules/StatusCard.vue';

import type { TaskResponse } from '#/api/fi/task';

import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

import { Page } from '@vben/common-ui';

import { Refresh } from '@element-plus/icons-vue';
import {
  ElButton,
  ElCard,
  ElEmpty,
  ElMessage,
  ElPagination,
} from 'element-plus';

import { useVbenForm } from '#/adapter/form';
import { fetchOrgApi } from '#/api/fi/org';
import { createTask, getPendingTasks } from '#/api/fi/task';

import { getCascaderOptions } from './data';
import StatusCard from './modules/StatusCard.vue';
// 表单配置
const [Form, formApi] = useVbenForm({
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
    // 调整标签宽度，适应两列布局
    labelWidth: 100,
    // 标签样式：完全居左对齐，不靠近输入框
    // labelClass: '!justify-start !text-left !items-start !mr-6',
  },
  layout: 'horizontal',
  // 响应式布局配置
  // grid-cols-1: 小屏幕1列
  // md:grid-cols-2: 中等屏幕768px以上2列
  // lg:grid-cols-2: 大屏幕1024px以上2列
  // gap-4: 组件间距16px
  // 可以根据需要调整，比如：
  // 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 表示更复杂的响应式布局
  wrapperClass: 'grid-cols-1 md:grid-cols-2 gap-4',
  schema: [
    {
      fieldName: 'companyCode',
      label: '成员单位  ',
      component: 'Cascader',
      componentProps: {
        options: getCascaderOptions(),
        placeholder: '请选择成员单位',
        props: {
          expandTrigger: 'hover',
          multiple: false,
          checkStrictly: false,
          showAllLevels: false,
        },
      },
      rules: 'required',
    },
    {
      fieldName: 'orgCode',
      label: '行政组织编码',
      component: 'Input',
      componentProps: {
        placeholder: '请输入行政组织编码',
        clearable: true,
        onChange: handleSearch,
      },
      rules: 'required',
    },
    {
      fieldName: 'orgId',
      label: '行政组织ID',
      component: 'Input',
      componentProps: { disabled: true },
      rules: 'required',
    },
    {
      fieldName: 'orgName',
      label: '行政组织名称',
      component: 'Input',
      componentProps: { disabled: true },
      rules: 'required',
    },
    {
      fieldName: 'acctLedgerCode',
      label: '核算套账编码',
      component: 'Input',
      componentProps: { disabled: true },
      rules: 'required',
    },
    {
      fieldName: 'acctLedgerName',
      label: '核算套账名称',
      component: 'Input',
      componentProps: { disabled: true },
      rules: 'required',
    },
  ],
  handleSubmit: handleSave,
});

// 数据列表
const dataList = ref<TaskResponse[]>([]);
const loading = ref(false);
const pagination = reactive({
  current: 1,
  total: 0,
  pageSize: 10,
});

// 加载卡片列表
async function loadCardList() {
  try {
    loading.value = true;
    // 调用API获取数据
    const response = await getPendingTasks();
    // 检查返回数据
    if (!response || !Array.isArray(response)) {
      console.warn('API返回数据格式不正确:', response);
      dataList.value = [];
      pagination.total = 0;
      return;
    }
    // 转换数据格式（假设API返回OrgInfo数组）
    const allData = response;
    // 前端分页处理
    const startIndex = (pagination.current - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    dataList.value = allData.slice(startIndex, endIndex);
    pagination.total = allData.length;
    // 如果当前页没有数据但总数大于0，跳转到第一页
    if (dataList.value.length === 0 && pagination.total > 0) {
      pagination.current = 1;
      const newStartIndex = 0;
      const newEndIndex = pagination.pageSize;
      dataList.value = allData.slice(newStartIndex, newEndIndex);
    }
  } catch (error) {
    console.error('加载卡片列表失败:', error);
    ElMessage.error('加载卡片列表失败，请稍后重试');
    dataList.value = [];
    pagination.total = 0;
  } finally {
    loading.value = false;
  }
}

// 查询
async function handleSearch() {
  const values = await formApi.getValues();
  const orgCode = values.orgCode;
  if (!orgCode) {
    ElMessage.warning('请输入行政组织编码');
    return;
  }

  try {
    const data = await fetchOrgApi(orgCode);
    await formApi.setValues({
      orgCode,
      orgName: data.orgName,
      orgId: data.orgId,
      acctLedgerCode: data.acctLedgerCode,
      acctLedgerName: data.acctLedgerName,
    });
  } catch (error) {
    console.error(error);
    ElMessage.error('获取行政组织信息失败');
    await handleReset();
  }
}

// 重置
async function handleReset() {
  await formApi.resetForm();
}

async function handleSave() {
  const values = await formApi.getValues();
  const data = {
    biz_id: values.orgCode,
    task_name: '账套纳入',
    task_type: 'ledger_import',
    biz_info: {
      orgId: values.orgId,
      orgCode: values.orgCode,
      orgName: values.orgName,
      acctLedgerCode: values.acctLedgerCode,
      acctLedgerName: values.acctLedgerName,
    },
  };
  await createTask(data as any);
  ElMessage.success('导入成功');
  // 导入成功后刷新卡片列表
  await loadCardList();
  // 重置表单
  await handleReset();
}

const router = useRouter();
function handleEdit(item: TaskResponse) {
  router.push(`/fi/task/detail/${item.task_id}`);
}

function handleDelete(item: TaskResponse) {
  ElMessage.info(`删除 ${item.task_id}`);
}
// 分页变化处理
function handlePageChange() {
  // 重新加载当前页的数据
  loadCardList();
}

// 生命周期钩子：组件挂载时自动加载卡片列表
onMounted(() => {
  loadCardList();
});
</script>

<template>
  <Page>
    <!-- 搜索表单 -->
    <ElCard shadow="never" class="mb-4">
      <template #header>
        <span>账套纳入</span>
      </template>
      <Form />
    </ElCard>

    <!-- 卡片列表 -->
    <ElCard shadow="never" v-loading="loading">
      <template #header>
        <div class="card-header-title">
          <span>编排计划单</span>
          <ElButton :icon="Refresh" circle size="small" @click="loadCardList" />
        </div>
      </template>

      <!-- 空状态 -->
      <div v-if="!loading && dataList.length === 0" class="empty-state">
        <ElEmpty description="暂无数据" />
      </div>
      <div v-else class="card-grid">
        <StatusCard
          v-for="item in dataList"
          :key="item.task_id"
          :data="item"
          :status="item.status.toLowerCase() as StatusType"
          :title="item.task_name"
          :subtitle="item.task_id"
          :description="item.biz_info.orgName"
          :time="item.created_at"
          @detail="handleEdit(item)"
          @delete="handleDelete(item)"
          @edit="handleEdit(item)"
        />
      </div>
      <!-- 空状态 -->
      <div v-if="!loading && dataList.length === 0" class="empty-state">
        <ElEmpty description="暂无数据" />
      </div>
      <!-- 分页 -->
      <div class="pagination-wrapper" v-if="pagination.total > 0">
        <ElPagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          :page-sizes="[10]"
          @current-change="handlePageChange"
          @size-change="handlePageChange"
        />
      </div>
    </ElCard>
  </Page>
</template>

<style scoped>
.mb-4 {
  margin-bottom: 16px;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.data-card {
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-body {
  flex: 1;
  font-size: 14px;
  line-height: 1.6;
  color: #666;
}

.card-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.card-header-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.empty-state {
  padding: 40px 0;
  text-align: center;
}
</style>
