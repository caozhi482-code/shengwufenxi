<template>
  <div class="space-y-3">
    <div v-if="!readOnly" class="flex items-center gap-2 flex-wrap">
      <BaseButton variant="primary" size="sm" @click="$emit('select-all')">全选</BaseButton>
      <BaseButton variant="secondary" size="sm" @click="$emit('invert')">反选</BaseButton>
      <BaseButton variant="secondary" size="sm" @click="$emit('clear')">清空选中</BaseButton>
      <BaseButton variant="secondary" size="sm" @click="$emit('batch')">批量设置</BaseButton>
      <BaseButton variant="secondary" size="sm" @click="$emit('import')">导入</BaseButton>
      <span class="text-xs text-[--muted-foreground] ml-auto">已选 {{ selectedCount }} 个格子</span>
    </div>

    <div class="bg-white border border-[--border] rounded-[--radius-lg] shadow-[var(--shadow-card)] p-4 overflow-x-auto">
      <div class="min-w-[960px]" :style="{ minWidth: `${gridMinWidth}px` }">
        <div class="flex items-stretch gap-1 mb-1">
          <div class="w-24 shrink-0 rounded-md border border-[--border] bg-[--surface-muted] px-2 py-2 text-center text-xs font-semibold text-[--muted-foreground]">表头</div>
          <div
            v-for="(colLabel, index) in columnLabels"
            :key="colLabel"
            class="flex-1 rounded-md border border-[--border] bg-[--surface-muted] px-2 py-2 text-center text-xs font-semibold text-[--muted-foreground]"
          >
            {{ colLabel || `列 ${index + 1}` }}
          </div>
        </div>

        <div v-for="(rowLabel, rowIndex) in rowLabels" :key="rowLabel" class="flex items-stretch gap-1 mb-1">
          <div class="w-24 shrink-0 rounded-md border border-[--border] bg-[--surface-muted] px-2 py-2 text-center text-xs font-semibold text-[--muted-foreground]">
            {{ rowLabel }}
          </div>
          <div
            v-for="(colLabel, colIndex) in columnLabels"
            :key="`${rowLabel}-${colLabel}`"
            class="flex-1"
          >
            <div
              :class="['relative rounded-md border-2 transition-all duration-150 min-h-[64px] flex flex-col justify-center items-center text-center p-1',
                readOnly ? 'cursor-default' : 'cursor-pointer',
                activeKey === `${rowLabel}-${colIndex + 1}` ? 'border-[--primary] ring-2 ring-[--primary-soft]' : '',
                getCell(rowLabel, colIndex + 1).selected
                  ? 'border-[--primary] bg-[--primary-soft]'
                  : getCell(rowLabel, colIndex + 1).operations.length
                    ? 'border-[--border-strong] bg-white hover:border-[--primary-border]'
                    : 'border-[--border] bg-[--surface-muted] hover:border-[--border-strong]']"
              @click="handleCellClick(rowLabel, colIndex + 1)"
              @mouseenter="hoverKey = `${rowLabel}-${colIndex + 1}`"
              @mouseleave="hoverKey = null"
            >
              <div v-if="getCell(rowLabel, colIndex + 1).operations.length === 0" class="text-[--danger] text-[10px] font-semibold">未配置</div>
              <template v-for="op in getCell(rowLabel, colIndex + 1).operations" :key="op.id">
                <div class="text-[10px] leading-tight">
                  <span :class="['font-semibold', op.scanned ? 'text-[--primary]' : 'text-[--text-main]']">{{ op.substance || op.action }}</span>
                  <span class="text-[--muted-foreground]"> · {{ op.sampleId || '—' }}</span>
                  <span class="text-[--muted-foreground]"> · {{ op.volume }}{{ op.unit }}</span>
                </div>
              </template>
              <div v-if="hoverKey === `${rowLabel}-${colIndex + 1}` && getCell(rowLabel, colIndex + 1).operations.length > 0"
                class="absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-[--foreground] text-white text-[11px] rounded-md p-2.5 shadow-xl pointer-events-none"
              >
                <div v-for="op in getCell(rowLabel, colIndex + 1).operations" :key="op.id" class="mb-1.5 last:mb-0">
                  <div class="font-semibold mb-0.5">{{ op.action || '操作' }}</div>
                  <div class="text-[--text-tertiary]">
                    <span v-if="op.substance">样品：{{ op.substance }}</span>
                    <span v-if="op.substance && op.sampleId"> · </span>
                    <span v-if="op.sampleId">编号：{{ op.sampleId }}</span>
                  </div>
                  <div class="text-[--text-tertiary]">
                    <span v-if="op.volume">参数：{{ op.volume }}{{ op.unit }}</span>
                    <span v-if="op.equipment"> · 设备：{{ op.equipment }}</span>
                  </div>
                  <div v-if="op.step || op.note" class="text-[--text-tertiary]">
                    <span v-if="op.step">步骤：{{ op.step }}</span>
                    <span v-if="op.step && op.note"> · </span>
                    <span v-if="op.note">备注：{{ op.note }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import BaseButton from '@/components/base/BaseButton.vue';
import type { SequenceCell } from '@/types/experiments';

const props = defineProps<{
  cells: SequenceCell[];
  rowLabels: string[];
  columnLabels: string[];
  readOnly?: boolean;
  activeKey?: string | null;
}>();

const emit = defineEmits<{
  'select-all': [];
  'invert': [];
  'clear': [];
  'batch': [];
  'import': [];
  'edit-cell': [row: string, col: number];
}>();

const hoverKey = ref<string | null>(null);
const readOnly = computed(() => Boolean(props.readOnly));
const selectedCount = computed(() => props.cells.filter(cell => cell.selected).length);
const gridMinWidth = computed(() => Math.max(960, 96 + props.columnLabels.length * 132));

function getCell(row: string, col: number): SequenceCell {
  return props.cells.find(cell => cell.row === row && cell.col === col) ?? { row, col, operations: [], selected: false };
}

function handleCellClick(row: string, col: number) {
  if (readOnly.value) return;
  emit('edit-cell', row, col);
}
</script>
