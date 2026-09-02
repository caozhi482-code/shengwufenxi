<template>
  <div class="space-y-5">
    <BasePageHeader title="偏差管理" subtitle="方法学验证过程中的偏差记录与跟踪" />

    <BaseCard>
      <div class="flex gap-3 flex-wrap items-end mb-4">
        <BaseFormField label="搜索" placeholder="偏差编号 / 考察项" v-model="search" style="width:200px;" />
        <BaseFormField label="QA状态" type="select" :options="qaOpts" v-model="qaFilter" style="width:120px;" />
        <BaseButton variant="primary" size="sm">查询</BaseButton>
        <BaseButton variant="secondary" size="sm">重置</BaseButton>
      </div>
      <BaseTable :data="filteredDeviations" :columns="columns" :loading="loading">
        <template #cell-type="{ row }">
          <BaseTag :tone="typeTone(row.type)">{{ typeLabel(row.type) }}</BaseTag>
        </template>
        <template #cell-qaStatus="{ row }">
          <BaseTag :tone="qaTone(row.qaStatus)">{{ qaLabel(row.qaStatus) }}</BaseTag>
        </template>
        <template #cell-reflectedInReport="{ row }">
          <BaseTag :tone="row.reflectedInReport ? 'warning' : 'neutral'">{{ row.reflectedInReport ? '是' : '否' }}</BaseTag>
        </template>
      </BaseTable>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import BasePageHeader from '@/components/base/BasePageHeader.vue';
import BaseCard from '@/components/base/BaseCard.vue';
import BaseTable from '@/components/base/BaseTable.vue';
import BaseFormField from '@/components/base/BaseFormField.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseTag from '@/components/base/BaseTag.vue';
import { deviations } from '@/api/mock/results';
import type { DeviationType } from '@/types/experiments';

const search = ref('');
const qaFilter = ref('');
const loading = ref(false);

const columns = [
  { key: 'code', label: '偏差编号' },
  { key: 'itemType', label: '考察项' },
  { key: 'type', label: '类型' },
  { key: 'cause', label: '原因' },
  { key: 'resolution', label: '处理措施' },
  { key: 'reflectedInReport', label: '报告体现' },
  { key: 'qaStatus', label: 'QA状态' },
];

const qaOpts = [
  { label: '全部', value: '' },
  { label: '待处理', value: 'pending' },
  { label: '已批准', value: 'approved' },
  { label: '已驳回', value: 'rejected' },
];

function typeLabel(t: DeviationType): string {
  const map: Record<string, string> = { procedure: '操作偏差', equipment: '设备偏差', reagent: '试剂偏差', sample: '样品偏差', environment: '环境偏差' };
  return map[t] ?? t;
}
function typeTone(t: DeviationType): 'warning' | 'danger' | 'info' | 'neutral' {
  const map: Record<string, 'warning' | 'danger' | 'info' | 'neutral'> = { procedure: 'warning', equipment: 'danger', reagent: 'warning', sample: 'info', environment: 'info' };
  return map[t] ?? 'neutral';
}
function qaLabel(s: 'pending' | 'approved' | 'rejected'): string {
  const map: Record<string, string> = { pending: '待处理', approved: '已批准', rejected: '已驳回' };
  return map[s] ?? s;
}
function qaTone(s: 'pending' | 'approved' | 'rejected'): 'warning' | 'success' | 'danger' {
  const map: Record<string, 'warning' | 'success' | 'danger'> = { pending: 'warning', approved: 'success', rejected: 'danger' };
  return map[s] ?? 'warning';
}

const filteredDeviations = computed(() =>
  deviations.filter((d: any) => {
    if (search.value && !d.code.includes(search.value) && !d.itemType.includes(search.value)) return false;
    if (qaFilter.value && d.qaStatus !== qaFilter.value) return false;
    return true;
  })
);
</script>
