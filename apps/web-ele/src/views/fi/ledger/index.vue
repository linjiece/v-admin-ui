<script setup lang="ts">
import { nextTick, reactive, ref, watch } from 'vue';

import { ElMessage } from 'element-plus';

type Plan = {
  acctSetCode?: string;
  acctSetName?: string;
  createdAt?: string;
  id: string;
  orgCode?: string;
  orgName?: string;
  title?: string;
};

const form = reactive({
  orgCode: '',
  orgName: '',
  acctSetCode: '',
  acctSetName: '',
});
const plans = ref<Plan[]>([]);

const drawerVisible = ref(false);
const activePlan = ref<null | Plan>(null);
const nodes = ref<Array<{ id: string; name: string }>>([]);
const logs = ref<string[]>([]);
let eventSource: EventSource | null = null;

const logsBox = ref<HTMLElement | null>(null);

function appendLog(line: string) {
  logs.value.push(line);
  nextTick(() => {
    if (logsBox.value) logsBox.value.scrollTop = logsBox.value.scrollHeight;
  });
}

async function onOrgCodeBlur() {
  const code = form.orgCode && form.orgCode.trim();
  if (!code) return;
  try {
    const res = await fetch(`/api/org/info?code=${encodeURIComponent(code)}`);
    if (!res.ok) throw new Error('fetch org info failed');
    const data = await res.json();
    form.orgName = data.orgName || '';
    form.acctSetCode = data.acctSetCode || '';
    form.acctSetName = data.acctSetName || '';
  } catch (error) {
    console.error(error);
  }
}

async function onGeneratePlan() {
  if (!form.orgCode) {
    ElMessage.warning('请先输入行政组织编码');
    return;
  }
  try {
    const payload = {
      orgCode: form.orgCode,
      orgName: form.orgName,
      acctSetCode: form.acctSetCode,
      acctSetName: form.acctSetName,
    };
    const res = await fetch('/api/plan/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('生成失败');
    const data = await res.json();
    const plan: Plan = {
      id: data.id || Date.now().toString(),
      title: data.title || undefined,
      orgCode: form.orgCode,
      orgName: form.orgName,
      acctSetCode: form.acctSetCode,
      acctSetName: form.acctSetName,
      createdAt: new Date().toLocaleString(),
    };
    plans.value.unshift(plan);
    ElMessage.success('编排计划已生成');
  } catch (error) {
    console.error(error);
    ElMessage.error('生成编排计划失败');
  }
}

function onCardCommand(plan: Plan, command: string) {
  if (command === 'execute') {
    openExecuteDrawer(plan);
  } else if (command === 'delete') {
    onDeletePlan(plan);
  }
}

async function onDeletePlan(plan: Plan) {
  try {
    const res = await fetch(`/api/plan/${plan.id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('delete failed');
    plans.value = plans.value.filter((p) => p.id !== plan.id);
    ElMessage.success('已删除');
  } catch (error) {
    console.error(error);
    ElMessage.error('删除失败');
  }
}

async function openExecuteDrawer(plan: Plan) {
  activePlan.value = plan;
  drawerVisible.value = true;
  logs.value = [];
  nodes.value = [];
  // fetch nodes
  try {
    const res = await fetch(`/api/plan/${plan.id}/nodes`);
    if (!res.ok) throw new Error('fetch nodes failed');
    const data = await res.json();
    nodes.value = data.nodes || [];
  } catch (error) {
    console.error(error);
  }

  // start logs via EventSource (server-sent events) if supported by backend
  try {
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
    eventSource = new EventSource(`/api/plan/${plan.id}/events`);
    eventSource.onmessage = (ev) => {
      appendLog(ev.data);
    };
    eventSource.onerror = (ev) => {
      appendLog('[连接已断开]');
      eventSource && eventSource.close();
      eventSource = null;
    };
    // optionally trigger execute start
    await fetch(`/api/plan/${plan.id}/execute`, { method: 'POST' });
  } catch (error) {
    console.error(error);
    appendLog('[无法建立日志流]');
  }
}

watch(drawerVisible, (val) => {
  if (!val && eventSource) {
    eventSource.close();
    eventSource = null;
  }
});
</script>

<template>
  <div class="ledger-page">
    <el-card shadow="hover" class="top-form-card">
      <el-form :model="form" label-width="140px" class="top-form">
        <el-form-item label="行政组织编码">
          <el-input
            v-model="form.orgCode"
            @blur="onOrgCodeBlur"
            placeholder="输入行政组织编码"
          />
        </el-form-item>
        <el-form-item label="行政组织名称">
          <el-input v-model="form.orgName" disabled />
        </el-form-item>
        <el-form-item label="核算账套编码">
          <el-input v-model="form.acctSetCode" disabled />
        </el-form-item>
        <el-form-item label="核算账套名称">
          <el-input v-model="form.acctSetName" disabled />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onGeneratePlan">
            生成编排计划
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <div class="plans-list">
      <el-row :gutter="16">
        <el-col :span="8" v-for="plan in plans" :key="plan.id">
          <el-card class="plan-card" shadow="always">
            <template #header>
              <div class="card-header">
                <div>{{ plan.title || `编排单 ${plan.id}` }}</div>
                <el-dropdown @command="onCardCommand(plan, $event)">
                  <span class="el-dropdown-link">
                    操作<i class="el-icon-arrow-down el-icon--right"></i>
                  </span>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="execute">
                        编排
                      </el-dropdown-item>
                      <el-dropdown-item command="delete">删除</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </template>

            <div class="card-body">
              <p><strong>行政组织：</strong>{{ plan.orgName }}</p>
              <p>
                <strong>账套：</strong>{{ plan.acctSetCode }} -
                {{ plan.acctSetName }}
              </p>
              <p><strong>生成时间：</strong>{{ plan.createdAt || '-' }}</p>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <el-drawer v-model:visible="drawerVisible" :with-header="false" size="60%">
      <div class="drawer-content">
        <div class="drawer-top">
          <h3>编排流程 - {{ activePlan?.id || '' }}</h3>
          <el-divider />
          <div class="flow-nodes">
            <div v-for="(node, idx) in nodes" :key="node.id" class="flow-node">
              <div class="node-box">{{ node.name }}</div>
              <div v-if="idx < nodes.length - 1" class="arrow">→</div>
            </div>
          </div>
        </div>

        <div class="drawer-bottom">
          <h4>实时日志</h4>
          <div class="logs-box" ref="logsBox">
            <div v-for="(line, i) in logs" :key="i" class="log-line">
              {{ line }}
            </div>
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<style scoped>
.ledger-page {
  padding: 16px;
}

.top-form-card {
  margin-bottom: 16px;
}

.top-form .el-form-item {
  max-width: 800px;
}

.plans-list {
  margin-top: 16px;
}

.plan-card {
  position: relative;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-body p {
  margin: 6px 0;
}

.drawer-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.drawer-top {
  padding: 16px;
}

.flow-nodes {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.flow-node {
  display: flex;
  align-items: center;
}

.node-box {
  padding: 10px 14px;
  background: #f5f7fa;
  border-radius: 4px;
}

.arrow {
  margin: 0 6px;
}

.drawer-bottom {
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 16px;
}

.logs-box {
  height: 100%;
  padding: 12px;
  overflow: auto;
  color: #0f0;
  background: #000;
  border-radius: 4px;
}

.log-line {
  font-family: monospace;
  font-size: 12px;
  white-space: pre-wrap;
}
</style>
