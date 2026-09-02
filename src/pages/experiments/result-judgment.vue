<template>
  <div class="space-y-5">
    <BasePageHeader title="结果判定" subtitle="方法学验证结果汇总" />

    <BaseSummaryCard :cards="summaryCards" />

    <BaseCard>
      <div class="space-y-3">
        <div v-for="r in results" :key="r.itemId"
          class="flex items-center gap-4 p-4 border border-[--border] rounded-md hover:bg-[--surface-muted] transition-colors">
          <div class="w-16 text-sm font-bold text-[--text-main]">{{ r.itemId }}</div>
          <div class="flex-1">
            <div class="text-sm font-medium text-[--text-main]">{{ r.itemName }}</div>
            <div class="text-xs text-[--muted-foreground] mt-0.5">{{ r.acceptanceCriterion }}</div>
            <div v-if="r.cv !== undefined" class="text-xs text-[--muted-foreground] mt-0.5">
              CV: {{ r.cv }}% · RE: {{ r.re }}%
            </div>
            <div v-if="r.recovery !== undefined" class="text-xs text-[--muted-foreground]">
              回收率: {{ r.recovery }}%
            </div>
            <div v-if="r.carryover !== undefined" class="text-xs text-[--muted-foreground]">
              残留: {{ r.carryover }}%
            </div>
            <div v-if="r.stabilityDeviation !== undefined" class="text-xs text-[--muted-foreground]">
              稳定性偏差: {{ r.stabilityDeviation }}%
            </div>
          </div>
          <BaseTag :tone="resultTone(r.status)">{{ resultLabel(r.status) }}</BaseTag>
          <button class="text-xs text-[--info] hover:underline" @click="viewDetail(r)">详情</button>
        </div>
      </div>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import BasePageHeader from '@/components/base/BasePageHeader.vue';
import BaseSummaryCard from '@/components/base/BaseSummaryCard.vue';
import BaseCard from '@/components/base/BaseCard.vue';
import BaseTag from '@/components/base/BaseTag.vue';
import { validationResults } from '@/api/mock/results';
import type { ResultStatus } from '@/types/experiments';

const summaryCards = computed(() => [
  { label: '通过', value: validationResults.filter((r: any) => r.status === 'pass').length, color: 'text-[--primary]' },
  { label: '失败', value: validationResults.filter((r: any) => r.status === 'fail').length, color: 'text-[--danger]' },
  { label: '待判定', value: validationResults.filter((r: any) => r.status === 'pending').length, color: 'text-[--warning]' },
  { label: '不适用', value: validationResults.filter((r: any) => r.status === 'na').length, color: 'text-[--muted-foreground]' },
]);

const results = validationResults;

function resultLabel(s: ResultStatus): string {
  const map: Record<string, string> = { pass: '通过', fail: '失败', pending: '待判定', na: '不适用' };
  return map[s] ?? s;
}
function resultTone(s: ResultStatus): 'success' | 'danger' | 'warning' | 'neutral' {
  const map: Record<string, 'success' | 'danger' | 'warning' | 'neutral'> = { pass: 'success', fail: 'danger', pending: 'warning', na: 'neutral' };
  return map[s] ?? 'neutral';
}
function viewDetail(r: any) { /* mock */ }
</script>
