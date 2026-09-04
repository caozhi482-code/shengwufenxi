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
      <div class="min-w-[700px]">
        <div class="flex items-center gap-1 mb-1">
          <div class="w-8 shrink-0" />
          <div v-for="c in 12" :key="c" class="flex-1 text-center text-xs font-semibold text-[--muted-foreground]">{{ c }}</div>
        </div>
        <div v-for="row in rows" :key="row" class="flex items-center gap-1 mb-1">
          <div class="w-8 shrink-0 text-xs font-bold text-[--muted-foreground] flex items-center justify-center">{{ row }}</div>
          <div v-for="col in 12" :key="col" class="flex-1">
            <div
              :class="['relative rounded-md border-2 transition-all duration-150 min-h-[56px] flex flex-col justify-center items-center text-center p-1',
                readOnly ? 'cursor-default' : 'cursor-pointer',
                cellHasWarning(row, col) ? 'ring-2 ring-[--danger]/30' : '',
                getCell(row, col).selected
                  ? 'border-[--primary] bg-[--primary-soft]'
                  : getCell(row, col).operations.length
                    ? 'border-[--border-strong] bg-white hover:border-[--primary-border]'
                    : 'border-[--border] bg-[--surface-muted] hover:border-[--border-strong]']"
              @click="handleCellClick(row, col)"
              @dblclick.stop="handleCellDblClick(row, col)"
              @mouseenter="hoverKey = `${row}-${col}`"
              @mouseleave="hoverKey = null"
            >
              <div v-if="getCell(row, col).operations.length === 0" class="text-[--danger] text-[10px] font-semibold">未配置</div>
              <template v-for="op in getCell(row, col).operations" :key="op.id">
                <div class="text-[10px] leading-tight">
                  <span :class="['font-semibold', op.scanned ? 'text-[--primary]' : 'text-[--text-main]']">{{ op.substance || op.action }}</span>
                  <span class="text-[--muted-foreground]"> · {{ op.sampleId || '—' }}</span>
                  <span class="text-[--muted-foreground]"> · {{ op.volume }}{{ op.unit }}</span>
                </div>
              </template>
              <div v-if="hoverKey === `${row}-${col}` && getCell(row, col).operations.length > 0"
                class="absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 bg-[--foreground] text-white text-[11px] rounded-md p-2 shadow-xl pointer-events-none">
                <div v-for="op in getCell(row, col).operations" :key="op.id" class="mb-1 last:mb-0">
                  <div class="font-semibold">{{ op.action || op.substance || '未命名步骤' }}</div>
                  <div class="text-[--text-tertiary]">样品：{{ op.sampleId || '—' }} · 设备：{{ op.equipment || '—' }}</div>
                  <div class="text-[--text-tertiary]">{{ op.volume }}{{ op.unit }} · {{ op.step || '—' }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="mt-4 bg-white border border-[--border] rounded-[--radius-lg] shadow-[var(--shadow-card)] p-4 grid grid-cols-4 gap-4">
      <BaseFormField label="放置位置" placeholder="精确到板位号，如 A1-H12" v-model="footer.location" :readonly="readOnly" />
      <BaseFormField label="加样时间" type="datetime-local" v-model="footer.time" :readonly="readOnly" />
      <BaseFormField label="加样人" placeholder="请输入" v-model="footer.owner" :readonly="readOnly" />
      <BaseFormField label="审核人" placeholder="请输入" v-model="footer.reviewer" :readonly="readOnly" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseFormField from '@/components/base/BaseFormField.vue';
import type { SequenceCell } from '@/types/experiments';

const props = defineProps<{
  cells: SequenceCell[];
  footer?: { location?: string; time?: string; owner?: string; reviewer?: string };
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
  'update:footer': [footer: { location?: string; time?: string; owner?: string; reviewer?: string }];
}>();

const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const hoverKey = ref<string | null>(null);
let pendingClick: ReturnType<typeof setTimeout> | null = null;
let pendingCell: { row: string; col: number } | null = null;
const footer = ref({ location: '', time: '', owner: '', reviewer: '' });

watch(
  () => props.footer,
  (val) => {
    footer.value = {
      location: val?.location ?? '',
      time: val?.time ?? '',
      owner: val?.owner ?? '',
      reviewer: val?.reviewer ?? '',
    };
  },
  { immediate: true, deep: true },
);

watch(
  footer,
  (val) => {
    emit('update:footer', { ...val });
  },
  { deep: true },
);

const selectedCount = computed(() => props.cells.filter(c => c.selected).length);

function getCell(row: string, col: number): SequenceCell {
  return props.cells.find(c => c.row === row && c.col === col) ?? { row, col, operations: [], selected: false };
}

function cellHasWarning(row: string, col: number) {
  return getCell(row, col).operations.length === 0;
}

function handleCellClick(row: string, col: number) {
  if (readOnly.value) return;
  if (pendingClick) {
    clearTimeout(pendingClick);
    pendingClick = null;
    pendingCell = null;
    return;
  }
  pendingCell = { row, col };
  pendingClick = setTimeout(() => {
    if (pendingCell) {
      const cell = getCell(pendingCell.row, pendingCell.col);
      cell.selected = !cell.selected;
    }
    pendingClick = null;
    pendingCell = null;
  }, 250);
}

function handleCellDblClick(row: string, col: number) {
  if (readOnly.value) return;
  if (pendingClick) {
    clearTimeout(pendingClick);
    pendingClick = null;
    pendingCell = null;
  }
  emit('edit-cell', row, col);
}

const readOnly = computed(() => Boolean(props.readOnly));
</script>