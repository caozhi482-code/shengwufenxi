<template>
  <BaseCard>
    <template #header>
      <span class="text-base font-bold text-[--foreground]">预警列表</span>
    </template>
    <BaseTable
      :data="data"
      :columns="columns"
      @row-click="$emit('row-click', $event)"
    >
      <template #cell-type="{ row }">
        <BaseTag :tone="typeTone(row.type)" :label="row.type" />
      </template>
      <template #cell-level="{ row }">
        <BaseTag :tone="levelTone(row.level)" :label="row.level + '优先级'" />
      </template>
      <template #cell-status="{ row }">
        <BaseTag :tone="row.status === '待处理' ? 'warning' : 'success'" :label="row.status" />
      </template>
      <template #cell-notified="{ row }">
        <BaseTag :tone="row.notified ? 'success' : 'neutral'" :label="row.notified ? '已通知' : '未通知'" />
      </template>
      <template #cell-actions="{ row }">
        <div class="flex gap-2">
          <button v-if="row.status === '待处理'" class="text-[--primary] text-xs font-medium hover:underline" @click.stop="$emit('handle', row)">处理</button>
          <button class="text-[--info] text-xs font-medium hover:underline" @click.stop="$emit('detail', row)">详情</button>
        </div>
      </template>
    </BaseTable>
  </BaseCard>
</template>

<script setup lang="ts">
import type { Alert } from '@/api/mock/warehouse';
import BaseCard from '@/components/base/BaseCard.vue';
import BaseTable from '@/components/base/BaseTable.vue';
import BaseTag from '@/components/base/BaseTag.vue';

defineProps<{ data: Alert[] }>();
defineEmits<{ 'row-click': [row: Alert]; handle: [row: Alert]; detail: [row: Alert] }>();

const columns = [
  { key: 'id', label: '预警ID' },
  { key: 'type', label: '预警类型' },
  { key: 'targetName', label: '目标名称' },
  { key: 'location', label: '库位' },
  { key: 'level', label: '预警等级' },
  { key: 'detail', label: '预警详情' },
  { key: 'notified', label: '通知状态' },
  { key: 'createdAt', label: '创建时间' },
  { key: 'updatedAt', label: '更新时间' },
  { key: 'actions', label: '操作' },
];

function typeTone(type: string): 'danger' | 'warning' | 'info' | 'success' | 'neutral' {
  const map: Record<string, 'danger' | 'warning' | 'info' | 'success' | 'neutral'> = {
    '低库存': 'warning',
    '临期': 'warning',
    '过期': 'danger',
    '容量预警': 'info',
    '数量异常': 'info',
  };
  return map[type] ?? 'neutral';
}

function levelTone(level: string): 'danger' | 'warning' | 'info' | 'success' | 'neutral' {
  const map: Record<string, 'danger' | 'warning' | 'info' | 'success' | 'neutral'> = {
    '高': 'danger',
    '中': 'warning',
    '低': 'info',
  };
  return map[level] ?? 'neutral';
}
</script>
