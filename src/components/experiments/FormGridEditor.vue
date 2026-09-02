<template>
  <div class="space-y-3">
    <!-- 工具栏 -->
    <div class="flex items-center gap-2 flex-wrap">
      <BaseButton variant="primary" size="sm" @click="$emit('select-all')">全选</BaseButton>
      <BaseButton variant="secondary" size="sm" @click="$emit('invert')">反选</BaseButton>
      <BaseButton variant="secondary" size="sm" @click="$emit('clear')">清空选中</BaseButton>
      <BaseButton variant="secondary" size="sm" @click="$emit('batch')">批量设置</BaseButton>
      <span class="text-xs text-[--muted-foreground] ml-auto">已选 {{ selectedCount }} 个格子</span>
    </div>

    <!-- 网格 -->
    <div class="bg-white border border-[--border] rounded-[--radius-lg] shadow-[var(--shadow-card)] p-4 overflow-x-auto">
      <div class="min-w-fit" :style="{ minWidth: gridMinWidth + 'px' }">
        <!-- 列头 -->
        <div class="flex items-center gap-1 mb-1">
          <div class="w-10 shrink-0" />
          <div v-for="c in cols" :key="c" class="text-center text-xs font-semibold text-[--muted-foreground] w-20">{{ c }}</div>
        </div>
        <!-- 行 -->
        <div v-for="row in rows" :key="row" class="flex items-center gap-1 mb-1">
          <div class="w-10 shrink-0 text-xs font-bold text-[--muted-foreground] flex items-center justify-center">{{ row }}</div>
          <div v-for="col in cols" :key="col" class="w-20">
            <div
              :class="['relative rounded-md border-2 cursor-pointer transition-all duration-150 min-h-[52px] flex flex-col justify-center items-center text-center p-1',
                getCell(row, col).selected
                  ? 'border-[--primary] bg-[--primary-soft]'
                  : getCell(row, col).operations.length
                    ? 'border-[--border-strong] bg-white hover:border-[--primary-border]'
                    : 'border-[--border] bg-[--surface-muted] hover:border-[--border-strong]']"
              @click="$emit('edit-cell', row, col)"
              @mouseenter="hoverKey = `${row}-${col}`"
              @mouseleave="hoverKey = null"
            >
              <div v-if="getCell(row, col).operations.length === 0" class="text-[--text-tertiary] text-[10px]">空</div>
              <template v-for="(op, oi) in getCell(row, col).operations.slice(0, 2)" :key="op.id">
                <div class="text-[10px] leading-tight" :class="op.action ? 'text-[--text-main]' : 'text-[--muted-foreground]'">
                  {{ op.action || op.substance || '—' }}
                  <span v-if="op.volume" class="text-[--muted-foreground]">{{ op.volume }}</span>
                </div>
              </template>
              <div v-if="getCell(row, col).operations.length > 2" class="text-[10px] text-[--primary] font-medium">
                +{{ getCell(row, col).operations.length - 2 }}
              </div>
              <!-- 悬停提示 -->
              <div v-if="hoverKey === `${row}-${col}` && getCell(row, col).operations.length > 0"
                class="absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-[--foreground] text-white text-[11px] rounded-md p-2.5 shadow-xl pointer-events-none"
              >
                <div v-for="op in getCell(row, col).operations" :key="op.id" class="mb-1.5 last:mb-0">
                  <div class="font-semibold mb-0.5">{{ op.action || '操作' }}</div>
                  <div class="text-[--text-tertiary]">
                    <span v-if="op.substance">样品：{{ op.substance }}</span>
                    <span v-if="op.substance && op.sampleId"> · </span>
                    <span v-if="op.sampleId">编号：{{ op.sampleId }}</span>
                  </div>
                  <div class="text-[--text-tertiary]">
                    <span v-if="op.volume">参数：{{ op.volume }}</span>
                    <span v-if="op.note"> · 备注：{{ op.note }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部信息栏 -->
    <div class="bg-white border border-[--border] rounded-[--radius-lg] shadow-[var(--shadow-card)] p-4 grid grid-cols-4 gap-4">
      <BaseFormField label="放置位置" placeholder="精确到板位号，如 A1-H12" v-model="footer.location" />
      <BaseFormField label="加样时间" type="datetime-local" v-model="footer.time" />
      <BaseFormField label="负责人/加样人" placeholder="请输入" v-model="footer.owner" />
      <BaseFormField label="审核人" placeholder="请输入" v-model="footer.reviewer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseFormField from '@/components/base/BaseFormField.vue';
import type { FormCell, CellOperation } from '@/types/experiments';

const props = defineProps<{
  rows: string[];
  cols: number;
  cells: FormCell[];
  cellLabel?: 'well' | 'none';
  initialOperations?: Record<string, CellOperation[]>;
}>();

const emit = defineEmits<{
  'select-all': [];
  'invert': [];
  'clear': [];
  'batch': [];
  'edit-cell': [row: string, col: number];
  'update:cells': [cells: FormCell[]];
}>();

const hoverKey = ref<string | null>(null);
const footer = ref({ location: '', time: '', owner: '', reviewer: '' });

const gridMinWidth = computed(() => 40 + props.cols * 80);

function getCell(row: string, col: number): FormCell {
  const found = props.cells.find(c => c.row === row && c.col === col);
  if (found) return found;
  return { row, col, operations: [], selected: false };
}

const selectedCount = computed(() => props.cells.filter(c => c.selected).length);
</script>
