<template>
  <div class="space-y-5">
    <BasePageHeader :title="pageTitle" :subtitle="templateSubtitle">
      <template #extra>
        <BaseButton variant="secondary" @click="goBack">返回</BaseButton>
        <BaseButton variant="secondary" :disabled="!currentForm" @click="saveDraft">保存草稿</BaseButton>
        <BaseButton variant="primary" :disabled="!currentForm" @click="saveAndExit">保存并完成编辑</BaseButton>
      </template>
    </BasePageHeader>

    <div class="bg-white border border-[--border] rounded-[--radius-lg] shadow-[var(--shadow-card)] p-4 flex items-center gap-6 flex-wrap">
      <div>
        <div class="text-xs text-[--muted-foreground] mb-0.5">任务</div>
        <div class="text-sm font-bold text-[--foreground]">{{ task.taskName }}</div>
      </div>
      <div class="w-px h-10 bg-[--border]" />
      <div>
        <div class="text-xs text-[--muted-foreground] mb-0.5">考察项</div>
        <div class="text-sm font-medium text-[--text-main]">{{ task.itemCode }} {{ task.itemName }}</div>
      </div>
      <div class="w-px h-10 bg-[--border]" />
      <div>
        <div class="text-xs text-[--muted-foreground] mb-0.5">表单模板</div>
        <div class="text-sm font-medium text-[--text-main]">{{ currentForm?.name ?? '模板不存在' }}</div>
      </div>
      <div class="w-px h-10 bg-[--border]" />
      <div>
        <div class="text-xs text-[--muted-foreground] mb-0.5">模板类型</div>
        <div class="text-sm font-medium text-[--text-main]">{{ templateKindLabel }}</div>
      </div>
      <div class="w-px h-10 bg-[--border]" />
      <div>
        <div class="text-xs text-[--muted-foreground] mb-0.5">状态</div>
        <div class="text-sm font-medium" :class="editing ? 'text-[--warning]' : 'text-[--success]'">
          {{ currentForm ? (editing ? '编辑中' : '已编辑') : '不可编辑' }}
        </div>
      </div>
    </div>

    <BaseCard v-if="!currentForm">
      <template #header>
        <span class="text-base font-bold text-[--foreground]">模板缺失</span>
      </template>
      <div class="py-12 text-center space-y-3">
        <div class="text-sm font-medium text-[--text-main]">未找到与当前模板 ID 匹配的模板</div>
        <div class="text-xs text-[--muted-foreground]">请返回模板选择页重新选择模板表单，不要继续使用默认模板兜底。</div>
        <BaseButton variant="primary" @click="goBack">返回</BaseButton>
      </div>
    </BaseCard>

    <template v-else>
      <BaseCard v-if="isPlateTemplate">
        <template #header>
          <span class="text-base font-bold text-[--foreground]">
            {{ currentForm.name }} — 格子编辑器
            <span class="text-xs font-normal text-[--muted-foreground] ml-2">
              点击格子编辑操作 · 每条操作可自由填写
            </span>
          </span>
        </template>
        <FormGridEditor
          :rows="currentForm.grid.rows"
          :cols="currentForm.grid.cols"
          :cells="currentCells"
          :cell-label="(currentForm.cellLabel as 'well' | 'none')"
          @select-all="selectAll"
          @invert="invertSelect"
          @clear="clearSelect"
          @batch="batchEdit"
          @edit-cell="openCellEditor"
        />
      </BaseCard>

      <BaseCard v-else>
        <template #header>
          <span class="text-base font-bold text-[--foreground]">
            {{ currentForm.name }} — 记录表编辑
            <span class="text-xs font-normal text-[--muted-foreground] ml-2">
              表格化记录区 · 直接编辑每个字段
            </span>
          </span>
        </template>

        <div class="overflow-x-auto rounded-xl border border-[--border] bg-white">
          <table class="min-w-full border-collapse text-sm">
            <thead class="bg-[--surface-muted]">
              <tr>
                <th v-for="field in currentForm.fields" :key="field" class="border-b border-[--border] px-3 py-2 text-left text-xs font-semibold text-[--muted-foreground]">
                  {{ field }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, rowIndex) in recordRows" :key="rowIndex" class="border-b border-[--border] last:border-b-0">
                <td v-for="(_, cellIndex) in currentForm.fields" :key="cellIndex" class="border-r border-[--border] last:border-r-0 px-2 py-2 align-top">
                  <input
                    v-model="recordRows[rowIndex][cellIndex]"
                    type="text"
                    class="w-full rounded-md border border-[--border] bg-white px-2 py-2 text-sm text-[--text-main] outline-none transition focus:border-[--primary]"
                    :placeholder="`${currentForm.name} 第 ${rowIndex + 1} 行`"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div class="text-xs text-[--muted-foreground]">记录表模板不使用 96 孔格子布局。</div>
          <div class="flex gap-2">
            <BaseButton variant="secondary" size="sm" @click="addRecordRow">新增一行</BaseButton>
            <BaseButton variant="secondary" size="sm" :disabled="recordRows.length <= 1" @click="removeRecordRow">删除最后一行</BaseButton>
          </div>
        </div>
      </BaseCard>
    </template>

    <CellOpEditor
      v-if="currentForm && isPlateTemplate"
      :open="cellEditorOpen"
      :cell-row="editingCell?.row ?? ''"
      :cell-col="editingCell?.col ?? 1"
      :operations="currentOps"
      @close="closeCellEditor"
      @save="saveCellOps"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import BasePageHeader from '@/components/base/BasePageHeader.vue';
import BaseCard from '@/components/base/BaseCard.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import FormGridEditor from '@/components/experiments/FormGridEditor.vue';
import CellOpEditor from '@/components/experiments/CellOpEditor.vue';
import { tasks } from '@/api/mock/tasks';
import { formTemplates } from '@/api/mock/methods';
import type { Task, FormCell, CellOperation, SequenceOperation } from '@/types/experiments';

const router = useRouter();
const route = useRoute();

const taskId = route.params.taskId as string;
const formTemplateId = route.params.formTemplateId as string;
const itemCode = route.query.itemCode as string;

const task = computed<Task>(() => {
  const t = tasks.find((item: any) => item.id === taskId);
  return t ?? { id: taskId, taskName: '示例任务', itemCode: itemCode ?? '', itemName: '', formTemplates: [] } as Task;
});

const currentForm = computed(() => formTemplates.find(f => f.id === formTemplateId) ?? null);
const isPlateTemplate = computed(() => currentForm.value?.cellLabel === 'well');
const templateKindLabel = computed(() => {
  if (!currentForm.value) return '—';
  return isPlateTemplate.value ? '96 孔板 / 格子布局' : '记录表布局';
});
const templateSubtitle = computed(() => {
  if (!currentForm.value) return '模板缺失 — 请返回模板选择页重新选择';
  return isPlateTemplate.value ? '格子编辑器 — 负责人配置操作' : '记录表编辑器 — 负责人配置操作';
});
const pageTitle = computed(() => `编辑表单 - ${currentForm.value?.name ?? '模板不存在'}`);

const cells = ref<FormCell[]>([]);
const recordRows = ref<string[][]>([]);
const editing = ref(false);
const editingCell = ref<{ row: string; col: number } | null>(null);
const cellEditorOpen = ref(false);

watch(currentForm, (form) => {
  editing.value = false;
  editingCell.value = null;
  cellEditorOpen.value = false;

  if (!form) {
    cells.value = [];
    recordRows.value = [];
    return;
  }

  if (form.cellLabel === 'well') {
    cells.value = buildCells(form.grid.rows, form.grid.cols, form.id === 'FT001' ? [
      { row: 'A', col: 1, operations: [{ id: 'op-1', action: '加平衡液', substance: 'Equ', sampleId: 'Equ', volume: '100 μL', note: '' }], selected: false },
      { row: 'A', col: 2, operations: [{ id: 'op-2', action: '加基质样品', substance: 'SST', sampleId: 'SST', volume: '100 μL', note: '' }], selected: false },
      { row: 'A', col: 3, operations: [
        { id: 'op-3a', action: '加内标工作液', substance: 'IS-WS', sampleId: 'STD8', volume: '30 μL', note: '' },
        { id: 'op-3b', action: '加空白基质', substance: '空白基质', sampleId: 'BL', volume: '50 μL', note: '溶剂空白用稀释液2' },
      ], selected: false },
      { row: 'A', col: 4, operations: [
        { id: 'op-4a', action: '加工作液', substance: 'WS-LLOQ', sampleId: 'LLOQ', volume: '50 μL', note: '' },
        { id: 'op-4b', action: '加 QC', substance: 'QC', sampleId: 'QC', volume: '50 μL', note: '' },
      ], selected: false },
      { row: 'A', col: 5, operations: [{ id: 'op-5', action: '加工作液', substance: 'WS-MQC', sampleId: 'MQC', volume: '50 μL', note: '' }], selected: false },
      { row: 'A', col: 6, operations: [{ id: 'op-6', action: '加工作液', substance: 'WS-HQC', sampleId: 'HQ', volume: '50 μL', note: '' }], selected: false },
    ] : undefined);
    recordRows.value = [];
    return;
  }

  cells.value = [];
  recordRows.value = buildRecordRows(form.fields, 3);
}, { immediate: true });

const currentCells = computed(() => cells.value);
const currentOps = computed<SequenceOperation[]>(() => {
  if (!editingCell.value) return [];
  const operations = cells.value.find(c => c.row === editingCell.value!.row && c.col === editingCell.value!.col)?.operations ?? [];
  return operations.map(operation => cellOperationToSequenceOperation(operation));
});

function buildCells(rows: string[], cols: number, sampleData?: FormCell[]): FormCell[] {
  return rows.flatMap(row =>
    Array.from({ length: cols }, (_, col) => {
      const existing = sampleData?.find(cell => cell.row === row && cell.col === col + 1);
      return { row, col: col + 1, operations: existing?.operations ?? [], selected: false };
    })
  );
}

function buildRecordRows(fields: string[], rowCount: number): string[][] {
  return Array.from({ length: rowCount }, () => fields.map(() => ''));
}

function selectAll() {
  cells.value = cells.value.map(cell => ({ ...cell, selected: true }));
}

function invertSelect() {
  cells.value = cells.value.map(cell => ({ ...cell, selected: !cell.selected }));
}

function clearSelect() {
  cells.value = cells.value.map(cell => ({ ...cell, selected: false }));
}

function batchEdit() {
  const selected = cells.value.filter(cell => cell.selected);
  if (selected.length === 0) {
    alert('请先选择格子');
    return;
  }
  alert(`批量设置 ${selected.length} 个格子（模拟）`);
}

function openCellEditor(row: string, col: number) {
  editingCell.value = { row, col };
  cellEditorOpen.value = true;
}

function closeCellEditor() {
  cellEditorOpen.value = false;
}

function saveCellOps(ops: SequenceOperation[]) {
  if (!editingCell.value) return;
  const cell = cells.value.find(item => item.row === editingCell.value!.row && item.col === editingCell.value!.col);
  if (cell) {
    cell.operations = ops.map(sequenceOperationToCellOperation);
  }
  editing.value = true;
  cellEditorOpen.value = false;
}

function sequenceOperationToCellOperation(operation: SequenceOperation): CellOperation {
  return {
    id: operation.id,
    action: operation.action,
    substance: operation.substance || undefined,
    sampleId: operation.sampleId || undefined,
    volume: formatVolume(operation.volume, operation.unit),
    note: operation.note || undefined,
  };
}

function cellOperationToSequenceOperation(operation: CellOperation): SequenceOperation {
  return {
    id: operation.id,
    action: operation.action,
    substance: operation.substance ?? '',
    sampleId: operation.sampleId ?? '',
    volume: parseNumericVolume(operation.volume),
    unit: parseVolumeUnit(operation.volume),
    scanned: false,
    note: operation.note ?? '',
  };
}

function parseNumericVolume(volume?: string) {
  if (!volume) return 0;
  const parsed = Number.parseFloat(volume);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function parseVolumeUnit(volume?: string) {
  if (!volume) return 'μL';
  const match = volume.trim().match(/\d+(?:\.\d+)?\s*(.*)$/);
  return match?.[1]?.trim() || 'μL';
}

function formatVolume(volume: number, unit?: string) {
  return `${volume}${unit ? ` ${unit}` : ''}`.trim();
}

function addRecordRow() {
  if (!currentForm.value) return;
  recordRows.value.push(currentForm.value.fields.map(() => ''));
  editing.value = true;
}

function removeRecordRow() {
  if (recordRows.value.length <= 1) return;
  recordRows.value.pop();
  editing.value = true;
}

function saveDraft() {
  if (!currentForm.value) return;
  editing.value = true;
  alert('草稿已保存');
  router.push(`/experiments/plans/${task.value.planId}/tasks`);
}

function saveAndExit() {
  if (!currentForm.value) return;
  editing.value = true;
  alert('表单已保存，返回任务创建页');
  router.push(`/experiments/plans/${task.value.planId}/tasks`);
}

function goBack() {
  router.push(`/experiments/plans/${task.value.planId}/tasks`);
}
</script>
