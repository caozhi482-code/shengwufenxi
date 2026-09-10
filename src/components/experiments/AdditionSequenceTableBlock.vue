<template>
  <div class="w-full overflow-x-auto">
    <table class="w-full min-w-[1200px] border-collapse table-fixed text-[13px] text-[--text-main]">
      <colgroup>
        <col class="w-[40px]" />
        <col v-for="n in 12" :key="n" class="w-[8.33%]" />
      </colgroup>
      <tbody>
        <!-- 标题行 -->
        <tr>
          <td class="as-title" colspan="13">
            <div class="flex items-center justify-between gap-3">
              <div class="text-[26px] font-bold">加样序列表</div>
              <div class="text-[16px] font-medium">BA-SBR07 / 2V</div>
            </div>
          </td>
        </tr>

        <!-- 上下文区 -->
        <tr>
          <td class="as-label" colspan="2">项目编号</td>
          <td class="as-cell" colspan="3">
            <CellEditor :value="model.context.projectCode" :editable="editable" @update="updateContext('projectCode', $event)" />
          </td>
          <td class="as-label" colspan="2">分析批编号</td>
          <td class="as-cell" colspan="2">
            <CellEditor :value="model.context.analysisBatchNo" :editable="editable" @update="updateContext('analysisBatchNo', $event)" />
          </td>
          <td class="as-label">Run ID</td>
          <td class="as-cell" colspan="3">
            <CellEditor :value="model.context.runId" :editable="editable" @update="updateContext('runId', $event)" />
          </td>
        </tr>
        <tr>
          <td class="as-label" colspan="2">加样板编号</td>
          <td class="as-cell" colspan="11">
            <CellEditor :value="model.context.plateId" :editable="editable" @update="updateContext('plateId', $event)" />
          </td>
        </tr>

        <!-- 96孔板主表格 -->
        <tr>
          <td class="as-section" colspan="13">96 孔板加样序列</td>
        </tr>

        <!-- 列标题行 -->
        <tr>
          <td class="as-label" colspan="2">&nbsp;</td>
          <td class="as-head text-center" v-for="c in 12" :key="c">{{ c }}</td>
        </tr>

        <!-- 每行两排：标签行 + 孔号行 -->
        <template v-for="(rowLabel, rowIdx) in model.rows" :key="rowLabel">
          <!-- 标签行 -->
          <tr>
            <td class="as-label text-center" colspan="2">{{ rowLabel }}</td>
            <td v-for="col in 12" :key="col" class="as-cell">
              <div
                v-if="editable"
                :class="['w-full min-h-[44px] flex items-center justify-center text-[11px] rounded border transition-all cursor-pointer',
                  getCell(rowLabel, col).operations.length > 0
                    ? 'bg-[--primary-soft] border-[--primary-border] text-[--primary] font-medium'
                    : 'bg-white border-[--border] text-[--text-tertiary] hover:border-[--primary-border]']"
                @click="handleCellClick(rowLabel, col)"
              >
                <span v-if="getCell(rowLabel, col).operations.length === 0">配置格子</span>
                <template v-else>
                  <div v-for="op in getCell(rowLabel, col).operations.slice(0, 2)" :key="op.id" class="text-center leading-tight">
                    <span class="font-semibold">{{ op.substance || op.action }}</span>
                    <span class="text-[--muted-foreground]">·{{ op.volume }}{{ op.unit }}</span>
                  </div>
                  <div v-if="getCell(rowLabel, col).operations.length > 2" class="text-[--primary] font-medium">+{{ getCell(rowLabel, col).operations.length - 2 }}</div>
                </template>
              </div>
              <div v-else :class="['w-full min-h-[44px] flex items-center justify-center text-[11px] rounded',
                getCell(rowLabel, col).operations.length > 0 ? 'bg-[--primary-soft] text-[--primary] font-medium' : 'bg-[#f3efe0] text-[--text-tertiary]']">
                <span v-if="getCell(rowLabel, col).operations.length === 0">—</span>
                <template v-else>
                  <div v-for="op in getCell(rowLabel, col).operations.slice(0, 2)" :key="op.id" class="text-center leading-tight">
                    <span class="font-semibold">{{ op.substance || op.action }}</span>
                    <span class="text-[--muted-foreground]">·{{ op.volume }}{{ op.unit }}</span>
                  </div>
                  <div v-if="getCell(rowLabel, col).operations.length > 2" class="text-[--primary] font-medium">+{{ getCell(rowLabel, col).operations.length - 2 }}</div>
                </template>
              </div>
            </td>
          </tr>
          <!-- 孔号行 -->
          <tr>
            <td class="as-label" colspan="2">&nbsp;</td>
            <td class="as-cell bg-[#f7f5ee] text-center text-[11px] font-semibold text-[--muted-foreground]" v-for="col in 12" :key="col">
              <span class="block text-center text-[11px] font-semibold text-[--muted-foreground] py-1">
                {{ rowIdx * 12 + col }}
              </span>
            </td>
          </tr>
        </template>
      </tbody>
    </table>

    <!-- 底部追溯区 -->
    <table class="mt-4 w-full min-w-[1200px] border-collapse table-fixed text-[13px] text-[--text-main]">
      <colgroup>
        <col v-for="n in 13" :key="n" class="w-[7.69%]" />
      </colgroup>
      <tbody>
        <tr>
          <td class="as-section" colspan="13">放置位置与签字区</td>
        </tr>
        <tr>
          <td class="as-label" colspan="2">该进样板处理完成后放置位置</td>
          <td class="as-cell" colspan="5">
            <div v-if="editable" class="flex items-center gap-2 flex-wrap">
              <CellEditor :value="model.placementLocation" :editable="editable" @update="updateField('placementLocation', $event)" />
              <span class="text-[12px] text-[--muted-foreground]">（放入自动进样器时需精确到板位号，如 A1-H12）</span>
            </div>
            <span v-else>{{ model.placementLocation || '—' }}</span>
          </td>
          <td class="as-label">时间</td>
          <td class="as-cell" colspan="3">
            <CellEditor :value="model.placementTime" :editable="editable" type="datetime-local" @update="updateField('placementTime', $event)" />
          </td>
        </tr>
        <tr>
          <td class="as-section" colspan="13">签字区</td>
        </tr>
        <tr>
          <td class="as-label" colspan="3">加样人 / 日期</td>
          <td class="as-cell" colspan="3">
            <CellEditor :value="model.signatureOperator" :editable="editable" @update="updateSignature('operator', $event)" />
          </td>
          <td class="as-label" colspan="3">现场复核人 / 日期</td>
          <td class="as-cell" colspan="3">
            <CellEditor :value="model.signatureReviewer" :editable="editable" @update="updateSignature('reviewer', $event)" />
          </td>
        </tr>
        <tr>
          <td class="as-label" colspan="3">审核人 / 日期</td>
          <td class="as-cell" colspan="10">
            <CellEditor :value="model.signatureAuditor" :editable="editable" @update="updateSignature('auditor', $event)" />
          </td>
        </tr>
      </tbody>
    </table>

    <!-- 格子编辑抽屉 -->
    <CellOpEditor
      v-if="drawerOpen"
      :open="drawerOpen"
      :read-only="!editable"
      :cell-row="activeCellRow"
      :cell-col="activeCellCol"
      :operations="cellOperations"
      @close="closeDrawer"
      @save="saveDrawer"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, ref, watch } from 'vue';
import CellOpEditor from './CellOpEditor.vue';
import type { SequenceCell, SequenceOperation } from '@/types/experiments';

interface ModelValue {
  context: {
    projectCode?: string;
    analysisBatchNo?: string;
    runId?: string;
    plateId?: string;
  };
  rows: string[];
  cells: SequenceCell[];
  placementLocation: string;
  placementTime: string;
  signatureOperator: string;
  signatureReviewer: string;
  signatureAuditor: string;
}

const props = withDefaults(defineProps<{
  modelValue: ModelValue;
  editable?: boolean;
}>(), {
  editable: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: ModelValue];
}>();

const model = computed(() => props.modelValue);

const drawerOpen = ref(false);
const activeCellRow = ref('');
const activeCellCol = ref(0);
const cellOperations = ref<SequenceOperation[]>([]);

const CellEditor = defineComponent({
  props: {
    value: { type: [String, Number], default: '' },
    editable: { type: Boolean, default: false },
    type: { type: String, default: 'text' },
  },
  emits: ['update'],
  setup(componentProps, { emit: componentEmit }) {
    return () => componentProps.editable
      ? h('input', {
          value: componentProps.value,
          type: componentProps.type === 'datetime-local' ? 'datetime-local' : 'text',
          class: 'cell-input',
          onInput: (event: Event) => componentEmit('update', (event.target as HTMLInputElement).value),
        })
      : h('span', { class: 'block min-h-6 whitespace-pre-wrap' }, componentProps.value || ' ');
  },
});

function patch(next: Partial<ModelValue>) {
  emit('update:modelValue', { ...props.modelValue, ...next });
}

function updateContext(key: keyof ModelValue['context'], value: string) {
  patch({ context: { ...props.modelValue.context, [key]: value } });
}

function updateField(key: 'placementLocation' | 'placementTime', value: string) {
  patch({ [key]: value } as Partial<ModelValue>);
}

function updateSignature(key: 'operator' | 'reviewer' | 'auditor', value: string) {
  patch({
    [key === 'operator' ? 'signatureOperator' : key === 'reviewer' ? 'signatureReviewer' : 'signatureAuditor']: value,
  } as Partial<ModelValue>);
}

function getCell(row: string, col: number): SequenceCell {
  return props.modelValue.cells.find(c => c.row === row && c.col === col) ?? { row, col, operations: [], selected: false };
}

function setCell(row: string, col: number, cell: SequenceCell) {
  const nextCells = props.modelValue.cells.map(c =>
    c.row === row && c.col === col ? cell : c
  );
  patch({ cells: nextCells });
}

function handleCellClick(row: string, col: number) {
  if (!props.editable) return;
  activeCellRow.value = row;
  activeCellCol.value = col;
  const cell = getCell(row, col);
  cellOperations.value = cell.operations.map(op => ({ ...op }));
  drawerOpen.value = true;
}

function closeDrawer() {
  drawerOpen.value = false;
}

function saveDrawer(ops: SequenceOperation[]) {
  const cell = getCell(activeCellRow.value, activeCellCol.value);
  setCell(activeCellRow.value, activeCellCol.value, { ...cell, operations: ops });
  drawerOpen.value = false;
}
</script>

<style scoped>
.as-cell,
.as-label,
.as-section,
.as-title,
.as-head {
  border: 1px solid #222;
  padding: 6px 4px;
  vertical-align: middle;
  background: #fff;
}

.as-title {
  text-align: center;
  padding: 14px 10px;
}

.as-section,
.as-label,
.as-head {
  font-weight: 600;
  background: #f7f5ee;
}

.as-section {
  font-size: 16px;
  text-align: left;
}

.cell-input {
  width: 100%;
  border: 0;
  outline: none;
  background: transparent;
  font-size: 13px;
  color: var(--text-main);
}
</style>
