<template>
  <div class="space-y-5">
    <BasePageHeader title="我的执行单" subtitle="实验员工作台">
      <template #extra>
        <BaseButton variant="primary" @click="refresh">刷新</BaseButton>
      </template>
    </BasePageHeader>

    <BaseSummaryCard :cards="summaryCards" />

    <BaseCard>
      <div class="flex gap-3 flex-wrap items-end mb-4">
        <BaseFormField label="搜索" placeholder="执行单编号 / 考察项" v-model="search" style="width:200px;" />
        <BaseFormField label="状态" type="select" :options="statusOpts" v-model="statusFilter" style="width:120px;" />
        <BaseButton variant="primary" size="sm">查询</BaseButton>
        <BaseButton variant="secondary" size="sm">重置</BaseButton>
      </div>
      <BaseTable :data="filteredSheets" :columns="columns" :loading="loading">
        <template #cell-status="{ row }">
          <BaseTag :tone="statusTone(row.status)">{{ statusLabel(row.status) }}</BaseTag>
        </template>
        <template #cell-actions="{ row }">
          <button v-if="row.status === 'pending' || row.status === 'executing'" class="text-[--primary] text-xs font-medium hover:underline" @click="executeSheet(row)">执行</button>
          <button v-if="row.status === 'submitted'" class="text-[--info] text-xs font-medium hover:underline" @click="reviewSheet(row)">复核</button>
          <button class="text-[--muted-foreground] text-xs hover:underline ml-2">详情</button>
        </template>
      </BaseTable>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import BasePageHeader from '@/components/base/BasePageHeader.vue';
import BaseSummaryCard from '@/components/base/BaseSummaryCard.vue';
import BaseCard from '@/components/base/BaseCard.vue';
import BaseTable from '@/components/base/BaseTable.vue';
import BaseFormField from '@/components/base/BaseFormField.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseTag from '@/components/base/BaseTag.vue';
import { dailySheets } from '@/api/mock/sheets';
import type { SheetStatus } from '@/types/experiments';

const router = useRouter();
const search = ref('');
const statusFilter = ref('');
const loading = ref(false);

const summaryCards = [
  { label: '今日待执行', value: dailySheets.filter((s: any) => s.date === '2026-08-12' && s.status === 'pending').length },
  { label: '执行中', value: dailySheets.filter((s: any) => s.status === 'executing').length },
  { label: '待复核', value: dailySheets.filter((s: any) => s.status === 'submitted').length },
  { label: '已完成', value: dailySheets.filter((s: any) => s.status === 'passed').length },
];

const columns = [
  { key: 'id', label: '执行单编号' },
  { key: 'itemName', label: '考察项' },
  { key: 'formTemplate', label: '表单模板' },
  { key: 'sampleBatch', label: '样本批次' },
  { key: 'instrument', label: '仪器' },
  { key: 'status', label: '状态' },
  { key: 'actions', label: '操作' },
];

const statusOpts = [
  { label: '全部', value: '' },
  { label: '待执行', value: 'pending' },
  { label: '执行中', value: 'executing' },
  { label: '已提交', value: 'submitted' },
  { label: '已完成', value: 'passed' },
];

function statusLabel(s: SheetStatus): string {
  const map: Record<string, string> = { pending: '待执行', executing: '执行中', submitted: '已提交', reviewing: '复核中', passed: '已通过', rejected: '已驳回' };
  return map[s] ?? s;
}
function statusTone(s: SheetStatus): 'warning' | 'info' | 'success' | 'danger' | 'neutral' {
  const map: Record<string, 'warning' | 'info' | 'success' | 'danger' | 'neutral'> = { pending: 'warning', executing: 'info', submitted: 'info', reviewing: 'info', passed: 'success', rejected: 'danger' };
  return map[s] ?? 'neutral';
}

const filteredSheets = computed(() =>
  dailySheets.filter((s: any) => {
    if (search.value && !s.id.includes(search.value) && !s.itemName.includes(search.value)) return false;
    if (statusFilter.value && s.status !== statusFilter.value) return false;
    return true;
  }).map((s: any) => ({ ...s, complete: s.status === 'submitted' ? '完整' : '待复核' }))
);

function executeSheet(row: any) { router.push(`/experiments/sheets/${row.id}/execute`); }
function reviewSheet(row: any) { router.push('/experiments/review'); }
function refresh() { loading.value = true; setTimeout(() => { loading.value = false; }, 500); }
</script>
