<template>
  <div class="space-y-5">
    <BasePageHeader title="考察项任务制作" subtitle="计划：EXP-2026-001 · 布洛芬 bio 分析">
      <template #extra>
        <BaseButton variant="primary" @click="$router.push(`/experiments/plans/${planId}/tasks/new`)">+ 新建任务</BaseButton>
        <BaseButton variant="secondary" @click="batchGenerate">从方案批量生成任务</BaseButton>
      </template>
    </BasePageHeader>

    <BaseSummaryCard :cards="summaryCards" />

    <BaseCard>
      <div class="flex gap-3 flex-wrap items-center mb-4">
        <BaseFormField label="搜索" placeholder="考察项编号/名称" v-model="search" style="width:200px;" />
        <BaseFormField label="状态" type="select" :options="statusOpts" v-model="statusFilter" style="width:120px;" />
        <BaseButton variant="primary" size="sm">查询</BaseButton>
        <BaseButton variant="secondary" size="sm">重置</BaseButton>
      </div>
      <BaseTable :data="filteredTasks" :columns="columns" :loading="loading">
        <template #cell-taskName="{ row }">
          <div>
            <div class="font-medium text-[--text-main]">{{ row.taskName }}</div>
            <div class="text-xs text-[--muted-foreground]">{{ row.itemCode }} {{ row.itemName }}</div>
          </div>
        </template>
        <template #cell-taskType="{ row }">
          <BaseTag tone="neutral">{{ row.taskType }}</BaseTag>
        </template>
        <template #cell-status="{ row }">
          <BaseTag :tone="statusTone(row.status)">{{ statusLabel(row.status) }}</BaseTag>
        </template>
        <template #cell-formTemplates="{ row }">
          <div class="flex flex-wrap gap-1">
            <span v-for="ft in row.formTemplates" :key="ft" class="text-[10px] px-1.5 py-0.5 bg-[--neutral-soft] rounded text-[--muted-foreground]">{{ ft }}</span>
          </div>
        </template>
        <template #cell-instruments="{ row }">
          <span class="text-xs">{{ row.instruments.join(', ') }}</span>
        </template>
        <template #cell-actions="{ row }">
          <button class="text-[--info] text-xs font-medium hover:underline" @click="editTask(row)">编辑</button>
          <button class="text-[--primary] text-xs font-medium hover:underline ml-2" @click="executeTask(row)">执行</button>
          <button class="text-[--primary] text-xs font-medium hover:underline ml-2" @click="$router.push(`/experiments/plans/${row.planId}/tasks/new`)">复制</button>
          <button class="text-[--muted-foreground] text-xs hover:underline ml-2">删除</button>
        </template>
      </BaseTable>
    </BaseCard>

    <!-- 任务编辑抽屉 -->
    <BaseDrawer v-if="showDrawer" :open="showDrawer" title="编辑任务" @close="showDrawer = false">
      <div class="space-y-4">
        <BaseFormField label="任务名称" v-model="editForm.taskName" />
        <BaseFormField label="考察项" :options="items.map(i => ({ label: `${i.id} ${i.name}`, value: i.id }))" v-model="editForm.itemId" />
        <div class="grid grid-cols-2 gap-4">
          <BaseFormField label="实验员" type="select" :options="personOptions" v-model="editForm.investigator" />
          <BaseFormField label="计划日期" type="date" v-model="editForm.planDate" />
          <BaseFormField label="样本批次" placeholder="BL-2026-001" v-model="editForm.sampleBatch" />
          <BaseFormField label="仪器" type="select" :options="instrumentOptions" v-model="editForm.instrument" />
        </div>
      </div>
      <template #footer>
        <BaseButton variant="secondary" @click="showDrawer = false">取消</BaseButton>
        <BaseButton variant="primary" @click="saveTask">保存</BaseButton>
      </template>
    </BaseDrawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BasePageHeader from '@/components/base/BasePageHeader.vue';
import BaseSummaryCard from '@/components/base/BaseSummaryCard.vue';
import BaseCard from '@/components/base/BaseCard.vue';
import BaseTable from '@/components/base/BaseTable.vue';
import BaseFormField from '@/components/base/BaseFormField.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseTag from '@/components/base/BaseTag.vue';
import BaseDrawer from '@/components/base/BaseDrawer.vue';
import { tasks } from '@/api/mock/tasks';
import { evaluationItems } from '@/api/mock/evaluation';
import type { TaskStatus } from '@/types/experiments';

const router = useRouter();
const route = useRoute();
const search = ref('');
const statusFilter = ref('');
const loading = ref(false);
const showDrawer = ref(false);

const planId = route.params.id as string;
const planCode = (route.query.planCode as string) || planId;
const planTasks = computed(() => tasks.filter((t: any) => t.planId === planId));

const summaryCards = [
  { label: '总数', value: planTasks.value.length },
  { label: '待执行', value: planTasks.value.filter((t: any) => t.status === 'pending').length },
  { label: '执行中', value: planTasks.value.filter((t: any) => t.status === 'executing').length },
  { label: '已完成', value: planTasks.value.filter((t: any) => t.status === 'passed').length },
];

const columns = [
  { key: 'taskName', label: '任务名称 / 考察项' },
  { key: 'taskType', label: '任务类型' },
  { key: 'formTemplates', label: '表单模板' },
  { key: 'responsiblePerson', label: '负责人' },
  { key: 'investigators', label: '实验员' },
  { key: 'planDate', label: '计划日期' },
  { key: 'sampleBatch', label: '样本批次' },
  { key: 'instruments', label: '仪器' },
  { key: 'status', label: '状态' },
  { key: 'actions', label: '操作' },
];

const statusOpts = [
  { label: '全部', value: '' },
  { label: '待执行', value: 'pending' },
  { label: '执行中', value: 'executing' },
  { label: '待复核', value: 'review' },
  { label: '已完成', value: 'passed' },
];

function statusLabel(s: TaskStatus): string {
  const map: Record<string, string> = { pending: '待执行', scheduled: '已排期', executing: '执行中', review: '待复核', passed: '已完成', rejected: '已驳回', done: '已完成' };
  return map[s] ?? s;
}
function statusTone(s: TaskStatus): 'warning' | 'info' | 'success' | 'danger' | 'neutral' {
  const map: Record<string, 'warning' | 'info' | 'success' | 'danger' | 'neutral'> = { pending: 'warning', scheduled: 'warning', executing: 'info', review: 'info', passed: 'success', rejected: 'danger', done: 'success' };
  return map[s] ?? 'neutral';
}

const filteredTasks = computed(() =>
  planTasks.value.filter((t: any) => {
    if (search.value && !t.itemName.includes(search.value) && !t.itemCode.includes(search.value)) return false;
    if (statusFilter.value && t.status !== statusFilter.value) return false;
    return true;
  })
);

const editForm = ref({ itemId: '', taskName: '', investigator: '', planDate: '', sampleBatch: '', instrument: '' });

const items = computed(() => evaluationItems);
const personOptions = [{ label: '张明', value: '张明' }, { label: '李依璇', value: '李依璇' }, { label: '王芳', value: '王芳' }, { label: '赵强', value: '赵强' }];
const instrumentOptions = [{ label: 'LC-MS/MS-001', value: 'LC-MS/MS-001' }, { label: 'LC-MS/MS-002', value: 'LC-MS/MS-002' }];

function openDrawer() { showDrawer.value = true; }
function editTask(row: any) { editForm.value = { itemId: row.itemCode, taskName: row.taskName, investigator: (row.investigators as string[])[0] ?? '', planDate: row.planDate, sampleBatch: row.sampleBatch, instrument: (row.instruments as string[])[0] ?? '' }; showDrawer.value = true; }
function executeTask(row: any) {
  router.push({
    path: `/experiments/tasks/${row.id}/execute`,
    query: { planCode, projectId: 'PRJ001' },
  });
}
function saveTask() { showDrawer.value = false; }
function batchGenerate() { alert('已从方案批量生成任务（模拟）'); }
</script>
